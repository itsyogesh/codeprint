import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import DocsPage from "@/app/(marketing)/docs/page"

vi.mock("@/components/shared/nav-header", () => ({ default: () => null }))
vi.mock("@/components/shared/site-footer", () => ({ SiteFooter: () => null }))

describe("responsive documentation tabs", () => {
  it("lets the phone tab grid grow instead of forcing several rows into one fixed-height row", () => {
    render(<DocsPage />)
    const list = screen.getByRole("tablist", { name: "Documentation sections" })
    expect(list).toHaveClass("h-auto", "grid-cols-2", "gap-1", "sm:grid-cols-5")
    expect(list).not.toHaveClass("h-10")
    const tabs = within(list).getAllByRole("tab")
    expect(tabs).toHaveLength(5)
    for (const tab of tabs) expect(tab).toHaveClass("min-h-11")
    expect(within(list).getByRole("tab", { name: "Help" })).toHaveClass("col-span-2", "sm:col-span-1")
  })

  it.each([
    "Overview",
    "Languages",
    "Printing",
    "Settings",
    "Help",
  ])("keeps %s accessible and selects its own panel", (name) => {
    render(<DocsPage />)
    const list = screen.getByRole("tablist", { name: "Documentation sections" })
    const tab = within(list).getByRole("tab", { name })
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false })
    expect(tab).toHaveAttribute("aria-selected", "true")
    const panel = screen.getByRole("tabpanel", { name })
    expect(panel).toBeVisible()
    expect(tab).toHaveAttribute("aria-controls", panel.id)
    expect(within(panel).getAllByRole("heading", { level: 2 }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1)
  })
})
