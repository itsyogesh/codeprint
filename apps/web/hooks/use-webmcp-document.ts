"use client"

import { useEffect, useRef, useState } from "react"
import { getWebMcpContext, parseWebMcpDocument, type WebMcpDocument } from "@/lib/webmcp"

interface Options {
  format: "code" | "markdown" | "csv"
  onAccept: (document: WebMcpDocument) => void
  preview: { loading: boolean; error: string | null; pageCount: number | null }
}

export function useWebMcpDocument(options: Options) {
  const latest = useRef(options)
  const [pending, setPending] = useState<WebMcpDocument | null>(null)
  const pendingRef = useRef<WebMcpDocument | null>(null)
  const acceptedRef = useRef(false)
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    latest.current = options
  }, [options])

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENABLE_WEBMCP !== "true") return
    const context = getWebMcpContext(document, navigator)
    if (!context || typeof context.registerTool !== "function") return
    const controller = new AbortController()
    const names = [`codeprint_prepare_${options.format}`, "codeprint_preview_status"]
    const registered: string[] = []
    const register = async () => {
      try {
        await context.registerTool(
          {
            name: names[0],
            title: "Prepare a Codeprint preview",
            description: `Stage agent-supplied ${options.format} for the user to review. The user must click Use this document before it replaces the editor. Does not print, download, or reveal existing document contents.`,
            inputSchema: {
              type: "object",
              required: ["content"],
              additionalProperties: false,
              properties: {
                content: { type: "string", minLength: 1, maxLength: 4_000_000 },
                filename: { type: "string", maxLength: 180 },
                language: { type: "string", maxLength: 40 },
                pageSize: { type: "string", enum: ["a4", "letter", "legal"] },
                orientation: { type: "string", enum: ["portrait", "landscape"] },
              },
            },
            annotations: { readOnlyHint: false, consequentialHint: false },
            execute: async (input, execution) => {
              execution?.signal?.throwIfAborted()
              if (pendingRef.current) throw new Error("Another document is awaiting user review.")
              const staged = parseWebMcpDocument(input, options.format)
              pendingRef.current = staged
              setPending(staged)
              acceptedRef.current = false
              return {
                status: "awaiting_user_review",
                format: options.format,
                characters: staged.content.length,
                printsSubmitted: 0,
              }
            },
          },
          { signal: controller.signal },
        )
        registered.push(names[0])
        controller.signal.throwIfAborted()
        await context.registerTool(
          {
            name: names[1],
            title: "Read Codeprint preview status",
            description:
              "Read pagination status only. Does not return document text, filename, PDF bytes, or local paths.",
            inputSchema: { type: "object", additionalProperties: false, properties: {} },
            annotations: { readOnlyHint: true, consequentialHint: false },
            execute: async (_input, execution) => {
              execution?.signal?.throwIfAborted()
              const preview = latest.current.preview
              return {
                status: pendingRef.current
                  ? "awaiting_user_review"
                  : !acceptedRef.current
                    ? "not_prepared"
                    : preview.loading
                      ? "rendering"
                      : preview.error
                        ? "render_failed"
                        : preview.pageCount
                          ? "ready"
                          : "rendering",
                pages:
                  acceptedRef.current && !pendingRef.current && !preview.loading && !preview.error
                    ? preview.pageCount
                    : null,
                printsSubmitted: 0,
              }
            },
          },
          { signal: controller.signal },
        )
        registered.push(names[1])
        controller.signal.throwIfAborted()
        if (!controller.signal.aborted) setSupported(true)
      } catch {
        controller.abort()
        for (const name of registered) context.unregisterTool?.(name)
        setSupported(false)
      }
    }
    void register()
    return () => {
      controller.abort()
      for (const name of registered) context.unregisterTool?.(name)
    }
  }, [options.format])

  function accept() {
    if (!pendingRef.current) return
    latest.current = { ...latest.current, preview: { loading: true, error: null, pageCount: null } }
    latest.current.onAccept(pendingRef.current)
    pendingRef.current = null
    setPending(null)
    acceptedRef.current = true
  }
  function decline() {
    pendingRef.current = null
    setPending(null)
  }
  return { supported, pending, accept, decline }
}
