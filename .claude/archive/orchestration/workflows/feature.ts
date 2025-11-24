/**
 * Feature Workflow - Complete end-to-end feature development
 *
 * Steps:
 * 1. PM gathers requirements
 * 2. Parallel architecture (DB + API + Frontend)
 * 3. Integration specialist merges
 * 4. Parallel quality checks (Code Review + Security)
 * 5. QA writes and runs tests
 * 6. Deployment
 */

import { WorkflowStep } from '../core/types';

export const featureWorkflowSteps: WorkflowStep[] = [
  // Step 1: Requirements Gathering (PM Agent)
  {
    name: 'Gather Requirements',
    agent: 'pm-agent',
    input: (context) => `
User Request: ${context.request}

Please analyze this request and create comprehensive requirements including:
- Business context (which of the 5 pillars does this affect?)
- User stories with acceptance criteria
- Success metrics
- Edge cases and error handling

Write the requirements to requirements.md for the architecture team.
    `.trim(),
    outputFile: '.claude/state/artifacts/requirements.md',
    requiresApproval: true, // User must approve requirements before proceeding
  },

  // Step 2a: Database Architecture (parallel with API/Frontend)
  {
    name: 'Design Database Schema',
    agent: 'database-architect',
    input: 'Read requirements.md and design the database schema with RLS policies',
    inputFiles: ['.claude/state/artifacts/requirements.md'],
    outputFile: '.claude/state/artifacts/architecture-db.md',
    parallel: true,
  },

  // Step 2b: API Development (parallel with DB/Frontend)
  {
    name: 'Design API',
    agent: 'api-developer',
    input: 'Read requirements.md and design server actions with validation',
    inputFiles: ['.claude/state/artifacts/requirements.md'],
    outputFile: '.claude/state/artifacts/architecture-api.md',
    parallel: true,
  },

  // Step 2c: Frontend Development (parallel with DB/API)
  {
    name: 'Design Frontend',
    agent: 'frontend-developer',
    input: 'Read requirements.md and design React components',
    inputFiles: ['.claude/state/artifacts/requirements.md'],
    outputFile: '.claude/state/artifacts/architecture-frontend.md',
    parallel: true,
  },

  // Step 3: Integration (after parallel architecture steps)
  {
    name: 'Integrate Components',
    agent: 'integration-specialist',
    input: 'Read all architecture documents and create working implementation',
    inputFiles: [
      '.claude/state/artifacts/architecture-db.md',
      '.claude/state/artifacts/architecture-api.md',
      '.claude/state/artifacts/architecture-frontend.md',
    ],
    outputFile: '.claude/state/artifacts/implementation-log.md',
  },

  // Step 4a: Code Review (parallel with Security)
  {
    name: 'Code Review',
    agent: 'code-reviewer',
    input: 'Review implementation for code quality and best practices',
    inputFiles: ['.claude/state/artifacts/implementation-log.md'],
    outputFile: '.claude/state/artifacts/code-review.md',
    parallel: true,
  },

  // Step 4b: Security Audit (parallel with Code Review)
  {
    name: 'Security Audit',
    agent: 'security-auditor',
    input: 'Audit implementation for security vulnerabilities',
    inputFiles: ['.claude/state/artifacts/implementation-log.md'],
    outputFile: '.claude/state/artifacts/security-audit.md',
    parallel: true,
  },

  // Step 5: QA Testing
  {
    name: 'QA Testing',
    agent: 'qa-engineer',
    input: 'Write and run comprehensive tests for the implementation',
    inputFiles: [
      '.claude/state/artifacts/implementation-log.md',
      '.claude/state/artifacts/code-review.md',
      '.claude/state/artifacts/security-audit.md',
    ],
    outputFile: '.claude/state/artifacts/test-report.md',
  },

  // Step 6: Deployment
  {
    name: 'Deploy to Production',
    agent: 'deployment-specialist',
    input: 'Deploy the feature to production with safety checks',
    inputFiles: ['.claude/state/artifacts/test-report.md'],
    outputFile: '.claude/state/artifacts/deployment-log.md',
    requiresApproval: true, // User must approve before deployment
  },
];
