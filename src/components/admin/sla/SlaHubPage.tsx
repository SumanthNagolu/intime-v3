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
  Timer,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Power,
  PowerOff,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Activity,
  TrendingUp,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

// Status colors and labels
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-amber-100 text-amber-800',
  disabled: 'bg-charcoal-100 text-charcoal-600',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  draft: 'Draft',
  disabled: 'Disabled',
}

// Category config
const CATEGORY_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  response_time: { icon: <Timer className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700', label: 'Response Time' },
  submission_speed: { icon: <TrendingUp className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700', label: 'Submission Speed' },
  interview_schedule: { icon: <Clock className="w-4 h-4" />, color: 'bg-amber-100 text-amber-700', label: 'Interview Schedule' },
  interview_feedback: { icon: <Activity className="w-4 h-4" />, color: 'bg-emerald-100 text-emerald-700', label: 'Interview Feedback' },
  offer_response: { icon: <Target className="w-4 h-4" />, color: 'bg-pink-100 text-pink-700', label: 'Offer Response' },
  onboarding: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-teal-100 text-teal-700', label: 'Onboarding' },
  client_touch: { icon: <Timer className="w-4 h-4" />, color: 'bg-indigo-100 text-indigo-700', label: 'Client Touch' },
  candidate_followup: { icon: <Clock className="w-4 h-4" />, color: 'bg-orange-100 text-orange-700', label: 'Candidate Follow-up' },
  document_collection: { icon: <Activity className="w-4 h-4" />, color: 'bg-cyan-100 text-cyan-700', label: 'Document Collection' },
  timesheet_approval: { icon: <CheckCircle className="w-4 h-4" />, color: 'bg-lime-100 text-lime-700', label: 'Timesheet Approval' },
}

// Entity type labels
const ENTITY_TYPE_LABELS: Record<string, string> = {
  jobs: 'Jobs',
  candidates: 'Candidates',
  submissions: 'Submissions',
  placements: 'Placements',
  accounts: 'Accounts',
  leads: 'Leads',
  interviews: 'Interviews',
  offers: 'Offers',
}

type SlaRuleItem = {
  id: string
  name: string
  description: string | null
  category: string
  entity_type: string
  start_event: string
  end_event: string
  target_value: number
  target_unit: string
  status: string
  business_hours_only: boolean
  exclude_weekends: boolean
  created_at: string
  escalation_levels: Array<{
    id: string
    level_number: number
    level_name: string
    trigger_percentage: number
    badge_color: string
  }>
  stats: {
    met: number
    warning: number
    breach: number
    complianceRate: number
  }
}

export function SlaHubPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [entityFilter, setEntityFilter] = useState<string>('')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<SlaRuleItem | null>(null)

  const utils = trpc.useUtils()

  const statsQuery = trpc.sla.getStats.useQuery()
  const categoriesQuery = trpc.sla.getCategories.useQuery()
  const rulesQuery = trpc.sla.list.useQuery({
    search: search || undefined,
    category: categoryFilter && categoryFilter !== 'all' ? categoryFilter as 'response_time' | 'submission_speed' | 'interview_schedule' | 'interview_feedback' | 'offer_response' | 'onboarding' | 'client_touch' | 'candidate_followup' | 'document_collection' | 'timesheet_approval' : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as 'draft' | 'active' | 'disabled' : undefined,
    entityType: entityFilter && entityFilter !== 'all' ? entityFilter as 'jobs' | 'candidates' | 'submissions' | 'placements' | 'accounts' | 'leads' | 'interviews' | 'offers' : undefined,
    page,
    pageSize: 50,
  })

  const activateMutation = trpc.sla.activate.useMutation({
    onSuccess: () => {
      utils.sla.list.invalidate()
      utils.sla.getStats.invalidate()
      toast.success('SLA rule activated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to activate SLA rule')
    },
  })

  const disableMutation = trpc.sla.disable.useMutation({
    onSuccess: () => {
      utils.sla.list.invalidate()
      utils.sla.getStats.invalidate()
      toast.success('SLA rule disabled')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to disable SLA rule')
    },
  })

  const cloneMutation = trpc.sla.clone.useMutation({
    onSuccess: (data) => {
      utils.sla.list.invalidate()
      utils.sla.getStats.invalidate()
      toast.success('SLA rule cloned')
      router.push(`/employee/admin/sla/${data.id}/edit`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clone SLA rule')
    },
  })

  const deleteMutation = trpc.sla.delete.useMutation({
    onSuccess: () => {
      utils.sla.list.invalidate()
      utils.sla.getStats.invalidate()
      toast.success('SLA rule deleted')
      setDeleteDialogOpen(false)
      setRuleToDelete(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete SLA rule')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'SLA Configuration' },
  ]

  const stats = statsQuery.data

  // Group rules by status
  const groupedRules = rulesQuery.data?.items?.reduce((acc, rule) => {
    const group = rule.status as string
    if (!acc[group]) acc[group] = []
    acc[group].push(rule as SlaRuleItem)
    return acc
  }, {} as Record<string, SlaRuleItem[]>) ?? {}

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleDelete = (rule: SlaRuleItem) => {
    setRuleToDelete(rule)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteMutation.mutate({ id: ruleToDelete.id })
    }
  }

  return (
    <DashboardShell
      title="SLA Configuration"
      description="Define service level agreements and escalation policies"
      breadcrumbs={breadcrumbs}
      actions={
        <Button
          onClick={() => router.push('/employee/admin/sla/new')}
          className="bg-hublot-900 hover:bg-hublot-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New SLA Rule
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Total Rules"
          value={stats?.totalRules ?? 0}
          icon={<Timer className="w-5 h-5 text-charcoal-400" />}
        />
        <StatCard
          label="Active"
          value={stats?.activeRules ?? 0}
          percentage={stats?.totalRules ? Math.round((stats.activeRules / stats.totalRules) * 100) : 0}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="green"
        />
        <StatCard
          label="Pending"
          value={stats?.pendingEvents ?? 0}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="amber"
        />
        <StatCard
          label="Warnings"
          value={stats?.warningEvents ?? 0}
          icon={<AlertTriangle className="w-5 h-5 text-orange-600" />}
          color="orange"
        />
        <StatCard
          label="Breaches"
          value={stats?.breachEvents ?? 0}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="red"
        />
      </div>

      {/* Compliance Rate */}
      {stats && stats.complianceRate > 0 && (
        <div className="mb-6 bg-charcoal-50 border border-charcoal-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-charcoal-700 mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                30-Day Compliance Rate
              </h3>
              <p className="text-sm text-charcoal-500">
                {stats.metToday} SLAs met today, {stats.breachedToday} breached
              </p>
            </div>
            <div className="text-right">
              <span className={`text-3xl font-bold ${
                stats.complianceRate >= 90 ? 'text-green-600' :
                stats.complianceRate >= 70 ? 'text-amber-600' :
                'text-red-600'
              }`}>
                {stats.complianceRate}%
              </span>
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
              placeholder="Search SLA rules..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoriesQuery.data?.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
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

        {/* Rules List */}
        <div className="space-y-6">
          {rulesQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-charcoal-100 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : rulesQuery.error ? (
            <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
              Failed to load SLA rules. Please try again.
            </div>
          ) : rulesQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-charcoal-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Timer className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No SLA rules found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || categoryFilter || statusFilter || entityFilter
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first SLA rule'}
              </p>
              {!search && !categoryFilter && !statusFilter && !entityFilter && (
                <Button
                  onClick={() => router.push('/employee/admin/sla/new')}
                  className="bg-hublot-900 hover:bg-hublot-800 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New SLA Rule
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Active Rules */}
              {groupedRules.active && groupedRules.active.length > 0 && (
                <RuleGroup
                  title="Active SLA Rules"
                  count={groupedRules.active.length}
                  collapsed={collapsedSections.active}
                  onToggle={() => toggleSection('active')}
                  icon={<CheckCircle className="w-4 h-4 text-green-600" />}
                >
                  {groupedRules.active.map((rule: SlaRuleItem) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onActivate={() => activateMutation.mutate({ id: rule.id })}
                      onDisable={() => disableMutation.mutate({ id: rule.id })}
                      onClone={() => cloneMutation.mutate({ id: rule.id })}
                      onDelete={() => handleDelete(rule)}
                      isLoading={
                        activateMutation.isPending ||
                        disableMutation.isPending ||
                        cloneMutation.isPending
                      }
                    />
                  ))}
                </RuleGroup>
              )}

              {/* Draft Rules */}
              {groupedRules.draft && groupedRules.draft.length > 0 && (
                <RuleGroup
                  title="Draft SLA Rules"
                  count={groupedRules.draft.length}
                  collapsed={collapsedSections.draft}
                  onToggle={() => toggleSection('draft')}
                  icon={<Clock className="w-4 h-4 text-amber-600" />}
                >
                  {groupedRules.draft.map((rule: SlaRuleItem) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onActivate={() => activateMutation.mutate({ id: rule.id })}
                      onDisable={() => disableMutation.mutate({ id: rule.id })}
                      onClone={() => cloneMutation.mutate({ id: rule.id })}
                      onDelete={() => handleDelete(rule)}
                      isLoading={
                        activateMutation.isPending ||
                        disableMutation.isPending ||
                        cloneMutation.isPending
                      }
                    />
                  ))}
                </RuleGroup>
              )}

              {/* Disabled Rules */}
              {groupedRules.disabled && groupedRules.disabled.length > 0 && (
                <RuleGroup
                  title="Disabled SLA Rules"
                  count={groupedRules.disabled.length}
                  collapsed={collapsedSections.disabled ?? true}
                  onToggle={() => toggleSection('disabled')}
                  icon={<PowerOff className="w-4 h-4 text-charcoal-400" />}
                >
                  {groupedRules.disabled.map((rule: SlaRuleItem) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      openDropdown={openDropdown}
                      setOpenDropdown={setOpenDropdown}
                      onActivate={() => activateMutation.mutate({ id: rule.id })}
                      onDisable={() => disableMutation.mutate({ id: rule.id })}
                      onClone={() => cloneMutation.mutate({ id: rule.id })}
                      onDelete={() => handleDelete(rule)}
                      isLoading={
                        activateMutation.isPending ||
                        disableMutation.isPending ||
                        cloneMutation.isPending
                      }
                    />
                  ))}
                </RuleGroup>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {rulesQuery.data && rulesQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 50) + 1} - {Math.min(page * 50, rulesQuery.data.pagination.total)} of {rulesQuery.data.pagination.total} rules
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
                disabled={page >= rulesQuery.data.pagination.totalPages}
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
            <DialogTitle>Delete SLA Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{ruleToDelete?.name}&quot;? This action cannot be undone.
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
}: {
  label: string
  value: number
  percentage?: number
  icon: React.ReactNode
  color?: 'green' | 'amber' | 'orange' | 'red'
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
            color === 'orange' ? 'text-orange-600' :
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

// Rule Group Component
function RuleGroup({
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

// Rule Card Component
function RuleCard({
  rule,
  openDropdown,
  setOpenDropdown,
  onActivate,
  onDisable,
  onClone,
  onDelete,
  isLoading,
}: {
  rule: SlaRuleItem
  openDropdown: string | null
  setOpenDropdown: (id: string | null) => void
  onActivate: () => void
  onDisable: () => void
  onClone: () => void
  onDelete: () => void
  isLoading: boolean
}) {
  const categoryConfig = CATEGORY_CONFIG[rule.category] || {
    icon: <Timer className="w-4 h-4" />,
    color: 'bg-charcoal-100 text-charcoal-600',
    label: rule.category,
  }

  const formatTargetTime = () => {
    const unit = rule.target_unit === 'business_hours' ? 'business hours' :
                 rule.target_unit === 'business_days' ? 'business days' :
                 rule.target_unit
    return `${rule.target_value} ${unit}`
  }

  return (
    <div className="px-4 py-4 hover:bg-charcoal-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href={`/employee/admin/sla/${rule.id}`}
              className="font-medium text-charcoal-900 hover:text-hublot-600 truncate"
            >
              {rule.name}
            </Link>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
              {categoryConfig.icon}
              {categoryConfig.label}
            </span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[rule.status]}`}>
              {STATUS_LABELS[rule.status]}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-charcoal-500">
            <span className="flex items-center gap-1">
              <span className="text-charcoal-400">Entity:</span>
              {ENTITY_TYPE_LABELS[rule.entity_type] || rule.entity_type}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-charcoal-400">Target:</span>
              {formatTargetTime()}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-charcoal-400">Levels:</span>
              {rule.escalation_levels?.length || 0}
            </span>
            {rule.status === 'active' && rule.stats && (
              <span className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 ${
                  rule.stats.complianceRate >= 90 ? 'text-green-600' :
                  rule.stats.complianceRate >= 70 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  <TrendingUp className="w-3 h-3" />
                  {rule.stats.complianceRate}% compliance
                </span>
              </span>
            )}
          </div>
          {rule.description && (
            <p className="text-sm text-charcoal-400 mt-1 truncate">{rule.description}</p>
          )}
          {/* Escalation level badges */}
          {rule.escalation_levels && rule.escalation_levels.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {rule.escalation_levels.slice(0, 3).map((level) => (
                <span
                  key={level.id}
                  className={`text-xs px-2 py-0.5 rounded ${
                    level.badge_color === 'red' ? 'bg-red-100 text-red-700' :
                    level.badge_color === 'orange' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {level.level_name} ({level.trigger_percentage}%)
                </span>
              ))}
              {rule.escalation_levels.length > 3 && (
                <span className="text-xs text-charcoal-400">
                  +{rule.escalation_levels.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => setOpenDropdown(openDropdown === rule.id ? null : rule.id)}
            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
          </button>
          {openDropdown === rule.id && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpenDropdown(null)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                <Link
                  href={`/employee/admin/sla/${rule.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                  onClick={() => setOpenDropdown(null)}
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                {rule.status === 'draft' && (
                  <Link
                    href={`/employee/admin/sla/${rule.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                    onClick={() => setOpenDropdown(null)}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
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
                {rule.status === 'draft' && (
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
                {rule.status === 'active' && (
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
                {rule.status === 'disabled' && (
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
