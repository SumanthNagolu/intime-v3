'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Briefcase,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  X,
  UserCircle,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface JobHiringTeamSectionProps {
  jobId: string
}

// Types for joined contact data from job query
interface JobContact {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  title?: string
  full_name?: string
}

// Type for user/owner from job query
interface JobOwner {
  id: string
  full_name?: string
  avatar_url?: string
  email?: string
}

// Extended job type with joined relations
interface JobWithRelations {
  owner?: JobOwner
  owner_id?: string
  recruiter_ids?: string[]
  client_company_id?: string
  hiringManagerContact?: JobContact
  hrContact?: JobContact
}

// Role definitions for internal team
const INTERNAL_ROLES = [
  { value: 'primary_recruiter', label: 'Primary Recruiter', icon: Crown, isPrimary: true },
  { value: 'recruiter', label: 'Recruiter', icon: Users },
  { value: 'sourcer', label: 'Sourcer', icon: Target },
  { value: 'account_manager', label: 'Account Manager', icon: Briefcase },
] as const

// Role definitions for client contacts
const CLIENT_ROLES = [
  { value: 'hiring_manager', label: 'Hiring Manager', icon: UserCircle },
  { value: 'hr_contact', label: 'HR Contact', icon: ShieldCheck },
  { value: 'technical_interviewer', label: 'Technical Interviewer', icon: Users },
  { value: 'decision_maker', label: 'Decision Maker', icon: Crown },
] as const

export function JobHiringTeamSection({ jobId }: JobHiringTeamSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Fetch job data
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const job = jobQuery.data

  // Fetch users list (for recruiter selection)
  const usersQuery = trpc.users.list.useQuery({
    status: 'active',
    pageSize: 100,
  })
  const users = usersQuery.data?.items || []

  // Fetch contacts for client team (if we have an account)
  const clientAccountId = job?.client_company_id
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId: clientAccountId || '' },
    { enabled: !!clientAccountId }
  )
  const contacts = contactsQuery.data || []

  // Update job mutation
  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Team updated successfully' })
      utils.ats.jobs.getById.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update team', description: error.message, variant: 'error' })
    },
  })

  // UI State
  const [isEditingOwner, setIsEditingOwner] = useState(false)
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('')
  const [isEditingRecruiters, setIsEditingRecruiters] = useState(false)
  const [selectedRecruiterIds, setSelectedRecruiterIds] = useState<string[]>([])
  const [isAddingRecruiter, setIsAddingRecruiter] = useState(false)
  const [newRecruiterId, setNewRecruiterId] = useState<string>('')

  const [isEditingHiringManager, setIsEditingHiringManager] = useState(false)
  const [selectedHiringManagerId, setSelectedHiringManagerId] = useState<string>('')
  const [isEditingHRContact, setIsEditingHRContact] = useState(false)
  const [selectedHRContactId, setSelectedHRContactId] = useState<string>('')

  // Get current team data (API returns camelCase: hiringManagerContact, hrContact)
  // Cast once here to get proper typing for joined relations
  const jobWithRelations = job as unknown as JobWithRelations | undefined
  const currentOwner = jobWithRelations?.owner
  const currentRecruiters = jobWithRelations?.recruiter_ids || []
  const currentHiringManager = jobWithRelations?.hiringManagerContact
  const currentHRContact = jobWithRelations?.hrContact

  // Get recruiter details from IDs (filter out owner to avoid duplicates)
  const recruiterDetails = useMemo(() => {
    const ownerId = job?.owner_id
    return currentRecruiters
      .filter((id: string) => id !== ownerId) // Don't show owner twice
      .map((id: string) => users.find(u => u.id === id))
      .filter(Boolean)
  }, [currentRecruiters, users, job?.owner_id])

  // Handlers for owner
  const startEditingOwner = () => {
    setSelectedOwnerId(job?.owner_id || '')
    setIsEditingOwner(true)
  }

  const handleSaveOwner = async () => {
    if (!selectedOwnerId) return
    await updateJobMutation.mutateAsync({
      jobId,
      ownerId: selectedOwnerId,
    })
    setIsEditingOwner(false)
  }

  const cancelEditOwner = () => {
    setIsEditingOwner(false)
    setSelectedOwnerId('')
  }

  // Handlers for recruiters
  const handleAddRecruiter = async () => {
    if (!newRecruiterId || currentRecruiters.includes(newRecruiterId)) return
    const updatedRecruiters = [...currentRecruiters, newRecruiterId]
    await updateJobMutation.mutateAsync({
      jobId,
      recruiterIds: updatedRecruiters,
    })
    setNewRecruiterId('')
    setIsAddingRecruiter(false)
  }

  const handleRemoveRecruiter = async (recruiterId: string) => {
    const updatedRecruiters = currentRecruiters.filter((id: string) => id !== recruiterId)
    await updateJobMutation.mutateAsync({
      jobId,
      recruiterIds: updatedRecruiters,
    })
  }

  // Special value for "None" option in Select (Radix UI doesn't handle empty strings well)
  const NONE_VALUE = '__none__'

  // Handlers for client contacts
  const startEditingHiringManager = () => {
    setSelectedHiringManagerId(job?.hiring_manager_contact_id || NONE_VALUE)
    setIsEditingHiringManager(true)
  }

  const handleSaveHiringManager = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      hiringManagerContactId: selectedHiringManagerId === NONE_VALUE ? null : selectedHiringManagerId || null,
    })
    setIsEditingHiringManager(false)
  }

  const cancelEditHiringManager = () => {
    setIsEditingHiringManager(false)
    setSelectedHiringManagerId('')
  }

  const startEditingHRContact = () => {
    setSelectedHRContactId(job?.hr_contact_id || NONE_VALUE)
    setIsEditingHRContact(true)
  }

  const handleSaveHRContact = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      hrContactId: selectedHRContactId === NONE_VALUE ? null : selectedHRContactId || null,
    })
    setIsEditingHRContact(false)
  }

  const cancelEditHRContact = () => {
    setIsEditingHRContact(false)
    setSelectedHRContactId('')
  }

  // Remove hiring manager
  const handleRemoveHiringManager = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      hiringManagerContactId: null,
    })
  }

  // Remove HR contact
  const handleRemoveHRContact = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      hrContactId: null,
    })
  }

  // Get initials from name
  const getInitials = (name?: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get contact display name
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

  // Count team members
  const internalTeamCount = (currentOwner ? 1 : 0) + recruiterDetails.length
  const clientTeamCount = (currentHiringManager ? 1 : 0) + (currentHRContact ? 1 : 0)
  const totalTeamCount = internalTeamCount + clientTeamCount

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900">Hiring Team</h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Internal recruiters and client stakeholders for this job
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalTeamCount} team member{totalTeamCount !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Internal Team */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5" />
              Internal Team
            </CardTitle>
            <CardDescription>Recruiters and staff working on this job</CardDescription>
          </div>
          {!isAddingRecruiter && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAddingRecruiter(true)}
              disabled={usersQuery.isLoading}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Recruiter
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {jobQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Add Recruiter Form */}
              {isAddingRecruiter && (
                <div className="p-4 border-2 border-dashed border-hublot-200 rounded-lg bg-hublot-50/30 space-y-3">
                  <Label>Select Team Member</Label>
                  <Select value={newRecruiterId} onValueChange={setNewRecruiterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to add..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(u => 
                          u.id !== job?.owner_id && 
                          !currentRecruiters.includes(u.id)
                        )
                        .map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(user.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.full_name || user.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setIsAddingRecruiter(false)
                        setNewRecruiterId('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddRecruiter}
                      disabled={!newRecruiterId || updateJobMutation.isPending}
                    >
                      {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Add to Team
                    </Button>
                  </div>
                </div>
              )}

              {/* Job Owner (Primary Recruiter) */}
              <div className="group">
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-charcoal-300 transition-colors">
                  {isEditingOwner ? (
                    <div className="flex-1 space-y-3">
                      <Label>Primary Recruiter / Job Owner</Label>
                      <Select value={selectedOwnerId} onValueChange={setSelectedOwnerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job owner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarImage src={user.avatar_url} />
                                  <AvatarFallback className="text-xs">
                                    {getInitials(user.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.full_name || user.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEditOwner}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveOwner}
                          disabled={!selectedOwnerId || updateJobMutation.isPending}
                        >
                          {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={currentOwner?.avatar_url} />
                        <AvatarFallback className="bg-gold-100 text-gold-700">
                          {getInitials(currentOwner?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal-900">
                            {currentOwner?.full_name || 'Not assigned'}
                          </p>
                          <Badge className="bg-gold-100 text-gold-700 border-gold-200">
                            <Crown className="w-3 h-3 mr-1" />
                            Primary
                          </Badge>
                        </div>
                        <p className="text-sm text-charcoal-500">Primary Recruiter</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentOwner?.email && (
                          <a
                            href={`mailto:${currentOwner.email}`}
                            className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                            title={currentOwner.email}
                          >
                            <Mail className="w-4 h-4 text-charcoal-500" />
                          </a>
                        )}
                        <Button variant="ghost" size="sm" onClick={startEditingOwner}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Recruiters */}
              {recruiterDetails.map((recruiter: (typeof users)[number]) => (
                <div key={recruiter!.id} className="group">
                  <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-charcoal-300 transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={recruiter!.avatar_url} />
                      <AvatarFallback>
                        {getInitials(recruiter!.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900">
                        {recruiter!.full_name || recruiter!.email}
                      </p>
                      <p className="text-sm text-charcoal-500">Recruiter</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {recruiter!.email && (
                        <a
                          href={`mailto:${recruiter!.email}`}
                          className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                          title={recruiter!.email}
                        >
                          <Mail className="w-4 h-4 text-charcoal-500" />
                        </a>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveRecruiter(recruiter!.id)}
                        disabled={updateJobMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty state for recruiters */}
              {!currentOwner && recruiterDetails.length === 0 && !isAddingRecruiter && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No internal team assigned</p>
                  <p className="text-sm text-charcoal-400 mt-1">
                    Add recruiters to work on this job
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Client Team */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-5 h-5" />
            Client Contacts
          </CardTitle>
          <CardDescription>
            Hiring manager and stakeholders from the client
            {!clientAccountId && (
              <span className="text-amber-600 ml-2">
                (Link a client company to select contacts)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobQuery.isLoading || contactsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {/* Hiring Manager */}
              <div className="group">
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-charcoal-300 transition-colors">
                  {isEditingHiringManager ? (
                    <div className="flex-1 space-y-3">
                      <Label>Hiring Manager</Label>
                      <Select value={selectedHiringManagerId} onValueChange={setSelectedHiringManagerId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hiring manager..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>
                            <span className="text-charcoal-500">None</span>
                          </SelectItem>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              <div className="flex items-center gap-2">
                                <span>{getContactName(contact as JobContact)}</span>
                                {(contact as { title?: string }).title && (
                                  <span className="text-charcoal-400 text-sm">
                                    • {(contact as { title?: string }).title}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEditHiringManager}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveHiringManager}
                          disabled={updateJobMutation.isPending}
                        >
                          {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : currentHiringManager ? (
                    <>
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-purple-100 text-purple-700">
                          {getInitials(getContactName(currentHiringManager))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal-900">
                            {getContactName(currentHiringManager)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <UserCircle className="w-3 h-3 mr-1" />
                            Hiring Manager
                          </Badge>
                        </div>
                        {currentHiringManager?.title && (
                          <p className="text-sm text-charcoal-500">
                            {currentHiringManager.title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentHiringManager?.email && (
                          <a
                            href={`mailto:${currentHiringManager.email}`}
                            className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                            title={currentHiringManager.email}
                          >
                            <Mail className="w-4 h-4 text-charcoal-500" />
                          </a>
                        )}
                        {currentHiringManager?.phone && (
                          <a
                            href={`tel:${currentHiringManager.phone}`}
                            className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                            title={currentHiringManager.phone}
                          >
                            <Phone className="w-4 h-4 text-charcoal-500" />
                          </a>
                        )}
                        <Link
                          href={`/employee/contacts/${currentHiringManager.id}`}
                          className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                          title="View contact"
                        >
                          <ExternalLink className="w-4 h-4 text-charcoal-500" />
                        </Link>
                        <Button variant="ghost" size="sm" onClick={startEditingHiringManager}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleRemoveHiringManager}
                          disabled={updateJobMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                        <UserCircle className="w-6 h-6 text-charcoal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-charcoal-500">No hiring manager assigned</p>
                        <p className="text-sm text-charcoal-400">
                          The primary decision maker for this role
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={startEditingHiringManager}
                        disabled={!clientAccountId}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* HR Contact */}
              <div className="group">
                <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-charcoal-300 transition-colors">
                  {isEditingHRContact ? (
                    <div className="flex-1 space-y-3">
                      <Label>HR Contact</Label>
                      <Select value={selectedHRContactId} onValueChange={setSelectedHRContactId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select HR contact..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NONE_VALUE}>
                            <span className="text-charcoal-500">None</span>
                          </SelectItem>
                          {contacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              <div className="flex items-center gap-2">
                                <span>{getContactName(contact as JobContact)}</span>
                                {(contact as { title?: string }).title && (
                                  <span className="text-charcoal-400 text-sm">
                                    • {(contact as { title?: string }).title}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={cancelEditHRContact}>
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveHRContact}
                          disabled={updateJobMutation.isPending}
                        >
                          {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : currentHRContact ? (
                    <>
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {getInitials(getContactName(currentHRContact))}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal-900">
                            {getContactName(currentHRContact)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            HR Contact
                          </Badge>
                        </div>
                        {currentHRContact?.title && (
                          <p className="text-sm text-charcoal-500">
                            {currentHRContact.title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {currentHRContact?.email && (
                          <a
                            href={`mailto:${currentHRContact.email}`}
                            className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                            title={currentHRContact.email}
                          >
                            <Mail className="w-4 h-4 text-charcoal-500" />
                          </a>
                        )}
                        {currentHRContact?.phone && (
                          <a
                            href={`tel:${currentHRContact.phone}`}
                            className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                            title={currentHRContact.phone}
                          >
                            <Phone className="w-4 h-4 text-charcoal-500" />
                          </a>
                        )}
                        <Link
                          href={`/employee/contacts/${currentHRContact.id}`}
                          className="p-2 rounded-lg hover:bg-charcoal-100 transition-colors"
                          title="View contact"
                        >
                          <ExternalLink className="w-4 h-4 text-charcoal-500" />
                        </Link>
                        <Button variant="ghost" size="sm" onClick={startEditingHRContact}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={handleRemoveHRContact}
                          disabled={updateJobMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-charcoal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-charcoal-500">No HR contact assigned</p>
                        <p className="text-sm text-charcoal-400">
                          For onboarding, compliance, and paperwork
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={startEditingHRContact}
                        disabled={!clientAccountId}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Assign
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* No client company linked */}
              {!clientAccountId && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Tip:</strong> Link a client company in the{' '}
                    <Link 
                      href={`/employee/recruiting/jobs/${jobId}?section=client-details`}
                      className="underline hover:text-amber-900"
                    >
                      Client Details
                    </Link>
                    {' '}section to select contacts for this job.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-charcoal-50 border-charcoal-200">
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm text-charcoal-600">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {internalTeamCount} internal
              </span>
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {clientTeamCount} client
              </span>
            </div>
            <span>Total: {totalTeamCount} team member{totalTeamCount !== 1 ? 's' : ''}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
