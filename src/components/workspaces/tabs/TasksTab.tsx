/**
 * TasksTab Component
 *
 * Generic task management tab for workspace pages.
 * Supports task creation, completion, and deletion with due dates and priorities.
 */

'use client';

import React, { useState } from 'react';
import {
  Plus,
  CheckSquare,
  Square,
  X,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import type { EntityType } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export interface Task {
  id: string;
  subject: string | null;
  body?: string | null;
  status: string;
  priority?: string | null;
  dueDate?: string | Date | null;
  completedAt?: string | Date | null;
  assignee?: {
    id: string;
    name: string;
    avatarUrl?: string;
  } | null;
}

export interface TasksTabProps {
  entityType: EntityType;
  entityId: string;
  canCreate?: boolean;
  canComplete?: boolean;
  canDelete?: boolean;
  className?: string;
}

type TaskFilter = 'all' | 'open' | 'completed' | 'overdue';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

// =====================================================
// PRIORITY CONFIG
// =====================================================

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-stone-100 text-stone-600 border-stone-200',
};

// =====================================================
// TASK ITEM COMPONENT
// =====================================================

function TaskItem({
  task,
  canComplete,
  canDelete,
  onComplete,
  onDelete,
  isCompleting,
  isDeleting,
}: {
  task: Task;
  canComplete: boolean;
  canDelete: boolean;
  onComplete: () => void;
  onDelete: () => void;
  isCompleting: boolean;
  isDeleting: boolean;
}) {
  const isCompleted = task.status === 'completed';
  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && !isCompleted && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);
  const priority = (task.priority || 'medium') as Priority;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl border transition-all',
        isCompleted
          ? 'bg-green-50/50 border-green-200'
          : isOverdue
            ? 'bg-red-50/50 border-red-200'
            : isDueToday
              ? 'bg-amber-50/50 border-amber-200'
              : 'bg-white border-stone-200 hover:border-stone-300'
      )}
    >
      {/* Checkbox */}
      <button
        onClick={onComplete}
        disabled={!canComplete || isCompleting || isCompleted}
        className="flex-shrink-0 disabled:cursor-not-allowed"
      >
        {isCompleting ? (
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        ) : isCompleted ? (
          <CheckSquare className="w-5 h-5 text-green-600" />
        ) : (
          <Square className="w-5 h-5 text-stone-400 hover:text-charcoal transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'text-sm font-medium',
            isCompleted ? 'line-through text-stone-400' : 'text-charcoal'
          )}
        >
          {task.subject || 'Untitled Task'}
        </div>
        {task.body && (
          <p className="text-xs text-stone-500 mt-0.5 line-clamp-1">{task.body}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs">
          {/* Due Date */}
          {dueDate && (
            <span
              className={cn(
                'flex items-center gap-1',
                isOverdue
                  ? 'text-red-600 font-medium'
                  : isDueToday
                    ? 'text-amber-600 font-medium'
                    : 'text-stone-400'
              )}
            >
              <Calendar className="w-3 h-3" />
              {isOverdue ? 'Overdue: ' : isDueToday ? 'Due today: ' : ''}
              {format(dueDate, 'MMM d, yyyy')}
            </span>
          )}
          {/* Assignee */}
          {task.assignee && (
            <span className="text-stone-400">Assigned to {task.assignee.name}</span>
          )}
        </div>
      </div>

      {/* Priority Badge */}
      <Badge variant="outline" className={cn('text-[10px] uppercase', PRIORITY_COLORS[priority])}>
        {priority}
      </Badge>

      {/* Delete */}
      {canDelete && !isCompleted && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-400 hover:text-destructive flex-shrink-0"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function TasksTab({
  entityType,
  entityId,
  canCreate = true,
  canComplete = true,
  canDelete = true,
  className,
}: TasksTabProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');

  // Map workspace entity types to activity entity types
  const mapEntityType = (type: EntityType): 'candidate' | 'account' | 'lead' | 'deal' | 'job' | 'submission' | 'poc' => {
    if (type === 'talent') return 'candidate';
    if (type === 'contact') return 'poc';
    if (type === 'job_order') return 'job';
    return type as 'account' | 'lead' | 'deal' | 'job' | 'submission';
  };

  // Fetch tasks (activities with type='task')
  const {
    data: tasksData,
    isLoading,
    refetch,
  } = trpc.activities.list.useQuery(
    {
      entityType: mapEntityType(entityType),
      entityId,
      activityTypes: ['task'],
      limit: 100,
    },
    { enabled: !!entityType && !!entityId }
  );

  // Create task mutation
  const createTaskMutation = trpc.activities.create.useMutation({
    onSuccess: () => {
      refetch();
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setNewTaskPriority('medium');
    },
  });

  // Complete task mutation
  const completeTaskMutation = trpc.activities.complete.useMutation({
    onSuccess: () => refetch(),
  });

  // Cancel/delete task mutation
  const cancelTaskMutation = trpc.activities.cancel.useMutation({
    onSuccess: () => refetch(),
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    createTaskMutation.mutate({
      entityType: mapEntityType(entityType),
      entityId,
      activityType: 'task',
      subject: newTaskTitle.trim(),
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : new Date(),
      priority: newTaskPriority,
      status: 'open',
    });
  };

  // Map and filter tasks
  interface ActivityData {
    id: string;
    subject: string | null;
    body?: string | null;
    status: string;
    priority?: string | null;
    dueDate?: string | Date | null;
    completedAt?: string | Date | null;
    assignee?: {
      id: string;
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    } | null;
  }

  const tasks: Task[] = (tasksData || []).map((item: ActivityData) => ({
    id: item.id,
    subject: item.subject,
    body: item.body,
    status: item.status,
    priority: item.priority,
    dueDate: item.dueDate,
    completedAt: item.completedAt,
    assignee: item.assignee
      ? {
          id: item.assignee.id,
          name:
            `${item.assignee.firstName || ''} ${item.assignee.lastName || ''}`.trim() || 'Unknown',
          avatarUrl: item.assignee.avatarUrl || undefined,
        }
      : null,
  }));

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'open') return task.status !== 'completed' && task.status !== 'cancelled';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return task.status !== 'completed' && dueDate && isPast(dueDate) && !isToday(dueDate);
    }
    return true;
  });

  const openCount = tasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'cancelled'
  ).length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const overdueCount = tasks.filter((t) => {
    const dueDate = t.dueDate ? new Date(t.dueDate) : null;
    return t.status !== 'completed' && dueDate && isPast(dueDate) && !isToday(dueDate);
  }).length;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Add Task Form */}
      {canCreate && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            className="bg-white"
          />
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-stone-500 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-stone-500 mb-1 block">Priority</label>
              <Select
                value={newTaskPriority}
                onValueChange={(v) => setNewTaskPriority(v as Priority)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="ml-2">Add</span>
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </Button>
          <Button
            variant={filter === 'open' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('open')}
          >
            Open ({openCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </Button>
          {overdueCount > 0 && (
            <Button
              variant={filter === 'overdue' ? 'destructive' : 'ghost'}
              size="sm"
              onClick={() => setFilter('overdue')}
              className={filter !== 'overdue' ? 'text-red-600' : ''}
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Overdue ({overdueCount})
            </Button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-400" />
          </div>
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              canComplete={canComplete}
              canDelete={canDelete}
              onComplete={() => completeTaskMutation.mutate({ id: task.id })}
              onDelete={() => cancelTaskMutation.mutate({ id: task.id })}
              isCompleting={completeTaskMutation.isPending}
              isDeleting={cancelTaskMutation.isPending}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 text-stone-300" />
            <p className="text-stone-500 font-medium">
              {filter === 'all'
                ? 'No tasks yet'
                : filter === 'open'
                  ? 'No open tasks'
                  : filter === 'completed'
                    ? 'No completed tasks'
                    : 'No overdue tasks'}
            </p>
            <p className="text-sm text-stone-400 mt-1">
              {filter === 'all' && canCreate && 'Add your first task above'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TasksTab;
