'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'

interface MarginCalculatorProps {
  initialBillRate?: number
  initialPayRate?: number
  targetMargin?: number
  minMargin?: number
  onRatesCalculated?: (rates: { billRate: number; payRate: number; margin: number }) => void
  className?: string
}

/**
 * MarginCalculator - What-if analysis tool for rate calculations
 *
 * Features:
 * - Calculate margin from bill/pay rates
 * - Calculate bill rate from pay rate + target margin
 * - Calculate pay rate from bill rate + target margin
 * - Visual margin quality indicator
 * - Slider for quick adjustments
 */
export function MarginCalculator({
  initialBillRate = 0,
  initialPayRate = 0,
  targetMargin = 20,
  minMargin = 10,
  onRatesCalculated,
  className,
}: MarginCalculatorProps) {
  const [billRate, setBillRate] = useState(initialBillRate)
  const [payRate, setPayRate] = useState(initialPayRate)
  const [calculationMode, setCalculationMode] = useState<'margin' | 'bill' | 'pay'>('margin')
  const [targetMarginInput, setTargetMarginInput] = useState(targetMargin)

  // Use tRPC to calculate margin
  const marginQuery = trpc.rates.calculateMargin.useQuery(
    { billRate, payRate },
    {
      enabled: billRate > 0 && payRate > 0,
    }
  )

  const calculations = useMemo(() => {
    if (billRate <= 0 || payRate <= 0) {
      return {
        grossMargin: 0,
        marginPercentage: 0,
        markupPercentage: 0,
        quality: 'critical' as const,
      }
    }

    const grossMargin = billRate - payRate
    const marginPercentage = (grossMargin / billRate) * 100
    const markupPercentage = (grossMargin / payRate) * 100

    let quality: 'excellent' | 'good' | 'acceptable' | 'low' | 'critical'
    if (marginPercentage >= 20) quality = 'excellent'
    else if (marginPercentage >= 15) quality = 'good'
    else if (marginPercentage >= 10) quality = 'acceptable'
    else if (marginPercentage >= 5) quality = 'low'
    else quality = 'critical'

    return { grossMargin, marginPercentage, markupPercentage, quality }
  }, [billRate, payRate])

  // Calculate bill rate from pay rate and target margin
  const calculateBillFromPay = (pay: number, margin: number) => {
    if (pay <= 0 || margin >= 100) return 0
    return pay / (1 - margin / 100)
  }

  // Calculate pay rate from bill rate and target margin
  const calculatePayFromBill = (bill: number, margin: number) => {
    if (bill <= 0) return 0
    return bill * (1 - margin / 100)
  }

  const handleBillRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setBillRate(numValue)
    if (calculationMode === 'pay' && numValue > 0) {
      setPayRate(calculatePayFromBill(numValue, targetMarginInput))
    }
  }

  const handlePayRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    setPayRate(numValue)
    if (calculationMode === 'bill' && numValue > 0) {
      setBillRate(calculateBillFromPay(numValue, targetMarginInput))
    }
  }

  const handleTargetMarginChange = (value: number[]) => {
    const margin = value[0]
    setTargetMarginInput(margin)

    if (calculationMode === 'bill' && payRate > 0) {
      setBillRate(calculateBillFromPay(payRate, margin))
    } else if (calculationMode === 'pay' && billRate > 0) {
      setPayRate(calculatePayFromBill(billRate, margin))
    }
  }

  const handleApplyTargetMargin = () => {
    if (payRate > 0) {
      setBillRate(calculateBillFromPay(payRate, targetMarginInput))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  useEffect(() => {
    if (onRatesCalculated && billRate > 0 && payRate > 0) {
      onRatesCalculated({
        billRate,
        payRate,
        margin: calculations.marginPercentage,
      })
    }
  }, [billRate, payRate, calculations.marginPercentage, onRatesCalculated])

  const getQualityConfig = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          bgColor: 'bg-green-50',
          icon: TrendingUp,
          iconColor: 'text-green-600',
        }
      case 'good':
        return {
          color: 'bg-green-100 text-green-700 border-green-200',
          bgColor: 'bg-green-50',
          icon: TrendingUp,
          iconColor: 'text-green-600',
        }
      case 'acceptable':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          bgColor: 'bg-amber-50',
          icon: TrendingDown,
          iconColor: 'text-amber-600',
        }
      case 'low':
        return {
          color: 'bg-amber-100 text-amber-700 border-amber-200',
          bgColor: 'bg-amber-50',
          icon: TrendingDown,
          iconColor: 'text-amber-600',
        }
      default:
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          bgColor: 'bg-red-50',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
        }
    }
  }

  const qualityConfig = getQualityConfig(calculations.quality)
  const QualityIcon = qualityConfig.icon

  return (
    <Card className={cn('bg-white', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calculator className="w-5 h-5 text-charcoal-600" />
          Margin Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calculation Mode Selector */}
        <div className="flex gap-2 p-1 bg-charcoal-100 rounded-lg">
          <Button
            variant={calculationMode === 'margin' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setCalculationMode('margin')}
          >
            Calculate Margin
          </Button>
          <Button
            variant={calculationMode === 'bill' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setCalculationMode('bill')}
          >
            Calculate Bill
          </Button>
          <Button
            variant={calculationMode === 'pay' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 h-8"
            onClick={() => setCalculationMode('pay')}
          >
            Calculate Pay
          </Button>
        </div>

        {/* Rate Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Bill Rate</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                type="number"
                step="0.01"
                value={billRate || ''}
                onChange={(e) => handleBillRateChange(e.target.value)}
                className={cn(
                  'pl-7',
                  calculationMode === 'bill' && 'border-gold-500 ring-1 ring-gold-500/20'
                )}
                placeholder="0.00"
              />
            </div>
            {calculationMode === 'bill' && (
              <p className="text-xs text-gold-600">Auto-calculated</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Pay Rate</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
              <Input
                type="number"
                step="0.01"
                value={payRate || ''}
                onChange={(e) => handlePayRateChange(e.target.value)}
                className={cn(
                  'pl-7',
                  calculationMode === 'pay' && 'border-gold-500 ring-1 ring-gold-500/20'
                )}
                placeholder="0.00"
              />
            </div>
            {calculationMode === 'pay' && (
              <p className="text-xs text-gold-600">Auto-calculated</p>
            )}
          </div>
        </div>

        {/* Target Margin Slider */}
        {calculationMode !== 'margin' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Target Margin</Label>
              <span className="text-sm font-medium text-charcoal-900">
                {targetMarginInput.toFixed(1)}%
              </span>
            </div>
            <Slider
              value={[targetMarginInput]}
              onValueChange={handleTargetMarginChange}
              min={0}
              max={50}
              step={0.5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-charcoal-400">
              <span>0%</span>
              <span className="text-amber-500">Min: {minMargin}%</span>
              <span className="text-green-500">Target: {targetMargin}%</span>
              <span>50%</span>
            </div>
          </div>
        )}

        {/* Results Display */}
        {(billRate > 0 && payRate > 0) && (
          <div className={cn('p-4 rounded-lg', qualityConfig.bgColor)}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <QualityIcon className={cn('w-5 h-5', qualityConfig.iconColor)} />
                <span className="text-sm font-medium text-charcoal-700">Calculated Margin</span>
              </div>
              <Badge className={qualityConfig.color}>
                {calculations.quality.charAt(0).toUpperCase() + calculations.quality.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-charcoal-900">
                  {calculations.marginPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-charcoal-500">Margin</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">
                  {formatCurrency(calculations.grossMargin)}
                </p>
                <p className="text-xs text-charcoal-500">Gross Profit</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">
                  {calculations.markupPercentage.toFixed(1)}%
                </p>
                <p className="text-xs text-charcoal-500">Markup</p>
              </div>
            </div>

            {/* Margin warnings */}
            {calculations.marginPercentage < minMargin && (
              <div className="mt-3 p-2 bg-red-100 rounded flex items-center gap-2 text-red-700 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Below minimum margin of {minMargin}%
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {calculationMode === 'margin' && payRate > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-charcoal-500">Quick:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBillRate(calculateBillFromPay(payRate, targetMargin))}
            >
              Apply {targetMargin}% margin
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
