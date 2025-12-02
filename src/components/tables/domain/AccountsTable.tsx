'use client';

/**
 * AccountsTable Component
 *
 * CRM accounts list with type, tier, and activity tracking.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Building2, Globe, Eye, Edit, Users, Briefcase, Merge } from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { RelativeDateColumn } from '../columns/DateColumn';
import { CurrencyColumn } from '../columns/CurrencyColumn';
import { ContactLinkColumn } from '../columns/EntityLinkColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import { Badge } from '@/components/ui/badge';
import type { StatusColor, ActionItem, FilterDefinition } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface AccountRow {
  id: string;
  name: string;
  industry?: string;
  type: string; // client, vendor, partner
  tier?: string; // enterprise, mid-market, smb
  website?: string;
  primaryContact?: { id: string; name: string } | null;
  status: string;
  jobsCount?: number;
  placementsCount?: number;
  totalRevenue?: number | string;
  lastActivityAt?: string | Date;
  createdAt: string | Date;
}

// ==========================================
// STATUS CONFIG
// ==========================================

const accountTypeColors: Record<string, StatusColor> = {
  client: 'blue',
  vendor: 'purple',
  partner: 'green',
  prospect: 'yellow',
};

const accountTierColors: Record<string, StatusColor> = {
  enterprise: 'purple',
  'mid-market': 'blue',
  smb: 'green',
  startup: 'yellow',
};

const accountStatusColors: Record<string, StatusColor> = {
  active: 'green',
  inactive: 'gray',
  prospect: 'yellow',
  churned: 'red',
};

// ==========================================
// COLUMNS
// ==========================================

export function createAccountColumns(options?: {
  onView?: (account: AccountRow) => void;
  onEdit?: (account: AccountRow) => void;
  onViewContacts?: (account: AccountRow) => void;
  onViewJobs?: (account: AccountRow) => void;
  onMerge?: (account: AccountRow) => void;
}): ColumnDef<AccountRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Account',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'industry',
      header: 'Industry',
      cell: ({ row }) =>
        row.original.industry ? (
          <span className="text-sm">{row.original.industry}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.type}
          config={{ colors: accountTypeColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ row }) =>
        row.original.tier ? (
          <StatusColumn
            value={row.original.tier}
            config={{ colors: accountTierColors }}
          />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'website',
      header: 'Website',
      cell: ({ row }) =>
        row.original.website ? (
          <a
            href={row.original.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="truncate max-w-[120px]">
              {row.original.website.replace(/^https?:\/\//, '')}
            </span>
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'primaryContact',
      header: 'Primary Contact',
      cell: ({ row }) => <ContactLinkColumn contact={row.original.primaryContact} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.status}
          config={{ colors: accountStatusColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'jobsCount',
      header: 'Jobs',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-mono">{row.original.jobsCount ?? 0}</span>
        </div>
      ),
    },
    {
      accessorKey: 'placementsCount',
      header: 'Placements',
      cell: ({ row }) => (
        <span className="font-mono">{row.original.placementsCount ?? 0}</span>
      ),
    },
    {
      accessorKey: 'totalRevenue',
      header: 'Revenue',
      cell: ({ row }) => <CurrencyColumn value={row.original.totalRevenue} />,
      enableSorting: true,
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
            id: 'contacts',
            label: 'View Contacts',
            icon: Users,
            onClick: () => options?.onViewContacts?.(row.original),
          },
          {
            id: 'jobs',
            label: 'View Jobs',
            icon: Briefcase,
            onClick: () => options?.onViewJobs?.(row.original),
          },
          {
            id: 'merge',
            label: 'Merge Duplicate',
            icon: Merge,
            separator: true,
            onClick: () => options?.onMerge?.(row.original),
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

export const accountFilterDefs: FilterDefinition[] = [
  {
    id: 'type',
    label: 'Type',
    type: 'multi-select',
    options: [
      { value: 'client', label: 'Client', color: 'blue' },
      { value: 'vendor', label: 'Vendor', color: 'purple' },
      { value: 'partner', label: 'Partner', color: 'green' },
    ],
  },
  {
    id: 'tier',
    label: 'Tier',
    type: 'select',
    options: [
      { value: 'enterprise', label: 'Enterprise' },
      { value: 'mid-market', label: 'Mid-Market' },
      { value: 'smb', label: 'SMB' },
      { value: 'startup', label: 'Startup' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { value: 'active', label: 'Active', color: 'green' },
      { value: 'inactive', label: 'Inactive', color: 'gray' },
      { value: 'prospect', label: 'Prospect', color: 'yellow' },
    ],
  },
  {
    id: 'industry',
    label: 'Industry',
    type: 'text',
    placeholder: 'Search industry...',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface AccountsTableProps {
  data: AccountRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (account: AccountRow) => void;
  onView?: (account: AccountRow) => void;
  onEdit?: (account: AccountRow) => void;
  onViewContacts?: (account: AccountRow) => void;
  onViewJobs?: (account: AccountRow) => void;
  onMerge?: (account: AccountRow) => void;
}

export function AccountsTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onEdit,
  onViewContacts,
  onViewJobs,
  onMerge,
}: AccountsTableProps) {
  const columns = React.useMemo(
    () =>
      createAccountColumns({
        onView,
        onEdit,
        onViewContacts,
        onViewJobs,
        onMerge,
      }),
    [onView, onEdit, onViewContacts, onViewJobs, onMerge]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, excel: true, filename: 'accounts' }}
    />
  );
}

export default AccountsTable;
