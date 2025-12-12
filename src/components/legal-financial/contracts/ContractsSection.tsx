'use client'

import { useState, useMemo } from 'react'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import {
  Plus,
  MoreVertical,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Eye,
  History,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { ContractStatusBadge, ContractTypeBadge } from './ContractStatusBadge'
import { ContractForm } from './ContractForm'
import { ContractVersionHistory } from './ContractVersionHistory'
import { ContractSignatories } from './ContractSignatories'

interface ContractsSectionProps {
  entityType: string
  entityId: string
  showStats?: boolean
  onAddContract?: () => void
}

// Match router's transform output
interface Contract {
  id: string
  contractNumber: string | null
  contractName: string
  contractType: string
  status: string
  effectiveDate: string | null
  expiryDate: string | null
  contractValue: number | null
  currency: string
  version: number
  isLatestVersion: boolean
  previousVersionId: string | null
  autoRenew: boolean
  renewalNoticeDays: number
  createdAt: string
  updatedAt: string
  createdBy: string | null
  owner?: {
    id: string
    fullName: string
  } | null
}

/**
 * ContractsSection - Section component for entity workspace
 *
 * Displays contracts for any entity type with:
 * - Stats overview cards
 * - Sortable table with inline panel for details
 * - Version history and signatories views
 */
export function ContractsSection({
  entityType,
  entityId,
  showStats = true,
}: ContractsSectionProps) {
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>('status')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [panelView, setPanelView] = useState<'details' | 'history' | 'signatories'>('details')

  // Fetch contracts for this entity
  const contractsQuery = trpc.contracts.listByEntity.useQuery({
    entityType,
    entityId,
    latestVersionOnly: true,
  })

  // Fetch contract stats for this entity
  const statsQuery = trpc.contracts.stats.useQuery({
    entityType,
    entityId,
  })

  const utils = trpc.useUtils()

  // Delete mutation
  const deleteMutation = trpc.contracts.delete.useMutation({
    onSuccess: () => {
      utils.contracts.listByEntity.invalidate({ entityType, entityId })
      utils.contracts.stats.invalidate({ entityType, entityId })
      setSelectedContractId(null)
    },
  })

  const contracts = (contractsQuery.data ?? []) as Contract[]
  const stats = statsQuery.data
  const isLoading = contractsQuery.isLoading
  const selectedContract = contracts.find((c) => c.id === selectedContractId)

  // Sort contracts
  const sortedContracts = useMemo(() => {
    return [...contracts].sort((a, b) => {
      let aVal: string | number | null = null
      let bVal: string | number | null = null

      switch (sortField) {
        case 'status':
          const statusOrder: Record<string, number> = {
            expired: 1,
            pending_signature: 2,
            partially_signed: 3,
            pending_review: 4,
            draft: 5,
            active: 6,
            renewed: 7,
            terminated: 8,
            superseded: 9,
          }
          aVal = statusOrder[a.status] ?? 99
          bVal = statusOrder[b.status] ?? 99
          break
        case 'contractName':
          aVal = a.contractName
          bVal = b.contractName
          break
        case 'expiryDate':
          aVal = a.expiryDate || ''
          bVal = b.expiryDate || ''
          break
        case 'contractType':
          aVal = a.contractType
          bVal = b.contractType
          break
        case 'contractValue':
          aVal = a.contractValue || 0
          bVal = b.contractValue || 0
          break
        default:
          aVal = a.status
          bVal = b.status
      }

      if (aVal === null || aVal === '') return 1
      if (bVal === null || bVal === '') return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [contracts, sortField, sortOrder])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-charcoal-400" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5 text-gold-600" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5 text-gold-600" />
    )
  }

  const handleDelete = (contract: Contract) => {
    if (confirm('Are you sure you want to delete this contract?')) {
      deleteMutation.mutate({ id: contract.id })
    }
  }

  const handleFormSuccess = () => {
    setShowAddForm(false)
    setEditingContract(null)
    utils.contracts.listByEntity.invalidate({ entityType, entityId })
    utils.contracts.stats.invalidate({ entityType, entityId })
  }

  const getDaysUntilExpiration = (expiryDate: string | null) => {
    if (!expiryDate) return null
    return differenceInDays(new Date(expiryDate), new Date())
  }

  const formatCurrency = (value: number | null, currency: string) => {
    if (value === null) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        {showStats && (
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white animate-pulse">
                <CardContent className="py-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card className="bg-white animate-pulse">
          <CardContent className="py-4">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (contracts.length === 0 && !showAddForm) {
    return (
      <div className="p-6">
        <EmptyState
          config={{
            icon: FileText,
            title: 'No contracts',
            description: 'Add contracts to track agreements, MSAs, SOWs, and other legal documents.',
            action: {
              label: 'Add Contract',
              onClick: () => setShowAddForm(true),
            },
          }}
          variant="inline"
        />
        {showAddForm && (
          <div className="mt-6">
            <ContractForm
              entityType={entityType}
              entityId={entityId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6">
      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <FileText className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-charcoal-500">Total Contracts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn('bg-white', stats.active > 0 && 'border-green-200 bg-green-50/50')}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  stats.active > 0 ? 'bg-green-100' : 'bg-charcoal-100'
                )}>
                  <CheckCircle className={cn(
                    'w-5 h-5',
                    stats.active > 0 ? 'text-green-600' : 'text-charcoal-600'
                  )} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-semibold',
                    stats.active > 0 ? 'text-green-600' : 'text-charcoal-900'
                  )}>
                    {stats.active}
                  </p>
                  <p className="text-sm text-charcoal-500">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn('bg-white', stats.expiringSoon > 0 && 'border-amber-200 bg-amber-50/50')}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  stats.expiringSoon > 0 ? 'bg-amber-100' : 'bg-charcoal-100'
                )}>
                  <Clock className={cn(
                    'w-5 h-5',
                    stats.expiringSoon > 0 ? 'text-amber-600' : 'text-charcoal-600'
                  )} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-semibold',
                    stats.expiringSoon > 0 ? 'text-amber-600' : 'text-charcoal-900'
                  )}>
                    {stats.expiringSoon}
                  </p>
                  <p className="text-sm text-charcoal-500">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn('bg-white', stats.pendingSignature > 0 && 'border-blue-200 bg-blue-50/50')}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  stats.pendingSignature > 0 ? 'bg-blue-100' : 'bg-charcoal-100'
                )}>
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    stats.pendingSignature > 0 ? 'text-blue-600' : 'text-charcoal-600'
                  )} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-semibold',
                    stats.pendingSignature > 0 ? 'text-blue-600' : 'text-charcoal-900'
                  )}>
                    {stats.pendingSignature}
                  </p>
                  <p className="text-sm text-charcoal-500">Pending Signature</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Form */}
      {(showAddForm || editingContract) && (
        <Card className="bg-white">
          <CardContent className="py-4">
            <ContractForm
              entityType={entityType}
              entityId={entityId}
              contract={editingContract ? {
                id: editingContract.id,
                contractName: editingContract.contractName,
                contractNumber: editingContract.contractNumber,
                contractType: editingContract.contractType,
                status: editingContract.status,
                effectiveDate: editingContract.effectiveDate,
                expiryDate: editingContract.expiryDate,
                contractValue: editingContract.contractValue,
                currency: editingContract.currency,
                autoRenew: editingContract.autoRenew,
                renewalNoticeDays: editingContract.renewalNoticeDays,
              } : undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowAddForm(false)
                setEditingContract(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Table and Inline Panel */}
      <div className="flex gap-4">
        {/* Contracts Table */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedContractId ? 'max-w-[calc(100%-480px)]' : 'max-w-full'
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-charcoal-900">
              Contracts
            </h3>
            <Button
              onClick={() => {
                setEditingContract(null)
                setShowAddForm(true)
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contract
            </Button>
          </div>

          {/* Table */}
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50 border-b border-charcoal-200">
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors"
                      onClick={() => handleSort('contractName')}
                    >
                      <span className="flex items-center">
                        Contract
                        {getSortIcon('contractName')}
                      </span>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors w-[100px]"
                      onClick={() => handleSort('contractType')}
                    >
                      <span className="flex items-center">
                        Type
                        {getSortIcon('contractType')}
                      </span>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors w-[120px]"
                      onClick={() => handleSort('status')}
                    >
                      <span className="flex items-center">
                        Status
                        {getSortIcon('status')}
                      </span>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors w-[120px]"
                      onClick={() => handleSort('expiryDate')}
                    >
                      <span className="flex items-center">
                        Expires
                        {getSortIcon('expiryDate')}
                      </span>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors w-[100px] text-right"
                      onClick={() => handleSort('contractValue')}
                    >
                      <span className="flex items-center justify-end">
                        Value
                        {getSortIcon('contractValue')}
                      </span>
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedContracts.map((contract) => {
                    const daysUntilExpiration = getDaysUntilExpiration(contract.expiryDate)
                    return (
                      <TableRow
                        key={contract.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedContractId === contract.id
                            ? 'bg-gold-50/50'
                            : 'hover:bg-charcoal-50'
                        )}
                        onClick={() => {
                          setSelectedContractId(contract.id)
                          setPanelView('details')
                        }}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-charcoal-900">
                              {contract.contractName}
                            </span>
                            {contract.contractNumber && (
                              <span className="text-xs text-charcoal-500">
                                {contract.contractNumber}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ContractTypeBadge type={contract.contractType} size="sm" />
                        </TableCell>
                        <TableCell>
                          <ContractStatusBadge status={contract.status} size="sm" />
                        </TableCell>
                        <TableCell>
                          {contract.expiryDate ? (
                            <div className="flex flex-col">
                              <span className={cn(
                                'text-sm',
                                daysUntilExpiration !== null && daysUntilExpiration < 0
                                  ? 'text-red-600 font-medium'
                                  : daysUntilExpiration !== null && daysUntilExpiration <= 30
                                  ? 'text-amber-600 font-medium'
                                  : 'text-charcoal-700'
                              )}>
                                {format(new Date(contract.expiryDate), 'MMM d, yyyy')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-charcoal-400">No expiration</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium text-charcoal-900">
                            {formatCurrency(contract.contractValue, contract.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedContractId(contract.id)
                                setPanelView('details')
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedContractId(contract.id)
                                setPanelView('history')
                              }}>
                                <History className="w-4 h-4 mr-2" />
                                Version History
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedContractId(contract.id)
                                setPanelView('signatories')
                              }}>
                                <Users className="w-4 h-4 mr-2" />
                                Signatories
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setEditingContract(contract)
                                setShowAddForm(true)
                              }}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(contract)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Inline Panel */}
        <InlinePanel
          isOpen={!!selectedContract}
          onClose={() => setSelectedContractId(null)}
          title={selectedContract?.contractName || 'Contract'}
          description={selectedContract?.contractNumber || 'Contract details'}
          width="lg"
          headerActions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (selectedContract) {
                  setEditingContract(selectedContract)
                  setShowAddForm(true)
                  setSelectedContractId(null)
                }
              }}
            >
              <Pencil className="w-4 h-4" />
            </Button>
          }
          actions={
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedContractId(null)}
              >
                Close
              </Button>
            </div>
          }
        >
          {selectedContract && (
            <>
              {/* Panel View Tabs */}
              <div className="flex gap-2 mb-4 border-b border-charcoal-200 pb-2">
                <Button
                  variant={panelView === 'details' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPanelView('details')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button
                  variant={panelView === 'history' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPanelView('history')}
                >
                  <History className="w-4 h-4 mr-1" />
                  History
                </Button>
                <Button
                  variant={panelView === 'signatories' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPanelView('signatories')}
                >
                  <Users className="w-4 h-4 mr-1" />
                  Signatories
                </Button>
              </div>

              {panelView === 'details' && (
                <>
                  <InlinePanelSection title="Status">
                    <div className="flex items-center gap-2">
                      <ContractStatusBadge status={selectedContract.status} size="default" />
                      <ContractTypeBadge type={selectedContract.contractType} />
                      {selectedContract.version > 1 && (
                        <Badge variant="outline" className="text-xs">
                          v{selectedContract.version}
                        </Badge>
                      )}
                    </div>
                  </InlinePanelSection>

                  <InlinePanelSection title="Details">
                    <div className="space-y-3 text-sm">
                      {selectedContract.contractNumber && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Contract #</span>
                          <span className="font-medium font-mono">
                            {selectedContract.contractNumber}
                          </span>
                        </div>
                      )}
                      {selectedContract.effectiveDate && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Effective Date</span>
                          <span className="font-medium">
                            {format(new Date(selectedContract.effectiveDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      {selectedContract.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Expiration Date</span>
                          <span className="font-medium">
                            {format(new Date(selectedContract.expiryDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      {selectedContract.contractValue !== null && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Total Value</span>
                          <span className="font-medium">
                            {formatCurrency(selectedContract.contractValue, selectedContract.currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </InlinePanelSection>

                  <InlinePanelSection title="Terms">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Auto-Renew</span>
                        <span className="font-medium">
                          {selectedContract.autoRenew ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {selectedContract.renewalNoticeDays > 0 && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Renewal Notice</span>
                          <span className="font-medium">
                            {selectedContract.renewalNoticeDays} days
                          </span>
                        </div>
                      )}
                    </div>
                  </InlinePanelSection>

                  <InlinePanelSection title="Timeline">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Created</span>
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(selectedContract.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Updated</span>
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(selectedContract.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      {selectedContract.owner && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Owner</span>
                          <span className="font-medium">
                            {(selectedContract.owner as any).full_name || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  </InlinePanelSection>
                </>
              )}

              {panelView === 'history' && (
                <ContractVersionHistory contractId={selectedContract.id} />
              )}

              {panelView === 'signatories' && (
                <ContractSignatories contractId={selectedContract.id} />
              )}
            </>
          )}
        </InlinePanel>
      </div>
    </div>
  )
}
