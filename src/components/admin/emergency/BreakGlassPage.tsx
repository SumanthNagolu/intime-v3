'use client'

import { useState } from 'react'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { trpc } from '@/lib/trpc/client'
import {
  Key,
  AlertTriangle,
  Clock,
  User,
  ShieldAlert,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import Link from 'next/link'

export function BreakGlassPage() {
  const [page, setPage] = useState(1)
  const [showInitiate, setShowInitiate] = useState(false)

  // Form state for initiating break-glass
  const [reason, setReason] = useState('')
  const [authorizedBy, setAuthorizedBy] = useState('')
  const [incidentId, setIncidentId] = useState<string>('')

  const utils = trpc.useUtils()

  const breakGlassQuery = trpc.emergency.listBreakGlassAccess.useQuery({
    page,
    pageSize: 20,
  })

  const activeIncidentsQuery = trpc.emergency.listIncidents.useQuery({
    status: 'all',
    page: 1,
    pageSize: 50,
  })

  const logBreakGlassMutation = trpc.emergency.logBreakGlassAccess.useMutation({
    onSuccess: () => {
      toast.success('Break-glass access logged successfully')
      setShowInitiate(false)
      resetForm()
      utils.emergency.listBreakGlassAccess.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to log access: ${error.message}`)
    },
  })

  const updateBreakGlassMutation = trpc.emergency.updateBreakGlassAccess.useMutation({
    onSuccess: () => {
      toast.success('Break-glass session ended')
      utils.emergency.listBreakGlassAccess.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to end session: ${error.message}`)
    },
  })

  const resetForm = () => {
    setReason('')
    setAuthorizedBy('')
    setIncidentId('')
  }

  const handleInitiateBreakGlass = () => {
    if (reason.length < 10) {
      toast.error('Reason must be at least 10 characters')
      return
    }
    if (!authorizedBy.trim()) {
      toast.error('Authorizer name/email is required')
      return
    }

    logBreakGlassMutation.mutate({
      reason,
      authorizedBy: authorizedBy.trim(),
      incidentId: incidentId || undefined,
    })
  }

  const handleEndSession = (id: string) => {
    updateBreakGlassMutation.mutate({
      id,
      endedAt: new Date().toISOString(),
    })
  }

  const pagination = breakGlassQuery.data?.pagination
  const accessLogs = breakGlassQuery.data?.items ?? []

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Emergency', href: '/employee/admin/emergency' },
    { label: 'Break-Glass' },
  ]

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
      {/* Warning Banner */}
      <Card className="border-red-300 bg-red-50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-900">Break-Glass Access Protocol</p>
              <p className="text-sm text-red-700 mt-1">
                Break-glass access is for emergency situations only. All access is logged and audited.
                Two-person authorization is required. Use only when standard access methods are unavailable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Initiate Access */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Key className="w-5 h-5" />
              Initiate Access
            </CardTitle>
            <CardDescription>
              Log emergency break-glass access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Access *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why break-glass access is needed (min 10 chars)..."
                rows={3}
              />
              <p className="text-xs text-charcoal-500">{reason.length}/10 minimum characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorizedBy">Authorized By *</Label>
              <Input
                id="authorizedBy"
                value={authorizedBy}
                onChange={(e) => setAuthorizedBy(e.target.value)}
                placeholder="Name or email of authorizing person"
              />
              <p className="text-xs text-charcoal-500">Two-person authorization required</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident">Related Incident</Label>
              <Select value={incidentId} onValueChange={setIncidentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select related incident (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No related incident</SelectItem>
                  {activeIncidentsQuery.data?.items.map((incident) => (
                    <SelectItem key={incident.id} value={incident.id}>
                      {incident.incident_number} - {incident.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full"
                  variant="destructive"
                  disabled={reason.length < 10 || !authorizedBy.trim()}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  Initiate Break-Glass Access
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Break-Glass Access</AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to log emergency break-glass access. This action will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Create a CRITICAL audit log entry</li>
                      <li>Alert security administrators</li>
                      <li>Record all actions taken during this session</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleInitiateBreakGlass}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {logBreakGlassMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Confirm Access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Access Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Access History</CardTitle>
            <CardDescription>
              All break-glass access events are logged and audited
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accessLogs.length > 0 ? (
              <div className="space-y-3">
                {accessLogs.map((access) => (
                  <div
                    key={access.id}
                    className={`p-4 rounded-lg border ${
                      !access.ended_at ? 'border-red-300 bg-red-50' : 'border-charcoal-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${!access.ended_at ? 'bg-red-100' : 'bg-charcoal-100'}`}>
                          <Key className={`w-4 h-4 ${!access.ended_at ? 'text-red-600' : 'text-charcoal-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{access.accessed_by}</span>
                            {!access.ended_at && (
                              <Badge className="bg-red-600">Active Session</Badge>
                            )}
                          </div>
                          <p className="text-sm text-charcoal-600 mt-1">{access.reason}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              Authorized by: {access.authorized_by}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(access.accessed_at), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          {(access.incident as { incident_number?: string })?.incident_number && (
                            <Link
                              href={`/employee/admin/emergency/incidents/${access.incident_id}`}
                              className="text-xs text-hublot-600 hover:underline mt-1 inline-block"
                            >
                              Related: {(access.incident as { incident_number: string }).incident_number}
                            </Link>
                          )}
                          {access.actions_taken && access.actions_taken.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-medium text-charcoal-600">Actions taken:</span>
                              <ul className="list-disc list-inside text-xs text-charcoal-500 mt-1">
                                {access.actions_taken.map((action: string, i: number) => (
                                  <li key={i}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      {!access.ended_at && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEndSession(access.id)}
                          disabled={updateBreakGlassMutation.isPending}
                        >
                          {updateBreakGlassMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              End Session
                            </>
                          )}
                        </Button>
                      )}
                      {access.ended_at && (
                        <div className="text-xs text-charcoal-500 text-right">
                          <p>Ended</p>
                          <p>{format(new Date(access.ended_at), 'HH:mm')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-charcoal-500">
                      Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal-500">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No break-glass access records</p>
                <p className="text-sm mt-1">All emergency access will be logged here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageContent>
  )
}
