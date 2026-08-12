import {
  ControlsIllustration,
  LanguagesIllustration,
  LineNumbersIllustration,
  PdfIllustration,
  PrivacyIllustration,
  SpeedIllustration,
} from "@/components/marketing/motion-illustrations"
import { Reveal } from "@/components/motion/reveal"

export function BentoFeatures() {
  return (
    <section className="content-auto mx-auto max-w-5xl px-6 py-16" aria-label="Product advantages">
      <div className="grid auto-rows-[minmax(250px,auto)] grid-cols-1 gap-4 md:grid-cols-3">
        <Reveal className="h-full md:col-span-2">
          <article className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex h-full flex-col sm:flex-row">
              <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">Your code stays here</h3>
                <p className="leading-copy mt-3 text-slate-600 dark:text-slate-400">
                  Everything runs entirely in your browser. No server processing, no uploads, no tracking. Your
                  sensitive code never leaves your machine.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center border-t border-slate-100 bg-slate-50/50 p-8 sm:border-l sm:border-t-0 dark:border-white/[0.04] dark:bg-white/[0.01]">
                <PrivacyIllustration />
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.05} className="h-full md:col-span-1">
          <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex min-h-44 flex-1 items-center justify-center border-b border-slate-100 bg-slate-50/50 p-8 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <PdfIllustration />
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Actual PDFs</h3>
              <p className="leading-copy-sm mt-2 text-sm text-slate-600 dark:text-slate-400">
                Not a screenshot. We generate real PDF documents with selectable text that stays sharp at any zoom
                level.
              </p>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.1} className="h-full md:col-span-1">
          <article className="group relative flex h-full flex-col justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 md:p-10 dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="absolute -right-8 -top-8 text-slate-100 dark:text-white/[0.02]" aria-hidden="true">
              <svg aria-hidden="true" width="160" height="160" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
              </svg>
            </div>
            <div className="relative">
              <SpeedIllustration />
              <h3 className="mt-6 font-serif text-2xl font-bold text-slate-900 dark:text-white">Lightning fast</h3>
              <p className="leading-copy mt-3 text-slate-600 dark:text-slate-400">
                Paste and print. No account creation, no loading screens, no waiting.
              </p>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.15} className="h-full md:col-span-2">
          <article className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex h-full flex-col sm:flex-row-reverse">
              <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                  Your layout, your rules
                </h3>
                <p className="leading-copy mt-3 text-slate-600 dark:text-slate-400">
                  Font size, columns, orientation, page size, line numbers. All adjustable, all live. See exactly what
                  you’ll get before you print.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center border-t border-slate-100 bg-slate-50/50 p-8 sm:border-r sm:border-t-0 dark:border-white/[0.04] dark:bg-white/[0.01]">
                <ControlsIllustration />
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.2} className="h-full md:col-span-2">
          <article className="group h-full overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex h-full flex-col sm:flex-row">
              <div className="flex flex-1 flex-col justify-center p-8 md:p-10">
                <h3 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">20+ languages</h3>
                <p className="leading-copy mt-3 text-slate-600 dark:text-slate-400">
                  From Python and Rust to SQL and Shell. Codeprint detects the language and applies the right syntax
                  highlighting.
                </p>
              </div>
              <div className="flex flex-1 items-center justify-center border-t border-slate-100 bg-slate-50/50 p-8 sm:border-l sm:border-t-0 dark:border-white/[0.04] dark:bg-white/[0.01]">
                <LanguagesIllustration />
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.25} className="h-full md:col-span-1">
          <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
            <div className="flex min-h-44 flex-1 items-center justify-center border-b border-slate-100 bg-slate-50/50 p-8 dark:border-white/[0.04] dark:bg-white/[0.01]">
              <LineNumbersIllustration />
            </div>
            <div className="p-6 md:p-8">
              <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">Line numbers</h3>
              <p className="leading-copy-sm mt-2 text-sm text-slate-600 dark:text-slate-400">
                Essential for code reviews. Toggle them on or off, adjust their style, or begin from a specific number.
              </p>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}
