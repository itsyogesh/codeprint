import type { Metadata } from "next"
import { ContentSection, StaticContentPage } from "@/components/content/static-content-page"

export const metadata: Metadata = {
  title: "Changelog",
  description: "New Codeprint features, formats, language support, and design improvements.",
  alternates: { canonical: "/changelog" },
}

const releases = [
  {
    date: "August 8, 2026",
    title: "A complete interface refresh",
    items: [
      "A new orange, slate, Merriweather, Mulish, and Source Code Pro design system.",
      "Root-level language routes and dedicated Markdown and CSV experiences.",
      "21 supported languages, including C, R, Dart, and Scala.",
      "Responsive navigation, a complete internal-link footer, reduced-motion support, and richer SEO pages.",
    ],
  },
  {
    date: "March 2026",
    title: "Real document output",
    items: [
      "Selectable-text PDF generation for source code.",
      "Dedicated Markdown rendering with tables, code blocks, and table-of-contents settings.",
      "CSV parsing, zebra rows, repeated headers, and landscape output controls.",
    ],
  },
]

export default function ChangelogPage() {
  return (
    <StaticContentPage
      eyebrow="Changelog"
      title="What changed, without the confetti."
      description="A concise record of improvements to Codeprint’s tools and interface."
    >
      {releases.map((release) => (
        <ContentSection key={release.date} title={release.date}>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">{release.title}</h2>
          <ul className="list-disc space-y-2 pl-5">
            {release.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ContentSection>
      ))}
    </StaticContentPage>
  )
}
