'use client'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateIncidentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateIncidentDialog({ open, onOpenChange, onSuccess }: CreateIncidentDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'P0' | 'P1' | 'P2' | 'P3'>('P2')
  const [impact, setImpact] = useState('')
  const [incidentCommander, setIncidentCommander] = useState<string>('')
  const [startedAt, setStartedAt] = useState(() => {
    // Default to now in local timezone format for datetime-local input
    const now = new Date()
    return now.toISOString().slice(0, 16)
  })

  const usersQuery = trpc.emergency.getAdminUsers.useQuery()

  const createIncidentMutation = trpc.emergency.createIncident.useMutation({
    onSuccess: (data) => {
      toast.success(`Incident ${data.incident_number} created successfully`)
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Failed to create incident: ${error.message}`)
    },
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSeverity('P2')
    setImpact('')
    setIncidentCommander('')
    setStartedAt(new Date().toISOString().slice(0, 16))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    createIncidentMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      severity,
      impact: impact.trim() || undefined,
      startedAt: new Date(startedAt).toISOString(),
      incidentCommander: incidentCommander && incidentCommander !== '__none__' ? incidentCommander : undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Incident</DialogTitle>
          <DialogDescription>
            Document a new incident for tracking and response coordination.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the incident"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P0">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      P0 - Critical
                    </span>
                  </SelectItem>
                  <SelectItem value="P1">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      P1 - High
                    </span>
                  </SelectItem>
                  <SelectItem value="P2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      P2 - Medium
                    </span>
                  </SelectItem>
                  <SelectItem value="P3">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      P3 - Low
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startedAt">Started At *</Label>
              <Input
                id="startedAt"
                type="datetime-local"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commander">Incident Commander</Label>
            <Select value={incidentCommander} onValueChange={setIncidentCommander}>
              <SelectTrigger>
                <SelectValue placeholder="Assign a commander" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {usersQuery.data?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact">Impact</Label>
            <Input
              id="impact"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="e.g., Users unable to login, API returning 503"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the incident..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createIncidentMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createIncidentMutation.isPending}>
              {createIncidentMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Incident
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
