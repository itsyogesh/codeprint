import { JsonLd } from "@/components/seo/json-ld"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
  title?: string
  /** Base URL of the page for JSON-LD */
  pageUrl?: string
}

export function FAQSection({ faqs, title = "Frequently Asked Questions", pageUrl }: FAQSectionProps) {
  return (
    <section className="py-12">
      <h2 className="mb-6 text-center font-serif text-2xl font-bold tracking-[-0.025em] md:text-3xl">{title}</h2>
      <div className="mx-auto max-w-3xl">
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-2xl border border-slate-200 bg-white px-6 dark:border-white/[0.06] dark:bg-white/[0.02]"
        >
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="leading-copy-sm text-sm text-slate-600 dark:text-slate-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <FAQPageJsonLd faqs={faqs} pageUrl={pageUrl} />
    </section>
  )
}

function FAQPageJsonLd({ faqs, pageUrl }: { faqs: FAQ[]; pageUrl?: string }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }

  if (pageUrl) {
    data.url = pageUrl
  }

  return <JsonLd data={data} />
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}
