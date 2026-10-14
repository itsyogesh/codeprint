import { describe, expect, it } from "vitest"
import { runChecked, runCommand } from "../src/runner"

describe("command stdin delivery", () => {
  it("delivers the supplied bytes verbatim without shell interpolation", async () => {
    const bytes = Buffer.from("%PDF-1.7\n$(not-a-command)\n\0binary\n")
    const result = await runChecked(
      process.execPath,
      ["-e", "process.stdin.on('data', chunk => process.stdout.write(chunk))"],
      2_000,
      bytes,
    )
    expect(result.stdout).toBe(bytes.toString().trim())
  })

  it("closes stdin for commands without input", async () => {
    await expect(
      runChecked(
        process.execPath,
        ["-e", "process.stdin.on('end', () => console.log('closed')); process.stdin.resume()"],
        2_000,
      ),
    ).resolves.toMatchObject({ stdout: "closed" })
  })

  it("rejects early stdin closure instead of treating partial delivery as success", async () => {
    await expect(
      runChecked(process.execPath, ["-e", "process.exit(0)"], 2_000, Buffer.alloc(4 * 1024 * 1024)),
    ).rejects.toThrow("could not receive the approved PDF")
  })

  it("reports nonzero exits and missing commands", async () => {
    await expect(
      runChecked(process.execPath, ["-e", "console.error('offline'); process.exit(2)"], 2_000),
    ).rejects.toThrow("offline")
    await expect(runCommand("codeprint-not-installed-command", [])).rejects.toThrow("not installed")
  })

  it("terminates a hung subprocess before rejecting the timed-out delivery", async () => {
    await expect(runCommand(process.execPath, ["-e", "setInterval(() => {}, 1000)"], 40)).rejects.toThrow("timed out")
  })
})
