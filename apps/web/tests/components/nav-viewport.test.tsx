import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import NavHeader from "@/components/shared/nav-header"

vi.mock("next/navigation", () => ({ usePathname: () => "/markdown" }))
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }) }))

let desktop: MediaQueryList
beforeEach(() => {
  const events = new EventTarget()
  desktop = {
    matches: false,
    media: "(min-width: 768px)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  }
  vi.stubGlobal("matchMedia", () => desktop)
})
afterEach(() => {
  vi.unstubAllGlobals()
  document.body.style.overflow = ""
})

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Open navigation menu" })
  fireEvent.click(trigger)
  return { trigger, dialog: screen.getByRole("dialog", { name: "Navigation menu" }) }
}

describe("viewport-safe navigation", () => {
  it("focuses inside a pointer-opened sheet even when Safari did not focus the trigger", () => {
    render(<NavHeader />)
    const { dialog } = openMenu()
    expect(within(dialog).getByRole("button", { name: "Close navigation menu" })).toHaveFocus()
    expect(dialog).toHaveClass("h-dvh", "max-h-dvh", "pt-[env(safe-area-inset-top)]")
    expect(document.body.style.overflow).toBe("hidden")
    expect(dialog.querySelector(".overflow-y-auto")).toHaveClass("min-h-0", "overscroll-contain")
  })

  it("wraps Tab and Shift+Tab inside the sheet", () => {
    render(<NavHeader />)
    const { dialog } = openMenu()
    const first = within(dialog).getByRole("button", { name: "Close navigation menu" })
    const last = within(dialog).getByRole("link", { name: "Open Editor" })
    last.focus()
    fireEvent.keyDown(document, { key: "Tab" })
    expect(first).toHaveFocus()
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true })
    expect(last).toHaveFocus()
  })

  it("keeps focus from escaping into the page behind the sheet", () => {
    render(<NavHeader />)
    const { dialog } = openMenu()
    screen.getByRole("button", { name: "Toggle color theme" }).focus()
    expect(within(dialog).getByRole("button", { name: "Close navigation menu" })).toHaveFocus()
  })

  it("returns focus and restores preexisting scroll styles after Escape", async () => {
    document.body.style.overflow = "clip"
    render(<NavHeader />)
    const { trigger } = openMenu()
    const focus = vi.spyOn(trigger, "focus")
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger).toHaveFocus()
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    expect(document.body.style.overflow).toBe("clip")
  })

  it("returns focus when dismissed with the close control", async () => {
    render(<NavHeader />)
    const { trigger, dialog } = openMenu()
    fireEvent.click(within(dialog).getByRole("button", { name: "Close navigation menu" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(trigger).toHaveFocus()
  })

  it("unlocks the page when resizing an open sheet to desktop", async () => {
    render(<NavHeader />)
    openMenu()
    act(() => {
      Object.defineProperty(desktop, "matches", { value: true })
      desktop.dispatchEvent(new Event("change"))
    })
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    expect(document.body.style.overflow).toBe("")
    expect(screen.getByRole("button", { name: "Languages" })).toHaveFocus()
  })

  it("bounds the desktop language list and returns focus after Escape", async () => {
    render(<NavHeader />)
    const trigger = screen.getByRole("button", { name: "Languages" })
    fireEvent.click(trigger)
    const menu = screen.getByRole("menu")
    expect(menu).toHaveClass("overflow-y-auto", "overscroll-contain")
    expect(menu.className).toContain("100dvh-7rem-env(safe-area-inset-bottom)")
    within(menu).getAllByRole("menuitem")[0].focus()
    fireEvent.keyDown(document, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull())
    expect(trigger).toHaveFocus()
  })
})
