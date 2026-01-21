'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity, Briefcase, ArrowRight, Phone, Mail, Star,
  User, Send, AlertTriangle, CheckCircle2, Clock,
  Building2, Award, Sparkles, Zap, Linkedin,
  ExternalLink, UserPlus, UserCircle, Percent,
  MapPin, Users, Globe, Target, Calendar, Hash,
  GraduationCap, DollarSign, Bookmark, Link2
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

interface ContactOverviewSectionProps {
  contact: ContactData
  accounts: ContactAccount[]
  activities: ContactActivity[]
  submissions: ContactSubmission[]
  placements: ContactPlacement[]
  jobs: ContactJob[]
  onNavigate: (section: string) => void
}

/**
 * ContactOverviewSection - Category-aware premium overview
 * Adapts KPIs and content cards based on Person vs Company category
 * Follows Hublot-inspired design patterns
 */
export function ContactOverviewSection({
  contact,
  accounts,
  activities,
  submissions,
  placements,
  jobs,
  onNavigate,
}: ContactOverviewSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useContactWorkspace()
  const recentActivities = activities.slice(0, 5)
  const primaryAccount = accounts.find(a => a.isPrimary)
  const isPerson = contact.category === 'person'

  // Update mutation
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
  // Use type-safe access for contact fields
  const contactAny = contact as unknown as Record<string, unknown>
  const profileFields = isPerson
    ? [contact.firstName, contact.lastName, contact.email, contact.phone, contact.title, contact.department, contact.linkedinUrl]
    : [contact.firstName, contact.email, contact.phone, contactAny.websiteUrl, contactAny.industryId]
  const filledFields = profileFields.filter(Boolean).length
  const profileCompleteness = Math.round((filledFields / profileFields.length) * 100)

  // Get pending activities
  const pendingActivities = activities.filter(a => {
    if (a.status === 'completed' || a.status === 'cancelled') return false
    return true
  }).slice(0, 5)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Category-aware KPI Grid */}
      {isPerson ? (
        <PersonKPIGrid
          profileCompleteness={profileCompleteness}
          submissions={submissions}
          placements={placements}
          activities={activities}
          pendingActivities={pendingActivities}
          onNavigate={onNavigate}
          getDelay={getDelay}
        />
      ) : (
        <CompanyKPIGrid
          profileCompleteness={profileCompleteness}
          jobs={jobs}
          placements={placements}
          activities={activities}
          pendingActivities={pendingActivities}
          onNavigate={onNavigate}
          getDelay={getDelay}
        />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="col-span-8 space-y-6">
          {isPerson ? (
            <PersonDetailsCards
              contact={contact}
              accounts={accounts}
              pendingActivities={pendingActivities}
              onNavigate={onNavigate}
              getDelay={getDelay}
            />
          ) : (
            <CompanyDetailsCards
              contact={contact}
              pendingActivities={pendingActivities}
              onNavigate={onNavigate}
              getDelay={getDelay}
            />
          )}
        </div>

        {/* Right Column (4 cols) */}
        <div className="col-span-4 space-y-6">
          {isPerson ? (
            <PersonSidebarCards
              contact={contact}
              accounts={accounts}
              primaryAccount={primaryAccount}
              activities={activities}
              submissions={submissions}
              jobs={jobs}
              recentActivities={recentActivities}
              onNavigate={onNavigate}
              getDelay={getDelay}
            />
          ) : (
            <CompanySidebarCards
              contact={contact}
              accounts={accounts}
              jobs={jobs}
              activities={activities}
              placements={placements}
              recentActivities={recentActivities}
              onNavigate={onNavigate}
              getDelay={getDelay}
            />
          )}
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      <RecentActivityCard
        recentActivities={recentActivities}
        onNavigate={onNavigate}
        getDelay={getDelay}
      />
    </div>
  )
}

// ============================================================================
// PERSON KPI GRID
// ============================================================================
function PersonKPIGrid({
  profileCompleteness,
  submissions,
  placements,
  activities,
  pendingActivities,
  onNavigate,
  getDelay,
}: {
  profileCompleteness: number
  submissions: ContactSubmission[]
  placements: ContactPlacement[]
  activities: ContactActivity[]
  pendingActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Profile Completeness */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
        style={getDelay(0)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Profile</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-bold tracking-tight",
                profileCompleteness >= 80 ? "text-charcoal-900" :
                profileCompleteness >= 50 ? "text-charcoal-700" :
                "text-charcoal-500"
              )}>
                {profileCompleteness}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium",
                profileCompleteness >= 80 ? "text-charcoal-600" :
                profileCompleteness >= 50 ? "text-amber-600" :
                "text-charcoal-400"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  profileCompleteness >= 80 ? "bg-charcoal-600" :
                  profileCompleteness >= 50 ? "bg-amber-500" :
                  "bg-charcoal-300"
                )} />
                {profileCompleteness >= 80 ? 'Complete' : profileCompleteness >= 50 ? 'Partial' : 'Incomplete'}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Percent className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
        style={getDelay(1)}
        onClick={() => onNavigate('submissions')}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Submissions</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                {submissions.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                <Send className="h-3 w-3" />
                Total
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Send className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>

      {/* Placements */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
        style={getDelay(2)}
        onClick={() => onNavigate('placements')}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Placements</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                {placements.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                <Award className="h-3 w-3" />
                {placements.filter(p => p.status === 'active').length} active
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Award className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>

      {/* Activities */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
        style={getDelay(3)}
        onClick={() => onNavigate('activities')}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Activities</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                {activities.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                <Activity className="h-3 w-3" />
                {pendingActivities.length} pending
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Activity className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  )
}

// ============================================================================
// COMPANY KPI GRID
// ============================================================================
function CompanyKPIGrid({
  profileCompleteness,
  jobs,
  placements,
  activities,
  pendingActivities,
  onNavigate,
  getDelay,
}: {
  profileCompleteness: number
  jobs: ContactJob[]
  placements: ContactPlacement[]
  activities: ContactActivity[]
  pendingActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  const activeJobs = jobs.filter(j => j.status === 'open' || j.status === 'active')

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Profile Completeness */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
        style={getDelay(0)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Profile</p>
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-3xl font-bold tracking-tight",
                profileCompleteness >= 80 ? "text-charcoal-900" :
                profileCompleteness >= 50 ? "text-charcoal-700" :
                "text-charcoal-500"
              )}>
                {profileCompleteness}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "inline-flex items-center gap-1.5 text-xs font-medium",
                profileCompleteness >= 80 ? "text-charcoal-600" :
                profileCompleteness >= 50 ? "text-amber-600" :
                "text-charcoal-400"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  profileCompleteness >= 80 ? "bg-charcoal-600" :
                  profileCompleteness >= 50 ? "bg-amber-500" :
                  "bg-charcoal-300"
                )} />
                {profileCompleteness >= 80 ? 'Complete' : profileCompleteness >= 50 ? 'Partial' : 'Incomplete'}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Percent className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
      </div>

      {/* Jobs */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
        style={getDelay(1)}
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

      {/* Placements */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
        style={getDelay(2)}
        onClick={() => onNavigate('placements')}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Placements</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                {placements.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                <Award className="h-3 w-3" />
                {placements.filter(p => p.status === 'active').length} active
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Award className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>

      {/* Activities */}
      <div
        className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer animate-fade-in"
        style={getDelay(3)}
        onClick={() => onNavigate('activities')}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Activities</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                {activities.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-500">
                <Activity className="h-3 w-3" />
                {pendingActivities.length} pending
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
            <Activity className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
          </div>
        </div>
        <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 group-hover:text-charcoal-500 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </div>
  )
}

// ============================================================================
// PERSON DETAILS CARDS
// ============================================================================
function PersonDetailsCards({
  contact,
  accounts,
  pendingActivities,
  onNavigate,
  getDelay,
}: {
  contact: ContactData
  accounts: ContactAccount[]
  pendingActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  return (
    <>
      {/* Personal Details Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <UserCircle className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Personal Details</h3>
                <p className="text-xs text-charcoal-500">Contact information</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
              onClick={() => onNavigate('profile')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label="First Name" value={contact.firstName} icon={User} isPrimary />
            <InfoField label="Last Name" value={contact.lastName} icon={User} isPrimary />
            <InfoField label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} icon={Mail} />
            <InfoField label="Phone" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : undefined} icon={Phone} />
            <InfoField label="Mobile" value={contact.mobile} href={contact.mobile ? `tel:${contact.mobile}` : undefined} icon={Phone} />
            <InfoField label="LinkedIn" value={contact.linkedinUrl} href={contact.linkedinUrl ?? undefined} icon={Linkedin} />
            <div className="col-span-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <CategoryBadge category={contact.category} />
                </div>
                <div className="flex-1">
                  <StatusBadge status={contact.status} />
                </div>
              </div>
            </div>
            {contact.types && contact.types.length > 0 && (
              <TypesBadges types={contact.types} />
            )}
          </div>
        </div>
      </div>

      {/* Employment Card */}
      {(contact.title || contact.department || accounts.length > 0) && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Employment</h3>
                <p className="text-xs text-charcoal-500">Current position and company</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <InfoField label="Title" value={contact.title} icon={Briefcase} />
              <InfoField label="Department" value={contact.department} icon={Building2} />
              {accounts[0] && (
                <>
                  <InfoField label="Company" value={accounts[0].name} icon={Building2} isPrimary />
                  {accounts[0].industry && (
                    <InfoField label="Industry" value={accounts[0].industry} icon={Target} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Items Card */}
      <ActionItemsCard pendingActivities={pendingActivities} onNavigate={onNavigate} getDelay={getDelay} delayIndex={6} />
    </>
  )
}

// ============================================================================
// COMPANY DETAILS CARDS
// ============================================================================
function CompanyDetailsCards({
  contact,
  pendingActivities,
  onNavigate,
  getDelay,
}: {
  contact: ContactData
  pendingActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  // Use type-safe access for company-specific fields
  const contactAny = contact as unknown as Record<string, unknown>

  return (
    <>
      {/* Company Profile Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Company Profile</h3>
                <p className="text-xs text-charcoal-500">Organization details</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
              onClick={() => onNavigate('profile')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <InfoField label="Company Name" value={contact.firstName} icon={Building2} isPrimary />
            <InfoField label="Industry" value={contactAny.industryId as string | null} icon={Target} />
            <InfoField label="Website" value={contactAny.websiteUrl as string | null} href={contactAny.websiteUrl as string | undefined} icon={Globe} />
            <InfoField label="Phone" value={contact.phone} href={contact.phone ? `tel:${contact.phone}` : undefined} icon={Phone} />
            <InfoField label="Email" value={contact.email} href={contact.email ? `mailto:${contact.email}` : undefined} icon={Mail} />
            <InfoField label="LinkedIn" value={contact.linkedinUrl} href={contact.linkedinUrl ?? undefined} icon={Linkedin} />
            <div className="col-span-2">
              <div className="flex gap-4">
                <div className="flex-1">
                  <CategoryBadge category={contact.category} />
                </div>
                <div className="flex-1">
                  <StatusBadge status={contact.status} />
                </div>
              </div>
            </div>
            {contact.types && contact.types.length > 0 && (
              <TypesBadges types={contact.types} />
            )}
          </div>
        </div>
      </div>

      {/* Location Card */}
      {(contact.street || contact.city || contact.state || contact.country) && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Location</h3>
                <p className="text-xs text-charcoal-500">Headquarters address</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {contact.street && <InfoField label="Address" value={contact.street} icon={MapPin} />}
              {contact.city && <InfoField label="City" value={contact.city} icon={Building2} />}
              {contact.state && <InfoField label="State/Province" value={contact.state} icon={Hash} />}
              {contact.zip && <InfoField label="Postal Code" value={contact.zip} icon={Hash} />}
              {contact.country && <InfoField label="Country" value={contact.country} icon={Globe} />}
            </div>
          </div>
        </div>
      )}

      {/* Action Items Card */}
      <ActionItemsCard pendingActivities={pendingActivities} onNavigate={onNavigate} getDelay={getDelay} delayIndex={6} />
    </>
  )
}

// ============================================================================
// PERSON SIDEBAR CARDS
// ============================================================================
function PersonSidebarCards({
  contact,
  accounts,
  primaryAccount,
  activities,
  submissions,
  jobs,
  recentActivities,
  onNavigate,
  getDelay,
}: {
  contact: ContactData
  accounts: ContactAccount[]
  primaryAccount: ContactAccount | undefined
  activities: ContactActivity[]
  submissions: ContactSubmission[]
  jobs: ContactJob[]
  recentActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  return (
    <>
      {/* Primary Account Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
        <div className="px-5 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-charcoal-600" />
              </div>
              <h3 className="font-semibold text-charcoal-900 text-sm">Primary Account</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('accounts')} className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100 h-7 px-2">
              All <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
        <div className="p-5">
          {primaryAccount ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center">
                  <span className="text-base font-semibold text-charcoal-700">
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
                <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center">
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
      <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
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
                <Building2 className="h-4 w-4 text-charcoal-500" />
              </div>
              <span className="text-sm text-charcoal-600">Accounts</span>
            </div>
            <span className="text-lg font-semibold text-charcoal-900">{accounts.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                <Send className="h-4 w-4 text-charcoal-500" />
              </div>
              <span className="text-sm text-charcoal-600">Submissions</span>
            </div>
            <span className="text-lg font-semibold text-charcoal-900">{submissions.length}</span>
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
    </>
  )
}

// ============================================================================
// COMPANY SIDEBAR CARDS
// ============================================================================
function CompanySidebarCards({
  contact,
  accounts,
  jobs,
  activities,
  placements,
  recentActivities,
  onNavigate,
  getDelay,
}: {
  contact: ContactData
  accounts: ContactAccount[]
  jobs: ContactJob[]
  activities: ContactActivity[]
  placements: ContactPlacement[]
  recentActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  // Use type-safe access for company-specific fields
  const contactAny = contact as unknown as Record<string, unknown>
  const employeeCount = contactAny.employeeCount as number | null
  const annualRevenue = contactAny.annualRevenue as number | null
  const foundedYear = contactAny.foundedYear as number | null

  return (
    <>
      {/* Corporate Info Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
        <div className="px-5 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-charcoal-600" />
            </div>
            <h3 className="font-semibold text-charcoal-900 text-sm">Corporate Info</h3>
          </div>
        </div>
        <div className="p-5 space-y-4">
          {employeeCount && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-charcoal-50 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-charcoal-400" />
                </div>
                <span className="text-sm text-charcoal-600">Employees</span>
              </div>
              <span className="text-sm font-medium text-charcoal-900">{employeeCount.toLocaleString()}</span>
            </div>
          )}
          {annualRevenue && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-charcoal-50 flex items-center justify-center">
                  <DollarSign className="h-3.5 w-3.5 text-charcoal-400" />
                </div>
                <span className="text-sm text-charcoal-600">Revenue</span>
              </div>
              <span className="text-sm font-medium text-charcoal-900">{formatCurrency(annualRevenue)}</span>
            </div>
          )}
          {foundedYear && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-charcoal-50 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-charcoal-400" />
                </div>
                <span className="text-sm text-charcoal-600">Founded</span>
              </div>
              <span className="text-sm font-medium text-charcoal-900">{foundedYear}</span>
            </div>
          )}
          {!employeeCount && !annualRevenue && !foundedYear && (
            <div className="text-center py-4">
              <p className="text-sm text-charcoal-500">No corporate info available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
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
                <Briefcase className="h-4 w-4 text-charcoal-500" />
              </div>
              <span className="text-sm text-charcoal-600">Jobs</span>
            </div>
            <span className="text-lg font-semibold text-charcoal-900">{jobs.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                <Award className="h-4 w-4 text-charcoal-500" />
              </div>
              <span className="text-sm text-charcoal-600">Placements</span>
            </div>
            <span className="text-lg font-semibold text-charcoal-900">{placements.length}</span>
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
    </>
  )
}

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

function ActionItemsCard({
  pendingActivities,
  onNavigate,
  getDelay,
  delayIndex,
}: {
  pendingActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
  delayIndex: number
}) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(delayIndex)}>
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
  )
}

function RecentActivityCard({
  recentActivities,
  onNavigate,
  getDelay,
}: {
  recentActivities: ContactActivity[]
  onNavigate: (section: string) => void
  getDelay: (index: number) => { animationDelay: string }
}) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(7)}>
      <div className="px-6 py-4 border-b border-charcoal-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Activity className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
              <p className="text-xs text-charcoal-500">Latest interactions</p>
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
  )
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

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

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(1)}B`
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toFixed(0)}`
}

export default ContactOverviewSection
