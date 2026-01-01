'use client'

import { format } from 'date-fns'
import { Mail, Phone, Building2, Briefcase, Calendar, MapPin } from 'lucide-react'
import type { CampaignProspect } from '@/types/campaign'

interface ProspectContactTabProps {
  prospect: CampaignProspect
}

/**
 * ProspectContactTab - Contact information for a campaign prospect
 *
 * Displays:
 * - Name and title
 * - Company
 * - Email and phone (with clickable links)
 * - Enrollment date
 */
export function ProspectContactTab({ prospect }: ProspectContactTabProps) {
  const fullName = [prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || 'Unknown'

  return (
    <div className="py-4 space-y-4">
      {/* Name & Title */}
      <div className="space-y-1">
        <h4 className="text-lg font-semibold text-charcoal-900">{fullName}</h4>
        {prospect.title && (
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <Briefcase className="w-4 h-4 text-charcoal-400" />
            <span>{prospect.title}</span>
          </div>
        )}
      </div>

      {/* Company */}
      {prospect.companyName && (
        <div className="flex items-center gap-2 text-sm text-charcoal-600">
          <Building2 className="w-4 h-4 text-charcoal-400" />
          <span>{prospect.companyName}</span>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2">
        {prospect.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-charcoal-400" />
            <a
              href={`mailto:${prospect.email}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {prospect.email}
            </a>
          </div>
        )}

        {prospect.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-charcoal-400" />
            <a
              href={`tel:${prospect.phone}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {prospect.phone}
            </a>
          </div>
        )}
      </div>

      {/* Enrollment Date */}
      <div className="pt-4 border-t border-charcoal-100">
        <div className="flex items-center gap-2 text-sm text-charcoal-500">
          <Calendar className="w-4 h-4" />
          <span>
            Enrolled {prospect.enrolledAt
              ? format(new Date(prospect.enrolledAt), 'MMM d, yyyy')
              : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
