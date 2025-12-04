'use client';

/**
 * Bench Dashboard Renderer
 *
 * A specialized renderer for bench sales dashboard that fetches all required
 * tRPC data from the bench router and passes it to widget components.
 */

import React from 'react';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition, RenderContext } from '@/lib/metadata/types';
import { LayoutRenderer } from '@/lib/metadata/renderers/LayoutRenderer';
import { cn } from '@/lib/utils';

// Import and register dashboard widgets
import '@/lib/metadata/widgets/register-widgets';

interface BenchDashboardRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

/**
 * Bench Dashboard Renderer Component
 */
export function BenchDashboardRenderer({ definition, className }: BenchDashboardRendererProps) {
  // Fetch all bench dashboard data using tRPC
  const benchHealth = trpc.bench.getBenchHealth.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const todaysPriorities = trpc.bench.getTodaysPriorities.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const myConsultants = trpc.bench.getMyConsultants.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const jobOrders = trpc.bench.getJobOrders.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const performanceMetrics = trpc.bench.getPerformanceMetrics.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const submissionPipeline = trpc.bench.getSubmissionPipeline.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const immigrationAlerts = trpc.bench.getImmigrationAlerts.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const marketingActivity = trpc.bench.getMarketingActivity.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const revenueCommission = trpc.bench.getRevenueCommission.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const activePlacements = trpc.bench.getActivePlacements.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Create data map for widgets
  const dataMap = {
    benchHealth: benchHealth.data,
    todaysPriorities: todaysPriorities.data,
    myConsultants: myConsultants.data,
    jobOrders: jobOrders.data,
    performanceMetrics: performanceMetrics.data,
    submissionPipeline: submissionPipeline.data,
    immigrationAlerts: immigrationAlerts.data,
    marketingActivity: marketingActivity.data,
    revenueCommission: revenueCommission.data,
    activePlacements: activePlacements.data,
  };

  // Overall loading state
  const isLoading = benchHealth.isLoading && todaysPriorities.isLoading;

  // Build render context with extended data property
  const context = {
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
    // Extended property for dashboard data
    dashboardData: dataMap,
    isLoading,
  } as RenderContext & { dashboardData: Record<string, unknown>; isLoading: boolean };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
            {typeof definition.title === 'string' ? definition.title : ''}
          </h1>
          {definition.subtitle && (
            <p className="mt-1 text-muted-foreground">
              {typeof definition.subtitle === 'string' ? definition.subtitle : ''}
            </p>
          )}
        </header>
      )}

      {/* Layout with data */}
      {definition.layout && (
        <LayoutRenderer
          definition={definition.layout}
          entity={{
            // Pass all bench data so paths resolve correctly
            ...dataMap,
            // Also map for legacy widget paths
            sprintProgress: benchHealth.data,
            tasks: todaysPriorities.data,
          }}
          isEditing={false}
          context={context as RenderContext}
        />
      )}
    </div>
  );
}

export default BenchDashboardRenderer;
