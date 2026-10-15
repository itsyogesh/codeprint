import type { Metadata } from "next"
import CodePrinterApp from "@/components/code-printer-app"
import { AlsoAvailable } from "@/components/marketing/also-available"
import { BentoFeatures } from "@/components/marketing/bento-features"
import { BottomCta } from "@/components/marketing/bottom-cta"
import { DeveloperSurfaces } from "@/components/marketing/developer-surfaces"
import { FeatureOverview } from "@/components/marketing/feature-overview"
import { HomeHero } from "@/components/marketing/home-hero"
import { MarketingHowItWorks } from "@/components/marketing/how-it-works"
import { LanguageGrid, LanguageMarquee } from "@/components/marketing/language-showcase"
import { WebApplicationJsonLd } from "@/components/seo/json-ld"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { SHOW_DEVELOPER_TOOLS } from "@/lib/features"
import { ogImageUrl } from "@/lib/og"
import { SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: {
    absolute: "Codeprint | Code, Markdown, and CSV to PDF",
  },
  description:
    "Convert code, Markdown, and CSV to print-ready PDFs in your browser. Add syntax highlighting, line numbers, tables of contents, and clean table layouts. Free and private.",
  keywords: [
    "code to pdf",
    "code to pdf online",
    "print code with syntax highlighting",
    "print code with colors",
    "source code to pdf",
    "print code with line numbers",
    "markdown to pdf",
    "csv to pdf",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Codeprint | Code, Markdown, and CSV to PDF",
    description: "Turn code, Markdown, and CSV into clean, print-ready PDFs. Free, private, and browser-based.",
    type: "website",
    url: SITE_URL,
    images: [
      {
        url: ogImageUrl("code"),
        width: 1200,
        height: 630,
        alt: "Codeprint turns code, Markdown, and CSV into print-ready PDFs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Codeprint | Code, Markdown, and CSV to PDF",
    description: "Turn code, Markdown, and CSV into clean, print-ready PDFs in your browser.",
    images: [ogImageUrl("code")],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      <WebApplicationJsonLd />
      <main>
        <HomeHero />
        <CodePrinterApp />
        <LanguageMarquee />
        <FeatureOverview />
        <MarketingHowItWorks />
        <BentoFeatures />
        <LanguageGrid />
        <AlsoAvailable />
        {SHOW_DEVELOPER_TOOLS ? <DeveloperSurfaces /> : null}
        <BottomCta />
      </main>
      <SiteFooter />
    </div>
  )
}
