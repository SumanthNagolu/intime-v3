'use client'

/**
 * PCF-Compatible Section Adapters for Placements
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { User, Building2, DollarSign, Calendar, FileText, Activity, Clock, CheckCircle, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { AddressDisplay } from '@/components/addresses'

interface Placement {
  id: string
  status: string
  start_date?: string | null
  end_date?: string | null
  bill_rate?: number | null
  pay_rate?: number | null
  expected_hours?: number | null
  timesheet_frequency?: string | null
  notes?: string | null
  submission_id?: string | null
  submission?: {
    id: string
    candidate?: {
      id: string
      first_name: string
      last_name: string
      email?: string
    }
    job?: {
      id: string
      title: string
      account?: {
        id: string
        name: string
      }
    }
  } | null
  created_at: string
  updated_at?: string
}

interface PCFSectionProps {
  entityId: string
  entity?: unknown
}

/**
 * Overview Section
 */
export function PlacementOverviewSectionPCF({ entityId: _entityId, entity }: PCFSectionProps) {
  const placement = entity as Placement | undefined

  if (!placement) return null

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
                    ? format(new Date(placement.start_date), 'MMM d, yyyy')
                    : 'TBD'}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">End Date</span>
                <p className="font-medium">
                  {placement.end_date
                    ? format(new Date(placement.end_date), 'MMM d, yyyy')
                    : 'Open-ended'}
                </p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Expected Hours/Week</span>
                <p className="font-medium">{placement.expected_hours || 40}</p>
              </div>
              <div>
                <span className="text-sm text-charcoal-500">Timesheet Frequency</span>
                <p className="font-medium capitalize">{placement.timesheet_frequency || 'Weekly'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Candidate & Job Info */}
        {placement.submission && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Candidate & Job
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {placement.submission.candidate && (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-charcoal-500">Consultant</span>
                    <Link 
                      href={`/employee/recruiting/candidates/${placement.submission.candidate.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {placement.submission.candidate.first_name} {placement.submission.candidate.last_name}
                    </Link>
                    {placement.submission.candidate.email && (
                      <p className="text-sm text-charcoal-500">{placement.submission.candidate.email}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/candidates/${placement.submission.candidate.id}`}>
                      View Profile
                    </Link>
                  </Button>
                </div>
              )}
              {placement.submission.job && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm text-charcoal-500">Job</span>
                    <Link 
                      href={`/employee/recruiting/jobs/${placement.submission.job.id}`}
                      className="block text-lg font-medium text-hublot-900 hover:underline"
                    >
                      {placement.submission.job.title}
                    </Link>
                    {placement.submission.job.account && (
                      <p className="text-sm text-charcoal-500 flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {placement.submission.job.account.name}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/employee/recruiting/jobs/${placement.submission.job.id}`}>
                      View Job
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {placement.notes && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-charcoal-700 whitespace-pre-wrap">{placement.notes}</p>
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
            {placement.bill_rate && placement.pay_rate && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-charcoal-500">Margin</span>
                <span className="font-medium text-green-600">
                  ${(placement.bill_rate - placement.pay_rate).toFixed(2)}/hr
                  ({((1 - placement.pay_rate / placement.bill_rate) * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </CardContent>
        </Card>

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
                {formatDistanceToNow(new Date(placement.created_at), { addSuffix: true })}
              </span>
            </div>
            {placement.start_date && (
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">Duration</span>
                <span className="font-medium">
                  {placement.end_date
                    ? `${Math.ceil((new Date(placement.end_date).getTime() - new Date(placement.start_date).getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks`
                    : 'Ongoing'}
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
 * Timesheets Section
 */
export function PlacementTimesheetsSectionPCF({ entityId }: PCFSectionProps) {
  const timesheetsQuery = trpc.timesheets.getByPlacement.useQuery({
    placementId: entityId,
    limit: 10,
  })

  const timesheets = timesheetsQuery.data ?? []

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
        </CardTitle>
        <Link href={`/employee/recruiting/timesheets/new?placementId=${entityId}`}>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Timesheet
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {timesheetsQuery.isLoading ? (
          <div className="text-center py-4 text-charcoal-500">Loading timesheets...</div>
        ) : timesheets.length === 0 ? (
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
            {timesheets.length >= 10 && (
              <Link
                href={`/employee/recruiting/timesheets?placementId=${entityId}`}
                className="block text-center text-sm text-hublot-600 hover:underline pt-2"
              >
                View all timesheets
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
 */
export function PlacementActivitiesSectionPCF({ entityId: _entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No activities recorded yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Documents Section
 */
export function PlacementDocumentsSectionPCF({ entityId: _entityId }: PCFSectionProps) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No documents uploaded yet</p>
        </div>
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



