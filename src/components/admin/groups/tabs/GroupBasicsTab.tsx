'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardGrid } from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import {
  Briefcase,
  FileText,
  Target,
  DollarSign,
  AlertTriangle,
  Crown,
  MapPin,
} from 'lucide-react'
import Link from 'next/link'
import type { FullGroupData } from '@/types/admin'

const POD_TYPE_LABELS: Record<string, string> = {
  recruiting: 'Recruiting',
  bench_sales: 'Bench Sales',
  ta: 'TA',
  hr: 'HR',
  mixed: 'Mixed',
}

const POD_TYPE_COLORS: Record<string, string> = {
  recruiting: 'bg-blue-100 text-blue-800',
  bench_sales: 'bg-purple-100 text-purple-800',
  ta: 'bg-cyan-100 text-cyan-800',
  hr: 'bg-pink-100 text-pink-800',
  mixed: 'bg-gray-100 text-gray-800',
}

interface GroupBasicsTabProps {
  group: FullGroupData
}

/**
 * Group Basics Tab - Group Info, Metrics, Manager, Sprint Config
 */
export function GroupBasicsTab({ group }: GroupBasicsTabProps) {
  const metrics = group.sections?.metrics ?? {
    openJobs: 0,
    submissionsMtd: 0,
    placementsMtd: 0,
    revenueMtd: 0,
  }

  const getInitials = (name?: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  return (
    <div className="space-y-6">
      {/* Status Banner for Inactive */}
      {group.status === 'inactive' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            This group is currently inactive. Reactivate it to resume operations.
          </p>
        </div>
      )}

      {/* Metrics Cards */}
      <div>
        <h3 className="text-sm font-semibold text-charcoal-600 uppercase tracking-wider mb-3">
          Group Metrics
        </h3>
        <DashboardGrid columns={4}>
          <StatsCard
            title="Open Jobs"
            value={metrics.openJobs}
            icon={Briefcase}
          />
          <StatsCard
            title="Submissions (MTD)"
            value={metrics.submissionsMtd}
            icon={FileText}
          />
          <StatsCard
            title="Placements (MTD)"
            value={metrics.placementsMtd}
            icon={Target}
            variant="success"
          />
          <StatsCard
            title="Revenue (MTD)"
            value={`$${metrics.revenueMtd.toLocaleString()}`}
            icon={DollarSign}
          />
        </DashboardGrid>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Group Info Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Group Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Group Name</p>
                <p className="font-medium text-charcoal-900">{group.name}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Description</p>
                <p className="font-medium text-charcoal-900">
                  {group.description || <span className="text-charcoal-400">No description</span>}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Type</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${POD_TYPE_COLORS[group.pod_type] ?? 'bg-gray-100 text-gray-800'}`}>
                    {POD_TYPE_LABELS[group.pod_type] ?? group.pod_type}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    group.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-charcoal-100 text-charcoal-600'
                  }`}>
                    {group.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Formed Date</p>
                  <p className="font-medium text-charcoal-900">
                    {group.formed_date
                      ? new Date(group.formed_date).toLocaleDateString()
                      : <span className="text-charcoal-400">Not set</span>}
                  </p>
                </div>
                {group.dissolved_date && (
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Dissolved Date</p>
                    <p className="font-medium text-charcoal-900">
                      {new Date(group.dissolved_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Manager */}
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-2">Supervisor</p>
                {group.manager ? (
                  <Link
                    href={`/employee/admin/users/${group.manager.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium">
                      {getInitials(group.manager.full_name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal-900 group-hover:text-gold-600 transition-colors">
                          {group.manager.full_name}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Manager
                        </span>
                      </div>
                      <span className="text-sm text-charcoal-500">{group.manager.email}</span>
                    </div>
                  </Link>
                ) : (
                  <p className="text-charcoal-400">No supervisor assigned</p>
                )}
              </div>

              {/* Region */}
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-2">Region</p>
                {group.region ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-charcoal-400" />
                    <span className="font-medium text-charcoal-900">
                      {group.region.name} ({group.region.code})
                    </span>
                  </div>
                ) : (
                  <p className="text-charcoal-400">No region assigned</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint Configuration */}
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Sprint Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Sprint Duration</p>
                <p className="font-semibold text-charcoal-900">
                  {(group as { sprint_duration_weeks?: number }).sprint_duration_weeks ?? 2} weeks
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Placements Target</p>
                <p className="font-semibold text-charcoal-900">
                  {(group as { placements_per_sprint_target?: number }).placements_per_sprint_target ?? 2} per sprint
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Sprint Start Day</p>
                <p className="font-semibold text-charcoal-900 capitalize">
                  {(group as { sprint_start_day?: string }).sprint_start_day ?? 'Monday'}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Member Count</p>
                <p className="font-semibold text-charcoal-900">
                  {group.members?.filter(m => m.is_active).length ?? 0} active members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
