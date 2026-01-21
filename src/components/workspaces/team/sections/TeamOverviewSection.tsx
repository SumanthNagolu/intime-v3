'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Briefcase, Award, Activity, ArrowRight,
  UserCircle, Calendar, TrendingUp, Clock, Gauge,
  Building2, BarChart3, CheckCircle2, UserCheck
} from 'lucide-react'
import type {
  TeamEntityData,
  TeamEntityMember,
  TeamAssignedAccount,
  TeamAssignedJob,
  TeamEntityActivity,
  TeamEntityMetrics
} from '@/types/workspace'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface TeamOverviewSectionProps {
  team: TeamEntityData
  members: TeamEntityMember[]
  accounts: TeamAssignedAccount[]
  jobs: TeamAssignedJob[]
  activities: TeamEntityActivity[]
  metrics: TeamEntityMetrics
  onNavigate: (section: string) => void
}

/**
 * TeamOverviewSection - Premium SaaS-level Summary view
 * Features: KPI cards, team stats, member overview, activity feed
 */
export function TeamOverviewSection({
  team,
  members,
  accounts,
  jobs,
  activities,
  metrics,
  onNavigate,
}: TeamOverviewSectionProps) {
  const activeMembers = members.filter(m => m.isActive)
  const recentActivities = activities.slice(0, 5)
  const topJobs = jobs.filter(j => j.status === 'open' || j.status === 'active').slice(0, 5)
  const teamManagers = members.filter(m => m.isManager)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Premium KPI Grid - Clean monochromatic design */}
      <div className="grid grid-cols-4 gap-4">
        {/* Team Size */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in cursor-pointer"
          style={getDelay(0)}
          onClick={() => onNavigate('members')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Team Size</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {metrics.activeMembers}
                </span>
                <span className="text-sm text-charcoal-400">members</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-600">
                  {metrics.membersOnVacation > 0 && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      {metrics.membersOnVacation} on leave
                    </>
                  )}
                  {metrics.membersOnVacation === 0 && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-success-500" />
                      All available
                    </>
                  )}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Users className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 opacity-0 transform translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" />
        </div>

        {/* Open Jobs */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in cursor-pointer"
          style={getDelay(1)}
          onClick={() => onNavigate('jobs')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Open Jobs</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {metrics.openJobs}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-600">
                  <span className="w-2 h-2 rounded-full bg-charcoal-400" />
                  {metrics.activeSubmissions} active submissions
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Briefcase className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 opacity-0 transform translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" />
        </div>

        {/* Active Placements */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
          style={getDelay(2)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Active Placements</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {metrics.activePlacements}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success-600">
                  <TrendingUp className="w-3 h-3" />
                  {metrics.placementsMTD} MTD
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Award className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
        </div>

        {/* Workload */}
        <div
          className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in cursor-pointer"
          style={getDelay(3)}
          onClick={() => onNavigate('workload')}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">Avg Load Factor</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
                  {metrics.avgLoadFactor}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "inline-flex items-center gap-1.5 text-xs font-medium",
                  metrics.avgLoadFactor > 80 ? "text-error-600" :
                    metrics.avgLoadFactor > 60 ? "text-amber-600" : "text-charcoal-600"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    metrics.avgLoadFactor > 80 ? "bg-error-500" :
                      metrics.avgLoadFactor > 60 ? "bg-amber-500" : "bg-charcoal-400"
                  )} />
                  {metrics.avgLoadFactor > 80 ? "High load" :
                    metrics.avgLoadFactor > 60 ? "Moderate" : "Available capacity"}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
              <Gauge className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-charcoal-300 opacity-0 transform translate-x-2 group-hover:opacity-50 group-hover:translate-x-0 transition-all duration-300" />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - 8 cols */}
        <div className="col-span-8 space-y-6">
          {/* Team Details Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Team Details</h3>
                    <p className="text-xs text-charcoal-500">Team information and configuration</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('details')}
                >
                  View Details
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <InfoField label="Team Name" value={team.name} icon={Users} />
                <InfoField label="Team Code" value={team.code || '—'} />
                <InfoField label="Type" value={team.groupType?.replace(/_/g, ' ')} className="capitalize" />
                <InfoField label="Status" value={team.isActive ? 'Active' : 'Inactive'} />
                {team.parentGroup && (
                  <InfoField label="Parent Group" value={team.parentGroup.name} icon={Building2} />
                )}
                {team.manager && (
                  <InfoField label="Manager" value={team.manager.fullName} icon={UserCircle} />
                )}
                {team.supervisor && (
                  <InfoField label="Supervisor" value={team.supervisor.fullName} icon={UserCheck} />
                )}
                <InfoField label="Security Zone" value={team.securityZone || 'Default'} />
              </div>
              {team.description && (
                <div className="mt-4 pt-4 border-t border-charcoal-100">
                  <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-charcoal-700">{team.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Managers Card */}
          {teamManagers.length > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
              <div className="px-6 py-4 border-b border-charcoal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Team Managers</h3>
                    <p className="text-xs text-charcoal-500">Members with management roles</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {teamManagers.slice(0, 3).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                          {member.avatarUrl ? (
                            <img src={member.avatarUrl} alt={member.fullName} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-charcoal-600">
                              {member.fullName?.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-900">{member.fullName}</p>
                          <p className="text-xs text-charcoal-500">{member.title || 'Team Manager'}</p>
                        </div>
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-700 border-charcoal-200">
                        Manager
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pending Activities Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
            <div className="px-6 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900">Pending Activities</h3>
                    <p className="text-xs text-charcoal-500">{metrics.openActivities} open activities</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                  onClick={() => onNavigate('activities')}
                >
                  View All
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div className="divide-y divide-charcoal-100">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="px-6 py-3 hover:bg-charcoal-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        activity.priority === 'high' ? "bg-error-100" : "bg-charcoal-100"
                      )}>
                        <Activity className={cn(
                          "h-4 w-4",
                          activity.priority === 'high' ? "text-error-600" : "text-charcoal-500"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-900 truncate">{activity.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-charcoal-500">{activity.type}</span>
                          {activity.dueDate && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                              <span className="text-xs text-charcoal-500">
                                Due {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs",
                          activity.status === 'completed' ? "bg-success-50 text-success-700" : "bg-charcoal-100 text-charcoal-600"
                        )}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center">
                  <CheckCircle2 className="h-8 w-8 text-charcoal-300 mx-auto mb-2" />
                  <p className="text-sm text-charcoal-500">No pending activities</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 4 cols */}
        <div className="col-span-4 space-y-6">
          {/* Quick Stats Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden animate-slide-up">
            <div className="px-5 py-4 border-b border-charcoal-200/60">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-charcoal-500" />
                <h3 className="font-semibold text-charcoal-900 text-sm">Quick Stats</h3>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <QuickStatItem
                icon={Users}
                label="Active Members"
                value={metrics.activeMembers}
                onClick={() => onNavigate('members')}
              />
              <QuickStatItem
                icon={Building2}
                label="Assigned Accounts"
                value={accounts.length}
                onClick={() => onNavigate('accounts')}
              />
              <QuickStatItem
                icon={Briefcase}
                label="Assigned Jobs"
                value={jobs.length}
                onClick={() => onNavigate('jobs')}
              />
              <QuickStatItem
                icon={Activity}
                label="Open Activities"
                value={metrics.openActivities}
                onClick={() => onNavigate('activities')}
              />
              <QuickStatItem
                icon={Award}
                label="Placements MTD"
                value={metrics.placementsMTD}
              />
            </div>
          </div>

          {/* Top Jobs Card */}
          {topJobs.length > 0 && (
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
              <div className="px-5 py-4 border-b border-charcoal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-charcoal-500" />
                    <h3 className="font-semibold text-charcoal-900 text-sm">Active Jobs</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-charcoal-500 hover:text-charcoal-700 h-7 px-2"
                    onClick={() => onNavigate('jobs')}
                  >
                    View All
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-charcoal-100">
                {topJobs.map((job) => (
                  <div key={job.id} className="px-5 py-3 hover:bg-charcoal-50 transition-colors">
                    <p className="text-sm font-medium text-charcoal-900 truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {job.accountName && (
                        <span className="text-xs text-charcoal-500 truncate">{job.accountName}</span>
                      )}
                      <span className="text-xs text-charcoal-400">
                        {job.submissionCount} submissions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Summary Card */}
          <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
            <div className="px-5 py-4 border-b border-charcoal-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">MTD Performance</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-charcoal-500 hover:text-charcoal-700 h-7 px-2"
                  onClick={() => onNavigate('performance')}
                >
                  Details
                </Button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Placements</span>
                <span className="text-sm font-semibold text-charcoal-900">{metrics.placementsMTD}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Submissions</span>
                <span className="text-sm font-semibold text-charcoal-900">{metrics.submissionsMTD}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-charcoal-600">Activities Completed</span>
                <span className="text-sm font-semibold text-charcoal-900">{metrics.activitiesCompletedMTD}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper components
interface InfoFieldProps {
  label: string
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

function InfoField({ label, value, icon: Icon, className }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400" />}
        <span className={cn("text-sm text-charcoal-900", className)}>{value || '—'}</span>
      </div>
    </div>
  )
}

interface QuickStatItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  onClick?: () => void
}

function QuickStatItem({ icon: Icon, label, value, onClick }: QuickStatItemProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity"
      )}
      onClick={onClick}
    >
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

export default TeamOverviewSection
