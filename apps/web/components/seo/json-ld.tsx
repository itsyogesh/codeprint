import { SITE_NAME, SITE_URL } from "@/lib/site"

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

export function WebApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        description:
          "Transform your code into beautifully formatted, syntax-highlighted documents perfect for review, sharing, and documentation.",
        url: SITE_URL,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Syntax highlighting for 20+ programming languages",
          "Print-ready code formatting",
          "PDF export",
          "Markdown document rendering",
          "CSV table formatting",
          "Customizable layout settings",
          "Dark mode support",
        ],
      }}
    />
  )
}

export function WebSiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      }}
    />
  )
}
