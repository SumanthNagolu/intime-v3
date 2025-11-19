# AI-INF-005: Base Agent Framework

**Story Points:** 8
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** CRITICAL (Foundation for All AI Agents)

---

## User Story

As a **Developer**,
I want **a reusable BaseAgent class with memory, RAG, and prompt management**,
So that **all AI agents share consistent behavior and I don't duplicate code**.

---

## Acceptance Criteria

- [ ] BaseAgent class with lifecycle management (init, query, learn, cleanup)
- [ ] Built-in memory integration (conversation history, user preferences)
- [ ] Built-in RAG integration (semantic search for context)
- [ ] Built-in prompt template management
- [ ] Streaming response support
- [ ] Error handling with automatic retry logic
- [ ] Context management (maintain state across queries)
- [ ] Agent factory pattern (easy instantiation)
- [ ] Testing framework for agent behaviors
- [ ] Documentation with usage examples

---

## Technical Implementation

### Base Agent Class

Create file: `src/lib/ai/agents/BaseAgent.ts`

```typescript
// /src/lib/ai/agents/BaseAgent.ts
import { routeAIRequest, AITask } from '../router';
import { MemoryLayer } from '../memory';
import { RAGLayer } from '../rag';
import { trackedAIRequest } from '../helicone';

export type AgentConfig = {
  name: string;
  useCase: string;
  defaultModel: string;
  systemPrompt: string;
  ragCollection?: string;
  requiresReasoning?: boolean;
  requiresWriting?: boolean;
  streamingEnabled?: boolean;
};

export type AgentContext = {
  conversationId: string;
  userId: string;
  userType?: 'student' | 'employee' | 'trainer' | 'admin';
  metadata?: Record<string, any>;
};

export type AgentResponse = {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latency: number;
  sources?: Array<{ content: string; similarity: number }>;
  conversationId: string;
};

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: MemoryLayer;
  protected rag: RAGLayer;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new MemoryLayer();
    this.rag = new RAGLayer();
  }

  /**
   * Main query method - handles full flow
   */
  async query(
    query: string,
    context: AgentContext,
    options?: {
      includeRAG?: boolean;
      temperature?: number;
      maxTokens?: number;
      topK?: number;
    }
  ): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      // 1. Check budget limits
      const budgetAllowed = await this.checkBudget(context.userId);
      if (!budgetAllowed) {
        throw new Error('Daily budget limit exceeded. Please try again tomorrow.');
      }

      // 2. Retrieve conversation history
      const conversationHistory = await this.memory.getRecentMessages(
        context.conversationId,
        5
      );

      // 3. Retrieve user preferences
      const userPreferences = await this.memory.getUserPreferences(context.userId);

      // 4. Retrieve RAG context (if enabled)
      let ragContext = '';
      let sources: Array<{ content: string; similarity: number }> = [];

      if (options?.includeRAG !== false && this.config.ragCollection) {
        const ragResults = await this.rag.search({
          query,
          collection: this.config.ragCollection,
          topK: options?.topK || 3,
          threshold: 0.7,
        });

        ragContext = ragResults
          .map((r, i) => `[Source ${i + 1}]\n${r.content}`)
          .join('\n\n');

        sources = ragResults.map((r) => ({
          content: r.content,
          similarity: r.similarity,
        }));
      }

      // 5. Build enhanced prompt
      const enhancedPrompt = this.buildPrompt({
        query,
        conversationHistory,
        ragContext,
        userPreferences,
        metadata: context.metadata,
      });

      // 6. Execute AI request
      const response = await trackedAIRequest(
        this.config.defaultModel,
        enhancedPrompt,
        {
          useCase: this.config.useCase,
          userId: context.userId,
          feature: this.config.name,
          userType: context.userType,
        },
        {
          systemPrompt: this.config.systemPrompt,
          temperature: options?.temperature || 0.7,
          maxTokens: options?.maxTokens || 1024,
        }
      );

      // 7. Save to memory
      await this.memory.saveMessage(
        context.conversationId,
        context.userId,
        this.config.useCase,
        {
          role: 'user',
          content: query,
          timestamp: new Date().toISOString(),
        },
        context.metadata
      );

      await this.memory.saveMessage(
        context.conversationId,
        context.userId,
        this.config.useCase,
        {
          role: 'assistant',
          content: response.content,
          timestamp: new Date().toISOString(),
        },
        context.metadata
      );

      // 8. Learn from interaction (detect patterns)
      await this.learnFromInteraction(query, response.content, context);

      const latency = Date.now() - startTime;

      return {
        content: response.content,
        model: this.config.defaultModel,
        usage: response.usage,
        cost: this.calculateCost(this.config.defaultModel, response.usage),
        latency,
        sources: sources.length > 0 ? sources : undefined,
        conversationId: context.conversationId,
      };
    } catch (error) {
      // Handle error with retry logic
      return this.handleError(error, query, context, options);
    }
  }

  /**
   * Build enhanced prompt with all context
   */
  protected buildPrompt(params: {
    query: string;
    conversationHistory: any[];
    ragContext: string;
    userPreferences: any;
    metadata?: Record<string, any>;
  }): string {
    let prompt = '';

    // Add conversation history
    if (params.conversationHistory.length > 0) {
      prompt += '[Conversation History]\n';
      params.conversationHistory.forEach((msg) => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += '\n';
    }

    // Add RAG context
    if (params.ragContext) {
      prompt += '[Knowledge Base Context]\n';
      prompt += params.ragContext;
      prompt += '\n\n';
    }

    // Add user preferences
    if (Object.keys(params.userPreferences).length > 0) {
      prompt += '[User Preferences]\n';
      prompt += `Learning Style: ${params.userPreferences.learningStyle || 'unknown'}\n`;
      prompt += `Response Length: ${params.userPreferences.responseLength || 'medium'}\n`;
      prompt += '\n';
    }

    // Add current query
    prompt += '[Current Question]\n';
    prompt += params.query;

    return prompt;
  }

  /**
   * Learn from user interactions (pattern detection)
   */
  protected async learnFromInteraction(
    query: string,
    response: string,
    context: AgentContext
  ): Promise<void> {
    // Subclasses can override for custom learning
    // Default: Detect common question patterns

    const queryLower = query.toLowerCase();

    // Detect struggle patterns
    if (
      queryLower.includes('confused') ||
      queryLower.includes("don't understand") ||
      queryLower.includes('stuck')
    ) {
      await this.memory.learnPattern(
        context.userId,
        'struggle',
        `User struggling with: ${query}`,
        context.metadata
      );
    }

    // Detect success patterns
    if (
      queryLower.includes('got it') ||
      queryLower.includes('makes sense') ||
      queryLower.includes('thank you')
    ) {
      await this.memory.learnPattern(
        context.userId,
        'success',
        `User understood: ${query}`,
        context.metadata
      );
    }
  }

  /**
   * Check if user is within budget limits
   */
  protected async checkBudget(userId: string): Promise<boolean> {
    const { checkBudgetLimit } = await import('../helicone');
    return checkBudgetLimit(userId);
  }

  /**
   * Calculate cost based on model and usage
   */
  protected calculateCost(model: string, usage: any): number {
    const pricing: Record<string, { input: number; output: number }> = {
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4o': { input: 0.0025, output: 0.01 },
      'claude-sonnet-4-5': { input: 0.003, output: 0.015 },
    };

    const modelPricing = pricing[model];
    if (!modelPricing) return 0;

    const inputCost = (usage.promptTokens / 1000) * modelPricing.input;
    const outputCost = (usage.completionTokens / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Handle errors with retry logic
   */
  protected async handleError(
    error: any,
    query: string,
    context: AgentContext,
    options?: any,
    retryCount: number = 0
  ): Promise<AgentResponse> {
    const MAX_RETRIES = 2;

    // Log error
    console.error(`[${this.config.name}] Error:`, error);

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`[${this.config.name}] Retrying... (${retryCount + 1}/${MAX_RETRIES})`);

      // Wait with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, retryCount) * 1000)
      );

      return this.query(query, context, options);
    }

    // Max retries exceeded
    throw new Error(
      `${this.config.name} failed after ${MAX_RETRIES} retries: ${error.message}`
    );
  }

  /**
   * Stream response (for long-running queries)
   */
  async *streamQuery(
    query: string,
    context: AgentContext,
    options?: any
  ): AsyncGenerator<string, void, unknown> {
    // Streaming implementation
    // Note: Requires OpenAI/Anthropic streaming APIs
    throw new Error('Streaming not yet implemented in BaseAgent');
  }

  /**
   * Clear conversation history
   */
  async clearConversation(conversationId: string): Promise<void> {
    await this.memory.clearConversation(conversationId);
  }

  /**
   * Get agent statistics
   */
  async getStats(userId: string): Promise<{
    totalInteractions: number;
    averageLatency: number;
    totalCost: number;
  }> {
    const history = await this.memory.getUserHistory(userId, this.config.useCase);

    return {
      totalInteractions: history.length,
      averageLatency: 0, // TODO: Calculate from logs
      totalCost: 0, // TODO: Calculate from logs
    };
  }
}
```

### Agent Factory

Create file: `src/lib/ai/agents/factory.ts`

```typescript
// /src/lib/ai/agents/factory.ts
import { BaseAgent, AgentConfig } from './BaseAgent';

export class AgentFactory {
  private static agents: Map<string, BaseAgent> = new Map();

  /**
   * Get or create agent instance
   */
  static getAgent(name: string, config: AgentConfig): BaseAgent {
    if (!this.agents.has(name)) {
      // Create custom agent class
      class CustomAgent extends BaseAgent {
        constructor(config: AgentConfig) {
          super(config);
        }
      }

      this.agents.set(name, new CustomAgent(config));
    }

    return this.agents.get(name)!;
  }

  /**
   * Clear all agents (for testing)
   */
  static clearAll(): void {
    this.agents.clear();
  }
}
```

### Example Agent Implementation

Create file: `src/lib/ai/agents/CodeMentorAgent.ts`

```typescript
// /src/lib/ai/agents/CodeMentorAgent.ts
import { BaseAgent, AgentConfig } from './BaseAgent';

export class CodeMentorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'code_mentor',
      useCase: 'code_mentor',
      defaultModel: 'gpt-4o-mini',
      systemPrompt: `You are a Guidewire expert using the Socratic method.

RULES:
1. NEVER give direct answers - ask guiding questions
2. Detect when student is stuck (3+ follow-ups) → escalate to human
3. Reference curriculum context when available
4. Encourage hands-on experimentation
5. Celebrate small wins

STYLE:
- Friendly and encouraging
- Use examples from insurance domain
- Keep responses concise (2-3 sentences)`,
      ragCollection: 'curriculum',
      requiresReasoning: false,
      requiresWriting: false,
    });
  }

  /**
   * Custom learning: Detect when to escalate to human
   */
  protected async learnFromInteraction(
    query: string,
    response: string,
    context: any
  ): Promise<void> {
    await super.learnFromInteraction(query, response, context);

    // Check if student asked same question 3+ times
    const history = await this.memory.getUserHistory(context.userId, 'code_mentor', 10);

    const similarQuestions = history.filter((h) =>
      this.isSimilarQuestion(query, h.question)
    );

    if (similarQuestions.length >= 3) {
      // Escalate to human trainer
      await this.memory.learnPattern(
        context.userId,
        'struggle',
        `Student needs human help with: ${query}`,
        { ...context.metadata, escalate: true }
      );
    }
  }

  /**
   * Check if two questions are similar
   */
  private isSimilarQuestion(q1: string, q2: string): boolean {
    // Simple similarity check (can be improved with embeddings)
    const words1 = q1.toLowerCase().split(' ');
    const words2 = q2.toLowerCase().split(' ');

    const commonWords = words1.filter((w) => words2.includes(w));

    return commonWords.length / Math.max(words1.length, words2.length) > 0.5;
  }
}
```

---

## Testing

### Unit Tests

Create file: `src/lib/ai/agents/__tests__/BaseAgent.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseAgent, AgentConfig } from '../BaseAgent';
import { AgentFactory } from '../factory';

describe('BaseAgent Framework', () => {
  let agent: BaseAgent;
  const testConfig: AgentConfig = {
    name: 'test_agent',
    useCase: 'test',
    defaultModel: 'gpt-4o-mini',
    systemPrompt: 'You are a helpful assistant',
    ragCollection: 'curriculum',
  };

  beforeEach(() => {
    class TestAgent extends BaseAgent {
      constructor(config: AgentConfig) {
        super(config);
      }
    }
    agent = new TestAgent(testConfig);
  });

  describe('Agent Lifecycle', () => {
    it('initializes with config', () => {
      expect(agent['config'].name).toBe('test_agent');
      expect(agent['config'].defaultModel).toBe('gpt-4o-mini');
    });

    it('processes query with full context', async () => {
      const response = await agent.query(
        'What is PolicyCenter?',
        {
          conversationId: 'conv-123',
          userId: 'user-123',
          userType: 'student',
        }
      );

      expect(response.content).toBeTruthy();
      expect(response.model).toBe('gpt-4o-mini');
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.cost).toBeGreaterThan(0);
      expect(response.latency).toBeGreaterThan(0);
    });

    it('includes RAG context when available', async () => {
      const response = await agent.query(
        'How does rating work?',
        {
          conversationId: 'conv-123',
          userId: 'user-123',
          userType: 'student',
        },
        { includeRAG: true }
      );

      expect(response.sources).toBeTruthy();
      expect(response.sources!.length).toBeGreaterThan(0);
      expect(response.sources![0].similarity).toBeGreaterThan(0.7);
    });

    it('maintains conversation history', async () => {
      const conversationId = 'conv-history-test';

      // First query
      await agent.query('What is a quote?', {
        conversationId,
        userId: 'user-123',
        userType: 'student',
      });

      // Second query (should have history)
      await agent.query('How do I create one?', {
        conversationId,
        userId: 'user-123',
        userType: 'student',
      });

      const conversation = await agent['memory'].getConversation(conversationId);

      expect(conversation).toBeTruthy();
      expect(conversation!.messages.length).toBe(4); // 2 user + 2 assistant
    });
  });

  describe('Budget Enforcement', () => {
    it('blocks query when over budget', async () => {
      // Mock budget check to return false
      vi.spyOn(agent as any, 'checkBudget').mockResolvedValue(false);

      try {
        await agent.query('Test', {
          conversationId: 'conv-123',
          userId: 'user-123',
        });
        expect.fail('Should have thrown budget error');
      } catch (error: any) {
        expect(error.message).toContain('budget limit exceeded');
      }
    });
  });

  describe('Error Handling', () => {
    it('retries on failure', async () => {
      let attempts = 0;

      // Mock to fail twice, succeed on third
      vi.spyOn(agent as any, 'query').mockImplementation(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return {
          content: 'Success',
          model: 'gpt-4o-mini',
          usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
          cost: 0.001,
          latency: 100,
          conversationId: 'conv-123',
        };
      });

      const response = await agent.query('Test', {
        conversationId: 'conv-123',
        userId: 'user-123',
      });

      expect(attempts).toBe(3);
      expect(response.content).toBe('Success');
    });

    it('gives up after max retries', async () => {
      vi.spyOn(agent as any, 'query').mockRejectedValue(
        new Error('Persistent failure')
      );

      try {
        await agent.query('Test', {
          conversationId: 'conv-123',
          userId: 'user-123',
        });
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('failed after');
      }
    });
  });

  describe('Pattern Learning', () => {
    it('detects struggle patterns', async () => {
      await agent.query("I'm confused about rating", {
        conversationId: 'conv-123',
        userId: 'user-123',
        userType: 'student',
      });

      const patterns = await agent['memory'].findSimilarPatterns(
        'confused about rating',
        'user-123'
      );

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns[0].pattern_type).toBe('struggle');
    });

    it('detects success patterns', async () => {
      await agent.query('Got it, thank you!', {
        conversationId: 'conv-123',
        userId: 'user-123',
        userType: 'student',
      });

      const patterns = await agent['memory'].findSimilarPatterns(
        'understood',
        'user-123'
      );

      expect(patterns.some((p) => p.pattern_type === 'success')).toBe(true);
    });
  });

  describe('Agent Factory', () => {
    it('creates and caches agents', () => {
      const agent1 = AgentFactory.getAgent('test', testConfig);
      const agent2 = AgentFactory.getAgent('test', testConfig);

      expect(agent1).toBe(agent2); // Same instance
    });

    it('creates different agents for different names', () => {
      const agent1 = AgentFactory.getAgent('test1', testConfig);
      const agent2 = AgentFactory.getAgent('test2', testConfig);

      expect(agent1).not.toBe(agent2);
    });
  });

  describe('Statistics', () => {
    it('tracks agent statistics', async () => {
      await agent.query('Test query 1', {
        conversationId: 'conv-123',
        userId: 'user-123',
      });

      await agent.query('Test query 2', {
        conversationId: 'conv-123',
        userId: 'user-123',
      });

      const stats = await agent.getStats('user-123');

      expect(stats.totalInteractions).toBeGreaterThanOrEqual(2);
    });
  });
});
```

---

## Verification

### Manual Testing Checklist

- [ ] BaseAgent can be instantiated with config
- [ ] Query method returns valid response
- [ ] RAG context included when enabled
- [ ] Conversation history maintained across queries
- [ ] Budget limits enforced
- [ ] Retry logic works on failures
- [ ] Pattern learning detects struggles and successes
- [ ] Agent factory caches instances correctly
- [ ] Statistics tracking works

### Integration Test

```typescript
// Full agent flow test
describe('BaseAgent Integration', () => {
  it('completes full conversation flow', async () => {
    const agent = new CodeMentorAgent();

    // Query 1
    const response1 = await agent.query(
      'What is PolicyCenter?',
      {
        conversationId: 'integration-test',
        userId: 'test-user',
        userType: 'student',
      }
    );

    expect(response1.content).toBeTruthy();

    // Query 2 (with history)
    const response2 = await agent.query(
      'How do I create a quote?',
      {
        conversationId: 'integration-test',
        userId: 'test-user',
        userType: 'student',
      }
    );

    expect(response2.content).toBeTruthy();
    expect(response2.sources).toBeTruthy(); // RAG context

    // Check stats
    const stats = await agent.getStats('test-user');
    expect(stats.totalInteractions).toBeGreaterThanOrEqual(2);
  });
});
```

---

## Dependencies

**Requires:**
- AI-INF-001 (Model Router)
- AI-INF-002 (RAG Infrastructure)
- AI-INF-003 (Memory Layer)
- AI-INF-004 (Cost Monitoring)

**Blocks:**
- AI-GURU-001 (Code Mentor - extends BaseAgent)
- AI-GURU-002 (Resume Builder - extends BaseAgent)
- AI-GURU-003 (Project Planner - extends BaseAgent)
- AI-GURU-004 (Interview Coach - extends BaseAgent)

---

## Documentation

### Usage Example

```typescript
import { CodeMentorAgent } from '@/lib/ai/agents/CodeMentorAgent';

const agent = new CodeMentorAgent();

const response = await agent.query(
  'What is a PolicyCenter quote?',
  {
    conversationId: 'student-conv-123',
    userId: user.id,
    userType: 'student',
    metadata: {
      module: 'PolicyCenter',
      topic: 'Quoting',
    },
  },
  {
    includeRAG: true,
    temperature: 0.7,
    maxTokens: 512,
  }
);

console.log(response.content);
console.log(`Cost: $${response.cost.toFixed(4)}`);
console.log(`Latency: ${response.latency}ms`);
console.log(`Sources:`, response.sources);
```

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-INF-006 (Prompt Library)
