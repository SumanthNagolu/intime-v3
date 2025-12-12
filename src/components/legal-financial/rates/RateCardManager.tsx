'use client'

import { useState, useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Plus,
  MoreVertical,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Settings,
  DollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { RateCardItemEditor } from './RateCardItemEditor'
import { useToast } from '@/components/ui/use-toast'

interface RateCardManagerProps {
  entityType: string
  entityId: string
  showStats?: boolean
}

interface RateCard {
  id: string
  rateCardName: string
  rateCardCode: string | null
  rateCardType: string
  currency: string
  version: number
  isActive: boolean
  isLatestVersion: boolean
  effectiveStartDate: string
  effectiveEndDate: string | null
  minMarginPercentage: number | null
  targetMarginPercentage: number | null
  overtimeMultiplier: number | null
  doubleTimeMultiplier: number | null
  mspProgramName: string | null
  vmsPlatform: string | null
  vmsFeePercentage: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  approver?: {
    id: string
    fullName: string
  } | null
}

const RATE_CARD_TYPE_CONFIG = {
  standard: {
    label: 'Standard',
    color: 'bg-charcoal-100 text-charcoal-700',
  },
  msp: {
    label: 'MSP',
    color: 'bg-blue-100 text-blue-700',
  },
  vms: {
    label: 'VMS',
    color: 'bg-purple-100 text-purple-700',
  },
  preferred: {
    label: 'Preferred',
    color: 'bg-gold-100 text-gold-700',
  },
  custom: {
    label: 'Custom',
    color: 'bg-amber-100 text-amber-700',
  },
}

/**
 * RateCardManager - Master component for managing rate cards
 *
 * Features:
 * - List all rate cards with filtering
 * - Create/edit rate cards
 * - Manage rate card line items
 * - Version tracking
 */
export function RateCardManager({
  entityType,
  entityId,
  showStats = true,
}: RateCardManagerProps) {
  const { toast } = useToast()
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>('effectiveStartDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [showItemEditor, setShowItemEditor] = useState(false)

  // Fetch rate cards
  const rateCardsQuery = trpc.rates.rateCards.listByEntity.useQuery({
    entityType,
    entityId,
    latestVersionOnly: true,
  })

  // Fetch stats
  const statsQuery = trpc.rates.rateCards.stats.useQuery({
    entityType,
    entityId,
  })

  const utils = trpc.useUtils()

  // Mutations
  const deleteMutation = trpc.rates.rateCards.delete.useMutation({
    onSuccess: () => {
      toast({
        title: 'Rate card deleted',
        description: 'The rate card has been removed.',
      })
      utils.rates.rateCards.listByEntity.invalidate({ entityType, entityId })
      utils.rates.rateCards.stats.invalidate({ entityType, entityId })
      setSelectedCardId(null)
    },
  })

  const activateMutation = trpc.rates.rateCards.activate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Rate card activated',
        description: 'This rate card is now active.',
      })
      utils.rates.rateCards.listByEntity.invalidate({ entityType, entityId })
      utils.rates.rateCards.stats.invalidate({ entityType, entityId })
    },
  })

  const deactivateMutation = trpc.rates.rateCards.deactivate.useMutation({
    onSuccess: () => {
      toast({
        title: 'Rate card deactivated',
        description: 'This rate card has been deactivated.',
      })
      utils.rates.rateCards.listByEntity.invalidate({ entityType, entityId })
      utils.rates.rateCards.stats.invalidate({ entityType, entityId })
    },
  })

  const rateCards = rateCardsQuery.data ?? []
  const stats = statsQuery.data
  const isLoading = rateCardsQuery.isLoading
  const selectedCard = rateCards.find((c) => c.id === selectedCardId)

  // Sort rate cards
  const sortedRateCards = useMemo(() => {
    return [...rateCards].sort((a, b) => {
      let aVal: string | number | boolean | null = null
      let bVal: string | number | boolean | null = null

      switch (sortField) {
        case 'rateCardName':
          aVal = a.rateCardName
          bVal = b.rateCardName
          break
        case 'rateCardType':
          aVal = a.rateCardType
          bVal = b.rateCardType
          break
        case 'effectiveStartDate':
          aVal = a.effectiveStartDate
          bVal = b.effectiveStartDate
          break
        case 'isActive':
          aVal = a.isActive ? 1 : 0
          bVal = b.isActive ? 1 : 0
          break
        default:
          aVal = a.effectiveStartDate
          bVal = b.effectiveStartDate
      }

      if (aVal === null) return 1
      if (bVal === null) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      const comparison = String(aVal).localeCompare(String(bVal))
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [rateCards, sortField, sortOrder])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
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

  const handleDelete = (card: RateCard) => {
    if (card.isActive) {
      toast({
        title: 'Cannot delete',
        description: 'Deactivate the rate card before deleting.',
        variant: 'error',
      })
      return
    }
    if (confirm('Are you sure you want to delete this rate card?')) {
      deleteMutation.mutate({ id: card.id })
    }
  }

  const formatPercentage = (value: number | null) => {
    if (value === null) return '-'
    return `${value}%`
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

  if (rateCards.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          config={{
            icon: CreditCard,
            title: 'No rate cards',
            description: 'Create rate cards to define billing rates, margins, and pricing structures.',
            action: {
              label: 'Create Rate Card',
              onClick: () => {
                toast({
                  title: 'Create Rate Card',
                  description: 'Use the administration panel to create rate cards.',
                })
              },
            },
          }}
          variant="inline"
        />
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
                  <CreditCard className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.total}
                  </p>
                  <p className="text-sm text-charcoal-500">Total Cards</p>
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

          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.latestVersions}
                  </p>
                  <p className="text-sm text-charcoal-500">Latest Versions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn('bg-white', stats.expired > 0 && 'border-amber-200 bg-amber-50/50')}>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  stats.expired > 0 ? 'bg-amber-100' : 'bg-charcoal-100'
                )}>
                  <AlertTriangle className={cn(
                    'w-5 h-5',
                    stats.expired > 0 ? 'text-amber-600' : 'text-charcoal-600'
                  )} />
                </div>
                <div>
                  <p className={cn(
                    'text-2xl font-semibold',
                    stats.expired > 0 ? 'text-amber-600' : 'text-charcoal-900'
                  )}>
                    {stats.expired}
                  </p>
                  <p className="text-sm text-charcoal-500">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table and Inline Panel */}
      <div className="flex gap-4">
        {/* Rate Cards Table */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedCardId ? 'max-w-[calc(100%-480px)]' : 'max-w-full'
          )}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-charcoal-900">
              Rate Cards
            </h3>
          </div>

          {/* Table */}
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50 border-b border-charcoal-200">
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors"
                      onClick={() => handleSort('rateCardName')}
                    >
                      <span className="flex items-center">
                        Rate Card
                        {getSortIcon('rateCardName')}
                      </span>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors w-[100px]"
                      onClick={() => handleSort('rateCardType')}
                    >
                      <span className="flex items-center">
                        Type
                        {getSortIcon('rateCardType')}
                      </span>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider cursor-pointer select-none hover:bg-charcoal-100 transition-colors w-[100px]"
                      onClick={() => handleSort('isActive')}
                    >
                      <span className="flex items-center">
                        Status
                        {getSortIcon('isActive')}
                      </span>
                    </TableHead>
                    <TableHead className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider w-[100px] text-right">
                      Min Margin
                    </TableHead>
                    <TableHead className="font-semibold text-charcoal-700 text-xs uppercase tracking-wider w-[100px] text-right">
                      Target
                    </TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRateCards.map((card) => {
                    const typeConfig = RATE_CARD_TYPE_CONFIG[card.rateCardType as keyof typeof RATE_CARD_TYPE_CONFIG] || RATE_CARD_TYPE_CONFIG.standard
                    return (
                      <TableRow
                        key={card.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          selectedCardId === card.id
                            ? 'bg-gold-50/50'
                            : 'hover:bg-charcoal-50'
                        )}
                        onClick={() => {
                          setSelectedCardId(card.id)
                          setShowItemEditor(false)
                        }}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-charcoal-900">
                              {card.rateCardName}
                            </span>
                            {card.rateCardCode && (
                              <span className="text-xs text-charcoal-500 font-mono">
                                {card.rateCardCode}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn('text-xs', typeConfig.color)}>
                            {typeConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'text-xs',
                              card.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-charcoal-100 text-charcoal-600'
                            )}
                          >
                            {card.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPercentage(card.minMarginPercentage)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPercentage(card.targetMarginPercentage)}
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
                                setSelectedCardId(card.id)
                                setShowItemEditor(false)
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedCardId(card.id)
                                setShowItemEditor(true)
                              }}>
                                <Settings className="w-4 h-4 mr-2" />
                                Manage Items
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {card.isActive ? (
                                <DropdownMenuItem onClick={() => deactivateMutation.mutate({ id: card.id })}>
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => activateMutation.mutate({ id: card.id })}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDelete(card as RateCard)}
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
          isOpen={!!selectedCard}
          onClose={() => {
            setSelectedCardId(null)
            setShowItemEditor(false)
          }}
          title={selectedCard?.rateCardName || 'Rate Card'}
          description={selectedCard?.rateCardCode || 'Rate card details'}
          width="lg"
          actions={
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedCardId(null)
                  setShowItemEditor(false)
                }}
              >
                Close
              </Button>
              {selectedCard && !showItemEditor && (
                <Button
                  className="flex-1"
                  onClick={() => setShowItemEditor(true)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage Items
                </Button>
              )}
            </div>
          }
        >
          {selectedCard && (
            <>
              {/* Panel View Toggle */}
              <div className="flex gap-2 mb-4 border-b border-charcoal-200 pb-2">
                <Button
                  variant={!showItemEditor ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowItemEditor(false)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button
                  variant={showItemEditor ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setShowItemEditor(true)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Line Items
                </Button>
              </div>

              {!showItemEditor ? (
                <>
                  <InlinePanelSection title="Status">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={cn(
                          'text-xs',
                          selectedCard.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-charcoal-100 text-charcoal-600'
                        )}
                      >
                        {selectedCard.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge
                        className={cn(
                          'text-xs',
                          RATE_CARD_TYPE_CONFIG[selectedCard.rateCardType as keyof typeof RATE_CARD_TYPE_CONFIG]?.color || RATE_CARD_TYPE_CONFIG.standard.color
                        )}
                      >
                        {RATE_CARD_TYPE_CONFIG[selectedCard.rateCardType as keyof typeof RATE_CARD_TYPE_CONFIG]?.label || selectedCard.rateCardType}
                      </Badge>
                      {selectedCard.version > 1 && (
                        <Badge variant="outline" className="text-xs">
                          v{selectedCard.version}
                        </Badge>
                      )}
                    </div>
                  </InlinePanelSection>

                  <InlinePanelSection title="Margin Settings">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Target Margin</span>
                        <span className="font-medium">
                          {formatPercentage(selectedCard.targetMarginPercentage)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Minimum Margin</span>
                        <span className="font-medium">
                          {formatPercentage(selectedCard.minMarginPercentage)}
                        </span>
                      </div>
                    </div>
                  </InlinePanelSection>

                  <InlinePanelSection title="Rate Multipliers">
                    <div className="space-y-3 text-sm">
                      {selectedCard.overtimeMultiplier && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Overtime (OT)</span>
                          <span className="font-medium">{selectedCard.overtimeMultiplier}x</span>
                        </div>
                      )}
                      {selectedCard.doubleTimeMultiplier && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Double Time (DT)</span>
                          <span className="font-medium">{selectedCard.doubleTimeMultiplier}x</span>
                        </div>
                      )}
                    </div>
                  </InlinePanelSection>

                  <InlinePanelSection title="Effective Period">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Start Date</span>
                        <span className="font-medium">
                          {format(new Date(selectedCard.effectiveStartDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {selectedCard.effectiveEndDate && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">End Date</span>
                          <span className="font-medium">
                            {format(new Date(selectedCard.effectiveEndDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </InlinePanelSection>

                  {(selectedCard.mspProgramName || selectedCard.vmsPlatform) && (
                    <InlinePanelSection title="Program Details">
                      <div className="space-y-3 text-sm">
                        {selectedCard.mspProgramName && (
                          <div className="flex justify-between">
                            <span className="text-charcoal-500">MSP Program</span>
                            <span className="font-medium">{selectedCard.mspProgramName}</span>
                          </div>
                        )}
                        {selectedCard.vmsPlatform && (
                          <div className="flex justify-between">
                            <span className="text-charcoal-500">VMS Platform</span>
                            <span className="font-medium">{selectedCard.vmsPlatform}</span>
                          </div>
                        )}
                        {selectedCard.vmsFeePercentage && (
                          <div className="flex justify-between">
                            <span className="text-charcoal-500">VMS Fee</span>
                            <span className="font-medium">{selectedCard.vmsFeePercentage}%</span>
                          </div>
                        )}
                      </div>
                    </InlinePanelSection>
                  )}

                  {selectedCard.notes && (
                    <InlinePanelSection title="Notes">
                      <p className="text-sm text-charcoal-700">{selectedCard.notes}</p>
                    </InlinePanelSection>
                  )}

                  <InlinePanelSection title="Timeline">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Created</span>
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(selectedCard.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-charcoal-500">Updated</span>
                        <span className="font-medium">
                          {formatDistanceToNow(new Date(selectedCard.updatedAt), { addSuffix: true })}
                        </span>
                      </div>
                      {selectedCard.approver != null && (
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Approved by</span>
                          <span className="font-medium">
                            {(selectedCard.approver as { fullName: string }).fullName || 'Unknown'}
                          </span>
                        </div>
                      )}
                    </div>
                  </InlinePanelSection>
                </>
              ) : (
                <RateCardItemEditor rateCardId={selectedCard.id} />
              )}
            </>
          )}
        </InlinePanel>
      </div>
    </div>
  )
}
