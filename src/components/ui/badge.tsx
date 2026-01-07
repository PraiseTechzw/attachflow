import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105 hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-primary/25",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary-hover hover:shadow-secondary/25",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:shadow-destructive/25",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80 hover:shadow-success/25",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80 hover:shadow-warning/25",
        gradient: "border-transparent bg-gradient-to-r from-primary to-chart-4 text-primary-foreground hover:from-primary-hover hover:to-chart-4 hover:shadow-lg animate-gradient-x",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
