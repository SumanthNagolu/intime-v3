'use client';

import * as React from 'react';
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { cn } from '@/lib/utils';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, X, Eye, EyeOff, Upload } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Field type definitions
export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multi-select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'rich-text'
  | 'file-upload'
  | 'tag-input'
  | 'searchable-select'
  | 'url'
  | 'password'
  | 'ssn'
  | 'ein'
  | 'hidden';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
}

export interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  accept?: string;
  multiple?: boolean;
  autoFormat?: boolean;
  currencySymbol?: string;
  dependsOn?: {
    field: string;
    value: unknown;
    operator?: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  };
}

// Phone number auto-formatting
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

// Currency auto-formatting
function formatCurrency(value: string | number, symbol = '$'): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return '';
  return `${symbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// SSN masking (show last 4 only)
function formatSSN(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 9)}`;
}

// EIN formatting
function formatEIN(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 2) return cleaned;
  return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 9)}`;
}

// Check if field should be visible based on dependencies
function checkDependency(
  dependsOn: FormFieldProps['dependsOn'],
  watchValue: unknown
): boolean {
  if (!dependsOn) return true;

  const { value, operator = 'equals' } = dependsOn;

  switch (operator) {
    case 'equals':
      return watchValue === value;
    case 'notEquals':
      return watchValue !== value;
    case 'contains':
      return Array.isArray(watchValue) ? watchValue.includes(value) : false;
    case 'greaterThan':
      return typeof watchValue === 'number' && typeof value === 'number' && watchValue > value;
    case 'lessThan':
      return typeof watchValue === 'number' && typeof value === 'number' && watchValue < value;
    default:
      return true;
  }
}

export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  description,
  required,
  disabled,
  readOnly,
  className,
  options = [],
  min,
  max,
  step,
  rows = 3,
  accept,
  multiple,
  autoFormat = true,
  currencySymbol = '$',
  dependsOn,
}: FormFieldProps<TFieldValues>) {
  const { control, watch, formState: { errors } } = useFormContext<TFieldValues>();
  const [showPassword, setShowPassword] = React.useState(false);
  const [tagInput, setTagInput] = React.useState('');

  // Watch dependent field if specified
  const dependentValue = dependsOn ? watch(dependsOn.field as FieldPath<TFieldValues>) : undefined;

  // Check if field should be visible
  if (dependsOn && !checkDependency(dependsOn, dependentValue)) {
    return null;
  }

  // Get error for this field
  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  // Hidden field
  if (type === 'hidden') {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field }) => <input type="hidden" {...field} />}
      />
    );
  }

  const renderFieldContent = () => {
    switch (type) {
      case 'text':
      case 'email':
      case 'url':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type={type === 'url' ? 'url' : type === 'email' ? 'email' : 'text'}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'password':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={placeholder}
                  disabled={disabled}
                  readOnly={readOnly}
                  className={cn('pr-10', error && 'border-destructive')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            )}
          />
        );

      case 'phone':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="tel"
                placeholder={placeholder || '(555) 555-5555'}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
                onChange={(e) => {
                  const formatted = autoFormat ? formatPhoneNumber(e.target.value) : e.target.value;
                  field.onChange(formatted);
                }}
                maxLength={14}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="number"
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                min={min}
                max={max}
                step={step}
                className={cn(error && 'border-destructive')}
                onChange={(e) => field.onChange(e.target.valueAsNumber || '')}
              />
            )}
          />
        );

      case 'currency':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  {...field}
                  type="text"
                  placeholder={placeholder || '0.00'}
                  disabled={disabled}
                  readOnly={readOnly}
                  className={cn('pl-7', error && 'border-destructive')}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    field.onChange(value);
                  }}
                  onBlur={(e) => {
                    field.onBlur();
                    if (autoFormat && field.value) {
                      const formatted = parseFloat(field.value).toFixed(2);
                      field.onChange(formatted);
                    }
                  }}
                />
              </div>
            )}
          />
        );

      case 'percentage':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  {...field}
                  type="number"
                  placeholder={placeholder || '0'}
                  disabled={disabled}
                  readOnly={readOnly}
                  min={min ?? 0}
                  max={max ?? 100}
                  step={step ?? 0.01}
                  className={cn('pr-8', error && 'border-destructive')}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || '')}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            )}
          />
        );

      case 'ssn':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder={placeholder || 'XXX-XX-XXXX'}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
                onChange={(e) => {
                  const formatted = autoFormat ? formatSSN(e.target.value) : e.target.value;
                  field.onChange(formatted);
                }}
                maxLength={11}
              />
            )}
          />
        );

      case 'ein':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder={placeholder || 'XX-XXXXXXX'}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
                onChange={(e) => {
                  const formatted = autoFormat ? formatEIN(e.target.value) : e.target.value;
                  field.onChange(formatted);
                }}
                maxLength={10}
              />
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground',
                      error && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(new Date(field.value), 'PPP') : placeholder || 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    disabled={disabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
        );

      case 'datetime':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="datetime-local"
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'time':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="time"
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className={cn(error && 'border-destructive')}>
                  <SelectValue placeholder={placeholder || 'Select an option'} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'multi-select':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              const selectedValues: string[] = Array.isArray(field.value) ? field.value : [];
              return (
                <div className="space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={disabled}
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          selectedValues.length === 0 && 'text-muted-foreground',
                          error && 'border-destructive'
                        )}
                      >
                        {selectedValues.length > 0
                          ? `${selectedValues.length} selected`
                          : placeholder || 'Select options'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-2" align="start">
                      <div className="space-y-1 max-h-60 overflow-auto">
                        {options.map((option) => (
                          <div
                            key={option.value}
                            className="flex items-center space-x-2 p-1 rounded hover:bg-accent cursor-pointer"
                            onClick={() => {
                              const newValues = selectedValues.includes(option.value)
                                ? selectedValues.filter((v: string) => v !== option.value)
                                : [...selectedValues, option.value];
                              field.onChange(newValues);
                            }}
                          >
                            <Checkbox
                              checked={selectedValues.includes(option.value)}
                              disabled={option.disabled}
                            />
                            <span className="text-sm">{option.label}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {selectedValues.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedValues.map((value: string) => {
                        const option = options.find((o) => o.value === value);
                        return (
                          <Badge
                            key={value}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => {
                              field.onChange(selectedValues.filter((v: string) => v !== value));
                            }}
                          >
                            {option?.label || value}
                            <X className="ml-1 h-3 w-3" />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={name}
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
                {label && (
                  <Label
                    htmlFor={name}
                    className={cn('cursor-pointer', disabled && 'cursor-not-allowed opacity-50')}
                  >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
              </div>
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ''}
                onValueChange={field.onChange}
                disabled={disabled}
                className="space-y-2"
              >
                {options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                    <Label htmlFor={`${name}-${option.value}`} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                rows={rows}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );

      case 'rich-text':
        // For rich text, we'll use textarea as fallback
        // In production, integrate TipTap or similar
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <div className="border rounded-md">
                <div className="border-b p-2 bg-muted/50 flex gap-2">
                  <Button type="button" variant="ghost" size="sm" className="h-7">B</Button>
                  <Button type="button" variant="ghost" size="sm" className="h-7 italic">I</Button>
                  <Button type="button" variant="ghost" size="sm" className="h-7 underline">U</Button>
                </div>
                <Textarea
                  {...field}
                  placeholder={placeholder}
                  disabled={disabled}
                  readOnly={readOnly}
                  rows={rows}
                  className="border-0 focus-visible:ring-0"
                />
              </div>
            )}
          />
        );

      case 'file-upload':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value, ...field } }) => (
              <div className={cn('space-y-2', error && 'border-destructive')}>
                <div className="border-2 border-dashed rounded-md p-4 text-center hover:border-primary transition-colors">
                  <input
                    {...field}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    disabled={disabled}
                    className="hidden"
                    id={name}
                    onChange={(e) => {
                      const files = e.target.files;
                      onChange(multiple ? files : files?.[0]);
                    }}
                  />
                  <label
                    htmlFor={name}
                    className={cn(
                      'cursor-pointer flex flex-col items-center gap-2',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {placeholder || 'Click to upload or drag and drop'}
                    </span>
                    {accept && (
                      <span className="text-xs text-muted-foreground">
                        Accepts: {accept}
                      </span>
                    )}
                  </label>
                </div>
                {value && (
                  <div className="text-sm text-muted-foreground">
                    {typeof value === 'object' && 'name' in value
                      ? (value as File).name
                      : typeof value === 'object' && 'length' in value
                      ? `${(value as FileList).length} file(s) selected`
                      : String(value)}
                  </div>
                )}
              </div>
            )}
          />
        );

      case 'tag-input':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              const tags: string[] = Array.isArray(field.value) ? field.value : [];
              return (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder={placeholder || 'Type and press Enter'}
                      disabled={disabled}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          if (!tags.includes(tagInput.trim())) {
                            field.onChange([...tags, tagInput.trim()]);
                          }
                          setTagInput('');
                        }
                      }}
                      className={cn(error && 'border-destructive')}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={disabled || !tagInput.trim()}
                      onClick={() => {
                        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                          field.onChange([...tags, tagInput.trim()]);
                        }
                        setTagInput('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag: string, index: number) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            field.onChange(tags.filter((_: string, i: number) => i !== index));
                          }}
                        >
                          {tag}
                          <X className="ml-1 h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
        );

      case 'searchable-select':
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => {
              const [search, setSearch] = React.useState('');
              const [isOpen, setIsOpen] = React.useState(false);
              const filteredOptions = options.filter((option) =>
                option.label.toLowerCase().includes(search.toLowerCase())
              );
              const selectedOption = options.find((o) => o.value === field.value);

              return (
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={isOpen}
                      disabled={disabled}
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground',
                        error && 'border-destructive'
                      )}
                    >
                      {selectedOption?.label || placeholder || 'Select an option'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-2" align="start">
                    <Input
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-60 overflow-auto space-y-1">
                      {filteredOptions.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-2 text-center">
                          No options found
                        </div>
                      ) : (
                        filteredOptions.map((option) => (
                          <div
                            key={option.value}
                            className={cn(
                              'p-2 rounded cursor-pointer hover:bg-accent',
                              field.value === option.value && 'bg-accent'
                            )}
                            onClick={() => {
                              field.onChange(option.value);
                              setIsOpen(false);
                              setSearch('');
                            }}
                          >
                            <div className="text-sm">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }}
          />
        );

      default:
        return (
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                className={cn(error && 'border-destructive')}
              />
            )}
          />
        );
    }
  };

  // For checkbox type, label is rendered inline
  if (type === 'checkbox') {
    return (
      <div className={cn('space-y-1', className)}>
        {renderFieldContent()}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={name} className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {renderFieldContent()}
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
}

export default FormField;
