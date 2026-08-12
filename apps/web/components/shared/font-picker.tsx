"use client"

import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { findFontOption, useFontLoader } from "@/hooks/use-font-loader"
import type { FontOption } from "@/lib/fonts"

interface FontPickerProps {
  fonts: FontOption[]
  value: string
  onChange: (value: string) => void
  label?: string
}

export default function FontPicker({ fonts, value, onChange, label }: FontPickerProps) {
  const { loadFont, isLoading, loadedFonts } = useFontLoader()

  // Load the currently selected font on mount / when value changes
  useEffect(() => {
    const font = findFontOption(fonts, value)
    if (font) {
      loadFont(font.value, font.weights)
    }
  }, [value, fonts, loadFont])

  const handleChange = (newValue: string) => {
    const font = findFontOption(fonts, newValue)
    if (font) {
      loadFont(font.value, font.weights)
    }
    onChange(newValue)
  }

  const isFontLoading = (fontValue: string): boolean => {
    if (fontValue === "system-ui" || fontValue === "inherit") return false
    return !loadedFonts.has(fontValue) && isLoading
  }

  return (
    <div className="flex items-center justify-between">
      {label && <Label className="text-sm shrink-0">{label}</Label>}
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger className="w-44">
          <div className="flex items-center gap-2 overflow-hidden">
            {isFontLoading(value) && <Loader2 className="h-3 w-3 animate-spin shrink-0 text-orange-500" />}
            <SelectValue placeholder="Select font" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span className="flex items-center gap-2">
                <span>{font.name}</span>
                {font.value !== "system-ui" &&
                  font.value !== "inherit" &&
                  !loadedFonts.has(font.value) &&
                  isLoading && <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
