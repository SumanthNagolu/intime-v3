/**
 * Agent Runner - Executes individual agents with the Gemini API
 *
 * Enhanced with tool calling support:
 * - MCP integration for file operations
 * - Custom tools for validation and testing
 * - Agentic loop for multi-turn tool use
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  AgentExecutionContext,
  AgentExecutionResult,
  AgentConfig,
  AgentName,
  MODEL_PRICING,
  AgentExecutionError,
} from './types';
import { getAgentConfig } from './config';
import { logger } from './logger';
import { getToolManager, ToolDefinition } from './tool-manager';

// ============================================
// Agent Runner Class
// ============================================

export class AgentRunner {
  private anthropic: Anthropic;
  private cacheEnabled: boolean;
  private toolManager = getToolManager();
  private toolsEnabled: boolean;

  constructor(apiKey: string, enableCache: boolean = true, enableTools: boolean = true) {
    this.anthropic = new Anthropic({ apiKey });
    this.cacheEnabled = enableCache;
    this.toolsEnabled = enableTools;
  }

  /**
   * Initialize tool manager (connect to MCP servers)
   */
  async initialize(): Promise<void> {
    if (this.toolsEnabled) {
      await this.toolManager.initialize();
    }
  }

  /**
   * Execute an agent with the given context
   */
  async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    const config = getAgentConfig(context.agent);

    logger.info(`[AgentRunner] Executing agent: ${context.agent}`);

    try {
      // Step 1: Load agent system prompt
      const systemPrompt = await this.loadSystemPrompt(config);

      // Step 2: Prepare user input (combine input + input files)
      const userInput = await this.prepareUserInput(context);

      // Step 3: Call Gemini API (with tool support)
      const apiResponse = await this.callGemini({
        model: this.getModelId(config.model),
        systemPrompt,
        userInput,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        agentName: context.agent, // Pass agent name for tool selection
      });

      // Step 4: Save output to file (if specified)
      if (context.outputFile) {
        await this.saveOutput(context.outputFile, apiResponse.content);
      }

      // Step 5: Calculate cost
      const cost = this.calculateCost(
        config.model,
        apiResponse.tokensUsed.input,
        apiResponse.tokensUsed.output,
        apiResponse.tokensUsed.cached
      );

      const duration = Date.now() - startTime;

      const result: AgentExecutionResult = {
        success: true,
        agent: context.agent,
        output: apiResponse.content,
        outputFile: context.outputFile,
        tokensUsed: apiResponse.tokensUsed,
        cost,
        duration,
      };

      logger.info(
        `[AgentRunner] ✓ ${context.agent} completed in ${duration}ms, cost: $${cost.toFixed(4)}`
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error(`[AgentRunner] ✗ ${context.agent} failed: ${errorMessage}`);

      throw new AgentExecutionError(context.agent, errorMessage, {
        duration,
        context,
      });
    }
  }

  /**
   * Execute multiple agents in parallel
   */
  async executeParallel(
    contexts: AgentExecutionContext[]
  ): Promise<AgentExecutionResult[]> {
    logger.info(`[AgentRunner] Executing ${contexts.length} agents in parallel`);

    const promises = contexts.map((context) => this.execute(context));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Convert rejection to failed result
        const context = contexts[index];
        const error = result.reason;
        return {
          success: false,
          agent: context.agent,
          output: '',
          tokensUsed: { input: 0, output: 0, cached: 0 },
          cost: 0,
          duration: 0,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });
  }

  // ============================================
  // Private Methods
  // ============================================

  private async loadSystemPrompt(config: AgentConfig): Promise<string> {
    const promptPath = path.join(process.cwd(), config.systemPromptPath);

    try {
      const content = await fs.readFile(promptPath, 'utf-8');

      // Strip frontmatter (YAML between ---) if present
      const frontmatterRegex = /^---\n[\s\S]*?\n---\n/;
      return content.replace(frontmatterRegex, '').trim();
    } catch (error) {
      throw new Error(`Failed to load system prompt: ${promptPath}`);
    }
  }

  private async prepareUserInput(context: AgentExecutionContext): Promise<string> {
    let input = context.input;

    // If input files are specified, prepend their contents
    if (context.inputFiles && context.inputFiles.length > 0) {
      const fileContents = await Promise.all(
        context.inputFiles.map(async (filePath) => {
          try {
            const fullPath = path.join(process.cwd(), filePath);
            const content = await fs.readFile(fullPath, 'utf-8');
            return `\n## File: ${filePath}\n\n${content}\n`;
          } catch (error) {
            logger.warn(`[AgentRunner] Could not read input file: ${filePath}`);
            return '';
          }
        })
      );

      input = fileContents.join('\n') + '\n\n' + input;
    }

    return input;
  }

  private async callGemini(params: {
    model: string;
    systemPrompt: string;
    userInput: string;
    temperature: number;
    maxTokens: number;
    agentName?: AgentName;
  }): Promise<{
    content: string;
    tokensUsed: { input: number; output: number; cached: number };
  }> {
    // Initialize conversation
    const messages: Anthropic.MessageParam[] = [
      {
        role: 'user',
        content: params.userInput,
      },
    ];

    // Use prompt caching if enabled
    const systemBlocks: any[] = this.cacheEnabled
      ? [
          {
            type: 'text',
            text: params.systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ]
      : [{ type: 'text', text: params.systemPrompt }];

    // Get tools if enabled
    let tools: ToolDefinition[] = [];
    if (this.toolsEnabled && params.agentName) {
      try {
        tools = await this.toolManager.getTools(params.agentName);
        logger.debug(`[AgentRunner] Loaded ${tools.length} tools for ${params.agentName}`);
      } catch (error) {
        logger.warn(`[AgentRunner] Could not load tools: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Token tracking
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCachedTokens = 0;
    let finalContent = '';

    // Agentic loop for tool calling
    const maxIterations = 10; // Prevent infinite loops
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      const response = await this.anthropic.messages.create({
        model: params.model,
        max_tokens: params.maxTokens,
        temperature: params.temperature,
        system: systemBlocks,
        messages,
        tools: tools.length > 0 ? tools as any : undefined,
      });

      // Track tokens
      const usage = response.usage;
      totalInputTokens += usage.input_tokens || 0;
      totalOutputTokens += usage.output_tokens || 0;
      totalCachedTokens += (usage as any).cache_read_input_tokens || 0;

      // Check stop reason
      if (response.stop_reason === 'tool_use') {
        logger.debug(`[AgentRunner] Agent requested tool use (iteration ${iteration})`);

        // Add assistant message to conversation
        messages.push({
          role: 'assistant',
          content: response.content,
        });

        // Execute tools
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            logger.info(`[AgentRunner] Executing tool: ${block.name}`);

            try {
              const result = await this.toolManager.executeTool(
                block.name,
                block.input as Record<string, any>
              );

              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: result.success
                  ? result.output || 'Tool executed successfully'
                  : `Error: ${result.error}`,
                is_error: !result.success,
              });

              logger.debug(
                `[AgentRunner] Tool ${block.name} ${result.success ? 'succeeded' : 'failed'}`
              );
            } catch (error) {
              logger.error(
                `[AgentRunner] Tool execution error: ${error instanceof Error ? error.message : String(error)}`
              );

              toolResults.push({
                type: 'tool_result',
                tool_use_id: block.id,
                content: `Error executing tool: ${error instanceof Error ? error.message : String(error)}`,
                is_error: true,
              });
            }
          }
        }

        // Add tool results to conversation
        messages.push({
          role: 'user',
          content: toolResults,
        });

        // Continue loop to get final response
        continue;
      }

      // No tool use - extract final content and break
      finalContent = response.content
        .filter((block) => block.type === 'text')
        .map((block) => ('text' in block ? block.text : ''))
        .join('\n');

      break;
    }

    if (iteration >= maxIterations) {
      logger.warn('[AgentRunner] Hit max tool calling iterations');
    }

    return {
      content: finalContent,
      tokensUsed: {
        input: totalInputTokens,
        output: totalOutputTokens,
        cached: totalCachedTokens,
      },
    };
  }

  private async saveOutput(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(fullPath, content, 'utf-8');
    logger.debug(`[AgentRunner] Saved output to: ${filePath}`);
  }

  private calculateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
    cachedTokens: number
  ): number {
    const modelName = model.includes('opus')
      ? 'opus'
      : model.includes('sonnet')
      ? 'sonnet'
      : 'haiku';

    const pricing = MODEL_PRICING[modelName];

    const inputCost = (inputTokens - cachedTokens) * (pricing.inputCostPer1M / 1_000_000);
    const outputCost = outputTokens * (pricing.outputCostPer1M / 1_000_000);
    const cachedCost = cachedTokens * (pricing.cachedCostPer1M / 1_000_000);

    return inputCost + outputCost + cachedCost;
  }

  private getModelId(model: string): string {
    const modelMap: Record<string, string> = {
      opus: 'gemini-1.5-pro',
      sonnet: 'gemini-1.5-pro',
      haiku: 'claude-3-haiku-20240307',
    };

    return modelMap[model] || modelMap['sonnet'];
  }
}

// ============================================
// Convenience Functions
// ============================================

/**
 * Execute a single agent (convenience function)
 */
export async function runAgent(
  context: AgentExecutionContext
): Promise<AgentExecutionResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const runner = new AgentRunner(apiKey);
  await runner.initialize(); // Initialize tool manager
  return await runner.execute(context);
}

/**
 * Execute multiple agents in parallel (convenience function)
 */
export async function runAgentsParallel(
  contexts: AgentExecutionContext[]
): Promise<AgentExecutionResult[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  const runner = new AgentRunner(apiKey);
  await runner.initialize(); // Initialize tool manager
  return await runner.executeParallel(contexts);
}
