"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useState } from "react"
import { CLI_COMMANDS, MCP_CLIENTS, MCP_RELEASE_AVAILABLE, MCP_SOURCE_CLIENTS } from "@/lib/developer-surfaces"
import { cn } from "@/lib/utils"
import { CopyButton } from "./copy-button"

export function CliCommandPlayground() {
  const [activeId, setActiveId] = useState<(typeof CLI_COMMANDS)[number]["id"]>(CLI_COMMANDS[0].id)
  const reduceMotion = useReducedMotion()
  const active = CLI_COMMANDS.find((item) => item.id === activeId) ?? CLI_COMMANDS[0]

  return (
    <div className="overflow-hidden rounded-2xl bg-[#0d1117] shadow-[0_8px_0_#020617]">
      <div
        className="flex overflow-x-auto border-b border-slate-800 bg-[#161b22]"
        role="tablist"
        aria-label="CLI examples"
      >
        {CLI_COMMANDS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={activeId === item.id}
            aria-controls="cli-command-output"
            onClick={() => setActiveId(item.id)}
            className={cn(
              "relative shrink-0 px-5 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500",
              activeId === item.id ? "text-white" : "text-slate-400 hover:text-slate-200",
            )}
          >
            {item.label}
            {activeId === item.id ? (
              <motion.span
                layoutId="cli-active-tab"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500"
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : null}
          </button>
        ))}
      </div>
      <div id="cli-command-output" role="tabpanel" className="min-h-64 p-5 font-mono text-sm sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <p className="min-w-0 overflow-x-auto whitespace-nowrap pr-3 text-slate-200">
            <span className="text-green-400">~/project</span>$ {active.command}
          </p>
          <CopyButton
            value={active.command}
            label="Copy command"
            className="shrink-0 [&>span]:hidden sm:[&>span]:inline"
          />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reduceMotion ? false : { opacity: 0, transform: "translateY(4px)" }}
            animate={{
              opacity: 1,
              transform: "translateY(0px)",
              transition: { duration: reduceMotion ? 0 : 0.18, ease: [0.23, 1, 0.32, 1] },
            }}
            exit={
              reduceMotion
                ? undefined
                : {
                    opacity: 0,
                    transform: "translateY(-4px)",
                    transition: { duration: 0.12, ease: [0.23, 1, 0.32, 1] },
                  }
            }
            className="mt-7 space-y-2 text-slate-400"
          >
            {active.output.map((line) => (
              <p key={line} className="whitespace-pre-wrap break-words">
                {line || "\u00a0"}
              </p>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function McpInstallTabs() {
  const [activeClient, setActiveClient] = useState<string>(MCP_CLIENTS[0].label)
  const reduceMotion = useReducedMotion()
  const clients = MCP_RELEASE_AVAILABLE ? MCP_CLIENTS : MCP_SOURCE_CLIENTS
  const selected = clients.find((client) => client.label === activeClient) ?? clients[0]

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div
        className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800"
        role="tablist"
        aria-label="MCP clients"
      >
        {MCP_CLIENTS.map((client) => (
          <button
            key={client.label}
            type="button"
            role="tab"
            aria-selected={client.label === activeClient}
            aria-controls="mcp-config-panel"
            onClick={() => setActiveClient(client.label)}
            className={cn(
              "relative shrink-0 px-5 py-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500",
              client.label === activeClient
                ? "text-slate-950 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
            )}
          >
            {client.label}
            {client.label === activeClient ? (
              <motion.span
                layoutId="mcp-active-tab"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500"
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : null}
          </button>
        ))}
      </div>
      <div id="mcp-config-panel" role="tabpanel" className="p-5 sm:p-8">
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{selected.instruction}</p>
        {!MCP_RELEASE_AVAILABLE ? (
          <p className="mb-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Build the server from source first. Replace <code className="font-mono">/absolute/path/to/codeprint</code>{" "}
            with the full path to your checkout. The npm package is not released yet.
          </p>
        ) : null}
        <div className="relative rounded-xl bg-[#0d1117] p-5 pr-16">
          <pre className="overflow-x-auto font-mono text-sm leading-6 text-slate-200">{selected.config}</pre>
          <CopyButton
            value={selected.config}
            label="Copy configuration"
            className="absolute right-3 top-3 [&>span]:hidden"
          />
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          <a href={selected.documentation} target="_blank" rel="noreferrer" className="underline underline-offset-4">
            {activeClient} setup documentation
          </a>
          . You can also set <code className="font-mono text-slate-800 dark:text-slate-200">CODEPRINT_OUTPUT_DIR</code>{" "}
          to choose a different local PDF folder.
        </p>
      </div>
    </div>
  )
}
