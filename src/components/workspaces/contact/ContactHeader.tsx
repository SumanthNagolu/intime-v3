'use client'

import * as React from 'react'
import { User, Mail, Phone, Linkedin, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ContactData } from '@/types/workspace'

interface ContactHeaderProps {
  contact: ContactData
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-success-100 text-success-700 border-success-200',
  inactive: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
  prospect: 'bg-blue-100 text-blue-700 border-blue-200',
  lead: 'bg-amber-100 text-amber-700 border-amber-200',
  qualified: 'bg-purple-100 text-purple-700 border-purple-200',
  placed: 'bg-gold-100 text-gold-700 border-gold-200',
  bench: 'bg-orange-100 text-orange-700 border-orange-200',
}

const TYPE_LABELS: Record<string, string> = {
  candidate: 'Candidate',
  lead: 'Lead',
  prospect: 'Prospect',
  client_poc: 'Client Contact',
  vendor_poc: 'Vendor Contact',
  employee: 'Employee',
  general: 'Contact',
}

/**
 * ContactHeader - Entity header showing name, status, types, and quick actions
 */
export function ContactHeader({ contact }: ContactHeaderProps) {
  const statusStyle = STATUS_STYLES[contact.status] || STATUS_STYLES.active

  // Build subtitle parts
  const subtitleParts: string[] = []
  if (contact.title) subtitleParts.push(contact.title)
  if (contact.company) subtitleParts.push(`@ ${contact.company.name}`)
  if (contact.city && contact.state) subtitleParts.push(`${contact.city}, ${contact.state}`)

  // Get owner display
  const ownerDisplay = contact.owner?.fullName

  return (
    <div className="bg-white rounded-lg border border-charcoal-200 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-charcoal-600" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="text-2xl font-semibold text-charcoal-900 truncate">
              {contact.fullName}
            </h1>
            <Badge className={cn('capitalize', statusStyle)}>
              {contact.status}
            </Badge>
            {/* Type badges */}
            {contact.types.map((type) => (
              <Badge key={type} variant="outline" className="text-xs">
                {TYPE_LABELS[type] || type}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 text-charcoal-500 text-sm flex-wrap">
            {subtitleParts.length > 0 && (
              <span>{subtitleParts.join(' \u2022 ')}</span>
            )}
            {ownerDisplay && (
              <>
                {subtitleParts.length > 0 && <span>\u2022</span>}
                <span>Owner: {ownerDisplay}</span>
              </>
            )}
          </div>
          {/* Contact info row */}
          <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-600">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1 hover:text-charcoal-900"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1 hover:text-charcoal-900"
              >
                <Phone className="h-4 w-4" />
                {contact.phone}
              </a>
            )}
            {contact.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {contact.company.name}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {contact.phone && (
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${contact.phone}`}>
                <Phone className="h-4 w-4 mr-1" />
                Call
              </a>
            </Button>
          )}
          {contact.email && (
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${contact.email}`}>
                <Mail className="h-4 w-4 mr-1" />
                Email
              </a>
            </Button>
          )}
          {contact.linkedinUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={contact.linkedinUrl} target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4 mr-1" />
                LinkedIn
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactHeader
