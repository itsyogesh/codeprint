import type { Metadata } from "next"
import { notFound } from "next/navigation"
import CodePrinterApp from "@/components/code-printer-app"
import { PageHero } from "@/components/marketing/page-hero"
import { CrossLinks } from "@/components/seo/cross-links"
import { BreadcrumbJsonLd, FAQSection } from "@/components/seo/faq-section"
import { FeatureGrid } from "@/components/seo/feature-grid"
import { HowItWorks } from "@/components/seo/how-it-works"
import { WebApplicationJsonLd } from "@/components/seo/json-ld"
import { UseCasesSection } from "@/components/seo/use-cases"
import { WhyPrintSection } from "@/components/seo/why-print"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { getAllLanguageSlugs, getLanguageBySlug } from "@/lib/languages"
import { ogImageUrl } from "@/lib/og"
import { absoluteUrl, SITE_URL } from "@/lib/site"

interface PageProps {
  params: Promise<{ language: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllLanguageSlugs().map((language) => ({ language }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { language } = await params
  const data = getLanguageBySlug(language)
  if (!data) return {}

  const title = `${data.name} to PDF with Syntax Highlighting`
  const image = ogImageUrl("language", { language: data.name })
  return {
    title,
    description: data.description,
    keywords: data.keywords,
    alternates: { canonical: `/${data.slug}` },
    openGraph: {
      title: `${title} | Codeprint`,
      description: data.description,
      type: "website",
      url: absoluteUrl(`/${data.slug}`),
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${data.name} source code arranged on a print-ready PDF page`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Codeprint`,
      description: data.description,
      images: [image],
    },
  }
}

export default async function LanguagePage({ params }: PageProps) {
  const { language } = await params
  const data = getLanguageBySlug(language)
  if (!data) notFound()

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      <WebApplicationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Codeprint", url: SITE_URL },
          { name: data.name, url: absoluteUrl(`/${data.slug}`) },
        ]}
      />
      <main>
        <PageHero
          title={`Turn ${data.name} code into a PDF worth printing.`}
          description={`Keep ${data.name} syntax colors, line numbers, and the layout you choose. Preview every page and export the PDF without uploading your code.`}
          ctaHref="#editor-section"
          ctaLabel={`Paste your ${data.name} code`}
        />
        <CodePrinterApp
          initialLanguage={data.hljsKey}
          initialFilename={data.defaultFilename}
          initialCode={data.sampleCode}
        />
        <div className="mx-auto max-w-6xl px-6">
          <FeatureGrid features={data.features} />
          <UseCasesSection useCases={data.useCases} title={`When you’d print ${data.name}`} />
          <HowItWorks language={data.name} />
          <WhyPrintSection language={data} />
          <FAQSection faqs={data.faq} title="Questions" pageUrl={absoluteUrl(`/${data.slug}`)} />
          <CrossLinks currentSlug={data.slug} title="Other languages" />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
