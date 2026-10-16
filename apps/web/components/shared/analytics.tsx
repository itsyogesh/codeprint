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
  canReplayPath,
  canReplayUrl,
  hasTrackingOptOut,
  isProductionHost,
  REPLAY_CONSENT_KEY,
  readConsent,
  revokeGoogleAnalytics,
  sanitizeAnalyticsUrl,
  stopReplay,
  type TrackingConsent,
} from "@/lib/analytics-privacy"

const Analytics = dynamic(() => import("@vercel/analytics/react").then((m) => m.Analytics), { ssr: false })
const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then((m) => m.SpeedInsights), { ssr: false })

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] }
}

export function AnalyticsProvider({
  googleId,
  clarityId,
  replayConfigured = false,
}: {
  googleId?: string
  clarityId?: string
  replayConfigured?: boolean
}) {
  const pathname = usePathname()
  const [production, setProduction] = useState(false)
  const [consent, setConsent] = useState<TrackingConsent>(null)
  const [replayConsent, setReplayConsent] = useState<TrackingConsent>(null)
  const [googleChoice, setGoogleChoice] = useState(false)
  const [replayChoice, setReplayChoice] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [replayReady, setReplayReady] = useState(false)
  const initializedGoogle = useRef(false)
  const initializedReplay = useRef(false)
  const validGoogleId = /^G-[A-Z0-9]+$/.test(googleId ?? "") ? googleId : undefined
  const validClarityId = /^[a-z0-9]{6,20}$/.test(clarityId ?? "") ? clarityId : undefined

  useEffect(() => {
    const allowed = isProductionHost(window.location.hostname) && !hasTrackingOptOut(navigator)
    setProduction(allowed)
    try {
      const saved = readConsent(localStorage, ANALYTICS_CONSENT_KEY)
      const replay = readConsent(localStorage, REPLAY_CONSENT_KEY)
      setConsent(saved)
      setReplayConsent(replay)
      setGoogleChoice(saved === "granted")
      setReplayChoice(replay === "granted")
    } catch {
      /* A blocked preference store keeps optional tracking off. */
    }
    const open = () => {
      try {
        setGoogleChoice(readConsent(localStorage, ANALYTICS_CONSENT_KEY) === "granted")
        setReplayChoice(readConsent(localStorage, REPLAY_CONSENT_KEY) === "granted")
      } catch {
        /* Storage access itself can be blocked. Keep choices off. */
      }
      setDetailsOpen(true)
      setPreferencesOpen(true)
    }
    const syncConsent = (event: StorageEvent) => {
      if (![ANALYTICS_CONSENT_KEY, REPLAY_CONSENT_KEY, null].includes(event.key)) return
      const next = event.newValue === "granted" ? "granted" : event.newValue === "denied" ? "denied" : null
      if (event.key === ANALYTICS_CONSENT_KEY || event.key === null) {
        if (next !== "granted") revokeGoogleAnalytics(window as AnalyticsWindow, validGoogleId)
        setConsent(next)
        setGoogleChoice(next === "granted")
      }
      if (event.key === REPLAY_CONSENT_KEY || event.key === null) {
        if (next !== "granted") stopReplay(window as AnalyticsWindow)
        setReplayConsent(next)
        setReplayChoice(next === "granted")
      }
      if (initializedGoogle.current || initializedReplay.current) window.location.reload()
    }
    // A restored marketing document must not resume listeners with stale consent.
    const restored = (event: PageTransitionEvent) => {
      if (!event.persisted || (!initializedGoogle.current && !initializedReplay.current)) return
      revokeGoogleAnalytics(window as AnalyticsWindow, validGoogleId)
      stopReplay(window as AnalyticsWindow)
      window.location.reload()
    }
    window.addEventListener(ANALYTICS_PREFERENCES_EVENT, open)
    window.addEventListener("storage", syncConsent)
    window.addEventListener("pageshow", restored)
    return () => {
      window.removeEventListener(ANALYTICS_PREFERENCES_EVENT, open)
      window.removeEventListener("storage", syncConsent)
      window.removeEventListener("pageshow", restored)
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

  useEffect(() => {
    if (
      !production ||
      replayConsent !== "granted" ||
      !validClarityId ||
      !canReplayPath(pathname) ||
      !canReplayUrl(window.location.href)
    ) {
      setReplayReady(false)
      if (initializedReplay.current) {
        stopReplay(window as AnalyticsWindow)
        window.location.reload()
      }
      return
    }
    if (initializedReplay.current) return
    const browser = window as AnalyticsWindow
    browser.clarity ??= (...args: unknown[]) => {
      browser.clarity!.q ??= []
      browser.clarity!.q.push(args)
    }
    browser.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" })
    initializedReplay.current = true
    setReplayReady(true)
  }, [pathname, production, replayConsent, validClarityId])

  function choose(google: boolean, replay: boolean) {
    if (!google) revokeGoogleAnalytics(window as AnalyticsWindow, validGoogleId)
    if (!replay) stopReplay(window as AnalyticsWindow)
    try {
      localStorage.setItem(ANALYTICS_CONSENT_KEY, google ? "granted" : "denied")
      localStorage.setItem(REPLAY_CONSENT_KEY, replay ? "granted" : "denied")
    } catch {
      // Without durable consent, a reload or another tab cannot reliably revoke it.
      try {
        localStorage.removeItem(ANALYTICS_CONSENT_KEY)
        localStorage.removeItem(REPLAY_CONSENT_KEY)
      } catch {
        /* Some browsers also block removal. Keep this document disabled. */
      }
      revokeGoogleAnalytics(window as AnalyticsWindow, validGoogleId)
      stopReplay(window as AnalyticsWindow)
      setConsent("denied")
      setReplayConsent("denied")
      setStorageError(true)
      if (initializedGoogle.current || initializedReplay.current) window.location.reload()
      return
    }
    setConsent(google ? "granted" : "denied")
    setReplayConsent(replay ? "granted" : "denied")
    setStorageError(false)
    setPreferencesOpen(false)
    setDetailsOpen(false)
    // Unloading removes listeners; consent API calls alone do not disable replay.
    if (initializedGoogle.current || initializedReplay.current) window.location.reload()
  }

  const showPreferences =
    storageError ||
    preferencesOpen ||
    (production &&
      ((Boolean(validGoogleId) && consent === null) || (Boolean(validClarityId) && replayConsent === null)))
  return (
    <>
      {production ? (
        <>
          <Analytics beforeSend={(event) => ({ ...event, url: sanitizeAnalyticsUrl(event.url) })} />
          <SpeedInsights beforeSend={(event) => ({ ...event, url: sanitizeAnalyticsUrl(event.url) })} />
        </>
      ) : null}
      {production && replayConsent === "granted" && replayReady && validClarityId && canReplayPath(pathname) ? (
        <Script
          id="codeprint-clarity"
          src={`https://www.clarity.ms/tag/${validClarityId}`}
          strategy="afterInteractive"
        />
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
          className="analytics-notice fixed inset-x-4 z-50 max-w-sm overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 sm:left-6 sm:right-auto sm:w-96"
        >
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            {detailsOpen ? "Analytics preferences" : "Help improve Codeprint"}
          </h2>
          <p className="mt-1.5 text-sm leading-5 text-slate-600 dark:text-slate-300">
            {detailsOpen
              ? "Choose what to share. Editors and PDFs are never recorded."
              : "Optional visit analytics and masked page replay. Editors and PDFs are never recorded."}
          </p>
          {detailsOpen ? (
            <div id="analytics-options" className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
              {validGoogleId ? (
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={googleChoice}
                    onChange={(event) => setGoogleChoice(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-orange-600"
                  />
                  <span>
                    Google Analytics
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Page visits, not document content.
                    </span>
                  </span>
                </label>
              ) : null}
              {replayConfigured ? (
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={replayChoice}
                    onChange={(event) => setReplayChoice(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 accent-orange-600"
                  />
                  <span>
                    Marketing page replay
                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                      Masked interactions on information pages only.
                    </span>
                  </span>
                </label>
              ) : null}
            </div>
          ) : null}
          {storageError ? (
            <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
              Could not save your choices. Optional tracking stays off.
            </p>
          ) : null}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => choose(false, false)}>
              Reject all
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                detailsOpen ? choose(googleChoice, replayChoice) : choose(Boolean(validGoogleId), replayConfigured)
              }
            >
              {detailsOpen ? "Save choices" : "Accept all"}
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls={detailsOpen ? "analytics-options" : undefined}
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="min-h-10 underline-offset-4 hover:underline focus-visible:outline-orange-500"
            >
              {detailsOpen ? "Back" : "Preferences"}
            </button>
            <Link
              href="/privacy"
              className="inline-flex min-h-10 items-center underline-offset-4 hover:underline focus-visible:outline-orange-500"
            >
              Privacy policy
            </Link>
          </div>
        </section>
      ) : null}
    </>
  )
}
