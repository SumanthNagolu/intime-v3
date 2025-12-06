/**
 * Workflows Library
 *
 * Core workflow automation system for InTime.
 */

// Types
export * from './types'

// Condition Evaluation
export {
  evaluateConditions,
  evaluateCondition,
  validateCondition,
  validateConditions,
  type EvaluationContext,
  type ConditionResult,
  type EvaluationResult,
} from './condition-evaluator'

// Approver Resolution
export {
  resolveApprover,
  validateApproverConfig,
  type ApproverResolutionContext,
  type ResolvedApprover,
} from './approver-resolver'

// Action Execution
export {
  executeAction,
  validateActionConfig,
  type ActionExecutionContext,
  type ActionResult,
} from './action-executor'

// Workflow Engine
export {
  triggerWorkflows,
  processApprovalResponse,
  cancelExecution,
  getPendingApprovals,
  type TriggerContext,
  type ExecutionResult,
} from './workflow-engine'
