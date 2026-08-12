import { Bug, ClipboardCheck, FileText, GraduationCap } from "lucide-react"
import { Reveal } from "@/components/motion/reveal"

interface UseCase {
  title: string
  description: string
}

interface UseCasesSectionProps {
  useCases: UseCase[]
  title?: string
}

const ICONS = [ClipboardCheck, GraduationCap, FileText, Bug]

export function UseCasesSection({ useCases, title = "Use Cases" }: UseCasesSectionProps) {
  return (
    <section className="py-12">
      <h2 className="mb-8 text-center font-serif text-2xl font-bold tracking-[-0.025em] md:text-3xl">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {useCases.map((useCase, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Reveal key={useCase.title} delay={i * 0.08} className="h-full">
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 rounded-xl bg-orange-50 p-2.5 dark:bg-orange-500/10">
                    <Icon className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-serif font-bold text-slate-900 dark:text-white">{useCase.title}</h3>
                    <p className="leading-copy-sm text-sm text-slate-600 dark:text-slate-400">{useCase.description}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
