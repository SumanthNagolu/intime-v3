'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { layoutTokens } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  content: React.ReactNode;
}

interface DetailLayoutProps {
  children?: React.ReactNode;
  /** Back button config */
  backButton?: {
    label?: string;
    href: string;
  };
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Entity header */
  header?: {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    status?: {
      label: string;
      variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    };
    actions?: React.ReactNode;
  };
  /** Tabs configuration (alternative to children) */
  tabs?: Tab[];
  /** Default active tab */
  defaultTab?: string;
  /** Right side panel content */
  sidePanel?: React.ReactNode;
  /** Show loading state */
  isLoading?: boolean;
  className?: string;
}

/**
 * Entity detail page layout
 * Provides back button, breadcrumbs, entity header, tabs, and optional side panel
 */
export function DetailLayout({
  children,
  backButton,
  breadcrumbs,
  header,
  tabs,
  defaultTab,
  sidePanel,
  isLoading,
  className,
}: DetailLayoutProps) {
  return (
    <div
      className={cn('min-h-full', className)}
      style={{
        padding: `${layoutTokens.page.paddingY}px ${layoutTokens.page.paddingX}px`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Breadcrumbs */}
        <div className="flex items-center gap-4 mb-4">
          {backButton && (
            <Link href={backButton.href}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft size={16} />
                {backButton.label || 'Back'}
              </Button>
            </Link>
          )}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <ChevronRight size={14} />}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground">{item.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        {/* Entity Header */}
        {header && (
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-7 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                {header.icon && (
                  <div className="w-12 h-12 bg-forest/10 rounded-xl flex items-center justify-center text-forest">
                    {header.icon}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-heading font-bold text-charcoal">
                      {header.title}
                    </h1>
                    {header.status && (
                      <Badge variant={header.status.variant || 'secondary'}>
                        {header.status.label}
                      </Badge>
                    )}
                  </div>
                  {header.subtitle && (
                    <p className="text-muted-foreground mt-1">
                      {header.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}
            {header.actions && (
              <div className="flex items-center gap-2">{header.actions}</div>
            )}
          </div>
        )}

        {/* Content Area with Optional Side Panel */}
        <div
          className={cn(
            'flex flex-col lg:flex-row gap-6',
            sidePanel && 'lg:gap-8'
          )}
        >
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {tabs && tabs.length > 0 ? (
              <Tabs defaultValue={defaultTab || tabs[0].id}>
                <TabsList className="mb-4">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="gap-2"
                    >
                      {tab.icon}
                      {tab.label}
                      {tab.badge !== undefined && (
                        <Badge
                          variant="secondary"
                          className="ml-1 h-5 px-1.5 text-xs"
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id}>
                    {isLoading ? (
                      <Skeleton className="h-[300px] w-full" />
                    ) : (
                      tab.content
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            ) : isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              children
            )}
          </div>

          {/* Side Panel */}
          {sidePanel && (
            <aside className="w-full lg:w-80 shrink-0">
              {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                sidePanel
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
