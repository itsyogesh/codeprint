import { afterEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({ lookup: vi.fn() }))
vi.mock("node:dns", () => ({ lookup: mocks.lookup }))

import { publicLookup } from "../src/source/node"

afterEach(() => vi.clearAllMocks())

describe("connection-time DNS policy", () => {
  it.each([
    [{ address: "127.0.0.1", family: 4 }],
    [
      { address: "8.8.8.8", family: 4 },
      { address: "192.168.1.1", family: 4 },
    ],
    [{ address: "::ffff:169.254.169.254", family: 6 }],
    [],
  ])("rejects private, mixed, mapped, or empty DNS answers", async (...entries) => {
    mocks.lookup.mockImplementation((_host, _options, done) => done(null, entries))
    const callback = vi.fn()
    publicLookup("public.example.org", { all: true }, callback)
    expect(callback.mock.calls[0][0]).toBeInstanceOf(Error)
  })
  it("returns only the exact validated answers to an all-address socket lookup", () => {
    const addresses = [
      { address: "8.8.8.8", family: 4 },
      { address: "2606:4700:4700::1111", family: 6 },
    ]
    mocks.lookup.mockImplementation((_host, _options, done) => done(null, addresses))
    const callback = vi.fn()
    publicLookup("public.example.org", { all: true }, callback)
    expect(callback).toHaveBeenCalledWith(null, addresses)
    expect(mocks.lookup).toHaveBeenCalledOnce()
  })
  it("honors the selected family without an unchecked lookup", () => {
    mocks.lookup.mockImplementation((_host, _options, done) => done(null, [{ address: "8.8.8.8", family: 4 }]))
    const callback = vi.fn()
    publicLookup("public.example.org", { family: 4 }, callback)
    expect(callback).toHaveBeenCalledWith(null, "8.8.8.8", 4)
  })
  it("propagates DNS failure without connecting", () => {
    mocks.lookup.mockImplementation((_host, _options, done) => done(new Error("DNS failed")))
    const callback = vi.fn()
    publicLookup("public.example.org", {}, callback)
    expect(callback.mock.calls[0][0].message).toBe("DNS failed")
  })
})
