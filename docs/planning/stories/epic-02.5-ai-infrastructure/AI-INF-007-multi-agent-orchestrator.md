# AI-INF-007: Multi-Agent Orchestrator

**Story Points:** 3
**Sprint:** Sprint 2 (Week 7-8)
**Priority:** MEDIUM (Coordination & Routing)

---

## User Story

As a **System**,
I want **an orchestrator to route queries to the correct specialist agent**,
So that **users get the right AI assistant for their task without manual selection**.

---

## Acceptance Criteria

- [ ] Automatic agent selection based on query intent
- [ ] Support for 4+ specialist agents (Code Mentor, Resume Builder, Interview Coach, Project Planner)
- [ ] Intent classification using GPT-4o-mini (fast and cheap)
- [ ] Agent handoff support (transfer conversation to different agent)
- [ ] Context preservation during handoffs
- [ ] Escalation detection (when to involve human)
- [ ] Performance: <200ms routing decision
- [ ] 95%+ routing accuracy
- [ ] Fallback to default agent on uncertainty
- [ ] Conversation state management

---

## Technical Implementation

### Orchestrator Class

Create file: `src/lib/ai/orchestrator/Orchestrator.ts`

```typescript
// /src/lib/ai/orchestrator/Orchestrator.ts
import { BaseAgent } from '../agents/BaseAgent';
import { routeAIRequest } from '../router';
import { MemoryLayer } from '../memory';

export type AgentIntent =
  | 'code_help'
  | 'resume_building'
  | 'interview_prep'
  | 'project_planning'
  | 'general_question'
  | 'unknown';

export type OrchestrationContext = {
  conversationId: string;
  userId: string;
  userType?: 'student' | 'employee' | 'trainer' | 'admin';
  currentAgent?: string;
  metadata?: Record<string, any>;
};

export type OrchestrationResponse = {
  agentName: string;
  content: string;
  shouldEscalate: boolean;
  escalationReason?: string;
  handoffOccurred: boolean;
  previousAgent?: string;
};

export class Orchestrator {
  private agents: Map<string, BaseAgent>;
  private memory: MemoryLayer;

  constructor() {
    this.agents = new Map();
    this.memory = new MemoryLayer();
  }

  /**
   * Register an agent
   */
  registerAgent(name: string, agent: BaseAgent): void {
    this.agents.set(name, agent);
  }

  /**
   * Classify intent from user query
   */
  async classifyIntent(query: string, context: OrchestrationContext): Promise<{
    intent: AgentIntent;
    confidence: number;
    reasoning: string;
  }> {
    const startTime = Date.now();

    // Use GPT-4o-mini for fast, cheap classification
    const response = await routeAIRequest(
      {
        type: 'completion',
        complexity: 'simple',
        useCase: 'intent_classification',
        userId: context.userId,
      },
      query,
      {
        systemPrompt: `You are an intent classifier for a training platform.

Classify the user's query into ONE of these intents:

1. **code_help** - Questions about Guidewire code, concepts, errors, debugging
2. **resume_building** - Help with resume, CV, LinkedIn profile
3. **interview_prep** - Interview practice, behavioral questions, company research
4. **project_planning** - Capstone project help, milestone planning, task breakdown
5. **general_question** - Administrative questions, platform help, general inquiry
6. **unknown** - Cannot determine intent

USER QUERY:
${query}

Return ONLY a JSON object:
{
  "intent": "code_help",
  "confidence": 0.95,
  "reasoning": "User is asking about PolicyCenter rating concept"
}`,
        temperature: 0.3, // Low temperature for consistent classification
        maxTokens: 100,
      }
    );

    const latency = Date.now() - startTime;

    try {
      const parsed = JSON.parse(response.content);

      console.log(`[Orchestrator] Intent classified in ${latency}ms:`, parsed);

      return {
        intent: parsed.intent,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
      };
    } catch (error) {
      console.error('[Orchestrator] Failed to parse intent:', error);

      // Fallback: General question
      return {
        intent: 'general_question',
        confidence: 0.5,
        reasoning: 'Failed to parse classification response',
      };
    }
  }

  /**
   * Map intent to agent name
   */
  private intentToAgent(intent: AgentIntent): string {
    const mapping: Record<AgentIntent, string> = {
      code_help: 'code_mentor',
      resume_building: 'resume_builder',
      interview_prep: 'interview_coach',
      project_planning: 'project_planner',
      general_question: 'code_mentor', // Default fallback
      unknown: 'code_mentor',
    };

    return mapping[intent];
  }

  /**
   * Route query to appropriate agent
   */
  async route(
    query: string,
    context: OrchestrationContext
  ): Promise<OrchestrationResponse> {
    // 1. Classify intent
    const { intent, confidence } = await this.classifyIntent(query, context);

    // 2. Select agent
    const selectedAgent = this.intentToAgent(intent);

    // 3. Check for agent handoff
    const handoffOccurred = context.currentAgent !== undefined &&
      context.currentAgent !== selectedAgent;

    if (handoffOccurred) {
      console.log(
        `[Orchestrator] Handoff: ${context.currentAgent} → ${selectedAgent}`
      );

      // Preserve context during handoff
      await this.transferContext(
        context.conversationId,
        context.currentAgent!,
        selectedAgent
      );
    }

    // 4. Get agent instance
    const agent = this.agents.get(selectedAgent);

    if (!agent) {
      throw new Error(`Agent '${selectedAgent}' not registered`);
    }

    // 5. Execute query
    const response = await agent.query(query, {
      conversationId: context.conversationId,
      userId: context.userId,
      userType: context.userType,
      metadata: {
        ...context.metadata,
        intent,
        confidence,
      },
    });

    // 6. Check for escalation triggers
    const escalation = await this.checkEscalation(
      query,
      response.content,
      context
    );

    return {
      agentName: selectedAgent,
      content: response.content,
      shouldEscalate: escalation.shouldEscalate,
      escalationReason: escalation.reason,
      handoffOccurred,
      previousAgent: handoffOccurred ? context.currentAgent : undefined,
    };
  }

  /**
   * Transfer context during agent handoff
   */
  private async transferContext(
    conversationId: string,
    fromAgent: string,
    toAgent: string
  ): Promise<void> {
    // Get conversation from memory
    const conversation = await this.memory.getConversation(conversationId);

    if (!conversation) return;

    // Add handoff message
    await this.memory.saveMessage(
      conversationId,
      conversation.userId,
      toAgent,
      {
        role: 'system',
        content: `[Agent handoff from ${fromAgent} to ${toAgent}]`,
        timestamp: new Date().toISOString(),
      }
    );
  }

  /**
   * Check if conversation should escalate to human
   */
  private async checkEscalation(
    query: string,
    response: string,
    context: OrchestrationContext
  ): Promise<{ shouldEscalate: boolean; reason?: string }> {
    // Get user's recent patterns
    const patterns = await this.memory.findSimilarPatterns(
      query,
      context.userId,
      10
    );

    // Escalation triggers:

    // 1. User asked same question 3+ times
    const strugglePatterns = patterns.filter((p) => p.pattern_type === 'struggle');

    if (strugglePatterns.length >= 3) {
      return {
        shouldEscalate: true,
        reason: 'User struggling with repeated questions',
      };
    }

    // 2. User explicitly asks for human help
    const queryLower = query.toLowerCase();
    const humanKeywords = [
      'talk to human',
      'speak to trainer',
      'need real person',
      'human help',
    ];

    if (humanKeywords.some((kw) => queryLower.includes(kw))) {
      return {
        shouldEscalate: true,
        reason: 'User requested human assistance',
      };
    }

    // 3. AI response indicates uncertainty
    const uncertaintyPhrases = [
      "i'm not sure",
      "i don't know",
      'unclear',
      'uncertain',
    ];

    const responseLower = response.toLowerCase();

    if (uncertaintyPhrases.some((phrase) => responseLower.includes(phrase))) {
      return {
        shouldEscalate: true,
        reason: 'AI response indicates uncertainty',
      };
    }

    // No escalation needed
    return { shouldEscalate: false };
  }

  /**
   * Get orchestration statistics
   */
  async getStats(userId: string): Promise<{
    totalQueries: number;
    agentUsage: Record<string, number>;
    escalationRate: number;
    handoffRate: number;
  }> {
    const history = await this.memory.getUserHistory(userId);

    const agentUsage: Record<string, number> = {};
    let escalations = 0;
    let handoffs = 0;

    history.forEach((interaction) => {
      const agent = interaction.context?.intent || 'unknown';
      agentUsage[agent] = (agentUsage[agent] || 0) + 1;

      if (interaction.context?.escalate) escalations++;
      if (interaction.context?.handoff) handoffs++;
    });

    return {
      totalQueries: history.length,
      agentUsage,
      escalationRate: history.length > 0 ? escalations / history.length : 0,
      handoffRate: history.length > 0 ? handoffs / history.length : 0,
    };
  }
}
```

---

## Testing

### Unit Tests

Create file: `src/lib/ai/orchestrator/__tests__/Orchestrator.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Orchestrator } from '../Orchestrator';
import { BaseAgent, AgentConfig } from '../../agents/BaseAgent';

// Mock agent
class MockAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }
}

describe('Multi-Agent Orchestrator', () => {
  let orchestrator: Orchestrator;
  let codeMentor: MockAgent;
  let resumeBuilder: MockAgent;
  let interviewCoach: MockAgent;

  beforeEach(() => {
    orchestrator = new Orchestrator();

    // Register mock agents
    codeMentor = new MockAgent({
      name: 'code_mentor',
      useCase: 'code_mentor',
      defaultModel: 'gpt-4o-mini',
      systemPrompt: 'You are a code mentor',
    });

    resumeBuilder = new MockAgent({
      name: 'resume_builder',
      useCase: 'resume_builder',
      defaultModel: 'gpt-4o',
      systemPrompt: 'You help build resumes',
    });

    interviewCoach = new MockAgent({
      name: 'interview_coach',
      useCase: 'interview_coach',
      defaultModel: 'claude-sonnet-4-5',
      systemPrompt: 'You are an interview coach',
    });

    orchestrator.registerAgent('code_mentor', codeMentor);
    orchestrator.registerAgent('resume_builder', resumeBuilder);
    orchestrator.registerAgent('interview_coach', interviewCoach);
  });

  describe('Intent Classification', () => {
    it('classifies code questions correctly', async () => {
      const result = await orchestrator.classifyIntent(
        'What is a PolicyCenter quote?',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
        }
      );

      expect(result.intent).toBe('code_help');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('classifies resume questions correctly', async () => {
      const result = await orchestrator.classifyIntent(
        'Help me update my resume for a Guidewire developer role',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
        }
      );

      expect(result.intent).toBe('resume_building');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('classifies interview prep correctly', async () => {
      const result = await orchestrator.classifyIntent(
        'How should I answer behavioral questions in an interview?',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
        }
      );

      expect(result.intent).toBe('interview_prep');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('completes classification in <200ms', async () => {
      const start = Date.now();

      await orchestrator.classifyIntent('test query', {
        conversationId: 'test-conv',
        userId: 'test-user',
      });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Agent Routing', () => {
    it('routes to correct agent', async () => {
      const response = await orchestrator.route(
        'What is PolicyCenter rating?',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
          userType: 'student',
        }
      );

      expect(response.agentName).toBe('code_mentor');
      expect(response.content).toBeTruthy();
    });

    it('handles agent handoff', async () => {
      // First query: code question
      const response1 = await orchestrator.route(
        'What is a quote?',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
          currentAgent: 'code_mentor',
        }
      );

      expect(response1.agentName).toBe('code_mentor');
      expect(response1.handoffOccurred).toBe(false);

      // Second query: resume question (triggers handoff)
      const response2 = await orchestrator.route(
        'Can you help with my resume?',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
          currentAgent: 'code_mentor',
        }
      );

      expect(response2.agentName).toBe('resume_builder');
      expect(response2.handoffOccurred).toBe(true);
      expect(response2.previousAgent).toBe('code_mentor');
    });

    it('preserves context during handoff', async () => {
      // Initial conversation with code mentor
      await orchestrator.route('What is a quote?', {
        conversationId: 'handoff-test',
        userId: 'test-user',
        currentAgent: 'code_mentor',
      });

      // Handoff to resume builder
      await orchestrator.route('Help me with my resume', {
        conversationId: 'handoff-test',
        userId: 'test-user',
        currentAgent: 'code_mentor',
      });

      // Check conversation has handoff message
      const conversation = await orchestrator['memory'].getConversation(
        'handoff-test'
      );

      const handoffMessage = conversation?.messages.find(
        (m) => m.content.includes('[Agent handoff')
      );

      expect(handoffMessage).toBeTruthy();
    });
  });

  describe('Escalation Detection', () => {
    it('escalates after repeated struggles', async () => {
      // Simulate 3 struggle patterns
      for (let i = 0; i < 3; i++) {
        await orchestrator['memory'].learnPattern(
          'test-user',
          'struggle',
          'User struggling with rating concept'
        );
      }

      const response = await orchestrator.route(
        "I'm still confused about rating",
        {
          conversationId: 'test-conv',
          userId: 'test-user',
        }
      );

      expect(response.shouldEscalate).toBe(true);
      expect(response.escalationReason).toContain('struggling');
    });

    it('escalates on explicit human request', async () => {
      const response = await orchestrator.route(
        'I need to talk to a human trainer',
        {
          conversationId: 'test-conv',
          userId: 'test-user',
        }
      );

      expect(response.shouldEscalate).toBe(true);
      expect(response.escalationReason).toContain('human assistance');
    });
  });

  describe('Statistics', () => {
    it('tracks agent usage', async () => {
      await orchestrator.route('What is a quote?', {
        conversationId: 'stats-test',
        userId: 'test-user',
      });

      await orchestrator.route('Help with resume', {
        conversationId: 'stats-test',
        userId: 'test-user',
      });

      const stats = await orchestrator.getStats('test-user');

      expect(stats.totalQueries).toBeGreaterThanOrEqual(2);
      expect(stats.agentUsage).toBeTruthy();
    });
  });
});
```

---

## Verification

### Manual Testing Checklist

- [ ] Intent classification achieves 95%+ accuracy
- [ ] Routing decision completes in <200ms
- [ ] Agent handoffs preserve conversation context
- [ ] Escalation triggers on repeated struggles
- [ ] Escalation triggers on human request keywords
- [ ] Statistics tracking works correctly
- [ ] All registered agents accessible

### SQL Verification

```sql
-- Check intent distribution
SELECT
  context->>'intent' as intent,
  COUNT(*) as count
FROM ai_interactions
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY context->>'intent'
ORDER BY count DESC;

-- Check escalation rate
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_queries,
  SUM(CASE WHEN context->>'escalate' = 'true' THEN 1 ELSE 0 END) as escalations,
  ROUND(100.0 * SUM(CASE WHEN context->>'escalate' = 'true' THEN 1 ELSE 0 END) / COUNT(*), 2) as escalation_rate_pct
FROM ai_interactions
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
```

---

## Dependencies

**Requires:**
- AI-INF-001 (Model Router - for classification)
- AI-INF-003 (Memory Layer - for context)
- AI-INF-005 (Base Agent Framework)

**Blocks:**
- All AI-GURU agents (orchestrator routes to them)

---

## Documentation

### Usage Example

```typescript
import { Orchestrator } from '@/lib/ai/orchestrator/Orchestrator';
import { CodeMentorAgent } from '@/lib/ai/agents/CodeMentorAgent';
import { ResumeBuilderAgent } from '@/lib/ai/agents/ResumeBuilderAgent';

const orchestrator = new Orchestrator();

// Register agents
orchestrator.registerAgent('code_mentor', new CodeMentorAgent());
orchestrator.registerAgent('resume_builder', new ResumeBuilderAgent());

// Route query
const response = await orchestrator.route(
  'What is a PolicyCenter quote?',
  {
    conversationId: 'user-session-123',
    userId: user.id,
    userType: 'student',
  }
);

console.log(`Agent: ${response.agentName}`);
console.log(`Response: ${response.content}`);

if (response.shouldEscalate) {
  console.log(`Escalate: ${response.escalationReason}`);
  // Notify human trainer
}

if (response.handoffOccurred) {
  console.log(`Handoff from: ${response.previousAgent}`);
}
```

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-GURU-001 (Code Mentor Agent)
