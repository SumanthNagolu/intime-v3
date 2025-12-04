'use client';

/**
 * Deal Pipeline Renderer
 *
 * A specialized renderer for deal pipeline screens that fetches pipeline data
 * and passes it to the KanbanBoard and metrics widgets.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition, RenderContext } from '@/lib/metadata/types';
import { SectionRenderer } from '@/lib/metadata/renderers/SectionRenderer';
import { cn } from '@/lib/utils';
import { Briefcase, DollarSign, Target, BarChart, Calendar, Plus, TrendingUp, Download, Table } from 'lucide-react';

// Import and register widgets
import '@/lib/metadata/widgets/register-widgets';

interface DealPipelineRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

/**
 * Deal card in the kanban board
 */
interface DealCardData {
  id: string;
  title: string | null;
  name: string | null;
  description: string | null;
  value: string | null;
  currency: string | null;
  stage: string;
  probability: number | null;
  dealType: string | null;
  expectedCloseDate: Date | null;
  ownerId: string;
  accountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Format date for display
 */
function formatDate(date: Date | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get stage color class
 */
function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    discovery: 'bg-blue-500',
    qualification: 'bg-indigo-500',
    proposal: 'bg-purple-500',
    negotiation: 'bg-amber-500',
    closed_won: 'bg-green-500',
  };
  return colors[stage] || 'bg-gray-500';
}

/**
 * Kanban Column Component
 */
function KanbanColumn({
  stage,
  title,
  deals,
  columnStats,
  onDealClick,
  onDragOver,
  onDrop,
}: {
  stage: string;
  title: string;
  deals: DealCardData[];
  columnStats: { count: number; totalValue: number; weightedValue: number };
  onDealClick: (deal: DealCardData) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: string) => void;
}) {
  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="flex-shrink-0 w-72 bg-stone-100 dark:bg-stone-800 rounded-lg"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage)}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', getStageColor(stage))} />
            <span className="font-medium text-sm">{title}</span>
          </div>
          <span className="text-xs text-muted-foreground bg-stone-200 dark:bg-stone-700 px-2 py-0.5 rounded">
            {columnStats.count}
          </span>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <div>Total: {formatCurrency(columnStats.totalValue)}</div>
          <div>Weighted: {formatCurrency(columnStats.weightedValue)}</div>
        </div>
      </div>

      {/* Deal Cards */}
      <div className="p-2 space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {deals.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No deals in this stage
          </div>
        ) : (
          deals.map((deal) => (
            <div
              key={deal.id}
              draggable
              onDragStart={(e) => handleDragStart(e, deal.id)}
              onClick={() => onDealClick(deal)}
              className="bg-card p-3 rounded-lg border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            >
              <h4 className="font-medium text-sm truncate">{deal.title || deal.name}</h4>

              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span className="font-medium text-foreground">
                    {formatCurrency(parseFloat(deal.value || '0'))}
                  </span>
                </div>

                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Close: {formatDate(deal.expectedCloseDate)}</span>
                  </div>
                )}

                {deal.probability !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Target className="w-3 h-3" />
                    <span>{deal.probability}% likely</span>
                  </div>
                )}
              </div>

              {deal.dealType && (
                <div className="mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                    {deal.dealType.replace('_', ' ')}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Metrics Card Component
 */
function MetricCard({
  label,
  value,
  icon: Icon,
  format = 'number',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  format?: 'number' | 'currency';
}) {
  const displayValue = format === 'currency' ? formatCurrency(value) : value.toString();

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{displayValue}</div>
    </div>
  );
}

/**
 * Deal Pipeline Renderer Component
 */
export function DealPipelineRenderer({ definition, className }: DealPipelineRendererProps) {
  const router = useRouter();

  // Fetch pipeline data
  const { data: pipelineData, isLoading, error, refetch } = trpc.crm.deals.pipelineStats.useQuery(undefined, {
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Stage update mutation
  const updateStageMutation = trpc.crm.deals.updateStage.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Handle deal click
  const handleDealClick = (deal: DealCardData) => {
    router.push(`/employee/recruiting/deals/${deal.id}`);
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('dealId');

    if (dealId && newStage) {
      try {
        await updateStageMutation.mutateAsync({
          id: dealId,
          stage: newStage as 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
        });
      } catch (err) {
        console.error('Failed to update deal stage:', err);
      }
    }
  };

  // Handle actions
  const handleNewDeal = () => {
    router.push('/employee/recruiting/deals/new');
  };

  const handleViewForecast = () => {
    router.push('/employee/crm/deals/forecast');
  };

  const handleTableView = () => {
    router.push('/employee/recruiting/deals?view=table');
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="grid grid-cols-5 gap-4 mb-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-72 h-96 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <h2 className="text-lg font-semibold text-red-800">Error loading pipeline</h2>
        <p className="mt-2 text-red-700">{error.message}</p>
      </div>
    );
  }

  const { summary, deals, columnStats } = pipelineData || {
    summary: { totalDeals: 0, totalValue: 0, weightedValue: 0, avgDealSize: 0, closingThisMonth: 0 },
    deals: { discovery: [], qualification: [], proposal: [], negotiation: [] },
    columnStats: {
      discovery: { count: 0, totalValue: 0, weightedValue: 0 },
      qualification: { count: 0, totalValue: 0, weightedValue: 0 },
      proposal: { count: 0, totalValue: 0, weightedValue: 0 },
      negotiation: { count: 0, totalValue: 0, weightedValue: 0 },
    },
  };

  const stages = [
    { id: 'discovery', title: 'Discovery' },
    { id: 'qualification', title: 'Qualification' },
    { id: 'proposal', title: 'Proposal' },
    { id: 'negotiation', title: 'Negotiation' },
  ];

  return (
    <div className={cn('deal-pipeline', className)}>
      {/* Header */}
      <header className="mb-6">
        {/* Breadcrumbs */}
        <nav className="mb-2">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <button onClick={() => router.push('/employee/workspace')} className="hover:text-foreground">
                Workspace
              </button>
            </li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <button onClick={() => router.push('/employee/crm')} className="hover:text-foreground">
                CRM
              </button>
            </li>
            <li className="flex items-center gap-2">
              <span>/</span>
              <span>Deal Pipeline</span>
            </li>
          </ol>
        </nav>

        {/* Title and actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{typeof definition.title === 'string' ? definition.title : 'Deal Pipeline'}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNewDeal}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Deal
            </button>
            <button
              onClick={handleViewForecast}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              View Forecast
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleTableView}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-muted hover:bg-muted/80 flex items-center gap-2"
            >
              <Table className="w-4 h-4" />
              Table View
            </button>
          </div>
        </div>
      </header>

      {/* Pipeline Summary Metrics */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <MetricCard
          label="Total Deals"
          value={summary.totalDeals}
          icon={Briefcase}
          format="number"
        />
        <MetricCard
          label="Pipeline Value"
          value={summary.totalValue}
          icon={DollarSign}
          format="currency"
        />
        <MetricCard
          label="Weighted Value"
          value={summary.weightedValue}
          icon={Target}
          format="currency"
        />
        <MetricCard
          label="Avg Deal Size"
          value={summary.avgDealSize}
          icon={BarChart}
          format="currency"
        />
        <MetricCard
          label="Closing This Month"
          value={summary.closingThisMonth}
          icon={Calendar}
          format="currency"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage.id}
            title={stage.title}
            deals={(deals[stage.id] || []) as DealCardData[]}
            columnStats={columnStats[stage.id] || { count: 0, totalValue: 0, weightedValue: 0 }}
            onDealClick={handleDealClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </div>
  );
}

export default DealPipelineRenderer;
