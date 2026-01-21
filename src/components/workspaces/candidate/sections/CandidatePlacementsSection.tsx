'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Award,
  ArrowRight,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Heart,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CandidatePlacement } from '@/types/candidate-workspace'
import { format, formatDistanceToNow, differenceInDays, isFuture, isPast } from 'date-fns'

interface CandidatePlacementsSectionProps {
  placements: CandidatePlacement[]
  candidateId: string
}

/**
 * CandidatePlacementsSection - Displays all placements for a candidate
 *
 * Shows placement history with rates, status, and health indicators.
 */
export function CandidatePlacementsSection({
  placements,
  candidateId,
}: CandidatePlacementsSectionProps) {
  // Group by status
  const activePlacements = placements.filter(
    (p) => ['active', 'extended'].includes(p.status)
  )
  const pendingPlacements = placements.filter((p) => p.status === 'pending_start')
  const endedPlacements = placements.filter((p) => p.status === 'ended')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Placements</h2>
          <p className="text-sm text-charcoal-500">
            {placements.length} total placement{placements.length !== 1 ? 's' : ''}
            {activePlacements.length > 0 && ` · ${activePlacements.length} active`}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          label="Active"
          value={activePlacements.length}
          icon={<CheckCircle className="h-5 w-5" />}
          color="bg-success-100 text-success-600"
        />
        <StatsCard
          label="Pending Start"
          value={pendingPlacements.length}
          icon={<Clock className="h-5 w-5" />}
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard
          label="Extended"
          value={placements.filter(p => p.extensionCount > 0).length}
          icon={<TrendingUp className="h-5 w-5" />}
          color="bg-purple-100 text-purple-600"
        />
        <StatsCard
          label="Completed"
          value={endedPlacements.length}
          icon={<Award className="h-5 w-5" />}
          color="bg-charcoal-100 text-charcoal-600"
        />
      </div>

      {/* Active Placements */}
      {activePlacements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Active Placements ({activePlacements.length})
          </h3>
          <div className="space-y-3">
            {activePlacements.map((placement) => (
              <PlacementCard key={placement.id} placement={placement} />
            ))}
          </div>
        </div>
      )}

      {/* Pending Start */}
      {pendingPlacements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Pending Start ({pendingPlacements.length})
          </h3>
          <div className="space-y-3">
            {pendingPlacements.map((placement) => (
              <PlacementCard key={placement.id} placement={placement} />
            ))}
          </div>
        </div>
      )}

      {/* Ended Placements */}
      {endedPlacements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-charcoal-700 uppercase tracking-wider">
            Completed ({endedPlacements.length})
          </h3>
          <div className="space-y-3">
            {endedPlacements.map((placement) => (
              <PlacementCard key={placement.id} placement={placement} variant="muted" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {placements.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto text-charcoal-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              No Placements Yet
            </h3>
            <p className="text-sm text-charcoal-500 max-w-md mx-auto">
              When this candidate is successfully placed in a job, their placement history will appear here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Stats Card
function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', color)}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-semibold text-charcoal-900">{value}</div>
            <div className="text-sm text-charcoal-500">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Placement Card
function PlacementCard({
  placement,
  variant = 'default',
}: {
  placement: CandidatePlacement
  variant?: 'default' | 'muted'
}) {
  const isMuted = variant === 'muted'

  // Format rate
  const formatRate = (rate: number, rateType: string | null) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(rate)
    const suffix = rateType === 'annual' ? '/yr' : '/hr'
    return `${formatted}${suffix}`
  }

  // Format date range
  const formatDateRange = () => {
    const start = format(new Date(placement.startDate), 'MMM d, yyyy')
    const end = placement.actualEndDate
      ? format(new Date(placement.actualEndDate), 'MMM d, yyyy')
      : placement.endDate
        ? format(new Date(placement.endDate), 'MMM d, yyyy')
        : 'Ongoing'
    return `${start} - ${end}`
  }

  // Calculate duration
  const getDuration = () => {
    const startDate = new Date(placement.startDate)
    const endDate = placement.actualEndDate
      ? new Date(placement.actualEndDate)
      : placement.endDate
        ? new Date(placement.endDate)
        : new Date()
    const days = differenceInDays(endDate, startDate)
    if (days < 30) return `${days} days`
    if (days < 365) return `${Math.round(days / 30)} months`
    return `${(days / 365).toFixed(1)} years`
  }

  // Get status badge config
  const getStatusConfig = () => {
    switch (placement.status) {
      case 'active':
        return { label: 'Active', bg: 'bg-success-100', text: 'text-success-700', border: 'border-success-200' }
      case 'extended':
        return { label: 'Extended', bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' }
      case 'pending_start':
        return { label: 'Pending Start', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' }
      case 'ended':
        return { label: 'Completed', bg: 'bg-charcoal-100', text: 'text-charcoal-600', border: 'border-charcoal-200' }
      default:
        return { label: placement.status, bg: 'bg-charcoal-100', text: 'text-charcoal-600', border: 'border-charcoal-200' }
    }
  }

  // Get health badge config
  const getHealthConfig = () => {
    switch (placement.healthStatus) {
      case 'healthy':
        return { label: 'Healthy', bg: 'bg-success-100', text: 'text-success-700', icon: Heart }
      case 'at_risk':
        return { label: 'At Risk', bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle }
      case 'critical':
        return { label: 'Critical', bg: 'bg-error-100', text: 'text-error-700', icon: AlertCircle }
      default:
        return null
    }
  }

  const statusConfig = getStatusConfig()
  const healthConfig = getHealthConfig()

  return (
    <Card className={cn(isMuted && 'opacity-75')}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left: Job and Account Info */}
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              placement.status === 'active' ? 'bg-success-100' : 'bg-charcoal-100'
            )}>
              <Briefcase className={cn(
                'h-5 w-5',
                placement.status === 'active' ? 'text-success-600' : 'text-charcoal-600'
              )} />
            </div>
            <div>
              <h4 className="font-medium text-charcoal-900">
                {placement.job?.title || 'Unknown Job'}
              </h4>
              <div className="flex items-center gap-3 text-sm text-charcoal-500 mt-1">
                {placement.account && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {placement.account.name}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateRange()}
                </span>
              </div>

              {/* Rate and Duration Info */}
              <div className="flex items-center gap-4 mt-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-charcoal-400" />
                  <span className="text-charcoal-700">
                    Bill: {formatRate(placement.billRate, placement.rateType)}
                  </span>
                </div>
                <div className="text-charcoal-400">•</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-charcoal-600">
                    Pay: {formatRate(placement.payRate, placement.rateType)}
                  </span>
                </div>
                {placement.markupPercentage && (
                  <>
                    <div className="text-charcoal-400">•</div>
                    <div className="text-charcoal-500">
                      {placement.markupPercentage.toFixed(1)}% margin
                    </div>
                  </>
                )}
                <div className="text-charcoal-400">•</div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-charcoal-400" />
                  <span className="text-charcoal-600">{getDuration()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status and Actions */}
          <div className="flex items-center gap-3">
            {/* Health Badge */}
            {healthConfig && placement.status !== 'ended' && (
              <Badge className={cn('capitalize whitespace-nowrap', healthConfig.bg, healthConfig.text)}>
                <healthConfig.icon className="h-3 w-3 mr-1" />
                {healthConfig.label}
              </Badge>
            )}

            {/* Extension Count */}
            {placement.extensionCount > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                {placement.extensionCount} ext
              </Badge>
            )}

            {/* Status Badge */}
            <Badge className={cn('capitalize whitespace-nowrap', statusConfig.bg, statusConfig.text, statusConfig.border)}>
              {statusConfig.label}
            </Badge>

            {/* View Link */}
            <Link
              href={`/employee/recruiting/placements/${placement.id}`}
              className="flex items-center gap-1 text-sm text-gold-600 hover:text-gold-700"
            >
              View <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default CandidatePlacementsSection
