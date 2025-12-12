'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  FileText,
  GitBranch,
  ChevronRight,
  Clock,
  User,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { InlinePanelSection } from '@/components/ui/inline-panel'

interface ContractVersionHistoryProps {
  contractId: string
  onSelectVersion?: (versionId: string) => void
}

interface ContractVersion {
  id: string
  versionNumber: number
  versionType: string
  versionName: string | null
  changeSummary: string | null
  effectiveDate: string | null
  expiryDate: string | null
  contractValue: number | null
  approvedAt: string | null
  createdAt: string
  approver?: {
    id: string
    fullName: string
  } | null
}

/**
 * ContractVersionHistory - Timeline view of contract versions
 *
 * Shows the version history of a contract including:
 * - Version numbers and status changes
 * - Created by and timestamp
 * - Navigation to previous versions
 */
export function ContractVersionHistory({
  contractId,
  onSelectVersion,
}: ContractVersionHistoryProps) {
  // Fetch version history
  const historyQuery = trpc.contracts.versions.list.useQuery({
    contractId,
  })

  const isLoading = historyQuery.isLoading
  const versions = historyQuery.data ?? []

  if (isLoading) {
    return (
      <InlinePanelSection title="Version History">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-charcoal-100" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </InlinePanelSection>
    )
  }

  if (versions.length === 0) {
    return (
      <InlinePanelSection title="Version History">
        <div className="text-center py-6">
          <GitBranch className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
          <p className="text-sm text-charcoal-500">No version history available</p>
        </div>
      </InlinePanelSection>
    )
  }

  return (
    <InlinePanelSection title="Version History">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-charcoal-200" />

        <div className="space-y-4">
          {versions.map((version, index) => {
            const isLatest = index === 0
            return (
              <div
                key={version.id}
                className={cn(
                  'relative flex gap-4 p-3 rounded-lg transition-colors',
                  isLatest
                    ? 'bg-gold-50/50 border border-gold-200'
                    : 'hover:bg-charcoal-50'
                )}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                    isLatest
                      ? 'bg-gold-500 text-white'
                      : 'bg-charcoal-100 text-charcoal-600'
                  )}
                >
                  {isLatest ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-medium">v{version.versionNumber}</span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-charcoal-900">
                      {version.versionName || `Version ${version.versionNumber}`}
                    </span>
                    {isLatest && (
                      <Badge className="bg-gold-100 text-gold-700 text-xs">
                        Current
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs capitalize">
                      {version.versionType.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                    </span>
                    {version.approver != null && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Approved by {(version.approver as { fullName: string }).fullName}
                      </span>
                    )}
                  </div>

                  {version.changeSummary && (
                    <p className="mt-1 text-xs text-charcoal-600">{version.changeSummary}</p>
                  )}

                  {version.effectiveDate && (
                    <div className="mt-2 text-xs text-charcoal-500">
                      Effective: {format(new Date(version.effectiveDate), 'MMM d, yyyy')}
                      {version.expiryDate && (
                        <>
                          {' '}<ArrowRight className="inline w-3 h-3" />{' '}
                          {format(new Date(version.expiryDate), 'MMM d, yyyy')}
                        </>
                      )}
                    </div>
                  )}

                  {onSelectVersion && !isLatest && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => onSelectVersion(version.id)}
                    >
                      View this version
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Version count summary */}
      <div className="mt-4 pt-4 border-t border-charcoal-200">
        <p className="text-sm text-charcoal-500">
          {versions.length} version{versions.length !== 1 ? 's' : ''} total
        </p>
      </div>
    </InlinePanelSection>
  )
}
