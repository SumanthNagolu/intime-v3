'use client';

/**
 * SubmissionsTable Component
 *
 * Candidate submissions pipeline with status tracking.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Edit, ArrowRight, X, CheckCircle, Calendar } from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { RelativeDateColumn } from '../columns/DateColumn';
import { CurrencyColumn } from '../columns/CurrencyColumn';
import { CandidateLinkColumn, JobLinkColumn } from '../columns/EntityLinkColumn';
import { ProgressColumn } from '../columns/ProgressColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import type { StatusColor, ActionItem, FilterDefinition } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface SubmissionRow {
  id: string;
  candidate: { id: string; name: string } | null;
  job: { id: string; title: string } | null;
  status: string;
  submittedAt: string | Date;
  payRate?: number | string;
  billRate?: number | string;
  margin?: number;
  screeningScore?: number;
  lastActivityAt?: string | Date;
  owner?: { id: string; name: string } | null;
}

// ==========================================
// STATUS CONFIG
// ==========================================

const submissionStatusColors: Record<string, StatusColor> = {
  sourced: 'blue',
  screening: 'yellow',
  submitted_to_client: 'orange',
  client_review: 'orange',
  client_accepted: 'green',
  client_rejected: 'red',
  interview_scheduled: 'purple',
  interview_completed: 'blue',
  offer_pending: 'yellow',
  offer_extended: 'orange',
  offer_accepted: 'green',
  offer_declined: 'red',
  placed: 'green',
  withdrawn: 'gray',
};

const pipelineStages = [
  'sourced',
  'screening',
  'submitted_to_client',
  'client_review',
  'interview_scheduled',
  'offer_extended',
  'placed',
];

// ==========================================
// COLUMNS
// ==========================================

export function createSubmissionColumns(options?: {
  onView?: (submission: SubmissionRow) => void;
  onAdvance?: (submission: SubmissionRow) => void;
  onReject?: (submission: SubmissionRow) => void;
  onScheduleInterview?: (submission: SubmissionRow) => void;
}): ColumnDef<SubmissionRow>[] {
  return [
    {
      accessorKey: 'candidate',
      header: 'Candidate',
      cell: ({ row }) => <CandidateLinkColumn candidate={row.original.candidate} />,
      enableSorting: true,
    },
    {
      accessorKey: 'job',
      header: 'Job',
      cell: ({ row }) => <JobLinkColumn job={row.original.job} />,
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.status}
          config={{ colors: submissionStatusColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      id: 'pipeline',
      header: 'Pipeline',
      cell: ({ row }) => {
        const currentIndex = pipelineStages.indexOf(row.original.status);
        const progress = currentIndex >= 0 ? currentIndex + 1 : 0;
        return (
          <ProgressColumn
            value={progress}
            max={pipelineStages.length}
            config={{ asSteps: true, showLabel: true }}
          />
        );
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Submitted',
      cell: ({ row }) => <RelativeDateColumn value={row.original.submittedAt} />,
      enableSorting: true,
    },
    {
      accessorKey: 'payRate',
      header: 'Pay Rate',
      cell: ({ row }) => (
        <CurrencyColumn
          value={row.original.payRate}
          config={{ suffix: '/hr' }}
        />
      ),
    },
    {
      accessorKey: 'billRate',
      header: 'Bill Rate',
      cell: ({ row }) => (
        <CurrencyColumn
          value={row.original.billRate}
          config={{ suffix: '/hr' }}
        />
      ),
    },
    {
      accessorKey: 'margin',
      header: 'Margin',
      cell: ({ row }) =>
        row.original.margin !== undefined ? (
          <span className="font-mono text-sm">{row.original.margin.toFixed(1)}%</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'lastActivityAt',
      header: 'Last Activity',
      cell: ({ row }) => <RelativeDateColumn value={row.original.lastActivityAt} />,
      enableSorting: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const status = row.original.status;
        const canAdvance = !['placed', 'withdrawn', 'client_rejected', 'offer_declined'].includes(
          status
        );
        const canReject = !['placed', 'withdrawn', 'client_rejected', 'offer_declined'].includes(
          status
        );

        const actions: ActionItem[] = [
          {
            id: 'view',
            label: 'View Details',
            icon: Eye,
            onClick: () => options?.onView?.(row.original),
          },
          {
            id: 'advance',
            label: 'Advance Stage',
            icon: ArrowRight,
            onClick: () => options?.onAdvance?.(row.original),
            visible: () => canAdvance,
          },
          {
            id: 'schedule',
            label: 'Schedule Interview',
            icon: Calendar,
            onClick: () => options?.onScheduleInterview?.(row.original),
            visible: () =>
              ['client_accepted', 'client_review', 'submitted_to_client'].includes(status),
          },
          {
            id: 'reject',
            label: 'Reject / Withdraw',
            icon: X,
            variant: 'destructive',
            separator: true,
            onClick: () => options?.onReject?.(row.original),
            visible: () => canReject,
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

export const submissionFilterDefs: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: Object.entries(submissionStatusColors).map(([value, color]) => ({
      value,
      label: value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      color,
    })),
  },
  {
    id: 'job',
    label: 'Job',
    type: 'select',
    placeholder: 'Select job...',
    options: [], // Populated dynamically
  },
  {
    id: 'submittedAt',
    label: 'Submitted Date',
    type: 'date-range',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface SubmissionsTableProps {
  data: SubmissionRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (submission: SubmissionRow) => void;
  onView?: (submission: SubmissionRow) => void;
  onAdvance?: (submission: SubmissionRow) => void;
  onReject?: (submission: SubmissionRow) => void;
  onScheduleInterview?: (submission: SubmissionRow) => void;
}

export function SubmissionsTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onAdvance,
  onReject,
  onScheduleInterview,
}: SubmissionsTableProps) {
  const columns = React.useMemo(
    () =>
      createSubmissionColumns({
        onView,
        onAdvance,
        onReject,
        onScheduleInterview,
      }),
    [onView, onAdvance, onReject, onScheduleInterview]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, filename: 'submissions' }}
    />
  );
}

export default SubmissionsTable;
