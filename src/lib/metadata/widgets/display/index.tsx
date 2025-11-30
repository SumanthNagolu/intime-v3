/**
 * Display Widgets
 *
 * Read-only widgets for displaying data in various formats.
 * These are used in DetailView, info-cards, and tables.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercentage,
  formatPhone,
  formatNumber,
  type WidgetRenderProps,
} from '../../registry/widget-registry';
import type { BadgeWidgetConfig, FormatDefinition } from '../../types';

// ==========================================
// TEXT DISPLAY
// ==========================================

export function TextDisplay({ value, className }: WidgetRenderProps<string | null>) {
  return (
    <span className={cn('text-sm', className)}>
      {value || '-'}
    </span>
  );
}

// ==========================================
// BADGE DISPLAY (for enum/status fields)
// ==========================================

export function BadgeDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  const config = definition.config as BadgeWidgetConfig | undefined;
  const colorMap = config?.colorMap;
  const colors = colorMap?.[value] || { color: 'text-stone-600', bgColor: 'bg-stone-100' };

  return (
    <Badge
      variant="secondary"
      className={cn(colors.bgColor, colors.color, 'font-medium', className)}
    >
      {value.replace(/_/g, ' ')}
    </Badge>
  );
}

// ==========================================
// STATUS BADGE (specialized for status fields)
// ==========================================

const STATUS_COLORS: Record<string, { color: string; bgColor: string }> = {
  // Common statuses
  active: { color: 'text-green-700', bgColor: 'bg-green-100' },
  inactive: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  pending: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  completed: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  cancelled: { color: 'text-stone-500', bgColor: 'bg-stone-100' },

  // Job statuses
  draft: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  open: { color: 'text-green-700', bgColor: 'bg-green-100' },
  urgent: { color: 'text-red-600', bgColor: 'bg-red-100' },
  on_hold: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  filled: { color: 'text-purple-600', bgColor: 'bg-purple-100' },

  // Submission statuses
  sourced: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  screening: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  submitted: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  interviewing: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  offered: { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  placed: { color: 'text-green-700', bgColor: 'bg-green-100' },
  rejected: { color: 'text-red-600', bgColor: 'bg-red-100' },

  // Lead statuses
  new: { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  contacted: { color: 'text-amber-600', bgColor: 'bg-amber-100' },
  qualified: { color: 'text-green-700', bgColor: 'bg-green-100' },
  unqualified: { color: 'text-stone-500', bgColor: 'bg-stone-100' },
  converted: { color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export function StatusBadge({
  value,
  definition,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  const config = definition.config as BadgeWidgetConfig | undefined;
  const customColors = config?.colorMap?.[value];
  const defaultColors = STATUS_COLORS[value.toLowerCase()] || { color: 'text-stone-600', bgColor: 'bg-stone-100' };
  const colors = customColors || defaultColors;

  const displayValue = value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge
      variant="secondary"
      className={cn(colors.bgColor, colors.color, 'font-medium capitalize', className)}
    >
      {config?.showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', colors.color.replace('text-', 'bg-'))} />
      )}
      {displayValue}
    </Badge>
  );
}

// ==========================================
// CURRENCY DISPLAY
// ==========================================

export function CurrencyDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const format = definition.format as FormatDefinition | undefined;
  const currency = format?.currency || 'USD';
  const locale = format?.locale || 'en-US';

  return (
    <span className={cn('text-sm font-medium tabular-nums', className)}>
      {formatCurrency(value, currency, locale)}
    </span>
  );
}

// ==========================================
// PERCENTAGE DISPLAY
// ==========================================

export function PercentageDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const format = definition.format as FormatDefinition | undefined;
  const decimals = format?.decimals ?? 0;

  return (
    <span className={cn('text-sm tabular-nums', className)}>
      {formatPercentage(value, decimals)}
    </span>
  );
}

// ==========================================
// DATE DISPLAY
// ==========================================

export function DateDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<string | Date | null>) {
  const format = definition.format as FormatDefinition | undefined;
  const formatType = format?.format || 'short';
  const locale = format?.locale || 'en-US';

  return (
    <span className={cn('text-sm', className)}>
      {formatDate(value, formatType, locale)}
    </span>
  );
}

// ==========================================
// DATETIME DISPLAY
// ==========================================

export function DateTimeDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<string | Date | null>) {
  const format = definition.format as FormatDefinition | undefined;
  const locale = format?.locale || 'en-US';

  return (
    <span className={cn('text-sm', className)}>
      {formatDateTime(value, locale)}
    </span>
  );
}

// ==========================================
// BOOLEAN DISPLAY
// ==========================================

export function BooleanDisplay({
  value,
  className,
}: WidgetRenderProps<boolean | null>) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <span className={cn('text-sm', className)}>
      {value ? (
        <span className="text-green-600">Yes</span>
      ) : (
        <span className="text-stone-500">No</span>
      )}
    </span>
  );
}

// ==========================================
// LINK DISPLAY (for URLs)
// ==========================================

export function LinkDisplay({
  value,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('text-sm text-blue-600 hover:underline', className)}
    >
      {value.replace(/^https?:\/\//, '').split('/')[0]}
    </a>
  );
}

// ==========================================
// EMAIL DISPLAY
// ==========================================

export function EmailDisplay({
  value,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  return (
    <a
      href={`mailto:${value}`}
      className={cn('text-sm text-blue-600 hover:underline', className)}
    >
      {value}
    </a>
  );
}

// ==========================================
// PHONE DISPLAY
// ==========================================

export function PhoneDisplay({
  value,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  return (
    <a
      href={`tel:${value.replace(/\D/g, '')}`}
      className={cn('text-sm text-blue-600 hover:underline', className)}
    >
      {formatPhone(value)}
    </a>
  );
}

// ==========================================
// TAGS DISPLAY
// ==========================================

export function TagsDisplay({
  value,
  className,
}: WidgetRenderProps<string[] | null>) {
  if (!value || value.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}
    </div>
  );
}

// ==========================================
// ENTITY LINK DISPLAY (for foreign key references)
// ==========================================

export function EntityLinkDisplay({
  value,
  definition: _definition,
  className,
}: WidgetRenderProps<{ id: string; name?: string; title?: string } | string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  // Handle both object and string values
  const displayValue = typeof value === 'string'
    ? value
    : value.name || value.title || value.id;

  return (
    <span className={cn('text-sm text-blue-600', className)}>
      {displayValue}
    </span>
  );
}

// ==========================================
// ENTITY LIST DISPLAY (for many-to-many)
// ==========================================

export function EntityListDisplay({
  value,
  className,
}: WidgetRenderProps<Array<{ id: string; name?: string }> | null>) {
  if (!value || value.length === 0) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {value.map((item) => (
        <Badge key={item.id} variant="outline" className="text-xs">
          {item.name || item.id}
        </Badge>
      ))}
    </div>
  );
}

// ==========================================
// ADDRESS DISPLAY
// ==========================================

interface AddressValue {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export function AddressDisplay({
  value,
  className,
}: WidgetRenderProps<AddressValue | null>) {
  if (!value || (!value.street1 && !value.city)) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  const parts: string[] = [];
  if (value.street1) parts.push(value.street1);
  if (value.street2) parts.push(value.street2);

  const cityLine: string[] = [];
  if (value.city) cityLine.push(value.city);
  if (value.state) cityLine.push(value.state);
  if (value.zip) cityLine.push(value.zip);
  if (cityLine.length > 0) parts.push(cityLine.join(', '));

  if (value.country && value.country !== 'US' && value.country !== 'USA') {
    parts.push(value.country);
  }

  return (
    <div className={cn('text-sm space-y-0.5', className)}>
      {parts.map((part, index) => (
        <div key={index}>{part}</div>
      ))}
    </div>
  );
}

// ==========================================
// JSON DISPLAY
// ==========================================

export function JsonDisplay({
  value,
  className,
}: WidgetRenderProps<Record<string, unknown> | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  return (
    <pre className={cn('text-xs bg-stone-50 p-2 rounded overflow-auto max-h-32', className)}>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

// ==========================================
// PROGRESS DISPLAY
// ==========================================

export function ProgressDisplay({
  value,
  className,
}: WidgetRenderProps<number | null>) {
  const percentage = value ?? 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatPercentage(percentage, 0)}
      </span>
    </div>
  );
}

// ==========================================
// RATING DISPLAY
// ==========================================

export function RatingDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const maxRating = (definition.config as { max?: number })?.max || 5;
  const rating = value ?? 0;

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }).map((_, i) => (
        <svg
          key={i}
          className={cn(
            'w-4 h-4',
            i < rating ? 'text-amber-400 fill-current' : 'text-stone-200'
          )}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-muted-foreground ml-1">({rating})</span>
    </div>
  );
}

// ==========================================
// NUMBER DISPLAY
// ==========================================

export function NumberDisplay({
  value,
  definition,
  className,
}: WidgetRenderProps<number | null>) {
  const format = definition.format as FormatDefinition | undefined;
  const decimals = format?.decimals ?? 0;
  const locale = format?.locale || 'en-US';

  return (
    <span className={cn('text-sm tabular-nums', className)}>
      {formatNumber(value, decimals, locale)}
    </span>
  );
}

// ==========================================
// AVATAR DISPLAY
// ==========================================

export function AvatarDisplay({
  value,
  definition: _definition,
  className,
}: WidgetRenderProps<{ name?: string; avatarUrl?: string; initials?: string } | string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  const name = typeof value === 'string' ? value : value.name || '';
  const avatarUrl = typeof value === 'object' ? value.avatarUrl : undefined;
  const initials = typeof value === 'object'
    ? value.initials
    : name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (avatarUrl) {
    return (
      <div className={cn('relative w-8 h-8 rounded-full overflow-hidden', className)}>
        <Image
          src={avatarUrl}
          alt={name}
          fill
          unoptimized
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-medium text-stone-600',
        className
      )}
    >
      {initials || '?'}
    </div>
  );
}

// ==========================================
// IMAGE DISPLAY
// ==========================================

export function ImageDisplay({
  value,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return <span className="text-muted-foreground text-sm">-</span>;

  return (
    <div className={cn('relative max-w-full h-auto', className)}>
      <Image
        src={value}
        alt=""
        width={200}
        height={150}
        unoptimized
        className="rounded object-contain"
      />
    </div>
  );
}

// ==========================================
// ICON DISPLAY
// ==========================================

export function IconDisplay({
  value,
  definition: _definition,
  className,
}: WidgetRenderProps<string | null>) {
  if (!value) return null;

  // For now, just display the icon name - in a full implementation,
  // this would render the actual Lucide icon
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      [{value}]
    </span>
  );
}

// ==========================================
// EXPORT MAP
// ==========================================

export const displayWidgets = {
  'text-display': TextDisplay,
  'badge-display': BadgeDisplay,
  'status-badge': StatusBadge,
  'currency-display': CurrencyDisplay,
  'percentage-display': PercentageDisplay,
  'date-display': DateDisplay,
  'datetime-display': DateTimeDisplay,
  'boolean-display': BooleanDisplay,
  'link-display': LinkDisplay,
  'email-display': EmailDisplay,
  'phone-display': PhoneDisplay,
  'tags-display': TagsDisplay,
  'entity-link': EntityLinkDisplay,
  'entity-list-display': EntityListDisplay,
  'address-display': AddressDisplay,
  'json-display': JsonDisplay,
  'progress-display': ProgressDisplay,
  'rating-display': RatingDisplay,
  'number-display': NumberDisplay,
  'avatar-display': AvatarDisplay,
  'image-display': ImageDisplay,
  'icon-display': IconDisplay,
} as const;
