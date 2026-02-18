'use client'

import React, { useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  User,
  Loader2,
  Filter,
  ChevronDown,
  GraduationCap,
  Send,
} from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { cn } from '@/lib/utils'

type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

const STATUS_CONFIG: Record<RequestStatus, { label: string; icon: React.ElementType; bg: string; text: string; dot: string }> = {
  pending: { label: 'Pending', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'Approved', icon: CheckCircle2, bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  rejected: { label: 'Rejected', icon: XCircle, bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
}

export default function EnrollmentsAdminPage() {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(undefined)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const utils = trpc.useUtils()

  const { data, isLoading } = trpc.academy.admin.getEnrollmentRequests.useQuery({
    status: statusFilter,
    limit: 50,
  })

  const approveMutation = trpc.academy.admin.approveEnrollmentRequest.useMutation({
    onSuccess: () => {
      utils.academy.admin.getEnrollmentRequests.invalidate()
    },
  })

  const rejectMutation = trpc.academy.admin.rejectEnrollmentRequest.useMutation({
    onSuccess: () => {
      utils.academy.admin.getEnrollmentRequests.invalidate()
      setRejectingId(null)
      setRejectReason('')
    },
  })

  const requests = data?.requests || []
  const total = data?.total || 0

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <GraduationCap size={24} className="text-charcoal-400" />
            <h1 className="font-heading font-bold text-2xl text-charcoal-900">
              Enrollment Requests
            </h1>
          </div>
          <p className="text-sm text-charcoal-500">
            Review and manage student enrollment applications ({total} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
          <Filter size={12} />
          <span className="font-bold uppercase tracking-wider">Status:</span>
        </div>
        {[
          { value: undefined, label: 'All' },
          { value: 'pending' as const, label: 'Pending' },
          { value: 'approved' as const, label: 'Approved' },
          { value: 'rejected' as const, label: 'Rejected' },
        ].map((filter) => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors',
              statusFilter === filter.value
                ? 'bg-charcoal-900 text-white'
                : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-charcoal-400" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="text-center py-20 rounded-xl border border-charcoal-200/60 bg-white">
          <GraduationCap size={40} className="mx-auto mb-4 text-charcoal-300" />
          <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
            No Enrollment Requests
          </h3>
          <p className="text-sm text-charcoal-500">
            {statusFilter ? `No ${statusFilter} requests found.` : 'No enrollment requests yet.'}
          </p>
        </div>
      )}

      {/* Requests Table */}
      {!isLoading && requests.length > 0 && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-100">
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                  Applicant
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                  Contact
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                  Source
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                  Date
                </th>
                <th className="text-right px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-charcoal-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req: any) => {
                const status = (req.status as RequestStatus) || 'pending'
                const config = STATUS_CONFIG[status]

                return (
                  <tr key={req.id} className="border-b border-charcoal-50 hover:bg-charcoal-50/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center">
                          <User size={14} className="text-charcoal-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-charcoal-900">
                            {req.applicant_first_name} {req.applicant_last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-600">
                          <Mail size={11} />
                          {req.applicant_email}
                        </div>
                        {req.applicant_phone && (
                          <div className="flex items-center gap-1.5 text-xs text-charcoal-400">
                            <Phone size={11} />
                            {req.applicant_phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-charcoal-500 capitalize">
                        {(req.source || 'self_signup').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        config.bg, config.text
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-charcoal-500">
                        {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {status === 'pending' && (
                        <div className="flex items-center gap-2 justify-end">
                          {rejectingId === req.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason (optional)"
                                className="h-8 w-40 text-xs border border-charcoal-200 rounded px-2"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectMutation.mutate({ requestId: req.id, reason: rejectReason || undefined })}
                                disabled={rejectMutation.isPending}
                                className="h-8 text-xs text-error-600 border-error-200 hover:bg-error-50"
                              >
                                {rejectMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setRejectingId(null); setRejectReason('') }}
                                className="h-8 text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => approveMutation.mutate({ requestId: req.id })}
                                disabled={approveMutation.isPending}
                                className="h-8 text-xs bg-success-600 text-white hover:bg-success-700"
                              >
                                {approveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRejectingId(req.id)}
                                className="h-8 text-xs text-error-600 border-error-200 hover:bg-error-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {status === 'rejected' && req.rejection_reason && (
                        <span className="text-[10px] text-charcoal-400 italic">
                          {req.rejection_reason}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}
