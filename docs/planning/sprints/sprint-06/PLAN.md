# Sprint 6: Guidewire Guru - Agent Prompts

**Sprint:** Sprint 6 (Week 11-12)
**Epic:** Epic 2.5 - AI Infrastructure & Services
**Points:** 26
**Stories:** AI-GURU-001, AI-GURU-002, AI-GURU-003, AI-GURU-004
**Goal:** Build 4 specialist training assistant agents for Epic 2 (Training Academy)

---

## 📋 Sprint Context

### Sprint Objectives
1. Build Code Mentor Agent with Socratic method (primary training support)
2. Build Resume Builder Agent for ATS-optimized resumes (PDF, DOCX, LinkedIn)
3. Build Project Planner Agent for capstone project breakdown
4. Build Interview Coach Agent with STAR method training

### Success Criteria
- [ ] All 4 agents achieve 95%+ helpful response rate (student feedback)
- [ ] Socratic method verified (Code Mentor doesn't give direct answers)
- [ ] Orchestrator routes student questions correctly (90%+ accuracy)
- [ ] Escalation to human trainers <5% of queries
- [ ] Cost per interaction meets targets ($0.001/query for Code Mentor)

### Key Dependencies
- ✅ AI-INF-005 (BaseAgent Framework) - All agents extend BaseAgent
- ✅ AI-INF-007 (Multi-Agent Orchestrator) - Routes student queries to correct agent

---

## 🎯 PM Agent Prompt

### Task
Manage Sprint 3 with 4 parallel agent implementations that can be built independently.

### Work Stream Allocation

**Developer A (13 pts):**
- AI-GURU-001: Code Mentor Agent (8 pts) - Days 1-6
- AI-GURU-002: Resume Builder Agent (5 pts) - Days 7-10

**Developer B (13 pts):**
- AI-GURU-003: Project Planner Agent (5 pts) - Days 1-4
- AI-GURU-004: Interview Coach Agent (8 pts) - Days 5-10

**Key Insight:** All 4 agents are independent - no blocking dependencies

### Sprint Plan
```
Day 1-6:  Dev A: Code Mentor (8 pts)    | Dev B: Project Planner (5 pts)
Day 5-10: Dev A: Resume Builder (5 pts) | Dev B: Interview Coach (8 pts)
Day 9-10: Integration testing (Orchestrator routes correctly)
Day 10:   Sprint review with Training Academy team (handoff for Epic 2)
```

### Risk Assessment
- **Risk:** Socratic method too difficult to implement consistently
  - **Mitigation:** Create 20 example Q&A pairs for training, use Claude Sonnet for nuanced guidance
- **Risk:** Resume Builder generates poor quality resumes
  - **Mitigation:** Use GPT-4o (best writing model), validate with ATS scoring tools
- **Risk:** Student adoption low (prefer human trainers)
  - **Mitigation:** Beta test with 50 students, iterate based on feedback

### Deliverables
1. **Sprint 3 Plan** with parallel work streams
2. **Beta Test Plan** (50 students, Week 10)
3. **Escalation Criteria** (when to escalate to human)
4. **Epic 2 Handoff Document** (CodeMentorAgent ready for Training Academy)

---

## 🏗️ Architect Agent Prompt

### Task
Design 4 specialist agents that extend BaseAgent and integrate with curriculum RAG.

### Agent Specifications

#### 1. Code Mentor Agent (AI-GURU-001)
```typescript
export class CodeMentorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'code_mentor',
      useCase: 'training_code_help',
      systemPrompt: `You are a Socratic programming mentor...`,
      ragCollection: 'curriculum', // Search course materials
      requiresReasoning: true, // Use Claude Sonnet for nuanced teaching
      complexity: 'medium',
    });
  }

  protected buildPrompt(query: string, context: any): string {
    // Socratic method template
    return renderPrompt('socratic_mentor', {
      topic: context.currentModule, // From student profile
      query: query,
      previousAttempts: context.history.length, // Detect struggle
    });
  }

  // Override learn() to detect when student is stuck
  async learn(feedback: AgentFeedback): Promise<void> {
    if (feedback.type === 'thumbs_down' || feedback.attempts > 5) {
      await this.escalate(feedback);
    }
  }

  private async escalate(feedback: AgentFeedback): Promise<void> {
    // Publish event: ai.mentor.escalation
    await publishEvent({
      type: 'ai.mentor.escalation',
      payload: {
        studentId: feedback.userId,
        query: feedback.query,
        reason: 'Student struggling (5+ attempts)',
      },
    });
  }
}
```

#### 2. Resume Builder Agent (AI-GURU-002)
```typescript
export class ResumeBuilderAgent extends BaseAgent {
  constructor() {
    super({
      name: 'resume_builder',
      useCase: 'resume_generation',
      systemPrompt: `You are an expert resume writer specializing in ATS optimization...`,
      requiresWriting: true, // Use GPT-4o for quality writing
      complexity: 'medium',
    });
  }

  protected buildPrompt(query: string, context: any): string {
    // Get student's completed modules from context
    const skills = context.completedModules.map(m => m.skills).flat();

    return renderPrompt('resume_builder', {
      name: context.studentName,
      targetRole: query, // e.g., "Guidewire Developer"
      skills: skills.join(', '),
      experience: context.capstoneProject,
    });
  }

  async generateResume(
    studentId: string,
    targetRole: string,
    format: 'pdf' | 'docx' | 'linkedin'
  ): Promise<string> {
    const response = await this.query(targetRole, {
      conversationId: `resume-${studentId}`,
      userId: studentId,
    });

    // Convert to requested format
    return this.formatResume(response.content, format);
  }
}
```

#### 3. Project Planner Agent (AI-GURU-003)
```typescript
export class ProjectPlannerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'project_planner',
      useCase: 'capstone_planning',
      systemPrompt: `You are a project planning expert for technical capstone projects...`,
      complexity: 'medium',
    });
  }

  protected buildPrompt(query: string, context: any): string {
    return `
      Break down this capstone project into milestones:

      Project: ${query}
      Duration: 8 weeks
      Student skills: ${context.completedModules.join(', ')}

      Create:
      1. Week-by-week milestones (realistic scope)
      2. Deliverables per week
      3. Risk identification (technical challenges)
      4. Success criteria

      Format as markdown checklist.
    `;
  }
}
```

#### 4. Interview Coach Agent (AI-GURU-004)
```typescript
export class InterviewCoachAgent extends BaseAgent {
  constructor() {
    super({
      name: 'interview_coach',
      useCase: 'interview_preparation',
      systemPrompt: `You are an expert interview coach specializing in STAR method...`,
      requiresReasoning: true, // Claude Sonnet for nuanced coaching
      complexity: 'complex',
    });
  }

  protected buildPrompt(query: string, context: any): string {
    return renderPrompt('interview_coach', {
      query: query,
      studentBackground: context.completedModules,
      targetCompany: context.targetCompany || 'general',
    });
  }

  async conductMockInterview(
    studentId: string,
    jobDescription: string
  ): Promise<MockInterviewSession> {
    // Generate 5 behavioral questions
    // Student responds
    // Agent provides STAR-method feedback
  }
}
```

### Database Schema Additions
```sql
-- Track AI mentor interactions
CREATE TABLE ai_mentor_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES user_profiles(id),
  agent_type TEXT NOT NULL, -- 'code_mentor', 'resume_builder', etc.
  query TEXT NOT NULL,
  response TEXT NOT NULL,
  helpful BOOLEAN, -- Student feedback (thumbs up/down)
  escalated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track escalations to human trainers
CREATE TABLE ai_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES user_profiles(id),
  chat_id UUID REFERENCES ai_mentor_chats(id),
  reason TEXT NOT NULL,
  assigned_trainer UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Deliverables
1. **Agent Class Specifications** (TypeScript implementations)
2. **Socratic Method Prompt Template** (tested with 20 examples)
3. **Resume Generation Pipeline** (markdown → PDF/DOCX/LinkedIn)
4. **Database Schema** (ai_mentor_chats, ai_escalations)
5. **Integration with Training Academy** (tRPC endpoints)

---

## 💻 Developer Agent Prompt

### Task
Implement 4 specialist agents extending BaseAgent framework from Sprint 2.

### Implementation Guide

#### Day 1-6: Code Mentor Agent (Dev A, 8 pts)

**File:** `src/lib/ai/agents/CodeMentorAgent.ts`

```typescript
import { BaseAgent } from './BaseAgent';
import { renderPrompt } from '../prompts';

export class CodeMentorAgent extends BaseAgent {
  constructor() {
    super({
      name: 'code_mentor',
      useCase: 'training_code_help',
      systemPrompt: `You are a Socratic programming mentor. NEVER give direct answers.

Instead:
1. Ask what the student already knows
2. Guide them with probing questions
3. Let them discover the answer
4. Validate their understanding

If they're truly stuck (5+ attempts), suggest they ask a human trainer.`,
      ragCollection: 'curriculum',
      requiresReasoning: true,
      complexity: 'medium',
    });
  }

  protected buildPrompt(query: string, context: any): string {
    const previousAttempts = context.history?.length || 0;

    if (previousAttempts > 5) {
      return `The student has asked about this ${previousAttempts} times. They may be stuck.

Query: ${query}

Gently suggest they ask a human trainer for help, and explain why this is challenging.`;
    }

    return renderPrompt('socratic_mentor', {
      topic: context.metadata?.currentModule || 'programming',
      query: query,
      studentLevel: context.metadata?.completedModules?.length || 0,
    });
  }
}
```

**Tests:**
```typescript
// src/lib/ai/agents/__tests__/CodeMentorAgent.test.ts

describe('CodeMentorAgent', () => {
  it('uses Socratic method (asks questions, not answers)', async () => {
    const agent = new CodeMentorAgent();

    const response = await agent.query(
      'How does a for loop work in JavaScript?',
      {
        conversationId: 'test-conv',
        userId: 'student-1',
      }
    );

    // Should ask questions, not explain directly
    expect(response.content).toMatch(/\?/); // Contains questions
    expect(response.content.toLowerCase()).not.toContain('a for loop is'); // No direct explanation
  });

  it('escalates after 5+ attempts', async () => {
    // Simulate 6 attempts at same question
    const agent = new CodeMentorAgent();

    const history = Array(6).fill({ role: 'user', content: 'Same question' });

    const response = await agent.query(
      'I still dont understand loops',
      {
        conversationId: 'test-conv-stuck',
        userId: 'student-1',
        metadata: { history },
      }
    );

    expect(response.content).toContain('trainer'); // Suggests human help
  });
});
```

#### Day 7-10: Resume Builder Agent (Dev A, 5 pts)

**File:** `src/lib/ai/agents/ResumeBuilderAgent.ts`

```typescript
export class ResumeBuilderAgent extends BaseAgent {
  constructor() {
    super({
      name: 'resume_builder',
      useCase: 'resume_generation',
      systemPrompt: `You are an expert ATS resume writer.

Create resumes that:
- Pass ATS keyword scanning (90%+ score)
- Highlight technical skills prominently
- Use strong action verbs (Built, Deployed, Optimized)
- Quantify achievements where possible

Format as clean markdown.`,
      requiresWriting: true, // Use GPT-4o
      complexity: 'medium',
    });
  }

  protected buildPrompt(query: string, context: any): string {
    return `Generate an ATS-optimized resume for:

**Target Role:** ${query}

**Skills:**
${context.metadata.completedModules.map(m => `- ${m.name}`).join('\n')}

**Capstone Project:**
${context.metadata.capstoneProject || 'None yet'}

**Format:**
# [Student Name]
[Email] | [Phone] | [LinkedIn]

## Professional Summary
[2-3 sentences]

## Technical Skills
[Categorized bullet points]

## Project Experience
[Capstone + any portfolio projects]

## Education
[Degree + Certifications]

Make it keyword-rich for ATS systems.`;
  }

  async exportToPDF(markdown: string): Promise<Buffer> {
    // Use library like puppeteer or jsPDF
  }
}
```

#### Day 1-4: Project Planner Agent (Dev B, 5 pts)
**File:** `src/lib/ai/agents/ProjectPlannerAgent.ts`

#### Day 5-10: Interview Coach Agent (Dev B, 8 pts)
**File:** `src/lib/ai/agents/InterviewCoachAgent.ts`

### Testing Strategy
```typescript
// tests/integration/guidewire-guru.test.ts

describe('Guidewire Guru Integration', () => {
  it('orchestrator routes to correct agent', async () => {
    const orchestrator = new MultiAgentOrchestrator();

    // Register all 4 GURU agents
    orchestrator.registerAgent('code_help', new CodeMentorAgent());
    orchestrator.registerAgent('resume_help', new ResumeBuilderAgent());
    orchestrator.registerAgent('project_planning', new ProjectPlannerAgent());
    orchestrator.registerAgent('interview_prep', new InterviewCoachAgent());

    // Test routing
    const testCases = [
      { query: 'How do I debug this JavaScript?', expected: 'code_help' },
      { query: 'Help me build a resume', expected: 'resume_help' },
      { query: 'Break down my capstone project', expected: 'project_planning' },
      { query: 'Practice behavioral questions', expected: 'interview_prep' },
    ];

    for (const { query, expected } of testCases) {
      const response = await orchestrator.routeQuery(query, {
        conversationId: 'test',
        userId: 'test',
      });

      expect(response.metadata?.agentType).toBe(expected);
    }
  });

  it('achieves 95%+ helpful response rate', async () => {
    // Load 100-query test dataset
    // Measure thumbs up/down ratio
    // Target: 95%+ helpful
  });
});
```

### Deliverables
1. 4 agent implementations (CodeMentor, Resume, ProjectPlanner, InterviewCoach)
2. Test suite (95%+ accuracy target)
3. tRPC endpoint: `/ai/mentor/chat`
4. Integration with Training Academy (Epic 2 handoff)

---

## 🧪 QA Agent Prompt

### Task
Validate all 4 Guidewire Guru agents meet quality standards and integrate correctly.

### Test Plan

#### 1. Socratic Method Validation (CodeMentorAgent)
```typescript
describe('Socratic Method Quality', () => {
  const testQueries = [
    'What is a variable?',
    'How does a for loop work?',
    'Explain closures in JavaScript',
  ];

  testQueries.forEach(query => {
    it(`responds to "${query}" with questions, not answers`, async () => {
      const response = await codeMentor.query(query, context);

      // Should contain questions
      const questionCount = (response.content.match(/\?/g) || []).length;
      expect(questionCount).toBeGreaterThanOrEqual(2);

      // Should NOT contain direct definitions
      expect(response.content.toLowerCase()).not.toContain('is a');
      expect(response.content.toLowerCase()).not.toContain('is an');
    });
  });
});
```

#### 2. Resume Quality Validation (ResumeBuilderAgent)
```typescript
describe('Resume Quality', () => {
  it('generates ATS-optimized resume', async () => {
    const resume = await resumeBuilder.query(
      'Guidewire Developer',
      {
        conversationId: 'test',
        userId: 'test',
        metadata: {
          completedModules: ['PolicyCenter', 'BillingCenter'],
          capstoneProject: 'Built insurance quoting system',
        },
      }
    );

    // Check for required sections
    expect(resume.content).toContain('## Technical Skills');
    expect(resume.content).toContain('## Project Experience');
    expect(resume.content).toContain('## Professional Summary');

    // Check for keywords
    expect(resume.content).toContain('Guidewire');
    expect(resume.content).toContain('PolicyCenter');
    expect(resume.content).toContain('BillingCenter');

    // Check for action verbs
    const actionVerbs = ['Built', 'Deployed', 'Developed', 'Optimized'];
    const hasActionVerb = actionVerbs.some(verb =>
      resume.content.includes(verb)
    );
    expect(hasActionVerb).toBe(true);
  });
});
```

#### 3. Escalation Logic Validation
```typescript
describe('Escalation Logic', () => {
  it('escalates after 5+ attempts on same topic', async () => {
    // Track escalation events
    const events: any[] = [];
    eventBus.subscribe('ai.mentor.escalation', (event) => {
      events.push(event);
    });

    // Simulate 6 attempts
    for (let i = 0; i < 6; i++) {
      await codeMentor.query('I dont understand closures', context);
    }

    expect(events.length).toBeGreaterThan(0);
    expect(events[0].payload.reason).toContain('5+ attempts');
  });
});
```

#### 4. Cost Validation
```typescript
describe('Cost Tracking', () => {
  it('CodeMentor costs <$0.001 per query', async () => {
    const response = await codeMentor.query('Test query', context);

    expect(response.cost).toBeLessThan(0.001); // Should use GPT-4o-mini
  });

  it('ResumeBuilder costs ~$0.15 per resume', async () => {
    const response = await resumeBuilder.query('Generate resume', context);

    expect(response.cost).toBeLessThan(0.20); // GPT-4o, longer output
  });
});
```

### Quality Gates
- [ ] Socratic method verified (95%+ responses contain questions)
- [ ] Resume quality validated (ATS score 90%+)
- [ ] Escalation logic tested (triggers after 5 attempts)
- [ ] Orchestrator accuracy 90%+ (routes correctly)
- [ ] Cost targets met ($0.001/query CodeMentor, $0.15/resume Builder)

### Beta Test Plan (50 students, Week 10)
1. Recruit 50 students from current cohort
2. Enable AI Mentor for beta group
3. Track metrics:
   - Helpful rate (thumbs up/down)
   - Escalation rate (<5% target)
   - Response time (<2s target)
4. Gather qualitative feedback (survey)
5. Iterate based on results

### Deliverables
1. **Test Suite** (Socratic, Resume Quality, Escalation)
2. **Beta Test Report** (50 students, metrics)
3. **Sprint 3 QA Summary** (95%+ helpful rate achieved?)
4. **Epic 2 Handoff Checklist** (CodeMentorAgent ready)

---

## ✅ Sprint 3 Completion Checklist

- [ ] **PM:** Beta test completed, metrics meet targets, Epic 2 team trained
- [ ] **Architect:** All 4 agents documented, integration patterns validated
- [ ] **Developer:** 4 agents deployed, tRPC endpoint live, tests passing
- [ ] **QA:** 95%+ helpful rate, <5% escalation, Socratic method verified

**Epic 2 Handoff:** CodeMentorAgent ready for Training Academy integration

---

**Created:** 2025-11-19
**Sprint:** Sprint 3 (Week 9-10)
**Status:** Ready for Execution
**Dependencies:** Sprint 2 (BaseAgent + Orchestrator) must be complete
