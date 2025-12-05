import * as React from "react"
import { Sidebar, SidebarSection } from "@/components/navigation/Sidebar"
import { PortalHeader } from "@/components/navigation/PortalHeader"
import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: React.ReactNode
  sections: SidebarSection[]
  breadcrumbs?: BreadcrumbItem[]
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function SidebarLayout({
  children,
  sections,
  breadcrumbs,
  title,
  description,
  actions,
  className,
}: SidebarLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      <PortalHeader />
      
      <div className="flex flex-1">
        <Sidebar sections={sections} className="hidden lg:block border-r border-charcoal-100 bg-white" />

        <main className="flex-1 min-w-0">
          <div className="container-premium py-8">
            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb items={breadcrumbs} className="mb-6" />
            )}

            {(title || actions) && (
              <div className="flex items-center justify-between mb-8">
                <div>
                  {title && <h1 className="text-h2 text-charcoal-900">{title}</h1>}
                  {description && <p className="text-body text-charcoal-600 mt-1">{description}</p>}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
              </div>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
