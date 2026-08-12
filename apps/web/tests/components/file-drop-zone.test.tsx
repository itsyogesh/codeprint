import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import FileDropZone from "@/components/shared/file-drop-zone"

describe("FileDropZone", () => {
  it("lets a relocated upload control open the shared file picker", () => {
    const inputClick = vi.spyOn(HTMLInputElement.prototype, "click").mockImplementation(() => undefined)

    render(
      <FileDropZone accept={[".md"]} onFileDrop={vi.fn()}>
        {({ openFilePicker }) => (
          <button type="button" onClick={openFilePicker}>
            Upload
          </button>
        )}
      </FileDropZone>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Upload" }))
    expect(inputClick).toHaveBeenCalledOnce()
    inputClick.mockRestore()
  })

  it("reads an accepted text file and returns its filename", async () => {
    const onFileDrop = vi.fn()
    const { container } = render(
      <FileDropZone accept={[".md"]} onFileDrop={onFileDrop}>
        {() => <div>Editor</div>}
      </FileDropZone>,
    )
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["# Printed"], "notes.md", { type: "text/markdown" })

    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(onFileDrop).toHaveBeenCalledWith({ content: "# Printed", filename: "notes.md" }))
  })
})
