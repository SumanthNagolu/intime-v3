import type { LucideIcon } from 'lucide-react';

// ============================================================================
// Base Card Types
// ============================================================================

export type CardVariant = 'default' | 'compact' | 'expanded' | 'kanban';

export interface CardAction {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => void;
}

export interface BaseCardProps {
  variant?: CardVariant;
  selected?: boolean;
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

export interface EntityCardProps<T> extends BaseCardProps {
  data: T;
  onView?: () => void;
  onAction?: (action: string, data?: unknown) => void;
  actions?: CardAction[];
}

// ============================================================================
// Metric Card Types
// ============================================================================

export type TrendDirection = 'up' | 'down' | 'neutral';
export type StatusLevel = 'on_track' | 'at_risk' | 'behind' | 'critical' | 'excellent';
export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'mtd' | 'qtd' | 'ytd';

export interface MetricCardProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: TrendDirection;
  target?: number;
  status?: StatusLevel;
  icon?: LucideIcon;
  onClick?: () => void;
  sparklineData?: number[];
  comparisonPeriod?: TimePeriod;
  className?: string;
}

export interface KPICardProps {
  title: string;
  currentValue: number | string;
  targetValue: number;
  trend?: TrendDirection;
  trendPercentage?: number;
  timePeriod?: TimePeriod;
  status?: StatusLevel;
  progressVariant?: 'circular' | 'bar';
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export interface MetricGroupCardProps {
  title?: string;
  primaryMetric: MetricCardProps;
  secondaryMetrics: MetricCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export interface CountdownCardProps {
  label: string;
  targetDate: Date | string;
  entityType?: string;
  entityId?: string;
  entityLink?: string;
  urgencyThresholds?: {
    warning: number; // days
    critical: number; // days
    danger: number; // days
  };
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// Entity Data Types
// ============================================================================

export interface JobData {
  id: string;
  title: string;
  accountId: string;
  accountName?: string;
  status: 'draft' | 'active' | 'on_hold' | 'filled' | 'cancelled' | 'closed';
  location?: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  jobType: 'full_time' | 'contract' | 'contract_to_hire' | 'part_time';
  rateMin?: number;
  rateMax?: number;
  rateType?: 'hourly' | 'annual';
  positionsOpen: number;
  positionsFilled: number;
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  submissionsCount?: number;
  interviewsScheduled?: number;
  rcaiAssignments?: { userId: string; name: string; avatar?: string; role: 'R' | 'A' | 'C' | 'I' }[];
  createdAt: string | Date;
}

export interface CandidateData {
  id: string;
  name: string;
  avatar?: string;
  currentTitle?: string;
  currentCompany?: string;
  status: 'new' | 'active' | 'passive' | 'placed' | 'on_bench' | 'do_not_use' | 'inactive';
  visaStatus?: string;
  visaExpiryDate?: string | Date;
  skills: string[];
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  availability?: 'immediately' | '2_weeks' | '1_month' | 'other';
  matchScore?: number;
}

export interface SubmissionData {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  jobId: string;
  jobTitle: string;
  accountName: string;
  status: string;
  pipelineStage: string;
  submittedDate: string | Date;
  daysInStage: number;
  billRate?: number;
  payRate?: number;
  margin?: number;
  nextAction?: string;
  interviewDate?: string | Date;
}

export interface BenchConsultantData {
  id: string;
  name: string;
  avatar?: string;
  headline?: string;
  daysOnBench: number;
  benchStartDate: string | Date;
  visaType: string;
  visaExpiryDate?: string | Date;
  contractPreference: 'c2c' | 'w2' | '1099' | 'any';
  targetRate: number;
  minRate?: number;
  skills: string[];
  availabilityDate?: string | Date;
  marketingStatus: 'active' | 'passive' | 'hold';
  activeSubmissions?: number;
  lastContact?: string | Date;
}

export interface VendorConsultantData {
  id: string;
  name: string;
  avatar?: string;
  vendorSource: string;
  skills: string[];
  visaStatus: string;
  rate: number;
  availability?: string;
  matchScore?: number;
}

export interface ImmigrationAlertData {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantAvatar?: string;
  visaType: string;
  daysToExpiry: number;
  expiryDate: string | Date;
  renewalStatus: 'not_started' | 'in_progress' | 'pending_approval' | 'approved' | 'denied';
  attorneyAssigned?: string;
}

export interface HotlistData {
  id: string;
  name: string;
  consultantCount: number;
  status: 'draft' | 'sent' | 'expired';
  targetVendors: string[];
  sentDate?: string | Date;
  expiresDate?: string | Date;
  openRate?: number;
  responseRate?: number;
}

export interface PlacementData {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantAvatar?: string;
  jobTitle: string;
  accountName: string;
  startDate: string | Date;
  endDate?: string | Date;
  contractType: 'c2c' | 'w2' | '1099';
  billRate: number;
  payRate: number;
  margin: number;
  status: 'active' | 'completed' | 'terminated';
  checkInStatus?: { day30: boolean; day60: boolean; day90: boolean };
}

export interface LeadData {
  id: string;
  companyName: string;
  logo?: string;
  contactName?: string;
  contactTitle?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  leadScore?: number;
  qualificationProgress?: number;
  lastTouchpoint?: string | Date;
  estimatedValue?: number;
}

export interface DealData {
  id: string;
  name: string;
  accountId: string;
  accountName?: string;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expectedCloseDate: string | Date;
  ownerId: string;
  ownerName?: string;
  ownerAvatar?: string;
  competitors?: string[];
}

export interface AccountData {
  id: string;
  name: string;
  logo?: string;
  type: 'client' | 'vendor' | 'partner';
  tier: 'enterprise' | 'mid_market' | 'smb';
  primaryContact?: string;
  jobsCount?: number;
  placementsCount?: number;
  revenue?: number;
  lastActivityDate?: string | Date;
}

export interface ContactData {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  accountId: string;
  accountName?: string;
  email: string;
  phone?: string;
  isPrimary?: boolean;
  lastContactedDate?: string | Date;
  communicationPreference?: 'email' | 'phone' | 'linkedin';
}

export interface EmployeeData {
  id: string;
  name: string;
  avatar?: string;
  jobTitle: string;
  department?: string;
  manager?: string;
  employmentType: 'full_time' | 'part_time' | 'contractor';
  hireDate: string | Date;
  tenure?: string;
  status: 'active' | 'on_leave' | 'terminated';
  location?: string;
}

export interface TaskData {
  id: string;
  title: string;
  description?: string;
  entityType?: string;
  entityId?: string;
  entityLink?: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  dueDate?: string | Date;
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  checklistProgress?: { completed: number; total: number };
}

export interface ActivityData {
  id: string;
  patternIcon?: LucideIcon;
  patternName: string;
  subject: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'open' | 'in_progress' | 'completed' | 'deferred';
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  dueDate?: string | Date;
  slaStatus?: 'on_track' | 'warning' | 'breached';
  entityType?: string;
  entityId?: string;
  entityLink?: string;
  checklistProgress?: { completed: number; total: number };
}

// ============================================================================
// Timeline / Feed Types
// ============================================================================

export type TimelineEventType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'status_change'
  | 'submission'
  | 'interview'
  | 'placement'
  | 'task_completed';

export interface TimelineEventData {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  timestamp: string | Date;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  entityType?: string;
  entityId?: string;
  entityLink?: string;
}

export interface NotificationData {
  id: string;
  type: string;
  icon?: LucideIcon;
  title: string;
  message: string;
  timestamp: string | Date;
  isRead: boolean;
  actionUrl?: string;
}

// ============================================================================
// Dashboard Types
// ============================================================================

export interface PipelineStage {
  id: string;
  name: string;
  count: number;
  conversionRate?: number;
}

export interface UpcomingInterview {
  id: string;
  date: string | Date;
  time: string;
  candidateName: string;
  jobTitle: string;
  accountName?: string;
}

export interface AlertItem {
  id: string;
  type: 'immigration' | 'bench' | 'sla' | 'compliance' | 'deadline';
  severity: 'warning' | 'critical';
  title: string;
  description?: string;
  entityLink?: string;
  acknowledged?: boolean;
}

// ============================================================================
// Financial Types
// ============================================================================

export interface RevenueBreakdown {
  type: string;
  value: number;
  percentage?: number;
}

export interface MarginDistribution {
  low: number; // count or value
  mid: number;
  high: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type BenchAlertLevel = 'green' | 'yellow' | 'orange' | 'red' | 'black';

export function getBenchAlertLevel(daysOnBench: number): BenchAlertLevel {
  if (daysOnBench <= 15) return 'green';
  if (daysOnBench <= 30) return 'yellow';
  if (daysOnBench <= 60) return 'orange';
  if (daysOnBench <= 90) return 'red';
  return 'black';
}

export function getBenchAlertColor(level: BenchAlertLevel): string {
  switch (level) {
    case 'green': return 'bg-green-100 text-green-800 border-green-200';
    case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'red': return 'bg-red-100 text-red-800 border-red-200';
    case 'black': return 'bg-gray-900 text-white border-gray-800';
  }
}

export function getStatusColor(status: StatusLevel): string {
  switch (status) {
    case 'excellent': return 'text-green-600';
    case 'on_track': return 'text-green-600';
    case 'at_risk': return 'text-yellow-600';
    case 'behind': return 'text-orange-600';
    case 'critical': return 'text-red-600';
  }
}

export function getTrendColor(trend: TrendDirection, inverted = false): string {
  if (inverted) {
    return trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-gray-500';
  }
  return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatRate(value: number, rateType: 'hourly' | 'annual' = 'hourly'): string {
  const formatted = formatCurrency(value);
  return rateType === 'hourly' ? `${formatted}/hr` : `${formatted}/yr`;
}

export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return target.toLocaleDateString();
}

export function formatDaysRemaining(date: Date | string): { days: number; hours: number; isOverdue: boolean } {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = target.getTime() - now.getTime();
  const isOverdue = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, isOverdue };
}
