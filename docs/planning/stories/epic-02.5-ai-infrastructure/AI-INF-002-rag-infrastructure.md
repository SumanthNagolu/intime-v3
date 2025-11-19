# AI-INF-002: RAG Infrastructure

**Story Points:** 8
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** HIGH (Foundation for Knowledge Retrieval)

---

## User Story

As an **AI Agent**,
I want **to retrieve relevant context from knowledge base** (curriculum, policies, best practices),
So that **my responses are accurate, up-to-date, and grounded in facts** (not hallucinations).

---

## Acceptance Criteria

- [ ] pgvector extension enabled in Supabase PostgreSQL
- [ ] Document indexing pipeline: Text → Chunks → Embeddings → pgvector
- [ ] Semantic search: Query → Embedding → Cosine similarity → Top K results
- [ ] Indexable collections: curriculum, policies, resumes, job descriptions
- [ ] Search threshold: 0.7 cosine similarity (70%+ relevance)
- [ ] Performance: <500ms search latency
- [ ] Storage: 1M+ vectors supported
- [ ] Testing: 85%+ retrieval accuracy
- [ ] Chunk size optimization (512-1024 tokens)
- [ ] Metadata filtering support

---

## Technical Implementation

### Database Migration

Create file: `supabase/migrations/011_rag_infrastructure.sql`

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge chunks table
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  collection TEXT NOT NULL, -- 'curriculum' | 'policies' | 'resumes' | 'job_descriptions'
  source_document_id TEXT, -- Original document reference

  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- { module: 'PolicyCenter', topic: 'Rating', ... }

  embedding vector(1536), -- OpenAI text-embedding-3-small dimension

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_collection CHECK (
    collection IN ('curriculum', 'policies', 'resumes', 'job_descriptions', 'knowledge_base')
  )
);

-- Indexes for performance
CREATE INDEX idx_knowledge_collection ON knowledge_chunks(collection);
CREATE INDEX idx_knowledge_metadata ON knowledge_chunks USING gin(metadata);

-- Vector similarity index (CRITICAL for performance)
CREATE INDEX idx_knowledge_embedding ON knowledge_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Updated timestamp trigger
CREATE TRIGGER update_knowledge_chunks_updated_at
  BEFORE UPDATE ON knowledge_chunks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Vector similarity search function
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  collection_name text DEFAULT NULL,
  filter_metadata jsonb DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    k.id,
    k.content,
    k.metadata,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks k
  WHERE
    (collection_name IS NULL OR k.collection = collection_name)
    AND (filter_metadata IS NULL OR k.metadata @> filter_metadata)
    AND 1 - (k.embedding <=> query_embedding) > match_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Row Level Security
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read
CREATE POLICY knowledge_read_all ON knowledge_chunks
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Only admins can insert/update/delete
CREATE POLICY knowledge_admin_write ON knowledge_chunks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin', 'trainer')
    )
  );
```

### RAG Service

Create file: `src/lib/ai/rag.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export type DocumentChunk = {
  id?: string;
  content: string;
  metadata: Record<string, any>;
  sourceDocumentId?: string;
};

export type SearchResult = {
  id: string;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
};

export class RAGLayer {
  /**
   * Index documents for semantic search
   */
  async indexDocuments(
    documents: DocumentChunk[],
    collection: string
  ): Promise<void> {
    const chunks = await this.chunkDocuments(documents);

    for (const chunk of chunks) {
      // Generate embedding
      const embedding = await this.generateEmbedding(chunk.content);

      // Store in pgvector
      await supabase.from('knowledge_chunks').insert({
        id: chunk.id,
        collection,
        source_document_id: chunk.sourceDocumentId,
        content: chunk.content,
        metadata: chunk.metadata,
        embedding,
      });
    }
  }

  /**
   * Chunk documents into optimal sizes for embedding
   */
  private async chunkDocuments(
    documents: DocumentChunk[]
  ): Promise<DocumentChunk[]> {
    const chunks: DocumentChunk[] = [];

    for (const doc of documents) {
      // Simple chunking by paragraphs (can be improved)
      const paragraphs = doc.content.split('\n\n');
      let currentChunk = '';

      for (const para of paragraphs) {
        if ((currentChunk + para).length > 1024) {
          // Max chunk size
          if (currentChunk) {
            chunks.push({
              content: currentChunk.trim(),
              metadata: doc.metadata,
              sourceDocumentId: doc.sourceDocumentId,
            });
          }
          currentChunk = para;
        } else {
          currentChunk += '\n\n' + para;
        }
      }

      if (currentChunk) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: doc.metadata,
          sourceDocumentId: doc.sourceDocumentId,
        });
      }
    }

    return chunks;
  }

  /**
   * Generate embedding for text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Semantic search
   */
  async search({
    query,
    collection,
    topK = 5,
    threshold = 0.7,
    metadataFilter,
  }: {
    query: string;
    collection: string;
    topK?: number;
    threshold?: number;
    metadataFilter?: Record<string, any>;
  }): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);

    // Search pgvector
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: topK,
      collection_name: collection,
      filter_metadata: metadataFilter ? JSON.stringify(metadataFilter) : null,
    });

    if (error) throw error;

    return data.map((row: any) => ({
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      similarity: row.similarity,
    }));
  }

  /**
   * Retrieve context for AI prompts
   */
  async getContext(
    query: string,
    collection: string,
    options?: {
      topK?: number;
      threshold?: number;
      metadataFilter?: Record<string, any>;
    }
  ): Promise<string> {
    const results = await this.search({
      query,
      collection,
      ...options,
    });

    if (results.length === 0) {
      return 'No relevant context found.';
    }

    // Format context for AI
    return results
      .map((r, i) => `[Context ${i + 1} - ${(r.similarity * 100).toFixed(1)}% relevant]\n${r.content}`)
      .join('\n\n');
  }

  /**
   * Delete documents from collection
   */
  async deleteCollection(collection: string): Promise<void> {
    await supabase
      .from('knowledge_chunks')
      .delete()
      .eq('collection', collection);
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(collection: string): Promise<{
    totalChunks: number;
    avgChunkLength: number;
    lastUpdated: string;
  }> {
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .select('content, updated_at')
      .eq('collection', collection);

    if (error) throw error;

    return {
      totalChunks: data.length,
      avgChunkLength: Math.round(
        data.reduce((sum, d) => sum + d.content.length, 0) / data.length
      ),
      lastUpdated:
        data.length > 0
          ? new Date(
              Math.max(...data.map((d) => new Date(d.updated_at).getTime()))
            ).toISOString()
          : new Date().toISOString(),
    };
  }
}
```

### Indexing Script

Create file: `scripts/index-curriculum.ts`

```typescript
import { RAGLayer } from '../src/lib/ai/rag';
import fs from 'fs';
import path from 'path';

/**
 * Index curriculum documents into RAG
 */
async function indexCurriculum() {
  const rag = new RAGLayer();

  // Example: Index all markdown files in curriculum directory
  const curriculumDir = path.join(process.cwd(), 'data/curriculum');
  const files = fs.readdirSync(curriculumDir);

  const documents = files
    .filter((f) => f.endsWith('.md'))
    .map((filename) => {
      const content = fs.readFileSync(
        path.join(curriculumDir, filename),
        'utf-8'
      );
      const metadata = extractMetadata(filename, content);

      return {
        sourceDocumentId: filename,
        content,
        metadata,
      };
    });

  console.log(`Indexing ${documents.length} curriculum documents...`);

  await rag.indexDocuments(documents, 'curriculum');

  const stats = await rag.getCollectionStats('curriculum');
  console.log('Indexing complete:', stats);
}

function extractMetadata(filename: string, content: string) {
  // Simple metadata extraction from filename and content
  const module = filename.split('-')[0]; // e.g., "PolicyCenter-Rating.md" → "PolicyCenter"
  const topic = filename.replace('.md', '').split('-').slice(1).join(' ');

  return {
    module,
    topic,
    filename,
  };
}

indexCurriculum().catch(console.error);
```

---

## Testing

### Unit Tests

```typescript
// src/lib/ai/__tests__/rag.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { RAGLayer } from '../rag';

describe('RAG Layer', () => {
  let rag: RAGLayer;

  beforeAll(() => {
    rag = new RAGLayer();
  });

  describe('Document Indexing', () => {
    it('indexes curriculum documents', async () => {
      await rag.indexDocuments(
        [
          {
            content: 'Rating in PolicyCenter calculates premiums using rating tables...',
            metadata: { module: 'PolicyCenter', topic: 'Rating' },
            sourceDocumentId: 'pc-rating-101',
          },
        ],
        'curriculum'
      );

      const stats = await rag.getCollectionStats('curriculum');
      expect(stats.totalChunks).toBeGreaterThan(0);
    });

    it('chunks large documents properly', async () => {
      const largeDoc = 'A'.repeat(5000); // 5000 chars

      await rag.indexDocuments(
        [{ content: largeDoc, metadata: {}, sourceDocumentId: 'large' }],
        'test'
      );

      const stats = await rag.getCollectionStats('test');
      expect(stats.totalChunks).toBeGreaterThan(1); // Should be chunked
    });
  });

  describe('Semantic Search', () => {
    it('finds relevant curriculum content', async () => {
      const results = await rag.search({
        query: 'How does rating work in PolicyCenter?',
        collection: 'curriculum',
      });

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('Rating');
      expect(results[0].similarity).toBeGreaterThan(0.7);
    });

    it('returns empty for irrelevant queries', async () => {
      const results = await rag.search({
        query: 'What is the weather today?',
        collection: 'curriculum',
      });

      expect(results.length).toBe(0);
    });

    it('respects similarity threshold', async () => {
      const results = await rag.search({
        query: 'rating',
        collection: 'curriculum',
        threshold: 0.9,
      });

      expect(results.every((r) => r.similarity > 0.9)).toBe(true);
    });

    it('filters by metadata', async () => {
      const results = await rag.search({
        query: 'rating',
        collection: 'curriculum',
        metadataFilter: { module: 'PolicyCenter' },
      });

      expect(
        results.every((r) => r.metadata.module === 'PolicyCenter')
      ).toBe(true);
    });
  });

  describe('Performance', () => {
    it('searches in <500ms', async () => {
      const start = Date.now();

      await rag.search({
        query: 'test query',
        collection: 'curriculum',
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });
  });
});
```

---

## Verification

### Manual Testing

```bash
# Index curriculum
pnpm tsx scripts/index-curriculum.ts

# Test search via SQL
psql $DATABASE_URL -c "
SELECT * FROM search_knowledge(
  (SELECT embedding FROM knowledge_chunks LIMIT 1),
  0.7,
  5,
  'curriculum',
  NULL
);
"
```

### SQL Verification

```sql
-- Check indexed collections
SELECT collection, COUNT(*), AVG(LENGTH(content))
FROM knowledge_chunks
GROUP BY collection;

-- Test similarity search
SELECT
  content,
  1 - (embedding <=> (SELECT embedding FROM knowledge_chunks LIMIT 1)) AS similarity
FROM knowledge_chunks
ORDER BY embedding <=> (SELECT embedding FROM knowledge_chunks LIMIT 1)
LIMIT 5;

-- Check metadata diversity
SELECT collection, jsonb_object_keys(metadata) as key, COUNT(*)
FROM knowledge_chunks
GROUP BY collection, key;
```

---

## Dependencies

**Requires:**
- FOUND-001 (Database schema)
- AI-INF-001 (Model Router - for embeddings)
- pgvector extension enabled in Supabase

**Blocks:**
- AI-INF-005 (Base Agent Framework - uses RAG)
- AI-GURU-001 (Code Mentor - uses curriculum RAG)

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-INF-003 (Memory Layer)
