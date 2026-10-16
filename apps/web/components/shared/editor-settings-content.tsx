import type { ReactNode } from "react"
import { DropdownMenuContent } from "@/components/ui/dropdown-menu"

export function EditorSettingsContent({ children }: { children: ReactNode }) {
  return (
    <DropdownMenuContent
      align="end"
      sideOffset={8}
      collisionPadding={12}
      className="max-h-[min(72dvh,var(--radix-dropdown-menu-content-available-height))] w-[calc(100vw-2rem)] max-w-96 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:w-96"
    >
      {children}
    </DropdownMenuContent>
  )
}
