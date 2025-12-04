import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, ArrowRight } from "lucide-react"
import Link from "next/link"

interface QuickAction {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  variant?: "default" | "primary" | "premium"
}

interface QuickActionsWidgetProps {
  title?: string
  actions: QuickAction[]
  columns?: 2 | 3 | 4
  className?: string
}

export function QuickActionsWidget({
  title = "Quick Actions",
  actions,
  columns = 3,
  className,
}: QuickActionsWidgetProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("space-y-4", className)}>
      {title && (
        <h3 className="text-h4 text-charcoal-900">{title}</h3>
      )}

      <div className={cn("grid gap-4", gridCols[columns])}>
        {actions.map((action) => {
          const ActionIcon = action.icon
          const variantStyles = {
            default: "bg-white border-charcoal-100 hover:border-forest-200 hover:bg-forest-50/30",
            primary: "bg-forest-600 border-forest-600 text-white hover:bg-forest-700",
            premium: "bg-gradient-to-br from-gold-500 to-gold-600 border-gold-500 text-white hover:from-gold-600 hover:to-gold-700",
          }

          const content = (
            <>
              <div className={cn(
                "p-2.5 rounded-lg mb-3",
                action.variant === "default" || !action.variant
                  ? "bg-forest-50"
                  : "bg-white/20"
              )}>
                <ActionIcon className={cn(
                  "h-5 w-5",
                  action.variant === "default" || !action.variant
                    ? "text-forest-600"
                    : "text-current"
                )} />
              </div>
              <p className="font-medium mb-0.5">{action.label}</p>
              {action.description && (
                <p className={cn(
                  "text-xs",
                  action.variant === "default" || !action.variant
                    ? "text-charcoal-500"
                    : "text-white/80"
                )}>
                  {action.description}
                </p>
              )}
              <ArrowRight className={cn(
                "h-4 w-4 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity",
                action.variant === "default" || !action.variant
                  ? "text-forest-600"
                  : "text-current"
              )} />
            </>
          )

          const baseClasses = cn(
            "relative group p-4 rounded-xl border text-left transition-all duration-200 shadow-elevation-xs hover:shadow-elevation-sm",
            variantStyles[action.variant || "default"]
          )

          if (action.href) {
            return (
              <Link key={action.id} href={action.href} className={baseClasses}>
                {content}
              </Link>
            )
          }

          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={baseClasses}
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
  )
}
