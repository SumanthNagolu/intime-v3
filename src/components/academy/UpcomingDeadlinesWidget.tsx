/**
 * Upcoming Deadlines Widget Component
 * ACAD-019
 *
 * Displays upcoming course deadlines and assignments
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInDays } from 'date-fns';

interface Deadline {
  id: string;
  course_id: string;
  course_title: string;
  item_type: 'quiz' | 'lab' | 'project' | 'assignment';
  item_title: string;
  due_date: string;
  is_completed: boolean;
  points_possible?: number;
}

interface UpcomingDeadlinesWidgetProps {
  deadlines?: Deadline[];
  isLoading?: boolean;
}

export function UpcomingDeadlinesWidget({ deadlines, isLoading }: UpcomingDeadlinesWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deadlines || deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-sm text-muted-foreground">
              All caught up! No upcoming deadlines.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz':
        return '✏️';
      case 'lab':
        return '🔬';
      case 'project':
        return '📁';
      case 'assignment':
        return '📝';
      default:
        return '📋';
    }
  };

  const getItemTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      quiz: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400',
      lab: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400',
      project: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400',
      assignment: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400',
    };

    return (
      <Badge variant="secondary" className={variants[type] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getUrgencyIndicator = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
        icon: <CheckCircle2 className="h-4 w-4" />,
        label: 'Completed',
      };
    }

    const daysUntil = differenceInDays(new Date(dueDate), new Date());
    const overdue = isPast(new Date(dueDate));

    if (overdue) {
      return {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Overdue',
      };
    }

    if (daysUntil <= 1) {
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
        icon: <AlertCircle className="h-4 w-4" />,
        label: 'Due soon',
      };
    }

    if (daysUntil <= 3) {
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        label: 'Upcoming',
      };
    }

    return {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
      icon: <Calendar className="h-4 w-4" />,
      label: 'Scheduled',
    };
  };

  // Sort: overdue first, then by due date
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    const aOverdue = isPast(new Date(a.due_date)) && !a.is_completed;
    const bOverdue = isPast(new Date(b.due_date)) && !b.is_completed;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Upcoming Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {sortedDeadlines.map((deadline) => {
              const urgency = getUrgencyIndicator(deadline.due_date, deadline.is_completed);

              return (
                <Link
                  key={deadline.id}
                  href={`/courses/${deadline.course_id}`}
                  className="block"
                >
                  <div
                    className={`p-3 rounded-lg border hover:shadow-md transition-shadow ${urgency.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getItemTypeIcon(deadline.item_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getItemTypeBadge(deadline.item_type)}
                          <div className={`flex items-center gap-1 text-xs font-medium ${urgency.color}`}>
                            {urgency.icon}
                            <span>{urgency.label}</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm mb-1 truncate">
                          {deadline.item_title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {deadline.course_title}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {isPast(new Date(deadline.due_date)) && !deadline.is_completed
                            ? `Overdue by ${formatDistanceToNow(new Date(deadline.due_date))}`
                            : deadline.is_completed
                              ? 'Completed'
                              : `Due ${formatDistanceToNow(new Date(deadline.due_date), { addSuffix: true })}`}
                        </span>
                      </div>
                      {deadline.points_possible && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {deadline.points_possible} pts
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
