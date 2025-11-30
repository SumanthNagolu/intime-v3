/**
 * MasterDetailLayout Component
 *
 * A resizable split-pane layout for master-detail views.
 * Left panel shows a list of entities, right panel shows the selected entity's detail.
 *
 * Features:
 * - Resizable split pane with drag handle
 * - Collapsible list panel (keyboard shortcut: Cmd/Ctrl + [)
 * - URL sync for selected item (?id=xxx)
 * - Keyboard navigation (up/down arrows to navigate list)
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

// =====================================================
// TYPES
// =====================================================

export interface MasterDetailContextValue {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isListCollapsed: boolean;
  toggleListCollapsed: () => void;
  listWidth: number;
}

export interface MasterDetailLayoutProps {
  children: ReactNode;
  defaultSplit?: number; // Default split percentage (0-100), default 30
  minListWidth?: number; // Minimum list width in pixels, default 280
  maxListWidth?: number; // Maximum list width in pixels, default 600
  onSelectionChange?: (id: string | null) => void;
  syncToUrl?: boolean; // Whether to sync selected ID to URL, default true
  className?: string;
}

export interface MasterListProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

export interface MasterDetailProps {
  children: ReactNode;
  className?: string;
  emptyState?: ReactNode;
}

// =====================================================
// CONTEXT
// =====================================================

const MasterDetailContext = createContext<MasterDetailContextValue | null>(null);

export function useMasterDetail() {
  const context = useContext(MasterDetailContext);
  if (!context) {
    throw new Error('useMasterDetail must be used within a MasterDetailLayout');
  }
  return context;
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export function MasterDetailLayout({
  children,
  defaultSplit = 30,
  minListWidth = 280,
  maxListWidth = 600,
  onSelectionChange,
  syncToUrl = true,
  className,
}: MasterDetailLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Calculate initial width from percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [listWidth, setListWidth] = useState(
    Math.min(Math.max((containerWidth * defaultSplit) / 100, minListWidth), maxListWidth) || 320
  );
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Get selected ID from URL or state
  const urlSelectedId = searchParams.get('id');
  const [selectedId, setSelectedIdState] = useState<string | null>(urlSelectedId);

  // Sync selected ID to URL
  const setSelectedId = useCallback(
    (id: string | null) => {
      setSelectedIdState(id);
      onSelectionChange?.(id);

      if (syncToUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (id) {
          params.set('id', id);
        } else {
          params.delete('id');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [syncToUrl, pathname, searchParams, router, onSelectionChange]
  );

  // Sync from URL on mount
  useEffect(() => {
    if (syncToUrl && urlSelectedId !== selectedId) {
      setSelectedIdState(urlSelectedId);
      onSelectionChange?.(urlSelectedId);
    }
  }, [urlSelectedId, syncToUrl, selectedId, onSelectionChange]);

  // Observe container width for responsive behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width || 0;
      setContainerWidth(width);

      // Initialize list width based on percentage
      if (listWidth === 320) {
        const initialWidth = Math.min(
          Math.max((width * defaultSplit) / 100, minListWidth),
          maxListWidth
        );
        setListWidth(initialWidth);
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [defaultSplit, minListWidth, maxListWidth, listWidth]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + [ to toggle collapse
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        e.preventDefault();
        setIsListCollapsed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Drag resize handler (removed - not currently used)

  useEffect(() => {
    if (!isDragging) return;

    const handleDrag = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const clampedWidth = Math.min(Math.max(newWidth, minListWidth), maxListWidth);
      setListWidth(clampedWidth);
    };

    const handleDragEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, minListWidth, maxListWidth]);

  const toggleListCollapsed = useCallback(() => {
    setIsListCollapsed((prev) => !prev);
  }, []);

  const contextValue: MasterDetailContextValue = {
    selectedId,
    setSelectedId,
    isListCollapsed,
    toggleListCollapsed,
    listWidth,
  };

  return (
    <MasterDetailContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn(
          'flex h-full w-full overflow-hidden bg-background',
          isDragging && 'select-none cursor-col-resize',
          className
        )}
      >
        {children}

        {/* Drag overlay when resizing */}
        {isDragging && <div className="fixed inset-0 z-50 cursor-col-resize" />}
      </div>
    </MasterDetailContext.Provider>
  );
}

// =====================================================
// LIST COMPONENT
// =====================================================

export function MasterList({ children, className, header, footer }: MasterListProps) {
  const { isListCollapsed, listWidth } = useMasterDetail();

  return (
    <div
      className={cn(
        'flex flex-col border-r border-border bg-stone-50/50 transition-all duration-200',
        isListCollapsed ? 'w-0 overflow-hidden' : '',
        className
      )}
      style={{ width: isListCollapsed ? 0 : listWidth }}
    >
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 border-b border-border px-4 py-3">{header}</div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 border-t border-border px-4 py-3">{footer}</div>
      )}
    </div>
  );
}

// =====================================================
// RESIZE HANDLE
// =====================================================

export function MasterResizeHandle() {
  const { isListCollapsed, toggleListCollapsed } = useMasterDetail();
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging]);

  return (
    <div
      ref={handleRef}
      className={cn(
        'relative flex-shrink-0 w-1 group cursor-col-resize',
        'hover:bg-rust/20 transition-colors',
        isDragging && 'bg-rust/30'
      )}
      onMouseDown={handleMouseDown}
    >
      {/* Drag handle indicator */}
      <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Collapse toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-10 h-6 w-6 rounded-full',
          'bg-background border border-border shadow-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isListCollapsed ? '-left-3' : '-left-3'
        )}
        onClick={toggleListCollapsed}
      >
        {isListCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
}

// =====================================================
// DETAIL COMPONENT
// =====================================================

export function MasterDetail({ children, className, emptyState }: MasterDetailProps) {
  const { selectedId } = useMasterDetail();

  const defaultEmptyState = (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">Select an item</p>
        <p className="text-sm">Choose an item from the list to view details</p>
      </div>
    </div>
  );

  return (
    <div className={cn('flex-1 overflow-auto bg-background', className)}>
      {selectedId ? children : emptyState || defaultEmptyState}
    </div>
  );
}

// =====================================================
// COMPOUND COMPONENT EXPORTS
// =====================================================

MasterDetailLayout.List = MasterList;
MasterDetailLayout.ResizeHandle = MasterResizeHandle;
MasterDetailLayout.Detail = MasterDetail;

export default MasterDetailLayout;
