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
import { Loader2, Mail, MessageSquare, Bell, X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface SendNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incidentId: string
  incidentNumber: string
  onSuccess?: () => void
}

export function SendNotificationDialog({
  open,
  onOpenChange,
  incidentId,
  incidentNumber,
  onSuccess,
}: SendNotificationDialogProps) {
  const [notificationType, setNotificationType] = useState<'email' | 'in_app'>('email')
  const [recipients, setRecipients] = useState<string[]>([])
  const [recipientInput, setRecipientInput] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const usersQuery = trpc.emergency.getAdminUsers.useQuery()

  const sendNotificationMutation = trpc.emergency.sendNotification.useMutation({
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.successCount}/${data.totalRecipients} recipients`)
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Failed to send notification: ${error.message}`)
    },
  })

  const resetForm = () => {
    setNotificationType('email')
    setRecipients([])
    setRecipientInput('')
    setSubject('')
    setBody('')
  }

  const handleAddRecipient = () => {
    const trimmed = recipientInput.trim()
    if (!trimmed) return

    if (notificationType === 'email') {
      // Validate email
      if (!trimmed.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        toast.error('Invalid email address')
        return
      }
    }

    if (!recipients.includes(trimmed)) {
      setRecipients([...recipients, trimmed])
    }
    setRecipientInput('')
  }

  const handleRemoveRecipient = (recipient: string) => {
    setRecipients(recipients.filter((r) => r !== recipient))
  }

  const handleSelectUser = (userId: string) => {
    if (userId && !recipients.includes(userId)) {
      if (notificationType === 'email') {
        const user = usersQuery.data?.find((u) => u.id === userId)
        if (user && !recipients.includes(user.email)) {
          setRecipients([...recipients, user.email])
        }
      } else {
        setRecipients([...recipients, userId])
      }
    }
    setRecipientInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (recipients.length === 0) {
      toast.error('Add at least one recipient')
      return
    }

    if (!body.trim()) {
      toast.error('Message body is required')
      return
    }

    sendNotificationMutation.mutate({
      incidentId,
      notificationType,
      recipients,
      subject: subject.trim() || undefined,
      body: body.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Send Notification</DialogTitle>
          <DialogDescription>
            Send a notification about incident {incidentNumber}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Notification Type</Label>
            <Select
              value={notificationType}
              onValueChange={(v) => {
                setNotificationType(v as typeof notificationType)
                setRecipients([]) // Clear recipients when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </span>
                </SelectItem>
                <SelectItem value="in_app">
                  <span className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    In-App Notification
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Recipients</Label>
            <div className="flex gap-2">
              {notificationType === 'email' ? (
                <>
                  <Input
                    type="email"
                    value={recipientInput}
                    onChange={(e) => setRecipientInput(e.target.value)}
                    placeholder="Enter email address"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddRecipient()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={handleAddRecipient}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Select value="" onValueChange={handleSelectUser}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select users to notify" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersQuery.data?.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        disabled={recipients.includes(user.id)}
                      >
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Quick add from users for email */}
            {notificationType === 'email' && (
              <Select value="" onValueChange={handleSelectUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Or select from users..." />
                </SelectTrigger>
                <SelectContent>
                  {usersQuery.data?.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      disabled={recipients.includes(user.email)}
                    >
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Recipients list */}
            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipients.map((recipient) => {
                  const displayName = notificationType === 'in_app'
                    ? usersQuery.data?.find((u) => u.id === recipient)?.full_name || recipient
                    : recipient
                  return (
                    <Badge
                      key={recipient}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      {displayName}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(recipient)}
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

          {notificationType === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`[${incidentNumber}] Incident Update`}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your notification message..."
              rows={5}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={sendNotificationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sendNotificationMutation.isPending || recipients.length === 0}
            >
              {sendNotificationMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Send to {recipients.length} recipient{recipients.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
