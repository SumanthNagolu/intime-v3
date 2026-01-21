'use client'

import * as React from 'react'
import {
  User,
  Building2,
  Mail,
  Phone,
  Linkedin,
  Star,
  ExternalLink,
  Copy,
  Check,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ContactData } from '@/types/workspace'
import { useToast } from '@/components/ui/use-toast'

interface ContactHeaderProps {
  contact: ContactData
}

// Status configuration for light backgrounds
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  active: {
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
    border: 'border-success-200',
  },
  inactive: {
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-600',
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200',
  },
  prospect: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  lead: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  qualified: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
    border: 'border-purple-200',
  },
  placed: {
    bg: 'bg-gold-50',
    text: 'text-gold-700',
    dot: 'bg-gold-500',
    border: 'border-gold-200',
  },
  bench: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
    border: 'border-orange-200',
  },
  candidate: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    dot: 'bg-green-500',
    border: 'border-green-200',
  },
}

// Category/Type badge configuration
const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  person_candidate: { label: 'Candidate', bg: 'bg-forest-50', text: 'text-forest-700' },
  person_lead: { label: 'Lead', bg: 'bg-amber-50', text: 'text-amber-700' },
  person_prospect: { label: 'Prospect', bg: 'bg-blue-50', text: 'text-blue-700' },
  person_client_contact: { label: 'Client Contact', bg: 'bg-purple-50', text: 'text-purple-700' },
  person_vendor_contact: { label: 'Vendor Contact', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  person_employee: { label: 'Employee', bg: 'bg-charcoal-100', text: 'text-charcoal-700' },
  company_client: { label: 'Client Company', bg: 'bg-forest-50', text: 'text-forest-700' },
  company_vendor: { label: 'Vendor', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  company_prospect: { label: 'Prospect Company', bg: 'bg-blue-50', text: 'text-blue-700' },
  company_lead: { label: 'Lead Company', bg: 'bg-amber-50', text: 'text-amber-700' },
}

/**
 * ContactHeader - Hublot-inspired entity header for contacts
 *
 * Premium design with clean information display only.
 * All actions are centralized in the sidebar Quick Actions panel.
 * Adapts to show relevant info based on category (person or company).
 */
export function ContactHeader({ contact }: ContactHeaderProps) {
  const { toast } = useToast()
  const [copied, setCopied] = React.useState(false)

  const statusConfig = STATUS_CONFIG[contact.status] || STATUS_CONFIG.active
  const typeConfig = TYPE_CONFIG[contact.subtype] || { label: 'Contact', bg: 'bg-charcoal-100', text: 'text-charcoal-700' }
  const isPerson = contact.category === 'person'

  // Format "Since" date
  const sinceDate = contact.createdAt
    ? new Date(contact.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : null

  // Copy contact ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(contact.id)
    setCopied(true)
    toast({ title: 'Contact ID copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }

  // Get gradient colors based on category
  const iconGradient = isPerson
    ? 'from-forest-500 to-forest-700'
    : 'from-charcoal-700 to-charcoal-900'
  const iconShadow = isPerson
    ? 'shadow-forest-500/20 group-hover:shadow-forest-500/30'
    : 'shadow-charcoal-500/20 group-hover:shadow-charcoal-500/30'

  return (
    <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />

      {/* Top accent line */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r',
        isPerson ? 'from-forest-500 via-gold-500 to-forest-500' : 'from-charcoal-600 via-gold-500 to-charcoal-600'
      )} />

      <div className="relative p-6">
        <div className="flex items-start gap-5">
          {/* Icon with gradient */}
          <div className="relative group">
            <div className={cn(
              'w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105',
              iconGradient,
              iconShadow
            )}>
              {isPerson ? (
                <User className="h-8 w-8 text-white" />
              ) : (
                <Building2 className="h-8 w-8 text-white" />
              )}
            </div>
            {/* Candidate hotlist indicator */}
            {isPerson && contact.candidateStatus === 'bench' && (
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/40 animate-pulse-slow">
                <Star className="h-3.5 w-3.5 text-charcoal-900 fill-current" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-charcoal-900 tracking-tight truncate">
                {contact.fullName}
              </h1>
              {/* Status badge */}
              <Badge
                className={cn(
                  'capitalize font-medium px-2.5 py-0.5 flex items-center gap-1.5',
                  statusConfig.bg,
                  statusConfig.text,
                  statusConfig.border
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
                {contact.status?.replace(/_/g, ' ')}
              </Badge>
              {/* Type badge */}
              <Badge
                className={cn('capitalize font-medium px-2.5 py-0.5', typeConfig.bg, typeConfig.text)}
              >
                {typeConfig.label}
              </Badge>
            </div>

            {/* Metadata row - varies by category */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-charcoal-500">
              {/* Person: Title @ Company */}
              {isPerson && contact.title && (
                <span className="font-medium text-charcoal-600">{contact.title}</span>
              )}
              {isPerson && contact.company && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <Building2 className="h-3.5 w-3.5" />
                  {contact.company.name}
                </span>
              )}

              {/* Location */}
              {contact.city && contact.state && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <MapPin className="h-3.5 w-3.5" />
                  {contact.city}, {contact.state}
                </span>
              )}

              {/* Since date */}
              {sinceDate && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  <Calendar className="h-3.5 w-3.5" />
                  Since {sinceDate}
                </span>
              )}

              {/* Owner */}
              {contact.owner && (
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                  Owner:{' '}
                  <span className="font-medium text-charcoal-700">{contact.owner.fullName}</span>
                </span>
              )}
            </div>

            {/* Contact info row (for person) */}
            {isPerson && (
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{contact.email}</span>
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 text-charcoal-600 hover:text-charcoal-900 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
                  </a>
                )}
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                  </a>
                )}
              </div>
            )}

            {/* Candidate-specific metrics */}
            {isPerson && contact.candidateExperienceYears && (
              <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-600">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5" />
                  {contact.candidateExperienceYears} yrs experience
                </span>
                {contact.candidateHourlyRate && (
                  <span>${contact.candidateHourlyRate}/hr</span>
                )}
                {contact.candidateCurrentVisa && (
                  <Badge variant="outline" className="text-xs">
                    {contact.candidateCurrentVisa}
                  </Badge>
                )}
              </div>
            )}

            {/* ID row */}
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 text-xs text-charcoal-400 hover:text-charcoal-600 transition-colors font-mono"
              >
                <span className="bg-charcoal-100 px-1.5 py-0.5 rounded">
                  ID: {contact.id.slice(0, 8)}...
                </span>
                {copied ? (
                  <Check className="h-3 w-3 text-success-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Profile
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactHeader
