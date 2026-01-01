'use client'

import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Link as LinkIcon,
  Shield,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { FullSubmission } from '@/types/submission'

interface CandidateSectionProps {
  submission: FullSubmission
}

export function CandidateSection({ submission }: CandidateSectionProps) {
  const candidate = submission.candidate

  if (!candidate) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <User className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
        <p className="text-charcoal-500">No candidate information available</p>
      </div>
    )
  }

  const initials = `${candidate.first_name?.charAt(0) || ''}${candidate.last_name?.charAt(0) || ''}`

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={candidate.avatar_url || undefined} alt={candidate.full_name || ''} />
              <AvatarFallback className="bg-gold-100 text-gold-700 text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Main Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold text-charcoal-900">
                  {candidate.first_name} {candidate.last_name}
                </h2>
                {candidate.linkedin_url && (
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <LinkIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
              <p className="text-lg text-charcoal-600 mb-3">{candidate.title || 'No title'}</p>

              {/* Contact Row */}
              <div className="flex items-center gap-6 text-sm">
                {candidate.email && (
                  <a
                    href={`mailto:${candidate.email}`}
                    className="flex items-center gap-2 text-charcoal-600 hover:text-gold-600"
                  >
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </a>
                )}
                {candidate.phone && (
                  <a
                    href={`tel:${candidate.phone}`}
                    className="flex items-center gap-2 text-charcoal-600 hover:text-gold-600"
                  >
                    <Phone className="h-4 w-4" />
                    {candidate.phone}
                  </a>
                )}
                {(candidate.location_city || candidate.location_state) && (
                  <span className="flex items-center gap-2 text-charcoal-600">
                    <MapPin className="h-4 w-4" />
                    {[candidate.location_city, candidate.location_state].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* View Profile Button */}
            <Link href={`/employee/recruiting/candidates/${candidate.id}`}>
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Professional Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-charcoal-400" />
              Professional Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Title" value={candidate.title || '—'} />
            <InfoRow
              label="Experience"
              value={candidate.years_experience ? `${candidate.years_experience} years` : '—'}
            />
            <InfoRow
              label="Desired Rate"
              value={candidate.desired_rate ? `$${candidate.desired_rate}/hr` : '—'}
            />
          </CardContent>
        </Card>

        {/* Work Authorization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-charcoal-400" />
              Work Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Status"
              value={candidate.work_authorization || 'Not specified'}
            />
            <InfoRow
              label="Location"
              value={[candidate.location_city, candidate.location_state].filter(Boolean).join(', ') || '—'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Match Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Match Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-8">
            <MatchMetric
              label="AI Match Score"
              value={submission.ai_match_score}
            />
            <MatchMetric
              label="Recruiter Match Score"
              value={submission.recruiter_match_score}
            />
            <MatchMetric
              label="Overall Match"
              value={submission.match_score}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-charcoal-500">{label}</span>
      <span className="text-sm font-medium text-charcoal-900">{value}</span>
    </div>
  )
}

function MatchMetric({ label, value }: { label: string; value?: number | null }) {
  const percentage = value || 0
  const color = percentage >= 80
    ? 'text-green-600 bg-green-100'
    : percentage >= 60
    ? 'text-amber-600 bg-amber-100'
    : 'text-charcoal-600 bg-charcoal-100'

  return (
    <div className="text-center">
      <p className="text-xs text-charcoal-500 uppercase tracking-wide mb-2">{label}</p>
      <div className={cn('inline-flex items-center justify-center w-16 h-16 rounded-full text-xl font-bold', color)}>
        {value ? `${value}%` : '—'}
      </div>
    </div>
  )
}
