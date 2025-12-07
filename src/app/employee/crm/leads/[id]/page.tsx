'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QualifyLeadDialog, ConvertLeadDialog } from '@/components/crm/leads'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Clock,
  Calendar,
  DollarSign,
  ArrowRight,
  Trash2,
  MessageSquare,
  PhoneCall,
  Send,
  Target,
  UserCheck,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-charcoal-100 text-charcoal-700' },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-800' },
  qualified: { label: 'Qualified', color: 'bg-green-100 text-green-800' },
  unqualified: { label: 'Unqualified', color: 'bg-red-100 text-red-800' },
  nurture: { label: 'Nurture', color: 'bg-amber-100 text-amber-800' },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-800' },
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <PhoneCall className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  linkedin_message: <Send className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [showQualifyDialog, setShowQualifyDialog] = useState(false)
  const [showConvertDialog, setShowConvertDialog] = useState(false)
  const [activityNote, setActivityNote] = useState('')
  const [activityType, setActivityType] = useState<'call' | 'email' | 'linkedin_message' | 'meeting' | 'note'>('note')

  const utils = trpc.useUtils()

  // Fetch lead details
  const leadQuery = trpc.crm.leads.getById.useQuery({ id: params.id })

  // Log activity mutation
  const logActivity = trpc.crm.leads.logActivity.useMutation({
    onSuccess: () => {
      toast.success('Activity logged')
      setActivityNote('')
      utils.crm.leads.getById.invalidate({ id: params.id })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log activity')
    },
  })

  // Delete lead mutation
  const deleteLead = trpc.crm.leads.delete.useMutation({
    onSuccess: () => {
      toast.success('Lead deleted')
      router.push('/employee/crm/leads')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete lead')
    },
  })

  // Listen for dialog events from sidebar quick actions
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = event.detail
      switch (dialogId) {
        case 'qualifyLead':
          setShowQualifyDialog(true)
          break
        case 'convertLead':
          setShowConvertDialog(true)
          break
        case 'logActivity':
          // Activity logging is inline on this page
          break
      }
    }

    window.addEventListener('openLeadDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openLeadDialog', handleOpenDialog as EventListener)
    }
  }, [])

  // Loading handled by layout
  if (leadQuery.isLoading || !leadQuery.data) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const lead = leadQuery.data
  const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new
  const displayName = lead.company_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unknown'
  const bantScore = lead.bant_total_score || 0

  const handleLogActivity = () => {
    if (!activityNote.trim()) return
    logActivity.mutate({
      leadId: params.id,
      activityType,
      description: activityNote,
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this lead?')) {
      deleteLead.mutate({ id: params.id })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quick Contact Bar and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:text-hublot-900">
              <Mail className="w-4 h-4" />
              {lead.email}
            </a>
          )}
          {lead.phone && (
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:text-hublot-900">
              <Phone className="w-4 h-4" />
              {lead.phone}
            </a>
          )}
          {lead.website && (
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-hublot-900">
              <Globe className="w-4 h-4" />
              Website
            </a>
          )}
          {lead.linkedin_url && (
            <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-hublot-900">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          )}
          {lead.source && (
            <Badge variant="outline" className="text-xs">
              {lead.source.replace('_', ' ')}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lead.status !== 'converted' && (
            <>
              <Button variant="outline" onClick={() => setShowQualifyDialog(true)}>
                <Target className="w-4 h-4 mr-2" />
                Qualify
              </Button>
              {lead.status === 'qualified' && (
                <Button onClick={() => setShowConvertDialog(true)}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Convert to Deal
                </Button>
              )}
            </>
          )}
          {lead.status === 'converted' && lead.converted_deal && (
            <Button
              variant="outline"
              onClick={() => router.push(`/employee/crm/deals/${lead.converted_deal.id}`)}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              View Deal
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-red-600" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
            {/* BANT Score Card */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">BANT Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Progress value={bantScore} className="flex-1 h-3" />
                  <span className={cn(
                    'text-2xl font-bold',
                    bantScore >= 75 ? 'text-green-600' :
                    bantScore >= 50 ? 'text-blue-600' :
                    bantScore >= 25 ? 'text-amber-600' : 'text-charcoal-500'
                  )}>
                    {bantScore}/100
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-charcoal-50 rounded-lg">
                    <DollarSign className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                    <div className="text-lg font-semibold">{lead.bant_budget || 0}</div>
                    <div className="text-xs text-charcoal-500">Budget</div>
                  </div>
                  <div className="text-center p-3 bg-charcoal-50 rounded-lg">
                    <UserCheck className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                    <div className="text-lg font-semibold">{lead.bant_authority || 0}</div>
                    <div className="text-xs text-charcoal-500">Authority</div>
                  </div>
                  <div className="text-center p-3 bg-charcoal-50 rounded-lg">
                    <Target className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                    <div className="text-lg font-semibold">{lead.bant_need || 0}</div>
                    <div className="text-xs text-charcoal-500">Need</div>
                  </div>
                  <div className="text-center p-3 bg-charcoal-50 rounded-lg">
                    <Clock className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                    <div className="text-lg font-semibold">{lead.bant_timeline || 0}</div>
                    <div className="text-xs text-charcoal-500">Timeline</div>
                  </div>
                </div>

                {lead.qualification_notes && (
                  <div className="mt-4 p-3 bg-charcoal-50 rounded-lg">
                    <div className="text-sm font-medium text-charcoal-700 mb-1">Qualification Notes</div>
                    <div className="text-sm text-charcoal-600">{lead.qualification_notes}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Log Activity */}
                <div className="mb-6">
                  <div className="flex gap-2 mb-2">
                    <Select value={activityType} onValueChange={(v: any) => setActivityType(v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="linkedin_message">LinkedIn</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Log an activity or note..."
                      value={activityNote}
                      onChange={(e) => setActivityNote(e.target.value)}
                      className="flex-1 min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleLogActivity}
                      disabled={!activityNote.trim() || logActivity.isPending}
                    >
                      Log Activity
                    </Button>
                  </div>
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                  {lead.activities?.map((activity: any) => (
                    <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-0">
                      <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        {ACTIVITY_ICONS[activity.activity_type] || <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{activity.subject || activity.activity_type}</span>
                          {activity.creator && (
                            <span className="text-xs text-charcoal-500">
                              by {activity.creator.full_name}
                            </span>
                          )}
                        </div>
                        {activity.description && (
                          <p className="text-sm text-charcoal-600 mt-1">{activity.description}</p>
                        )}
                        <span className="text-xs text-charcoal-400">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {(!lead.activities || lead.activities.length === 0) && (
                    <p className="text-sm text-charcoal-500 text-center py-4">No activities yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lead.tasks?.length > 0 ? (
                  <div className="space-y-3">
                    {lead.tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          className="rounded"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{task.title}</div>
                          {task.due_date && (
                            <div className="text-xs text-charcoal-500">
                              Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'outline'}>
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal-500 text-center py-4">No tasks</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.first_name && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-charcoal-400" />
                    <span className="text-sm">
                      {lead.first_name} {lead.last_name}
                      {lead.title && <span className="text-charcoal-500"> - {lead.title}</span>}
                    </span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-charcoal-400" />
                    <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-charcoal-400" />
                    <a href={`tel:${lead.phone}`} className="text-sm text-blue-600 hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-charcoal-400" />
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {lead.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-4 h-4 text-charcoal-400" />
                    <a href={lead.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Opportunity Details */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.estimated_value && (
                  <div>
                    <div className="text-xs text-charcoal-500">Estimated Value</div>
                    <div className="text-lg font-semibold">${lead.estimated_value.toLocaleString()}</div>
                  </div>
                )}
                {lead.positions_count && (
                  <div>
                    <div className="text-xs text-charcoal-500">Positions</div>
                    <div className="font-medium">{lead.positions_count}</div>
                  </div>
                )}
                {lead.business_need && (
                  <div>
                    <div className="text-xs text-charcoal-500">Business Need</div>
                    <div className="text-sm">{lead.business_need}</div>
                  </div>
                )}
                {lead.skills_needed?.length > 0 && (
                  <div>
                    <div className="text-xs text-charcoal-500 mb-1">Skills Needed</div>
                    <div className="flex flex-wrap gap-1">
                      {lead.skills_needed.map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner & Dates */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.owner && (
                  <div>
                    <div className="text-xs text-charcoal-500">Owner</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full bg-hublot-100 flex items-center justify-center text-xs font-medium">
                        {lead.owner.full_name?.[0]}
                      </div>
                      <span className="text-sm">{lead.owner.full_name}</span>
                    </div>
                  </div>
                )}
                {lead.created_at && (
                  <div>
                    <div className="text-xs text-charcoal-500">Created</div>
                    <div className="text-sm">{format(new Date(lead.created_at), 'MMM d, yyyy')}</div>
                  </div>
                )}
                {lead.last_contacted_at && (
                  <div>
                    <div className="text-xs text-charcoal-500">Last Contacted</div>
                    <div className="text-sm">{formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}</div>
                  </div>
                )}
                {lead.qualified_at && (
                  <div>
                    <div className="text-xs text-charcoal-500">Qualified</div>
                    <div className="text-sm">{format(new Date(lead.qualified_at), 'MMM d, yyyy')}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Qualify Dialog */}
      <QualifyLeadDialog
        lead={lead}
        open={showQualifyDialog}
        onOpenChange={setShowQualifyDialog}
        onSuccess={() => leadQuery.refetch()}
      />

      {/* Convert Dialog */}
      <ConvertLeadDialog
        lead={lead}
        open={showConvertDialog}
        onOpenChange={setShowConvertDialog}
      />
    </div>
  )
}
