import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { useWebMcpDocument } from "@/hooks/use-webmcp-document"
import type { WebMcpTool } from "@/lib/webmcp"

afterEach(() => {
  vi.unstubAllEnvs()
  delete (document as Document & { modelContext?: unknown }).modelContext
})

describe("WebMCP user approval", () => {
  it("stages supplied text without replacing the editor, and unregisters on exit", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_WEBMCP", "true")
    const tools = new Map<string, WebMcpTool>()
    Object.assign(document, {
      modelContext: {
        registerTool: async (tool: WebMcpTool, options: { signal: AbortSignal }) => {
          tools.set(tool.name, tool)
          options.signal.addEventListener("abort", () => tools.delete(tool.name))
        },
      },
    })
    const onAccept = vi.fn()
    const { result, unmount } = renderHook(() =>
      useWebMcpDocument({ format: "markdown", onAccept, preview: { loading: false, error: null, pageCount: 10 } }),
    )
    await act(async () => {})
    await act(async () => {
      await tools.get("codeprint_prepare_markdown")!.execute({ content: "# New document" })
    })
    expect(onAccept).not.toHaveBeenCalled()
    expect(result.current.pending?.content).toBe("# New document")
    expect(await tools.get("codeprint_preview_status")!.execute({})).toMatchObject({
      status: "awaiting_user_review",
      pages: null,
    })
    act(() => result.current.accept())
    expect(onAccept).toHaveBeenCalledOnce()
    expect(result.current.pending).toBeNull()
    unmount()
    expect(tools.size).toBe(0)
  })
  it("does not register in a normal browser or when the beta is disabled", () => {
    const registerTool = vi.fn()
    Object.assign(document, { modelContext: { registerTool } })
    vi.stubEnv("NEXT_PUBLIC_ENABLE_WEBMCP", "false")
    const { unmount } = renderHook(() =>
      useWebMcpDocument({
        format: "code",
        onAccept: vi.fn(),
        preview: { loading: false, error: null, pageCount: null },
      }),
    )
    expect(registerTool).not.toHaveBeenCalled()
    unmount()
  })
})
