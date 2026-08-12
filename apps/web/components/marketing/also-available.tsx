"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { CsvCardIllustration, MarkdownCardIllustration } from "@/components/marketing/motion-illustrations"
import { Reveal } from "@/components/motion/reveal"

export function AlsoAvailable() {
  const reduceMotion = useReducedMotion()

  return (
    <section className="content-auto mx-auto max-w-3xl px-6 py-16">
      <Reveal>
        <h2 className="text-center font-serif text-2xl tracking-[-0.025em] text-slate-900 md:text-3xl dark:text-white">
          Not just code
        </h2>
      </Reveal>
      <Reveal delay={0.1}>
        <p className="mb-8 mt-2 text-center text-slate-600 dark:text-slate-400">
          Print markdown docs and CSV tables too.
        </p>
      </Reveal>
      <div className="grid gap-6 sm:grid-cols-2">
        <Reveal delay={0.2} className="h-full">
          <motion.article
            initial="rest"
            whileHover={reduceMotion ? "rest" : "hover"}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="flex h-48 items-center justify-center border-b border-slate-100 bg-slate-50/50 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <MarkdownCardIllustration />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-8">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Markdown to PDF</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
                Table of contents, code blocks, custom fonts. Paste markdown, get a printable doc.
              </p>
              <Link
                href="/markdown"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
              >
                Try it out <ArrowRight className="card-link-arrow h-4 w-4" />
              </Link>
            </div>
          </motion.article>
        </Reveal>
        <Reveal delay={0.3} className="h-full">
          <motion.article
            initial="rest"
            whileHover={reduceMotion ? "rest" : "hover"}
            className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="flex h-48 items-center justify-center border-b border-slate-100 bg-slate-50/50 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <CsvCardIllustration />
            </div>
            <div className="flex flex-1 flex-col p-6 md:p-8">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">CSV viewer</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
                Formatted tables with headers and zebra stripes. Print or export.
              </p>
              <Link
                href="/csv"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
              >
                Try it out <ArrowRight className="card-link-arrow h-4 w-4" />
              </Link>
            </div>
          </motion.article>
        </Reveal>
      </div>
    </section>
  )
}
