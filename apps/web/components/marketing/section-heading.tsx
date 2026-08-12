import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  className?: string
  description?: string
  title: string
}

export function SectionHeading({ className, description, title }: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto mb-12 max-w-2xl text-center", className)}>
      <Reveal>
        <h2 className="leading-heading text-pretty font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900 md:text-4xl dark:text-white">
          {title}
        </h2>
      </Reveal>
      {description ? (
        <Reveal delay={0.1}>
          <p className="leading-copy mt-4 text-pretty text-slate-600 dark:text-slate-400">{description}</p>
        </Reveal>
      ) : null}
    </div>
  )
}
