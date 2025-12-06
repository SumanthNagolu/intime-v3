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
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import { Loader2, X, Users, AlertTriangle, Shield, Database } from 'lucide-react'
import { toast } from 'sonner'

const DRILL_TYPES = [
  { value: 'tabletop', label: 'Tabletop Exercise', icon: Users, description: 'Walk through scenarios in a meeting format' },
  { value: 'simulated_outage', label: 'Simulated Outage', icon: AlertTriangle, description: 'Practice response to system outages' },
  { value: 'security_breach', label: 'Security Breach', icon: Shield, description: 'Test security incident response' },
  { value: 'backup_restore', label: 'Backup Restore', icon: Database, description: 'Verify backup and restore procedures' },
]

interface CreateDrillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateDrillDialog({ open, onOpenChange, onSuccess }: CreateDrillDialogProps) {
  const [drillType, setDrillType] = useState<string>('tabletop')
  const [title, setTitle] = useState('')
  const [scenario, setScenario] = useState('')
  const [scheduledAt, setScheduledAt] = useState(() => {
    // Default to next week
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(10, 0, 0, 0)
    return nextWeek.toISOString().slice(0, 16)
  })
  const [participants, setParticipants] = useState<string[]>([])

  const usersQuery = trpc.emergency.getAdminUsers.useQuery()

  const createDrillMutation = trpc.emergency.createDrill.useMutation({
    onSuccess: () => {
      toast.success('Drill scheduled successfully')
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Failed to schedule drill: ${error.message}`)
    },
  })

  const resetForm = () => {
    setDrillType('tabletop')
    setTitle('')
    setScenario('')
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    nextWeek.setHours(10, 0, 0, 0)
    setScheduledAt(nextWeek.toISOString().slice(0, 16))
    setParticipants([])
  }

  const handleAddParticipant = (userId: string) => {
    if (userId && !participants.includes(userId)) {
      setParticipants([...participants, userId])
    }
  }

  const handleRemoveParticipant = (userId: string) => {
    setParticipants(participants.filter((p) => p !== userId))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!scenario.trim()) {
      toast.error('Scenario description is required')
      return
    }

    createDrillMutation.mutate({
      drillType: drillType as 'tabletop' | 'simulated_outage' | 'security_breach' | 'backup_restore',
      title: title.trim(),
      scenario: scenario.trim(),
      scheduledAt: new Date(scheduledAt).toISOString(),
      participants,
    })
  }

  const selectedTypeConfig = DRILL_TYPES.find((t) => t.value === drillType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Schedule Emergency Drill</DialogTitle>
          <DialogDescription>
            Plan an emergency drill to test your team&apos;s response capabilities.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Drill Type *</Label>
            <Select value={drillType} onValueChange={setDrillType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DRILL_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {selectedTypeConfig && (
              <p className="text-xs text-charcoal-500">{selectedTypeConfig.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Q1 2025 Tabletop Exercise"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario Description *</Label>
            <Textarea
              id="scenario"
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the scenario to be tested. Include objectives, scope, and expected outcomes..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Participants</Label>
            <Select value="" onValueChange={handleAddParticipant}>
              <SelectTrigger>
                <SelectValue placeholder="Add participants..." />
              </SelectTrigger>
              <SelectContent>
                {usersQuery.data?.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    disabled={participants.includes(user.id)}
                  >
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {participants.map((participantId) => {
                  const user = usersQuery.data?.find((u) => u.id === participantId)
                  return (
                    <Badge
                      key={participantId}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {user?.full_name || participantId}
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(participantId)}
                        className="ml-1 hover:bg-charcoal-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createDrillMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDrillMutation.isPending}>
              {createDrillMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Schedule Drill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
