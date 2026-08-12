import type { Metadata } from "next"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl } from "@/lib/site"

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Everything you need to know about using the Codeprint effectively. Supported languages, printing guide, settings, and troubleshooting.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Codeprint Documentation",
    description: "Supported formats, page settings, printing instructions, and troubleshooting.",
    type: "website",
    url: absoluteUrl("/docs"),
    images: [
      {
        url: ogImageUrl("docs"),
        width: 1200,
        height: 630,
        alt: "The Codeprint technical printing guide",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Codeprint Documentation",
    description: "Supported formats, page settings, printing instructions, and troubleshooting.",
    images: [ogImageUrl("docs")],
  },
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children
}
