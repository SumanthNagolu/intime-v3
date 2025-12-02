/**
 * Filter Utilities
 *
 * Filter state management, URL sync, and filter presets.
 */

import type { ColumnFiltersState } from '@tanstack/react-table';
import type { FilterDefinition, QuickFilter, FilterOption } from '@/components/tables/types';

// ==========================================
// URL SYNC
// ==========================================

export interface URLFilterState {
  filters: Record<string, unknown>;
  sort?: { id: string; desc: boolean };
  page?: number;
  pageSize?: number;
  search?: string;
}

/**
 * Parse URL search params to filter state
 */
export function parseURLFilters(searchParams: URLSearchParams): URLFilterState {
  const state: URLFilterState = { filters: {} };

  // Parse filters
  searchParams.forEach((value, key) => {
    if (key === 'sort') {
      const [id, dir] = value.split(':');
      state.sort = { id, desc: dir === 'desc' };
    } else if (key === 'page') {
      state.page = parseInt(value, 10);
    } else if (key === 'pageSize') {
      state.pageSize = parseInt(value, 10);
    } else if (key === 'search' || key === 'q') {
      state.search = value;
    } else if (key.startsWith('f_')) {
      const filterKey = key.slice(2);
      // Handle array values (comma-separated)
      if (value.includes(',')) {
        state.filters[filterKey] = value.split(',');
      } else if (value === 'true' || value === 'false') {
        state.filters[filterKey] = value === 'true';
      } else if (!isNaN(Number(value))) {
        state.filters[filterKey] = Number(value);
      } else {
        state.filters[filterKey] = value;
      }
    }
  });

  return state;
}

/**
 * Serialize filter state to URL search params
 */
export function serializeFiltersToURL(state: URLFilterState): URLSearchParams {
  const params = new URLSearchParams();

  // Add filters
  Object.entries(state.filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        params.set(`f_${key}`, value.join(','));
      } else {
        params.set(`f_${key}`, String(value));
      }
    }
  });

  // Add sort
  if (state.sort) {
    params.set('sort', `${state.sort.id}:${state.sort.desc ? 'desc' : 'asc'}`);
  }

  // Add pagination
  if (state.page && state.page > 0) {
    params.set('page', String(state.page));
  }
  if (state.pageSize && state.pageSize !== 25) {
    params.set('pageSize', String(state.pageSize));
  }

  // Add search
  if (state.search) {
    params.set('q', state.search);
  }

  return params;
}

/**
 * Convert ColumnFiltersState to URL-compatible filters
 */
export function columnFiltersToURLFilters(
  columnFilters: ColumnFiltersState
): Record<string, unknown> {
  return columnFilters.reduce(
    (acc, filter) => {
      acc[filter.id] = filter.value;
      return acc;
    },
    {} as Record<string, unknown>
  );
}

/**
 * Convert URL filters to ColumnFiltersState
 */
export function urlFiltersToColumnFilters(
  filters: Record<string, unknown>
): ColumnFiltersState {
  return Object.entries(filters).map(([id, value]) => ({ id, value }));
}

// ==========================================
// FILTER PRESETS
// ==========================================

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  isDefault?: boolean;
  isShared?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

const PRESETS_STORAGE_KEY = 'table-filter-presets';

/**
 * Save filter preset to localStorage
 */
export function saveFilterPreset(
  tableId: string,
  preset: Omit<FilterPreset, 'createdAt'>
): FilterPreset {
  const fullPreset: FilterPreset = {
    ...preset,
    createdAt: new Date(),
  };

  const presets = loadFilterPresets(tableId);
  const existingIndex = presets.findIndex((p) => p.id === preset.id);

  if (existingIndex >= 0) {
    presets[existingIndex] = fullPreset;
  } else {
    presets.push(fullPreset);
  }

  localStorage.setItem(`${PRESETS_STORAGE_KEY}-${tableId}`, JSON.stringify(presets));
  return fullPreset;
}

/**
 * Load filter presets from localStorage
 */
export function loadFilterPresets(tableId: string): FilterPreset[] {
  try {
    const stored = localStorage.getItem(`${PRESETS_STORAGE_KEY}-${tableId}`);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Delete filter preset
 */
export function deleteFilterPreset(tableId: string, presetId: string): void {
  const presets = loadFilterPresets(tableId);
  const filtered = presets.filter((p) => p.id !== presetId);
  localStorage.setItem(`${PRESETS_STORAGE_KEY}-${tableId}`, JSON.stringify(filtered));
}

// ==========================================
// QUICK FILTERS
// ==========================================

/**
 * Apply quick filter
 */
export function applyQuickFilter(
  currentFilters: ColumnFiltersState,
  quickFilter: QuickFilter
): ColumnFiltersState {
  // Start with current filters
  const filterMap = new Map(currentFilters.map((f) => [f.id, f.value]));

  // Apply quick filter values
  Object.entries(quickFilter.values).forEach(([id, value]) => {
    if (value === undefined || value === null) {
      filterMap.delete(id);
    } else {
      filterMap.set(id, value);
    }
  });

  return Array.from(filterMap.entries()).map(([id, value]) => ({ id, value }));
}

/**
 * Check if quick filter is active
 */
export function isQuickFilterActive(
  currentFilters: ColumnFiltersState,
  quickFilter: QuickFilter
): boolean {
  return Object.entries(quickFilter.values).every(([id, value]) => {
    const currentFilter = currentFilters.find((f) => f.id === id);
    if (!currentFilter) return value === undefined || value === null;
    return JSON.stringify(currentFilter.value) === JSON.stringify(value);
  });
}

// ==========================================
// COMMON FILTER DEFINITIONS
// ==========================================

export const commonStatusOptions: FilterOption[] = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'archived', label: 'Archived', color: 'gray' },
];

export const priorityOptions: FilterOption[] = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'blue' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' },
];

export const visaAlertOptions: FilterOption[] = [
  { value: 'green', label: '181+ days', color: 'green' },
  { value: 'yellow', label: '90-180 days', color: 'yellow' },
  { value: 'orange', label: '30-90 days', color: 'orange' },
  { value: 'red', label: '<30 days', color: 'red' },
  { value: 'black', label: 'Expired', color: 'black' },
];

export const employmentTypeOptions: FilterOption[] = [
  { value: 'fte', label: 'Full-Time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
  { value: 'part_time', label: 'Part-Time' },
];

// ==========================================
// FILTER BUILDERS
// ==========================================

/**
 * Create a status filter definition
 */
export function createStatusFilter(
  id: string,
  label: string,
  options: FilterOption[]
): FilterDefinition {
  return {
    id,
    label,
    type: 'multi-select',
    options,
    placeholder: `Select ${label.toLowerCase()}...`,
  };
}

/**
 * Create a date range filter definition
 */
export function createDateRangeFilter(id: string, label: string): FilterDefinition {
  return {
    id,
    label,
    type: 'date-range',
    placeholder: 'Select date range...',
  };
}

/**
 * Create a search filter definition
 */
export function createSearchFilter(
  id: string,
  label: string,
  placeholder?: string
): FilterDefinition {
  return {
    id,
    label,
    type: 'text',
    placeholder: placeholder ?? `Search ${label.toLowerCase()}...`,
  };
}

/**
 * Create a select filter definition
 */
export function createSelectFilter(
  id: string,
  label: string,
  options: FilterOption[]
): FilterDefinition {
  return {
    id,
    label,
    type: 'select',
    options,
    placeholder: `Select ${label.toLowerCase()}...`,
  };
}

/**
 * Create a number range filter definition
 */
export function createNumberRangeFilter(
  id: string,
  label: string,
  placeholder?: string
): FilterDefinition {
  return {
    id,
    label,
    type: 'number-range',
    placeholder: placeholder ?? `Enter ${label.toLowerCase()} range...`,
  };
}

// ==========================================
// FILTER MATCHING
// ==========================================

/**
 * Check if a value matches a filter value
 */
export function matchesFilter(
  value: unknown,
  filterValue: unknown,
  filterType: FilterDefinition['type']
): boolean {
  if (filterValue === undefined || filterValue === null) return true;

  switch (filterType) {
    case 'text':
      return String(value ?? '')
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());

    case 'select':
      return value === filterValue;

    case 'multi-select':
      if (!Array.isArray(filterValue)) return value === filterValue;
      if (filterValue.length === 0) return true;
      return filterValue.includes(value);

    case 'boolean':
      return value === filterValue;

    case 'number':
      return Number(value) === Number(filterValue);

    case 'number-range':
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
      const num = Number(value);
      const [min, max] = filterValue;
      if (min !== null && num < min) return false;
      if (max !== null && num > max) return false;
      return true;

    case 'date':
      const dateValue = new Date(value as string);
      const filterDate = new Date(filterValue as string);
      return dateValue.toDateString() === filterDate.toDateString();

    case 'date-range':
      if (!Array.isArray(filterValue) || filterValue.length !== 2) return true;
      const dv = new Date(value as string);
      const [start, end] = filterValue.map((d) => (d ? new Date(d) : null));
      if (start && dv < start) return false;
      if (end && dv > end) return false;
      return true;

    default:
      return true;
  }
}
