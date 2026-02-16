'use client'

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  memo,
  type ReactNode,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  Star,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useContextPanelStore,
  CONTEXT_PANEL_MIN_WIDTH,
  CONTEXT_PANEL_MAX_WIDTH,
  type ContextEntry,
} from '@/stores/context-panel-store'
import { EntityContext, type EntityContextData } from './EntityContext'
import { RecentActivity, type ActivityEntry } from './RecentActivity'
import { QuickActions, type QuickAction, getDefaultActionsForEntity } from './QuickActions'

// ============================================
// Types
// ============================================

interface ContextPanelProps {
  children?: ReactNode
  className?: string
  // Data fetching callbacks (to be implemented by parent)
  onFetchEntityContext?: (type: string, id: string) => Promise<EntityContextData | null>
  onFetchRecentActivity?: (type: string, id: string) => Promise<ActivityEntry[]>
  onAction?: (actionId: string, entityType: string, entityId: string) => void
}

// ============================================
// Sub-components
// ============================================

const PanelHeader = memo(function PanelHeader({
  currentContext,
  historyIndex,
  historyLength,
  isPinned,
  onGoBack,
  onGoForward,
  onTogglePin,
  onClose,
  onCollapse,
}: {
  currentContext: ContextEntry | null
  historyIndex: number
  historyLength: number
  isPinned: boolean
  onGoBack: () => void
  onGoForward: () => void
  onTogglePin: () => void
  onClose: () => void
  onCollapse: () => void
}) {
  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < historyLength - 1

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-charcoal-100 bg-charcoal-50/50">
      <div className="flex items-center gap-1">
        {/* History navigation */}
        <button
          onClick={onGoBack}
          disabled={!canGoBack}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            canGoBack
              ? 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
              : 'text-charcoal-300 cursor-not-allowed'
          )}
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onGoForward}
          disabled={!canGoForward}
          className={cn(
            'p-1.5 rounded-md transition-colors',
            canGoForward
              ? 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-100'
              : 'text-charcoal-300 cursor-not-allowed'
          )}
          title="Go forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {/* Pin toggle */}
        {currentContext && (
          <button
            onClick={onTogglePin}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              isPinned
                ? 'text-gold-500 hover:text-gold-600'
                : 'text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100'
            )}
            title={isPinned ? 'Unpin' : 'Pin'}
          >
            <Star className={cn('w-4 h-4', isPinned && 'fill-current')} />
          </button>
        )}

        {/* Collapse */}
        <button
          onClick={onCollapse}
          className="p-1.5 rounded-md text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 transition-colors"
          title="Collapse panel"
        >
          <PanelRightClose className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
})

const RecentEntitiesList = memo(function RecentEntitiesList({
  recentEntities,
  pinnedEntities,
  currentId,
  onSelect,
}: {
  recentEntities: ContextEntry[]
  pinnedEntities: ContextEntry[]
  currentId: string | null
  onSelect: (entry: ContextEntry) => void
}) {
  if (pinnedEntities.length === 0 && recentEntities.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Clock className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
        <p className="text-sm text-charcoal-500">No recent entities</p>
        <p className="text-xs text-charcoal-400 mt-1">
          Click on an entity to see its context
        </p>
      </div>
    )
  }

  return (
    <div className="px-2 py-2">
      {/* Pinned entities */}
      {pinnedEntities.length > 0 && (
        <div className="mb-4">
          <h4 className="px-2 mb-1 text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
            <Pin className="w-3 h-3" />
            Pinned
          </h4>
          <div className="space-y-0.5">
            {pinnedEntities.map((entry) => (
              <button
                key={entry.entityId}
                onClick={() => onSelect(entry)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
                  entry.entityId === currentId
                    ? 'bg-gold-50 text-charcoal-900'
                    : 'text-charcoal-700 hover:bg-charcoal-50'
                )}
              >
                <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider w-16 flex-shrink-0">
                  {entry.entityType}
                </span>
                <span className="text-sm truncate flex-1">
                  {entry.entityName || entry.entityId.slice(0, 8)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent entities */}
      {recentEntities.length > 0 && (
        <div>
          <h4 className="px-2 mb-1 text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Recent
          </h4>
          <div className="space-y-0.5">
            {recentEntities
              .filter((e) => !pinnedEntities.some((p) => p.entityId === e.entityId))
              .map((entry) => (
                <button
                  key={entry.entityId}
                  onClick={() => onSelect(entry)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
                    entry.entityId === currentId
                      ? 'bg-gold-50 text-charcoal-900'
                      : 'text-charcoal-700 hover:bg-charcoal-50'
                  )}
                >
                  <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider w-16 flex-shrink-0">
                    {entry.entityType}
                  </span>
                  <span className="text-sm truncate flex-1">
                    {entry.entityName || entry.entityId.slice(0, 8)}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
})

const CollapsedPanel = memo(function CollapsedPanel({
  onExpand,
}: {
  onExpand: () => void
}) {
  return (
    <div className="w-10 h-full border-l border-charcoal-100 bg-charcoal-50/50 flex flex-col items-center py-2">
      <button
        onClick={onExpand}
        className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 transition-colors"
        title="Expand panel"
      >
        <PanelRightOpen className="w-4 h-4" />
      </button>
    </div>
  )
})

// ============================================
// Main Component
// ============================================

export const ContextPanel = memo(function ContextPanel({
  children,
  className,
  onFetchEntityContext,
  onFetchRecentActivity,
  onAction,
}: ContextPanelProps) {
  const {
    currentContext,
    history,
    historyIndex,
    panelState,
    pinnedEntities,
    recentEntities,
    setContext,
    goBack,
    goForward,
    togglePanel,
    collapsePanel,
    setWidth,
    pinEntity,
    unpinEntity,
    isPinned,
  } = useContextPanelStore()

  const panelRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  // Entity context data (would be fetched via callback)
  const [entityData, setEntityData] = useState<EntityContextData | null>(null)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch entity data when context changes
  useEffect(() => {
    if (!currentContext) {
      setEntityData(null)
      setActivities([])
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      try {
        if (onFetchEntityContext) {
          const data = await onFetchEntityContext(
            currentContext.entityType,
            currentContext.entityId
          )
          setEntityData(data)
        }
        if (onFetchRecentActivity) {
          const activityData = await onFetchRecentActivity(
            currentContext.entityType,
            currentContext.entityId
          )
          setActivities(activityData)
        }
      } catch (error) {
        console.error('Failed to fetch context data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentContext, onFetchEntityContext, onFetchRecentActivity])

  // Handle resize
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isResizing.current = true

    const startX = e.clientX
    const startWidth = panelState.mode === 'expanded' ? panelState.width : 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return
      const diff = startX - e.clientX
      setWidth(startWidth + diff)
    }

    const handleMouseUp = () => {
      isResizing.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [panelState, setWidth])

  // Handle pin toggle
  const handleTogglePin = useCallback(() => {
    if (!currentContext) return

    if (isPinned(currentContext.entityId)) {
      unpinEntity(currentContext.entityId)
    } else {
      pinEntity(currentContext)
    }
  }, [currentContext, isPinned, pinEntity, unpinEntity])

  // Handle action
  const handleAction = useCallback(
    (actionId: string) => {
      if (!currentContext || !onAction) return
      onAction(actionId, currentContext.entityType, currentContext.entityId)
    },
    [currentContext, onAction]
  )

  // Handle entity selection from recent list
  const handleSelectEntity = useCallback(
    (entry: ContextEntry) => {
      setContext(entry.entityType, entry.entityId, entry.entityName)
    },
    [setContext]
  )

  // Keyboard shortcut: Toggle panel with Cmd/Ctrl + \
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        togglePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePanel])

  // Collapsed state
  if (panelState.mode === 'collapsed') {
    return (
      <div className={cn('flex-shrink-0', className)}>
        <CollapsedPanel onExpand={togglePanel} />
      </div>
    )
  }

  const currentIsPinned = currentContext ? isPinned(currentContext.entityId) : false

  return (
    <div
      ref={panelRef}
      className={cn(
        'flex-shrink-0 flex flex-col h-full border-l border-charcoal-100 bg-white',
        className
      )}
      style={{ width: panelState.width }}
    >
      {/* Resize handle */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10',
          'hover:bg-gold-500 transition-colors',
          isResizing.current && 'bg-gold-500'
        )}
        onMouseDown={handleResizeStart}
      />

      {/* Header */}
      <PanelHeader
        currentContext={currentContext}
        historyIndex={historyIndex}
        historyLength={history.length}
        isPinned={currentIsPinned}
        onGoBack={goBack}
        onGoForward={goForward}
        onTogglePin={handleTogglePin}
        onClose={() => setContext('', '')}
        onCollapse={collapsePanel}
      />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {currentContext && entityData ? (
          <div className="divide-y divide-charcoal-100">
            {/* Entity context */}
            <EntityContext
              data={entityData}
              isLoading={isLoading}
              isPinned={currentIsPinned}
              onPin={handleTogglePin}
            />

            {/* Quick actions */}
            <div className="py-4">
              <QuickActions
                actions={getDefaultActionsForEntity(currentContext.entityType)}
                onAction={handleAction}
                entityType={currentContext.entityType}
                entityId={currentContext.entityId}
              />
            </div>

            {/* Recent activity */}
            <div className="py-4">
              <RecentActivity
                activities={activities}
                entityId={currentContext.entityId}
                entityType={currentContext.entityType}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          <RecentEntitiesList
            recentEntities={recentEntities}
            pinnedEntities={pinnedEntities}
            currentId={currentContext?.entityId ?? null}
            onSelect={handleSelectEntity}
          />
        )}
      </div>
    </div>
  )
})

export default ContextPanel
