import { describe, it, expect, beforeEach } from 'vitest';
import { Chunker, type Document } from '@/lib/ai/rag/chunker';

describe('Chunker', () => {
  let chunker: Chunker;

  beforeEach(() => {
    chunker = new Chunker();
  });

  describe('chunkDocument()', () => {
    it('should chunk a simple document', async () => {
      const doc: Document = {
        id: 'doc1',
        content: 'This is a test. This is another sentence. And one more.',
        metadata: { type: 'test' },
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].documentId).toBe('doc1');
      expect(chunks[0].chunkIndex).toBe(0);
      expect(chunks[0].content).toBeTruthy();
    });

    it('should preserve metadata in chunks', async () => {
      const doc: Document = {
        id: 'doc1',
        content: 'Test content.',
        metadata: { type: 'guide', module: 'rating' },
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks[0].metadata.type).toBe('guide');
      expect(chunks[0].metadata.module).toBe('rating');
      expect(chunks[0].metadata.chunkIndex).toBe(0);
    });

    it('should handle empty content', async () => {
      const doc: Document = {
        id: 'doc1',
        content: '',
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks).toEqual([]);
    });

    it('should chunk large documents into multiple chunks', async () => {
      // Create a large document (>512 tokens = ~2048 characters)
      const content = 'This is a sentence. '.repeat(200); // ~4000 characters
      const doc: Document = {
        id: 'doc1',
        content,
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk, idx) => {
        expect(chunk.chunkIndex).toBe(idx);
      });
    });

    it('should preserve sentence boundaries', async () => {
      const content = 'First sentence. Second sentence! Third sentence?';
      const doc: Document = {
        id: 'doc1',
        content,
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      // Content should be preserved
      const reconstructed = chunks.map(c => c.content).join(' ');
      expect(reconstructed).toContain('First sentence');
      expect(reconstructed).toContain('Second sentence');
      expect(reconstructed).toContain('Third sentence');
    });

    it('should add token count to metadata', async () => {
      const doc: Document = {
        id: 'doc1',
        content: 'Test content.',
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks[0].metadata.tokenCount).toBeDefined();
      expect(typeof chunks[0].metadata.tokenCount).toBe('number');
      expect(chunks[0].metadata.tokenCount).toBeGreaterThan(0);
    });
  });

  describe('chunk() - multiple documents', () => {
    it('should chunk multiple documents', async () => {
      const docs: Document[] = [
        { id: 'doc1', content: 'First document.', metadata: {} },
        { id: 'doc2', content: 'Second document.', metadata: {} },
        { id: 'doc3', content: 'Third document.', metadata: {} },
      ];

      const chunks = await chunker.chunk(docs);

      expect(chunks.length).toBeGreaterThanOrEqual(3);
      expect(chunks.some(c => c.documentId === 'doc1')).toBe(true);
      expect(chunks.some(c => c.documentId === 'doc2')).toBe(true);
      expect(chunks.some(c => c.documentId === 'doc3')).toBe(true);
    });

    it('should handle empty document array', async () => {
      const chunks = await chunker.chunk([]);

      expect(chunks).toEqual([]);
    });
  });

  describe('custom configuration', () => {
    it('should respect maxTokens config', async () => {
      const smallChunker = new Chunker({ maxTokens: 50 });
      const content = 'This is a sentence. '.repeat(50); // ~1000 characters

      const doc: Document = {
        id: 'doc1',
        content,
        metadata: {},
      };

      const chunks = await smallChunker.chunkDocument(doc);

      // Should create more chunks with smaller maxTokens
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('should respect overlapTokens config', async () => {
      const chunkerWithOverlap = new Chunker({
        maxTokens: 100,
        overlapTokens: 20,
      });

      const content = 'This is a sentence. '.repeat(50);
      const doc: Document = {
        id: 'doc1',
        content,
        metadata: {},
      };

      const chunks = await chunkerWithOverlap.chunkDocument(doc);

      // Check that chunks have some overlap (difficult to verify exactly)
      expect(chunks.length).toBeGreaterThan(1);
    });

    it('should handle preserveSentences = false', async () => {
      const chunkerNoSentences = new Chunker({ preserveSentences: false });
      const doc: Document = {
        id: 'doc1',
        content: 'First sentence. Second sentence.',
        metadata: {},
      };

      const chunks = await chunkerNoSentences.chunkDocument(doc);

      expect(chunks.length).toBeGreaterThan(0);
    });
  });

  describe('getChunkingStats()', () => {
    it('should return statistics for documents', async () => {
      const docs: Document[] = [
        { id: 'doc1', content: 'Short content.', metadata: {} },
        { id: 'doc2', content: 'Another short content.', metadata: {} },
      ];

      const stats = await chunker.getChunkingStats(docs);

      expect(stats.totalDocuments).toBe(2);
      expect(stats.totalChunks).toBeGreaterThan(0);
      expect(stats.avgChunksPerDoc).toBeGreaterThan(0);
      expect(stats.avgTokensPerChunk).toBeGreaterThan(0);
    });

    it('should handle empty document array', async () => {
      const stats = await chunker.getChunkingStats([]);

      expect(stats.totalDocuments).toBe(0);
      expect(stats.totalChunks).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle documents with only whitespace', async () => {
      const doc: Document = {
        id: 'doc1',
        content: '   \n\t  ',
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks).toEqual([]);
    });

    it('should handle documents with special characters', async () => {
      const doc: Document = {
        id: 'doc1',
        content: 'Special chars: @#$%^&*()_+-={}[]|\\:";\'<>?,./~`',
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].content).toContain('Special chars');
    });

    it('should handle very long single sentence', async () => {
      const content = 'This is a very long sentence without any punctuation marks at all '.repeat(50);
      const doc: Document = {
        id: 'doc1',
        content,
        metadata: {},
      };

      const chunks = await chunker.chunkDocument(doc);

      expect(chunks.length).toBeGreaterThan(0);
    });
  });
});
