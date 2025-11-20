import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VectorStore, type RAGDocument, type VectorEntry } from '@/lib/ai/rag/vectorStore';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Chunk } from '@/lib/ai/rag/chunker';

// Mock Supabase client
const createMockSupabase = () => {
  const mockData: RAGDocument[] = [
    {
      id: '1',
      content: 'Test content 1',
      metadata: { type: 'test' },
      similarity: 0.95,
    },
    {
      id: '2',
      content: 'Test content 2',
      metadata: { type: 'test' },
      similarity: 0.85,
    },
  ];

  const rpcResult = Promise.resolve({ data: mockData, error: null });

  return {
    rpc: vi.fn().mockReturnValue(rpcResult),
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: '1' }, error: null }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        like: vi.fn().mockResolvedValue({ count: 5, error: null }),
        filter: vi.fn().mockReturnThis(),
        neq: vi.fn().mockResolvedValue({ count: 100, error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: '1', content: 'Test', embedding: [], metadata: {} },
            error: null,
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
};

describe('VectorStore', () => {
  let vectorStore: VectorStore;
  let mockSupabase: SupabaseClient;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    vectorStore = new VectorStore(mockSupabase);
  });

  describe('search()', () => {
    it('should search for similar documents', async () => {
      const queryEmbedding = Array(1536).fill(0.1);

      const results = await vectorStore.search(queryEmbedding, 5);

      expect(results.length).toBe(2);
      expect(results[0].similarity).toBe(0.95);
      expect(results[1].similarity).toBe(0.85);
    });

    it('should use default topK', async () => {
      const queryEmbedding = Array(1536).fill(0.1);

      await vectorStore.search(queryEmbedding);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('search_embeddings', {
        query_embedding: queryEmbedding,
        match_count: 5,
        filter_metadata: null,
      });
    });

    it('should apply metadata filters', async () => {
      const queryEmbedding = Array(1536).fill(0.1);
      const filter = { type: 'guide' };

      const results = await vectorStore.search(queryEmbedding, 5, filter);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('search_embeddings', {
        query_embedding: queryEmbedding,
        match_count: 5,
        filter_metadata: filter,
      });
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle empty results', async () => {
      const emptyResult = Promise.resolve({ data: [], error: null });
      const emptyMock = {
        rpc: vi.fn().mockReturnValue(emptyResult),
      } as unknown as SupabaseClient;

      const emptyStore = new VectorStore(emptyMock);
      const results = await emptyStore.search(Array(1536).fill(0.1));

      expect(results).toEqual([]);
    });

    it('should handle API errors', async () => {
      const errorResult = Promise.resolve({ data: null, error: { message: 'DB Error' } });
      const errorMock = {
        rpc: vi.fn().mockReturnValue(errorResult),
      } as unknown as SupabaseClient;

      const errorStore = new VectorStore(errorMock);

      await expect(errorStore.search(Array(1536).fill(0.1))).rejects.toThrow(
        'Vector search failed: DB Error'
      );
    });
  });

  describe('insert()', () => {
    it('should insert a vector entry', async () => {
      const entry: VectorEntry = {
        id: 'test1',
        content: 'Test content',
        embedding: Array(1536).fill(0.1),
        metadata: { type: 'test' },
      };

      const id = await vectorStore.insert(entry);

      expect(id).toBe('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_embeddings');
    });

    it('should handle insert errors', async () => {
      const errorMock = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Insert failed' },
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const errorStore = new VectorStore(errorMock);
      const entry: VectorEntry = {
        id: 'test1',
        content: 'Test',
        embedding: [],
        metadata: {},
      };

      await expect(errorStore.insert(entry)).rejects.toThrow('Vector insert failed');
    });
  });

  describe('insertBatch()', () => {
    it('should insert multiple entries', async () => {
      const chunks: Chunk[] = [
        {
          documentId: 'doc1',
          chunkIndex: 0,
          content: 'Chunk 1',
          metadata: {},
        },
        {
          documentId: 'doc1',
          chunkIndex: 1,
          content: 'Chunk 2',
          metadata: {},
        },
      ];

      const embeddings = [
        Array(1536).fill(0.1),
        Array(1536).fill(0.2),
      ];

      const batchMock = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockResolvedValue({ count: 2, error: null }),
        }),
      } as unknown as SupabaseClient;

      const batchStore = new VectorStore(batchMock);
      const count = await batchStore.insertBatch(chunks, embeddings);

      expect(count).toBe(2);
    });

    it('should throw error for length mismatch', async () => {
      const chunks: Chunk[] = [
        { documentId: 'doc1', chunkIndex: 0, content: 'Chunk 1', metadata: {} },
      ];
      const embeddings = [
        Array(1536).fill(0.1),
        Array(1536).fill(0.2),
      ];

      await expect(vectorStore.insertBatch(chunks, embeddings)).rejects.toThrow(
        'Chunks and embeddings length mismatch'
      );
    });

    it('should handle empty arrays', async () => {
      const count = await vectorStore.insertBatch([], []);

      expect(count).toBe(0);
    });
  });

  describe('deleteByDocumentId()', () => {
    it('should delete entries by document ID', async () => {
      const count = await vectorStore.deleteByDocumentId('doc1');

      expect(count).toBe(5);
      expect(mockSupabase.from).toHaveBeenCalledWith('ai_embeddings');
    });
  });

  describe('deleteByMetadata()', () => {
    it('should delete entries by metadata filter', async () => {
      const deleteMock = {
        from: vi.fn().mockReturnValue({
          delete: vi.fn().mockReturnValue({
            filter: vi.fn().mockResolvedValue({ count: 3, error: null }),
          }),
        }),
      } as unknown as SupabaseClient;

      const deleteStore = new VectorStore(deleteMock);
      const count = await deleteStore.deleteByMetadata({ type: 'old' });

      expect(count).toBe(3);
    });
  });

  describe('count()', () => {
    it('should return total entry count', async () => {
      const countMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ count: 42, error: null }),
        }),
      } as unknown as SupabaseClient;

      const countStore = new VectorStore(countMock);
      const count = await countStore.count();

      expect(count).toBe(42);
    });

    it('should handle count errors', async () => {
      const errorMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockResolvedValue({ count: null, error: { message: 'Error' } }),
        }),
      } as unknown as SupabaseClient;

      const errorStore = new VectorStore(errorMock);

      await expect(errorStore.count()).rejects.toThrow('Count failed');
    });
  });

  describe('getById()', () => {
    it('should get entry by ID', async () => {
      const entry = await vectorStore.getById('1');

      expect(entry).toBeDefined();
      expect(entry?.id).toBe('1');
    });

    it('should return null for not found', async () => {
      const notFoundMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { code: 'PGRST116' },
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const notFoundStore = new VectorStore(notFoundMock);
      const entry = await notFoundStore.getById('nonexistent');

      expect(entry).toBeNull();
    });
  });

  describe('clear()', () => {
    it('should clear all entries', async () => {
      const count = await vectorStore.clear();

      expect(count).toBe(100);
    });
  });

  describe('custom table name', () => {
    it('should use custom table name', async () => {
      const customStore = new VectorStore(mockSupabase, 'custom_embeddings');

      const entry: VectorEntry = {
        id: 'test1',
        content: 'Test',
        embedding: [],
        metadata: {},
      };

      await customStore.insert(entry);

      expect(mockSupabase.from).toHaveBeenCalledWith('custom_embeddings');
    });
  });
});
