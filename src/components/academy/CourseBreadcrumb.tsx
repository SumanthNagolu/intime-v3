/**
 * Course Breadcrumb Component
 * Story: ACAD-021
 *
 * Shows navigation path: Course > Module > Topic
 */

'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CourseBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function CourseBreadcrumb({ items, className }: CourseBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2 text-sm', className)}>
      {/* Home Icon */}
      <Link
        href="/students/dashboard"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  'truncate max-w-[200px]',
                  isLast ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
