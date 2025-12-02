'use client';

/**
 * JobsTable Component
 *
 * Recruiting job orders list with filters and actions.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Building2,
  MapPin,
  Users,
  MoreHorizontal,
  Eye,
  Edit,
  Archive,
  Copy,
  ExternalLink,
} from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { RelativeDateColumn } from '../columns/DateColumn';
import { RateRangeColumn } from '../columns/CurrencyColumn';
import { UserColumn } from '../columns/UserColumn';
import { AccountLinkColumn } from '../columns/EntityLinkColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import { Badge } from '@/components/ui/badge';
import type { StatusColor, ActionItem, FilterDefinition, QuickFilter } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface JobRow {
  id: string;
  title: string;
  account?: { id: string; name: string } | null;
  accountId?: string;
  status: string;
  location?: string;
  jobType?: string;
  isRemote?: boolean;
  rateMin?: number | string;
  rateMax?: number | string;
  rateType?: string;
  priority?: string;
  urgency?: string;
  positionsOpen?: number;
  submissionsCount?: number;
  owner?: { id: string; name: string; avatarUrl?: string } | null;
  ownerId?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// ==========================================
// STATUS CONFIG
// ==========================================

const jobStatusColors: Record<string, StatusColor> = {
  draft: 'gray',
  open: 'green',
  on_hold: 'yellow',
  filled: 'blue',
  closed: 'gray',
  cancelled: 'red',
};

const priorityColors: Record<string, StatusColor> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};

// ==========================================
// COLUMNS
// ==========================================

export function createJobColumns(options?: {
  onView?: (job: JobRow) => void;
  onEdit?: (job: JobRow) => void;
  onArchive?: (job: JobRow) => void;
  onDuplicate?: (job: JobRow) => void;
}): ColumnDef<JobRow>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Job Title',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.title}</span>
          {row.original.location && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {row.original.location}
              {row.original.isRemote && ' (Remote)'}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'account',
      header: 'Account',
      cell: ({ row }) => <AccountLinkColumn account={row.original.account} />,
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.status}
          config={{ colors: jobStatusColors }}
        />
      ),
      enableSorting: true,
      filterFn: 'equals',
    },
    {
      accessorKey: 'jobType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.jobType?.replace(/_/g, ' ') ?? '-'}
        </Badge>
      ),
    },
    {
      id: 'rate',
      header: 'Rate',
      accessorFn: (row) => row.rateMin,
      cell: ({ row }) => (
        <RateRangeColumn
          min={row.original.rateMin}
          max={row.original.rateMax}
          rateType={(row.original.rateType as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual') ?? 'hourly'}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) =>
        row.original.priority ? (
          <StatusColumn
            value={row.original.priority}
            config={{ colors: priorityColors }}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'positionsOpen',
      header: 'Open',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{row.original.positionsOpen ?? 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'submissionsCount',
      header: 'Submissions',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.submissionsCount ?? 0}</span>
      ),
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => <UserColumn value={row.original.owner} />,
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
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => options?.onView?.(row.original),
          },
          {
            id: 'edit',
            label: 'Edit',
            icon: Edit,
            onClick: () => options?.onEdit?.(row.original),
          },
          {
            id: 'duplicate',
            label: 'Duplicate',
            icon: Copy,
            onClick: () => options?.onDuplicate?.(row.original),
          },
          {
            id: 'archive',
            label: 'Archive',
            icon: Archive,
            variant: 'destructive',
            separator: true,
            onClick: () => options?.onArchive?.(row.original),
            visible: () => row.original.status !== 'archived',
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

export const jobFilterDefs: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { value: 'draft', label: 'Draft', color: 'gray' },
      { value: 'open', label: 'Open', color: 'green' },
      { value: 'on_hold', label: 'On Hold', color: 'yellow' },
      { value: 'filled', label: 'Filled', color: 'blue' },
      { value: 'closed', label: 'Closed', color: 'gray' },
    ],
  },
  {
    id: 'jobType',
    label: 'Job Type',
    type: 'multi-select',
    options: [
      { value: 'full_time', label: 'Full-Time' },
      { value: 'contract', label: 'Contract' },
      { value: 'contract_to_hire', label: 'Contract-to-Hire' },
      { value: 'part_time', label: 'Part-Time' },
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
    id: 'isRemote',
    label: 'Remote',
    type: 'boolean',
  },
];

// ==========================================
// QUICK FILTERS
// ==========================================

export const jobQuickFilters: QuickFilter[] = [
  { id: 'all', label: 'All Jobs', values: {} },
  { id: 'open', label: 'Open', values: { status: 'open' } },
  { id: 'urgent', label: 'Urgent', values: { priority: 'urgent' }, color: 'red' },
  { id: 'my-jobs', label: 'My Jobs', values: { ownerId: 'current' } },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface JobsTableProps {
  data: JobRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (job: JobRow) => void;
  onView?: (job: JobRow) => void;
  onEdit?: (job: JobRow) => void;
  onArchive?: (job: JobRow) => void;
  onDuplicate?: (job: JobRow) => void;
}

export function JobsTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onEdit,
  onArchive,
  onDuplicate,
}: JobsTableProps) {
  const columns = React.useMemo(
    () => createJobColumns({ onView, onEdit, onArchive, onDuplicate }),
    [onView, onEdit, onArchive, onDuplicate]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, excel: true, filename: 'jobs' }}
    />
  );
}

export default JobsTable;
