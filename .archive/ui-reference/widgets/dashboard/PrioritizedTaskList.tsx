'use client';

/**
 * Prioritized Task List Widget
 *
 * Displays tasks grouped by priority: urgent, high, normal
 */

import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, ChevronRight, Clock, Phone, Mail, Users, FileText } from 'lucide-react';
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
  urgent: Task[];
  high: Task[];
  normal: Task[];
}

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  task: FileText,
  follow_up: Clock,
  default: FileText,
};

const PRIORITY_CONFIG = [
  { key: 'urgent', label: 'URGENT', icon: AlertCircle, color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { key: 'high', label: 'HIGH PRIORITY', icon: AlertTriangle, color: 'amber', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'normal', label: 'NORMAL', icon: CheckCircle, color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
];

function getEntityLink(entityType: string, entityId: string): string {
  const links: Record<string, string> = {
    lead: `/employee/recruiting/leads/${entityId}`,
    deal: `/employee/recruiting/deals/${entityId}`,
    account: `/employee/recruiting/accounts/${entityId}`,
    candidate: `/employee/recruiting/talent/${entityId}`,
    submission: `/employee/recruiting/submissions/${entityId}`,
    job: `/employee/recruiting/jobs/${entityId}`,
    consultant: `/employee/bench/consultants/${entityId}`,
  };
  return links[entityType] || '#';
}

function TaskItem({ task }: { task: Task }) {
  const Icon = ACTIVITY_ICONS[task.activityType] || ACTIVITY_ICONS.default;

  return (
    <Link
      href={getEntityLink(task.entityType, task.entityId)}
      className="flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-charcoal-50 group"
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-charcoal-100 text-charcoal-500">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">
          {task.subject || task.body || 'Untitled task'}
        </p>
        <p className="text-xs text-charcoal-500 capitalize">
          {task.activityType.replace('_', ' ')} - {task.entityType}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-500" />
    </Link>
  );
}

export function PrioritizedTaskList({ definition, data, context }: SectionWidgetProps) {
  const tasksData = data as TasksData | undefined;
  const isLoading = context?.isLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalTasks = (tasksData?.urgent?.length || 0) +
    (tasksData?.high?.length || 0) +
    (tasksData?.normal?.length || 0);

  return (
    <Card className="border-charcoal-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-heading font-bold text-charcoal-900">
            {(typeof definition.title === 'string' ? definition.title : "Today's Priorities") || "Today's Priorities"}
          </CardTitle>
          <span className="text-sm text-charcoal-500">{totalTasks} tasks</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {PRIORITY_CONFIG.map((config) => {
            const tasks = tasksData?.[config.key as keyof TasksData] || [];
            const Icon = config.icon;

            return (
              <div key={config.key} className={cn('rounded-lg p-3', config.bgColor, 'border', config.borderColor)}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn(
                    'w-4 h-4',
                    config.color === 'red' && 'text-red-500',
                    config.color === 'amber' && 'text-amber-500',
                    config.color === 'green' && 'text-green-500'
                  )} />
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-wider',
                    config.color === 'red' && 'text-red-600',
                    config.color === 'amber' && 'text-amber-600',
                    config.color === 'green' && 'text-green-600'
                  )}>
                    {config.label}
                  </span>
                  <span className={cn(
                    'text-xs font-bold px-1.5 py-0.5 rounded-full',
                    config.color === 'red' && 'bg-red-100 text-red-600',
                    config.color === 'amber' && 'bg-amber-100 text-amber-600',
                    config.color === 'green' && 'bg-green-100 text-green-600'
                  )}>
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-1 bg-white rounded-lg">
                  {tasks.length > 0 ? (
                    tasks.slice(0, 5).map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))
                  ) : (
                    <p className="text-sm text-charcoal-400 italic py-3 text-center">
                      No {config.key} tasks
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

export default PrioritizedTaskList;
