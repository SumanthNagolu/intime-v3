'use client';

/**
 * BenchConsultantsTable Component
 *
 * Bench sales consultants with visa alerts and availability.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Edit, Send, FileText, AlertTriangle } from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { RelativeDateColumn } from '../columns/DateColumn';
import { RateRangeColumn } from '../columns/CurrencyColumn';
import { UserColumn } from '../columns/UserColumn';
import { SkillsColumn } from '../columns/TagsColumn';
import { VisaAlertColumn, BenchDaysColumn } from '../columns/AlertColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import { Badge } from '@/components/ui/badge';
import type { StatusColor, ActionItem, FilterDefinition, QuickFilter } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface BenchConsultantRow {
  id: string;
  name: string;
  avatarUrl?: string;
  skills?: string[];
  visaType?: string;
  visaExpiryDate?: string | Date;
  visaAlertLevel?: string;
  daysOnBench?: number;
  benchStartDate?: string | Date;
  minRate?: number | string;
  targetRate?: number | string;
  currency?: string;
  contractPreference?: string; // c2c, w2, 1099
  availability?: string;
  status: string;
  owner?: { id: string; name: string; avatarUrl?: string } | null;
  lastActivityAt?: string | Date;
}

// ==========================================
// STATUS CONFIG
// ==========================================

const benchStatusColors: Record<string, StatusColor> = {
  onboarding: 'blue',
  available: 'green',
  marketing: 'purple',
  interviewing: 'orange',
  placed: 'green',
  inactive: 'gray',
};

// ==========================================
// COLUMNS
// ==========================================

export function createBenchConsultantColumns(options?: {
  onView?: (consultant: BenchConsultantRow) => void;
  onEdit?: (consultant: BenchConsultantRow) => void;
  onAddToHotlist?: (consultant: BenchConsultantRow) => void;
  onSubmitToJob?: (consultant: BenchConsultantRow) => void;
}): ColumnDef<BenchConsultantRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Consultant',
      cell: ({ row }) => (
        <UserColumn
          value={{
            name: row.original.name,
            avatarUrl: row.original.avatarUrl,
          }}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => <SkillsColumn skills={row.original.skills} maxVisible={3} />,
    },
    {
      accessorKey: 'visaType',
      header: 'Visa',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.visaType ? (
            <>
              <Badge variant="outline" className="uppercase text-xs font-mono">
                {row.original.visaType.replace(/_/g, ' ')}
              </Badge>
              {row.original.visaExpiryDate && (
                <VisaAlertColumn expiryDate={row.original.visaExpiryDate} />
              )}
            </>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'daysOnBench',
      header: 'Days on Bench',
      cell: ({ row }) => <BenchDaysColumn daysOnBench={row.original.daysOnBench} />,
      enableSorting: true,
    },
    {
      id: 'rate',
      header: 'Rate',
      accessorFn: (row) => row.minRate,
      cell: ({ row }) => (
        <RateRangeColumn
          min={row.original.minRate}
          max={row.original.targetRate}
          rateType="hourly"
          currency={row.original.currency}
        />
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'contractPreference',
      header: 'Contract',
      cell: ({ row }) =>
        row.original.contractPreference ? (
          <Badge variant="outline" className="uppercase">
            {row.original.contractPreference}
          </Badge>
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
          config={{ colors: benchStatusColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'availability',
      header: 'Availability',
      cell: ({ row }) =>
        row.original.availability ? (
          <StatusColumn
            value={row.original.availability}
            config={{
              colors: {
                immediate: 'green',
                one_week: 'yellow',
                two_weeks: 'orange',
                one_month: 'red',
              },
            }}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
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
            id: 'hotlist',
            label: 'Add to Hotlist',
            icon: FileText,
            onClick: () => options?.onAddToHotlist?.(row.original),
          },
          {
            id: 'submit',
            label: 'Submit to Job',
            icon: Send,
            onClick: () => options?.onSubmitToJob?.(row.original),
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

export const benchConsultantFilterDefs: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: Object.entries(benchStatusColors).map(([value, color]) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
      color,
    })),
  },
  {
    id: 'visaAlertLevel',
    label: 'Visa Alert',
    type: 'multi-select',
    options: [
      { value: 'green', label: '181+ days', color: 'green' },
      { value: 'yellow', label: '90-180 days', color: 'yellow' },
      { value: 'orange', label: '30-90 days', color: 'orange' },
      { value: 'red', label: '<30 days', color: 'red' },
      { value: 'black', label: 'Expired', color: 'black' },
    ],
  },
  {
    id: 'skills',
    label: 'Skills',
    type: 'text',
    placeholder: 'Search skills...',
  },
  {
    id: 'contractPreference',
    label: 'Contract',
    type: 'multi-select',
    options: [
      { value: 'c2c', label: 'C2C' },
      { value: 'w2', label: 'W2' },
      { value: '1099', label: '1099' },
    ],
  },
];

// ==========================================
// QUICK FILTERS
// ==========================================

export const benchConsultantQuickFilters: QuickFilter[] = [
  { id: 'all', label: 'All', values: {} },
  { id: 'available', label: 'Available', values: { status: 'available' } },
  { id: 'visa-alert', label: 'Visa Alerts', values: { visaAlertLevel: ['orange', 'red', 'black'] } },
  { id: 'long-bench', label: '60+ Days', values: {} }, // Handled by custom filter
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface BenchConsultantsTableProps {
  data: BenchConsultantRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (consultant: BenchConsultantRow) => void;
  onView?: (consultant: BenchConsultantRow) => void;
  onEdit?: (consultant: BenchConsultantRow) => void;
  onAddToHotlist?: (consultant: BenchConsultantRow) => void;
  onSubmitToJob?: (consultant: BenchConsultantRow) => void;
}

export function BenchConsultantsTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onEdit,
  onAddToHotlist,
  onSubmitToJob,
}: BenchConsultantsTableProps) {
  const columns = React.useMemo(
    () =>
      createBenchConsultantColumns({
        onView,
        onEdit,
        onAddToHotlist,
        onSubmitToJob,
      }),
    [onView, onEdit, onAddToHotlist, onSubmitToJob]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, excel: true, filename: 'bench-consultants' }}
    />
  );
}

export default BenchConsultantsTable;
