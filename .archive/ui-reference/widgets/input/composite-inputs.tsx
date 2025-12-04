/**
 * Composite Input Widgets
 *
 * Complex input widgets for rates, date ranges, etc.
 * These combine multiple inputs into a cohesive component.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import type { WidgetRenderProps } from '../../registry/widget-registry';
import type { FieldDefinition } from '../../types';

// ==========================================
// RATE INPUT (Bill/Pay Rate Pair)
// ==========================================

interface RateValue {
  billRate: number | null;
  payRate: number | null;
  rateType?: string;
  currency?: string;
}

interface RateInputConfig {
  showMargin?: boolean;
  showRateType?: boolean;
  showCurrency?: boolean;
  currencies?: string[];
  rateTypes?: string[];
}

export function RateInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<RateValue | null>) {
  const fieldDef = definition as FieldDefinition;
  const config = (fieldDef.config as RateInputConfig) || {};
  
  const {
    showMargin = true,
    showRateType = false,
    showCurrency = false,
    currencies = ['USD', 'CAD'],
    rateTypes = ['hourly', 'daily', 'annual'],
  } = config;

  const [localValue, setLocalValue] = useState<RateValue>({
    billRate: value?.billRate ?? null,
    payRate: value?.payRate ?? null,
    rateType: value?.rateType ?? 'hourly',
    currency: value?.currency ?? 'USD',
  });

  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = useCallback((field: keyof RateValue, fieldValue: number | string | null) => {
    const newValue = { ...localValue, [field]: fieldValue };
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [localValue, onChange]);

  const margin = localValue.billRate && localValue.payRate
    ? localValue.billRate - localValue.payRate
    : null;
  
  const marginPercent = localValue.billRate && localValue.payRate && localValue.billRate > 0
    ? ((localValue.billRate - localValue.payRate) / localValue.billRate) * 100
    : null;

  return (
    <div className={cn('space-y-3', className)}>
      {(showRateType || showCurrency) && (
        <div className="flex gap-2">
          {showRateType && (
            <Select
              value={localValue.rateType}
              onValueChange={(v) => handleChange('rateType', v)}
              disabled={disabled}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {rateTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {showCurrency && (
            <Select
              value={localValue.currency}
              onValueChange={(v) => handleChange('currency', v)}
              disabled={disabled}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Bill Rate</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={localValue.billRate ?? ''}
              onChange={(e) => handleChange('billRate', e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="0.00"
              step="0.01"
              className={cn('pl-7', error && 'border-red-500')}
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Pay Rate</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              type="number"
              value={localValue.payRate ?? ''}
              onChange={(e) => handleChange('payRate', e.target.value ? parseFloat(e.target.value) : null)}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="0.00"
              step="0.01"
              className={cn('pl-7', error && 'border-red-500')}
            />
          </div>
        </div>
      </div>

      {showMargin && margin !== null && (
        <div className="flex items-center gap-4 p-2 bg-stone-50 rounded-md text-sm">
          <div>
            <span className="text-muted-foreground">Margin:</span>{' '}
            <span className={cn(
              'font-medium',
              margin >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              ${margin.toFixed(2)}
            </span>
          </div>
          {marginPercent !== null && (
            <div>
              <span className="text-muted-foreground">({marginPercent.toFixed(1)}%)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// DATE RANGE PICKER
// ==========================================

interface DateRangeValue {
  start: string | Date | null;
  end: string | Date | null;
}

interface DateRangeConfig {
  presets?: Array<{ label: string; days: number }>;
  showPresets?: boolean;
}

const DEFAULT_PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'This Week', days: 7 },
  { label: 'This Month', days: 30 },
  { label: 'This Quarter', days: 90 },
];

export function DateRangePicker({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<DateRangeValue | null>) {
  const fieldDef = definition as FieldDefinition;
  const config = (fieldDef.config as DateRangeConfig) || {};
  const { presets = DEFAULT_PRESETS, showPresets = true } = config;

  const [localValue, setLocalValue] = useState<DateRangeValue>({
    start: value?.start ?? null,
    end: value?.end ?? null,
  });
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = useCallback((field: 'start' | 'end', dateValue: Date | null) => {
    const isoValue = dateValue?.toISOString() || null;
    const newValue = { ...localValue, [field]: isoValue };
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [localValue, onChange]);

  const handlePreset = useCallback((days: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today;
    const endDate = days === 0 ? today : addDays(today, days);
    const newValue = {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    };
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const startDate = localValue.start ? new Date(localValue.start) : undefined;
  const endDate = localValue.end ? new Date(localValue.end) : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      {showPresets && (
        <div className="flex flex-wrap gap-1">
          {presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handlePreset(preset.days)}
              disabled={disabled}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Popover open={openStart} onOpenChange={setOpenStart}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !startDate && 'text-muted-foreground',
                error && 'border-red-500'
              )}
              disabled={disabled}
              onBlur={onBlur}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'MMM d, yyyy') : 'Start date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => {
                handleChange('start', date || null);
                setOpenStart(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

        <Popover open={openEnd} onOpenChange={setOpenEnd}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !endDate && 'text-muted-foreground',
                error && 'border-red-500'
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate ? format(endDate, 'MMM d, yyyy') : 'End date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => {
                handleChange('end', date || null);
                setOpenEnd(false);
              }}
              disabled={(date) => startDate ? date < startDate : false}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

// ==========================================
// DURATION INPUT
// ==========================================

interface DurationValue {
  hours: number;
  minutes: number;
}

export function DurationInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition: _definition,
  className,
}: WidgetRenderProps<DurationValue | number | null>) {
  // Convert total minutes to hours/minutes if number
  const parseValue = (val: DurationValue | number | null): DurationValue => {
    if (!val) return { hours: 0, minutes: 0 };
    if (typeof val === 'number') {
      return { hours: Math.floor(val / 60), minutes: val % 60 };
    }
    return val;
  };

  const [localValue, setLocalValue] = useState<DurationValue>(parseValue(value));

  useEffect(() => {
    setLocalValue(parseValue(value));
  }, [value]);

  const handleChange = useCallback((field: 'hours' | 'minutes', fieldValue: number) => {
    const newValue = { ...localValue, [field]: fieldValue };
    setLocalValue(newValue);
    // Return total minutes
    onChange?.(newValue.hours * 60 + newValue.minutes);
  }, [localValue, onChange]);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={localValue.hours}
          onChange={(e) => handleChange('hours', parseInt(e.target.value) || 0)}
          onBlur={onBlur}
          disabled={disabled}
          min={0}
          max={99}
          className={cn('w-16', error && 'border-red-500')}
        />
        <span className="text-sm text-muted-foreground">h</span>
      </div>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          value={localValue.minutes}
          onChange={(e) => handleChange('minutes', Math.min(59, parseInt(e.target.value) || 0))}
          onBlur={onBlur}
          disabled={disabled}
          min={0}
          max={59}
          className={cn('w-16', error && 'border-red-500')}
        />
        <span className="text-sm text-muted-foreground">m</span>
      </div>
    </div>
  );
}

// ==========================================
// VISA STATUS SELECT
// ==========================================

interface VisaOption {
  value: string;
  label: string;
  country: string;
  requiresExpiry: boolean;
}

const VISA_OPTIONS: VisaOption[] = [
  // US
  { value: 'USC', label: 'US Citizen', country: 'US', requiresExpiry: false },
  { value: 'GC', label: 'Green Card', country: 'US', requiresExpiry: false },
  { value: 'H1B', label: 'H-1B Visa', country: 'US', requiresExpiry: true },
  { value: 'H4EAD', label: 'H-4 EAD', country: 'US', requiresExpiry: true },
  { value: 'L1', label: 'L-1 Visa', country: 'US', requiresExpiry: true },
  { value: 'OPT', label: 'OPT', country: 'US', requiresExpiry: true },
  { value: 'OPTSTE', label: 'OPT STEM', country: 'US', requiresExpiry: true },
  { value: 'TN', label: 'TN Visa', country: 'US', requiresExpiry: true },
  // Canada
  { value: 'CA_CITIZEN', label: 'Canadian Citizen', country: 'CA', requiresExpiry: false },
  { value: 'CA_PR', label: 'Permanent Resident', country: 'CA', requiresExpiry: false },
  { value: 'CA_PGWP', label: 'Post-Grad Work Permit', country: 'CA', requiresExpiry: true },
  { value: 'CA_OWP', label: 'Open Work Permit', country: 'CA', requiresExpiry: true },
];

interface VisaStatusValue {
  country: string;
  visaType: string;
  expiryDate: string | null;
}

export function VisaStatusSelect({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition: _definition,
  className,
}: WidgetRenderProps<VisaStatusValue | string | null>) {
  // Support both string (just visa type) and object values
  const parseValue = (val: VisaStatusValue | string | null): VisaStatusValue => {
    if (!val) return { country: 'US', visaType: '', expiryDate: null };
    if (typeof val === 'string') {
      const option = VISA_OPTIONS.find(o => o.value === val);
      return { country: option?.country || 'US', visaType: val, expiryDate: null };
    }
    return val;
  };

  const [localValue, setLocalValue] = useState<VisaStatusValue>(parseValue(value));

  useEffect(() => {
    setLocalValue(parseValue(value));
  }, [value]);

  const handleChange = useCallback((field: keyof VisaStatusValue, fieldValue: string | null) => {
    let newValue = { ...localValue, [field]: fieldValue };
    
    // Reset visa type when country changes
    if (field === 'country') {
      newValue = { ...newValue, visaType: '', expiryDate: null };
    }
    
    // Clear expiry if visa doesn't require it
    if (field === 'visaType') {
      const option = VISA_OPTIONS.find(o => o.value === fieldValue);
      if (option && !option.requiresExpiry) {
        newValue = { ...newValue, expiryDate: null };
      }
    }
    
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [localValue, onChange]);

  const filteredOptions = VISA_OPTIONS.filter(o => o.country === localValue.country);
  const selectedOption = VISA_OPTIONS.find(o => o.value === localValue.visaType);
  const showExpiry = selectedOption?.requiresExpiry;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex gap-2">
        <Select
          value={localValue.country}
          onValueChange={(v) => handleChange('country', v)}
          disabled={disabled}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={localValue.visaType}
          onValueChange={(v) => handleChange('visaType', v)}
          disabled={disabled}
        >
          <SelectTrigger className={cn('flex-1', error && 'border-red-500')}>
            <SelectValue placeholder="Select visa status..." />
          </SelectTrigger>
          <SelectContent>
            {filteredOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {showExpiry && (
        <div className="flex items-center gap-2">
          <Label className="text-sm text-muted-foreground">Expiry:</Label>
          <Input
            type="date"
            value={localValue.expiryDate || ''}
            onChange={(e) => handleChange('expiryDate', e.target.value || null)}
            onBlur={onBlur}
            disabled={disabled}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// EXPORT MAP
// ==========================================

export const compositeInputWidgets = {
  'rate-input': RateInput,
  'date-range-picker': DateRangePicker,
  'duration-input': DurationInput,
  'visa-status-select': VisaStatusSelect,
} as const;

