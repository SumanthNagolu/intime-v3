'use client';

/**
 * TagsColumn Component
 *
 * Display multiple tags/skills with overflow handling.
 */

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TagsConfig } from '../types';

// ==========================================
// PROPS
// ==========================================

interface TagsColumnProps {
  /** Tags array */
  value: string[] | null | undefined;

  /** Tags configuration */
  config?: TagsConfig;

  /** Click handler for tag */
  onTagClick?: (tag: string) => void;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function TagsColumn({ value, config = {}, onTagClick, className }: TagsColumnProps) {
  if (!value || value.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  const {
    maxVisible = 3,
    colors = {},
    showCount = true,
    clickable = false,
  } = config;

  const visible = value.slice(0, maxVisible);
  const remaining = value.length - maxVisible;
  const hiddenTags = value.slice(maxVisible);

  return (
    <div className={cn('flex items-center gap-1 flex-wrap', className)}>
      {visible.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className={cn(
            'text-xs font-normal',
            colors[tag],
            clickable && 'cursor-pointer hover:bg-secondary/80'
          )}
          onClick={clickable ? () => onTagClick?.(tag) : undefined}
        >
          {tag}
        </Badge>
      ))}

      {remaining > 0 && showCount && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs font-normal cursor-default">
                +{remaining}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="flex flex-wrap gap-1">
                {hiddenTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// ==========================================
// SKILLS COLUMN
// ==========================================

interface SkillsColumnProps {
  /** Skills array */
  skills: string[] | null | undefined;

  /** Maximum visible skills */
  maxVisible?: number;

  /** Click handler */
  onSkillClick?: (skill: string) => void;

  /** Additional class name */
  className?: string;
}

export function SkillsColumn({
  skills,
  maxVisible = 3,
  onSkillClick,
  className,
}: SkillsColumnProps) {
  return (
    <TagsColumn
      value={skills}
      config={{ maxVisible, clickable: !!onSkillClick }}
      onTagClick={onSkillClick}
      className={className}
    />
  );
}

export default TagsColumn;
