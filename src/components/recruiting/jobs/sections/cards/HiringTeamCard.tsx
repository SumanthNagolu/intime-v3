'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  Loader2,
  UserPlus,
  Crown,
  Building2,
  Mail,
  Pencil,
  Trash2,
  X,
  UserCircle,
  ShieldCheck,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import type { FullJob } from '@/types/job'

interface HiringTeamCardProps {
  job: FullJob
  jobId: string
}

interface JobContact {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  title?: string
  full_name?: string
}

interface JobOwner {
  id: string
  full_name?: string
  avatar_url?: string
  email?: string
}

interface JobWithRelations {
  owner?: JobOwner
  owner_id?: string
  recruiter_ids?: string[]
  client_company_id?: string
  hiringManagerContact?: JobContact
  hrContact?: JobContact
}

const NONE_VALUE = '__none__'

export function HiringTeamCard({ job, jobId }: HiringTeamCardProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const usersQuery = trpc.users.list.useQuery({ status: 'active', pageSize: 100 })
  const users = usersQuery.data?.items || []

  const clientAccountId = job.client_company_id
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId: clientAccountId || '' },
    { enabled: !!clientAccountId }
  )
  const contacts = contactsQuery.data || []

  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Team updated' })
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update', description: error.message, variant: 'error' })
    },
  })

  const [editingField, setEditingField] = useState<string | null>(null)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')
  const [newRecruiterId, setNewRecruiterId] = useState<string>('')
  const [selectedHiringManagerId, setSelectedHiringManagerId] = useState<string>('')
  const [selectedHRContactId, setSelectedHRContactId] = useState<string>('')

  const jobWithRelations = job as unknown as JobWithRelations
  const currentOwner = jobWithRelations?.owner
  const currentRecruiters = jobWithRelations?.recruiter_ids || []
  const currentHiringManager = jobWithRelations?.hiringManagerContact
  const currentHRContact = jobWithRelations?.hrContact

  const recruiterDetails = useMemo(() => {
    const ownerId = job.owner_id
    return currentRecruiters
      .filter((id: string) => id !== ownerId)
      .map((id: string) => users.find(u => u.id === id))
      .filter(Boolean)
  }, [currentRecruiters, users, job.owner_id])

  const getInitials = (name?: string | null) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getContactName = (contact: JobContact | JobOwner | null | undefined) => {
    if (!contact) return 'Unknown'
    if ('full_name' in contact && contact.full_name) return contact.full_name
    if ('first_name' in contact || 'last_name' in contact) {
      const firstName = 'first_name' in contact ? contact.first_name : ''
      const lastName = 'last_name' in contact ? contact.last_name : ''
      return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown'
    }
    return 'Unknown'
  }

  const startEditingOwner = () => {
    setSelectedOwnerId(job.owner_id || '')
    setEditingField('owner')
  }

  const handleSaveOwner = async () => {
    if (!selectedOwnerId) return
    await updateJobMutation.mutateAsync({ id: jobId, ownerId: selectedOwnerId })
    setEditingField(null)
  }

  const handleAddRecruiter = async () => {
    if (!newRecruiterId || currentRecruiters.includes(newRecruiterId)) return
    const updatedRecruiters = [...currentRecruiters, newRecruiterId]
    await updateJobMutation.mutateAsync({ id: jobId, recruiterIds: updatedRecruiters })
    setNewRecruiterId('')
    setEditingField(null)
  }

  const handleRemoveRecruiter = async (recruiterId: string) => {
    const updatedRecruiters = currentRecruiters.filter((id: string) => id !== recruiterId)
    await updateJobMutation.mutateAsync({ id: jobId, recruiterIds: updatedRecruiters })
  }

  const startEditingHiringManager = () => {
    setSelectedHiringManagerId(job.hiring_manager_contact_id || NONE_VALUE)
    setEditingField('hiringManager')
  }

  const handleSaveHiringManager = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      hiringManagerContactId: selectedHiringManagerId === NONE_VALUE ? null : selectedHiringManagerId || null,
    })
    setEditingField(null)
  }

  const startEditingHRContact = () => {
    setSelectedHRContactId(job.hr_contact_id || NONE_VALUE)
    setEditingField('hrContact')
  }

  const handleSaveHRContact = async () => {
    await updateJobMutation.mutateAsync({
      id: jobId,
      hrContactId: selectedHRContactId === NONE_VALUE ? null : selectedHRContactId || null,
    })
    setEditingField(null)
  }

  const internalCount = (currentOwner ? 1 : 0) + recruiterDetails.length
  const clientCount = (currentHiringManager ? 1 : 0) + (currentHRContact ? 1 : 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Internal Team */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-charcoal-500" />
            <span className="text-sm font-medium text-charcoal-700">Internal Team</span>
            <Badge variant="secondary" className="text-xs">{internalCount}</Badge>
          </div>
          {editingField !== 'addRecruiter' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7"
              onClick={() => setEditingField('addRecruiter')}
            >
              <UserPlus className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Add Recruiter Form */}
        {editingField === 'addRecruiter' && (
          <div className="p-3 border rounded-lg bg-charcoal-50 space-y-2">
            <Label className="text-xs">Add Team Member</Label>
            <Select value={newRecruiterId} onValueChange={setNewRecruiterId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select user..." />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(u => u.id !== job.owner_id && !currentRecruiters.includes(u.id))
                  .map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" onClick={handleAddRecruiter} disabled={!newRecruiterId || updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Add
              </Button>
            </div>
          </div>
        )}

        {/* Owner */}
        {editingField === 'owner' ? (
          <div className="p-3 border rounded-lg bg-charcoal-50 space-y-2">
            <Label className="text-xs">Primary Recruiter</Label>
            <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name || user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveOwner} disabled={!selectedOwnerId || updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 border rounded-lg group hover:border-charcoal-300">
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentOwner?.avatar_url} />
              <AvatarFallback className="bg-gold-100 text-gold-700 text-xs">
                {getInitials(currentOwner?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-charcoal-900">
                  {currentOwner?.full_name || 'Not assigned'}
                </span>
                <Badge className="bg-gold-100 text-gold-700 border-gold-200 text-xs">
                  <Crown className="w-3 h-3 mr-1" />
                  Primary
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 opacity-0 group-hover:opacity-100"
              onClick={startEditingOwner}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Additional Recruiters */}
        {recruiterDetails.map((recruiter: (typeof users)[number]) => (
          <div key={recruiter!.id} className="flex items-center gap-3 p-2 border rounded-lg group hover:border-charcoal-300">
            <Avatar className="w-8 h-8">
              <AvatarImage src={recruiter!.avatar_url} />
              <AvatarFallback className="text-xs">{getInitials(recruiter!.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-charcoal-900">
                {recruiter!.full_name || recruiter!.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100"
              onClick={() => handleRemoveRecruiter(recruiter!.id)}
              disabled={updateJobMutation.isPending}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {/* Client Contacts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-charcoal-500" />
          <span className="text-sm font-medium text-charcoal-700">Client Contacts</span>
          <Badge variant="secondary" className="text-xs">{clientCount}</Badge>
        </div>

        {!clientAccountId && (
          <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">Link a client company to select contacts</p>
          </div>
        )}

        {/* Hiring Manager */}
        {editingField === 'hiringManager' ? (
          <div className="p-3 border rounded-lg bg-charcoal-50 space-y-2">
            <Label className="text-xs">Hiring Manager</Label>
            <Select value={selectedHiringManagerId} onValueChange={setSelectedHiringManagerId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {getContactName(contact as JobContact)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveHiringManager} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 border rounded-lg group hover:border-charcoal-300">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <UserCircle className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {currentHiringManager ? (
                  <span className="text-sm font-medium text-charcoal-900">
                    {getContactName(currentHiringManager)}
                  </span>
                ) : (
                  <span className="text-sm text-charcoal-400 italic">No hiring manager</span>
                )}
                <Badge variant="outline" className="text-xs">Hiring Mgr</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 opacity-0 group-hover:opacity-100"
              onClick={startEditingHiringManager}
              disabled={!clientAccountId}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* HR Contact */}
        {editingField === 'hrContact' ? (
          <div className="p-3 border rounded-lg bg-charcoal-50 space-y-2">
            <Label className="text-xs">HR Contact</Label>
            <Select value={selectedHRContactId} onValueChange={setSelectedHRContactId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {getContactName(contact as JobContact)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditingField(null)}>Cancel</Button>
              <Button size="sm" onClick={handleSaveHRContact} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-2 border rounded-lg group hover:border-charcoal-300">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {currentHRContact ? (
                  <span className="text-sm font-medium text-charcoal-900">
                    {getContactName(currentHRContact)}
                  </span>
                ) : (
                  <span className="text-sm text-charcoal-400 italic">No HR contact</span>
                )}
                <Badge variant="outline" className="text-xs">HR</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 opacity-0 group-hover:opacity-100"
              onClick={startEditingHRContact}
              disabled={!clientAccountId}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
