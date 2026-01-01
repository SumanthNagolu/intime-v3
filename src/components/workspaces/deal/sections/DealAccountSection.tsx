'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Building2, Globe, MapPin, Users, DollarSign, ExternalLink, Target } from 'lucide-react'
import type { DealAccountInfo, DealLeadInfo } from '@/types/deal'

interface DealAccountSectionProps {
  account: DealAccountInfo | null
  lead: DealLeadInfo | null
}

export function DealAccountSection({ account, lead }: DealAccountSectionProps) {
  return (
    <div className="space-y-6">
      {/* Account Details */}
      {account ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Account Details</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/employee/crm/accounts/${account.id}`}>
                View Account
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-charcoal-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-charcoal-900">{account.name}</h3>
                <p className="text-sm text-charcoal-600">{account.industry || 'No industry'}</p>
                {account.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-charcoal-100 rounded text-charcoal-600 capitalize">
                    {account.category}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {account.employeeCount && (
                <InfoRow
                  label="Employees"
                  value={account.employeeCount.toLocaleString()}
                  icon={Users}
                />
              )}
              {account.revenue && (
                <InfoRow
                  label="Revenue"
                  value={account.revenue}
                  icon={DollarSign}
                />
              )}
              {account.website && (
                <InfoRow
                  label="Website"
                  value={
                    <a
                      href={`https://${account.website.replace(/^https?:\/\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 hover:underline"
                    >
                      {account.website}
                    </a>
                  }
                  icon={Globe}
                />
              )}
              {account.location && (
                <InfoRow
                  label="Location"
                  value={account.location}
                  icon={MapPin}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">No account linked to this deal</p>
          </CardContent>
        </Card>
      )}

      {/* Source Lead */}
      {lead && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Source Lead</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/employee/crm/leads/${lead.id}`}>
                View Lead
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-gold-600" />
              </div>
              <div>
                <h3 className="font-medium text-charcoal-900">{lead.fullName}</h3>
                <p className="text-sm text-charcoal-600">{lead.email}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-charcoal-500">
                  <span className="capitalize">{lead.status}</span>
                  {lead.source && <span>• Source: {lead.source}</span>}
                  {lead.convertedAt && <span>• Converted {new Date(lead.convertedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account History Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-heading">Account History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-2xl font-bold text-charcoal-900">0</p>
              <p className="text-xs text-charcoal-500 mt-1">Previous Deals</p>
            </div>
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-2xl font-bold text-charcoal-900">$0</p>
              <p className="text-xs text-charcoal-500 mt-1">Total Revenue</p>
            </div>
            <div className="p-4 bg-charcoal-50 rounded-lg">
              <p className="text-2xl font-bold text-charcoal-900">0</p>
              <p className="text-xs text-charcoal-500 mt-1">Active Jobs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: React.ReactNode
  icon?: React.ElementType
}) {
  return (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-charcoal-400 flex-shrink-0" />}
      <span className="text-sm text-charcoal-500">{label}:</span>
      <span className="text-sm font-medium text-charcoal-900">{value || '-'}</span>
    </div>
  )
}

export default DealAccountSection
