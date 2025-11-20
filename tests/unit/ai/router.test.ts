import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AIRouter,
  type AITask,
  type ModelSelection,
  getDefaultRouter,
  resetDefaultRouter,
} from '@/lib/ai/router';

describe('AIRouter', () => {
  let router: AIRouter;

  beforeEach(() => {
    router = new AIRouter();
    resetDefaultRouter();
  });

  describe('route()', () => {
    it('should select gpt-4o-mini for simple tasks', async () => {
      const task: AITask = {
        type: 'simple',
        description: 'Classify this activity log entry',
      };

      const selection = await router.route(task);

      expect(selection.provider).toBe('openai');
      expect(selection.model).toBe('gpt-4o-mini');
      expect(selection.reasoning).toContain('Simple task');
      expect(selection.reasoning).toContain('gpt-4o-mini');
      expect(selection.estimatedCost).toBeGreaterThan(0);
    });

    it('should select gpt-4o for reasoning tasks', async () => {
      const task: AITask = {
        type: 'reasoning',
        description: 'Analyze candidate skill progression',
      };

      const selection = await router.route(task);

      expect(selection.provider).toBe('openai');
      expect(selection.model).toBe('gpt-4o');
      expect(selection.reasoning).toContain('Reasoning task');
      expect(selection.reasoning).toContain('gpt-4o');
      expect(selection.estimatedCost).toBeGreaterThan(0);
    });

    it('should select claude-sonnet-4-5 for complex tasks', async () => {
      const task: AITask = {
        type: 'complex',
        description: 'Generate employee AI twin personality',
      };

      const selection = await router.route(task);

      expect(selection.provider).toBe('anthropic');
      expect(selection.model).toBe('claude-sonnet-4-5-20250929');
      expect(selection.reasoning).toContain('Complex task');
      expect(selection.reasoning).toContain('Claude');
      expect(selection.estimatedCost).toBeGreaterThan(0);
    });

    it('should select gpt-4o-mini for vision tasks', async () => {
      const task: AITask = {
        type: 'vision',
        description: 'Analyze resume document image',
      };

      const selection = await router.route(task);

      expect(selection.provider).toBe('openai');
      expect(selection.model).toBe('gpt-4o-mini');
      expect(selection.reasoning).toContain('Vision task');
      expect(selection.estimatedCost).toBeGreaterThan(0);
    });

    it('should complete routing in <100ms (SLA)', async () => {
      const task: AITask = {
        type: 'simple',
        description: 'Test performance',
      };

      const startTime = performance.now();
      await router.route(task);
      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(100);
    });

    it('should handle tasks with context', async () => {
      const task: AITask = {
        type: 'reasoning',
        description: 'Analyze with context',
        context: {
          userId: 'user123',
          previousAttempts: 3,
        },
      };

      const selection = await router.route(task);

      expect(selection.provider).toBe('openai');
      expect(selection.model).toBe('gpt-4o');
    });

    it('should include reasoning in selection', async () => {
      const task: AITask = {
        type: 'complex',
        description: 'Multi-step analysis',
      };

      const selection = await router.route(task);

      expect(selection.reasoning).toBeTruthy();
      expect(typeof selection.reasoning).toBe('string');
      expect(selection.reasoning.length).toBeGreaterThan(0);
    });
  });

  describe('estimateCost()', () => {
    it('should calculate cost for gpt-4o-mini correctly', () => {
      const task: AITask = { type: 'simple', description: 'test' };
      const cost = router.estimateCost(task, 1000, 500);

      // gpt-4o-mini: $0.15/M input, $0.60/M output
      // (1000/1M * 0.15) + (500/1M * 0.60) = 0.00015 + 0.0003 = 0.00045
      expect(cost).toBeCloseTo(0.00045, 5);
    });

    it('should calculate cost for gpt-4o correctly', () => {
      const task: AITask = { type: 'reasoning', description: 'test' };
      const cost = router.estimateCost(task, 1000, 500);

      // gpt-4o: $2.50/M input, $10.00/M output
      // (1000/1M * 2.50) + (500/1M * 10.00) = 0.0025 + 0.005 = 0.0075
      expect(cost).toBeCloseTo(0.0075, 4);
    });

    it('should calculate cost for claude-sonnet-4-5 correctly', () => {
      const task: AITask = { type: 'complex', description: 'test' };
      const cost = router.estimateCost(task, 1000, 500);

      // claude-sonnet-4-5: $3.00/M input, $15.00/M output
      // (1000/1M * 3.00) + (500/1M * 15.00) = 0.003 + 0.0075 = 0.0105
      expect(cost).toBeCloseTo(0.0105, 4);
    });

    it('should handle large token counts', () => {
      const task: AITask = { type: 'simple', description: 'test' };
      const cost = router.estimateCost(task, 100000, 50000);

      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(1); // Should still be under $1
    });

    it('should use default output tokens if not specified', () => {
      const task: AITask = { type: 'simple', description: 'test' };
      const cost = router.estimateCost(task, 1000);

      expect(cost).toBeGreaterThan(0);
    });

    it('should show cost difference between models', () => {
      const inputTokens = 10000;
      const outputTokens = 5000;

      const simpleCost = router.estimateCost(
        { type: 'simple', description: 'test' },
        inputTokens,
        outputTokens
      );

      const complexCost = router.estimateCost(
        { type: 'complex', description: 'test' },
        inputTokens,
        outputTokens
      );

      // Complex should be significantly more expensive
      expect(complexCost).toBeGreaterThan(simpleCost * 10);
    });
  });

  describe('getAvailableModels()', () => {
    it('should return all available models', () => {
      const models = router.getAvailableModels();

      expect(models).toHaveLength(3);
      expect(models.map(m => m.model)).toEqual(
        expect.arrayContaining([
          'gpt-4o-mini',
          'gpt-4o',
          'claude-sonnet-4-5-20250929',
        ])
      );
    });

    it('should include pricing information', () => {
      const models = router.getAvailableModels();

      models.forEach(model => {
        expect(model.pricing).toBeDefined();
        expect(model.pricing.input).toBeGreaterThan(0);
        expect(model.pricing.output).toBeGreaterThan(0);
      });
    });

    it('should include capabilities', () => {
      const models = router.getAvailableModels();

      models.forEach(model => {
        expect(Array.isArray(model.capabilities)).toBe(true);
        expect(model.capabilities.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getModelConfig()', () => {
    it('should return config for valid model name', () => {
      const config = router.getModelConfig('gpt-4o-mini');

      expect(config).toBeDefined();
      expect(config?.model).toBe('gpt-4o-mini');
      expect(config?.provider).toBe('openai');
    });

    it('should return undefined for invalid model name', () => {
      const config = router.getModelConfig('invalid-model');

      expect(config).toBeUndefined();
    });

    it('should return all model details', () => {
      const config = router.getModelConfig('claude-sonnet-4-5');

      expect(config).toBeDefined();
      expect(config?.provider).toBe('anthropic');
      expect(config?.pricing).toBeDefined();
      expect(config?.capabilities).toBeDefined();
    });
  });

  describe('getDefaultRouter()', () => {
    it('should return singleton instance', () => {
      const router1 = getDefaultRouter();
      const router2 = getDefaultRouter();

      expect(router1).toBe(router2);
    });

    it('should create new instance after reset', () => {
      const router1 = getDefaultRouter();
      resetDefaultRouter();
      const router2 = getDefaultRouter();

      expect(router1).not.toBe(router2);
    });
  });

  describe('performance benchmarks', () => {
    it('should handle 100 routing decisions in <1 second', async () => {
      const tasks: AITask[] = Array(100)
        .fill(null)
        .map((_, i) => ({
          type: ['simple', 'reasoning', 'complex', 'vision'][i % 4] as AITask['type'],
          description: `Task ${i}`,
        }));

      const startTime = performance.now();

      for (const task of tasks) {
        await router.route(task);
      }

      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(1000);
    });

    it('should handle concurrent routing decisions', async () => {
      const tasks: AITask[] = Array(50)
        .fill(null)
        .map((_, i) => ({
          type: ['simple', 'reasoning', 'complex', 'vision'][i % 4] as AITask['type'],
          description: `Task ${i}`,
        }));

      const startTime = performance.now();

      await Promise.all(tasks.map(task => router.route(task)));

      const elapsedTime = performance.now() - startTime;

      expect(elapsedTime).toBeLessThan(500);
    });
  });
});
