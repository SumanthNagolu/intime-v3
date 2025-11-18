#!/usr/bin/env node

/**
 * CLI - Command-line interface for orchestration
 *
 * Usage:
 *   pnpm orchestrate feature "Add resume builder"
 *   pnpm orchestrate bug-fix "Fix candidate search"
 *   pnpm orchestrate ceo-review "Resume builder feature"
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { WorkflowEngine } from '../core/workflow-engine';
import { getWorkflowSteps } from '../workflows';
import { WorkflowName } from '../core/types';
import { displayWorkflowSummary } from '../core/helpers';
import { getStateManager } from '../core/state-manager';

const program = new Command();

program
  .name('orchestrate')
  .description('InTime v3 Multi-Agent Orchestration CLI')
  .version('1.0.0');

// ============================================
// Feature Workflow
// ============================================

program
  .command('feature <request>')
  .description('Execute complete feature development workflow')
  .action(async (request: string) => {
    await executeWorkflow('feature', request);
  });

// ============================================
// Bug Fix Workflow
// ============================================

program
  .command('bug-fix <request>')
  .description('Execute bug fix workflow')
  .action(async (request: string) => {
    await executeWorkflow('bug-fix', request);
  });

// ============================================
// CEO Review Workflow
// ============================================

program
  .command('ceo-review <request>')
  .description('Get strategic business analysis from CEO and CFO advisors')
  .action(async (request: string) => {
    await executeWorkflow('ceo-review', request);
  });

// ============================================
// Database Design Workflow
// ============================================

program
  .command('database <request>')
  .description('Design database schema with RLS policies')
  .action(async (request: string) => {
    await executeWorkflow('database', request);
  });

// ============================================
// Test Workflow
// ============================================

program
  .command('test <request>')
  .description('Run comprehensive testing and QA')
  .action(async (request: string) => {
    await executeWorkflow('test', request);
  });

// ============================================
// Deploy Workflow
// ============================================

program
  .command('deploy <request>')
  .description('Deploy feature to production with safety checks')
  .action(async (request: string) => {
    await executeWorkflow('deploy', request);
  });

// ============================================
// List Artifacts
// ============================================

program
  .command('artifacts')
  .description('List all workflow artifacts')
  .action(async () => {
    const stateManager = getStateManager();
    await stateManager.initialize();

    const artifacts = await stateManager.listArtifacts();

    console.log(chalk.cyan.bold('\nWorkflow Artifacts:\n'));

    if (artifacts.length === 0) {
      console.log(chalk.gray('  No artifacts found.\n'));
      return;
    }

    artifacts.forEach((artifact) => {
      console.log(chalk.white(`  ${artifact.filename}`));
      console.log(chalk.gray(`    Created by: ${artifact.createdBy}`));
      console.log(chalk.gray(`    Version: ${artifact.version}`));
      console.log(chalk.gray(`    Updated: ${artifact.updatedAt.toLocaleString()}`));
      console.log('');
    });
  });

// ============================================
// Clear Artifacts
// ============================================

program
  .command('clear')
  .description('Clear all workflow artifacts (use with caution!)')
  .action(async () => {
    const stateManager = getStateManager();
    await stateManager.initialize();

    console.log(chalk.yellow('\n⚠️  This will delete ALL workflow artifacts.'));
    console.log(chalk.yellow('This action cannot be undone.\n'));

    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question(chalk.red('Are you sure? (type "yes" to confirm): '), resolve);
    });

    rl.close();

    if (answer.toLowerCase() === 'yes') {
      await stateManager.clearArtifacts();
      console.log(chalk.green('\n✓ All artifacts cleared.\n'));
    } else {
      console.log(chalk.gray('\nCancelled.\n'));
    }
  });

// ============================================
// Helper: Execute Workflow
// ============================================

async function executeWorkflow(workflowName: WorkflowName, request: string): Promise<void> {
  console.log(chalk.cyan.bold(`\n🚀 Starting ${workflowName} workflow...\n`));

  try {
    // Get API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.log(chalk.red('Error: ANTHROPIC_API_KEY environment variable is required\n'));
      process.exit(1);
    }

    // Initialize state manager
    const stateManager = getStateManager();
    await stateManager.initialize();

    // Get workflow steps
    const steps = getWorkflowSteps(workflowName);

    // Execute workflow
    const engine = new WorkflowEngine(apiKey);
    const result = await engine.executeWorkflow(workflowName, request, steps);

    // Display summary
    displayWorkflowSummary(result);

    // Exit with appropriate code
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.log(chalk.red('\n✗ Workflow execution failed:\n'));
    console.log(chalk.red(error instanceof Error ? error.message : String(error)));
    console.log('');
    process.exit(1);
  }
}

// ============================================
// Parse Arguments
// ============================================

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
