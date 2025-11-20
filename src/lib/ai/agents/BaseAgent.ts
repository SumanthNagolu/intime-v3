/**
 * BaseAgent Framework
 *
 * Epic: 2.5 - AI Infrastructure (Sprint 2)
 * Story: AI-INF-005 - Base Agent Framework
 *
 * Abstract base class that all AI agents extend.
 * Provides optional integration with Sprint 1 components (AIRouter, MemoryManager, RAGRetriever)
 * and Sprint 2 components (HeliconeClient) for enhanced capabilities.
 *
 * Design Philosophy:
 * - All dependencies are OPTIONAL (backward compatibility with Sprint 4 code)
 * - Agents can gradually adopt features without breaking changes
 * - Provides utility methods for common patterns
 * - Automatic cost tracking when Helicone is configured
 * - Memory and RAG integration when available
 *
 * @module lib/ai/agents/BaseAgent
 */

import type { AIRouter } from '../router';
import type { MemoryManager } from '../memory/manager';
import type { RAGRetriever, RAGSearchOptions } from '../rag/retriever';
import type { HeliconeClient } from '../monitoring/helicone';
import type { Message } from '../memory/redis';
import type { RAGDocument } from '../rag/vectorStore';

/**
 * Agent configuration
 */
export interface AgentConfig {
  /** Organization ID */
  orgId?: string;
  /** User ID */
  userId?: string;
  /** Agent name (for logging) */
  agentName?: string;
  /** Enable automatic cost tracking */
  enableCostTracking?: boolean;
  /** Enable memory management */
  enableMemory?: boolean;
  /** Enable RAG */
  enableRAG?: boolean;
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Interaction metadata for logging
 */
export interface InteractionMetadata {
  /** Interaction type */
  type: string;
  /** Model used */
  model?: string;
  /** Tokens consumed */
  tokens?: number;
  /** Cost in USD */
  cost?: number;
  /** Latency in milliseconds */
  latencyMs?: number;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Model information
 */
export interface ModelInfo {
  /** Provider (openai, anthropic) */
  provider: string;
  /** Specific model name */
  model: string;
  /** Reasoning for selection */
  reasoning?: string;
  /** Estimated cost */
  estimatedCost?: number;
}

/**
 * Base Agent
 *
 * Abstract base class for all AI agents. Provides optional integration
 * with Sprint 1 and Sprint 2 components.
 *
 * @example Basic Agent
 * ```typescript
 * class SimpleAgent extends BaseAgent<string, string> {
 *   async execute(input: string): Promise<string> {
 *     return `Processed: ${input}`;
 *   }
 * }
 *
 * const agent = new SimpleAgent();
 * const result = await agent.execute('test');
 * ```
 *
 * @example Agent with Full Integration
 * ```typescript
 * class AdvancedAgent extends BaseAgent<QueryInput, QueryOutput> {
 *   constructor(config: Partial<AgentConfig>) {
 *     super(config);
 *   }
 *
 *   async execute(input: QueryInput): Promise<QueryOutput> {
 *     // Use router to select model
 *     const model = await this.routeModel('complex reasoning task');
 *
 *     // Remember conversation context
 *     const context = await this.rememberContext(input.conversationId);
 *
 *     // Search knowledge base
 *     const docs = await this.search(input.query);
 *
 *     // Process...
 *     const result = await this.process(input, context, docs, model);
 *
 *     // Track cost automatically
 *     await this.trackCost(result.tokens, result.cost);
 *
 *     return result;
 *   }
 * }
 * ```
 */
export abstract class BaseAgent<TInput = unknown, TOutput = unknown> {
  /** AI Router for model selection (optional) */
  protected router?: AIRouter;

  /** Memory Manager for conversation history (optional) */
  protected memory?: MemoryManager;

  /** RAG Retriever for semantic search (optional) */
  protected rag?: RAGRetriever;

  /** Helicone Client for cost tracking (optional) */
  protected helicone?: HeliconeClient;

  /** Agent configuration */
  protected config: AgentConfig;

  /**
   * Constructor
   *
   * @param config - Optional agent configuration
   * @param dependencies - Optional dependency injection
   */
  constructor(
    config?: Partial<AgentConfig>,
    dependencies?: {
      router?: AIRouter;
      memory?: MemoryManager;
      rag?: RAGRetriever;
      helicone?: HeliconeClient;
    }
  ) {
    this.config = {
      agentName: 'BaseAgent',
      enableCostTracking: false,
      enableMemory: false,
      enableRAG: false,
      ...config,
    };

    // Optional dependency injection
    if (dependencies) {
      this.router = dependencies.router;
      this.memory = dependencies.memory;
      this.rag = dependencies.rag;
      this.helicone = dependencies.helicone;
    }
  }

  /**
   * Execute agent logic
   *
   * This is the main method that each agent must implement.
   * It defines the agent's specific behavior.
   *
   * @param input - Input data for the agent
   * @returns Output data from the agent
   */
  abstract execute(input: TInput): Promise<TOutput>;

  /**
   * Route to optimal model for a task
   *
   * Uses AIRouter if available, otherwise returns default.
   *
   * @param taskDescription - Description of the task
   * @returns Model information
   *
   * @example
   * ```typescript
   * const model = await this.routeModel('classify screenshot activity');
   * console.log(model.model); // 'gpt-4o-mini'
   * console.log(model.reasoning); // 'Vision task - cost-effective'
   * ```
   */
  protected async routeModel(taskDescription: string): Promise<ModelInfo> {
    if (!this.router) {
      // Default fallback
      return {
        provider: 'openai',
        model: 'gpt-4o-mini',
        reasoning: 'Default model (no router configured)',
      };
    }

    const selection = await this.router.route({
      type: 'simple', // Conservative default
      description: taskDescription,
    });

    return {
      provider: selection.provider,
      model: selection.model,
      reasoning: selection.reasoning,
      estimatedCost: selection.estimatedCost,
    };
  }

  /**
   * Remember conversation context
   *
   * Uses MemoryManager if available, otherwise returns empty.
   *
   * @param conversationId - Conversation ID
   * @returns Array of messages in the conversation
   *
   * @example
   * ```typescript
   * const context = await this.rememberContext('conv-123');
   * console.log(context.length); // 5 messages
   * console.log(context[0].role); // 'user'
   * ```
   */
  protected async rememberContext(conversationId: string): Promise<Message[]> {
    if (!this.memory || !this.config.enableMemory) {
      return [];
    }

    try {
      const conversation = await this.memory.getConversation(conversationId);
      return conversation?.messages || [];
    } catch (error) {
      console.warn(
        `[${this.config.agentName}] Failed to retrieve context:`,
        error
      );
      return [];
    }
  }

  /**
   * Search knowledge base
   *
   * Uses RAGRetriever if available, otherwise returns empty.
   *
   * @param query - Search query
   * @param options - Search options
   * @returns Relevant documents
   *
   * @example
   * ```typescript
   * const docs = await this.search('How to implement Rating module?', {
   *   topK: 5,
   *   minSimilarity: 0.8
   * });
   * console.log(docs[0].content); // Most relevant documentation
   * ```
   */
  protected async search(
    query: string,
    options?: RAGSearchOptions
  ): Promise<RAGDocument[]> {
    if (!this.rag || !this.config.enableRAG) {
      return [];
    }

    try {
      return await this.rag.search(query, options);
    } catch (error) {
      console.warn(
        `[${this.config.agentName}] Failed to search knowledge base:`,
        error
      );
      return [];
    }
  }

  /**
   * Track cost of AI request
   *
   * Uses HeliconeClient if available and enabled.
   *
   * @param tokens - Total tokens used
   * @param cost - Cost in USD
   * @param model - Model used
   * @param latencyMs - Request latency
   *
   * @example
   * ```typescript
   * await this.trackCost(1500, 0.0004, 'gpt-4o-mini', 1200);
   * ```
   */
  protected async trackCost(
    tokens: number,
    cost: number,
    model?: string,
    latencyMs?: number
  ): Promise<void> {
    if (!this.helicone || !this.config.enableCostTracking) {
      return;
    }

    if (!this.config.orgId || !this.config.userId) {
      console.warn(
        `[${this.config.agentName}] Cannot track cost: orgId or userId not configured`
      );
      return;
    }

    try {
      await this.helicone.trackRequest({
        orgId: this.config.orgId,
        userId: this.config.userId,
        provider: model?.includes('gpt') ? 'openai' : 'anthropic',
        model: model || 'unknown',
        inputTokens: Math.floor(tokens * 0.6), // Rough estimate: 60% input
        outputTokens: Math.floor(tokens * 0.4), // 40% output
        costUsd: cost,
        latencyMs: latencyMs || 0,
        metadata: {
          agentName: this.config.agentName || 'unknown',
          ...this.config.metadata,
        },
      });
    } catch (error) {
      console.warn(
        `[${this.config.agentName}] Failed to track cost:`,
        error
      );
    }
  }

  /**
   * Log interaction metadata
   *
   * Logs to console for now. In production, this could log to database,
   * monitoring service, etc.
   *
   * @param metadata - Interaction metadata
   *
   * @example
   * ```typescript
   * await this.logInteraction({
   *   type: 'query',
   *   model: 'gpt-4o-mini',
   *   tokens: 1500,
   *   cost: 0.0004,
   *   latencyMs: 1200,
   * });
   * ```
   */
  protected async logInteraction(metadata: InteractionMetadata): Promise<void> {
    console.log(`[${this.config.agentName}] Interaction:`, {
      timestamp: new Date().toISOString(),
      ...metadata,
    });

    // Auto-track cost if enabled
    if (metadata.tokens && metadata.cost) {
      await this.trackCost(
        metadata.tokens,
        metadata.cost,
        metadata.model,
        metadata.latencyMs
      );
    }
  }

  /**
   * Get agent configuration
   *
   * @returns Current configuration
   */
  getConfig(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Update agent configuration
   *
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if router is available
   *
   * @returns True if router is configured
   */
  hasRouter(): boolean {
    return !!this.router;
  }

  /**
   * Check if memory is available
   *
   * @returns True if memory is configured and enabled
   */
  hasMemory(): boolean {
    return !!this.memory && !!this.config.enableMemory;
  }

  /**
   * Check if RAG is available
   *
   * @returns True if RAG is configured and enabled
   */
  hasRAG(): boolean {
    return !!this.rag && !!this.config.enableRAG;
  }

  /**
   * Check if cost tracking is available
   *
   * @returns True if Helicone is configured and tracking is enabled
   */
  hasCostTracking(): boolean {
    return !!this.helicone && !!this.config.enableCostTracking;
  }
}

/**
 * Example Agent Implementation
 *
 * Demonstrates how to extend BaseAgent with all features.
 */
export class ExampleAgent extends BaseAgent<string, string> {
  constructor(config?: Partial<AgentConfig>) {
    super(config);
  }

  async execute(input: string): Promise<string> {
    const startTime = performance.now();

    // Optional: Route to optimal model
    if (this.hasRouter()) {
      const model = await this.routeModel(`Process query: ${input}`);
      console.log(`Using model: ${model.model} (${model.reasoning})`);
    }

    // Optional: Remember context
    if (this.hasMemory()) {
      const context = await this.rememberContext('example-conv-123');
      console.log(`Retrieved ${context.length} messages from memory`);
    }

    // Optional: Search knowledge base
    if (this.hasRAG()) {
      const docs = await this.search(input, { topK: 3 });
      console.log(`Found ${docs.length} relevant documents`);
    }

    // Process input (example)
    const output = `Processed: ${input}`;

    // Log interaction
    const latencyMs = performance.now() - startTime;
    await this.logInteraction({
      type: 'query',
      model: 'example-model',
      tokens: 100,
      cost: 0.0001,
      latencyMs,
    });

    return output;
  }
}
