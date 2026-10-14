"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_PREFERENCES_EVENT,
  hasTrackingOptOut,
  isProductionHost,
  revokeGoogleAnalytics,
  sanitizeAnalyticsUrl,
} from "@/lib/analytics-privacy"

const Analytics = dynamic(() => import("@vercel/analytics/react").then((m) => m.Analytics), { ssr: false })
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then((m) => m.SpeedInsights), { ssr: false })

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

export function AnalyticsProvider({ googleId }: { googleId?: string }) {
  const pathname = usePathname()
  const [production, setProduction] = useState(false)
  const [consent, setConsent] = useState<"granted" | "denied" | null>(null)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const initializedGoogle = useRef(false)
  const validGoogleId = /^G-[A-Z0-9]+$/.test(googleId ?? "") ? googleId : undefined

  useEffect(() => {
    const allowed = isProductionHost(window.location.hostname) && !hasTrackingOptOut(navigator)
    setProduction(allowed)
    try {
      const saved = localStorage.getItem(ANALYTICS_CONSENT_KEY)
      setConsent(saved === "granted" || saved === "denied" ? saved : null)
    } catch {
      /* A blocked preference store keeps optional tracking off. */
    }
    const open = () => setPreferencesOpen(true)
    const syncConsent = (event: StorageEvent) => {
      if (event.key !== ANALYTICS_CONSENT_KEY && event.key !== null) return
      const next = event.newValue === "granted" ? "granted" : event.newValue === "denied" ? "denied" : null
      if (next !== "granted") revokeGoogleAnalytics(window as AnalyticsWindow, validGoogleId)
      setConsent(next)
      if (initializedGoogle.current) window.location.reload()
    }
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, open)
    window.addEventListener("storage", syncConsent)
    return () => {
      window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, open)
      window.removeEventListener("storage", syncConsent)
    }
  }, [validGoogleId])

  useEffect(() => {
    if (!production || consent !== "granted" || !validGoogleId) return
    const browser = window as AnalyticsWindow
    browser.dataLayer ??= []
    // Google's queue uses Arguments objects rather than arrays as commands.
    browser.gtag ??= function (..._args: unknown[]) {
      // biome-ignore lint/complexity/noArguments: Preserve the documented gtag queue format.
      browser.dataLayer!.push(arguments)
    }
    if (!initializedGoogle.current) {
      Reflect.set(browser, `ga-disable-${validGoogleId}`, false)
      browser.gtag("consent", "default", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      })
      browser.gtag("js", new Date())
      browser.gtag("config", validGoogleId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        page_location: sanitizeAnalyticsUrl(window.location.href),
        page_referrer: sanitizeAnalyticsUrl(document.referrer),
      })
      initializedGoogle.current = true
      setGoogleReady(true)
    }
    browser.gtag("event", "page_view", {
      page_location: `${window.location.origin}${pathname}`,
      page_referrer: sanitizeAnalyticsUrl(document.referrer),
      page_title: "Codeprint",
      send_to: validGoogleId,
    })
  }, [consent, pathname, production, validGoogleId])

  function choose(value: "granted" | "denied") {
    if (value === "denied") revokeGoogleAnalytics(window as AnalyticsWindow, validGoogleId)
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, value)
    } catch {
      /* Session-only choice. */
    }
    setConsent(value)
    setPreferencesOpen(false)
    if (value === "denied") {
      // Reload removes optional scripts and stops already installed listeners.
      if (initializedGoogle.current) window.location.reload()
    } else if (initializedGoogle.current) window.location.reload()
  }

  const optionalConfigured = Boolean(validGoogleId)
  const showPreferences = preferencesOpen || (production && optionalConfigured && consent === null)
  return (
    <>
      {production ? (
        <>
          <Analytics beforeSend={(event) => ({ ...event, url: sanitizeAnalyticsUrl(event.url) })} />
          <SpeedInsights beforeSend={(event) => ({ ...event, url: sanitizeAnalyticsUrl(event.url) })} />
        </>
      ) : null}
      {production && consent === "granted" && googleReady && validGoogleId ? (
        <Script
          id="codeprint-google-analytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${validGoogleId}`}
          strategy="afterInteractive"
        />
      ) : null}
      {showPreferences ? (
        <section
          aria-label="Analytics preferences"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="font-serif text-lg font-bold text-slate-950 dark:text-white">Help us improve Codeprint?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Optional Google Analytics measures site visits. Your documents are not recorded, and session replay is
            disabled.{" "}
            <Link href="/privacy" className="underline underline-offset-4">
              Read our privacy policy.
            </Link>
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => choose("denied")}>
              No thanks
            </Button>
            <Button variant="outline" onClick={() => choose("granted")}>
              Allow analytics
            </Button>
          </div>
        </section>
      ) : null}
    </>
  )
}
