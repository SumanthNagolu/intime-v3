'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  FileText,
  FileEdit,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  AlertTriangle,
  PenTool,
} from 'lucide-react'

// Status configurations for contracts
const CONTRACT_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
    icon: FileEdit,
    iconColor: 'text-charcoal-500',
  },
  pending_review: {
    label: 'Pending Review',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Clock,
    iconColor: 'text-blue-600',
  },
  in_negotiation: {
    label: 'In Negotiation',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: FileEdit,
    iconColor: 'text-purple-600',
  },
  pending_signature: {
    label: 'Pending Signature',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: PenTool,
    iconColor: 'text-amber-600',
  },
  partially_signed: {
    label: 'Partially Signed',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: PenTool,
    iconColor: 'text-yellow-600',
  },
  active: {
    label: 'Active',
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
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  terminated: {
    label: 'Terminated',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  renewed: {
    label: 'Renewed',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
  archived: {
    label: 'Archived',
    color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    icon: Archive,
    iconColor: 'text-charcoal-500',
  },
} as const

// Contract type configurations
const CONTRACT_TYPE_CONFIG = {
  msa: {
    label: 'MSA',
    fullName: 'Master Service Agreement',
    color: 'bg-blue-100 text-blue-700',
  },
  sow: {
    label: 'SOW',
    fullName: 'Statement of Work',
    color: 'bg-purple-100 text-purple-700',
  },
  nda: {
    label: 'NDA',
    fullName: 'Non-Disclosure Agreement',
    color: 'bg-amber-100 text-amber-700',
  },
  employment: {
    label: 'Employment',
    fullName: 'Employment Agreement',
    color: 'bg-green-100 text-green-700',
  },
  contractor: {
    label: 'Contractor',
    fullName: 'Contractor Agreement',
    color: 'bg-teal-100 text-teal-700',
  },
  vendor: {
    label: 'Vendor',
    fullName: 'Vendor Agreement',
    color: 'bg-indigo-100 text-indigo-700',
  },
  amendment: {
    label: 'Amendment',
    fullName: 'Contract Amendment',
    color: 'bg-orange-100 text-orange-700',
  },
  addendum: {
    label: 'Addendum',
    fullName: 'Contract Addendum',
    color: 'bg-pink-100 text-pink-700',
  },
  non_compete: {
    label: 'Non-Compete',
    fullName: 'Non-Compete Agreement',
    color: 'bg-red-100 text-red-700',
  },
  other: {
    label: 'Other',
    fullName: 'Other Agreement',
    color: 'bg-charcoal-100 text-charcoal-700',
  },
} as const

type ContractStatus = keyof typeof CONTRACT_STATUS_CONFIG
type ContractType = keyof typeof CONTRACT_TYPE_CONFIG

interface ContractStatusBadgeProps {
  status: ContractStatus | string
  showIcon?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

interface ContractTypeBadgeProps {
  type: ContractType | string
  showFullName?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

/**
 * ContractStatusBadge - Visual indicator for contract status
 *
 * Shows the current status of a contract with appropriate
 * color coding and optional icon.
 */
export function ContractStatusBadge({
  status,
  showIcon = true,
  size = 'default',
  className,
}: ContractStatusBadgeProps) {
  const config = CONTRACT_STATUS_CONFIG[status as ContractStatus] || {
    label: status.replace(/_/g, ' '),
    color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
    icon: FileText,
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
        'inline-flex items-center gap-1 font-medium border capitalize',
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

/**
 * ContractTypeBadge - Visual indicator for contract type
 *
 * Shows the type of contract (MSA, SOW, NDA, etc.)
 */
export function ContractTypeBadge({
  type,
  showFullName = false,
  size = 'default',
  className,
}: ContractTypeBadgeProps) {
  const config = CONTRACT_TYPE_CONFIG[type as ContractType] || {
    label: type,
    fullName: type,
    color: 'bg-charcoal-100 text-charcoal-700',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  }

  return (
    <Badge
      className={cn(
        'font-medium',
        config.color,
        sizeClasses[size],
        className
      )}
      title={config.fullName}
    >
      {showFullName ? config.fullName : config.label}
    </Badge>
  )
}

// Export configurations for use in other components
export {
  CONTRACT_STATUS_CONFIG,
  CONTRACT_TYPE_CONFIG,
  type ContractStatus,
  type ContractType,
}
