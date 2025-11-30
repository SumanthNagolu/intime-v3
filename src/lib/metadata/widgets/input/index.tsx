/**
 * Input Widgets
 *
 * Form input widgets for editing data.
 * These integrate with the form binding system.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import type { WidgetRenderProps } from '../../registry/widget-registry';
import type { FieldDefinition, OptionDefinition, SelectWidgetConfig } from '../../types';

// ==========================================
// TEXT INPUT
// ==========================================

export function TextInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <Input
      type="text"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={fieldDef.placeholder}
      maxLength={fieldDef.maxLength}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// TEXTAREA INPUT
// ==========================================

export function TextareaInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <Textarea
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={fieldDef.placeholder}
      maxLength={fieldDef.maxLength}
      rows={4}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// NUMBER INPUT
// ==========================================

export function NumberInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <Input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const num = e.target.value === '' ? null : parseFloat(e.target.value);
        onChange?.(num);
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={fieldDef.placeholder}
      min={fieldDef.min}
      max={fieldDef.max}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// CURRENCY INPUT
// ==========================================

export function CurrencyInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const num = e.target.value === '' ? null : parseFloat(e.target.value);
          onChange?.(num);
        }}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={fieldDef.placeholder || '0.00'}
        min={fieldDef.min ?? 0}
        step="0.01"
        className={cn('pl-7', error && 'border-red-500', className)}
      />
    </div>
  );
}

// ==========================================
// PERCENTAGE INPUT
// ==========================================

export function PercentageInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <div className="relative">
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const num = e.target.value === '' ? null : parseFloat(e.target.value);
          onChange?.(num);
        }}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={fieldDef.placeholder || '0'}
        min={fieldDef.min ?? 0}
        max={fieldDef.max ?? 100}
        className={cn('pr-8', error && 'border-red-500', className)}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        %
      </span>
    </div>
  );
}

// ==========================================
// EMAIL INPUT
// ==========================================

export function EmailInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <Input
      type="email"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={fieldDef.placeholder || 'email@example.com'}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// PHONE INPUT
// ==========================================

export function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;

  const formatPhoneNumber = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  return (
    <Input
      type="tel"
      value={value || ''}
      onChange={(e) => {
        const formatted = formatPhoneNumber(e.target.value);
        onChange?.(formatted || null);
      }}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={fieldDef.placeholder || '(555) 555-5555'}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// URL INPUT
// ==========================================

export function UrlInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <Input
      type="url"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={fieldDef.placeholder || 'https://'}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// BOOLEAN INPUT (Checkbox)
// ==========================================

export function BooleanInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<boolean | null>) {
  const fieldDef = definition as FieldDefinition;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Checkbox
        checked={value ?? false}
        onCheckedChange={(checked) => onChange?.(checked as boolean)}
        onBlur={onBlur}
        disabled={disabled}
        id={fieldDef.id}
        className={cn(error && 'border-red-500')}
      />
      {fieldDef.helpText && (
        <Label htmlFor={fieldDef.id} className="text-sm text-muted-foreground">
          {fieldDef.helpText}
        </Label>
      )}
    </div>
  );
}

// ==========================================
// SELECT INPUT (for enum/fixed options)
// ==========================================

export function SelectInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;
  const options = fieldDef.options || [];
  const config = fieldDef.config as SelectWidgetConfig | undefined;

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange?.(v || null)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(error && 'border-red-500', className)}
        onBlur={onBlur}
      >
        <SelectValue placeholder={fieldDef.placeholder || 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {config?.clearable && value && (
          <SelectItem value="">
            <span className="text-muted-foreground">Clear selection</span>
          </SelectItem>
        )}
        {options.map((option: OptionDefinition) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ==========================================
// MULTISELECT INPUT
// ==========================================

export function MultiselectInput({
  value,
  onChange,
  onBlur: _onBlur,
  disabled,
  error: _error,
  definition,
  className,
}: WidgetRenderProps<string[] | null>) {
  const fieldDef = definition as FieldDefinition;
  const options = fieldDef.options || [];
  const selectedValues = value || [];

  const toggleOption = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange?.(newValues.length > 0 ? newValues : null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-1 min-h-[38px] p-2 border rounded-md">
        {selectedValues.length === 0 ? (
          <span className="text-muted-foreground text-sm">
            {fieldDef.placeholder || 'Select options...'}
          </span>
        ) : (
          selectedValues.map((val) => {
            const option = options.find((o: OptionDefinition) => o.value === val);
            return (
              <Badge key={val} variant="secondary" className="gap-1">
                {option?.label || val}
                <button
                  type="button"
                  onClick={() => toggleOption(val)}
                  disabled={disabled}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options
          .filter((o: OptionDefinition) => !selectedValues.includes(o.value))
          .map((option: OptionDefinition) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toggleOption(option.value)}
              disabled={disabled}
            >
              <Plus className="h-3 w-3 mr-1" />
              {option.label}
            </Button>
          ))}
      </div>
    </div>
  );
}

// ==========================================
// DATE INPUT
// ==========================================

export function DateInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | Date | null>) {
  const fieldDef = definition as FieldDefinition;
  const [open, setOpen] = useState(false);

  const date = value ? (typeof value === 'string' ? new Date(value) : value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            error && 'border-red-500',
            className
          )}
          disabled={disabled}
          onBlur={onBlur}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP') : fieldDef.placeholder || 'Pick a date'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            onChange?.(newDate?.toISOString() || null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

// ==========================================
// DATETIME INPUT
// ==========================================

export function DateTimeInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition: _definition,
  className,
}: WidgetRenderProps<string | Date | null>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value ? new Date(e.target.value).toISOString() : null;
    onChange?.(newValue);
  };

  const inputValue = value
    ? (typeof value === 'string' ? value : value.toISOString()).slice(0, 16)
    : '';

  return (
    <Input
      type="datetime-local"
      value={inputValue}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// TIME INPUT
// ==========================================

export function TimeInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition: _definition,
  className,
}: WidgetRenderProps<string | null>) {
  return (
    <Input
      type="time"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value || null)}
      onBlur={onBlur}
      disabled={disabled}
      className={cn(error && 'border-red-500', className)}
    />
  );
}

// ==========================================
// TAGS INPUT
// ==========================================

export function TagsInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string[] | null>) {
  const fieldDef = definition as FieldDefinition;
  const [inputValue, setInputValue] = useState('');
  const tags = React.useMemo(() => value || [], [value]);

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange?.([...tags, trimmed]);
      setInputValue('');
    }
  }, [inputValue, tags, onChange]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const newTags = tags.filter((t) => t !== tagToRemove);
      onChange?.(newTags.length > 0 ? newTags : null);
    },
    [tags, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'flex flex-wrap gap-1 min-h-[38px] p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring',
          error && 'border-red-500'
        )}
      >
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              className="ml-1 hover:text-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            addTag();
            onBlur?.();
          }}
          disabled={disabled}
          placeholder={tags.length === 0 ? fieldDef.placeholder || 'Add tags...' : ''}
          className="flex-1 min-w-[100px] outline-none bg-transparent text-sm"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to add a tag
      </p>
    </div>
  );
}

// ==========================================
// RADIO INPUT
// ==========================================

export function RadioInput({
  value,
  onChange,
  disabled,
  error: _error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;
  const options = fieldDef.options || [];

  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option: OptionDefinition) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="radio"
            name={fieldDef.id}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="h-4 w-4"
          />
          <span className="text-sm">{option.label}</span>
          {option.description && (
            <span className="text-xs text-muted-foreground">
              - {option.description}
            </span>
          )}
        </label>
      ))}
    </div>
  );
}

// ==========================================
// CHECKBOX GROUP INPUT
// ==========================================

export function CheckboxGroupInput({
  value,
  onChange,
  disabled,
  error: _error,
  definition,
  className,
}: WidgetRenderProps<string[] | null>) {
  const fieldDef = definition as FieldDefinition;
  const options = fieldDef.options || [];
  const selectedValues = value || [];

  const toggleOption = (optionValue: string) => {
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter((v) => v !== optionValue)
      : [...selectedValues, optionValue];
    onChange?.(newValues.length > 0 ? newValues : null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {options.map((option: OptionDefinition) => (
        <label
          key={option.value}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Checkbox
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => toggleOption(option.value)}
            disabled={disabled}
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

// ==========================================
// ENTITY SELECT (for foreign key references)
// ==========================================

export function EntitySelect({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  entity: _entity,
  className,
}: WidgetRenderProps<string | null>) {
  const fieldDef = definition as FieldDefinition;

  // In a full implementation, this would fetch options from the entity registry
  // For now, use static options if provided
  const options = fieldDef.options || [];

  return (
    <Select
      value={value || undefined}
      onValueChange={(v) => onChange?.(v || null)}
      disabled={disabled}
    >
      <SelectTrigger
        className={cn(error && 'border-red-500', className)}
        onBlur={onBlur}
      >
        <SelectValue placeholder={fieldDef.placeholder || 'Select...'} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option: OptionDefinition) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ==========================================
// ENTITY MULTISELECT
// ==========================================

export function EntityMultiselect({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string[] | null>) {
  // Reuse the multiselect implementation
  return (
    <MultiselectInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      error={error}
      definition={definition}
      isEditing={true}
      className={className}
    />
  );
}

// ==========================================
// FILE INPUT
// ==========================================

export function FileInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition: _definition,
  className,
}: WidgetRenderProps<File | string | null>) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange?.(file);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Input
        ref={inputRef}
        type="file"
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        className={cn(error && 'border-red-500')}
      />
      {value && typeof value === 'string' && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Current:</span>
          <span>{value.split('/').pop()}</span>
        </div>
      )}
    </div>
  );
}

// ==========================================
// JSON INPUT
// ==========================================

export function JsonInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition: _definition,
  className,
}: WidgetRenderProps<Record<string, unknown> | null>) {
  const [textValue, setTextValue] = useState(
    value ? JSON.stringify(value, null, 2) : ''
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTextValue(text);

    try {
      const parsed = text ? JSON.parse(text) : null;
      setParseError(null);
      onChange?.(parsed);
    } catch {
      setParseError('Invalid JSON');
    }
  };

  return (
    <div className={cn('space-y-1', className)}>
      <Textarea
        value={textValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        rows={6}
        className={cn(
          'font-mono text-xs',
          (error || parseError) && 'border-red-500'
        )}
      />
      {parseError && (
        <p className="text-xs text-red-500">{parseError}</p>
      )}
    </div>
  );
}

// ==========================================
// RICHTEXT INPUT (placeholder - would use a proper editor)
// ==========================================

export function RichtextInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  // For now, use a simple textarea
  // In a full implementation, this would use a rich text editor like TipTap
  return (
    <TextareaInput
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      error={error}
      definition={definition}
      isEditing={true}
      className={className}
    />
  );
}

// ==========================================
// EXPORT MAP
// ==========================================

export const inputWidgets = {
  'text-input': TextInput,
  'textarea-input': TextareaInput,
  'richtext-input': RichtextInput,
  'number-input': NumberInput,
  'currency-input': CurrencyInput,
  'percentage-input': PercentageInput,
  'date-input': DateInput,
  'datetime-input': DateTimeInput,
  'time-input': TimeInput,
  'boolean-input': BooleanInput,
  'select-input': SelectInput,
  'multiselect-input': MultiselectInput,
  'radio-input': RadioInput,
  'checkbox-input': BooleanInput,
  'checkbox-group-input': CheckboxGroupInput,
  'tags-input': TagsInput,
  'email-input': EmailInput,
  'phone-input': PhoneInput,
  'url-input': UrlInput,
  'file-input': FileInput,
  'files-input': FileInput, // Would need multi-file version
  'image-input': FileInput, // Would need image preview version
  'entity-select': EntitySelect,
  'entity-multiselect': EntityMultiselect,
  'json-input': JsonInput,
} as const;
