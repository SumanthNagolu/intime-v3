'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
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
import { X, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface PodFormPageProps {
  mode: 'create' | 'edit'
  podId?: string
}

type UserProfile = {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  role_id?: string
}

type PodMember = {
  id: string
  is_active: boolean
  user: UserProfile
  role: string
  joined_at?: string
}

type PodData = {
  id: string
  name: string
  description?: string | null
  pod_type: string
  region_id?: string | null
  manager_id?: string | null
  sprint_duration_weeks?: number | null
  placements_per_sprint_target?: number | null
  manager?: UserProfile | null
  members?: PodMember[]
}

export function PodFormPage({ mode, podId }: PodFormPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [podType, setPodType] = useState<string>('recruiting')
  const [regionId, setRegionId] = useState<string>('')
  const [managerId, setManagerId] = useState<string>('')
  const [selectedMembers, setSelectedMembers] = useState<UserProfile[]>([])
  const [sprintDurationWeeks, setSprintDurationWeeks] = useState(2)
  const [placementsTarget, setPlacementsTarget] = useState(2)
  const [userSearch, setUserSearch] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Queries
  const podQuery = trpc.pods.getById.useQuery(
    { id: podId! },
    { enabled: mode === 'edit' && !!podId }
  )
  const regionsQuery = trpc.pods.getRegions.useQuery()
  const usersQuery = trpc.pods.getAvailableUsers.useQuery({
    search: userSearch || undefined,
  })

  // Mutations
  const createMutation = trpc.pods.create.useMutation({
    onSuccess: () => {
      toast.success('Pod created successfully')
      utils.pods.list.invalidate()
      router.push('/employee/admin/pods')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create pod')
    },
  })

  const updateMutation = trpc.pods.update.useMutation({
    onSuccess: () => {
      toast.success('Pod updated successfully')
      utils.pods.list.invalidate()
      utils.pods.getById.invalidate({ id: podId! })
      router.push(`/employee/admin/pods/${podId}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update pod')
    },
  })

  // Load existing pod data for edit mode
  useEffect(() => {
    if (mode === 'edit' && podQuery.data) {
      const pod = podQuery.data as PodData
      setName(pod.name)
      setDescription(pod.description ?? '')
      setPodType(pod.pod_type)
      setRegionId(pod.region_id ?? '')
      setManagerId(pod.manager_id ?? '')
      setSprintDurationWeeks(pod.sprint_duration_weeks ?? 2)
      setPlacementsTarget(pod.placements_per_sprint_target ?? 2)
      // Set existing members
      if (pod.members) {
        setSelectedMembers(
          pod.members
            .filter((m: PodMember) => m.is_active)
            .map((m: PodMember) => m.user)
        )
      }
    }
  }, [mode, podQuery.data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Pod name is required')
      return
    }
    if (!managerId) {
      toast.error('Please select a pod manager')
      return
    }

    if (mode === 'create') {
      createMutation.mutate({
        name: name.trim(),
        description: description.trim() || undefined,
        podType: podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed',
        regionId: regionId || undefined,
        managerId,
        memberIds: selectedMembers.map(m => m.id),
        sprintDurationWeeks,
        placementsPerSprintTarget: placementsTarget,
      })
    } else {
      updateMutation.mutate({
        id: podId!,
        name: name.trim(),
        description: description.trim() || undefined,
        podType: podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed',
        regionId: regionId || null,
        managerId,
        sprintDurationWeeks,
        placementsPerSprintTarget: placementsTarget,
      })
    }
  }

  const addMember = (user: UserProfile) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user])
    }
    setUserSearch('')
    setShowUserDropdown(false)
  }

  const removeMember = (userId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId))
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Pods', href: '/employee/admin/pods' },
    { label: mode === 'create' ? 'New Pod' : 'Edit Pod' },
  ]

  const isLoading = createMutation.isPending || updateMutation.isPending

  if (mode === 'edit' && podQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
        </div>
      </DashboardShell>
    )
  }

  const availableUsers = usersQuery.data?.filter(
    (u: UserProfile) => !selectedMembers.find(m => m.id === u.id) && u.id !== managerId
  ) ?? []

  return (
    <DashboardShell
      title={mode === 'create' ? 'Create New Pod' : 'Edit Pod'}
      description={mode === 'create' ? 'Set up a new organizational pod' : 'Update pod details'}
      breadcrumbs={breadcrumbs}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-xl border border-charcoal-100 p-6 space-y-6">
          {/* Pod Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Pod Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Recruiting Alpha"
              maxLength={100}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this pod's focus..."
              rows={3}
            />
          </div>

          {/* Pod Type */}
          <div className="space-y-2">
            <Label htmlFor="podType">Pod Type *</Label>
            <Select value={podType} onValueChange={setPodType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recruiting">Recruiting</SelectItem>
                <SelectItem value="bench_sales">Bench Sales</SelectItem>
                <SelectItem value="ta">TA</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={regionId} onValueChange={setRegionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select region (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Region</SelectItem>
                {regionsQuery.data?.map((region: { id: string; name: string; code: string }) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Pod Manager */}
          <div className="space-y-2">
            <Label htmlFor="manager">Pod Manager *</Label>
            <Select value={managerId} onValueChange={setManagerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {usersQuery.data?.map((user: UserProfile) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-medium text-xs">
                        {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {user.full_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Initial Members (Create mode only) */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label>Initial Members (Optional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value)
                    setShowUserDropdown(true)
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  placeholder="Search and add users..."
                  className="pl-10"
                />
                {showUserDropdown && userSearch && availableUsers.length > 0 && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserDropdown(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto bg-white border border-charcoal-200 rounded-lg shadow-lg">
                      {availableUsers.map((user: UserProfile) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => addMember(user)}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-charcoal-50 text-left"
                        >
                          <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-medium text-xs">
                            {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{user.full_name}</div>
                            <div className="text-xs text-charcoal-500">{user.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMembers.map(member => (
                    <span
                      key={member.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-charcoal-100 text-charcoal-700 rounded-full text-sm"
                    >
                      {member.full_name}
                      <button
                        type="button"
                        onClick={() => removeMember(member.id)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sprint Configuration */}
          <div className="border-t border-charcoal-100 pt-6 space-y-4">
            <h3 className="font-semibold text-charcoal-900">Sprint Configuration</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sprintDuration">Sprint Duration (weeks)</Label>
                <Select
                  value={sprintDurationWeeks.toString()}
                  onValueChange={(v) => setSprintDurationWeeks(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 week</SelectItem>
                    <SelectItem value="2">2 weeks</SelectItem>
                    <SelectItem value="3">3 weeks</SelectItem>
                    <SelectItem value="4">4 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placementsTarget">Placements Target</Label>
                <Input
                  id="placementsTarget"
                  type="number"
                  min={0}
                  max={99}
                  value={placementsTarget}
                  onChange={(e) => setPlacementsTarget(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
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
              {mode === 'create' ? 'Create Pod' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </DashboardShell>
  )
}
