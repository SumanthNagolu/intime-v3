'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import type {
  CreateActivityFormState,
  ActivityPriority,
  ActivityStatus,
  CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from './types'

interface ActivityFormFieldsProps {
  state: CreateActivityFormState
  onChange: (updates: Partial<CreateActivityFormState>) => void
  entityType: string
  entityId: string
}

export function ActivityFormFields({
  state,
  onChange,
  entityType,
  entityId,
}: ActivityFormFieldsProps) {
  // Fetch org members for assignment
  const { data: orgMembersData } = trpc.users.list.useQuery(
    { page: 1, pageSize: 100 },
    { staleTime: 60000 }
  )

  // Fetch contacts for this entity (if account)
  const { data: contactsData } = trpc.crm.contacts.listByAccount.useQuery(
    { accountId: entityId },
    { enabled: entityType === 'account', staleTime: 30000 }
  )

  // Fetch work queues
  const { data: queuesData } = trpc.activities.listQueues.useQuery(
    { entityType },
    { staleTime: 60000 }
  )

  const orgMembers = orgMembersData?.items || []
  const contacts = contactsData || []
  const queues = queuesData || []

  return (
    <div className="space-y-5">
      {/* Subject (required) */}
      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subject"
          value={state.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          placeholder="What needs to be done?"
          maxLength={200}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Provide additional details..."
          rows={3}
          maxLength={5000}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={state.category || '_none'}
          onValueChange={(value) => onChange({ category: value === '_none' ? '' : value })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_none">No category</SelectItem>
            <SelectItem value="communication">Communication</SelectItem>
            <SelectItem value="follow_up">Follow Up</SelectItem>
            <SelectItem value="administrative">Administrative</SelectItem>
            <SelectItem value="research">Research</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="recruiting">Recruiting</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="workflow">Workflow</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Two column: Priority + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={state.priority}
            onValueChange={(value) => onChange({ priority: value as ActivityPriority })}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={state.status}
            onValueChange={(value) => onChange({ status: value as ActivityStatus })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Two column: Due Date + Escalation Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={state.dueDate ? format(state.dueDate, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) =>
              onChange({
                dueDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="escalationDate">Escalation Date</Label>
          <Input
            id="escalationDate"
            type="datetime-local"
            value={state.escalationDate ? format(state.escalationDate, "yyyy-MM-dd'T'HH:mm") : ''}
            onChange={(e) =>
              onChange({
                escalationDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
          />
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-charcoal-200 pt-5">
        <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-4">
          Assignment
        </h4>
      </div>

      {/* Two column: Assign To + Queue */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assign To</Label>
          <Select
            value={state.assignedTo || '_self'}
            onValueChange={(value) =>
              onChange({ assignedTo: value === '_self' ? null : value })
            }
          >
            <SelectTrigger id="assignedTo">
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_self">Myself</SelectItem>
              {orgMembers.map((member: { id: string; full_name?: string }) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="queueId">Queue (Optional)</Label>
          <Select
            value={state.queueId || '_none'}
            onValueChange={(value) =>
              onChange({ queueId: value === '_none' ? null : value })
            }
          >
            <SelectTrigger id="queueId">
              <SelectValue placeholder="No queue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No queue</SelectItem>
              {queues.map((queue: { id: string; name: string }) => (
                <SelectItem key={queue.id} value={queue.id}>
                  {queue.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Related Contact (for accounts) */}
      {entityType === 'account' && contacts.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="contactId">Related Contact (Optional)</Label>
          <Select
            value={state.contactId || '_none'}
            onValueChange={(value) =>
              onChange({ contactId: value === '_none' ? null : value })
            }
          >
            <SelectTrigger id="contactId">
              <SelectValue placeholder="No specific contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No specific contact</SelectItem>
              {contacts.map(
                (contact: { id: string; first_name: string; last_name?: string; title?: string }) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                    {contact.title && ` - ${contact.title}`}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
