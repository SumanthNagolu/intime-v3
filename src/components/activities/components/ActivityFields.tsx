/**
 * Activity Fields
 *
 * Dynamic form fields based on pattern definition.
 */

'use client';

import React from 'react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getPatternFields, type PatternField, type FieldType } from '@/lib/activities/patterns';

export interface ActivityFieldsProps {
  /** Pattern ID to get field definitions */
  patternId: string;

  /** Field values */
  values: Record<string, unknown>;

  /** Read-only mode */
  readOnly?: boolean;

  /** Value change handler */
  onChange?: (fieldId: string, value: unknown) => void;

  /** Field errors */
  errors?: Record<string, string>;

  /** Show required indicators */
  showRequired?: boolean;

  /** Column layout */
  columns?: 1 | 2;

  /** Additional className */
  className?: string;
}

function FieldInput({
  field,
  value,
  error,
  readOnly,
  onChange,
}: {
  field: PatternField;
  value: unknown;
  error?: string;
  readOnly?: boolean;
  onChange?: (value: unknown) => void;
}) {
  const commonProps = {
    id: field.id,
    disabled: readOnly,
    placeholder: field.placeholder,
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'phone':
    case 'url':
      return (
        <Input
          {...commonProps}
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
          value={(value as string) || ''}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(error && 'border-red-500')}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          value={(value as string) || ''}
          onChange={(e) => onChange?.(e.target.value)}
          rows={3}
          className={cn(error && 'border-red-500')}
        />
      );

    case 'number':
    case 'duration':
      return (
        <Input
          {...commonProps}
          type="number"
          value={(value as number) ?? ''}
          onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : undefined)}
          className={cn(error && 'border-red-500')}
        />
      );

    case 'currency':
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            {...commonProps}
            type="number"
            step="0.01"
            value={(value as number) ?? ''}
            onChange={(e) => onChange?.(e.target.value ? Number(e.target.value) : undefined)}
            className={cn('pl-7', error && 'border-red-500')}
          />
        </div>
      );

    case 'date':
      return (
        <Input
          {...commonProps}
          type="date"
          value={value ? format(new Date(value as string), 'yyyy-MM-dd') : ''}
          onChange={(e) => onChange?.(e.target.value || undefined)}
          className={cn(error && 'border-red-500')}
        />
      );

    case 'datetime':
      return (
        <Input
          {...commonProps}
          type="datetime-local"
          value={value ? format(new Date(value as string), "yyyy-MM-dd'T'HH:mm") : ''}
          onChange={(e) => onChange?.(e.target.value || undefined)}
          className={cn(error && 'border-red-500')}
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-2">
          <Checkbox
            id={field.id}
            checked={(value as boolean) || false}
            onCheckedChange={(checked) => onChange?.(checked)}
            disabled={readOnly}
          />
          {field.helpText && (
            <span className="text-sm text-muted-foreground">{field.helpText}</span>
          )}
        </div>
      );

    case 'select':
      return (
        <Select
          value={(value as string) || ''}
          onValueChange={onChange}
          disabled={readOnly}
        >
          <SelectTrigger className={cn(error && 'border-red-500')}>
            <SelectValue placeholder={field.placeholder || 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case 'multi-select':
      const selectedValues = (value as string[]) || [];
      return (
        <div className="space-y-2">
          {field.options?.map((option) => (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={`${field.id}_${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange?.([...selectedValues, option.value]);
                  } else {
                    onChange?.(selectedValues.filter(v => v !== option.value));
                  }
                }}
                disabled={readOnly}
              />
              <Label htmlFor={`${field.id}_${option.value}`} className="cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      );

    default:
      return (
        <Input
          {...commonProps}
          type="text"
          value={(value as string) || ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      );
  }
}

export function ActivityFields({
  patternId,
  values,
  readOnly = false,
  onChange,
  errors = {},
  showRequired = true,
  columns = 1,
  className,
}: ActivityFieldsProps) {
  const fields = getPatternFields(patternId);

  // Check visibility conditions
  const visibleFields = fields.filter((field) => {
    if (!field.dependsOn) return true;
    return values[field.dependsOn.field] === field.dependsOn.value;
  });

  if (visibleFields.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'grid gap-4',
      columns === 2 && 'md:grid-cols-2',
      className
    )}>
      {visibleFields.map((field) => (
        <div
          key={field.id}
          className={cn(
            'space-y-1.5',
            field.type === 'textarea' && columns === 2 && 'md:col-span-2'
          )}
        >
          <Label htmlFor={field.id}>
            {field.label}
            {showRequired && field.required && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </Label>

          <FieldInput
            field={field}
            value={values[field.id]}
            error={errors[field.id]}
            readOnly={readOnly}
            onChange={(value) => onChange?.(field.id, value)}
          />

          {field.helpText && field.type !== 'boolean' && (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          )}

          {errors[field.id] && (
            <p className="text-xs text-red-500">{errors[field.id]}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ActivityFields;
