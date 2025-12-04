'use client';

/**
 * Marketing Profiles Renderer
 *
 * A specialized renderer for the marketing profiles list page that fetches
 * data from the bench router and passes it to widget components.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition, RenderContext } from '@/lib/metadata/types';
import { LayoutRenderer } from '@/lib/metadata/renderers/LayoutRenderer';
import { cn } from '@/lib/utils';
import { Plus, Wand2, Download, Loader2 } from 'lucide-react';

// Import and register dashboard widgets
import '@/lib/metadata/widgets/register-widgets';

interface MarketingProfilesRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

/**
 * Marketing Profiles Renderer Component
 */
export function MarketingProfilesRenderer({ definition, className }: MarketingProfilesRendererProps) {
  const router = useRouter();

  // Fetch marketing profiles stats
  const statsQuery = trpc.bench.marketingProfiles.getStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Fetch marketing profiles list
  const profilesQuery = trpc.bench.marketingProfiles.list.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Create data map for widgets
  const dataMap = {
    marketingProfiles: profilesQuery.data,
    stats: statsQuery.data?.stats,
  };

  // Overall loading state
  const isLoading = statsQuery.isLoading || profilesQuery.isLoading;

  // Build render context with extended data property
  const context = {
    entity: {},
    entityType: 'marketing_profile',
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
    navigate: (path: string) => router.push(path),
    showToast: () => {},
    // Extended property for dashboard data
    dashboardData: dataMap,
    isLoading,
  } as RenderContext & { dashboardData: Record<string, unknown>; isLoading: boolean };

  // Get title and subtitle from definition
  const title = typeof definition.title === 'string' ? definition.title : 'Marketing Profiles';
  const subtitle = typeof definition.subtitle === 'string' ? definition.subtitle : undefined;

  // Get breadcrumbs from definition
  const breadcrumbs = definition.navigation?.breadcrumbs || [
    { label: 'Workspace', route: '/employee/workspace' },
    { label: 'Bench Sales', route: '/employee/bench' },
    { label: 'Marketing Profiles' },
  ];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-12 bg-muted rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Get stats from query
  const stats = statsQuery.data?.stats || { total: 0, active: 0, draft: 0, needsUpdate: 0 };

  return (
    <div className={cn('marketing-profiles-renderer space-y-6', className)}>
      {/* Header */}
      <header>
        {/* Breadcrumbs */}
        <nav className="mb-2">
          <ol className="flex items-center gap-2 text-sm text-stone-500">
            {breadcrumbs.map((crumb, index) => {
              const label = typeof crumb.label === 'string' ? crumb.label : '';
              const route = 'route' in crumb && typeof crumb.route === 'string' ? crumb.route : undefined;
              return (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <span>/</span>}
                  {route ? (
                    <Link href={route} className="hover:text-stone-900">
                      {label}
                    </Link>
                  ) : (
                    <span className="text-stone-900">{label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{title}</h1>
            {subtitle && <p className="mt-1 text-stone-500">{subtitle}</p>}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/employee/bench/marketing/new"
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-rust text-white hover:bg-rust/90"
            >
              <Plus size={16} />
              Create Profile
            </Link>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-stone-100 hover:bg-stone-200"
            >
              <Wand2 size={16} />
              Bulk Generate
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 bg-stone-100 hover:bg-stone-200"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Total Profiles
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {stats.total}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">Active</div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">Drafts</div>
          <div className="mt-1 text-2xl font-bold text-stone-600">
            {stats.draft}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">Needs Update</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {stats.needsUpdate}
          </div>
        </div>
      </div>

      {/* Layout with data - render custom sections */}
      {definition.layout && (
        <LayoutRenderer
          definition={definition.layout}
          entity={{
            ...dataMap,
            // Map stats for metrics-grid section
            stats: statsQuery.data?.stats,
          }}
          isEditing={false}
          context={context as RenderContext}
        />
      )}
    </div>
  );
}

export default MarketingProfilesRenderer;
