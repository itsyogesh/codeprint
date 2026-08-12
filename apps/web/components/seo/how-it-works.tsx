import { ClipboardPaste, Printer, Sliders } from "lucide-react"

interface HowItWorksProps {
  language?: string
}

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "Paste Your Code",
    getDescription: (lang?: string) =>
      `Paste your ${lang || ""} code into the editor or type directly. The language is auto-detected from the file extension.`.trim(),
  },
  {
    icon: Sliders,
    title: "Customize Settings",
    getDescription: () =>
      "Adjust font size, line numbers, columns, page orientation, and page size to match your needs.",
  },
  {
    icon: Printer,
    title: "Print or Export PDF",
    getDescription: () =>
      "Click Print to send to your printer, or PDF to download a formatted document with syntax highlighting preserved.",
  },
]

export function HowItWorks({ language }: HowItWorksProps) {
  return (
    <section className="py-12">
      <h2 className="mb-8 text-center font-serif text-2xl font-bold tracking-[-0.025em] md:text-3xl">How it works</h2>
      <div className="grid gap-8 md:grid-cols-3">
        {STEPS.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/[0.06] dark:bg-white/[0.02]"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-500/10">
                <Icon className="h-6 w-6 text-orange-500" />
              </div>
              <div className="mb-1 text-sm font-medium text-orange-600 dark:text-orange-400">Step {i + 1}</div>
              <h3 className="mb-2 font-serif text-lg font-bold">{step.title}</h3>
              <p className="leading-copy-sm text-sm text-slate-600 dark:text-slate-400">
                {step.getDescription(language)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
