'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { ConfigureFeatureFlagDialog } from './ConfigureFeatureFlagDialog'
import { CreateFeatureFlagDialog } from './CreateFeatureFlagDialog'
import { ViewUsageDialog } from './ViewUsageDialog'
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  FlaskConical,
  Shield,
  Percent,
  Clock,
  Settings,
  BarChart2,
  MoreVertical,
  Copy,
  Trash2,
  Keyboard,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const STATE_CONFIG = {
  enabled: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Enabled' },
  disabled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Disabled' },
  beta: { icon: FlaskConical, color: 'bg-yellow-100 text-yellow-800', label: 'Beta' },
  internal: { icon: Shield, color: 'bg-blue-100 text-blue-800', label: 'Internal' },
  percentage: { icon: Percent, color: 'bg-orange-100 text-orange-800', label: 'Rollout' },
  coming_soon: { icon: Clock, color: 'bg-charcoal-100 text-charcoal-600', label: 'Coming Soon' },
} as const

const STRATEGY_LABELS: Record<string, string> = {
  all: 'All Users',
  roles: 'Specific Roles',
  users: 'Specific Users',
  pods: 'Specific Pods',
  percentage: 'Percentage Rollout',
  none: 'Disabled',
}

export function FeatureFlagsListPage() {
  const [search, setSearch] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [configureId, setConfigureId] = useState<string | null>(null)
  const [usageId, setUsageId] = useState<string | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        // Only handle Escape in inputs
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur()
        }
        return
      }

      // / - Focus search
      if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
        return
      }

      // n - New feature flag
      if (e.key === 'n') {
        e.preventDefault()
        setCreateOpen(true)
        return
      }

      // ? - Show keyboard shortcuts
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault()
        setShowShortcuts(true)
        return
      }

      // Escape - Close dialogs/shortcuts
      if (e.key === 'Escape') {
        if (showShortcuts) setShowShortcuts(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showShortcuts])
  const utils = trpc.useUtils()

  const statsQuery = trpc.featureFlags.getStats.useQuery()
  const flagsQuery = trpc.featureFlags.list.useQuery({
    search: search || undefined,
    state: stateFilter !== 'all' ? stateFilter as 'enabled' | 'disabled' | 'beta' | 'internal' | 'percentage' | 'coming_soon' : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    page,
    pageSize: 20,
  })
  const categoriesQuery = trpc.featureFlags.getCategories.useQuery()

  const quickToggleMutation = trpc.featureFlags.quickToggle.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate()
      utils.featureFlags.getStats.invalidate()
      toast({ title: 'Feature flag updated' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const deleteMutation = trpc.featureFlags.delete.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate()
      utils.featureFlags.getStats.invalidate()
      toast({ title: 'Feature flag deleted' })
    },
  })

  const cloneMutation = trpc.featureFlags.clone.useMutation({
    onSuccess: () => {
      utils.featureFlags.list.invalidate()
      toast({ title: 'Feature flag cloned' })
    },
  })

  const stats = statsQuery.data
  const flags = flagsQuery.data?.items || []
  const categories = categoriesQuery.data || []

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Feature Flags' },
  ]

  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Feature Flags"
        breadcrumbs={breadcrumbs}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Feature
          </Button>
        }
      />
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(STATE_CONFIG).map(([state, config]) => {
          const Icon = config.icon
          const count = stats?.[state as keyof typeof stats] || 0
          return (
            <button
              key={state}
              onClick={() => setStateFilter(stateFilter === state ? 'all' : state)}
              className={`p-4 rounded-lg border transition-all ${
                stateFilter === state
                  ? 'border-hublot-900 bg-charcoal-50'
                  : 'border-charcoal-100 hover:border-charcoal-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" />
                <span className="text-2xl font-bold">{count}</span>
              </div>
              <p className="text-xs text-charcoal-500">{config.label}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <Input
            ref={searchInputRef}
            placeholder="Search features... (press / to focus)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {Object.entries(STATE_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Feature List */}
      <DashboardSection>
        {flagsQuery.isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-charcoal-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No feature flags found</h3>
            <p className="text-charcoal-500 mb-4">
              {search ? 'Try a different search term' : 'Create your first feature flag'}
            </p>
            {!search && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Feature Flag
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {flags.map((flag) => {
              const stateConfig = STATE_CONFIG[flag.state as keyof typeof STATE_CONFIG]
              const StateIcon = stateConfig?.icon || CheckCircle
              return (
                <div
                  key={flag.id}
                  className="p-4 bg-white border border-charcoal-100 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StateIcon className={`w-5 h-5 ${stateConfig?.color.split(' ')[1]}`} />
                        <h3 className="font-medium">{flag.name}</h3>
                        <Badge className={stateConfig?.color}>{stateConfig?.label}</Badge>
                        {flag.is_global && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            Global
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-charcoal-500 mb-2">
                        Key: <code className="bg-charcoal-50 px-1 rounded">{flag.key}</code>
                      </p>
                      {flag.description && (
                        <p className="text-sm text-charcoal-600 mb-2">{flag.description}</p>
                      )}
                      <p className="text-xs text-charcoal-400">
                        Strategy: {STRATEGY_LABELS[flag.rollout_strategy] || flag.rollout_strategy}
                        {flag.rollout_strategy === 'percentage' && ` (${flag.rollout_percentage}%)`}
                        {flag.rollout_strategy === 'roles' && ` (${flag.enabled_roles?.length || 0} roles)`}
                        {flag.rollout_strategy === 'users' && ` (${flag.enabled_users?.length || 0} users)`}
                        {flag.rollout_strategy === 'pods' && ` (${flag.enabled_pods?.length || 0} pods)`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setConfigureId(flag.id)}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUsageId(flag.id)}
                      >
                        <BarChart2 className="w-4 h-4 mr-1" />
                        Usage
                      </Button>
                      {flag.state === 'enabled' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => quickToggleMutation.mutate({ id: flag.id, enabled: false })}
                          disabled={quickToggleMutation.isPending}
                        >
                          Disable
                        </Button>
                      ) : flag.state === 'disabled' ? (
                        <Button
                          size="sm"
                          onClick={() => quickToggleMutation.mutate({ id: flag.id, enabled: true })}
                          disabled={quickToggleMutation.isPending}
                        >
                          Enable
                        </Button>
                      ) : null}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              const newKey = prompt('Enter new key for clone:', `${flag.key}_copy`)
                              if (newKey) {
                                cloneMutation.mutate({ id: flag.id, newKey })
                              }
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Clone
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              if (confirm('Delete this feature flag?')) {
                                deleteMutation.mutate({ id: flag.id })
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {flagsQuery.data && flagsQuery.data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="py-2 px-4 text-sm text-charcoal-500">
              Page {page} of {flagsQuery.data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= flagsQuery.data.totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </DashboardSection>

      {/* Dialogs */}
      <CreateFeatureFlagDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
      {configureId && (
        <ConfigureFeatureFlagDialog
          open={!!configureId}
          onOpenChange={(open) => !open && setConfigureId(null)}
          flagId={configureId}
        />
      )}
      {usageId && (
        <ViewUsageDialog
          open={!!usageId}
          onOpenChange={(open) => !open && setUsageId(null)}
          flagId={usageId}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="w-5 h-5" />
              <h3 className="font-medium">Keyboard Shortcuts</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-600">Focus search</span>
                <kbd className="px-2 py-1 bg-charcoal-100 rounded text-xs font-mono">/</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">New feature flag</span>
                <kbd className="px-2 py-1 bg-charcoal-100 rounded text-xs font-mono">n</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">Show shortcuts</span>
                <kbd className="px-2 py-1 bg-charcoal-100 rounded text-xs font-mono">?</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-600">Close dialog/blur</span>
                <kbd className="px-2 py-1 bg-charcoal-100 rounded text-xs font-mono">Esc</kbd>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setShowShortcuts(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminPageContent>
  )
}
