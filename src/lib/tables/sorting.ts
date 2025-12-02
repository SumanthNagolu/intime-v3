/**
 * Sorting Utilities
 *
 * Sort state management and default configurations.
 */

import type { SortingState } from '@tanstack/react-table';

// ==========================================
// SORT HELPERS
// ==========================================

/**
 * Create a single-column sort state
 */
export function createSort(id: string, desc = false): SortingState {
  return [{ id, desc }];
}

/**
 * Create a multi-column sort state
 */
export function createMultiSort(
  sorts: Array<{ id: string; desc?: boolean }>
): SortingState {
  return sorts.map(({ id, desc = false }) => ({ id, desc }));
}

/**
 * Toggle sort direction
 */
export function toggleSort(
  currentSort: SortingState,
  columnId: string,
  multiSort = false
): SortingState {
  const existingIndex = currentSort.findIndex((s) => s.id === columnId);

  if (existingIndex === -1) {
    // Column not in sort - add ascending
    if (multiSort) {
      return [...currentSort, { id: columnId, desc: false }];
    }
    return [{ id: columnId, desc: false }];
  }

  const existing = currentSort[existingIndex];

  if (!existing.desc) {
    // Currently ascending - switch to descending
    const newSort = [...currentSort];
    newSort[existingIndex] = { id: columnId, desc: true };
    return newSort;
  }

  // Currently descending - remove from sort
  if (multiSort) {
    return currentSort.filter((s) => s.id !== columnId);
  }
  return [];
}

/**
 * Get sort direction for a column
 */
export function getSortDirection(
  sortState: SortingState,
  columnId: string
): 'asc' | 'desc' | null {
  const sort = sortState.find((s) => s.id === columnId);
  if (!sort) return null;
  return sort.desc ? 'desc' : 'asc';
}

/**
 * Get sort index for multi-column sorting
 */
export function getSortIndex(sortState: SortingState, columnId: string): number {
  return sortState.findIndex((s) => s.id === columnId);
}

/**
 * Clear all sorts
 */
export function clearSort(): SortingState {
  return [];
}

/**
 * Reset to default sort
 */
export function resetSort(defaultSort: SortingState): SortingState {
  return [...defaultSort];
}

// ==========================================
// DEFAULT SORT CONFIGURATIONS
// ==========================================

export const defaultSorts = {
  /** Sort by created date, newest first */
  newestFirst: createSort('createdAt', true),

  /** Sort by created date, oldest first */
  oldestFirst: createSort('createdAt', false),

  /** Sort by updated date, most recent first */
  recentlyUpdated: createSort('updatedAt', true),

  /** Sort by name alphabetically */
  nameAsc: createSort('name', false),

  /** Sort by name reverse alphabetically */
  nameDesc: createSort('name', true),

  /** Sort by status */
  statusAsc: createSort('status', false),

  /** Sort by priority (high to low) */
  priorityDesc: createSort('priority', true),

  /** Sort by due date (soonest first) */
  dueDateAsc: createSort('dueDate', false),

  /** Sort by due date (latest first) */
  dueDateDesc: createSort('dueDate', true),
} as const;

// ==========================================
// DOMAIN-SPECIFIC DEFAULT SORTS
// ==========================================

export const domainDefaultSorts = {
  // Recruiting
  jobs: createMultiSort([
    { id: 'priority', desc: true },
    { id: 'createdAt', desc: true },
  ]),
  candidates: createSort('lastActivityAt', true),
  submissions: createMultiSort([
    { id: 'status' },
    { id: 'submittedAt', desc: true },
  ]),
  placements: createSort('startDate', true),

  // CRM
  accounts: createSort('name', false),
  contacts: createSort('name', false),
  leads: createMultiSort([
    { id: 'status' },
    { id: 'createdAt', desc: true },
  ]),
  deals: createMultiSort([
    { id: 'stage' },
    { id: 'expectedCloseDate', desc: false },
  ]),

  // Bench Sales
  benchConsultants: createMultiSort([
    { id: 'visaAlertLevel', desc: true },
    { id: 'daysOnBench', desc: true },
  ]),
  vendors: createSort('name', false),
  hotlists: createSort('createdAt', true),
  immigration: createSort('visaExpiryDate', false),

  // HR
  employees: createSort('name', false),
  timeoff: createSort('startDate', true),
  payroll: createSort('payPeriod', true),
  performance: createSort('dueDate', false),

  // Activities
  activities: createMultiSort([
    { id: 'priority', desc: true },
    { id: 'dueDate', desc: false },
  ]),
  tasks: createMultiSort([
    { id: 'status' },
    { id: 'dueDate', desc: false },
  ]),
} as const;

// ==========================================
// SORT VALUE COMPARATORS
// ==========================================

/**
 * Compare two values for sorting
 */
export function compareValues<T>(
  a: T,
  b: T,
  desc: boolean,
  type: 'string' | 'number' | 'date' | 'boolean' = 'string'
): number {
  let comparison = 0;

  if (a === null || a === undefined) {
    comparison = 1;
  } else if (b === null || b === undefined) {
    comparison = -1;
  } else {
    switch (type) {
      case 'number':
        comparison = Number(a) - Number(b);
        break;
      case 'date':
        comparison = new Date(a as unknown as string).getTime() - new Date(b as unknown as string).getTime();
        break;
      case 'boolean':
        comparison = (a ? 1 : 0) - (b ? 1 : 0);
        break;
      default:
        comparison = String(a).localeCompare(String(b));
    }
  }

  return desc ? -comparison : comparison;
}

/**
 * Create a comparator function for sorting
 */
export function createComparator<T extends Record<string, unknown>>(
  sortState: SortingState,
  columnTypes: Record<string, 'string' | 'number' | 'date' | 'boolean'>
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    for (const sort of sortState) {
      const type = columnTypes[sort.id] ?? 'string';
      const comparison = compareValues(
        a[sort.id],
        b[sort.id],
        sort.desc,
        type
      );
      if (comparison !== 0) return comparison;
    }
    return 0;
  };
}

// ==========================================
// PRIORITY SORT ORDER
// ==========================================

export const prioritySortOrder = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
} as const;

export const statusSortOrder = {
  // Activity statuses
  scheduled: 0,
  open: 1,
  in_progress: 2,
  completed: 3,
  skipped: 4,
  cancelled: 5,
  // Common statuses
  active: 0,
  pending: 1,
  inactive: 2,
  archived: 3,
} as const;

export const visaAlertSortOrder = {
  black: 0,
  red: 1,
  orange: 2,
  yellow: 3,
  green: 4,
} as const;

/**
 * Create a custom sort function for ordered values
 */
export function createOrderedSort<T extends string>(
  order: Record<T, number>
): (a: T, b: T) => number {
  return (a, b) => {
    const aOrder = order[a] ?? 999;
    const bOrder = order[b] ?? 999;
    return aOrder - bOrder;
  };
}
