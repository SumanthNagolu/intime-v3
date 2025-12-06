'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { trpc } from '@/lib/trpc/client'
import { Loader2, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface AlertRuleFormDialogProps {
  open: boolean
  ruleId: string | null
  onClose: () => void
}

const EVENT_TYPES = [
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'EXPORT', label: 'Export' },
  { value: 'PERMISSION_CHANGE', label: 'Permission Change' },
]

const TIME_WINDOWS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 1440, label: '24 hours' },
]

export function AlertRuleFormDialog({ open, ruleId, onClose }: AlertRuleFormDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState('LOGIN')
  const [resultCondition, setResultCondition] = useState<'ANY' | 'SUCCESS' | 'FAILURE'>('FAILURE')
  const [thresholdCount, setThresholdCount] = useState(5)
  const [timeWindowMinutes, setTimeWindowMinutes] = useState(10)
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM')
  const [autoAction, setAutoAction] = useState<'none' | 'lock_account' | 'block_ip' | 'require_2fa' | 'notify_manager'>('none')
  const [isActive, setIsActive] = useState(true)
  const [dashboardNotification, setDashboardNotification] = useState(true)

  const utils = trpc.useUtils()

  // Fetch existing rule if editing
  const { data: existingRules } = trpc.audit.listRules.useQuery(undefined, {
    enabled: !!ruleId,
  })

  const existingRule = existingRules?.find(r => r.id === ruleId)

  // Populate form when editing
  useEffect(() => {
    if (existingRule) {
      setName(existingRule.name)
      setDescription(existingRule.description || '')
      setEventType(existingRule.event_type)
      setResultCondition(existingRule.result_condition as 'ANY' | 'SUCCESS' | 'FAILURE')
      setThresholdCount(existingRule.threshold_count)
      setTimeWindowMinutes(existingRule.time_window_minutes)
      setSeverity(existingRule.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
      setAutoAction(existingRule.auto_action as typeof autoAction || 'none')
      setIsActive(existingRule.is_active)
      const channels = existingRule.notification_channels as { dashboard?: boolean } | null
      setDashboardNotification(channels?.dashboard ?? true)
    } else {
      // Reset form for new rule
      setName('')
      setDescription('')
      setEventType('LOGIN')
      setResultCondition('FAILURE')
      setThresholdCount(5)
      setTimeWindowMinutes(10)
      setSeverity('MEDIUM')
      setAutoAction('none')
      setIsActive(true)
      setDashboardNotification(true)
    }
  }, [existingRule, open])

  const createMutation = trpc.audit.createRule.useMutation({
    onSuccess: () => {
      utils.audit.listRules.invalidate()
      toast.success('Alert rule created')
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create rule')
    },
  })

  const updateMutation = trpc.audit.updateRule.useMutation({
    onSuccess: () => {
      utils.audit.listRules.invalidate()
      toast.success('Alert rule updated')
      onClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update rule')
    },
  })

  const handleSubmit = () => {
    const data = {
      name,
      description: description || undefined,
      eventType,
      resultCondition,
      thresholdCount,
      timeWindowMinutes,
      severity,
      autoAction,
      isActive,
      notificationChannels: {
        dashboard: dashboardNotification,
      },
    }

    if (ruleId) {
      updateMutation.mutate({ id: ruleId, ...data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-charcoal-400" />
            {ruleId ? 'Edit Alert Rule' : 'Create Alert Rule'}
          </DialogTitle>
          <DialogDescription>
            Configure when alerts should be triggered
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Name & Description */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Rule Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Multiple Failed Logins"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Triggers when a user fails to log in 5+ times in 10 minutes"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </div>

            {/* Trigger Conditions */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Trigger Conditions</Label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-charcoal-500">Event Type</Label>
                  <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-charcoal-500">Result</Label>
                  <Select value={resultCondition} onValueChange={(v) => setResultCondition(v as typeof resultCondition)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ANY">Any</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="FAILURE">Failure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-charcoal-500">Threshold Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={thresholdCount}
                    onChange={(e) => setThresholdCount(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-charcoal-500">Time Window</Label>
                  <Select value={String(timeWindowMinutes)} onValueChange={(v) => setTimeWindowMinutes(Number(v))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_WINDOWS.map((window) => (
                        <SelectItem key={window.value} value={String(window.value)}>
                          {window.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="text-xs text-charcoal-500">
                Alert will trigger when {thresholdCount} {eventType.toLowerCase()} events with {resultCondition.toLowerCase()} result occur within {TIME_WINDOWS.find(w => w.value === timeWindowMinutes)?.label}
              </p>
            </div>

            {/* Alert Configuration */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Alert Configuration</Label>

              <div>
                <Label className="text-xs text-charcoal-500">Severity</Label>
                <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-charcoal-500">Auto-Action</Label>
                <Select value={autoAction} onValueChange={(v) => setAutoAction(v as typeof autoAction)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="lock_account">Lock Account</SelectItem>
                    <SelectItem value="block_ip">Block IP</SelectItem>
                    <SelectItem value="require_2fa">Require 2FA</SelectItem>
                    <SelectItem value="notify_manager">Notify Manager</SelectItem>
                  </SelectContent>
                </Select>
                {autoAction !== 'none' && (
                  <p className="text-xs text-amber-600 mt-1">
                    Warning: Auto-actions are performed automatically and cannot be undone.
                  </p>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Notifications</Label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Dashboard Alert</p>
                  <p className="text-xs text-charcoal-500">Show alert in security dashboard</p>
                </div>
                <Switch
                  checked={dashboardNotification}
                  onCheckedChange={setDashboardNotification}
                />
              </label>
            </div>

            {/* Active Status */}
            <div className="pt-4 border-t">
              <label className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Rule Active</p>
                  <p className="text-xs text-charcoal-500">Enable or disable this alert rule</p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </label>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !name}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {ruleId ? 'Update Rule' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
