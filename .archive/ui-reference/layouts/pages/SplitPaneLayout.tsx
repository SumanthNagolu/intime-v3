'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { layoutTokens } from '@/lib/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface SplitPaneLayoutProps {
  /** Left panel (list) content */
  listContent: React.ReactNode;
  /** Right panel (detail) content */
  detailContent: React.ReactNode;
  /** Currently selected item ID */
  selectedId?: string;
  /** Width of left panel */
  listWidth?: number | string;
  /** Show loading state for list */
  isListLoading?: boolean;
  /** Show loading state for detail */
  isDetailLoading?: boolean;
  /** Empty state for detail panel */
  emptyDetailMessage?: string;
  /** Whether detail panel should be hidden on mobile */
  hideDetailOnMobile?: boolean;
  className?: string;
}

/**
 * Split pane (master-detail) layout
 * Left panel shows list, right panel shows detail of selected item
 */
export function SplitPaneLayout({
  listContent,
  detailContent,
  selectedId,
  listWidth = 320,
  isListLoading,
  isDetailLoading,
  emptyDetailMessage = 'Select an item to view details',
  hideDetailOnMobile = true,
  className,
}: SplitPaneLayoutProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dividerPosition, setDividerPosition] = useState(
    typeof listWidth === 'number' ? listWidth : 320
  );

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newPosition = Math.max(240, Math.min(480, e.clientX));
    setDividerPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={cn(
        'h-[calc(100vh-56px)] flex',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Left Panel (List) */}
      <div
        className="border-r border-border flex flex-col shrink-0"
        style={{ width: dividerPosition }}
      >
        <ScrollArea className="flex-1">
          {isListLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            listContent
          )}
        </ScrollArea>
      </div>

      {/* Resizable Divider */}
      <div
        className={cn(
          'w-1 bg-border hover:bg-forest/30 cursor-col-resize transition-colors',
          isDragging && 'bg-forest/50'
        )}
        onMouseDown={handleMouseDown}
      />

      {/* Right Panel (Detail) */}
      <div
        className={cn(
          'flex-1 min-w-0',
          hideDetailOnMobile && !selectedId && 'hidden lg:block'
        )}
      >
        <ScrollArea className="h-full">
          {isDetailLoading ? (
            <div
              className="p-6 space-y-4"
              style={{
                padding: `${layoutTokens.page.paddingY}px ${layoutTokens.page.paddingX}px`,
              }}
            >
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          ) : selectedId ? (
            detailContent
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>{emptyDetailMessage}</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
