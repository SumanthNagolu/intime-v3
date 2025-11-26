'use client';

/**
 * Twin Event Feed Component
 *
 * Displays events from the twin event bus.
 * Shows cross-pillar notifications and alerts.
 */

import React from 'react';
import {
  Bell,
  Users,
  Briefcase,
  GraduationCap,
  Handshake,
  AlertTriangle,
  Trophy,
  TrendingUp,
  Check,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TwinRole } from '@/types/productivity';

// ============================================================================
// TYPES
// ============================================================================

export interface TwinEventItem {
  id: string;
  eventType: string;
  sourceRole: TwinRole;
  targetRole: TwinRole | null;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  processed: boolean;
  createdAt: string;
  payload?: Record<string, unknown>;
}

export interface TwinEventFeedProps {
  /** Events to display */
  events: TwinEventItem[];
  /** Called when event is marked as processed */
  onMarkProcessed?: (eventId: string) => void;
  /** Called when event is clicked */
  onEventClick?: (event: TwinEventItem) => void;
  /** Maximum height */
  maxHeight?: string;
  /** Show empty state */
  showEmptyState?: boolean;
  /** Additional class names */
  className?: string;
  /** Compact mode */
  compact?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TwinEventFeed({
  events,
  onMarkProcessed,
  onEventClick,
  maxHeight = '400px',
  showEmptyState = true,
  className,
  compact = false,
}: TwinEventFeedProps) {
  const sortedEvents = [...events].sort((a, b) => {
    // Sort by priority first, then by date
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  if (events.length === 0 && showEmptyState) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
          <Bell className="w-6 h-6 text-charcoal-400" />
        </div>
        <p className="text-charcoal-500 text-sm">No events to display</p>
        <p className="text-charcoal-400 text-xs mt-1">
          Cross-pillar activities will appear here
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn('overflow-y-auto', className)}
      style={{ maxHeight }}
    >
      <div className="space-y-2">
        {sortedEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onMarkProcessed={onMarkProcessed}
            onClick={onEventClick}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function EventCard({
  event,
  onMarkProcessed,
  onClick,
  compact,
}: {
  event: TwinEventItem;
  onMarkProcessed?: (eventId: string) => void;
  onClick?: (event: TwinEventItem) => void;
  compact: boolean;
}) {
  const Icon = getEventIcon(event.eventType);
  const iconColor = getEventIconColor(event.priority);
  const timeAgo = formatTimeAgo(event.createdAt);

  return (
    <div
      className={cn(
        'rounded-lg border border-charcoal-100 bg-white p-3 transition-all',
        'hover:border-charcoal-200 hover:shadow-sm',
        event.processed && 'opacity-60',
        onClick && 'cursor-pointer',
        compact ? 'p-2' : 'p-3'
      )}
      onClick={() => onClick?.(event)}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'rounded-full p-2 shrink-0',
            iconColor
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-medium text-charcoal-800 truncate',
                compact ? 'text-xs' : 'text-sm'
              )}>
                {event.title}
              </p>
              {!compact && event.description && (
                <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>

            {/* Priority Badge */}
            {event.priority !== 'medium' && (
              <PriorityBadge priority={event.priority} />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs text-charcoal-400">
              <span className="capitalize">{event.sourceRole.replace('_', ' ')}</span>
              {event.targetRole && (
                <>
                  <span>→</span>
                  <span className="capitalize">{event.targetRole.replace('_', ' ')}</span>
                </>
              )}
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>

            {/* Mark as processed */}
            {!event.processed && onMarkProcessed && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkProcessed(event.id);
                }}
              >
                <Check className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: TwinEventItem['priority'] }) {
  const variants: Record<typeof priority, { className: string; label: string }> = {
    critical: { className: 'bg-error-100 text-error-700 border-error-200', label: 'Critical' },
    high: { className: 'bg-warning-100 text-warning-700 border-warning-200', label: 'High' },
    medium: { className: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200', label: 'Medium' },
    low: { className: 'bg-charcoal-50 text-charcoal-500 border-charcoal-100', label: 'Low' },
  };

  const { className, label } = variants[priority];

  return (
    <Badge
      variant="outline"
      className={cn('text-xs px-1.5 py-0 h-5', className)}
    >
      {label}
    </Badge>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getEventIcon(eventType: string) {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    placement_complete: Briefcase,
    bench_ending: Clock,
    training_graduate: GraduationCap,
    deal_closed: Handshake,
    escalation: AlertTriangle,
    approval_needed: Bell,
    milestone_reached: Trophy,
    cross_sell_opportunity: TrendingUp,
    custom: Bell,
  };

  return icons[eventType] || Bell;
}

function getEventIconColor(priority: TwinEventItem['priority']): string {
  const colors: Record<typeof priority, string> = {
    critical: 'bg-error-100 text-error-600',
    high: 'bg-warning-100 text-warning-600',
    medium: 'bg-forest-100 text-forest-600',
    low: 'bg-charcoal-100 text-charcoal-500',
  };

  return colors[priority];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default TwinEventFeed;
