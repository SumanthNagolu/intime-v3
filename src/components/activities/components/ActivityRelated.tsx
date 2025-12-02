/**
 * Activity Related
 *
 * Panel showing related entities and activities.
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import {
  ExternalLink, Plus, ChevronRight, Briefcase, User, FileText,
  Calendar, CheckCircle, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import { getStatusConfig, type ActivityStatus } from '@/lib/activities/transitions';
import type { Priority } from '@/lib/activities/sla';

// ==========================================
// TYPES
// ==========================================

export interface RelatedEntity {
  type: string;
  id: string;
  name: string;
  url: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface RelatedActivity {
  id: string;
  subject: string;
  patternId: string;
  status: ActivityStatus;
  priority: Priority;
  dueAt?: string;
}

export interface ActivityRelatedProps {
  /** Primary related entity */
  primaryEntity?: RelatedEntity;

  /** Related activities on the same entity */
  relatedActivities?: RelatedActivity[];

  /** Activity click handler */
  onActivityClick?: (activity: RelatedActivity) => void;

  /** Create related activity handler */
  onCreateRelated?: () => void;

  /** Navigate to entity */
  onEntityClick?: (entity: RelatedEntity) => void;

  /** Show all related activities */
  showAllActivities?: boolean;

  /** Maximum activities to show */
  maxActivities?: number;

  /** Additional className */
  className?: string;
}

// ==========================================
// HELPER COMPONENTS
// ==========================================

const ENTITY_ICONS: Record<string, typeof Briefcase> = {
  job: Briefcase,
  candidate: User,
  submission: FileText,
  account: Briefcase,
  lead: User,
  deal: FileText,
  default: FileText,
};

function EntityCard({
  entity,
  onClick,
}: {
  entity: RelatedEntity;
  onClick?: () => void;
}) {
  const Icon = ENTITY_ICONS[entity.type] || ENTITY_ICONS.default;

  return (
    <Card
      className={cn(
        'transition-colors cursor-pointer',
        'hover:border-primary hover:bg-primary/5'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground capitalize mb-0.5">
              {entity.type}
            </p>
            <p className="font-medium truncate">{entity.name}</p>
            {entity.status && (
              <Badge variant="outline" className="mt-1 text-xs">
                {entity.status}
              </Badge>
            )}
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

function RelatedActivityItem({
  activity,
  onClick,
}: {
  activity: RelatedActivity;
  onClick?: () => void;
}) {
  const pattern = getPattern(activity.patternId);
  const statusConfig = getStatusConfig(activity.status);
  const PatternIcon = pattern?.icon || CheckCircle;
  const isCompleted = activity.status === 'completed' || activity.status === 'cancelled';

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-2 rounded-lg text-left',
        'transition-colors hover:bg-muted/50',
        isCompleted && 'opacity-60'
      )}
    >
      <div className={cn(
        'p-1.5 rounded',
        pattern ? getCategoryColor(pattern.category) : 'bg-gray-100'
      )}>
        <PatternIcon className="h-3.5 w-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          isCompleted && 'line-through'
        )}>
          {activity.subject}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge
            variant="outline"
            className={cn('text-[10px] px-1', statusConfig.color)}
          >
            {statusConfig.label}
          </Badge>
          {activity.dueAt && !isCompleted && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(activity.dueAt), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ActivityRelated({
  primaryEntity,
  relatedActivities = [],
  onActivityClick,
  onCreateRelated,
  onEntityClick,
  showAllActivities = false,
  maxActivities = 5,
  className,
}: ActivityRelatedProps) {
  const [showAll, setShowAll] = React.useState(showAllActivities);

  // Split activities by status
  const openActivities = relatedActivities.filter(a =>
    a.status === 'pending' || a.status === 'in_progress'
  );
  const closedActivities = relatedActivities.filter(a =>
    a.status === 'completed' || a.status === 'cancelled' || a.status === 'deferred'
  );

  const displayedOpen = openActivities.slice(0, maxActivities);
  const displayedClosed = showAll ? closedActivities : closedActivities.slice(0, 2);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Primary Entity */}
      {primaryEntity && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Related {primaryEntity.type}
          </h4>
          <EntityCard
            entity={primaryEntity}
            onClick={() => onEntityClick?.(primaryEntity)}
          />
        </div>
      )}

      {/* Open Activities */}
      {openActivities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Open Activities ({openActivities.length})
            </h4>
          </div>
          <div className="space-y-1">
            {displayedOpen.map((activity) => (
              <RelatedActivityItem
                key={activity.id}
                activity={activity}
                onClick={() => onActivityClick?.(activity)}
              />
            ))}
            {openActivities.length > maxActivities && (
              <button
                className="w-full text-sm text-primary hover:underline py-2"
                onClick={() => setShowAll(true)}
              >
                Show {openActivities.length - maxActivities} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent/Closed Activities */}
      {closedActivities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Recent Activities
            </h4>
            {closedActivities.length > 2 && !showAll && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
              >
                View all
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {displayedClosed.map((activity) => (
              <RelatedActivityItem
                key={activity.id}
                activity={activity}
                onClick={() => onActivityClick?.(activity)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {relatedActivities.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No related activities</p>
        </div>
      )}

      {/* Create Related */}
      {onCreateRelated && (
        <>
          <Separator />
          <Button
            variant="outline"
            className="w-full"
            onClick={onCreateRelated}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Related Activity
          </Button>
        </>
      )}
    </div>
  );
}

export default ActivityRelated;
