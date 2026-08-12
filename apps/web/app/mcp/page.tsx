import type { Metadata } from "next"
import { DeveloperPageShell } from "@/components/developer/landing-shared"
import { McpLanding } from "@/components/developer/mcp-landing"
import { JsonLd } from "@/components/seo/json-ld"
import { SHOW_DEVELOPER_TOOLS } from "@/lib/features"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl } from "@/lib/site"

export function generateMetadata(): Metadata {
  const title = "Codeprint MCP | Turn AI Reading Debt into Local PDFs"
  const description =
    "Give AI assistants local tools to create print-ready PDFs and submit physical print jobs only after you approve the exact settings."

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/mcp" },
    robots: { index: SHOW_DEVELOPER_TOOLS, follow: SHOW_DEVELOPER_TOOLS },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl("/mcp"),
      images: [{ url: ogImageUrl("mcp"), width: 1200, height: 630, alt: "Codeprint MCP local AI printing preview" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl("mcp")] },
  }
}

export default function McpPage() {
  return (
    <DeveloperPageShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Codeprint MCP",
          description: "A local MCP server for print-ready PDF creation and confirmed physical printing.",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "macOS, Linux",
          url: absoluteUrl("/mcp"),
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <McpLanding />
    </DeveloperPageShell>
  )
}
