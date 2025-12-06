'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { trpc } from '@/lib/trpc/client'
import {
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function SecurityAlertsSection() {
  const alertsQuery = trpc.audit.listAlerts.useQuery({
    status: 'open',
    limit: 5,
  })

  const getSeverityConfig = (severity: string) => {
    const configs: Record<string, { color: string; icon: JSX.Element }> = {
      LOW: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: <Shield className="w-4 h-4" /> },
      MEDIUM: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: <AlertTriangle className="w-4 h-4" /> },
      HIGH: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: <AlertTriangle className="w-4 h-4" /> },
      CRITICAL: { color: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> },
    }
    return configs[severity] || configs.LOW
  }

  if (alertsQuery.isLoading) {
    return (
      <div className="bg-white rounded-xl border border-charcoal-100 p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-charcoal-400" />
        </div>
      </div>
    )
  }

  const alerts = alertsQuery.data ?? []

  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-800">No Active Security Alerts</p>
            <p className="text-sm text-green-600">All systems operating normally</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Security Alerts ({alerts.length})
        </h3>
        <Link href="/employee/admin/audit/alerts">
          <Button variant="ghost" size="sm">
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const config = getSeverityConfig(alert.severity)
          return (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${config.color}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{config.icon}</div>
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    {alert.description && (
                      <p className="text-sm mt-1 opacity-80">{alert.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm opacity-70">
                      {alert.related_user_email && (
                        <span>User: {alert.related_user_email}</span>
                      )}
                      <span>{formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{alert.status}</Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Investigate
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
