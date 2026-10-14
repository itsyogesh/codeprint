import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AnalyticsProvider } from "@/components/shared/analytics"
import { ANALYTICS_CONSENT_KEY, ANALYTICS_PREFERENCES_EVENT } from "@/lib/analytics-privacy"

const route = vi.hoisted(() => ({ pathname: "/markdown" }))
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }))
vi.mock("next/dynamic", () => ({ default: () => () => null }))
vi.mock("next/script", () => ({ default: () => <span data-testid="google-loader" /> }))
vi.mock("@/lib/analytics-privacy", async (original) => ({
  ...(await original<typeof import("@/lib/analytics-privacy")>()),
  isProductionHost: () => true,
}))

const googleId = "G-SYNTHETIC"
type TestWindow = Window & { gtag?: (...args: unknown[]) => void }

beforeEach(() => {
  localStorage.clear()
  route.pathname = "/markdown"
  Reflect.deleteProperty(window, `ga-disable-${googleId}`)
  vi.spyOn(console, "error").mockImplementation(() => {}) // jsdom has no navigation implementation.
})

afterEach(() => {
  Reflect.deleteProperty(window, "gtag")
  Reflect.deleteProperty(window, `ga-disable-${googleId}`)
  localStorage.clear()
  vi.restoreAllMocks()
})

describe("optional analytics consent", () => {
  it("allows a later explicit opt-in after an initial decline without leaving tracking disabled", async () => {
    ;(window as TestWindow).gtag = vi.fn()
    render(<AnalyticsProvider googleId={googleId} />)
    fireEvent.click(await screen.findByRole("button", { name: "No thanks" }))
    expect(Reflect.get(window, `ga-disable-${googleId}`)).toBe(true)
    expect(screen.queryByTestId("google-loader")).toBeNull()
    fireEvent(window, new Event(ANALYTICS_PREFERENCES_EVENT))
    fireEvent.click(await screen.findByRole("button", { name: "Allow analytics" }))
    await screen.findByTestId("google-loader")
    expect(Reflect.get(window, `ga-disable-${googleId}`)).toBe(false)
  })

  it("loads no Google script or pageview before an affirmative choice", async () => {
    const gtag = vi.fn()
    ;(window as TestWindow).gtag = gtag
    render(<AnalyticsProvider googleId={googleId} />)
    await screen.findByRole("region", { name: "Analytics preferences" })
    expect(screen.queryByTestId("google-loader")).toBeNull()
    expect(gtag).not.toHaveBeenCalled()
  })

  it.each(["denied", null])("synchronously disables tracking on cross-tab revocation: %s", async (next) => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "granted")
    const disabledAtRevocation: boolean[] = []
    const gtag = vi.fn((...args: unknown[]) => {
      if (args[0] === "consent" && args[1] === "update") {
        disabledAtRevocation.push(Reflect.get(window, `ga-disable-${googleId}`))
      }
    })
    ;(window as TestWindow).gtag = gtag
    const view = render(<AnalyticsProvider googleId={googleId} />)
    await screen.findByTestId("google-loader")
    const pageviewsBefore = gtag.mock.calls.filter((args) => args[0] === "event").length
    fireEvent(window, new StorageEvent("storage", { key: ANALYTICS_CONSENT_KEY, newValue: next }))
    expect(disabledAtRevocation).toEqual([true])
    expect(Reflect.get(window, `ga-disable-${googleId}`)).toBe(true)
    await waitFor(() => expect(screen.queryByTestId("google-loader")).toBeNull())
    route.pathname = "/csv"
    view.rerender(<AnalyticsProvider googleId={googleId} />)
    expect(gtag.mock.calls.filter((args) => args[0] === "event")).toHaveLength(pageviewsBefore)
  })
})
