'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Users, MoreHorizontal, Edit, Eye } from 'lucide-react'
import Link from 'next/link'

const POD_TYPE_LABELS: Record<string, string> = {
  recruiting: 'Recruiting',
  bench_sales: 'Bench Sales',
  ta: 'TA',
  hr: 'HR',
  mixed: 'Mixed',
}

const POD_TYPE_COLORS: Record<string, string> = {
  recruiting: 'bg-blue-100 text-blue-800',
  bench_sales: 'bg-purple-100 text-purple-800',
  ta: 'bg-cyan-100 text-cyan-800',
  hr: 'bg-pink-100 text-pink-800',
  mixed: 'bg-gray-100 text-gray-800',
}

type PodMember = {
  id: string
  is_active: boolean
  user: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  role: string
}

type Pod = {
  id: string
  name: string
  pod_type: string
  status: string
  manager?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  }
  region?: {
    id: string
    name: string
    code: string
  }
  members?: PodMember[]
}

export function PodsListPage() {
  const [search, setSearch] = useState('')
  const [podType, setPodType] = useState<string>('')
  const [status, setStatus] = useState<string>('active')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const podsQuery = trpc.pods.list.useQuery({
    search: search || undefined,
    podType: podType && podType !== 'all' ? podType as 'recruiting' | 'bench_sales' | 'ta' | 'hr' | 'mixed' : undefined,
    status: status && status !== 'all' ? status as 'active' | 'inactive' : undefined,
    page,
    pageSize: 20,
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Pods' },
  ]

  return (
    <DashboardShell
      title="Pods"
      description="Manage organizational pods and team structures"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/pods/new">
          <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Pod
          </Button>
        </Link>
      }
    >
      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search pods..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={podType} onValueChange={setPodType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="recruiting">Recruiting</SelectItem>
              <SelectItem value="bench_sales">Bench Sales</SelectItem>
              <SelectItem value="ta">TA</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {podsQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : podsQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load pods. Please try again.
            </div>
          ) : podsQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Users className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No pods found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || (podType && podType !== 'all') ? 'Try adjusting your filters' : 'Get started by creating your first pod'}
              </p>
              {!search && (!podType || podType === 'all') && (
                <Link href="/employee/admin/pods/new">
                  <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Pod
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Pod Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Manager</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Region</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {podsQuery.data?.items.map((pod: Pod) => (
                  <tr key={pod.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/employee/admin/pods/${pod.id}`}
                        className="font-medium text-charcoal-900 hover:text-gold-600"
                      >
                        {pod.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      {pod.manager ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium text-sm">
                            {pod.manager.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-charcoal-700">{pod.manager.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-400">No manager</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-charcoal-600">
                        <Users className="w-4 h-4 text-charcoal-400" />
                        <span>{pod.members?.filter((m: PodMember) => m.is_active).length ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${POD_TYPE_COLORS[pod.pod_type] ?? 'bg-gray-100 text-gray-800'}`}>
                        {POD_TYPE_LABELS[pod.pod_type] ?? pod.pod_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">
                      {pod.region?.name ?? '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pod.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}>
                        {pod.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === pod.id ? null : pod.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === pod.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/pods/${pod.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                              <Link
                                href={`/employee/admin/pods/${pod.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Pod
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {podsQuery.data && podsQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, podsQuery.data.pagination.total)} of {podsQuery.data.pagination.total} pods
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= podsQuery.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}
