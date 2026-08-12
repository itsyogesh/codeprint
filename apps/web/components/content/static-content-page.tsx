import type { ReactNode } from "react"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"

export function StaticContentPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-32 md:pt-40">
        <header className="border-b border-slate-200 pb-12 dark:border-white/[0.06]">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">{eyebrow}</p>
          <h1 className="max-w-3xl text-balance font-serif text-4xl font-bold leading-display tracking-[-0.035em] md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-copy text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </header>
        <div className="space-y-14 py-14">{children}</div>
      </main>
      <SiteFooter />
    </div>
  )
}

export function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 md:grid-cols-[13rem_1fr] md:gap-10">
      <h2 className="text-balance font-serif text-xl font-bold leading-heading tracking-[-0.02em]">{title}</h2>
      <div className="space-y-4 leading-copy text-slate-600 dark:text-slate-400">{children}</div>
    </section>
  )
}
