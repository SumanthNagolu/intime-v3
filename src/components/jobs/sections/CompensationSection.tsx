'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  Calculator,
  Percent,
  Clock,
  Gift,
  ArrowRight,
  CheckCircle2,
  Plus,
  X,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import {
  RATE_TYPES,
  CURRENCIES,
  FEE_TYPES,
  OVERTIME_OPTIONS,
  BENEFITS,
} from '@/lib/jobs/constants'
import type { SectionMode, CompensationSectionData } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CompensationSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: CompensationSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * CompensationSection - Unified component for Job Compensation
 *
 * Covers bill rates, pay rates, fees, benefits, and work schedule
 */
export function CompensationSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CompensationSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [customBenefit, setCustomBenefit] = React.useState('')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Currency symbol helper
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$' }
    return symbols[currency] || currency
  }

  // Format rate display
  const formatRate = (min: string, max: string, rateType: string) => {
    const symbol = getCurrencySymbol(data.currency)
    const suffix = RATE_TYPES.find((r) => r.value === rateType)?.suffix || ''
    if (min && max) {
      return `${symbol}${min} - ${symbol}${max}${suffix}`
    } else if (min) {
      return `${symbol}${min}+${suffix}`
    } else if (max) {
      return `Up to ${symbol}${max}${suffix}`
    }
    return 'Not specified'
  }

  // Benefits management
  const toggleBenefit = (benefit: string) => {
    const current = data.benefits
    if (current.includes(benefit)) {
      handleChange('benefits', current.filter((b) => b !== benefit))
    } else {
      handleChange('benefits', [...current, benefit])
    }
  }

  const addCustomBenefit = () => {
    if (!customBenefit.trim()) return
    handleChange('benefits', [...data.benefits, customBenefit.trim()])
    setCustomBenefit('')
  }

  const removeBenefit = (index: number) => {
    handleChange('benefits', data.benefits.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Compensation"
          subtitle="Rates, fees, and benefits for this position"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Rate Type & Currency Selection */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-base font-heading">Rate Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Rate Type */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Rate Type
              </Label>
              {isEditable ? (
                <Select
                  value={data.rateType}
                  onValueChange={(value) => handleChange('rateType', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RATE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-charcoal-900 font-medium">
                  {RATE_TYPES.find((t) => t.value === data.rateType)?.label || data.rateType}
                </p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Currency
              </Label>
              {isEditable ? (
                <Select
                  value={data.currency}
                  onValueChange={(value) => handleChange('currency', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.symbol} {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-charcoal-900 font-medium">
                  {getCurrencySymbol(data.currency)} ({data.currency})
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bill Rate & Pay Rate Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bill Rate Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calculator className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Bill Rate</CardTitle>
            </div>
            <p className="text-xs text-charcoal-500">Rate charged to client</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Minimum
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                      {getCurrencySymbol(data.currency)}
                    </span>
                    <Input
                      type="number"
                      value={data.billRateMin}
                      onChange={(e) => handleChange('billRateMin', e.target.value)}
                      placeholder="0"
                      className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Maximum
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                      {getCurrencySymbol(data.currency)}
                    </span>
                    <Input
                      type="number"
                      value={data.billRateMax}
                      onChange={(e) => handleChange('billRateMax', e.target.value)}
                      placeholder="0"
                      className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <span className="text-sm text-charcoal-600">Range</span>
                <span className="text-lg font-semibold text-charcoal-900">
                  {formatRate(data.billRateMin, data.billRateMax, data.rateType)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pay Rate Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calculator className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Pay Rate</CardTitle>
            </div>
            <p className="text-xs text-charcoal-500">Rate paid to consultant</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Minimum
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                      {getCurrencySymbol(data.currency)}
                    </span>
                    <Input
                      type="number"
                      value={data.payRateMin}
                      onChange={(e) => handleChange('payRateMin', e.target.value)}
                      placeholder="0"
                      className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Maximum
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                      {getCurrencySymbol(data.currency)}
                    </span>
                    <Input
                      type="number"
                      value={data.payRateMax}
                      onChange={(e) => handleChange('payRateMax', e.target.value)}
                      placeholder="0"
                      className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <span className="text-sm text-charcoal-600">Range</span>
                <span className="text-lg font-semibold text-charcoal-900">
                  {formatRate(data.payRateMin, data.payRateMax, data.rateType)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversion Salary (for contract-to-hire) */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <ArrowRight className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-base font-heading">Conversion Terms</CardTitle>
          </div>
          <p className="text-xs text-charcoal-500">For contract-to-hire positions</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditable ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Conversion Salary Min
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                    {getCurrencySymbol(data.currency)}
                  </span>
                  <Input
                    type="number"
                    value={data.conversionSalaryMin}
                    onChange={(e) => handleChange('conversionSalaryMin', e.target.value)}
                    placeholder="0"
                    className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Conversion Salary Max
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                    {getCurrencySymbol(data.currency)}
                  </span>
                  <Input
                    type="number"
                    value={data.conversionSalaryMax}
                    onChange={(e) => handleChange('conversionSalaryMax', e.target.value)}
                    placeholder="0"
                    className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Conversion Fee %
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={data.conversionFee}
                    onChange={(e) => handleChange('conversionFee', e.target.value)}
                    placeholder="0"
                    className="h-11 pr-8 rounded-xl border-charcoal-200 bg-white"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                    %
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block mb-1">
                  Conversion Salary
                </span>
                <span className="text-base font-semibold text-charcoal-900">
                  {data.conversionSalaryMin || data.conversionSalaryMax
                    ? `${getCurrencySymbol(data.currency)}${data.conversionSalaryMin || '?'} - ${getCurrencySymbol(data.currency)}${data.conversionSalaryMax || '?'}/year`
                    : 'Not specified'}
                </span>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <span className="text-xs text-charcoal-500 uppercase tracking-wider block mb-1">
                  Conversion Fee
                </span>
                <span className="text-base font-semibold text-charcoal-900">
                  {data.conversionFee ? `${data.conversionFee}%` : 'Not specified'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agency Fee Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <Percent className="w-4 h-4 text-red-600" />
            </div>
            <CardTitle className="text-base font-heading">Agency Fee Structure</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
              Fee Type
            </Label>
            {isEditable ? (
              <div className="grid grid-cols-3 gap-3">
                {FEE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('feeType', type.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-center transition-all duration-200',
                      data.feeType === type.value
                        ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white'
                        : 'border-charcoal-100 bg-white hover:border-gold-200'
                    )}
                  >
                    <span className="text-sm font-medium text-charcoal-800">{type.label}</span>
                    {data.feeType === type.value && (
                      <CheckCircle2 className="w-4 h-4 text-gold-500 mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal-900 font-medium">
                {FEE_TYPES.find((t) => t.value === data.feeType)?.label || data.feeType}
              </p>
            )}
          </div>

          {/* Fee Amount based on type */}
          {isEditable && (
            <div className="grid grid-cols-2 gap-4">
              {(data.feeType === 'percentage' || data.feeType === 'hourly_spread') && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    {data.feeType === 'percentage' ? 'Fee Percentage' : 'Spread Amount'}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={data.feePercentage}
                      onChange={(e) => handleChange('feePercentage', e.target.value)}
                      placeholder="0"
                      className="h-11 pr-8 rounded-xl border-charcoal-200 bg-white"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                      {data.feeType === 'percentage' ? '%' : '/hr'}
                    </span>
                  </div>
                </div>
              )}
              {data.feeType === 'flat' && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Flat Fee Amount
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">
                      {getCurrencySymbol(data.currency)}
                    </span>
                    <Input
                      type="number"
                      value={data.feeFlatAmount}
                      onChange={(e) => handleChange('feeFlatAmount', e.target.value)}
                      placeholder="0"
                      className="h-11 pl-8 rounded-xl border-charcoal-200 bg-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {!isEditable && (data.feePercentage || data.feeFlatAmount) && (
            <div className="p-4 bg-red-50 rounded-xl">
              <span className="text-xs text-charcoal-500 uppercase tracking-wider block mb-1">
                Fee Amount
              </span>
              <span className="text-base font-semibold text-charcoal-900">
                {data.feeType === 'percentage' && data.feePercentage && `${data.feePercentage}%`}
                {data.feeType === 'flat' &&
                  data.feeFlatAmount &&
                  `${getCurrencySymbol(data.currency)}${data.feeFlatAmount}`}
                {data.feeType === 'hourly_spread' &&
                  data.feePercentage &&
                  `${getCurrencySymbol(data.currency)}${data.feePercentage}/hr spread`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benefits Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Gift className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-base font-heading">Benefits</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditable && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BENEFITS.map((benefit) => (
                  <button
                    key={benefit.value}
                    type="button"
                    onClick={() => toggleBenefit(benefit.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all duration-200',
                      data.benefits.includes(benefit.value)
                        ? 'border-green-400 bg-green-50'
                        : 'border-charcoal-100 bg-white hover:border-green-200'
                    )}
                  >
                    <span className="text-sm font-medium text-charcoal-900">{benefit.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={customBenefit}
                  onChange={(e) => setCustomBenefit(e.target.value)}
                  placeholder="Add custom benefit"
                  className="h-10 rounded-xl border-charcoal-200 bg-white flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomBenefit())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomBenefit}
                  disabled={!customBenefit.trim()}
                  className="h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-2">
            {data.benefits.map((benefit, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="pl-3 pr-1 py-1 flex items-center gap-1 bg-green-50 border-green-200"
              >
                <Gift className="w-3 h-3 text-green-500" />
                {BENEFITS.find((b) => b.value === benefit)?.label || benefit}
                {isEditable && (
                  <button
                    type="button"
                    onClick={() => removeBenefit(index)}
                    className="ml-1 hover:text-error-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            {data.benefits.length === 0 && !isEditable && (
              <p className="text-sm text-charcoal-400">No benefits specified</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work Schedule Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Clock className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-heading">Work Schedule</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Weekly Hours */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Weekly Hours
              </Label>
              {isEditable ? (
                <Input
                  type="number"
                  value={data.weeklyHours}
                  onChange={(e) => handleChange('weeklyHours', e.target.value)}
                  placeholder="40"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900 font-medium">
                  {data.weeklyHours ? `${data.weeklyHours} hours/week` : 'Not specified'}
                </p>
              )}
            </div>

            {/* Overtime Expected */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Overtime Expected
              </Label>
              {isEditable ? (
                <Select
                  value={data.overtimeExpected}
                  onValueChange={(value) => handleChange('overtimeExpected', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {OVERTIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-charcoal-900 font-medium">
                  {OVERTIME_OPTIONS.find((o) => o.value === data.overtimeExpected)?.label ||
                    'Not specified'}
                </p>
              )}
            </div>

            {/* On-Call */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                On-Call Required
              </Label>
              {isEditable ? (
                <div className="flex items-center gap-3 h-11">
                  <Switch
                    checked={data.onCallRequired}
                    onCheckedChange={(checked) => handleChange('onCallRequired', checked)}
                  />
                  <span className="text-sm text-charcoal-600">
                    {data.onCallRequired ? 'Yes' : 'No'}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-charcoal-900 font-medium">
                  {data.onCallRequired ? 'Yes' : 'No'}
                </p>
              )}
            </div>
          </div>

          {/* On-Call Schedule */}
          {data.onCallRequired && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                On-Call Schedule Details
              </Label>
              {isEditable ? (
                <Input
                  value={data.onCallSchedule}
                  onChange={(e) => handleChange('onCallSchedule', e.target.value)}
                  placeholder="e.g., Rotating weekly, 1 week per month"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.onCallSchedule || <span className="text-charcoal-400">Not specified</span>}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default CompensationSection
