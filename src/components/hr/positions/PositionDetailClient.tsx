'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Briefcase,
  Users,
  DollarSign,
  Loader2,
  Building2,
  AlertTriangle,
  Gauge,
} from 'lucide-react'
import { toast } from 'sonner'
import { POSITION_STATUS_CONFIG } from '@/configs/entities/positions.config'

// Types from the getFullPosition response
interface PositionData {
  id: string
  title: string
  code?: string | null
  description?: string | null
  department_id: string
  level?: string | null
  salary_band_min?: number | null
  salary_band_mid?: number | null
  salary_band_max?: number | null
  headcount_budget: number
  status: string
  created_at: string
  updated_at?: string | null
  department?: {
    id: string
    name: string
    code?: string | null
    head?: {
      id: string
      full_name: string
      avatar_url?: string | null
    } | null
  } | null
  created_by_user?: {
    id: string
    full_name: string
  } | null
  sections: {
    employees: {
      items: Array<{
        id: string
        job_title?: string | null
        status: string
        hire_date?: string | null
        user?: {
          id: string
          full_name: string
          email: string
          avatar_url?: string | null
        } | null
      }>
      total: number
    }
    activity: {
      items: unknown[]
      total: number
    }
  }
}

interface PositionDetailClientProps {
  data: PositionData
}

export function PositionDetailClient({ data: position }: PositionDetailClientProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteMutation = trpc.positions.delete.useMutation({
    onSuccess: () => {
      toast.success('Position deleted')
      utils.positions.list.invalidate()
      utils.positions.listWithStats.invalidate()
      router.push('/employee/operations/positions')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete position')
    },
  })

  const breadcrumbs = [
    { label: 'Operations', href: '/employee/operations' },
    { label: 'Positions', href: '/employee/operations/positions' },
    { label: position.title },
  ]

  const statusConfig = POSITION_STATUS_CONFIG[position.status]

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const filledCount = position.sections.employees.total
  const fillPercentage = position.headcount_budget > 0
    ? Math.round((filledCount / position.headcount_budget) * 100)
    : 0

  return (
    <DashboardShell
      title={position.title}
      description={position.code ? `Code: ${position.code}` : undefined}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Link href="/employee/operations/positions">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button variant="outline" disabled>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:border-red-300"
            onClick={() => setShowDeleteDialog(true)}
            disabled={position.sections.employees.total > 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      {/* Status Banner for Non-Open */}
      {position.status !== 'open' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            This position is currently {position.status}. {position.status === 'frozen' && 'Hiring is paused.'}
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{filledCount}</p>
                <p className="text-sm text-charcoal-500">Current Headcount</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Gauge className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{position.headcount_budget}</p>
                <p className="text-sm text-charcoal-500">Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{Math.max(0, position.headcount_budget - filledCount)}</p>
                <p className="text-sm text-charcoal-500">Vacancies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-charcoal-900">{formatCurrency(position.salary_band_mid)}</p>
                <p className="text-sm text-charcoal-500">Mid-Band Salary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="col-span-2 space-y-6">
          {/* Position Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-charcoal-600" />
                  </div>
                  <CardTitle>Position Details</CardTitle>
                </div>
                <Badge className={statusConfig?.color || 'bg-charcoal-100 text-charcoal-700'}>
                  {statusConfig?.label || position.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {position.description && (
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-charcoal-700">{position.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Level</p>
                  <p className="text-charcoal-700">{position.level || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Department</p>
                  {position.department ? (
                    <Link
                      href={`/employee/operations/departments/${position.department.id}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {position.department.name}
                    </Link>
                  ) : (
                    <p className="text-charcoal-700">—</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compensation Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-charcoal-600" />
                </div>
                <CardTitle>Compensation Band</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-charcoal-50">
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Minimum</p>
                  <p className="text-xl font-bold text-charcoal-900">{formatCurrency(position.salary_band_min)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
                  <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Midpoint</p>
                  <p className="text-xl font-bold text-green-700">{formatCurrency(position.salary_band_mid)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-charcoal-50">
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Maximum</p>
                  <p className="text-xl font-bold text-charcoal-900">{formatCurrency(position.salary_band_max)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employees Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-charcoal-600" />
                  </div>
                  <CardTitle>Current Employees ({position.sections.employees.total})</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {position.sections.employees.items.length === 0 ? (
                <div className="text-center py-8 text-charcoal-500">
                  No employees in this position
                </div>
              ) : (
                <div className="space-y-3">
                  {position.sections.employees.items.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={emp.user?.avatar_url || undefined} />
                          <AvatarFallback className="bg-charcoal-100">
                            {emp.user ? getInitials(emp.user.full_name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-charcoal-900">{emp.user?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-charcoal-500">
                            {emp.hire_date && `Hired ${new Date(emp.hire_date).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      <Badge className={emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'}>
                        {emp.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fill Status & Quick Info */}
        <div className="space-y-6">
          {/* Fill Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fill Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-charcoal-900">{fillPercentage}%</p>
                <p className="text-sm text-charcoal-500">Filled</p>
              </div>
              <Progress value={fillPercentage} className="h-3" />
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-500">
                  {filledCount} filled
                </span>
                <span className="text-charcoal-500">
                  {position.headcount_budget} budget
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Department Card */}
          {position.department && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-charcoal-600" />
                  </div>
                  <CardTitle className="text-base">Department</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/employee/operations/departments/${position.department.id}`}
                  className="block p-3 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors"
                >
                  <p className="font-medium text-charcoal-900">{position.department.name}</p>
                  {position.department.code && (
                    <p className="text-sm text-charcoal-500">{position.department.code}</p>
                  )}
                  {position.department.head && (
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={position.department.head.avatar_url || undefined} />
                        <AvatarFallback className="bg-charcoal-100 text-xs">
                          {getInitials(position.department.head.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-charcoal-500">
                        Head: {position.department.head.full_name}
                      </span>
                    </div>
                  )}
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Created By</span>
                <span className="text-charcoal-900 text-sm font-medium">
                  {position.created_by_user?.full_name || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Created</span>
                <span className="text-charcoal-900 text-sm font-medium">
                  {new Date(position.created_at).toLocaleDateString()}
                </span>
              </div>
              {position.updated_at && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500 text-sm">Last Updated</span>
                  <span className="text-charcoal-900 text-sm font-medium">
                    {new Date(position.updated_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Delete Position</h3>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to delete &quot;{position.title}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  deleteMutation.mutate({ id: position.id })
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
