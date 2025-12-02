'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarCollapseButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

/**
 * Sidebar collapse toggle button
 * Fixed at bottom of sidebar
 */
export function SidebarCollapseButton({
  isCollapsed,
  onToggle,
}: SidebarCollapseButtonProps) {
  return (
    <div className="h-12 px-3 flex items-center border-t border-border">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={cn(
          'w-full justify-center gap-2',
          isCollapsed && 'px-2'
        )}
      >
        {isCollapsed ? (
          <ChevronRight size={16} />
        ) : (
          <>
            <ChevronLeft size={16} />
            <span>Collapse</span>
          </>
        )}
      </Button>
    </div>
  );
}
