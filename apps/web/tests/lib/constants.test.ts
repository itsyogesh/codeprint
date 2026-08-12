import { describe, expect, it } from "vitest"
import { BASE_LINES_PER_PAGE, HIGHLIGHTABLE_LANGUAGES, PAGE_SIZES, SPECIAL_RENDER_LANGUAGES } from "@/lib/constants"

describe("PAGE_SIZES", () => {
  it("has a4, letter, and legal sizes", () => {
    expect(PAGE_SIZES).toHaveProperty("a4")
    expect(PAGE_SIZES).toHaveProperty("letter")
    expect(PAGE_SIZES).toHaveProperty("legal")
  })

  it("has positive dimensions", () => {
    for (const size of Object.values(PAGE_SIZES)) {
      expect(size.width).toBeGreaterThan(0)
      expect(size.height).toBeGreaterThan(0)
    }
  })
})

describe("BASE_LINES_PER_PAGE", () => {
  it("has entries for all page sizes", () => {
    for (const key of Object.keys(PAGE_SIZES)) {
      expect(BASE_LINES_PER_PAGE).toHaveProperty(key)
    }
  })

  it("has positive line counts", () => {
    for (const lines of Object.values(BASE_LINES_PER_PAGE)) {
      expect(lines).toBeGreaterThan(0)
    }
  })
})

describe("HIGHLIGHTABLE_LANGUAGES", () => {
  it("contains common languages", () => {
    expect(HIGHLIGHTABLE_LANGUAGES).toContain("javascript")
    expect(HIGHLIGHTABLE_LANGUAGES).toContain("typescript")
    expect(HIGHLIGHTABLE_LANGUAGES).toContain("python")
  })

  it("does not contain csv", () => {
    expect(HIGHLIGHTABLE_LANGUAGES).not.toContain("csv")
  })
})

describe("SPECIAL_RENDER_LANGUAGES", () => {
  it("contains csv", () => {
    expect(SPECIAL_RENDER_LANGUAGES).toContain("csv")
  })
})
