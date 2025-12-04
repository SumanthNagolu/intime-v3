"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, LucideIcon } from "lucide-react"
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
    <aside className={cn("w-[300px] flex-shrink-0 bg-cream", className)}>
      <nav className="sticky top-24 px-8 py-10">
        <div className="space-y-10">
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {section.title && (
                <div className="mb-5">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-charcoal-400">
                    {section.title}
                  </h3>
                  <div className="w-5 h-[2px] bg-rust-500 mt-2" />
                </div>
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
        </div>
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
    <span className="flex items-center gap-4 flex-1">
      {Icon && (
        <Icon 
          className={cn(
            "h-4 w-4 flex-shrink-0 transition-colors duration-200",
            isActive ? "text-forest-600" : "text-charcoal-400"
          )} 
          strokeWidth={1.5}
        />
      )}
      <span className={cn(
        "transition-colors duration-200",
        depth > 0 && "font-heading text-[14px]"
      )}>
        {item.label}
      </span>
      {item.badge && (
        <span className="ml-auto text-[10px] font-medium bg-rust-50 text-rust-600 px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </span>
  )

  const baseClasses = cn(
    "flex items-center gap-4 py-3 text-[15px] font-medium transition-colors duration-200",
    "hover:text-forest-700",
    isActive 
      ? "text-forest-600 font-semibold" 
      : "text-charcoal-600",
    depth > 0 && "pl-8 text-[14px] font-normal text-charcoal-500 hover:text-charcoal-800"
  )

  if (hasChildren) {
    return (
      <li>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(baseClasses, "w-full justify-between group")}
        >
          {content}
          <ChevronDown 
            className={cn(
              "h-3.5 w-3.5 text-charcoal-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )} 
            strokeWidth={1.5}
          />
        </button>
        <div 
          className={cn(
            "overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <ul className="mt-2 space-y-0.5 border-l border-charcoal-100 ml-2">
            {item.items!.map((child, childIndex) => (
              <SidebarNavItem
                key={childIndex}
                item={child}
                pathname={pathname}
                depth={depth + 1}
              />
            ))}
          </ul>
        </div>
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
