'use client';

/**
 * DataTable Component
 *
 * Feature-rich data table with TanStack Table integration.
 * Supports sorting, filtering, pagination, selection, and more.
 */

import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Columns3,
  Download,
  Loader2,
  Search,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

import type { DataTableProps, DensityMode, BulkAction } from './types';
import { exportToCSV, exportToExcel, exportToPDF, columnsToExportColumns } from '@/lib/tables';

// ==========================================
// DENSITY STYLES
// ==========================================

const densityStyles: Record<DensityMode, { row: string; cell: string }> = {
  compact: {
    row: 'h-8',
    cell: 'py-1 px-2 text-xs',
  },
  comfortable: {
    row: 'h-12',
    cell: 'py-2 px-3 text-sm',
  },
  spacious: {
    row: 'h-16',
    cell: 'py-4 px-4 text-sm',
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export function DataTable<TData, TValue>({
  columns,
  data,
  idField = 'id' as keyof TData,
  pagination,
  sorting: sortingConfig,
  filters: filterConfig,
  selection,
  onRowClick,
  bulkActions = [],
  emptyState,
  loading = false,
  error = null,
  density = 'comfortable',
  stickyHeader = true,
  columnVisibility: enableColumnVisibility = true,
  columnReordering = false,
  exportOptions,
  toolbar,
  caption,
  className,
}: DataTableProps<TData, TValue>) {
  // ==========================================
  // STATE
  // ==========================================

  const [localSorting, setLocalSorting] = React.useState<SortingState>(
    sortingConfig?.sortBy ?? []
  );
  const [localFilters, setLocalFilters] = React.useState<ColumnFiltersState>(
    filterConfig?.filters ?? []
  );
  const [globalFilter, setGlobalFilter] = React.useState(
    filterConfig?.globalFilter ?? ''
  );
  const [columnVisibilityState, setColumnVisibilityState] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // Sync with external state
  React.useEffect(() => {
    if (sortingConfig?.sortBy) {
      setLocalSorting(sortingConfig.sortBy);
    }
  }, [sortingConfig?.sortBy]);

  React.useEffect(() => {
    if (filterConfig?.filters) {
      setLocalFilters(filterConfig.filters);
    }
  }, [filterConfig?.filters]);

  React.useEffect(() => {
    if (filterConfig?.globalFilter !== undefined) {
      setGlobalFilter(filterConfig.globalFilter);
    }
  }, [filterConfig?.globalFilter]);

  // ==========================================
  // ENHANCED COLUMNS
  // ==========================================

  const enhancedColumns = React.useMemo(() => {
    const cols: ColumnDef<TData, TValue>[] = [];

    // Add selection column if enabled
    if (selection) {
      cols.push({
        id: 'select',
        header: ({ table }) =>
          selection.enableSelectAll !== false ? (
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
              aria-label="Select all"
            />
          ) : null,
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      } as ColumnDef<TData, TValue>);
    }

    // Add user columns
    cols.push(...columns);

    return cols;
  }, [columns, selection]);

  // ==========================================
  // TABLE INSTANCE
  // ==========================================

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    state: {
      sorting: localSorting,
      columnFilters: localFilters,
      globalFilter,
      columnVisibility: columnVisibilityState,
      rowSelection,
    },
    // Sorting
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(localSorting) : updater;
      setLocalSorting(newSorting);
      sortingConfig?.onSortChange?.(newSorting);
    },
    // Filtering
    onColumnFiltersChange: (updater) => {
      const newFilters = typeof updater === 'function' ? updater(localFilters) : updater;
      setLocalFilters(newFilters);
      filterConfig?.onFilterChange?.(newFilters);
    },
    onGlobalFilterChange: (value) => {
      setGlobalFilter(value);
      filterConfig?.onGlobalFilterChange?.(value);
    },
    // Visibility
    onColumnVisibilityChange: setColumnVisibilityState,
    // Selection
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      // Notify parent of selection change
      if (selection) {
        const selectedIds = Object.keys(newSelection).filter((key) => newSelection[key]);
        const ids = selectedIds.map((index) => {
          const row = data[parseInt(index, 10)];
          return String((row as Record<string, unknown>)[idField as string] ?? index);
        });
        selection.onSelectionChange(ids);
      }
    },
    // Row models
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: sortingConfig?.manual ? undefined : getSortedRowModel(),
    getFilteredRowModel: filterConfig?.manual ? undefined : getFilteredRowModel(),
    getPaginationRowModel: pagination?.manual ? undefined : getPaginationRowModel(),
    // Options
    manualSorting: sortingConfig?.manual,
    manualFiltering: filterConfig?.manual,
    manualPagination: pagination?.manual,
    enableMultiSort: sortingConfig?.multiSort ?? false,
    enableRowSelection: !!selection,
    enableMultiRowSelection: selection?.mode !== 'single',
    getRowId: (row) => String((row as Record<string, unknown>)[idField as string] ?? ''),
  });

  // ==========================================
  // SELECTED IDS
  // ==========================================

  const selectedIds = React.useMemo(() => {
    return Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((index) => {
        const row = data[parseInt(index, 10)];
        return String((row as Record<string, unknown>)[idField as string] ?? index);
      });
  }, [rowSelection, data, idField]);

  // ==========================================
  // EXPORT HANDLER
  // ==========================================

  const handleExport = React.useCallback(
    (format: 'csv' | 'excel' | 'pdf') => {
      const exportCols = columnsToExportColumns(
        columns as ColumnDef<TData>[],
        Object.keys(columnVisibilityState).filter((k) => columnVisibilityState[k] !== false)
      );

      const filename = exportOptions?.filename ?? 'export';

      switch (format) {
        case 'csv':
          exportToCSV(data as Record<string, unknown>[], exportCols, { filename });
          break;
        case 'excel':
          exportToExcel(data as Record<string, unknown>[], exportCols, { filename });
          break;
        case 'pdf':
          exportToPDF(data as Record<string, unknown>[], exportCols, { filename });
          break;
      }
    },
    [columns, columnVisibilityState, data, exportOptions?.filename]
  );

  // ==========================================
  // RENDER
  // ==========================================

  const styles = densityStyles[density];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Global Search */}
          {filterConfig && (
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  filterConfig.onGlobalFilterChange?.(e.target.value);
                }}
                className="pl-8 pr-8"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0"
                  onClick={() => {
                    setGlobalFilter('');
                    filterConfig.onGlobalFilterChange?.('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Custom Toolbar */}
          {toolbar}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedIds.length > 0 && bulkActions.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
              <span className="text-sm font-medium">{selectedIds.length} selected</span>
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant ?? 'outline'}
                  size="sm"
                  onClick={() => action.onClick(selectedIds)}
                  disabled={action.disabled || action.loading}
                >
                  {action.loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  {action.icon && <action.icon className="mr-2 h-3 w-3" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns3 className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {exportOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {exportOptions.csv !== false && (
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export CSV
                  </DropdownMenuItem>
                )}
                {exportOptions.excel !== false && (
                  <DropdownMenuItem onClick={() => handleExport('excel')}>
                    Export Excel
                  </DropdownMenuItem>
                )}
                {exportOptions.pdf !== false && (
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Export PDF
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          {caption && <caption className="sr-only">{caption}</caption>}

          <TableHeader className={stickyHeader ? 'sticky top-0 bg-background z-10' : ''}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={styles.row}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className={cn(
                      styles.cell,
                      header.column.getCanSort() && 'cursor-pointer select-none'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="ml-auto">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {/* Loading State */}
            {loading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className={styles.row}>
                    {enhancedColumns.map((_, j) => (
                      <TableCell key={`skeleton-${i}-${j}`} className={styles.cell}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}

            {/* Error State */}
            {!loading && error && (
              <TableRow>
                <TableCell
                  colSpan={enhancedColumns.length}
                  className="h-32 text-center text-destructive"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-medium">Error loading data</span>
                    <span className="text-sm text-muted-foreground">{error.message}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Empty State */}
            {!loading && !error && table.getRowModel().rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={enhancedColumns.length} className="h-32 text-center">
                  {emptyState ?? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <span>No results found</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}

            {/* Data Rows */}
            {!loading &&
              !error &&
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    styles.row,
                    onRowClick && 'cursor-pointer',
                    row.getIsSelected() && 'bg-muted'
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={styles.cell}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {pagination.totalRows !== undefined && (
              <>
                Showing{' '}
                {Math.min(pagination.pageIndex * pagination.pageSize + 1, pagination.totalRows)} -{' '}
                {Math.min((pagination.pageIndex + 1) * pagination.pageSize, pagination.totalRows)}{' '}
                of {pagination.totalRows}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Page Size */}
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {(pagination.pageSizeOptions ?? [10, 25, 50, 100]).map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>

            {/* Page Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(0)}
                disabled={pagination.pageIndex === 0}
              >
                {'<<'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                disabled={pagination.pageIndex === 0}
              >
                {'<'}
              </Button>

              <span className="px-2 text-sm">
                Page {pagination.pageIndex + 1} of {pagination.pageCount}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                disabled={pagination.pageIndex >= pagination.pageCount - 1}
              >
                {'>'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.pageCount - 1)}
                disabled={pagination.pageIndex >= pagination.pageCount - 1}
              >
                {'>>'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
