import { AppRoot } from "@/components/shared/app-root"

export { metadata, viewport } from "@/components/shared/app-root"

// An independent root layout forces a full document load when entering a tool.
// Never put a shared app/layout.tsx above these roots: replay listeners must die.
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <AppRoot marketing>{children}</AppRoot>
}
