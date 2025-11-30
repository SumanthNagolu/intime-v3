/**
 * PipelineTab Component
 *
 * Generic kanban-style pipeline visualization for workspace pages.
 * Works with any entity type that has stage-based workflows.
 */

'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronRight, MoreHorizontal, GripVertical, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface PipelineStage {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  description?: string;
}

export interface PipelineItem {
  id: string;
  [key: string]: unknown;
}

export interface PipelineTabProps<T extends PipelineItem> {
  items: T[];
  stages: PipelineStage[];
  getItemStage: (item: T) => string;
  renderItem: (item: T, isCompact: boolean) => ReactNode;
  onItemClick?: (item: T) => void;
  onStageChange?: (itemId: string, newStage: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

type ViewMode = 'kanban' | 'list';

// =====================================================
// STAGE COLUMN
// =====================================================

function StageColumn<T extends PipelineItem>({
  stage,
  items,
  renderItem,
  onItemClick,
  onStageChange,
  allStages,
}: {
  stage: PipelineStage;
  items: T[];
  renderItem: (item: T, isCompact: boolean) => ReactNode;
  onItemClick?: (item: T) => void;
  onStageChange?: (itemId: string, newStage: string) => void;
  allStages: PipelineStage[];
}) {
  return (
    <div className="flex-shrink-0 w-72">
      {/* Column Header */}
      <div
        className={cn(
          'px-3 py-2 rounded-t-lg border-b-2',
          stage.bgColor,
          stage.color.replace('text-', 'border-')
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{stage.label}</span>
            <Badge variant="secondary" className="text-xs">
              {items.length}
            </Badge>
          </div>
        </div>
        {stage.description && (
          <p className="text-xs text-muted-foreground mt-1">{stage.description}</p>
        )}
      </div>

      {/* Column Content */}
      <div className="bg-stone-50/50 rounded-b-lg p-2 min-h-[200px] space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm">No items</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-stone-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onItemClick?.(item)}
            >
              {/* Drag Handle + Content */}
              <div className="flex items-start gap-2">
                <GripVertical className="w-4 h-4 text-stone-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                <div className="flex-1 min-w-0">{renderItem(item, true)}</div>
                {/* Actions Menu */}
                {onStageChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {allStages
                        .filter((s) => s.id !== stage.id)
                        .map((targetStage) => (
                          <DropdownMenuItem
                            key={targetStage.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onStageChange(item.id, targetStage.id);
                            }}
                          >
                            <ChevronRight className="w-4 h-4 mr-2" />
                            Move to {targetStage.label}
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// =====================================================
// STAGE LIST VIEW
// =====================================================

function StageListView<T extends PipelineItem>({
  stages,
  itemsByStage,
  renderItem,
  onItemClick,
}: {
  stages: PipelineStage[];
  itemsByStage: Map<string, T[]>;
  renderItem: (item: T, isCompact: boolean) => ReactNode;
  onItemClick?: (item: T) => void;
}) {
  return (
    <div className="space-y-6">
      {stages.map((stage) => {
        const items = itemsByStage.get(stage.id) || [];
        if (items.length === 0) return null;

        return (
          <div key={stage.id}>
            {/* Stage Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-3 h-3 rounded-full', stage.bgColor)} />
              <h3 className={cn('font-semibold', stage.color)}>{stage.label}</h3>
              <Badge variant="secondary">{items.length}</Badge>
            </div>

            {/* Items */}
            <div className="space-y-2 pl-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-stone-200 p-4 hover:border-stone-300 transition-colors cursor-pointer"
                  onClick={() => onItemClick?.(item)}
                >
                  {renderItem(item, false)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function PipelineTab<T extends PipelineItem>({
  items,
  stages,
  getItemStage,
  renderItem,
  onItemClick,
  onStageChange,
  isLoading,
  emptyMessage = 'No items in pipeline',
  className,
}: PipelineTabProps<T>) {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Group items by stage
  const itemsByStage = new Map<string, T[]>();
  stages.forEach((stage) => itemsByStage.set(stage.id, []));

  items.forEach((item) => {
    const stageId = getItemStage(item);
    const stageItems = itemsByStage.get(stageId);
    if (stageItems) {
      stageItems.push(item);
    } else {
      // Item has unknown stage, put in first stage
      const firstStage = stages[0];
      if (firstStage) {
        itemsByStage.get(firstStage.id)?.push(item);
      }
    }
  });

  // Calculate totals per stage
  const stageCounts = stages.map((stage) => ({
    stage,
    count: itemsByStage.get(stage.id)?.length || 0,
  }));

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-16', className)}>
        <div className="animate-spin w-8 h-8 border-2 border-stone-200 border-t-rust rounded-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn('text-center py-16', className)}>
        <Eye className="w-12 h-12 mx-auto mb-4 text-stone-300" />
        <p className="text-stone-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with view toggle and stats */}
      <div className="flex items-center justify-between">
        {/* Stage Summary */}
        <div className="flex items-center gap-4">
          {stageCounts.map(({ stage, count }) => (
            <div key={stage.id} className="flex items-center gap-1.5 text-sm">
              <div className={cn('w-2 h-2 rounded-full', stage.bgColor)} />
              <span className="text-stone-600">{stage.label}:</span>
              <span className="font-semibold">{count}</span>
            </div>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-7"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              items={itemsByStage.get(stage.id) || []}
              renderItem={renderItem}
              onItemClick={onItemClick}
              onStageChange={onStageChange}
              allStages={stages}
            />
          ))}
        </div>
      ) : (
        <StageListView
          stages={stages}
          itemsByStage={itemsByStage}
          renderItem={renderItem}
          onItemClick={onItemClick}
        />
      )}
    </div>
  );
}

export default PipelineTab;
