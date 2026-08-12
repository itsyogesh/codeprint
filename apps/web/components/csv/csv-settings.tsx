"use client"

import type { CSVSettings } from "@codeprint/core"
import { Laptop, Minus, Plus, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface CSVSettingsProps {
  settings: CSVSettings
  setSettings: (settings: CSVSettings) => void
}

export default function CSVSettingsPanel({ settings, setSettings }: CSVSettingsProps) {
  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const incrementFontSize = () => {
    if (settings.fontSize < 24) {
      handleChange("fontSize", settings.fontSize + 1)
    }
  }

  const decrementFontSize = () => {
    if (settings.fontSize > 8) {
      handleChange("fontSize", settings.fontSize - 1)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm border-b pb-2 mb-4 text-orange-600 dark:text-orange-400">CSV Settings</h3>

      <div className="space-y-4">
        {/* Has Header Row */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hasHeaderRow" className="cursor-pointer">
            Has Header Row
          </Label>
          <Switch
            id="hasHeaderRow"
            checked={settings.hasHeaderRow}
            onCheckedChange={(checked) => handleChange("hasHeaderRow", checked)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:dark:bg-orange-500"
          />
        </div>

        {/* Alternating Colors */}
        <div className="flex items-center justify-between">
          <Label htmlFor="alternatingColors" className="cursor-pointer">
            Alternating Colors
          </Label>
          <Switch
            id="alternatingColors"
            checked={settings.alternatingColors}
            onCheckedChange={(checked) => handleChange("alternatingColors", checked)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:dark:bg-orange-500"
          />
        </div>

        {/* Header on all pages */}
        <div className="flex items-center justify-between">
          <Label htmlFor="csvShowHeader" className="cursor-pointer">
            Header on All Pages
          </Label>
          <Switch
            id="csvShowHeader"
            checked={settings.showHeader}
            onCheckedChange={(checked) => handleChange("showHeader", checked)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:dark:bg-orange-500"
          />
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between">
          <Label htmlFor="csvFontSize">Font Size</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={decrementFontSize}
              disabled={settings.fontSize <= 8}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="relative w-16">
              <Input
                id="csvFontSize"
                type="number"
                min={8}
                max={24}
                value={settings.fontSize}
                onChange={(e) =>
                  handleChange("fontSize", Math.min(24, Math.max(8, Number.parseInt(e.target.value, 10) || 12)))
                }
                className="text-center pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">px</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={incrementFontSize}
              disabled={settings.fontSize >= 24}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Page Orientation */}
        <div className="flex items-center justify-between">
          <Label>Page Orientation</Label>
          <div className="flex space-x-2">
            <button
              type="button"
              className={`flex items-center justify-center p-3 rounded-md cursor-pointer border ${
                settings.orientation === "portrait"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => handleChange("orientation", "portrait")}
            >
              <Smartphone className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={`flex items-center justify-center p-3 rounded-md cursor-pointer border ${
                settings.orientation === "landscape"
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => handleChange("orientation", "landscape")}
            >
              <Laptop className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page Size */}
        <div className="flex items-center justify-between">
          <Label htmlFor="csvPageSize">Page Size</Label>
          <Select value={settings.pageSize} onValueChange={(value) => handleChange("pageSize", value)}>
            <SelectTrigger id="csvPageSize" className="w-32">
              <SelectValue placeholder="Select page size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
