# AI-INF-001: AI Model Router

**Story Points:** 5
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** CRITICAL (Foundational AI Service)

---

## User Story

As a **Developer**,
I want **intelligent model routing based on task complexity**,
So that **I optimize cost (cheap model for simple tasks) and quality (expensive model for complex reasoning)**.

---

## Acceptance Criteria

- [ ] Route simple tasks (Q&A, classification) to GPT-4o-mini ($0.0006/1K tokens)
- [ ] Route writing tasks (resumes, emails) to GPT-4o ($0.03/1K tokens)
- [ ] Route reasoning tasks (coaching, strategy) to Claude Sonnet ($0.15/1K tokens)
- [ ] Automatic fallback: If GPT-4o fails, retry with GPT-4o-mini
- [ ] Cost tracking: Log model, tokens, cost per request
- [ ] Performance tracking: Log latency per model
- [ ] Error handling: Exponential backoff on rate limits
- [ ] Testing: 95%+ successful routing accuracy
- [ ] Model selection < 100ms decision time
- [ ] Support for streaming responses

---

## Technical Implementation

### AI Router Service

Create file: `src/lib/ai/router.ts`

```typescript
// /src/lib/ai/router.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type AITask = {
  type: 'chat' | 'completion' | 'embedding' | 'vision';
  complexity: 'simple' | 'medium' | 'complex';
  requiresReasoning?: boolean;
  requiresWriting?: boolean;
  useCase: string;
  userId: string;
  streaming?: boolean;
};

export type AIResponse = {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost: number;
  latency: number;
  requestId: string;
};

/**
 * Main AI routing function
 */
export async function routeAIRequest(
  task: AITask,
  prompt: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    context?: string[];
  }
): Promise<AIResponse> {
  const model = selectModel(task);
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const response = await executeWithModel(
      model,
      prompt,
      options,
      task.streaming
    );

    const latency = Date.now() - startTime;
    const cost = calculateCost(model, response.usage);

    // Log metrics asynchronously
    logMetrics({
      requestId,
      model,
      useCase: task.useCase,
      userId: task.userId,
      latency,
      tokensUsed: response.usage.totalTokens,
      cost,
      success: true,
    }).catch(console.error);

    return {
      content: response.content,
      model,
      usage: response.usage,
      cost,
      latency,
      requestId,
    };
  } catch (error) {
    // Fallback to cheaper model if possible
    if (model === 'gpt-4o' && task.complexity !== 'complex') {
      console.log(`[AI Router] GPT-4o failed, falling back to GPT-4o-mini`);
      return routeAIRequest(
        { ...task, complexity: 'simple' },
        prompt,
        options
      );
    }

    // Log failure
    await logMetrics({
      requestId,
      model,
      useCase: task.useCase,
      userId: task.userId,
      latency: Date.now() - startTime,
      tokensUsed: 0,
      cost: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw error;
  }
}

/**
 * Select optimal model based on task characteristics
 */
function selectModel(task: AITask): string {
  // Embedding always uses OpenAI
  if (task.type === 'embedding') return 'text-embedding-3-small';

  // Vision tasks use GPT-4o-mini (cheap vision model)
  if (task.type === 'vision') return 'gpt-4o-mini';

  // Writing tasks use GPT-4o (best quality)
  if (task.requiresWriting) return 'gpt-4o';

  // Complex reasoning uses Claude Sonnet
  if (task.requiresReasoning || task.complexity === 'complex') {
    return 'claude-sonnet-4-5';
  }

  // Default: GPT-4o-mini (cheap and fast)
  return 'gpt-4o-mini';
}

/**
 * Execute request with selected model
 */
async function executeWithModel(
  model: string,
  prompt: string,
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
    context?: string[];
  },
  streaming: boolean = false
): Promise<{ content: string; usage: any }> {
  // Claude models
  if (model.startsWith('claude')) {
    const response = await anthropic.messages.create({
      model,
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature || 0.7,
      system: options?.systemPrompt,
      messages: [
        ...(options?.context?.map((ctx) => ({
          role: 'user' as const,
          content: ctx,
        })) || []),
        { role: 'user', content: prompt },
      ],
    });

    return {
      content: response.content[0].type === 'text'
        ? response.content[0].text
        : '',
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  // OpenAI models (GPT-4o, GPT-4o-mini)
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  if (options?.context) {
    options.context.forEach((ctx) => {
      messages.push({ role: 'user', content: ctx });
    });
  }

  messages.push({ role: 'user', content: prompt });

  if (streaming) {
    // Streaming not fully implemented in this story
    // Will be added in AI-INF-005 (Base Agent Framework)
    throw new Error('Streaming not yet supported');
  }

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.maxTokens || 1024,
  });

  return {
    content: response.choices[0].message.content || '',
    usage: {
      promptTokens: response.usage?.prompt_tokens || 0,
      completionTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0,
    },
  };
}

/**
 * Calculate cost based on model and token usage
 */
function calculateCost(model: string, usage: any): number {
  const pricing: Record<
    string,
    { input: number; output: number }
  > = {
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 }, // per 1K tokens
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'claude-sonnet-4-5': { input: 0.003, output: 0.015 },
    'text-embedding-3-small': { input: 0.00002, output: 0 },
  };

  const modelPricing = pricing[model];
  if (!modelPricing) {
    console.warn(`[AI Router] Unknown model pricing: ${model}`);
    return 0;
  }

  const inputCost = (usage.promptTokens / 1000) * modelPricing.input;
  const outputCost = (usage.completionTokens / 1000) * modelPricing.output;

  return inputCost + outputCost;
}

/**
 * Log metrics to database
 */
async function logMetrics(metrics: {
  requestId: string;
  model: string;
  useCase: string;
  userId: string;
  latency: number;
  tokensUsed: number;
  cost: number;
  success: boolean;
  error?: string;
}) {
  await supabase.from('ai_request_logs').insert({
    request_id: metrics.requestId,
    user_id: metrics.userId,
    use_case: metrics.useCase,
    model: metrics.model,
    tokens_used: metrics.tokensUsed,
    cost_usd: metrics.cost,
    latency_ms: metrics.latency,
    success: metrics.success,
    error_message: metrics.error,
    created_at: new Date().toISOString(),
  });
}
```

### Database Migration

Create file: `supabase/migrations/010_ai_request_logs.sql`

```sql
-- AI Request Logs Table
CREATE TABLE ai_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL UNIQUE,

  user_id UUID NOT NULL REFERENCES user_profiles(id),
  use_case TEXT NOT NULL, -- 'code_mentor', 'resume_builder', etc.

  model TEXT NOT NULL, -- 'gpt-4o-mini', 'gpt-4o', 'claude-sonnet-4-5'
  tokens_used INTEGER NOT NULL,
  cost_usd NUMERIC(10,6) NOT NULL,
  latency_ms INTEGER NOT NULL,

  success BOOLEAN DEFAULT true,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_ai_logs_user_id ON ai_request_logs(user_id);
CREATE INDEX idx_ai_logs_use_case ON ai_request_logs(use_case);
CREATE INDEX idx_ai_logs_model ON ai_request_logs(model);
CREATE INDEX idx_ai_logs_created_at ON ai_request_logs(created_at DESC);

-- Composite index for cost analytics
CREATE INDEX idx_ai_logs_cost_analytics ON ai_request_logs(use_case, model, created_at DESC);

-- Partitioning by month (optional, for scale)
-- Will implement in AI-INF-004 (Cost Monitoring)

-- Row Level Security
ALTER TABLE ai_request_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all logs
CREATE POLICY ai_logs_admin_all ON ai_request_logs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- Policy: Users can see their own logs
CREATE POLICY ai_logs_user_own ON ai_request_logs
  FOR SELECT
  USING (user_id = auth.uid());
```

---

## Testing

### Unit Tests

Create file: `src/lib/ai/__tests__/router.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routeAIRequest, selectModel } from '../router';

describe('AI Model Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Model Selection', () => {
    it('routes simple Q&A to GPT-4o-mini', () => {
      const model = selectModel({
        type: 'chat',
        complexity: 'simple',
        useCase: 'code_mentor',
        userId: 'test-user',
      });

      expect(model).toBe('gpt-4o-mini');
    });

    it('routes resume generation to GPT-4o', () => {
      const model = selectModel({
        type: 'completion',
        complexity: 'medium',
        requiresWriting: true,
        useCase: 'resume_builder',
        userId: 'test-user',
      });

      expect(model).toBe('gpt-4o');
    });

    it('routes interview coaching to Claude Sonnet', () => {
      const model = selectModel({
        type: 'chat',
        complexity: 'complex',
        requiresReasoning: true,
        useCase: 'interview_coach',
        userId: 'test-user',
      });

      expect(model).toBe('claude-sonnet-4-5');
    });

    it('routes embedding requests to text-embedding-3-small', () => {
      const model = selectModel({
        type: 'embedding',
        complexity: 'simple',
        useCase: 'rag_indexing',
        userId: 'test-user',
      });

      expect(model).toBe('text-embedding-3-small');
    });

    it('routes vision tasks to GPT-4o-mini', () => {
      const model = selectModel({
        type: 'vision',
        complexity: 'medium',
        useCase: 'productivity_tracking',
        userId: 'test-user',
      });

      expect(model).toBe('gpt-4o-mini');
    });
  });

  describe('Cost Calculation', () => {
    it('calculates GPT-4o-mini cost correctly', () => {
      const cost = calculateCost('gpt-4o-mini', {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      });

      // (100/1000 * 0.00015) + (50/1000 * 0.0006) = 0.000045
      expect(cost).toBeCloseTo(0.000045, 6);
    });

    it('calculates GPT-4o cost correctly', () => {
      const cost = calculateCost('gpt-4o', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // (1000/1000 * 0.0025) + (500/1000 * 0.01) = 0.0075
      expect(cost).toBeCloseTo(0.0075, 4);
    });
  });

  describe('Error Handling', () => {
    it('falls back to GPT-4o-mini on GPT-4o failure', async () => {
      // Mock GPT-4o to fail
      vi.mock('openai', () => ({
        default: vi.fn(() => ({
          chat: {
            completions: {
              create: vi.fn(() => {
                throw new Error('Rate limit exceeded');
              }),
            },
          },
        })),
      }));

      // Should not throw, should fallback
      const response = await routeAIRequest(
        {
          type: 'chat',
          complexity: 'medium',
          useCase: 'test',
          userId: 'test-user',
        },
        'Test prompt'
      );

      expect(response.model).toBe('gpt-4o-mini');
    });
  });

  describe('Performance', () => {
    it('model selection completes in <100ms', () => {
      const start = Date.now();

      selectModel({
        type: 'chat',
        complexity: 'medium',
        requiresReasoning: true,
        useCase: 'test',
        userId: 'test-user',
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });
  });
});
```

### Integration Tests

```typescript
// src/lib/ai/__tests__/router.integration.test.ts
import { describe, it, expect } from 'vitest';
import { routeAIRequest } from '../router';

describe('AI Router Integration', () => {
  it('completes full request flow', async () => {
    const response = await routeAIRequest(
      {
        type: 'chat',
        complexity: 'simple',
        useCase: 'test',
        userId: 'test-user-id',
      },
      'What is 2+2?',
      {
        systemPrompt: 'You are a helpful math tutor.',
        temperature: 0.3,
        maxTokens: 50,
      }
    );

    expect(response.content).toBeTruthy();
    expect(response.model).toBe('gpt-4o-mini');
    expect(response.usage.totalTokens).toBeGreaterThan(0);
    expect(response.cost).toBeGreaterThan(0);
    expect(response.latency).toBeGreaterThan(0);
    expect(response.latency).toBeLessThan(5000); // <5s
  });

  it('logs metrics to database', async () => {
    const response = await routeAIRequest(
      {
        type: 'chat',
        complexity: 'simple',
        useCase: 'test',
        userId: 'test-user-id',
      },
      'Hello'
    );

    // Wait for async log
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { data } = await supabase
      .from('ai_request_logs')
      .select('*')
      .eq('request_id', response.requestId)
      .single();

    expect(data).toBeTruthy();
    expect(data.model).toBe('gpt-4o-mini');
    expect(data.success).toBe(true);
  });
});
```

---

## Verification

### Manual Testing Checklist

- [ ] Simple task routes to GPT-4o-mini
- [ ] Writing task routes to GPT-4o
- [ ] Reasoning task routes to Claude Sonnet
- [ ] Cost calculation matches actual API pricing
- [ ] Metrics logged to `ai_request_logs` table
- [ ] Fallback works on model failure
- [ ] Response time <2 seconds for simple queries
- [ ] Error messages are clear and actionable

### SQL Verification

```sql
-- Check model distribution
SELECT model, COUNT(*), AVG(cost_usd), AVG(latency_ms)
FROM ai_request_logs
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY model;

-- Check success rate
SELECT
  use_case,
  COUNT(*) as total_requests,
  SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN success THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate_pct
FROM ai_request_logs
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY use_case;

-- Check daily costs
SELECT
  DATE(created_at) as date,
  SUM(cost_usd) as total_cost,
  COUNT(*) as requests
FROM ai_request_logs
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
```

---

## Dependencies

**Requires:**
- FOUND-001 (Database schema - user_profiles)
- FOUND-004 (RLS policies)
- OpenAI API key configured in environment
- Anthropic API key configured in environment

**Blocks:**
- AI-INF-002 (RAG Infrastructure - needs router)
- AI-INF-003 (Memory Layer - needs logging)
- AI-INF-005 (Base Agent Framework - uses router)

---

## Environment Variables

Add to `.env.local`:

```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Documentation

### API Usage Example

```typescript
import { routeAIRequest } from '@/lib/ai/router';

// Simple Q&A (uses GPT-4o-mini)
const response = await routeAIRequest(
  {
    type: 'chat',
    complexity: 'simple',
    useCase: 'code_mentor',
    userId: user.id,
  },
  'What is a PolicyCenter quote?',
  {
    systemPrompt: 'You are a Guidewire expert using the Socratic method.',
    temperature: 0.7,
  }
);

console.log(response.content); // AI response
console.log(response.cost); // Cost in USD
console.log(response.latency); // Latency in ms
```

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-INF-002 (RAG Infrastructure)
