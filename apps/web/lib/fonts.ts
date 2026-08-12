export interface FontOption {
  name: string
  value: string
  weights: number[]
  category: "monospace" | "serif" | "sans-serif"
}

export const CODE_FONTS: FontOption[] = [
  { name: "JetBrains Mono", value: "JetBrains Mono", weights: [400, 700], category: "monospace" },
  { name: "Fira Code", value: "Fira Code", weights: [400, 700], category: "monospace" },
  { name: "Source Code Pro", value: "Source Code Pro", weights: [400, 700], category: "monospace" },
  { name: "Roboto Mono", value: "Roboto Mono", weights: [400, 700], category: "monospace" },
  { name: "IBM Plex Mono", value: "IBM Plex Mono", weights: [400, 700], category: "monospace" },
  { name: "Inconsolata", value: "Inconsolata", weights: [400, 700], category: "monospace" },
  { name: "Ubuntu Mono", value: "Ubuntu Mono", weights: [400, 700], category: "monospace" },
  { name: "Anonymous Pro", value: "Anonymous Pro", weights: [400, 700], category: "monospace" },
]

export const BODY_FONTS: FontOption[] = [
  { name: "System Default", value: "system-ui", weights: [400, 700], category: "sans-serif" },
  { name: "Inter", value: "Inter", weights: [400, 500, 600, 700], category: "sans-serif" },
  { name: "Roboto", value: "Roboto", weights: [400, 500, 700], category: "sans-serif" },
  { name: "Open Sans", value: "Open Sans", weights: [400, 600, 700], category: "sans-serif" },
  { name: "Lora", value: "Lora", weights: [400, 500, 600, 700], category: "serif" },
  { name: "Merriweather", value: "Merriweather", weights: [400, 700], category: "serif" },
  { name: "PT Serif", value: "PT Serif", weights: [400, 700], category: "serif" },
  { name: "Noto Sans", value: "Noto Sans", weights: [400, 500, 700], category: "sans-serif" },
]

export const HEADING_FONTS: FontOption[] = [
  { name: "Same as Body", value: "inherit", weights: [], category: "sans-serif" },
  ...BODY_FONTS.filter((f) => f.value !== "system-ui"),
]
