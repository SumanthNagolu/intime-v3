'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Calendar, CheckCircle2, AlertTriangle, Clock,
  Plus, Download, ExternalLink, RefreshCw, Pencil
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { cn } from '@/lib/utils'
import { format, differenceInDays, parseISO } from 'date-fns'

interface AccountContractsSectionProps {
  account: AccountData
}

/**
 * AccountContractsSection - Contracts
 * Displays MSA status and contract information
 * Matches wizard Step 5: Contracts
 */
export function AccountContractsSection({ account }: AccountContractsSectionProps) {
  const { refreshData, data } = useAccountWorkspace()
  const [isEditing, setIsEditing] = React.useState(false)

  // Calculate days until expiration
  const daysUntilExpiration = account.msa_expiration_date
    ? differenceInDays(parseISO(account.msa_expiration_date), new Date())
    : null

  // Get MSA status styling
  const getMsaStatusStyle = (status: string | null) => {
    if (!status) return { variant: 'secondary' as const, icon: Clock, label: 'Not Set' }
    switch (status.toLowerCase()) {
      case 'active':
        return { variant: 'success' as const, icon: CheckCircle2, label: 'Active' }
      case 'expired':
        return { variant: 'destructive' as const, icon: AlertTriangle, label: 'Expired' }
      case 'pending':
        return { variant: 'warning' as const, icon: Clock, label: 'Pending' }
      case 'in_review':
        return { variant: 'warning' as const, icon: RefreshCw, label: 'In Review' }
      default:
        return { variant: 'secondary' as const, icon: Clock, label: status.replace(/_/g, ' ') }
    }
  }

  const msaStatusStyle = getMsaStatusStyle(account.msa_status)
  const MsaStatusIcon = msaStatusStyle.icon

  // Expiration warning threshold (30 days)
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration > 0 && daysUntilExpiration <= 30
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">Contracts</h2>
          <p className="text-sm text-charcoal-500 mt-1">Master Service Agreements, SOWs, and other contracts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Contract
          </Button>
        </div>
      </div>

      {/* MSA Status Card */}
      <Card className={cn(
        "shadow-elevation-sm transition-all",
        isExpiringSoon && "ring-2 ring-warning-200",
        isExpired && "ring-2 ring-error-200"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <FileText className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Master Service Agreement (MSA)</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Status */}
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Status</p>
              <Badge variant={msaStatusStyle.variant} className="gap-1">
                <MsaStatusIcon className="w-3 h-3" />
                {msaStatusStyle.label}
              </Badge>
            </div>

            {/* Effective Date */}
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Effective Date</p>
              <p className={cn("text-sm", account.msa_effective_date ? "text-charcoal-900" : "text-charcoal-400")}>
                {account.msa_effective_date
                  ? format(parseISO(account.msa_effective_date), 'MMM d, yyyy')
                  : 'Not set'}
              </p>
            </div>

            {/* Expiration Date */}
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Expiration Date</p>
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm",
                  isExpired && "text-error-600 font-medium",
                  isExpiringSoon && "text-warning-600 font-medium",
                  !account.msa_expiration_date && "text-charcoal-400"
                )}>
                  {account.msa_expiration_date
                    ? format(parseISO(account.msa_expiration_date), 'MMM d, yyyy')
                    : 'Not set'}
                </p>
                {isExpiringSoon && (
                  <Badge variant="warning" className="text-xs">
                    {daysUntilExpiration} days
                  </Badge>
                )}
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
            </div>

            {/* Auto Renew */}
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Auto Renews</p>
              <Badge variant={account.msa_auto_renews ? 'success' : 'secondary'}>
                {account.msa_auto_renews ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>

          {/* Warning Banner */}
          {(isExpiringSoon || isExpired) && (
            <div className={cn(
              "mt-4 p-3 rounded-lg flex items-center gap-3",
              isExpired ? "bg-error-50 text-error-700" : "bg-warning-50 text-warning-700"
            )}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm">
                {isExpired
                  ? 'This MSA has expired. Please review and renew the agreement.'
                  : `This MSA expires in ${daysUntilExpiration} days. Consider initiating renewal.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contracts List Placeholder */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">All Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-charcoal-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Contract management coming soon</p>
            <p className="text-xs mt-1">Upload and manage SOWs, NDAs, and other agreements</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountContractsSection
