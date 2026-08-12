"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { FontOption } from "@/lib/fonts"

const STORAGE_KEY = "codeprint-selected-fonts"

interface StoredFontPreferences {
  codeFont?: string
  bodyFont?: string
  headingFont?: string
}

// Module-level cache shared across all hook instances
const loadedFontsCache = new Set<string>()
const loadingPromises = new Map<string, Promise<void>>()

function buildGoogleFontsUrl(fontName: string, weights: number[]): string {
  const family = fontName.replace(/ /g, "+")
  const weightStr = weights.join(";")
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weightStr}&display=swap`
}

async function fetchAndLoadFont(fontName: string, weights: number[]): Promise<void> {
  const url = buildGoogleFontsUrl(fontName, weights)

  // Fetch the CSS from Google Fonts
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch font CSS for "${fontName}": ${response.status}`)
  }

  const css = await response.text()

  // Parse @font-face blocks to extract src URLs and their corresponding font-weight
  const fontFaceRegex = /@font-face\s*\{([^}]+)\}/g
  const srcRegex = /src:\s*url\(([^)]+)\)/
  const weightRegex = /font-weight:\s*(\d+)/
  const styleRegex = /font-style:\s*(\w+)/

  const fontFaces: FontFace[] = []
  let match: RegExpExecArray | null

  match = fontFaceRegex.exec(css)
  while (match !== null) {
    const block = match[1]
    const srcMatch = srcRegex.exec(block)
    const weightMatch = weightRegex.exec(block)
    const styleMatch = styleRegex.exec(block)

    if (srcMatch) {
      const fontUrl = srcMatch[1]
      const weight = weightMatch ? weightMatch[1] : "400"
      const style = styleMatch ? styleMatch[1] : "normal"

      const fontFace = new FontFace(fontName, `url(${fontUrl})`, {
        weight,
        style,
        display: "swap",
      })

      fontFaces.push(fontFace)
    }

    match = fontFaceRegex.exec(css)
  }

  // Load all font faces in parallel
  const loadedFaces = await Promise.all(fontFaces.map((face) => face.load()))

  // Add to document.fonts
  for (const face of loadedFaces) {
    document.fonts.add(face)
  }
}

function getStoredPreferences(): StoredFontPreferences {
  if (typeof window === "undefined") return {}
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function setStoredPreferences(prefs: StoredFontPreferences): void {
  if (typeof window === "undefined") return
  try {
    const existing = getStoredPreferences()
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...prefs }))
  } catch {
    // Ignore localStorage errors
  }
}

export function useFontLoader() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(() => new Set(loadedFontsCache))
  const activeLoads = useRef(0)

  // Sync local state with module-level cache on mount
  useEffect(() => {
    if (loadedFontsCache.size > 0) {
      setLoadedFonts(new Set(loadedFontsCache))
    }
  }, [])

  const loadFont = useCallback(async (fontName: string, weights?: number[]) => {
    // Skip loading for system fonts and inherit
    if (fontName === "system-ui" || fontName === "inherit") {
      return
    }

    // Already loaded
    if (loadedFontsCache.has(fontName)) {
      return
    }

    // Already loading -- wait for the existing promise
    if (loadingPromises.has(fontName)) {
      await loadingPromises.get(fontName)
      return
    }

    const resolvedWeights = weights ?? [400, 700]

    activeLoads.current++
    setIsLoading(true)

    const promise = fetchAndLoadFont(fontName, resolvedWeights)
      .then(() => {
        loadedFontsCache.add(fontName)
        setLoadedFonts(new Set(loadedFontsCache))
      })
      .catch((error) => {
        console.error(`Failed to load font "${fontName}":`, error)
      })
      .finally(() => {
        loadingPromises.delete(fontName)
        activeLoads.current--
        if (activeLoads.current === 0) {
          setIsLoading(false)
        }
      })

    loadingPromises.set(fontName, promise)

    await promise
  }, [])

  return {
    loadFont,
    isLoading,
    loadedFonts,
    getStoredPreferences,
    setStoredPreferences,
  }
}

export function findFontOption(fonts: FontOption[], value: string): FontOption | undefined {
  return fonts.find((f) => f.value === value)
}
