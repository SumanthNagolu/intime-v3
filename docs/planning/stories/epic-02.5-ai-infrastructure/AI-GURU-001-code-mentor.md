# AI-GURU-001: Code Mentor Agent

**Story Points:** 8
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** CRITICAL (Core Student Experience)

---

## User Story

As a **Student**,
I want **an AI code mentor that uses the Socratic method**,
So that **I learn deeply by discovering answers myself instead of being told directly**.

---

## Acceptance Criteria

- [ ] Socratic method implementation (ask guiding questions, don't give answers)
- [ ] RAG retrieval from curriculum knowledge base
- [ ] Student progress context awareness
- [ ] Struggle detection (3+ similar questions → escalate to human)
- [ ] Code examples provided only after student attempts
- [ ] Encouragement and positive reinforcement
- [ ] 95%+ helpful response rate (student thumbs up)
- [ ] <5% escalation rate to human trainers
- [ ] Response time <2 seconds
- [ ] Integration with student dashboard

---

## Technical Implementation

### Code Mentor Agent

Create file: `src/lib/ai/agents/CodeMentorAgent.ts`

```typescript
// /src/lib/ai/agents/CodeMentorAgent.ts
import { BaseAgent, AgentConfig, AgentContext, AgentResponse } from './BaseAgent';
import { PromptLibrary } from '../prompts/library';

export class CodeMentorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'code_mentor',
      useCase: 'code_mentor',
      defaultModel: 'gpt-4o-mini', // Cheap and fast for Q&A
      systemPrompt: `You are a Guidewire expert teaching insurance software development using the Socratic method.

CORE PHILOSOPHY:
- NEVER give direct answers - ask guiding questions that lead students to discover
- Reference curriculum context when available
- Detect when student is genuinely stuck (3+ similar questions) → escalate
- Celebrate small wins and progress
- Encourage hands-on experimentation

SOCRATIC APPROACH:
1. Ask what they already know about the topic
2. Guide them to connect dots with follow-up questions
3. Provide hints only when necessary
4. Encourage them to try code and report back
5. Only give direct answers after student has attempted multiple approaches

STYLE:
- Friendly and encouraging, never condescending
- Use insurance domain examples (quotes, policies, claims)
- Keep responses concise (2-4 sentences max)
- Use emojis sparingly for encouragement`,
      ragCollection: 'curriculum',
      requiresReasoning: false,
      requiresWriting: false,
    });
  }

  /**
   * Override query to add Socratic method logic
   */
  async query(
    query: string,
    context: AgentContext,
    options?: any
  ): Promise<AgentResponse> {
    // Check if student has asked similar questions before
    const struggleCount = await this.checkStrugglePattern(query, context.userId);

    if (struggleCount >= 3) {
      // Student is stuck - provide more direct help
      console.log(`[CodeMentor] Student ${context.userId} struggling, providing direct help`);

      return this.provideDirectHelp(query, context, options);
    }

    // Normal Socratic approach
    return super.query(query, context, {
      ...options,
      includeRAG: true, // Always use curriculum context
    });
  }

  /**
   * Check if student is struggling with similar questions
   */
  private async checkStrugglePattern(query: string, userId: string): Promise<number> {
    const history = await this.memory.getUserHistory(userId, 'code_mentor', 10);

    const similarQuestions = history.filter((h) =>
      this.isSimilarQuestion(query, h.question || '')
    );

    return similarQuestions.length;
  }

  /**
   * Check if two questions are similar
   */
  private isSimilarQuestion(q1: string, q2: string): boolean {
    const words1 = q1.toLowerCase().split(/\s+/);
    const words2 = q2.toLowerCase().split(/\s+/);

    // Remove common words
    const stopWords = ['what', 'is', 'how', 'do', 'i', 'the', 'a', 'an', 'in', 'to'];
    const filtered1 = words1.filter((w) => !stopWords.includes(w));
    const filtered2 = words2.filter((w) => !stopWords.includes(w));

    // Calculate overlap
    const commonWords = filtered1.filter((w) => filtered2.includes(w));
    const similarity =
      commonWords.length / Math.max(filtered1.length, filtered2.length);

    return similarity > 0.5; // 50%+ overlap
  }

  /**
   * Provide direct help when student is stuck
   */
  private async provideDirectHelp(
    query: string,
    context: AgentContext,
    options?: any
  ): Promise<AgentResponse> {
    // Get curriculum context
    const ragResults = await this.rag.search({
      query,
      collection: 'curriculum',
      topK: 3,
    });

    const curriculumContext = ragResults
      .map((r, i) => `[Source ${i + 1}]\n${r.content}`)
      .join('\n\n');

    // Build direct help prompt
    const prompt = `STUDENT QUESTION (struggling, needs direct help):
${query}

CURRICULUM CONTEXT:
${curriculumContext}

Provide a DIRECT, CLEAR answer with:
1. Explanation of the concept
2. Concrete code example (if applicable)
3. Encouragement to practice
4. Suggestion to escalate to human trainer if still unclear

Keep it simple and actionable.`;

    const response = await this.routeRequest(
      prompt,
      context,
      options
    );

    // Log escalation pattern
    await this.memory.learnPattern(
      context.userId,
      'struggle',
      `Student struggling with: ${query}`,
      { ...context.metadata, escalate_candidate: true }
    );

    return response;
  }

  /**
   * Route request (internal helper)
   */
  private async routeRequest(
    prompt: string,
    context: AgentContext,
    options?: any
  ): Promise<AgentResponse> {
    const { trackedAIRequest } = await import('../helicone');

    const response = await trackedAIRequest(
      this.config.defaultModel,
      prompt,
      {
        useCase: this.config.useCase,
        userId: context.userId,
        feature: this.config.name,
        userType: context.userType,
      },
      {
        systemPrompt: this.config.systemPrompt,
        temperature: options?.temperature || 0.7,
        maxTokens: options?.maxTokens || 512,
      }
    );

    return {
      content: response.content,
      model: this.config.defaultModel,
      usage: response.usage,
      cost: this.calculateCost(this.config.defaultModel, response.usage),
      latency: 0, // Will be calculated by BaseAgent
      conversationId: context.conversationId,
    };
  }

  /**
   * Custom learning: Detect escalation triggers
   */
  protected async learnFromInteraction(
    query: string,
    response: string,
    context: any
  ): Promise<void> {
    await super.learnFromInteraction(query, response, context);

    // Check if student explicitly asks for human help
    const queryLower = query.toLowerCase();
    const humanKeywords = [
      'talk to trainer',
      'speak to human',
      'need help from person',
      'escalate',
    ];

    if (humanKeywords.some((kw) => queryLower.includes(kw))) {
      await this.memory.learnPattern(
        context.userId,
        'struggle',
        `Student requested human help: ${query}`,
        { ...context.metadata, escalate: true }
      );
    }

    // Detect if student understood (success pattern)
    const successKeywords = [
      'got it',
      'makes sense',
      'i understand',
      'thank you',
      'that helps',
    ];

    if (successKeywords.some((kw) => queryLower.includes(kw))) {
      await this.memory.learnPattern(
        context.userId,
        'success',
        `Student understood: ${query}`,
        context.metadata
      );
    }
  }
}
```

### Student Dashboard Integration

Create file: `src/app/api/students/code-mentor/route.ts`

```typescript
// /src/app/api/students/code-mentor/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CodeMentorAgent } from '@/lib/ai/agents/CodeMentorAgent';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { query, conversationId, metadata } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Initialize agent
    const agent = new CodeMentorAgent();

    // Execute query
    const response = await agent.query(
      query,
      {
        conversationId: conversationId || crypto.randomUUID(),
        userId: user.id,
        userType: 'student',
        metadata,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        conversationId: response.conversationId,
        sources: response.sources,
        cost: response.cost,
        latency: response.latency,
      },
    });
  } catch (error) {
    console.error('[CodeMentor API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversation history
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    const agent = new CodeMentorAgent();
    const conversation = await agent['memory'].getConversation(conversationId);

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('[CodeMentor API] Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to retrieve conversation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

---

## Testing

### Unit Tests

Create file: `src/lib/ai/agents/__tests__/CodeMentorAgent.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { CodeMentorAgent } from '../CodeMentorAgent';

describe('Code Mentor Agent', () => {
  let agent: CodeMentorAgent;

  beforeEach(() => {
    agent = new CodeMentorAgent();
  });

  describe('Socratic Method', () => {
    it('asks guiding questions instead of direct answers', async () => {
      const response = await agent.query(
        'What is a PolicyCenter quote?',
        {
          conversationId: 'test-conv',
          userId: 'student-123',
          userType: 'student',
        }
      );

      // Response should contain a question mark (Socratic approach)
      expect(response.content).toMatch(/\?/);
      expect(response.content.toLowerCase()).not.toContain('a quote is');
    });

    it('includes curriculum context', async () => {
      const response = await agent.query(
        'How does rating work in PolicyCenter?',
        {
          conversationId: 'test-conv',
          userId: 'student-123',
          userType: 'student',
        }
      );

      expect(response.sources).toBeTruthy();
      expect(response.sources!.length).toBeGreaterThan(0);
    });
  });

  describe('Struggle Detection', () => {
    it('provides direct help after 3 similar questions', async () => {
      const conversationId = 'struggle-test';

      // Ask similar question 3 times
      for (let i = 0; i < 3; i++) {
        await agent.query('What is rating in PolicyCenter?', {
          conversationId,
          userId: 'student-struggling',
          userType: 'student',
        });
      }

      // 4th time should get direct help
      const response = await agent.query(
        'What is rating in PolicyCenter?',
        {
          conversationId,
          userId: 'student-struggling',
          userType: 'student',
        }
      );

      // Response should be more direct (no question marks at end)
      expect(response.content).toBeTruthy();
      // Should contain explanation
      expect(response.content.length).toBeGreaterThan(100);
    });

    it('detects when student requests human help', async () => {
      await agent.query(
        'I need to talk to a trainer about this',
        {
          conversationId: 'escalate-test',
          userId: 'student-123',
          userType: 'student',
        }
      );

      const patterns = await agent['memory'].findSimilarPatterns(
        'human help',
        'student-123'
      );

      const escalationPattern = patterns.find(
        (p) => p.context?.escalate === true
      );

      expect(escalationPattern).toBeTruthy();
    });
  });

  describe('Success Tracking', () => {
    it('tracks when student understands', async () => {
      await agent.query(
        'Got it, that makes sense now! Thank you!',
        {
          conversationId: 'success-test',
          userId: 'student-123',
          userType: 'student',
        }
      );

      const patterns = await agent['memory'].findSimilarPatterns(
        'understood',
        'student-123'
      );

      const successPattern = patterns.find(
        (p) => p.pattern_type === 'success'
      );

      expect(successPattern).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('responds in <2 seconds', async () => {
      const start = Date.now();

      await agent.query('What is a quote?', {
        conversationId: 'perf-test',
        userId: 'student-123',
        userType: 'student',
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('API Integration', () => {
    it('POST /api/students/code-mentor works', async () => {
      const response = await fetch('/api/students/code-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'What is PolicyCenter?',
          conversationId: 'api-test',
        }),
      });

      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(data.success).toBe(true);
      expect(data.data.content).toBeTruthy();
    });
  });
});
```

---

## Verification

### Manual Testing Checklist

- [ ] Agent asks guiding questions (Socratic method)
- [ ] Curriculum context included in responses
- [ ] Struggle detection after 3 similar questions
- [ ] Direct help provided when student is stuck
- [ ] Escalation patterns logged correctly
- [ ] Success patterns tracked
- [ ] Response time <2 seconds
- [ ] API endpoints functional
- [ ] Student dashboard integration works

### SQL Verification

```sql
-- Check Code Mentor usage
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_queries,
  AVG(user_rating) as avg_rating
FROM ai_interactions
WHERE use_case = 'code_mentor'
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Check escalation patterns
SELECT
  user_id,
  COUNT(*) as struggle_count,
  MAX(created_at) as last_struggle
FROM ai_learned_patterns
WHERE pattern_type = 'struggle'
AND context->>'escalate' = 'true'
GROUP BY user_id
ORDER BY struggle_count DESC
LIMIT 10;

-- Check success rate
SELECT
  COUNT(*) FILTER (WHERE user_rating >= 4) * 100.0 / COUNT(*) as helpful_rate_pct
FROM ai_interactions
WHERE use_case = 'code_mentor'
AND user_rating IS NOT NULL;
```

---

## Dependencies

**Requires:**
- AI-INF-001 (Model Router)
- AI-INF-002 (RAG Infrastructure - curriculum)
- AI-INF-003 (Memory Layer)
- AI-INF-005 (Base Agent Framework)
- AI-INF-006 (Prompt Library)

**Blocks:**
- Student dashboard features
- Training academy completion metrics

---

## Documentation

### Usage Example (Student Dashboard)

```typescript
import { CodeMentorAgent } from '@/lib/ai/agents/CodeMentorAgent';

// In student chat component
const handleSubmit = async (query: string) => {
  const response = await fetch('/api/students/code-mentor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      conversationId: sessionId,
      metadata: {
        module: currentModule,
        lesson: currentLesson,
      },
    }),
  });

  const data = await response.json();

  if (data.success) {
    appendMessage({
      role: 'assistant',
      content: data.data.content,
      sources: data.data.sources,
    });
  }
};
```

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-GURU-002 (Resume Builder Agent)
