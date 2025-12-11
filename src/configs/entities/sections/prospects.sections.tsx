'use client'

/**
 * PCF-Compatible Section Adapters for Prospects
 *
 * These wrapper components adapt the existing Prospect detail components
 * to the PCF SectionConfig interface: { entityId: string; entity?: unknown }
 *
 * Callbacks are handled via the PCF event system (window events).
 * The detail page listens for these events and manages dialog state.
 */

import { Prospect, PROSPECT_STATUS_CONFIG, RESPONSE_TYPE_CONFIG, CHANNEL_CONFIG } from '../prospects.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { trpc } from '@/lib/trpc/client'
import {
  User,
  Mail,
  Building2,
  Link,
  Phone,
  Calendar,
  Clock,
  TrendingUp,
  Target,
  MessageSquare,
  Send,
  CheckCircle2,
  Activity,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { ActivitiesSection } from '@/components/pcf/sections/ActivitiesSection'
import { NotesSection } from '@/components/pcf/sections/NotesSection'
import type { NoteItem } from '@/configs/sections/notes.config'

/**
 * Dispatch a dialog open event for the Campaign entity
 * The detail page listens for this and manages dialog state
 */
function dispatchCampaignDialog(dialogId: string, prospectId: string, campaignId?: string) {
  window.dispatchEvent(
    new CustomEvent('openCampaignDialog', {
      detail: { dialogId, prospectId, campaignId },
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
 */
export function ProspectOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
  const prospect = entity as Prospect | undefined

  if (!prospect) return null

  const statusConfig = PROSPECT_STATUS_CONFIG[prospect.status]
  const responseConfig = prospect.response_type
    ? RESPONSE_TYPE_CONFIG[prospect.response_type]
    : null
  const channelConfig = prospect.channel ? CHANNEL_CONFIG[prospect.channel] : null

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        {/* Contact Information */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {prospect.email && (
                <div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">
                    Email
                  </div>
                  <a
                    href={`mailto:${prospect.email}`}
                    className="flex items-center gap-2 text-sm hover:text-hublot-900"
                  >
                    <Mail className="w-4 h-4" />
                    {prospect.email}
                  </a>
                </div>
              )}
              {prospect.phone && (
                <div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">
                    Phone
                  </div>
                  <a
                    href={`tel:${prospect.phone}`}
                    className="flex items-center gap-2 text-sm hover:text-hublot-900"
                  >
                    <Phone className="w-4 h-4" />
                    {prospect.phone}
                  </a>
                </div>
              )}
              {prospect.company && (
                <div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">
                    Company
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4" />
                    {prospect.company}
                  </div>
                </div>
              )}
              {prospect.title && (
                <div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">
                    Title
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    {prospect.title}
                  </div>
                </div>
              )}
              {prospect.linkedin_url && (
                <div>
                  <div className="text-xs text-charcoal-500 uppercase tracking-wide mb-1">
                    LinkedIn
                  </div>
                  <a
                    href={prospect.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:text-hublot-900"
                  >
                    <Link className="w-4 h-4" />
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Context */}
        {prospect.campaign && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-900">{prospect.campaign.name}</p>
                  <p className="text-sm text-charcoal-500">
                    Added{' '}
                    {formatDistanceToNow(new Date(prospect.created_at), { addSuffix: true })}
                  </p>
                </div>
                <Badge
                  className={cn(
                    'capitalize',
                    prospect.campaign.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {prospect.campaign.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Converted Lead */}
        {prospect.converted_lead && (
          <Card className="bg-white border-gold-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold-500" />
                Converted to Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-900">
                    {prospect.converted_lead.company_name ||
                      `${prospect.converted_lead.first_name || ''} ${prospect.converted_lead.last_name || ''}`.trim()}
                  </p>
                  <p className="text-sm text-charcoal-500">Lead ID: {prospect.converted_lead.id}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    (window.location.href = `/employee/crm/leads/${prospect.converted_lead!.id}`)
                  }
                >
                  View Lead
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status & Response */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Status</span>
              {statusConfig && (
                <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
              )}
            </div>
            {responseConfig && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Response</span>
                <Badge className={responseConfig.color}>{responseConfig.label}</Badge>
              </div>
            )}
            {channelConfig && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-500">Channel</span>
                <Badge className={channelConfig.color}>{channelConfig.label}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-charcoal-500">Sequence Step</span>
              <span className="text-sm font-medium">{prospect.sequence_step || 1}</span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Added</span>
              <span className="font-medium">
                {format(new Date(prospect.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {prospect.contacted_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">First Contact</span>
                <span className="font-medium">
                  {format(new Date(prospect.contacted_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {prospect.opened_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Opened</span>
                <span className="font-medium">
                  {format(new Date(prospect.opened_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {prospect.clicked_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Clicked</span>
                <span className="font-medium">
                  {format(new Date(prospect.clicked_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {prospect.responded_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Responded</span>
                <span className="font-medium">
                  {format(new Date(prospect.responded_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
            {prospect.meeting_booked_at && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Meeting Booked</span>
                <span className="font-medium">
                  {format(new Date(prospect.meeting_booked_at), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Engagement Section Adapter
 */
export function ProspectEngagementSectionPCF({ entityId, entity }: PCFSectionProps) {
  const prospect = entity as Prospect | undefined

  if (!prospect) return null

  const engagementScore = prospect.engagement_score || 0

  return (
    <div className="space-y-6">
      {/* Engagement Score */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Engagement Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Progress value={engagementScore} className="flex-1 h-3" />
            <span
              className={cn(
                'text-2xl font-bold',
                engagementScore >= 75
                  ? 'text-green-600'
                  : engagementScore >= 50
                    ? 'text-blue-600'
                    : engagementScore >= 25
                      ? 'text-amber-600'
                      : 'text-charcoal-500'
              )}
            >
              {engagementScore}%
            </span>
          </div>
          <p className="text-sm text-charcoal-500">
            Based on opens, clicks, and response activity
          </p>
        </CardContent>
      </Card>

      {/* Engagement Events */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>Engagement Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prospect.opened_at && (
              <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Email Opened</p>
                  <p className="text-xs text-charcoal-500">
                    {format(new Date(prospect.opened_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            )}
            {prospect.clicked_at && (
              <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                <Target className="w-5 h-5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Link Clicked</p>
                  <p className="text-xs text-charcoal-500">
                    {format(new Date(prospect.clicked_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
            )}
            {prospect.responded_at && (
              <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium text-sm">Responded</p>
                  <p className="text-xs text-charcoal-500">
                    {format(new Date(prospect.responded_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                {prospect.response_type && (
                  <Badge
                    className={
                      RESPONSE_TYPE_CONFIG[prospect.response_type]?.color ||
                      'bg-charcoal-100 text-charcoal-600'
                    }
                  >
                    {RESPONSE_TYPE_CONFIG[prospect.response_type]?.label || prospect.response_type}
                  </Badge>
                )}
              </div>
            )}
            {!prospect.opened_at && !prospect.clicked_at && !prospect.responded_at && (
              <div className="text-center py-8 text-charcoal-500">
                <TrendingUp className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                <p>No engagement events yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Activities Section Adapter
 */
export function ProspectActivitiesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const prospect = entity as Prospect | undefined

  return (
    <ActivitiesSection
      entityType="prospect"
      entityId={entityId}
      onLogActivity={() =>
        dispatchCampaignDialog('logProspectActivity', entityId, prospect?.campaign_id)
      }
    />
  )
}

/**
 * Notes Section Adapter - Using centralized notes router (NOTES-01)
 */
export function ProspectNotesSectionPCF({ entityId }: PCFSectionProps) {
  const notesQuery = trpc.notes.listByEntity.useQuery({ entityType: 'prospect', entityId })
  const addNoteMutation = trpc.notes.create.useMutation()
  const updateNoteMutation = trpc.notes.update.useMutation()
  const deleteNoteMutation = trpc.notes.delete.useMutation()
  const utils = trpc.useUtils()

  const handleAddNote = async (content: string) => {
    await addNoteMutation.mutateAsync({
      entityType: 'prospect',
      entityId,
      content,
    })
    utils.notes.listByEntity.invalidate({ entityType: 'prospect', entityId })
  }

  const handleEditNote = async (id: string, content: string) => {
    await updateNoteMutation.mutateAsync({ id, content })
    utils.notes.listByEntity.invalidate({ entityType: 'prospect', entityId })
  }

  const handleDeleteNote = async (id: string) => {
    await deleteNoteMutation.mutateAsync({ id })
    utils.notes.listByEntity.invalidate({ entityType: 'prospect', entityId })
  }

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    await updateNoteMutation.mutateAsync({ id, isPinned })
    utils.notes.listByEntity.invalidate({ entityType: 'prospect', entityId })
  }

  return (
    <NotesSection
      entityType="prospect"
      entityId={entityId}
      notes={notesQuery.data?.items as unknown as NoteItem[]}
      isLoading={notesQuery.isLoading}
      onAddNote={handleAddNote}
      onEditNote={handleEditNote}
      onDeleteNote={handleDeleteNote}
      onTogglePin={handleTogglePin}
    />
  )
}

