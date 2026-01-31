'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users, Briefcase, Award, Activity, ArrowRight,
  UserCircle, Calendar, TrendingUp, Clock, Gauge,
  Building2, BarChart3, CheckCircle2, UserCheck,
  LayoutGrid, List as ListIcon
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
import { KanbanBoard } from '../board/KanbanBoard'

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
 * TeamOverviewSection - Cinematic Enterprise Redesign
 * Features: Glassmorphism, Mesh Gradients, Kanban Integration
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
  const [viewMode, setViewMode] = React.useState<'list' | 'board'>('board')
  const activeMembers = members.filter(m => m.isActive)
  const recentActivities = activities.slice(0, 5)
  const topJobs = jobs.filter(j => j.status === 'open' || j.status === 'active').slice(0, 5)
  const teamManagers = members.filter(m => m.isManager)

  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header - Cinematic Mesh Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-mesh-cinematic p-8 shadow-premium-lg group">
        <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3 animate-slide-up" style={getDelay(0)}>
              <Badge variant="outline" className="bg-white/30 backdrop-blur-md border-white/40 text-charcoal-900 font-medium px-3 py-1">
                {team.code || 'TEAM'}
              </Badge>
              <span className="text-sm font-medium text-charcoal-600 uppercase tracking-widest">
                Overview
              </span>
            </div>
            
            <h1 className="text-display font-bold text-charcoal-900 tracking-tight leading-tight animate-slide-up" style={getDelay(1)}>
              {team.name}
              <span className="text-forest-600/60 block text-2xl mt-1 font-light tracking-normal">
                {team.description || 'Managing recruitment pipeline & operations'}
              </span>
            </h1>

            <div className="flex items-center gap-6 pt-2 animate-slide-up" style={getDelay(2)}>
              <div className="flex -space-x-3">
                {activeMembers.slice(0, 5).map((m, i) => (
                  <div key={m.id} className="w-10 h-10 rounded-full border-2 border-white bg-charcoal-100 flex items-center justify-center overflow-hidden shadow-sm hover:scale-110 transition-transform duration-300 z-10">
                    {m.avatarUrl ? (
                      <img src={m.avatarUrl} alt={m.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-medium text-charcoal-600">{m.fullName.charAt(0)}</span>
                    )}
                  </div>
                ))}
                {activeMembers.length > 5 && (
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-charcoal-50 flex items-center justify-center shadow-sm z-0">
                    <span className="text-xs font-bold text-charcoal-600">+{activeMembers.length - 5}</span>
                  </div>
                )}
              </div>
              <div className="h-8 w-px bg-charcoal-900/10" />
              <div className="flex gap-4">
                 <div className="space-y-0.5">
                    <p className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Manager</p>
                    <p className="text-sm font-semibold text-charcoal-900">{team.manager?.fullName || 'Unassigned'}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Key KPI - Glass Float */}
          <div className="hidden lg:block animate-float">
             <div className="glass-panel p-6 rounded-2xl w-64 backdrop-blur-xl bg-white/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">Team Velocity</span>
                  <TrendingUp className="h-4 w-4 text-forest-600" />
                </div>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-bold text-charcoal-900">{metrics.placementsMTD}</span>
                   <span className="text-sm font-medium text-forest-600">Placements</span>
                </div>
                <div className="mt-2 text-xs text-charcoal-600 flex items-center gap-1">
                   <div className="w-full bg-charcoal-200/50 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-forest-500 to-emerald-400 h-full w-[70%]" />
                   </div>
                   <span>70% to goal</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* KPI Grid - Glass Cards */}
      <div className="grid grid-cols-4 gap-6">
        <KPICard
          title="Open Jobs"
          value={metrics.openJobs}
          subValue={`${metrics.activeSubmissions} active subs`}
          icon={Briefcase}
          trend="up"
          onClick={() => onNavigate('jobs')}
          delay={0}
        />
        <KPICard
          title="Active Placements"
          value={metrics.activePlacements}
          subValue="Revenue Generating"
          icon={Award}
          trend="neutral"
          delay={1}
        />
        <KPICard
          title="Avg Load Factor"
          value={`${metrics.avgLoadFactor}%`}
          subValue={metrics.avgLoadFactor > 80 ? "High Load" : "Optimal"}
          icon={Gauge}
          trend={metrics.avgLoadFactor > 80 ? "down" : "up"}
          onClick={() => onNavigate('workload')}
          delay={2}
        />
        <KPICard
          title="Activities"
          value={metrics.openActivities}
          subValue="Pending Action"
          icon={Activity}
          trend="neutral"
          onClick={() => onNavigate('activities')}
          delay={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - 8 cols */}
        <div className="col-span-8 space-y-8">
          
          {/* Activity Board Section */}
          <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={getDelay(1)}>
            <div className="px-6 py-5 border-b border-white/20 flex items-center justify-between bg-white/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-50 to-white border border-white/60 shadow-sm flex items-center justify-center text-forest-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-charcoal-900 text-lg">Team Activities</h3>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                    {metrics.openActivities} Pending Tasks
                  </p>
                </div>
              </div>
              
              <div className="flex items-center bg-charcoal-100/50 p-1 rounded-lg border border-charcoal-200/50">
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    viewMode === 'list' 
                      ? "bg-white shadow-sm text-charcoal-900" 
                      : "text-charcoal-500 hover:text-charcoal-700"
                  )}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('board')}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    viewMode === 'board' 
                      ? "bg-white shadow-sm text-charcoal-900" 
                      : "text-charcoal-500 hover:text-charcoal-700"
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 bg-white/30 min-h-[400px]">
              {viewMode === 'board' ? (
                <KanbanBoard activities={activities} />
              ) : (
                <div className="space-y-2">
                   {recentActivities.map((activity) => (
                      <div key={activity.id} className="group flex items-center gap-4 p-4 rounded-xl bg-white/60 border border-white/40 hover:bg-white hover:shadow-elevation-sm transition-all duration-300">
                         <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                            activity.priority === 'high' ? "bg-error-50 text-error-600" : "bg-charcoal-50 text-charcoal-500"
                         )}>
                            {activity.priority === 'high' ? <Activity className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-charcoal-900 truncate">{activity.subject}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <Badge variant="secondary" className="bg-charcoal-100/50 text-charcoal-600 border-charcoal-200/50 text-[10px] uppercase tracking-wider">{activity.type}</Badge>
                               {activity.dueDate && (
                                  <span className="text-xs text-charcoal-500">Due {formatDistanceToNow(new Date(activity.dueDate), { addSuffix: true })}</span>
                               )}
                            </div>
                         </div>
                         <div className="text-right">
                             <Badge className={cn(
                                "capitalize",
                                activity.status === 'completed' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                                activity.status === 'in_progress' ? "bg-blue-50 text-blue-700 border-blue-100" :
                                "bg-charcoal-50 text-charcoal-600 border-charcoal-100"
                             )}>
                                {activity.status.replace('_', ' ')}
                             </Badge>
                         </div>
                      </div>
                   ))}
                   {recentActivities.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-64 text-charcoal-400">
                         <CheckCircle2 className="h-12 w-12 mb-3 opacity-20" />
                         <p className="text-sm font-medium">No pending activities</p>
                      </div>
                   )}
                </div>
              )}
            </div>
            {viewMode === 'list' && (
               <div className="px-6 py-4 bg-white/40 border-t border-white/20 flex justify-center">
                  <Button variant="ghost" className="text-xs font-medium text-charcoal-500 hover:text-charcoal-900" onClick={() => onNavigate('activities')}>
                     View All Activities <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
               </div>
            )}
          </div>

        </div>

        {/* Right Column - 4 cols */}
        <div className="col-span-4 space-y-6">
          
          {/* Quick Stats - Glass Card */}
          <div className="glass-panel rounded-2xl p-6 animate-slide-up" style={getDelay(2)}>
            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-widest mb-6 flex items-center gap-2">
               <BarChart3 className="h-4 w-4 text-gold-500" />
               Quick Stats
            </h3>
            <div className="space-y-4">
               <QuickStatRow label="Active Members" value={metrics.activeMembers} icon={Users} onClick={() => onNavigate('members')} />
               <QuickStatRow label="Assigned Accounts" value={accounts.length} icon={Building2} onClick={() => onNavigate('accounts')} />
               <QuickStatRow label="Assigned Jobs" value={jobs.length} icon={Briefcase} onClick={() => onNavigate('jobs')} />
               <QuickStatRow label="Placements MTD" value={metrics.placementsMTD} icon={Award} highlight />
            </div>
          </div>

          {/* Top Jobs - Glass Card */}
          <div className="glass-panel rounded-2xl overflow-hidden animate-slide-up" style={getDelay(3)}>
             <div className="px-6 py-4 border-b border-white/20 bg-white/40 flex justify-between items-center">
                <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-widest">Active Jobs</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" onClick={() => onNavigate('jobs')}>
                   <ArrowRight className="h-3 w-3 text-charcoal-500" />
                </Button>
             </div>
             <div className="p-2">
                {topJobs.map((job) => (
                   <div key={job.id} className="p-3 hover:bg-white/50 rounded-lg transition-colors cursor-pointer group">
                      <div className="font-semibold text-charcoal-900 text-sm truncate group-hover:text-forest-600 transition-colors">{job.title}</div>
                      <div className="flex justify-between items-center mt-1">
                         <span className="text-xs text-charcoal-500 truncate max-w-[120px]">{job.accountName}</span>
                         <span className="text-[10px] font-medium bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded-full border border-charcoal-200">
                            {job.submissionCount} subs
                         </span>
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// KPI Card Component
function KPICard({ title, value, subValue, icon: Icon, trend, onClick, delay }: any) {
  return (
    <div 
       className={cn(
          "glass-panel rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-premium animate-fade-in",
          onClick && "cursor-pointer"
       )}
       style={{ animationDelay: `${delay * 100}ms` }}
       onClick={onClick}
    >
       <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/20 to-transparent rounded-bl-full pointer-events-none opacity-50" />
       
       <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-charcoal-50/80 border border-white/60 flex items-center justify-center text-charcoal-500 group-hover:text-forest-600 group-hover:scale-110 transition-all duration-300">
             <Icon className="h-5 w-5" />
          </div>
          {trend === 'up' && <div className="text-emerald-500 bg-emerald-50 rounded-full p-1"><TrendingUp className="h-3 w-3" /></div>}
       </div>
       
       <div className="space-y-1 relative z-10">
          <h4 className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">{title}</h4>
          <div className="text-2xl font-bold text-charcoal-900 tracking-tight">{value}</div>
          <p className="text-xs font-medium text-charcoal-400">{subValue}</p>
       </div>
    </div>
  )
}

// Quick Stat Row Component
function QuickStatRow({ label, value, icon: Icon, onClick, highlight }: any) {
   return (
      <div 
         className={cn(
            "flex items-center justify-between p-3 rounded-xl transition-all duration-200",
            onClick ? "hover:bg-white/60 cursor-pointer group" : "",
            highlight ? "bg-gradient-to-r from-forest-50/50 to-transparent border border-forest-100/50" : "bg-transparent border border-transparent"
         )}
         onClick={onClick}
      >
         <div className="flex items-center gap-3">
            <div className={cn(
               "w-8 h-8 rounded-lg flex items-center justify-center",
               highlight ? "bg-forest-100 text-forest-600" : "bg-charcoal-50 text-charcoal-400 group-hover:bg-white group-hover:text-charcoal-600"
            )}>
               <Icon className="h-4 w-4" />
            </div>
            <span className={cn("text-sm font-medium", highlight ? "text-forest-900" : "text-charcoal-600")}>{label}</span>
         </div>
         <span className={cn("text-base font-bold", highlight ? "text-forest-600" : "text-charcoal-900")}>{value}</span>
      </div>
   )
}

export default TeamOverviewSection
