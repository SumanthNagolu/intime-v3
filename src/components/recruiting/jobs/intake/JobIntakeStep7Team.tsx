'use client'

import { useCreateJobStore, PRIORITY_RANKS } from '@/stores/create-job-store'
import { Section, FieldGroup, SelectCard } from './shared'
import { Users, Shield, User, Clock, Target, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'

interface UserOption {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  role?: {
    display_name?: string
  } | null
}

function UserSelect({
  value,
  onChange,
  placeholder = 'Select user',
  users,
  isLoading,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  users: UserOption[]
  isLoading: boolean
}) {
  const selectedUser = users.find((u) => u.id === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-14 rounded-xl border-charcoal-200 bg-white">
        <SelectValue placeholder={isLoading ? 'Loading users...' : placeholder}>
          {selectedUser && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={selectedUser.avatar_url || ''} />
                <AvatarFallback className="bg-gold-100 text-gold-700 text-xs">
                  {selectedUser.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <p className="text-sm font-medium text-charcoal-900">{selectedUser.full_name}</p>
                <p className="text-xs text-charcoal-500">
                  {selectedUser.role?.display_name || 'Team Member'}
                </p>
              </div>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {users.map((user) => (
          <SelectItem key={user.id} value={user.id} className="py-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar_url || ''} />
                <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-xs">
                  {user.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-charcoal-900">{user.full_name}</p>
                <p className="text-xs text-charcoal-500">
                  {user.role?.display_name || 'Team Member'}
                </p>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function JobIntakeStep7Team() {
  const { formData, setFormData, addRecruiter, removeRecruiter } = useCreateJobStore()

  // Fetch users from API
  const { data: usersData, isLoading } = trpc.users.list.useQuery({
    status: 'active',
    pageSize: 100,
  })

  const users: UserOption[] = usersData?.items ?? []

  // Get recruiter names for display
  const selectedRecruiters = formData.recruiterIds
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean) as UserOption[]

  return (
    <div className="space-y-10">
      {/* Job Owner */}
      <Section
        icon={Shield}
        title="Job Owner"
        subtitle="Primary owner responsible for this requisition"
      >
        <div className="space-y-2 max-w-lg">
          <Label className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gold-500" />
            Job Owner <span className="text-red-500">*</span>
          </Label>
          <UserSelect
            value={formData.ownerId}
            onChange={(v) => setFormData({ ownerId: v })}
            placeholder="Select Job Owner"
            users={users}
            isLoading={isLoading}
          />
          <p className="text-xs text-charcoal-500">
            The owner is accountable for filling this position and receives all notifications.
          </p>
        </div>
      </Section>

      {/* Assigned Recruiters */}
      <Section icon={Users} title="Assigned Recruiters" subtitle="Recruiters working on this job">
        <div className="space-y-4">
          {/* Current recruiters */}
          {selectedRecruiters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedRecruiters.map((recruiter) => (
                <div
                  key={recruiter.id}
                  className="inline-flex items-center gap-2 pl-2 pr-1 py-1 bg-gold-50 border border-gold-200 rounded-full"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={recruiter.avatar_url || ''} />
                    <AvatarFallback className="bg-gold-100 text-gold-700 text-xs">
                      {recruiter.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-charcoal-900">{recruiter.full_name}</span>
                  <button
                    type="button"
                    onClick={() => removeRecruiter(recruiter.id)}
                    className="w-6 h-6 rounded-full hover:bg-gold-200 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-charcoal-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add recruiter */}
          <div className="max-w-lg">
            <Label className="text-charcoal-700 font-medium mb-2 block">Add Recruiter</Label>
            <Select
              value=""
              onValueChange={(v) => {
                if (v && !formData.recruiterIds.includes(v)) {
                  addRecruiter(v)
                }
              }}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select recruiter to add..." />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => !formData.recruiterIds.includes(u.id))
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id} className="py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || ''} />
                          <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-xs">
                            {user.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-charcoal-900">{user.full_name}</p>
                          <p className="text-xs text-charcoal-500">
                            {user.role?.display_name || 'Team Member'}
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      {/* Priority & SLA */}
      <Section icon={Target} title="Priority & SLA" subtitle="Job prioritization and service level">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Priority Rank</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRIORITY_RANKS.map((rank) => (
                <SelectCard
                  key={rank.value}
                  selected={formData.priorityRank === rank.value}
                  onClick={() => setFormData({ priorityRank: rank.value as typeof formData.priorityRank })}
                  className="p-3"
                >
                  <div className="text-center">
                    <span className={`text-lg font-bold ${rank.color}`}>
                      {rank.value === 0 ? '-' : `P${rank.value}`}
                    </span>
                  </div>
                </SelectCard>
              ))}
            </div>
            <p className="text-xs text-charcoal-500">
              P1 = Critical, P2 = High, P3 = Medium, P4 = Low
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-charcoal-400" />
              SLA (Days to Fill)
            </Label>
            <Select
              value={formData.slaDays.toString()}
              onValueChange={(value) => setFormData({ slaDays: parseInt(value) })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="21">21 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="45">45 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-charcoal-500">
              Target time to fill this position
            </p>
          </div>
        </FieldGroup>
      </Section>

      {/* Summary Card */}
      <div className="p-6 bg-gradient-to-br from-gold-50 to-amber-50 border border-gold-200 rounded-xl">
        <h4 className="font-semibold text-charcoal-900 mb-4">Team Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Owner</p>
            <p className="font-medium text-charcoal-900">
              {users.find((u) => u.id === formData.ownerId)?.full_name || 'Not assigned'}
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Recruiters</p>
            <p className="font-medium text-charcoal-900">
              {formData.recruiterIds.length || 'None'} assigned
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Priority</p>
            <p className="font-medium text-charcoal-900">
              {formData.priorityRank === 0
                ? 'Not set'
                : PRIORITY_RANKS.find((r) => r.value === formData.priorityRank)?.label}
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">SLA</p>
            <p className="font-medium text-charcoal-900">{formData.slaDays} days</p>
          </div>
        </div>
      </div>
    </div>
  )
}
