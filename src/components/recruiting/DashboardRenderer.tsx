'use client';

/**
 * Dashboard Renderer
 *
 * A specialized renderer for dashboard screens that fetches all required
 * tRPC data and passes it to widget components.
 */

import React from 'react';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition, SectionDefinition, RenderContext } from '@/lib/metadata/types';
import { LayoutRenderer } from '@/lib/metadata/renderers/LayoutRenderer';
import { cn } from '@/lib/utils';

// Import and register dashboard widgets
import '@/lib/metadata/widgets/register-widgets';

interface DashboardRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

/**
 * Maps section component names to their tRPC procedure names
 */
const WIDGET_DATA_MAP: Record<string, string> = {
  SprintProgressWidget: 'getSprintProgress',
  ActivityQueueWidget: 'getTasks',
  TaskQueueWidget: 'getTasks',
  AlertList: 'getPipelineHealth',
  PipelineAlerts: 'getPipelineHealth',
  CalendarWidget: 'getUpcomingCalendar',
  UpcomingCalendar: 'getUpcomingCalendar',
  WinsList: 'getRecentWins',
  RecentWins: 'getRecentWins',
  AccountHealth: 'getAccountHealth',
  ActivitySummary: 'getActivitySummary',
  QualityMetrics: 'getQualityMetrics',
};

/**
 * Dashboard Renderer Component
 */
export function DashboardRenderer({ definition, className }: DashboardRendererProps) {
  // Fetch all dashboard data using tRPC
  const sprintProgress = trpc.dashboard.getSprintProgress.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const tasks = trpc.dashboard.getTasks.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const pipelineHealth = trpc.dashboard.getPipelineHealth.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const accountHealth = trpc.dashboard.getAccountHealth.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every minute
  });

  const activitySummary = trpc.dashboard.getActivitySummary.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const qualityMetrics = trpc.dashboard.getQualityMetrics.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const upcomingCalendar = trpc.dashboard.getUpcomingCalendar.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const recentWins = trpc.dashboard.getRecentWins.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Create data map for widgets
  const dataMap: Record<string, { data: unknown; isLoading: boolean; error: unknown }> = {
    getSprintProgress: sprintProgress,
    getTasks: tasks,
    getPipelineHealth: pipelineHealth,
    getAccountHealth: accountHealth,
    getActivitySummary: activitySummary,
    getQualityMetrics: qualityMetrics,
    getUpcomingCalendar: upcomingCalendar,
    getRecentWins: recentWins,
  };

  // Build context with data for each widget
  const buildSectionContext = (section: SectionDefinition): Partial<RenderContext> => {
    const componentName = section.component;
    if (!componentName) return {};

    const procedureName = WIDGET_DATA_MAP[componentName];
    if (!procedureName) return {};

    const queryResult = dataMap[procedureName];
    if (!queryResult) return {};

    return {
      data: queryResult.data as Record<string, unknown>,
      isLoading: queryResult.isLoading,
      error: queryResult.error ? String(queryResult.error) : null,
    };
  };

  // Recursively add context to sections
  const enrichLayoutWithData = (layout: ScreenDefinition['layout']): ScreenDefinition['layout'] => {
    if (!layout) return layout;

    // Handle sections at the layout level
    if ('sections' in layout && Array.isArray(layout.sections)) {
      return {
        ...layout,
        sections: layout.sections.map((section) => ({
          ...section,
          // Store context data in section for SectionRenderer to use
          _context: buildSectionContext(section),
        })),
      };
    }

    // Handle columns layout
    if (layout.type === 'columns' && 'columns' in layout) {
      return {
        ...layout,
        columns: layout.columns.map((col) => ({
          ...col,
          sections: col.sections?.map((section) => ({
            ...section,
            _context: buildSectionContext(section),
          })),
        })),
      };
    }

    // Handle grid layout
    if (layout.type === 'grid' && 'areas' in layout) {
      return {
        ...layout,
        areas: layout.areas.map((area) => ({
          ...area,
          sections: area.sections?.map((section) => ({
            ...section,
            _context: buildSectionContext(section),
          })),
        })),
      };
    }

    return layout;
  };

  // Create enriched definition
  const enrichedLayout = enrichLayoutWithData(definition.layout);

  // Overall loading state
  const isLoading =
    sprintProgress.isLoading &&
    tasks.isLoading &&
    pipelineHealth.isLoading;

  // Build render context
  const context: Partial<RenderContext> = {
    entity: {},
    entityType: 'dashboard',
    entityId: '',
    relatedData: new Map(),
    user: {
      id: '',
      email: '',
      fullName: '',
      role: '',
      permissions: [],
    },
    permissions: [],
    roles: [],
    params: {},
    query: {},
    computed: new Map(),
    navigate: () => {},
    showToast: () => {},
    // Pass all data for widgets to access
    data: {
      sprintProgress: sprintProgress.data,
      tasks: tasks.data,
      pipelineHealth: pipelineHealth.data,
      accountHealth: accountHealth.data,
      activitySummary: activitySummary.data,
      qualityMetrics: qualityMetrics.data,
      upcomingCalendar: upcomingCalendar.data,
      recentWins: recentWins.data,
    } as unknown as Record<string, unknown>,
    isLoading,
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('dashboard', className)}>
      {/* Header */}
      {definition.title && (
        <header className="mb-6">
          <h1 className="text-2xl font-bold">
            {typeof definition.title === 'string' ? definition.title : String(definition.title.default ?? '')}
          </h1>
          {definition.subtitle && (
            <p className="mt-1 text-muted-foreground">
              {typeof definition.subtitle === 'string' ? definition.subtitle : String(definition.subtitle.default ?? '')}
            </p>
          )}
        </header>
      )}

      {/* Layout with enriched sections */}
      <LayoutRenderer
        definition={enrichedLayout}
        entity={{}}
        isEditing={false}
        context={context as RenderContext}
      />
    </div>
  );
}

export default DashboardRenderer;
