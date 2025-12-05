'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, AlertTriangle, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

type User = {
  id: string
  full_name: string
  email: string
  role?: {
    display_name: string
  }
}

type FeatureFlag = {
  id: string
  code: string
  name: string
}

type Permission = {
  id: string
  code: string
  name: string
  object_type: string
}

interface BulkUpdateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const UPDATE_TYPES = [
  { value: 'enable_feature', label: 'Enable Feature', description: 'Enable a feature flag for selected users' },
  { value: 'disable_feature', label: 'Disable Feature', description: 'Disable a feature flag for selected users' },
  { value: 'add_permission', label: 'Add Permission', description: 'Grant a permission override to selected users' },
  { value: 'remove_permission', label: 'Remove Permission', description: 'Revoke a permission from selected users' },
  { value: 'change_scope', label: 'Change Scope', description: 'Change permission scope for selected users' },
]

const SCOPE_OPTIONS = [
  { value: 'own', label: 'Own' },
  { value: 'own_raci', label: 'Own + RACI' },
  { value: 'team', label: 'Team' },
  { value: 'region', label: 'Region' },
  { value: 'org', label: 'Organization' },
]

export function BulkUpdateDialog({ open, onOpenChange }: BulkUpdateDialogProps) {
  const [step, setStep] = useState(1)
  const [updateType, setUpdateType] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [featureId, setFeatureId] = useState('')
  const [permissionId, setPermissionId] = useState('')
  const [scope, setScope] = useState('')
  const [reason, setReason] = useState('')
  const [userSearch, setUserSearch] = useState('')

  const { toast } = useToast()

  const usersQuery = trpc.users.list.useQuery({
    search: userSearch || undefined,
    status: 'active',
    page: 1,
    pageSize: 100,
  })

  const flagsQuery = trpc.permissions.getFeatureFlags.useQuery()
  const permissionsQuery = trpc.permissions.getAllPermissions.useQuery()

  const bulkUpdateMutation = trpc.permissions.bulkUpdate.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Bulk Update Complete',
        description: `Successfully updated ${data.affectedCount} users.`,
      })
      resetAndClose()
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply bulk update',
        variant: 'destructive',
      })
    },
  })

  const resetAndClose = () => {
    setStep(1)
    setUpdateType('')
    setSelectedUsers([])
    setFeatureId('')
    setPermissionId('')
    setScope('')
    setReason('')
    setUserSearch('')
    onOpenChange(false)
  }

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === usersQuery.data?.items.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(usersQuery.data?.items.map((u: User) => u.id) || [])
    }
  }

  const handleSubmit = () => {
    if (!updateType || selectedUsers.length === 0 || reason.length < 10) return

    bulkUpdateMutation.mutate({
      userIds: selectedUsers,
      updateType: updateType as 'enable_feature' | 'disable_feature' | 'change_scope' | 'add_permission' | 'remove_permission',
      featureId: featureId || undefined,
      permissionId: permissionId || undefined,
      scope: scope ? (scope as 'own' | 'own_raci' | 'own_ra' | 'team' | 'region' | 'org' | 'draft_only') : undefined,
      reason,
    })
  }

  const canProceedStep1 = updateType !== ''
  const canProceedStep2 = selectedUsers.length > 0
  const canProceedStep3 =
    (updateType.includes('feature') ? featureId : true) &&
    (updateType.includes('permission') || updateType === 'change_scope' ? permissionId : true) &&
    (updateType === 'change_scope' ? scope : true)
  const canSubmit = reason.length >= 10

  const renderStep1 = () => (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-600">Select the type of update you want to perform:</p>
      <div className="space-y-2">
        {UPDATE_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => setUpdateType(type.value)}
            className={`w-full p-4 rounded-lg border text-left transition-colors ${
              updateType === type.value
                ? 'border-hublot-500 bg-hublot-50'
                : 'border-charcoal-200 hover:border-charcoal-300'
            }`}
          >
            <div className="font-medium text-charcoal-900">{type.label}</div>
            <div className="text-sm text-charcoal-500">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-charcoal-600">
          Select users to update ({selectedUsers.length} selected):
        </p>
        <Button variant="ghost" size="sm" onClick={selectAllUsers}>
          {selectedUsers.length === usersQuery.data?.items.length ? 'Deselect All' : 'Select All'}
        </Button>
      </div>

      <Input
        placeholder="Search users..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
      />

      <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
        {usersQuery.data?.items.map((user: User) => (
          <label
            key={user.id}
            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-charcoal-50 ${
              selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.id)}
              onChange={() => toggleUser(user.id)}
              className="rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-charcoal-900 truncate">{user.full_name}</div>
              <div className="text-xs text-charcoal-500 truncate">
                {user.email} - {user.role?.display_name || 'No role'}
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <p className="text-sm text-charcoal-600">Configure the update details:</p>

      {(updateType === 'enable_feature' || updateType === 'disable_feature') && (
        <div>
          <Label>Feature Flag</Label>
          <Select value={featureId} onValueChange={setFeatureId}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select feature" />
            </SelectTrigger>
            <SelectContent>
              {flagsQuery.data?.map((flag: FeatureFlag) => (
                <SelectItem key={flag.id} value={flag.id}>
                  {flag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {(updateType === 'add_permission' ||
        updateType === 'remove_permission' ||
        updateType === 'change_scope') && (
        <div>
          <Label>Permission</Label>
          <Select value={permissionId} onValueChange={setPermissionId}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select permission" />
            </SelectTrigger>
            <SelectContent>
              {permissionsQuery.data?.map((perm: Permission) => (
                <SelectItem key={perm.id} value={perm.id}>
                  {perm.name} ({perm.object_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {updateType === 'change_scope' && (
        <div>
          <Label>New Scope</Label>
          <Select value={scope} onValueChange={setScope}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              {SCOPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <strong>Review your changes:</strong>
          <ul className="mt-2 space-y-1">
            <li>
              <strong>Action:</strong>{' '}
              {UPDATE_TYPES.find((t) => t.value === updateType)?.label}
            </li>
            <li>
              <strong>Users affected:</strong> {selectedUsers.length}
            </li>
            {featureId && (
              <li>
                <strong>Feature:</strong>{' '}
                {flagsQuery.data?.find((f: FeatureFlag) => f.id === featureId)?.name}
              </li>
            )}
            {permissionId && (
              <li>
                <strong>Permission:</strong>{' '}
                {permissionsQuery.data?.find((p: Permission) => p.id === permissionId)?.name}
              </li>
            )}
            {scope && (
              <li>
                <strong>Scope:</strong>{' '}
                {SCOPE_OPTIONS.find((s) => s.value === scope)?.label}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div>
        <Label>Reason for this change (required)</Label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain why this bulk update is needed (min 10 chars)"
          className="mt-1.5"
        />
        <p className="text-xs text-charcoal-500 mt-1">
          This will be recorded in the audit log for compliance purposes.
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Update Permissions
          </DialogTitle>
          <DialogDescription>
            Step {step} of 4: {step === 1 && 'Select Update Type'}
            {step === 2 && 'Select Users'}
            {step === 3 && 'Configure Details'}
            {step === 4 && 'Review & Confirm'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded ${
                s <= step ? 'bg-hublot-500' : 'bg-charcoal-200'
              }`}
            />
          ))}
        </div>

        <div className="py-4">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && !canProceedStep1) ||
                (step === 2 && !canProceedStep2) ||
                (step === 3 && !canProceedStep3)
              }
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || bulkUpdateMutation.isPending}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {bulkUpdateMutation.isPending ? (
                'Applying...'
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Apply Changes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
