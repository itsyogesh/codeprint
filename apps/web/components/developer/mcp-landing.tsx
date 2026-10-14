import { Check, FileText, Printer } from "lucide-react"
import Link from "next/link"
import { HeroDescription, HeroHeading } from "@/components/marketing/hero-copy"
import { Reveal } from "@/components/motion/reveal"
import { buttonVariants } from "@/components/ui/button"
import {
  MCP_BUILD_COMMAND,
  MCP_RELEASE_AVAILABLE,
  MCP_RUN_COMMAND,
  MCP_TOOL_GROUPS,
  NODE_REQUIREMENT,
} from "@/lib/developer-surfaces"
import { McpInstallTabs } from "./command-demos"
import { CopyButton } from "./copy-button"
import { McpHeroIllustration, PrivacyOrbit } from "./hero-illustrations"
import { ArchitectureDiagram, DeveloperFaq, DeveloperSectionHeading } from "./landing-shared"

const MCP_FAQ = [
  {
    question: "Will the PDF preview appear inside my assistant?",
    answer:
      "Clients that support MCP Apps can display Codeprint’s offline PDF viewer. Other MCP clients receive a readable PDF resource and a local file path. Tool support alone does not imply inline preview support.",
  },
  {
    question: "Can I add this as a hosted ChatGPT connector?",
    answer:
      "This release is a local stdio server, not a public HTTPS connector. A hosted connector would need a separate authenticated service and different privacy guarantees. It must not expose your local printers or files to the internet.",
  },
  {
    question: "Where do generated PDFs go?",
    answer:
      "By default, the server saves them to ~/Downloads/Codeprint. Set CODEPRINT_OUTPUT_DIR in the MCP server environment to choose another absolute path.",
  },
  {
    question: "Can my assistant print without asking?",
    answer:
      "The server exposes physical printing as two separate tools. prepare_print_job returns the exact settings and a short-lived token. The assistant must show those settings and call submit_print_job only after explicit approval.",
  },
  {
    question: "What printers are supported?",
    answer:
      "The first release supports printers configured through CUPS on macOS and Linux. Windows printing is not supported yet.",
  },
  {
    question: "Does Codeprint send my document to the cloud?",
    answer:
      "No. The MCP server receives content from your assistant client, renders on your machine, and talks to your local operating-system printer service. Codeprint has no document API or cloud print queue.",
  },
  {
    question: "What formats can an assistant create?",
    answer:
      "Markdown, code, JSON, and CSV. JSON uses the code renderer with language set to json, so it keeps indentation and syntax colors.",
  },
] as const

export function McpLanding() {
  return (
    <>
      <section className="border-b border-orange-500/10 px-6 pb-20 pt-32 text-center md:pt-40">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500 motion-reduce:animate-none" />
              Codeprint MCP
            </p>
          </Reveal>
          <Reveal delay={0.05}>
            <HeroHeading className="mx-auto mt-6 max-w-[20ch]">Turn AI output into reading you can finish.</HeroHeading>
          </Reveal>
          <Reveal delay={0.1}>
            <HeroDescription className="mx-auto mt-6 max-w-2xl">
              Ask your assistant to create local PDFs from the work that matters. Preview the result or approve the
              exact settings before anything reaches your printer.
            </HeroDescription>
          </Reveal>
          <Reveal delay={0.2} className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="#installation" className={buttonVariants({ size: "lg" })}>
              Add to your assistant
            </Link>
            <Link href="#tools" className={buttonVariants({ variant: "outline", size: "lg" })}>
              See all eight tools
            </Link>
          </Reveal>
          <div className="mt-14">
            <McpHeroIllustration />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50/70 px-6 py-24 dark:border-white/[0.06] dark:bg-white/[0.01]">
        <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-white">The reading debt</h2>
            <p className="leading-copy mt-4 text-pretty text-slate-600 dark:text-slate-400">
              Architecture plans, research summaries, migration guides, and runbooks collect across chats and tabs. You
              read half on screen, move on, and lose the mental context that made the document useful.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-serif text-2xl font-bold text-slate-950 dark:text-white">The physical shift</h2>
            <p className="leading-copy mt-4 text-pretty text-slate-600 dark:text-slate-400">
              Step away from the screen. Read with a pen. Ask your MCP client for a printable PDF, inspect the result,
              or prepare a local print job whose destination and settings remain visible before submission.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="tools" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <DeveloperSectionHeading
            title="Three steps, eight explicit tools"
            description="PDF creation, printer inspection, and physical submission stay separate so the assistant cannot blur a preview into a print action."
          />
          <div className="mt-14 space-y-6">
            {MCP_TOOL_GROUPS.map((group, index) => {
              const Icon = index === 0 ? FileText : Printer
              return (
                <article
                  key={group.title}
                  className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:p-8 dark:border-slate-800 dark:bg-slate-900"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-xl font-bold text-slate-950 dark:text-white">{group.title}</h3>
                    <p className="mt-3 leading-copy text-slate-600 dark:text-slate-400">{group.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {group.tools.map((tool) => (
                        <code
                          key={tool}
                          className="rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {tool}
                        </code>
                      ))}
                    </div>
                    {index === 2 ? (
                      <div className="mt-6 rounded-xl bg-[#0d1117] p-4 font-mono text-sm leading-6 text-slate-400">
                        Prepared: 1 copy, A4, two-sided-long-edge, monochrome, all pages, printer Office_Printer.
                        <br />
                        Ask the user to approve these exact settings before calling submit_print_job.
                      </div>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <ArchitectureDiagram active="mcp" />

      <section className="border-y border-slate-200 bg-slate-50/70 px-6 py-24 dark:border-white/[0.06] dark:bg-white/[0.01]">
        <div className="mx-auto max-w-4xl">
          <DeveloperSectionHeading
            title="Read the PDF, right in your conversation"
            description="The preview uses the exact saved PDF bytes, not a separate HTML approximation. Every paper page is shown in full."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              [
                "Create",
                "Ask for a reading copy in Markdown, code, JSON, or CSV. Codeprint renders and saves it locally.",
              ],
              [
                "Inspect",
                "An MCP Apps client can show page navigation and an exact PDF preview. Other clients can read the PDF resource.",
              ],
              [
                "Decide",
                "Keep the PDF, request changes, or review a prepared print job. Previewing never submits a physical job.",
              ],
            ].map(([title, description]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="font-serif text-xl font-bold text-slate-950 dark:text-white">{title}</h3>
                <p className="mt-3 leading-copy text-slate-600 dark:text-slate-400">{description}</p>
              </article>
            ))}
          </div>
          <p className="mt-7 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Preview availability depends on the client’s MCP Apps support. The viewer needs no CDN, analytics script, or
            Codeprint account. Generated resources stay available for this server session, subject to its memory limit.
          </p>
        </div>
      </section>

      <section id="installation" className="mx-auto max-w-4xl scroll-mt-24 px-6 py-24">
        <Reveal>
          <DeveloperSectionHeading
            title="Add Codeprint to your assistant"
            description={`The MCP server runs locally and requires ${NODE_REQUIREMENT}. ${MCP_RELEASE_AVAILABLE ? "Install the released npm package." : "Build from source while the npm release is being prepared."}`}
          />
        </Reveal>
        {!MCP_RELEASE_AVAILABLE ? (
          <div className="relative mt-8 rounded-2xl bg-[#0d1117] p-6 pr-16">
            <pre className="overflow-x-auto font-mono text-sm leading-6 text-slate-200">{MCP_BUILD_COMMAND}</pre>
            <CopyButton
              value={MCP_BUILD_COMMAND}
              label="Copy build commands"
              className="absolute right-3 top-3 [&>span]:hidden"
            />
          </div>
        ) : null}
        <Reveal delay={0.2} className="mt-12">
          <McpInstallTabs />
        </Reveal>
      </section>

      <section className="border-y border-slate-200 px-6 py-24 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 md:flex-row">
          <div className="flex-1">
            <DeveloperSectionHeading title="Local by construction" align="left" />
            <p className="leading-copy mt-5 text-pretty text-slate-600 dark:text-slate-400">
              Codeprint has no document upload service, API key, analytics event, localhost bridge, or cloud print
              queue. PDF bytes are created on your machine and physical jobs go to the printer service already
              configured by your operating system.
            </p>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
              <Check className="h-5 w-5" /> Works without a Codeprint account
            </p>
          </div>
          <PrivacyOrbit />
        </div>
      </section>

      <DeveloperFaq items={MCP_FAQ} />

      <section className="border-t border-slate-200 bg-slate-50/70 px-6 py-24 text-center dark:border-white/[0.06] dark:bg-white/[0.01]">
        <DeveloperSectionHeading
          title="Get the context off screen."
          description="Add the local server, create a reading copy, and keep physical printing behind a visible approval step."
        />
        <div className="mx-auto mt-8 flex w-fit max-w-full flex-col items-center gap-3 rounded-2xl bg-[#0d1117] p-3 pl-5 sm:flex-row">
          <code className="max-w-full overflow-x-auto whitespace-nowrap font-mono text-sm text-slate-100">
            {MCP_RELEASE_AVAILABLE ? MCP_RUN_COMMAND : "node packages/mcp/dist/index.js"}
          </code>
          <CopyButton
            value={MCP_RELEASE_AVAILABLE ? MCP_RUN_COMMAND : "node packages/mcp/dist/index.js"}
            label="Copy command"
          />
        </div>
      </section>
    </>
  )
}
