import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function HeroHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "leading-display text-balance font-serif text-4xl font-bold tracking-[-0.025em] text-slate-950 md:text-5xl lg:text-6xl dark:text-white",
        className,
      )}
    >
      {children}
    </h1>
  )
}

export function HeroDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("leading-copy text-pretty text-lg text-slate-600 dark:text-slate-400", className)}>{children}</p>
  )
}
