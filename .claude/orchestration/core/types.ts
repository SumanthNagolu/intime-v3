/**
 * Core types for the multi-agent orchestration system
 */

// ============================================
// Agent Types
// ============================================

export type AgentName =
  | 'orchestrator'
  | 'ceo-advisor'
  | 'cfo-advisor'
  | 'pm-agent'
  | 'database-architect'
  | 'api-developer'
  | 'frontend-developer'
  | 'integration-specialist'
  | 'code-reviewer'
  | 'security-auditor'
  | 'qa-engineer'
  | 'deployment-specialist';

export type AgentTier =
  | 'strategic'
  | 'planning'
  | 'implementation'
  | 'quality'
  | 'operations'
  | 'orchestration';

export type ModelName = 'opus' | 'sonnet' | 'haiku';

export interface AgentConfig {
  name: AgentName;
  tier: AgentTier;
  model: ModelName;
  temperature: number;
  maxTokens: number;
  systemPromptPath: string;
  description: string;
}

export interface AgentExecutionContext {
  agent: AgentName;
  input: string;
  inputFiles?: string[];
  outputFile?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  success: boolean;
  agent: AgentName;
  output: string;
  outputFile?: string;
  tokensUsed: {
    input: number;
    output: number;
    cached: number;
  };
  cost: number;
  duration: number; // milliseconds
  error?: string;
}

// ============================================
// Workflow Types
// ============================================

export type WorkflowName =
  | 'feature'
  | 'bug-fix'
  | 'database'
  | 'test'
  | 'deploy'
  | 'ceo-review'
  | 'planning';

export interface WorkflowStep {
  name: string;
  agent: AgentName;
  input: string | ((context: WorkflowContext) => string);
  inputFiles?: string[];
  outputFile: string;
  parallel?: boolean;
  optional?: boolean;
  requiresApproval?: boolean;
}

export interface WorkflowContext {
  workflowName: WorkflowName;
  request: string;
  artifacts: Map<string, string>;
  metadata: Record<string, unknown>;
  stepResults: AgentExecutionResult[];
}

export interface WorkflowResult {
  success: boolean;
  workflow: WorkflowName;
  duration: number;
  steps: AgentExecutionResult[];
  totalCost: number;
  error?: string;
}

// ============================================
// State Management Types
// ============================================

export interface WorkflowState {
  id: string;
  workflow: WorkflowName;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  currentStep: number;
  totalSteps: number;
  context: WorkflowContext;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface ArtifactMetadata {
  filename: string;
  createdBy: AgentName;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  checksum: string;
}

// ============================================
// Configuration Types
// ============================================

export interface OrchestratorConfig {
  agents: Record<AgentName, AgentConfig>;
  workflows: Record<WorkflowName, WorkflowStep[]>;
  stateDir: string;
  artifactsDir: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  enableCaching: boolean;
  parallelExecution: boolean;
}

// ============================================
// Helper Types
// ============================================

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface ApprovalRequest {
  title: string;
  message: string;
  artifactPath?: string;
  options?: string[];
}

export interface ApprovalResponse {
  approved: boolean;
  feedback?: string;
  selectedOption?: string;
}

// ============================================
// Cost Calculation Types
// ============================================

export interface ModelPricing {
  inputCostPer1M: number;
  outputCostPer1M: number;
  cachedCostPer1M: number;
}

export const MODEL_PRICING: Record<ModelName, ModelPricing> = {
  opus: {
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    cachedCostPer1M: 1.5,
  },
  sonnet: {
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    cachedCostPer1M: 0.3,
  },
  haiku: {
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    cachedCostPer1M: 0.025,
  },
};

// ============================================
// Error Types
// ============================================

export class OrchestratorError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'OrchestratorError';
  }
}

export class AgentExecutionError extends OrchestratorError {
  constructor(agent: AgentName, message: string, details?: Record<string, unknown>) {
    super(`Agent ${agent} failed: ${message}`, 'AGENT_EXECUTION_ERROR', {
      agent,
      ...details,
    });
  }
}

export class WorkflowExecutionError extends OrchestratorError {
  constructor(workflow: WorkflowName, step: string, message: string) {
    super(
      `Workflow ${workflow} failed at step ${step}: ${message}`,
      'WORKFLOW_EXECUTION_ERROR',
      { workflow, step }
    );
  }
}
