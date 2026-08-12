import { renderMermaidSVG } from "beautiful-mermaid"
import {
  type BeautifulMermaidAdapterOptions,
  type BeautifulMermaidColors,
  createBeautifulMermaidBlockRenderer,
} from "./beautiful-mermaid"

export const BEAUTIFUL_MERMAID_VERSION = "1.1.3"

export function renderCodeprintMermaidSvg(source: string, colors: Readonly<BeautifulMermaidColors>): string {
  return renderMermaidSVG(source, {
    ...colors,
    padding: 40,
    nodeSpacing: 24,
    layerSpacing: 40,
    componentSpacing: 24,
    transparent: false,
    interactive: false,
  })
}

export function createCodeprintMermaidBlockRenderer(options: BeautifulMermaidAdapterOptions = {}) {
  return createBeautifulMermaidBlockRenderer(renderCodeprintMermaidSvg, {
    rendererId: options.rendererId ?? "beautiful-mermaid",
    rendererVersion: options.rendererVersion ?? BEAUTIFUL_MERMAID_VERSION,
  })
}
