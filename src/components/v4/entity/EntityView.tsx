'use client'

/**
 * EntityView - Unified entity detail view component
 *
 * This is the single component that renders detail views for ALL entity types.
 * It uses the entity schema to determine layout, tabs, and actions.
 */

import { useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Copy, MoreHorizontal, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EntitySchema, EntityData, TabDefinition } from '@/lib/entity/schema'
import {
  getEntityTitle,
  getEntitySubtitle,
  getStatusConfig,
  getAvailableActions,
} from '@/lib/entity/schema'

// ============================================
// Props
// ============================================

interface EntityViewProps {
  schema: EntitySchema
  entity: EntityData
  className?: string
}

// ============================================
// Sub-components
// ============================================

function EntityHeader({
  schema,
  entity,
}: {
  schema: EntitySchema
  entity: EntityData
}) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)

  const title = getEntityTitle(schema, entity)
  const subtitle = getEntitySubtitle(schema, entity)
  const statusValue = entity[schema.status.field] as string
  const statusConfig = getStatusConfig(schema, statusValue)
  const actions = getAvailableActions(schema, entity)
  const Icon = schema.icon

  const copyId = useCallback(() => {
    navigator.clipboard.writeText(entity.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [entity.id])

  const handleAction = useCallback(
    (action: typeof actions[0]) => {
      setActionsOpen(false)
      if (action.type === 'navigate' && action.href) {
        const href = typeof action.href === 'function' ? action.href(entity) : action.href
        router.push(href)
      }
      // Other action types would be handled here
    },
    [entity, router]
  )

  return (
    <header className="sticky top-0 z-10 bg-[var(--linear-bg)] border-b border-[var(--linear-border-subtle)]">
      {/* Top bar with back button and actions */}
      <div className="flex items-center justify-between px-4 h-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--linear-text-secondary)] hover:text-[var(--linear-text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Primary action */}
          {schema.actions.primary && (
            <button
              onClick={() => handleAction(schema.actions.primary!)}
              className="linear-btn linear-btn-primary"
            >
              {schema.actions.primary.icon && (
                <schema.actions.primary.icon className="w-4 h-4" />
              )}
              <span>{schema.actions.primary.label}</span>
              {schema.actions.primary.shortcut && (
                <kbd className="linear-kbd ml-2">{schema.actions.primary.shortcut}</kbd>
              )}
            </button>
          )}

          {/* Actions dropdown */}
          <div className="relative">
            <button
              onClick={() => setActionsOpen(!actionsOpen)}
              className="linear-btn linear-btn-ghost p-2"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {actionsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setActionsOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--linear-surface)] border border-[var(--linear-border)] rounded-lg shadow-lg z-20 py-1">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => handleAction(action)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors',
                        action.variant === 'destructive'
                          ? 'text-[var(--linear-error)] hover:bg-[var(--linear-error-muted)]'
                          : 'text-[var(--linear-text-primary)] hover:bg-[var(--linear-surface-hover)]'
                      )}
                    >
                      {action.icon && <action.icon className="w-4 h-4" />}
                      <span className="flex-1">{action.label}</span>
                      {action.shortcut && (
                        <kbd className="linear-kbd">{action.shortcut}</kbd>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Entity title bar */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--linear-surface-hover)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[var(--linear-text-secondary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[var(--linear-text-primary)] truncate">
                {title}
              </h1>
              {statusConfig && (
                <span
                  className={cn(
                    'linear-badge',
                    `linear-badge-${statusConfig.color}`
                  )}
                >
                  <span className="linear-badge-dot" />
                  {statusConfig.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {subtitle && (
                <span className="text-sm text-[var(--linear-text-secondary)]">
                  {subtitle}
                </span>
              )}
              <button
                onClick={copyId}
                className="flex items-center gap-1 text-xs text-[var(--linear-text-muted)] hover:text-[var(--linear-text-secondary)] transition-colors"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                <span className="font-mono">{entity.id.slice(0, 8)}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

function QuickInfoBar({
  schema,
  entity,
}: {
  schema: EntitySchema
  entity: EntityData
}) {
  return (
    <div className="linear-quick-info">
      {schema.quickInfo.map((field) => {
        // Get the value (support nested keys like 'account.name')
        const keys = field.key.split('.')
        let value: unknown = entity
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key]
        }

        if (value === null || value === undefined) return null

        // Format the value
        let displayValue = String(value)
        if (field.format === 'currency') {
          displayValue = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
          }).format(Number(value))
        } else if (field.format === 'date') {
          displayValue = new Date(value as string).toLocaleDateString()
        }

        // Skip status - it's shown in the header
        if (field.format === 'status') return null

        return (
          <div key={field.key} className="linear-quick-info-item">
            {field.icon && <field.icon className="w-4 h-4 text-[var(--linear-text-muted)]" />}
            {field.label && <span className="label">{field.label}:</span>}
            <span className="value">{displayValue}</span>
          </div>
        )
      })}
    </div>
  )
}

function TabNav({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: TabDefinition[]
  activeTab: string
  onTabChange: (tabId: string) => void
}) {
  return (
    <nav className="linear-tabs px-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn('linear-tab', activeTab === tab.id && 'active')}
        >
          {tab.icon && <tab.icon className="w-4 h-4 mr-2 inline-block" />}
          {tab.label}
        </button>
      ))}
    </nav>
  )
}

function TabContent({
  tab,
  entity,
  schema,
}: {
  tab: TabDefinition
  entity: EntityData
  schema: EntitySchema
}) {
  // If tab has a custom component, render it
  if (tab.component) {
    const Component = tab.component
    return <Component entity={entity} schema={schema} />
  }

  // If tab has fields, render them as a form-like display
  if (tab.fields) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {tab.fields.map((fieldKey) => {
            const field = schema.fields[fieldKey]
            if (!field) return null

            // Get value (support nested keys)
            const keys = fieldKey.split('.')
            let value: unknown = entity
            for (const key of keys) {
              value = (value as Record<string, unknown>)?.[key]
            }

            // Format display value
            let displayValue = '—'
            if (value !== null && value !== undefined) {
              if (field.type === 'currency') {
                displayValue = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(Number(value))
              } else if (field.type === 'date') {
                displayValue = new Date(value as string).toLocaleDateString()
              } else if (field.type === 'boolean') {
                displayValue = value ? 'Yes' : 'No'
              } else if (field.type === 'select') {
                const option = field.options?.find((o) => o.value === value)
                displayValue = option?.label || String(value)
              } else if (field.type === 'tags' && Array.isArray(value)) {
                displayValue = (value as string[]).join(', ')
              } else {
                displayValue = String(value)
              }
            }

            return (
              <div key={fieldKey} className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--linear-text-muted)] uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="text-sm text-[var(--linear-text-primary)]">
                  {displayValue}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // If tab is a relation tab, render a placeholder
  if (tab.relationEntity) {
    return (
      <div className="p-6">
        <div className="linear-empty-state">
          <div className="title">Related {tab.label}</div>
          <div className="description">
            This tab would show related {tab.relationEntity} entities.
          </div>
        </div>
      </div>
    )
  }

  // Default: Activity tab
  return (
    <div className="p-6">
      <div className="linear-empty-state">
        <div className="title">Activity</div>
        <div className="description">
          Recent activity and history will appear here.
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Component
// ============================================

export function EntityView({ schema, entity, className }: EntityViewProps) {
  const [activeTab, setActiveTab] = useState(schema.tabs[0]?.id || 'summary')

  const currentTab = useMemo(
    () => schema.tabs.find((t) => t.id === activeTab) || schema.tabs[0],
    [schema.tabs, activeTab]
  )

  return (
    <div className={cn('linear-page flex flex-col h-full', className)}>
      <EntityHeader schema={schema} entity={entity} />
      <QuickInfoBar schema={schema} entity={entity} />
      <TabNav
        tabs={schema.tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="flex-1 overflow-auto linear-scrollbar">
        {currentTab && (
          <TabContent tab={currentTab} entity={entity} schema={schema} />
        )}
      </main>
    </div>
  )
}

export default EntityView
