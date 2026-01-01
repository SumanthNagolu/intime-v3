'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, ArrowRight, MapPin, Mail, Phone, Linkedin, Globe, Briefcase } from 'lucide-react'
import type { ContactData, ContactAccount, ContactActivity } from '@/types/workspace'
import { formatDistanceToNow } from 'date-fns'

interface ContactSummarySectionProps {
  contact: ContactData
  accounts: ContactAccount[]
  activities: ContactActivity[]
  onNavigate: (section: string) => void
}

/**
 * ContactSummarySection - Summary screen with details + embedded tables
 */
export function ContactSummarySection({
  contact,
  accounts,
  activities,
  onNavigate,
}: ContactSummarySectionProps) {
  const recentActivities = activities.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Contact Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact Details</CardTitle>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailRow label="First Name" value={contact.firstName} />
            <DetailRow label="Last Name" value={contact.lastName} />
            <DetailRow label="Title" value={contact.title} />
            <DetailRow label="Department" value={contact.department} />
            <DetailRow label="Email" value={contact.email} icon={<Mail className="h-4 w-4 text-charcoal-400" />} />
            <DetailRow label="Phone" value={contact.phone} icon={<Phone className="h-4 w-4 text-charcoal-400" />} />
            <DetailRow label="Mobile" value={contact.mobile} icon={<Phone className="h-4 w-4 text-charcoal-400" />} />
            <DetailRow label="LinkedIn" value={contact.linkedinUrl} icon={<Linkedin className="h-4 w-4 text-charcoal-400" />} />
            <DetailRow label="Category" value={contact.category} />
            <DetailRow label="Status" value={contact.status} />
          </div>
        </CardContent>
      </Card>

      {/* Address Card */}
      {(contact.street || contact.city) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </CardTitle>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-charcoal-600">
              {contact.street && <div>{contact.street}</div>}
              {(contact.city || contact.state || contact.zip) && (
                <div>
                  {[contact.city, contact.state, contact.zip].filter(Boolean).join(', ')}
                </div>
              )}
              {contact.country && <div>{contact.country}</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate-specific fields */}
      {contact.types.includes('candidate') && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Candidate Info
            </CardTitle>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <DetailRow label="Status" value={contact.candidateStatus} />
              <DetailRow label="Experience" value={contact.candidateExperienceYears ? `${contact.candidateExperienceYears} years` : null} />
              <DetailRow label="Hourly Rate" value={contact.candidateHourlyRate ? `$${contact.candidateHourlyRate}/hr` : null} />
              <DetailRow label="Visa Status" value={contact.candidateCurrentVisa} />
              {contact.candidateSkills && contact.candidateSkills.length > 0 && (
                <div className="col-span-2">
                  <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {contact.candidateSkills.slice(0, 10).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 text-xs bg-charcoal-100 text-charcoal-700 rounded">
                        {skill}
                      </span>
                    ))}
                    {contact.candidateSkills.length > 10 && (
                      <span className="text-xs text-charcoal-500">+{contact.candidateSkills.length - 10} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lead-specific fields */}
      {contact.types.includes('lead') && (
        <Card>
          <CardHeader>
            <CardTitle>Lead Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <DetailRow label="Lead Status" value={contact.leadStatus} />
              <DetailRow label="Lead Score" value={contact.leadScore?.toString()} />
              <DetailRow label="Lead Source" value={contact.leadSource} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Linked Accounts */}
      {accounts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Linked Accounts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('accounts')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-charcoal-100">
              {accounts.slice(0, 3).map((account) => (
                <div key={account.id} className="py-2 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-charcoal-900">{account.name}</div>
                    <div className="text-sm text-charcoal-500">
                      {account.role} {account.industry && `\u2022 ${account.industry}`}
                    </div>
                  </div>
                  {account.isPrimary && (
                    <span className="text-xs px-2 py-0.5 bg-gold-100 text-gold-700 rounded">Primary</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activities */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activities</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-charcoal-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-charcoal-900">{activity.subject}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      activity.status === 'completed' ? 'bg-success-100 text-success-700' :
                      activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                  <div className="text-sm text-charcoal-500">
                    {activity.type} \u2022 {activity.assignedTo} \u2022{' '}
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
}) {
  return (
    <div>
      <div className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-sm text-charcoal-900 flex items-center gap-2">
        {icon}
        {value || <span className="text-charcoal-400">-</span>}
      </div>
    </div>
  )
}

export default ContactSummarySection
