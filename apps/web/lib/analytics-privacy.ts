export const ANALYTICS_CONSENT_KEY = "codeprint.analytics.v1"
export const REPLAY_CONSENT_KEY = "codeprint.replay.v1"
export const ANALYTICS_PREFERENCES_EVENT = "codeprint:analytics-preferences"

export type TrackingConsent = "granted" | "denied" | null

export function readConsent(store: Pick<Storage, "getItem">, key: string): TrackingConsent {
  try {
    const value = store.getItem(key)
    return value === "granted" || value === "denied" ? value : null
  } catch {
    return null
  }
}

export function stopReplay(browser: { clarity?: (...args: unknown[]) => void }) {
  browser.clarity?.("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" })
  browser.clarity?.("stop")
}

export function revokeGoogleAnalytics(browser: { gtag?: (...args: unknown[]) => void }, measurementId?: string) {
  // Disable synchronously, before React updates or a pending Google script can run.
  if (measurementId) Reflect.set(browser, `ga-disable-${measurementId}`, true)
  browser.gtag?.("consent", "update", { analytics_storage: "denied" })
}

export function isProductionHost(hostname: string) {
  return hostname === "codeprint.app" || hostname === "www.codeprint.app"
}

export function sanitizeAnalyticsUrl(value: string) {
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  } catch {
    return ""
  }
}

/** Replay is never started in an editor or PDF preview surface. */
export function canReplayPath(pathname: string) {
  return ["/mcp", "/cli", "/about", "/docs", "/privacy", "/terms", "/changelog", "/blog"].includes(pathname)
}

export function canReplayUrl(value: string) {
  try {
    const url = new URL(value)
    return (
      url.protocol === "https:" &&
      !url.port &&
      isProductionHost(url.hostname) &&
      canReplayPath(url.pathname) &&
      !url.search &&
      !url.hash
    )
  } catch {
    return false
  }
}

export function hasTrackingOptOut(navigator: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true
}
