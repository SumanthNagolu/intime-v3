'use client'

/**
 * PCF-Compatible Section Adapters for Placements
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format, formatDistanceToNow } from 'date-fns'
import { User, Briefcase, Building2, DollarSign, Calendar, FileText, Activity, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'

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
export function PlacementOverviewSectionPCF({ entityId, entity }: PCFSectionProps) {
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
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timesheets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-charcoal-500">
          <Calendar className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
          <p>No timesheets submitted yet</p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Activities Section
 */
export function PlacementActivitiesSectionPCF({ entityId }: PCFSectionProps) {
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
export function PlacementDocumentsSectionPCF({ entityId }: PCFSectionProps) {
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



