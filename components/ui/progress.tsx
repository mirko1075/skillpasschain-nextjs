"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // Ensure we have valid numbers
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
    const safeMax = typeof max === 'number' && max > 0 ? max : 100
    const percentage = Math.min(100, Math.max(0, (safeValue / safeMax) * 100))
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
          className
        )}
        role="progressbar"
        aria-valuenow={safeValue}
        aria-valuemax={safeMax}
        aria-valuemin={0}
        {...props}
      >
        <div
          className="h-full bg-primary transition-all duration-200 ease-in-out"
          style={{ 
            width: `${percentage}%`
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }