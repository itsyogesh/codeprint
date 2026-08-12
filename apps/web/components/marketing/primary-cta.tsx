import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PrimaryCtaProps {
  className?: string
  href: string
  label: string
  showArrow?: boolean
}

export function PrimaryCta({ className, href, label, showArrow = true }: PrimaryCtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        "primary-cta-motion group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-orange-500 to-orange-600 px-8 py-3.5 font-semibold text-white shadow-[0_16px_24px_rgba(249,115,22,0.3),inset_0_1px_0.3px_#FB923C,inset_0_-4px_0.3px_#C2410C] transition-[transform,filter,box-shadow] duration-150 ease-out hover:brightness-110 active:translate-y-[2px] active:shadow-[0_6px_12px_rgba(249,115,22,0.2),inset_0_1px_0.3px_#FB923C,inset_0_-2px_0.3px_#C2410C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 motion-reduce:transform-none dark:focus-visible:ring-offset-[#030712]",
        className,
      )}
    >
      {label}
      {showArrow ? (
        <ArrowRight
          className="primary-cta-arrow h-5 w-5 transition-transform duration-150 ease-out motion-reduce:transform-none"
          aria-hidden="true"
        />
      ) : null}
    </Link>
  )
}
