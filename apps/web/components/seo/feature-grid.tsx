import { Code2, FileDown, Hash, Settings2 } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"

interface Feature {
  title: string
  description: string
}

interface FeatureGridProps {
  features: Feature[]
  title?: string
}

const ICONS = [Code2, FileDown, Settings2, Hash]

export function FeatureGrid({ features, title }: FeatureGridProps) {
  return (
    <section className="py-12">
      {title && (
        <h2 className="mb-8 text-center font-serif text-2xl font-bold tracking-[-0.025em] md:text-3xl">{title}</h2>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Reveal key={feature.title} delay={i * 0.08} className="h-full">
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-colors hover:border-orange-500/25 dark:border-white/[0.06] dark:bg-white/[0.02]">
                <div className="mb-4 inline-flex rounded-xl bg-orange-50 p-2.5 dark:bg-orange-500/10">
                  <Icon className="h-5 w-5 text-orange-500" />
                </div>
                <h3 className="mb-2 font-serif text-lg font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="leading-copy-sm text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
