'use client'

import * as React from 'react'
import { lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import {
  PlusCircle,
  RefreshCw,
  LayoutGrid,
  List,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
  ChevronRight,
  MoreVertical,
  Trophy,
  XCircle,
  Building2,
  Eye,
  GripVertical,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'

// Dynamic imports for heavy dialogs - only loaded when needed
const CreateDealDialog = lazy(() => import('./CreateDealDialog').then(m => ({ default: m.CreateDealDialog })))
const CloseWonDialog = lazy(() => import('./CloseWonDialog').then(m => ({ default: m.CloseWonDialog })))
const CloseLostDialog = lazy(() => import('./CloseLostDialog').then(m => ({ default: m.CloseLostDialog })))

// Stage configuration
const stageConfig = [
  { key: 'discovery', label: 'Discovery', color: 'bg-slate-100 border-slate-300', textColor: 'text-slate-700' },
  { key: 'qualification', label: 'Qualification', color: 'bg-blue-50 border-blue-300', textColor: 'text-blue-700' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-50 border-amber-300', textColor: 'text-amber-700' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-orange-50 border-orange-300', textColor: 'text-orange-700' },
  { key: 'verbal_commit', label: 'Verbal Commit', color: 'bg-green-50 border-green-300', textColor: 'text-green-700' },
]

const healthColors: Record<string, { bg: string; text: string; label: string }> = {
  on_track: { bg: 'bg-green-100', text: 'text-green-700', label: 'On Track' },
  slow: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Slow' },
  stale: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Stale' },
  urgent: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
  at_risk: { bg: 'bg-red-200', text: 'text-red-800', label: 'At Risk' },
}

interface Deal {
  id: string
  name: string
  title?: string
  value?: number
  probability?: number
  stage: string
  expected_close_date?: string
  health_status?: string
  last_activity_at?: string
  next_action?: string
  next_action_date?: string
  owner?: { id: string; full_name: string; avatar_url?: string } | null
  account?: { id: string; name: string } | null
  lead?: { id: string; company_name?: string } | null
  roles_breakdown?: Array<{ title: string; quantity: number; minRate?: number; maxRate?: number }> | null
  competitors?: string[] | null
  contract_length_months?: number | null
}

interface PipelineStage {
  key: string
  label: string
  color: string
  count: number
  totalValue: number
  weightedValue: number
  deals: Deal[]
}

interface PipelineSummary {
  totalDeals: number
  totalValue: number
  weightedValue: number
  atRisk: number
  urgent: number
}

interface DealsPipelineClientProps {
  initialPipeline: PipelineStage[]
  initialSummary: PipelineSummary
}

export function DealsPipelineClient({
  initialPipeline,
  initialSummary,
}: DealsPipelineClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [showAllDeals, setShowAllDeals] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban')
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [closeWonDeal, setCloseWonDeal] = React.useState<Deal | null>(null)
  const [closeLostDeal, setCloseLostDeal] = React.useState<Deal | null>(null)
  const [draggedDeal, setDraggedDeal] = React.useState<string | null>(null)

  // Use server data as initial, allow client refetch for mutations
  const { data: pipelineData, refetch } = trpc.crm.deals.pipeline.useQuery(
    { showAll: showAllDeals },
    {
      initialData: { pipeline: initialPipeline, summary: initialSummary },
    }
  )

  // Update stage mutation
  const updateStage = trpc.crm.deals.updateStage.useMutation({
    onSuccess: () => {
      utils.crm.deals.pipeline.invalidate()
      toast({ title: 'Deal moved', description: 'Deal stage updated successfully' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Handle drag start
  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId)
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Handle drop
  const handleDrop = (stageKey: string) => {
    if (draggedDeal) {
      updateStage.mutate({ id: draggedDeal, stage: stageKey as 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'verbal_commit' })
      setDraggedDeal(null)
    }
  }

  // Calculate days until close
  const getDaysUntilClose = (date?: string) => {
    if (!date) return null
    const days = differenceInDays(new Date(date), new Date())
    return days
  }

  // Get health badge
  const getHealthBadge = (status?: string) => {
    if (!status) return null
    const config = healthColors[status] || healthColors.on_track
    return (
      <Badge variant="outline" className={cn('text-xs', config.bg, config.text)}>
        {config.label}
      </Badge>
    )
  }

  // Deal Card Component
  const DealCard = ({ deal }: { deal: Deal }) => {
    const daysUntilClose = getDaysUntilClose(deal.expected_close_date)
    const companyName = deal.account?.name || deal.lead?.company_name || 'No Company'

    return (
      <Card
        data-testid="deal-card"
        data-deal-id={deal.id}
        data-health={deal.health_status}
        className={cn(
          'cursor-pointer hover:shadow-md transition-all duration-200 border-l-4',
          deal.health_status === 'at_risk' && 'border-l-red-500',
          deal.health_status === 'urgent' && 'border-l-orange-500',
          deal.health_status === 'stale' && 'border-l-amber-500',
          (!deal.health_status || deal.health_status === 'on_track') && 'border-l-transparent'
        )}
        draggable
        onDragStart={() => handleDragStart(deal.id)}
        onClick={() => router.push(`/employee/crm/deals/${deal.id}`)}
        onMouseEnter={() => router.prefetch(`/employee/crm/deals/${deal.id}`)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0 cursor-grab" />
              <div className="min-w-0">
                <h4 className="font-medium text-sm truncate">{deal.name}</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{companyName}</span>
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/employee/crm/deals/${deal.id}`)
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  setCloseWonDeal(deal)
                }}>
                  <Trophy className="h-4 w-4 mr-2 text-green-600" />
                  Close Won
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  setCloseLostDeal(deal)
                }}>
                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                  Close Lost
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Value & Probability */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-hublot-900">
              ${(deal.value || 0).toLocaleString()}
            </span>
            <span className="text-muted-foreground text-xs">
              {deal.probability || 0}% prob
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-2">
              {deal.owner && (
                <div title={deal.owner.full_name}>
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={deal.owner.avatar_url || ''} />
                    <AvatarFallback className="text-[10px]">
                      {deal.owner.full_name?.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              {getHealthBadge(deal.health_status)}
            </div>
            {daysUntilClose !== null && (
              <span className={cn(
                'text-xs flex items-center gap-1',
                daysUntilClose < 0 ? 'text-red-600' : daysUntilClose < 7 ? 'text-amber-600' : 'text-muted-foreground'
              )}>
                <Clock className="h-3 w-3" />
                {daysUntilClose < 0 ? `${Math.abs(daysUntilClose)}d overdue` : `${daysUntilClose}d`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full" data-testid="page-content">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold uppercase tracking-wider">
              Deals Pipeline
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your sales opportunities through the pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="show-all"
                checked={showAllDeals}
                onCheckedChange={setShowAllDeals}
              />
              <label htmlFor="show-all" className="text-sm text-muted-foreground">
                Show All
              </label>
            </div>
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        {pipelineData?.summary && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Deals</p>
                    <p className="text-2xl font-bold">{pipelineData.summary.totalDeals}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Value</p>
                    <p className="text-2xl font-bold">
                      ${((pipelineData.summary.totalValue || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Weighted Value</p>
                    <p className="text-2xl font-bold">
                      ${((pipelineData.summary.weightedValue || 0) / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">At Risk</p>
                    <p className="text-2xl font-bold">
                      {pipelineData.summary.atRisk + pipelineData.summary.urgent}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Pipeline Content */}
      <div className="flex-1 overflow-hidden p-6 bg-cream">
        {viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="flex gap-4 h-full overflow-x-auto pb-4">
            {pipelineData?.pipeline.map((stage) => {
              const stageInfo = stageConfig.find(s => s.key === stage.key)
              return (
                <div
                  key={stage.key}
                  className="flex-shrink-0 w-72 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(stage.key)}
                >
                  {/* Stage Header */}
                  <div className={cn('rounded-t-lg p-3 border-2', stageInfo?.color || stage.color)}>
                    <div className="flex items-center justify-between">
                      <h3 className={cn('font-medium text-sm uppercase tracking-wide', stageInfo?.textColor)}>
                        {stage.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {stage.count}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                      <span>${(stage.totalValue / 1000).toFixed(0)}K total</span>
                      <span>${(stage.weightedValue / 1000).toFixed(0)}K weighted</span>
                    </div>
                  </div>

                  {/* Deals List */}
                  <div className="flex-1 overflow-y-auto bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[400px]">
                    {stage.deals.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        No deals in this stage
                      </div>
                    ) : (
                      stage.deals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Deal</th>
                  <th className="text-left p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Company</th>
                  <th className="text-left p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Stage</th>
                  <th className="text-right p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Value</th>
                  <th className="text-center p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Prob.</th>
                  <th className="text-left p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Close Date</th>
                  <th className="text-left p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Owner</th>
                  <th className="text-left p-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Health</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {pipelineData?.pipeline.flatMap(stage => stage.deals).map((deal) => {
                  const stageInfo = stageConfig.find(s => s.key === deal.stage)
                  return (
                    <tr
                      key={deal.id}
                      className="border-b hover:bg-muted/30 cursor-pointer"
                      onClick={() => router.push(`/employee/crm/deals/${deal.id}`)}
                      onMouseEnter={() => router.prefetch(`/employee/crm/deals/${deal.id}`)}
                    >
                      <td className="p-3">
                        <span className="font-medium">{deal.name}</span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {deal.account?.name || deal.lead?.company_name || '-'}
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className={cn('text-xs', stageInfo?.color, stageInfo?.textColor)}>
                          {stageInfo?.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${(deal.value || 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-center text-sm">
                        {deal.probability || 0}%
                      </td>
                      <td className="p-3 text-sm">
                        {deal.expected_close_date ? format(new Date(deal.expected_close_date), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="p-3">
                        {deal.owner && (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={deal.owner.avatar_url || ''} />
                              <AvatarFallback className="text-xs">
                                {deal.owner.full_name?.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{deal.owner.full_name}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {getHealthBadge(deal.health_status)}
                      </td>
                      <td className="p-3">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dialogs - lazy loaded */}
      {createDialogOpen && (
        <Suspense fallback={null}>
          <CreateDealDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={(deal) => {
              router.push(`/employee/crm/deals/${deal.id}`)
            }}
          />
        </Suspense>
      )}

      {closeWonDeal && (
        <Suspense fallback={null}>
          <CloseWonDialog
            open={true}
            onOpenChange={() => setCloseWonDeal(null)}
            deal={closeWonDeal}
            onSuccess={() => setCloseWonDeal(null)}
          />
        </Suspense>
      )}

      {closeLostDeal && (
        <Suspense fallback={null}>
          <CloseLostDialog
            open={true}
            onOpenChange={() => setCloseLostDeal(null)}
            deal={closeLostDeal}
            onSuccess={() => setCloseLostDeal(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
