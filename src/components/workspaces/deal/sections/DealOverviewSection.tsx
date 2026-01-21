'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign, TrendingUp, Calendar, Clock, Activity, ArrowRight,
  Building2, User, Users, Target, Briefcase, AlertTriangle, CheckCircle2,
  Mail, Phone, Star, Sparkles, ExternalLink, Zap, Award, FileText
} from 'lucide-react'
import type { DealData, DealAccountInfo, DealStakeholder, DealActivity } from '@/types/deal'
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealOverviewSectionProps {
  deal: DealData
  account: DealAccountInfo | null
  stakeholders: DealStakeholder[]
  activities: DealActivity[]
  onNavigate: (section: string) => void
}

/**
 * DealOverviewSection - Premium Hublot-inspired Overview Dashboard
 *
 * Layout:
 * - KPI Grid (4 columns): Deal Value, Probability, Weighted Value, Days in Stage
 * - Main Content Grid (8 + 4 columns):
 *   - Left: Deal Details, Next Steps, Key Stakeholders
 *   - Right: Account, Owner, Quick Stats
 * - Recent Activity (full width)
 *
 * Follows AccountOverviewSection patterns with monochromatic icons and premium styling.
 */
export function DealOverviewSection({
  deal,
  account,
  stakeholders,
  activities,
  onNavigate
}: DealOverviewSectionProps) {
  const recentActivities = activities.slice(0, 5)
  const keyStakeholders = stakeholders
    .filter(s => s.isPrimary || s.role === 'champion' || s.role === 'decision_maker')
    .slice(0, 3)
  const pendingActivities = activities
    .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
    .slice(0, 5)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  // Health status config
  const healthConfig = getHealthConfig(deal.healthStatus)

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid - Clean monochromatic design */}
      <div className="grid grid-cols-4 gap-4">
        {/* Deal Value */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(0)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Deal Value</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {formatCompactCurrency(deal.value)}
                </span>
              </div>
              {deal.valueBasis && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-charcoal-500 capitalize">
                    {deal.valueBasis.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <DollarSign className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Probability */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(1)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Win Probability</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {deal.probability}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium",
                  healthConfig.textClass
                )}>
                  <span className={cn("w-2 h-2 rounded-full", healthConfig.dotClass)} />
                  {healthConfig.label}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <TrendingUp className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Weighted Value */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(2)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Weighted Value</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {formatCompactCurrency(deal.weightedValue)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <Target className="h-3 w-3" />
                  {deal.probability}% of {formatCompactCurrency(deal.value)}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Award className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Days in Stage */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(3)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Days in Stage</p>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-bold tracking-tight",
                  deal.daysInStage > 30 ? "text-amber-600" : deal.daysInStage > 60 ? "text-error-600" : "text-charcoal-900"
                )}>
                  {deal.daysInStage}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500 capitalize">
                  <Briefcase className="h-3 w-3" />
                  {formatStage(deal.stage)}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Clock className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Deal Details Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Deal Details</h3>
                    <p className="text-xs text-charcoal-500">Core deal information</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('details')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  View
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <DetailField label="Deal Name" value={deal.title} icon={Briefcase} isPrimary />
                <DetailField label="Stage" value={formatStage(deal.stage)} icon={Target} />
                <DetailField label="Value" value={formatCurrency(deal.value)} icon={DollarSign} />
                <DetailField label="Probability" value={`${deal.probability}%`} icon={TrendingUp} />
                <DetailField label="Weighted Value" value={formatCurrency(deal.weightedValue)} icon={Award} />
                <DetailField label="Currency" value={deal.currency || 'USD'} icon={DollarSign} />
                {deal.expectedCloseDate && (
                  <DetailField
                    label="Expected Close"
                    value={format(new Date(deal.expectedCloseDate), 'MMM d, yyyy')}
                    icon={Calendar}
                  />
                )}
                <DetailField
                  label="Created"
                  value={formatDistanceToNow(new Date(deal.createdAt), { addSuffix: true })}
                  icon={Clock}
                />
              </div>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Next Steps</h3>
                    <p className="text-xs text-charcoal-500">Upcoming actions and milestones</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('timeline')}
                >
                  View Timeline <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              {deal.nextStep ? (
                <div className="p-4 bg-charcoal-50 rounded-lg border border-charcoal-100">
                  <p className="text-sm font-medium text-charcoal-900">{deal.nextStep}</p>
                  {deal.nextStepDate && (
                    <p className="text-xs text-charcoal-500 mt-2 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {format(new Date(deal.nextStepDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                    <Zap className="h-6 w-6 text-charcoal-400" />
                  </div>
                  <p className="text-sm text-charcoal-500">No next step defined</p>
                  <p className="text-xs text-charcoal-400 mt-0.5">Add a next step to keep momentum</p>
                </div>
              )}
            </div>
          </div>

          {/* Key Stakeholders Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Key Stakeholders</h3>
                    <p className="text-xs text-charcoal-500">Decision makers and influencers</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('stakeholders')}
                >
                  All ({stakeholders.length}) <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {keyStakeholders.length > 0 ? (
                <div className="space-y-2">
                  {keyStakeholders.map((contact, idx) => (
                    <div
                      key={contact.id}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-charcoal-100 bg-charcoal-50/50 hover:bg-charcoal-50 transition-all duration-200"
                      style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                    >
                      <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-charcoal-700">
                          {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-900 truncate">{contact.name}</p>
                        <p className="text-xs text-charcoal-500 truncate">
                          {contact.title}
                          {contact.role && (
                            <span className="ml-1">
                              • <span className={cn(
                                "font-medium",
                                contact.role === 'champion' && "text-gold-600",
                                contact.role === 'decision_maker' && "text-forest-600",
                                contact.role === 'blocker' && "text-error-600"
                              )}>
                                {formatRole(contact.role)}
                              </span>
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {contact.email && (
                          <a
                            href={`mailto:${contact.email}`}
                            className="p-1.5 hover:bg-charcoal-100 rounded-md transition-colors"
                          >
                            <Mail className="h-4 w-4 text-charcoal-400 hover:text-charcoal-600" />
                          </a>
                        )}
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="p-1.5 hover:bg-charcoal-100 rounded-md transition-colors"
                          >
                            <Phone className="h-4 w-4 text-charcoal-400 hover:text-charcoal-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-charcoal-400" />
                  </div>
                  <p className="text-sm text-charcoal-500">No stakeholders added</p>
                  <p className="text-xs text-charcoal-400 mt-0.5">Add key contacts to track decision makers</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Items Card */}
          {pendingActivities.length > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(7)}>
              <div className="px-6 py-4 border-b border-charcoal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-charcoal-900">Action Items</h3>
                      <p className="text-xs text-charcoal-500">Pending tasks and follow-ups</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                    onClick={() => onNavigate('activities')}
                  >
                    View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {pendingActivities.map((activity, idx) => {
                    const dueDate = activity.dueDate ? new Date(activity.dueDate) : null
                    const isOverdue = dueDate && dueDate < new Date()
                    const isDueToday = dueDate && isToday(dueDate)

                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                          isOverdue ? "border-error-200 bg-error-50/50" :
                            isDueToday ? "border-amber-200 bg-amber-50/50" :
                              "border-charcoal-100 bg-charcoal-50/50"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                          isOverdue ? "bg-error-100" :
                            isDueToday ? "bg-amber-100" :
                              "bg-charcoal-100"
                        )}>
                          {isOverdue ? (
                            <AlertTriangle className="h-4 w-4 text-error-600" />
                          ) : isDueToday ? (
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
                                isDueToday ? "border-amber-300 text-amber-700 bg-amber-50" :
                                  "border-charcoal-200 text-charcoal-600 bg-charcoal-50"
                            )}
                          >
                            {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : format(dueDate, 'MMM d')}
                          </Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="col-span-4 space-y-6">
          {/* Account Card */}
          {account && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-charcoal-600" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 text-sm">Account</h3>
                  </div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-charcoal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal-900 truncate">{account.name}</p>
                    {account.industry && (
                      <p className="text-xs text-charcoal-500 truncate capitalize">{account.industry.replace(/_/g, ' ')}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs">
                  {account.employeeCount && (
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span>Employees</span>
                      <span className="font-medium text-charcoal-900">{account.employeeCount.toLocaleString()}</span>
                    </div>
                  )}
                  {account.location && (
                    <div className="flex items-center justify-between text-charcoal-600">
                      <span>Location</span>
                      <span className="font-medium text-charcoal-900">{account.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Owner Card */}
          {deal.owner && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Deal Owner</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                    {deal.owner.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={deal.owner.avatarUrl} alt={deal.owner.fullName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-base font-semibold text-charcoal-700">
                        {deal.owner.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-charcoal-900 truncate">{deal.owner.fullName}</p>
                    <p className="text-xs text-charcoal-500">Deal Owner</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
            <div className="px-5 py-4 border-b border-charcoal-200/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-charcoal-500" />
                <h3 className="font-semibold text-charcoal-900 text-sm">Quick Stats</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                    <Users className="h-4 w-4 text-charcoal-500" />
                  </div>
                  <span className="text-sm text-charcoal-600">Stakeholders</span>
                </div>
                <span className="text-lg font-semibold text-charcoal-900">{stakeholders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                    <Activity className="h-4 w-4 text-charcoal-500" />
                  </div>
                  <span className="text-sm text-charcoal-600">Activities</span>
                </div>
                <span className="text-lg font-semibold text-charcoal-900">{activities.length}</span>
              </div>
              <div className="pt-3 border-t border-charcoal-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">Last Activity</span>
                  <span className="text-sm font-medium text-charcoal-700">
                    {recentActivities[0]
                      ? formatDistanceToNow(new Date(recentActivities[0].createdAt), { addSuffix: true })
                      : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(8)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
                <p className="text-xs text-charcoal-500">Latest interactions with this deal</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
              onClick={() => onNavigate('activities')}
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
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-charcoal-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-900 truncate">{activity.subject}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs font-normal px-1.5 py-0 h-5 capitalize">
                      {activity.type?.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-charcoal-400">•</span>
                    <span className="text-xs text-charcoal-500">{activity.assignedTo}</span>
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

// Helper Components
function DetailField({
  label,
  value,
  icon: Icon,
  isPrimary
}: {
  label: string
  value: string | number | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  isPrimary?: boolean
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400 shrink-0" />}
        <span className={cn(
          "text-sm truncate",
          value ? "text-charcoal-900" : "text-charcoal-400 italic",
          isPrimary && "font-semibold"
        )}>
          {value || '—'}
        </span>
      </div>
    </div>
  )
}

// Helper functions
function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
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

function getHealthConfig(status: string | null): { label: string; textClass: string; dotClass: string } {
  if (!status) {
    return { label: 'Not rated', textClass: 'text-charcoal-400', dotClass: 'bg-charcoal-300' }
  }
  const config: Record<string, { label: string; textClass: string; dotClass: string }> = {
    on_track: { label: 'On Track', textClass: 'text-charcoal-600', dotClass: 'bg-charcoal-600' },
    slow: { label: 'Slow', textClass: 'text-amber-600', dotClass: 'bg-amber-500' },
    stale: { label: 'Stale', textClass: 'text-orange-600', dotClass: 'bg-orange-500' },
    urgent: { label: 'Urgent', textClass: 'text-error-600', dotClass: 'bg-error-500' },
    at_risk: { label: 'At Risk', textClass: 'text-error-600', dotClass: 'bg-error-500' },
  }
  return config[status] || { label: status, textClass: 'text-charcoal-600', dotClass: 'bg-charcoal-600' }
}

export default DealOverviewSection
