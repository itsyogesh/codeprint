import { describe, expect, it } from "vitest"
import { createCodeprintServer } from "../src"

describe("createCodeprintServer", () => {
  it("creates an MCP server without starting stdio", () => {
    expect(createCodeprintServer()).toBeDefined()
  })
})
