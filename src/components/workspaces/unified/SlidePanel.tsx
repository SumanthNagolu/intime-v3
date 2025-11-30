/**
 * SlidePanel Component
 *
 * A slide-over panel for viewing related entities without losing the main context.
 * Slides in from the right side of the screen.
 *
 * Features:
 * - Slide from right (configurable width)
 * - Stack multiple panels
 * - Close on escape key
 * - Close on outside click (optional)
 * - Animated transitions
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// =====================================================
// TYPES
// =====================================================

export interface SlidePanelItem {
  id: string;
  title: string;
  subtitle?: string;
  content: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface SlidePanelContextValue {
  panels: SlidePanelItem[];
  openPanel: (panel: SlidePanelItem) => void;
  closePanel: (id?: string) => void;
  closeAllPanels: () => void;
  isOpen: boolean;
}

export interface SlidePanelProviderProps {
  children: ReactNode;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
}

export interface SlidePanelProps {
  panel: SlidePanelItem;
  index: number;
  total: number;
  onClose: () => void;
  onBack?: () => void;
}

// =====================================================
// CONTEXT
// =====================================================

const SlidePanelContext = createContext<SlidePanelContextValue | null>(null);

export function useSlidePanel() {
  const context = useContext(SlidePanelContext);
  if (!context) {
    throw new Error('useSlidePanel must be used within a SlidePanelProvider');
  }
  return context;
}

// =====================================================
// PROVIDER
// =====================================================

export function SlidePanelProvider({
  children,
  closeOnOutsideClick = true,
  closeOnEscape = true,
}: SlidePanelProviderProps) {
  const [panels, setPanels] = useState<SlidePanelItem[]>([]);

  const openPanel = useCallback((panel: SlidePanelItem) => {
    setPanels((prev) => {
      // If panel with same ID exists, replace it
      const existingIndex = prev.findIndex((p) => p.id === panel.id);
      if (existingIndex >= 0) {
        const newPanels = [...prev];
        newPanels[existingIndex] = panel;
        return newPanels;
      }
      return [...prev, panel];
    });
  }, []);

  const closePanel = useCallback((id?: string) => {
    setPanels((prev) => {
      if (id) {
        return prev.filter((p) => p.id !== id);
      }
      // Close the topmost panel
      return prev.slice(0, -1);
    });
  }, []);

  const closeAllPanels = useCallback(() => {
    setPanels([]);
  }, []);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || panels.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnEscape, panels.length, closePanel]);

  const contextValue: SlidePanelContextValue = {
    panels,
    openPanel,
    closePanel,
    closeAllPanels,
    isOpen: panels.length > 0,
  };

  return (
    <SlidePanelContext.Provider value={contextValue}>
      {children}

      {/* Backdrop */}
      {panels.length > 0 && (
        <div
          className={cn(
            'fixed inset-0 bg-black/20 z-40 transition-opacity duration-200',
            panels.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => closeOnOutsideClick && closeAllPanels()}
        />
      )}

      {/* Panel Stack */}
      <div className="fixed inset-y-0 right-0 z-50 flex pointer-events-none">
        {panels.map((panel, index) => (
          <SlidePanel
            key={panel.id}
            panel={panel}
            index={index}
            total={panels.length}
            onClose={() => closePanel(panel.id)}
            onBack={index > 0 ? () => closePanel(panel.id) : undefined}
          />
        ))}
      </div>
    </SlidePanelContext.Provider>
  );
}

// =====================================================
// PANEL COMPONENT
// =====================================================

const WIDTH_CLASSES = {
  sm: 'w-80',
  md: 'w-96',
  lg: 'w-[480px]',
  xl: 'w-[600px]',
};

function SlidePanel({ panel, index, total, onClose, onBack }: SlidePanelProps) {
  const [isVisible, setIsVisible] = useState(false);
  const width = panel.width || 'lg';

  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Calculate offset for stacked panels
  const stackOffset = (total - 1 - index) * 16;

  return (
    <div
      className={cn(
        'pointer-events-auto flex flex-col h-full bg-background border-l border-border shadow-xl',
        'transition-transform duration-200 ease-out',
        isVisible ? 'translate-x-0' : 'translate-x-full',
        WIDTH_CLASSES[width]
      )}
      style={{
        transform: isVisible ? `translateX(-${stackOffset}px)` : 'translateX(100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-stone-50/50">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onBack}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          <div>
            <h3 className="font-semibold text-charcoal">{panel.title}</h3>
            {panel.subtitle && (
              <p className="text-xs text-muted-foreground">{panel.subtitle}</p>
            )}
          </div>
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">{panel.content}</div>
    </div>
  );
}

// =====================================================
// TRIGGER COMPONENT
// =====================================================

export interface SlidePanelTriggerProps {
  panel: Omit<SlidePanelItem, 'id'> & { id?: string };
  children: ReactNode;
  asChild?: boolean;
}

export function SlidePanelTrigger({
  panel,
  children,
  asChild = false,
}: SlidePanelTriggerProps) {
  const { openPanel } = useSlidePanel();

  const handleClick = useCallback(() => {
    openPanel({
      id: panel.id || `panel-${Date.now()}`,
      ...panel,
    } as SlidePanelItem);
  }, [panel, openPanel]);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }

  return (
    <span onClick={handleClick} className="cursor-pointer">
      {children}
    </span>
  );
}

// =====================================================
// EXPORTS
// =====================================================

export default SlidePanel;
