'use client'

import { useState } from 'react'
import { DashboardShell, DashboardSection } from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { trpc } from '@/lib/trpc/client'
import {
  Plus,
  Pencil,
  Trash2,
  Bell,
  Loader2,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { AlertRuleFormDialog } from './AlertRuleFormDialog'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function AlertRulesPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [deletingRule, setDeletingRule] = useState<string | null>(null)

  const utils = trpc.useUtils()

  const rulesQuery = trpc.audit.listRules.useQuery()

  const toggleMutation = trpc.audit.toggleRule.useMutation({
    onSuccess: () => {
      utils.audit.listRules.invalidate()
      toast.success('Alert rule updated')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update rule')
    },
  })

  const deleteMutation = trpc.audit.deleteRule.useMutation({
    onSuccess: () => {
      utils.audit.listRules.invalidate()
      toast.success('Alert rule deleted')
      setDeletingRule(null)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete rule')
    },
  })

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-blue-50 text-blue-700 border-blue-200',
      MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
      HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
      CRITICAL: 'bg-red-50 text-red-700 border-red-200',
    }
    return <Badge variant="outline" className={colors[severity]}>{severity}</Badge>
  }

  return (
    <DashboardShell
      title="Alert Rules Configuration"
      description="Configure automated security alert triggers"
      breadcrumbs={[
        { label: 'Admin', href: '/employee/admin' },
        { label: 'Audit Logs', href: '/employee/admin/audit' },
        { label: 'Alert Rules', href: '/employee/admin/audit/rules' },
      ]}
      actions={
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      }
    >
      <DashboardSection>
        {rulesQuery.isLoading ? (
          <div className="bg-white rounded-xl border border-charcoal-100 p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
          </div>
        ) : !rulesQuery.data?.length ? (
          <div className="bg-white rounded-xl border border-charcoal-100 p-12 text-center">
            <Bell className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
            <p className="text-charcoal-900 font-medium">No Alert Rules Configured</p>
            <p className="text-sm text-charcoal-500 mt-1 mb-4">
              Create alert rules to automatically detect security incidents
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Rule
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-charcoal-100 divide-y divide-charcoal-100">
            {rulesQuery.data.map((rule) => (
              <div key={rule.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleMutation.mutate({ id: rule.id })}
                      disabled={toggleMutation.isPending}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${!rule.is_active ? 'text-charcoal-400' : 'text-charcoal-900'}`}>
                        {rule.name}
                      </p>
                      {getSeverityBadge(rule.severity)}
                    </div>
                    {rule.description && (
                      <p className="text-sm text-charcoal-500 mt-1 truncate">{rule.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {rule.event_type} = {rule.result_condition}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rule.threshold_count}x in {rule.time_window_minutes} min
                      </span>
                      {rule.auto_action && rule.auto_action !== 'none' && (
                        <Badge variant="secondary" className="text-xs">
                          Auto: {rule.auto_action.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingRule(rule.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingRule(rule.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardSection>

      {/* Create/Edit Dialog */}
      <AlertRuleFormDialog
        open={showCreateDialog || !!editingRule}
        ruleId={editingRule}
        onClose={() => {
          setShowCreateDialog(false)
          setEditingRule(null)
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRule} onOpenChange={() => setDeletingRule(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this alert rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRule && deleteMutation.mutate({ id: deletingRule })}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  )
}
