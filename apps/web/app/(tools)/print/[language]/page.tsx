import { permanentRedirect } from "next/navigation"
import { getAllLanguageSlugs } from "@/lib/languages"

interface LegacyLanguagePageProps {
  params: Promise<{ language: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getAllLanguageSlugs().map((language) => ({ language }))
}

export default async function LegacyLanguagePage({ params }: LegacyLanguagePageProps) {
  const { language } = await params
  permanentRedirect(`/${language}`)
}
