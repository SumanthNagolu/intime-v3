'use client'

import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { TeamMember } from '@/types/workspace'

interface AssignDropdownProps {
  members: TeamMember[]
  currentAssigneeId?: string | null
  onAssign: (memberId: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Dropdown component for reassigning items to team members.
 * Used in team tables for Activities, Jobs, and Queue items.
 */
export function AssignDropdown({
  members,
  currentAssigneeId,
  onAssign,
  disabled = false,
  className,
  placeholder = 'Assign to...',
}: AssignDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleValueChange = (value: string) => {
    if (value && value !== currentAssigneeId) {
      onAssign(value)
    }
    setIsOpen(false)
  }

  return (
    <Select
      value={currentAssigneeId || undefined}
      onValueChange={handleValueChange}
      disabled={disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectTrigger
        className={cn(
          'h-8 text-xs',
          !currentAssigneeId && 'text-charcoal-400',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <div className="flex items-center gap-2">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-charcoal-100 flex items-center justify-center text-[10px] font-medium text-charcoal-600">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
              <span>{member.name}</span>
              <span className="text-charcoal-400 text-xs capitalize">
                ({member.role})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
