# Sprint 4 Refactoring Guide: Adopting BaseAgent

**Epic:** 2.5 - AI Infrastructure
**Sprint:** 2 (Agent Framework)
**Date:** 2025-11-19
**Status:** Ready for Implementation

---

## Overview

This guide shows how to refactor existing Sprint 4 agents (EmployeeTwin, ActivityClassifier, TimelineGenerator) to extend the new BaseAgent framework from Sprint 2.

**Benefits of Refactoring:**
- ✅ Automatic cost tracking via Helicone
- ✅ Memory management for conversation history
- ✅ RAG integration for semantic search
- ✅ Model routing for intelligent model selection
- ✅ Standardized logging and error handling
- ✅ Backward compatible (no breaking changes)

---

## Refactoring Strategy

### Phase 1: Minimal Adoption (Immediate)
- Extend BaseAgent
- Keep existing logic intact
- No breaking changes

### Phase 2: Gradual Enhancement (Over Time)
- Enable cost tracking
- Add memory layer
- Integrate RAG
- Use model routing

---

## Example 1: EmployeeTwin Refactoring

### Before (Current Implementation)

```typescript
export class EmployeeTwin implements IEmployeeTwin {
  private role: TwinRole;
  private employeeId: string;
  private orgId: string;

  constructor(employeeId: string, role: TwinRole) {
    this.employeeId = employeeId;
    this.role = role;
    this.orgId = '';
  }

  async generateMorningBriefing(): Promise<string> {
    const context = await this.gatherEmployeeContext();
    const prompt = `Generate a personalized morning briefing...`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: this.getRolePrompt(this.role) },
        { role: 'user', content: prompt },
      ],
    });

    const briefing = response.choices[0].message.content || 'Unable to generate';

    // Manual cost calculation and logging
    await this.logInteraction({ ... });

    return briefing;
  }
}
```

### After (Phase 1: Minimal Adoption)

```typescript
import { BaseAgent, type AgentConfig } from '@/lib/ai/agents/BaseAgent';

export class EmployeeTwin extends BaseAgent<TwinInput, TwinOutput> implements IEmployeeTwin {
  private role: TwinRole;
  private employeeId: string;
  private orgId: string;

  constructor(employeeId: string, role: TwinRole, config?: Partial<AgentConfig>) {
    super({
      agentName: `EmployeeTwin-${role}`,
      enableCostTracking: false, // Start disabled
      ...config,
    });

    this.employeeId = employeeId;
    this.role = role;
    this.orgId = '';
  }

  // Implement BaseAgent's execute method
  async execute(input: TwinInput): Promise<TwinOutput> {
    // Route to appropriate method based on input type
    switch (input.type) {
      case 'morning_briefing':
        return { response: await this.generateMorningBriefing() };
      case 'query':
        return await this.query(input.question, input.conversationId);
      case 'suggestion':
        return { response: await this.generateProactiveSuggestion() };
      default:
        throw new Error(`Unknown input type: ${input.type}`);
    }
  }

  async generateMorningBriefing(): Promise<string> {
    const startTime = performance.now();
    const context = await this.gatherEmployeeContext();
    const prompt = `Generate a personalized morning briefing...`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: this.getRolePrompt(this.role) },
        { role: 'user', content: prompt },
      ],
    });

    const briefing = response.choices[0].message.content || 'Unable to generate';

    // Use BaseAgent's logging (automatic cost tracking if enabled)
    await this.logInteraction({
      type: 'morning_briefing',
      model: 'gpt-4o-mini',
      tokens: response.usage?.total_tokens || 0,
      cost: this.calculateCost(response.usage?.total_tokens || 0, 'gpt-4o-mini'),
      latencyMs: performance.now() - startTime,
    });

    return briefing;
  }

  // Keep all other methods unchanged...
}
```

**Changes:**
1. ✅ Extends `BaseAgent<TwinInput, TwinOutput>`
2. ✅ Constructor accepts optional `AgentConfig`
3. ✅ Implements `execute()` method (router to existing methods)
4. ✅ Uses `this.logInteraction()` from BaseAgent
5. ✅ All existing methods work unchanged

**Backward Compatibility:**
```typescript
// Old code still works
const twin = new EmployeeTwin('user_123', 'recruiter');
await twin.generateMorningBriefing();

// New code can enable features
const twinWithTracking = new EmployeeTwin('user_123', 'recruiter', {
  enableCostTracking: true,
  orgId: 'org_abc',
  userId: 'user_123',
});
```

---

### After (Phase 2: Full Enhancement)

```typescript
export class EmployeeTwin extends BaseAgent<TwinInput, TwinOutput> implements IEmployeeTwin {
  private role: TwinRole;
  private employeeId: string;
  private orgId: string;

  constructor(
    employeeId: string,
    role: TwinRole,
    config?: Partial<AgentConfig>,
    dependencies?: {
      router?: AIRouter;
      memory?: MemoryManager;
      rag?: RAGRetriever;
      helicone?: HeliconeClient;
    }
  ) {
    super(
      {
        agentName: `EmployeeTwin-${role}`,
        enableCostTracking: true, // Enable cost tracking
        enableMemory: true, // Enable conversation memory
        enableRAG: true, // Enable knowledge base search
        orgId: config?.orgId,
        userId: employeeId,
        ...config,
      },
      dependencies
    );

    this.employeeId = employeeId;
    this.role = role;
    this.orgId = config?.orgId || '';
  }

  async generateMorningBriefing(): Promise<string> {
    const startTime = performance.now();

    // Use router to select optimal model
    const modelInfo = await this.routeModel('Generate personalized morning briefing');

    // Gather context (existing method)
    const context = await this.gatherEmployeeContext();

    // Optionally retrieve relevant docs from RAG
    const relevantDocs = await this.search(`${this.role} best practices`, {
      topK: 3,
      minSimilarity: 0.8,
    });

    const prompt = `Generate a personalized morning briefing...

CONTEXT:
${JSON.stringify(context, null, 2)}

BEST PRACTICES:
${relevantDocs.map(doc => doc.content).join('\n\n')}
`;

    const response = await openai.chat.completions.create({
      model: modelInfo.model,
      messages: [
        { role: 'system', content: this.getRolePrompt(this.role) },
        { role: 'user', content: prompt },
      ],
    });

    const briefing = response.choices[0].message.content || 'Unable to generate';

    // Automatic cost tracking (handled by BaseAgent)
    await this.logInteraction({
      type: 'morning_briefing',
      model: modelInfo.model,
      tokens: response.usage?.total_tokens || 0,
      cost: this.calculateCost(response.usage?.total_tokens || 0, modelInfo.model),
      latencyMs: performance.now() - startTime,
    });

    return briefing;
  }

  async query(question: string, conversationId?: string): Promise<TwinQueryResponse> {
    const startTime = performance.now();
    const newConversationId = conversationId || `conv-${Date.now()}`;

    // Use memory to retrieve conversation history
    const conversationHistory = await this.rememberContext(newConversationId);

    // Use RAG to find relevant documentation
    const relevantDocs = await this.search(question, { topK: 5 });

    // Route to optimal model
    const modelInfo = await this.routeModel(question);

    const context = await this.gatherEmployeeContext();

    // Build messages with conversation history
    const messages = [
      { role: 'system', content: this.getRolePrompt(this.role) },
      ...conversationHistory, // Include past messages
      {
        role: 'user',
        content: `QUESTION: ${question}

CONTEXT:
${JSON.stringify(context, null, 2)}

RELEVANT DOCS:
${relevantDocs.map(doc => doc.content).join('\n\n')}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: modelInfo.model,
      messages,
    });

    const answer = response.choices[0].message.content || 'Unable to generate';

    // Automatic cost tracking + logging
    await this.logInteraction({
      type: 'question',
      model: modelInfo.model,
      tokens: response.usage?.total_tokens || 0,
      cost: this.calculateCost(response.usage?.total_tokens || 0, modelInfo.model),
      latencyMs: performance.now() - startTime,
    });

    return {
      answer,
      conversationId: newConversationId,
    };
  }
}
```

**Enhancements:**
1. ✅ Intelligent model selection via `routeModel()`
2. ✅ Conversation history via `rememberContext()`
3. ✅ Knowledge base search via `search()`
4. ✅ Automatic cost tracking via Helicone
5. ✅ Performance monitoring

---

## Example 2: ActivityClassifier Refactoring

### Before (Current Implementation)

```typescript
export class ActivityClassifier implements IActivityClassifier {
  private readonly BATCH_SIZE = 10;
  private readonly RATE_LIMIT_DELAY = 1000;

  async classifyScreenshot(screenshotId: string): Promise<ActivityClassification> {
    // Get screenshot, classify with OpenAI Vision, update database
    const classification = await this.classifyImage(signedUrl);
    return classification;
  }
}
```

### After (Phase 1: Minimal Adoption)

```typescript
import { BaseAgent, type AgentConfig } from '@/lib/ai/agents/BaseAgent';

export class ActivityClassifier extends BaseAgent<ClassifierInput, ClassifierOutput>
  implements IActivityClassifier {

  private readonly BATCH_SIZE = 10;
  private readonly RATE_LIMIT_DELAY = 1000;

  constructor(config?: Partial<AgentConfig>) {
    super({
      agentName: 'ActivityClassifier',
      enableCostTracking: true, // Enable cost tracking for screenshots
      ...config,
    });
  }

  async execute(input: ClassifierInput): Promise<ClassifierOutput> {
    if (input.type === 'single') {
      return { classification: await this.classifyScreenshot(input.screenshotId) };
    } else if (input.type === 'batch') {
      return { count: await this.batchClassify(input.userId, input.date) };
    }
    throw new Error('Unknown input type');
  }

  async classifyScreenshot(screenshotId: string): Promise<ActivityClassification> {
    const startTime = performance.now();

    // Existing logic...
    const classification = await this.classifyImage(signedUrl);

    // Use BaseAgent logging with automatic cost tracking
    await this.logInteraction({
      type: 'screenshot_classification',
      model: 'gpt-4o-mini',
      tokens: 1000, // Estimated
      cost: 0.0015,
      latencyMs: performance.now() - startTime,
      metadata: { screenshotId },
    });

    return classification;
  }
}
```

---

## Example 3: TimelineGenerator Refactoring

### Before (Current Implementation)

```typescript
export class TimelineGenerator implements ITimelineGenerator {
  async generateDailyReport(userId: string, date: string): Promise<ProductivityReport> {
    // Get activity summary, generate narrative with GPT-4o-mini
    const response = await openai.chat.completions.create({ ... });
    return report;
  }
}
```

### After (Phase 2: With Router & Prompts)

```typescript
import { BaseAgent, type AgentConfig } from '@/lib/ai/agents/BaseAgent';
import { getDefaultPromptLibrary } from '@/lib/ai/prompts/library';

export class TimelineGenerator extends BaseAgent<TimelineInput, TimelineOutput>
  implements ITimelineGenerator {

  private promptLibrary = getDefaultPromptLibrary();

  constructor(config?: Partial<AgentConfig>, dependencies?) {
    super(
      {
        agentName: 'TimelineGenerator',
        enableCostTracking: true,
        ...config,
      },
      dependencies
    );
  }

  async execute(input: TimelineInput): Promise<TimelineOutput> {
    return { report: await this.generateDailyReport(input.userId, input.date) };
  }

  async generateDailyReport(userId: string, date: string): Promise<ProductivityReport> {
    const startTime = performance.now();

    // Get activity summary (existing logic)
    const summary = await this.activityClassifier.getDailySummary(userId, date);

    // Use router to select optimal model
    const modelInfo = await this.routeModel('Generate daily productivity report');

    // Load prompt from library
    const prompt = await this.promptLibrary.get('daily_timeline', {
      employeeName: profile.full_name,
      date,
      totalScreenshots: summary.totalScreenshots.toString(),
      productiveHours: summary.productiveHours.toString(),
      activityBreakdown: JSON.stringify(summary.byCategory),
    });

    const response = await openai.chat.completions.create({
      model: modelInfo.model,
      messages: [{ role: 'user', content: prompt }],
    });

    // Automatic cost tracking
    await this.logInteraction({
      type: 'daily_report',
      model: modelInfo.model,
      tokens: response.usage?.total_tokens || 0,
      cost: response.usage?.total_tokens ?
        (response.usage.total_tokens / 1_000_000) * 0.375 : 0,
      latencyMs: performance.now() - startTime,
    });

    return report;
  }
}
```

---

## Refactoring Checklist

### For Each Agent:

- [ ] **Step 1:** Import `BaseAgent` and `AgentConfig`
- [ ] **Step 2:** Change `implements IAgent` to `extends BaseAgent<TInput, TOutput> implements IAgent`
- [ ] **Step 3:** Update constructor to accept optional `AgentConfig`
- [ ] **Step 4:** Call `super()` with agent configuration
- [ ] **Step 5:** Implement `execute()` method (router to existing methods)
- [ ] **Step 6:** Replace manual logging with `this.logInteraction()`
- [ ] **Step 7:** Test backward compatibility
- [ ] **Step 8:** (Optional) Enable cost tracking
- [ ] **Step 9:** (Optional) Add router integration
- [ ] **Step 10:** (Optional) Add memory integration
- [ ] **Step 11:** (Optional) Add RAG integration
- [ ] **Step 12:** Update unit tests

---

## Testing Strategy

### 1. Backward Compatibility Tests

```typescript
describe('EmployeeTwin - Backward Compatibility', () => {
  it('should work with old constructor pattern', async () => {
    const twin = new EmployeeTwin('user_123', 'recruiter');
    const briefing = await twin.generateMorningBriefing();
    expect(briefing).toBeDefined();
  });

  it('should work with new constructor pattern', async () => {
    const twin = new EmployeeTwin('user_123', 'recruiter', {
      enableCostTracking: true,
      orgId: 'org_abc',
    });
    const briefing = await twin.generateMorningBriefing();
    expect(briefing).toBeDefined();
  });
});
```

### 2. Feature Integration Tests

```typescript
describe('EmployeeTwin - Enhanced Features', () => {
  it('should track costs when enabled', async () => {
    const helicone = new HeliconeClient({ apiKey: 'test' });
    const trackSpy = vi.spyOn(helicone, 'trackRequest');

    const twin = new EmployeeTwin('user_123', 'recruiter', {
      enableCostTracking: true,
      orgId: 'org_abc',
      userId: 'user_123',
    }, { helicone });

    await twin.generateMorningBriefing();

    expect(trackSpy).toHaveBeenCalled();
  });
});
```

---

## Migration Timeline

### Week 1: EmployeeTwin
- Refactor to extend BaseAgent
- Enable cost tracking
- Update tests
- Deploy to staging

### Week 2: ActivityClassifier + TimelineGenerator
- Refactor both agents
- Enable cost tracking
- Add prompt library integration
- Update tests
- Deploy to staging

### Week 3: Full Enhancement
- Add memory integration to EmployeeTwin
- Add RAG integration for knowledge base
- Enable model routing
- Performance testing
- Deploy to production

---

## Expected Benefits

### Cost Tracking
- **Before:** Manual cost calculation, inconsistent logging
- **After:** Automatic tracking via Helicone, dashboard visibility

### Model Selection
- **Before:** Hardcoded `gpt-4o-mini`
- **After:** Intelligent routing (simple → gpt-4o-mini, complex → claude-sonnet-4-5)

### Memory
- **Before:** Stateless, no conversation history
- **After:** Full conversation context, multi-turn interactions

### RAG
- **Before:** No knowledge base integration
- **After:** Semantic search over documentation, best practices

### Maintenance
- **Before:** Duplicate code across agents
- **After:** Shared BaseAgent utilities, DRY principle

---

## Common Pitfalls

### ❌ Breaking Existing Tests
**Problem:** Changing constructor signature breaks tests
**Solution:** Constructor params are optional, old pattern still works

### ❌ Forcing All Features
**Problem:** Enabling memory/RAG/tracking all at once
**Solution:** Start with Phase 1 (minimal), gradually enable features

### ❌ Changing Public API
**Problem:** Existing callers break
**Solution:** Keep all public methods unchanged, add `execute()` as router

### ❌ Complex execute() Logic
**Problem:** execute() becomes a god method
**Solution:** execute() should be a simple router, keep logic in existing methods

---

## Support

For questions or issues during refactoring:
1. Check this guide first
2. Review BaseAgent documentation (`src/lib/ai/agents/BaseAgent.ts`)
3. Check existing tests (`tests/unit/ai/agents/BaseAgent.test.ts`)
4. Open a GitHub issue with `[Sprint 2 Refactoring]` prefix

---

**Last Updated:** 2025-11-19
**Version:** 1.0
**Status:** Ready for Implementation
