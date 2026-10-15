import type { Metadata } from "next"
import Link from "next/link"
import { ContentSection, StaticContentPage } from "@/components/content/static-content-page"

export const metadata: Metadata = {
  title: "About",
  description: "Why Codeprint exists and how its private, browser-based document tools are built.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <StaticContentPage
      eyebrow="About Codeprint"
      title="Code deserves better than a screenshot."
      description="Codeprint turns source code, Markdown, and CSV data into documents that remain readable on paper and sharp in a PDF."
    >
      <ContentSection title="Why it exists">
        <p>
          Reviewing on paper changes how you read. Long functions become easier to trace, notes have somewhere to live,
          and a handout can be understood without opening the right editor or installing a theme.
        </p>
        <p>
          Most browser printouts lose syntax colors or waste half the page. Screenshots are not selectable, searchable,
          or scalable. Codeprint keeps the structure of the original and gives you control over type size, columns,
          orientation, and line numbers.
        </p>
      </ContentSection>
      <ContentSection title="Private by default">
        <p>
          Your content is processed in your browser. There is no account, upload queue, or document library. The server
          delivers the application; it does not receive the code or documents you paste into the tools.
        </p>
      </ContentSection>
      <ContentSection title="Built in public">
        <p>
          Codeprint is maintained by Eva Interactive Co. The source is available on{" "}
          <a
            className="font-semibold text-orange-600 hover:text-orange-500"
            href="https://github.com/itsyogesh/codeprint"
          >
            GitHub
          </a>
          , and the product remains free to use.
        </p>
        <p>
          <Link className="font-semibold text-orange-600 hover:text-orange-500" href="/changelog">
            See what changed →
          </Link>
        </p>
      </ContentSection>
    </StaticContentPage>
  )
}
