'use client';

/**
 * Pipeline Filters Widget
 *
 * Custom filter bar for the submission pipeline with real data fetching.
 */

import React, { useState, useCallback } from 'react';
import { Calendar as CalendarIcon, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import type { SectionWidgetProps } from '../../registry/section-widget-registry';
import { trpc } from '@/lib/trpc/client';

// ==========================================
// TYPES
// ==========================================

interface FilterState {
  jobId: string | null;
  accountId: string | null;
  dateRange: { start: Date | null; end: Date | null };
  priority: string[];
}

interface PipelineFiltersConfig {
  onFilterChange?: (filters: FilterState) => void;
}

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'high', label: 'High', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { value: 'low', label: 'Low', color: 'bg-stone-100 text-stone-700 border-stone-300' },
];

const DATE_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export function PipelineFilters({ definition, context }: SectionWidgetProps) {
  const config = definition.componentProps as PipelineFiltersConfig | undefined;

  // Fetch jobs and accounts for dropdowns
  const { data: jobsData } = trpc.ats.jobs.list.useQuery({
    limit: 100,
    status: 'open',
  });

  const { data: accountsData } = trpc.crm.accounts.list.useQuery({
    page: 1,
    pageSize: 100,
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    jobId: null,
    accountId: null,
    dateRange: { start: null, end: null },
    priority: [],
  });

  const [dateOpen, setDateOpen] = useState(false);

  // Update handler
  const handleFilterChange = useCallback((key: keyof FilterState, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    config?.onFilterChange?.(newFilters);
  }, [filters, config]);

  // Date preset handler
  const handleDatePreset = useCallback((days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = days === 0 ? today : addDays(today, days);
    handleFilterChange('dateRange', { start: today, end: endDate });
    setDateOpen(false);
  }, [handleFilterChange]);

  // Priority toggle
  const togglePriority = useCallback((priority: string) => {
    const current = filters.priority;
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority];
    handleFilterChange('priority', updated);
  }, [filters.priority, handleFilterChange]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const cleared: FilterState = {
      jobId: null,
      accountId: null,
      dateRange: { start: null, end: null },
      priority: [],
    };
    setFilters(cleared);
    config?.onFilterChange?.(cleared);
  }, [config]);

  const hasActiveFilters = filters.jobId || filters.accountId ||
    filters.dateRange.start || filters.priority.length > 0;

  if (context?.isLoading) {
    return (
      <div className="flex items-center gap-4 animate-pulse">
        <div className="h-10 w-40 bg-stone-200 rounded" />
        <div className="h-10 w-40 bg-stone-200 rounded" />
        <div className="h-10 w-48 bg-stone-200 rounded" />
        <div className="h-8 w-32 bg-stone-200 rounded" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 py-2">
      {/* Job Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-500">Job</label>
        <Select
          value={filters.jobId || ''}
          onValueChange={(v) => handleFilterChange('jobId', v || null)}
        >
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Jobs</SelectItem>
            {jobsData?.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Client Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-500">Client</label>
        <Select
          value={filters.accountId || ''}
          onValueChange={(v) => handleFilterChange('accountId', v || null)}
        >
          <SelectTrigger className="w-48 h-9">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Clients</SelectItem>
            {accountsData?.items?.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-500">Date Range</label>
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-52 h-9 justify-start text-left font-normal",
                !filters.dateRange.start && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.start ? (
                <>
                  {format(filters.dateRange.start, 'MMM d')}
                  {filters.dateRange.end && (
                    <>
                      <ArrowRight className="mx-1 h-3 w-3" />
                      {format(filters.dateRange.end, 'MMM d')}
                    </>
                  )}
                </>
              ) : (
                'Select dates'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2 border-b flex flex-wrap gap-1">
              {DATE_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleDatePreset(preset.days)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="flex">
              <Calendar
                mode="single"
                selected={filters.dateRange.start || undefined}
                onSelect={(date) => {
                  handleFilterChange('dateRange', { ...filters.dateRange, start: date || null });
                }}
                initialFocus
              />
              <Calendar
                mode="single"
                selected={filters.dateRange.end || undefined}
                onSelect={(date) => {
                  handleFilterChange('dateRange', { ...filters.dateRange, end: date || null });
                  setDateOpen(false);
                }}
                disabled={(date) => filters.dateRange.start ? date < filters.dateRange.start : false}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Priority Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-stone-500">Priority</label>
        <div className="flex items-center gap-1 h-9">
          {PRIORITY_OPTIONS.map((option) => {
            const isSelected = filters.priority.includes(option.value);
            return (
              <Badge
                key={option.value}
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors h-7 px-2",
                  isSelected
                    ? option.color
                    : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                )}
                onClick={() => togglePriority(option.value)}
              >
                {option.label}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-stone-500 hover:text-stone-700 mt-5"
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}

export default PipelineFilters;
