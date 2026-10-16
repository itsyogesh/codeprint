import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { UrlImport } from "@/components/shared/url-import"

const mocks = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock("@codeprint/core/source/browser", () => ({ importBrowserSource: mocks.load }))
const source = {
  content: "print('Hello')\n",
  filename: "main.py",
  language: "python",
  format: "code",
  sourceUrl: "https://example.org/main.py",
  sizeBytes: 15,
}

afterEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  window.history.replaceState(null, "", "/")
})

async function load() {
  fireEvent.click(screen.getByRole("button", { name: "Import URL" }))
  fireEvent.change(screen.getByLabelText("Public file URL"), { target: { value: "https://example.org/main.py" } })
  fireEvent.submit(screen.getByLabelText("Public file URL").closest("form")!)
}

describe("URL import review", () => {
  it("returns focus without jumping the page when import is cancelled", () => {
    render(<UrlImport format="code" hasContent={false} onImport={vi.fn()} />)
    const trigger = screen.getByRole("button", { name: "Import URL" })
    const focus = vi.spyOn(trigger, "focus")
    fireEvent.click(trigger)
    expect(screen.getByLabelText("Public file URL")).toHaveFocus()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(trigger).toHaveFocus()
    expect(focus).toHaveBeenCalledWith({ preventScroll: true })
  })
  it("does not replace content until explicitly accepted", async () => {
    mocks.load.mockResolvedValue(source)
    const onImport = vi.fn()
    render(<UrlImport format="code" hasContent onImport={onImport} />)
    await load()
    expect(await screen.findByLabelText("Imported file review")).toHaveValue("print('Hello')\n")
    expect(onImport).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole("button", { name: "Replace editor content" }))
    expect(onImport).toHaveBeenCalledExactlyOnceWith(source)
    expect(screen.queryByLabelText("Public file URL")).not.toBeInTheDocument()
  })
  it("preserves the current document on failure and allows retry", async () => {
    mocks.load.mockRejectedValue(new Error("Use its public Raw link"))
    const onImport = vi.fn()
    render(<UrlImport format="code" hasContent onImport={onImport} />)
    await load()
    expect(await screen.findByRole("alert")).toHaveTextContent("Raw link")
    expect(onImport).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: "Load file" })).toBeEnabled()
  })
  it("cancels in-flight work and ignores a late response", async () => {
    let finish: (value: unknown) => void = () => {}
    mocks.load.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const onImport = vi.fn()
    render(<UrlImport format="code" hasContent={false} onImport={onImport} />)
    await load()
    expect(screen.getByRole("button", { name: "Loading file…" })).toBeDisabled()
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(mocks.load.mock.calls[0][1].aborted).toBe(true)
    finish(source)
    await waitFor(() => expect(screen.queryByLabelText("Imported file review")).not.toBeInTheDocument())
    expect(onImport).not.toHaveBeenCalled()
  })
  it("offers the matching editor for Markdown and CSV rather than replacing code", async () => {
    mocks.load.mockResolvedValue({ ...source, format: "csv", filename: "data.csv", language: "plaintext" })
    const onImport = vi.fn()
    render(<UrlImport format="code" hasContent onImport={onImport} />)
    await load()
    expect(await screen.findByRole("button", { name: "Open CSV editor" })).toBeVisible()
    expect(onImport).not.toHaveBeenCalled()
  })
  it("marks all URL and document content as private to replay tooling", () => {
    const { container } = render(<UrlImport format="code" hasContent={false} onImport={vi.fn()} />)
    expect(container.firstElementChild).toHaveAttribute("data-clarity-mask", "True")
  })
})
