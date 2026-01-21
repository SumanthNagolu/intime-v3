'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText, DollarSign, Calendar, CreditCard, Clock, Edit,
  Briefcase, Users, Building2, CheckCircle2, AlertCircle, Receipt
} from 'lucide-react'
import type { DealData } from '@/types/deal'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface DealProposalSectionProps {
  deal: DealData
  onEdit?: () => void
}

/**
 * DealProposalSection - Pricing, terms, and scope of services
 *
 * Displays:
 * - Contract details (type, duration, terms)
 * - Billing information (frequency, contact)
 * - Confirmed roles (if closed won)
 * - Services scope
 */
export function DealProposalSection({ deal, onEdit }: DealProposalSectionProps) {
  // Animation delay helper
  const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

  const isClosed = deal.stage === 'closed_won' || deal.stage === 'closed_lost'
  const isWon = deal.stage === 'closed_won'

  return (
    <div className="space-y-6">
      {/* Pricing Overview Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(0)}>
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Pricing Overview</h3>
                <p className="text-xs text-charcoal-500">Deal value and billing structure</p>
              </div>
            </div>
            {onEdit && !isClosed && (
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
          <div className="grid grid-cols-4 gap-6">
            {/* Deal Value */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Deal Value</p>
              <p className="text-2xl font-bold text-charcoal-900">{formatCurrency(deal.value, deal.currency)}</p>
              {deal.valueBasis && (
                <p className="text-xs text-charcoal-500 capitalize">{deal.valueBasis.replace(/_/g, ' ')}</p>
              )}
            </div>

            {/* Avg Bill Rate */}
            {deal.avgBillRate && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Avg Bill Rate</p>
                <p className="text-2xl font-bold text-charcoal-900">{formatCurrency(deal.avgBillRate)}</p>
                <p className="text-xs text-charcoal-500">per hour</p>
              </div>
            )}

            {/* Est. Placements */}
            {deal.estimatedPlacements && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Est. Placements</p>
                <p className="text-2xl font-bold text-charcoal-900">{deal.estimatedPlacements}</p>
                <p className="text-xs text-charcoal-500">positions</p>
              </div>
            )}

            {/* Contract Length */}
            {deal.contractLengthMonths && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Contract Length</p>
                <p className="text-2xl font-bold text-charcoal-900">{deal.contractLengthMonths}</p>
                <p className="text-xs text-charcoal-500">months</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Details Card (if closed won or has contract info) */}
      {(isWon || deal.contractType || deal.paymentTerms) && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Contract Details</h3>
                <p className="text-xs text-charcoal-500">Terms and conditions</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {deal.contractType && (
                <DetailField
                  label="Contract Type"
                  value={formatContractType(deal.contractType)}
                  icon={FileText}
                />
              )}
              {deal.paymentTerms && (
                <DetailField
                  label="Payment Terms"
                  value={formatPaymentTerms(deal.paymentTerms)}
                  icon={CreditCard}
                />
              )}
              {deal.billingFrequency && (
                <DetailField
                  label="Billing Frequency"
                  value={formatBillingFrequency(deal.billingFrequency)}
                  icon={Receipt}
                />
              )}
              {deal.contractDurationMonths && (
                <DetailField
                  label="Contract Duration"
                  value={`${deal.contractDurationMonths} months`}
                  icon={Clock}
                />
              )}
              {deal.contractSignedDate && (
                <DetailField
                  label="Signed Date"
                  value={format(new Date(deal.contractSignedDate), 'MMM d, yyyy')}
                  icon={Calendar}
                />
              )}
              {deal.contractStartDate && (
                <DetailField
                  label="Start Date"
                  value={format(new Date(deal.contractStartDate), 'MMM d, yyyy')}
                  icon={Calendar}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Contact Card (if available) */}
      {deal.billingContact && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(2)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Billing Contact</h3>
                <p className="text-xs text-charcoal-500">Where to send invoices</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-charcoal-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-semibold text-charcoal-900">{deal.billingContact.name}</p>
                {deal.billingContact.email && (
                  <a
                    href={`mailto:${deal.billingContact.email}`}
                    className="text-sm text-charcoal-600 hover:text-gold-700 transition-colors block"
                  >
                    {deal.billingContact.email}
                  </a>
                )}
                {deal.billingContact.phone && (
                  <p className="text-sm text-charcoal-600">{deal.billingContact.phone}</p>
                )}
                {deal.billingContact.address && (
                  <p className="text-sm text-charcoal-500 whitespace-pre-line">{deal.billingContact.address}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Roles Breakdown Card */}
      {deal.rolesBreakdown && deal.rolesBreakdown.length > 0 && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(3)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">
                  {isWon ? 'Confirmed Roles' : 'Proposed Roles'}
                </h3>
                <p className="text-xs text-charcoal-500">Positions and rates</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-hidden rounded-lg border border-charcoal-200">
              <table className="w-full">
                <thead className="bg-charcoal-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Role</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Count</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Bill Rate</th>
                    {deal.rolesBreakdown.some(r => r.startDate) && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Start Date</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {deal.rolesBreakdown.map((role, idx) => (
                    <tr key={idx} className="hover:bg-charcoal-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                            <Briefcase className="h-4 w-4 text-charcoal-500" />
                          </div>
                          <span className="text-sm font-medium text-charcoal-900">{role.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="text-charcoal-700">
                          {role.count}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-charcoal-900">
                        {role.billRate ? formatCurrency(role.billRate) + '/hr' : '—'}
                      </td>
                      {deal.rolesBreakdown!.some(r => r.startDate) && (
                        <td className="px-4 py-3 text-right text-sm text-charcoal-600">
                          {role.startDate ? format(new Date(role.startDate), 'MMM d, yyyy') : '—'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-charcoal-50 border-t border-charcoal-200">
                  <tr>
                    <td className="px-4 py-3 text-sm font-semibold text-charcoal-900">Total</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-charcoal-900 text-white">
                        {deal.rolesBreakdown.reduce((sum, r) => sum + r.count, 0)}
                      </Badge>
                    </td>
                    <td colSpan={deal.rolesBreakdown.some(r => r.startDate) ? 2 : 1}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Services Required Card */}
      {deal.servicesRequired && deal.servicesRequired.length > 0 && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(4)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Services Scope</h3>
                <p className="text-xs text-charcoal-500">Engagement types included</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {deal.servicesRequired.map((service, idx) => (
                <Badge
                  key={idx}
                  className="px-3 py-1.5 text-sm font-medium bg-success-50 text-success-700 border-success-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  {formatService(service)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hiring Needs Card */}
      {deal.hiringNeeds && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(5)}>
          <div className="px-6 py-4 border-b border-charcoal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Hiring Needs</h3>
                <p className="text-xs text-charcoal-500">Client requirements and context</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">{deal.hiringNeeds}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!deal.contractType && !deal.paymentTerms && !deal.billingContact && !deal.rolesBreakdown?.length && !deal.servicesRequired?.length && !deal.hiringNeeds && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up" style={getDelay(1)}>
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-charcoal-400" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-1">No Proposal Details</h3>
            <p className="text-sm text-charcoal-500 max-w-md mx-auto">
              Add contract terms, pricing, and scope details to track the proposal for this deal.
            </p>
            {onEdit && !isClosed && (
              <Button
                variant="outline"
                className="mt-6"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Add Proposal Details
              </Button>
            )}
          </div>
        </div>
      )}
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
  value: string | null | undefined
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-charcoal-400 shrink-0" />}
        <span className={cn(
          "text-sm font-medium",
          value ? "text-charcoal-900" : "text-charcoal-400 italic"
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

function formatContractType(type: string): string {
  const types: Record<string, string> = {
    msa: 'Master Service Agreement',
    sow: 'Statement of Work',
    po: 'Purchase Order',
    email: 'Email Confirmation',
  }
  return types[type] || type
}

function formatPaymentTerms(terms: string): string {
  const termsMap: Record<string, string> = {
    net_15: 'Net 15',
    net_30: 'Net 30',
    net_45: 'Net 45',
    net_60: 'Net 60',
  }
  return termsMap[terms] || terms
}

function formatBillingFrequency(frequency: string): string {
  const frequencies: Record<string, string> = {
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
  }
  return frequencies[frequency] || frequency
}

function formatService(service: string): string {
  return service.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export default DealProposalSection
