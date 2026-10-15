import { permanentRedirect } from "next/navigation"

export default function LegacyMarkdownPage() {
  permanentRedirect("/markdown")
}
