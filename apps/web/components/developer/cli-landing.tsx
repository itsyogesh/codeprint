import { Check } from "lucide-react"
import Link from "next/link"
import { HeroDescription, HeroHeading } from "@/components/marketing/hero-copy"
import { Reveal } from "@/components/motion/reveal"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CliCommandPlayground } from "./command-demos"
import { CliHeroIllustration } from "./hero-illustrations"
import {
  ArchitectureDiagram,
  CliInstallation,
  DeveloperFaq,
  DeveloperFinalCta,
  DeveloperSectionHeading,
  FormatPipeline,
} from "./landing-shared"

const CLI_FAQ = [
  {
    question: "Can I render a GitHub file or public URL?",
    answer:
      "Yes. Use codeprint render --url followed by a public GitHub file link or a direct HTTPS text-file URL. Your computer fetches the file and renders its PDF locally. Imports are limited to 2 MiB; private repositories and redirecting links are not supported. The same --url option works with print, with the normal confirmation step.",
  },
  {
    question: "Is the CLI free?",
    answer: "Yes. The CLI is free and open source for local use.",
  },
  {
    question: "What formats does it support?",
    answer:
      "Markdown, code files with syntax highlighting, JSON through the code renderer, CSV, and existing PDFs that you want to submit to a printer.",
  },
  {
    question: "Are my files sent to a server?",
    answer: "No. Parsing, PDF rendering, printer discovery, and print submission all happen on your machine.",
  },
  {
    question: "What is the relationship to MCP?",
    answer:
      "The CLI and MCP server share @codeprint/core for document rendering and @codeprint/print for local printer access. The MCP server adds a token-based approval boundary for assistants.",
  },
  {
    question: "Does physical printing work on Windows?",
    answer:
      "Not in the first release. Local printer discovery and submission currently use CUPS on macOS and Linux. PDF rendering remains portable.",
  },
] as const

const COMMAND_PARTS = [
  { value: "codeprint print", description: "Prepare and submit a print job", className: "font-bold text-white" },
  { value: "src/App.tsx", description: "Input file", className: "text-blue-400" },
  { value: "--page-size a4", description: "Also letter or legal", className: "text-orange-400" },
  { value: "--orientation landscape", description: "Portrait or landscape", className: "text-purple-400" },
  {
    value: "--duplex two-sided-long-edge",
    description: "One-sided, long-edge, or short-edge",
    className: "text-green-400",
  },
  { value: "--copies 2", description: "Choose 1 to 99 copies", className: "text-cyan-300" },
  { value: "--color monochrome", description: "Auto, color, or monochrome", className: "text-pink-300" },
  { value: "--page-ranges 1-3,5", description: "Print selected pages", className: "text-yellow-300" },
] as const

const RENDER_PARTS = [
  { value: "codeprint render", description: "Create a PDF without printing", className: "font-bold text-white" },
  { value: "README.md", description: "Markdown input", className: "text-blue-400" },
  { value: "--margins wide", description: "Small, normal, or wide", className: "text-orange-400" },
  { value: "--toc", description: "Add a Markdown table of contents", className: "text-purple-400" },
  { value: "--font-size 11", description: "Choose 8 to 24 points", className: "text-green-400" },
  { value: "--no-line-numbers", description: "Hide code line numbers", className: "text-yellow-300" },
] as const

export function CliLanding() {
  return (
    <>
      <section className="border-b border-slate-200 px-6 pb-20 pt-32 md:pb-24 md:pt-40 dark:border-white/[0.06]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <p className="font-mono text-sm font-bold uppercase tracking-[0.16em] text-orange-600 dark:text-orange-400">
                Codeprint CLI
              </p>
            </Reveal>
            <Reveal delay={0.05}>
              <HeroHeading className="mt-6 max-w-[15ch]">From terminal to paper.</HeroHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <HeroDescription className="mt-6 max-w-xl">
                Turn Markdown, code, JSON, and CSV files into polished PDFs. Preview the result or approve the exact
                settings before anything reaches your printer.
              </HeroDescription>
            </Reveal>
            <Reveal delay={0.2} className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="#installation" className={buttonVariants({ size: "lg" })}>
                Install Codeprint CLI
              </Link>
              <Link href="#commands" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Explore commands
              </Link>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-7 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                Local by default. Review before printing.
              </p>
            </Reveal>
          </div>
          <CliHeroIllustration />
        </div>
      </section>

      <section id="commands" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <DeveloperSectionHeading
            title="Interactive playground"
            description="Every example uses commands and options available in the package."
          />
        </Reveal>
        <Reveal delay={0.08} className="mt-12">
          <CliCommandPlayground />
        </Reveal>
      </section>

      <FormatPipeline />

      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <DeveloperSectionHeading title="Print controls without a GUI detour" />
          <div className="mt-12 overflow-x-auto rounded-2xl bg-[#0d1117] p-7 font-mono text-sm shadow-[0_8px_0_#020617] sm:p-8">
            <CommandParts label="Physical print" parts={COMMAND_PARTS} />
            <div className="my-8 h-px min-w-[54rem] bg-slate-800" />
            <CommandParts label="PDF layout" parts={RENDER_PARTS} />
            <p className="mt-10 flex items-center gap-2 font-sans text-xs text-slate-500">
              <Check className="h-4 w-4" /> Hover an argument to inspect it.
            </p>
          </div>
        </div>
      </section>

      <ArchitectureDiagram active="cli" />

      <section className="px-6 py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 md:flex-row">
          <div className="flex-1">
            <DeveloperSectionHeading title="Safe physical printing" align="left" />
            <p className="mt-5 leading-copy text-slate-600 dark:text-slate-400">
              Printing consumes paper and ink. Codeprint resolves the file, printer, copies, paper size, duplex mode,
              color mode, and page ranges before asking for confirmation. Nothing reaches the spooler until you say yes.
            </p>
            <p className="mt-5 leading-copy text-slate-600 dark:text-slate-400">
              For reviewed automation,{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-950 dark:bg-slate-800 dark:text-white">
                --yes
              </code>{" "}
              is the explicit escape hatch. It is never the default.
            </p>
          </div>
          <div className="w-full flex-1 rounded-2xl bg-[#0d1117] p-6 font-mono text-sm shadow-[0_8px_0_#020617]">
            <p className="text-slate-400">$ codeprint print manifest.json</p>
            <p className="mt-4 leading-6 text-slate-300">
              Prepared manifest.pdf: 1 copy, A4, one-sided, auto, all pages, printer Home_LaserJet
            </p>
            <p className="mt-5 text-orange-400">Print these settings? [y/N]</p>
          </div>
        </div>
      </section>

      <CliInstallation />
      <DeveloperFaq items={CLI_FAQ} />
      <DeveloperFinalCta
        title="Print locally."
        description="Stop tabbing to the browser just to get a clean PDF. Install the CLI when the terminal is where your document begins."
        href="#installation"
        label="Install the CLI"
      />
    </>
  )
}

function CommandParts({ label, parts }: { label: string; parts: typeof COMMAND_PARTS | typeof RENDER_PARTS }) {
  return (
    <div className="flex min-w-max items-center gap-4">
      <span className="w-24 shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <div className="flex flex-wrap gap-x-3 gap-y-8">
        {parts.map((part) => (
          <span key={part.value} className={cn("group relative", part.className)} title={part.description}>
            {part.value}
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max max-w-48 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-center font-sans text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
              {part.description}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
