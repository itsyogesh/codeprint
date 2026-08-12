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
      eyebrow="Last updated August 8, 2026"
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
          We may collect aggregate page and performance measurements, such as which public route was viewed, device
          category, and loading errors. These measurements help us improve the site and are not intended to identify the
          contents of your documents.
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
