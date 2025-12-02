/**
 * Create Activity Button
 *
 * FAB or inline button to create new activities.
 * Opens pattern selector and quick create modal.
 */

'use client';

import React, { useState } from 'react';
import { Plus, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { PatternSelector } from '../patterns/PatternSelector';
import { ActivityQuickCreateModal } from './ActivityQuickCreateModal';
import type { ActivityPattern } from '@/lib/activities/patterns';

export interface CreateActivityButtonProps {
  /** Entity type context (pre-fills entity reference) */
  entityType?: string;

  /** Entity ID context */
  entityId?: string;

  /** Entity name for display */
  entityName?: string;

  /** Button variant */
  variant?: 'fab' | 'inline' | 'icon';

  /** Size */
  size?: 'sm' | 'md' | 'lg';

  /** Label text (for inline variant) */
  label?: string;

  /** Show keyboard shortcut hint */
  showShortcut?: boolean;

  /** Callback after activity created */
  onActivityCreated?: (activityId: string) => void;

  /** Additional className */
  className?: string;
}

export function CreateActivityButton({
  entityType,
  entityId,
  entityName,
  variant = 'inline',
  size = 'md',
  label = 'New Activity',
  showShortcut = false,
  onActivityCreated,
  className,
}: CreateActivityButtonProps) {
  const [showPatternSelector, setShowPatternSelector] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<ActivityPattern | null>(null);

  // Handle keyboard shortcut
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // 'n' key when not in input
      if (
        e.key === 'n' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setShowPatternSelector(true);
      }
    }

    if (showShortcut) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showShortcut]);

  const handlePatternSelect = (pattern: ActivityPattern) => {
    setSelectedPattern(pattern);
    setShowPatternSelector(false);
    setShowQuickCreate(true);
  };

  const handleActivityCreated = (activityId: string) => {
    setShowQuickCreate(false);
    setSelectedPattern(null);
    onActivityCreated?.(activityId);
  };

  const buttonContent = (
    <>
      <Plus className={cn(
        size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
        variant === 'inline' && 'mr-1.5'
      )} />
      {variant === 'inline' && label}
    </>
  );

  const sizeClasses = {
    sm: variant === 'icon' ? 'h-8 w-8' : 'h-8 text-sm',
    md: variant === 'icon' ? 'h-9 w-9' : 'h-9',
    lg: variant === 'icon' ? 'h-10 w-10' : 'h-10',
  };

  const renderButton = () => {
    if (variant === 'fab') {
      return (
        <Button
          size="lg"
          className={cn(
            'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg',
            'hover:shadow-xl transition-all duration-200',
            'z-50',
            className
          )}
          onClick={() => setShowPatternSelector(true)}
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">{label}</span>
        </Button>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant === 'icon' ? 'ghost' : 'default'}
              size={variant === 'icon' ? 'icon' : 'default'}
              className={cn(sizeClasses[size], className)}
              onClick={() => setShowPatternSelector(true)}
            >
              {buttonContent}
            </Button>
          </TooltipTrigger>
          {showShortcut && (
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>New Activity</span>
                <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">N</kbd>
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      {renderButton()}

      {/* Pattern Selector Modal */}
      <PatternSelector
        open={showPatternSelector}
        onOpenChange={setShowPatternSelector}
        onSelect={handlePatternSelect}
        entityType={entityType}
      />

      {/* Quick Create Modal */}
      {selectedPattern && (
        <ActivityQuickCreateModal
          open={showQuickCreate}
          onOpenChange={setShowQuickCreate}
          pattern={selectedPattern}
          entityType={entityType}
          entityId={entityId}
          entityName={entityName}
          onSuccess={handleActivityCreated}
        />
      )}
    </>
  );
}

export default CreateActivityButton;
