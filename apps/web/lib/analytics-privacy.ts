export const ANALYTICS_CONSENT_KEY = "codeprint.analytics.v1"
export const ANALYTICS_PREFERENCES_EVENT = "codeprint:analytics-preferences"

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
