import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "dots" | "pulse" | "spinner"
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", variant = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-8 w-8", 
      lg: "h-12 w-12"
    }

    if (variant === "dots") {
      return (
        <div
          ref={ref}
          className={cn("flex items-center justify-center space-x-1", className)}
          {...props}
        >
          <div className={cn("bg-primary rounded-full animate-bounce", 
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
          )} style={{ animationDelay: "0ms" }} />
          <div className={cn("bg-primary rounded-full animate-bounce", 
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
          )} style={{ animationDelay: "150ms" }} />
          <div className={cn("bg-primary rounded-full animate-bounce", 
            size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
          )} style={{ animationDelay: "300ms" }} />
        </div>
      )
    }

    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={cn(
            "bg-primary rounded-full animate-pulse",
            sizeClasses[size],
            className
          )}
          {...props}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading }