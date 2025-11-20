/**
 * RAG Retriever
 *
 * High-level API for semantic search over knowledge base.
 * Combines embedder and vector store for easy RAG implementation.
 *
 * Performance SLA: <500ms search latency
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Embedder } from './embedder';
import { VectorStore, type RAGDocument } from './vectorStore';
import { Chunker, type Document } from './chunker';

/**
 * RAG search options
 */
export interface RAGSearchOptions {
  /** Number of results to return (default: 5) */
  topK?: number;
  /** Minimum similarity threshold (default: 0.7) */
  minSimilarity?: number;
  /** Metadata filter */
  filter?: Record<string, unknown>;
}

/**
 * RAG indexing result
 */
export interface RAGIndexResult {
  /** Number of documents indexed */
  documentsIndexed: number;
  /** Number of chunks created */
  chunksCreated: number;
  /** Total tokens used */
  tokensUsed: number;
  /** Estimated cost in USD */
  cost: number;
}

/**
 * RAG Retriever
 *
 * Main entry point for RAG operations.
 */
export class RAGRetriever {
  private embedder: Embedder;
  private vectorStore: VectorStore;
  private chunker: Chunker;

  constructor(
    supabase: SupabaseClient,
    options: {
      embedder?: Embedder;
      vectorStore?: VectorStore;
      chunker?: Chunker;
    } = {}
  ) {
    this.embedder = options.embedder || new Embedder();
    this.vectorStore = options.vectorStore || new VectorStore(supabase);
    this.chunker = options.chunker || new Chunker();
  }

  /**
   * Search for relevant documents
   *
   * @param query - Natural language query
   * @param options - Search options
   * @returns Ranked documents by similarity
   *
   * @example
   * ```typescript
   * const retriever = new RAGRetriever(supabase);
   * const results = await retriever.search(
   *   'How do I implement Rating module?',
   *   { topK: 5, minSimilarity: 0.7 }
   * );
   * console.log(results[0].content); // Most relevant document
   * console.log(results[0].similarity); // 0.92
   * ```
   */
  async search(
    query: string,
    options: RAGSearchOptions = {}
  ): Promise<RAGDocument[]> {
    const startTime = performance.now();

    // 1. Generate embedding for query
    const { embedding } = await this.embedder.embed(query);

    // 2. Cosine similarity search in pgvector
    const results = await this.vectorStore.search(
      embedding,
      options.topK || 5,
      options.filter
    );

    // 3. Filter by minimum similarity
    const minSimilarity = options.minSimilarity ?? 0.7;
    const filtered = results.filter(doc => doc.similarity >= minSimilarity);

    const elapsedTime = performance.now() - startTime;

    // Performance SLA check: <500ms
    if (elapsedTime > 500) {
      console.warn(
        `RAGRetriever: Search time ${elapsedTime.toFixed(2)}ms exceeds SLA of 500ms`
      );
    }

    return filtered;
  }

  /**
   * Index new documents
   *
   * @param documents - Documents to index
   * @returns Indexing result
   *
   * @example
   * ```typescript
   * const result = await retriever.index([
   *   {
   *     id: 'doc1',
   *     content: 'Rating module implementation guide...',
   *     metadata: { type: 'guide', module: 'rating' }
   *   }
   * ]);
   * console.log(result.chunksCreated); // 5
   * console.log(result.cost); // $0.0001
   * ```
   */
  async index(documents: Document[]): Promise<RAGIndexResult> {
    // 1. Chunk large documents (512 tokens, 50 overlap)
    const chunks = await this.chunker.chunk(documents);

    // 2. Generate embeddings
    const { embeddings, totalTokens, cost } = await this.embedder.batchEmbed(
      chunks.map(c => c.content)
    );

    // 3. Store in pgvector
    await this.vectorStore.insertBatch(chunks, embeddings);

    return {
      documentsIndexed: documents.length,
      chunksCreated: chunks.length,
      tokensUsed: totalTokens,
      cost,
    };
  }

  /**
   * Delete documents by ID
   *
   * @param documentId - Document ID to delete
   * @returns Number of chunks deleted
   */
  async deleteDocument(documentId: string): Promise<number> {
    return this.vectorStore.deleteByDocumentId(documentId);
  }

  /**
   * Delete documents by metadata filter
   *
   * @param filter - Metadata filter
   * @returns Number of chunks deleted
   */
  async deleteByMetadata(filter: Record<string, unknown>): Promise<number> {
    return this.vectorStore.deleteByMetadata(filter);
  }

  /**
   * Get total indexed chunk count
   *
   * @returns Total number of chunks
   */
  async getIndexedCount(): Promise<number> {
    return this.vectorStore.count();
  }

  /**
   * Clear all indexed documents (USE WITH CAUTION)
   *
   * @returns Number of chunks deleted
   */
  async clearIndex(): Promise<number> {
    return this.vectorStore.clear();
  }

  /**
   * Re-index documents (delete old, index new)
   *
   * @param documents - Documents to re-index
   * @returns Indexing result
   */
  async reindex(documents: Document[]): Promise<RAGIndexResult> {
    // Delete old documents
    for (const doc of documents) {
      await this.deleteDocument(doc.id);
    }

    // Index new documents
    return this.index(documents);
  }

  /**
   * Get indexing cost estimate
   *
   * @param documents - Documents to estimate
   * @returns Estimated cost in USD
   */
  async estimateIndexingCost(documents: Document[]): Promise<number> {
    const chunks = await this.chunker.chunk(documents);
    return this.embedder.estimateCost(chunks.map(c => c.content));
  }
}
