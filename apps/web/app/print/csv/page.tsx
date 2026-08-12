import { permanentRedirect } from "next/navigation"

export default function LegacyCsvPage() {
  permanentRedirect("/csv")
}
