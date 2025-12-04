"use client"

import * as React from "react"
import { Sidebar, SidebarSection } from "@/components/navigation/Sidebar"
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
    <div className={cn("flex min-h-screen", className)}>
      <Sidebar 
        sections={sections} 
        className="hidden lg:block border-r border-charcoal-100/50" 
      />

      <main className="flex-1 min-w-0 bg-white">
        <div className="container-premium py-10">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumb items={breadcrumbs} className="mb-8" />
          )}

          {(title || actions) && (
            <div className="flex items-center justify-between mb-10">
              <div>
                {title && (
                  <h1 className="font-heading text-[2.5rem] leading-tight font-bold text-charcoal-900">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-[15px] text-charcoal-500 mt-2 font-light">
                    {description}
                  </p>
                )}
              </div>
              {actions && <div className="flex items-center gap-4">{actions}</div>}
            </div>
          )}

          {children}
        </div>
      </main>
    </div>
  )
}
