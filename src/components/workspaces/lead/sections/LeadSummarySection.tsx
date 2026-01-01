'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  User, Mail, Phone, Building2,
  DollarSign, Users, Calendar, Target, ExternalLink
} from 'lucide-react'
import type { LeadData, LeadContactInfo, LeadActivity } from '@/types/lead'
import { formatDistanceToNow } from 'date-fns'

interface LeadSummarySectionProps {
  lead: LeadData
  contact: LeadContactInfo
  activities: LeadActivity[]
  onNavigate: (section: string) => void
}

export function LeadSummarySection({ lead, contact, activities, onNavigate }: LeadSummarySectionProps) {
  const recentActivities = activities.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Lead Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Lead Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Lead Score" value={`${lead.bantTotalScore || lead.score || 0}/100`} icon={Target} />
            <InfoRow label="Status" value={lead.status} icon={Target} />
            <InfoRow label="Source" value={lead.source || 'Unknown'} />
            <InfoRow label="Owner" value={lead.owner?.fullName || 'Unassigned'} icon={User} />
            <InfoRow label="Created" value={formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })} icon={Calendar} />
            {lead.lastContactedAt && (
              <InfoRow label="Last Contact" value={formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })} icon={Calendar} />
            )}
            {lead.estimatedValue && (
              <InfoRow label="Est. Value" value={`$${lead.estimatedValue.toLocaleString()}`} icon={DollarSign} />
            )}
            {lead.probability && (
              <InfoRow label="Probability" value={`${lead.probability}%`} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information Preview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">Contact Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('contact')}>
            View Full
            <ExternalLink className="w-4 h-4 ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
              <User className="w-6 h-6 text-charcoal-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-charcoal-900">{contact.fullName}</h3>
              <p className="text-sm text-charcoal-600">
                {contact.title} {contact.companyName && `@ ${contact.companyName}`}
              </p>
              <div className="mt-2 space-y-1 text-sm text-charcoal-600">
                {contact.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {contact.email}
                  </p>
                )}
                {contact.phone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {contact.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Company Info */}
          {contact.companyName && (
            <div className="mt-4 pt-4 border-t border-charcoal-100">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Company" value={contact.companyName} icon={Building2} />
                <InfoRow label="Industry" value={contact.companyIndustry || 'Unknown'} />
                {contact.companySize && (
                  <InfoRow label="Employees" value={contact.companySize.toLocaleString()} icon={Users} />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BANT Score Breakdown */}
      {(lead.bantBudget !== null || lead.bantAuthority !== null || lead.bantNeed !== null || lead.bantTimeline !== null) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Qualification Score (BANT)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <BANTRow
                label="Budget"
                score={lead.bantBudget || 0}
                notes={lead.bantBudgetNotes}
              />
              <BANTRow
                label="Authority"
                score={lead.bantAuthority || 0}
                notes={lead.bantAuthorityNotes}
              />
              <BANTRow
                label="Need"
                score={lead.bantNeed || 0}
                notes={lead.bantNeedNotes}
              />
              <BANTRow
                label="Timeline"
                score={lead.bantTimeline || 0}
                notes={lead.bantTimelineNotes}
              />
              <div className="pt-2 border-t border-charcoal-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Score</span>
                  <span className="text-lg font-bold">{lead.bantTotalScore || 0}/100</span>
                </div>
              </div>
            </div>
            {lead.qualificationNotes && (
              <div className="mt-4 p-3 bg-charcoal-50 rounded-lg">
                <p className="text-sm text-charcoal-600">{lead.qualificationNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Preview */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')}>
              View All ({activities.length})
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gold-500 mt-2" />
                  <div>
                    <p className="text-charcoal-900">{activity.subject}</p>
                    <p className="text-charcoal-500">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
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

function InfoRow({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: string | number | null
  icon?: React.ElementType
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-charcoal-400" />}
      <span className="text-sm text-charcoal-500">{label}:</span>
      <span className="text-sm font-medium text-charcoal-900">{value || '-'}</span>
    </div>
  )
}

function BANTRow({ label, score, notes }: { label: string; score: number; notes: string | null }) {
  const percentage = (score / 25) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-charcoal-600">{label}</span>
        <span className="text-sm font-medium">{score}/25</span>
      </div>
      <Progress value={percentage} className="h-2" />
      {notes && (
        <p className="text-xs text-charcoal-500 mt-1">{notes}</p>
      )}
    </div>
  )
}
