'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileWarning,
  ShieldCheck,
  ShieldAlert,
  FileCheck,
  Ban,
} from 'lucide-react'

// Status configurations matching router's enum:
// 'pending' | 'received' | 'under_review' | 'verified' | 'expiring' | 'expired' | 'rejected' | 'waived'
const COMPLIANCE_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-600',
  },
  received: {
    label: 'Received',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: FileCheck,
    iconColor: 'text-blue-600',
  },
  under_review: {
    label: 'Under Review',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: ShieldAlert,
    iconColor: 'text-purple-600',
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: ShieldCheck,
    iconColor: 'text-green-600',
  },
  expiring: {
    label: 'Expiring',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Ban,
    iconColor: 'text-red-600',
  },
  waived: {
    label: 'Waived',
    color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    icon: FileWarning,
    iconColor: 'text-charcoal-500',
  },
  // Legacy statuses for backward compatibility
  compliant: {
    label: 'Compliant',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  expiring_soon: {
    label: 'Expiring Soon',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  non_compliant: {
    label: 'Non-Compliant',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
} as const

type ComplianceStatus = keyof typeof COMPLIANCE_STATUS_CONFIG

interface ComplianceStatusBadgeProps {
  status: ComplianceStatus | string
  showIcon?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * ComplianceStatusBadge - Visual indicator for compliance item status
 *
 * Shows the current status of a compliance item with appropriate
 * color coding and optional icon for quick visual identification.
 */
export function ComplianceStatusBadge({
  status,
  showIcon = true,
  size = 'default',
  className,
}: ComplianceStatusBadgeProps) {
  const config = COMPLIANCE_STATUS_CONFIG[status as ComplianceStatus] || {
    label: status,
    color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    icon: FileWarning,
    iconColor: 'text-charcoal-500',
  }

  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1 font-medium border',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSizeClasses[size], config.iconColor)} />
      )}
      {config.label}
    </Badge>
  )
}

// Export status config for use in other components
export { COMPLIANCE_STATUS_CONFIG, type ComplianceStatus }
