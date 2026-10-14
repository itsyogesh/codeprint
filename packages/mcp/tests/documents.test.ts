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

  it("wipes an evicted document even when a caller retains its byte reference", () => {
    const store = new DocumentStore(10, 2)
    const input = pdf(6)
    input.bytes.fill(42)
    const first = store.add(input)
    const retained = store.get(first.documentId).bytes
    store.add(pdf(6))
    expect(retained).toEqual(new Uint8Array(6))
    expect(input.bytes).toEqual(new Uint8Array(6).fill(42))
  })

  it("wipes preview bytes on disposal without changing source bytes, and rejects late additions", () => {
    const store = new DocumentStore(10, 2)
    const input = pdf(6)
    input.bytes.fill(42)
    const first = store.add(input)
    const retained = store.get(first.documentId).bytes
    store.dispose()
    store.dispose()
    expect(retained).toEqual(new Uint8Array(6))
    expect(input.bytes).toEqual(new Uint8Array(6).fill(42))
    expect(store.list()).toEqual([])
    expect(() => store.get(first.documentId)).toThrow("expired")
    expect(() => store.add(input)).toThrow("disposed")
  })

  it("copies Buffer inputs instead of sharing their backing memory", () => {
    const store = new DocumentStore()
    const input = { ...pdf(6), bytes: Buffer.from("secret") }
    const saved = store.add(input)
    input.bytes.fill(42)
    expect(Buffer.from(store.get(saved.documentId).bytes).toString()).toBe("secret")
    store.dispose()
    expect(input.bytes).toEqual(Buffer.alloc(6, 42))
  })
})
