/**
 * Pattern Card
 *
 * Display card for an activity pattern, used in selection interfaces.
 */

'use client';

import React from 'react';
import { Clock, CheckSquare, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getCategoryColor } from '@/lib/activities/patterns';
import type { ActivityPattern } from '@/lib/activities/patterns';

export interface PatternCardProps {
  /** The pattern to display */
  pattern: ActivityPattern;

  /** Click handler */
  onClick?: () => void;

  /** Hover handler */
  onHover?: (pattern: ActivityPattern | null) => void;

  /** Selected state */
  selected?: boolean;

  /** Compact mode for grids */
  compact?: boolean;

  /** Show full details */
  showDetails?: boolean;

  /** Additional className */
  className?: string;
}

export function PatternCard({
  pattern,
  onClick,
  onHover,
  selected = false,
  compact = false,
  showDetails = false,
  className,
}: PatternCardProps) {
  const Icon = pattern.icon;

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => onHover?.(pattern)}
        onMouseLeave={() => onHover?.(null)}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border text-left',
          'transition-all duration-150 hover:shadow-md hover:-translate-y-0.5',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          selected && 'border-primary bg-primary/5 ring-2 ring-primary',
          !selected && 'border-border hover:border-muted-foreground/50',
          className
        )}
      >
        <div className={cn('p-2 rounded-lg', getCategoryColor(pattern.category))}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{pattern.name}</p>
          <p className="text-xs text-muted-foreground truncate">{pattern.description}</p>
        </div>
        {pattern.slaTier && (
          <Badge variant="outline" className="text-[10px] flex-shrink-0">
            {pattern.slaTier}h
          </Badge>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => onHover?.(pattern)}
      onMouseLeave={() => onHover?.(null)}
      className={cn(
        'flex flex-col p-4 rounded-lg border text-left',
        'transition-all duration-150 hover:shadow-md hover:-translate-y-0.5',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        selected && 'border-primary bg-primary/5 ring-2 ring-primary',
        !selected && 'border-border hover:border-muted-foreground/50',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn('p-2.5 rounded-lg', getCategoryColor(pattern.category))}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold">{pattern.name}</h3>
          <Badge
            variant="secondary"
            className={cn('mt-1 text-[10px]', getCategoryColor(pattern.category))}
          >
            {pattern.category.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {pattern.description}
      </p>

      {/* Meta Info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-3 border-t">
        {/* Priority */}
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              pattern.defaultPriority === 'critical' && 'bg-red-500',
              pattern.defaultPriority === 'urgent' && 'bg-orange-500',
              pattern.defaultPriority === 'high' && 'bg-amber-500',
              pattern.defaultPriority === 'normal' && 'bg-blue-500',
              pattern.defaultPriority === 'low' && 'bg-gray-400'
            )}
          />
          {pattern.defaultPriority}
        </div>

        {/* SLA */}
        {pattern.slaTier && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {pattern.slaTier}h SLA
          </div>
        )}

        {/* Checklist count */}
        {pattern.checklist.length > 0 && (
          <div className="flex items-center gap-1">
            <CheckSquare className="h-3 w-3" />
            {pattern.checklist.length}
          </div>
        )}

        {/* Fields count */}
        {pattern.fields.length > 0 && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {pattern.fields.length}
          </div>
        )}
      </div>

      {/* Detailed Info */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t space-y-3">
          {/* Fields Preview */}
          {pattern.fields.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1">Fields</h4>
              <div className="flex flex-wrap gap-1">
                {pattern.fields.slice(0, 5).map((field) => (
                  <Badge key={field.id} variant="outline" className="text-[10px]">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </Badge>
                ))}
                {pattern.fields.length > 5 && (
                  <Badge variant="outline" className="text-[10px]">
                    +{pattern.fields.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Checklist Preview */}
          {pattern.checklist.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1">Checklist</h4>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {pattern.checklist.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-1">
                    <CheckSquare className="h-3 w-3" />
                    <span className="truncate">{item.label}</span>
                    {item.required && <span className="text-red-500">*</span>}
                  </li>
                ))}
                {pattern.checklist.length > 3 && (
                  <li className="text-muted-foreground">
                    +{pattern.checklist.length - 3} more items
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Outcomes Preview */}
          {pattern.outcomes.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-1">Possible Outcomes</h4>
              <div className="flex flex-wrap gap-1">
                {pattern.outcomes.map((outcome) => (
                  <Badge
                    key={outcome.id}
                    variant="outline"
                    className={cn(
                      'text-[10px]',
                      outcome.color === 'green' && 'border-green-300 text-green-700',
                      outcome.color === 'red' && 'border-red-300 text-red-700',
                      outcome.color === 'orange' && 'border-orange-300 text-orange-700',
                      outcome.color === 'blue' && 'border-blue-300 text-blue-700',
                      outcome.color === 'gray' && 'border-gray-300 text-gray-700'
                    )}
                  >
                    {outcome.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

export default PatternCard;
