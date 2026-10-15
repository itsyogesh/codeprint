import { describe, expect, it, vi } from "vitest"
import {
  importPublicSource,
  isPublicAddress,
  publicSourceUrl,
  SOURCE_MAX_BYTES,
  type SourceFetcher,
  sourceType,
} from "../src/source"

const result = (content = "print('Hello')\n", contentType = "text/plain", status = 200) => ({
  status,
  contentType,
  bytes: new TextEncoder().encode(content),
})

describe("public source policy", () => {
  it.each([
    "http://github.com/a/b/blob/main/a.py",
    "file:///etc/passwd",
    "ftp://example.org/a.py",
    "https://user:secret@example.org/file.py",
    "https://example.org:8080/a.py",
    "https://localhost/a.py",
    "https://my-printer/a.py",
    "https://x.local/a.py",
    "https://127.1/a.py",
    "https://2130706433/a.py",
    "https://0x7f000001/a.py",
    "https://169.254.169.254/a.py",
    "https://[::1]/a.py",
    "https://[::ffff:127.0.0.1]/a.py",
    "https://192.168.1.2/a.py",
    "https://100.64.0.1/a.py",
    "https://example.org\\@localhost/a.py",
    "https://example.org/a b.py",
    "javascript:alert(1)",
  ])("rejects unsafe URL %s", (url) => expect(() => publicSourceUrl(url)).toThrow())
  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.31.1.1",
    "192.168.0.1",
    "100.64.0.1",
    "169.254.169.254",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:10.0.0.1",
    "2002:7f00:1::",
    "192.0.2.1",
  ])("blocks non-public address %s", (ip) => expect(isPublicAddress(ip)).toBe(false))
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])("accepts global address %s", (ip) =>
    expect(isPublicAddress(ip)).toBe(true))
  it("removes line fragments but preserves encoded paths", () =>
    expect(publicSourceUrl("https://example.org/a%20b.py#L3").href).toBe("https://example.org/a%20b.py"))
  it.each([
    ["note.md", "markdown", "markdown"],
    ["data.csv", "csv", "plaintext"],
    ["test.json", "code", "json"],
    ["main.py", "code", "python"],
  ])("infers %s", (name, format, language) => expect(sourceType(name)).toEqual({ format, language }))
})

describe("public text import", () => {
  it("imports a direct file without executing source or trimming indentation", async () => {
    const fetcher = vi.fn(async () => result("  print('Hello')\n"))
    expect(await importPublicSource("https://example.org/code.py#L1", fetcher)).toMatchObject({
      content: "  print('Hello')\n",
      filename: "code.py",
      format: "code",
      language: "python",
      sourceUrl: "https://example.org/code.py",
    })
    expect(fetcher).toHaveBeenCalledOnce()
  })
  it("fetches GitHub source through its fixed raw contents endpoint", async () => {
    const fetcher = vi.fn<SourceFetcher>(async () => result("# Reading copy"))
    const source = await importPublicSource("https://github.com/owner/repo/blob/main/docs/README.md#L1", fetcher)
    expect(fetcher.mock.calls[0][0].href).toBe(
      "https://api.github.com/repos/owner/repo/contents/docs/README.md?ref=main",
    )
    expect(source).toMatchObject({ filename: "README.md", format: "markdown" })
  })
  it("resolves slash-containing GitHub branches after a missing short ref", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(result("", "", 404))
      .mockResolvedValueOnce(result("const answer = 42"))
    await importPublicSource("https://github.com/owner/repo/blob/feature/print/main.ts", fetcher)
    expect(fetcher.mock.calls[1][0].href).toBe(
      "https://api.github.com/repos/owner/repo/contents/main.ts?ref=feature%2Fprint",
    )
  })
  it("accepts encoded slash refs and Unicode filenames", async () => {
    const source = await importPublicSource(
      "https://github.com/owner/repo/blob/feature%2Fprint/%E6%96%87%E4%BB%B6.py",
      async () => result(),
    )
    expect(source.filename).toBe("文件.py")
  })
  it.each([
    "https://github.com/owner/repo",
    "https://github.com/owner/repo/tree/main",
  ])("rejects repository and directory pages %s", async (url) => {
    const fetcher = vi.fn()
    await expect(importPublicSource(url, fetcher)).rejects.toThrow("single file")
    expect(fetcher).not.toHaveBeenCalled()
  })
  it.each([
    [302, "Redirecting"],
    [404, "not found"],
    [403, "request limit"],
    [429, "request limit"],
    [500, "HTTP 500"],
  ])("handles HTTP %s without following redirects", async (status, message) => {
    const fetcher = vi.fn(async () => result("", "", status))
    await expect(importPublicSource("https://example.org/main.py", fetcher)).rejects.toThrow(String(message))
    expect(fetcher).toHaveBeenCalledOnce()
  })
  it.each([
    ["<html>Sign in</html>", "text/html", "web page"],
    ["%PDF-1.7", "application/pdf", "text file"],
    ["a\u0000b", "text/plain", "binary"],
    ["  \n", "text/plain", "empty"],
  ])("rejects unsuitable responses", async (content, type, message) => {
    await expect(importPublicSource("https://example.org/main.py", async () => result(content, type))).rejects.toThrow(
      message,
    )
  })
  it("treats an explicit HTML source file as text, never executes it", async () => {
    expect(
      (
        await importPublicSource("https://example.org/index.html", async () =>
          result("<script>alert(1)</script>", "text/html"),
        )
      ).content,
    ).toContain("<script>")
  })
  it("rejects invalid UTF-8 and oversized files", async () => {
    await expect(
      importPublicSource("https://example.org/a.py", async () => ({
        status: 200,
        contentType: "text/plain",
        bytes: new Uint8Array([255]),
      })),
    ).rejects.toThrow("UTF-8")
    await expect(
      importPublicSource("https://example.org/a.py", async () => ({
        status: 200,
        contentType: "text/plain",
        bytes: new Uint8Array(SOURCE_MAX_BYTES + 1),
      })),
    ).rejects.toThrow("2 MiB")
  })
  it("does not fetch after cancellation", async () => {
    const fetcher = vi.fn()
    await expect(importPublicSource("https://example.org/a.py", fetcher, AbortSignal.abort())).rejects.toThrow()
    expect(fetcher).not.toHaveBeenCalled()
  })
})
