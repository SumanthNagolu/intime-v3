/**
 * ActivityTab Component
 *
 * Full-page activity timeline tab for workspace pages.
 * Wraps the ActivityPanel with tab-specific layout and filters.
 */

'use client';

import React, { useState } from 'react';
import { Filter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActivityPanel } from '../base/ActivityPanel';
import type { EntityType } from '@/lib/workspace/entity-registry';
import type { RCAIEntityTypeType } from '@/lib/db/schema/raci';

// =====================================================
// TYPES
// =====================================================

export interface ActivityTabProps {
  entityType: EntityType;
  entityId: string;
  canCompose?: boolean;
  showFilters?: boolean;
  className?: string;
}

type ActivityFilter = 'all' | 'call' | 'email' | 'meeting' | 'note' | 'task' | 'follow_up';

// Map EntityType to RCAIEntityTypeType
const entityTypeToRCAI: Partial<Record<EntityType, RCAIEntityTypeType>> = {
  lead: 'lead',
  account: 'account',
  deal: 'deal',
  job: 'job',
  talent: 'candidate',
  submission: 'submission',
  contact: 'contact',
  job_order: 'job_order',
  employee: 'candidate', // fallback
  pod: 'job', // fallback
  onboarding: 'submission', // fallback
  performance: 'submission', // fallback
  timeoff: 'submission', // fallback
  payroll: 'submission', // fallback
  benefit_plan: 'deal', // fallback
  compliance: 'deal', // fallback
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function ActivityTab({
  entityType,
  entityId,
  canCompose = true,
  showFilters = true,
  className,
}: ActivityTabProps) {
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const rcaiEntityType = entityTypeToRCAI[entityType];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // The ActivityPanel will refetch on mount, so we just toggle state
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className={className}>
      {/* Header */}
      {showFilters && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-charcoal">Activity Timeline</h3>
            <Badge variant="secondary" className="text-xs">
              All Activity
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter(v as ActivityFilter)}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="follow_up">Follow-ups</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      )}

      {/* Activity Panel - expanded for full tab view */}
      <div className="bg-white rounded-lg border border-border">
        {rcaiEntityType ? (
          <ActivityPanel
            entityType={rcaiEntityType}
            entityId={entityId}
            canEdit={canCompose}
            collapsed={false}
            className="min-h-[400px]"
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            Activity tracking not available for this entity type
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivityTab;
