import Link from "next/link"
import { LanguageIcon } from "@/components/marketing/language-icon"
import { getLanguagesForDisplay } from "@/lib/languages"

interface CrossLinksProps {
  /** Slug of the current language to exclude from the grid */
  currentSlug?: string
  title?: string
}

export function CrossLinks({ currentSlug, title = "Print Code in Other Languages" }: CrossLinksProps) {
  const languages = getLanguagesForDisplay().filter((l) => l.slug !== currentSlug)

  return (
    <section className="py-12">
      <h2 className="mb-6 text-center font-serif text-2xl font-bold tracking-[-0.025em] md:text-3xl">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {languages.map((lang) => (
          <Link
            key={lang.slug}
            href={`/${lang.slug}`}
            className="group flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-medium transition-colors hover:border-orange-500/30 hover:bg-slate-50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-orange-500/30 dark:hover:bg-white/[0.04]"
          >
            <LanguageIcon language={lang.name} className="transition-transform group-hover:scale-110" />
            {lang.name}
          </Link>
        ))}
      </div>
    </section>
  )
}
