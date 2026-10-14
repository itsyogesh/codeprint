import type { Metadata } from "next"
import { ContentSection, StaticContentPage } from "@/components/content/static-content-page"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Codeprint handles code, documents, analytics, and browser data.",
  alternates: { canonical: "/privacy" },
}
export default function PrivacyPage() {
  return (
    <StaticContentPage
      eyebrow="Last updated October 13, 2026"
      title="Privacy without the fine-print fog."
      description="Codeprint is designed so your source material does not need to leave your device."
    >
      <ContentSection title="Your documents">
        <p>
          Code, Markdown, CSV data, filenames, preview settings, and generated PDF content are processed locally in your
          browser. Codeprint does not upload, store, sell, or use that content to train models.
        </p>
      </ContentSection>
      <ContentSection title="Site analytics">
        <p>
          Vercel Analytics and Speed Insights measure site visits and performance without analytics cookies. URLs are
          reduced to their origin and path, without query strings or fragments. We do not send document text, filenames,
          settings, preview images, or PDF bytes as analytics events.
        </p>
        <p>
          Google Analytics, when configured, loads only after you allow optional analytics. It measures sanitized page
          views and can use analytics cookies. Advertising personalization and Google signals are disabled. You can
          change your choice using Analytics preferences in the footer.
        </p>
        <p>
          Microsoft Clarity session replay is disabled in this release. Enabling it will require a verified separation
          between public information pages and document tools. Do Not Track and Global Privacy Control disable
          analytics.
        </p>
      </ContentSection>
      <ContentSection title="Third parties">
        <p>
          The interface may load public font and language-icon assets from their providers. Links to GitHub, X, and Buy
          Me a Coffee take you to services with their own privacy policies.
        </p>
      </ContentSection>
      <ContentSection title="Contact">
        <p>
          Questions or deletion requests about site-level analytics can be raised through the project’s GitHub
          repository.
        </p>
      </ContentSection>
    </StaticContentPage>
  )
}
