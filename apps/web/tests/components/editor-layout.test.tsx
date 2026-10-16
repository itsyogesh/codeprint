import { readFileSync } from "node:fs"
import path from "node:path"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"
import { EditorSettingsContent } from "@/components/shared/editor-settings-content"
import { EditorWindowBar } from "@/components/shared/editor-window-bar"

const dropdown = vi.hoisted(() => ({ props: vi.fn() }))
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuContent: (props: { children: ReactNode; className: string }) => {
    dropdown.props(props)
    return (
      <div role="menu" className={props.className}>
        {props.children}
      </div>
    )
  },
}))

describe("shared mobile editor layout", () => {
  it("keeps a long filename in a bounded column while preserving its full text", () => {
    const filename = "a-very-long-project-document-for-the-mobile-layout-check.md"
    const { container } = render(<EditorWindowBar filename={filename} mode="MARKDOWN" />)
    expect(container.firstElementChild).toHaveClass("grid-cols-[auto_minmax(0,1fr)_auto]")
    expect(screen.getByTitle(filename)).toHaveTextContent(filename)
    expect(screen.getByTitle(filename)).toHaveClass("min-w-0", "truncate")
    expect(screen.getByText("MARKDOWN")).toHaveClass("whitespace-nowrap")
  })

  it("bounds settings to Radix's available viewport height and allows scrolling to every setting", () => {
    render(
      <EditorSettingsContent>
        <button type="button">Last setting</button>
      </EditorSettingsContent>,
    )
    expect(screen.getByRole("menu")).toHaveClass(
      "max-h-[min(72dvh,var(--radix-dropdown-menu-content-available-height))]",
      "overflow-y-auto",
      "overscroll-contain",
      "pb-[max(1rem,env(safe-area-inset-bottom))]",
      "w-[calc(100vw-2rem)]",
    )
    expect(dropdown.props).toHaveBeenCalledWith(expect.objectContaining({ collisionPadding: 12, align: "end" }))
    expect(screen.getByRole("button", { name: "Last setting" })).toBeVisible()
  })

  it.each(["code", "markdown", "csv"])("uses both responsive shared pieces in the %s editor", (format) => {
    const source = readFileSync(path.resolve(import.meta.dirname, `../../components/${format}-printer-app.tsx`), "utf8")
    expect(source).toContain("<EditorWindowBar")
    expect(source).toContain("<EditorSettingsContent>")
    expect(source).not.toContain("<DropdownMenuContent")
    expect(source).toContain("p-4 sm:p-6")
  })
})
