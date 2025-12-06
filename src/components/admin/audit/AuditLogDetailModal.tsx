'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { trpc } from '@/lib/trpc/client'
import { format } from 'date-fns'
import {
  Loader2,
  CheckCircle,
  XCircle,
  Copy,
  User,
  Globe,
  Monitor,
  FileText,
  ArrowRight,
} from 'lucide-react'
import { toast } from 'sonner'

interface AuditLogDetailModalProps {
  logId: string | null
  open: boolean
  onClose: () => void
}

export function AuditLogDetailModal({ logId, open, onClose }: AuditLogDetailModalProps) {
  const { data: log, isLoading, error } = trpc.audit.getById.useQuery(
    { id: logId || '' },
    { enabled: !!logId && open }
  )

  const copyEventId = () => {
    if (log?.event_id) {
      navigator.clipboard.writeText(String(log.event_id))
      toast.success('Event ID copied to clipboard')
    }
  }

  const getResultBadge = (result: string | null) => {
    if (result === 'SUCCESS') {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
    }
    if (result === 'FAILURE') {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
    }
    return <Badge variant="outline">Unknown</Badge>
  }

  const getSeverityBadge = (severity: string | null) => {
    const colors: Record<string, string> = {
      INFO: 'bg-charcoal-50 text-charcoal-700 border-charcoal-200',
      LOW: 'bg-blue-50 text-blue-700 border-blue-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
      CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    }
    return <Badge variant="outline" className={colors[severity || 'INFO']}>{severity || 'INFO'}</Badge>
  }

  const renderChanges = () => {
    if (!log?.old_values && !log?.new_values) {
      return <p className="text-sm text-charcoal-500">No changes recorded</p>
    }

    const oldValues = log.old_values as Record<string, unknown> | null
    const newValues = log.new_values as Record<string, unknown> | null

    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(oldValues || {}),
      ...Object.keys(newValues || {}),
    ])

    // Filter to only show changed values
    const changedKeys = Array.from(allKeys).filter(key => {
      const oldVal = JSON.stringify(oldValues?.[key])
      const newVal = JSON.stringify(newValues?.[key])
      return oldVal !== newVal
    })

    if (changedKeys.length === 0) {
      return <p className="text-sm text-charcoal-500">No field changes detected</p>
    }

    return (
      <div className="space-y-3">
        {changedKeys.map(key => {
          const oldVal = oldValues?.[key]
          const newVal = newValues?.[key]
          return (
            <div key={key} className="border rounded-lg p-3 bg-charcoal-50">
              <p className="text-sm font-medium text-charcoal-700 mb-2">{key}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-charcoal-500 mb-1">Before</p>
                  <p className="text-sm font-mono bg-red-50 text-red-700 px-2 py-1 rounded break-all">
                    {oldVal !== undefined ? JSON.stringify(oldVal, null, 2) : '(empty)'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-500 mb-1">After</p>
                  <p className="text-sm font-mono bg-green-50 text-green-700 px-2 py-1 rounded break-all">
                    {newVal !== undefined ? JSON.stringify(newVal, null, 2) : '(empty)'}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-charcoal-400" />
            Audit Log Entry
            {log?.event_id && (
              <Button variant="ghost" size="sm" onClick={copyEventId} className="ml-2">
                #{log.event_id}
                <Copy className="w-3 h-3 ml-1" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            {log && format(new Date(log.created_at), 'MMMM d, yyyy \'at\' h:mm:ss a')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load audit log details
          </div>
        ) : log ? (
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Event Details */}
              <div>
                <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-2 block">Event Details</Label>
                <div className="bg-charcoal-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-charcoal-500">Event Type</p>
                      <Badge variant="secondary" className="mt-1">{log.action}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Object Type</p>
                      <p className="font-medium mt-1">{log.table_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Result</p>
                      <div className="mt-1">{getResultBadge(log.result)}</div>
                    </div>
                    <div>
                      <p className="text-xs text-charcoal-500">Severity</p>
                      <div className="mt-1">{getSeverityBadge(log.severity)}</div>
                    </div>
                  </div>
                  {log.record_id && (
                    <div className="mt-4 pt-4 border-t border-charcoal-200">
                      <p className="text-xs text-charcoal-500">Object ID</p>
                      <p className="font-mono text-sm mt-1">{log.record_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div>
                <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-2 block">User Information</Label>
                <div className="bg-charcoal-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-charcoal-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-charcoal-500">User</p>
                        <p className="font-medium">{log.userDetails?.full_name || log.user_email || 'System'}</p>
                        {log.user_email && <p className="text-sm text-charcoal-600">{log.user_email}</p>}
                      </div>
                    </div>
                    {log.userDetails?.role && (
                      <div>
                        <p className="text-xs text-charcoal-500">Role</p>
                        <p className="font-medium">{(log.userDetails.role as { display_name: string })?.display_name}</p>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-charcoal-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-charcoal-500">IP Address</p>
                        <p className="font-mono text-sm">{log.ip_address || 'Not recorded'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Monitor className="w-4 h-4 text-charcoal-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-charcoal-500">User Agent</p>
                        <p className="text-sm text-charcoal-600 truncate max-w-[250px]">
                          {log.user_agent || 'Not recorded'}
                        </p>
                      </div>
                    </div>
                  </div>
                  {log.session_id && (
                    <div className="mt-4 pt-4 border-t border-charcoal-200">
                      <p className="text-xs text-charcoal-500">Session ID</p>
                      <p className="font-mono text-sm mt-1">{log.session_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Changes Made */}
              <div>
                <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-2 block">Changes Made</Label>
                {renderChanges()}
              </div>

              {/* Request Details */}
              {(log.request_method || log.request_path || log.response_code) && (
                <div>
                  <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-2 block">Request Details</Label>
                  <div className="bg-charcoal-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {log.request_method && (
                        <div>
                          <p className="text-xs text-charcoal-500">Method</p>
                          <Badge variant="outline" className="mt-1">{log.request_method}</Badge>
                        </div>
                      )}
                      {log.request_path && (
                        <div className="col-span-2">
                          <p className="text-xs text-charcoal-500">Endpoint</p>
                          <p className="font-mono text-sm mt-1 truncate">{log.request_path}</p>
                        </div>
                      )}
                      {log.response_code && (
                        <div>
                          <p className="text-xs text-charcoal-500">Response Code</p>
                          <Badge
                            variant="outline"
                            className={`mt-1 ${log.response_code >= 400 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}
                          >
                            {log.response_code}
                          </Badge>
                        </div>
                      )}
                      {log.response_time_ms && (
                        <div>
                          <p className="text-xs text-charcoal-500">Response Time</p>
                          <p className="font-medium mt-1">{log.response_time_ms}ms</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Related Events */}
              {log.relatedEvents && log.relatedEvents.length > 0 && (
                <div>
                  <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-2 block">Related Events</Label>
                  <div className="border rounded-lg divide-y">
                    {log.relatedEvents.map((event) => (
                      <div key={event.id} className="p-3 flex items-center justify-between hover:bg-charcoal-50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${event.id === log.id ? 'bg-gold-500' : 'bg-charcoal-300'}`} />
                          <div>
                            <p className="text-sm font-medium">
                              #{event.event_id}: {event.action} on {event.table_name}
                            </p>
                            <p className="text-xs text-charcoal-500">
                              {format(new Date(event.created_at), 'h:mm:ss a')}
                            </p>
                          </div>
                        </div>
                        {event.id === log.id ? (
                          <Badge variant="secondary">Current</Badge>
                        ) : (
                          <ArrowRight className="w-4 h-4 text-charcoal-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
