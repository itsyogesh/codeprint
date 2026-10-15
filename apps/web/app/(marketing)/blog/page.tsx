import type { Metadata } from "next"
import Link from "next/link"
import { ContentSection, StaticContentPage } from "@/components/content/static-content-page"

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical notes about readable code, printable documentation, and browser-based PDF workflows.",
  alternates: { canonical: "/blog" },
}

export default function BlogPage() {
  return (
    <StaticContentPage
      eyebrow="Codeprint notes"
      title="Printing is part of the interface."
      description="Short, practical notes on making code and technical documents easier to read away from the editor."
    >
      <ContentSection title="August 2026">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-500">Product</p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Codeprint now speaks 21 languages
          </h2>
          <p className="mt-3">
            C, R, Dart, and Scala join the existing language set. Every language gets a dedicated route, sample source,
            syntax highlighting, and print-ready PDF output.
          </p>
          <Link href="/#languages" className="mt-5 inline-flex font-semibold text-orange-600 hover:text-orange-500">
            Browse every language →
          </Link>
        </article>
      </ContentSection>
      <ContentSection title="What comes next">
        <p>
          We are refining pagination, adding more examples, and documenting the decisions that make a source-code PDF
          genuinely useful: selectable text, stable line numbers, predictable page breaks, and layouts that work in
          print.
        </p>
      </ContentSection>
    </StaticContentPage>
  )
}
