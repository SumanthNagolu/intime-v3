import * as React from "react"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link
        href="/"
        className="text-charcoal-500 hover:text-gold-500 transition-colors duration-300"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-charcoal-300" aria-hidden="true" />
          {item.href && !item.active ? (
            <Link
              href={item.href}
              className="text-charcoal-500 hover:text-gold-500 transition-colors duration-300 tracking-wide"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "tracking-wide",
                item.active ? "text-charcoal-900 font-semibold" : "text-charcoal-500"
              )}
              aria-current={item.active ? "page" : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
