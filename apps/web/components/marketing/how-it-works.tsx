import { ExportIllustration, LayoutIllustration, PasteIllustration } from "@/components/marketing/motion-illustrations"
import { SectionHeading } from "@/components/marketing/section-heading"
import { Reveal } from "@/components/motion/reveal"

const BASE_STEPS = [
  {
    title: "Paste or upload",
    description: "Drop a file or paste code. Language detects automatically.",
    illustration: <PasteIllustration />,
  },
  {
    title: "Set your layout",
    description: "Adjust font size, columns, orientation, and page size with a live preview.",
    illustration: <LayoutIllustration />,
  },
  {
    title: "Print or export",
    description: "Send to your printer or download as PDF. Colors and line numbers included.",
    illustration: <ExportIllustration />,
  },
]

interface MarketingHowItWorksProps {
  variant?: "code" | "markdown" | "csv"
}

export function MarketingHowItWorks({ variant = "code" }: MarketingHowItWorksProps = {}) {
  const firstStepDescription = {
    code: "Drop a file or paste code. Language detects automatically.",
    markdown: "Paste markdown or drop a .md file. The preview renders as you type.",
    csv: "Paste CSV or drop a file. Headers and rows format automatically.",
  }[variant]
  const steps = BASE_STEPS.map((step, index) => (index === 0 ? { ...step, description: firstStepDescription } : step))

  return (
    <section id="how-it-works" className="content-auto mx-auto max-w-5xl scroll-mt-24 px-6 py-16">
      <SectionHeading
        title="How it works"
        description="Get a perfectly formatted document in three simple steps. No sign-up required, and everything runs locally in your browser."
      />
      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 0.1} className="h-full">
            <article className="h-full rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="mb-6 flex justify-center">{step.illustration}</div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="leading-copy-sm mt-2 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
