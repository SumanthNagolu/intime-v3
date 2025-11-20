/**
 * Text Embedder
 *
 * Uses OpenAI text-embedding-3-small ($0.02 per 1M tokens)
 * Generates 1536-dimensional embeddings for semantic search.
 */

import OpenAI from 'openai';

/**
 * Embedding result
 */
export interface EmbeddingResult {
  /** Embedding vector (1536 dimensions) */
  embedding: number[];
  /** Token count */
  tokens: number;
}

/**
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  /** Array of embeddings */
  embeddings: number[][];
  /** Total tokens used */
  totalTokens: number;
  /** Estimated cost in USD */
  cost: number;
}

/**
 * Embedder configuration
 */
export interface EmbedderConfig {
  /** OpenAI client (optional, will create default if not provided) */
  openai?: OpenAI;
  /** Model to use (default: text-embedding-3-small) */
  model?: string;
  /** Max batch size (default: 100) */
  maxBatchSize?: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  model: 'text-embedding-3-small',
  maxBatchSize: 100,
};

/**
 * Pricing for text-embedding-3-small (per 1M tokens)
 */
const EMBEDDING_PRICE_PER_MILLION = 0.02;

/**
 * Text Embedder
 *
 * Generates embeddings for semantic search.
 */
export class Embedder {
  private openai: OpenAI;
  private model: string;
  private maxBatchSize: number;

  constructor(config: EmbedderConfig = {}) {
    this.openai = config.openai || new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = config.model || DEFAULT_CONFIG.model;
    this.maxBatchSize = config.maxBatchSize || DEFAULT_CONFIG.maxBatchSize;
  }

  /**
   * Generate embedding for a single text
   *
   * @param text - Text to embed
   * @returns Embedding vector
   *
   * @example
   * ```typescript
   * const embedder = new Embedder();
   * const result = await embedder.embed('How do I implement Rating module?');
   * console.log(result.embedding.length); // 1536
   * console.log(result.tokens); // ~12
   * ```
   */
  async embed(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    const response = await this.openai.embeddings.create({
      model: this.model,
      input: text,
      encoding_format: 'float',
    });

    const data = response.data[0];
    if (!data) {
      throw new Error('No embedding returned from API');
    }

    return {
      embedding: data.embedding,
      tokens: response.usage.total_tokens,
    };
  }

  /**
   * Generate embeddings for multiple texts (batch)
   *
   * Automatically splits into multiple API calls if batch is too large.
   *
   * @param texts - Texts to embed
   * @returns Batch embedding result
   *
   * @example
   * ```typescript
   * const embedder = new Embedder();
   * const result = await embedder.batchEmbed([
   *   'First document',
   *   'Second document',
   *   'Third document'
   * ]);
   * console.log(result.embeddings.length); // 3
   * console.log(result.cost); // $0.000001 (approximately)
   * ```
   */
  async batchEmbed(texts: string[]): Promise<BatchEmbeddingResult> {
    if (texts.length === 0) {
      return {
        embeddings: [],
        totalTokens: 0,
        cost: 0,
      };
    }

    // Filter out empty texts
    const validTexts = texts.filter(t => t && t.trim().length > 0);
    if (validTexts.length === 0) {
      throw new Error('All texts are empty');
    }

    // Split into batches if needed
    const batches = this.splitIntoBatches(validTexts);
    const allEmbeddings: number[][] = [];
    let totalTokens = 0;

    for (const batch of batches) {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: batch,
        encoding_format: 'float',
      });

      const embeddings = response.data.map(d => d.embedding);
      allEmbeddings.push(...embeddings);
      totalTokens += response.usage.total_tokens;
    }

    const cost = this.calculateCost(totalTokens);

    return {
      embeddings: allEmbeddings,
      totalTokens,
      cost,
    };
  }

  /**
   * Calculate cost for token count
   *
   * @param tokens - Token count
   * @returns Cost in USD
   */
  private calculateCost(tokens: number): number {
    return (tokens / 1_000_000) * EMBEDDING_PRICE_PER_MILLION;
  }

  /**
   * Split texts into batches
   *
   * @param texts - Texts to split
   * @returns Array of batches
   */
  private splitIntoBatches(texts: string[]): string[][] {
    const batches: string[][] = [];

    for (let i = 0; i < texts.length; i += this.maxBatchSize) {
      batches.push(texts.slice(i, i + this.maxBatchSize));
    }

    return batches;
  }

  /**
   * Get embedding dimensions
   *
   * @returns Dimension count (1536 for text-embedding-3-small)
   */
  getDimensions(): number {
    return 1536;
  }

  /**
   * Estimate cost for texts
   *
   * @param texts - Texts to estimate
   * @returns Estimated cost in USD
   */
  async estimateCost(texts: string[]): Promise<number> {
    // Rough estimate: 1 token ≈ 4 characters
    const totalChars = texts.reduce((sum, text) => sum + text.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4);

    return this.calculateCost(estimatedTokens);
  }
}
