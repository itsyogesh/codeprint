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
      eyebrow="Last updated October 15, 2026"
      title="Privacy without the fine-print fog."
      description="Codeprint is designed so your source material does not need to leave your device."
    >
      <ContentSection title="Your documents">
        <p>
          Code, Markdown, CSV data, filenames, preview settings, and generated PDF content are processed locally in your
          browser. Codeprint does not upload, store, sell, or use that content to train models.
        </p>
      </ContentSection>
      <ContentSection title="Importing a public file URL">
        <p>
          URL imports contact the source host directly from your browser, without forwarding cookies or a referrer.
          GitHub file links use GitHub’s public content API. The source host can see the request and your IP address.
          Codeprint does not proxy, upload, or store the fetched file on its servers. PDF rendering stays local.
        </p>
        <p>
          You review the fetched file before using it. If you choose a different editor, a one-shot copy is passed
          through tab-local session storage and removed when read, with a one-minute expiry. Source URLs and document
          content are not included in analytics events or navigation URLs. Private repositories are not supported.
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
          Microsoft Clarity loads only after a separate choice to allow marketing page replay. It records interactions
          on MCP, CLI, Docs, About, Blog, Changelog, Privacy, and Terms pages with strict text masking. Advertising
          storage is denied. It never loads on the homepage, language editors, Markdown, CSV, PDF print routes, or
          social previews. Moving between information pages and document tools starts a separate browser document, so
          replay listeners cannot follow you into a tool.
        </p>
        <p>
          Allowing Google Analytics does not enable Clarity. You can reject either option or change your choices in
          Analytics preferences in the footer. Revoking consent unloads optional tracking. Do Not Track and Global
          Privacy Control disable analytics regardless of saved choices. If your browser cannot save consent, optional
          tracking stays off.
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
