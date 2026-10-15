"use client"

import type { MarkdownSettings } from "@codeprint/core"
import { FileText, Laptop, Minus, Plus, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface MarkdownSettingsProps {
  settings: MarkdownSettings
  setSettings: (settings: MarkdownSettings) => void
}

const PAPER_SIZES: Array<{
  value: MarkdownSettings["pageSize"]
  label: string
  dimensions: string
}> = [
  { value: "a4", label: "A4", dimensions: "210 × 297 mm" },
  { value: "letter", label: "Letter", dimensions: "8.5 × 11 in" },
  { value: "legal", label: "Legal", dimensions: "8.5 × 14 in" },
]

export default function MarkdownSettingsPanel({ settings, setSettings }: MarkdownSettingsProps) {
  const handleChange = <Key extends keyof MarkdownSettings>(key: Key, value: MarkdownSettings[Key]) => {
    setSettings({ ...settings, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div className="border-b border-slate-200 pb-3 dark:border-white/10">
        <h3 className="font-serif text-base font-bold text-slate-950 dark:text-white">Print settings</h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Every change repaginates the PDF preview.</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Paper size
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {PAPER_SIZES.map((paper) => {
            const selected = settings.pageSize === paper.value
            return (
              <button
                key={paper.value}
                type="button"
                onClick={() => handleChange("pageSize", paper.value)}
                aria-pressed={selected}
                className={cn(
                  "group flex min-w-0 flex-col items-center rounded-xl border px-2 py-2.5 text-center transition-[transform,box-shadow,border-color,background-color] hover:-translate-y-0.5 active:translate-y-px",
                  selected
                    ? "border-orange-400 bg-orange-50 text-orange-950 shadow-[0_3px_0_#fdba74] dark:border-orange-500/50 dark:bg-orange-500/10 dark:text-orange-100 dark:shadow-[0_3px_0_rgba(194,65,12,0.45)]"
                    : "border-slate-200 bg-white text-slate-700 shadow-[0_2px_0_#e2e8f0] hover:border-slate-300 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:shadow-[0_2px_0_rgba(255,255,255,0.08)]",
                )}
              >
                <FileText className={cn("mb-1 h-4 w-4", selected ? "text-orange-500" : "text-slate-400")} />
                <span className="text-xs font-bold">{paper.label}</span>
                <span className="mt-0.5 truncate text-[9px] text-slate-500 dark:text-slate-400">
                  {paper.dimensions}
                </span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Orientation
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "portrait" as const, label: "Portrait", Icon: Smartphone },
            { value: "landscape" as const, label: "Landscape", Icon: Laptop },
          ].map(({ value, label, Icon }) => {
            const selected = settings.orientation === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleChange("orientation", value)}
                aria-pressed={selected}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-bold transition-[transform,box-shadow,border-color,background-color] hover:-translate-y-0.5 active:translate-y-px",
                  selected
                    ? "border-orange-500 bg-orange-500 text-white shadow-[inset_0_-2px_0_#c2410c]"
                    : "border-slate-200 bg-white text-slate-700 shadow-[0_2px_0_#e2e8f0] dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:shadow-[0_2px_0_rgba(255,255,255,0.08)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="margins">Margins</Label>
          <Select
            value={settings.margins}
            onValueChange={(value) => handleChange("margins", value as MarkdownSettings["margins"])}
          >
            <SelectTrigger id="margins" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small · 10 mm</SelectItem>
              <SelectItem value="normal">Normal · 14 mm</SelectItem>
              <SelectItem value="wide">Wide · 20 mm</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="fontSize">Body size</Label>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange("fontSize", Math.max(8, settings.fontSize - 1))}
              disabled={settings.fontSize <= 8}
              aria-label="Decrease body font size"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <div className="relative w-20 shrink-0">
              <Input
                id="fontSize"
                type="number"
                min={8}
                max={24}
                value={settings.fontSize}
                onChange={(event) => handleChange("fontSize", Number.parseInt(event.target.value, 10) || 14)}
                className="h-8 pl-2 pr-6 text-center text-xs tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500">
                px
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleChange("fontSize", Math.min(24, settings.fontSize + 1))}
              disabled={settings.fontSize >= 24}
              aria-label="Increase body font size"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <FontSelect
          id="fontFamily"
          label="Body font"
          value={settings.fontFamily}
          onValueChange={(value) => handleChange("fontFamily", value)}
          options={["Mulish", "Merriweather"]}
        />
        <FontSelect
          id="headingFont"
          label="Heading font"
          value={settings.headingFont}
          onValueChange={(value) => handleChange("headingFont", value)}
          options={["Merriweather", "Mulish"]}
        />
        <FontSelect
          id="codeFont"
          label="Code font"
          value={settings.codeFont}
          onValueChange={(value) => handleChange("codeFont", value)}
          options={["Source Code Pro"]}
        />

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="codeBlockTheme">Code theme</Label>
          <Select
            value={settings.codeBlockTheme}
            onValueChange={(value) => handleChange("codeBlockTheme", value as MarkdownSettings["codeBlockTheme"])}
          >
            <SelectTrigger id="codeBlockTheme" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Paper light</SelectItem>
              <SelectItem value="dark">Ink dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
        <SettingSwitch
          id="showToc"
          label="Table of contents"
          checked={settings.showToc}
          onCheckedChange={(checked) => handleChange("showToc", checked)}
        />
        <SettingSwitch
          id="showHeader"
          label="Filename header"
          checked={settings.showHeader}
          onCheckedChange={(checked) => handleChange("showHeader", checked)}
        />
      </div>
    </div>
  )
}

function FontSelect({
  id,
  label,
  value,
  options,
  onValueChange,
}: {
  id: string
  label: string
  value: string
  options: string[]
  onValueChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function SettingSwitch({
  id,
  label,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={id} className="cursor-pointer">
        {label}
      </Label>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-orange-600"
      />
    </div>
  )
}
