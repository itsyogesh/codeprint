"use client"

import { motion, useReducedMotion } from "framer-motion"
import Link from "next/link"
import { LanguageIcon } from "@/components/marketing/language-icon"
import { Reveal } from "@/components/motion/reveal"
import { getLanguagesForDisplay } from "@/lib/languages"

const MARQUEE_REPEAT = [0, 1, 2, 3]
const LANGUAGES = getLanguagesForDisplay()

export function LanguageMarquee() {
  const midpoint = Math.ceil(LANGUAGES.length / 2)
  const firstRow = LANGUAGES.slice(0, midpoint)
  const secondRow = LANGUAGES.slice(midpoint)

  return (
    <section className="w-full overflow-hidden py-8" aria-label="Supported programming languages">
      <div className="flex flex-col gap-4">
        <div className="flex w-max animate-marquee-left motion-reduce:translate-x-0">
          {MARQUEE_REPEAT.flatMap((repeat) =>
            firstRow.map((language) => (
              <Link
                key={`${repeat}-${language.slug}`}
                href={`/${language.slug}`}
                className="mx-2 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 transition-colors hover:border-orange-500/30 dark:border-white/[0.06] dark:bg-white/[0.02]"
              >
                <LanguageIcon language={language.name} />
                <span className="text-sm text-slate-700 dark:text-slate-300">{language.name}</span>
              </Link>
            )),
          )}
        </div>
        <div className="flex w-max animate-marquee-right motion-reduce:translate-x-0">
          {MARQUEE_REPEAT.flatMap((repeat) =>
            secondRow.map((language) => (
              <Link
                key={`${repeat}-${language.slug}`}
                href={`/${language.slug}`}
                className="mx-2 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 transition-colors hover:border-orange-500/30 dark:border-white/[0.06] dark:bg-white/[0.02]"
              >
                <LanguageIcon language={language.name} />
                <span className="text-sm text-slate-700 dark:text-slate-300">{language.name}</span>
              </Link>
            )),
          )}
        </div>
      </div>
    </section>
  )
}

export function LanguageGrid() {
  const reduceMotion = useReducedMotion()

  return (
    <section
      id="languages"
      className="content-auto scroll-mt-24 border-t border-slate-200 bg-slate-50/50 px-6 py-20 dark:border-white/[0.06] dark:bg-white/[0.01]"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-12 text-center">
          <h2 className="font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900 dark:text-white">
            Supported Languages
          </h2>
          <p className="mt-4 text-pretty text-slate-600 dark:text-slate-400">
            Automatic detection and syntax highlighting for over 20 languages.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {LANGUAGES.map((language, index) => (
            <Reveal key={language.slug} delay={Math.min(index, 6) * 0.04} distance={8}>
              <motion.div
                initial={false}
                animate={{ transform: "translateY(0px) scale(1)" }}
                whileHover={reduceMotion ? undefined : { transform: "translateY(-4px) scale(1.02)" }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              >
                <Link
                  href={`/${language.slug}`}
                  className="language-card group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:border-white/[0.06] dark:bg-white/[0.02] dark:focus-visible:ring-offset-[#030712]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                    <LanguageIcon language={language.name} className="h-6 w-6" />
                  </span>
                  <span className="text-sm font-medium text-slate-700 transition-colors duration-150 group-hover:text-slate-900 dark:text-slate-300 dark:group-hover:text-white">
                    {language.name}
                  </span>
                </Link>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
