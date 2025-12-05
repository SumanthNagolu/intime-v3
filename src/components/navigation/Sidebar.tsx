"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  href?: string
  icon?: LucideIcon
  items?: SidebarItem[]
  badge?: string | number
}

export interface SidebarSection {
  title?: string
  items: SidebarItem[]
}

interface SidebarProps {
  sections: SidebarSection[]
  className?: string
}

export function Sidebar({ sections, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn("w-64 flex-shrink-0", className)}>
      <nav className="sticky top-0 p-6 space-y-6 max-h-[calc(100vh-4rem)] overflow-y-auto">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {section.title && (
              <h3 className="px-3 text-nav mb-3">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <SidebarNavItem
                  key={itemIndex}
                  item={item}
                  pathname={pathname}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function SidebarNavItem({ item, pathname, depth = 0 }: {
  item: SidebarItem
  pathname: string
  depth?: number
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.items && item.items.length > 0
  const isActive = item.href === pathname
  const Icon = item.icon

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasChildren && item.items?.some(child => child.href === pathname)) {
      setIsOpen(true)
    }
  }, [pathname, hasChildren, item.items])

  const content = (
    <span className="flex items-center gap-3 flex-1">
      {Icon && <Icon className="h-4 w-4" />}
      <span className="tracking-wide">{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full font-medium">
          {item.badge}
        </span>
      )}
    </span>
  )

  const baseClasses = cn(
    "flex items-center gap-2 px-3 py-2.5 rounded-sm text-sm transition-all duration-300",
    "hover:bg-charcoal-50 hover:text-gold-500",
    isActive && "bg-gold-50 text-gold-600 font-medium border-l-[3px] border-gold-500",
    !isActive && "text-charcoal-700",
    depth > 0 && "ml-4"
  )

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(baseClasses, "w-full justify-between")}
        >
          {content}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-charcoal-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-charcoal-400" />
          )}
        </button>
        {isOpen && (
          <ul className="mt-1 space-y-1">
            {item.items!.map((child, childIndex) => (
              <SidebarNavItem
                key={childIndex}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  if (item.href) {
    return (
      <li>
        <Link href={item.href} className={baseClasses}>
          {content}
        </Link>
      </li>
    )
  }

  return (
    <li>
      <span className={baseClasses}>{content}</span>
    </li>
  )
}
