import { HeroDescription, HeroHeading } from "@/components/marketing/hero-copy"
import { PrimaryCta } from "@/components/marketing/primary-cta"
import { Reveal } from "@/components/motion/reveal"

interface PageHeroProps {
  ctaHref: string
  ctaLabel: string
  description: string
  title: string
}

export function PageHero({ ctaHref, ctaLabel, description, title }: PageHeroProps) {
  return (
    <section className="border-b border-orange-500/10 px-6 pb-12 pt-32 text-center md:pb-14 md:pt-36">
      <Reveal>
        <HeroHeading className="mx-auto max-w-[22ch]">{title}</HeroHeading>
      </Reveal>
      <Reveal delay={0.1}>
        <HeroDescription className="mx-auto mt-6 max-w-2xl">{description}</HeroDescription>
      </Reveal>
      <Reveal delay={0.2} className="mt-7">
        <PrimaryCta href={ctaHref} label={ctaLabel} />
      </Reveal>
    </section>
  )
}
