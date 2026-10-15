import { afterEach, describe, expect, it, vi } from "vitest"
import { SOURCE_MAX_BYTES } from "../src/source"
import { importBrowserSource } from "../src/source/browser"

afterEach(() => vi.unstubAllGlobals())

describe("browser URL transport", () => {
  it("fetches directly without credentials, redirects, referrers, or Codeprint requests", async () => {
    const fetcher = vi.fn(async () => new Response("const x = 1\n", { headers: { "content-type": "text/plain" } }))
    vi.stubGlobal("fetch", fetcher)
    await importBrowserSource("https://github.com/owner/repo/blob/main/index.js")
    expect(fetcher).toHaveBeenCalledWith(
      new URL("https://api.github.com/repos/owner/repo/contents/index.js?ref=main"),
      expect.objectContaining({
        mode: "cors",
        credentials: "omit",
        redirect: "error",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        headers: { Accept: "application/vnd.github.raw+json" },
      }),
    )
    expect(fetcher).toHaveBeenCalledOnce()
  })
  it("explains CORS/network failures without asking for authentication", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
    await expect(importBrowserSource("https://example.org/file.py")).rejects.toThrow("download and upload")
  })
  it("rejects advertised oversized bodies before reading them", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("not read", { headers: { "content-length": String(SOURCE_MAX_BYTES + 1) } })),
    )
    await expect(importBrowserSource("https://example.org/file.py")).rejects.toThrow("2 MiB")
  })
  it("enforces the streamed limit even without content-length and cancels the transfer", async () => {
    const cancel = vi.fn()
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array(SOURCE_MAX_BYTES + 1))
      },
      cancel,
    })
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(body)),
    )
    await expect(importBrowserSource("https://example.org/file.py")).rejects.toThrow("2 MiB")
    expect(cancel).toHaveBeenCalledOnce()
  })
})
