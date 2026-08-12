import type { LucideIcon } from "lucide-react"
import { ArrowRight, Bot, Check, ChevronDown, Monitor, Terminal } from "lucide-react"
import Link from "next/link"
import { Reveal } from "@/components/motion/reveal"
import NavHeader from "@/components/shared/nav-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { buttonVariants } from "@/components/ui/button"
import { CLI_FORMATS, CLI_INSTALL_COMMAND, NODE_REQUIREMENT } from "@/lib/developer-surfaces"
import { cn } from "@/lib/utils"
import { CopyButton } from "./copy-button"

export function DeveloperPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-950 transition-colors dark:bg-[#030712] dark:text-slate-100">
      <NavHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}

export function DeveloperSectionHeading({
  title,
  description,
  align = "center",
}: {
  title: string
  description?: string
  align?: "center" | "left"
}) {
  return (
    <div className={cn(align === "center" && "text-center")}>
      <h2 className="text-balance font-serif text-3xl font-bold tracking-[-0.025em] text-slate-950 md:text-4xl dark:text-white">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "leading-copy mt-4 max-w-2xl text-pretty text-slate-600 dark:text-slate-400",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}

export function FormatPipeline() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/70 px-6 py-24 dark:border-white/[0.06] dark:bg-white/[0.01]">
      <div className="mx-auto max-w-5xl">
        <DeveloperSectionHeading
          title="One pipeline, four formats"
          description="The same local rendering engine as the web app, packaged for terminal and agent workflows."
        />
        <div className="mt-14 flex flex-wrap justify-center gap-5">
          {CLI_FORMATS.map((format, index) => (
            <Reveal
              key={format.title}
              delay={index * 0.05}
              distance={12}
              className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]"
            >
              <article className="group flex min-h-64 flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="format-pipeline-paper relative mb-6 flex h-24 w-[4.5rem] flex-col border border-slate-300 bg-white p-3 shadow-[4px_5px_0_#cbd5e1] dark:border-slate-600 dark:bg-slate-800 dark:shadow-[4px_5px_0_#0f172a]">
                  <span className="mb-2 h-1.5 w-3/4 rounded-full bg-slate-400 dark:bg-slate-500" />
                  {[0, 1, 2, 3].map((line) => (
                    <span
                      key={line}
                      className={cn(
                        "mb-1.5 h-1 rounded-full",
                        line === index ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-600",
                        line % 2 === 0 ? "w-full" : "w-4/5",
                      )}
                    />
                  ))}
                </div>
                <h3 className="font-serif text-lg font-bold text-slate-950 dark:text-white">{format.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{format.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

const SURFACES: Array<{
  id: "browser" | "cli" | "mcp"
  title: string
  description: string
  icon: LucideIcon
}> = [
  {
    id: "browser",
    title: "Browser",
    description: "An immediate editor and print preview for everyday use.",
    icon: Monitor,
  },
  {
    id: "cli",
    title: "CLI",
    description: "PDF rendering and confirmed CUPS printing from the terminal.",
    icon: Terminal,
  },
  {
    id: "mcp",
    title: "MCP",
    description: "The same local capabilities exposed safely to AI assistants.",
    icon: Bot,
  },
]

export function ArchitectureDiagram({ active }: { active: "cli" | "mcp" }) {
  return (
    <section className="border-t border-slate-200 bg-slate-50/70 px-6 py-24 dark:border-white/[0.06] dark:bg-white/[0.01]">
      <div className="mx-auto max-w-5xl">
        <DeveloperSectionHeading
          title="Built for humans and agents"
          description="One core rendering engine powers three workflows without sending documents through a Codeprint cloud."
        />
        <div className="relative mt-14 flex flex-col gap-5 md:flex-row">
          <div
            aria-hidden="true"
            className="absolute left-[12%] right-[12%] top-1/2 hidden h-px bg-slate-300 md:block dark:bg-slate-700"
          />
          {SURFACES.map((surface) => {
            const Icon = surface.icon
            const isActive = surface.id === active
            return (
              <article
                key={surface.id}
                className={cn(
                  "relative z-10 flex flex-1 flex-col items-center rounded-2xl bg-white p-6 text-center dark:bg-slate-900",
                  isActive ? "border-2 border-orange-500" : "border border-slate-200 dark:border-slate-800",
                )}
              >
                <span
                  className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                    isActive
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-semibold text-slate-950 dark:text-white">{surface.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{surface.description}</p>
              </article>
            )
          })}
        </div>
        <p className="mt-8 text-center font-mono text-sm text-slate-500 dark:text-slate-400">
          Powered by @codeprint/core
        </p>
      </div>
    </section>
  )
}

export function CliInstallation() {
  return (
    <section
      id="installation"
      className="border-y border-slate-200 bg-slate-50/70 px-6 py-24 dark:border-white/[0.06] dark:bg-white/[0.01]"
    >
      <div className="mx-auto max-w-3xl">
        <DeveloperSectionHeading title="Installation" />
        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col gap-4 rounded-xl bg-[#0d1117] p-4 sm:flex-row sm:items-center sm:justify-between">
            <code className="overflow-x-auto whitespace-nowrap font-mono text-sm text-slate-100">
              {CLI_INSTALL_COMMAND}
            </code>
            <CopyButton
              value={CLI_INSTALL_COMMAND}
              label="Copy install command"
              className="shrink-0 self-start sm:self-auto"
            />
          </div>
          <dl className="mt-7 space-y-5 text-sm text-slate-600 dark:text-slate-400">
            <Requirement title="Runtime">{NODE_REQUIREMENT}.</Requirement>
            <Requirement title="Physical printing">
              macOS or Linux with CUPS. PDF rendering works without a printer.
            </Requirement>
            <Requirement title="Output behavior">
              Render writes to the current directory by default and refuses to overwrite a PDF unless you pass
              <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-900 dark:bg-slate-800 dark:text-white">
                --force
              </code>
              .
            </Requirement>
          </dl>
        </div>
      </div>
    </section>
  )
}

function Requirement({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
      <div>
        <dt className="font-semibold text-slate-950 dark:text-white">{title}</dt>
        <dd className="mt-1 leading-6">{children}</dd>
      </div>
    </div>
  )
}

export function DeveloperFaq({ items }: { items: ReadonlyArray<{ question: string; answer: React.ReactNode }> }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <DeveloperSectionHeading title="Frequently asked questions" />
      <div className="mt-12 space-y-4">
        {items.map((item) => (
          <details
            key={item.question}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-slate-950 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 sm:p-6 dark:text-white dark:hover:bg-white/[0.03]">
              {item.question}
              <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <div className="border-t border-slate-100 px-5 pb-6 pt-5 leading-copy text-slate-600 sm:px-6 dark:border-white/[0.05] dark:text-slate-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}

export function DeveloperFinalCta({
  title,
  description,
  href,
  label,
}: {
  title: string
  description: string
  href: string
  label: string
}) {
  return (
    <section className="border-t border-slate-200 bg-slate-50/70 px-6 py-24 text-center dark:border-white/[0.06] dark:bg-white/[0.01]">
      <Reveal>
        <DeveloperSectionHeading title={title} description={description} />
        <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
          {label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
    </section>
  )
}
