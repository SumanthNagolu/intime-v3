'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface CloneRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceRole: {
    id: string
    code: string
    name: string
    display_name: string
  }
}

export function CloneRoleDialog({
  open,
  onOpenChange,
  sourceRole,
}: CloneRoleDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [newCode, setNewCode] = useState(`${sourceRole.code}_copy`)
  const [newName, setNewName] = useState(`${sourceRole.name} (Copy)`)
  const [newDisplayName, setNewDisplayName] = useState(`${sourceRole.display_name} (Copy)`)

  const cloneMutation = trpc.permissions.cloneRole.useMutation({
    onSuccess: (data) => {
      toast.success('Role cloned successfully')
      utils.permissions.listRoles.invalidate()
      utils.permissions.getRoleStats.invalidate()
      onOpenChange(false)
      router.push(`/employee/admin/roles/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to clone role')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCode.trim()) {
      toast.error('Role code is required')
      return
    }
    if (!newName.trim()) {
      toast.error('Role name is required')
      return
    }
    if (!newDisplayName.trim()) {
      toast.error('Display name is required')
      return
    }

    cloneMutation.mutate({
      sourceRoleId: sourceRole.id,
      newCode: newCode.trim().toLowerCase(),
      newName: newName.trim(),
      newDisplayName: newDisplayName.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Clone Role
          </DialogTitle>
          <DialogDescription>
            Create a copy of &quot;{sourceRole.display_name}&quot; with all its permissions and feature flags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newCode">New Role Code *</Label>
            <Input
              id="newCode"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g., custom_recruiter"
              maxLength={50}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newName">New Role Name *</Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g., Custom Recruiter"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newDisplayName">New Display Name *</Label>
            <Input
              id="newDisplayName"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="e.g., Custom Recruiter"
              maxLength={100}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={cloneMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
              disabled={cloneMutation.isPending}
            >
              {cloneMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Clone Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
