'use client'

import { useState } from 'react'
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
  GitBranch,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Power,
  PowerOff,
  Trash2,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  History,
  Zap,
  Bell,
  Timer,
  Settings,
  Users,
  Webhook,
  Calendar,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

// Status colors and labels
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-amber-100 text-amber-800',
  disabled: 'bg-charcoal-100 text-charcoal-600',
  archived: 'bg-charcoal-100 text-charcoal-500',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  disabled: 'Disabled',
  archived: 'Archived',
}

// Workflow type config
const WORKFLOW_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  approval: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Approval' },
  status_auto: { icon: <Zap className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', label: 'Status Auto' },
  notification: { icon: <Bell className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', label: 'Notification' },
  sla_escalation: { icon: <Timer className="w-4 h-4" />, color: 'bg-red-100 text-red-700', label: 'SLA' },
  field_auto: { icon: <Settings className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700', label: 'Field Auto' },
  assignment: { icon: <Users className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700', label: 'Assignment' },
  webhook: { icon: <Webhook className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700', label: 'Webhook' },
  scheduled: { icon: <Calendar className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700', label: 'Scheduled' },
}

// Entity type labels
const ENTITY_TYPE_LABELS: Record<string, string> = {
  jobs: 'Jobs',
  candidates: 'Candidates',
  submissions: 'Submissions',
  placements: 'Placements',
  accounts: 'Accounts',
  contacts: 'Contacts',
  leads: 'Leads',
  deals: 'Deals',
  activities: 'Activities',
  employees: 'Employees',
  consultants: 'Consultants',
  vendors: 'Vendors',
  interviews: 'Interviews',
}

// Trigger event labels
const TRIGGER_LABELS: Record<string, string> = {
  record_created: 'Record Created',
  record_updated: 'Record Updated',
  field_changed: 'Field Changed',
  status_changed: 'Status Changed',
  time_based: 'Time-Based',
  manual: 'Manual',
}

type WorkflowItem = {
  id: string
  name: string
  description: string | null
  workflow_type: string
  entity_type: string
  trigger_event: string
  trigger_conditions: Record<string, unknown>
  status: string
  version: number
  activated_at: string | null
  created_at: string
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  lastRunAt: string | null
}

export function WorkflowsHubPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [workflowToDelete, setWorkflowToDelete] = useState<WorkflowItem | null>(null)

  const utils = trpc.useUtils()

  const statsQuery = trpc.workflows.getStats.useQuery()
  const workflowTypesQuery = trpc.workflows.getWorkflowTypes.useQuery()
  const workflowsQuery = trpc.workflows.list.useQuery({
    search: search || undefined,
    workflowType: typeFilter && typeFilter !== 'all' ? typeFilter as 'approval' | 'status_auto' | 'notification' | 'sla_escalation' | 'field_auto' | 'assignment' | 'webhook' | 'scheduled' : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as 'draft' | 'active' | 'disabled' | 'archived' : undefined,
    entityType: entityFilter && entityFilter !== 'all' ? entityFilter as 'jobs' | 'candidates' | 'submissions' | 'placements' | 'accounts' | 'contacts' | 'leads' | 'deals' | 'activities' | 'employees' | 'consultants' | 'vendors' | 'interviews' : undefined,
    page,
    pageSize: 50,
  })

  const activateMutation = trpc.workflows.activate.useMutation({
    onSuccess: () => {
      utils.workflows.list.invalidate()
      utils.workflows.getStats.invalidate()
      toast.success('Workflow activated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate workflow')
    },
  })

  const disableMutation = trpc.workflows.disable.useMutation({
    onSuccess: () => {
      utils.workflows.list.invalidate()
      utils.workflows.getStats.invalidate()
      toast.success('Workflow disabled')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disable workflow')
    },
  })

  const cloneMutation = trpc.workflows.clone.useMutation({
    onSuccess: (data) => {
      utils.workflows.list.invalidate()
      utils.workflows.getStats.invalidate()
      toast.success('Workflow cloned')
      router.push(`/employee/admin/workflows/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clone workflow')
    },
  })

  const deleteMutation = trpc.workflows.delete.useMutation({
    onSuccess: () => {
      utils.workflows.list.invalidate()
      utils.workflows.getStats.invalidate()
      toast.success('Workflow deleted')
      setDeleteDialogOpen(false)
      setWorkflowToDelete(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete workflow')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Workflows' },
  ]

  const stats = statsQuery.data

  // Group workflows by status
  const groupedWorkflows = workflowsQuery.data?.items?.reduce((acc, wf) => {
    const group = wf.status as string
    if (!acc[group]) acc[group] = []
    acc[group].push(wf as WorkflowItem)
    return acc
  }, {} as Record<string, WorkflowItem[]>) ?? {}

  const handleCreateClick = () => {
    setSelectedType(null)
    setShowCreateModal(true)
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
  }

  const handleContinueCreate = () => {
    if (selectedType) {
      setShowCreateModal(false)
      router.push(`/employee/admin/workflows/new?type=${selectedType}`)
    }
  }

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleDelete = (workflow: WorkflowItem) => {
    setWorkflowToDelete(workflow)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (workflowToDelete) {
      deleteMutation.mutate({ id: workflowToDelete.id })
    }
  }

  return (
    <DashboardShell
      title="Workflows"
      description="Configure automated workflows, approval chains, and business rules"
      breadcrumbs={breadcrumbs}
      actions={
        <Button
          onClick={handleCreateClick}
          className="bg-hublot-900 hover:bg-hublot-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Workflow
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total"
          value={stats?.total ?? 0}
          icon={<GitBranch className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Active"
          value={stats?.active ?? 0}
          percentage={stats?.total ? Math.round((stats.active / stats.total) * 100) : 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="green"
        />
        <StatCard
          label="Draft"
          value={stats?.draft ?? 0}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          label="Pending Approvals"
          value={stats?.pendingApprovals ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-gold-600" />}
          color="gold"
          href="/employee/admin/workflows/approvals"
        />
      </div>

      {/* Executions Summary */}
      {stats && (stats.executionsToday > 0 || stats.executionsThisWeek > 0) && (
        <div className="mb-6 bg-charcoal-50 border border-charcoal-100 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-charcoal-700 mb-2 flex items-center gap-2">
            <History className="w-4 h-4" />
            Execution Summary
          </h3>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-charcoal-500">Today:</span>{' '}
              <span className="font-medium text-charcoal-900">{stats.executionsToday} runs</span>
            </div>
            <div>
              <span className="text-charcoal-500">This Week:</span>{' '}
              <span className="font-medium text-charcoal-900">{stats.executionsThisWeek} runs</span>
            </div>
            <div>
              <span className="text-charcoal-500">All Time:</span>{' '}
              <span className="font-medium text-charcoal-900">{stats.totalExecutions} runs</span>
            </div>
          </div>
        </div>
      )}

      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search workflows..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(WORKFLOW_TYPE_CONFIG).map(([value, config]) => (
                <SelectItem key={value} value={value}>
                  <span className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Entities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {Object.entries(ENTITY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Workflows List */}
        <div className="space-y-6">
          {workflowsQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-charcoal-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : workflowsQuery.error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
              Failed to load workflows. Please try again.
            </div>
          ) : workflowsQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-charcoal-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <GitBranch className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No workflows found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || typeFilter || statusFilter || entityFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first workflow'}
              </p>
              {!search && !typeFilter && !statusFilter && !entityFilter && (
                <Button
                  onClick={handleCreateClick}
                  className="bg-hublot-900 hover:bg-hublot-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Workflow
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Active Workflows */}
              {groupedWorkflows.active && groupedWorkflows.active.length > 0 && (
                <WorkflowGroup
                  title="Active Workflows"
                  count={groupedWorkflows.active.length}
                  collapsed={collapsedSections.active}
                  onToggle={() => toggleSection('active')}
                  icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                >
                  {groupedWorkflows.active.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onActivate={() => activateMutation.mutate({ id: workflow.id })}
                      onDisable={() => disableMutation.mutate({ id: workflow.id })}
                      onClone={() => cloneMutation.mutate({ id: workflow.id })}
                      onDelete={() => handleDelete(workflow)}
                      isLoading={
                        activateMutation.isPending ||
                        disableMutation.isPending ||
                        cloneMutation.isPending
                      }
                    />
                  ))}
                </WorkflowGroup>
              )}

              {/* Draft Workflows */}
              {groupedWorkflows.draft && groupedWorkflows.draft.length > 0 && (
                <WorkflowGroup
                  title="Draft Workflows"
                  count={groupedWorkflows.draft.length}
                  collapsed={collapsedSections.draft}
                  onToggle={() => toggleSection('draft')}
                  icon={<Clock className="w-4 h-4 text-amber-600" />}
                >
                  {groupedWorkflows.draft.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onActivate={() => activateMutation.mutate({ id: workflow.id })}
                      onDisable={() => disableMutation.mutate({ id: workflow.id })}
                      onClone={() => cloneMutation.mutate({ id: workflow.id })}
                      onDelete={() => handleDelete(workflow)}
                      isLoading={
                        activateMutation.isPending ||
                        disableMutation.isPending ||
                        cloneMutation.isPending
                      }
                    />
                  ))}
                </WorkflowGroup>
              )}

              {/* Disabled Workflows */}
              {groupedWorkflows.disabled && groupedWorkflows.disabled.length > 0 && (
                <WorkflowGroup
                  title="Disabled Workflows"
                  count={groupedWorkflows.disabled.length}
                  collapsed={collapsedSections.disabled ?? true}
                  onToggle={() => toggleSection('disabled')}
                  icon={<PowerOff className="w-4 h-4 text-charcoal-400" />}
                >
                  {groupedWorkflows.disabled.map((workflow) => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onActivate={() => activateMutation.mutate({ id: workflow.id })}
                      onDisable={() => disableMutation.mutate({ id: workflow.id })}
                      onClone={() => cloneMutation.mutate({ id: workflow.id })}
                      onDelete={() => handleDelete(workflow)}
                      isLoading={
                        activateMutation.isPending ||
                        disableMutation.isPending ||
                        cloneMutation.isPending
                      }
                    />
                  ))}
                </WorkflowGroup>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {workflowsQuery.data && workflowsQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 50) + 1} - {Math.min(page * 50, workflowsQuery.data.pagination.total)} of {workflowsQuery.data.pagination.total} workflows
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
                disabled={page >= workflowsQuery.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Create Workflow Type Selection Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              What type of workflow do you want to create?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[60vh] overflow-y-auto">
            {workflowTypesQuery.data?.map((type) => {
              const config = WORKFLOW_TYPE_CONFIG[type.value]
              return (
                <button
                  key={type.value}
                  onClick={() => handleTypeSelect(type.value)}
                  className={`p-4 text-left border rounded-lg transition-all ${
                    selectedType === type.value
                      ? 'border-hublot-600 bg-hublot-50 ring-2 ring-hublot-600'
                      : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${config?.color || 'bg-charcoal-100 text-charcoal-600'}`}>
                      {config?.icon || <GitBranch className="w-4 h-4" />}
                    </div>
                    <span className="font-medium text-charcoal-900">{type.label}</span>
                  </div>
                  <p className="text-sm text-charcoal-500">{type.description}</p>
                  <p className="text-xs text-charcoal-400 mt-1">Best for: {type.bestFor}</p>
                </button>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleContinueCreate}
              disabled={!selectedType}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workflow</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{workflowToDelete?.name}&quot;? This action cannot be undone.
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
  href,
}: {
  label: string
  value: number
  percentage?: number
  icon: React.ReactNode
  color?: 'green' | 'amber' | 'gold' | 'red'
  href?: string
}) {
  const content = (
    <div className={`bg-white rounded-lg border border-charcoal-100 p-4 ${href ? 'hover:border-charcoal-200 transition-colors cursor-pointer' : ''}`}>
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

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// Workflow Group Component
function WorkflowGroup({
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

// Workflow Card Component
function WorkflowCard({
  workflow,
  openDropdown,
  setOpenDropdown,
  onActivate,
  onDisable,
  onClone,
  onDelete,
  isLoading,
}: {
  workflow: WorkflowItem
  openDropdown: string | null
  setOpenDropdown: (id: string | null) => void
  onActivate: () => void
  onDisable: () => void
  onClone: () => void
  onDelete: () => void
  isLoading: boolean
}) {
  const typeConfig = WORKFLOW_TYPE_CONFIG[workflow.workflow_type] || {
    icon: <GitBranch className="w-4 h-4" />,
    color: 'bg-charcoal-100 text-charcoal-600',
    label: workflow.workflow_type,
  }

  return (
    <div className="px-4 py-4 hover:bg-charcoal-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href={`/employee/admin/workflows/${workflow.id}`}
              className="font-medium text-charcoal-900 hover:text-hublot-600 truncate"
            >
              {workflow.name}
            </Link>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}>
              {typeConfig.icon}
              {typeConfig.label}
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[workflow.status]}`}>
              {STATUS_LABELS[workflow.status]}
            </span>
            {workflow.version > 1 && (
              <span className="text-xs text-charcoal-400">v{workflow.version}</span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            <span className="flex items-center gap-1">
              <span className="text-charcoal-400">Entity:</span>
              {ENTITY_TYPE_LABELS[workflow.entity_type] || workflow.entity_type}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-charcoal-400">Trigger:</span>
              {TRIGGER_LABELS[workflow.trigger_event] || workflow.trigger_event}
            </span>
            {workflow.totalRuns > 0 && (
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                {workflow.totalRuns} runs
                {workflow.lastRunAt && (
                  <span className="text-charcoal-400">
                    · Last: {formatDistanceToNow(new Date(workflow.lastRunAt), { addSuffix: true })}
                  </span>
                )}
              </span>
            )}
          </div>
          {workflow.description && (
            <p className="text-sm text-charcoal-400 mt-1 truncate">{workflow.description}</p>
          )}
        </div>

        {/* Actions dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => setOpenDropdown(openDropdown === workflow.id ? null : workflow.id)}
            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
          </button>
          {openDropdown === workflow.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenDropdown(null)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                <Link
                  href={`/employee/admin/workflows/${workflow.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                  onClick={() => setOpenDropdown(null)}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                {workflow.status === 'draft' && (
                  <Link
                    href={`/employee/admin/workflows/${workflow.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                )}
                {workflow.status === 'active' && (
                  <Link
                    href={`/employee/admin/workflows/${workflow.id}/history`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <History className="w-4 h-4" />
                    View History
                  </Link>
                )}
                <button
                  onClick={() => {
                    onClone()
                    setOpenDropdown(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                >
                  <Copy className="w-4 h-4" />
                  Clone
                </button>
                {workflow.status === 'draft' && (
                  <button
                    onClick={() => {
                      onActivate()
                      setOpenDropdown(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                  >
                    <Power className="w-4 h-4" />
                    Activate
                  </button>
                )}
                {workflow.status === 'active' && (
                  <button
                    onClick={() => {
                      onDisable()
                      setOpenDropdown(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                  >
                    <PowerOff className="w-4 h-4" />
                    Disable
                  </button>
                )}
                {workflow.status === 'disabled' && (
                  <button
                    onClick={() => {
                      onActivate()
                      setOpenDropdown(null)
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                  >
                    <Power className="w-4 h-4" />
                    Re-enable
                  </button>
                )}
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
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
