/**
 * Helper Utilities - Common functions used across orchestration
 */

import readline from 'readline';
import chalk from 'chalk';
import { ApprovalRequest, ApprovalResponse, WorkflowResult } from './types';

// ============================================
// User Approval
// ============================================

/**
 * Ask user for approval (interactive)
 */
export async function askUserApproval(
  request: ApprovalRequest
): Promise<ApprovalResponse> {
  console.log('\n' + chalk.cyan.bold('─'.repeat(60)));
  console.log(chalk.cyan.bold(`  ${request.title}`));
  console.log(chalk.cyan.bold('─'.repeat(60)));
  console.log(chalk.white(request.message));

  if (request.artifactPath) {
    console.log(chalk.gray(`\n  File: ${request.artifactPath}`));
  }

  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    if (request.options) {
      console.log(chalk.yellow('Options:'));
      request.options.forEach((option, index) => {
        console.log(chalk.yellow(`  ${index + 1}. ${option}`));
      });
      console.log('');

      rl.question(chalk.green('Select option (or "cancel"): '), resolve);
    } else {
      rl.question(chalk.green('Approve? (yes/no): '), resolve);
    }
  });

  rl.close();

  if (request.options) {
    const selectedIndex = parseInt(answer) - 1;
    if (selectedIndex >= 0 && selectedIndex < request.options.length) {
      return {
        approved: true,
        selectedOption: request.options[selectedIndex],
      };
    } else if (answer.toLowerCase() === 'cancel') {
      return { approved: false };
    } else {
      console.log(chalk.red('Invalid option. Please try again.'));
      return await askUserApproval(request);
    }
  } else {
    const approved = ['yes', 'y', 'approve'].includes(answer.toLowerCase());
    return { approved };
  }
}

// ============================================
// Progress Display
// ============================================

/**
 * Display workflow progress
 */
export function displayWorkflowProgress(
  currentStep: number,
  totalSteps: number,
  stepName: string
): void {
  const percentage = Math.round((currentStep / totalSteps) * 100);
  const progressBar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));

  console.log('\n' + chalk.cyan(`[${progressBar}] ${percentage}%`));
  console.log(chalk.white(`Step ${currentStep}/${totalSteps}: ${stepName}`));
}

/**
 * Display workflow summary
 */
export function displayWorkflowSummary(result: WorkflowResult): void {
  console.log('\n' + chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('  WORKFLOW SUMMARY'));
  console.log(chalk.cyan.bold('═'.repeat(60)));

  if (result.success) {
    console.log(chalk.green.bold('  ✓ Status: COMPLETED'));
  } else {
    console.log(chalk.red.bold('  ✗ Status: FAILED'));
    if (result.error) {
      console.log(chalk.red(`  Error: ${result.error}`));
    }
  }

  console.log(chalk.white(`  Workflow: ${result.workflow}`));
  console.log(chalk.white(`  Duration: ${(result.duration / 1000).toFixed(2)}s`));
  console.log(chalk.white(`  Total Cost: $${result.totalCost.toFixed(4)}`));
  console.log(chalk.white(`  Steps Completed: ${result.steps.length}`));

  console.log(chalk.cyan('\n  Step Details:'));
  result.steps.forEach((step, index) => {
    const status = step.success ? chalk.green('✓') : chalk.red('✗');
    const cost = `$${step.cost.toFixed(4)}`;
    console.log(
      chalk.white(`    ${status} ${index + 1}. ${step.agent} (${cost}, ${step.duration}ms)`)
    );
  });

  console.log(chalk.cyan.bold('═'.repeat(60) + '\n'));
}

// ============================================
// File Utilities
// ============================================

/**
 * Format duration in human-readable format
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}
