'use client'

import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  ExternalLink,
  Clock,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FullSubmission } from '@/types/submission'

interface JobSectionProps {
  submission: FullSubmission
}

export function JobSection({ submission }: JobSectionProps) {
  const job = submission.job
  const account = submission.account

  if (!job) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <Briefcase className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
        <p className="text-charcoal-500">No job information available</p>
      </div>
    )
  }

  const hiringManager = job.hiringManagerContact

  return (
    <div className="space-y-6">
      {/* Job Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold text-charcoal-900">{job.title}</h2>
                {job.status && (
                  <span className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    job.status === 'open' ? 'bg-green-100 text-green-700' :
                    job.status === 'closed' ? 'bg-charcoal-100 text-charcoal-600' :
                    'bg-amber-100 text-amber-700'
                  )}>
                    {job.status}
                  </span>
                )}
              </div>

              {/* Account Link */}
              <Link
                href={`/employee/recruiting/accounts/${account?.id}`}
                className="flex items-center gap-2 text-charcoal-600 hover:text-gold-600 mb-3"
              >
                <Building2 className="h-4 w-4" />
                <span className="text-lg">{account?.name || 'Unknown Account'}</span>
              </Link>

              {/* Location & Type */}
              <div className="flex items-center gap-6 text-sm text-charcoal-600">
                {(job.location_city || job.location_state) && (
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {[job.location_city, job.location_state].filter(Boolean).join(', ')}
                  </span>
                )}
                {job.location_type && (
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {job.location_type.replace(/_/g, ' ')}
                  </span>
                )}
                {job.job_type && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {job.job_type.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>

            {/* View Job Button */}
            <Link href={`/employee/recruiting/jobs/${job.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Job
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Rate Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-charcoal-400" />
              Rate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Bill Rate Range"
              value={
                job.min_bill_rate && job.max_bill_rate
                  ? `$${job.min_bill_rate} - $${job.max_bill_rate}/hr`
                  : job.min_bill_rate
                  ? `$${job.min_bill_rate}/hr`
                  : '—'
              }
            />
            <InfoRow
              label="Pay Rate Range"
              value={
                job.min_pay_rate && job.max_pay_rate
                  ? `$${job.min_pay_rate} - $${job.max_pay_rate}/hr`
                  : job.min_pay_rate
                  ? `$${job.min_pay_rate}/hr`
                  : '—'
              }
            />
            <InfoRow
              label="Submission Bill Rate"
              value={submission.bill_rate ? `$${submission.bill_rate}/hr` : '—'}
              highlight
            />
            <InfoRow
              label="Submission Pay Rate"
              value={submission.pay_rate ? `$${submission.pay_rate}/hr` : '—'}
              highlight
            />
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-charcoal-400" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Start Date"
              value={job.start_date ? new Date(job.start_date).toLocaleDateString() : '—'}
            />
            <InfoRow
              label="End Date"
              value={job.end_date ? new Date(job.end_date).toLocaleDateString() : 'Ongoing'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Hiring Manager & Job Owner */}
      <div className="grid grid-cols-2 gap-6">
        {/* Hiring Manager */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-charcoal-400" />
              Hiring Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hiringManager ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {hiringManager.first_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">
                    {hiringManager.first_name} {hiringManager.last_name}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-500">
                    {hiringManager.email && (
                      <a href={`mailto:${hiringManager.email}`} className="flex items-center gap-1 hover:text-gold-600">
                        <Mail className="h-3 w-3" />
                        {hiringManager.email}
                      </a>
                    )}
                    {hiringManager.phone && (
                      <a href={`tel:${hiringManager.phone}`} className="flex items-center gap-1 hover:text-gold-600">
                        <Phone className="h-3 w-3" />
                        {hiringManager.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-charcoal-500 text-sm">No hiring manager assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Job Owner */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-charcoal-400" />
              Job Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {job.owner ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={job.owner.avatar_url || undefined} />
                  <AvatarFallback className="bg-gold-100 text-gold-700">
                    {job.owner.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-charcoal-900">{job.owner.full_name}</p>
                  <p className="text-sm text-charcoal-500">Recruiter</p>
                </div>
              </div>
            ) : (
              <p className="text-charcoal-500 text-sm">No owner assigned</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-charcoal-500">{label}</span>
      <span className={cn(
        'text-sm font-medium',
        highlight ? 'text-gold-600' : 'text-charcoal-900'
      )}>
        {value}
      </span>
    </div>
  )
}
