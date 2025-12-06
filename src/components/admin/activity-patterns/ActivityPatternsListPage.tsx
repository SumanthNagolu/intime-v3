'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Activity,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Power,
  PowerOff,
  Trash2,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  Phone,
  Calendar,
  FileText,
  CheckSquare,
  Compass,
  ClipboardList,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

// Category config with icons and colors
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  communication: { icon: <Phone className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Communication' },
  calendar: { icon: <Calendar className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700', label: 'Calendar' },
  workflow: { icon: <FileText className="w-4 h-4" />, color: 'bg-violet-100 text-violet-700', label: 'Workflow' },
  documentation: { icon: <ClipboardList className="w-4 h-4" />, color: 'bg-charcoal-100 text-charcoal-600', label: 'Documentation' },
  research: { icon: <Compass className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', label: 'Research' },
  administrative: { icon: <CheckSquare className="w-4 h-4" />, color: 'bg-slate-100 text-slate-700', label: 'Administrative' },
}

// Entity type labels
const ENTITY_TYPE_LABELS: Record<string, string> = {
  candidate: 'Candidate',
  job: 'Job',
  submission: 'Submission',
  placement: 'Placement',
  account: 'Account',
  contact: 'Contact',
  lead: 'Lead',
  deal: 'Deal',
  consultant: 'Consultant',
  vendor: 'Vendor',
  interview: 'Interview',
  general: 'General',
}

type PatternItem = {
  id: string
  name: string
  code: string
  description: string | null
  category: string
  entity_type: string
  icon: string | null
  color: string | null
  display_order: number
  points: number
  is_system: boolean
  is_active: boolean
  outcomes: Array<{ label: string; value: string; color: string; nextAction: string }>
  auto_log_integrations: string[]
  created_at: string
  updated_at: string
  pattern_fields: Array<{ id: string; field_name: string; is_required: boolean }>
}

export function ActivityPatternsListPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patternToDelete, setPatternToDelete] = useState<PatternItem | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const utils = trpc.useUtils()

  const statsQuery = trpc.activityPatterns.getStats.useQuery()
  const categoriesQuery = trpc.activityPatterns.getCategories.useQuery()
  const entityTypesQuery = trpc.activityPatterns.getEntityTypes.useQuery()
  const patternsQuery = trpc.activityPatterns.list.useQuery({
    search: search || undefined,
    category: categoryFilter && categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as 'active' | 'inactive' | 'all' : 'all',
    entityType: entityFilter && entityFilter !== 'all' ? entityFilter : undefined,
    page,
    pageSize: 50,
  })

  const toggleStatusMutation = trpc.activityPatterns.toggleStatus.useMutation({
    onSuccess: (data) => {
      utils.activityPatterns.list.invalidate()
      utils.activityPatterns.getStats.invalidate()
      toast.success(data.is_active ? 'Pattern enabled' : 'Pattern disabled')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update pattern status')
    },
  })

  const duplicateMutation = trpc.activityPatterns.duplicate.useMutation({
    onSuccess: (data) => {
      utils.activityPatterns.list.invalidate()
      utils.activityPatterns.getStats.invalidate()
      toast.success('Pattern duplicated')
      router.push(`/employee/admin/activity-patterns/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to duplicate pattern')
    },
  })

  const deleteMutation = trpc.activityPatterns.delete.useMutation({
    onSuccess: () => {
      utils.activityPatterns.list.invalidate()
      utils.activityPatterns.getStats.invalidate()
      toast.success('Pattern deleted')
      setDeleteDialogOpen(false)
      setPatternToDelete(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete pattern')
    },
  })

  const exportQuery = trpc.activityPatterns.export.useQuery(undefined, {
    enabled: false,
  })

  const importMutation = trpc.activityPatterns.import.useMutation({
    onSuccess: (result) => {
      utils.activityPatterns.list.invalidate()
      utils.activityPatterns.getStats.invalidate()
      toast.success(`Imported ${result.created} patterns, skipped ${result.skipped}`)
      setImportDialogOpen(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import patterns')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Activity Patterns' },
  ]

  const stats = statsQuery.data

  // Group patterns by category
  const groupedPatterns = patternsQuery.data?.items?.reduce((acc, pattern) => {
    const group = pattern.category as string
    if (!acc[group]) acc[group] = []
    acc[group].push(pattern as unknown as PatternItem)
    return acc
  }, {} as Record<string, PatternItem[]>) ?? {}

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleDelete = (pattern: PatternItem) => {
    setPatternToDelete(pattern)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (patternToDelete) {
      deleteMutation.mutate({ id: patternToDelete.id })
    }
  }

  const handleExport = async () => {
    try {
      const result = await exportQuery.refetch()
      if (result.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `activity-patterns-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Patterns exported')
      }
    } catch {
      toast.error('Failed to export patterns')
    }
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.patterns && Array.isArray(data.patterns)) {
          importMutation.mutate({ patterns: data.patterns })
        } else {
          toast.error('Invalid import file format')
        }
      } catch {
        toast.error('Failed to parse import file')
      }
    }
    reader.readAsText(file)
  }

  // Order categories for display
  const categoryOrder = ['communication', 'calendar', 'workflow', 'documentation', 'research', 'administrative']
  const sortedCategories = Object.keys(groupedPatterns).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  })

  return (
    <DashboardShell
      title="Activity Patterns"
      description="Configure activity types, required fields, outcomes, and automation rules"
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setImportDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/employee/admin/activity-patterns/new">
            <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Pattern
            </Button>
          </Link>
        </div>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Patterns"
          value={stats?.total ?? 0}
          icon={<Activity className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Active"
          value={stats?.active ?? 0}
          percentage={stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}
          icon={<Power className="w-5 h-5 text-green-600" />}
          color="green"
        />
        <StatCard
          label="Inactive"
          value={stats?.inactive ?? 0}
          icon={<PowerOff className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Activities (30d)"
          value={stats?.last30Days?.totalLogged ?? 0}
          icon={<Star className="w-5 h-5 text-gold-600" />}
          color="gold"
        />
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div className="mb-6 bg-charcoal-50 border border-charcoal-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-charcoal-700 mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Patterns by Category
          </h3>
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_CONFIG[category]?.color || 'bg-charcoal-100 text-charcoal-600'}`}>
                  {CATEGORY_CONFIG[category]?.icon}
                  {CATEGORY_CONFIG[category]?.label || category}
                </span>
                <span className="font-medium text-charcoal-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search patterns..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesQuery.data?.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entityTypesQuery.data?.map((entity) => (
                <SelectItem key={entity.value} value={entity.value}>
                  {entity.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Patterns List */}
        <div className="space-y-6">
          {patternsQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-charcoal-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : patternsQuery.error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
              Failed to load patterns. Please try again.
            </div>
          ) : patternsQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-charcoal-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Activity className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No patterns found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || categoryFilter || statusFilter || entityFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first activity pattern'}
              </p>
              {!search && !categoryFilter && !statusFilter && !entityFilter && (
                <Link href="/employee/admin/activity-patterns/new">
                  <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    New Pattern
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <>
              {sortedCategories.map((category) => {
                const patterns = groupedPatterns[category]
                if (!patterns || patterns.length === 0) return null
                const config = CATEGORY_CONFIG[category] || {
                  icon: <Activity className="w-4 h-4" />,
                  color: 'bg-charcoal-100 text-charcoal-600',
                  label: category,
                }

                return (
                  <PatternGroup
                    key={category}
                    title={config.label}
                    count={patterns.length}
                    collapsed={collapsedSections[category] ?? false}
                    onToggle={() => toggleSection(category)}
                    icon={config.icon}
                  >
                    {patterns.map((pattern) => (
                      <PatternCard
                        key={pattern.id}
                        pattern={pattern}
                        usageCount={stats?.last30Days?.usageByPattern?.[pattern.id] ?? 0}
                        openDropdown={openDropdown}
                        setOpenDropdown={setOpenDropdown}
                        onToggleStatus={() => toggleStatusMutation.mutate({ id: pattern.id, isActive: !pattern.is_active })}
                        onDuplicate={() => duplicateMutation.mutate({ id: pattern.id })}
                        onDelete={() => handleDelete(pattern)}
                        isLoading={
                          toggleStatusMutation.isPending ||
                          duplicateMutation.isPending
                        }
                      />
                    ))}
                  </PatternGroup>
                )
              })}
            </>
          )}
        </div>

        {/* Pagination */}
        {patternsQuery.data && patternsQuery.data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 50) + 1} - {Math.min(page * 50, patternsQuery.data.total)} of {patternsQuery.data.total} patterns
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= patternsQuery.data.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pattern</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{patternToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Patterns</DialogTitle>
            <DialogDescription>
              Upload a JSON file containing activity patterns to import.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
              disabled={importMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              {importMutation.isPending ? 'Importing...' : 'Select JSON File'}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  percentage,
  icon,
  color,
}: {
  label: string
  value: number
  percentage?: number
  icon: React.ReactNode
  color?: 'green' | 'amber' | 'gold' | 'red'
}) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-charcoal-500">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-charcoal-900">{value}</span>
        {percentage !== undefined && (
          <span className={`text-sm ${
            color === 'green' ? 'text-green-600' :
            color === 'amber' ? 'text-amber-600' :
            color === 'gold' ? 'text-gold-600' :
            color === 'red' ? 'text-red-600' :
            'text-charcoal-500'
          }`}>
            ({percentage}%)
          </span>
        )}
      </div>
    </div>
  )
}

// Pattern Group Component
function PatternGroup({
  title,
  count,
  collapsed,
  onToggle,
  icon,
  children,
}: {
  title: string
  count: number
  collapsed: boolean
  onToggle: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg border border-charcoal-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-charcoal-800">{title}</span>
          <span className="text-sm text-charcoal-500">({count})</span>
        </div>
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-charcoal-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-charcoal-400" />
        )}
      </button>
      {!collapsed && (
        <div className="divide-y divide-charcoal-100">
          {children}
        </div>
      )}
    </div>
  )
}

// Pattern Card Component
function PatternCard({
  pattern,
  usageCount,
  openDropdown,
  setOpenDropdown,
  onToggleStatus,
  onDuplicate,
  onDelete,
  isLoading,
}: {
  pattern: PatternItem
  usageCount: number
  openDropdown: string | null
  setOpenDropdown: (id: string | null) => void
  onToggleStatus: () => void
  onDuplicate: () => void
  onDelete: () => void
  isLoading: boolean
}) {
  const requiredFieldCount = pattern.pattern_fields?.filter(f => f.is_required).length ?? 0
  const outcomeCount = pattern.outcomes?.length ?? 0

  return (
    <div className={`px-4 py-4 hover:bg-charcoal-50 transition-colors ${!pattern.is_active ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl">{pattern.icon || '📋'}</span>
            <Link
              href={`/employee/admin/activity-patterns/${pattern.id}`}
              className="font-medium text-charcoal-900 hover:text-hublot-600 truncate"
            >
              {pattern.name}
            </Link>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              pattern.is_active ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'
            }`}>
              {pattern.is_active ? 'Active' : 'Inactive'}
            </span>
            {pattern.is_system && (
              <span className="text-xs text-charcoal-400">System</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            <span className="flex items-center gap-1">
              <span className="text-charcoal-400">Entity:</span>
              {ENTITY_TYPE_LABELS[pattern.entity_type] || pattern.entity_type}
            </span>
            {requiredFieldCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-charcoal-400">Fields:</span>
                {requiredFieldCount} required
              </span>
            )}
            {outcomeCount > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-charcoal-400">Outcomes:</span>
                {outcomeCount}
              </span>
            )}
            {pattern.points > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-gold-500" />
                {pattern.points} pts
              </span>
            )}
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {usageCount} uses (30d)
            </span>
          </div>
          {pattern.description && (
            <p className="text-sm text-charcoal-400 mt-1 truncate">{pattern.description}</p>
          )}
        </div>

        {/* Actions dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => setOpenDropdown(openDropdown === pattern.id ? null : pattern.id)}
            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
          </button>
          {openDropdown === pattern.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenDropdown(null)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                <Link
                  href={`/employee/admin/activity-patterns/${pattern.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                  onClick={() => setOpenDropdown(null)}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                {!pattern.is_system && (
                  <Link
                    href={`/employee/admin/activity-patterns/${pattern.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                )}
                <button
                  onClick={() => {
                    onDuplicate()
                    setOpenDropdown(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                {!pattern.is_system && (
                  <button
                    onClick={() => {
                      onToggleStatus()
                      setOpenDropdown(null)
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm w-full text-left ${
                      pattern.is_active ? 'text-charcoal-700 hover:bg-charcoal-50' : 'text-green-700 hover:bg-green-50'
                    }`}
                  >
                    {pattern.is_active ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Enable
                      </>
                    )}
                  </button>
                )}
                {!pattern.is_system && (
                  <button
                    onClick={() => {
                      onDelete()
                      setOpenDropdown(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
