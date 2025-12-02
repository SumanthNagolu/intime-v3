/**
 * Pattern Badge
 *
 * Compact pattern indicator for use in lists and tables.
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getPattern, getCategoryColor } from '@/lib/activities/patterns';
import type { ActivityPattern } from '@/lib/activities/patterns';

export interface PatternBadgeProps {
  /** Pattern ID or pattern object */
  pattern: string | ActivityPattern;

  /** Show icon */
  showIcon?: boolean;

  /** Show category color */
  colored?: boolean;

  /** Show tooltip with details */
  showTooltip?: boolean;

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Additional className */
  className?: string;
}

export function PatternBadge({
  pattern: patternProp,
  showIcon = true,
  colored = true,
  showTooltip = true,
  size = 'md',
  className,
}: PatternBadgeProps) {
  // Get pattern object
  const pattern = typeof patternProp === 'string'
    ? getPattern(patternProp)
    : patternProp;

  if (!pattern) {
    return (
      <Badge variant="outline" className={cn('text-muted-foreground', className)}>
        Unknown
      </Badge>
    );
  }

  const Icon = pattern.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  const badge = (
    <Badge
      variant={colored ? 'secondary' : 'outline'}
      className={cn(
        sizeClasses[size],
        colored && getCategoryColor(pattern.category),
        className
      )}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'mr-1')} />}
      <span className="truncate">{pattern.name}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px]">
          <div className="space-y-1">
            <p className="font-medium">{pattern.name}</p>
            <p className="text-xs text-muted-foreground">{pattern.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span>Priority: {pattern.defaultPriority}</span>
              {pattern.slaTier && <span>SLA: {pattern.slaTier}h</span>}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default PatternBadge;
