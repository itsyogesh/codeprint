"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { CodeprintLogo } from "@/components/brand/codeprint-logo"
import { LanguageIcon } from "@/components/marketing/language-icon"
import { buttonVariants } from "@/components/ui/button"
import { SHOW_DEVELOPER_TOOLS } from "@/lib/features"
import { getLanguagesForDisplay } from "@/lib/languages"
import { cn } from "@/lib/utils"

const LANGUAGES = getLanguagesForDisplay()
const LANGUAGE_PATHS = new Set(LANGUAGES.map((language) => `/${language.slug}`))

export default function NavHeader() {
  const reduceMotion = useReducedMotion()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const languageTriggerRef = useRef<HTMLButtonElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)
  const mobilePanelRef = useRef<HTMLDivElement>(null)
  const mobileCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (languageMenuOpen) languageTriggerRef.current?.focus({ preventScroll: true })
        setLanguageMenuOpen(false)
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [languageMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const trigger = mobileTriggerRef.current
    const panel = mobilePanelRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    mobileCloseRef.current?.focus({ preventScroll: true })

    const containFocus = (event: FocusEvent) => {
      if (panel && !panel.contains(event.target as Node)) mobileCloseRef.current?.focus({ preventScroll: true })
    }
    const onTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.defaultPrevented || !panel) return
      const controls = panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus({ preventScroll: true })
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus({ preventScroll: true })
      }
    }
    // A hidden mobile sheet must not retain focus or lock scrolling on resize.
    const desktop = window.matchMedia("(min-width: 768px)")
    const onDesktop = () => {
      if (desktop.matches) setMobileMenuOpen(false)
    }
    onDesktop()
    desktop.addEventListener("change", onDesktop)
    document.addEventListener("focusin", containFocus)
    document.addEventListener("keydown", onTab)
    return () => {
      desktop.removeEventListener("change", onDesktop)
      document.removeEventListener("focusin", containFocus)
      document.removeEventListener("keydown", onTab)
      document.body.style.overflow = previousOverflow
      const returnTarget = desktop.matches ? languageTriggerRef.current : trigger
      if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true })
    }
  }, [mobileMenuOpen])

  const isLanguagePage = LANGUAGE_PATHS.has(pathname)
  const isMarkdownPage = pathname === "/markdown"
  const isCsvPage = pathname === "/csv"
  const isDocsPage = pathname === "/docs"
  const isCliPage = pathname === "/cli"
  const isMcpPage = pathname === "/mcp"
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const navLinkClass = (active: boolean) =>
    cn(
      "nav-motion-link rounded-full border px-3 py-1.5 text-sm transition-[color,background-color,border-color,transform] duration-150 ease-out active:translate-y-px motion-reduce:transform-none",
      active
        ? "border-orange-300 bg-orange-50 font-semibold text-orange-700 dark:border-orange-500/45 dark:bg-orange-500/10 dark:text-orange-300"
        : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
    )

  const mobileNavLinkClass = (active: boolean) =>
    cn(
      "rounded-xl border px-3 py-2.5 font-semibold transition-[border-color,background-color,color]",
      active
        ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/45 dark:bg-orange-500/10 dark:text-orange-200"
        : "border-transparent text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-white/[0.03]",
    )

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[padding] duration-300 motion-reduce:transition-none",
        scrolled ? "py-4" : "py-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between transition-[padding,max-width,border-radius,box-shadow,background-color,border-color] duration-300 motion-reduce:transition-none",
          scrolled
            ? cn(
                "rounded-full border border-slate-200 bg-white/85 px-4 py-2.5 shadow-lg backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-slate-950/80",
                SHOW_DEVELOPER_TOOLS ? "max-w-5xl" : "max-w-3xl",
              )
            : "max-w-7xl px-6 py-4",
        )}
      >
        <Link href="/" aria-label="Codeprint home" className="shrink-0">
          <CodeprintLogo markClassName={scrolled ? "h-9 w-9" : undefined} />
        </Link>

        <nav className="relative hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          <div ref={dropdownRef} className="relative">
            <button
              ref={languageTriggerRef}
              type="button"
              aria-haspopup="menu"
              aria-expanded={languageMenuOpen}
              data-active={isLanguagePage}
              onClick={() => setLanguageMenuOpen((open) => !open)}
              className={cn(navLinkClass(isLanguagePage), "flex items-center gap-1")}
            >
              Languages
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", languageMenuOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {languageMenuOpen ? (
                <motion.div
                  role="menu"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(10px) scale(0.96)" }}
                  animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(5px) scale(0.98)" }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.15, ease: [0.23, 1, 0.32, 1] }}
                  className="absolute left-1/2 top-full mt-2 max-h-[calc(100dvh-7rem-env(safe-area-inset-bottom))] w-[500px] -translate-x-1/2 overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="grid grid-cols-3 gap-1.5">
                    {LANGUAGES.map((language) => {
                      const selected = pathname === `/${language.slug}`
                      return (
                        <Link
                          key={language.slug}
                          role="menuitem"
                          href={`/${language.slug}`}
                          onClick={() => setLanguageMenuOpen(false)}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl border p-2 transition-[border-color,background-color] hover:bg-slate-50 dark:hover:bg-white/[0.03]",
                            selected
                              ? "border-orange-200 bg-orange-50 dark:border-orange-500/35 dark:bg-orange-500/10"
                              : "border-transparent",
                          )}
                        >
                          <span
                            className={cn(
                              "nav-language-icon flex h-8 w-8 items-center justify-center rounded-lg border",
                              selected
                                ? "border-orange-300 bg-orange-100 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/15 dark:text-orange-300"
                                : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                            )}
                          >
                            <LanguageIcon language={language.name} />
                          </span>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {language.name}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <Link href="/markdown" data-active={isMarkdownPage} className={navLinkClass(isMarkdownPage)}>
            Markdown
          </Link>
          <Link href="/csv" data-active={isCsvPage} className={navLinkClass(isCsvPage)}>
            CSV
          </Link>
          <Link href="/docs" data-active={isDocsPage} className={navLinkClass(isDocsPage)}>
            Docs
          </Link>
          {SHOW_DEVELOPER_TOOLS ? (
            <>
              <Link href="/cli" data-active={isCliPage} className={navLinkClass(isCliPage)}>
                CLI
              </Link>
              <Link href="/mcp" data-active={isMcpPage} className={navLinkClass(isMcpPage)}>
                MCP
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "relative h-9 w-9 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
            )}
            aria-label="Toggle color theme"
          >
            <Sun className="h-[18px] w-[18px] rotate-0 scale-100 opacity-100 transition-[transform,opacity] duration-200 dark:-rotate-90 dark:scale-85 dark:opacity-0 motion-reduce:transition-none" />
            <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-85 opacity-0 transition-[transform,opacity] duration-200 dark:rotate-0 dark:scale-100 dark:opacity-100 motion-reduce:transition-none" />
          </button>
          <Link
            href="/#editor-section"
            className={cn(buttonVariants({ variant: "contrast", size: "sm" }), "hidden sm:inline-flex")}
          >
            Open Editor
          </Link>
          <button
            ref={mobileTriggerRef}
            type="button"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-9 w-9 text-slate-600 md:hidden dark:text-slate-400",
            )}
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? "mobile-navigation-panel" : undefined}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm md:hidden dark:bg-black/50"
              onClick={closeMobileMenu}
            />
            <motion.div
              ref={mobilePanelRef}
              id="mobile-navigation-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ transform: "translateX(100%)" }}
              animate={{ transform: "translateX(0)" }}
              exit={{ transform: "translateX(100%)" }}
              transition={reduceMotion ? { duration: 0.01 } : { type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 z-50 flex h-dvh max-h-dvh w-[min(88vw,340px)] flex-col border-l border-slate-200 bg-white pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] md:hidden dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
                <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
                <button
                  ref={mobileCloseRef}
                  type="button"
                  onClick={closeMobileMenu}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "h-9 w-9 text-slate-500 dark:text-slate-400",
                  )}
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                <div className="px-2 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  Languages
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {LANGUAGES.map((language) => {
                    const selected = pathname === `/${language.slug}`
                    return (
                      <Link
                        key={language.slug}
                        href={`/${language.slug}`}
                        onClick={closeMobileMenu}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2 text-sm transition-[border-color,background-color,color]",
                          selected
                            ? "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/45 dark:bg-orange-500/10 dark:text-orange-200"
                            : "border-transparent text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.03]",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-lg border",
                            selected
                              ? "border-orange-300 bg-orange-100 dark:border-orange-500/50 dark:bg-orange-500/15"
                              : "border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800",
                          )}
                        >
                          <LanguageIcon language={language.name} />
                        </span>
                        <span>{language.name}</span>
                      </Link>
                    )
                  })}
                </div>
                <div className="my-4 h-px bg-slate-100 dark:bg-slate-800" />
                <div className="flex flex-col gap-1">
                  <Link href="/markdown" onClick={closeMobileMenu} className={mobileNavLinkClass(isMarkdownPage)}>
                    Markdown
                  </Link>
                  <Link href="/csv" onClick={closeMobileMenu} className={mobileNavLinkClass(isCsvPage)}>
                    CSV
                  </Link>
                  <Link href="/docs" onClick={closeMobileMenu} className={mobileNavLinkClass(isDocsPage)}>
                    Docs
                  </Link>
                  {SHOW_DEVELOPER_TOOLS ? (
                    <>
                      <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
                      <Link href="/cli" onClick={closeMobileMenu} className={mobileNavLinkClass(isCliPage)}>
                        Codeprint CLI
                      </Link>
                      <Link href="/mcp" onClick={closeMobileMenu} className={mobileNavLinkClass(isMcpPage)}>
                        Codeprint MCP
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
              <div className="shrink-0 border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800">
                <Link
                  href="/#editor-section"
                  onClick={closeMobileMenu}
                  className={cn(buttonVariants({ size: "lg" }), "w-full")}
                >
                  Open Editor
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
