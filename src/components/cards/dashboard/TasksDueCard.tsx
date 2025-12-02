'use client';

import * as React from 'react';
import { AlertCircle, Clock, CalendarDays, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TaskData } from '../types';

interface TasksDueCardProps {
  overdueCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  tasks?: TaskData[];
  maxTasks?: number;
  viewAllHref?: string;
  onTaskClick?: (task: TaskData) => void;
  className?: string;
}

export function TasksDueCard({
  overdueCount,
  dueTodayCount,
  dueThisWeekCount,
  tasks = [],
  maxTasks = 5,
  viewAllHref,
  onTaskClick,
  className,
}: TasksDueCardProps) {
  const displayedTasks = tasks.slice(0, maxTasks);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Tasks Due</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary counts */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Overdue */}
          <div className={cn(
            'text-center p-2 rounded-lg',
            overdueCount > 0 ? 'bg-red-50' : 'bg-charcoal-50'
          )}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className={cn(
                'h-4 w-4',
                overdueCount > 0 ? 'text-red-500' : 'text-charcoal-400'
              )} />
            </div>
            <p className={cn(
              'text-2xl font-bold',
              overdueCount > 0 ? 'text-red-600' : 'text-charcoal-400'
            )}>
              {overdueCount}
            </p>
            <p className="text-xs text-charcoal-500">Overdue</p>
          </div>

          {/* Due Today */}
          <div className={cn(
            'text-center p-2 rounded-lg',
            dueTodayCount > 0 ? 'bg-yellow-50' : 'bg-charcoal-50'
          )}>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className={cn(
                'h-4 w-4',
                dueTodayCount > 0 ? 'text-yellow-500' : 'text-charcoal-400'
              )} />
            </div>
            <p className={cn(
              'text-2xl font-bold',
              dueTodayCount > 0 ? 'text-yellow-600' : 'text-charcoal-400'
            )}>
              {dueTodayCount}
            </p>
            <p className="text-xs text-charcoal-500">Today</p>
          </div>

          {/* Due This Week */}
          <div className="text-center p-2 rounded-lg bg-charcoal-50">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CalendarDays className="h-4 w-4 text-charcoal-400" />
            </div>
            <p className="text-2xl font-bold text-charcoal-600">
              {dueThisWeekCount}
            </p>
            <p className="text-xs text-charcoal-500">This Week</p>
          </div>
        </div>

        {/* Task list */}
        {displayedTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wide">
              Upcoming Tasks
            </p>
            {displayedTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg bg-charcoal-50',
                  'hover:bg-charcoal-100 transition-colors',
                  onTaskClick && 'cursor-pointer'
                )}
                onClick={() => onTaskClick?.(task)}
              >
                <div className={cn(
                  'h-2 w-2 rounded-full flex-shrink-0',
                  task.priority === 'urgent' && 'bg-red-500',
                  task.priority === 'high' && 'bg-orange-500',
                  task.priority === 'normal' && 'bg-blue-500',
                  task.priority === 'low' && 'bg-gray-400'
                )} />
                <span className="flex-1 text-sm text-charcoal-700 truncate">
                  {task.title}
                </span>
                {task.dueDate && (
                  <Badge variant="secondary" className="text-xs">
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* View all link */}
        {viewAllHref && (
          <a
            href={viewAllHref}
            className="flex items-center justify-center gap-1 mt-4 pt-2 border-t border-charcoal-100 text-sm text-blue-600 hover:underline"
          >
            View all tasks
            <ChevronRight className="h-4 w-4" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

export default TasksDueCard;
