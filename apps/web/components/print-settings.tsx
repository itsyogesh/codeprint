"use client"
import type { CodeSettings } from "@codeprint/core"
import { Laptop, Minus, Plus, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface PrintSettingsProps {
  settings: CodeSettings
  setSettings: (settings: CodeSettings) => void
}

export default function PrintSettings({ settings, setSettings }: PrintSettingsProps) {
  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  const incrementColumns = () => {
    if (settings.columns < 3) {
      handleChange("columns", settings.columns + 1)
    }
  }

  const decrementColumns = () => {
    if (settings.columns > 1) {
      handleChange("columns", settings.columns - 1)
    }
  }

  const incrementFontSize = () => {
    if (settings.fontSize < 24) {
      handleChange("fontSize", settings.fontSize + 1)
    }
  }

  const decrementFontSize = () => {
    if (settings.fontSize > 6) {
      handleChange("fontSize", settings.fontSize - 1)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-sm border-b pb-2 mb-4 text-orange-600 dark:text-orange-400">Print Settings</h3>

      <div className="space-y-4">
        {/* Line Numbers */}
        <div className="flex items-center justify-between">
          <Label htmlFor="lineNumbers" className="cursor-pointer">
            Line Numbers
          </Label>
          <Switch
            id="lineNumbers"
            checked={settings.lineNumbers}
            onCheckedChange={(checked) => handleChange("lineNumbers", checked)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:dark:bg-orange-500"
          />
        </div>

        {/* Syntax Highlighting */}
        <div className="flex items-center justify-between">
          <Label htmlFor="colorized" className="cursor-pointer">
            Syntax Highlighting
          </Label>
          <Switch
            id="colorized"
            checked={settings.colorized}
            onCheckedChange={(checked) => handleChange("colorized", checked)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:dark:bg-orange-500"
          />
        </div>

        {/* Header on all pages */}
        <div className="flex items-center justify-between">
          <Label htmlFor="showHeader" className="cursor-pointer">
            Header on All Pages
          </Label>
          <Switch
            id="showHeader"
            checked={settings.showHeader}
            onCheckedChange={(checked) => handleChange("showHeader", checked)}
            className="data-[state=checked]:bg-orange-600 data-[state=checked]:dark:bg-orange-500"
          />
        </div>

        {/* Font Size */}
        <div className="flex items-center justify-between">
          <Label htmlFor="fontSize">Font Size</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={decrementFontSize}
              aria-label="Decrease font size"
              disabled={settings.fontSize <= 6}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="relative w-20 shrink-0">
              <Input
                id="fontSize"
                type="number"
                min={6}
                max={24}
                value={settings.fontSize}
                onChange={(e) => handleChange("fontSize", Number.parseInt(e.target.value, 10) || 12)}
                className="pl-2 pr-7 text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">px</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={incrementFontSize}
              aria-label="Increase font size"
              disabled={settings.fontSize >= 24}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Columns */}
        <div className="flex items-center justify-between">
          <Label htmlFor="columns">Columns</Label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={decrementColumns}
              aria-label="Decrease columns"
              disabled={settings.columns <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              id="columns"
              type="number"
              min={1}
              max={3}
              value={settings.columns}
              onChange={(e) => handleChange("columns", Number.parseInt(e.target.value, 10) || 1)}
              className="w-16 text-center"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={incrementColumns}
              aria-label="Increase columns"
              disabled={settings.columns >= 3}
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
              aria-label="Portrait"
              aria-pressed={settings.orientation === "portrait"}
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
              aria-label="Landscape"
              aria-pressed={settings.orientation === "landscape"}
            >
              <Laptop className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Page Size */}
        <div className="flex items-center justify-between">
          <Label htmlFor="pageSize">Page Size</Label>
          <Select value={settings.pageSize} onValueChange={(value) => handleChange("pageSize", value)}>
            <SelectTrigger id="pageSize" className="w-32">
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
