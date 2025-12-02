'use client';

/**
 * CandidatesTable Component
 *
 * Recruiting candidates list with skills, ratings, and actions.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Mail, Phone, Eye, Edit, UserPlus, Send, MoreHorizontal } from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { RelativeDateColumn } from '../columns/DateColumn';
import { UserColumn } from '../columns/UserColumn';
import { SkillsColumn } from '../columns/TagsColumn';
import { MatchScoreColumn } from '../columns/RatingColumn';
import { VisaAlertColumn } from '../columns/AlertColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import type { StatusColor, ActionItem, FilterDefinition } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface CandidateRow {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  currentTitle?: string;
  currentCompany?: string;
  status: string;
  source?: string;
  visaStatus?: string;
  visaExpiryDate?: string | Date;
  skills?: string[];
  rating?: number;
  matchScore?: number;
  owner?: { id: string; name: string; avatarUrl?: string } | null;
  lastActivityAt?: string | Date;
  createdAt: string | Date;
}

// ==========================================
// STATUS CONFIG
// ==========================================

const candidateStatusColors: Record<string, StatusColor> = {
  new: 'blue',
  active: 'green',
  passive: 'yellow',
  do_not_contact: 'red',
  placed: 'purple',
  archived: 'gray',
};

// ==========================================
// COLUMNS
// ==========================================

export function createCandidateColumns(options?: {
  onView?: (candidate: CandidateRow) => void;
  onEdit?: (candidate: CandidateRow) => void;
  onSubmit?: (candidate: CandidateRow) => void;
  onAddToCampaign?: (candidate: CandidateRow) => void;
}): ColumnDef<CandidateRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Candidate',
      cell: ({ row }) => (
        <UserColumn
          value={{
            name: row.original.name,
            email: row.original.email,
            avatarUrl: row.original.avatarUrl,
          }}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) =>
        row.original.email ? (
          <a
            href={`mailto:${row.original.email}`}
            className="text-primary hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">{row.original.email}</span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) =>
        row.original.phone ? (
          <a
            href={`tel:${row.original.phone}`}
            className="text-primary hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="h-3.5 w-3.5" />
            <span>{row.original.phone}</span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: 'title',
      header: 'Title / Company',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.currentTitle ?? '-'}</span>
          {row.original.currentCompany && (
            <span className="text-xs text-muted-foreground">
              {row.original.currentCompany}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.status}
          config={{ colors: candidateStatusColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ row }) =>
        row.original.source ? (
          <span className="text-sm capitalize">{row.original.source.replace(/_/g, ' ')}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'visaStatus',
      header: 'Visa',
      cell: ({ row }) =>
        row.original.visaStatus ? (
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono">
              {row.original.visaStatus.replace(/_/g, ' ')}
            </span>
            {row.original.visaExpiryDate && (
              <VisaAlertColumn expiryDate={row.original.visaExpiryDate} showDays />
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => <SkillsColumn skills={row.original.skills} maxVisible={3} />,
    },
    {
      accessorKey: 'matchScore',
      header: 'Match',
      cell: ({ row }) =>
        row.original.matchScore ? (
          <MatchScoreColumn value={row.original.matchScore} />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      enableSorting: true,
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ row }) => <UserColumn value={row.original.owner} />,
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
        const actions: ActionItem[] = [
          {
            id: 'view',
            label: 'View Profile',
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
            id: 'submit',
            label: 'Submit to Job',
            icon: Send,
            onClick: () => options?.onSubmit?.(row.original),
          },
          {
            id: 'campaign',
            label: 'Add to Campaign',
            icon: UserPlus,
            separator: true,
            onClick: () => options?.onAddToCampaign?.(row.original),
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

export const candidateFilterDefs: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { value: 'new', label: 'New', color: 'blue' },
      { value: 'active', label: 'Active', color: 'green' },
      { value: 'passive', label: 'Passive', color: 'yellow' },
      { value: 'placed', label: 'Placed', color: 'purple' },
    ],
  },
  {
    id: 'source',
    label: 'Source',
    type: 'multi-select',
    options: [
      { value: 'referral', label: 'Referral' },
      { value: 'job_board', label: 'Job Board' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'website', label: 'Website' },
      { value: 'agency', label: 'Agency' },
    ],
  },
  {
    id: 'visaStatus',
    label: 'Visa Status',
    type: 'multi-select',
    options: [
      { value: 'usc', label: 'US Citizen' },
      { value: 'green_card', label: 'Green Card' },
      { value: 'h1b', label: 'H1B' },
      { value: 'opt', label: 'OPT' },
      { value: 'tn', label: 'TN' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    type: 'text',
    placeholder: 'Search skills...',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface CandidatesTableProps {
  data: CandidateRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (candidate: CandidateRow) => void;
  onView?: (candidate: CandidateRow) => void;
  onEdit?: (candidate: CandidateRow) => void;
  onSubmit?: (candidate: CandidateRow) => void;
  onAddToCampaign?: (candidate: CandidateRow) => void;
}

export function CandidatesTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onEdit,
  onSubmit,
  onAddToCampaign,
}: CandidatesTableProps) {
  const columns = React.useMemo(
    () => createCandidateColumns({ onView, onEdit, onSubmit, onAddToCampaign }),
    [onView, onEdit, onSubmit, onAddToCampaign]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, excel: true, filename: 'candidates' }}
    />
  );
}

export default CandidatesTable;
