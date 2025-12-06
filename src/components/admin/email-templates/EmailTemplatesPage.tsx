'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Plus,
  Mail,
  Users,
  Briefcase,
  Bell,
  AlertTriangle,
  Megaphone,
  MoreHorizontal,
  Edit,
  Copy,
  Power,
  PowerOff,
  Trash2,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  user: { label: 'User Notifications', icon: Users, color: 'bg-blue-100 text-blue-700' },
  candidate: { label: 'Candidate Communications', icon: Briefcase, color: 'bg-green-100 text-green-700' },
  client: { label: 'Client Notifications', icon: Mail, color: 'bg-purple-100 text-purple-700' },
  internal: { label: 'Internal Alerts', icon: Bell, color: 'bg-amber-100 text-amber-700' },
  system: { label: 'System Alerts', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  marketing: { label: 'Marketing', icon: Megaphone, color: 'bg-pink-100 text-pink-700' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  draft: { label: 'Draft', color: 'bg-charcoal-100 text-charcoal-600' },
  disabled: { label: 'Disabled', color: 'bg-red-100 text-red-800' },
  archived: { label: 'Archived', color: 'bg-charcoal-100 text-charcoal-400' },
}

type EmailTemplate = {
  id: string
  name: string
  slug: string
  category: string
  subject: string
  status: string
  version: number
  created_at: string
  updated_at: string
}

export function EmailTemplatesPage() {
  const utils = trpc.useUtils()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Queries
  const statsQuery = trpc.emailTemplates.getCategoryStats.useQuery()
  const templatesQuery = trpc.emailTemplates.list.useQuery({
    search: search || undefined,
    category: (selectedCategory || (categoryFilter !== 'all' ? categoryFilter : undefined)) as 'user' | 'candidate' | 'client' | 'internal' | 'system' | 'marketing' | undefined,
    status: statusFilter !== 'all' ? statusFilter as 'draft' | 'active' | 'disabled' | 'archived' : undefined,
    page,
    pageSize: 20,
  })

  // Mutations
  const duplicateMutation = trpc.emailTemplates.duplicate.useMutation({
    onSuccess: () => {
      toast.success('Template duplicated')
      utils.emailTemplates.list.invalidate()
      utils.emailTemplates.getCategoryStats.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const disableMutation = trpc.emailTemplates.disable.useMutation({
    onSuccess: () => {
      toast.success('Template disabled')
      utils.emailTemplates.list.invalidate()
      utils.emailTemplates.getCategoryStats.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const activateMutation = trpc.emailTemplates.activate.useMutation({
    onSuccess: () => {
      toast.success('Template activated')
      utils.emailTemplates.list.invalidate()
      utils.emailTemplates.getCategoryStats.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const deleteMutation = trpc.emailTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success('Template deleted')
      utils.emailTemplates.list.invalidate()
      utils.emailTemplates.getCategoryStats.invalidate()
    },
    onError: (err) => toast.error(err.message),
  })

  const stats = statsQuery.data

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Email Templates' },
  ]

  return (
    <DashboardShell
      title="Email Templates"
      description="Manage email templates for notifications and communications"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/email-templates/new">
          <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </Link>
      }
    >
      {/* Stats Bar */}
      {stats && (
        <div className="flex items-center gap-6 mb-6 text-sm">
          <span className="text-charcoal-500">
            Total: <span className="font-medium text-charcoal-900">{stats.total}</span>
          </span>
          <span className="text-charcoal-500">
            Active: <span className="font-medium text-green-600">{stats.active}</span>
          </span>
          <span className="text-charcoal-500">
            Draft: <span className="font-medium text-charcoal-600">{stats.draft}</span>
          </span>
          <span className="text-charcoal-500">
            Disabled: <span className="font-medium text-red-600">{stats.disabled}</span>
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-10"
          />
        </div>
        {selectedCategory && (
          <Button
            variant="outline"
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2"
          >
            Back to Categories
          </Button>
        )}
        {!selectedCategory && (
          <>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </>
        )}
      </div>

      {/* Category Cards (when no category selected) */}
      {!selectedCategory && !search && categoryFilter === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
            const Icon = config.icon
            const count = stats?.byCategory[key] || 0

            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className="bg-white rounded-lg border border-charcoal-100 p-6 text-left hover:border-gold-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-charcoal-300 group-hover:text-gold-500 transition-colors" />
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-1">{config.label}</h3>
                <p className="text-sm text-charcoal-500">{count} template{count !== 1 ? 's' : ''}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* Templates List */}
      {(selectedCategory || search || categoryFilter !== 'all') && (
        <div className="bg-white rounded-lg border border-charcoal-100 overflow-hidden">
          {templatesQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : templatesQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <FileText className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No templates found</h3>
              <p className="text-charcoal-500 mb-4">
                {search ? 'Try adjusting your search' : 'Get started by creating your first template'}
              </p>
              {!search && (
                <Link href="/employee/admin/email-templates/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {templatesQuery.data?.items.map((template: EmailTemplate) => {
                const categoryConfig = CATEGORY_CONFIG[template.category]
                const statusConfig = STATUS_CONFIG[template.status]
                const CategoryIcon = categoryConfig?.icon || FileText

                return (
                  <div
                    key={template.id}
                    className="px-6 py-4 hover:bg-charcoal-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <Link
                            href={`/employee/admin/email-templates/${template.id}`}
                            className="font-medium text-charcoal-900 hover:text-hublot-600 truncate"
                          >
                            {template.name}
                          </Link>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig?.color || 'bg-charcoal-100 text-charcoal-600'}`}>
                            <CategoryIcon className="w-3 h-3" />
                            {categoryConfig?.label || template.category}
                          </span>
                          <Badge className={statusConfig?.color || 'bg-charcoal-100'}>
                            {statusConfig?.label || template.status}
                          </Badge>
                          {template.version > 1 && (
                            <span className="text-xs text-charcoal-400">v{template.version}</span>
                          )}
                        </div>
                        <p className="text-sm text-charcoal-500 truncate mb-1">
                          Subject: {template.subject}
                        </p>
                        <p className="text-xs text-charcoal-400">
                          Last edited {formatDistanceToNow(new Date(template.updated_at), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Actions Dropdown */}
                      <div className="relative ml-4">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === template.id ? null : template.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === template.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/email-templates/${template.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  duplicateMutation.mutate({ id: template.id })
                                  setOpenDropdown(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                              >
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </button>
                              {template.status === 'active' ? (
                                <button
                                  onClick={() => {
                                    disableMutation.mutate({ id: template.id })
                                    setOpenDropdown(null)
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                                >
                                  <PowerOff className="w-4 h-4" />
                                  Disable
                                </button>
                              ) : template.status !== 'archived' && (
                                <button
                                  onClick={() => {
                                    activateMutation.mutate({ id: template.id })
                                    setOpenDropdown(null)
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                                >
                                  <Power className="w-4 h-4" />
                                  Activate
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this template?')) {
                                    deleteMutation.mutate({ id: template.id })
                                  }
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
              })}
            </div>
          )}

          {/* Pagination */}
          {templatesQuery.data && templatesQuery.data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-charcoal-100">
              <p className="text-sm text-charcoal-500">
                Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, templatesQuery.data.pagination.total)} of {templatesQuery.data.pagination.total} templates
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
                  disabled={page >= templatesQuery.data.pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Links */}
      <div className="mt-8 flex gap-4 text-sm">
        <Link href="/employee/admin/settings/email" className="text-charcoal-500 hover:text-charcoal-700">
          Email Settings
        </Link>
      </div>
    </DashboardShell>
  )
}

export default EmailTemplatesPage
