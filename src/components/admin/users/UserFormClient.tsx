'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Role = {
  id: string
  code: string
  name: string
  display_name: string
  description?: string | null
  category: string
  hierarchy_level: number
  pod_type?: string | null
  color_code?: string | null
}

type Pod = {
  id: string
  name: string
  pod_type: string
  status: string
}

type Manager = {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
}

type Group = {
  id: string
  name: string
  code: string | null
  group_type: string
}

type PodMembership = {
  id: string
  pod_id: string
  role: string
  is_active: boolean
  pod?: Pod
}

type UserData = {
  id: string
  first_name?: string | null
  last_name?: string | null
  full_name: string
  email: string
  phone?: string | null
  role_id?: string | null
  manager_id?: string | null
  primary_group_id?: string | null
  status: string
  two_factor_enabled: boolean
  pod_memberships?: PodMembership[]
}

interface UserFormClientProps {
  mode: 'create' | 'edit'
  userId?: string
  initialData: {
    roles: Role[]
    pods: Pod[]
    managers: Manager[]
    groups: Group[]
    user?: UserData | null
  }
}

export function UserFormClient({ mode, userId, initialData }: UserFormClientProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState<string>('')
  const [podId, setPodId] = useState<string>('')
  const [podRole, setPodRole] = useState<'junior' | 'senior'>('junior')
  const [primaryGroupId, setPrimaryGroupId] = useState<string>('')
  const [managerId, setManagerId] = useState<string>('')
  const [authMethod, setAuthMethod] = useState<'invitation' | 'password'>('invitation')
  const [initialPassword, setInitialPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [requireTwoFactor, setRequireTwoFactor] = useState(false)

  // Touched state for validation feedback
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    role: false,
    pod: false,
    password: false,
  })

  // Success state for animation
  const [showSuccess, setShowSuccess] = useState(false)

  // Handle field blur to mark as touched
  const handleBlur = useCallback((field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  // Load existing user data for edit mode from server data
  useEffect(() => {
    if (mode === 'edit' && initialData.user) {
      const user = initialData.user
      // Try to split full_name if first/last name not available
      if (user.first_name && user.last_name) {
        setFirstName(user.first_name)
        setLastName(user.last_name)
      } else if (user.full_name) {
        const parts = user.full_name.split(' ')
        setFirstName(parts[0] || '')
        setLastName(parts.slice(1).join(' ') || '')
      }
      setEmail(user.email)
      setPhone(user.phone ?? '')
      setRoleId(user.role_id ?? '')
      setPrimaryGroupId(user.primary_group_id ?? 'none')
      setManagerId(user.manager_id ?? 'none')
      setRequireTwoFactor(user.two_factor_enabled ?? false)
      // Set pod and pod role from active membership
      const activePod = user.pod_memberships?.find((pm) => pm.is_active)
      setPodId(activePod?.pod_id ?? 'none')
      if (activePod?.role === 'senior') {
        setPodRole('senior')
      } else {
        setPodRole('junior')
      }
    }
  }, [mode, initialData.user])

  // Mutations
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      setShowSuccess(true)
      toast.success('User created successfully')
      utils.users.list.invalidate()
      // Brief pause to show success animation before redirect
      setTimeout(() => {
        router.push('/employee/admin/users')
      }, 600)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user')
    },
  })

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      setShowSuccess(true)
      toast.success('User updated successfully')
      utils.users.list.invalidate()
      utils.users.getById.invalidate({ id: userId! })
      // Brief pause to show success animation before redirect
      setTimeout(() => {
        router.push(`/employee/admin/users/${userId}`)
      }, 600)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })

  // Check if selected role requires a pod
  const selectedRole = initialData.roles.find((r) => r.id === roleId)
  const requiresPod = selectedRole?.category === 'pod_ic'

  // Validation errors (computed)
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {}

    if (!firstName.trim()) {
      errors.firstName = 'First name is required'
    }
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required'
    }
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address'
    }
    if (!roleId) {
      errors.role = 'Please select a role'
    }
    if (requiresPod && (!podId || podId === 'none')) {
      errors.pod = 'Please select a pod for this role'
    }
    if (mode === 'create' && authMethod === 'password' && initialPassword.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    return errors
  }, [firstName, lastName, email, roleId, requiresPod, podId, mode, authMethod, initialPassword])

  // Check if form is valid
  const isFormValid = Object.keys(validationErrors).length === 0

  // Mark all fields as touched on submit attempt
  const markAllTouched = useCallback(() => {
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      pod: true,
      password: true,
    })
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched to show validation errors
    markAllTouched()

    // Check validation
    if (!isFormValid) {
      // Show first error as toast
      const firstError = Object.values(validationErrors)[0]
      if (firstError) {
        toast.error(firstError)
      }
      return
    }

    if (mode === 'create') {
      createMutation.mutate({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        roleId,
        podId: podId && podId !== 'none' ? podId : undefined,
        podRole: podId && podId !== 'none' ? podRole : undefined,
        primaryGroupId: primaryGroupId && primaryGroupId !== 'none' ? primaryGroupId : undefined,
        managerId: managerId && managerId !== 'none' ? managerId : undefined,
        sendInvitation: authMethod === 'invitation',
        initialPassword: authMethod === 'password' ? initialPassword : undefined,
        requireTwoFactor,
      })
    } else {
      updateMutation.mutate({
        id: userId!,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        roleId,
        podId: podId && podId !== 'none' ? podId : null,
        podRole: podId && podId !== 'none' ? podRole : undefined,
        primaryGroupId: primaryGroupId && primaryGroupId !== 'none' ? primaryGroupId : null,
        managerId: managerId && managerId !== 'none' ? managerId : null,
      })
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users', href: '/employee/admin/users' },
    { label: mode === 'create' ? 'New User' : 'Edit User' },
  ]

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <AdminPageContent>
      <AdminPageHeader
        title={mode === 'create' ? 'Create New User' : 'Edit User'}
        description={mode === 'create' ? 'Add a new user to the organization' : 'Update user details'}
        breadcrumbs={breadcrumbs}
      />
      <form onSubmit={handleSubmit} className="max-w-2xl relative">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-success-600" />
              </div>
              <p className="text-lg font-semibold text-charcoal-900">
                {mode === 'create' ? 'User Created!' : 'Changes Saved!'}
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && !showSuccess && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-hublot-600" />
              <p className="text-sm text-charcoal-600">
                {mode === 'create' ? 'Creating user...' : 'Saving changes...'}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-6">
          {/* Basic Information */}
          <fieldset disabled={isLoading}>
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => handleBlur('firstName')}
                  placeholder="John"
                  maxLength={100}
                  className={cn(
                    touched.firstName && validationErrors.firstName && 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                  )}
                />
                {touched.firstName && validationErrors.firstName && (
                  <p className="text-xs text-error-500">{validationErrors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => handleBlur('lastName')}
                  placeholder="Doe"
                  maxLength={100}
                  className={cn(
                    touched.lastName && validationErrors.lastName && 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                  )}
                />
                {touched.lastName && validationErrors.lastName && (
                  <p className="text-xs text-error-500">{validationErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="john.doe@company.com"
                maxLength={255}
                disabled={mode === 'edit'}
                className={cn(
                  touched.email && validationErrors.email && 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                )}
              />
              {touched.email && validationErrors.email ? (
                <p className="text-xs text-error-500">{validationErrors.email}</p>
              ) : mode === 'edit' ? (
                <p className="text-xs text-charcoal-500">Email cannot be changed after creation</p>
              ) : null}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </fieldset>

          {/* Access */}
          <fieldset disabled={isLoading} className="border-t border-charcoal-100 pt-6">
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Access
            </h3>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={roleId}
                onValueChange={(v) => {
                  setRoleId(v)
                  handleBlur('role')
                }}
              >
                <SelectTrigger
                  className={cn(
                    touched.role && validationErrors.role && 'border-error-500 focus:border-error-500'
                  )}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {initialData.roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: role.color_code ?? undefined }}
                        />
                        <span>{role.display_name}</span>
                        <span className="text-charcoal-400 text-xs">({role.category})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.role && validationErrors.role ? (
                <p className="text-xs text-error-500">{validationErrors.role}</p>
              ) : selectedRole?.description ? (
                <p className="text-xs text-charcoal-500">{selectedRole.description}</p>
              ) : null}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="pod">
                Pod {requiresPod ? '*' : '(optional)'}
              </Label>
              <Select
                value={podId}
                onValueChange={(v) => {
                  setPodId(v)
                  handleBlur('pod')
                }}
              >
                <SelectTrigger
                  className={cn(
                    touched.pod && validationErrors.pod && 'border-error-500 focus:border-error-500'
                  )}
                >
                  <SelectValue placeholder={requiresPod ? 'Select a pod' : 'No pod (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Pod</SelectItem>
                  {initialData.pods.map((pod) => (
                    <SelectItem key={pod.id} value={pod.id}>
                      {pod.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {touched.pod && validationErrors.pod && (
                <p className="text-xs text-error-500">{validationErrors.pod}</p>
              )}
            </div>

            {/* Pod Role - shown when pod is selected */}
            {podId && podId !== 'none' && (
              <div className="space-y-2 mt-4 ml-4 pl-4 border-l-2 border-charcoal-100">
                <Label>Pod Role</Label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="podRole"
                      checked={podRole === 'junior'}
                      onChange={() => setPodRole('junior')}
                      className="w-4 h-4 text-hublot-600 focus:ring-gold-500"
                    />
                    <span className="text-sm text-charcoal-700">Junior</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="podRole"
                      checked={podRole === 'senior'}
                      onChange={() => setPodRole('senior')}
                      className="w-4 h-4 text-hublot-600 focus:ring-gold-500"
                    />
                    <span className="text-sm text-charcoal-700">Senior</span>
                  </label>
                </div>
                <p className="text-xs text-charcoal-500">
                  Senior members can mentor and lead within the pod
                </p>
              </div>
            )}

            <div className="space-y-2 mt-4">
              <Label htmlFor="group">Group (optional)</Label>
              <Select value={primaryGroupId} onValueChange={setPrimaryGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Group</SelectItem>
                  {initialData.groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                      {group.code && (
                        <span className="text-charcoal-400 text-xs ml-2">({group.code})</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="manager">Reports To (optional)</Label>
              <Select value={managerId} onValueChange={setManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Manager</SelectItem>
                  {initialData.managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </fieldset>

          {/* Authentication (Create mode only) */}
          {mode === 'create' && (
            <fieldset disabled={isLoading} className="border-t border-charcoal-100 pt-6">
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Authentication
              </h3>

              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="authMethod"
                      checked={authMethod === 'invitation'}
                      onChange={() => setAuthMethod('invitation')}
                      className="w-4 h-4 text-hublot-600 focus:ring-gold-500"
                    />
                    <div>
                      <p className="font-medium text-charcoal-900">Send invitation email</p>
                      <p className="text-sm text-charcoal-500">User will receive an email to set their password</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="authMethod"
                      checked={authMethod === 'password'}
                      onChange={() => setAuthMethod('password')}
                      className="w-4 h-4 text-hublot-600 focus:ring-gold-500"
                    />
                    <div>
                      <p className="font-medium text-charcoal-900">Set initial password</p>
                      <p className="text-sm text-charcoal-500">You will provide a temporary password</p>
                    </div>
                  </label>
                </div>

                {authMethod === 'password' && (
                  <div className="space-y-2 ml-7">
                    <Label htmlFor="password">Initial Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={initialPassword}
                        onChange={(e) => setInitialPassword(e.target.value)}
                        onBlur={() => handleBlur('password')}
                        placeholder="Minimum 8 characters"
                        minLength={8}
                        className={cn(
                          touched.password && validationErrors.password && 'border-error-500 focus:border-error-500 focus:ring-error-500/20'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {touched.password && validationErrors.password && (
                      <p className="text-xs text-error-500 mt-1">{validationErrors.password}</p>
                    )}
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireTwoFactor}
                    onChange={(e) => setRequireTwoFactor(e.target.checked)}
                    className="w-4 h-4 text-hublot-600 focus:ring-gold-500 rounded"
                  />
                  <div>
                    <p className="font-medium text-charcoal-900">Require two-factor authentication</p>
                    <p className="text-sm text-charcoal-500">User will be prompted to set up 2FA on first login</p>
                  </div>
                </label>
              </div>
            </fieldset>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-charcoal-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading || showSuccess}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-hublot-900 hover:bg-hublot-800 text-white disabled:opacity-50"
              disabled={isLoading || showSuccess}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </AdminPageContent>
  )
}
