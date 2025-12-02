/**
 * Pagination Utilities
 *
 * Page size options, cursor-based pagination, and URL sync.
 */

// ==========================================
// PAGE SIZE OPTIONS
// ==========================================

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_PAGE_SIZE: PageSize = 25;

// ==========================================
// PAGINATION STATE
// ==========================================

export interface PaginationState {
  pageIndex: number;
  pageSize: PageSize;
}

export interface PaginationInfo {
  /** Current page (0-indexed) */
  pageIndex: number;

  /** Items per page */
  pageSize: PageSize;

  /** Total number of pages */
  pageCount: number;

  /** Total number of items */
  totalItems: number;

  /** Is first page */
  isFirstPage: boolean;

  /** Is last page */
  isLastPage: boolean;

  /** First item index on current page (1-indexed) */
  firstItemIndex: number;

  /** Last item index on current page (1-indexed) */
  lastItemIndex: number;
}

/**
 * Calculate pagination info
 */
export function getPaginationInfo(
  pageIndex: number,
  pageSize: PageSize,
  totalItems: number
): PaginationInfo {
  const pageCount = Math.ceil(totalItems / pageSize);
  const isFirstPage = pageIndex === 0;
  const isLastPage = pageIndex >= pageCount - 1;
  const firstItemIndex = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const lastItemIndex = Math.min((pageIndex + 1) * pageSize, totalItems);

  return {
    pageIndex,
    pageSize,
    pageCount,
    totalItems,
    isFirstPage,
    isLastPage,
    firstItemIndex,
    lastItemIndex,
  };
}

/**
 * Get page range for pagination display
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): Array<number | 'ellipsis'> {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const range: Array<number | 'ellipsis'> = [];
  const halfVisible = Math.floor((maxVisible - 3) / 2);

  // Always show first page
  range.push(0);

  if (currentPage > halfVisible + 1) {
    range.push('ellipsis');
  }

  // Pages around current
  const start = Math.max(1, currentPage - halfVisible);
  const end = Math.min(totalPages - 2, currentPage + halfVisible);

  for (let i = start; i <= end; i++) {
    range.push(i);
  }

  if (currentPage < totalPages - halfVisible - 2) {
    range.push('ellipsis');
  }

  // Always show last page
  if (totalPages > 1) {
    range.push(totalPages - 1);
  }

  return range;
}

// ==========================================
// CURSOR-BASED PAGINATION
// ==========================================

export interface CursorPaginationState {
  cursor: string | null;
  limit: number;
  direction: 'forward' | 'backward';
}

export interface CursorPaginationResult<T> {
  items: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  hasPrev: boolean;
  totalCount?: number;
}

/**
 * Create initial cursor pagination state
 */
export function createCursorState(limit = 25): CursorPaginationState {
  return {
    cursor: null,
    limit,
    direction: 'forward',
  };
}

/**
 * Go to next page with cursor
 */
export function nextCursor(
  current: CursorPaginationState,
  nextCursorValue: string | null
): CursorPaginationState {
  return {
    ...current,
    cursor: nextCursorValue,
    direction: 'forward',
  };
}

/**
 * Go to previous page with cursor
 */
export function prevCursor(
  current: CursorPaginationState,
  prevCursorValue: string | null
): CursorPaginationState {
  return {
    ...current,
    cursor: prevCursorValue,
    direction: 'backward',
  };
}

// ==========================================
// OFFSET-BASED PAGINATION
// ==========================================

export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

/**
 * Get offset pagination params from page state
 */
export function getOffsetParams(
  pageIndex: number,
  pageSize: PageSize
): OffsetPaginationParams {
  return {
    offset: pageIndex * pageSize,
    limit: pageSize,
  };
}

/**
 * Get page index from offset
 */
export function getPageFromOffset(offset: number, pageSize: PageSize): number {
  return Math.floor(offset / pageSize);
}

// ==========================================
// CACHING
// ==========================================

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  totalCount: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Generate cache key for pagination
 */
export function getCacheKey(
  tableId: string,
  pageIndex: number,
  pageSize: PageSize,
  filters: Record<string, unknown>,
  sort: string | null
): string {
  const filterStr = JSON.stringify(filters);
  return `${tableId}:${pageIndex}:${pageSize}:${filterStr}:${sort}`;
}

/**
 * Get cached page data
 */
export function getCachedPage<T>(key: string): CacheEntry<T> | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  // Check if expired
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry;
}

/**
 * Cache page data
 */
export function cachePage<T>(
  key: string,
  data: T[],
  totalCount: number
): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    totalCount,
  });
}

/**
 * Invalidate cache for a table
 */
export function invalidateTableCache(tableId: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(`${tableId}:`)) {
      cache.delete(key);
    }
  }
}

/**
 * Clear all pagination cache
 */
export function clearPaginationCache(): void {
  cache.clear();
}

// ==========================================
// URL SYNC
// ==========================================

/**
 * Parse pagination from URL
 */
export function parsePaginationFromURL(
  searchParams: URLSearchParams
): PaginationState {
  const page = parseInt(searchParams.get('page') ?? '0', 10);
  const size = parseInt(searchParams.get('pageSize') ?? String(DEFAULT_PAGE_SIZE), 10);

  return {
    pageIndex: isNaN(page) || page < 0 ? 0 : page,
    pageSize: PAGE_SIZE_OPTIONS.includes(size as PageSize)
      ? (size as PageSize)
      : DEFAULT_PAGE_SIZE,
  };
}

/**
 * Serialize pagination to URL params
 */
export function serializePaginationToURL(
  state: PaginationState,
  params = new URLSearchParams()
): URLSearchParams {
  if (state.pageIndex > 0) {
    params.set('page', String(state.pageIndex));
  } else {
    params.delete('page');
  }

  if (state.pageSize !== DEFAULT_PAGE_SIZE) {
    params.set('pageSize', String(state.pageSize));
  } else {
    params.delete('pageSize');
  }

  return params;
}

// ==========================================
// HELPERS
// ==========================================

/**
 * Slice data array for current page
 */
export function sliceForPage<T>(
  data: T[],
  pageIndex: number,
  pageSize: PageSize
): T[] {
  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
}

/**
 * Validate page index
 */
export function validatePageIndex(
  pageIndex: number,
  totalItems: number,
  pageSize: PageSize
): number {
  const maxPage = Math.max(0, Math.ceil(totalItems / pageSize) - 1);
  return Math.max(0, Math.min(pageIndex, maxPage));
}

/**
 * Check if should prefetch next page
 */
export function shouldPrefetch(
  pageIndex: number,
  pageCount: number,
  prefetchPages = 1
): boolean {
  return pageIndex < pageCount - prefetchPages;
}
