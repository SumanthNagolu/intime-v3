'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  User,
  Briefcase,
  Calendar,
  Plus,
  History,
  Target,
  Percent,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

const CHANGE_TYPE_CONFIG = {
  hire: { label: 'New Hire', color: 'bg-blue-100 text-blue-700', icon: User },
  promotion: { label: 'Promotion', color: 'bg-green-100 text-green-700', icon: TrendingUp },
  merit_increase: { label: 'Merit Increase', color: 'bg-emerald-100 text-emerald-700', icon: TrendingUp },
  market_adjustment: { label: 'Market Adjustment', color: 'bg-purple-100 text-purple-700', icon: BarChart3 },
  transfer: { label: 'Transfer', color: 'bg-amber-100 text-amber-700', icon: ArrowUpRight },
  demotion: { label: 'Demotion', color: 'bg-red-100 text-red-700', icon: TrendingDown },
  correction: { label: 'Correction', color: 'bg-charcoal-100 text-charcoal-700', icon: CheckCircle2 },
}

const SALARY_TYPE_CONFIG = {
  hourly: { label: 'Hourly', description: 'Paid per hour worked' },
  annual: { label: 'Annual', description: 'Fixed yearly salary' },
  contract: { label: 'Contract', description: 'Contract-based compensation' },
}

export default function EmployeeCompensationPage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.employeeId as string

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    effectiveDate: new Date().toISOString().split('T')[0],
    salaryType: 'annual' as 'hourly' | 'annual' | 'contract',
    baseSalary: '',
    changeType: 'merit_increase' as keyof typeof CHANGE_TYPE_CONFIG,
    changeReason: '',
    notes: '',
    bonusTargetPercent: '',
  })

  const utils = trpc.useUtils()

  // Fetch compensation data
  const { data: compensationData, isLoading } = trpc.compensation.getFullCompensation.useQuery({
    employeeId,
  })

  // Add compensation mutation
  const addCompensationMutation = trpc.compensation.history.add.useMutation({
    onSuccess: () => {
      utils.compensation.getFullCompensation.invalidate({ employeeId })
      setShowAddDialog(false)
      setFormData({
        effectiveDate: new Date().toISOString().split('T')[0],
        salaryType: 'annual',
        baseSalary: '',
        changeType: 'merit_increase',
        changeReason: '',
        notes: '',
        bonusTargetPercent: '',
      })
    },
  })

  const handleSubmitCompensation = () => {
    addCompensationMutation.mutate({
      employeeId,
      effectiveDate: formData.effectiveDate,
      salaryType: formData.salaryType,
      baseSalary: parseFloat(formData.baseSalary),
      changeType: formData.changeType,
      changeReason: formData.changeReason || undefined,
      notes: formData.notes || undefined,
      bonusTargetPercent: formData.bonusTargetPercent ? parseFloat(formData.bonusTargetPercent) : undefined,
    })
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (!compensationData) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-charcoal-400 mb-4" />
        <h2 className="text-lg font-semibold text-charcoal-900 mb-2">Employee Not Found</h2>
        <p className="text-charcoal-500 mb-4">The employee you're looking for doesn't exist.</p>
        <Link href="/employee/operations/compensation">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Compensation
          </Button>
        </Link>
      </div>
    )
  }

  const { employee, currentCompensation, position, compaRatio, history } = compensationData
  const employeeUser = employee.user as { full_name: string; email: string }

  // Calculate salary position in band
  let salaryPosition = 50
  if (position && position.salary_band_max > position.salary_band_min) {
    salaryPosition = ((currentCompensation.baseSalary - position.salary_band_min) /
      (position.salary_band_max - position.salary_band_min)) * 100
    salaryPosition = Math.min(Math.max(salaryPosition, 0), 100)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/compensation">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-charcoal-800 to-charcoal-900 flex items-center justify-center text-white text-lg font-semibold">
                  {employeeUser.full_name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                    {employeeUser.full_name}
                  </h1>
                  <p className="text-sm text-charcoal-500">
                    {employee.job_title} • {employee.department || 'No Department'}
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Compensation Change
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Current Compensation Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-charcoal-500 uppercase tracking-wider">Base Salary</p>
                  <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                    {currentCompensation.baseSalary ? formatCurrency(currentCompensation.baseSalary) : '—'}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1 capitalize">
                    {SALARY_TYPE_CONFIG[currentCompensation.salaryType as keyof typeof SALARY_TYPE_CONFIG]?.label ?? currentCompensation.salaryType}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-charcoal-500 uppercase tracking-wider">Compa-Ratio</p>
                  <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                    {compaRatio ? `${(compaRatio * 100).toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    {compaRatio ? (
                      compaRatio < 0.9 ? 'Below range' :
                      compaRatio <= 1.1 ? 'At range' : 'Above range'
                    ) : 'No position assigned'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Percent className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-charcoal-500 uppercase tracking-wider">Position</p>
                  <p className="text-lg font-semibold text-charcoal-900 mt-2 truncate">
                    {position?.title ?? 'Not Assigned'}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-charcoal-500 uppercase tracking-wider">Comp Changes</p>
                  <p className="text-h3 font-heading font-semibold text-charcoal-900 mt-2">
                    {history.length}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Total changes recorded
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <History className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Salary Band Position */}
          <div className="lg:col-span-2 space-y-6">
            {/* Salary Band Card */}
            {position && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-heading font-semibold">Salary Band Position</CardTitle>
                      <p className="text-sm text-charcoal-500">{position.title}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visual Band */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-600">Min: {formatCurrency(position.salary_band_min)}</span>
                      <span className="font-medium text-charcoal-900">Mid: {formatCurrency(position.salary_band_mid)}</span>
                      <span className="text-charcoal-600">Max: {formatCurrency(position.salary_band_max)}</span>
                    </div>
                    <div className="relative h-4 bg-charcoal-100 rounded-full overflow-hidden">
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 to-blue-400 opacity-50" />
                      {/* Mid marker */}
                      <div
                        className="absolute top-0 bottom-0 w-px bg-charcoal-400"
                        style={{ left: '50%' }}
                      />
                      {/* Current position marker */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-charcoal-900 border-2 border-white shadow-md flex items-center justify-center"
                        style={{ left: `${salaryPosition}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* Band Details */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">Below Min</p>
                      <p className="text-lg font-semibold text-charcoal-900 mt-1">
                        {currentCompensation.baseSalary < position.salary_band_min
                          ? formatCurrency(position.salary_band_min - currentCompensation.baseSalary)
                          : '—'}
                      </p>
                    </div>
                    <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">To Mid</p>
                      <p className={cn(
                        'text-lg font-semibold mt-1',
                        currentCompensation.baseSalary < position.salary_band_mid
                          ? 'text-amber-600'
                          : 'text-green-600'
                      )}>
                        {currentCompensation.baseSalary < position.salary_band_mid
                          ? formatCurrency(position.salary_band_mid - currentCompensation.baseSalary)
                          : `+${formatCurrency(currentCompensation.baseSalary - position.salary_band_mid)}`}
                      </p>
                    </div>
                    <div className="p-4 bg-charcoal-50 rounded-lg text-center">
                      <p className="text-xs text-charcoal-500 uppercase tracking-wider">To Max</p>
                      <p className="text-lg font-semibold text-charcoal-900 mt-1">
                        {currentCompensation.baseSalary < position.salary_band_max
                          ? formatCurrency(position.salary_band_max - currentCompensation.baseSalary)
                          : '—'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Compensation History */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <History className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-heading font-semibold">Compensation History</CardTitle>
                    <p className="text-sm text-charcoal-500">All salary changes and adjustments</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {history.length === 0 ? (
                  <div className="flex flex-col items-center py-12">
                    <div className="w-16 h-16 rounded-full bg-charcoal-100 flex items-center justify-center mb-4">
                      <History className="h-8 w-8 text-charcoal-400" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-charcoal-900 mb-2">
                      No History
                    </h3>
                    <p className="text-charcoal-500 text-center mb-4">
                      No compensation changes have been recorded for this employee.
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Record
                    </Button>
                  </div>
                ) : (
                  <div className="relative space-y-6">
                    <div className="absolute left-[19px] top-8 bottom-8 w-px bg-charcoal-200" />

                    {history.map((record, index) => {
                      const changeConfig = CHANGE_TYPE_CONFIG[record.change_type as keyof typeof CHANGE_TYPE_CONFIG]
                      const ChangeIcon = changeConfig?.icon ?? TrendingUp

                      return (
                        <div key={record.id} className="relative flex gap-4">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10',
                            changeConfig?.color ?? 'bg-charcoal-100'
                          )}>
                            <ChangeIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-charcoal-900">
                                    {changeConfig?.label ?? record.change_type}
                                  </p>
                                  {record.change_percentage && (
                                    <Badge className={record.change_percentage > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                      {record.change_percentage > 0 ? '+' : ''}{record.change_percentage.toFixed(1)}%
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-charcoal-500">
                                  Effective {new Date(record.effective_date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-charcoal-900">
                                  {formatCurrency(record.base_salary)}
                                </p>
                                {record.previous_salary && (
                                  <p className="text-sm text-charcoal-500">
                                    from {formatCurrency(record.previous_salary)}
                                  </p>
                                )}
                              </div>
                            </div>

                            {(record.change_reason || record.notes) && (
                              <div className="mt-2 p-3 bg-charcoal-50 rounded-lg text-sm text-charcoal-600">
                                {record.change_reason && <p>{record.change_reason}</p>}
                                {record.notes && <p className="mt-1 text-charcoal-500">{record.notes}</p>}
                              </div>
                            )}

                            {record.approved_user && (
                              <p className="text-xs text-charcoal-400 mt-2">
                                Approved by {(record.approved_user as { full_name: string }).full_name}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Employee Info */}
          <div className="space-y-6">
            {/* Employee Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-charcoal-600" />
                  </div>
                  <CardTitle className="text-lg font-heading font-semibold">Employee</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-800 to-charcoal-900 flex items-center justify-center text-white text-xl font-semibold">
                    {employeeUser.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-900">{employeeUser.full_name}</p>
                    <p className="text-sm text-charcoal-500">{employeeUser.email}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-charcoal-400" />
                    <span className="text-sm text-charcoal-600">{employee.job_title}</span>
                  </div>
                  {employee.department && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-charcoal-400" />
                      <span className="text-sm text-charcoal-600">{employee.department}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-heading font-semibold">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-charcoal-50 rounded-lg">
                  <span className="text-sm text-charcoal-600">Salary Type</span>
                  <Badge variant="secondary" className="capitalize">
                    {currentCompensation.salaryType}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-charcoal-50 rounded-lg">
                  <span className="text-sm text-charcoal-600">Currency</span>
                  <span className="font-medium text-charcoal-900">{currentCompensation.currency}</span>
                </div>
                {history.length > 1 && (
                  <div className="flex justify-between items-center p-3 bg-charcoal-50 rounded-lg">
                    <span className="text-sm text-charcoal-600">Last Change</span>
                    <span className="text-sm text-charcoal-900">
                      {new Date(history[0].effective_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {history.length > 0 && history[0].change_percentage && (
                  <div className="flex justify-between items-center p-3 bg-charcoal-50 rounded-lg">
                    <span className="text-sm text-charcoal-600">Last Increase</span>
                    <Badge className={history[0].change_percentage > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {history[0].change_percentage > 0 ? '+' : ''}{history[0].change_percentage.toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Compensation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Compensation Change</DialogTitle>
            <DialogDescription>
              Record a new salary change for {employeeUser.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Change Type</Label>
                <Select
                  value={formData.changeType}
                  onValueChange={(v) => setFormData({ ...formData, changeType: v as keyof typeof CHANGE_TYPE_CONFIG })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CHANGE_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Base Salary</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500">$</span>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Salary Type</Label>
                <Select
                  value={formData.salaryType}
                  onValueChange={(v) => setFormData({ ...formData, salaryType: v as 'hourly' | 'annual' | 'contract' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SALARY_TYPE_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bonus Target % (Optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 10"
                value={formData.bonusTargetPercent}
                onChange={(e) => setFormData({ ...formData, bonusTargetPercent: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason</Label>
              <Input
                placeholder="e.g., Annual performance review"
                value={formData.changeReason}
                onChange={(e) => setFormData({ ...formData, changeReason: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>

            {formData.baseSalary && currentCompensation.baseSalary && (
              <div className="p-4 bg-charcoal-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-charcoal-600">Change</span>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal-900">
                      {formatCurrency(parseFloat(formData.baseSalary) - currentCompensation.baseSalary)}
                    </p>
                    <p className={cn(
                      'text-sm',
                      parseFloat(formData.baseSalary) > currentCompensation.baseSalary
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}>
                      {((parseFloat(formData.baseSalary) - currentCompensation.baseSalary) / currentCompensation.baseSalary * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCompensation}
              disabled={!formData.baseSalary || addCompensationMutation.isPending}
            >
              {addCompensationMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
