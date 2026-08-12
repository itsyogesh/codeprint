import type { Metadata } from "next"
import { CliLanding } from "@/components/developer/cli-landing"
import { DeveloperPageShell } from "@/components/developer/landing-shared"
import { JsonLd } from "@/components/seo/json-ld"
import { SHOW_DEVELOPER_TOOLS } from "@/lib/features"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl } from "@/lib/site"

export function generateMetadata(): Metadata {
  const title = "Codeprint CLI | Render and Print Code from Your Terminal"
  const description =
    "Turn Markdown, code, JSON, and CSV into print-ready PDFs, or submit confirmed local CUPS print jobs from the terminal."

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/cli" },
    robots: { index: SHOW_DEVELOPER_TOOLS, follow: SHOW_DEVELOPER_TOOLS },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl("/cli"),
      images: [{ url: ogImageUrl("cli"), width: 1200, height: 630, alt: "Codeprint CLI terminal to PDF preview" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl("cli")] },
  }
}

export default function CliPage() {
  return (
    <DeveloperPageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Codeprint CLI",
          description: "A local command-line tool for rendering and printing code, Markdown, JSON, and CSV.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "macOS, Linux",
          url: absoluteUrl("/cli"),
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <CliLanding />
    </DeveloperPageShell>
  )
}
