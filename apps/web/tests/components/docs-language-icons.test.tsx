import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import DocsPage from "@/app/(marketing)/docs/page"
import { LanguageIcon } from "@/components/marketing/language-icon"
import { getLanguagesForDisplay } from "@/lib/languages"

vi.mock("@/components/shared/nav-header", () => ({ default: () => null }))
vi.mock("@/components/shared/site-footer", () => ({ SiteFooter: () => null }))

describe("shared language icons", () => {
  it("keeps the monochrome Rust logo visible in dark mode without recoloring other brands", () => {
    const { container, rerender } = render(<LanguageIcon language="Rust" />)
    expect(container.querySelector("img")).toHaveClass("dark:invert")
    rerender(<LanguageIcon language="Python" />)
    expect(container.querySelector("img")).not.toHaveClass("dark:invert")
  })

  it.each(getLanguagesForDisplay())("renders the shared SVG asset for $name", ({ name }) => {
    const { container } = render(<LanguageIcon language={name} className="h-6 w-6" />)
    const icon = container.querySelector("img")
    expect(icon).toHaveAttribute("src", expect.stringMatching(/devicons\/devicon@latest\/icons\/.+-original\.svg$/))
    expect(icon).toHaveAttribute("aria-hidden", "true")
    expect(icon).toHaveAttribute("alt", "")
    expect(icon).toHaveClass("h-6", "w-6")
  })

  it.each([
    ["Markdown", "lucide-file-text"],
    ["CSV", "lucide-table-2"],
  ])("renders a local document icon for %s rather than requesting a nonexistent logo", (language, iconClass) => {
    const { container } = render(<LanguageIcon language={language} className="h-6 w-6" />)
    expect(container.querySelector("img")).toBeNull()
    expect(container.querySelector("svg")).toHaveClass(iconClass, "h-6", "w-6")
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
  })
})

describe("docs icon consistency", () => {
  it("uses the shared icons for all 23 language and format cards, without emoji placeholders", () => {
    render(<DocsPage />)
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Languages" }), { button: 0, ctrlKey: false })
    const panel = screen.getByRole("tabpanel", { name: "Languages" })
    expect(within(panel).getAllByRole("heading", { level: 3 })).toHaveLength(23)
    expect(panel.querySelectorAll("img")).toHaveLength(21)
    expect(panel.querySelectorAll("svg.lucide-file-text")).toHaveLength(1)
    expect(panel.querySelectorAll("svg.lucide-table-2")).toHaveLength(1)
    expect(panel.textContent).not.toMatch(/\p{Extended_Pictographic}|Ⓒ|λ/u)
    expect(within(panel).getByText(".js, .jsx")).toBeVisible()
    expect(within(panel).getByText("Rendered")).toBeVisible()
    expect(within(panel).getByText("Table Format")).toBeVisible()
  })

  it("uses library icons rather than emoji in browser support headings", () => {
    render(<DocsPage />)
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Help" }), { button: 0, ctrlKey: false })
    const panel = screen.getByRole("tabpanel", { name: "Help" })
    const supported = within(panel).getByRole("heading", { name: "Fully Supported" })
    const limited = within(panel).getByRole("heading", { name: "Limited Support" })
    expect(supported.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    expect(limited.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    expect(panel.textContent).not.toMatch(/\p{Extended_Pictographic}/u)
  })
})
