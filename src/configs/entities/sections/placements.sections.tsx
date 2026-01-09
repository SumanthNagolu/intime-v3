'use client'

/**
 * PCF-Compatible Section Adapters for Placements
 * ONE DATABASE CALL PATTERN: All section data comes from entity.sections
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { User, Building2, DollarSign, Calendar, FileText, Activity, Clock, CheckCircle, MapPin, Plus, History, StickyNote, ShieldCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { AddressDisplay } from '@/components/addresses'
import type { FullPlacement, PlacementTimesheet, PlacementActivity, PlacementDocument, PlacementNote, PlacementHistoryEntry, PlacementComplianceItem } from '@/types/placement'

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section
 * Uses candidate/job data directly from the FullPlacement entity
 */
export function PlacementOverviewSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined

  if (!placement) return null

  // Extract candidate and job from direct relations (new structure)
  const candidate = placement.candidate
  const job = placement.job
  const account = placement.account

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left - Main info */}
      <div className="col-span-2 space-y-6">
        {/* Placement Details Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Placement Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-charcoal-500">Start Date</span>
                <p className="font-medium">
                  {placement.start_date
                    ? format(new Date(String(placement.start_date)), 'MMM d, yyyy')
                    : 'TBD'}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">End Date</span>
                <p className="font-medium">
                  {placement.end_date
                    ? format(new Date(String(placement.end_date)), 'MMM d, yyyy')
                    : 'Open-ended'}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Days Active</span>
                <p className="font-medium">{placement.daysActive} days</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Health Status</span>
                <p className="font-medium capitalize">{String(placement.health_status || 'Healthy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidate & Job Info */}
        {(candidate || job) && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Consultant & Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidate && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-charcoal-500">Consultant</span>
                    <Link
                      href={`/employee/recruiting/candidates/${candidate.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {candidate.first_name} {candidate.last_name}
                    </Link>
                    {candidate.email && (
                      <p className="text-sm text-charcoal-500">{candidate.email}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/candidates/${candidate.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              )}
              {job && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-charcoal-500">Job</span>
                    <Link
                      href={`/employee/recruiting/jobs/${job.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {job.title}
                    </Link>
                    {account && (
                      <p className="text-sm text-charcoal-500 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {account.name}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/jobs/${job.id}`}>
                      View Job
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {placement.milestones && placement.milestones.length > 0 && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Check-in Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {placement.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${milestone.status === 'completed' ? 'bg-green-500' : milestone.status === 'pending' ? 'bg-yellow-500' : 'bg-charcoal-300'}`} />
                      <span className="font-medium capitalize">{milestone.milestone_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="text-sm text-charcoal-500">
                      {milestone.completed_date
                        ? `Completed ${format(new Date(milestone.completed_date), 'MMM d')}`
                        : `Due ${format(new Date(milestone.due_date), 'MMM d')}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right - Rates & Timeline */}
      <div className="space-y-6">
        {/* Rates Card */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Rate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-charcoal-500">Bill Rate</span>
              <span className="font-medium text-lg">{placement.bill_rate ? `$${placement.bill_rate}/hr` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500">Pay Rate</span>
              <span className="font-medium">{placement.pay_rate ? `$${placement.pay_rate}/hr` : '—'}</span>
            </div>
            {placement.marginAmount !== undefined && placement.marginPercent !== undefined && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-charcoal-500">Margin</span>
                <span className="font-medium text-green-600">
                  ${placement.marginAmount.toFixed(2)}/hr ({placement.marginPercent.toFixed(1)}%)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner */}
        {placement.recruiter && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {placement.recruiter.avatar_url ? (
                  <img src={placement.recruiter.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-charcoal-500" />
                  </div>
                )}
                <span className="font-medium">{placement.recruiter.full_name}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Created</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(String(placement.created_at)), { addSuffix: true })}
              </span>
            </div>
            {Boolean(placement.start_date) && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Duration</span>
                <span className="font-medium">
                  {placement.end_date
                    ? `${Math.ceil((new Date(String(placement.end_date)).getTime() - new Date(String(placement.start_date)).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks`
                    : 'Ongoing'}
                </span>
              </div>
            )}
            {placement.daysActive > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Active</span>
                <span className="font-medium">{placement.daysActive} days</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Timesheets Section
 * ONE DATABASE CALL: Uses entity.sections.timesheets from getFullPlacement
 */
export function PlacementTimesheetsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined
  const timesheets = placement?.sections?.timesheets?.items ?? []

  const statusColors: Record<string, string> = {
    draft: 'bg-charcoal-100 text-charcoal-700',
    submitted: 'bg-blue-100 text-blue-700',
    pending_client_approval: 'bg-yellow-100 text-yellow-700',
    client_approved: 'bg-green-100 text-green-700',
    client_rejected: 'bg-red-100 text-red-700',
    approved: 'bg-green-100 text-green-700',
    processed: 'bg-purple-100 text-purple-700',
    void: 'bg-charcoal-100 text-charcoal-500',
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timesheets
          {timesheets.length > 0 && (
            <Badge variant="secondary" className="ml-2">{timesheets.length}</Badge>
          )}
        </CardTitle>
        <Link href={`/employee/recruiting/timesheets/new?placementId=${entityId}`}>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Timesheet
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {timesheets.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <Calendar className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No timesheets submitted yet</p>
            <Link href={`/employee/recruiting/timesheets/new?placementId=${entityId}`}>
              <Button variant="outline" size="sm" className="mt-4">
                Create First Timesheet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {timesheets.map((ts) => (
              <Link
                key={ts.id}
                href={`/employee/recruiting/timesheets/${ts.id}`}
                className="block p-4 border rounded-lg hover:bg-charcoal-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-charcoal-900">
                      {format(new Date(ts.periodStart), 'MMM d')} - {format(new Date(ts.periodEnd), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-charcoal-500 mt-1">
                      {ts.totalRegularHours + ts.totalOvertimeHours + ts.totalDoubleTimeHours} hrs
                      {ts.totalBillableAmount > 0 && (
                        <span className="ml-2">• ${ts.totalBillableAmount.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[ts.status] || 'bg-charcoal-100'}>
                    {ts.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </Link>
            ))}
            {(placement?.sections?.timesheets?.total ?? 0) > timesheets.length && (
              <Link
                href={`/employee/recruiting/timesheets?placementId=${entityId}`}
                className="block text-center text-sm text-hublot-600 hover:underline pt-2"
              >
                View all {placement?.sections?.timesheets?.total} timesheets
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Activities Section
 * ONE DATABASE CALL: Uses entity.sections.activities from getFullPlacement
 */
export function PlacementActivitiesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined
  const activities = placement?.sections?.activities?.items ?? []

  const activityTypeIcons: Record<string, React.ReactNode> = {
    call: <Activity className="w-4 h-4" />,
    email: <FileText className="w-4 h-4" />,
    meeting: <Calendar className="w-4 h-4" />,
    note: <StickyNote className="w-4 h-4" />,
    checkin: <CheckCircle className="w-4 h-4" />,
    status_change: <History className="w-4 h-4" />,
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-2">{activities.length}</Badge>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('openPlacementDialog', {
                detail: { dialogId: 'logActivity', placementId: entityId },
              })
            )
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No activities recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-600">
                  {activityTypeIcons[activity.activity_type] || <Activity className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-charcoal-900 capitalize">
                      {activity.activity_type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-charcoal-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {activity.subject && (
                    <p className="text-sm text-charcoal-700 mt-1">{activity.subject}</p>
                  )}
                  {activity.description && (
                    <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">{activity.description}</p>
                  )}
                  {activity.creator && (
                    <p className="text-xs text-charcoal-400 mt-2">
                      by {activity.creator.full_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(placement?.sections?.activities?.total ?? 0) > activities.length && (
              <p className="text-center text-sm text-charcoal-500 pt-2">
                Showing {activities.length} of {placement?.sections?.activities?.total} activities
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Documents Section
 * ONE DATABASE CALL: Uses entity.sections.documents from getFullPlacement
 */
export function PlacementDocumentsSectionPCF({ entityId, entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined
  const documents = placement?.sections?.documents?.items ?? []

  const getDocTypeIcon = (docType?: string): React.ReactNode => {
    switch (docType) {
      case 'contract':
        return <FileText className="w-4 h-4 text-blue-600" />
      case 'offer_letter':
        return <FileText className="w-4 h-4 text-green-600" />
      case 'background_check':
        return <CheckCircle className="w-4 h-4 text-purple-600" />
      default:
        return <FileText className="w-4 h-4 text-charcoal-500" />
    }
  }

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
          {documents.length > 0 && (
            <Badge variant="secondary" className="ml-2">{documents.length}</Badge>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('openPlacementDialog', {
                detail: { dialogId: 'uploadDocument', placementId: entityId },
              })
            )
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-charcoal-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  {getDocTypeIcon(doc.document_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-charcoal-900 truncate">{doc.name}</div>
                  <div className="text-sm text-charcoal-500 flex items-center gap-2">
                    {doc.file_type && <span className="uppercase">{doc.file_type}</span>}
                    {doc.file_size && <span>• {formatFileSize(doc.file_size)}</span>}
                    {doc.uploadedBy && <span>• by {doc.uploadedBy.full_name}</span>}
                  </div>
                </div>
                {doc.file_url && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-hublot-600 hover:underline"
                  >
                    View
                  </a>
                )}
              </div>
            ))}
            {(placement?.sections?.documents?.total ?? 0) > documents.length && (
              <p className="text-center text-sm text-charcoal-500 pt-2">
                Showing {documents.length} of {placement?.sections?.documents?.total} documents
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Location Section - Shows first day/work location
 */
export function PlacementLocationSectionPCF({ entityId }: PCFSectionProps) {
  const addressesQuery = trpc.addresses.getByEntity.useQuery({
    entityType: 'placement',
    entityId,
  })

  const addresses = addressesQuery.data ?? []

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          First Day Location
        </CardTitle>
        <Link href={`/employee/admin/addresses/new?entityType=placement&entityId=${entityId}`}>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {addressesQuery.isLoading ? (
          <p className="text-charcoal-400 text-sm">Loading...</p>
        ) : addresses.length === 0 ? (
          <p className="text-charcoal-500 text-sm">No first day location set</p>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Link
                key={address.id}
                href={`/employee/admin/addresses/${address.id}`}
                className="block hover:bg-charcoal-50 rounded-lg p-2 -m-2 transition-colors"
              >
                <AddressDisplay
                  address={address}
                  variant="compact"
                  showPrimary
                />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Compliance Section
 * ONE DATABASE CALL: Uses entity.sections.compliance from getFullPlacement
 */
export function PlacementComplianceSectionPCF({ entityId, entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined
  const compliance = placement?.sections?.compliance?.items ?? []

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    received: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-red-100 text-red-700',
    waived: 'bg-charcoal-100 text-charcoal-500',
  }

  const pendingCount = compliance.filter(item => item.status === 'pending').length
  const blockingCount = compliance.filter(item => item.is_blocking && item.status !== 'verified').length

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Compliance
          {compliance.length > 0 && (
            <Badge variant="secondary" className="ml-2">{compliance.length}</Badge>
          )}
          {blockingCount > 0 && (
            <Badge variant="destructive" className="ml-1">
              {blockingCount} blocking
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('openPlacementDialog', {
                detail: { dialogId: 'addCompliance', placementId: entityId },
              })
            )
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Requirement
        </Button>
      </CardHeader>
      <CardContent>
        {compliance.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <ShieldCheck className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No compliance requirements tracked</p>
          </div>
        ) : (
          <div className="space-y-3">
            {compliance.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border rounded-lg ${item.is_blocking && item.status !== 'verified' ? 'border-red-200 bg-red-50' : ''}`}
              >
                <div className="flex-shrink-0">
                  {item.is_blocking && item.status !== 'verified' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  ) : item.status === 'verified' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-charcoal-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-charcoal-900">{item.name}</span>
                    {item.is_blocking && item.status !== 'verified' && (
                      <Badge variant="destructive" className="text-xs">Blocking</Badge>
                    )}
                  </div>
                  {item.requirement && (
                    <p className="text-sm text-charcoal-500 mt-1">
                      {item.requirement.category}: {item.requirement.description || item.requirement.name}
                    </p>
                  )}
                  {item.due_date && (
                    <p className="text-xs text-charcoal-400 mt-1">
                      Due: {format(new Date(item.due_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <Badge className={statusColors[item.status] || 'bg-charcoal-100'}>
                  {item.status}
                </Badge>
              </div>
            ))}
            {pendingCount > 0 && (
              <p className="text-sm text-yellow-600 pt-2">
                {pendingCount} item{pendingCount !== 1 ? 's' : ''} pending completion
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Notes Section
 * ONE DATABASE CALL: Uses entity.sections.notes from getFullPlacement
 */
export function PlacementNotesSectionPCF({ entityId, entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined
  const notes = placement?.sections?.notes?.items ?? []

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="w-5 h-5" />
          Notes
          {notes.length > 0 && (
            <Badge variant="secondary" className="ml-2">{notes.length}</Badge>
          )}
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent('openPlacementDialog', {
                detail: { dialogId: 'addNote', placementId: entityId },
              })
            )
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <StickyNote className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No notes added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {note.is_pinned && (
                      <Badge variant="secondary" className="text-xs">Pinned</Badge>
                    )}
                    {note.is_private && (
                      <Badge variant="outline" className="text-xs">Private</Badge>
                    )}
                  </div>
                  <span className="text-sm text-charcoal-500">
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-charcoal-700 whitespace-pre-wrap">{note.content}</p>
                {note.creator && (
                  <p className="text-xs text-charcoal-400 mt-2">
                    by {note.creator.full_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * History Section
 * ONE DATABASE CALL: Uses entity.sections.history from getFullPlacement
 */
export function PlacementHistorySectionPCF({ entity }: PCFSectionProps) {
  const placement = entity as FullPlacement | undefined
  const history = placement?.sections?.history?.items ?? []

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          History
          {history.length > 0 && (
            <Badge variant="secondary" className="ml-2">{history.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-charcoal-500">
            <History className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
            <p>No history recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="flex gap-4 p-3 border-l-2 border-charcoal-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-charcoal-900 capitalize">
                      {entry.activity_type?.replace(/_/g, ' ') || entry.subject}
                    </span>
                    <span className="text-sm text-charcoal-500">
                      {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {entry.description && (
                    <p className="text-sm text-charcoal-500 mt-1">{entry.description}</p>
                  )}
                  {entry.creator && (
                    <p className="text-xs text-charcoal-400 mt-1">
                      by {entry.creator.full_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}







