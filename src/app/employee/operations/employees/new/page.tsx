'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Building2, Calendar, Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  jobTitle: string
  department: string
  employmentType: string
  managerId: string
  hireDate: string
  location: string
  workMode: string
}

export default function NewEmployeePage() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    jobTitle: '',
    department: '',
    employmentType: '',
    managerId: '',
    hireDate: '',
    location: '',
    workMode: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const createEmployee = trpc.hr.employees.create.useMutation({
    onSuccess: () => {
      toast.success('Employee created successfully')
      router.push('/employee/operations/employees')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create employee')
      setIsSubmitting(false)
    },
  })

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.firstName) {
      toast.error('First name is required')
      return
    }
    if (!formData.lastName) {
      toast.error('Last name is required')
      return
    }
    if (!formData.email) {
      toast.error('Email is required')
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
    if (!formData.employmentType) {
      toast.error('Employment type is required')
      return
    }
    if (!formData.hireDate) {
      toast.error('Start date is required')
      return
    }

    setIsSubmitting(true)
    createEmployee.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone || undefined,
      jobTitle: formData.jobTitle,
      department: formData.department,
      employmentType: formData.employmentType as 'fte' | 'contractor' | 'intern' | 'part_time',
      managerId: formData.managerId || undefined,
      hireDate: formData.hireDate,
      location: formData.location || undefined,
      workMode: formData.workMode ? (formData.workMode as 'onsite' | 'remote' | 'hybrid') : undefined,
    })
  }

  return (
    <div className="min-h-screen bg-cream p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-h3 font-heading font-semibold text-charcoal-900">
            Add New Employee
          </h1>
          <p className="text-body-sm text-charcoal-500 mt-1">
            Create a new employee record
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
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
            <CardContent className="space-y-4">
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
                      type="email"
                      placeholder="email@company.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                    <Input
                      id="phone"
                      placeholder="+1 (555) 000-0000"
                      className="pl-10"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                  <Input
                    id="address"
                    placeholder="Street address, city, state, zip"
                    className="pl-10"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-lg font-heading font-semibold">Employment Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                    <Input
                      id="startDate"
                      type="date"
                      className="pl-10"
                      value={formData.hireDate}
                      onChange={(e) => handleChange('hireDate', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Work Location</Label>
                  <Select
                    value={formData.workMode || undefined}
                    onValueChange={(value) => handleChange('workMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Headquarters</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || createEmployee.isPending}
              >
                {(isSubmitting || createEmployee.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Employee
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.back()}>
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Onboarding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-heading font-semibold">Onboarding Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Onboarding Template</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Onboarding</SelectItem>
                    <SelectItem value="engineering">Engineering Onboarding</SelectItem>
                    <SelectItem value="sales">Sales Onboarding</SelectItem>
                    <SelectItem value="executive">Executive Onboarding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="sendWelcome" className="rounded border-charcoal-300" />
                <Label htmlFor="sendWelcome" className="text-body-sm">Send welcome email</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="startOnboarding" className="rounded border-charcoal-300" defaultChecked />
                <Label htmlFor="startOnboarding" className="text-body-sm">Start onboarding immediately</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
