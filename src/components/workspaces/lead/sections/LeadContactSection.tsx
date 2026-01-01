'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User, Mail, Phone, Building2, MapPin, Globe,
  Linkedin, ExternalLink
} from 'lucide-react'
import type { LeadContactInfo } from '@/types/lead'
import Link from 'next/link'

interface LeadContactSectionProps {
  contact: LeadContactInfo
  leadId: string
}

export function LeadContactSection({ contact }: LeadContactSectionProps) {
  return (
    <div className="space-y-6">
      {/* Contact Profile */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">Contact Profile</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/employee/contacts/${contact.id}`}>
                View Contact
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center">
              <User className="w-8 h-8 text-charcoal-600" />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              <InfoItem label="Full Name" value={contact.fullName} />
              <InfoItem label="Title" value={contact.title} />
              <InfoItem label="Department" value={contact.department} />
              <InfoItem label="Work Email" value={contact.email} icon={Mail} isLink />
              <InfoItem label="Work Phone" value={contact.phone} icon={Phone} />
              <InfoItem label="Mobile" value={contact.mobile} icon={Phone} />
              {contact.linkedinUrl && (
                <InfoItem
                  label="LinkedIn"
                  value={contact.linkedinUrl}
                  icon={Linkedin}
                  isLink
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      {contact.companyName && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Company Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Company" value={contact.companyName} icon={Building2} />
              <InfoItem label="Industry" value={contact.companyIndustry} />
              <InfoItem label="Employees" value={contact.companySize?.toLocaleString()} />
              <InfoItem label="Revenue" value={contact.companyRevenue} />
              <InfoItem label="Website" value={contact.companyWebsite} icon={Globe} isLink />
              <InfoItem label="Location" value={contact.companyLocation} icon={MapPin} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoItem({
  label,
  value,
  icon: Icon,
  isLink
}: {
  label: string
  value: string | number | null | undefined
  icon?: React.ElementType
  isLink?: boolean
}) {
  if (!value) {
    return (
      <div>
        <p className="text-sm text-charcoal-500">{label}</p>
        <p className="text-charcoal-400">-</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-charcoal-500">{label}</p>
      <p className="flex items-center gap-2 text-charcoal-900">
        {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
        {isLink ? (
          <a
            href={String(value).startsWith('http') ? String(value) : `mailto:${value}`}
            className="text-gold-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  )
}
