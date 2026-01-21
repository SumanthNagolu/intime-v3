/**
 * Team Constants - Dropdown options and status configurations
 *
 * Used by both wizard and workspace for consistent options.
 */

import {
  Building2,
  Users,
  GitBranch,
  MapPin,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Shield,
} from 'lucide-react'

// ============ GROUP TYPE OPTIONS ============

export const GROUP_TYPES = [
  { value: 'root', label: 'Root Organization', icon: Building2, description: 'Top-level organization' },
  { value: 'division', label: 'Division', icon: GitBranch, description: 'Major business division' },
  { value: 'branch', label: 'Branch', icon: MapPin, description: 'Regional branch office' },
  { value: 'team', label: 'Team', icon: Users, description: 'Working team unit' },
  { value: 'satellite_office', label: 'Satellite Office', icon: MapPin, description: 'Remote office location' },
  { value: 'producer', label: 'Producer', icon: Briefcase, description: 'Individual producer' },
] as const

// ============ STATUS OPTIONS ============

export const TEAM_STATUSES = [
  { value: 'active', label: 'Active', icon: CheckCircle, color: 'bg-success-100 text-success-800' },
  { value: 'inactive', label: 'Inactive', icon: XCircle, color: 'bg-charcoal-100 text-charcoal-600' },
  { value: 'pending', label: 'Pending Setup', icon: Clock, color: 'bg-amber-100 text-amber-800' },
  { value: 'archived', label: 'Archived', icon: AlertCircle, color: 'bg-error-100 text-error-800' },
] as const

// ============ LOAD PERMISSION OPTIONS ============

export const LOAD_PERMISSIONS = [
  { value: 'normal', label: 'Normal', description: 'Standard workload allocation' },
  { value: 'reduced', label: 'Reduced', description: 'Reduced capacity (training, part-time)' },
  { value: 'exempt', label: 'Exempt', description: 'No work assignment (leave, transition)' },
] as const

// ============ VACATION STATUS OPTIONS ============

export const VACATION_STATUSES = [
  { value: 'available', label: 'Available', icon: CheckCircle, color: 'bg-success-100 text-success-700' },
  { value: 'vacation', label: 'On Vacation', icon: Clock, color: 'bg-blue-100 text-blue-700' },
  { value: 'sick', label: 'Sick Leave', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
  { value: 'leave', label: 'On Leave', icon: XCircle, color: 'bg-charcoal-100 text-charcoal-600' },
] as const

// ============ SECURITY ZONE OPTIONS ============

export const SECURITY_ZONES = [
  { value: 'default', label: 'Default', description: 'Standard access permissions' },
  { value: 'restricted', label: 'Restricted', description: 'Limited access to sensitive data' },
  { value: 'confidential', label: 'Confidential', description: 'Highly restricted access' },
  { value: 'executive', label: 'Executive', description: 'Executive-level access' },
] as const

// ============ MEMBER ROLE OPTIONS ============

export const MEMBER_ROLES = [
  { value: 'member', label: 'Team Member', icon: Users },
  { value: 'manager', label: 'Team Manager', icon: UserCheck },
  { value: 'supervisor', label: 'Supervisor', icon: Shield },
] as const

// ============ STATUS BADGE CONFIG ============

export const TEAM_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  active: {
    label: 'Active',
    bg: 'bg-success-50',
    text: 'text-success-700',
    dot: 'bg-success-500',
    border: 'border-success-200',
  },
  inactive: {
    label: 'Inactive',
    bg: 'bg-charcoal-100',
    text: 'text-charcoal-600',
    dot: 'bg-charcoal-400',
    border: 'border-charcoal-200',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  archived: {
    label: 'Archived',
    bg: 'bg-error-50',
    text: 'text-error-700',
    dot: 'bg-error-500',
    border: 'border-error-200',
  },
}

// ============ GROUP TYPE BADGE CONFIG ============

export const GROUP_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  root: { label: 'Root', bg: 'bg-charcoal-100', text: 'text-charcoal-700' },
  division: { label: 'Division', bg: 'bg-purple-50', text: 'text-purple-700' },
  branch: { label: 'Branch', bg: 'bg-forest-50', text: 'text-forest-700' },
  team: { label: 'Team', bg: 'bg-blue-50', text: 'text-blue-700' },
  satellite_office: { label: 'Satellite Office', bg: 'bg-amber-50', text: 'text-amber-700' },
  producer: { label: 'Producer', bg: 'bg-gold-50', text: 'text-gold-700' },
}

// ============ HELPER FUNCTIONS ============

export function getGroupTypeLabel(type: string): string {
  return GROUP_TYPES.find(g => g.value === type)?.label ?? type.replace(/_/g, ' ')
}

export function getStatusConfig(status: string) {
  return TEAM_STATUS_CONFIG[status] ?? TEAM_STATUS_CONFIG.inactive
}

export function getGroupTypeConfig(type: string) {
  return GROUP_TYPE_CONFIG[type] ?? GROUP_TYPE_CONFIG.team
}
