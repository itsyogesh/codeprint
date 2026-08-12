import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-[color,background-color,border-color,box-shadow,transform,filter] duration-150 ease-out hover:-translate-y-0.5 active:translate-y-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 motion-reduce:transform-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-3px_0_#c2410c] hover:brightness-105 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.24),inset_0_-1px_0_#c2410c]",
        contrast:
          "bg-slate-950 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-3px_0_#020617] hover:bg-slate-900 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_#020617] dark:bg-white dark:text-slate-950 dark:shadow-[inset_0_1px_0_#fff,inset_0_-3px_0_#cbd5e1] dark:hover:bg-slate-100 dark:active:shadow-[inset_0_1px_0_#fff,inset_0_-1px_0_#cbd5e1]",
        destructive:
          "bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-3px_0_#b91c1c] hover:brightness-105 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-1px_0_#b91c1c]",
        outline:
          "border border-input bg-background text-foreground shadow-[0_2px_0_hsl(var(--border))] hover:bg-accent hover:text-accent-foreground active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_-2px_0_hsl(var(--border))] hover:bg-secondary/80 active:shadow-none",
        ghost: "shadow-none hover:translate-y-0 hover:bg-accent hover:text-accent-foreground active:translate-y-0",
        link: "rounded-none text-primary underline-offset-4 shadow-none hover:translate-y-0 hover:underline active:translate-y-0",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
