import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Alert {
  id: string
  title: string
  message: string
  severity: 'critical' | 'warning'
  createdAt: string
}

interface AlertsSectionProps {
  alerts: Alert[]
  isLoading: boolean
}

export function AlertsSection({ alerts, isLoading }: AlertsSectionProps) {
  if (isLoading) {
    return (
      <DashboardSection title="Critical Alerts">
        <div className="h-24 bg-charcoal-100 animate-pulse rounded-xl" />
      </DashboardSection>
    )
  }

  if (alerts.length === 0) {
    return (
      <DashboardSection title="Critical Alerts">
        <div className="card-premium p-6 text-center text-charcoal-500">
          No critical alerts at this time
        </div>
      </DashboardSection>
    )
  }

  return (
    <DashboardSection
      title={`Critical Alerts (${alerts.length})`}
      action={
        <a
          href="/employee/admin/notifications"
          className="text-sm text-forest-600 hover:text-forest-700"
        >
          View All
        </a>
      }
    >
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'card-premium p-4 flex items-start gap-3',
              alert.severity === 'critical'
                ? 'border-l-4 border-l-red-500'
                : 'border-l-4 border-l-amber-500'
            )}
          >
            {alert.severity === 'critical' ? (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-charcoal-900">{alert.title}</p>
              <p className="text-sm text-charcoal-600 mt-1">{alert.message}</p>
              <p className="text-xs text-charcoal-400 mt-2">
                {new Date(alert.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  )
}
