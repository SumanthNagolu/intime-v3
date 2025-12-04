'use client';

import React from 'react';
import { Search, Grid, List, Filter, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { layoutTokens } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface ListLayoutProps {
  children: React.ReactNode;
  /** Page title */
  title: string;
  /** Create new button config */
  createButton?: {
    label: string;
    onClick: () => void;
  };
  /** Search input config */
  search?: {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
  };
  /** Filter dropdowns slot */
  filters?: React.ReactNode;
  /** View toggle (grid/list) */
  viewToggle?: {
    view: 'grid' | 'list';
    onChange: (view: 'grid' | 'list') => void;
  };
  /** Pagination slot */
  pagination?: React.ReactNode;
  /** Show loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Whether the list is empty */
  isEmpty?: boolean;
  className?: string;
}

/**
 * List/table page layout
 * Provides header with title + create button, toolbar, and content area
 */
export function ListLayout({
  children,
  title,
  createButton,
  search,
  filters,
  viewToggle,
  pagination,
  isLoading,
  emptyMessage = 'No items found',
  isEmpty,
  className,
}: ListLayoutProps) {
  return (
    <div
      className={cn('min-h-full flex flex-col', className)}
      style={{
        padding: `${layoutTokens.page.paddingY}px ${layoutTokens.page.paddingX}px`,
      }}
    >
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-heading font-bold text-charcoal">
            {title}
          </h1>
          {createButton && (
            <Button onClick={createButton.onClick} className="gap-2">
              <Plus size={16} />
              {createButton.label}
            </Button>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          {/* Search */}
          {search && (
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder={search.placeholder || 'Search...'}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Filters */}
          {filters && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                Filters
              </Button>
              {filters}
            </div>
          )}

          {/* View Toggle */}
          {viewToggle && (
            <div className="flex items-center gap-1 ml-auto">
              <Button
                variant={viewToggle.view === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => viewToggle.onChange('list')}
              >
                <List size={16} />
              </Button>
              <Button
                variant={viewToggle.view === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9"
                onClick={() => viewToggle.onChange('grid')}
              >
                <Grid size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{emptyMessage}</p>
              {createButton && (
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={createButton.onClick}
                >
                  <Plus size={16} />
                  {createButton.label}
                </Button>
              )}
            </div>
          ) : (
            children
          )}
        </div>

        {/* Pagination */}
        {pagination && !isEmpty && (
          <div className="mt-4 pt-4 border-t border-border">{pagination}</div>
        )}
      </div>
    </div>
  );
}
