'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  User, Mail, Phone, Building2, Calendar,
  Target, ExternalLink, Activity, ArrowRight,
  Clock, Zap, CheckCircle2, BarChart3,
  DollarSign, TrendingUp, ClipboardCheck,
  Megaphone, Users, Sparkles, MessageSquare,
  Heart,
} from 'lucide-react'
import type { LeadData, LeadContactInfo, LeadActivity, LeadCampaign } from '@/types/lead'
import { formatDistanceToNow, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface LeadSummarySectionProps {
  lead: LeadData
  contact: LeadContactInfo
  activities: LeadActivity[]
  campaigns: LeadCampaign[]
  onNavigate: (section: string) => void
}

/**
 * LeadSummarySection - Hublot-inspired premium overview
 * Features: KPI cards grid, contact preview, BANT preview, recent activity
 */
export function LeadSummarySection({
  lead,
  contact,
  activities,
  campaigns,
  onNavigate,
}: LeadSummarySectionProps) {
  const recentActivities = activities.slice(0, 5)
  const pendingActivities = activities.filter(a =>
    a.status !== 'completed' && a.status !== 'cancelled'
  ).slice(0, 3)

  // Calculate metrics
  const bantScore = lead.bantTotalScore ?? 0
  const engagementScore = lead.score ?? calculateEngagementScore(activities)
  const daysInPipeline = differenceInDays(new Date(), new Date(lead.createdAt))
  const daysSinceLastContact = lead.lastContactedAt
    ? differenceInDays(new Date(), new Date(lead.lastContactedAt))
    : null

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid - 4 columns */}
      <div className="grid grid-cols-4 gap-4">
        {/* BANT Score */}
        <KPICard
          label="BANT Score"
          value={bantScore}
          suffix="/100"
          subtitle={getBANTLabel(bantScore)}
          icon={ClipboardCheck}
          delay={0}
          onClick={() => onNavigate('qualification')}
          variant={getBANTVariant(bantScore)}
        />

        {/* Engagement Score */}
        <KPICard
          label="Engagement"
          value={engagementScore}
          suffix="/100"
          subtitle={getEngagementLabel(engagementScore)}
          icon={BarChart3}
          delay={1}
          onClick={() => onNavigate('engagement')}
          variant={getEngagementVariant(engagementScore)}
        />

        {/* Days in Pipeline */}
        <KPICard
          label="Days in Pipeline"
          value={daysInPipeline}
          suffix=" days"
          subtitle={getDaysLabel(daysInPipeline)}
          icon={Clock}
          delay={2}
          variant={getDaysVariant(daysInPipeline)}
        />

        {/* Last Contact */}
        <KPICard
          label="Last Contact"
          value={daysSinceLastContact ?? '—'}
          suffix={daysSinceLastContact !== null ? ' days ago' : ''}
          subtitle={getLastContactLabel(daysSinceLastContact)}
          icon={Phone}
          delay={3}
          variant={getLastContactVariant(daysSinceLastContact)}
        />
      </div>

      {/* Main Content Grid - 8 + 4 columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Contact Preview Card */}
          <div
            className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
            style={getDelay(4)}
          >
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Contact Information</h3>
                    <p className="text-xs text-charcoal-500">Lead profile and company details</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('contact')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View Full
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-charcoal-200 to-charcoal-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-charcoal-700">
                    {contact.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-charcoal-900 text-lg">{contact.fullName}</h4>
                  <p className="text-sm text-charcoal-600">
                    {contact.title}
                    {contact.companyName && ` at ${contact.companyName}`}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-gold-600 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-1.5 text-sm text-charcoal-500 hover:text-gold-600 transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {contact.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Info */}
              {contact.companyName && (
                <div className="pt-4 border-t border-charcoal-100">
                  <div className="grid grid-cols-3 gap-4">
                    <InfoField label="Company" value={contact.companyName} icon={Building2} />
                    <InfoField label="Industry" value={contact.companyIndustry} />
                    <InfoField
                      label="Employees"
                      value={contact.companySize?.toLocaleString()}
                      icon={Users}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BANT Preview Card */}
          <div
            className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
            style={getDelay(5)}
          >
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <ClipboardCheck className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Qualification Score (BANT)</h3>
                    <p className="text-xs text-charcoal-500">Budget, Authority, Need, Timeline</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('qualification')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Details
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-6">
                <BANTMetric label="Budget" score={lead.bantBudget ?? 0} />
                <BANTMetric label="Authority" score={lead.bantAuthority ?? 0} />
                <BANTMetric label="Need" score={lead.bantNeed ?? 0} />
                <BANTMetric label="Timeline" score={lead.bantTimeline ?? 0} />
              </div>
              <div className="mt-4 pt-4 border-t border-charcoal-100 flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal-700">Total Score</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-2xl font-bold",
                    bantScore >= 75 ? "text-success-600" :
                    bantScore >= 50 ? "text-amber-600" :
                    bantScore >= 25 ? "text-charcoal-600" :
                    "text-charcoal-400"
                  )}>
                    {bantScore}
                  </span>
                  <span className="text-sm text-charcoal-400">/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items Card */}
          <div
            className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
            style={getDelay(6)}
          >
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Action Items</h3>
                    <p className="text-xs text-charcoal-500">Pending tasks and follow-ups</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('activities')}
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                >
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {pendingActivities.length > 0 ? (
                <div className="space-y-2">
                  {pendingActivities.map((activity, idx) => (
                    <ActivityRow key={activity.id} activity={activity} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-success-100 to-success-50 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle2 className="h-7 w-7 text-success-600" />
                  </div>
                  <p className="text-sm font-medium text-charcoal-700">All caught up!</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">No pending tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="col-span-4 space-y-6">
          {/* Lead Owner Card */}
          {lead.owner && (
            <div
              className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
              style={getDelay(4)}
            >
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Lead Owner</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center">
                    {lead.owner.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={lead.owner.avatarUrl}
                        alt={lead.owner.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-base font-semibold text-charcoal-700">
                        {lead.owner.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal-900 truncate">{lead.owner.fullName}</p>
                    <p className="text-xs text-charcoal-500">Owner</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Source Preview Card */}
          <div
            className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
            style={getDelay(5)}
          >
            <div className="px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Megaphone className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Lead Source</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('source')}
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 h-7 px-2"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider">Source</span>
                <Badge variant="outline" className="text-charcoal-700">
                  {formatSource(lead.source)}
                </Badge>
              </div>
              {campaigns.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 uppercase tracking-wider">Campaign</span>
                  <span className="text-sm font-medium text-charcoal-900 truncate max-w-[140px]">
                    {campaigns[0].name}
                  </span>
                </div>
              )}
              {lead.estimatedValue && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 uppercase tracking-wider">Est. Value</span>
                  <span className="text-sm font-medium text-charcoal-900">
                    ${lead.estimatedValue.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div
            className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up"
            style={getDelay(6)}
          >
            <div className="px-5 py-4 border-b border-charcoal-200/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-charcoal-500" />
                <h3 className="font-semibold text-charcoal-900 text-sm">Quick Stats</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <QuickStatRow
                icon={Activity}
                label="Activities"
                value={activities.length}
              />
              <QuickStatRow
                icon={MessageSquare}
                label="Touchpoints"
                value={activities.filter(a => ['call', 'email', 'meeting'].includes(a.type)).length}
              />
              <QuickStatRow
                icon={TrendingUp}
                label="Probability"
                value={lead.probability ? `${lead.probability}%` : '—'}
              />
              <div className="pt-3 border-t border-charcoal-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">Status</span>
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      <div
        className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up"
        style={getDelay(7)}
      >
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
                <p className="text-xs text-charcoal-500">Latest interactions with this lead</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('engagement')}
              className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
            >
              View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
        <div className="divide-y divide-charcoal-100">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-charcoal-50/50 transition-colors group cursor-pointer"
                style={{ animationDelay: `${(idx + 1) * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-charcoal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-900 truncate">
                    {activity.subject}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-5 capitalize">
                      {activity.type?.replace(/_/g, ' ')}
                    </Badge>
                    {activity.assignedTo && (
                      <>
                        <span className="text-xs text-charcoal-400">•</span>
                        <span className="text-xs text-charcoal-500">{activity.assignedTo}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-charcoal-400">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Activity className="h-7 w-7 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">No recent activity</p>
              <p className="text-xs text-charcoal-400 mt-0.5">Activities will appear here once logged</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface KPICardProps {
  label: string
  value: number | string
  suffix?: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  delay: number
  onClick?: () => void
  variant?: 'success' | 'warning' | 'error' | 'neutral'
}

function KPICard({ label, value, suffix, subtitle, icon: Icon, delay, onClick, variant = 'neutral' }: KPICardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in",
        onClick && "cursor-pointer"
      )}
      style={{ animationDelay: `${delay * 75}ms` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-3xl font-bold tracking-tight",
              variant === 'success' && "text-charcoal-900",
              variant === 'warning' && "text-amber-600",
              variant === 'error' && "text-error-600",
              variant === 'neutral' && "text-charcoal-700"
            )}>
              {value}
            </span>
            {suffix && <span className="text-sm text-charcoal-400">{suffix}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "inline-flex items-center gap-1.5 text-xs font-medium",
              variant === 'success' && "text-success-600",
              variant === 'warning' && "text-amber-600",
              variant === 'error' && "text-error-600",
              variant === 'neutral' && "text-charcoal-500"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                variant === 'success' && "bg-success-500",
                variant === 'warning' && "bg-amber-500",
                variant === 'error' && "bg-error-500",
                variant === 'neutral' && "bg-charcoal-400"
              )} />
              {subtitle}
            </span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
          <Icon className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
        </div>
      </div>
      {onClick && (
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
      )}
    </div>
  )
}

function BANTMetric({ label, score }: { label: string; score: number }) {
  const percentage = (score / 25) * 100
  return (
    <div className="text-center">
      <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="4"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={score >= 20 ? '#0A8754' : score >= 13 ? '#D97706' : '#9CA3AF'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 175.93} 175.93`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-charcoal-900">
          {score}
        </span>
      </div>
      <p className="text-[10px] text-charcoal-400">/25</p>
    </div>
  )
}

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number | null | undefined
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400 shrink-0" />}
        <span className={cn(
          "text-sm",
          value ? "text-charcoal-900" : "text-charcoal-400 italic"
        )}>
          {value || '—'}
        </span>
      </div>
    </div>
  )
}

function ActivityRow({ activity, index }: { activity: LeadActivity; index: number }) {
  const dueDate = activity.dueDate ? new Date(activity.dueDate) : null
  const isOverdue = dueDate && dueDate < new Date()
  const isToday = dueDate && new Date(dueDate).toDateString() === new Date().toDateString()

  return (
    <div
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer",
        isOverdue ? "border-error-200 bg-error-50/50 hover:bg-error-50" :
        isToday ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50" :
        "border-charcoal-100 bg-charcoal-50/50 hover:bg-charcoal-50"
      )}
      style={{ animationDelay: `${(index + 1) * 50}ms` }}
    >
      <div className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
        isOverdue ? "bg-error-100" :
        isToday ? "bg-amber-100" :
        "bg-charcoal-100"
      )}>
        {isOverdue ? (
          <Clock className="h-4 w-4 text-error-600" />
        ) : isToday ? (
          <Clock className="h-4 w-4 text-amber-600" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-charcoal-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">{activity.subject}</p>
        <p className="text-xs text-charcoal-500 truncate">{activity.assignedTo}</p>
      </div>
      {dueDate && (
        <Badge
          variant="outline"
          className={cn(
            "text-xs shrink-0 font-medium",
            isOverdue ? "border-error-300 text-error-700 bg-error-50" :
            isToday ? "border-amber-300 text-amber-700 bg-amber-50" :
            "border-charcoal-200 text-charcoal-600 bg-charcoal-50"
          )}
        >
          {isOverdue ? 'Overdue' : isToday ? 'Due Today' : formatDistanceToNow(dueDate, { addSuffix: true })}
        </Badge>
      )}
      <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </div>
  )
}

function QuickStatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
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

function LeadStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    new: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    contacted: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    qualified: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    converted: { bg: 'bg-gold-50', text: 'text-gold-700', dot: 'bg-gold-500' },
    lost: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  }
  const statusConfig = config[status] || config.new

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
      statusConfig.bg, statusConfig.text
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", statusConfig.dot)} />
      {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateEngagementScore(activities: LeadActivity[]): number {
  // Simple engagement score based on activity count and recency
  const recentActivityCount = activities.filter(a => {
    const daysSince = differenceInDays(new Date(), new Date(a.createdAt))
    return daysSince <= 30
  }).length
  return Math.min(100, recentActivityCount * 15)
}

function getBANTLabel(score: number): string {
  if (score >= 75) return 'Hot Lead'
  if (score >= 50) return 'Warm Lead'
  if (score >= 25) return 'Cool Lead'
  return 'Cold Lead'
}

function getBANTVariant(score: number): 'success' | 'warning' | 'error' | 'neutral' {
  if (score >= 75) return 'success'
  if (score >= 50) return 'warning'
  if (score >= 25) return 'neutral'
  return 'error'
}

function getEngagementLabel(score: number): string {
  if (score >= 70) return 'Highly Engaged'
  if (score >= 40) return 'Moderately Engaged'
  if (score >= 10) return 'Low Engagement'
  return 'No Activity'
}

function getEngagementVariant(score: number): 'success' | 'warning' | 'error' | 'neutral' {
  if (score >= 70) return 'success'
  if (score >= 40) return 'warning'
  if (score >= 10) return 'neutral'
  return 'error'
}

function getDaysLabel(days: number): string {
  if (days <= 7) return 'Fresh Lead'
  if (days <= 30) return 'Active'
  if (days <= 90) return 'Aging'
  return 'Stale'
}

function getDaysVariant(days: number): 'success' | 'warning' | 'error' | 'neutral' {
  if (days <= 7) return 'success'
  if (days <= 30) return 'neutral'
  if (days <= 90) return 'warning'
  return 'error'
}

function getLastContactLabel(days: number | null): string {
  if (days === null) return 'Never contacted'
  if (days <= 3) return 'Recently'
  if (days <= 7) return 'This week'
  if (days <= 14) return 'Last 2 weeks'
  return 'Overdue'
}

function getLastContactVariant(days: number | null): 'success' | 'warning' | 'error' | 'neutral' {
  if (days === null) return 'error'
  if (days <= 3) return 'success'
  if (days <= 7) return 'neutral'
  if (days <= 14) return 'warning'
  return 'error'
}

function formatSource(source: string | null): string {
  if (!source) return 'Unknown'
  const sourceMap: Record<string, string> = {
    referral: 'Referral',
    website: 'Website',
    cold_call: 'Cold Call',
    linkedin: 'LinkedIn',
    conference: 'Conference',
    partner: 'Partner',
    campaign: 'Campaign',
    inbound: 'Inbound',
    outbound: 'Outbound',
  }
  return sourceMap[source.toLowerCase()] || source.replace(/_/g, ' ')
}

export default LeadSummarySection
