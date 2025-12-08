'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Beaker,
  Trophy,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  BarChart3,
  Users,
  Mail,
  Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types for A/B testing
interface ABVariant {
  id: string
  name: string
  description?: string
  trafficSplit: number
  metrics: {
    sent: number
    opened: number
    clicked: number
    responded: number
    leads: number
    openRate: number
    clickRate: number
    responseRate: number
    conversionRate: number
  }
  isWinner?: boolean
  isControl?: boolean
}

interface ABTestConfig {
  enabled: boolean
  variants: ABVariant[]
  winnerSelected?: string
  testType: 'subject_line' | 'content' | 'send_time' | 'channel' | 'custom'
  confidenceThreshold: number
  minSampleSize: number
  status: 'running' | 'completed' | 'winner_selected'
}

interface ABTestingSectionProps {
  campaignId: string
  testConfig?: ABTestConfig | null
  onUpdateConfig?: (config: ABTestConfig) => void
}

// Mock data for demonstration
const mockTestConfig: ABTestConfig = {
  enabled: true,
  variants: [
    {
      id: 'control',
      name: 'Control (A)',
      description: 'Original subject: "Exciting opportunity at {company}"',
      trafficSplit: 50,
      isControl: true,
      metrics: {
        sent: 500,
        opened: 145,
        clicked: 42,
        responded: 18,
        leads: 8,
        openRate: 29.0,
        clickRate: 8.4,
        responseRate: 3.6,
        conversionRate: 1.6,
      },
    },
    {
      id: 'variant_b',
      name: 'Variant B',
      description: 'New subject: "{first_name}, quick question about {company}"',
      trafficSplit: 50,
      isWinner: true,
      metrics: {
        sent: 500,
        opened: 185,
        clicked: 58,
        responded: 26,
        leads: 12,
        openRate: 37.0,
        clickRate: 11.6,
        responseRate: 5.2,
        conversionRate: 2.4,
      },
    },
  ],
  testType: 'subject_line',
  confidenceThreshold: 95,
  minSampleSize: 1000,
  status: 'running',
}

export function ABTestingSection({ 
  campaignId, 
  testConfig = mockTestConfig,
  onUpdateConfig 
}: ABTestingSectionProps) {
  const [selectWinnerDialogOpen, setSelectWinnerDialogOpen] = useState(false)
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)

  const config = testConfig || mockTestConfig

  // Calculate statistical significance
  const calculateConfidence = (variantA: ABVariant, variantB: ABVariant): number => {
    // Simplified confidence calculation (would use proper statistical test in production)
    const diffRate = Math.abs(variantA.metrics.openRate - variantB.metrics.openRate)
    const totalSent = variantA.metrics.sent + variantB.metrics.sent
    const confidence = Math.min(95, 50 + (diffRate * 2) + (totalSent / 100))
    return Math.round(confidence)
  }

  const confidence = config.variants.length >= 2 
    ? calculateConfidence(config.variants[0], config.variants[1])
    : 0

  const totalSent = config.variants.reduce((sum, v) => sum + v.metrics.sent, 0)
  const hasReachedMinSample = totalSent >= config.minSampleSize

  // Find best performing variant
  const bestVariant = [...config.variants].sort(
    (a, b) => b.metrics.conversionRate - a.metrics.conversionRate
  )[0]

  const handleSelectWinner = () => {
    if (selectedWinner && onUpdateConfig) {
      onUpdateConfig({
        ...config,
        winnerSelected: selectedWinner,
        status: 'winner_selected',
      })
    }
    setSelectWinnerDialogOpen(false)
    setSelectedWinner(null)
  }

  const getPerformanceIndicator = (variant: ABVariant, metric: keyof ABVariant['metrics']) => {
    if (!config.variants[0]) return null
    const control = config.variants.find(v => v.isControl) || config.variants[0]
    const controlValue = control.metrics[metric]
    const variantValue = variant.metrics[metric]
    
    if (variant.isControl) return null
    
    const diff = ((variantValue - controlValue) / controlValue) * 100
    
    if (Math.abs(diff) < 5) {
      return <Minus className="w-3.5 h-3.5 text-charcoal-400" />
    }
    if (diff > 0) {
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
    }
    return <TrendingDown className="w-3.5 h-3.5 text-red-500" />
  }

  const formatDiff = (variant: ABVariant, metric: keyof ABVariant['metrics']) => {
    if (variant.isControl) return null
    const control = config.variants.find(v => v.isControl) || config.variants[0]
    const controlValue = control.metrics[metric]
    const variantValue = variant.metrics[metric]
    const diff = ((variantValue - controlValue) / controlValue) * 100
    
    if (Math.abs(diff) < 1) return null
    
    return (
      <span className={cn(
        'text-xs font-medium',
        diff > 0 ? 'text-emerald-600' : 'text-red-600'
      )}>
        {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
      </span>
    )
  }

  if (!config.enabled) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="p-4 bg-charcoal-50 rounded-full w-fit mx-auto mb-4">
            <Beaker className="w-8 h-8 text-charcoal-400" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
            A/B Testing Not Enabled
          </h3>
          <p className="text-sm text-charcoal-500 mb-6 max-w-md mx-auto">
            Enable A/B testing when creating or editing this campaign to compare 
            different subject lines, content, or send times.
          </p>
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Set Up A/B Test
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Test Overview Header */}
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Beaker className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">A/B Test Results</CardTitle>
                  <CardDescription className="capitalize">
                    Testing: {config.testType.replace('_', ' ')} • 
                    {config.variants.length} variants
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary"
                  className={cn(
                    config.status === 'running' && 'bg-blue-50 text-blue-700',
                    config.status === 'completed' && 'bg-emerald-50 text-emerald-700',
                    config.status === 'winner_selected' && 'bg-violet-50 text-violet-700'
                  )}
                >
                  {config.status === 'running' && 'In Progress'}
                  {config.status === 'completed' && 'Completed'}
                  {config.status === 'winner_selected' && 'Winner Selected'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Test Progress */}
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-1">
                  <Users className="w-4 h-4" />
                  Sample Size
                </div>
                <p className="text-xl font-bold tabular-nums">
                  {totalSent.toLocaleString()}
                  <span className="text-charcoal-400 text-sm font-normal ml-1">
                    / {config.minSampleSize.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-1">
                  <Target className="w-4 h-4" />
                  Statistical Confidence
                </div>
                <p className={cn(
                  'text-xl font-bold tabular-nums',
                  confidence >= config.confidenceThreshold ? 'text-emerald-600' : 'text-charcoal-900'
                )}>
                  {confidence}%
                  {confidence >= config.confidenceThreshold && (
                    <CheckCircle className="w-4 h-4 inline ml-1 text-emerald-500" />
                  )}
                </p>
              </div>
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-1">
                  <BarChart3 className="w-4 h-4" />
                  Leading Variant
                </div>
                <p className="text-xl font-bold text-violet-600">
                  {bestVariant?.name || '-'}
                </p>
              </div>
            </div>

            {/* Confidence Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-charcoal-500">Confidence Level</span>
                <span className={cn(
                  'font-medium',
                  confidence >= config.confidenceThreshold ? 'text-emerald-600' : 'text-charcoal-600'
                )}>
                  {confidence}% / {config.confidenceThreshold}% required
                </span>
              </div>
              <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full transition-all duration-500 rounded-full',
                    confidence >= config.confidenceThreshold 
                      ? 'bg-emerald-500' 
                      : 'bg-violet-500'
                  )}
                  style={{ width: `${Math.min((confidence / 100) * 100, 100)}%` }}
                />
              </div>
              {!hasReachedMinSample && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Need {(config.minSampleSize - totalSent).toLocaleString()} more sends for reliable results
                </p>
              )}
            </div>

            {/* Winner Selection */}
            {hasReachedMinSample && confidence >= config.confidenceThreshold && config.status === 'running' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-900">
                      Test has reached statistical significance!
                    </p>
                    <p className="text-sm text-emerald-700">
                      {bestVariant?.name} is outperforming with {bestVariant?.metrics.openRate}% open rate
                    </p>
                  </div>
                </div>
                <Button 
                  variant="default" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setSelectWinnerDialogOpen(true)}
                >
                  Select Winner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variant Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variant Performance Comparison</CardTitle>
            <CardDescription>
              Compare metrics across all test variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-charcoal-100">
                    <th className="text-left py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Variant
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Traffic
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Sent
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Open Rate
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Click Rate
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Response Rate
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-charcoal-600 text-sm">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {config.variants.map((variant, index) => (
                    <tr 
                      key={variant.id}
                      className={cn(
                        'border-b border-charcoal-50 hover:bg-charcoal-50/50 transition-colors',
                        variant.isWinner && 'bg-emerald-50/50'
                      )}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                            index === 0 ? 'bg-charcoal-200 text-charcoal-700' :
                            index === 1 ? 'bg-violet-100 text-violet-700' :
                            'bg-blue-100 text-blue-700'
                          )}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>
                            <p className="font-medium text-charcoal-900 flex items-center gap-2">
                              {variant.name}
                              {variant.isControl && (
                                <Badge variant="outline" className="text-xs">Control</Badge>
                              )}
                              {variant.isWinner && (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Leader
                                </Badge>
                              )}
                            </p>
                            {variant.description && (
                              <p className="text-xs text-charcoal-500 mt-0.5 max-w-[250px] truncate">
                                {variant.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <Badge variant="secondary" className="tabular-nums">
                          {variant.trafficSplit}%
                        </Badge>
                      </td>
                      <td className="text-right py-4 px-4 tabular-nums font-medium">
                        {variant.metrics.sent.toLocaleString()}
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className="tabular-nums font-semibold">
                            {variant.metrics.openRate.toFixed(1)}%
                          </span>
                          {getPerformanceIndicator(variant, 'openRate')}
                          {formatDiff(variant, 'openRate')}
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className="tabular-nums font-semibold">
                            {variant.metrics.clickRate.toFixed(1)}%
                          </span>
                          {getPerformanceIndicator(variant, 'clickRate')}
                          {formatDiff(variant, 'clickRate')}
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className="tabular-nums font-semibold">
                            {variant.metrics.responseRate.toFixed(1)}%
                          </span>
                          {getPerformanceIndicator(variant, 'responseRate')}
                          {formatDiff(variant, 'responseRate')}
                        </div>
                      </td>
                      <td className="text-right py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <span className={cn(
                            'tabular-nums font-bold',
                            variant.isWinner ? 'text-emerald-600' : ''
                          )}>
                            {variant.metrics.conversionRate.toFixed(1)}%
                          </span>
                          {getPerformanceIndicator(variant, 'conversionRate')}
                          {formatDiff(variant, 'conversionRate')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Variant Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.variants.map((variant, index) => (
            <Card key={variant.id} className={cn(
              'relative overflow-hidden',
              variant.isWinner && 'ring-2 ring-emerald-500'
            )}>
              {variant.isWinner && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  <Trophy className="w-3 h-3 inline mr-1" />
                  Leading
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold',
                    index === 0 ? 'bg-charcoal-200 text-charcoal-700' :
                    index === 1 ? 'bg-violet-100 text-violet-700' :
                    'bg-blue-100 text-blue-700'
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{variant.name}</CardTitle>
                    {variant.description && (
                      <CardDescription className="text-xs mt-0.5">
                        {variant.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Sent</p>
                    <p className="text-lg font-bold tabular-nums">
                      {variant.metrics.sent.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Opened</p>
                    <p className="text-lg font-bold tabular-nums">
                      {variant.metrics.opened}
                      <span className="text-charcoal-400 text-sm font-normal ml-1">
                        ({variant.metrics.openRate}%)
                      </span>
                    </p>
                  </div>
                  <div className="p-2 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500">Responded</p>
                    <p className="text-lg font-bold tabular-nums">
                      {variant.metrics.responded}
                      <span className="text-charcoal-400 text-sm font-normal ml-1">
                        ({variant.metrics.responseRate}%)
                      </span>
                    </p>
                  </div>
                  <div className={cn(
                    'p-2 rounded-lg',
                    variant.isWinner ? 'bg-emerald-50' : 'bg-charcoal-50'
                  )}>
                    <p className={cn(
                      'text-xs',
                      variant.isWinner ? 'text-emerald-600' : 'text-charcoal-500'
                    )}>Leads</p>
                    <p className={cn(
                      'text-lg font-bold tabular-nums',
                      variant.isWinner ? 'text-emerald-600' : ''
                    )}>
                      {variant.metrics.leads}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Winner Selection Dialog */}
        <AlertDialog open={selectWinnerDialogOpen} onOpenChange={setSelectWinnerDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Select Winning Variant</AlertDialogTitle>
              <AlertDialogDescription>
                Choose the winning variant to apply to all remaining prospects in this campaign.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4 space-y-2">
              {config.variants.map((variant, index) => (
                <div
                  key={variant.id}
                  onClick={() => setSelectedWinner(variant.id)}
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-all',
                    selectedWinner === variant.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-charcoal-200 hover:border-charcoal-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                        index === 0 ? 'bg-charcoal-200 text-charcoal-700' :
                        'bg-violet-100 text-violet-700'
                      )}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div>
                        <p className="font-medium">{variant.name}</p>
                        <p className="text-sm text-charcoal-500">
                          {variant.metrics.openRate}% open rate • {variant.metrics.leads} leads
                        </p>
                      </div>
                    </div>
                    {selectedWinner === variant.id && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSelectWinner}
                disabled={!selectedWinner}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Confirm Winner
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}

