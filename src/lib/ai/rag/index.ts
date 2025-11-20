/**
 * RAG Infrastructure
 *
 * Semantic search over knowledge base using pgvector.
 *
 * @module lib/ai/rag
 */

export { Chunker, type Document, type Chunk, type ChunkingConfig } from './chunker';
export {
  Embedder,
  type EmbeddingResult,
  type BatchEmbeddingResult,
  type EmbedderConfig,
} from './embedder';
export {
  VectorStore,
  type RAGDocument,
  type VectorEntry,
} from './vectorStore';
export {
  RAGRetriever,
  type RAGSearchOptions,
  type RAGIndexResult,
} from './retriever';
