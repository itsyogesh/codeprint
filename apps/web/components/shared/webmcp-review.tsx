"use client"

import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WebMcpDocument } from "@/lib/webmcp"

export function WebMcpReview({
  pending,
  accept,
  decline,
}: {
  pending: WebMcpDocument | null
  accept: () => void
  decline: () => void
}) {
  if (!pending) return null
  return (
    <section
      aria-label="Review assistant document"
      className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-500/30 dark:bg-orange-500/5"
      data-clarity-mask="True"
    >
      <h2 className="flex items-center gap-2 font-serif text-lg font-bold">
        <FileText aria-hidden="true" className="h-5 w-5 text-orange-500" /> Your assistant prepared a document
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
        Review it below. Using it replaces the current editor content. Nothing is printed or downloaded.
      </p>
      <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs dark:border-slate-700 dark:bg-slate-950">
        {pending.content.slice(0, 4000)}
        {pending.content.length > 4000 ? "\n[Preview shortened. The full document will be loaded.]" : ""}
      </pre>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button onClick={accept}>Use this document</Button>
        <Button variant="outline" onClick={decline}>
          Keep my document
        </Button>
      </div>
    </section>
  )
}
