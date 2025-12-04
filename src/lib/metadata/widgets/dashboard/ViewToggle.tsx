'use client';

/**
 * View Toggle Widget
 *
 * Renders a toggle button group for switching between different views (e.g., Table/Kanban).
 * Used in list screens to allow users to switch between different data presentations.
 */

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Table2, Kanban, List, Grid } from 'lucide-react';
import type { SectionDefinition } from '@/lib/metadata/types';

interface ViewConfig {
  id: string;
  label: string;
  icon?: string;
}

interface ViewToggleProps {
  /** Section definition from screen */
  definition: SectionDefinition;
  /** Widget data (not used but required by interface) */
  data?: Record<string, unknown>;
  /** Entity data (not used but required by interface) */
  entity?: Record<string, unknown>;
  /** Widget context */
  context?: {
    isLoading?: boolean;
    error?: Error | null;
  };
}

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  Table: Table2,
  Table2: Table2,
  Kanban: Kanban,
  List: List,
  Grid: Grid,
};

/**
 * View Toggle Widget Component
 */
export function ViewToggle({ definition }: ViewToggleProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract props from definition
  const props = definition.componentProps as {
    views?: ViewConfig[];
    activeView?: string;
    onToggle?: {
      type: 'navigate';
      routes: Record<string, string>;
    };
  } | undefined;

  const views = props?.views || [];
  const routes = props?.onToggle?.routes || {};

  // Determine active view based on current pathname
  const activeView = React.useMemo(() => {
    for (const [viewId, route] of Object.entries(routes)) {
      if (pathname === route || pathname.startsWith(route)) {
        return viewId;
      }
    }
    return props?.activeView || views[0]?.id || 'table';
  }, [pathname, routes, props?.activeView, views]);

  const handleToggle = (viewId: string) => {
    const route = routes[viewId];
    if (route) {
      router.push(route);
    }
  };

  if (views.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon ? ICONS[view.icon] : null;
        const isActive = activeView === view.id;

        return (
          <button
            key={view.id}
            onClick={() => handleToggle(view.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
              isActive
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
            )}
          >
            {Icon && <Icon size={16} />}
            {view.label}
          </button>
        );
      })}
    </div>
  );
}

export default ViewToggle;
