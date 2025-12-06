// ============================================
// WORKFLOW TYPE DEFINITIONS
// ============================================

// Workflow Types
export type WorkflowType =
  | 'approval'
  | 'status_auto'
  | 'notification'
  | 'sla_escalation'
  | 'field_auto'
  | 'assignment'
  | 'webhook'
  | 'scheduled'

// Trigger Events
export type TriggerEvent =
  | 'record_created'
  | 'record_updated'
  | 'field_changed'
  | 'status_changed'
  | 'time_based'
  | 'manual'

// Workflow Status
export type WorkflowStatus = 'draft' | 'active' | 'disabled' | 'archived'

// Entity Types
export type EntityType =
  | 'jobs'
  | 'candidates'
  | 'submissions'
  | 'placements'
  | 'accounts'
  | 'contacts'
  | 'leads'
  | 'deals'
  | 'activities'
  | 'employees'
  | 'consultants'
  | 'vendors'
  | 'interviews'

// Approver Types
export type ApproverType =
  | 'specific_user'
  | 'record_owner'
  | 'owners_manager'
  | 'role_based'
  | 'pod_manager'
  | 'custom_formula'

// Timeout Units
export type TimeoutUnit =
  | 'minutes'
  | 'hours'
  | 'business_hours'
  | 'days'
  | 'business_days'

// Timeout Actions
export type TimeoutAction =
  | 'escalate'
  | 'auto_approve'
  | 'auto_reject'
  | 'reminder'
  | 'nothing'

// Action Triggers
export type ActionTrigger =
  | 'on_start'
  | 'on_approval'
  | 'on_rejection'
  | 'on_cancellation'
  | 'on_completion'
  | 'on_timeout'
  | 'on_each_step'

// Action Types
export type ActionType =
  | 'update_field'
  | 'send_notification'
  | 'create_activity'
  | 'trigger_webhook'
  | 'run_workflow'
  | 'assign_user'
  | 'create_task'

// Condition Operators
export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'between'
  | 'is_empty'
  | 'is_not_empty'
  | 'in'
  | 'not_in'
  | 'changed'
  | 'changed_to'
  | 'changed_from'
  | 'has_rel'
  | 'no_rel'

// Execution Status
export type ExecutionStatus =
  | 'pending'
  | 'in_progress'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'cancelled'
  | 'expired'
  | 'completed'
  | 'failed'

// Approval Status
export type ApprovalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'expired'
  | 'delegated'

// ============================================
// CONDITION TYPES
// ============================================

export interface Condition {
  field: string
  operator: ConditionOperator
  value: unknown
  valueEnd?: unknown // For 'between' operator
}

export interface TriggerConditions {
  conditions: Condition[]
  logic: 'and' | 'or'
}

// ============================================
// WORKFLOW STEP TYPES
// ============================================

export interface ApproverConfig {
  user_id?: string
  role_name?: string
  formula?: string
  [key: string]: unknown
}

export interface WorkflowStep {
  id?: string
  stepName: string
  stepOrder: number
  approverType: ApproverType
  approverConfig: ApproverConfig
  timeoutHours?: number
  timeoutUnit: TimeoutUnit
  timeoutAction?: TimeoutAction
  reminderEnabled: boolean
  reminderPercent?: number
}

export interface WorkflowStepRow {
  id: string
  workflow_id: string
  step_order: number
  step_name: string
  approver_type: ApproverType
  approver_config: ApproverConfig
  timeout_hours: number | null
  timeout_unit: TimeoutUnit
  timeout_action: TimeoutAction | null
  reminder_enabled: boolean
  reminder_percent: number | null
  created_at: string
}

// ============================================
// WORKFLOW ACTION TYPES
// ============================================

export interface ActionConfig {
  field?: string
  value?: unknown
  recipient?: string
  template?: string
  webhook_id?: string
  workflow_id?: string
  user_id?: string
  task_title?: string
  [key: string]: unknown
}

export interface WorkflowAction {
  id?: string
  actionTrigger: ActionTrigger
  actionOrder: number
  actionType: ActionType
  actionConfig: ActionConfig
}

export interface WorkflowActionRow {
  id: string
  workflow_id: string
  action_trigger: ActionTrigger
  action_order: number
  action_type: ActionType
  action_config: ActionConfig
  created_at: string
}

// ============================================
// MAIN WORKFLOW TYPES
// ============================================

export interface ScheduleConfig {
  cron: string
  timezone: string
}

export interface Workflow {
  id: string
  orgId: string
  name: string
  description?: string | null
  workflowType: WorkflowType
  entityType: EntityType
  triggerEvent: TriggerEvent
  triggerConditions: TriggerConditions
  status: WorkflowStatus
  version: number
  parentVersionId?: string | null
  scheduleConfig?: ScheduleConfig | null
  activatedAt?: string | null
  activatedBy?: string | null
  createdAt: string
  updatedAt: string
  createdBy?: string | null
  deletedAt?: string | null
}

export interface WorkflowRow {
  id: string
  org_id: string
  name: string
  description: string | null
  workflow_type: WorkflowType
  entity_type: EntityType
  trigger_event: TriggerEvent
  trigger_conditions: TriggerConditions
  status: WorkflowStatus
  version: number
  parent_version_id: string | null
  schedule_config: ScheduleConfig | null
  activated_at: string | null
  activated_by: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  deleted_at: string | null
}

export interface WorkflowWithDetails extends WorkflowRow {
  steps: WorkflowStepRow[]
  actions: WorkflowActionRow[]
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  lastRunAt: string | null
  createdByUser?: {
    id: string
    email: string
    full_name: string | null
  } | null
}

// ============================================
// EXECUTION TYPES
// ============================================

export interface WorkflowExecution {
  id: string
  orgId: string
  workflowId: string
  workflowVersion: number
  entityType: EntityType
  entityId: string
  status: ExecutionStatus
  currentStep?: number | null
  startedAt: string
  completedAt?: string | null
  completedBy?: string | null
  completionNotes?: string | null
  errorMessage?: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface WorkflowExecutionRow {
  id: string
  org_id: string
  workflow_id: string
  workflow_version: number
  entity_type: EntityType
  entity_id: string
  status: ExecutionStatus
  current_step: number | null
  started_at: string
  completed_at: string | null
  completed_by: string | null
  completion_notes: string | null
  error_message: string | null
  metadata: Record<string, unknown>
  created_at: string
}

// ============================================
// APPROVAL TYPES
// ============================================

export interface WorkflowApproval {
  id: string
  executionId: string
  stepId: string
  stepOrder: number
  approverId: string
  status: ApprovalStatus
  requestedAt: string
  dueAt?: string | null
  respondedAt?: string | null
  responseNotes?: string | null
  reminderSentAt?: string | null
  escalatedAt?: string | null
  delegatedTo?: string | null
  createdAt: string
}

export interface WorkflowApprovalRow {
  id: string
  execution_id: string
  step_id: string
  step_order: number
  approver_id: string
  status: ApprovalStatus
  requested_at: string
  due_at: string | null
  responded_at: string | null
  response_notes: string | null
  reminder_sent_at: string | null
  escalated_at: string | null
  delegated_to: string | null
  created_at: string
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface WorkflowFormInput {
  name: string
  description?: string
  workflowType: WorkflowType
  entityType: EntityType
  triggerEvent: TriggerEvent
  triggerConditions?: TriggerConditions
  scheduleConfig?: ScheduleConfig
  steps?: WorkflowStep[]
  actions?: WorkflowAction[]
}

export interface WorkflowUpdateInput {
  id: string
  name?: string
  description?: string | null
  triggerConditions?: TriggerConditions
  scheduleConfig?: ScheduleConfig | null
  steps?: WorkflowStep[]
  actions?: WorkflowAction[]
}

// ============================================
// ENTITY FIELD DEFINITIONS
// ============================================

export interface EntityField {
  name: string
  label: string
  type: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'currency' | 'relationship'
  options?: { value: string; label: string }[]
  entityRef?: string // For relationship fields
}

// Field definitions per entity type
export const ENTITY_FIELDS: Record<EntityType, EntityField[]> = {
  jobs: [
    { name: 'title', label: 'Job Title', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'open', label: 'Open' },
      { value: 'closed', label: 'Closed' },
      { value: 'on_hold', label: 'On Hold' },
    ]},
    { name: 'bill_rate', label: 'Bill Rate', type: 'currency' },
    { name: 'pay_rate', label: 'Pay Rate', type: 'currency' },
    { name: 'priority', label: 'Priority', type: 'select', options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'urgent', label: 'Urgent' },
    ]},
    { name: 'job_type', label: 'Job Type', type: 'select', options: [
      { value: 'contract', label: 'Contract' },
      { value: 'permanent', label: 'Permanent' },
      { value: 'contract_to_hire', label: 'Contract to Hire' },
    ]},
    { name: 'start_date', label: 'Start Date', type: 'date' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
    { name: 'account_id', label: 'Account', type: 'relationship', entityRef: 'accounts' },
  ],
  candidates: [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'new', label: 'New' },
      { value: 'active', label: 'Active' },
      { value: 'passive', label: 'Passive' },
      { value: 'do_not_contact', label: 'Do Not Contact' },
    ]},
    { name: 'source', label: 'Source', type: 'text' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
  ],
  submissions: [
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'withdrawn', label: 'Withdrawn' },
    ]},
    { name: 'submitted_at', label: 'Submitted Date', type: 'datetime' },
    { name: 'bill_rate', label: 'Bill Rate', type: 'currency' },
    { name: 'pay_rate', label: 'Pay Rate', type: 'currency' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'job_id', label: 'Job', type: 'relationship', entityRef: 'jobs' },
    { name: 'candidate_id', label: 'Candidate', type: 'relationship', entityRef: 'candidates' },
  ],
  placements: [
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
    { name: 'start_date', label: 'Start Date', type: 'date' },
    { name: 'end_date', label: 'End Date', type: 'date' },
    { name: 'bill_rate', label: 'Bill Rate', type: 'currency' },
    { name: 'pay_rate', label: 'Pay Rate', type: 'currency' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
  ],
  accounts: [
    { name: 'name', label: 'Account Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'prospect', label: 'Prospect' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]},
    { name: 'industry', label: 'Industry', type: 'text' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
  ],
  contacts: [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'account_id', label: 'Account', type: 'relationship', entityRef: 'accounts' },
  ],
  leads: [
    { name: 'company_name', label: 'Company Name', type: 'text' },
    { name: 'contact_name', label: 'Contact Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'phone', label: 'Phone', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'new', label: 'New' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'qualified', label: 'Qualified' },
      { value: 'converted', label: 'Converted' },
      { value: 'lost', label: 'Lost' },
    ]},
    { name: 'source', label: 'Source', type: 'text' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
  ],
  deals: [
    { name: 'name', label: 'Deal Name', type: 'text' },
    { name: 'amount', label: 'Amount', type: 'currency' },
    { name: 'stage', label: 'Stage', type: 'select', options: [
      { value: 'discovery', label: 'Discovery' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'negotiation', label: 'Negotiation' },
      { value: 'closed_won', label: 'Closed Won' },
      { value: 'closed_lost', label: 'Closed Lost' },
    ]},
    { name: 'close_date', label: 'Close Date', type: 'date' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
    { name: 'account_id', label: 'Account', type: 'relationship', entityRef: 'accounts' },
  ],
  activities: [
    { name: 'subject', label: 'Subject', type: 'text' },
    { name: 'type', label: 'Type', type: 'select', options: [
      { value: 'call', label: 'Call' },
      { value: 'email', label: 'Email' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'task', label: 'Task' },
      { value: 'note', label: 'Note' },
    ]},
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
    { name: 'due_at', label: 'Due Date', type: 'datetime' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
  ],
  employees: [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'terminated', label: 'Terminated' },
    ]},
    { name: 'hire_date', label: 'Hire Date', type: 'date' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
  ],
  consultants: [
    { name: 'full_name', label: 'Full Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'available', label: 'Available' },
      { value: 'on_assignment', label: 'On Assignment' },
      { value: 'inactive', label: 'Inactive' },
    ]},
    { name: 'bill_rate', label: 'Bill Rate', type: 'currency' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
  ],
  vendors: [
    { name: 'name', label: 'Vendor Name', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ]},
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'owner_id', label: 'Owner', type: 'relationship', entityRef: 'users' },
  ],
  interviews: [
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'no_show', label: 'No Show' },
    ]},
    { name: 'interview_type', label: 'Interview Type', type: 'select', options: [
      { value: 'phone', label: 'Phone Screen' },
      { value: 'video', label: 'Video' },
      { value: 'onsite', label: 'Onsite' },
      { value: 'technical', label: 'Technical' },
    ]},
    { name: 'scheduled_at', label: 'Scheduled Date', type: 'datetime' },
    { name: 'created_at', label: 'Created Date', type: 'datetime' },
    { name: 'submission_id', label: 'Submission', type: 'relationship', entityRef: 'submissions' },
  ],
}

// ============================================
// OPERATOR DEFINITIONS
// ============================================

export interface OperatorConfig {
  label: string
  applicableTypes: ('text' | 'number' | 'date' | 'datetime' | 'boolean' | 'select' | 'currency' | 'relationship')[]
  requiresValue: boolean
  requiresValueEnd?: boolean
}

export const CONDITION_OPERATORS: Record<ConditionOperator, OperatorConfig> = {
  eq: { label: 'Equals', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship', 'boolean'], requiresValue: true },
  neq: { label: 'Not Equals', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship', 'boolean'], requiresValue: true },
  contains: { label: 'Contains', applicableTypes: ['text'], requiresValue: true },
  starts_with: { label: 'Starts With', applicableTypes: ['text'], requiresValue: true },
  ends_with: { label: 'Ends With', applicableTypes: ['text'], requiresValue: true },
  gt: { label: 'Greater Than', applicableTypes: ['number', 'date', 'datetime', 'currency'], requiresValue: true },
  lt: { label: 'Less Than', applicableTypes: ['number', 'date', 'datetime', 'currency'], requiresValue: true },
  gte: { label: 'Greater Than or Equal', applicableTypes: ['number', 'date', 'datetime', 'currency'], requiresValue: true },
  lte: { label: 'Less Than or Equal', applicableTypes: ['number', 'date', 'datetime', 'currency'], requiresValue: true },
  between: { label: 'Between', applicableTypes: ['number', 'date', 'datetime', 'currency'], requiresValue: true, requiresValueEnd: true },
  is_empty: { label: 'Is Empty', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship'], requiresValue: false },
  is_not_empty: { label: 'Is Not Empty', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship'], requiresValue: false },
  in: { label: 'In List', applicableTypes: ['text', 'select'], requiresValue: true },
  not_in: { label: 'Not In List', applicableTypes: ['text', 'select'], requiresValue: true },
  changed: { label: 'Changed', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship', 'boolean'], requiresValue: false },
  changed_to: { label: 'Changed To', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship', 'boolean'], requiresValue: true },
  changed_from: { label: 'Changed From', applicableTypes: ['text', 'number', 'date', 'datetime', 'select', 'currency', 'relationship', 'boolean'], requiresValue: true },
  has_rel: { label: 'Has Relationship', applicableTypes: ['relationship'], requiresValue: false },
  no_rel: { label: 'No Relationship', applicableTypes: ['relationship'], requiresValue: false },
}

// Get operators for a field type
export function getOperatorsForFieldType(fieldType: EntityField['type']): { value: ConditionOperator; label: string }[] {
  return Object.entries(CONDITION_OPERATORS)
    .filter(([, config]) => config.applicableTypes.includes(fieldType))
    .map(([value, config]) => ({
      value: value as ConditionOperator,
      label: config.label,
    }))
}
