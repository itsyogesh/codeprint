import { describe, expect, it } from "vitest"
import { DocumentStore } from "../src/documents"

const pdf = (size: number) => ({
  bytes: new Uint8Array(size),
  format: "markdown" as const,
  pages: 1,
  sourceFilename: "private.md",
  suggestedFilename: "private.pdf",
})

describe("session PDFs", () => {
  it("copies bytes and bounds session memory without removing saved files", () => {
    const store = new DocumentStore(10, 2)
    const input = pdf(6)
    const first = store.add(input)
    input.bytes[0] = 99
    expect(store.get(first.documentId).bytes[0]).toBe(0)
    const second = store.add(pdf(6))
    expect(() => store.get(first.documentId)).toThrow("expired")
    expect(store.get(second.documentId).bytes.length).toBe(6)
    expect(store.list()).toHaveLength(1)
  })
  it("rejects arbitrary paths and oversized documents", () => {
    const store = new DocumentStore(10)
    expect(() => store.get("../../secrets")).toThrow("does not belong")
    expect(() => store.add(pdf(11))).toThrow("limit")
  })
})
