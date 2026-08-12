"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"
import { CsvTransformIllustration, DocumentTransformIllustration } from "@/components/marketing/motion-illustrations"
import { SectionHeading } from "@/components/marketing/section-heading"
import { Reveal } from "@/components/motion/reveal"

const FEATURES = [
  {
    title: "Code to PDF",
    description: "Paste code, get a formatted PDF with syntax colors intact.",
    items: ["20+ languages supported", "Customizable line numbers", "Multi-column layouts", "A4, Letter, and Legal"],
    illustration: <DocumentTransformIllustration source="code" />,
  },
  {
    title: "Markdown to PDF",
    description: "Markdown in, print-ready document out. TOC included.",
    items: [
      "Auto table of contents",
      "Code block highlighting",
      "Custom heading and body fonts",
      "Portrait and landscape",
    ],
    illustration: <DocumentTransformIllustration source="markdown" />,
  },
  {
    title: "CSV to table",
    description: "Paste CSV data, see a formatted table. Print or export.",
    items: ["Auto header detection", "Alternating row colors", "Adjustable font size", "Landscape for wide data"],
    illustration: <CsvTransformIllustration />,
  },
]

export function FeatureOverview() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="content-auto mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        title="Format any document"
        description="Whether it’s raw code, markdown documentation, or CSV data, Codeprint handles it with precise formatting and syntax highlighting."
      />
      <div className="grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.1} className="h-full">
            <motion.article
              initial="rest"
              whileHover={reduceMotion ? "rest" : "hover"}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-orange-500/20 dark:border-white/[0.06] dark:bg-white/[0.02]"
            >
              <div className="flex h-32 items-center justify-center overflow-hidden border-b border-slate-100 bg-slate-50/50 dark:border-white/[0.04] dark:bg-white/[0.01]">
                {feature.illustration}
              </div>
              <div className="flex-1 p-8">
                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="leading-copy-sm mt-2 text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
                <ul className="mt-6 space-y-3">
                  {feature.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 shrink-0 text-orange-500" strokeWidth={3} aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
