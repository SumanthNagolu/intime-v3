'use client'

import { useCreateAccountStore } from '@/stores/create-account-store'
import { Section, FieldGroup } from './shared'
import { Users, User, Shield, Briefcase, Star } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { trpc } from '@/lib/trpc/client'

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
  placeholder = "Select user",
  users,
  isLoading
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  users: UserOption[]
  isLoading: boolean
}) {
  const selectedUser = users.find(u => u.id === value)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-14 rounded-xl border-charcoal-200 bg-white">
        <SelectValue placeholder={isLoading ? "Loading users..." : placeholder}>
          {selectedUser && (
             <div className="flex items-center gap-3">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={selectedUser.avatar_url || ''} />
                 <AvatarFallback className="bg-gold-100 text-gold-700 text-xs">
                   {selectedUser.full_name.split(' ').map(n => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
               <div className="text-left">
                 <p className="text-sm font-medium text-charcoal-900">{selectedUser.full_name}</p>
                 <p className="text-xs text-charcoal-500">{selectedUser.role?.display_name || 'Team Member'}</p>
               </div>
             </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {users.map(user => (
          <SelectItem key={user.id} value={user.id} className="py-2">
             <div className="flex items-center gap-3">
               <Avatar className="h-8 w-8">
                 <AvatarImage src={user.avatar_url || ''} />
                 <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-xs">
                   {user.full_name.split(' ').map(n => n[0]).join('')}
                 </AvatarFallback>
               </Avatar>
               <div>
                 <p className="text-sm font-medium text-charcoal-900">{user.full_name}</p>
                 <p className="text-xs text-charcoal-500">{user.role?.display_name || 'Team Member'}</p>
               </div>
             </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AccountIntakeStep8Team() {
  const { formData, setFormData } = useCreateAccountStore()
  const { team } = formData

  // Fetch users from API
  const { data: usersData, isLoading } = trpc.users.list.useQuery({
    status: 'active',
    pageSize: 100,
  })

  const users: UserOption[] = usersData?.items ?? []

  const updateTeam = (field: keyof typeof team, value: string) => {
    setFormData({
      team: {
        ...team,
        [field]: value
      }
    })
  }

  return (
    <div className="space-y-10">
      <Section
        icon={Users}
        title="Internal Team Assignment"
        subtitle="Assign roles and responsibilities"
      >
        <div className="grid grid-cols-1 gap-6">
           <div className="space-y-2">
             <Label className="flex items-center gap-2">
               <Shield className="w-4 h-4 text-gold-500" />
               Account Owner <span className="text-red-500">*</span>
             </Label>
             <UserSelect
               value={team.ownerId}
               onChange={(v) => updateTeam('ownerId', v)}
               placeholder="Select Account Owner"
               users={users}
               isLoading={isLoading}
             />
             <p className="text-xs text-charcoal-500">Primary owner of the account relationship.</p>
           </div>

           <FieldGroup cols={2}>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-charcoal-500" />
                  Account Manager
                </Label>
                <UserSelect
                  value={team.accountManagerId}
                  onChange={(v) => updateTeam('accountManagerId', v)}
                  placeholder="Select Account Manager"
                  users={users}
                  isLoading={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-charcoal-500" />
                  Sales Lead
                </Label>
                <UserSelect
                  value={team.salesLeadId}
                  onChange={(v) => updateTeam('salesLeadId', v)}
                  placeholder="Select Sales Lead"
                  users={users}
                  isLoading={isLoading}
                />
              </div>
           </FieldGroup>

           <div className="space-y-2">
             <Label className="flex items-center gap-2">
               <User className="w-4 h-4 text-charcoal-500" />
               Primary Recruiter
             </Label>
             <UserSelect
               value={team.recruiterId}
               onChange={(v) => updateTeam('recruiterId', v)}
               placeholder="Select Primary Recruiter"
               users={users}
               isLoading={isLoading}
             />
             <p className="text-xs text-charcoal-500">Default recruiter assigned to new requisitions.</p>
           </div>
        </div>
      </Section>
    </div>
  )
}

