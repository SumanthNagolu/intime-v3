'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
  DashboardGrid,
} from '@/components/dashboard/DashboardShell'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import {
  Edit,
  UserPlus,
  UserMinus,
  Power,
  PowerOff,
  Loader2,
  Briefcase,
  FileText,
  Target,
  DollarSign,
  Crown,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { AddMembersDialog } from './AddMembersDialog'

interface PodDetailPageProps {
  podId: string
}

const POD_TYPE_LABELS: Record<string, string> = {
  recruiting: 'Recruiting',
  bench_sales: 'Bench Sales',
  ta: 'TA',
  hr: 'HR',
  mixed: 'Mixed',
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

type Region = {
  id: string
  name: string
  code: string
}

type PodData = {
  id: string
  name: string
  description?: string | null
  pod_type: string
  status: string
  region_id?: string | null
  manager_id?: string | null
  sprint_duration_weeks?: number | null
  placements_per_sprint_target?: number | null
  sprint_start_day?: string | null
  manager?: UserProfile | null
  region?: Region | null
  members?: PodMember[]
}

export function PodDetailPage({ podId }: PodDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [showAddMembers, setShowAddMembers] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  const podQuery = trpc.pods.getById.useQuery({ id: podId })
  const metricsQuery = trpc.pods.getMetrics.useQuery({ podId, period: 'mtd' })

  const removeMemberMutation = trpc.pods.removeMembers.useMutation({
    onSuccess: () => {
      toast.success('Member removed')
      utils.pods.getById.invalidate({ id: podId })
      setMemberToRemove(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const deactivateMutation = trpc.pods.deactivate.useMutation({
    onSuccess: () => {
      toast.success('Pod deactivated')
      utils.pods.list.invalidate()
      router.push('/employee/admin/pods')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to deactivate pod')
    },
  })

  const reactivateMutation = trpc.pods.reactivate.useMutation({
    onSuccess: () => {
      toast.success('Pod reactivated')
      utils.pods.getById.invalidate({ id: podId })
      utils.pods.list.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reactivate pod')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Pods', href: '/employee/admin/pods' },
    { label: (podQuery.data as PodData)?.name ?? 'Pod Details' },
  ]

  if (podQuery.isLoading) {
    return (
      <DashboardShell title="Loading..." breadcrumbs={breadcrumbs}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
        </div>
      </DashboardShell>
    )
  }

  if (podQuery.error || !podQuery.data) {
    return (
      <DashboardShell title="Error" breadcrumbs={breadcrumbs}>
        <div className="text-center py-12">
          <p className="text-red-600">Pod not found or failed to load.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/employee/admin/pods')}
          >
            Back to Pods
          </Button>
        </div>
      </DashboardShell>
    )
  }

  const pod = podQuery.data as PodData
  const activeMembers = pod.members?.filter((m: PodMember) => m.is_active) ?? []

  return (
    <DashboardShell
      title={pod.name}
      description={`${POD_TYPE_LABELS[pod.pod_type] ?? pod.pod_type} Pod${pod.region ? ` • ${pod.region.name}` : ''}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          {pod.status === 'active' ? (
            <>
              <Link href={`/employee/admin/pods/${podId}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => setShowDeactivateDialog(true)}
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            </>
          ) : (
            <Button
              className="bg-forest-600 hover:bg-forest-700 text-white"
              onClick={() => reactivateMutation.mutate({ id: podId })}
              disabled={reactivateMutation.isPending}
            >
              {reactivateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Power className="w-4 h-4 mr-2" />
              Reactivate
            </Button>
          )}
        </div>
      }
    >
      {/* Status Banner for Inactive */}
      {pod.status === 'inactive' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-amber-800 font-medium">
            This pod is currently inactive. Reactivate it to resume operations.
          </p>
        </div>
      )}

      {/* Pod Metrics */}
      <DashboardSection title="Pod Metrics">
        <DashboardGrid columns={4}>
          <StatsCard
            title="Open Jobs"
            value={metricsQuery.data?.openJobs ?? 0}
            icon={Briefcase}
          />
          <StatsCard
            title="Submissions (MTD)"
            value={metricsQuery.data?.submissionsMtd ?? 0}
            icon={FileText}
          />
          <StatsCard
            title="Placements (MTD)"
            value={metricsQuery.data?.placementsMtd ?? 0}
            icon={Target}
            variant="success"
          />
          <StatsCard
            title="Revenue (MTD)"
            value={`$${(metricsQuery.data?.revenueMtd ?? 0).toLocaleString()}`}
            icon={DollarSign}
          />
        </DashboardGrid>
      </DashboardSection>

      {/* Members Section */}
      <DashboardSection
        title={`Members (${activeMembers.length})`}
        action={
          pod.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddMembers(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Members
            </Button>
          )
        }
      >
        <div className="bg-white rounded-xl border border-charcoal-100 divide-y divide-charcoal-100">
          {/* Manager */}
          {pod.manager && (
            <div className="p-4 flex items-center justify-between bg-forest-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center text-forest-700 font-medium">
                  {pod.manager.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-charcoal-900">
                      {pod.manager.full_name}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-forest-100 text-forest-800 rounded-full text-xs font-medium">
                      <Crown className="w-3 h-3" />
                      Manager
                    </span>
                  </div>
                  <span className="text-sm text-charcoal-500">{pod.manager.email}</span>
                </div>
              </div>
            </div>
          )}

          {/* Members */}
          {activeMembers.length === 0 ? (
            <div className="p-8 text-center text-charcoal-500">
              No members assigned to this pod yet.
            </div>
          ) : (
            activeMembers.map((member: PodMember) => (
              <div key={member.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-700 font-medium">
                    {member.user.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-900">
                        {member.user.full_name}
                      </span>
                      <span className="inline-flex px-2 py-0.5 bg-charcoal-100 text-charcoal-600 rounded-full text-xs font-medium">
                        {member.role === 'senior' ? 'Senior' : 'Junior'}
                      </span>
                    </div>
                    <span className="text-sm text-charcoal-500">
                      {member.user.email}
                      {member.joined_at && ` • Joined ${new Date(member.joined_at).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
                {pod.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-charcoal-400 hover:text-red-600"
                    onClick={() => setMemberToRemove(member.user.id)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </DashboardSection>

      {/* Sprint Configuration Section */}
      <DashboardSection title="Sprint Configuration">
        <div className="bg-white rounded-xl border border-charcoal-100 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-charcoal-500">Sprint Duration</p>
              <p className="font-semibold">{pod.sprint_duration_weeks ?? 2} weeks</p>
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Placements Target</p>
              <p className="font-semibold">{pod.placements_per_sprint_target ?? 2} per sprint</p>
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Sprint Start Day</p>
              <p className="font-semibold capitalize">{pod.sprint_start_day ?? 'Monday'}</p>
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Status</p>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                pod.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-charcoal-100 text-charcoal-600'
              }`}>
                {pod.status}
              </span>
            </div>
          </div>
        </div>
      </DashboardSection>

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={showAddMembers}
        onOpenChange={setShowAddMembers}
        podId={podId}
        existingMemberIds={activeMembers.map((m: PodMember) => m.user.id)}
      />

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Remove Member</h3>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to remove this member from the pod? They can be added back later.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMemberToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (memberToRemove) {
                    removeMemberMutation.mutate({
                      podId,
                      userIds: [memberToRemove],
                    })
                  }
                }}
                disabled={removeMemberMutation.isPending}
              >
                {removeMemberMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      {showDeactivateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Deactivate Pod</h3>
            <p className="text-charcoal-600 mb-6">
              {activeMembers.length > 0
                ? `This pod has ${activeMembers.length} active member(s). You'll need to remove them before deactivating.`
                : 'Are you sure you want to deactivate this pod? It can be reactivated later.'}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeactivateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={activeMembers.length > 0 || deactivateMutation.isPending}
                onClick={() => {
                  deactivateMutation.mutate({ id: podId })
                }}
              >
                {deactivateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Deactivate
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
