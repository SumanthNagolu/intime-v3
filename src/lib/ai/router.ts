/**
 * AI Model Router
 *
 * Intelligently selects the best model for each task based on:
 * - Task complexity
 * - Cost optimization
 * - Performance requirements
 *
 * Decision Logic:
 * - simple: gpt-4o-mini (10x cheaper)
 * - reasoning: gpt-4o (better quality)
 * - complex: claude-sonnet-4-5 (multi-step reasoning)
 * - vision: gpt-4o-mini (vision support)
 *
 * Performance SLA: <100ms decision time
 */

/**
 * AI task types
 */
export type AITaskType = 'simple' | 'reasoning' | 'complex' | 'vision';

/**
 * AI model providers
 */
export type AIProvider = 'openai' | 'anthropic';

/**
 * AI task definition
 */
export interface AITask {
  /** Type of task (determines model selection) */
  type: AITaskType;
  /** Human-readable description of the task */
  description: string;
  /** Additional context for decision-making */
  context?: Record<string, unknown>;
}

/**
 * Model selection result
 */
export interface ModelSelection {
  /** Selected AI provider */
  provider: AIProvider;
  /** Specific model identifier */
  model: string;
  /** Reasoning for this selection */
  reasoning: string;
  /** Estimated cost in USD */
  estimatedCost: number;
}

/**
 * Model pricing (USD per 1M tokens)
 */
interface ModelPricing {
  input: number;
  output: number;
}

/**
 * Model configuration
 */
interface ModelConfig {
  provider: AIProvider;
  model: string;
  pricing: ModelPricing;
  capabilities: string[];
}

/**
 * Available models with pricing
 */
const MODELS: Record<string, ModelConfig> = {
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    pricing: { input: 0.15, output: 0.60 },
    capabilities: ['text', 'vision', 'fast', 'cheap'],
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    pricing: { input: 2.50, output: 10.00 },
    capabilities: ['text', 'vision', 'reasoning', 'quality'],
  },
  'claude-sonnet-4-5': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20250929',
    pricing: { input: 3.00, output: 15.00 },
    capabilities: ['text', 'complex', 'reasoning', 'multi-step'],
  },
};

/**
 * AI Router
 *
 * Routes AI tasks to the optimal model based on type and context.
 */
export class AIRouter {
  /**
   * Select the optimal model for a task
   *
   * @param task - Task description and type
   * @returns Selected model with reasoning
   *
   * @example
   * ```typescript
   * const router = new AIRouter();
   * const selection = await router.route({
   *   type: 'simple',
   *   description: 'Classify this activity log entry'
   * });
   * console.log(selection.model); // 'gpt-4o-mini'
   * ```
   */
  async route(task: AITask): Promise<ModelSelection> {
    const startTime = performance.now();

    // Decision tree based on task type
    let selectedModel: string;
    let reasoning: string;

    switch (task.type) {
      case 'simple':
        selectedModel = 'gpt-4o-mini';
        reasoning = 'Simple task - optimizing for cost with gpt-4o-mini (10x cheaper)';
        break;

      case 'reasoning':
        selectedModel = 'gpt-4o';
        reasoning = 'Reasoning task - using gpt-4o for better logical capabilities';
        break;

      case 'complex':
        selectedModel = 'claude-sonnet-4-5';
        reasoning = 'Complex task - using Claude Sonnet 4.5 for multi-step reasoning';
        break;

      case 'vision':
        selectedModel = 'gpt-4o-mini';
        reasoning = 'Vision task - using gpt-4o-mini for cost-effective vision support';
        break;

      default:
        // Type safety exhaustive check
        const _exhaustive: never = task.type;
        throw new Error(`Unknown task type: ${_exhaustive}`);
    }

    const config = MODELS[selectedModel];
    if (!config) {
      throw new Error(`Model configuration not found: ${selectedModel}`);
    }

    // Estimate cost (assuming 1000 input tokens, 500 output tokens as baseline)
    const estimatedCost = this.estimateCost(task, 1000, 500);

    const elapsedTime = performance.now() - startTime;

    // Performance SLA check: <100ms
    if (elapsedTime > 100) {
      console.warn(
        `AIRouter: Decision time ${elapsedTime.toFixed(2)}ms exceeds SLA of 100ms`
      );
    }

    return {
      provider: config.provider,
      model: config.model,
      reasoning,
      estimatedCost,
    };
  }

  /**
   * Get cost estimate for a task
   *
   * @param task - Task to estimate
   * @param inputTokens - Estimated input token count
   * @param outputTokens - Estimated output token count
   * @returns Cost in USD
   *
   * @example
   * ```typescript
   * const cost = router.estimateCost(
   *   { type: 'simple', description: 'test' },
   *   1000,
   *   500
   * );
   * console.log(`$${cost.toFixed(4)}`); // $0.0004
   * ```
   */
  estimateCost(
    task: AITask,
    inputTokens: number,
    outputTokens: number = 500
  ): number {
    // Get model config based on task type
    let modelKey: string;
    switch (task.type) {
      case 'simple':
      case 'vision':
        modelKey = 'gpt-4o-mini';
        break;
      case 'reasoning':
        modelKey = 'gpt-4o';
        break;
      case 'complex':
        modelKey = 'claude-sonnet-4-5';
        break;
      default:
        const _exhaustive: never = task.type;
        throw new Error(`Unknown task type: ${_exhaustive}`);
    }

    const config = MODELS[modelKey];
    if (!config) {
      throw new Error(`Model configuration not found: ${modelKey}`);
    }

    // Calculate cost (pricing is per 1M tokens)
    const inputCost = (inputTokens / 1_000_000) * config.pricing.input;
    const outputCost = (outputTokens / 1_000_000) * config.pricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get all available models
   *
   * @returns List of available models with capabilities
   */
  getAvailableModels(): ModelConfig[] {
    return Object.values(MODELS);
  }

  /**
   * Get model configuration by name
   *
   * @param modelName - Model name (e.g., 'gpt-4o-mini')
   * @returns Model configuration or undefined
   */
  getModelConfig(modelName: string): ModelConfig | undefined {
    return MODELS[modelName];
  }
}

/**
 * Default router instance (singleton)
 */
let defaultRouter: AIRouter | null = null;

/**
 * Get the default router instance
 *
 * @returns Default AIRouter instance
 */
export function getDefaultRouter(): AIRouter {
  if (!defaultRouter) {
    defaultRouter = new AIRouter();
  }
  return defaultRouter;
}

/**
 * Reset the default router (useful for testing)
 */
export function resetDefaultRouter(): void {
  defaultRouter = null;
}
