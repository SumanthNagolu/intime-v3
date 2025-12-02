'use client';

/**
 * Activity Queue Widget (Today's Priorities)
 *
 * Displays tasks grouped by urgency: overdue, due today, high priority, upcoming.
 * Supports task completion and navigation.
 */

import React, { useState } from 'react';
import { AlertTriangle, Calendar, Flag, Clock, Check, ChevronRight, Phone, Mail, Users, FileText, Bell } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface Task {
  id: string;
  subject: string | null;
  body: string | null;
  activityType: string;
  status: string;
  priority: string;
  dueDate: string | Date | null;
  scheduledAt: string | Date | null;
  entityType: string;
  entityId: string;
}

interface TasksData {
  overdue: Task[];
  dueToday: Task[];
  highPriority: Task[];
  upcoming: Task[];
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  task: FileText,
  follow_up: Bell,
  reminder: Clock,
  default: FileText,
};

const GROUP_CONFIG = [
  { key: 'overdue', label: 'OVERDUE', icon: AlertTriangle, color: 'error', emptyText: 'No overdue tasks' },
  { key: 'dueToday', label: 'DUE TODAY', icon: Calendar, color: 'warning', emptyText: 'Nothing due today' },
  { key: 'highPriority', label: 'HIGH PRIORITY', icon: Flag, color: 'rust', emptyText: 'No high priority tasks' },
  { key: 'upcoming', label: 'UPCOMING', icon: Clock, color: 'charcoal', emptyText: 'No upcoming tasks' },
];

function getEntityLink(entityType: string, entityId: string): string {
  const links: Record<string, string> = {
    lead: `/employee/recruiting/leads/${entityId}`,
    deal: `/employee/recruiting/deals/${entityId}`,
    account: `/employee/recruiting/accounts/${entityId}`,
    candidate: `/employee/recruiting/talent/${entityId}`,
    submission: `/employee/recruiting/submissions/${entityId}`,
    job: `/employee/recruiting/jobs/${entityId}`,
  };
  return links[entityType] || '#';
}

function TaskItem({ task, onComplete }: { task: Task; onComplete?: (id: string) => void }) {
  const [completing, setCompleting] = useState(false);
  const Icon = ACTIVITY_ICONS[task.activityType] || ACTIVITY_ICONS.default;

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompleting(true);
    onComplete?.(task.id);
  };

  return (
    <Link
      href={getEntityLink(task.entityType, task.entityId)}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg transition-all duration-200",
        "hover:bg-charcoal-50 group",
        completing && "opacity-50"
      )}
    >
      <button
        onClick={handleComplete}
        className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
          "border-charcoal-300 hover:border-forest-500 hover:bg-forest-50",
          completing && "border-success-500 bg-success-500"
        )}
      >
        {completing && <Check className="w-3 h-3 text-white" />}
      </button>
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
        "bg-charcoal-100 text-charcoal-500"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium text-charcoal-900 truncate",
          completing && "line-through"
        )}>
          {task.subject || task.body || 'Untitled task'}
        </p>
        <p className="text-xs text-charcoal-500 capitalize">
          {task.activityType.replace('_', ' ')} • {task.entityType}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500 transition-colors" />
    </Link>
  );
}

export function ActivityQueueWidget({ definition, data, context }: SectionWidgetProps) {
  const tasksData = data as TasksData | undefined;
  const isLoading = context?.isLoading;
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  const handleComplete = (id: string) => {
    setCompletedIds((prev) => new Set([...prev, id]));
    // In a real app, this would call a tRPC mutation
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rust-100 rounded-lg animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-stone-200 rounded animate-pulse" />
                <div className="h-12 w-full bg-stone-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate total tasks
  const totalTasks = (tasksData?.overdue?.length || 0) +
    (tasksData?.dueToday?.length || 0) +
    (tasksData?.highPriority?.length || 0) +
    (tasksData?.upcoming?.length || 0) -
    completedIds.size;

  return (
    <Card className="border-charcoal-100 shadow-elevation-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-rust-500 to-rust-600 rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
                {(typeof definition.title === 'string' ? definition.title : "Today's Priorities") || "Today's Priorities"}
              </CardTitle>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {totalTasks} tasks remaining
              </p>
            </div>
          </div>
          <Link
            href="/employee/workspace/tasks"
            className="text-xs font-bold text-forest-600 hover:text-forest-700 uppercase tracking-wider"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {GROUP_CONFIG.map((group) => {
            const tasks = (tasksData?.[group.key as keyof TasksData] || [])
              .filter((t) => !completedIds.has(t.id));
            const Icon = group.icon;

            if (tasks.length === 0 && group.key !== 'dueToday') return null;

            return (
              <div key={group.key}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn(
                    "w-4 h-4",
                    group.color === 'error' && "text-error-500",
                    group.color === 'warning' && "text-warning-500",
                    group.color === 'rust' && "text-rust-500",
                    group.color === 'charcoal' && "text-charcoal-400"
                  )} />
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    group.color === 'error' && "text-error-600",
                    group.color === 'warning' && "text-warning-600",
                    group.color === 'rust' && "text-rust-600",
                    group.color === 'charcoal' && "text-charcoal-500"
                  )}>
                    {group.label}
                  </span>
                  {tasks.length > 0 && (
                    <span className={cn(
                      "text-xs font-bold px-1.5 py-0.5 rounded-full",
                      group.color === 'error' && "bg-error-100 text-error-600",
                      group.color === 'warning' && "bg-warning-100 text-warning-600",
                      group.color === 'rust' && "bg-rust-100 text-rust-600",
                      group.color === 'charcoal' && "bg-charcoal-100 text-charcoal-600"
                    )}>
                      {tasks.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-charcoal-400 italic py-2 pl-6">
                      {group.emptyText}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default ActivityQueueWidget;
