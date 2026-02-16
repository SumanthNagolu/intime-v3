'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Mail, Phone, Building2, Calendar, MapPin, Briefcase, Loader2, Pencil, X, UserCog } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhoneInput, parsePhoneValue, formatPhoneValue, type PhoneInputValue } from '@/components/ui/phone-input'
import { AddressForm, type AddressFormData } from '@/components/addresses'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { EMPLOYEE_STATUS_CONFIG, EMPLOYMENT_TYPE_CONFIG } from '@/configs/entities/employees.config'

interface PageProps {
  params: Promise<{ id: string }>
}

interface EditFormData {
  firstName: string
  lastName: string
  phone: PhoneInputValue
  address: Partial<AddressFormData>
  jobTitle: string
  department: string
  employmentType: string
  status: string
  managerId: string
  hireDate: string
  workMode: string
}

function formatAddress(addr: { addressLine1?: string | null; addressLine2?: string | null; city?: string | null; stateProvince?: string | null; postalCode?: string | null; countryCode?: string | null }) {
  const line1 = [addr.addressLine1, addr.addressLine2].filter(Boolean).join(', ')
  const line2 = [addr.city, addr.stateProvince].filter(Boolean).join(', ')
  const line3 = [addr.postalCode].filter(Boolean).join(' ')
  return [line1, line2, line3].filter(Boolean).join(', ')
}

export default function EmployeeDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<EditFormData>({
    firstName: '',
    lastName: '',
    phone: { countryCode: 'US', number: '' },
    address: { countryCode: 'US' },
    jobTitle: '',
    department: '',
    employmentType: '',
    status: '',
    managerId: '',
    hireDate: '',
    workMode: '',
  })

  const utils = trpc.useUtils()
  const { data: employee, isLoading, error } = trpc.hr.employees.getById.useQuery({ id })

  // Always fetch address so view mode can display it
  const { data: addresses } = trpc.addresses.getByEntity.useQuery(
    { entityType: 'employee', entityId: id },
  )

  const primaryAddress = addresses?.find((a) => a.isPrimary) ?? addresses?.[0]

  const updateEmployee = trpc.hr.employees.update.useMutation({
    onSuccess: () => {
      toast.success('Employee updated successfully')
      setIsEditing(false)
      utils.hr.employees.getById.invalidate({ id })
      utils.addresses.getByEntity.invalidate({ entityType: 'employee', entityId: id })
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update employee')
    },
  })

  const upsertAddress = trpc.addresses.upsertForEntity.useMutation({
    onError: (err) => {
      console.error('Failed to update address:', err)
    },
  })

  // Load existing address data into form when entering edit mode
  useEffect(() => {
    if (primaryAddress && isEditing) {
      setFormData((prev) => ({
        ...prev,
        address: {
          addressLine1: primaryAddress.addressLine1 ?? '',
          addressLine2: primaryAddress.addressLine2 ?? '',
          city: primaryAddress.city ?? '',
          stateProvince: primaryAddress.stateProvince ?? '',
          postalCode: primaryAddress.postalCode ?? '',
          countryCode: primaryAddress.countryCode ?? 'US',
          county: '',
        },
      }))
    }
  }, [primaryAddress, isEditing])

  const startEditing = () => {
    if (!employee) return
    const fullName = employee.user?.full_name ?? ''
    const nameParts = fullName.split(' ')
    setFormData({
      firstName: nameParts[0] ?? '',
      lastName: nameParts.slice(1).join(' ') ?? '',
      phone: parsePhoneValue(employee.user?.phone),
      address: { countryCode: 'US' },
      jobTitle: employee.job_title ?? '',
      department: employee.department ?? '',
      employmentType: employee.employment_type ?? '',
      status: employee.status ?? '',
      managerId: employee.manager_id ?? '',
      hireDate: employee.hire_date ?? '',
      workMode: employee.work_mode ?? '',
    })
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleSave = () => {
    if (!formData.firstName) {
      toast.error('First name is required')
      return
    }
    if (!formData.jobTitle) {
      toast.error('Job title is required')
      return
    }
    if (!formData.department) {
      toast.error('Department is required')
      return
    }

    const phoneString = formatPhoneValue(formData.phone)

    // Build location string from address
    const locationParts = [formData.address.city, formData.address.stateProvince].filter(Boolean)
    const locationString = locationParts.length > 0
      ? locationParts.join(', ')
      : formData.address.addressLine1 || employee?.location || ''

    updateEmployee.mutate({
      id,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: phoneString || null,
      jobTitle: formData.jobTitle,
      department: formData.department,
      employmentType: formData.employmentType as 'fte' | 'contractor' | 'intern' | 'part_time',
      status: formData.status as 'onboarding' | 'active' | 'on_leave' | 'terminated',
      managerId: formData.managerId || null,
      hireDate: formData.hireDate || undefined,
      location: locationString || null,
      workMode: formData.workMode ? (formData.workMode as 'on_site' | 'remote' | 'hybrid') : null,
    })

    // Save address if any address data was provided
    if (formData.address.addressLine1 || formData.address.city) {
      upsertAddress.mutate({
        entityType: 'employee',
        entityId: id,
        addressType: 'current',
        addressLine1: formData.address.addressLine1 || undefined,
        addressLine2: formData.address.addressLine2 || undefined,
        city: formData.address.city || undefined,
        stateProvince: formData.address.stateProvince || undefined,
        postalCode: formData.address.postalCode || undefined,
        countryCode: formData.address.countryCode || 'US',
        isPrimary: true,
      })
    }
  }

  const handleChange = (field: keyof EditFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
  const managerData = employee.manager as { id: string; user: { id: string; full_name: string; avatar_url: string | null } } | null
  const managerName = managerData?.user?.full_name

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
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={cancelEditing} disabled={updateEmployee.isPending}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateEmployee.isPending}>
              {updateEmployee.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={startEditing}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit Employee
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-charcoal-600" />
                </div>
                <CardTitle className="text-lg font-heading font-semibold">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className={isEditing ? 'space-y-4' : ''}>
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                        <Input
                          id="email"
                          value={employee.user?.email ?? ''}
                          disabled
                          className="pl-10 bg-charcoal-50"
                        />
                      </div>
                      <p className="text-xs text-charcoal-400">Email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <PhoneInput
                        label="Phone"
                        value={formData.phone}
                        onChange={(value) => setFormData((prev) => ({ ...prev, phone: value }))}
                      />
                    </div>
                  </div>

                  {/* Structured Address */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-charcoal-400" />
                      <Label>Address</Label>
                    </div>
                    <AddressForm
                      value={formData.address}
                      onChange={(data) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: { ...prev.address, ...data },
                        }))
                      }
                      showCounty
                      showAddressLine2
                    />
                  </div>
                </>
              ) : (
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
                  <div className="col-span-2">
                    <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </dt>
                    <dd className="mt-1 text-sm text-charcoal-900">
                      {primaryAddress ? formatAddress(primaryAddress) : '—'}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-charcoal-600" />
                </div>
                <CardTitle className="text-lg font-heading font-semibold">Employment Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className={isEditing ? 'space-y-4' : ''}>
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title *</Label>
                      <Input
                        id="jobTitle"
                        placeholder="Enter job title"
                        value={formData.jobTitle}
                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department *</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => handleChange('department', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="operations">Operations</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="employmentType">Employment Type *</Label>
                      <Select
                        value={formData.employmentType}
                        onValueChange={(value) => handleChange('employmentType', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fte">Full-Time</SelectItem>
                          <SelectItem value="part_time">Part-Time</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="intern">Intern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manager">Reports To</Label>
                      <Select
                        value={formData.managerId || undefined}
                        onValueChange={(value) => handleChange('managerId', value === 'none' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select manager (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">Start Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                        <Input
                          id="hireDate"
                          type="date"
                          className="pl-10"
                          value={formData.hireDate}
                          onChange={(e) => handleChange('hireDate', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="workMode">Work Location</Label>
                      <Select
                        value={formData.workMode || undefined}
                        onValueChange={(value) => handleChange('workMode', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_site">Headquarters</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => handleChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="onboarding">Onboarding</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              ) : (
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
                      <UserCog className="h-3 w-3" /> Reports To
                    </dt>
                    <dd className="mt-1 text-sm text-charcoal-900">{managerName || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Start Date
                    </dt>
                    <dd className="mt-1 text-sm text-charcoal-900">
                      {employee.hire_date ? format(new Date(employee.hire_date), 'MMM d, yyyy') : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">Work Location</dt>
                    <dd className="mt-1 text-sm text-charcoal-900">
                      {{ on_site: 'Headquarters', remote: 'Remote', hybrid: 'Hybrid' }[employee.work_mode as string] || employee.work_mode || '—'}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info */}
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
