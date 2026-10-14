export const ANALYTICS_CONSENT_KEY = "codeprint.analytics.v1"
export const ANALYTICS_PREFERENCES_EVENT = "codeprint:analytics-preferences"

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

export function hasTrackingOptOut(navigator: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return navigator.doNotTrack === "1" || navigator.globalPrivacyControl === true
}
