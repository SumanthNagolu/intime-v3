'use client'

import { useState } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { format, isAfter, isBefore, addDays } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { ComplianceStatusBadge } from './ComplianceStatusBadge'
import { ComplianceItemForm } from './ComplianceItemForm'

interface ComplianceItemsSectionProps {
  entityType: string
  entityId: string
  className?: string
}

interface ComplianceItem {
  id: string
  entityType: string
  entityId: string
  requirementId: string | null
  complianceType: string | null
  complianceName: string | null
  status: string
  effectiveDate: string | null
  expiryDate: string | null
  verificationNotes: string | null
  verifiedAt: string | null
  createdAt: string
  requirement?: {
    id: string
    requirementName: string
    category: string
    isBlocking: boolean
    priority: string
  } | null
  verifier?: {
    id: string
    fullName: string
  } | null
}

/**
 * ComplianceItemsSection - Section component for displaying compliance items
 *
 * Features:
 * - List compliance items for an entity
 * - Stats cards showing compliance status
 * - Inline panel for details/editing
 * - Add new compliance items
 */
export function ComplianceItemsSection({
  entityType,
  entityId,
  className,
}: ComplianceItemsSectionProps) {
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  const utils = trpc.useUtils()

  // Fetch compliance items
  const itemsQuery = trpc.compliance.items.listByEntity.useQuery({
    entityType,
    entityId,
    limit: 100,
  })

  // Fetch stats
  const statsQuery = trpc.compliance.statsByEntity.useQuery({
    entityType,
    entityId,
  })

  const items = itemsQuery.data?.items ?? []
  const stats = statsQuery.data

  const handleRefresh = () => {
    utils.compliance.items.listByEntity.invalidate({ entityType, entityId })
    utils.compliance.statsByEntity.invalidate({ entityType, entityId })
  }

  const handleFormSuccess = () => {
    setIsAddingNew(false)
    setSelectedItem(null)
    handleRefresh()
  }

  const handleSelectItem = (item: ComplianceItem) => {
    setIsAddingNew(false)
    setSelectedItem(item)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'expired':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'expiring':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />
      default:
        return <Clock className="w-4 h-4 text-charcoal-400" />
    }
  }

  const isExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const warningDate = addDays(new Date(), 30)
    return isAfter(warningDate, expiry) && isBefore(new Date(), expiry)
  }

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false
    return isBefore(new Date(expiryDate), new Date())
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-900">{stats.verified}</p>
                  <p className="text-sm text-charcoal-500">Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-900">{stats.pending}</p>
                  <p className="text-sm text-charcoal-500">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-900">{stats.expiringSoon}</p>
                  <p className="text-sm text-charcoal-500">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-900">{stats.expired}</p>
                  <p className="text-sm text-charcoal-500">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="flex gap-4">
        {/* Items Table */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            (selectedItem || isAddingNew) ? 'max-w-[calc(100%-480px)]' : 'max-w-full'
          )}
        >
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-charcoal-600" />
                Compliance Items
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={itemsQuery.isLoading}
                >
                  <RefreshCw className={cn('w-4 h-4', itemsQuery.isLoading && 'animate-spin')} />
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null)
                    setIsAddingNew(true)
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <EmptyState
                  config={{
                    icon: ShieldCheck,
                    title: 'No Compliance Items',
                    description: 'Add compliance items to track certifications, background checks, and more.',
                    action: {
                      label: 'Add Compliance Item',
                      onClick: () => setIsAddingNew(true),
                    },
                  }}
                  variant="inline"
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow
                        key={item.id}
                        className={cn(
                          'cursor-pointer hover:bg-charcoal-50',
                          selectedItem?.id === item.id && 'bg-charcoal-50'
                        )}
                        onClick={() => handleSelectItem(item as ComplianceItem)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <span>
                              {item.complianceName ||
                                (item.requirement as { requirementName?: string })?.requirementName ||
                                item.complianceType ||
                                'Unnamed Item'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.complianceType?.replace(/_/g, ' ') || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <ComplianceStatusBadge status={item.status as any} />
                        </TableCell>
                        <TableCell>
                          {item.expiryDate ? (
                            <span
                              className={cn(
                                isExpired(item.expiryDate) && 'text-red-600 font-medium',
                                isExpiringSoon(item.expiryDate) && 'text-amber-600 font-medium'
                              )}
                            >
                              {format(new Date(item.expiryDate), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-charcoal-400">No expiry</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-charcoal-400" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Inline Panel */}
        <InlinePanel
          isOpen={!!(selectedItem || isAddingNew)}
          onClose={() => {
            setSelectedItem(null)
            setIsAddingNew(false)
          }}
          title={
            isAddingNew
              ? 'Add Compliance Item'
              : selectedItem?.complianceName ||
                selectedItem?.requirement?.requirementName ||
                'Compliance Item'
          }
          description={isAddingNew ? undefined : selectedItem?.complianceType?.replace(/_/g, ' ')}
          width="lg"
          actions={
            !isAddingNew && selectedItem ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItem(null)
                  setIsAddingNew(false)
                }}
              >
                Close
              </Button>
            ) : undefined
          }
        >
          {isAddingNew ? (
            <ComplianceItemForm
              entityType={entityType}
              entityId={entityId}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsAddingNew(false)}
            />
          ) : selectedItem ? (
            <div className="space-y-6">
              {/* Status */}
              <InlinePanelSection title="Status">
                <ComplianceStatusBadge status={selectedItem.status} size="lg" />
              </InlinePanelSection>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <InlinePanelSection title="Effective Date">
                  <p className="text-sm text-charcoal-900">
                    {selectedItem.effectiveDate
                      ? format(new Date(selectedItem.effectiveDate), 'MMM d, yyyy')
                      : '-'}
                  </p>
                </InlinePanelSection>
                <InlinePanelSection title="Expiry Date">
                  <p
                    className={cn(
                      'text-sm',
                      isExpired(selectedItem.expiryDate)
                        ? 'text-red-600 font-medium'
                        : isExpiringSoon(selectedItem.expiryDate)
                        ? 'text-amber-600 font-medium'
                        : 'text-charcoal-900'
                    )}
                  >
                    {selectedItem.expiryDate
                      ? format(new Date(selectedItem.expiryDate), 'MMM d, yyyy')
                      : 'No expiry'}
                  </p>
                </InlinePanelSection>
              </div>

              {/* Requirement Link */}
              {selectedItem.requirement && (
                <InlinePanelSection title="Linked Requirement">
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-sm font-medium text-charcoal-900">
                      {selectedItem.requirement.requirementName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {selectedItem.requirement.category}
                      </Badge>
                      {selectedItem.requirement.isBlocking && (
                        <Badge className="text-xs bg-red-100 text-red-700">
                          Blocking
                        </Badge>
                      )}
                    </div>
                  </div>
                </InlinePanelSection>
              )}

              {/* Verification Info */}
              {selectedItem.verifiedAt && (
                <InlinePanelSection title="Verification">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      Verified on {format(new Date(selectedItem.verifiedAt), 'MMM d, yyyy')}
                    </p>
                    {selectedItem.verifier && (
                      <p className="text-xs text-green-600 mt-1">
                        By {selectedItem.verifier.fullName || 'Unknown'}
                      </p>
                    )}
                  </div>
                </InlinePanelSection>
              )}

              {/* Notes */}
              {selectedItem.verificationNotes && (
                <InlinePanelSection title="Notes">
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
                    {selectedItem.verificationNotes}
                  </p>
                </InlinePanelSection>
              )}
            </div>
          ) : null}
        </InlinePanel>
      </div>
    </div>
  )
}
