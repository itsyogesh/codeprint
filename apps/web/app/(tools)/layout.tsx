import { AppRoot } from "@/components/shared/app-root"

export { metadata, viewport } from "@/components/shared/app-root"

// Includes the homepage editor, all languages, Markdown, CSV and PDF previews.
// This root is never given a Clarity project ID.
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <AppRoot>{children}</AppRoot>
}
