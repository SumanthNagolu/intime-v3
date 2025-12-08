'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import {
  useExtendOfferStore,
  RATE_TYPES,
  EMPLOYMENT_TYPES,
  WORK_LOCATIONS,
  DURATION_OPTIONS,
} from '@/stores/extend-offer-store'
import {
  Loader2,
  DollarSign,
  Calendar,
  Heart,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Clock,
  Save,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addMonths } from 'date-fns'

export default function ExtendOfferPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const submissionId = params.id as string

  const {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    resetForm,
    initializeFromSubmission,
    isDirty,
    lastSaved,
  } = useExtendOfferStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch submission data
  const submissionQuery = trpc.ats.submissions.getById.useQuery(
    { id: submissionId },
    { enabled: !!submissionId }
  )

  // Initialize from submission data
  useEffect(() => {
    if (submissionQuery.data) {
      const sub = submissionQuery.data
      initializeFromSubmission(
        submissionId,
        sub.candidateName || 'Candidate',
        sub.jobTitle || 'Job',
        sub.accountName || 'Account',
        sub.payRate || 0,
        sub.billRate || 0
      )
    }
  }, [submissionQuery.data, submissionId, initializeFromSubmission])

  // Auto-calculate end date from duration
  useEffect(() => {
    if (formData.startDate && formData.durationMonths) {
      const start = new Date(formData.startDate)
      const end = addMonths(start, formData.durationMonths)
      setFormData({ endDate: format(end, 'yyyy-MM-dd') })
    }
  }, [formData.startDate, formData.durationMonths, setFormData])

  // Create offer mutation
  const createOfferMutation = trpc.ats.offers.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Offer created successfully',
        description: `Draft offer created for ${formData.candidateName}. Ready to send.`,
      })
      resetForm()
      router.push(`/employee/recruiting/submissions/${submissionId}`)
    },
    onError: (error) => {
      toast({
        title: 'Failed to create offer',
        description: error.message,
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  // Calculate margin
  const marginAmount = formData.billRate - formData.payRate
  const marginPercent = formData.billRate > 0 ? ((marginAmount / formData.billRate) * 100).toFixed(1) : '0.0'
  const isLowMargin = parseFloat(marginPercent) < 15
  const isBelowMinimum = parseFloat(marginPercent) < 10

  const isW2 = formData.employmentType === 'w2'

  const handleSubmit = () => {
    if (isBelowMinimum) {
      toast({
        title: 'Cannot submit',
        description: 'Margin below 10% requires manager approval.',
        variant: 'error',
      })
      return
    }

    setIsSubmitting(true)
    createOfferMutation.mutate({
      submissionId,
      payRate: formData.payRate,
      billRate: formData.billRate,
      rateType: formData.rateType,
      overtimeRate: formData.overtimeRate ?? undefined,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      durationMonths: formData.durationMonths,
      employmentType: formData.employmentType,
      ptoDays: formData.ptoDays,
      sickDays: formData.sickDays,
      healthInsurance: formData.healthInsurance,
      has401k: formData.has401k,
      workLocation: formData.workLocation,
      standardHoursPerWeek: formData.standardHoursPerWeek,
      internalNotes: formData.internalNotes || undefined,
    })
  }

  const handleSaveDraft = () => {
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved locally.',
    })
  }

  if (submissionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-charcoal-500 mb-6">
        <Link
          href={`/employee/recruiting/submissions/${submissionId}`}
          className="hover:text-hublot-700 transition-colors flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Submission
        </Link>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-semibold text-charcoal-900 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-gold-500" />
          Extend Offer
        </h1>
        <p className="text-charcoal-500 mt-1">
          Create an offer for <span className="font-medium text-charcoal-900">{formData.candidateName}</span> at{' '}
          <span className="font-medium text-charcoal-900">{formData.accountName}</span> for{' '}
          <span className="font-medium text-charcoal-900">{formData.jobTitle}</span>
        </p>
        {lastSaved && isDirty && (
          <p className="text-sm text-charcoal-500 mt-2">
            <Save className="w-3 h-3 inline mr-1" />
            Auto-saved {new Date(lastSaved).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Tabs Content */}
      <Card className="mb-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'rates' | 'schedule' | 'benefits')}>
          <CardHeader className="pb-0">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rates" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Rates
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="benefits" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Benefits
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Rates Tab */}
            <TabsContent value="rates" className="space-y-4 m-0">
              {/* Job Rate Range Hint */}
              {submissionQuery.data?.jobRateMin && submissionQuery.data.jobRateMin > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Job rate range: ${submissionQuery.data.jobRateMin} - ${submissionQuery.data.jobRateMax}/{formData.rateType}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payRate">Pay Rate *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
                    <Input
                      id="payRate"
                      type="number"
                      step="0.01"
                      value={formData.payRate || ''}
                      onChange={(e) => setFormData({ payRate: parseFloat(e.target.value) || 0 })}
                      className="pl-7"
                      placeholder="75.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billRate">Bill Rate *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
                    <Input
                      id="billRate"
                      type="number"
                      step="0.01"
                      value={formData.billRate || ''}
                      onChange={(e) => setFormData({ billRate: parseFloat(e.target.value) || 0 })}
                      className="pl-7"
                      placeholder="95.00"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rateType">Rate Type</Label>
                  <Select
                    value={formData.rateType}
                    onValueChange={(v) => setFormData({ rateType: v as 'hourly' | 'daily' | 'weekly' | 'monthly' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATE_TYPES.map((rt) => (
                        <SelectItem key={rt.value} value={rt.value}>
                          {rt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtimeRate">Overtime Rate (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-charcoal-500">$</span>
                    <Input
                      id="overtimeRate"
                      type="number"
                      step="0.01"
                      value={formData.overtimeRate || ''}
                      onChange={(e) => setFormData({ overtimeRate: parseFloat(e.target.value) || null })}
                      className="pl-7"
                      placeholder="112.50"
                    />
                  </div>
                </div>
              </div>

              {/* Margin Preview */}
              <Card className={cn('bg-cream', isBelowMinimum && 'border-red-300 bg-red-50')}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-charcoal-500">Gross Margin</span>
                      <div className="text-xl font-bold text-charcoal-900">
                        ${marginAmount.toFixed(2)}/{formData.rateType === 'hourly' ? 'hr' : formData.rateType} ({marginPercent}%)
                      </div>
                    </div>
                    <Badge
                      variant={
                        parseFloat(marginPercent) >= 20
                          ? 'default'
                          : parseFloat(marginPercent) >= 15
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {parseFloat(marginPercent) >= 20
                        ? 'Excellent'
                        : parseFloat(marginPercent) >= 15
                        ? 'Good'
                        : parseFloat(marginPercent) >= 10
                        ? 'Low'
                        : 'Below Minimum'}
                    </Badge>
                  </div>
                  {isBelowMinimum && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Margin below 10% requires manager approval
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Employment Type */}
              <div className="space-y-2">
                <Label>Employment Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {EMPLOYMENT_TYPES.map((et) => (
                    <button
                      key={et.value}
                      type="button"
                      onClick={() => setFormData({ employmentType: et.value })}
                      className={cn(
                        'p-3 rounded-lg border text-left transition-colors',
                        formData.employmentType === et.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <div className="font-medium text-charcoal-900 text-sm">{et.label}</div>
                      <div className="text-xs text-charcoal-500">{et.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4 m-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ startDate: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationMonths">Contract Duration</Label>
                  <Select
                    value={formData.durationMonths.toString()}
                    onValueChange={(v) => setFormData({ durationMonths: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {DURATION_OPTIONS.map((d) => (
                        <SelectItem key={d.value} value={d.value.toString()}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Auto-calculated)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ endDate: e.target.value })}
                  className="bg-charcoal-50"
                />
                <p className="text-xs text-charcoal-500">
                  Calculated from start date + duration. Can be adjusted manually.
                </p>
              </div>

              {/* Work Location */}
              <div className="space-y-2">
                <Label>Work Location *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {WORK_LOCATIONS.map((wl) => (
                    <button
                      key={wl.value}
                      type="button"
                      onClick={() => setFormData({ workLocation: wl.value })}
                      className={cn(
                        'p-3 rounded-lg border text-center transition-colors',
                        formData.workLocation === wl.value
                          ? 'border-hublot-900 bg-hublot-50'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <span className="text-2xl">{wl.icon}</span>
                      <div className="font-medium text-charcoal-900 text-sm mt-1">{wl.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="standardHoursPerWeek">Standard Hours/Week</Label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-charcoal-500" />
                  <Input
                    id="standardHoursPerWeek"
                    type="number"
                    value={formData.standardHoursPerWeek}
                    onChange={(e) => setFormData({ standardHoursPerWeek: parseInt(e.target.value) || 40 })}
                    className="w-24"
                    min={10}
                    max={60}
                  />
                  <span className="text-charcoal-500">hours</span>
                </div>
              </div>
            </TabsContent>

            {/* Benefits Tab */}
            <TabsContent value="benefits" className="space-y-4 m-0">
              {!isW2 && (
                <div className="bg-amber-50 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Benefits are typically only available for W-2 employees
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Paid Time Off</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ptoDays">PTO Days/Year</Label>
                      <Input
                        id="ptoDays"
                        type="number"
                        value={formData.ptoDays}
                        onChange={(e) => setFormData({ ptoDays: parseInt(e.target.value) || 0 })}
                        disabled={!isW2}
                        min={0}
                        max={30}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sickDays">Sick Days/Year</Label>
                      <Input
                        id="sickDays"
                        type="number"
                        value={formData.sickDays}
                        onChange={(e) => setFormData({ sickDays: parseInt(e.target.value) || 0 })}
                        disabled={!isW2}
                        min={0}
                        max={30}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health & Retirement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Health Insurance</Label>
                      <p className="text-sm text-charcoal-500">Medical, dental, vision coverage</p>
                    </div>
                    <Switch
                      checked={formData.healthInsurance}
                      onCheckedChange={(checked) => setFormData({ healthInsurance: checked })}
                      disabled={!isW2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>401(k) Retirement Plan</Label>
                      <p className="text-sm text-charcoal-500">With company match (if eligible)</p>
                    </div>
                    <Switch
                      checked={formData.has401k}
                      onCheckedChange={(checked) => setFormData({ has401k: checked })}
                      disabled={!isW2}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  id="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ internalNotes: e.target.value })}
                  placeholder="Rate negotiation notes, special terms, etc..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-charcoal-500">Not visible to candidate or client</p>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Summary Card */}
      <Card className="bg-cream mb-6">
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-charcoal-500">Pay Rate</div>
              <div className="font-semibold text-charcoal-900">${formData.payRate}/{formData.rateType === 'hourly' ? 'hr' : formData.rateType}</div>
            </div>
            <div>
              <div className="text-xs text-charcoal-500">Bill Rate</div>
              <div className="font-semibold text-charcoal-900">${formData.billRate}/{formData.rateType === 'hourly' ? 'hr' : formData.rateType}</div>
            </div>
            <div>
              <div className="text-xs text-charcoal-500">Margin</div>
              <div className={cn('font-semibold', isBelowMinimum ? 'text-red-600' : 'text-green-600')}>
                {marginPercent}%
              </div>
            </div>
            <div>
              <div className="text-xs text-charcoal-500">Duration</div>
              <div className="font-semibold text-charcoal-900">{formData.durationMonths} mo</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm('Are you sure you want to cancel? Your progress will be lost.')) {
                resetForm()
                router.push(`/employee/recruiting/submissions/${submissionId}`)
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isBelowMinimum || formData.payRate <= 0 || formData.billRate <= 0}
            className="bg-hublot-900 hover:bg-hublot-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Create Draft Offer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
