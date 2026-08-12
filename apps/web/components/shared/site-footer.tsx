import { Coffee, Github } from "lucide-react"
import Link from "next/link"
import { CodeprintLogo } from "@/components/brand/codeprint-logo"
import { SHOW_DEVELOPER_TOOLS } from "@/lib/features"
import { getLanguagesForDisplay } from "@/lib/languages"

const LANGUAGES = getLanguagesForDisplay()
const FEATURED_LANGUAGE_SLUGS = ["python", "javascript", "typescript", "java", "go", "rust", "cpp", "c"]
const FEATURED_LANGUAGES = FEATURED_LANGUAGE_SLUGS.map((slug) =>
  LANGUAGES.find((language) => language.slug === slug),
).filter((language): language is (typeof LANGUAGES)[number] => Boolean(language))

const TOOL_LINKS = [
  { href: "/", label: "Code to PDF" },
  { href: "/markdown", label: "Markdown to PDF" },
  { href: "/csv", label: "CSV Viewer" },
  ...(SHOW_DEVELOPER_TOOLS
    ? [
        { href: "/cli", label: "Codeprint CLI" },
        { href: "/mcp", label: "Codeprint MCP" },
      ]
    : []),
  { href: "/blog", label: "Blog" },
]

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/docs", label: "Documentation" },
  { href: "https://github.com/itsyogesh/codeprint", label: "Source code" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/changelog", label: "Changelog" },
]

const footerLinkClass =
  "py-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-white/[0.06] dark:bg-[#030712]">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <div className="flex flex-col md:col-span-2 lg:col-span-1">
          <Link href="/" aria-label="Codeprint home" className="w-fit">
            <CodeprintLogo />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Code to PDF with syntax highlighting. Free, private, runs in your browser.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/itsyogesh/codeprint"
              target="_blank"
              rel="noreferrer"
              aria-label="Codeprint on GitHub"
              className="text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://x.com/itsyogesh18"
              target="_blank"
              rel="noreferrer"
              aria-label="Yogesh on X"
              className="text-slate-400 transition-colors hover:text-slate-900 dark:hover:text-white"
            >
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
              <span className="sr-only">Yogesh on X</span>
            </a>
            <a
              href="https://www.buymeacoffee.com/Y1qrM6E"
              target="_blank"
              rel="noreferrer"
              className="ml-1 inline-flex items-center gap-1.5 text-sm text-orange-500 transition-colors hover:text-orange-600 dark:hover:text-orange-400"
            >
              <Coffee className="h-4 w-4" />
              Buy Me a Coffee
            </a>
          </div>
        </div>

        <FooterColumn title="Tools" links={TOOL_LINKS} />

        <div className="flex flex-col">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Languages
          </h2>
          <div className="flex flex-col gap-1.5">
            {FEATURED_LANGUAGES.map((language) => (
              <Link key={language.slug} href={`/${language.slug}`} className={footerLinkClass}>
                {language.name}
              </Link>
            ))}
            <Link href="/#languages" className={`${footerLinkClass} mt-1`}>
              + {Math.max(0, LANGUAGES.length - FEATURED_LANGUAGES.length)} more
            </Link>
          </div>
        </div>

        <FooterColumn title="Company" links={COMPANY_LINKS} />
      </div>

      <div className="border-t border-slate-200 px-6 py-6 dark:border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <span className="text-xs text-slate-400">© 2026 Codeprint</span>
          <span className="text-xs italic text-slate-400">Sometimes the best way to review code is on paper.</span>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="flex flex-col">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {title}
      </h2>
      <div className="flex flex-col gap-1.5">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={footerLinkClass}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
