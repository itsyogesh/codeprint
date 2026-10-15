import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AnalyticsProvider } from "@/components/shared/analytics"
import { ANALYTICS_CONSENT_KEY, ANALYTICS_PREFERENCES_EVENT, REPLAY_CONSENT_KEY } from "@/lib/analytics-privacy"

const route = vi.hoisted(() => ({ pathname: "/markdown" }))
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }))
vi.mock("next/dynamic", () => ({ default: () => () => null }))
vi.mock("next/script", () => ({ default: ({ id }: { id: string }) => <span data-testid={id} /> }))
vi.mock("@/lib/analytics-privacy", async (original) => ({
  ...(await original<typeof import("@/lib/analytics-privacy")>()),
  isProductionHost: () => true,
  canReplayUrl: () => true,
}))

const googleId = "G-SYNTHETIC"
type TestWindow = Window & { gtag?: (...args: unknown[]) => void; clarity?: (...args: unknown[]) => void }

beforeEach(() => {
  localStorage.clear()
  route.pathname = "/markdown"
  Reflect.deleteProperty(window, `ga-disable-${googleId}`)
  vi.spyOn(console, "error").mockImplementation(() => {}) // jsdom has no navigation implementation.
})

afterEach(() => {
  Reflect.deleteProperty(window, "gtag")
  Reflect.deleteProperty(window, "clarity")
  Reflect.deleteProperty(window, `ga-disable-${googleId}`)
  localStorage.clear()
  vi.restoreAllMocks()
})

describe("optional analytics consent", () => {
  it("starts with a compact notice and keeps individual controls behind Preferences", async () => {
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    await screen.findByRole("button", { name: "Accept all" })
    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(screen.getByRole("button", { name: "Reject all" })).toBeVisible()
    fireEvent.click(screen.getByRole("button", { name: "Preferences" }))
    expect(screen.getByRole("checkbox", { name: /Google Analytics/ })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: /Marketing page replay/ })).not.toBeChecked()
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(screen.queryByRole("checkbox")).toBeNull()
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBeNull()
    expect(localStorage.getItem(REPLAY_CONSENT_KEY)).toBeNull()
  })

  it("accepts both configured purposes only after Accept all", async () => {
    route.pathname = "/mcp"
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    fireEvent.click(await screen.findByRole("button", { name: "Accept all" }))
    await screen.findByTestId("codeprint-google-analytics")
    await screen.findByTestId("codeprint-clarity")
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("granted")
    expect(localStorage.getItem(REPLAY_CONSENT_KEY)).toBe("granted")
    expect(screen.queryByRole("region", { name: "Analytics preferences" })).toBeNull()
  })

  it("rejects both purposes in one action", async () => {
    route.pathname = "/mcp"
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    fireEvent.click(await screen.findByRole("button", { name: "Reject all" }))
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("denied")
    expect(localStorage.getItem(REPLAY_CONSENT_KEY)).toBe("denied")
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
  })

  it("accepts configured replay from an editor without loading replay there", async () => {
    render(<AnalyticsProvider googleId={googleId} replayConfigured />)
    fireEvent.click(await screen.findByRole("button", { name: "Accept all" }))
    await screen.findByTestId("codeprint-google-analytics")
    expect(localStorage.getItem(REPLAY_CONSENT_KEY)).toBe("granted")
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
  })

  it("does not grant an unconfigured purpose", async () => {
    render(<AnalyticsProvider googleId={googleId} />)
    fireEvent.click(await screen.findByRole("button", { name: "Accept all" }))
    expect(localStorage.getItem(REPLAY_CONSENT_KEY)).toBe("denied")
  })

  it("allows a later explicit opt-in after an initial decline without leaving tracking disabled", async () => {
    ;(window as TestWindow).gtag = vi.fn()
    render(<AnalyticsProvider googleId={googleId} />)
    fireEvent.click(await screen.findByRole("button", { name: "Reject all" }))
    expect(Reflect.get(window, `ga-disable-${googleId}`)).toBe(true)
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
    fireEvent(window, new Event(ANALYTICS_PREFERENCES_EVENT))
    fireEvent.click(await screen.findByRole("checkbox", { name: /Google Analytics/ }))
    fireEvent.click(await screen.findByRole("button", { name: "Save choices" }))
    await screen.findByTestId("codeprint-google-analytics")
    expect(Reflect.get(window, `ga-disable-${googleId}`)).toBe(false)
  })

  it("loads no Google script or pageview before an affirmative choice", async () => {
    const gtag = vi.fn()
    ;(window as TestWindow).gtag = gtag
    render(<AnalyticsProvider googleId={googleId} />)
    await screen.findByRole("region", { name: "Analytics preferences" })
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
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
    await screen.findByTestId("codeprint-google-analytics")
    const pageviewsBefore = gtag.mock.calls.filter((args) => args[0] === "event").length
    fireEvent(window, new StorageEvent("storage", { key: ANALYTICS_CONSENT_KEY, newValue: next }))
    expect(disabledAtRevocation).toEqual([true])
    expect(Reflect.get(window, `ga-disable-${googleId}`)).toBe(true)
    await waitFor(() => expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull())
    route.pathname = "/csv"
    view.rerender(<AnalyticsProvider googleId={googleId} />)
    expect(gtag.mock.calls.filter((args) => args[0] === "event")).toHaveLength(pageviewsBefore)
  })

  it("does not turn an existing GA opt-in into replay consent", async () => {
    route.pathname = "/mcp"
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "granted")
    const clarity = vi.fn()
    ;(window as TestWindow).clarity = clarity
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    await screen.findByTestId("codeprint-google-analytics")
    fireEvent.click(await screen.findByRole("button", { name: "Preferences" }))
    expect(screen.getByRole("checkbox", { name: /Marketing page replay/ })).not.toBeChecked()
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
    expect(clarity).not.toHaveBeenCalled()
  })

  it("supports replay-only consent and denies advertising storage", async () => {
    route.pathname = "/mcp"
    const clarity = vi.fn()
    ;(window as TestWindow).clarity = clarity
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    fireEvent.click(await screen.findByRole("button", { name: "Preferences" }))
    fireEvent.click(await screen.findByRole("checkbox", { name: /Marketing page replay/ }))
    fireEvent.click(screen.getByRole("button", { name: "Save choices" }))
    await screen.findByTestId("codeprint-clarity")
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
    expect(clarity).toHaveBeenCalledWith("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" })
    expect(localStorage.getItem(REPLAY_CONSENT_KEY)).toBe("granted")
  })

  it.each([
    "/",
    "/python",
    "/markdown",
    "/csv",
    "/print/python",
    "/print/markdown",
    "/print/csv",
    "/social-previews",
    "/missing",
  ])("never loads replay on %s even with stored consent and an accidentally supplied ID", async (path) => {
    route.pathname = path
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "denied")
    localStorage.setItem(REPLAY_CONSENT_KEY, "granted")
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    await waitFor(() => expect(screen.queryByRole("region", { name: "Analytics preferences" })).toBeNull())
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
    expect((window as TestWindow).clarity).toBeUndefined()
  })

  it("cannot load replay in the tools root, including with a marketing path", async () => {
    route.pathname = "/mcp"
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "denied")
    localStorage.setItem(REPLAY_CONSENT_KEY, "granted")
    render(<AnalyticsProvider googleId={googleId} replayConfigured />)
    fireEvent(window, new Event(ANALYTICS_PREFERENCES_EVENT))
    expect(await screen.findByRole("checkbox", { name: /Marketing page replay/ })).toBeChecked()
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
  })

  it.each(["denied", null])("stops replay on cross-tab revocation: %s", async (value) => {
    route.pathname = "/mcp"
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "denied")
    localStorage.setItem(REPLAY_CONSENT_KEY, "granted")
    const clarity = vi.fn()
    ;(window as TestWindow).clarity = clarity
    render(<AnalyticsProvider clarityId="synthetic123" replayConfigured />)
    await screen.findByTestId("codeprint-clarity")
    fireEvent(window, new StorageEvent("storage", { key: REPLAY_CONSENT_KEY, newValue: value }))
    expect(clarity).toHaveBeenCalledWith("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" })
    expect(clarity).toHaveBeenCalledWith("stop")
    await waitFor(() => expect(screen.queryByTestId("codeprint-clarity")).toBeNull())
  })

  it("fails closed when the browser cannot persist consent", async () => {
    route.pathname = "/mcp"
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked")
    })
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    fireEvent.click(await screen.findByRole("button", { name: "Accept all" }))
    expect(await screen.findByRole("alert")).toHaveTextContent("Optional tracking stays off")
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
  })

  it("does not load optional tracking when DNT is enabled", async () => {
    Object.defineProperty(navigator, "doNotTrack", { configurable: true, value: "1" })
    route.pathname = "/mcp"
    localStorage.setItem(ANALYTICS_CONSENT_KEY, "granted")
    localStorage.setItem(REPLAY_CONSENT_KEY, "granted")
    render(<AnalyticsProvider googleId={googleId} clarityId="synthetic123" replayConfigured />)
    fireEvent(window, new Event(ANALYTICS_PREFERENCES_EVENT))
    await screen.findByRole("region", { name: "Analytics preferences" })
    expect(screen.queryByTestId("codeprint-clarity")).toBeNull()
    expect(screen.queryByTestId("codeprint-google-analytics")).toBeNull()
    Reflect.deleteProperty(navigator, "doNotTrack")
  })
})
