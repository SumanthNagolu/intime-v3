/**
 * Text Chunker
 *
 * Splits documents into 512-token chunks with 50-token overlap.
 * Preserves context across chunks for better retrieval quality.
 */

/**
 * Document to be chunked
 */
export interface Document {
  /** Unique document identifier */
  id: string;
  /** Document content */
  content: string;
  /** Metadata to be attached to all chunks */
  metadata: Record<string, unknown>;
}

/**
 * Text chunk with metadata
 */
export interface Chunk {
  /** Parent document ID */
  documentId: string;
  /** Chunk index (0-based) */
  chunkIndex: number;
  /** Chunk content */
  content: string;
  /** Combined metadata (document + chunk) */
  metadata: Record<string, unknown>;
}

/**
 * Chunking configuration
 */
export interface ChunkingConfig {
  /** Maximum tokens per chunk (default: 512) */
  maxTokens?: number;
  /** Token overlap between chunks (default: 50) */
  overlapTokens?: number;
  /** Preserve sentence boundaries (default: true) */
  preserveSentences?: boolean;
}

/**
 * Default chunking configuration
 */
const DEFAULT_CONFIG: Required<ChunkingConfig> = {
  maxTokens: 512,
  overlapTokens: 50,
  preserveSentences: true,
};

/**
 * Text Chunker
 *
 * Splits documents into overlapping chunks for RAG.
 */
export class Chunker {
  private config: Required<ChunkingConfig>;

  constructor(config: ChunkingConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Chunk multiple documents
   *
   * @param documents - Documents to chunk
   * @returns Array of chunks
   */
  async chunk(documents: Document[]): Promise<Chunk[]> {
    const allChunks: Chunk[] = [];

    for (const doc of documents) {
      const chunks = await this.chunkDocument(doc);
      allChunks.push(...chunks);
    }

    return allChunks;
  }

  /**
   * Chunk a single document
   *
   * @param document - Document to chunk
   * @returns Array of chunks
   */
  async chunkDocument(document: Document): Promise<Chunk[]> {
    const { content, id, metadata } = document;

    // Handle empty content
    if (!content || content.trim().length === 0) {
      return [];
    }

    // Split into sentences if configured
    const segments = this.config.preserveSentences
      ? this.splitIntoSentences(content)
      : [content];

    const chunks: Chunk[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;

    for (const segment of segments) {
      const segmentTokens = this.estimateTokens(segment);

      // If adding this segment exceeds max tokens, save current chunk
      if (currentTokens + segmentTokens > this.config.maxTokens && currentChunk.length > 0) {
        chunks.push(this.createChunk(id, chunks.length, currentChunk.join(' '), metadata));

        // Keep overlap tokens for context
        const overlapText = this.getOverlapText(currentChunk.join(' '));
        currentChunk = overlapText ? [overlapText] : [];
        currentTokens = overlapText ? this.estimateTokens(overlapText) : 0;
      }

      // Add segment to current chunk
      currentChunk.push(segment);
      currentTokens += segmentTokens;
    }

    // Add final chunk if any content remains
    if (currentChunk.length > 0) {
      chunks.push(this.createChunk(id, chunks.length, currentChunk.join(' '), metadata));
    }

    return chunks;
  }

  /**
   * Split text into sentences
   *
   * @param text - Text to split
   * @returns Array of sentences
   */
  private splitIntoSentences(text: string): string[] {
    // Split on sentence endings, preserving the delimiter
    const sentences = text
      .split(/([.!?]+\s+)/)
      .filter(s => s.trim().length > 0);

    // Recombine sentences with their delimiters
    const result: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] || '';
      const delimiter = sentences[i + 1] || '';
      result.push((sentence + delimiter).trim());
    }

    return result;
  }

  /**
   * Estimate token count for text
   *
   * Uses rough approximation: 1 token ≈ 4 characters
   * This is conservative for English text.
   *
   * @param text - Text to estimate
   * @returns Estimated token count
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Get overlap text from end of chunk
   *
   * @param text - Full chunk text
   * @returns Overlap text (last N tokens)
   */
  private getOverlapText(text: string): string {
    const totalTokens = this.estimateTokens(text);

    // If chunk is smaller than overlap, return full text
    if (totalTokens <= this.config.overlapTokens) {
      return text;
    }

    // Calculate character position for overlap
    const overlapChars = this.config.overlapTokens * 4;
    const startPos = Math.max(0, text.length - overlapChars);

    return text.substring(startPos);
  }

  /**
   * Create a chunk object
   *
   * @param documentId - Parent document ID
   * @param index - Chunk index
   * @param content - Chunk content
   * @param metadata - Document metadata
   * @returns Chunk object
   */
  private createChunk(
    documentId: string,
    index: number,
    content: string,
    metadata: Record<string, unknown>
  ): Chunk {
    return {
      documentId,
      chunkIndex: index,
      content: content.trim(),
      metadata: {
        ...metadata,
        chunkIndex: index,
        tokenCount: this.estimateTokens(content),
      },
    };
  }

  /**
   * Get chunking statistics for documents
   *
   * @param documents - Documents to analyze
   * @returns Statistics
   */
  async getChunkingStats(documents: Document[]): Promise<{
    totalDocuments: number;
    totalChunks: number;
    avgChunksPerDoc: number;
    avgTokensPerChunk: number;
  }> {
    const chunks = await this.chunk(documents);

    const totalTokens = chunks.reduce(
      (sum, chunk) => sum + this.estimateTokens(chunk.content),
      0
    );

    return {
      totalDocuments: documents.length,
      totalChunks: chunks.length,
      avgChunksPerDoc: chunks.length / (documents.length || 1),
      avgTokensPerChunk: totalTokens / (chunks.length || 1),
    };
  }
}
