# AI-GURU-003: Project Planner Agent

**Story Points:** 5
**Sprint:** Sprint 3 (Week 9-10)
**Priority:** MEDIUM (Capstone Project Support)

---

## User Story

As a **Student**,
I want **an AI agent that helps me plan my capstone project**,
So that **I have realistic milestones, task breakdowns, and risk mitigation strategies**.

---

## Acceptance Criteria

- [ ] Generate detailed project plan with milestones
- [ ] Realistic timeline estimation based on project scope
- [ ] Task breakdown with dependencies
- [ ] Risk analysis with mitigation strategies
- [ ] Resource requirements identification
- [ ] Success metrics definition
- [ ] Gantt chart visualization support
- [ ] Team collaboration features (if group project)
- [ ] Progress tracking integration
- [ ] Export to project management tools

---

## Technical Implementation

### Project Planner Agent

Create file: `src/lib/ai/agents/ProjectPlannerAgent.ts`

```typescript
// /src/lib/ai/agents/ProjectPlannerAgent.ts
import { BaseAgent, AgentConfig } from './BaseAgent';

export type ProjectPlan = {
  projectName: string;
  description: string;
  duration: string;
  milestones: Array<{
    name: string;
    deadline: string;
    deliverables: string[];
  }>;
  tasks: Array<{
    name: string;
    description: string;
    estimatedHours: number;
    dependencies: string[];
    assignee?: string;
  }>;
  risks: Array<{
    risk: string;
    impact: 'high' | 'medium' | 'low';
    mitigation: string;
  }>;
  resources: string[];
  successMetrics: string[];
};

export class ProjectPlannerAgent extends BaseAgent {
  constructor() {
    super({
      name: 'project_planner',
      useCase: 'project_planning',
      defaultModel: 'gpt-4o',
      systemPrompt: `You are an expert project planner specializing in software development projects.

PLANNING PRINCIPLES:
1. REALISTIC: Account for learning curves and setbacks
2. STRUCTURED: Use SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
3. RISK-AWARE: Identify potential blockers early
4. ITERATIVE: Plan for review and adjustment points
5. DOCUMENTED: Clear deliverables and acceptance criteria

PROJECT STRUCTURE:
- Week-by-week milestones
- Daily task breakdowns
- Dependency mapping
- Risk register with mitigation plans
- Success metrics (quantifiable)`,
      requiresWriting: true,
      requiresReasoning: true,
    });
  }

  async generateProjectPlan(
    projectName: string,
    description: string,
    deadline: string,
    teamSize: number = 1
  ): Promise<ProjectPlan> {
    const prompt = `Create a detailed project plan for:

PROJECT: ${projectName}
DESCRIPTION: ${description}
DEADLINE: ${deadline}
TEAM SIZE: ${teamSize} ${teamSize === 1 ? 'person' : 'people'}

Generate a JSON response with:
1. Milestones (weekly breakdown)
2. Tasks (with hour estimates and dependencies)
3. Risks (with impact levels and mitigation)
4. Resource requirements
5. Success metrics

Return valid JSON only.`;

    const response = await this.query(
      prompt,
      {
        conversationId: `project-plan-${Date.now()}`,
        userId: 'system',
        metadata: { projectName, deadline },
      },
      {
        temperature: 0.7,
        maxTokens: 2048,
      }
    );

    try {
      return JSON.parse(response.content);
    } catch (error) {
      throw new Error('Failed to parse project plan JSON');
    }
  }
}
```

---

## Testing

```typescript
describe('Project Planner Agent', () => {
  it('generates realistic project plan', async () => {
    const agent = new ProjectPlannerAgent();

    const plan = await agent.generateProjectPlan(
      'PolicyCenter Quote Builder',
      'Build a web app for creating insurance quotes using PolicyCenter API',
      '2025-12-31',
      2
    );

    expect(plan.milestones.length).toBeGreaterThan(0);
    expect(plan.tasks.length).toBeGreaterThan(5);
    expect(plan.risks.length).toBeGreaterThan(0);
  });
});
```

---

## Verification

- [ ] Project plan generated with milestones
- [ ] Task estimates realistic
- [ ] Dependencies mapped
- [ ] Risks identified
- [ ] Success metrics defined

---

## Dependencies

**Requires:**
- AI-INF-005 (Base Agent Framework)

**Blocks:**
- Capstone project management features

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-GURU-004 (Interview Coach Agent)
