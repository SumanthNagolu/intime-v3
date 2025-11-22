/**
 * XP Transaction Filters Component
 * ACAD-018
 *
 * Filter controls and export functionality for XP transactions
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';
import type { TransactionFilter, TransactionType } from '@/types/xp-transactions';
import { getTransactionTypeName } from '@/types/xp-transactions';

interface XPTransactionFiltersProps {
  filters: TransactionFilter;
  onFiltersChange: (filters: TransactionFilter) => void;
}

const TRANSACTION_TYPES: TransactionType[] = [
  'topic_completion',
  'quiz_passed',
  'lab_completed',
  'project_submitted',
  'bonus_achievement',
  'badge_earned',
  'penalty',
  'adjustment',
];

export function XPTransactionFilters({
  filters,
  onFiltersChange,
}: XPTransactionFiltersProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const exportMutation = trpc.xpTransactions.exportTransactions.useMutation({
    onSuccess: (data) => {
      // Create blob and download
      const blob = new Blob([data.data], { type: data.contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: `Downloaded ${data.filename}`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleExport = (format: 'csv' | 'json') => {
    exportMutation.mutate({
      format,
      filters,
    });
  };

  const handleTypeToggle = (type: TransactionType, checked: boolean) => {
    const currentTypes = filters.types || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter((t) => t !== type);

    onFiltersChange({
      ...filters,
      types: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFiltersChange({
      ...filters,
      startDate: date ? date.toISOString() : undefined,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFiltersChange({
      ...filters,
      endDate: date ? date.toISOString() : undefined,
    });
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      limit: 50,
      offset: 0,
    });
  };

  const hasActiveFilters =
    (filters.types && filters.types.length > 0) ||
    filters.startDate ||
    filters.endDate;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Export
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction Type Filters */}
        <div>
          <Label className="mb-3 block">Transaction Types</Label>
          <div className="grid grid-cols-2 gap-3">
            {TRANSACTION_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.types?.includes(type) || false}
                  onCheckedChange={(checked) =>
                    handleTypeToggle(type, checked as boolean)
                  }
                />
                <label
                  htmlFor={type}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {getTransactionTypeName(type)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={handleStartDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="mb-2 block">End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={handleEndDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="pt-4 border-t">
          <Label className="mb-3 block">Export Data</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleExport('csv')}
              disabled={exportMutation.isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleExport('json')}
              disabled={exportMutation.isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Export will include up to 10,000 transactions matching your current filters.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
