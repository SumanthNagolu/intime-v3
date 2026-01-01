'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase, Calendar, User, ArrowRight,
  ExternalLink, Plus, AlertCircle
} from 'lucide-react'
import type { LeadDeal, LeadData } from '@/types/lead'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface LeadDealSectionProps {
  deal: LeadDeal | null
  lead: LeadData
  onCreateDeal: () => void
}

const STAGE_ORDER = ['discovery', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

export function LeadDealSection({ deal, lead, onCreateDeal }: LeadDealSectionProps) {
  // Show different UI based on whether deal exists
  if (!deal) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-amber-400 mb-4" />
          <h3 className="text-lg font-medium text-charcoal-900 mb-2">No Deal Created Yet</h3>
          <p className="text-charcoal-600 mb-6">
            {lead.status === 'qualified'
              ? 'This lead is qualified and ready to be converted to a deal.'
              : 'Qualify this lead before creating a deal.'}
          </p>
          {lead.status === 'qualified' && (
            <Button onClick={onCreateDeal} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Deal
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Calculate weighted value
  const weightedValue = deal.value && deal.probability
    ? (deal.value * deal.probability) / 100
    : null

  // Find current stage index for pipeline display
  const currentStageIndex = STAGE_ORDER.indexOf(deal.stage)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-heading">Associated Deal</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/employee/crm/deals/${deal.id}`}>
            View Deal
            <ExternalLink className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Deal Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-charcoal-900">{deal.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="capitalize">{deal.stage.replace(/_/g, ' ')}</Badge>
            </div>
          </div>
        </div>

        {/* Deal Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-charcoal-50 rounded-lg">
          <div>
            <p className="text-sm text-charcoal-500">Value</p>
            <p className="text-lg font-semibold text-charcoal-900">
              {deal.value ? `$${deal.value.toLocaleString()}` : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Weighted</p>
            <p className="text-lg font-semibold text-charcoal-900">
              {weightedValue ? `$${weightedValue.toLocaleString()}` : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Probability</p>
            <p className="text-lg font-semibold text-charcoal-900">
              {deal.probability ? `${deal.probability}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-charcoal-500">Expected Close</p>
            <p className="text-lg font-semibold text-charcoal-900">
              {deal.expectedCloseDate
                ? format(parseISO(deal.expectedCloseDate), 'MMM d, yyyy')
                : '-'}
            </p>
          </div>
        </div>

        {/* Pipeline Progress */}
        <div>
          <p className="text-sm text-charcoal-500 mb-3">Pipeline Stage</p>
          <div className="flex items-center gap-1">
            {STAGE_ORDER.slice(0, -1).map((stage, index) => (
              <React.Fragment key={stage}>
                <div
                  className={`flex-1 h-2 rounded-full ${
                    index <= currentStageIndex
                      ? 'bg-gold-500'
                      : 'bg-charcoal-200'
                  }`}
                />
                {index < STAGE_ORDER.length - 2 && (
                  <ArrowRight className="w-4 h-4 text-charcoal-300 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-charcoal-500">
            <span>Discovery</span>
            <span>Qualification</span>
            <span>Proposal</span>
            <span>Negotiation</span>
            <span>Close</span>
          </div>
        </div>

        {/* Owner & Next Step */}
        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100">
          <div className="flex items-center gap-2 text-sm text-charcoal-600">
            <User className="w-4 h-4" />
            Owner: {deal.owner?.fullName || 'Unassigned'}
          </div>
          {deal.nextStep && (
            <div className="text-sm text-charcoal-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Next: {deal.nextStep}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
