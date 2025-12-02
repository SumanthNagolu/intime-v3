/**
 * Table Utilities - Main Export
 *
 * All utilities for working with data tables.
 */

// Column utilities
export {
  createColumnBuilder,
  getNestedValue,
  createAccessor,
  formatNumber,
  formatCurrency,
  formatDate,
  getRelativeTime,
  getDaysFromNow,
  getAlertLevel,
} from './columns';

export type { ColumnBuilder } from './columns';

// Filter utilities
export {
  parseURLFilters,
  serializeFiltersToURL,
  columnFiltersToURLFilters,
  urlFiltersToColumnFilters,
  saveFilterPreset,
  loadFilterPresets,
  deleteFilterPreset,
  applyQuickFilter,
  isQuickFilterActive,
  createStatusFilter,
  createDateRangeFilter,
  createSearchFilter,
  createSelectFilter,
  createNumberRangeFilter,
  matchesFilter,
  commonStatusOptions,
  priorityOptions,
  visaAlertOptions,
  employmentTypeOptions,
} from './filters';

export type { URLFilterState, FilterPreset } from './filters';

// Sorting utilities
export {
  createSort,
  createMultiSort,
  toggleSort,
  getSortDirection,
  getSortIndex,
  clearSort,
  resetSort,
  defaultSorts,
  domainDefaultSorts,
  compareValues,
  createComparator,
  createOrderedSort,
  prioritySortOrder,
  statusSortOrder,
  visaAlertSortOrder,
} from './sorting';

// Pagination utilities
export {
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  getPaginationInfo,
  getPageRange,
  createCursorState,
  nextCursor,
  prevCursor,
  getOffsetParams,
  getPageFromOffset,
  getCacheKey,
  getCachedPage,
  cachePage,
  invalidateTableCache,
  clearPaginationCache,
  parsePaginationFromURL,
  serializePaginationToURL,
  sliceForPage,
  validatePageIndex,
  shouldPrefetch,
} from './pagination';

export type {
  PageSize,
  PaginationState,
  PaginationInfo,
  CursorPaginationState,
  CursorPaginationResult,
  OffsetPaginationParams,
} from './pagination';

// Export utilities
export {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  columnsToExportColumns,
  exportWithProgress,
} from './export';

export type {
  ExportFormat,
  ExportColumn,
  ExportOptions,
  ExportProgress,
  ExportProgressCallback,
} from './export';
