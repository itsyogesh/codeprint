import { beforeEach, describe, expect, it, vi } from "vitest"
import { CupsPrintBackend } from "../src/cups"
import { runChecked } from "../src/runner"

vi.mock("../src/runner", () => ({ runChecked: vi.fn(), runCommand: vi.fn() }))

beforeEach(() => vi.resetAllMocks())

describe("CUPS approved-byte submission", () => {
  it("only cancels an individual queue job", async () => {
    vi.mocked(runChecked).mockResolvedValue({ stdout: "", stderr: "", exitCode: 0 })
    await new CupsPrintBackend().cancelJob("Office-42")
    expect(runChecked).toHaveBeenCalledWith("cancel", ["Office-42"])
  })

  it.each([
    "-a",
    "--help",
    "Office",
    "Office-0",
    "Office-1\nOther-2",
  ])("rejects unsafe cancellation target %j", async (id) => {
    await expect(new CupsPrintBackend().cancelJob(id)).rejects.toThrow("Invalid CUPS print job ID")
    expect(runChecked).not.toHaveBeenCalled()
  })

  it("pipes exactly the approved PDF to lp stdin, without reopening any source filename", async () => {
    const bytes = Buffer.from("%PDF-1.7\napproved\n")
    vi.mocked(runChecked).mockResolvedValue({ stdout: "request id is Office-42 (1 file(s))", stderr: "", exitCode: 0 })
    const result = await new CupsPrintBackend().submit(
      bytes,
      { id: "Office", name: "Office", state: "idle", isDefault: true },
      { copies: 2, pageSize: "a4", duplex: "one-sided", color: "monochrome", pageRanges: "1-3" },
    )
    expect(result.id).toBe("Office-42")
    expect(runChecked).toHaveBeenCalledWith(
      "lp",
      [
        "-d",
        "Office",
        "-n",
        "2",
        "-o",
        "media=A4",
        "-o",
        "sides=one-sided",
        "-o",
        "print-color-mode=monochrome",
        "-P",
        "1-3",
        "--",
        "-",
      ],
      30_000,
      bytes,
    )
  })

  it.each([
    "--help",
    "Office\nOther",
    "../Office",
    "Office/instance",
    "",
  ])("rejects unsafe printer ID %j", async (id) => {
    await expect(
      new CupsPrintBackend().submit(
        Buffer.from("%PDF-1.7"),
        { id, name: id, state: "idle", isDefault: true },
        { copies: 1, pageSize: "a4", duplex: "one-sided", color: "auto" },
      ),
    ).rejects.toThrow("Invalid CUPS printer ID")
    expect(runChecked).not.toHaveBeenCalled()
  })
})
