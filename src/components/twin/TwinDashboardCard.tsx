'use client';

/**
 * Twin Dashboard Card Component
 *
 * Compact dashboard card for AI twin quick access.
 * Shows quick stats, recent events, and quick chat input.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  MessageCircle,
  Bell,
  ArrowUpRight,
  RefreshCw,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TwinEventItem } from './TwinEventFeed';

// ============================================================================
// TYPES
// ============================================================================

export interface TwinDashboardCardProps {
  /** User's role */
  userRole?: string;
  /** Card title */
  title?: string;
  /** Show quick chat input */
  showQuickChat?: boolean;
  /** Maximum events to show */
  maxEvents?: number;
  /** Link to full twin page */
  twinPageLink?: string;
  /** Additional class names */
  className?: string;
  /** Variant */
  variant?: 'default' | 'compact' | 'detailed';
}

interface QuickStats {
  pendingEvents: number;
  tasksCompleted: number;
  urgentItems: number;
  lastActivity: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TwinDashboardCard({
  userRole = 'employee',
  title = 'AI Twin',
  showQuickChat = true,
  maxEvents = 3,
  twinPageLink,
  className,
  variant = 'default',
}: TwinDashboardCardProps) {
  const [events, setEvents] = useState<TwinEventItem[]>([]);
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [quickInput, setQuickInput] = useState('');
  const [quickResponse, setQuickResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // Fetch events
      const eventsRes = await fetch('/api/twin/event');
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEvents((eventsData.events || []).slice(0, maxEvents));
      }

      // Calculate quick stats from events
      const allEvents = events;
      setStats({
        pendingEvents: allEvents.filter(e => !e.processed).length,
        tasksCompleted: allEvents.filter(e => e.processed).length,
        urgentItems: allEvents.filter(e => e.priority === 'critical' || e.priority === 'high').length,
        lastActivity: allEvents[0]?.createdAt || new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch twin data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleQuickAsk = useCallback(async () => {
    if (!quickInput.trim() || isLoading) return;

    setIsLoading(true);
    setQuickResponse(null);

    try {
      const response = await fetch('/api/twin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: quickInput }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuickResponse(data.response);
        setQuickInput('');
      }
    } catch (error) {
      console.error('Quick ask error:', error);
      setQuickResponse('Sorry, I could not process your request.');
    } finally {
      setIsLoading(false);
    }
  }, [quickInput, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuickAsk();
    }
  };

  const roleDisplay = userRole.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (variant === 'compact') {
    return (
      <CompactCard
        title={title}
        roleDisplay={roleDisplay}
        stats={stats}
        twinPageLink={twinPageLink}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-charcoal-200 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-forest-50 to-white border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-forest-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-charcoal-800">{title}</h3>
            <p className="text-xs text-charcoal-500">{roleDisplay}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </Button>
          {twinPageLink && (
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={twinPageLink}>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {stats && variant === 'detailed' && (
        <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-charcoal-100 bg-charcoal-25">
          <QuickStatItem
            icon={Bell}
            label="Pending"
            value={stats.pendingEvents}
            color={stats.pendingEvents > 0 ? 'warning' : 'success'}
          />
          <QuickStatItem
            icon={CheckCircle}
            label="Done"
            value={stats.tasksCompleted}
            color="success"
          />
          <QuickStatItem
            icon={AlertCircle}
            label="Urgent"
            value={stats.urgentItems}
            color={stats.urgentItems > 0 ? 'error' : 'success'}
          />
          <QuickStatItem
            icon={Clock}
            label="Active"
            value={formatTimeAgo(stats.lastActivity)}
            color="default"
          />
        </div>
      )}

      {/* Recent Events */}
      {events.length > 0 && (
        <div className="px-4 py-3 border-b border-charcoal-100">
          <h4 className="text-xs font-medium text-charcoal-500 mb-2">Recent Activity</h4>
          <div className="space-y-2">
            {events.map(event => (
              <EventMiniCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Response */}
      {quickResponse && (
        <div className="px-4 py-3 bg-forest-50 border-b border-charcoal-100">
          <p className="text-sm text-charcoal-700">{quickResponse}</p>
          <button
            className="text-xs text-charcoal-500 mt-1 hover:text-charcoal-700"
            onClick={() => setQuickResponse(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Quick Chat Input */}
      {showQuickChat && (
        <div className="p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Quick question..."
              className={cn(
                'flex-1 text-sm rounded-lg border border-charcoal-200 px-3 py-2',
                'placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-500'
              )}
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={handleQuickAsk}
              disabled={!quickInput.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function CompactCard({
  title,
  roleDisplay,
  stats,
  twinPageLink,
  className,
}: {
  title: string;
  roleDisplay: string;
  stats: QuickStats | null;
  twinPageLink?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-charcoal-200 p-3 flex items-center justify-between',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-forest-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-forest-600" />
        </div>
        <div>
          <h3 className="font-medium text-sm text-charcoal-800">{title}</h3>
          <p className="text-xs text-charcoal-500">{roleDisplay}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {stats && stats.pendingEvents > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Bell className="w-3 h-3 mr-1" />
            {stats.pendingEvents}
          </Badge>
        )}
        {twinPageLink && (
          <Button variant="outline" size="sm" asChild>
            <a href={twinPageLink}>
              <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
              Chat
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

function QuickStatItem({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: 'success' | 'warning' | 'error' | 'default';
}) {
  const colorClasses = {
    success: 'text-success-600',
    warning: 'text-warning-600',
    error: 'text-error-600',
    default: 'text-charcoal-600',
  };

  return (
    <div className="text-center">
      <Icon className={cn('w-4 h-4 mx-auto mb-0.5', colorClasses[color])} />
      <div className={cn('text-lg font-semibold', colorClasses[color])}>
        {value}
      </div>
      <div className="text-xs text-charcoal-500">{label}</div>
    </div>
  );
}

function EventMiniCard({ event }: { event: TwinEventItem }) {
  const priorityColors = {
    critical: 'border-l-error-500',
    high: 'border-l-warning-500',
    medium: 'border-l-forest-500',
    low: 'border-l-charcoal-300',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-1.5 px-2 rounded-r bg-charcoal-50 border-l-2',
        priorityColors[event.priority]
      )}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-charcoal-700 truncate">{event.title}</p>
      </div>
      {!event.processed && (
        <span className="w-2 h-2 rounded-full bg-forest-500 shrink-0" />
      )}
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export default TwinDashboardCard;
