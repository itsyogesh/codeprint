import { ArrowDown } from "lucide-react"
import { HeroDescription, HeroHeading } from "@/components/marketing/hero-copy"
import { PrimaryCta } from "@/components/marketing/primary-cta"
import { Reveal } from "@/components/motion/reveal"
import { Button } from "@/components/ui/button"

export function HomeHero() {
  return (
    <section className="border-b border-orange-500/10 px-6 pb-16 pt-32 text-center md:pb-20 md:pt-40">
      <Reveal>
        <HeroHeading className="mx-auto max-w-[22ch]">Turn code into a PDF worth printing.</HeroHeading>
      </Reveal>
      <Reveal delay={0.1}>
        <HeroDescription className="mx-auto mt-6 max-w-2xl">
          Keep syntax colors, line numbers, and the layout you choose. Preview every page and export the PDF without
          uploading your code.
        </HeroDescription>
      </Reveal>
      <Reveal delay={0.2} className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <PrimaryCta href="#editor-section" label="Start printing" />
        <Button asChild variant="contrast" size="lg" className="group h-auto min-h-12 px-8 py-3.5 text-base">
          <a href="#how-it-works">
            See how it works
            <ArrowDown className="home-hero-arrow transition-transform duration-150 ease-out motion-reduce:transform-none" />
          </a>
        </Button>
      </Reveal>
    </section>
  )
}
