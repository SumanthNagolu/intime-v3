'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User, Mail, Phone, Building2, DollarSign, Calendar, Target, ExternalLink, TrendingUp
} from 'lucide-react'
import type { DealData, DealAccountInfo, DealStakeholder, DealActivity } from '@/types/deal'
import { formatDistanceToNow, format } from 'date-fns'

interface DealSummarySectionProps {
  deal: DealData
  account: DealAccountInfo | null
  stakeholders: DealStakeholder[]
  activities: DealActivity[]
  onNavigate: (section: string) => void
}

export function DealSummarySection({
  deal,
  account,
  stakeholders,
  activities,
  onNavigate
}: DealSummarySectionProps) {
  const recentActivities = activities.slice(0, 3)
  const keyContacts = stakeholders.filter(s => s.isPrimary || s.role === 'champion' || s.role === 'decision_maker').slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Deal Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Deal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Deal Name" value={deal.title} />
            <InfoRow label="Stage" value={formatStage(deal.stage)} icon={Target} />
            <InfoRow label="Value" value={`$${deal.value.toLocaleString()}`} icon={DollarSign} />
            <InfoRow label="Probability" value={`${deal.probability}%`} icon={TrendingUp} />
            <InfoRow label="Weighted Value" value={`$${deal.weightedValue.toLocaleString()}`} icon={DollarSign} />
            <InfoRow label="Owner" value={deal.owner?.fullName || 'Unassigned'} icon={User} />
            <InfoRow
              label="Created"
              value={formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
              icon={Calendar}
            />
            {deal.expectedCloseDate && (
              <InfoRow
                label="Expected Close"
                value={format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                icon={Calendar}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deal.nextStep ? (
              <div className="p-4 bg-charcoal-50 rounded-lg">
                <p className="text-sm text-charcoal-700">{deal.nextStep}</p>
                {deal.nextStepDate && (
                  <p className="text-xs text-charcoal-500 mt-2">
                    Due: {format(new Date(deal.nextStepDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-charcoal-500">No next step defined</p>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-charcoal-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-charcoal-500">Days in Stage:</span>
                <span className="text-sm font-medium">{deal.daysInStage}</span>
              </div>
              {deal.healthStatus && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-charcoal-500">Health:</span>
                  <span className={`text-sm font-medium ${getHealthColor(deal.healthStatus)}`}>
                    {formatHealthStatus(deal.healthStatus)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Preview */}
      {account && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Account</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('account')}>
              View Details
              <ExternalLink className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-charcoal-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-charcoal-900">{account.name}</h3>
                <p className="text-sm text-charcoal-600">{account.industry || 'No industry'}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-charcoal-500">
                  {account.employeeCount && <span>{account.employeeCount.toLocaleString()} employees</span>}
                  {account.revenue && <span>{account.revenue} revenue</span>}
                  {account.location && <span>{account.location}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Contacts Preview */}
      {keyContacts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Key Contacts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('contacts')}>
              View All ({stakeholders.length})
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {keyContacts.map((contact) => (
                <div key={contact.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-charcoal-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900">{contact.name}</p>
                    <p className="text-xs text-charcoal-600">
                      {contact.title}{contact.role && ` • ${formatRole(contact.role)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                      >
                        <Mail className="w-4 h-4 text-charcoal-500" />
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                      >
                        <Phone className="w-4 h-4 text-charcoal-500" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

function formatStage(stage: string): string {
  const stages: Record<string, string> = {
    discovery: 'Discovery',
    qualification: 'Qualification',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    verbal_commit: 'Verbal Commit',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost',
  }
  return stages[stage] || stage
}

function formatRole(role: string): string {
  const roles: Record<string, string> = {
    champion: 'Champion',
    decision_maker: 'Decision Maker',
    influencer: 'Influencer',
    blocker: 'Blocker',
    end_user: 'End User',
  }
  return roles[role] || role
}

function formatHealthStatus(status: string): string {
  const statuses: Record<string, string> = {
    on_track: 'On Track',
    slow: 'Slow',
    stale: 'Stale',
    urgent: 'Urgent',
    at_risk: 'At Risk',
  }
  return statuses[status] || status
}

function getHealthColor(status: string): string {
  const colors: Record<string, string> = {
    on_track: 'text-green-600',
    slow: 'text-amber-600',
    stale: 'text-orange-600',
    urgent: 'text-red-600',
    at_risk: 'text-red-600',
  }
  return colors[status] || 'text-charcoal-600'
}

export default DealSummarySection
