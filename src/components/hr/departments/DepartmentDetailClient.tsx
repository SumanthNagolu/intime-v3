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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Users,
  Briefcase,
  DollarSign,
  Loader2,
  Network,
  AlertTriangle,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { DEPARTMENT_STATUS_CONFIG } from '@/configs/entities/departments.config'

// Types from the getFullDepartment response
interface DepartmentData {
  id: string
  name: string
  code?: string | null
  description?: string | null
  parent_id?: string | null
  head_id?: string | null
  cost_center_code?: string | null
  budget_amount?: number | null
  status: string
  hierarchy_level?: number | null
  created_at: string
  updated_at?: string | null
  head?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
  } | null
  parent?: {
    id: string
    name: string
    code?: string | null
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
        user?: {
          id: string
          full_name: string
          email: string
          avatar_url?: string | null
        } | null
      }>
      total: number
    }
    positions: {
      items: Array<{
        id: string
        title: string
        code?: string | null
        level?: string | null
        status: string
        headcount_budget?: number | null
      }>
      total: number
    }
    children: {
      items: Array<{
        id: string
        name: string
        code?: string | null
        status: string
        headcount?: number
      }>
      total: number
    }
    activity: {
      items: unknown[]
      total: number
    }
  }
}

interface DepartmentDetailClientProps {
  data: DepartmentData
}

export function DepartmentDetailClient({ data: department }: DepartmentDetailClientProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const deleteMutation = trpc.departments.delete.useMutation({
    onSuccess: () => {
      toast.success('Department deleted')
      utils.departments.list.invalidate()
      utils.departments.listWithStats.invalidate()
      router.push('/employee/operations/departments')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete department')
    },
  })

  const breadcrumbs = [
    { label: 'Operations', href: '/employee/operations' },
    { label: 'Departments', href: '/employee/operations/departments' },
    { label: department.name },
  ]

  const statusConfig = DEPARTMENT_STATUS_CONFIG[department.status]

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

  return (
    <DashboardShell
      title={department.name}
      description={department.code ? `Code: ${department.code}` : undefined}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Link href="/employee/operations/departments">
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
            disabled={department.sections.employees.total > 0 || department.sections.children.total > 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      {/* Status Banner for Non-Active */}
      {department.status !== 'active' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            This department is currently {department.status}. Employees cannot be assigned to it.
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
                <p className="text-2xl font-bold text-charcoal-900">{department.sections.employees.total}</p>
                <p className="text-sm text-charcoal-500">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{department.sections.positions.total}</p>
                <p className="text-sm text-charcoal-500">Positions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Network className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{department.sections.children.total}</p>
                <p className="text-sm text-charcoal-500">Sub-Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{formatCurrency(department.budget_amount)}</p>
                <p className="text-sm text-charcoal-500">Budget</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="col-span-2 space-y-6">
          {/* Department Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-charcoal-600" />
                  </div>
                  <CardTitle>Department Details</CardTitle>
                </div>
                <Badge className={statusConfig?.color || 'bg-charcoal-100 text-charcoal-700'}>
                  {statusConfig?.label || department.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {department.description && (
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-charcoal-700">{department.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Cost Center</p>
                  <p className="text-charcoal-700">{department.cost_center_code || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Hierarchy Level</p>
                  <p className="text-charcoal-700">{department.hierarchy_level ?? 0}</p>
                </div>
              </div>
              {department.parent && (
                <div>
                  <p className="text-xs font-medium text-charcoal-400 uppercase tracking-wider mb-1">Parent Department</p>
                  <Link
                    href={`/employee/operations/departments/${department.parent.id}`}
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {department.parent.name}
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Card>
            <Tabs defaultValue="employees" className="w-full">
              <CardHeader className="border-b">
                <TabsList>
                  <TabsTrigger value="employees">
                    Employees ({department.sections.employees.total})
                  </TabsTrigger>
                  <TabsTrigger value="positions">
                    Positions ({department.sections.positions.total})
                  </TabsTrigger>
                  <TabsTrigger value="children">
                    Sub-Departments ({department.sections.children.total})
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="employees" className="mt-0">
                  {department.sections.employees.items.length === 0 ? (
                    <div className="text-center py-8 text-charcoal-500">
                      No employees in this department
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {department.sections.employees.items.map((emp) => (
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
                              <p className="text-sm text-charcoal-500">{emp.job_title || 'No title'}</p>
                            </div>
                          </div>
                          <Badge className={emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'}>
                            {emp.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="positions" className="mt-0">
                  {department.sections.positions.items.length === 0 ? (
                    <div className="text-center py-8 text-charcoal-500">
                      No positions in this department
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {department.sections.positions.items.map((pos) => (
                        <Link
                          key={pos.id}
                          href={`/employee/operations/positions/${pos.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors block"
                        >
                          <div>
                            <p className="font-medium text-charcoal-900">{pos.title}</p>
                            <p className="text-sm text-charcoal-500">
                              {pos.level && `${pos.level} • `}
                              {pos.code && `${pos.code} • `}
                              Budget: {pos.headcount_budget ?? 0}
                            </p>
                          </div>
                          <Badge className={pos.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'}>
                            {pos.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="children" className="mt-0">
                  {department.sections.children.items.length === 0 ? (
                    <div className="text-center py-8 text-charcoal-500">
                      No sub-departments
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {department.sections.children.items.map((child) => (
                        <Link
                          key={child.id}
                          href={`/employee/operations/departments/${child.id}`}
                          className="flex items-center justify-between p-3 rounded-lg border border-charcoal-100 hover:border-charcoal-200 transition-colors block"
                        >
                          <div>
                            <p className="font-medium text-charcoal-900">{child.name}</p>
                            <p className="text-sm text-charcoal-500">
                              {child.code && `${child.code} • `}
                              {child.headcount ?? 0} employees
                            </p>
                          </div>
                          <Badge className={child.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-charcoal-100 text-charcoal-600'}>
                            {child.status}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column: Leadership & Quick Info */}
        <div className="space-y-6">
          {/* Department Head Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-charcoal-600" />
                </div>
                <CardTitle className="text-base">Department Head</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {department.head ? (
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={department.head.avatar_url || undefined} />
                    <AvatarFallback className="bg-charcoal-100">
                      {getInitials(department.head.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-charcoal-900">{department.head.full_name}</p>
                    <p className="text-sm text-charcoal-500">{department.head.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-charcoal-500 text-sm">No department head assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Created By</span>
                <span className="text-charcoal-900 text-sm font-medium">
                  {department.created_by_user?.full_name || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500 text-sm">Created</span>
                <span className="text-charcoal-900 text-sm font-medium">
                  {new Date(department.created_at).toLocaleDateString()}
                </span>
              </div>
              {department.updated_at && (
                <div className="flex justify-between">
                  <span className="text-charcoal-500 text-sm">Last Updated</span>
                  <span className="text-charcoal-900 text-sm font-medium">
                    {new Date(department.updated_at).toLocaleDateString()}
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
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Delete Department</h3>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to delete &quot;{department.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  deleteMutation.mutate({ id: department.id })
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
