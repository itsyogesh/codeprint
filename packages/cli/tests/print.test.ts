import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  submit: vi.fn(),
  dispose: vi.fn(),
  question: vi.fn(),
  close: vi.fn(),
}))

vi.mock("@codeprint/print", () => ({ createPrintService: () => mocks }))
vi.mock("node:readline/promises", () => ({
  createInterface: () => ({ question: mocks.question, close: mocks.close }),
}))

import { createProgram } from "../src/index"

const inputTty = Object.getOwnPropertyDescriptor(process.stdin, "isTTY")
const outputTty = Object.getOwnPropertyDescriptor(process.stdout, "isTTY")

beforeEach(() => {
  vi.clearAllMocks()
  mocks.prepare.mockResolvedValue({
    confirmationToken: "approved-token",
    contentSha256: "a".repeat(64),
    summary: "1 copy, A4, one-sided, printer Office",
  })
  mocks.submit.mockResolvedValue({ id: "Office-1" })
  vi.spyOn(process.stdout, "write").mockImplementation(() => true)
  vi.spyOn(process.stderr, "write").mockImplementation(() => true)
  Object.defineProperty(process.stdin, "isTTY", { configurable: true, value: true })
  Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: true })
})

afterEach(() => {
  vi.restoreAllMocks()
  if (inputTty) Object.defineProperty(process.stdin, "isTTY", inputTty)
  else Reflect.deleteProperty(process.stdin, "isTTY")
  if (outputTty) Object.defineProperty(process.stdout, "isTTY", outputTty)
  else Reflect.deleteProperty(process.stdout, "isTTY")
})

describe("CLI print approval cleanup", () => {
  it("never submits when the user declines and always releases snapshots", async () => {
    mocks.question.mockResolvedValue("no")
    await createProgram().parseAsync(["print", "example.pdf"], { from: "user" })
    expect(mocks.submit).not.toHaveBeenCalled()
    expect(mocks.dispose).toHaveBeenCalledOnce()
    expect(mocks.close).toHaveBeenCalledOnce()
  })

  it("disposes on prompt errors without submitting", async () => {
    mocks.question.mockRejectedValue(new Error("input closed"))
    await expect(createProgram().parseAsync(["print", "example.pdf"], { from: "user" })).rejects.toThrow("input closed")
    expect(mocks.submit).not.toHaveBeenCalled()
    expect(mocks.dispose).toHaveBeenCalledOnce()
  })

  it("disposes after a failed submission and does not retry", async () => {
    mocks.submit.mockRejectedValueOnce(new Error("spooler unavailable"))
    await expect(createProgram().parseAsync(["print", "example.pdf", "--yes"], { from: "user" })).rejects.toThrow(
      "spooler unavailable",
    )
    expect(mocks.question).not.toHaveBeenCalled()
    expect(mocks.submit).toHaveBeenCalledExactlyOnceWith("approved-token")
    expect(mocks.dispose).toHaveBeenCalledOnce()
  })

  it("releases preparations even when preparation fails", async () => {
    mocks.prepare.mockRejectedValueOnce(new Error("invalid PDF"))
    await expect(createProgram().parseAsync(["print", "example.pdf", "--yes"], { from: "user" })).rejects.toThrow(
      "invalid PDF",
    )
    expect(mocks.submit).not.toHaveBeenCalled()
    expect(mocks.dispose).toHaveBeenCalledOnce()
  })
})
