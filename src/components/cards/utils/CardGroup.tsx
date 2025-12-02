'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type GridLayout = 1 | 2 | 3 | 4;

interface CardGroupProps {
  title?: string;
  children: React.ReactNode;
  columns?: GridLayout;
  gap?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  className?: string;
}

const GRID_COLS: Record<GridLayout, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

const GAP_SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

export function CardGroup({
  title,
  children,
  columns = 1,
  gap = 'md',
  maxVisible,
  showMoreLabel = 'Show more',
  showLessLabel = 'Show less',
  className,
}: CardGroupProps) {
  const [expanded, setExpanded] = React.useState(false);

  const childArray = React.Children.toArray(children);
  const hasMore = maxVisible !== undefined && childArray.length > maxVisible;
  const displayedChildren = expanded || !hasMore
    ? childArray
    : childArray.slice(0, maxVisible);

  const hiddenCount = childArray.length - (maxVisible || 0);

  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-charcoal-700 mb-3">
          {title}
        </h3>
      )}

      <div className={cn('grid', GRID_COLS[columns], GAP_SIZE[gap])}>
        {displayedChildren}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {showLessLabel}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                {showMoreLabel} ({hiddenCount} more)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CardGroup;
