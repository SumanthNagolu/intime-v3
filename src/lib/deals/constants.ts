/**
 * Deal Constants - Dropdown options, status mappings, and field configurations
 *
 * Single source of truth for Deal-related constants used across:
 * - Wizard steps
 * - Workspace sections
 * - Form validation
 */

// ============ STAGE CONFIGURATION ============

export const DEAL_STAGES = [
  { value: 'discovery', label: 'Discovery', color: 'bg-slate-500', probability: 10 },
  { value: 'qualification', label: 'Qualification', color: 'bg-blue-500', probability: 25 },
  { value: 'proposal', label: 'Proposal', color: 'bg-amber-500', probability: 50 },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500', probability: 75 },
  { value: 'verbal_commit', label: 'Verbal Commit', color: 'bg-emerald-500', probability: 90 },
  { value: 'closed_won', label: 'Closed Won', color: 'bg-success-500', probability: 100 },
  { value: 'closed_lost', label: 'Closed Lost', color: 'bg-error-500', probability: 0 },
] as const

export const ACTIVE_STAGES = DEAL_STAGES.filter(
  (s) => s.value !== 'closed_won' && s.value !== 'closed_lost'
)

// ============ VALUE BASIS ============

export const VALUE_BASIS_OPTIONS = [
  { value: 'one_time', label: 'One-time' },
  { value: 'annual', label: 'Annual' },
  { value: 'monthly', label: 'Monthly' },
] as const

// ============ CURRENCY ============

export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'INR', label: 'INR (₹)' },
] as const

// ============ SERVICES ============

export const SERVICES_OPTIONS = [
  { value: 'contract_staffing', label: 'Contract Staffing', icon: '📋' },
  { value: 'direct_hire', label: 'Direct Hire', icon: '👤' },
  { value: 'contract_to_hire', label: 'Contract to Hire', icon: '🔄' },
  { value: 'sow_project', label: 'SOW/Project', icon: '📁' },
  { value: 'managed_services', label: 'Managed Services', icon: '⚙️' },
  { value: 'payrolling', label: 'Payrolling', icon: '💰' },
  { value: 'ic_engagement', label: 'IC Engagement', icon: '🤝' },
  { value: 'rpo', label: 'RPO', icon: '🎯' },
] as const

// ============ HEALTH STATUS ============

export const HEALTH_STATUS_OPTIONS = [
  { value: 'on_track', label: 'On Track', color: 'success', icon: '✅' },
  { value: 'slow', label: 'Slow', color: 'amber', icon: '🐢' },
  { value: 'stale', label: 'Stale', color: 'orange', icon: '⏸️' },
  { value: 'urgent', label: 'Urgent', color: 'error', icon: '🚨' },
  { value: 'at_risk', label: 'At Risk', color: 'error', icon: '⚠️' },
] as const

// ============ STAKEHOLDER ROLES ============

export const STAKEHOLDER_ROLES = [
  { value: 'champion', label: 'Champion', icon: '👑', color: 'gold' },
  { value: 'decision_maker', label: 'Decision Maker', icon: '🎯', color: 'forest' },
  { value: 'influencer', label: 'Influencer', icon: '💡', color: 'blue' },
  { value: 'blocker', label: 'Blocker', icon: '🚫', color: 'error' },
  { value: 'end_user', label: 'End User', icon: '👤', color: 'charcoal' },
] as const

export const INFLUENCE_LEVELS = [
  { value: 'high', label: 'High', color: 'success' },
  { value: 'medium', label: 'Medium', color: 'amber' },
  { value: 'low', label: 'Low', color: 'charcoal' },
] as const

export const SENTIMENT_OPTIONS = [
  { value: 'positive', label: 'Positive', icon: '👍', color: 'success' },
  { value: 'neutral', label: 'Neutral', icon: '➖', color: 'charcoal' },
  { value: 'negative', label: 'Negative', icon: '👎', color: 'error' },
] as const

// ============ CONTRACT TYPES ============

export const CONTRACT_TYPES = [
  { value: 'msa', label: 'Master Service Agreement (MSA)' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
  { value: 'po', label: 'Purchase Order (PO)' },
  { value: 'email', label: 'Email Confirmation' },
] as const

// ============ PAYMENT TERMS ============

export const PAYMENT_TERMS = [
  { value: 'net_15', label: 'Net 15' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_45', label: 'Net 45' },
  { value: 'net_60', label: 'Net 60' },
] as const

// ============ BILLING FREQUENCY ============

export const BILLING_FREQUENCY = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

// ============ WIN REASONS ============

export const WIN_REASONS = [
  { value: 'price_value', label: 'Price/Value' },
  { value: 'expertise_speed', label: 'Expertise & Speed' },
  { value: 'relationship_trust', label: 'Relationship & Trust' },
  { value: 'candidate_quality', label: 'Candidate Quality' },
  { value: 'response_time', label: 'Response Time' },
  { value: 'other', label: 'Other' },
] as const

// ============ LOSS REASONS ============

export const LOSS_REASON_CATEGORIES = [
  { value: 'competitor', label: 'Lost to Competitor' },
  { value: 'no_budget', label: 'No Budget' },
  { value: 'project_cancelled', label: 'Project Cancelled' },
  { value: 'hired_internally', label: 'Hired Internally' },
  { value: 'went_dark', label: 'Went Dark' },
  { value: 'price_too_high', label: 'Price Too High' },
  { value: 'requirements_changed', label: 'Requirements Changed' },
  { value: 'other', label: 'Other' },
] as const

// ============ FUTURE POTENTIAL ============

export const FUTURE_POTENTIAL_OPTIONS = [
  { value: 'yes', label: 'Yes - Re-engage', color: 'success' },
  { value: 'maybe', label: 'Maybe - Monitor', color: 'amber' },
  { value: 'no', label: 'No - Do Not Re-engage', color: 'charcoal' },
] as const

// ============ HELPER FUNCTIONS ============

export function getStageBadgeVariant(stage: string): 'default' | 'success' | 'destructive' | 'warning' {
  switch (stage) {
    case 'closed_won':
      return 'success'
    case 'closed_lost':
      return 'destructive'
    case 'verbal_commit':
    case 'negotiation':
      return 'warning'
    default:
      return 'default'
  }
}

export function getHealthBadgeVariant(health: string): 'default' | 'success' | 'destructive' | 'warning' {
  switch (health) {
    case 'on_track':
      return 'success'
    case 'at_risk':
    case 'urgent':
      return 'destructive'
    case 'slow':
    case 'stale':
      return 'warning'
    default:
      return 'default'
  }
}

export function getStageColor(stage: string): string {
  const stageConfig = DEAL_STAGES.find((s) => s.value === stage)
  return stageConfig?.color || 'bg-charcoal-500'
}

export function getDefaultProbability(stage: string): number {
  const stageConfig = DEAL_STAGES.find((s) => s.value === stage)
  return stageConfig?.probability || 20
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatStage(stage: string): string {
  const stageConfig = DEAL_STAGES.find((s) => s.value === stage)
  return stageConfig?.label || stage.replace(/_/g, ' ')
}

export function formatHealthStatus(status: string): string {
  const healthConfig = HEALTH_STATUS_OPTIONS.find((h) => h.value === status)
  return healthConfig?.label || status.replace(/_/g, ' ')
}

export function formatService(service: string): string {
  const serviceConfig = SERVICES_OPTIONS.find((s) => s.value === service)
  return serviceConfig?.label || service.replace(/_/g, ' ')
}
