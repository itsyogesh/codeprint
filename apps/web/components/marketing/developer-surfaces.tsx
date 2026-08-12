import { ArrowRight, Bot, Terminal } from "lucide-react"
import Link from "next/link"
import { Reveal } from "@/components/motion/reveal"

const SURFACES = [
  {
    title: "Codeprint CLI",
    description:
      "Pipe output from jq, cat, or build scripts into the same local renderer. Create PDFs or submit confirmed CUPS print jobs without leaving the terminal.",
    href: "/cli",
    label: "Explore the CLI",
    icon: Terminal,
    iconClassName: "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  {
    title: "Codeprint MCP",
    description:
      "Give your AI backlog a physical ending. Create local reading copies and keep physical printing behind a short-lived approval token.",
    href: "/mcp",
    label: "Explore MCP",
    icon: Bot,
    iconClassName: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
] as const

export function DeveloperSurfaces() {
  return (
    <section className="content-auto mx-auto max-w-6xl border-t border-slate-200 px-6 py-20 dark:border-white/[0.06]">
      <Reveal>
        <h2 className="text-balance text-center font-serif text-3xl font-bold tracking-[-0.025em] text-slate-950 dark:text-white">
          Codeprint wherever the document begins
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-copy text-slate-600 dark:text-slate-400">
          The browser is one way to use the Codeprint rendering engine. Terminal and agent workflows use the same core.
        </p>
      </Reveal>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {SURFACES.map((surface, index) => {
          const Icon = surface.icon
          return (
            <Reveal key={surface.title} delay={0.08 + index * 0.08} className="h-full">
              <article className="developer-surface-card group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 transition-[border-color,transform] duration-200 hover:border-orange-300 motion-reduce:transform-none dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-orange-500/40 md:p-10">
                <span className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${surface.iconClassName}`}>
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-serif text-2xl font-bold text-slate-950 dark:text-white">{surface.title}</h3>
                <p className="leading-copy mt-3 flex-1 text-pretty text-slate-600 dark:text-slate-400">
                  {surface.description}
                </p>
                <Link
                  href={surface.href}
                  className="developer-surface-button mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_3px_0_#64748b] transition-[color,background-color,transform,box-shadow] hover:bg-orange-500 hover:shadow-[0_3px_0_#c2410c] active:translate-y-[2px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 motion-reduce:transform-none dark:bg-white dark:text-slate-950 dark:shadow-[0_3px_0_#64748b] dark:hover:bg-orange-500 dark:hover:text-white dark:hover:shadow-[0_3px_0_#c2410c]"
                >
                  {surface.label}
                  <ArrowRight className="card-link-arrow h-4 w-4 motion-reduce:transform-none" />
                </Link>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
