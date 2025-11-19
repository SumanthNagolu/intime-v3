# AI-GURU-004: Interview Coach Agent

**Story Points:** 8
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** HIGH (Job Placement Critical)

---

## User Story

As a **Student**,
I want **an AI interview coach that helps me practice behavioral and technical questions**,
So that **I'm confident and well-prepared for real interviews**.

---

## Acceptance Criteria

- [ ] Mock interview session support (STAR method training)
- [ ] Use Claude Sonnet for nuanced coaching (complex reasoning)
- [ ] Behavioral question practice
- [ ] Technical question practice (Guidewire-specific)
- [ ] Real-time feedback on answers
- [ ] Improvement suggestions with examples
- [ ] Company-specific interview prep
- [ ] Confidence-building encouragement
- [ ] Session recording and review
- [ ] Progress tracking across sessions

---

## Technical Implementation

### Interview Coach Agent

Create file: `src/lib/ai/agents/InterviewCoachAgent.ts`

```typescript
// /src/lib/ai/agents/InterviewCoachAgent.ts
import { BaseAgent, AgentConfig } from './BaseAgent';

export class InterviewCoachAgent extends BaseAgent {
  constructor() {
    super({
      name: 'interview_coach',
      useCase: 'interview_coach',
      defaultModel: 'claude-sonnet-4-5', // Best for nuanced coaching
      systemPrompt: `You are an expert interview coach specializing in technology hiring.

COACHING APPROACH:
1. STAR METHOD: Teach Situation, Task, Action, Result framework
2. SPECIFIC FEEDBACK: Point out exactly what to improve
3. EXAMPLES: Provide better answer examples
4. ENCOURAGEMENT: Build confidence, celebrate progress
5. COMPANY-AWARE: Tailor advice to company culture

EVALUATION CRITERIA:
- Clarity and structure
- Relevance to question
- Quantifiable results
- Confidence in delivery
- Appropriate length (2-3 minutes)

STYLE:
- Supportive and constructive
- Specific and actionable
- Honest but encouraging`,
      requiresReasoning: true,
    });
  }

  async provideFeedback(
    question: string,
    studentAnswer: string,
    company?: string
  ): Promise<{
    feedback: string;
    score: number;
    improvements: string[];
    exampleAnswer: string;
  }> {
    const prompt = `INTERVIEW QUESTION:
${question}

STUDENT'S ANSWER:
${studentAnswer}

${company ? `COMPANY: ${company}` : ''}

Provide detailed feedback in JSON format:
{
  "feedback": "Overall assessment (2-3 sentences)",
  "score": 85,
  "improvements": [
    "Specific improvement 1",
    "Specific improvement 2"
  ],
  "exampleAnswer": "Better version of answer using STAR method"
}`;

    const response = await this.query(
      prompt,
      {
        conversationId: `interview-practice-${Date.now()}`,
        userId: 'system',
        metadata: { question, company },
      },
      {
        temperature: 0.7,
        maxTokens: 1024,
      }
    );

    return JSON.parse(response.content);
  }

  async generatePracticeQuestions(
    type: 'behavioral' | 'technical',
    count: number = 5
  ): Promise<string[]> {
    const prompt = `Generate ${count} ${type} interview questions for a Guidewire developer role.

${
  type === 'behavioral'
    ? 'Focus on: teamwork, problem-solving, conflict resolution, leadership'
    : 'Focus on: PolicyCenter, rating, integration, Gosu programming'
}

Return as JSON array: ["Question 1", "Question 2", ...]`;

    const response = await this.query(
      prompt,
      {
        conversationId: `questions-${Date.now()}`,
        userId: 'system',
      },
      {
        temperature: 0.8,
        maxTokens: 512,
      }
    );

    return JSON.parse(response.content);
  }
}
```

---

## Testing

```typescript
describe('Interview Coach Agent', () => {
  it('provides detailed feedback on answers', async () => {
    const agent = new InterviewCoachAgent();

    const feedback = await agent.provideFeedback(
      'Tell me about a time you solved a difficult technical problem',
      'I fixed a bug in our rating code once'
    );

    expect(feedback.score).toBeGreaterThan(0);
    expect(feedback.improvements.length).toBeGreaterThan(0);
    expect(feedback.exampleAnswer).toContain('STAR');
  });

  it('generates practice questions', async () => {
    const agent = new InterviewCoachAgent();

    const questions = await agent.generatePracticeQuestions('behavioral', 5);

    expect(questions.length).toBe(5);
    expect(questions.every((q) => q.endsWith('?'))).toBe(true);
  });
});
```

---

## Verification

- [ ] Feedback is specific and actionable
- [ ] STAR method examples provided
- [ ] Scores are fair (0-100 scale)
- [ ] Practice questions relevant to Guidewire
- [ ] Encouragement included
- [ ] Company-specific advice works

---

## Dependencies

**Requires:**
- AI-INF-005 (Base Agent Framework)

**Blocks:**
- Job placement program features

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-PROD-001 (Desktop Screenshot Agent)
