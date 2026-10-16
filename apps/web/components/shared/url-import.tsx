"use client"

import type { ImportedSource } from "@codeprint/core/source"
import { importBrowserSource } from "@codeprint/core/source/browser"
import { Check, Link2, Loader2, X } from "lucide-react"
import { type FormEvent, useEffect, useId, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sourceEditorAnchor, takeTransferredSource, transferSource } from "@/lib/source-transfer"

export function UrlImport({
  onImport,
  hasContent,
  format,
}: {
  onImport: (source: ImportedSource) => void
  hasContent: boolean
  format: ImportedSource["format"]
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [pending, setPending] = useState<ImportedSource | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const request = useRef<AbortController | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const onImportRef = useRef(onImport)
  onImportRef.current = onImport

  useEffect(() => {
    try {
      const source = takeTransferredSource(format)
      if (source) {
        onImportRef.current(source)
        const anchor = sourceEditorAnchor(format)
        window.history.replaceState(null, "", `#${anchor}`)
        const editor = document.getElementById(anchor)
        editor?.scrollIntoView()
        editor?.querySelector("textarea")?.focus({ preventScroll: true })
      }
    } catch {
      setError("The browser could not restore the imported file. Import its URL again here.")
      setOpen(true)
    }
  }, [format])

  useEffect(() => () => request.current?.abort(), [])
  useEffect(() => {
    if (open) input.current?.focus()
  }, [open])

  function close() {
    request.current?.abort()
    request.current = null
    setLoading(false)
    setOpen(false)
    setPending(null)
    setError("")
    trigger.current?.focus({ preventScroll: true })
  }

  async function load(event: FormEvent) {
    event.preventDefault()
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setPending(null)
    setError("")
    try {
      const source = await importBrowserSource(url, controller.signal)
      if (!controller.signal.aborted) setPending(source)
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          cause instanceof Error
            ? cause.message
            : "The file could not be imported. Try a public Raw link or upload the file.",
        )
    } finally {
      if (request.current === controller) setLoading(false)
    }
  }

  const destination =
    pending && pending.format !== format && (pending.format !== "code" || pending.language !== "plaintext")
      ? pending.format
      : null
  function accept() {
    if (!pending) return
    if (destination) {
      try {
        window.location.assign(transferSource(pending))
      } catch {
        setError("The browser blocked the editor handoff. Open the matching editor and import the URL there.")
      }
      return
    }
    onImport(pending)
    close()
  }

  return (
    <div className="min-w-0" data-clarity-mask="True">
      <Button
        ref={trigger}
        type="button"
        variant="outline"
        size="sm"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Link2 aria-hidden="true" /> Import URL
      </Button>
      {open && (
        <section
          id={`${id}-panel`}
          aria-label="Import a public file"
          className="mt-4 min-w-0 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950"
        >
          <form onSubmit={load} className="space-y-3">
            <Label htmlFor={`${id}-url`}>Public file URL</Label>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <Input
                ref={input}
                id={`${id}-url`}
                type="url"
                required
                maxLength={4096}
                value={url}
                onChange={(event) => {
                  request.current?.abort()
                  request.current = null
                  setLoading(false)
                  setUrl(event.target.value)
                  setPending(null)
                  setError("")
                }}
                placeholder="https://github.com/owner/repo/blob/main/file.py"
                className="min-w-0 flex-1"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
                aria-invalid={Boolean(error)}
              />
              <Button type="submit" disabled={loading || !url.trim()} className="shrink-0">
                {loading && <Loader2 aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
                {loading ? "Loading file…" : "Load file"}
              </Button>
              <Button type="button" variant="outline" onClick={close}>
                <X aria-hidden="true" /> Cancel
              </Button>
            </div>
            <p id={`${id}-help`} className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Public GitHub files or direct HTTPS text files, up to 2 MiB. Your browser contacts the source host
              directly. PDF rendering stays on your device.
            </p>
            <span className="sr-only" role="status">
              {loading ? "Loading the public file." : pending ? "File loaded. Review it before using it." : ""}
            </span>
            {error && (
              <p
                id={`${id}-error`}
                role="alert"
                className="break-words text-sm leading-6 text-red-700 dark:text-red-300"
              >
                {error}
              </p>
            )}
          </form>
          {pending && (
            <div className="min-w-0 space-y-3">
              <p className="break-words text-sm font-semibold">
                {pending.filename} · {new Intl.NumberFormat().format(pending.sizeBytes)} bytes
              </p>
              <Textarea
                aria-label="Imported file review"
                readOnly
                rows={7}
                className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-lg border-slate-200 bg-white p-3 font-mono text-xs leading-5 dark:border-white/10 dark:bg-slate-900"
                value={
                  pending.content.slice(0, 4000) +
                  (pending.content.length > 4000
                    ? "\n[Review shortened. The full file will be loaded into the editor.]"
                    : "")
                }
              />
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {destination
                  ? "This file belongs in a different editor. Continue there to adjust its PDF. Nothing is printed or downloaded."
                  : hasContent
                    ? "Using this file replaces the current editor content. Nothing is printed or downloaded."
                    : "Load this file into the editor to review and adjust its PDF. Nothing is printed or downloaded."}
              </p>
              <Button type="button" onClick={accept}>
                <Check aria-hidden="true" />
                {destination
                  ? `Open ${destination === "code" ? "code" : destination === "csv" ? "CSV" : "Markdown"} editor`
                  : hasContent
                    ? "Replace editor content"
                    : "Use this file"}
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
