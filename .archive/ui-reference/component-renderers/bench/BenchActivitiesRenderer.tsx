'use client';

/**
 * Bench Activities Renderer
 *
 * A specialized renderer for the bench activities list screen that fetches
 * activity stats and list data from tRPC and renders the complete UI.
 */

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition, RenderContext } from '@/lib/metadata/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  CheckCircle,
  Download,
  AlertTriangle,
  Clock,
  Play,
  Calendar,
  Search,
  UserSearch,
  UserCog,
  Megaphone,
  Send,
  Globe,
  Building2,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

// Import and register dashboard widgets
import '@/lib/metadata/widgets/register-widgets';

interface BenchActivitiesRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Activity pattern definitions for Quick Create buttons
interface ActivityPattern {
  id: string;
  label: string;
  icon: LucideIcon;
  activityType: string;
}

const ACTIVITY_PATTERNS: ActivityPattern[] = [
  { id: 'source_consultant', label: 'Source Consultant', icon: UserSearch, activityType: 'task' },
  { id: 'update_profile', label: 'Update Profile', icon: UserCog, activityType: 'task' },
  { id: 'market_consultant', label: 'Market Consultant', icon: Megaphone, activityType: 'task' },
  { id: 'submit_requirement', label: 'Submit to Requirement', icon: Send, activityType: 'submission' },
  { id: 'update_availability', label: 'Update Availability', icon: Calendar, activityType: 'task' },
  { id: 'immigration_check', label: 'Immigration Check', icon: Globe, activityType: 'review' },
  { id: 'vendor_followup', label: 'Vendor Follow-up', icon: Building2, activityType: 'follow_up' },
  { id: 'close_placement', label: 'Close Placement', icon: CheckCircle, activityType: 'task' },
];

// Activity type colors
const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  task: 'hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700',
  call: 'hover:bg-green-50 hover:border-green-200 hover:text-green-700',
  email: 'hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700',
  meeting: 'hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700',
  follow_up: 'hover:bg-cyan-50 hover:border-cyan-200 hover:text-cyan-700',
  submission: 'hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700',
  review: 'hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700',
};

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  open: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  skipped: 'bg-stone-100 text-stone-500',
  cancelled: 'bg-red-100 text-red-700',
};

// Priority badge colors
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-red-100 text-red-700',
};

// SLA status colors
const SLA_COLORS: Record<string, string> = {
  on_track: 'bg-green-500',
  at_risk: 'bg-amber-500',
  breached: 'bg-red-500',
};

/**
 * Bench Activities Renderer Component
 */
export function BenchActivitiesRenderer({ definition, className }: BenchActivitiesRendererProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    type: [] as string[],
    status: [] as string[],
    priority: [] as string[],
    showCompleted: false,
  });

  // Fetch activity stats
  const stats = trpc.activities.benchStats.useQuery(undefined, {
    refetchInterval: 30000,
  });

  // Fetch activities list
  const activitiesList = trpc.activities.benchActivities.useQuery(
    {
      search: filters.search || undefined,
      showCompleted: filters.showCompleted,
      limit: 25,
      offset: 0,
    },
    {
      refetchInterval: 30000,
    }
  );

  // Mutations
  const startActivity = trpc.activities.start.useMutation({
    onSuccess: () => {
      utils.activities.benchActivities.invalidate();
      utils.activities.benchStats.invalidate();
    },
  });

  const completeActivity = trpc.activities.complete.useMutation({
    onSuccess: () => {
      utils.activities.benchActivities.invalidate();
      utils.activities.benchStats.invalidate();
    },
  });

  const cancelActivity = trpc.activities.cancel.useMutation({
    onSuccess: () => {
      utils.activities.benchActivities.invalidate();
      utils.activities.benchStats.invalidate();
    },
  });

  // Handlers
  const handlePatternClick = useCallback((pattern: ActivityPattern) => {
    // Navigate to create activity page with pattern pre-filled
    router.push(`/employee/bench/activities/new?pattern=${pattern.id}&type=${pattern.activityType}`);
  }, [router]);

  const handleStartActivity = useCallback((activityId: string) => {
    startActivity.mutate({ id: activityId });
  }, [startActivity]);

  const handleCompleteActivity = useCallback((activityId: string) => {
    completeActivity.mutate({ id: activityId });
  }, [completeActivity]);

  const handleRefresh = useCallback(() => {
    utils.activities.benchActivities.invalidate();
    utils.activities.benchStats.invalidate();
  }, [utils]);

  // Loading state
  const isLoading = stats.isLoading && activitiesList.isLoading;

  if (isLoading) {
    return (
      <div className={cn('animate-pulse space-y-6', className)}>
        <div className="h-8 bg-muted rounded w-1/3 mb-4" />
        <div className="h-4 bg-muted rounded w-1/4 mb-8" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-8 gap-2 mt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const statsData = stats.data ?? { overdue: 0, dueToday: 0, inProgress: 0, completedToday: 0 };
  const activities = activitiesList.data?.items ?? [];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {typeof definition.title === 'string' ? definition.title : 'My Activities'}
          </h1>
          {definition.subtitle && (
            <p className="mt-1 text-muted-foreground">
              {typeof definition.subtitle === 'string' ? definition.subtitle : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="default">
            <Plus className="w-4 h-4 mr-2" />
            New Activity
          </Button>
          <Button variant="outline">
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Selected
          </Button>
          <Button variant="ghost">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Overdue
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            {statsData.overdue}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Clock className="w-4 h-4 text-amber-500" />
            Due Today
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {statsData.dueToday}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <Play className="w-4 h-4 text-purple-500" />
            In Progress
          </div>
          <div className="mt-1 text-2xl font-bold text-purple-600">
            {statsData.inProgress}
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Completed Today
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {statsData.completedToday}
          </div>
        </div>
      </div>

      {/* Quick Create Patterns */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Quick Create</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {ACTIVITY_PATTERNS.map((pattern) => {
            const Icon = pattern.icon;
            const colorClass = ACTIVITY_TYPE_COLORS[pattern.activityType] || ACTIVITY_TYPE_COLORS.task;
            return (
              <Button
                key={pattern.id}
                variant="outline"
                onClick={() => handlePatternClick(pattern)}
                className={cn(
                  'flex flex-col items-center justify-center h-auto py-3 px-2 gap-2',
                  'transition-all duration-200 border-stone-200',
                  colorClass
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">
                  {pattern.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 py-4 border-y border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.type[0] || 'all'}
          onValueChange={(value) => setFilters((prev) => ({
            ...prev,
            type: value === 'all' ? [] : [value],
          }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="task">Task</SelectItem>
            <SelectItem value="follow_up">Follow-up</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.status[0] || 'all'}
          onValueChange={(value) => setFilters((prev) => ({
            ...prev,
            status: value === 'all' ? [] : [value],
          }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority[0] || 'all'}
          onValueChange={(value) => setFilters((prev) => ({
            ...prev,
            priority: value === 'all' ? [] : [value],
          }))}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.showCompleted}
            onChange={(e) => setFilters((prev) => ({
              ...prev,
              showCompleted: e.target.checked,
            }))}
            className="rounded border-stone-300"
          />
          Show Completed
        </label>
      </div>

      {/* Activities Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-[40px] px-4 py-3"></th>
              <th className="w-[40px] px-4 py-3"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subject
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Related To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Due
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                  {activitiesList.isLoading ? (
                    'Loading activities...'
                  ) : (
                    <div className="space-y-2">
                      <p>No activities found</p>
                      <p className="text-sm">Create your first activity using the Quick Create buttons above</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr
                  key={activity.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {/* Priority Indicator */}
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        PRIORITY_COLORS[activity.priority] || 'bg-stone-200'
                      )}
                      title={activity.priority}
                    />
                  </td>
                  {/* SLA Status Indicator */}
                  <td className="px-4 py-3">
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full',
                        SLA_COLORS[activity.slaStatus] || 'bg-stone-200'
                      )}
                      title={`SLA: ${activity.slaStatus}`}
                    />
                  </td>
                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      activity.activityType === 'call' && 'bg-green-100 text-green-700',
                      activity.activityType === 'email' && 'bg-blue-100 text-blue-700',
                      activity.activityType === 'meeting' && 'bg-purple-100 text-purple-700',
                      activity.activityType === 'task' && 'bg-stone-100 text-stone-700',
                      activity.activityType === 'follow_up' && 'bg-amber-100 text-amber-700',
                    )}>
                      {activity.activityType.replace('_', ' ')}
                    </span>
                  </td>
                  {/* Subject */}
                  <td className="px-4 py-3">
                    <span className="font-medium">{activity.subject || 'No subject'}</span>
                  </td>
                  {/* Related To */}
                  <td className="px-4 py-3">
                    <a
                      href={activity.entityLink}
                      className="text-primary hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(activity.entityLink);
                      }}
                    >
                      {activity.entityName}
                    </a>
                  </td>
                  {/* Due Date */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'text-sm',
                      activity.slaStatus === 'breached' && 'text-red-600 font-medium',
                      activity.slaStatus === 'at_risk' && 'text-amber-600',
                    )}>
                      {activity.dueDate
                        ? new Date(activity.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                      STATUS_COLORS[activity.status] || 'bg-stone-100 text-stone-700'
                    )}>
                      {activity.status.replace('_', ' ')}
                    </span>
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {activity.status === 'open' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartActivity(activity.id)}
                          disabled={startActivity.isPending}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      {(activity.status === 'open' || activity.status === 'in_progress') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteActivity(activity.id)}
                          disabled={completeActivity.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination info */}
      {activitiesList.data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {activities.length} of {activitiesList.data.total} activities
          </span>
        </div>
      )}
    </div>
  );
}

export default BenchActivitiesRenderer;
