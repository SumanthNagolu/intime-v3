'use client';

/**
 * Prioritized Task List Widget
 *
 * Displays tasks grouped by priority (urgent, high, normal).
 */

import React from 'react';
import { AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';

interface TaskGroup {
  id: string;
  label: string;
  filter: { priority: string };
  collapsible?: boolean;
  collapsed?: boolean;
  maxItems?: number;
}

interface Task {
  id: string;
  subject: string;
  priority: string;
  status: string;
  dueDate?: string;
  entityType?: string;
  entityId?: string;
}

const PRIORITY_ICONS: Record<string, React.ElementType> = {
  urgent: AlertTriangle,
  high: Flag,
  normal: CheckCircle2,
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'text-red-500 bg-red-50',
  high: 'text-yellow-500 bg-yellow-50',
  normal: 'text-green-500 bg-green-50',
};

export function PrioritizedTaskList({ definition, data, context }: SectionWidgetProps) {
  const isLoading = context?.isLoading;
  const componentProps = definition.componentProps as {
    groups?: TaskGroup[];
    showActions?: boolean;
  } | undefined;
  const groups = componentProps?.groups || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-5 h-5 bg-stone-200 rounded animate-pulse" />
            <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const tasks = (data as { items?: Task[] })?.items || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {typeof definition.title === 'string' ? definition.title : "Today's Priorities"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groups.map((group) => {
            const groupTasks = tasks.filter((t) => t.priority === group.filter.priority);
            const Icon = PRIORITY_ICONS[group.filter.priority] || CheckCircle2;
            const colorClass = PRIORITY_COLORS[group.filter.priority] || PRIORITY_COLORS.normal;

            return (
              <div key={group.id} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn('p-1 rounded', colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {group.label}
                  </span>
                  <span className="text-xs text-stone-500">
                    ({groupTasks.length})
                  </span>
                </div>
                {groupTasks.length === 0 ? (
                  <p className="text-sm text-stone-400 italic pl-8">
                    No {group.filter.priority} tasks
                  </p>
                ) : (
                  <div className="space-y-1 pl-8">
                    {groupTasks.slice(0, group.maxItems || 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-stone-50"
                      >
                        <span className="text-sm">{task.subject}</span>
                        {task.dueDate && (
                          <span className="text-xs text-stone-500">{task.dueDate}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {groups.length === 0 && tasks.length === 0 && (
            <p className="text-sm text-stone-400 text-center py-8">
              No tasks to display
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PrioritizedTaskList;
