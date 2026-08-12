import { describe, expect, it } from "vitest"
import { cn, debounce, escapeHtml, safeHighlight } from "@/lib/utils"

describe("escapeHtml", () => {
  it("escapes HTML entities", () => {
    expect(escapeHtml("<div>")).toBe("&lt;div&gt;")
    expect(escapeHtml('a & "b"')).toBe("a &amp; &quot;b&quot;")
    expect(escapeHtml("it's")).toBe("it&#039;s")
  })

  it("returns empty string for falsy input", () => {
    expect(escapeHtml("")).toBe("")
  })

  it("returns plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world")
  })
})

describe("safeHighlight", () => {
  it("returns escaped HTML for csv language", () => {
    const result = safeHighlight("<csv>", "csv", null)
    expect(result).toBe("&lt;csv&gt;")
  })

  it("returns escaped HTML when hljs throws", () => {
    const mockHljs = {
      highlight: () => {
        throw new Error("test error")
      },
    }
    const result = safeHighlight("code", "javascript", mockHljs)
    expect(result).toBe("code")
  })

  it("returns highlighted code on success", () => {
    const mockHljs = {
      highlight: () => ({ value: '<span class="hljs-keyword">const</span>' }),
    }
    const result = safeHighlight("const", "javascript", mockHljs)
    expect(result).toBe('<span class="hljs-keyword">const</span>')
  })

  it("is synchronous (not async)", () => {
    const result = safeHighlight("test", "csv", null)
    // Should be a string, not a Promise
    expect(typeof result).toBe("string")
  })
})

describe("debounce", () => {
  it("delays execution", async () => {
    let callCount = 0
    const fn = debounce(() => {
      callCount++
    }, 50)

    fn()
    fn()
    fn()

    expect(callCount).toBe(0)

    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(callCount).toBe(1)
  })
})

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })
})
