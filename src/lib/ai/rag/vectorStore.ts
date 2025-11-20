/**
 * Vector Store
 *
 * pgvector operations on Supabase PostgreSQL.
 * Performs cosine similarity search for RAG.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Chunk } from './chunker';

/**
 * RAG document result
 */
export interface RAGDocument {
  /** Document/chunk ID */
  id: string;
  /** Document content */
  content: string;
  /** Metadata */
  metadata: Record<string, unknown>;
  /** Similarity score (0.0 to 1.0) */
  similarity: number;
}

/**
 * Vector store entry
 */
export interface VectorEntry {
  /** Entry ID */
  id: string;
  /** Text content */
  content: string;
  /** Embedding vector */
  embedding: number[];
  /** Metadata */
  metadata: Record<string, unknown>;
}

/**
 * Vector Store
 *
 * Manages pgvector operations for semantic search.
 */
export class VectorStore {
  private supabase: SupabaseClient;
  private tableName: string;

  constructor(
    supabase: SupabaseClient,
    tableName: string = 'ai_embeddings'
  ) {
    this.supabase = supabase;
    this.tableName = tableName;
  }

  /**
   * Search for similar documents using cosine similarity
   *
   * @param queryEmbedding - Query embedding vector
   * @param topK - Number of results to return (default: 5)
   * @param filter - Optional metadata filter
   * @returns Ranked documents by similarity
   *
   * @example
   * ```typescript
   * const results = await vectorStore.search(queryEmbedding, 5);
   * console.log(results[0].similarity); // 0.92
   * console.log(results[0].content); // "Rating module implementation..."
   * ```
   */
  async search(
    queryEmbedding: number[],
    topK: number = 5,
    filter?: Record<string, unknown>
  ): Promise<RAGDocument[]> {
    // Build the RPC call for cosine similarity search
    // Using pgvector's <=> operator for cosine distance
    // Note: Filters should be applied in the RPC function itself
    // For now, we'll pass the filter as a parameter (implementation in migration)
    const { data, error } = await this.supabase.rpc('search_embeddings', {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_metadata: filter || null,
    });

    if (error) {
      throw new Error(`Vector search failed: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Transform results to RAGDocument format
    return data.map((row: {
      id: string;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata || {},
      similarity: row.similarity,
    }));
  }

  /**
   * Insert a single vector entry
   *
   * @param entry - Vector entry to insert
   * @returns Inserted entry ID
   */
  async insert(entry: VectorEntry): Promise<string> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert({
        id: entry.id,
        content: entry.content,
        embedding: entry.embedding,
        metadata: entry.metadata,
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Vector insert failed: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Insert multiple vector entries (batch)
   *
   * @param chunks - Chunks to insert
   * @param embeddings - Corresponding embeddings
   * @returns Number of entries inserted
   */
  async insertBatch(
    chunks: Chunk[],
    embeddings: number[][]
  ): Promise<number> {
    if (chunks.length !== embeddings.length) {
      throw new Error('Chunks and embeddings length mismatch');
    }

    if (chunks.length === 0) {
      return 0;
    }

    // Build insert entries
    const entries = chunks.map((chunk, idx) => ({
      id: `${chunk.documentId}_${chunk.chunkIndex}`,
      content: chunk.content,
      embedding: embeddings[idx],
      metadata: chunk.metadata,
    }));

    const { error, count } = await this.supabase
      .from(this.tableName)
      .insert(entries);

    if (error) {
      throw new Error(`Batch insert failed: ${error.message}`);
    }

    return count || entries.length;
  }

  /**
   * Delete vector entries by document ID
   *
   * @param documentId - Document ID to delete
   * @returns Number of entries deleted
   */
  async deleteByDocumentId(documentId: string): Promise<number> {
    const { error, count } = await this.supabase
      .from(this.tableName)
      .delete()
      .like('id', `${documentId}_%`);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Delete vector entries by metadata filter
   *
   * @param filter - Metadata filter
   * @returns Number of entries deleted
   */
  async deleteByMetadata(filter: Record<string, unknown>): Promise<number> {
    let query = this.supabase.from(this.tableName).delete();

    for (const [key, value] of Object.entries(filter)) {
      query = query.filter(`metadata->${key}`, 'eq', value);
    }

    const { error, count } = await query;

    if (error) {
      throw new Error(`Delete by metadata failed: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get total entry count
   *
   * @returns Total number of entries
   */
  async count(): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Count failed: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get entry by ID
   *
   * @param id - Entry ID
   * @returns Vector entry or null
   */
  async getById(id: string): Promise<VectorEntry | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Get by ID failed: ${error.message}`);
    }

    return data as VectorEntry;
  }

  /**
   * Clear all entries (USE WITH CAUTION)
   *
   * @returns Number of entries deleted
   */
  async clear(): Promise<number> {
    const { error, count } = await this.supabase
      .from(this.tableName)
      .delete()
      .neq('id', ''); // Delete all

    if (error) {
      throw new Error(`Clear failed: ${error.message}`);
    }

    return count || 0;
  }
}
