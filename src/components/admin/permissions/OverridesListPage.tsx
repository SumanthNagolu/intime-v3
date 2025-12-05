'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Shield,
  Check,
  X,
  Clock,
  Trash2,
  AlertTriangle,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format } from 'date-fns'

type User = {
  id: string
  full_name: string
  email: string
}

type Permission = {
  code: string
  name: string
  object_type: string
  action: string
}

type Override = {
  id: string
  granted: boolean
  scope_override: string | null
  reason: string
  expires_at: string | null
  created_at: string
  revoked_at: string | null
  permissions: Permission
  user: User
  creator: { id: string; full_name: string }
}

const SCOPE_LABELS: Record<string, string> = {
  own: 'Own',
  own_raci: 'Own + RACI',
  own_ra: 'Own + R/A',
  team: 'Team',
  region: 'Region',
  org: 'Organization',
  draft_only: 'Draft Only',
}

export function OverridesListPage() {
  const [search, setSearch] = useState('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [revokeId, setRevokeId] = useState<string | null>(null)

  // Form state
  const [formUserId, setFormUserId] = useState('')
  const [formPermissionCode, setFormPermissionCode] = useState('')
  const [formGranted, setFormGranted] = useState(true)
  const [formScope, setFormScope] = useState('')
  const [formReason, setFormReason] = useState('')
  const [formExpiresAt, setFormExpiresAt] = useState('')

  const { toast } = useToast()

  const overridesQuery = trpc.permissions.listOverrides.useQuery({
    activeOnly: showActiveOnly,
  })

  const usersQuery = trpc.users.list.useQuery({
    search: search || undefined,
    status: 'active',
    page: 1,
    pageSize: 100,
  })

  const permissionsQuery = trpc.permissions.getAllPermissions.useQuery()

  const createMutation = trpc.permissions.createOverride.useMutation({
    onSuccess: () => {
      overridesQuery.refetch()
      setIsCreateOpen(false)
      resetForm()
      toast({
        title: 'Override Created',
        description: 'The permission override has been created successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create override',
        variant: 'destructive',
      })
    },
  })

  const revokeMutation = trpc.permissions.revokeOverride.useMutation({
    onSuccess: () => {
      overridesQuery.refetch()
      setRevokeId(null)
      toast({
        title: 'Override Revoked',
        description: 'The permission override has been revoked.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to revoke override',
        variant: 'destructive',
      })
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Permissions', href: '/employee/admin/permissions' },
    { label: 'Overrides' },
  ]

  const resetForm = () => {
    setFormUserId('')
    setFormPermissionCode('')
    setFormGranted(true)
    setFormScope('')
    setFormReason('')
    setFormExpiresAt('')
  }

  const handleCreate = () => {
    if (!formUserId || !formPermissionCode || !formReason) return

    createMutation.mutate({
      userId: formUserId,
      permissionCode: formPermissionCode,
      granted: formGranted,
      scopeOverride: formScope ? (formScope as 'own' | 'own_raci' | 'own_ra' | 'team' | 'region' | 'org' | 'draft_only') : undefined,
      reason: formReason,
      expiresAt: formExpiresAt || undefined,
    })
  }

  const filteredOverrides = overridesQuery.data?.filter((o: Override) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      o.user?.full_name?.toLowerCase().includes(searchLower) ||
      o.user?.email?.toLowerCase().includes(searchLower) ||
      o.permissions?.name?.toLowerCase().includes(searchLower)
    )
  })

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <DashboardShell
      title="Permission Overrides"
      description="Manage user-specific permission grants and denials"
      breadcrumbs={breadcrumbs}
      actions={
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-hublot-900 hover:bg-hublot-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Override
        </Button>
      }
    >
      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search by user or permission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-charcoal-300"
            />
            <span className="text-sm text-charcoal-700">Active only</span>
          </label>
        </div>

        {/* Overrides Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {overridesQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : overridesQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load overrides. Please try again.
            </div>
          ) : filteredOverrides?.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Shield className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                No overrides found
              </h3>
              <p className="text-charcoal-500 mb-4">
                Create an override to grant or deny specific permissions to individual users.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Override
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-charcoal-50 border-b border-charcoal-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Permission
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOverrides?.map((override: Override, idx: number) => (
                  <tr
                    key={override.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-charcoal-25'} ${
                      override.revoked_at ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal-900">
                        {override.user?.full_name}
                      </div>
                      <div className="text-xs text-charcoal-500">{override.user?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal-900">
                        {override.permissions?.name}
                      </div>
                      <div className="text-xs text-charcoal-500">
                        {override.permissions?.object_type}.{override.permissions?.action}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {override.granted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                          <Check className="w-3 h-3" />
                          Grant
                          {override.scope_override && (
                            <span className="text-green-600">
                              ({SCOPE_LABELS[override.scope_override]})
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs">
                          <X className="w-3 h-3" />
                          Deny
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-charcoal-700 max-w-xs truncate">
                        {override.reason}
                      </div>
                      <div className="text-xs text-charcoal-500">
                        by {override.creator?.full_name}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {override.revoked_at ? (
                        <span className="text-xs text-charcoal-500">Revoked</span>
                      ) : override.expires_at ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-charcoal-400" />
                          <span
                            className={`text-xs ${
                              isExpired(override.expires_at)
                                ? 'text-red-600'
                                : 'text-charcoal-600'
                            }`}
                          >
                            {format(new Date(override.expires_at), 'MMM d, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-charcoal-500">Never</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!override.revoked_at && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRevokeId(override.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DashboardSection>

      {/* Create Override Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Permission Override</DialogTitle>
            <DialogDescription>
              Grant or deny a specific permission to an individual user.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>User</Label>
              <Select value={formUserId} onValueChange={setFormUserId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {usersQuery.data?.items.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Permission</Label>
              <Select value={formPermissionCode} onValueChange={setFormPermissionCode}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  {permissionsQuery.data?.map((perm: Permission & { id: string }) => (
                    <SelectItem key={perm.id} value={perm.code}>
                      {perm.name} ({perm.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Override Type</Label>
              <div className="flex gap-4 mt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formGranted}
                    onChange={() => setFormGranted(true)}
                    className="text-green-600"
                  />
                  <span className="text-sm text-charcoal-700">Grant</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formGranted}
                    onChange={() => setFormGranted(false)}
                    className="text-red-600"
                  />
                  <span className="text-sm text-charcoal-700">Deny</span>
                </label>
              </div>
            </div>

            {formGranted && (
              <div>
                <Label>Scope (optional)</Label>
                <Select value={formScope} onValueChange={setFormScope}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Use default scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Use default scope</SelectItem>
                    {Object.entries(SCOPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Reason</Label>
              <Input
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                placeholder="Explain why this override is needed (min 10 chars)"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Expires (optional)</Label>
              <Input
                type="datetime-local"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !formUserId ||
                !formPermissionCode ||
                formReason.length < 10 ||
                createMutation.isPending
              }
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Revoke Override
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this permission override? The user will fall
              back to their role&apos;s default permissions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => revokeId && revokeMutation.mutate({ id: revokeId })}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? 'Revoking...' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
