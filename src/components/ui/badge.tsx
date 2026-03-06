import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Variantes personalizadas para probabilidad
        high: "bg-[#2d1b69] text-[#A78BFA] border-transparent",
        medium: "bg-orange-500/20 text-orange-400 border-transparent",
        low: "bg-zinc-500/20 text-zinc-400 border-transparent",
        // Variantes para estados de contacto (más grandes)
        cliente: "bg-[#2d1b69] text-[#A78BFA] border border-[#7C3AED]/30 rounded-md",
        lead: "bg-[#2d1b69] text-[#A78BFA] border border-[#7C3AED]/30 rounded-md",
        inactivo: "bg-zinc-800/50 text-zinc-400 border border-zinc-700 rounded-md",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-4 py-1.5 text-sm font-semibold",
        xl: "px-5 py-2 text-base font-semibold",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

