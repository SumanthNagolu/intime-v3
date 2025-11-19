/**
 * Workflow Engine - Orchestrates multi-agent workflows
 */

import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  WorkflowName,
  WorkflowStep,
  WorkflowContext,
  WorkflowResult,
  WorkflowState,
  AgentExecutionResult,
  WorkflowExecutionError,
} from './types';
import { AgentRunner } from './agent-runner';
import { getStateManager } from './state-manager';
import { logger } from './logger';
import { askUserApproval } from './helpers';
import { writeToFileTimeline, type TimelineInput } from '../../../src/lib/db/timeline';

// ============================================
// Workflow Engine Class
// ============================================

export class WorkflowEngine {
  private runner: AgentRunner;
  private stateManager = getStateManager();
  private parallelExecution: boolean;
  private initialized: boolean = false;

  constructor(apiKey: string, parallelExecution: boolean = true) {
    this.runner = new AgentRunner(apiKey);
    this.parallelExecution = parallelExecution;
  }

  /**
   * Initialize workflow engine (sets up tool manager)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.runner.initialize();
    await this.stateManager.initialize();
    this.initialized = true;
  }

  /**
   * Execute a complete workflow
   */
  async executeWorkflow(
    workflowName: WorkflowName,
    request: string,
    steps: WorkflowStep[]
  ): Promise<WorkflowResult> {
    // Ensure initialized
    await this.initialize();

    const startTime = Date.now();
    const workflowId = uuidv4();

    logger.info(`[WorkflowEngine] Starting workflow: ${workflowName} (${workflowId})`);

    // Initialize workflow state
    const context: WorkflowContext = {
      workflowName,
      request,
      artifacts: new Map(),
      metadata: {},
      stepResults: [],
    };

    const state: WorkflowState = {
      id: workflowId,
      workflow: workflowName,
      status: 'running',
      currentStep: 0,
      totalSteps: steps.length,
      context,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.stateManager.saveWorkflowState(state);

    try {
      // Execute steps (with parallel support)
      const stepResults = await this.executeSteps(steps, context);

      // Mark workflow as completed
      state.status = 'completed';
      state.completedAt = new Date();
      state.context.stepResults = stepResults;
      await this.stateManager.saveWorkflowState(state);

      const duration = Date.now() - startTime;
      const totalCost = stepResults.reduce((sum, result) => sum + result.cost, 0);

      logger.info(
        `[WorkflowEngine] ✓ Workflow ${workflowName} completed in ${duration}ms, cost: $${totalCost.toFixed(4)}`
      );

      // Log to timeline
      await this.logWorkflowToTimeline(
        workflowName,
        request,
        stepResults,
        duration,
        totalCost,
        true
      );

      return {
        success: true,
        workflow: workflowName,
        duration,
        steps: stepResults,
        totalCost,
      };
    } catch (error) {
      // Mark workflow as failed
      state.status = 'failed';
      state.updatedAt = new Date();
      await this.stateManager.saveWorkflowState(state);

      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const totalCost = context.stepResults.reduce((sum, r) => sum + r.cost, 0);

      logger.error(`[WorkflowEngine] ✗ Workflow ${workflowName} failed: ${errorMessage}`);

      // Log failed workflow to timeline
      await this.logWorkflowToTimeline(
        workflowName,
        request,
        context.stepResults,
        duration,
        totalCost,
        false,
        errorMessage
      );

      return {
        success: false,
        workflow: workflowName,
        duration,
        steps: context.stepResults,
        totalCost,
        error: errorMessage,
      };
    }
  }

  /**
   * Resume a paused workflow
   */
  async resumeWorkflow(workflowId: string): Promise<WorkflowResult> {
    const stateResult = await this.stateManager.loadWorkflowState(workflowId);

    if (!stateResult.success) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const state = stateResult.data;

    if (state.status !== 'paused') {
      throw new Error(`Workflow is not paused: ${workflowId}`);
    }

    logger.info(`[WorkflowEngine] Resuming workflow: ${workflowId}`);

    // Get workflow steps (would need to be stored or retrieved)
    // For now, throw error - full implementation would store steps in state
    throw new Error('Resume workflow not fully implemented - store steps in state');
  }

  // ============================================
  // Private Methods
  // ============================================

  private async executeSteps(
    steps: WorkflowStep[],
    context: WorkflowContext
  ): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = [];

    // Group steps by parallel batches
    const batches = this.groupStepsByParallel(steps);

    for (const batch of batches) {
      const batchResults =
        batch.length === 1 || !this.parallelExecution
          ? await this.executeSequential(batch, context)
          : await this.executeParallel(batch, context);

      results.push(...batchResults);
      context.stepResults.push(...batchResults);

      // Check if any step failed
      const failedStep = batchResults.find((r) => !r.success);
      if (failedStep) {
        throw new WorkflowExecutionError(
          context.workflowName,
          failedStep.agent,
          failedStep.error || 'Step failed'
        );
      }
    }

    return results;
  }

  private async executeSequential(
    steps: WorkflowStep[],
    context: WorkflowContext
  ): Promise<AgentExecutionResult[]> {
    const results: AgentExecutionResult[] = [];

    for (const step of steps) {
      const result = await this.executeStep(step, context);
      results.push(result);

      // Store artifact in context
      if (result.outputFile) {
        const artifactResult = await this.stateManager.loadArtifact(
          path.basename(result.outputFile)
        );
        if (artifactResult.success) {
          context.artifacts.set(path.basename(result.outputFile), artifactResult.data);
        }
      }

      // Check for approval requirement
      if (step.requiresApproval) {
        const approved = await askUserApproval({
          title: `Approve ${step.name}`,
          message: `Please review the output from ${step.agent} and approve to continue.`,
          artifactPath: result.outputFile,
        });

        if (!approved.approved) {
          throw new Error(`User rejected ${step.name}: ${approved.feedback || 'No reason provided'}`);
        }
      }
    }

    return results;
  }

  private async executeParallel(
    steps: WorkflowStep[],
    context: WorkflowContext
  ): Promise<AgentExecutionResult[]> {
    logger.debug(`[WorkflowEngine] Executing ${steps.length} steps in parallel`);

    const promises = steps.map((step) => this.executeStep(step, context));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const step = steps[index];
        return {
          success: false,
          agent: step.agent,
          output: '',
          tokensUsed: { input: 0, output: 0, cached: 0 },
          cost: 0,
          duration: 0,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        };
      }
    });
  }

  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<AgentExecutionResult> {
    // Resolve input (can be string or function)
    const input = typeof step.input === 'function' ? step.input(context) : step.input;

    // Execute agent
    const result = await this.runner.execute({
      agent: step.agent,
      input,
      inputFiles: step.inputFiles,
      outputFile: step.outputFile,
    });

    return result;
  }

  private groupStepsByParallel(steps: WorkflowStep[]): WorkflowStep[][] {
    const batches: WorkflowStep[][] = [];
    let currentBatch: WorkflowStep[] = [];

    for (const step of steps) {
      if (step.parallel && currentBatch.length > 0 && currentBatch[0].parallel) {
        // Add to current parallel batch
        currentBatch.push(step);
      } else {
        // Start new batch
        if (currentBatch.length > 0) {
          batches.push(currentBatch);
        }
        currentBatch = [step];
      }
    }

    if (currentBatch.length > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Log workflow execution to timeline
   */
  private async logWorkflowToTimeline(
    workflowName: WorkflowName,
    request: string,
    stepResults: AgentExecutionResult[],
    duration: number,
    totalCost: number,
    success: boolean,
    error?: string
  ): Promise<void> {
    try {
      // Get current session ID
      const sessionId = this.getCurrentSessionId();

      // Gather artifact files created
      const artifactFiles = stepResults
        .filter((r) => r.outputFile)
        .map((r) => path.basename(r.outputFile!));

      // Prepare timeline entry
      const entry: TimelineInput = {
        sessionId,
        conversationSummary: `Executed ${workflowName} workflow: ${request}`,
        userIntent: request,
        agentType: 'orchestrator',
        agentModel: 'workflow-engine',
        duration: `${Math.round(duration / 1000)}s`,
        actionsTaken: {
          completed: stepResults.filter((r) => r.success).map((r) => `${r.agent} completed`),
          inProgress: [],
          blocked: stepResults.filter((r) => !r.success).map((r) => `${r.agent} failed`),
        },
        filesChanged: {
          created: artifactFiles,
          modified: [],
          deleted: [],
        },
        results: {
          status: success ? 'success' : 'failed',
          summary: success
            ? `Completed ${stepResults.length} steps successfully`
            : `Failed: ${error || 'Unknown error'}`,
          metrics: {
            totalCost,
            duration,
            stepsCompleted: stepResults.filter((r) => r.success).length,
            totalSteps: stepResults.length,
          },
          artifacts: artifactFiles,
        },
        tags: [workflowName, 'workflow', 'automated'],
      };

      // Log to timeline (file-based)
      await writeToFileTimeline(entry);

      logger.debug(`[WorkflowEngine] Logged workflow to timeline: ${sessionId}`);
    } catch (error) {
      // Don't fail workflow if timeline logging fails
      logger.warn(
        `[WorkflowEngine] Failed to log to timeline: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get current session ID from file or generate new one
   */
  private getCurrentSessionId(): string {
    try {
      const sessionFile = path.join(process.cwd(), '.gemini/state/current-session.txt');
      if (fs.existsSync(sessionFile)) {
        return fs.readFileSync(sessionFile, 'utf-8').trim();
      }
    } catch (error) {
      // Ignore errors
    }

    // Generate new session ID
    const timestamp = new Date().toISOString().split('T')[0];
    return `workflow-${timestamp}-${uuidv4().substring(0, 8)}`;
  }
}
