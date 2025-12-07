'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  Smartphone,
  MessageSquare,
  Globe,
  Search,
  FileText,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

const NOTIFICATION_CATEGORIES = [
  { id: 'system', name: 'System', icon: Globe, description: 'System-wide notifications' },
  { id: 'security', name: 'Security', icon: Bell, description: 'Security alerts' },
  { id: 'workflow', name: 'Workflow', icon: FileText, description: 'Workflow notifications' },
  { id: 'activity', name: 'Activity', icon: Bell, description: 'Activity updates' },
  { id: 'reminder', name: 'Reminders', icon: Bell, description: 'Scheduled reminders' },
  { id: 'marketing', name: 'Marketing', icon: Mail, description: 'Product updates' },
]

const CHANNELS = [
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'in_app', name: 'In-App', icon: Bell },
  { id: 'push', name: 'Push', icon: Smartphone },
  { id: 'sms', name: 'SMS', icon: MessageSquare },
]

type Notification = {
  id: string
  title: string
  body?: string
  category: string
  priority: string
  read: boolean
  read_at?: string
  action_url?: string
  created_at: string
}

type NotificationPreference = {
  id: string
  category: string
  channel: string
  enabled: boolean
}

type NotificationTemplate = {
  id: string
  code: string
  name: string
  description?: string
  category: string
  subject: string
  body: string
  variables?: string[]
  is_active: boolean
}

export function NotificationsPage() {
  const [page, setPage] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')
  const [templatePage, setTemplatePage] = useState(1)

  const utils = trpc.useUtils()

  // Queries
  const statsQuery = trpc.notifications.getStats.useQuery()
  const notificationsQuery = trpc.notifications.listRecent.useQuery({
    page,
    pageSize: 20,
    unreadOnly,
  })
  const preferencesQuery = trpc.notifications.listPreferences.useQuery()
  const templatesQuery = trpc.notifications.listTemplates.useQuery({
    search: templateSearch || undefined,
    page: templatePage,
    pageSize: 20,
  })
  const categoriesQuery = trpc.notifications.getCategories.useQuery()

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      toast.success('Notification marked as read')
      utils.notifications.listRecent.invalidate()
      utils.notifications.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark as read')
    },
  })

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success('All notifications marked as read')
      utils.notifications.listRecent.invalidate()
      utils.notifications.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to mark all as read')
    },
  })

  const clearReadMutation = trpc.notifications.clearRead.useMutation({
    onSuccess: () => {
      toast.success('Read notifications cleared')
      utils.notifications.listRecent.invalidate()
      utils.notifications.getStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clear notifications')
    },
  })

  const updatePreferenceMutation = trpc.notifications.updatePreference.useMutation({
    onSuccess: () => {
      toast.success('Preference updated')
      utils.notifications.listPreferences.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update preference')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Notifications' },
  ]

  const getPreference = (category: string, channel: string): boolean => {
    const pref = preferencesQuery.data?.find(
      (p: NotificationPreference) => p.category === category && p.channel === channel
    )
    return pref?.enabled ?? true
  }

  const togglePreference = (category: string, channel: string, enabled: boolean) => {
    updatePreferenceMutation.mutate({ category, channel, enabled })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'normal':
        return 'bg-blue-100 text-blue-800'
      case 'low':
        return 'bg-charcoal-100 text-charcoal-600'
      default:
        return 'bg-charcoal-100 text-charcoal-600'
    }
  }

  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Notifications"
        description="Manage notification preferences and view recent notifications"
        breadcrumbs={breadcrumbs}
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Total</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.total ?? '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Unread</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.unread ?? '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Read</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.read ?? '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Recent Notifications Tab */}
        <TabsContent value="recent">
          <DashboardSection>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unreadOnly}
                    onChange={(e) => {
                      setUnreadOnly(e.target.checked)
                      setPage(1)
                    }}
                    className="w-4 h-4 rounded border-charcoal-300"
                  />
                  <span className="text-sm text-charcoal-600">Unread Only</span>
                </label>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending || !statsQuery.data?.unread}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearReadMutation.mutate()}
                  disabled={clearReadMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    utils.notifications.listRecent.invalidate()
                    utils.notifications.getStats.invalidate()
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              {notificationsQuery.isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : notificationsQuery.error ? (
                <div className="p-8 text-center text-red-600">
                  Failed to load notifications. Please try again.
                </div>
              ) : notificationsQuery.data?.items.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                    <BellOff className="w-8 h-8 text-charcoal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No notifications</h3>
                  <p className="text-charcoal-500">
                    {unreadOnly ? "You're all caught up!" : "You don't have any notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-charcoal-100">
                  {notificationsQuery.data?.items.map((notification: Notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-charcoal-50 transition-colors ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            )}
                            <h4 className="font-medium text-charcoal-900">
                              {notification.title}
                            </h4>
                            <span
                              className={`px-2 py-0.5 text-xs rounded ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </span>
                          </div>
                          {notification.body && (
                            <p className="text-sm text-charcoal-600 mb-2">{notification.body}</p>
                          )}
                          <p className="text-xs text-charcoal-400">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                            disabled={markAsReadMutation.isPending}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {notificationsQuery.data && notificationsQuery.data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-charcoal-500">
                  Page {page} of {notificationsQuery.data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= notificationsQuery.data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </DashboardSection>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <DashboardSection>
            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              <div className="p-4 border-b border-charcoal-100">
                <h3 className="font-semibold text-charcoal-900">Notification Channels</h3>
                <p className="text-sm text-charcoal-500 mt-1">
                  Choose how you want to receive notifications for each category
                </p>
              </div>

              {preferencesQuery.isLoading ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-charcoal-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                          Category
                        </th>
                        {CHANNELS.map((channel) => (
                          <th
                            key={channel.id}
                            className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider"
                          >
                            <div className="flex items-center justify-center gap-1">
                              <channel.icon className="w-4 h-4" />
                              {channel.name}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal-100">
                      {(categoriesQuery.data ?? NOTIFICATION_CATEGORIES).map((category) => (
                        <tr key={category.id} className="hover:bg-charcoal-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium text-charcoal-900">{category.name}</p>
                                <p className="text-sm text-charcoal-500">{category.description}</p>
                              </div>
                            </div>
                          </td>
                          {CHANNELS.map((channel) => (
                            <td key={channel.id} className="px-4 py-4 text-center">
                              <Switch
                                checked={getPreference(category.id, channel.id)}
                                onCheckedChange={(checked) =>
                                  togglePreference(category.id, channel.id, checked)
                                }
                                disabled={updatePreferenceMutation.isPending}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <DashboardSection>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => {
                    setTemplateSearch(e.target.value)
                    setTemplatePage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              {templatesQuery.isLoading ? (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-charcoal-100 animate-pulse rounded" />
                  ))}
                </div>
              ) : templatesQuery.error ? (
                <div className="p-8 text-center text-red-600">
                  Failed to load templates. Please try again.
                </div>
              ) : templatesQuery.data?.items.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                  <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No templates</h3>
                  <p className="text-charcoal-500">No notification templates found</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-charcoal-100 bg-charcoal-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {templatesQuery.data?.items.map((template: NotificationTemplate) => (
                      <tr key={template.id} className="hover:bg-charcoal-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-charcoal-900">{template.name}</p>
                            <code className="text-xs text-charcoal-500">{template.code}</code>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-700 capitalize">
                            {template.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-charcoal-600 max-w-xs truncate">
                          {template.subject}
                        </td>
                        <td className="px-6 py-4">
                          {template.is_active ? (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                              Inactive
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Template Pagination */}
            {templatesQuery.data && templatesQuery.data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-charcoal-500">
                  Page {templatePage} of {templatesQuery.data.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={templatePage === 1}
                    onClick={() => setTemplatePage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={templatePage >= templatesQuery.data.pagination.totalPages}
                    onClick={() => setTemplatePage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </DashboardSection>
        </TabsContent>
      </Tabs>
    </AdminPageContent>
  )
}
