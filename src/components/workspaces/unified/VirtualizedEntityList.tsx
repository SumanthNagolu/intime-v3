/**
 * VirtualizedEntityList Component
 *
 * A high-performance virtualized list for displaying entities.
 * Uses @tanstack/react-virtual for efficient DOM rendering.
 *
 * Features:
 * - Virtualization (only renders visible items)
 * - Search input with debounced filtering
 * - Filter chips for quick filtering
 * - Keyboard navigation (up/down arrows)
 * - Infinite scroll support
 * - Bulk selection support
 */

'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactNode,
  KeyboardEvent,
} from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, X, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMasterDetail } from './MasterDetailLayout';

// =====================================================
// TYPES
// =====================================================

export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  color?: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean;
}

export interface EntityListItem {
  id: string;
  [key: string]: unknown;
}

export interface VirtualizedEntityListProps<T extends EntityListItem> {
  data: T[];
  isLoading?: boolean;
  renderItem: (item: T, index: number, isSelected: boolean) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  onSelect?: (item: T) => void;
  selectedId?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  filters?: FilterConfig[];
  defaultFilters?: Record<string, string[]>;
  onFilterChange?: (filters: Record<string, string[]>) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  itemHeight?: number;
  overscan?: number;
  className?: string;
  listClassName?: string;
}

// =====================================================
// DEBOUNCE HOOK
// =====================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function VirtualizedEntityList<T extends EntityListItem>({
  data,
  isLoading = false,
  renderItem,
  renderEmpty,
  renderLoading,
  onSelect,
  selectedId: propSelectedId,
  searchPlaceholder = 'Search...',
  searchable = true,
  searchKeys = ['name' as keyof T, 'title' as keyof T],
  filters = [],
  defaultFilters = {},
  onFilterChange,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
  itemHeight = 72,
  overscan = 5,
  className,
  listClassName,
}: VirtualizedEntityListProps<T>) {
  // Get selected ID from MasterDetail context if available
  const masterDetailContext = useMasterDetail();
  const selectedId = propSelectedId ?? masterDetailContext?.selectedId ?? null;
  const setSelectedId = masterDetailContext?.setSelectedId;

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>(defaultFilters);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const parentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(query);
          }
          return false;
        })
      );
    }

    // Apply other filters
    Object.entries(activeFilters).forEach(([filterId, values]) => {
      if (values.length > 0) {
        result = result.filter((item) => {
          const itemValue = item[filterId as keyof T];
          if (typeof itemValue === 'string') {
            return values.includes(itemValue);
          }
          return true;
        });
      }
    });

    return result;
  }, [data, debouncedSearch, searchKeys, activeFilters]);

  // Virtual list setup
  const rowVirtualizer = useVirtualizer({
    count: filteredData.length + (hasMore ? 1 : 0), // +1 for load more trigger
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = rowVirtualizer.getVirtualItems();

  // Load more when reaching bottom
  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (lastItem && lastItem.index >= filteredData.length - 3) {
      onLoadMore();
    }
  }, [virtualItems, filteredData.length, hasMore, isLoadingMore, onLoadMore]);

  // Handle item selection
  const handleSelect = useCallback(
    (item: T) => {
      onSelect?.(item);
      setSelectedId?.(item.id);
    },
    [onSelect, setSelectedId]
  );

  // Handle filter change
  const handleFilterToggle = useCallback(
    (filterId: string, value: string) => {
      setActiveFilters((prev) => {
        const current = prev[filterId] || [];
        const filterConfig = filters.find((f) => f.id === filterId);
        let newValues: string[];

        if (filterConfig?.multiple) {
          newValues = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
        } else {
          newValues = current.includes(value) ? [] : [value];
        }

        const newFilters = { ...prev, [filterId]: newValues };
        onFilterChange?.(newFilters);
        return newFilters;
      });
    },
    [filters, onFilterChange]
  );

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setActiveFilters({});
    setSearchQuery('');
    onFilterChange?.({});
  }, [onFilterChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (filteredData.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) =>
            prev === null ? 0 : Math.min(prev + 1, filteredData.length - 1)
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev === null ? 0 : Math.max(prev - 1, 0)));
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedIndex !== null && filteredData[focusedIndex]) {
            handleSelect(filteredData[focusedIndex]);
          }
          break;
        case 'Escape':
          setFocusedIndex(null);
          break;
      }
    },
    [filteredData, focusedIndex, handleSelect]
  );

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex !== null) {
      rowVirtualizer.scrollToIndex(focusedIndex, { align: 'auto' });
    }
  }, [focusedIndex, rowVirtualizer]);

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery || Object.values(activeFilters).some((v) => v.length > 0);

  // Render loading state
  if (isLoading && data.length === 0) {
    return (
      renderLoading?.() || (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)} onKeyDown={handleKeyDown}>
      {/* Search & Filters Header */}
      <div className="flex-shrink-0 space-y-3 p-4 border-b border-border">
        {/* Search Input */}
        {searchable && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}

        {/* Filter Chips */}
        {filters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <div key={filter.id} className="flex flex-wrap gap-1">
                {filter.options.map((option) => {
                  const isActive = activeFilters[filter.id]?.includes(option.value);
                  return (
                    <Badge
                      key={option.id}
                      variant={isActive ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isActive
                          ? option.color || 'bg-rust hover:bg-rust/90'
                          : 'hover:bg-muted'
                      )}
                      onClick={() => handleFilterToggle(filter.id, option.value)}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span className="ml-1 text-xs opacity-70">({option.count})</span>
                      )}
                    </Badge>
                  );
                })}
              </div>
            ))}

            {/* Clear filters button */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleClearFilters}
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="text-xs text-muted-foreground">
          {filteredData.length} {filteredData.length === 1 ? 'item' : 'items'}
          {hasActiveFilters && ` (filtered from ${data.length})`}
        </div>
      </div>

      {/* Virtual List */}
      <div
        ref={parentRef}
        className={cn('flex-1 overflow-auto', listClassName)}
        tabIndex={0}
      >
        {filteredData.length === 0 ? (
          renderEmpty?.() || (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
              <Filter className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No items found</p>
              {hasActiveFilters && (
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={handleClearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )
        ) : (
          <div
            ref={listRef}
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const isLoadMoreTrigger = virtualItem.index >= filteredData.length;
              const item = filteredData[virtualItem.index];
              const isSelected = item?.id === selectedId;
              const isFocused = virtualItem.index === focusedIndex;

              if (isLoadMoreTrigger) {
                return (
                  <div
                    key="load-more"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="flex items-center justify-center"
                  >
                    {isLoadingMore ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLoadMore}
                        className="text-muted-foreground"
                      >
                        Load more
                      </Button>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className={cn(
                    'cursor-pointer transition-colors',
                    isSelected && 'bg-rust/10',
                    isFocused && !isSelected && 'bg-muted/50',
                    'hover:bg-muted/50'
                  )}
                  onClick={() => handleSelect(item)}
                  data-index={virtualItem.index}
                >
                  {renderItem(item, virtualItem.index, isSelected)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VirtualizedEntityList;
