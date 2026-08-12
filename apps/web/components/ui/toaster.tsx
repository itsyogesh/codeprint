"use client"

import { AlertTriangle, Check, Download, Info } from "lucide-react"
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => {
        const tone = variant ?? "default"
        const isDownload = typeof title === "string" && /download/i.test(title)
        const Icon =
          tone === "destructive" ? AlertTriangle : tone === "success" ? (isDownload ? Download : Check) : Info
        const iconClass =
          tone === "destructive"
            ? "border-red-200 bg-red-50 text-red-600 shadow-[0_2px_0_#fecaca] dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:shadow-[0_2px_0_rgba(153,27,27,0.45)]"
            : tone === "info" || tone === "default"
              ? "border-sky-200 bg-sky-50 text-sky-600 shadow-[0_2px_0_#bae6fd] dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-400 dark:shadow-[0_2px_0_rgba(3,105,161,0.45)]"
              : "border-orange-200 bg-orange-50 text-orange-600 shadow-[0_2px_0_#fed7aa] dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-400 dark:shadow-[0_2px_0_rgba(194,65,12,0.45)]"

        return (
          <Toast
            key={id}
            variant={variant}
            role={tone === "destructive" ? "alert" : "status"}
            aria-live={tone === "destructive" ? "assertive" : "polite"}
            aria-atomic="true"
            {...props}
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${iconClass}`}
              aria-hidden="true"
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="grid min-w-0 flex-1 gap-0.5 py-0.5">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
