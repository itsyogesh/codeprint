import type { Metadata } from "next"
import MarkdownPrinterApp from "@/components/markdown-printer-app"
import { MarketingHowItWorks } from "@/components/marketing/how-it-works"
import { PageHero } from "@/components/marketing/page-hero"
import { BreadcrumbJsonLd, FAQSection } from "@/components/seo/faq-section"
import { FeatureGrid } from "@/components/seo/feature-grid"
import { UseCasesSection } from "@/components/seo/use-cases"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl, SITE_URL } from "@/lib/site"

export const metadata: Metadata = {
  title: "Markdown to PDF | Free Online Converter",
  description:
    "Convert markdown to PDF online for free. Table of contents, syntax-highlighted code blocks, custom fonts. Paste markdown, preview live, export as PDF.",
  keywords: ["markdown to pdf", "markdown to pdf online", "convert markdown to pdf", "md to pdf"],
  alternates: { canonical: "/markdown" },
  openGraph: {
    title: "Markdown to PDF | Free Online Converter | Codeprint",
    description: "Paste markdown, preview a formatted document, and export a sharp PDF. Free and private.",
    type: "website",
    url: absoluteUrl("/markdown"),
    images: [
      {
        url: ogImageUrl("markdown"),
        width: 1200,
        height: 630,
        alt: "Markdown headings and code blocks arranged on a print-ready page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown to PDF | Free Online Converter | Codeprint",
    description: "Paste markdown, preview a formatted document, and export a sharp PDF.",
    images: [ogImageUrl("markdown")],
  },
}

const FEATURES = [
  {
    title: "Table of contents",
    description: "Auto-generated from headings. Clickable in the output.",
  },
  {
    title: "Code blocks",
    description: "Syntax-highlighted in 20+ languages. Fenced blocks just work.",
  },
  {
    title: "Fonts & sizing",
    description: "Pick fonts for body, headings, and code. Set margins and size.",
  },
  {
    title: "PDF output",
    description: "Print or save as PDF. Formatting, colors, and TOC are preserved.",
  },
]

const USE_CASES = [
  {
    title: "READMEs",
    description: "Project docs in a binder. GitHub README to paper in seconds.",
  },
  {
    title: "Meeting notes",
    description: "Write in markdown, then hand out clean, formatted copies.",
  },
  {
    title: "Technical specs",
    description: "API docs, ADRs, and runbooks. Code examples stay highlighted.",
  },
  {
    title: "Course material",
    description: "Lecture notes with headers, lists, tables, and code blocks.",
  },
]

const FAQS = [
  {
    question: "How do I convert markdown to PDF?",
    answer:
      "Paste markdown, preview the formatted document, then click PDF. Codeprint creates the file directly in your browser.",
  },
  {
    question: "Does it support GitHub Flavored Markdown?",
    answer: "Yes. Tables, task lists, strikethrough, autolinks, and fenced code blocks are supported.",
  },
  {
    question: "Can I add a table of contents?",
    answer: "Yes. Toggle it in settings and Codeprint generates it from your h1–h6 headings.",
  },
  {
    question: "Is it free?",
    answer: "Yes. No account, no watermark, and no upload. It runs locally in your browser.",
  },
  {
    question: "Can I customize the fonts?",
    answer: "Yes. Body text, headings, and code blocks each have their own font picker.",
  },
  {
    question: "Are code blocks highlighted?",
    answer: "Yes. Fenced code blocks are syntax-highlighted using the language tag in your markdown.",
  },
]

export default function MarkdownPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      <BreadcrumbJsonLd
        items={[
          { name: "Codeprint", url: SITE_URL },
          { name: "Markdown to PDF", url: absoluteUrl("/markdown") },
        ]}
      />
      <main>
        <PageHero
          title="Turn Markdown into a polished PDF."
          description="Keep headings, tables, code blocks, and the table of contents intact. Preview every page and export the PDF without uploading your document."
          ctaHref="#md-editor-section"
          ctaLabel="Start writing"
        />
        <MarkdownPrinterApp />
        <div className="mx-auto max-w-6xl px-6">
          <FeatureGrid features={FEATURES} />
          <UseCasesSection useCases={USE_CASES} title="What people print" />
        </div>
        <MarketingHowItWorks variant="markdown" />
        <section className="content-auto mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">
            Why markdown to PDF?
          </h2>
          <div className="leading-editorial mt-6 space-y-5 text-pretty text-slate-600 dark:text-slate-400">
            <p>
              Markdown is excellent for writing because the source stays plain and portable. The trouble starts when the
              document has to leave an editor. A README that looks structured on GitHub can print from a browser with
              awkward page breaks, missing code colors, or tables that spill beyond the page. The source is still
              readable, but the printed result no longer feels like the document you wrote.
            </p>
            <p>
              Traditional converters solve part of that problem, often with extra setup. Pandoc is dependable but
              expects a command-line workflow. File-upload converters add another handoff for documents that may contain
              private project details. Editor extensions tie the export process to one application. Codeprint keeps the
              workflow direct: paste or drop the markdown, inspect a live preview, choose the typography and page
              layout, then generate the PDF locally.
            </p>
            <p>
              GitHub Flavored Markdown features stay useful in the final document. Tables remain tables, task lists keep
              their structure, blockquotes stay distinct, and fenced code blocks retain syntax highlighting. A generated
              table of contents makes longer specifications easier to navigate. The result is a real PDF with selectable
              text. It is suited to READMEs, architecture decisions, course notes, meeting records, and any document
              that began as markdown but needs to work on paper.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-6">
          <FAQSection faqs={FAQS} title="Questions" pageUrl={absoluteUrl("/markdown")} />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
