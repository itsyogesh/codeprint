import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ load: vi.fn(), render: vi.fn(), write: vi.fn() }))
vi.mock("@codeprint/core/source/node", () => ({ importNodeSource: mocks.load }))
vi.mock("@codeprint/core/render", () => ({ renderPrintablePdf: mocks.render }))
vi.mock("../src/files", async (original) => ({
  ...(await original<typeof import("../src/files")>()),
  writePdf: mocks.write,
}))

import { createProgram } from "../src/index"

afterEach(() => {
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe("CLI URL inputs", () => {
  it("imports and infers the source before local rendering", async () => {
    mocks.load.mockResolvedValue({
      content: "# Reading copy",
      filename: "README.md",
      format: "markdown",
      language: "markdown",
    })
    mocks.render.mockResolvedValue({ pages: 1, bytes: Buffer.from("%PDF-test"), format: "markdown" })
    mocks.write.mockResolvedValue("/tmp/result.pdf")
    vi.spyOn(process.stdout, "write").mockImplementation(() => true)
    await createProgram().parseAsync(["render", "--url", "https://github.com/a/b/blob/main/README.md", "--json"], {
      from: "user",
    })
    expect(mocks.load).toHaveBeenCalledWith("https://github.com/a/b/blob/main/README.md")
    expect(mocks.render).toHaveBeenCalledWith(
      expect.objectContaining({ content: "# Reading copy", filename: "README.md", format: "markdown" }),
    )
  })
  it.each(["render", "print"])("rejects ambiguous file plus URL for %s before reading anything", async (command) => {
    await expect(
      createProgram().parseAsync([command, "existing.pdf", "--url", "https://example.org/a.py"], { from: "user" }),
    ).rejects.toThrow("not both")
    expect(mocks.load).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalled()
  })
  it("does not render on import failure", async () => {
    mocks.load.mockRejectedValue(new Error("private network"))
    await expect(
      createProgram().parseAsync(["render", "--url", "https://localhost/a.py"], { from: "user" }),
    ).rejects.toThrow("private network")
    expect(mocks.render).not.toHaveBeenCalled()
    expect(mocks.write).not.toHaveBeenCalled()
  })
})
