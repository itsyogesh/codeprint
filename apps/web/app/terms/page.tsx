import type { Metadata } from "next"
import { ContentSection, StaticContentPage } from "@/components/content/static-content-page"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The simple terms for using Codeprint's free browser-based document tools.",
  alternates: { canonical: "/terms" },
}
export default function TermsPage() {
  return (
    <StaticContentPage
      eyebrow="Effective August 8, 2026"
      title="Simple terms for a simple tool."
      description="Use Codeprint to format material you are allowed to handle, and review the result before relying on it."
    >
      <ContentSection title="Using Codeprint">
        <p>
          You may use the public tools for personal or commercial work. You are responsible for the content you paste,
          the rights you have to it, and the documents you create from it.
        </p>
      </ContentSection>
      <ContentSection title="Availability">
        <p>
          Codeprint is provided as-is without a guarantee of uninterrupted availability or a particular output. Browser
          print engines differ, so verify pagination, colors, and content before publishing or distributing a PDF.
        </p>
      </ContentSection>
      <ContentSection title="Acceptable use">
        <p>
          Do not interfere with the service, attempt unauthorized access, or use it to distribute unlawful material.
          Because document processing is local, you should still follow your organization’s rules for handling
          confidential code.
        </p>
      </ContentSection>
      <ContentSection title="Changes">
        <p>These terms may change as the product changes. The effective date above identifies the current version.</p>
      </ContentSection>
    </StaticContentPage>
  )
}
