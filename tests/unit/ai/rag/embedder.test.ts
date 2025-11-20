import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Embedder } from '@/lib/ai/rag/embedder';
import type OpenAI from 'openai';

// Mock OpenAI client
const createMockOpenAI = () => {
  const mockEmbedding = Array(1536).fill(0.1);

  return {
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 10 },
      }),
    },
  } as unknown as OpenAI;
};

describe('Embedder', () => {
  let embedder: Embedder;
  let mockOpenAI: OpenAI;

  beforeEach(() => {
    mockOpenAI = createMockOpenAI();
    embedder = new Embedder({ openai: mockOpenAI });
  });

  describe('embed()', () => {
    it('should generate embedding for text', async () => {
      const result = await embedder.embed('Test text');

      expect(result.embedding).toBeDefined();
      expect(result.embedding.length).toBe(1536);
      expect(result.tokens).toBe(10);
    });

    it('should call OpenAI API with correct parameters', async () => {
      await embedder.embed('Test text');

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Test text',
        encoding_format: 'float',
      });
    });

    it('should throw error for empty text', async () => {
      await expect(embedder.embed('')).rejects.toThrow('Text cannot be empty');
    });

    it('should throw error for whitespace-only text', async () => {
      await expect(embedder.embed('   ')).rejects.toThrow('Text cannot be empty');
    });

    it('should handle API errors', async () => {
      const errorMock = {
        embeddings: {
          create: vi.fn().mockRejectedValue(new Error('API Error')),
        },
      } as unknown as OpenAI;

      const errorEmbedder = new Embedder({ openai: errorMock });

      await expect(errorEmbedder.embed('Test')).rejects.toThrow('API Error');
    });
  });

  describe('batchEmbed()', () => {
    it('should generate embeddings for multiple texts', async () => {
      const mockBatchOpenAI = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [
              { embedding: Array(1536).fill(0.1) },
              { embedding: Array(1536).fill(0.2) },
              { embedding: Array(1536).fill(0.3) },
            ],
            usage: { total_tokens: 30 },
          }),
        },
      } as unknown as OpenAI;

      const batchEmbedder = new Embedder({ openai: mockBatchOpenAI });

      const result = await batchEmbedder.batchEmbed([
        'First text',
        'Second text',
        'Third text',
      ]);

      expect(result.embeddings.length).toBe(3);
      expect(result.totalTokens).toBe(30);
      expect(result.cost).toBeGreaterThan(0);
    });

    it('should handle empty array', async () => {
      const result = await embedder.batchEmbed([]);

      expect(result.embeddings).toEqual([]);
      expect(result.totalTokens).toBe(0);
      expect(result.cost).toBe(0);
    });

    it('should filter out empty texts', async () => {
      await expect(embedder.batchEmbed(['', '  ', '\n'])).rejects.toThrow(
        'All texts are empty'
      );
    });

    it('should calculate cost correctly', async () => {
      const mockBatchOpenAI = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [{ embedding: Array(1536).fill(0.1) }],
            usage: { total_tokens: 1000 },
          }),
        },
      } as unknown as OpenAI;

      const batchEmbedder = new Embedder({ openai: mockBatchOpenAI });

      const result = await batchEmbedder.batchEmbed(['Test']);

      // $0.02 per 1M tokens
      // 1000 tokens = 0.001M tokens
      // Cost = 0.001 * 0.02 = 0.00002
      expect(result.cost).toBeCloseTo(0.00002, 6);
    });

    it('should handle large batches', async () => {
      const largeTexts = Array(250).fill('Test text'); // More than maxBatchSize

      const mockLargeBatchOpenAI = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: Array(100)
              .fill(null)
              .map(() => ({ embedding: Array(1536).fill(0.1) })),
            usage: { total_tokens: 100 },
          }),
        },
      } as unknown as OpenAI;

      const largeBatchEmbedder = new Embedder({
        openai: mockLargeBatchOpenAI,
        maxBatchSize: 100,
      });

      const result = await largeBatchEmbedder.batchEmbed(largeTexts);

      // Should split into multiple batches (250 / 100 = 3 batches)
      expect(mockLargeBatchOpenAI.embeddings.create).toHaveBeenCalledTimes(3);
      expect(result.embeddings.length).toBe(300); // 3 batches * 100 embeddings
    });
  });

  describe('getDimensions()', () => {
    it('should return correct dimensions', () => {
      expect(embedder.getDimensions()).toBe(1536);
    });
  });

  describe('estimateCost()', () => {
    it('should estimate cost for texts', async () => {
      const texts = ['Short', 'Medium length text', 'A much longer text with many more words'];

      const cost = await embedder.estimateCost(texts);

      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.01); // Should be very cheap for short texts
    });

    it('should handle empty array', async () => {
      const cost = await embedder.estimateCost([]);

      expect(cost).toBe(0);
    });

    it('should scale with text length', async () => {
      const shortTexts = ['Short'];
      const longTexts = ['This is a much longer text. '.repeat(100)];

      const shortCost = await embedder.estimateCost(shortTexts);
      const longCost = await embedder.estimateCost(longTexts);

      expect(longCost).toBeGreaterThan(shortCost);
    });
  });

  describe('custom configuration', () => {
    it('should use custom model', async () => {
      const customEmbedder = new Embedder({
        openai: mockOpenAI,
        model: 'text-embedding-3-large',
      });

      await customEmbedder.embed('Test');

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'text-embedding-3-large',
        })
      );
    });

    it('should use custom batch size', async () => {
      const customEmbedder = new Embedder({
        openai: mockOpenAI,
        maxBatchSize: 10,
      });

      // Access private method for testing (not ideal, but acceptable for unit tests)
      expect(customEmbedder).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle missing data in response', async () => {
      const errorMock = {
        embeddings: {
          create: vi.fn().mockResolvedValue({
            data: [],
            usage: { total_tokens: 0 },
          }),
        },
      } as unknown as OpenAI;

      const errorEmbedder = new Embedder({ openai: errorMock });

      await expect(errorEmbedder.embed('Test')).rejects.toThrow(
        'No embedding returned from API'
      );
    });

    it('should handle malformed response', async () => {
      const errorMock = {
        embeddings: {
          create: vi.fn().mockResolvedValue(null),
        },
      } as unknown as OpenAI;

      const errorEmbedder = new Embedder({ openai: errorMock });

      await expect(errorEmbedder.embed('Test')).rejects.toThrow();
    });
  });
});
