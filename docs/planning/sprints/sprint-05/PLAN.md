# Sprint 5: Agent Framework Layer - Agent Prompts

**Sprint:** Sprint 5 (Week 9-10)
**Epic:** Epic 2.5 - AI Infrastructure & Services
**Points:** 19
**Stories:** AI-INF-004, AI-INF-005, AI-INF-006, AI-INF-007
**Goal:** Build reusable agent infrastructure on top of Sprint 4 foundations

---

## 📋 Sprint Context

### Sprint Objectives
1. Integrate Helicone for real-time cost tracking and budget alerts
2. Build BaseAgent abstract class with memory + RAG + prompt management
3. Create standardized Prompt Library with versioning and A/B testing
4. Implement Multi-Agent Orchestrator for intent classification and routing

### Success Criteria
- [ ] Cost tracking integrated end-to-end with $500/day alerts
- [ ] BaseAgent class tested with mock agents
- [ ] Orchestrator routes to correct agent 90%+ accuracy
- [ ] <2s total AI response time maintained
- [ ] Agent creation guide published (developers can create new agents)

### Key Dependencies
- ✅ AI-INF-001 (Model Router) - Required for Helicone and BaseAgent
- ✅ AI-INF-002 (RAG Infrastructure) - Required for BaseAgent
- ✅ AI-INF-003 (Memory Layer) - Required for BaseAgent

---

## 🎯 PM Agent Prompt

### Task
Plan and manage Sprint 2 with 4 interconnected stories that build the agent framework layer.

### Specific Actions

#### 1. Sprint Planning
Create detailed plan for:
- **Day 1-3:** AI-INF-004 (Helicone) + AI-INF-006 (Prompts) in parallel
- **Day 4-7:** AI-INF-005 (BaseAgent) - depends on 004 + 006
- **Day 8-9:** AI-INF-007 (Orchestrator) - depends on 005
- **Day 10:** Integration testing, sprint review

#### 2. Dependency Management
Map critical path:
```
INF-004 (Helicone) ─┐
                    ├─→ INF-005 (BaseAgent) ─→ INF-007 (Orchestrator)
INF-006 (Prompts) ──┘
```

#### 3. Risk Assessment
Identify risks:
- **Risk:** BaseAgent class too complex (8 pts in 4 days)
  - **Mitigation:** Start with minimal interface, iterate
- **Risk:** Orchestrator intent classification below 90%
  - **Mitigation:** Pre-train with 100 example queries, tune threshold

#### 4. Stakeholder Communication
Key messages:
- "Sprint 2 unlocks agent creation - developers can build GURU agents in Sprint 3"
- "Cost tracking prevents budget overruns ($500/day alerts)"
- "Reusable framework = faster feature development in future epics"

### Deliverables
1. **Sprint 2 Plan** with daily breakdown and parallel work streams
2. **Risk Register** with mitigation strategies
3. **Dependency Map** (visual diagram)
4. **Agent Creation Workshop** plan for Friday Week 8

---

## 🏗️ Architect Agent Prompt

### Task
Design the agent framework architecture that enables all future AI agents in the system.

### Specific Actions

#### 1. BaseAgent Class Design
Create abstract class specification:

```typescript
// src/lib/ai/agents/BaseAgent.ts
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
   * Main query method - handles full agent flow
   *
   * Flow:
   * 1. Retrieve conversation history from memory
   * 2. Search RAG for relevant context (if enabled)
   * 3. Build prompt with template + context + history
   * 4. Route to optimal model
   * 5. Track cost with Helicone
   * 6. Store response in memory
   * 7. Learn from feedback (if provided)
   */
  async query(
    query: string,
    context: AgentContext,
    options?: QueryOptions
  ): Promise<AgentResponse>;

  /**
   * Learn from user feedback (thumbs up/down)
   */
  async learn(feedback: AgentFeedback): Promise<void>;

  /**
   * Clean up resources (close connections)
   */
  async cleanup(): Promise<void>;

  /**
   * Abstract method: Build agent-specific prompt
   * Must be implemented by concrete agents
   */
  protected abstract buildPrompt(
    query: string,
    context: any
  ): string;
}
```

#### 2. Helicone Integration Design
Architecture for cost tracking:

```
User Query
    ↓
Model Router (selects model)
    ↓
Helicone Proxy (wraps API call)
    ↓
OpenAI / Anthropic API
    ↓
Response + Cost Metadata
    ↓
Log to ai_request_logs table
    ↓
Check daily budget ($500 threshold)
    ↓
Send alert if exceeded (Slack webhook)
```

#### 3. Prompt Library Schema
Design prompt versioning system:

```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'socratic_mentor', 'resume_builder'
  version INT NOT NULL DEFAULT 1,
  template TEXT NOT NULL, -- 'You are a Socratic mentor. Guide...'
  variables JSONB DEFAULT '[]'::jsonb, -- ['studentName', 'topic']
  category TEXT, -- 'training', 'productivity', 'recruiting'
  a_b_test_percentage INT DEFAULT 0, -- 0-100, 0 = not testing
  is_active BOOLEAN DEFAULT true,
  performance_score DECIMAL(5,2), -- 0-100, based on feedback
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (name, version)
);
```

#### 4. Orchestrator Decision Tree
Design intent classification:

```typescript
export class MultiAgentOrchestrator {
  async routeQuery(
    query: string,
    context: AgentContext
  ): Promise<AgentType> {
    // Step 1: Classify intent with GPT-4o-mini
    const intent = await this.classifyIntent(query);

    // Step 2: Route to appropriate agent
    const routing = {
      'code_help': CodeMentorAgent,
      'resume_help': ResumeBuilderAgent,
      'project_planning': ProjectPlannerAgent,
      'interview_prep': InterviewCoachAgent,
      // ... more agents
    };

    return routing[intent] || CodeMentorAgent; // Default
  }

  private async classifyIntent(query: string): Promise<string> {
    const prompt = `
      Classify this student query into one of these intents:
      - code_help: Questions about programming, debugging, concepts
      - resume_help: Help with resume, CV, LinkedIn profile
      - project_planning: Capstone project, milestones, deliverables
      - interview_prep: Interview questions, behavioral prep, STAR method

      Query: "${query}"

      Respond with ONLY the intent key (e.g., "code_help").
    `;

    const response = await routeAIRequest(
      {
        type: 'completion',
        complexity: 'simple',
        useCase: 'intent_classification',
        userId: 'system',
      },
      prompt
    );

    return response.content.trim();
  }
}
```

### Deliverables
1. **BaseAgent Class Specification** (TypeScript interface + implementation guide)
2. **Helicone Integration Architecture** (diagram + config)
3. **Prompt Library Schema** (SQL + versioning strategy)
4. **Orchestrator Decision Tree** (intent classification logic)
5. **Agent Creation Guide** (step-by-step tutorial for developers)

---

## 💻 Developer Agent Prompt

### Task
Implement 4 interconnected stories that create the agent framework.

### Implementation Order

#### Day 1-3: Parallel Development

**Work Stream A (Dev A): AI-INF-004 + AI-INF-006**
```bash
# AI-INF-004: Helicone Cost Monitoring (5 pts)
# Create: src/lib/ai/helicone.ts

import { Helicone } from '@helicone/helicone';

export const helicone = new Helicone({
  apiKey: process.env.HELICONE_API_KEY!,
  baseURL: 'https://oai.helicone.ai/v1',
});

export async function trackedAIRequest(
  task: AITask,
  prompt: string,
  options?: any
): Promise<AIResponse> {
  // Wrap routeAIRequest with Helicone tracking
  const response = await routeAIRequest(task, prompt, {
    ...options,
    headers: {
      'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
      'Helicone-Property-UseCase': task.useCase,
      'Helicone-Property-UserId': task.userId,
    },
  });

  // Check daily budget
  await checkBudgetThreshold(task.userId);

  return response;
}

async function checkBudgetThreshold(userId: string) {
  const dailyCost = await getDailyCost(userId);
  if (dailyCost > 500) {
    await sendBudgetAlert(userId, dailyCost);
  }
}
```

**AI-INF-006: Prompt Library (3 pts)**
```typescript
// src/lib/ai/prompts/index.ts

export const promptTemplates = {
  socratic_mentor: {
    version: 1,
    template: `You are a Socratic mentor helping a student learn {topic}.

Instead of giving direct answers, guide them with questions:
1. Ask what they already know about the topic
2. Help them discover the answer through reasoning
3. Validate their understanding with follow-up questions

Student question: {query}

Respond with guiding questions, not direct answers.`,
    variables: ['topic', 'query'],
  },

  resume_builder: {
    version: 1,
    template: `Generate an ATS-optimized resume for:

Name: {name}
Role: {targetRole}
Skills: {skills}
Experience: {experience}

Format:
- Professional summary (2-3 sentences)
- Skills section (bullet points)
- Experience section (company, role, achievements)
- Education section

Make it keyword-rich for ATS systems.`,
    variables: ['name', 'targetRole', 'skills', 'experience'],
  },
};

export function renderPrompt(
  templateName: string,
  variables: Record<string, string>
): string {
  const template = promptTemplates[templateName];
  let rendered = template.template;

  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return rendered;
}
```

#### Day 4-7: Core Framework

**Work Stream B (Dev B): AI-INF-005 (8 pts)**
```typescript
// src/lib/ai/agents/BaseAgent.ts

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: MemoryLayer;
  protected rag: RAGLayer;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new MemoryLayer();
    this.rag = new RAGLayer();
  }

  async query(
    query: string,
    context: AgentContext,
    options?: QueryOptions
  ): Promise<AgentResponse> {
    // 1. Get conversation history
    const history = await this.memory.getConversation(
      context.conversationId
    );

    // 2. Search RAG for context (if enabled)
    let ragContext: string[] = [];
    if (options?.includeRAG && this.config.ragCollection) {
      const results = await this.rag.search(
        query,
        this.config.ragCollection,
        options.topK || 5
      );
      ragContext = results.map(r => r.content);
    }

    // 3. Build agent-specific prompt
    const prompt = this.buildPrompt(query, {
      history,
      ragContext,
      ...context,
    });

    // 4. Route to model with cost tracking
    const response = await trackedAIRequest(
      {
        type: 'chat',
        complexity: this.config.complexity || 'medium',
        requiresReasoning: this.config.requiresReasoning,
        requiresWriting: this.config.requiresWriting,
        useCase: this.config.useCase,
        userId: context.userId,
      },
      prompt,
      {
        systemPrompt: this.config.systemPrompt,
        temperature: options?.temperature || 0.7,
      }
    );

    // 5. Store in memory
    await this.memory.storeConversation(context.conversationId, [
      { role: 'user', content: query },
      { role: 'assistant', content: response.content },
    ]);

    return {
      content: response.content,
      model: response.model,
      usage: response.usage,
      cost: response.cost,
      latency: response.latency,
      sources: ragContext.length > 0 ? ragContext : undefined,
      conversationId: context.conversationId,
    };
  }

  async learn(feedback: AgentFeedback): Promise<void> {
    // Store feedback for future improvements
    await this.memory.storeFeedback(feedback);
  }

  async cleanup(): Promise<void> {
    // Close connections, clean up resources
  }

  protected abstract buildPrompt(
    query: string,
    context: any
  ): string;
}

// Example concrete agent implementation
export class ExampleAgent extends BaseAgent {
  protected buildPrompt(query: string, context: any): string {
    return renderPrompt('socratic_mentor', {
      topic: 'JavaScript',
      query: query,
    });
  }
}
```

#### Day 8-9: Orchestration

**Work Stream C (QA): AI-INF-007 (3 pts)**
```typescript
// src/lib/ai/agents/orchestrator.ts

export class MultiAgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();

  registerAgent(name: string, agent: BaseAgent) {
    this.agents.set(name, agent);
  }

  async routeQuery(
    query: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    // Classify intent
    const intent = await this.classifyIntent(query);

    // Get appropriate agent
    const agent = this.agents.get(intent);
    if (!agent) {
      throw new Error(`No agent registered for intent: ${intent}`);
    }

    // Route to agent
    return agent.query(query, context);
  }

  private async classifyIntent(query: string): Promise<string> {
    // Use GPT-4o-mini for fast, cheap classification
    const response = await trackedAIRequest(
      {
        type: 'completion',
        complexity: 'simple',
        useCase: 'intent_classification',
        userId: 'system',
      },
      `Classify this query: "${query}"\n\nIntents: code_help, resume_help, project_planning, interview_prep\n\nRespond with ONLY the intent key.`
    );

    return response.content.trim();
  }
}
```

### Testing
```typescript
// tests/integration/agent-framework.test.ts

describe('Agent Framework Integration', () => {
  it('BaseAgent uses memory + RAG + prompts', async () => {
    const agent = new ExampleAgent({
      name: 'test-agent',
      useCase: 'testing',
      systemPrompt: 'You are a test agent',
      ragCollection: 'test-docs',
    });

    const response = await agent.query(
      'What is JavaScript?',
      {
        conversationId: 'test-conv',
        userId: 'test-user',
      },
      {
        includeRAG: true,
        topK: 3,
      }
    );

    expect(response.content).toBeDefined();
    expect(response.sources).toBeDefined(); // RAG context included
    expect(response.cost).toBeGreaterThan(0); // Cost tracked
  });

  it('Orchestrator routes to correct agent', async () => {
    const orchestrator = new MultiAgentOrchestrator();

    orchestrator.registerAgent('code_help', new CodeMentorAgent());
    orchestrator.registerAgent('resume_help', new ResumeBuilderAgent());

    const response = await orchestrator.routeQuery(
      'Help me debug this JavaScript code',
      { conversationId: 'test', userId: 'test' }
    );

    // Should route to CodeMentorAgent
    expect(response.content).toContain('debug');
  });
});
```

### Deliverables
1. `src/lib/ai/helicone.ts` (cost tracking)
2. `src/lib/ai/agents/BaseAgent.ts` (framework)
3. `src/lib/ai/prompts/index.ts` (template library)
4. `src/lib/ai/agents/orchestrator.ts` (routing)
5. Test suite (80%+ coverage)
6. **Agent Creation Guide** (`docs/guides/creating-agents.md`)

---

## 🧪 QA Agent Prompt

### Task
Validate that the agent framework enables easy creation of new agents and integrates all Sprint 1 services.

### Test Plan

#### 1. BaseAgent Integration Tests
```typescript
describe('BaseAgent Framework', () => {
  it('integrates Router + RAG + Memory', async () => {
    // Test that BaseAgent uses all 3 Sprint 1 services
  });

  it('tracks cost with Helicone', async () => {
    // Test that every agent query is tracked
  });

  it('respects budget threshold', async () => {
    // Test that $500/day alert triggers
  });
});
```

#### 2. Orchestrator Accuracy Tests
```typescript
describe('Multi-Agent Orchestrator', () => {
  const testCases = [
    { query: 'How do I fix this bug?', expected: 'code_help' },
    { query: 'Help me write a resume', expected: 'resume_help' },
    { query: 'How should I structure my project?', expected: 'project_planning' },
    { query: 'Practice STAR method with me', expected: 'interview_prep' },
  ];

  testCases.forEach(({ query, expected }) => {
    it(`classifies "${query}" as ${expected}`, async () => {
      const intent = await orchestrator.classifyIntent(query);
      expect(intent).toBe(expected);
    });
  });

  it('achieves 90%+ accuracy on 100-query test set', async () => {
    // Load test dataset, measure accuracy
  });
});
```

#### 3. Performance Tests
- [ ] BaseAgent query: <2s end-to-end
- [ ] Helicone overhead: <20ms
- [ ] Intent classification: <200ms
- [ ] Prompt rendering: <10ms

### Quality Gates
- [ ] Agent creation guide tested (QA creates mock agent following guide)
- [ ] 90%+ orchestrator accuracy
- [ ] Cost tracking verified (manual test with real API calls)
- [ ] Budget alert tested (trigger with >$500 spend)

### Deliverables
1. **Integration Test Suite** (BaseAgent + Orchestrator)
2. **Orchestrator Accuracy Report** (90%+ target)
3. **Agent Creation Validation** (QA creates ExampleAgent)
4. **Sprint 2 QA Summary** (pass/fail recommendation)

---

## ✅ Sprint 2 Completion Checklist

- [ ] **PM:** Agent creation workshop conducted, Sprint 3 developers trained
- [ ] **Architect:** BaseAgent pattern documented, ready for GURU agents
- [ ] **Developer:** All 4 stories merged, tests passing, guide published
- [ ] **QA:** 90%+ orchestrator accuracy, cost tracking verified, no blockers

---

**Created:** 2025-11-19
**Sprint:** Sprint 2 (Week 7-8)
**Status:** Ready for Execution
**Dependencies:** Sprint 1 must be complete
