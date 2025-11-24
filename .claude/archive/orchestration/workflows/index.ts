/**
 * Workflow Registry - Map workflow names to their steps
 */

import { WorkflowName, WorkflowStep } from '../core/types';
import { featureWorkflowSteps } from './feature';
import { bugFixWorkflowSteps } from './bug-fix';
// Import other workflows...

export const WORKFLOW_REGISTRY: Record<WorkflowName, WorkflowStep[]> = {
  feature: featureWorkflowSteps,
  'bug-fix': bugFixWorkflowSteps,
  database: [], // TODO: Implement
  test: [], // TODO: Implement
  deploy: [], // TODO: Implement
  'ceo-review': [], // TODO: Implement
  planning: [], // TODO: Implement
};

export function getWorkflowSteps(workflowName: WorkflowName): WorkflowStep[] {
  const steps = WORKFLOW_REGISTRY[workflowName];

  if (!steps || steps.length === 0) {
    throw new Error(`Workflow not implemented: ${workflowName}`);
  }

  return steps;
}
