'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EditableInfoCard, type FieldDefinition } from '@/components/ui/editable-info-card'
import {
  Activity, Users, Briefcase, ArrowRight, Phone, Mail, Star,
  DollarSign, TrendingUp, Heart, AlertTriangle, CheckCircle2, Clock,
  Building2, Globe, MapPin, Award, Sparkles, Target, Zap, Calendar,
  BarChart3, PieChart, ArrowUpRight, ExternalLink, UserPlus, Linkedin,
  FileText, CreditCard, Shield, MessageSquare, User, CalendarDays,
  BadgeCheck, FileCheck, Tag, Landmark, Hash, Receipt, CheckSquare,
  XSquare, RefreshCw, UserCheck, Send, TrendingDown
} from 'lucide-react'
import type { AccountData, AccountActivity, AccountJob, AccountContact } from '@/types/workspace'
import { formatDistanceToNow, isToday, isTomorrow, format } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { cn } from '@/lib/utils'

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'education', label: 'Education' },
  { value: 'government', label: 'Government' },
  { value: 'energy', label: 'Energy' },
  { value: 'media', label: 'Media' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
]

const TIERS = [
  { value: 'standard', label: 'Standard' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'strategic', label: 'Strategic' },
]

const STATUSES = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_hold', label: 'On Hold' },
]

interface AccountOverviewSectionProps {
  account: AccountData
  activities: AccountActivity[]
  jobs: AccountJob[]
  contacts: AccountContact[]
  onNavigate: (section: string) => void
}

/**
 * AccountOverviewSection - Premium SaaS-level Summary view
 * Features: Glassmorphism, rich gradients, sophisticated animations
 */
export function AccountOverviewSection({
  account,
  activities,
  jobs,
  contacts,
  onNavigate,
}: AccountOverviewSectionProps) {
  const { toast } = useToast()
  const { refreshData, data: workspaceData } = useAccountWorkspace()
  const recentActivities = activities.slice(0, 5)

  // Get primary address for location display
  const addresses = workspaceData.addresses || []
  const primaryAddress = addresses.find(a => a.isPrimary) || addresses.find(a => a.type.toLowerCase() === 'office') || addresses[0]
  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'active')
  const primaryContact = contacts.find(c => c.isPrimary)

  // Update mutation
  const updateMutation = trpc.crm.accounts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Account updated successfully' })
      refreshData()
    },
    onError: (error) => {
      toast({ title: 'Error updating account', description: error.message, variant: 'error' })
    },
  })

  // Company details field definitions
  const companyFields: FieldDefinition[] = [
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'select', options: INDUSTRIES },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'phone', label: 'Phone', type: 'phone' },
    { key: 'headquarters_city', label: 'City', type: 'text' },
    { key: 'headquarters_state', label: 'State', type: 'text' },
    { key: 'tier', label: 'Tier', type: 'select', options: TIERS },
    { key: 'status', label: 'Status', type: 'select', options: STATUSES },
  ]

  // Handle company details save
  const handleSaveCompanyDetails = async (data: Record<string, unknown>) => {
    await updateMutation.mutateAsync({
      id: account.id,
      name: data.name as string,
      industry: data.industry as string || undefined,
      website: data.website as string || undefined,
      phone: data.phone as string || undefined,
      status: data.status as 'prospect' | 'active' | 'inactive' || undefined,
      tier: data.tier as 'preferred' | 'strategic' || undefined,
    })
  }

  // Calculate metrics
  const totalJobs = jobs.length
  const filledJobs = jobs.filter(j => j.status === 'filled').length
  const fillRate = totalJobs > 0 ? Math.round((filledJobs / totalJobs) * 100) : null

  // Get pending/upcoming activities
  const pendingActivities = activities.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    return true
  }).slice(0, 5)

  // Health status config
  const healthConfig = getHealthConfig(account.health_score, account.health_status)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid - Clean monochromatic design */}
      <div className="grid grid-cols-4 gap-4">
        {/* Health Score - Premium Card */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(0)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Health Score</p>
              <div className="flex items-baseline gap-2">
                <span className={cn(
                  "text-3xl font-bold tracking-tight",
                  healthConfig.variant === 'success' && "text-charcoal-900",
                  healthConfig.variant === 'warning' && "text-charcoal-700",
                  healthConfig.variant === 'error' && "text-charcoal-600",
                  !healthConfig.variant && "text-charcoal-400"
                )}>
                  {account.health_score ?? '—'}
                </span>
                {account.health_score && (
                  <span className="text-sm text-charcoal-400">/100</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium",
                  healthConfig.variant === 'success' && "text-charcoal-600",
                  healthConfig.variant === 'warning' && "text-amber-600",
                  healthConfig.variant === 'error' && "text-error-600",
                  !healthConfig.variant && "text-charcoal-400"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    healthConfig.variant === 'success' && "bg-charcoal-600",
                    healthConfig.variant === 'warning' && "bg-amber-500",
                    healthConfig.variant === 'error' && "bg-error-500",
                    !healthConfig.variant && "bg-charcoal-300"
                  )} />
                  {healthConfig.label}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Heart className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Revenue YTD */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(1)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Revenue YTD</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {formatCurrency(account.revenue_ytd)}
                </span>
              </div>
              {account.avg_margin_percentage && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-600">
                    <TrendingUp className="h-3 w-3" />
                    {account.avg_margin_percentage.toFixed(0)}% margin
                  </span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <DollarSign className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Active Jobs */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
          style={getDelay(2)}
          onClick={() => onNavigate('jobs')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Active Jobs</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {activeJobs.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                  <Briefcase className="h-3 w-3" />
                  {jobs.length} total
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Briefcase className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
        </div>

        {/* Fill Rate */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(3)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Fill Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {fillRate !== null ? `${fillRate}%` : '—'}
                </span>
              </div>
              {totalJobs > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                    <Target className="h-3 w-3" />
                    {filledJobs}/{totalJobs} filled
                  </span>
                </div>
              )}
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <BarChart3 className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Company Details - Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {/* Company Overview Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Company Details</h3>
                    <p className="text-xs text-charcoal-500">Core business information</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('edit')}
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoField 
                  label="Company Name" 
                  value={account.name}
                  icon={Building2}
                  isPrimary
                />
                <IndustriesField 
                  industries={account.industries}
                  fallbackIndustry={account.industry}
                />
                <InfoField
                  label="Website"
                  value={account.website}
                  href={account.website ?? undefined}
                  icon={Globe}
                />
                <InfoField 
                  label="Phone" 
                  value={account.phone}
                  href={account.phone ? `tel:${account.phone}` : undefined}
                  icon={Phone}
                />
                <InfoField
                  label="Location"
                  value={
                    account.headquarters_city && account.headquarters_state
                      ? `${account.headquarters_city}, ${account.headquarters_state}`
                      : primaryAddress?.city && primaryAddress?.state
                        ? `${primaryAddress.city}, ${primaryAddress.state}`
                        : null
                  }
                  icon={MapPin}
                />
                <div className="flex gap-4">
                  <div className="flex-1">
                    <TierBadge tier={account.tier} />
                  </div>
                  <div className="flex-1">
                    <StatusBadge status={account.status} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Corporate Profile Card */}
          <CorporateProfileCard account={account} getDelay={getDelay} />

          {/* Billing & Terms Card */}
          <BillingTermsCard account={account} getDelay={getDelay} />

          {/* Engagement Preferences Card */}
          <EngagementCard account={account} getDelay={getDelay} />

          {/* Action Items Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(8)}>
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
                <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100">
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
          {/* Primary Contact Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
            <div className="px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-charcoal-600" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm">Primary Contact</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('contacts')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 h-7 px-2">
                  All <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <div className="p-5">
              {primaryContact ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center">
                      <span className="text-base font-semibold text-charcoal-700">
                        {primaryContact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal-900 truncate">{primaryContact.name}</p>
                      {primaryContact.title && (
                        <p className="text-xs text-charcoal-500 truncate">{primaryContact.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2 border-t border-charcoal-100">
                    {primaryContact.email && (
                      <a 
                        href={`mailto:${primaryContact.email}`}
                        className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-gold-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-md bg-charcoal-50 flex items-center justify-center group-hover:bg-gold-50 transition-colors">
                          <Mail className="h-3.5 w-3.5 text-charcoal-400 group-hover:text-gold-600 transition-colors" />
                        </div>
                        <span className="truncate">{primaryContact.email}</span>
                      </a>
                    )}
                    {primaryContact.phone && (
                      <a 
                        href={`tel:${primaryContact.phone}`}
                        className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-gold-700 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-md bg-charcoal-50 flex items-center justify-center group-hover:bg-gold-50 transition-colors">
                          <Phone className="h-3.5 w-3.5 text-charcoal-400 group-hover:text-gold-600 transition-colors" />
                        </div>
                        <span>{primaryContact.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-charcoal-400" />
                  </div>
                  <p className="text-sm text-charcoal-500 mb-3">No primary contact</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                        detail: { dialogId: 'addContact', accountId: account.id } 
                      }))
                    }}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Add Contact
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Team Assignments Card */}
          <TeamAssignmentsCard account={account} getDelay={getDelay} />

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
                  <span className="text-sm text-charcoal-600">Contacts</span>
                </div>
                <span className="text-lg font-semibold text-charcoal-900">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                    <Briefcase className="h-4 w-4 text-charcoal-500" />
                  </div>
                  <span className="text-sm text-charcoal-600">Total Jobs</span>
                </div>
                <span className="text-lg font-semibold text-charcoal-900">{jobs.length}</span>
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
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
                <p className="text-xs text-charcoal-500">Latest interactions with this account</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('activities')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100">
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

// Industry color mapping for premium aesthetic
const INDUSTRY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  technology: { bg: 'from-blue-50 to-indigo-50', text: 'text-blue-700', border: 'border-blue-200/60', icon: '💻' },
  fintech: { bg: 'from-emerald-50 to-teal-50', text: 'text-emerald-700', border: 'border-emerald-200/60', icon: '💳' },
  healthcare: { bg: 'from-rose-50 to-pink-50', text: 'text-rose-700', border: 'border-rose-200/60', icon: '🏥' },
  finance: { bg: 'from-amber-50 to-yellow-50', text: 'text-amber-700', border: 'border-amber-200/60', icon: '🏦' },
  manufacturing: { bg: 'from-slate-50 to-zinc-50', text: 'text-slate-700', border: 'border-slate-200/60', icon: '🏭' },
  retail: { bg: 'from-orange-50 to-amber-50', text: 'text-orange-700', border: 'border-orange-200/60', icon: '🛍️' },
  professional_services: { bg: 'from-violet-50 to-purple-50', text: 'text-violet-700', border: 'border-violet-200/60', icon: '💼' },
  consulting: { bg: 'from-violet-50 to-purple-50', text: 'text-violet-700', border: 'border-violet-200/60', icon: '💼' },
  education: { bg: 'from-cyan-50 to-sky-50', text: 'text-cyan-700', border: 'border-cyan-200/60', icon: '🎓' },
  government: { bg: 'from-stone-50 to-neutral-50', text: 'text-stone-700', border: 'border-stone-200/60', icon: '🏛️' },
  energy: { bg: 'from-lime-50 to-green-50', text: 'text-lime-700', border: 'border-lime-200/60', icon: '⚡' },
  telecommunications: { bg: 'from-sky-50 to-blue-50', text: 'text-sky-700', border: 'border-sky-200/60', icon: '📡' },
  media: { bg: 'from-fuchsia-50 to-pink-50', text: 'text-fuchsia-700', border: 'border-fuchsia-200/60', icon: '🎬' },
  real_estate: { bg: 'from-teal-50 to-emerald-50', text: 'text-teal-700', border: 'border-teal-200/60', icon: '🏢' },
  other: { bg: 'from-gray-50 to-slate-50', text: 'text-gray-700', border: 'border-gray-200/60', icon: '📊' },
}

const DEFAULT_INDUSTRY_COLOR = { bg: 'from-charcoal-50 to-charcoal-100', text: 'text-charcoal-700', border: 'border-charcoal-200/60', icon: '🏢' }

function IndustriesField({ 
  industries, 
  fallbackIndustry 
}: { 
  industries: string[] | null | undefined
  fallbackIndustry: string | null | undefined
}) {
  // Use industries array if available, otherwise fall back to single industry
  const industryList = industries && industries.length > 0 
    ? industries 
    : fallbackIndustry ? [fallbackIndustry] : []

  if (industryList.length === 0) {
    return (
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Industries</p>
        <span className="text-sm text-charcoal-400 italic">—</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Industries</p>
      <div className="flex flex-wrap gap-2">
        {industryList.map((industry, idx) => {
          const colors = INDUSTRY_COLORS[industry.toLowerCase()] || DEFAULT_INDUSTRY_COLOR
          return (
            <div
              key={idx}
              className={cn(
                "group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                "bg-gradient-to-r border shadow-sm",
                "hover:shadow-md hover:scale-[1.02] transition-all duration-200",
                colors.bg,
                colors.border,
              )}
            >
              <span className="text-sm">{colors.icon}</span>
              <span className={cn("text-xs font-semibold capitalize", colors.text)}>
                {industry.replace(/_/g, ' ')}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TierBadge({ tier }: { tier: string | null | undefined }) {
  const config = {
    strategic: { bg: 'bg-gradient-to-r from-gold-100 to-gold-50', text: 'text-gold-800', icon: Award },
    preferred: { bg: 'bg-gradient-to-r from-blue-100 to-blue-50', text: 'text-blue-800', icon: Star },
    standard: { bg: 'bg-gradient-to-r from-charcoal-100 to-charcoal-50', text: 'text-charcoal-700', icon: Building2 },
  }
  const tierConfig = tier ? config[tier as keyof typeof config] : config.standard
  const TierIcon = tierConfig?.icon || Building2
  
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Tier</p>
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", tierConfig?.bg, tierConfig?.text)}>
        <TierIcon className="h-3.5 w-3.5" />
        {tier?.replace(/_/g, ' ') || 'Standard'}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
    prospect: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
    inactive: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
    on_hold: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    churned: { bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  }
  const statusConfig = status ? config[status] : config.inactive
  
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Status</p>
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", statusConfig?.bg, statusConfig?.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", statusConfig?.dot)} />
        {status?.replace(/_/g, ' ') || 'Unknown'}
      </div>
    </div>
  )
}

// Helper function to format currency
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '$0'
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

// Helper function to get health status config
function getHealthConfig(score: number | null | undefined, status: string | null | undefined): {
  label: string
  variant: 'success' | 'warning' | 'error' | undefined
} {
  if (score === null || score === undefined) {
    return { label: 'Not rated', variant: undefined }
  }
  if (score >= 80 || status === 'healthy') {
    return { label: 'Healthy', variant: 'success' }
  }
  if (score >= 50 || status === 'attention') {
    return { label: 'Needs Attention', variant: 'warning' }
  }
  return { label: 'At Risk', variant: 'error' }
}

// ============================================================================
// CORPORATE PROFILE CARD
// ============================================================================
function CorporateProfileCard({
  account,
  getDelay
}: {
  account: AccountData
  getDelay: (index: number) => { animationDelay: string }
}) {
  const hasAnyData = account.legal_name || account.dba_name || account.founded_year ||
    account.employee_count || account.employee_range || account.revenue_range ||
    account.ownership_type || account.segment || account.relationship_type || account.linkedin_url

  if (!hasAnyData) return null

  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Corporate Profile</h3>
            <p className="text-xs text-charcoal-500">Legal and business classification</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {account.legal_name && (
            <DetailField label="Legal Name" value={account.legal_name} icon={FileText} />
          )}
          {account.dba_name && (
            <DetailField label="DBA / Trading As" value={account.dba_name} icon={Hash} />
          )}
          {account.founded_year && (
            <DetailField
              label="Founded"
              value={`${account.founded_year} (${new Date().getFullYear() - account.founded_year} years)`}
              icon={Calendar}
            />
          )}
          {(account.employee_count || account.employee_range) && (
            <DetailField
              label="Company Size"
              value={account.employee_range || (account.employee_count ? `${account.employee_count.toLocaleString()} employees` : null)}
              icon={Users}
            />
          )}
          {account.revenue_range && (
            <DetailField label="Revenue Range" value={formatRevenueRange(account.revenue_range)} icon={DollarSign} />
          )}
          {account.ownership_type && (
            <DetailField label="Ownership Type" value={formatOwnershipType(account.ownership_type)} icon={Building2} />
          )}
          {account.segment && (
            <SegmentBadgeField segment={account.segment} />
          )}
          {account.relationship_type && (
            <RelationshipTypeBadge type={account.relationship_type} />
          )}
          {account.linkedin_url && (
            <DetailField
              label="LinkedIn"
              value="View Profile"
              href={account.linkedin_url}
              icon={Linkedin}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BILLING & TERMS CARD
// ============================================================================
function BillingTermsCard({
  account,
  getDelay
}: {
  account: AccountData
  getDelay: (index: number) => { animationDelay: string }
}) {
  const hasAnyData = account.default_payment_terms || account.requires_po ||
    account.msa_status || account.default_markup_percentage ||
    account.default_fee_percentage || account.credit_limit

  if (!hasAnyData) return null

  const msaExpiringSoon = account.msa_expiration_date &&
    new Date(account.msa_expiration_date) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(6)}>
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Billing & Terms</h3>
            <p className="text-xs text-charcoal-500">Payment and contract terms</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {account.default_payment_terms && (
            <DetailField label="Payment Terms" value={account.default_payment_terms} icon={Receipt} />
          )}
          {account.default_currency && (
            <DetailField label="Currency" value={account.default_currency} icon={DollarSign} />
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">PO Required</p>
            <div className="flex items-center gap-2">
              {account.requires_po ? (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Yes - PO Required
                </Badge>
              ) : (
                <Badge variant="outline" className="text-charcoal-500">
                  <XSquare className="h-3 w-3 mr-1" />
                  No
                </Badge>
              )}
            </div>
          </div>
          {account.msa_status && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">MSA Status</p>
              <div className="flex items-center gap-2">
                <MsaStatusBadge status={account.msa_status} expiringSoon={msaExpiringSoon || false} />
                {account.msa_auto_renews && (
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Auto-renews
                  </Badge>
                )}
              </div>
            </div>
          )}
          {account.msa_expiration_date && (
            <DetailField
              label="MSA Expires"
              value={format(new Date(account.msa_expiration_date), 'MMM d, yyyy')}
              icon={Calendar}
              isWarning={msaExpiringSoon || false}
            />
          )}
          {account.default_markup_percentage && (
            <DetailField
              label="Default Markup"
              value={`${account.default_markup_percentage.toFixed(1)}%`}
              icon={TrendingUp}
            />
          )}
          {account.default_fee_percentage && (
            <DetailField
              label="Default Fee"
              value={`${account.default_fee_percentage.toFixed(1)}%`}
              icon={DollarSign}
            />
          )}
          {account.credit_limit && (
            <DetailField
              label="Credit Limit"
              value={formatCurrency(account.credit_limit)}
              icon={CreditCard}
            />
          )}
          {account.credit_status && (
            <CreditStatusBadge status={account.credit_status} />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// ENGAGEMENT PREFERENCES CARD
// ============================================================================
function EngagementCard({
  account,
  getDelay
}: {
  account: AccountData
  getDelay: (index: number) => { animationDelay: string }
}) {
  const hasAnyData = account.preferred_contact_method || account.meeting_cadence ||
    account.submission_method || account.invoice_delivery_method ||
    account.next_scheduled_contact || account.is_strategic ||
    account.requires_approval_for_submission || account.allows_remote_work !== undefined ||
    account.source || account.tags?.length

  if (!hasAnyData) return null

  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(7)}>
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-charcoal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-charcoal-900">Engagement Preferences</h3>
            <p className="text-xs text-charcoal-500">Communication and workflow settings</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {account.preferred_contact_method && (
            <DetailField
              label="Contact Method"
              value={formatContactMethod(account.preferred_contact_method)}
              icon={getContactMethodIcon(account.preferred_contact_method)}
            />
          )}
          {account.meeting_cadence && (
            <DetailField
              label="Meeting Cadence"
              value={formatMeetingCadence(account.meeting_cadence)}
              icon={CalendarDays}
            />
          )}
          {account.submission_method && (
            <DetailField
              label="Submission Method"
              value={formatSubmissionMethod(account.submission_method)}
              icon={Send}
            />
          )}
          {account.invoice_delivery_method && (
            <DetailField
              label="Invoice Delivery"
              value={formatDeliveryMethod(account.invoice_delivery_method)}
              icon={Receipt}
            />
          )}
          {account.next_scheduled_contact && (
            <DetailField
              label="Next Contact"
              value={format(new Date(account.next_scheduled_contact), 'MMM d, yyyy')}
              icon={Calendar}
            />
          )}
          {account.source && (
            <DetailField
              label="Lead Source"
              value={formatSource(account.source)}
              icon={Target}
            />
          )}

          {/* Flags Row */}
          <div className="col-span-2 pt-2 border-t border-charcoal-100 mt-2">
            <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Account Flags</p>
            <div className="flex flex-wrap gap-2">
              {account.is_strategic && (
                <Badge className="bg-gold-50 text-gold-700 border-gold-200">
                  <Star className="h-3 w-3 mr-1 fill-gold-500" />
                  Strategic Account
                </Badge>
              )}
              {account.requires_approval_for_submission && (
                <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Requires Approval
                </Badge>
              )}
              {account.allows_remote_work && (
                <Badge variant="outline" className="text-charcoal-600">
                  <Globe className="h-3 w-3 mr-1" />
                  Remote OK
                </Badge>
              )}
              {!account.allows_remote_work && account.allows_remote_work !== undefined && (
                <Badge variant="outline" className="text-charcoal-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  On-site Only
                </Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          {account.tags && account.tags.length > 0 && (
            <div className="col-span-2 pt-2 border-t border-charcoal-100 mt-2">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {account.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="text-charcoal-600">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// TEAM ASSIGNMENTS CARD
// ============================================================================
function TeamAssignmentsCard({
  account,
  getDelay
}: {
  account: AccountData
  getDelay: (index: number) => { animationDelay: string }
}) {
  const hasAnyTeam = account.owner || account.account_manager

  if (!hasAnyTeam) return null

  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
      <div className="px-5 py-4 border-b border-charcoal-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-charcoal-600" />
          </div>
          <h3 className="font-semibold text-charcoal-900 text-sm">Team</h3>
        </div>
      </div>
      <div className="p-5 space-y-4">
        {account.owner && (
          <TeamMemberRow
            role="Owner"
            name={account.owner.full_name}
            avatarUrl={account.owner.avatar_url}
            roleColor="gold"
          />
        )}
        {account.account_manager && (
          <TeamMemberRow
            role="Account Manager"
            name={account.account_manager.full_name}
            avatarUrl={account.account_manager.avatar_url}
            roleColor="blue"
          />
        )}
      </div>
    </div>
  )
}

function TeamMemberRow({
  role,
  name,
  avatarUrl,
}: {
  role: string
  name: string
  avatarUrl: string | null
  roleColor?: 'gold' | 'blue' | 'green' | 'purple'
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-charcoal-200">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-charcoal-700">
            {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">{role}</p>
        <p className="font-medium text-charcoal-900 truncate">{name}</p>
      </div>
    </div>
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function DetailField({
  label,
  value,
  icon: Icon,
  href,
  isWarning
}: {
  label: string
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  isWarning?: boolean
}) {
  if (!value) return null

  const content = (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("h-4 w-4 shrink-0", isWarning ? "text-amber-500" : "text-charcoal-400")} />}
        <span className={cn(
          "text-sm",
          isWarning ? "text-amber-700 font-medium" : "text-charcoal-900",
          href && "hover:text-gold-700 transition-colors"
        )}>
          {value}
        </span>
        {href && <ExternalLink className="h-3 w-3 text-charcoal-400" />}
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    )
  }

  return content
}

function SegmentBadgeField({ segment }: { segment: string }) {
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    enterprise: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🏢' },
    mid_market: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '🏬' },
    smb: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: '🏪' },
    startup: { bg: 'bg-orange-50', text: 'text-orange-700', icon: '🚀' },
  }
  const segmentConfig = config[segment] || { bg: 'bg-charcoal-50', text: 'text-charcoal-700', icon: '🏢' }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Market Segment</p>
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", segmentConfig.bg, segmentConfig.text)}>
        <span>{segmentConfig.icon}</span>
        {segment.replace(/_/g, ' ')}
      </div>
    </div>
  )
}

function RelationshipTypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    direct_client: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Direct Client' },
    implementation_partner: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Implementation Partner' },
    staffing_vendor: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Staffing Vendor' },
    prime_vendor: { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Prime Vendor' },
    sub_vendor: { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Sub Vendor' },
    msp_client: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'MSP Client' },
  }
  const typeConfig = config[type] || { bg: 'bg-charcoal-50', text: 'text-charcoal-700', label: type.replace(/_/g, ' ') }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Relationship Type</p>
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold", typeConfig.bg, typeConfig.text)}>
        <Building2 className="h-3.5 w-3.5" />
        {typeConfig.label}
      </div>
    </div>
  )
}

function MsaStatusBadge({ status, expiringSoon }: { status: string; expiringSoon: boolean }) {
  const config: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    active: { bg: 'bg-success-50', text: 'text-success-700', icon: CheckCircle2 },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: Clock },
    expired: { bg: 'bg-error-50', text: 'text-error-700', icon: AlertTriangle },
    none: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', icon: XSquare },
  }
  const statusConfig = config[status.toLowerCase()] || config.none
  const StatusIcon = statusConfig.icon

  return (
    <Badge className={cn(
      statusConfig.bg,
      statusConfig.text,
      expiringSoon && status.toLowerCase() === 'active' && "ring-2 ring-amber-300"
    )}>
      <StatusIcon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
      {expiringSoon && status.toLowerCase() === 'active' && (
        <span className="ml-1 text-amber-600">(Expiring Soon)</span>
      )}
    </Badge>
  )
}

function CreditStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    approved: { bg: 'bg-success-50', text: 'text-success-700' },
    pending: { bg: 'bg-amber-50', text: 'text-amber-700' },
    declined: { bg: 'bg-error-50', text: 'text-error-700' },
    review: { bg: 'bg-blue-50', text: 'text-blue-700' },
  }
  const statusConfig = config[status.toLowerCase()] || { bg: 'bg-charcoal-100', text: 'text-charcoal-600' }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Credit Status</p>
      <Badge className={cn(statusConfig.bg, statusConfig.text)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    </div>
  )
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

function formatRevenueRange(range: string): string {
  const rangeMap: Record<string, string> = {
    '0-1m': '$0 - $1M',
    '1m-10m': '$1M - $10M',
    '10m-50m': '$10M - $50M',
    '50m-100m': '$50M - $100M',
    '100m-500m': '$100M - $500M',
    '500m-1b': '$500M - $1B',
    '1b+': '$1B+',
  }
  return rangeMap[range.toLowerCase()] || range.replace(/_/g, ' ')
}

function formatOwnershipType(type: string): string {
  const typeMap: Record<string, string> = {
    public: 'Public Company',
    private: 'Private Company',
    subsidiary: 'Subsidiary',
    government: 'Government',
    nonprofit: 'Non-Profit',
    partnership: 'Partnership',
    sole_proprietorship: 'Sole Proprietorship',
    llc: 'LLC',
    corporation: 'Corporation',
  }
  return typeMap[type.toLowerCase()] || type.replace(/_/g, ' ')
}

function formatContactMethod(method: string): string {
  const methodMap: Record<string, string> = {
    email: 'Email',
    phone: 'Phone',
    slack: 'Slack',
    teams: 'Microsoft Teams',
    in_person: 'In Person',
  }
  return methodMap[method.toLowerCase()] || method.replace(/_/g, ' ')
}

function getContactMethodIcon(method: string): React.ComponentType<{ className?: string }> {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    email: Mail,
    phone: Phone,
    slack: MessageSquare,
    teams: MessageSquare,
    in_person: Users,
  }
  return iconMap[method.toLowerCase()] || MessageSquare
}

function formatMeetingCadence(cadence: string): string {
  const cadenceMap: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    as_needed: 'As Needed',
  }
  return cadenceMap[cadence.toLowerCase()] || cadence.replace(/_/g, ' ')
}

function formatSubmissionMethod(method: string): string {
  const methodMap: Record<string, string> = {
    email: 'Email',
    vms: 'VMS Portal',
    portal: 'Client Portal',
    phone: 'Phone',
  }
  return methodMap[method.toLowerCase()] || method.replace(/_/g, ' ')
}

function formatDeliveryMethod(method: string): string {
  const methodMap: Record<string, string> = {
    email: 'Email',
    mail: 'Physical Mail',
    portal: 'Client Portal',
    edi: 'EDI',
  }
  return methodMap[method.toLowerCase()] || method.replace(/_/g, ' ')
}

function formatSource(source: string): string {
  const sourceMap: Record<string, string> = {
    referral: 'Referral',
    website: 'Website',
    cold_call: 'Cold Call',
    trade_show: 'Trade Show',
    linkedin: 'LinkedIn',
    partner: 'Partner',
    inbound: 'Inbound',
    outbound: 'Outbound',
  }
  return sourceMap[source.toLowerCase()] || source.replace(/_/g, ' ')
}

export default AccountOverviewSection
