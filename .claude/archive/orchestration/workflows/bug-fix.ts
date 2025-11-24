/**
 * Bug Fix Workflow - Fast bug resolution
 */

import { WorkflowStep } from '../core/types';

export const bugFixWorkflowSteps: WorkflowStep[] = [
  {
    name: 'Analyze Bug',
    agent: 'pm-agent',
    input: (context) => `
Bug Report: ${context.request}

Analyze this bug and create:
- Root cause analysis
- Affected components
- Reproduction steps
- Fix strategy
    `.trim(),
    outputFile: '.claude/state/artifacts/bug-analysis.md',
  },

  {
    name: 'Implement Fix',
    agent: 'integration-specialist',
    input: 'Read bug analysis and implement the fix',
    inputFiles: ['.claude/state/artifacts/bug-analysis.md'],
    outputFile: '.claude/state/artifacts/bug-fix-implementation.md',
  },

  {
    name: 'Test Fix',
    agent: 'qa-engineer',
    input: 'Verify the bug is fixed and write regression tests',
    inputFiles: ['.claude/state/artifacts/bug-fix-implementation.md'],
    outputFile: '.claude/state/artifacts/bug-fix-test-report.md',
  },

  {
    name: 'Deploy Fix',
    agent: 'deployment-specialist',
    input: 'Deploy the bug fix to production',
    inputFiles: ['.claude/state/artifacts/bug-fix-test-report.md'],
    outputFile: '.claude/state/artifacts/bug-fix-deployment-log.md',
    requiresApproval: true,
  },
];
