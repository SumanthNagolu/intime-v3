'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { layoutTokens } from '@/lib/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Page title displayed in header */
  title?: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Actions to display in header (buttons, etc.) */
  actions?: React.ReactNode;
  /** Show loading skeleton */
  isLoading?: boolean;
  /** Optional back button or breadcrumbs */
  navigation?: React.ReactNode;
  className?: string;
}

/**
 * Standard page layout wrapper
 * Provides consistent page header (title, subtitle, actions) and content area
 */
export function PageLayout({
  children,
  title,
  subtitle,
  actions,
  isLoading,
  navigation,
  className,
}: PageLayoutProps) {
  return (
    <div
      className={cn('min-h-full', className)}
      style={{
        padding: `${layoutTokens.page.paddingY}px ${layoutTokens.page.paddingX}px`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Navigation (back button, breadcrumbs) */}
        {navigation && <div className="mb-4">{navigation}</div>}

        {/* Page Header */}
        {(title || actions) && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </>
              ) : (
                <>
                  {title && (
                    <h1 className="text-2xl font-heading font-bold text-charcoal">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-muted-foreground mt-1">{subtitle}</p>
                  )}
                </>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}

        {/* Page Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
