import { PrimaryCta } from "@/components/marketing/primary-cta"
import { Reveal } from "@/components/motion/reveal"

export function BottomCta() {
  return (
    <section className="w-full px-6 py-20 text-center">
      <Reveal>
        <h2 className="font-serif text-3xl font-bold tracking-[-0.025em] text-slate-900 md:text-4xl dark:text-white">
          Ready to print?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-600 dark:text-slate-400">
          Open the editor. It’s free and you don’t need an account.
        </p>
        <PrimaryCta className="mt-8" href="#editor-section" label="Start printing" />
      </Reveal>
    </section>
  )
}
