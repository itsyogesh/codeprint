import type { Metadata } from "next"
import CsvPrinterApp from "@/components/csv-printer-app"
import { MarketingHowItWorks } from "@/components/marketing/how-it-works"
import { PageHero } from "@/components/marketing/page-hero"
import { BreadcrumbJsonLd, FAQSection } from "@/components/seo/faq-section"
import { FeatureGrid } from "@/components/seo/feature-grid"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "CSV to Table | View, Print, and Export as PDF",
  description:
    "Pretty print CSV data as formatted tables online. Headers, zebra stripes, PDF export. Free, no sign-up. Paste CSV, see a table instantly.",
  keywords: ["csv pretty print", "csv viewer online", "csv to pdf", "csv to table"],
  alternates: { canonical: "/csv" },
  openGraph: {
    title: "CSV to Table | View, Print, and Export as PDF | Codeprint",
    description: "Paste CSV data and get a readable table with headers, zebra stripes, and PDF export.",
    type: "website",
    url: absoluteUrl("/csv"),
    images: [
      {
        url: ogImageUrl("csv"),
        width: 1200,
        height: 630,
        alt: "A wide CSV table arranged on a clean landscape PDF page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CSV to Table | View, Print, and Export as PDF | Codeprint",
    description: "Paste CSV data and get a readable table with headers, zebra stripes, and PDF export.",
    images: [ogImageUrl("csv")],
  },
}

const FEATURES = [
  {
    title: "Header detection",
    description: "The first row becomes bold headers. Toggle it if your data has no header.",
  },
  {
    title: "Zebra stripes",
    description: "Alternating row colors make wide tables easier to track.",
  },
  {
    title: "PDF export",
    description: "Print or save. Headers, colors, and table formatting carry through.",
  },
  {
    title: "Layout options",
    description: "Page size, orientation, and font size. Use landscape for wide CSVs.",
  },
]

const FAQS = [
  {
    question: "How do I pretty-print CSV?",
    answer: "Paste CSV data or drop a file and Codeprint renders a formatted table instantly.",
  },
  {
    question: "Does it handle quoted fields with commas?",
    answer: "Yes. The parser handles RFC 4180 quoted fields, escaped quotes, embedded commas, and line breaks.",
  },
  {
    question: "Can I use large files?",
    answer: "Yes. Adjust the font size and switch to landscape when your table has many columns.",
  },
  {
    question: "Is my data sent to a server?",
    answer: "No. Parsing, preview, printing, and PDF generation stay in your browser.",
  },
]

export default function CsvPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      <BreadcrumbJsonLd
        items={[
          { name: "Codeprint", url: SITE_URL },
          { name: "CSV to table", url: absoluteUrl("/csv") },
        ]}
      />
      <main>
        <PageHero
          title="Turn CSV data into a readable PDF."
          description="Format headers, add zebra stripes, and fit wide columns to the page. Preview the table and export the PDF without uploading your data."
          ctaHref="#csv-editor-section"
          ctaLabel="Paste your CSV"
        />
        <CsvPrinterApp />
        <div className="mx-auto max-w-6xl px-6">
          <FeatureGrid features={FEATURES} />
        </div>
        <MarketingHowItWorks variant="csv" />
        <div className="mx-auto max-w-6xl px-6">
          <FAQSection faqs={FAQS} title="Questions" pageUrl={absoluteUrl("/csv")} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
