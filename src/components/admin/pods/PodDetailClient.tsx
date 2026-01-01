'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import {
  Edit,
  Power,
  PowerOff,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { GroupDetailTabs } from '@/components/admin/groups/GroupDetailTabs'
import type { FullGroupData } from '@/types/admin'

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
  formed_date?: string | null
  dissolved_date?: string | null
  manager?: UserProfile | null
  region?: Region | null
  members?: PodMember[]
  sections: {
    metrics: {
      openJobs: number
      submissionsMtd: number
      placementsMtd: number
      revenueMtd: number
    }
    activity: {
      items: unknown[]
      total: number
    }
  }
}

interface PodDetailClientProps {
  data: PodData
}

/**
 * Pod Detail Client - Guidewire-style with tabbed layout
 * Uses GroupDetailTabs for 6-tab navigation (Basics, Users, Producer Codes, Queues, Regions)
 */
export function PodDetailClient({ data: pod }: PodDetailClientProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)

  const deactivateMutation = trpc.pods.deactivate.useMutation({
    onSuccess: () => {
      toast.success('Group deactivated')
      utils.pods.list.invalidate()
      utils.pods.listWithStats.invalidate()
      router.push('/employee/admin/pods')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to deactivate group')
    },
  })

  const reactivateMutation = trpc.pods.reactivate.useMutation({
    onSuccess: () => {
      toast.success('Group reactivated')
      utils.pods.getById.invalidate({ id: pod.id })
      utils.pods.getFullPod.invalidate({ id: pod.id })
      utils.pods.list.invalidate()
      utils.pods.listWithStats.invalidate()
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reactivate group')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Groups', href: '/employee/admin/pods' },
    { label: pod.name },
  ]

  const activeMembers = pod.members?.filter((m: PodMember) => m.is_active) ?? []

  // Transform PodData to FullGroupData for GroupDetailTabs
  const groupData: FullGroupData = {
    id: pod.id,
    name: pod.name,
    description: pod.description ?? undefined,
    pod_type: pod.pod_type,
    status: pod.status,
    formed_date: pod.formed_date ?? undefined,
    dissolved_date: pod.dissolved_date ?? undefined,
    region_id: pod.region_id ?? undefined,
    manager_id: pod.manager_id ?? undefined,
    created_at: '',
    updated_at: '',
    manager: pod.manager ? {
      id: pod.manager.id,
      full_name: pod.manager.full_name,
      email: pod.manager.email,
      avatar_url: pod.manager.avatar_url ?? undefined,
    } : null,
    region: pod.region ? {
      id: pod.region.id,
      name: pod.region.name,
      code: pod.region.code,
    } : null,
    members: (pod.members ?? []).map((m: PodMember) => ({
      id: m.id,
      user_id: m.user.id,
      role: m.role,
      is_active: m.is_active,
      joined_at: m.joined_at,
      user: {
        id: m.user.id,
        full_name: m.user.full_name,
        email: m.user.email,
        avatar_url: m.user.avatar_url ?? undefined,
      },
    })),
    queues: [],
    producerCodes: [],
    regions: pod.region ? [{
      id: pod.region.id,
      name: pod.region.name,
      code: pod.region.code,
    }] : [],
    sections: {
      metrics: {
        sprintMetrics: null,
        openJobs: pod.sections.metrics.openJobs,
        submissionsMtd: pod.sections.metrics.submissionsMtd,
        placementsMtd: pod.sections.metrics.placementsMtd,
        revenueMtd: pod.sections.metrics.revenueMtd,
      },
      activity: {
        items: pod.sections.activity.items as [],
        total: pod.sections.activity.total,
      },
    },
  }

  return (
    <DashboardShell
      title={pod.name}
      description={`${POD_TYPE_LABELS[pod.pod_type] ?? pod.pod_type} Group${pod.region ? ` - ${pod.region.name}` : ''}`}
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Link href="/employee/admin/pods">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Up to Groups
            </Button>
          </Link>
          {pod.status === 'active' ? (
            <>
              <Link href={`/employee/admin/pods/${pod.id}/edit`}>
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
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
              onClick={() => reactivateMutation.mutate({ id: pod.id })}
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
            This group is currently inactive. Reactivate it to resume operations.
          </p>
        </div>
      )}

      {/* Tabbed Content */}
      <GroupDetailTabs
        group={groupData}
        onMembersChange={() => {
          utils.pods.getFullPod.invalidate({ id: pod.id })
          router.refresh()
        }}
      />

      {/* Deactivate Confirmation Dialog */}
      {showDeactivateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Deactivate Group</h3>
            <p className="text-charcoal-600 mb-6">
              {activeMembers.length > 0
                ? `This group has ${activeMembers.length} active member(s). You'll need to remove them before deactivating.`
                : 'Are you sure you want to deactivate this group? It can be reactivated later.'}
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
                  deactivateMutation.mutate({ id: pod.id })
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
