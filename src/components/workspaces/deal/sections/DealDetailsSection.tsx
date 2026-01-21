'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign, TrendingUp, Calendar, Briefcase, FileText, Users,
  Clock, Target, Award, Edit, Calculator, Layers, CheckCircle2
} from 'lucide-react'
import type { DealData } from '@/types/deal'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealDetailsSectionProps {
  deal: DealData
  onEdit?: () => void
}

/**
 * DealDetailsSection - Comprehensive deal details view
 *
 * Displays all core deal information:
 * - Value & Revenue: value, probability, weighted value, currency, basis
 * - Staffing Details: placements, bill rate, contract length
 * - Services: services required, hiring needs
 * - Description
 */
export function DealDetailsSection({ deal, onEdit }: DealDetailsSectionProps) {
  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  return (
    <div className="space-y-6">
      {/* Value & Revenue Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(0)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Value & Revenue</h3>
                <p className="text-xs text-charcoal-500">Deal value and probability metrics</p>
              </div>
            </div>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100"
                onClick={onEdit}
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Deal Value */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Deal Value</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-charcoal-900">{formatCurrency(deal.value, deal.currency)}</span>
              </div>
              {deal.valueBasis && (
                <p className="text-xs text-charcoal-500 capitalize">{deal.valueBasis.replace(/_/g, ' ')}</p>
              )}
            </div>

            {/* Probability */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Win Probability</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-charcoal-900">{deal.probability}%</span>
              </div>
              <div className="w-full h-2 bg-charcoal-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    deal.probability >= 70 ? "bg-success-500" :
                      deal.probability >= 40 ? "bg-amber-500" : "bg-charcoal-400"
                  )}
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
            </div>

            {/* Weighted Value */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Weighted Value</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-charcoal-900">{formatCurrency(deal.weightedValue, deal.currency)}</span>
              </div>
              <p className="text-xs text-charcoal-500">{deal.probability}% of {formatCurrency(deal.value)}</p>
            </div>
          </div>

          {/* Additional details row */}
          <div className="mt-6 pt-6 border-t border-charcoal-100 grid grid-cols-3 gap-6">
            <DetailField label="Currency" value={deal.currency || 'USD'} icon={DollarSign} />
            <DetailField label="Value Basis" value={formatValueBasis(deal.valueBasis)} icon={Calculator} />
            <DetailField label="Stage" value={formatStage(deal.stage)} icon={Target} />
          </div>
        </div>
      </div>

      {/* Staffing Details Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Staffing Details</h3>
              <p className="text-xs text-charcoal-500">Resource requirements and billing</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <DetailField
              label="Est. Placements"
              value={deal.estimatedPlacements?.toString()}
              icon={Users}
            />
            <DetailField
              label="Avg Bill Rate"
              value={deal.avgBillRate ? formatCurrency(deal.avgBillRate) + '/hr' : null}
              icon={DollarSign}
            />
            <DetailField
              label="Contract Length"
              value={deal.contractLengthMonths ? `${deal.contractLengthMonths} months` : null}
              icon={Calendar}
            />
          </div>

          {/* Hiring Needs */}
          {deal.hiringNeeds && (
            <div className="mt-6 pt-6 border-t border-charcoal-100">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Hiring Needs</p>
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">{deal.hiringNeeds}</p>
            </div>
          )}

          {/* Roles Breakdown */}
          {deal.rolesBreakdown && deal.rolesBreakdown.length > 0 && (
            <div className="mt-6 pt-6 border-t border-charcoal-100">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3">Roles Breakdown</p>
              <div className="space-y-2">
                {deal.rolesBreakdown.map((role, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg border border-charcoal-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-charcoal-200 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-charcoal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-900">{role.title}</p>
                        <p className="text-xs text-charcoal-500">{role.count} position{role.count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    {role.billRate && (
                      <Badge variant="outline" className="text-charcoal-600">
                        {formatCurrency(role.billRate)}/hr
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Services Required Card */}
      {deal.servicesRequired && deal.servicesRequired.length > 0 && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Services Required</h3>
                <p className="text-xs text-charcoal-500">Engagement types and service offerings</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {deal.servicesRequired.map((service, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="px-3 py-1.5 text-sm font-medium text-charcoal-700 bg-charcoal-50 border-charcoal-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-charcoal-500" />
                  {formatService(service)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Description Card */}
      {deal.description && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(3)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Description</h3>
                <p className="text-xs text-charcoal-500">Deal summary and context</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">{deal.description}</p>
          </div>
        </div>
      )}

      {/* Pipeline Status Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-charcoal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900">Pipeline Status</h3>
              <p className="text-xs text-charcoal-500">Current stage and health metrics</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Current Stage</p>
              <Badge className={cn("font-medium", getStageColor(deal.stage))}>
                {formatStage(deal.stage)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Days in Stage</p>
              <p className={cn(
                "text-lg font-bold",
                deal.daysInStage > 30 ? "text-amber-600" : deal.daysInStage > 60 ? "text-error-600" : "text-charcoal-900"
              )}>
                {deal.daysInStage}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Health Status</p>
              <Badge className={cn("font-medium", getHealthColor(deal.healthStatus))}>
                {formatHealthStatus(deal.healthStatus)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Last Activity</p>
              <p className="text-sm font-medium text-charcoal-700">
                {deal.lastActivityAt
                  ? format(new Date(deal.lastActivityAt), 'MMM d, yyyy')
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper Components
function DetailField({
  label,
  value,
  icon: Icon
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
          value ? "text-charcoal-900 font-medium" : "text-charcoal-400 italic"
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

function formatValueBasis(basis: string | null): string {
  if (!basis) return 'One-time'
  const bases: Record<string, string> = {
    one_time: 'One-time',
    annual: 'Annual',
    monthly: 'Monthly',
  }
  return bases[basis] || basis
}

function formatService(service: string): string {
  return service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function formatHealthStatus(status: string | null): string {
  if (!status) return 'Not Rated'
  const statuses: Record<string, string> = {
    on_track: 'On Track',
    slow: 'Slow',
    stale: 'Stale',
    urgent: 'Urgent',
    at_risk: 'At Risk',
  }
  return statuses[status] || status
}

function getStageColor(stage: string): string {
  const colors: Record<string, string> = {
    discovery: 'bg-charcoal-100 text-charcoal-700',
    qualification: 'bg-blue-50 text-blue-700',
    proposal: 'bg-amber-50 text-amber-700',
    negotiation: 'bg-orange-50 text-orange-700',
    verbal_commit: 'bg-emerald-50 text-emerald-700',
    closed_won: 'bg-success-50 text-success-700',
    closed_lost: 'bg-error-50 text-error-700',
  }
  return colors[stage] || 'bg-charcoal-100 text-charcoal-700'
}

function getHealthColor(status: string | null): string {
  if (!status) return 'bg-charcoal-100 text-charcoal-600'
  const colors: Record<string, string> = {
    on_track: 'bg-success-50 text-success-700',
    slow: 'bg-amber-50 text-amber-700',
    stale: 'bg-orange-50 text-orange-700',
    urgent: 'bg-error-50 text-error-700',
    at_risk: 'bg-error-50 text-error-700',
  }
  return colors[status] || 'bg-charcoal-100 text-charcoal-600'
}

export default DealDetailsSection
