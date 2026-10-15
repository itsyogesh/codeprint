import type { Metadata } from "next"
import { type OgKind, ogImagePath } from "@/lib/og"

export const metadata: Metadata = {
  title: "Social preview board",
  robots: {
    index: false,
    follow: false,
  },
}

const PREVIEWS: Array<{ kind: OgKind; label: string; language?: string }> = [
  { kind: "code", label: "Homepage" },
  { kind: "markdown", label: "Markdown" },
  { kind: "csv", label: "CSV" },
  { kind: "language", label: "Language page", language: "Python" },
  { kind: "mcp", label: "MCP" },
  { kind: "cli", label: "CLI" },
  { kind: "docs", label: "Docs" },
]

export default function SocialPreviewsPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-16 text-slate-950 dark:bg-[#030712] dark:text-white">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Internal review</p>
        <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight">Codeprint social previews</h1>
        <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
          Deterministic 1200 by 630 images generated from the same design system used by the product.
        </p>
        <div className="mt-12 grid gap-10">
          {PREVIEWS.map((preview) => {
            const src = ogImagePath(preview.kind, { language: preview.language })
            return (
              <figure key={preview.kind} className="space-y-3">
                <figcaption className="flex items-center justify-between gap-4 font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <span>{preview.label} · 1200 × 630</span>
                  <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full px-3 py-1.5 transition-colors hover:bg-white hover:text-orange-600 dark:hover:bg-white/[0.06] dark:hover:text-orange-400"
                  >
                    Open PNG
                  </a>
                </figcaption>
                {/* biome-ignore lint/performance/noImgElement: this internal page previews the generated OG endpoint itself */}
                <img
                  src={src}
                  alt={`${preview.label} Open Graph preview`}
                  width={1200}
                  height={630}
                  className="h-auto w-full rounded-2xl border border-slate-300 shadow-xl dark:border-white/10"
                />
              </figure>
            )
          })}
        </div>
      </div>
    </main>
  )
}
