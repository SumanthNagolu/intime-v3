import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  variant?: "default" | "success" | "warning" | "error"
  className?: string
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  className,
}: StatsCardProps) {
  const TrendIcon = change
    ? change > 0
      ? TrendingUp
      : change < 0
        ? TrendingDown
        : Minus
    : null

  const trendColor = change
    ? change > 0
      ? "text-success-600"
      : change < 0
        ? "text-error-600"
        : "text-charcoal-500"
    : ""

  const variantStyles = {
    default: "border-charcoal-100",
    success: "border-l-4 border-l-success-500 border-charcoal-100",
    warning: "border-l-4 border-l-warning-500 border-charcoal-100",
    error: "border-l-4 border-l-error-500 border-charcoal-100",
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border p-6 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-caption text-charcoal-500 mb-1">{title}</p>
          <p className="text-h2 text-charcoal-900">{value}</p>

          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2", trendColor)}>
              {TrendIcon && <TrendIcon className="h-4 w-4" />}
              <span className="text-sm font-medium">
                {change > 0 ? "+" : ""}{change}%
              </span>
              {changeLabel && (
                <span className="text-charcoal-500 text-sm">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {Icon && (
          <div className="p-3 bg-forest-50 rounded-lg">
            <Icon className="h-6 w-6 text-forest-600" />
          </div>
        )}
      </div>
    </div>
  )
}
