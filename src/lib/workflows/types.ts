/**
 * Workflow Engine Types
 *
 * Type definitions for the workflow state machine system.
 */

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  entity_type: string;
  initial_state_id: string | null;
  version: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkflowState {
  id: string;
  workflow_id: string;
  name: string;
  display_name: string;
  description: string | null;
  state_order: number;
  is_initial: boolean;
  is_terminal: boolean;
  actions: string[];
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WorkflowTransition {
  id: string;
  workflow_id: string;
  from_state_id: string;
  to_state_id: string;
  action: string;
  display_name: string;
  required_permission: string | null;
  conditions: Record<string, unknown>;
  auto_transition: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface WorkflowInstance {
  id: string;
  org_id: string;
  workflow_id: string;
  entity_type: string;
  entity_id: string;
  current_state_id: string;
  started_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  status: 'active' | 'completed' | 'cancelled' | 'failed';
  metadata: Record<string, unknown>;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowHistoryEntry {
  id: string;
  workflow_instance_id: string;
  from_state_id: string | null;
  to_state_id: string;
  action: string;
  performed_by: string;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AvailableAction {
  action: string;
  display_name: string;
  to_state_name: string;
  required_permission: string | null;
  has_permission: boolean;
}

export interface StartWorkflowParams {
  workflowId: string;
  entityType: string;
  entityId: string;
  userId: string;
  orgId: string;
}

export interface TransitionParams {
  instanceId: string;
  action: string;
  userId: string;
  notes?: string;
  expectedVersion?: number;
}

export interface WorkflowInstanceWithState {
  id: string;
  org_id: string;
  workflow_name: string;
  entity_type: string;
  entity_id: string;
  current_state: string;
  current_state_display: string;
  is_terminal: boolean;
  status: string;
  started_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  duration_hours: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowMetrics {
  workflow_id: string;
  workflow_name: string;
  entity_type: string;
  total_instances: number;
  active_instances: number;
  completed_instances: number;
  cancelled_instances: number;
  avg_completion_hours: number | null;
  last_started_at: string | null;
  org_id: string;
}
