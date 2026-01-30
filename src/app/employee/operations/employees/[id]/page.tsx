'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Building2, Calendar, MapPin, Briefcase } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import { EMPLOYEE_STATUS_CONFIG, EMPLOYMENT_TYPE_CONFIG } from '@/configs/entities/employees.config'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: employee, isLoading, error } = trpc.hr.employees.getById.useQuery({ id })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-charcoal-200 rounded" />
          <div className="h-64 bg-charcoal-100 rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !employee) {
    return (
      <div className="min-h-screen bg-cream p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-charcoal-900">Employee not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = EMPLOYEE_STATUS_CONFIG[employee.status] || { label: employee.status, color: 'bg-charcoal-100 text-charcoal-700' }
  const typeConfig = EMPLOYMENT_TYPE_CONFIG[employee.employment_type] || { label: employee.employment_type }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
                {employee.user?.full_name || 'Unknown Employee'}
              </h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-body-sm text-charcoal-500 mt-1">
              {employee.job_title} • {employee.employee_number}
            </p>
          </div>
        </div>
        <Button variant="outline">Edit Employee</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg font-heading font-semibold">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Full Name</dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{employee.user?.full_name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Employee Number</dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{employee.employee_number || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{employee.user?.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{employee.user?.phone || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg font-heading font-semibold">Employment Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Job Title</dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{employee.job_title || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Department
                  </dt>
                  <dd className="mt-1 text-sm text-charcoal-900 capitalize">{employee.department?.replace(/_/g, ' ') || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Employment Type</dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{typeConfig.label}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Hire Date
                  </dt>
                  <dd className="mt-1 text-sm text-charcoal-900">
                    {employee.hire_date ? format(new Date(employee.hire_date), 'MMM d, yyyy') : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Location
                  </dt>
                  <dd className="mt-1 text-sm text-charcoal-900">{employee.location || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Work Mode</dt>
                  <dd className="mt-1 text-sm text-charcoal-900 capitalize">{employee.work_mode || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading font-semibold">Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-charcoal-500">Status</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-charcoal-500">Type</span>
                <span className="text-sm font-medium text-charcoal-900">{typeConfig.label}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-charcoal-500">Department</span>
                <span className="text-sm font-medium text-charcoal-900 capitalize">{employee.department?.replace(/_/g, ' ') || '—'}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
