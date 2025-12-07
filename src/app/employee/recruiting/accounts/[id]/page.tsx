'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import {
  Globe,
  Phone,
  MapPin,
  Mail,
  Users,
  Briefcase,
  Calendar,
  Clock,
  Edit,
  MoreHorizontal,
  Plus,
  Star,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogActivityDialog } from '@/components/recruiting/accounts/LogActivityDialog'
import { AddContactDialog } from '@/components/recruiting/accounts/AddContactDialog'
import { CreateMeetingDialog } from '@/components/recruiting/accounts/CreateMeetingDialog'
import { CreateEscalationDialog } from '@/components/recruiting/accounts/CreateEscalationDialog'
import { AddNoteDialog } from '@/components/recruiting/accounts/AddNoteDialog'
import { OnboardingWizardDialog } from '@/components/recruiting/accounts/OnboardingWizardDialog'
import { JobIntakeWizardDialog } from '@/components/recruiting/jobs/JobIntakeWizardDialog'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  prospect: 'bg-blue-100 text-blue-800',
  inactive: 'bg-charcoal-100 text-charcoal-600',
}

const healthColors: Record<string, string> = {
  healthy: 'text-green-600',
  attention: 'text-amber-600',
  at_risk: 'text-red-600',
}

const onboardingStatusColors: Record<string, string> = {
  pending: 'bg-charcoal-100 text-charcoal-600',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
}

export default function AccountDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const accountId = params.id as string

  const [activeTab, setActiveTab] = useState('overview')
  const [logActivityOpen, setLogActivityOpen] = useState(false)
  const [addContactOpen, setAddContactOpen] = useState(false)
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false)
  const [createEscalationOpen, setCreateEscalationOpen] = useState(false)
  const [addNoteOpen, setAddNoteOpen] = useState(false)
  const [onboardingWizardOpen, setOnboardingWizardOpen] = useState(false)
  const [jobIntakeWizardOpen, setJobIntakeWizardOpen] = useState(false)

  // Fetch account details
  const accountQuery = trpc.crm.accounts.getById.useQuery({ id: accountId })

  // Fetch contacts
  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId },
    { enabled: activeTab === 'contacts' || activeTab === 'overview' }
  )

  // Fetch activities
  const activitiesQuery = trpc.crm.activities.listByAccount.useQuery(
    { accountId },
    { enabled: activeTab === 'activities' }
  )

  // Fetch meeting notes
  const meetingsQuery = trpc.crm.meetingNotes.listByAccount.useQuery(
    { accountId },
    { enabled: activeTab === 'meetings' }
  )

  // Fetch escalations
  const escalationsQuery = trpc.crm.escalations.listByAccount.useQuery(
    { accountId },
    { enabled: activeTab === 'escalations' }
  )

  // Fetch notes
  const notesQuery = trpc.crm.notes.listByAccount.useQuery(
    { accountId },
    { enabled: activeTab === 'notes' || activeTab === 'overview' }
  )

  // Status mutation
  const updateStatusMutation = trpc.crm.accounts.updateStatus.useMutation({
    onSuccess: () => {
      accountQuery.refetch()
      toast({ title: 'Status updated successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'error' })
    },
  })

  const account = accountQuery.data
  const contacts = contactsQuery.data || []
  const activities = activitiesQuery.data || []
  const meetings = meetingsQuery.data || []
  const escalations = escalationsQuery.data || []
  const notes = notesQuery.data || []

  // Listen for dialog events from sidebar quick actions
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = event.detail
      switch (dialogId) {
        case 'addContact':
          setAddContactOpen(true)
          break
        case 'jobIntake':
          setJobIntakeWizardOpen(true)
          break
        case 'logActivity':
          setLogActivityOpen(true)
          break
      }
    }

    window.addEventListener('openAccountDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openAccountDialog', handleOpenDialog as EventListener)
    }
  }, [])

  // Loading handled by layout
  if (accountQuery.isLoading || !account) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy':
        return <TrendingUp className="w-4 h-4" />
      case 'attention':
        return <Minus className="w-4 h-4" />
      case 'at_risk':
        return <TrendingDown className="w-4 h-4" />
      default:
        return null
    }
  }

  const primaryContact = contacts.find((c: any) => c.is_primary)
  const recentJobs = account.jobs?.slice(0, 5) || []
  const openEscalations = escalations.filter((e: any) => e.status === 'open' || e.status === 'in_progress')

  return (
    <div className="p-6 space-y-6">
      {/* Header with quick contact info and actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          {account.website && (
            <a href={account.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-hublot-900">
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {account.phone && (
            <a href={`tel:${account.phone}`} className="flex items-center gap-1 hover:text-hublot-900">
              <Phone className="w-4 h-4" />
              {account.phone}
            </a>
          )}
          {account.city && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {account.city}{account.state ? `, ${account.state}` : ''}
            </span>
          )}
          {account.tier && (
            <Badge variant="outline" className="border-gold-500 text-gold-600">
              <Star className="w-3 h-3 mr-1" />
              {account.tier}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setLogActivityOpen(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Log Activity
          </Button>
          <Button onClick={() => setCreateMeetingOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Meeting
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/employee/recruiting/accounts/${accountId}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddContactOpen(true)}>
                <Users className="w-4 h-4 mr-2" />
                Add Contact
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAddNoteOpen(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setJobIntakeWizardOpen(true)}>
                <Briefcase className="w-4 h-4 mr-2" />
                Take Job Requisition
              </DropdownMenuItem>
              {!account?.onboarding_completed_at && (
                <DropdownMenuItem onClick={() => setOnboardingWizardOpen(true)}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Onboarding
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCreateEscalationOpen(true)} className="text-red-600">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Create Escalation
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {account.status === 'active' ? (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: accountId, status: 'inactive' })}
                >
                  Mark as Inactive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => updateStatusMutation.mutate({ id: accountId, status: 'active' })}
                >
                  Mark as Active
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Alert Banner for Escalations */}
      {openEscalations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div className="flex-1">
            <span className="font-medium text-red-800">
              {openEscalations.length} open escalation{openEscalations.length > 1 ? 's' : ''}
            </span>
            <span className="text-red-600 ml-2">
              Highest severity: {openEscalations.sort((a: any, b: any) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3 }
                return (order[a.severity as keyof typeof order] || 4) - (order[b.severity as keyof typeof order] || 4)
              })[0]?.severity}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-100"
            onClick={() => setActiveTab('escalations')}
          >
            View Escalations
          </Button>
        </div>
      )}

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="meetings">Meetings ({meetings.length})</TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="escalations" className={openEscalations.length > 0 ? 'text-red-600' : ''}>
            Escalations {openEscalations.length > 0 && `(${openEscalations.length})`}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Account Info */}
            <div className="col-span-2 space-y-6">
              {/* Company Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {account.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-charcoal-400" />
                        <a
                          href={account.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hublot-600 hover:underline"
                        >
                          {account.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    {account.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-charcoal-400" />
                        <span>{account.phone}</span>
                      </div>
                    )}
                    {(account.city || account.headquarters_location) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-charcoal-400" />
                        <span>{account.headquarters_location || `${account.city}, ${account.state}`}</span>
                      </div>
                    )}
                    {account.linkedin_url && (
                      <div className="flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-charcoal-400" />
                        <a
                          href={account.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hublot-600 hover:underline"
                        >
                          LinkedIn
                        </a>
                      </div>
                    )}
                  </div>
                  {account.description && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-charcoal-600">{account.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Primary Contact */}
              {primaryContact && (
                <Card>
                  <CardHeader>
                    <CardTitle>Primary Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-hublot-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-hublot-700">
                          {primaryContact.first_name?.[0]}{primaryContact.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-charcoal-900">
                          {primaryContact.first_name} {primaryContact.last_name}
                        </p>
                        <p className="text-sm text-charcoal-500">{primaryContact.title}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          {primaryContact.email && (
                            <a href={`mailto:${primaryContact.email}`} className="flex items-center gap-1 text-hublot-600 hover:underline">
                              <Mail className="w-3 h-3" />
                              {primaryContact.email}
                            </a>
                          )}
                          {primaryContact.phone && (
                            <span className="flex items-center gap-1 text-charcoal-600">
                              <Phone className="w-3 h-3" />
                              {primaryContact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Jobs */}
              {recentJobs.length > 0 && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Active Jobs</CardTitle>
                    <Link href={`/employee/recruiting/jobs?account=${accountId}`}>
                      <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentJobs.map((job: any) => (
                        <Link
                          key={job.id}
                          href={`/employee/recruiting/jobs/${job.id}`}
                          className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-charcoal-400" />
                            <span className="font-medium">{job.title}</span>
                          </div>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Stats & Quick Info */}
            <div className="space-y-6">
              {/* Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn('flex items-center gap-2', healthColors[account.relationship_health || 'healthy'])}>
                      {getHealthIcon(account.relationship_health || 'healthy')}
                      <span className="text-2xl font-bold capitalize">{account.relationship_health || 'Healthy'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">NPS Score</span>
                      <span className="font-medium">{account.nps_score ?? 'Not set'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Last Contact</span>
                      <span className="font-medium">
                        {account.last_contact_date
                          ? formatDistanceToNow(new Date(account.last_contact_date), { addSuffix: true })
                          : 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-500">Active Jobs</span>
                      <span className="font-medium">
                        {account.jobs?.filter((j: any) => j.status === 'active').length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Onboarding Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Onboarding Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn(onboardingStatusColors[account.onboarding_status || 'pending'])}>
                      {account.onboarding_status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {(account.onboarding_status || 'pending').replace('_', ' ')}
                    </Badge>
                  </div>
                  {account.onboarding_completed_at ? (
                    <p className="text-sm text-charcoal-500">
                      Completed {format(new Date(account.onboarding_completed_at), 'MMM d, yyyy')}
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setOnboardingWizardOpen(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Start Onboarding
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Billing Info Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Frequency</span>
                    <span className="capitalize">{account.billing_frequency || 'Monthly'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Payment Terms</span>
                    <span>{account.payment_terms_days || 30} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">PO Required</span>
                    <span>{account.po_required ? 'Yes' : 'No'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Communication */}
              <Card>
                <CardHeader>
                  <CardTitle>Communication</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Preferred Method</span>
                    <span className="capitalize">{account.preferred_contact_method || 'Email'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Meeting Cadence</span>
                    <span className="capitalize">{account.meeting_cadence || 'Weekly'}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>People associated with this account</CardDescription>
              </div>
              <Button onClick={() => setAddContactOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </CardHeader>
            <CardContent>
              {contactsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No contacts yet</p>
                  <Button className="mt-4" onClick={() => setAddContactOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Contact
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="p-4 border rounded-lg hover:border-hublot-300 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                          <span className="font-medium text-hublot-700">
                            {contact.first_name?.[0]}{contact.last_name?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-charcoal-900 truncate">
                              {contact.first_name} {contact.last_name}
                            </p>
                            {contact.is_primary && (
                              <Badge variant="outline" className="text-xs">Primary</Badge>
                            )}
                          </div>
                          <p className="text-sm text-charcoal-500 truncate">{contact.title}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-500">
                            {contact.email && (
                              <a href={`mailto:${contact.email}`} className="hover:text-hublot-600">
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && <span>{contact.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Track all interactions with this account</CardDescription>
              </div>
              <Button onClick={() => setLogActivityOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Activity
              </Button>
            </CardHeader>
            <CardContent>
              {activitiesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No activities logged yet</p>
                  <Button className="mt-4" onClick={() => setLogActivityOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log First Activity
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        {activity.activity_type === 'call' && <Phone className="w-4 h-4" />}
                        {activity.activity_type === 'email' && <Mail className="w-4 h-4" />}
                        {activity.activity_type === 'meeting' && <Calendar className="w-4 h-4" />}
                        {activity.activity_type === 'note' && <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium capitalize">{activity.activity_type}</p>
                          <span className="text-sm text-charcoal-500">
                            {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {activity.subject && <p className="font-medium mt-1">{activity.subject}</p>}
                        {activity.description && (
                          <p className="text-sm text-charcoal-600 mt-1">{activity.description}</p>
                        )}
                        {activity.outcome && (
                          <Badge variant="outline" className="mt-2 capitalize">{activity.outcome}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>Scheduled and completed meetings</CardDescription>
              </div>
              <Button onClick={() => setCreateMeetingOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardHeader>
            <CardContent>
              {meetingsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No meetings scheduled</p>
                  <Button className="mt-4" onClick={() => setCreateMeetingOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Meeting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting: any) => (
                    <div key={meeting.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{meeting.title}</p>
                          <p className="text-sm text-charcoal-500 capitalize">
                            {meeting.meeting_type.replace('_', ' ')}
                          </p>
                          {meeting.scheduled_at && (
                            <p className="text-sm text-charcoal-600 mt-1">
                              {format(new Date(meeting.scheduled_at), 'PPP p')}
                            </p>
                          )}
                        </div>
                        <Badge variant={meeting.status === 'completed' ? 'default' : 'secondary'}>
                          {meeting.status}
                        </Badge>
                      </div>
                      {meeting.discussion_notes && (
                        <p className="text-sm text-charcoal-600 mt-3 line-clamp-2">
                          {meeting.discussion_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Internal notes about this account</CardDescription>
              </div>
              <Button onClick={() => setAddNoteOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            </CardHeader>
            <CardContent>
              {notesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No notes yet</p>
                  <Button className="mt-4" onClick={() => setAddNoteOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Note
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note: any) => (
                    <div
                      key={note.id}
                      className={cn(
                        'p-4 border rounded-lg',
                        note.is_pinned && 'border-gold-300 bg-gold-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          {note.title && <p className="font-medium">{note.title}</p>}
                          <p className="text-sm text-charcoal-600 whitespace-pre-wrap">{note.content}</p>
                        </div>
                        {note.is_pinned && <Star className="w-4 h-4 text-gold-500 fill-gold-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-500">
                        <span>{note.author?.full_name}</span>
                        <span>&bull;</span>
                        <span>{formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Escalations Tab */}
        <TabsContent value="escalations" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Escalations</CardTitle>
                <CardDescription>Track and resolve client issues</CardDescription>
              </div>
              <Button onClick={() => setCreateEscalationOpen(true)} variant="destructive">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Create Escalation
              </Button>
            </CardHeader>
            <CardContent>
              {escalationsQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : escalations.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                  <p className="text-charcoal-500">No escalations - great job!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {escalations.map((escalation: any) => (
                    <Link
                      key={escalation.id}
                      href={`/employee/recruiting/escalations/${escalation.id}`}
                      className="block p-4 border rounded-lg hover:border-charcoal-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-charcoal-500">{escalation.escalation_number}</span>
                            <Badge
                              variant={
                                escalation.severity === 'critical' ? 'destructive' :
                                escalation.severity === 'high' ? 'default' :
                                'secondary'
                              }
                            >
                              {escalation.severity}
                            </Badge>
                          </div>
                          <p className="font-medium mt-1">{escalation.issue_summary}</p>
                          <p className="text-sm text-charcoal-500 capitalize mt-1">
                            {escalation.escalation_type.replace('_', ' ')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            escalation.status === 'resolved' || escalation.status === 'closed' ? 'outline' :
                            escalation.status === 'in_progress' ? 'default' :
                            'secondary'
                          }
                        >
                          {escalation.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-charcoal-500">
                        <span>Created by {escalation.creator?.full_name}</span>
                        <span>&bull;</span>
                        <span>{formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true })}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LogActivityDialog
        open={logActivityOpen}
        onOpenChange={setLogActivityOpen}
        accountId={accountId}
      />
      <AddContactDialog
        open={addContactOpen}
        onOpenChange={setAddContactOpen}
        accountId={accountId}
      />
      <CreateMeetingDialog
        open={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen}
        accountId={accountId}
      />
      <CreateEscalationDialog
        open={createEscalationOpen}
        onOpenChange={setCreateEscalationOpen}
        accountId={accountId}
      />
      <AddNoteDialog
        open={addNoteOpen}
        onOpenChange={setAddNoteOpen}
        accountId={accountId}
      />
      <OnboardingWizardDialog
        open={onboardingWizardOpen}
        onOpenChange={setOnboardingWizardOpen}
        accountId={accountId}
        accountName={account?.name}
        existingContacts={contacts}
      />
      <JobIntakeWizardDialog
        open={jobIntakeWizardOpen}
        onOpenChange={setJobIntakeWizardOpen}
        accountId={accountId}
        accountName={account?.name}
      />
    </div>
  )
}
