'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity, Briefcase, ArrowRight, Phone, Mail, Star,
  User, Send, AlertTriangle, CheckCircle2, Clock,
  Building2, Award, Sparkles, Zap, Linkedin,
  ExternalLink, UserPlus, UserCircle, Percent
} from 'lucide-react'
import type {
  ContactData, ContactAccount, ContactActivity,
  ContactSubmission, ContactPlacement, ContactJob
} from '@/types/workspace'
import { formatDistanceToNow, isToday, isTomorrow, format } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useContactWorkspace } from '../ContactWorkspaceProvider'
import { cn } from '@/lib/utils'

interface ContactSummarySectionProps {
  contact: ContactData
  accounts: ContactAccount[]
  activities: ContactActivity[]
  submissions: ContactSubmission[]
  placements: ContactPlacement[]
  jobs: ContactJob[]
  onNavigate: (section: string) => void
}

/**
 * ContactSummarySection - Premium SaaS-level Summary view
 * Features: Glassmorphism, rich gradients, sophisticated animations
 * Matches AccountOverviewSection design pattern
 */
export function ContactSummarySection({
  contact,
  accounts,
  activities,
  submissions,
  placements,
  jobs,
  onNavigate,
}: ContactSummarySectionProps) {
  const { toast } = useToast()
  const { refreshData } = useContactWorkspace()
  const recentActivities = activities.slice(0, 5)
  const primaryAccount = accounts.find(a => a.isPrimary)

  // Update mutation (available for inline editing)
  const _updateMutation = trpc.unifiedContacts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Contact updated successfully' })
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error updating contact', description: error.message, variant: 'error' })
    },
  })

  // Calculate profile completeness
  const profileFields = [
    contact.firstName,
    contact.lastName,
    contact.email,
    contact.phone,
    contact.title,
    contact.department,
    contact.linkedinUrl,
  ]
  const filledFields = profileFields.filter(Boolean).length
  const profileCompleteness = Math.round((filledFields / profileFields.length) * 100)

  // Get pending/upcoming activities
  const pendingActivities = activities.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    return true
  }).slice(0, 5)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Profile Completeness */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-gradient-to-br from-white via-white to-charcoal-50/50 p-5 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 animate-fade-in"
          style={getDelay(0)}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Profile</p>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-bold tracking-tight",
                  profileCompleteness >= 80 ? "text-success-600" :
                  profileCompleteness >= 50 ? "text-amber-600" :
                  "text-charcoal-400"
                )}>
                  {profileCompleteness}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  profileCompleteness >= 80 ? "bg-success-50 text-success-700" :
                  profileCompleteness >= 50 ? "bg-amber-50 text-amber-700" :
                  "bg-charcoal-100 text-charcoal-500"
                )}>
                  {profileCompleteness >= 80 ? 'Complete' : profileCompleteness >= 50 ? 'Partial' : 'Incomplete'}
                </span>
              </div>
            </div>
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105",
              profileCompleteness >= 80 ? "bg-gradient-to-br from-success-100 to-success-50" :
              profileCompleteness >= 50 ? "bg-gradient-to-br from-amber-100 to-amber-50" :
              "bg-gradient-to-br from-charcoal-100 to-charcoal-50"
            )}>
              <Percent className={cn(
                "h-6 w-6",
                profileCompleteness >= 80 ? "text-success-600" :
                profileCompleteness >= 50 ? "text-amber-600" :
                "text-charcoal-400"
              )} />
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-gradient-to-br from-white via-white to-blue-50/30 p-5 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(1)}
          onClick={() => onNavigate('submissions')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Submissions</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600 tracking-tight">
                  {submissions.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <Send className="h-3 w-3" />
                  Total
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Placements */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-gradient-to-br from-white via-white to-forest-50/30 p-5 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(2)}
          onClick={() => onNavigate('placements')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-forest-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Placements</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-forest-600 tracking-tight">
                  {placements.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-forest-50 text-forest-700">
                  <Award className="h-3 w-3" />
                  {placements.filter(p => p.status === 'active').length} active
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-forest-100 to-forest-50 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Award className="h-6 w-6 text-forest-600" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-forest-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Activities */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-gradient-to-br from-white via-white to-gold-50/30 p-5 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(3)}
          onClick={() => onNavigate('activities')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-200/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
          <div className="relative flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Activities</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gold-600 tracking-tight">
                  {activities.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gold-50 text-gold-700">
                  <Activity className="h-3 w-3" />
                  {pendingActivities.length} pending
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center transition-all duration-300 group-hover:scale-105">
              <Activity className="h-6 w-6 text-gold-600" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-gold-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Contact Details - Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Contact Overview Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-6 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-sm">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Contact Details</h3>
                    <p className="text-xs text-charcoal-500">Personal and professional information</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openContactDialog', {
                      detail: { dialogId: 'editContact', contactId: contact.id }
                    }))
                  }}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoField
                  label="First Name"
                  value={contact.firstName}
                  icon={User}
                  isPrimary
                />
                <InfoField
                  label="Last Name"
                  value={contact.lastName}
                  icon={User}
                  isPrimary
                />
                <InfoField
                  label="Title"
                  value={contact.title}
                  icon={Briefcase}
                />
                <InfoField
                  label="Department"
                  value={contact.department}
                  icon={Building2}
                />
                <InfoField
                  label="Email"
                  value={contact.email}
                  href={contact.email ? `mailto:${contact.email}` : undefined}
                  icon={Mail}
                />
                <InfoField
                  label="Phone"
                  value={contact.phone}
                  href={contact.phone ? `tel:${contact.phone}` : undefined}
                  icon={Phone}
                />
                <InfoField
                  label="Mobile"
                  value={contact.mobile}
                  href={contact.mobile ? `tel:${contact.mobile}` : undefined}
                  icon={Phone}
                />
                <InfoField
                  label="LinkedIn"
                  value={contact.linkedinUrl}
                  href={contact.linkedinUrl ?? undefined}
                  icon={Linkedin}
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <CategoryBadge category={contact.category} />
                  </div>
                  <div className="flex-1">
                    <StatusBadge status={contact.status} />
                  </div>
                </div>
                {contact.types.length > 0 && (
                  <TypesBadges types={contact.types} />
                )}
              </div>
            </div>
          </div>

          {/* Action Items Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
            <div className="px-6 py-4 border-b border-charcoal-100 bg-gradient-to-r from-amber-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Action Items</h3>
                    <p className="text-xs text-charcoal-500">Pending tasks and follow-ups</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')} className="text-xs text-charcoal-500 hover:text-charcoal-700">
                  View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              {pendingActivities.length > 0 ? (
                <div className="space-y-2">
                  {pendingActivities.map((activity, idx) => {
                    const dueDate = activity.dueDate ? new Date(activity.dueDate) : null
                    const isOverdue = dueDate && dueDate < new Date()
                    const isDueToday = dueDate && isToday(dueDate)
                    const isDueTomorrow = dueDate && isTomorrow(dueDate)

                    return (
                      <div
                        key={activity.id}
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm cursor-pointer",
                          isOverdue ? "border-error-200 bg-error-50/50 hover:bg-error-50" :
                          isDueToday ? "border-amber-200 bg-amber-50/50 hover:bg-amber-50" :
                          "border-charcoal-100 bg-charcoal-50/50 hover:bg-charcoal-50"
                        )}
                        style={{ animationDelay: `${(idx + 1) * 50}ms` }}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
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
                          <p className="text-sm font-medium text-charcoal-900 truncate">
                            {activity.subject}
                          </p>
                          <p className="text-xs text-charcoal-500 truncate">
                            {activity.assignedTo}
                          </p>
                        </div>
                        {dueDate && (
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs shrink-0 font-medium",
                              isOverdue ? "border-error-300 text-error-700 bg-error-50" :
                              isDueToday ? "border-amber-300 text-amber-700 bg-amber-50" :
                              isDueTomorrow ? "border-blue-300 text-blue-700 bg-blue-50" :
                              "border-charcoal-200 text-charcoal-600 bg-charcoal-50"
                            )}
                          >
                            {isOverdue ? 'Overdue' :
                             isDueToday ? 'Due Today' :
                             isDueTomorrow ? 'Tomorrow' :
                             format(dueDate, 'MMM d')}
                          </Badge>
                        )}
                        <ArrowRight className="h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    )
                  })}
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
          {/* Primary Account Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-gold-50/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-sm">
                    <Star className="h-4 w-4 text-white fill-white" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Primary Account</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('accounts')} className="text-xs text-charcoal-500 hover:text-charcoal-700 h-7 px-2">
                  All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-5">
              {primaryAccount ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-sm">
                      <span className="text-base font-semibold text-charcoal-900">
                        {primaryAccount.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal-900 truncate">{primaryAccount.name}</p>
                      {primaryAccount.industry && (
                        <p className="text-xs text-charcoal-500 truncate">{primaryAccount.industry}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-charcoal-100">
                    {primaryAccount.role && (
                      <div className="flex items-center gap-2 text-sm text-charcoal-600">
                        <div className="w-7 h-7 rounded-md bg-charcoal-50 flex items-center justify-center">
                          <Briefcase className="h-3.5 w-3.5 text-charcoal-400" />
                        </div>
                        <span className="truncate">{primaryAccount.role}</span>
                      </div>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium capitalize",
                        primaryAccount.status === 'active' ? "border-success-300 text-success-700 bg-success-50" :
                        primaryAccount.status === 'prospect' ? "border-blue-300 text-blue-700 bg-blue-50" :
                        "border-charcoal-200 text-charcoal-600 bg-charcoal-50"
                      )}
                    >
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full mr-1.5",
                        primaryAccount.status === 'active' ? "bg-success-500" :
                        primaryAccount.status === 'prospect' ? "bg-blue-500" :
                        "bg-charcoal-400"
                      )} />
                      {primaryAccount.status}
                    </Badge>
                  </div>
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-charcoal-200 to-charcoal-300 flex items-center justify-center shadow-sm">
                      <span className="text-base font-semibold text-charcoal-600">
                        {accounts[0].name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal-900 truncate">{accounts[0].name}</p>
                      {accounts[0].industry && (
                        <p className="text-xs text-charcoal-500 truncate">{accounts[0].industry}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-charcoal-500">
                    No primary account set. <button onClick={() => onNavigate('accounts')} className="text-gold-600 hover:text-gold-700 font-medium">Set one →</button>
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                    <Building2 className="h-6 w-6 text-charcoal-400" />
                  </div>
                  <p className="text-sm text-charcoal-500 mb-3">No linked accounts</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => onNavigate('accounts')}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Link Account
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-gradient-to-br from-forest-600 via-forest-700 to-forest-800 text-white shadow-elevation-md overflow-hidden animate-slide-up" style={getDelay(5)}>
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-gold-400" />
                <h3 className="font-semibold text-white/95 text-sm">Quick Stats</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm text-white/80">Accounts</span>
                </div>
                <span className="text-lg font-semibold text-white">{accounts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm text-white/80">Total Jobs</span>
                </div>
                <span className="text-lg font-semibold text-white">{jobs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-white/80" />
                  </div>
                  <span className="text-sm text-white/80">Activities</span>
                </div>
                <span className="text-lg font-semibold text-white">{activities.length}</span>
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/60 uppercase tracking-wider">Last Activity</span>
                  <span className="text-sm font-medium text-gold-400">
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
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
        <div className="px-6 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/50 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-charcoal-600 to-charcoal-700 flex items-center justify-center shadow-sm">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
                <p className="text-xs text-charcoal-500">Latest interactions with this contact</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')} className="text-xs text-charcoal-500 hover:text-charcoal-700">
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
function InfoField({
  label,
  value,
  icon: Icon,
  href,
  isPrimary
}: {
  label: string
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  isPrimary?: boolean
}) {
  const content = (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400 shrink-0" />}
        <span className={cn(
          "text-sm truncate",
          value ? "text-charcoal-900" : "text-charcoal-400 italic",
          isPrimary && "font-semibold",
          href && "hover:text-gold-700 transition-colors"
        )}>
          {value || '—'}
        </span>
      </div>
    </div>
  )

  if (href && value) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

function CategoryBadge({ category }: { category: string | null | undefined }) {
  const config: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    person: { bg: 'bg-gradient-to-r from-blue-100 to-blue-50', text: 'text-blue-800', icon: User },
    company: { bg: 'bg-gradient-to-r from-charcoal-100 to-charcoal-50', text: 'text-charcoal-700', icon: Building2 },
  }
  const categoryConfig = category ? config[category] : config.person
  const CategoryIcon = categoryConfig?.icon || User

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Category</p>
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", categoryConfig?.bg, categoryConfig?.text)}>
        <CategoryIcon className="h-3.5 w-3.5" />
        {category?.replace(/_/g, ' ') || 'Person'}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    inactive: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
    do_not_contact: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  }
  const statusConfig = status ? config[status] : config.active

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Status</p>
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", statusConfig?.bg, statusConfig?.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusConfig?.dot)} />
        {status?.replace(/_/g, ' ') || 'Active'}
      </div>
    </div>
  )
}

function TypesBadges({ types }: { types: string[] }) {
  const typeConfig: Record<string, { bg: string; text: string }> = {
    candidate: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
    lead: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    prospect: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
    client_contact: { bg: 'bg-success-50 border-success-200', text: 'text-success-700' },
  }

  return (
    <div className="space-y-1.5 col-span-2">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Types</p>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => {
          const config = typeConfig[type] || { bg: 'bg-charcoal-50 border-charcoal-200', text: 'text-charcoal-600' }
          return (
            <span
              key={type}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize border",
                config.bg,
                config.text
              )}
            >
              {type.replace(/_/g, ' ')}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default ContactSummarySection
