# AI-INF-004: Cost Monitoring with Helicone

**Story Points:** 5
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** HIGH (Cost Control & Visibility)

---

## User Story

As a **System Administrator**,
I want **real-time AI cost monitoring with Helicone**,
So that **I can track spending, set budget alerts, and optimize usage across all AI features**.

---

## Acceptance Criteria

- [ ] Helicone integration with OpenAI and Anthropic APIs
- [ ] Tag all requests by use case (code_mentor, resume_builder, etc.)
- [ ] Tag requests by user, model, and feature
- [ ] Budget alerts trigger at $500/day threshold
- [ ] Weekly cost reports emailed to admins
- [ ] Dashboard showing cost by use case, model, user
- [ ] Cost per student and cost per employee metrics
- [ ] Query logs retained for 90 days
- [ ] Export cost data to CSV for analysis
- [ ] Rate limiting integration (block at budget threshold)

---

## Technical Implementation

### Helicone Integration

Create file: `src/lib/ai/helicone.ts`

```typescript
// /src/lib/ai/helicone.ts
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * Helicone-wrapped OpenAI client
 */
export const heliconeOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://oai.helicone.ai/v1',
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

/**
 * Helicone-wrapped Anthropic client
 */
export const heliconeAnthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: 'https://anthropic.helicone.ai',
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
  },
});

/**
 * Tag request with metadata for cost tracking
 */
export function buildHeliconeHeaders(metadata: {
  useCase: string;
  userId: string;
  feature: string;
  userType?: 'student' | 'employee' | 'trainer' | 'admin';
}): Record<string, string> {
  return {
    'Helicone-Property-UseCase': metadata.useCase,
    'Helicone-Property-UserId': metadata.userId,
    'Helicone-Property-Feature': metadata.feature,
    'Helicone-Property-UserType': metadata.userType || 'unknown',
    'Helicone-User-Id': metadata.userId,
  };
}

/**
 * Enhanced AI request with Helicone tracking
 */
export async function trackedAIRequest(
  model: string,
  prompt: string,
  metadata: {
    useCase: string;
    userId: string;
    feature: string;
    userType?: 'student' | 'employee' | 'trainer' | 'admin';
  },
  options?: {
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<{
  content: string;
  usage: any;
  heliconeRequestId: string;
}> {
  const headers = buildHeliconeHeaders(metadata);
  const startTime = Date.now();

  try {
    if (model.startsWith('claude')) {
      const response = await heliconeAnthropic.messages.create(
        {
          model,
          max_tokens: options?.maxTokens || 1024,
          temperature: options?.temperature || 0.7,
          system: options?.systemPrompt,
          messages: [{ role: 'user', content: prompt }],
        },
        {
          headers,
        }
      );

      return {
        content: response.content[0].type === 'text'
          ? response.content[0].text
          : '',
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        heliconeRequestId: response.id,
      };
    } else {
      const response = await heliconeOpenAI.chat.completions.create(
        {
          model,
          messages: [
            ...(options?.systemPrompt
              ? [{ role: 'system' as const, content: options.systemPrompt }]
              : []),
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 1024,
        },
        {
          headers,
        }
      );

      return {
        content: response.choices[0].message.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        heliconeRequestId: response.id,
      };
    }
  } catch (error) {
    // Log failure to database
    await supabase.from('ai_cost_alerts').insert({
      alert_type: 'request_failure',
      metadata: {
        model,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata,
      },
      created_at: new Date().toISOString(),
    });

    throw error;
  }
}

/**
 * Check daily budget and enforce limits
 */
export async function checkBudgetLimit(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  // Get today's spending from ai_request_logs
  const { data, error } = await supabase
    .from('ai_request_logs')
    .select('cost_usd')
    .gte('created_at', `${today}T00:00:00Z`)
    .lt('created_at', `${today}T23:59:59Z`);

  if (error) throw error;

  const totalCost = data.reduce((sum, row) => sum + parseFloat(row.cost_usd), 0);

  // Budget limit: $500/day
  const DAILY_BUDGET_LIMIT = 500;

  if (totalCost >= DAILY_BUDGET_LIMIT) {
    // Trigger alert
    await supabase.from('ai_cost_alerts').insert({
      alert_type: 'budget_exceeded',
      metadata: {
        daily_cost: totalCost,
        limit: DAILY_BUDGET_LIMIT,
        date: today,
      },
      created_at: new Date().toISOString(),
    });

    return false; // Block request
  }

  // Warn at 80% threshold
  if (totalCost >= DAILY_BUDGET_LIMIT * 0.8) {
    await supabase.from('ai_cost_alerts').insert({
      alert_type: 'budget_warning',
      metadata: {
        daily_cost: totalCost,
        limit: DAILY_BUDGET_LIMIT,
        percent: (totalCost / DAILY_BUDGET_LIMIT) * 100,
        date: today,
      },
      created_at: new Date().toISOString(),
    });
  }

  return true; // Allow request
}

/**
 * Get cost summary for dashboard
 */
export async function getCostSummary(
  startDate: string,
  endDate: string
): Promise<{
  totalCost: number;
  byUseCase: Record<string, number>;
  byModel: Record<string, number>;
  byUser: Record<string, { cost: number; requests: number }>;
  topUsers: Array<{ userId: string; cost: number; requests: number }>;
}> {
  const { data, error } = await supabase
    .from('ai_request_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (error) throw error;

  const totalCost = data.reduce((sum, row) => sum + parseFloat(row.cost_usd), 0);

  // Group by use case
  const byUseCase: Record<string, number> = {};
  data.forEach((row) => {
    byUseCase[row.use_case] = (byUseCase[row.use_case] || 0) + parseFloat(row.cost_usd);
  });

  // Group by model
  const byModel: Record<string, number> = {};
  data.forEach((row) => {
    byModel[row.model] = (byModel[row.model] || 0) + parseFloat(row.cost_usd);
  });

  // Group by user
  const byUser: Record<string, { cost: number; requests: number }> = {};
  data.forEach((row) => {
    if (!byUser[row.user_id]) {
      byUser[row.user_id] = { cost: 0, requests: 0 };
    }
    byUser[row.user_id].cost += parseFloat(row.cost_usd);
    byUser[row.user_id].requests += 1;
  });

  // Top 10 users by cost
  const topUsers = Object.entries(byUser)
    .map(([userId, stats]) => ({ userId, ...stats }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  return {
    totalCost,
    byUseCase,
    byModel,
    byUser,
    topUsers,
  };
}

/**
 * Export cost data to CSV
 */
export async function exportCostData(
  startDate: string,
  endDate: string
): Promise<string> {
  const { data, error } = await supabase
    .from('ai_request_logs')
    .select('*')
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // CSV headers
  const headers = [
    'Request ID',
    'User ID',
    'Use Case',
    'Model',
    'Tokens Used',
    'Cost (USD)',
    'Latency (ms)',
    'Success',
    'Created At',
  ];

  // CSV rows
  const rows = data.map((row) => [
    row.request_id,
    row.user_id,
    row.use_case,
    row.model,
    row.tokens_used,
    row.cost_usd,
    row.latency_ms,
    row.success,
    row.created_at,
  ]);

  // Build CSV
  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

  return csv;
}
```

### Database Migration

Create file: `supabase/migrations/013_cost_monitoring.sql`

```sql
-- Cost alerts table
CREATE TABLE ai_cost_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  alert_type TEXT NOT NULL, -- 'budget_exceeded', 'budget_warning', 'request_failure'
  metadata JSONB NOT NULL,

  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_cost_alerts_type ON ai_cost_alerts(alert_type);
CREATE INDEX idx_cost_alerts_created_at ON ai_cost_alerts(created_at DESC);
CREATE INDEX idx_cost_alerts_unresolved ON ai_cost_alerts(resolved) WHERE NOT resolved;

-- RLS
ALTER TABLE ai_cost_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view alerts
CREATE POLICY cost_alerts_admin_only ON ai_cost_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Daily cost summary view (materialized for performance)
CREATE MATERIALIZED VIEW daily_cost_summary AS
SELECT
  DATE(created_at) as date,
  use_case,
  model,
  COUNT(*) as request_count,
  SUM(tokens_used) as total_tokens,
  SUM(cost_usd) as total_cost,
  AVG(latency_ms) as avg_latency,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as success_rate_pct
FROM ai_request_logs
GROUP BY DATE(created_at), use_case, model
ORDER BY date DESC, total_cost DESC;

-- Refresh materialized view daily (cron job)
CREATE INDEX idx_daily_cost_summary_date ON daily_cost_summary(date DESC);

-- Function to send weekly cost report (called by cron)
CREATE OR REPLACE FUNCTION send_weekly_cost_report()
RETURNS void AS $$
DECLARE
  report_data jsonb;
  total_cost numeric;
BEGIN
  -- Get last 7 days cost summary
  SELECT
    jsonb_build_object(
      'total_cost', SUM(total_cost),
      'total_requests', SUM(request_count),
      'by_use_case', jsonb_object_agg(use_case, total_cost)
    )
  INTO report_data
  FROM daily_cost_summary
  WHERE date > NOW() - INTERVAL '7 days';

  -- Insert notification for admins
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    created_at
  )
  SELECT
    ur.user_id,
    'cost_report',
    'Weekly AI Cost Report',
    'Your weekly AI spending summary is ready',
    report_data,
    NOW()
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE r.name = 'admin';
END;
$$ LANGUAGE plpgsql;
```

---

## Testing

### Unit Tests

Create file: `src/lib/ai/__tests__/helicone.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  trackedAIRequest,
  checkBudgetLimit,
  getCostSummary,
  exportCostData,
} from '../helicone';

describe('Cost Monitoring with Helicone', () => {
  describe('Tracked AI Requests', () => {
    it('tags request with metadata', async () => {
      const response = await trackedAIRequest(
        'gpt-4o-mini',
        'What is PolicyCenter?',
        {
          useCase: 'code_mentor',
          userId: 'student-123',
          feature: 'guidewire_guru',
          userType: 'student',
        }
      );

      expect(response.content).toBeTruthy();
      expect(response.usage.totalTokens).toBeGreaterThan(0);
      expect(response.heliconeRequestId).toBeTruthy();
    });

    it('works with Claude models', async () => {
      const response = await trackedAIRequest(
        'claude-sonnet-4-5',
        'Help me prepare for an interview',
        {
          useCase: 'interview_coach',
          userId: 'student-456',
          feature: 'guidewire_guru',
          userType: 'student',
        },
        {
          systemPrompt: 'You are an interview coach',
          temperature: 0.7,
        }
      );

      expect(response.content).toBeTruthy();
      expect(response.heliconeRequestId).toBeTruthy();
    });

    it('logs failures to database', async () => {
      // Mock API failure
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

      try {
        await trackedAIRequest('gpt-4o-mini', 'test', {
          useCase: 'test',
          userId: 'test-user',
          feature: 'test',
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify alert logged
      const { data } = await supabase
        .from('ai_cost_alerts')
        .select('*')
        .eq('alert_type', 'request_failure')
        .single();

      expect(data).toBeTruthy();
      expect(data.metadata.error).toContain('Rate limit');
    });
  });

  describe('Budget Enforcement', () => {
    it('allows requests under budget', async () => {
      const allowed = await checkBudgetLimit('test-user');
      expect(allowed).toBe(true);
    });

    it('blocks requests over daily budget', async () => {
      // Simulate $500+ spending today
      const today = new Date().toISOString().split('T')[0];

      for (let i = 0; i < 100; i++) {
        await supabase.from('ai_request_logs').insert({
          request_id: crypto.randomUUID(),
          user_id: 'test-user',
          use_case: 'test',
          model: 'gpt-4o',
          tokens_used: 1000,
          cost_usd: 5.0, // $5 per request
          latency_ms: 1000,
          success: true,
          created_at: `${today}T12:00:00Z`,
        });
      }

      const allowed = await checkBudgetLimit('test-user');
      expect(allowed).toBe(false);

      // Verify alert triggered
      const { data } = await supabase
        .from('ai_cost_alerts')
        .select('*')
        .eq('alert_type', 'budget_exceeded')
        .single();

      expect(data).toBeTruthy();
      expect(data.metadata.daily_cost).toBeGreaterThanOrEqual(500);
    });

    it('warns at 80% budget threshold', async () => {
      const today = new Date().toISOString().split('T')[0];

      // Simulate $400 spending (80% of $500)
      for (let i = 0; i < 80; i++) {
        await supabase.from('ai_request_logs').insert({
          request_id: crypto.randomUUID(),
          user_id: 'test-user',
          use_case: 'test',
          model: 'gpt-4o',
          tokens_used: 1000,
          cost_usd: 5.0,
          latency_ms: 1000,
          success: true,
          created_at: `${today}T12:00:00Z`,
        });
      }

      await checkBudgetLimit('test-user');

      // Verify warning alert
      const { data } = await supabase
        .from('ai_cost_alerts')
        .select('*')
        .eq('alert_type', 'budget_warning')
        .single();

      expect(data).toBeTruthy();
      expect(data.metadata.percent).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Cost Summary', () => {
    it('aggregates cost by use case', async () => {
      const summary = await getCostSummary(
        '2025-01-01T00:00:00Z',
        '2025-01-31T23:59:59Z'
      );

      expect(summary.totalCost).toBeGreaterThan(0);
      expect(Object.keys(summary.byUseCase).length).toBeGreaterThan(0);
      expect(Object.keys(summary.byModel).length).toBeGreaterThan(0);
      expect(summary.topUsers.length).toBeGreaterThan(0);
    });

    it('identifies top cost users', async () => {
      const summary = await getCostSummary(
        '2025-01-01T00:00:00Z',
        '2025-01-31T23:59:59Z'
      );

      const topUser = summary.topUsers[0];
      expect(topUser.cost).toBeGreaterThan(0);
      expect(topUser.requests).toBeGreaterThan(0);
    });
  });

  describe('CSV Export', () => {
    it('exports cost data to CSV', async () => {
      const csv = await exportCostData(
        '2025-01-01T00:00:00Z',
        '2025-01-31T23:59:59Z'
      );

      expect(csv).toContain('Request ID,User ID,Use Case');
      expect(csv.split('\n').length).toBeGreaterThan(1); // Headers + data
    });
  });
});
```

---

## Verification

### Manual Testing Checklist

- [ ] Helicone dashboard shows tagged requests
- [ ] Budget alert triggers at $500/day
- [ ] Weekly cost report generated
- [ ] Cost summary dashboard displays correctly
- [ ] CSV export downloads successfully
- [ ] Rate limiting blocks requests when over budget
- [ ] Alerts sent to admin users

### SQL Verification

```sql
-- Check total cost today
SELECT SUM(cost_usd), COUNT(*)
FROM ai_request_logs
WHERE created_at > NOW() - INTERVAL '1 day';

-- Check budget alerts
SELECT alert_type, COUNT(*), MAX(created_at)
FROM ai_cost_alerts
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY alert_type;

-- Check daily cost summary
SELECT * FROM daily_cost_summary
WHERE date > NOW() - INTERVAL '7 days'
ORDER BY date DESC, total_cost DESC;

-- Top users by cost
SELECT
  user_id,
  SUM(cost_usd) as total_cost,
  COUNT(*) as requests
FROM ai_request_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY total_cost DESC
LIMIT 10;
```

---

## Dependencies

**Requires:**
- AI-INF-001 (Model Router - cost calculation)
- Helicone API key configured
- Supabase notifications table (for alerts)

**Blocks:**
- All AI features (need cost monitoring in place)
- Production deployment (must monitor costs)

---

## Environment Variables

Add to `.env.local`:

```bash
HELICONE_API_KEY=sk-helicone-...
```

---

## Documentation

### Helicone Dashboard Setup

1. Sign up at https://helicone.ai
2. Get API key from dashboard
3. Configure custom properties:
   - UseCase (code_mentor, resume_builder, etc.)
   - UserId (user identifier)
   - Feature (guidewire_guru, productivity_tracking, etc.)
   - UserType (student, employee, trainer, admin)
4. Set up budget alerts ($500/day threshold)
5. Configure weekly email reports

### Usage Example

```typescript
import { trackedAIRequest } from '@/lib/ai/helicone';

const response = await trackedAIRequest(
  'gpt-4o-mini',
  'What is a quote in PolicyCenter?',
  {
    useCase: 'code_mentor',
    userId: user.id,
    feature: 'guidewire_guru',
    userType: 'student',
  }
);

console.log(response.content);
console.log(response.heliconeRequestId); // Track in Helicone dashboard
```

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-INF-005 (Base Agent Framework)
