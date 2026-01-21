'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Users, Target, TrendingUp, BarChart3, ArrowRight, Mail,
  Megaphone, Calendar, DollarSign, MessageSquare, CheckCircle2,
  Activity, Clock, Zap, Send, MousePointerClick, UserPlus,
  Linkedin, Phone, ExternalLink, Play, Pause
} from 'lucide-react'
import type {
  CampaignData,
  CampaignProspect,
  CampaignLead,
  CampaignFunnel,
  CampaignSequenceStep,
  CampaignActivity
} from '@/types/campaign'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface CampaignOverviewSectionProps {
  campaign: CampaignData
  prospects: CampaignProspect[]
  leads: CampaignLead[]
  funnel: CampaignFunnel
  sequence: CampaignSequenceStep[]
  activities: CampaignActivity[]
  onNavigate: (section: string) => void
}

const CHANNEL_ICONS: Record<string, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  phone: Phone,
  sms: MessageSquare,
}

const CHANNEL_COLORS: Record<string, string> = {
  email: 'bg-blue-100 text-blue-600',
  linkedin: 'bg-sky-100 text-sky-600',
  phone: 'bg-emerald-100 text-emerald-600',
  sms: 'bg-purple-100 text-purple-600',
}

/**
 * CampaignOverviewSection - Premium SaaS-level Summary view
 * Features: Glassmorphism, rich gradients, sophisticated animations
 */
export function CampaignOverviewSection({
  campaign,
  prospects,
  leads,
  funnel,
  sequence,
  activities,
  onNavigate,
}: CampaignOverviewSectionProps) {
  const recentActivities = activities.slice(0, 5)

  // Calculate metrics
  const audienceSize = campaign.audienceSize || prospects.length
  const leadsGenerated = campaign.leadsGenerated || leads.length
  const targetLeads = campaign.targetLeads || 0
  const leadsProgress = targetLeads > 0 ? Math.round((leadsGenerated / targetLeads) * 100) : 0

  const meetingsBooked = campaign.meetingsBooked || 0
  const targetMeetings = campaign.targetMeetings || 0
  const meetingsProgress = targetMeetings > 0 ? Math.round((meetingsBooked / targetMeetings) * 100) : 0

  const responseRate = funnel.responseRate || 0
  const conversionRate = funnel.conversionRate || 0

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid - Clean monochromatic design */}
      <div className="grid grid-cols-4 gap-4">
        {/* Prospects/Audience */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(0)}
          onClick={() => onNavigate('prospects')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Prospects</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {audienceSize.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <Users className="h-3 w-3" />
                  {funnel.contacted.toLocaleString()} contacted
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Users className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Leads Generated */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(1)}
          onClick={() => onNavigate('leads')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Leads Generated</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {leadsGenerated}
                </span>
                {targetLeads > 0 && (
                  <span className="text-sm text-charcoal-400">/ {targetLeads}</span>
                )}
              </div>
              {targetLeads > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-charcoal-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(leadsProgress, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-charcoal-500">{leadsProgress}%</span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <UserPlus className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Conversion Rate */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(2)}
          onClick={() => onNavigate('funnel')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Conversion Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <TrendingUp className="h-3 w-3" />
                  {responseRate.toFixed(1)}% response rate
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Target className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Engagement Rate */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(3)}
          onClick={() => onNavigate('analytics')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Engagement Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {funnel.openRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <MousePointerClick className="h-3 w-3" />
                  {funnel.opened.toLocaleString()} opened
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <BarChart3 className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Campaign Details Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Megaphone className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Campaign Details</h3>
                    <p className="text-xs text-charcoal-500">Campaign configuration and settings</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoField
                  label="Campaign Type"
                  value={campaign.campaignType?.replace(/_/g, ' ')}
                  icon={Target}
                  capitalize
                />
                <InfoField
                  label="Goal"
                  value={campaign.goal}
                  icon={Target}
                />
                <div>
                  <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-1.5">Channels</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(campaign.channels || []).map((channel) => {
                      const ChannelIcon = CHANNEL_ICONS[channel] || Mail
                      const colorClass = CHANNEL_COLORS[channel] || 'bg-charcoal-100 text-charcoal-600'
                      return (
                        <span key={channel} className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium capitalize', colorClass)}>
                          <ChannelIcon className="h-3 w-3" />
                          {channel}
                        </span>
                      )
                    })}
                    {(!campaign.channels || campaign.channels.length === 0) && (
                      <span className="text-sm text-charcoal-400">No channels configured</span>
                    )}
                  </div>
                </div>
                <InfoField
                  label="Date Range"
                  value={
                    campaign.startDate
                      ? `${format(new Date(campaign.startDate), 'MMM d, yyyy')}${campaign.endDate ? ` - ${format(new Date(campaign.endDate), 'MMM d, yyyy')}` : ''}`
                      : null
                  }
                  icon={Calendar}
                />
                {campaign.description && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-1.5">Description</p>
                    <p className="text-sm text-charcoal-700 leading-relaxed">{campaign.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Funnel Preview Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Funnel Overview</h3>
                    <p className="text-xs text-charcoal-500">Campaign pipeline progression</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('funnel')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100">
                  View Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <FunnelPreview funnel={funnel} />
            </div>
          </div>

          {/* Sequence Preview Card */}
          {sequence.length > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
              <div className="px-6 py-4 border-b border-charcoal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Send className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal-900">Outreach Sequence</h3>
                      <p className="text-xs text-charcoal-500">{sequence.length} step{sequence.length > 1 ? 's' : ''} configured</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('sequence')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100">
                    Edit Sequence <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <SequencePreview sequence={sequence.slice(0, 4)} />
              </div>
            </div>
          )}

          {/* Recent Activity Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(7)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
                    <p className="text-xs text-charcoal-500">Latest campaign actions</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100">
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {recentActivities.length > 0 ? (
                <div className="space-y-2">
                  {recentActivities.map((activity, idx) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-charcoal-100 bg-charcoal-50/50 hover:bg-charcoal-50 transition-colors"
                      style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-4 w-4 text-charcoal-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-900 truncate">
                          {activity.subject || activity.activityType.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-charcoal-500">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                          {activity.creator && ` by ${activity.creator.fullName}`}
                        </p>
                      </div>
                      <StatusDot status={activity.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
                  <p className="text-sm text-charcoal-500">No recent activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="col-span-4 space-y-6">
          {/* Quick Stats Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-5 py-4 border-b border-charcoal-200/60">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-charcoal-500" />
                <h3 className="font-semibold text-charcoal-900 text-sm">Quick Stats</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <QuickStatRow
                icon={Users}
                label="Total Audience"
                value={funnel.totalProspects.toLocaleString()}
              />
              <QuickStatRow
                icon={Send}
                label="Contacted"
                value={funnel.contacted.toLocaleString()}
              />
              <QuickStatRow
                icon={Mail}
                label="Opened"
                value={funnel.opened.toLocaleString()}
              />
              <QuickStatRow
                icon={MousePointerClick}
                label="Clicked"
                value={funnel.clicked.toLocaleString()}
              />
              <QuickStatRow
                icon={MessageSquare}
                label="Responded"
                value={funnel.responded.toLocaleString()}
              />
              <QuickStatRow
                icon={UserPlus}
                label="Leads"
                value={funnel.leads.toLocaleString()}
              />
              <QuickStatRow
                icon={Calendar}
                label="Meetings"
                value={funnel.meetings.toLocaleString()}
              />
            </div>
          </div>

          {/* Budget Card (if budget is set) */}
          {(campaign.budgetTotal || campaign.budgetSpent) && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">Budget</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-charcoal-900">
                    ${(campaign.budgetSpent || 0).toLocaleString()}
                  </span>
                  {campaign.budgetTotal && (
                    <span className="text-sm text-charcoal-400">
                      / ${campaign.budgetTotal.toLocaleString()}
                    </span>
                  )}
                </div>
                {campaign.budgetTotal && (
                  <div className="space-y-1">
                    <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-charcoal-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(((campaign.budgetSpent || 0) / campaign.budgetTotal) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-charcoal-500">
                      {Math.round(((campaign.budgetSpent || 0) / campaign.budgetTotal) * 100)}% spent
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meetings Progress Card */}
          {targetMeetings > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">Meetings Target</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-charcoal-900">
                    {meetingsBooked}
                  </span>
                  <span className="text-sm text-charcoal-400">
                    / {targetMeetings}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-charcoal-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(meetingsProgress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-charcoal-500">
                    {meetingsProgress}% of target
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper Components

function InfoField({
  label,
  value,
  icon: Icon,
  href,
  capitalize = false,
}: {
  label: string
  value: string | null | undefined
  icon?: typeof Mail
  href?: string
  capitalize?: boolean
}) {
  return (
    <div>
      <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400" />}
        {value ? (
          href ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-gold-600 hover:text-gold-700 hover:underline">
              {capitalize ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : value}
            </a>
          ) : (
            <span className={cn("text-sm text-charcoal-700", capitalize && "capitalize")}>
              {capitalize ? value.replace(/_/g, ' ') : value}
            </span>
          )
        ) : (
          <span className="text-sm text-charcoal-400">Not set</span>
        )}
      </div>
    </div>
  )
}

function QuickStatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
          <Icon className="h-4 w-4 text-charcoal-500" />
        </div>
        <span className="text-sm text-charcoal-600">{label}</span>
      </div>
      <span className="text-lg font-semibold text-charcoal-900">{value}</span>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    completed: 'bg-success-500',
    pending: 'bg-amber-500',
    open: 'bg-blue-500',
    cancelled: 'bg-charcoal-300',
  }
  return (
    <span className={cn('w-2 h-2 rounded-full', colors[status] || 'bg-charcoal-300')} />
  )
}

function FunnelPreview({ funnel }: { funnel: CampaignFunnel }) {
  const stages = [
    { label: 'Audience', value: funnel.totalProspects, color: 'bg-charcoal-600' },
    { label: 'Contacted', value: funnel.contacted, color: 'bg-charcoal-500' },
    { label: 'Opened', value: funnel.opened, color: 'bg-charcoal-400' },
    { label: 'Clicked', value: funnel.clicked, color: 'bg-charcoal-400' },
    { label: 'Responded', value: funnel.responded, color: 'bg-charcoal-500' },
    { label: 'Leads', value: funnel.leads, color: 'bg-charcoal-600' },
  ]

  const maxValue = Math.max(...stages.map(s => s.value), 1)

  return (
    <div className="space-y-3">
      {stages.map((stage, idx) => (
        <div key={stage.label} className="flex items-center gap-3">
          <div className="w-20 text-xs font-medium text-charcoal-500 text-right">{stage.label}</div>
          <div className="flex-1 h-6 bg-charcoal-100 rounded-md overflow-hidden relative">
            <div
              className={cn('h-full rounded-md transition-all duration-500', stage.color)}
              style={{ width: `${(stage.value / maxValue) * 100}%`, animationDelay: `${idx * 100}ms` }}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-charcoal-600">
              {stage.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function SequencePreview({ sequence }: { sequence: CampaignSequenceStep[] }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {sequence.map((step, idx) => {
        const ChannelIcon = CHANNEL_ICONS[step.channel] || Mail
        const colorClass = CHANNEL_COLORS[step.channel] || 'bg-charcoal-100 text-charcoal-600'
        const isCompleted = step.status === 'completed'
        const isInProgress = step.status === 'in_progress'

        return (
          <React.Fragment key={step.id}>
            <div className={cn(
              'flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200',
              isCompleted && 'bg-success-50 border-success-200',
              isInProgress && 'bg-blue-50 border-blue-200',
              !isCompleted && !isInProgress && 'bg-white border-charcoal-200'
            )}>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClass)}>
                <ChannelIcon className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-medium text-charcoal-600 uppercase tracking-wider">
                Day {step.dayOffset || idx + 1}
              </span>
              <span className="text-xs text-charcoal-500 capitalize">{step.channel}</span>
            </div>
            {idx < sequence.length - 1 && (
              <ArrowRight className="h-4 w-4 text-charcoal-300 flex-shrink-0" />
            )}
          </React.Fragment>
        )
      })}
      {sequence.length === 0 && (
        <div className="text-center py-4 w-full">
          <Send className="h-6 w-6 text-charcoal-300 mx-auto mb-1" />
          <p className="text-xs text-charcoal-400">No sequence configured</p>
        </div>
      )}
    </div>
  )
}

export default CampaignOverviewSection
