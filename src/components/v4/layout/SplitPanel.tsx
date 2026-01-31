'use client'

/**
 * SplitPanel - The core viewing pattern for InTime v4
 *
 * List on left, detail on right. Never lose context.
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// Types
// ============================================

interface SplitPanelContextValue {
  isOpen: boolean
  openPanel: (content: ReactNode) => void
  closePanel: () => void
  panelWidth: number
  setWidth: (width: number) => void
}

// ============================================
// Context
// ============================================

const SplitPanelContext = createContext<SplitPanelContextValue | null>(null)

export function useSplitPanel() {
  const context = useContext(SplitPanelContext)
  if (!context) {
    throw new Error('useSplitPanel must be used within SplitPanelProvider')
  }
  return context
}

// ============================================
// Provider
// ============================================

interface SplitPanelProviderProps {
  children: ReactNode
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function SplitPanelProvider({
  children,
  defaultWidth = 480,
  minWidth = 320,
  maxWidth = 800,
}: SplitPanelProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [panelContent, setPanelContent] = useState<ReactNode>(null)
  const [panelWidth, setPanelWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const openPanel = useCallback((content: ReactNode) => {
    setPanelContent(content)
    setIsOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    setIsOpen(false)
    // Delay clearing content for animation
    setTimeout(() => setPanelContent(null), 200)
  }, [])

  const setWidth = useCallback((width: number) => {
    setPanelWidth(Math.min(maxWidth, Math.max(minWidth, width)))
  }, [minWidth, maxWidth])

  // Keyboard: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        closePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closePanel])

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = e.clientX
    const startWidth = panelWidth

    const handleMouseMove = (e: MouseEvent) => {
      const diff = startX - e.clientX
      setWidth(startWidth + diff)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [panelWidth, setWidth])

  return (
    <SplitPanelContext.Provider
      value={{ isOpen, openPanel, closePanel, panelWidth, setWidth }}
    >
      <div className="flex h-full overflow-hidden">
        {/* Main content area */}
        <div
          className={cn(
            'flex-1 overflow-hidden transition-all duration-200',
            isOpen && 'mr-0'
          )}
        >
          {children}
        </div>

        {/* Panel */}
        <div
          ref={panelRef}
          className={cn(
            'relative flex-shrink-0 border-l border-[var(--linear-border-subtle)]',
            'bg-[var(--linear-bg)] overflow-hidden',
            'transition-all duration-200 ease-out',
            isOpen ? 'translate-x-0' : 'translate-x-full w-0'
          )}
          style={{ width: isOpen ? panelWidth : 0 }}
        >
          {/* Resize handle */}
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize',
              'hover:bg-[var(--linear-accent)] transition-colors',
              isResizing && 'bg-[var(--linear-accent)]'
            )}
            onMouseDown={handleMouseDown}
          />

          {/* Close button */}
          <button
            onClick={closePanel}
            className={cn(
              'absolute right-3 top-3 z-10 p-1.5 rounded-md',
              'text-[var(--linear-text-muted)] hover:text-[var(--linear-text-primary)]',
              'hover:bg-[var(--linear-surface-hover)] transition-colors'
            )}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="h-full overflow-auto">
            {panelContent}
          </div>
        </div>
      </div>
    </SplitPanelContext.Provider>
  )
}

// ============================================
// Panel Content Wrapper
// ============================================

interface PanelContentProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export function PanelContent({
  children,
  title,
  subtitle,
  actions,
  className,
}: PanelContentProps) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      {(title || actions) && (
        <header className="flex-shrink-0 px-6 py-4 border-b border-[var(--linear-border-subtle)]">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-[var(--linear-text-primary)]">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-sm text-[var(--linear-text-secondary)] mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Body */}
      <div className="flex-1 overflow-auto linear-scrollbar">
        {children}
      </div>
    </div>
  )
}

// ============================================
// Panel Section
// ============================================

interface PanelSectionProps {
  title?: string
  children: ReactNode
  className?: string
  collapsible?: boolean
  defaultOpen?: boolean
}

export function PanelSection({
  title,
  children,
  className,
  collapsible = false,
  defaultOpen = true,
}: PanelSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <section className={cn('px-6 py-4', className)}>
      {title && (
        <button
          className={cn(
            'flex items-center gap-2 text-xs font-medium uppercase tracking-wider',
            'text-[var(--linear-text-muted)] mb-3',
            collapsible && 'cursor-pointer hover:text-[var(--linear-text-secondary)]'
          )}
          onClick={() => collapsible && setIsOpen(!isOpen)}
          disabled={!collapsible}
        >
          {collapsible && (
            <span
              className={cn(
                'transition-transform',
                isOpen ? 'rotate-90' : 'rotate-0'
              )}
            >
              ▶
            </span>
          )}
          {title}
        </button>
      )}
      {(!collapsible || isOpen) && children}
    </section>
  )
}

// ============================================
// Inline Edit Field
// ============================================

interface InlineEditProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'url' | 'number'
  className?: string
}

export function InlineEdit({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  className,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
    if (tempValue !== value) {
      onChange(tempValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setTempValue(value)
      setIsEditing(false)
    }
  }

  return (
    <div className={className}>
      {label && (
        <span className="block text-xs font-medium text-[var(--linear-text-muted)] uppercase tracking-wider mb-1">
          {label}
        </span>
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          type={type}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full px-2 py-1 -mx-2 rounded-md',
            'bg-[var(--linear-surface)] border border-[var(--linear-accent)]',
            'text-[var(--linear-text-primary)] text-sm',
            'focus:outline-none focus:ring-2 focus:ring-[var(--linear-accent)]/20'
          )}
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={cn(
            'w-full text-left px-2 py-1 -mx-2 rounded-md',
            'text-[var(--linear-text-primary)] text-sm',
            'hover:bg-[var(--linear-surface-hover)] transition-colors',
            !value && 'text-[var(--linear-text-muted)] italic'
          )}
        >
          {value || placeholder || 'Click to edit'}
        </button>
      )}
    </div>
  )
}

export default SplitPanelProvider
