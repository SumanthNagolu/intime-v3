/**
 * Configuration - Agent configurations and settings
 */

import { AgentConfig, AgentName, OrchestratorConfig } from './types';

// ============================================
// Agent Configurations
// ============================================

export const AGENT_CONFIGS: Record<AgentName, AgentConfig> = {
  orchestrator: {
    name: 'orchestrator',
    tier: 'orchestration',
    model: 'haiku',
    temperature: 0.1,
    maxTokens: 1000,
    systemPromptPath: '.gemini/agents/orchestration/orchestrator.md',
    description: 'Routes requests to appropriate workflows',
  },

  'ceo-advisor': {
    name: 'ceo-advisor',
    tier: 'strategic',
    model: 'opus',
    temperature: 0.7,
    maxTokens: 4000,
    systemPromptPath: '.gemini/agents/strategic/ceo-advisor.md',
    description: 'Strategic business analysis and vision alignment',
  },

  'cfo-advisor': {
    name: 'cfo-advisor',
    tier: 'strategic',
    model: 'opus',
    temperature: 0.3,
    maxTokens: 3000,
    systemPromptPath: '.gemini/agents/strategic/cfo-advisor.md',
    description: 'Financial analysis and ROI calculations',
  },

  'pm-agent': {
    name: 'pm-agent',
    tier: 'planning',
    model: 'sonnet',
    temperature: 0.5,
    maxTokens: 3000,
    systemPromptPath: '.gemini/agents/planning/pm-agent.md',
    description: 'Requirements gathering and user stories',
  },

  'database-architect': {
    name: 'database-architect',
    tier: 'implementation',
    model: 'sonnet',
    temperature: 0.2,
    maxTokens: 3000,
    systemPromptPath: '.gemini/agents/implementation/database-architect.md',
    description: 'Database schema design and RLS policies',
  },

  'api-developer': {
    name: 'api-developer',
    tier: 'implementation',
    model: 'sonnet',
    temperature: 0.3,
    maxTokens: 3000,
    systemPromptPath: '.gemini/agents/implementation/api-developer.md',
    description: 'Server actions and API design',
  },

  'frontend-developer': {
    name: 'frontend-developer',
    tier: 'implementation',
    model: 'sonnet',
    temperature: 0.3,
    maxTokens: 3000,
    systemPromptPath: '.gemini/agents/implementation/frontend-developer.md',
    description: 'React components and UI design',
  },

  'integration-specialist': {
    name: 'integration-specialist',
    tier: 'implementation',
    model: 'sonnet',
    temperature: 0.3,
    maxTokens: 4000,
    systemPromptPath: '.gemini/agents/implementation/integration-specialist.md',
    description: 'Merge DB + API + Frontend into working code',
  },

  'code-reviewer': {
    name: 'code-reviewer',
    tier: 'quality',
    model: 'haiku',
    temperature: 0.1,
    maxTokens: 2000,
    systemPromptPath: '.gemini/agents/quality/code-reviewer.md',
    description: 'Code quality and best practices review',
  },

  'security-auditor': {
    name: 'security-auditor',
    tier: 'quality',
    model: 'haiku',
    temperature: 0.1,
    maxTokens: 2000,
    systemPromptPath: '.gemini/agents/quality/security-auditor.md',
    description: 'Security vulnerability scanning',
  },

  'qa-engineer': {
    name: 'qa-engineer',
    tier: 'operations',
    model: 'sonnet',
    temperature: 0.3,
    maxTokens: 3000,
    systemPromptPath: '.gemini/agents/operations/qa-engineer.md',
    description: 'Testing and quality assurance',
  },

  'deployment-specialist': {
    name: 'deployment-specialist',
    tier: 'operations',
    model: 'sonnet',
    temperature: 0.2,
    maxTokens: 2000,
    systemPromptPath: '.gemini/agents/operations/deployment-specialist.md',
    description: 'Deployment and production operations',
  },
};

export function getAgentConfig(agentName: AgentName): AgentConfig {
  const config = AGENT_CONFIGS[agentName];
  if (!config) {
    throw new Error(`Agent configuration not found: ${agentName}`);
  }
  return config;
}

// ============================================
// Orchestrator Configuration
// ============================================

export const ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  agents: AGENT_CONFIGS,
  workflows: {},
  stateDir: '.gemini/state',
  artifactsDir: '.gemini/state/artifacts',
  logLevel: (process.env.LOG_LEVEL as any) || 'info',
  enableCaching: true,
  parallelExecution: true,
};
