'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RoleFormPageProps {
  mode: 'create' | 'edit'
  roleId?: string
}

const CATEGORY_OPTIONS = [
  { value: 'pod_ic', label: 'Pod IC', description: 'Individual contributors in pods' },
  { value: 'pod_manager', label: 'Pod Manager', description: 'Managers of pod teams' },
  { value: 'leadership', label: 'Leadership', description: 'Directors and senior leaders' },
  { value: 'executive', label: 'Executive', description: 'C-level executives' },
  { value: 'portal', label: 'Portal', description: 'External users (clients, talent)' },
  { value: 'admin', label: 'Admin', description: 'System administrators' },
]

const COLOR_OPTIONS = [
  { value: '#6366f1', label: 'Indigo' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#14b8a6', label: 'Teal' },
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#3b82f6', label: 'Blue' },
]

type RoleData = {
  id: string
  code: string
  name: string
  display_name: string
  description?: string
  category: string
  hierarchy_level: number
  color_code?: string
  icon_name?: string
  pod_type?: string
  is_system_role: boolean
}

export function RoleFormPage({ mode, roleId }: RoleFormPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('pod_ic')
  const [hierarchyLevel, setHierarchyLevel] = useState(0)
  const [colorCode, setColorCode] = useState('#6366f1')
  const [podType, setPodType] = useState<string>('')

  // Queries
  const roleQuery = trpc.permissions.getRoleById.useQuery(
    { id: roleId! },
    { enabled: mode === 'edit' && !!roleId }
  )

  // Mutations
  const createMutation = trpc.permissions.createRole.useMutation({
    onSuccess: (data) => {
      toast.success('Role created successfully')
      utils.permissions.listRoles.invalidate()
      utils.permissions.getRoleStats.invalidate()
      router.push(`/employee/admin/roles/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create role')
    },
  })

  const updateMutation = trpc.permissions.updateRole.useMutation({
    onSuccess: () => {
      toast.success('Role updated successfully')
      utils.permissions.listRoles.invalidate()
      utils.permissions.getRoleById.invalidate({ id: roleId! })
      router.push(`/employee/admin/roles/${roleId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update role')
    },
  })

  // Load existing role data for edit mode
  useEffect(() => {
    if (mode === 'edit' && roleQuery.data) {
      const role = roleQuery.data as RoleData
      setCode(role.code)
      setName(role.name)
      setDisplayName(role.display_name)
      setDescription(role.description ?? '')
      setCategory(role.category)
      setHierarchyLevel(role.hierarchy_level)
      setColorCode(role.color_code ?? '#6366f1')
      setPodType(role.pod_type ?? '')
    }
  }, [mode, roleQuery.data])

  // Auto-generate code from name
  const handleNameChange = (value: string) => {
    setName(value)
    if (mode === 'create' && !code) {
      setCode(value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''))
    }
    if (!displayName) {
      setDisplayName(value)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error('Role code is required')
      return
    }
    if (!name.trim()) {
      toast.error('Role name is required')
      return
    }
    if (!displayName.trim()) {
      toast.error('Display name is required')
      return
    }
    if (!category) {
      toast.error('Please select a category')
      return
    }

    if (mode === 'create') {
      createMutation.mutate({
        code: code.trim().toLowerCase(),
        name: name.trim(),
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        category: category as 'pod_ic' | 'pod_manager' | 'leadership' | 'executive' | 'portal' | 'admin',
        hierarchyLevel,
        colorCode,
        podType: podType && podType !== 'none' ? podType as 'recruiting' | 'bench_sales' | 'ta' : null,
      })
    } else {
      updateMutation.mutate({
        id: roleId!,
        displayName: displayName.trim(),
        description: description.trim() || undefined,
        hierarchyLevel,
        colorCode,
      })
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Roles', href: '/employee/admin/roles' },
    { label: mode === 'create' ? 'New Role' : 'Edit Role' },
  ]

  const isLoading = createMutation.isPending || updateMutation.isPending
  const isSystemRole = roleQuery.data?.is_system_role

  if (mode === 'edit' && roleQuery.isLoading) {
    return (
      <AdminPageContent>
        <AdminPageHeader title="Loading..." breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-hublot-600" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent>
      <AdminPageHeader
        title={mode === 'create' ? 'Create New Role' : 'Edit Role'}
        description={mode === 'create' ? 'Define a new role with specific permissions' : 'Update role details'}
        breadcrumbs={breadcrumbs}
      />
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Basic Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Senior Recruiter"
                  maxLength={100}
                  required
                  disabled={mode === 'edit'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Role Code *</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g., senior_recruiter"
                  maxLength={50}
                  required
                  disabled={mode === 'edit'}
                />
                <p className="text-xs text-charcoal-500">
                  Unique identifier, lowercase letters, numbers, and underscores only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Senior Recruiter"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this role can do..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Category & Hierarchy */}
          <div className="border-t border-charcoal-100 pt-6">
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Category & Hierarchy
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} disabled={mode === 'edit'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div>
                          <span>{opt.label}</span>
                          <span className="text-charcoal-400 text-xs ml-2">({opt.description})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hierarchyLevel">Hierarchy Level</Label>
                <Select value={String(hierarchyLevel)} onValueChange={(v) => setHierarchyLevel(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0 - Individual Contributor</SelectItem>
                    <SelectItem value="1">1 - Team Lead</SelectItem>
                    <SelectItem value="2">2 - Manager</SelectItem>
                    <SelectItem value="3">3 - Director</SelectItem>
                    <SelectItem value="4">4 - VP</SelectItem>
                    <SelectItem value="5">5 - C-Level / Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-charcoal-500">
                  Higher levels inherit permissions from lower levels
                </p>
              </div>

              {(category === 'pod_ic' || category === 'pod_manager') && mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="podType">Pod Type (optional)</Label>
                  <Select value={podType} onValueChange={setPodType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any pod type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Any Pod Type</SelectItem>
                      <SelectItem value="recruiting">Recruiting</SelectItem>
                      <SelectItem value="bench_sales">Bench Sales</SelectItem>
                      <SelectItem value="ta">Talent Acquisition</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-charcoal-500">
                    Restrict this role to users in a specific pod type
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Appearance */}
          <div className="border-t border-charcoal-100 pt-6">
            <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
              Appearance
            </h3>

            <div className="space-y-2">
              <Label>Role Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setColorCode(color.value)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      colorCode === color.value ? 'ring-2 ring-offset-2 ring-charcoal-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* System Role Warning */}
          {isSystemRole && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> This is a system role. Only display name, description, hierarchy level, and color can be modified.
              </p>
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
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Create Role' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </AdminPageContent>
  )
}
