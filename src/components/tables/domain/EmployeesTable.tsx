'use client';

/**
 * EmployeesTable Component
 *
 * HR employees list with department, status, and manager.
 */

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { User, Building2, Eye, Edit, FileText, Calendar } from 'lucide-react';

import { DataTable } from '../DataTable';
import { StatusColumn } from '../columns/StatusColumn';
import { DateColumn } from '../columns/DateColumn';
import { UserColumn } from '../columns/UserColumn';
import { ActionsColumn } from '../columns/ActionsColumn';

import { Badge } from '@/components/ui/badge';
import type { StatusColor, ActionItem, FilterDefinition } from '../types';

// ==========================================
// TYPES
// ==========================================

export interface EmployeeRow {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  employeeNumber?: string;
  department?: string;
  jobTitle?: string;
  manager?: { id: string; name: string; avatarUrl?: string } | null;
  employmentType: string;
  status: string;
  hireDate: string | Date;
  location?: string;
  workMode?: string;
}

// ==========================================
// STATUS CONFIG
// ==========================================

const employeeStatusColors: Record<string, StatusColor> = {
  onboarding: 'blue',
  active: 'green',
  on_leave: 'yellow',
  terminated: 'red',
};

const employmentTypeColors: Record<string, StatusColor> = {
  fte: 'green',
  contractor: 'blue',
  intern: 'purple',
  part_time: 'yellow',
};

// ==========================================
// COLUMNS
// ==========================================

export function createEmployeeColumns(options?: {
  onView?: (employee: EmployeeRow) => void;
  onEdit?: (employee: EmployeeRow) => void;
  onViewDocuments?: (employee: EmployeeRow) => void;
  onScheduleReview?: (employee: EmployeeRow) => void;
}): ColumnDef<EmployeeRow>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Employee',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <UserColumn
            value={{
              name: row.original.name,
              email: row.original.email,
              avatarUrl: row.original.avatarUrl,
            }}
          />
          {row.original.employeeNumber && (
            <span className="text-xs text-muted-foreground font-mono">
              #{row.original.employeeNumber}
            </span>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) =>
        row.original.department ? (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.department}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'jobTitle',
      header: 'Job Title',
      cell: ({ row }) =>
        row.original.jobTitle ? (
          <span>{row.original.jobTitle}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      accessorKey: 'manager',
      header: 'Manager',
      cell: ({ row }) => <UserColumn value={row.original.manager} />,
    },
    {
      accessorKey: 'employmentType',
      header: 'Type',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.employmentType}
          config={{
            colors: employmentTypeColors,
            labels: {
              fte: 'Full-Time',
              contractor: 'Contractor',
              intern: 'Intern',
              part_time: 'Part-Time',
            },
          }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusColumn
          value={row.original.status}
          config={{ colors: employeeStatusColors }}
        />
      ),
      filterFn: 'equals',
    },
    {
      accessorKey: 'hireDate',
      header: 'Hire Date',
      cell: ({ row }) => <DateColumn value={row.original.hireDate} config={{ format: 'short' }} />,
      enableSorting: true,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      cell: ({ row }) =>
        row.original.location ? (
          <div className="flex flex-col">
            <span>{row.original.location}</span>
            {row.original.workMode && (
              <span className="text-xs text-muted-foreground capitalize">
                {row.original.workMode.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
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
            id: 'documents',
            label: 'View Documents',
            icon: FileText,
            onClick: () => options?.onViewDocuments?.(row.original),
          },
          {
            id: 'review',
            label: 'Schedule Review',
            icon: Calendar,
            onClick: () => options?.onScheduleReview?.(row.original),
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

export const employeeFilterDefs: FilterDefinition[] = [
  {
    id: 'status',
    label: 'Status',
    type: 'multi-select',
    options: [
      { value: 'onboarding', label: 'Onboarding', color: 'blue' },
      { value: 'active', label: 'Active', color: 'green' },
      { value: 'on_leave', label: 'On Leave', color: 'yellow' },
      { value: 'terminated', label: 'Terminated', color: 'red' },
    ],
  },
  {
    id: 'employmentType',
    label: 'Employment Type',
    type: 'multi-select',
    options: [
      { value: 'fte', label: 'Full-Time' },
      { value: 'contractor', label: 'Contractor' },
      { value: 'intern', label: 'Intern' },
      { value: 'part_time', label: 'Part-Time' },
    ],
  },
  {
    id: 'department',
    label: 'Department',
    type: 'text',
    placeholder: 'Search department...',
  },
  {
    id: 'hireDate',
    label: 'Hire Date',
    type: 'date-range',
  },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

interface EmployeesTableProps {
  data: EmployeeRow[];
  loading?: boolean;
  error?: Error | null;
  onRowClick?: (employee: EmployeeRow) => void;
  onView?: (employee: EmployeeRow) => void;
  onEdit?: (employee: EmployeeRow) => void;
  onViewDocuments?: (employee: EmployeeRow) => void;
  onScheduleReview?: (employee: EmployeeRow) => void;
}

export function EmployeesTable({
  data,
  loading,
  error,
  onRowClick,
  onView,
  onEdit,
  onViewDocuments,
  onScheduleReview,
}: EmployeesTableProps) {
  const columns = React.useMemo(
    () =>
      createEmployeeColumns({
        onView,
        onEdit,
        onViewDocuments,
        onScheduleReview,
      }),
    [onView, onEdit, onViewDocuments, onScheduleReview]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      error={error}
      onRowClick={onRowClick}
      exportOptions={{ csv: true, excel: true, filename: 'employees' }}
    />
  );
}

export default EmployeesTable;
