'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
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
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface UserFormPageProps {
  mode: 'create' | 'edit'
  userId?: string
}

type Role = {
  id: string
  code: string
  name: string
  display_name: string
  description?: string
  category: string
  hierarchy_level: number
  pod_type?: string
  color_code?: string
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

type PodMembership = {
  id: string
  pod_id: string
  role: string
  is_active: boolean
  pod?: Pod
}

type UserData = {
  id: string
  first_name?: string
  last_name?: string
  full_name: string
  email: string
  phone?: string
  role_id?: string
  manager_id?: string
  status: string
  two_factor_enabled: boolean
  pod_memberships?: PodMembership[]
}

export function UserFormPage({ mode, userId }: UserFormPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [roleId, setRoleId] = useState<string>('')
  const [podId, setPodId] = useState<string>('')
  const [managerId, setManagerId] = useState<string>('')
  const [authMethod, setAuthMethod] = useState<'invitation' | 'password'>('invitation')
  const [initialPassword, setInitialPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [requireTwoFactor, setRequireTwoFactor] = useState(false)

  // Queries
  const userQuery = trpc.users.getById.useQuery(
    { id: userId! },
    { enabled: mode === 'edit' && !!userId }
  )
  const rolesQuery = trpc.users.getRoles.useQuery()
  const podsQuery = trpc.users.getPods.useQuery()
  const managersQuery = trpc.users.getAvailableManagers.useQuery({})

  // Mutations
  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success('User created successfully')
      utils.users.list.invalidate()
      router.push('/employee/admin/users')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user')
    },
  })

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success('User updated successfully')
      utils.users.list.invalidate()
      utils.users.getById.invalidate({ id: userId! })
      router.push(`/employee/admin/users/${userId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user')
    },
  })

  // Load existing user data for edit mode
  useEffect(() => {
    if (mode === 'edit' && userQuery.data) {
      const user = userQuery.data as UserData
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
      setManagerId(user.manager_id ?? 'none')
      setRequireTwoFactor(user.two_factor_enabled ?? false)
      // Set pod from active membership
      const activePod = user.pod_memberships?.find((pm) => pm.is_active)
      setPodId(activePod?.pod_id ?? 'none')
    }
  }, [mode, userQuery.data])

  // Check if selected role requires a pod
  const selectedRole = rolesQuery.data?.find((r: Role) => r.id === roleId)
  const requiresPod = selectedRole?.category === 'pod_ic'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim()) {
      toast.error('First name is required')
      return
    }
    if (!lastName.trim()) {
      toast.error('Last name is required')
      return
    }
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!roleId) {
      toast.error('Please select a role')
      return
    }
    if (requiresPod && (!podId || podId === 'none')) {
      toast.error('Please select a pod for this role')
      return
    }
    if (mode === 'create' && authMethod === 'password' && initialPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
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

  if (mode === 'edit' && userQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      title={mode === 'create' ? 'Create New User' : 'Edit User'}
      description={mode === 'create' ? 'Add a new user to the organization' : 'Update user details'}
      breadcrumbs={breadcrumbs}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-6">
          {/* Basic Information */}
          <div>
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
                  placeholder="John"
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@company.com"
                maxLength={255}
                required
                disabled={mode === 'edit'}
              />
              {mode === 'edit' && (
                <p className="text-xs text-charcoal-500">Email cannot be changed after creation</p>
              )}
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
          </div>

          {/* Access */}
          <div className="border-t border-charcoal-100 pt-6">
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Access
            </h3>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={roleId} onValueChange={setRoleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {rolesQuery.data?.map((role: Role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: role.color_code }}
                        />
                        <span>{role.display_name}</span>
                        <span className="text-charcoal-400 text-xs">({role.category})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole?.description && (
                <p className="text-xs text-charcoal-500">{selectedRole.description}</p>
              )}
            </div>

            <div className="space-y-2 mt-4">
              <Label htmlFor="pod">
                Pod {requiresPod ? '*' : '(optional)'}
              </Label>
              <Select value={podId} onValueChange={setPodId}>
                <SelectTrigger>
                  <SelectValue placeholder={requiresPod ? 'Select a pod' : 'No pod (optional)'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Pod</SelectItem>
                  {podsQuery.data?.map((pod: Pod) => (
                    <SelectItem key={pod.id} value={pod.id}>
                      {pod.name}
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
                  {managersQuery.data?.map((manager: Manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Authentication (Create mode only) */}
          {mode === 'create' && (
            <div className="border-t border-charcoal-100 pt-6">
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
                      className="w-4 h-4 text-forest-600 focus:ring-forest-500"
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
                      className="w-4 h-4 text-forest-600 focus:ring-forest-500"
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
                        placeholder="Minimum 8 characters"
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireTwoFactor}
                    onChange={(e) => setRequireTwoFactor(e.target.checked)}
                    className="w-4 h-4 text-forest-600 focus:ring-forest-500 rounded"
                  />
                  <div>
                    <p className="font-medium text-charcoal-900">Require two-factor authentication</p>
                    <p className="text-sm text-charcoal-500">User will be prompted to set up 2FA on first login</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-charcoal-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-forest-600 hover:bg-forest-700 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardShell>
  )
}
