'use client';

/**
 * ActivitiesTable Component
 *
 * Unified activities list for all entity types.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  CheckSquare,
  Bell,
  Linkedin,
  Eye,
  CheckCircle,
  X,
  Play,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { RelativeDateColumn } from '../columns/DateColumn';
import { UserColumn } from '../columns/UserColumn';
import { EntityLinkColumn } from '../columns/EntityLinkColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import { Badge } from '@/components/ui/badge';
import type { StatusColor, ActionItem, FilterDefinition } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface ActivityRow {
  id: string;
  subject?: string;
  activityType: string;
  status: string;
  priority: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  dueDate: string | Date;
  assignedTo?: { id: string; name: string; avatarUrl?: string } | null;
  createdAt: string | Date;
  completedAt?: string | Date;
  pattern?: string;
}

// ==========================================
// ACTIVITY TYPE CONFIG
// ==========================================

const activityTypeIcons: Record<string, LucideIcon> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: MessageSquare,
  task: CheckSquare,
  follow_up: Bell,
  reminder: Bell,
  linkedin_message: Linkedin,
};

const activityTypeColors: Record<string, StatusColor> = {
  email: 'blue',
  call: 'green',
  meeting: 'purple',
  note: 'gray',
  task: 'orange',
  follow_up: 'yellow',
  reminder: 'red',
  linkedin_message: 'blue',
};

const activityStatusColors: Record<string, StatusColor> = {
  scheduled: 'blue',
  open: 'yellow',
  in_progress: 'purple',
  completed: 'green',
  skipped: 'gray',
  cancelled: 'red',
};

const activityPriorityColors: Record<string, StatusColor> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

// ==========================================
// COLUMNS
// ==========================================

export function createActivityColumns(options?: {
  onView?: (activity: ActivityRow) => void;
  onComplete?: (activity: ActivityRow) => void;
  onSkip?: (activity: ActivityRow) => void;
  onStart?: (activity: ActivityRow) => void;
}): ColumnDef<ActivityRow>[] {
  return [
    {
      accessorKey: 'subject',
      header: 'Activity',
      cell: ({ row }) => {
        const Icon = activityTypeIcons[row.original.activityType] ?? CheckSquare;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="font-medium truncate max-w-[200px]">
              {row.original.subject ?? row.original.activityType}
            </span>
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'activityType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="capitalize"
          style={{
            borderColor: `var(--${activityTypeColors[row.original.activityType] ?? 'gray'}-200)`,
          }}
        >
          {row.original.activityType.replace(/_/g, ' ')}
        </Badge>
      ),
      filterFn: 'equals',
    },
    {
      id: 'relatedEntity',
      header: 'Related To',
      cell: ({ row }) =>
        row.original.entityType && row.original.entityId ? (
          <EntityLinkColumn
            value={row.original.entityName ?? row.original.entityType}
            id={row.original.entityId}
            entityType={row.original.entityType}
            config={{ truncate: 20 }}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.status}
          config={{ colors: activityStatusColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.priority}
          config={{ colors: activityPriorityColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'dueDate',
      header: 'Due',
      cell: ({ row }) => {
        const dueDate = new Date(row.original.dueDate);
        const isOverdue =
          row.original.status !== 'completed' &&
          row.original.status !== 'skipped' &&
          row.original.status !== 'cancelled' &&
          dueDate < new Date();

        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            <RelativeDateColumn value={row.original.dueDate} />
            {isOverdue && <span className="text-xs ml-1">(Overdue)</span>}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ row }) => <UserColumn value={row.original.assignedTo} />,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => <RelativeDateColumn value={row.original.createdAt} />,
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original.status;
        const isActionable = !['completed', 'skipped', 'cancelled'].includes(status);

        const actions: ActionItem[] = [
          {
            id: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => options?.onView?.(row.original),
          },
          {
            id: 'start',
            label: 'Start',
            icon: Play,
            onClick: () => options?.onStart?.(row.original),
            visible: () => status === 'open' || status === 'scheduled',
          },
          {
            id: 'complete',
            label: 'Complete',
            icon: CheckCircle,
            onClick: () => options?.onComplete?.(row.original),
            visible: () => isActionable,
          },
          {
            id: 'skip',
            label: 'Skip',
            icon: X,
            variant: 'destructive',
            separator: true,
            onClick: () => options?.onSkip?.(row.original),
            visible: () => isActionable,
          },
        ];

        return <ActionsColumn row={row.original} actions={actions} />;
      },
    },
  ];
}

// ==========================================
// FILTER DEFINITIONS
// ==========================================

export const activityFilterDefs: FilterDefinition[] = [
  {
    id: 'activityType',
    label: 'Type',
    type: 'multi-select',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'call', label: 'Call' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'task', label: 'Task' },
      { value: 'note', label: 'Note' },
      { value: 'follow_up', label: 'Follow-up' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { value: 'scheduled', label: 'Scheduled', color: 'blue' },
      { value: 'open', label: 'Open', color: 'yellow' },
      { value: 'in_progress', label: 'In Progress', color: 'purple' },
      { value: 'completed', label: 'Completed', color: 'green' },
    ],
  },
  {
    id: 'priority',
    label: 'Priority',
    type: 'select',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ],
  },
  {
    id: 'dueDate',
    label: 'Due Date',
    type: 'date-range',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface ActivitiesTableProps {
  data: ActivityRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (activity: ActivityRow) => void;
  onView?: (activity: ActivityRow) => void;
  onComplete?: (activity: ActivityRow) => void;
  onSkip?: (activity: ActivityRow) => void;
  onStart?: (activity: ActivityRow) => void;
}

export function ActivitiesTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onComplete,
  onSkip,
  onStart,
}: ActivitiesTableProps) {
  const columns = React.useMemo(
    () => createActivityColumns({ onView, onComplete, onSkip, onStart }),
    [onView, onComplete, onSkip, onStart]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, filename: 'activities' }}
    />
  );
}

export default ActivitiesTable;
