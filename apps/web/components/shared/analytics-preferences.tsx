"use client"

import { ANALYTICS_PREFERENCES_EVENT } from "@/lib/analytics-privacy"

export function AnalyticsPreferences() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(ANALYTICS_PREFERENCES_EVENT))}
      className="py-1.5 text-sm text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-orange-500 dark:text-slate-400 dark:hover:text-white"
    >
      Analytics preferences
    </button>
  )
}
