import { describe, expect, it } from "vitest"
import { inferInput } from "../src/files"

describe("CLI input inference", () => {
  it("routes Markdown and CSV to their document renderers", () => {
    expect(inferInput("README.md")).toEqual({ format: "markdown" })
    expect(inferInput("report.csv")).toEqual({ format: "csv" })
  })

  it("treats JSON as syntax-highlighted code", () => {
    expect(inferInput("payload.json")).toEqual({ format: "code", language: "json" })
    expect(inferInput("index.ts")).toEqual({ format: "code", language: "typescript" })
  })
})
