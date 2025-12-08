'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Plus, Loader2, ExternalLink, Calendar, DollarSign } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { DocumentInlinePanel } from '../DocumentInlinePanel'
import { cn } from '@/lib/utils'

interface AccountDocumentsSectionProps {
  accountId: string
  onAddDocument?: () => void
}

// Contract type labels and colors
const contractTypeConfig: Record<string, { label: string; color: string }> = {
  msa: { label: 'MSA', color: 'bg-blue-100 text-blue-700' },
  sow: { label: 'SOW', color: 'bg-purple-100 text-purple-700' },
  nda: { label: 'NDA', color: 'bg-amber-100 text-amber-700' },
  amendment: { label: 'Amendment', color: 'bg-cyan-100 text-cyan-700' },
  addendum: { label: 'Addendum', color: 'bg-teal-100 text-teal-700' },
  other: { label: 'Other', color: 'bg-charcoal-100 text-charcoal-700' },
}

// Status labels and colors
const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-100 text-charcoal-600' },
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  terminated: { label: 'Terminated', color: 'bg-charcoal-200 text-charcoal-700' },
}

/**
 * Documents Section - Shows contracts and documents for an account
 * Uses inline panel for detail view (Guidewire pattern)
 *
 * Trigger: Rendered when section === 'documents'
 * DB Call: contracts.listByAccount({ accountId })
 */
export function AccountDocumentsSection({ accountId, onAddDocument }: AccountDocumentsSectionProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)

  // This query fires when this component is rendered
  const contractsQuery = trpc.crm.contracts.listByAccount.useQuery({ accountId })
  const contracts = contractsQuery.data || []

  const handleDocumentClick = (documentId: string) => {
    setSelectedDocumentId(documentId)
  }

  const handleClosePanel = () => {
    setSelectedDocumentId(null)
  }

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents & Contracts</CardTitle>
          <CardDescription>MSA, SOW, NDA and other contract documents</CardDescription>
        </div>
        {onAddDocument && (
          <Button onClick={onAddDocument}>
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          {/* Documents list */}
          <div className={cn(
            'flex-1 transition-all duration-300',
            selectedDocumentId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
          )}>
            {contractsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
                <p className="text-charcoal-500">No documents yet</p>
                <p className="text-sm text-charcoal-400 mt-1">
                  Add contracts like MSA, SOW, or NDA documents
                </p>
                {onAddDocument && (
                  <Button className="mt-4" onClick={onAddDocument}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.map((contract: any) => {
                  const typeConfig = contractTypeConfig[contract.contract_type] || contractTypeConfig.other
                  const statusCfg = statusConfig[contract.status] || statusConfig.draft

                  return (
                    <div
                      key={contract.id}
                      onClick={() => handleDocumentClick(contract.id)}
                      className={cn(
                        'p-4 border rounded-lg cursor-pointer transition-colors',
                        selectedDocumentId === contract.id
                          ? 'border-hublot-500 bg-hublot-50'
                          : 'hover:border-hublot-300'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={cn('text-xs', typeConfig.color)}>
                              {typeConfig.label}
                            </Badge>
                            <Badge className={cn('text-xs', statusCfg.color)}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          <p className="font-medium text-charcoal-900 truncate">{contract.name}</p>
                          {contract.notes && (
                            <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">
                              {contract.notes}
                            </p>
                          )}
                        </div>
                        {contract.document_url && (
                          <a
                            href={contract.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-4 p-2 text-charcoal-400 hover:text-hublot-900 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-xs text-charcoal-500">
                        {contract.value && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatCurrency(contract.value, contract.currency)}
                          </span>
                        )}
                        {contract.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(contract.start_date), 'MMM d, yyyy')}
                            {contract.end_date && (
                              <> - {format(new Date(contract.end_date), 'MMM d, yyyy')}</>
                            )}
                          </span>
                        )}
                        {contract.payment_terms_days && (
                          <span>Net {contract.payment_terms_days}</span>
                        )}
                        <span className="ml-auto">
                          Added {formatDistanceToNow(new Date(contract.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Inline detail panel */}
          <DocumentInlinePanel
            documentId={selectedDocumentId}
            accountId={accountId}
            onClose={handleClosePanel}
          />
        </div>
      </CardContent>
    </Card>
  )
}
