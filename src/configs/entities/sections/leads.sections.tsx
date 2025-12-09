'use client'

/**
 * PCF-Compatible Section Adapters for Leads
 *
 * These wrapper components adapt the existing Lead section components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import { Lead, LEAD_SOURCE_CONFIG } from '../leads.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ActivitiesSection } from '@/components/pcf/sections/ActivitiesSection'
import { NotesSection } from '@/components/pcf/sections/NotesSection'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  Linkedin,
  DollarSign,
  Clock,
  Target,
  UserCheck,
  ClipboardList,
  Calendar,
  PhoneCall,
  Send,
  MessageSquare,
  CheckCircle2,
  Briefcase,
} from 'lucide-react'

/**
 * Dispatch a dialog open event for the Lead entity
 * The detail page listens for this and manages dialog state
 */
function dispatchLeadDialog(dialogId: string, leadId: string) {
  window.dispatchEvent(
    new CustomEvent('openLeadDialog', {
      detail: { dialogId, leadId },
    })
  )
}

// ==========================================
// PCF Section Adapters
// ==========================================

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section Adapter
 * Shows contact info, company details, and opportunity information
 */
export function LeadOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const lead = entity as Lead | undefined

  if (!lead) return null

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="col-span-2 space-y-6">
        {/* Contact Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {lead.first_name && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-charcoal-400 mt-1" />
                <div>
                  <div className="text-xs text-charcoal-500">Contact Name</div>
                  <div className="font-medium">
                    {lead.first_name} {lead.last_name}
                  </div>
                  {lead.title && (
                    <div className="text-sm text-charcoal-500">{lead.title}</div>
                  )}
                </div>
              </div>
            )}
            {lead.company_name && (
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-charcoal-400 mt-1" />
                <div>
                  <div className="text-xs text-charcoal-500">Company</div>
                  <div className="font-medium">{lead.company_name}</div>
                  {lead.industry && (
                    <div className="text-sm text-charcoal-500">{lead.industry}</div>
                  )}
                </div>
              </div>
            )}
            {lead.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-charcoal-400 mt-1" />
                <div>
                  <div className="text-xs text-charcoal-500">Email</div>
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-charcoal-400 mt-1" />
                <div>
                  <div className="text-xs text-charcoal-500">Phone</div>
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.phone}
                  </a>
                </div>
              </div>
            )}
            {(lead as any).website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-charcoal-400 mt-1" />
                <div>
                  <div className="text-xs text-charcoal-500">Website</div>
                  <a
                    href={(lead as any).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
            )}
            {(lead as any).linkedin_url && (
              <div className="flex items-start gap-3">
                <Linkedin className="w-4 h-4 text-charcoal-400 mt-1" />
                <div>
                  <div className="text-xs text-charcoal-500">LinkedIn</div>
                  <a
                    href={(lead as any).linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Profile
                  </a>
                </div>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                <DollarSign className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                <div className="text-xl font-bold text-charcoal-900">
                  {lead.estimated_value
                    ? `$${lead.estimated_value.toLocaleString()}`
                    : '—'}
                </div>
                <div className="text-xs text-charcoal-500">Estimated Value</div>
              </div>
              <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                <Briefcase className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                <div className="text-xl font-bold text-charcoal-900">
                  {lead.positions_count || '—'}
                </div>
                <div className="text-xs text-charcoal-500">Positions</div>
              </div>
              <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                <Target className="w-5 h-5 mx-auto text-charcoal-500 mb-1" />
                <div className="text-xl font-bold text-charcoal-900">
                  {lead.bant_total_score || 0}/100
                </div>
                <div className="text-xs text-charcoal-500">BANT Score</div>
              </div>
            </div>

            {lead.business_need && (
              <div>
                <div className="text-sm font-medium text-charcoal-700 mb-1">
                  Business Need
                </div>
                <p className="text-sm text-charcoal-600">{lead.business_need}</p>
              </div>
            )}

            {lead.skills_needed && lead.skills_needed.length > 0 && (
              <div>
                <div className="text-sm font-medium text-charcoal-700 mb-2">
                  Skills Needed
                </div>
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
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Lead Source */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Source & Attribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs text-charcoal-500 mb-1">Lead Source</div>
              {lead.source && LEAD_SOURCE_CONFIG[lead.source] && (
                <Badge className={LEAD_SOURCE_CONFIG[lead.source].color}>
                  {LEAD_SOURCE_CONFIG[lead.source].label}
                </Badge>
              )}
            </div>
            {lead.campaign_id && (
              <div>
                <div className="text-xs text-charcoal-500 mb-1">Campaign</div>
                <Link
                  href={`/employee/crm/campaigns/${lead.campaign_id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Campaign
                </Link>
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
                <div className="text-xs text-charcoal-500 mb-1">Owner</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-hublot-100 flex items-center justify-center text-xs font-medium">
                    {lead.owner.full_name?.[0]}
                  </div>
                  <span className="text-sm">{lead.owner.full_name}</span>
                </div>
              </div>
            )}
            {lead.created_at && (
              <div>
                <div className="text-xs text-charcoal-500 mb-1">Created</div>
                <div className="text-sm">
                  {format(new Date(lead.created_at), 'MMM d, yyyy')}
                </div>
              </div>
            )}
            {(lead as any).last_contacted_at && (
              <div>
                <div className="text-xs text-charcoal-500 mb-1">Last Contacted</div>
                <div className="text-sm">
                  {formatDistanceToNow(new Date((lead as any).last_contacted_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            )}
            {lead.qualified_at && (
              <div>
                <div className="text-xs text-charcoal-500 mb-1">Qualified</div>
                <div className="text-sm">
                  {format(new Date(lead.qualified_at), 'MMM d, yyyy')}
                </div>
              </div>
            )}
            {lead.converted_at && (
              <div>
                <div className="text-xs text-charcoal-500 mb-1">Converted</div>
                <div className="text-sm">
                  {format(new Date(lead.converted_at), 'MMM d, yyyy')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * BANT Scoring Section Adapter
 * Shows Budget, Authority, Need, Timeline scoring with inline editing
 */
export function LeadBANTSectionPCF({ entityId, entity }: PCFSectionProps) {
  const lead = entity as Lead | undefined

  if (!lead) return null

  const bantScore = lead.bant_total_score || 0
  const bantData = lead as any

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">BANT Score</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatchLeadDialog('qualify', entityId)}
            >
              <Target className="w-4 h-4 mr-2" />
              Update Score
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Progress value={bantScore} className="flex-1 h-3" />
            <span
              className={cn(
                'text-3xl font-bold',
                bantScore >= 75
                  ? 'text-green-600'
                  : bantScore >= 50
                    ? 'text-blue-600'
                    : bantScore >= 25
                      ? 'text-amber-600'
                      : 'text-charcoal-500'
              )}
            >
              {bantScore}/100
            </span>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
              <DollarSign className="w-6 h-6 mx-auto text-charcoal-500 mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {bantData.bant_budget || 0}
              </div>
              <div className="text-sm text-charcoal-500">Budget</div>
              <div className="text-xs text-charcoal-400 mt-1">Out of 25</div>
            </div>
            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
              <UserCheck className="w-6 h-6 mx-auto text-charcoal-500 mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {bantData.bant_authority || 0}
              </div>
              <div className="text-sm text-charcoal-500">Authority</div>
              <div className="text-xs text-charcoal-400 mt-1">Out of 25</div>
            </div>
            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
              <Target className="w-6 h-6 mx-auto text-charcoal-500 mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {bantData.bant_need || 0}
              </div>
              <div className="text-sm text-charcoal-500">Need</div>
              <div className="text-xs text-charcoal-400 mt-1">Out of 25</div>
            </div>
            <div className="text-center p-4 bg-charcoal-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto text-charcoal-500 mb-2" />
              <div className="text-2xl font-bold text-charcoal-900">
                {bantData.bant_timeline || 0}
              </div>
              <div className="text-sm text-charcoal-500">Timeline</div>
              <div className="text-xs text-charcoal-400 mt-1">Out of 25</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Qualification Notes */}
      {bantData.qualification_notes && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Qualification Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {bantData.qualification_notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Score Interpretation */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Score Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-charcoal-600">
                <strong>75-100:</strong> High priority - Ready for conversion
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-charcoal-600">
                <strong>50-74:</strong> Medium priority - Needs nurturing
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-charcoal-600">
                <strong>25-49:</strong> Low priority - Early stage
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-charcoal-400" />
              <span className="text-charcoal-600">
                <strong>0-24:</strong> Not qualified - May need disqualification
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  call: <PhoneCall className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  linkedin_message: <Send className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  note: <MessageSquare className="w-4 h-4" />,
}

/**
 * Activities Section Adapter with inline logging
 */
export function LeadActivitiesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const lead = entity as Lead | undefined
  const [activityNote, setActivityNote] = useState('')
  const [activityType, setActivityType] = useState<
    'call' | 'email' | 'linkedin_message' | 'meeting' | 'note'
  >('note')

  const utils = trpc.useUtils()

  const logActivity = trpc.crm.leads.logActivity.useMutation({
    onSuccess: () => {
      toast.success('Activity logged')
      setActivityNote('')
      utils.crm.leads.getById.invalidate({ id: entityId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to log activity')
    },
  })

  const handleLogActivity = () => {
    if (!activityNote.trim()) return
    logActivity.mutate({
      leadId: entityId,
      activityType,
      description: activityNote,
    })
  }

  const activities = (lead as any)?.activities || []

  return (
    <div className="space-y-6">
      {/* Inline Activity Form */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Log Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Select
                value={activityType}
                onValueChange={(v: any) => setActivityType(v)}
              >
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
                {logActivity.isPending ? 'Logging...' : 'Log Activity'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-lg">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-sm text-charcoal-500 text-center py-4">
              No activities yet
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex gap-3 pb-4 border-b last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                    {ACTIVITY_ICONS[activity.activity_type] || (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {activity.subject || activity.activity_type}
                      </span>
                      {activity.creator && (
                        <span className="text-xs text-charcoal-500">
                          by {activity.creator.full_name}
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-sm text-charcoal-600 mt-1">
                        {activity.description}
                      </p>
                    )}
                    <span className="text-xs text-charcoal-400">
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Tasks Section Adapter
 */
export function LeadTasksSectionPCF({ entityId, entity }: PCFSectionProps) {
  const lead = entity as Lead | undefined
  const tasks = (lead as any)?.tasks || []

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Tasks
          </CardTitle>
          <Button
            size="sm"
            onClick={() => dispatchLeadDialog('createTask', entityId)}
          >
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.map((task: any) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg"
              >
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
                <Badge
                  variant={task.priority === 'high' ? 'destructive' : 'outline'}
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-charcoal-500 text-center py-8">
            No tasks assigned to this lead
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Notes Section Adapter
 */
export function LeadNotesSectionPCF({ entityId }: PCFSectionProps) {
  return (
    <NotesSection
      entityType="lead"
      entityId={entityId}
      notes={[]}
      showInlineForm={true}
    />
  )
}

