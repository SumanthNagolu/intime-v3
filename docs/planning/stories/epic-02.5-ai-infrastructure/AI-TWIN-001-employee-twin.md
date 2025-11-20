# AI-TWIN-001: Employee AI Twin Framework

**Story Points:** 5
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** HIGH (Strategic Differentiator)

---

## User Story

As an **Employee**,
I want **a personalized AI twin that knows my role and workflows**,
So that **I get proactive suggestions, reminders, and help throughout my workday**.

---

## Acceptance Criteria

- [ ] Role-specific twin templates (Recruiter, Trainer, Bench Sales, Admin)
- [ ] Morning briefings (personalized daily summary)
- [ ] Proactive suggestions (3× per day based on activity)
- [ ] On-demand question answering
- [ ] Context-aware (knows employee's current tasks)
- [ ] Learning from patterns (adapts to employee preferences)
- [ ] Slack/email integration
- [ ] 80%+ daily active use
- [ ] <$15/day cost per employee

---

## Technical Implementation

### Employee AI Twin

Create file: `src/lib/ai/twins/EmployeeTwin.ts`

```typescript
// /src/lib/ai/twins/EmployeeTwin.ts
import { BaseAgent, AgentConfig } from '../agents/BaseAgent';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export type TwinRole = 'recruiter' | 'trainer' | 'bench_sales' | 'admin';

export class EmployeeTwin extends BaseAgent {
  private role: TwinRole;
  private employeeId: string;

  constructor(employeeId: string, role: TwinRole) {
    super({
      name: `${role}_twin`,
      useCase: 'employee_twin',
      defaultModel: 'gpt-4o-mini',
      systemPrompt: EmployeeTwin.getRolePrompt(role),
      requiresReasoning: true,
    });

    this.employeeId = employeeId;
    this.role = role;
  }

  /**
   * Get role-specific system prompt
   */
  private static getRolePrompt(role: TwinRole): string {
    const prompts: Record<TwinRole, string> = {
      recruiter: `You are an AI assistant for a technical recruiter specializing in Guidewire placements.

YOUR ROLE:
- Track candidate pipeline (sourcing → screening → interview → placement)
- Suggest next best actions for each candidate
- Remind about follow-ups and deadlines
- Provide resume matching insights
- Optimize job description wording
- Track placement metrics

BE PROACTIVE:
- "You have 3 candidates waiting for follow-up"
- "Job req #42 has been open for 2 weeks - suggest posting to LinkedIn"
- "Candidate John Doe matches 85% with PolicyCenter role"

TONE: Professional, action-oriented, data-driven`,

      trainer: `You are an AI assistant for a Guidewire trainer.

YOUR ROLE:
- Track student progress and struggles
- Suggest personalized interventions
- Remind about grading deadlines
- Identify at-risk students
- Recommend curriculum improvements
- Prepare class materials

BE PROACTIVE:
- "Student Jane is struggling with Rating module - schedule 1:1"
- "Quiz grades due tomorrow for Module 5"
- "3 students haven't logged in this week"

TONE: Supportive, educator-focused, student-centric`,

      bench_sales: `You are an AI assistant for a bench sales consultant.

YOUR ROLE:
- Track bench consultants (availability, skills, rates)
- Match consultants to client requirements
- Suggest outreach strategies
- Monitor market rates
- Track placement timelines (30-60 day goal)
- Optimize consultant marketing

BE PROACTIVE:
- "Consultant Mike is on bench for 15 days - 3 matching reqs found"
- "Client ABC looking for ClaimCenter dev - Sarah is 90% match"
- "Market rate for PolicyCenter increased 10% this month"

TONE: Sales-oriented, metrics-focused, urgency-driven`,

      admin: `You are an AI assistant for a platform administrator.

YOUR ROLE:
- Monitor system health
- Track user activity and anomalies
- Suggest optimizations
- Alert on security issues
- Generate reports
- Coordinate cross-team tasks

BE PROACTIVE:
- "Database size increased 50% this week - consider archiving"
- "User login errors spiked - check auth service"
- "Weekly report generation scheduled for tomorrow"

TONE: Technical, precise, systems-thinking`,
    };

    return prompts[role];
  }

  /**
   * Generate morning briefing
   */
  async generateMorningBriefing(): Promise<string> {
    const context = await this.gatherEmployeeContext();

    const prompt = `Generate a personalized morning briefing for this ${this.role}.

CONTEXT:
${JSON.stringify(context, null, 2)}

BRIEFING STRUCTURE:
1. Greeting (personalized with name)
2. Today's priorities (top 3 tasks)
3. Urgent items (deadlines, follow-ups)
4. Opportunities (proactive suggestions)
5. Motivational close

Keep it concise (200-300 words), friendly, and actionable.`;

    const response = await this.query(
      prompt,
      {
        conversationId: `briefing-${Date.now()}`,
        userId: this.employeeId,
        userType: 'employee',
        metadata: { action: 'morning_briefing', role: this.role },
      },
      {
        temperature: 0.7,
        maxTokens: 512,
      }
    );

    return response.content;
  }

  /**
   * Gather employee context
   */
  private async gatherEmployeeContext(): Promise<any> {
    // Get employee profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', this.employeeId)
      .single();

    // Role-specific context
    let roleContext = {};

    switch (this.role) {
      case 'recruiter':
        const { data: candidates } = await supabase
          .from('candidates')
          .select('*')
          .eq('recruiter_id', this.employeeId)
          .in('status', ['screening', 'interviewing']);

        roleContext = {
          active_candidates: candidates?.length || 0,
          candidates_needing_followup: candidates?.filter((c) =>
            this.needsFollowup(c)
          ).length,
        };
        break;

      case 'trainer':
        const { data: students } = await supabase
          .from('student_progress')
          .select('*')
          .eq('trainer_id', this.employeeId);

        roleContext = {
          total_students: students?.length || 0,
          struggling_students: students?.filter((s) => s.grade < 70).length,
        };
        break;

      case 'bench_sales':
        const { data: bench } = await supabase
          .from('bench_consultants')
          .select('*')
          .eq('sales_owner_id', this.employeeId)
          .eq('status', 'available');

        roleContext = {
          bench_count: bench?.length || 0,
          avg_bench_days: this.calculateAvgBenchDays(bench || []),
        };
        break;
    }

    return {
      employee_name: profile?.full_name,
      role: this.role,
      ...roleContext,
    };
  }

  /**
   * Check if candidate needs follow-up
   */
  private needsFollowup(candidate: any): boolean {
    const lastContact = new Date(candidate.last_contact_at);
    const daysSince = (Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24);

    return daysSince > 3; // More than 3 days
  }

  /**
   * Calculate average days on bench
   */
  private calculateAvgBenchDays(consultants: any[]): number {
    if (consultants.length === 0) return 0;

    const total = consultants.reduce((sum, c) => {
      const benchDate = new Date(c.bench_start_date);
      const days = (Date.now() - benchDate.getTime()) / (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);

    return Math.round(total / consultants.length);
  }

  /**
   * Generate proactive suggestion
   */
  async generateProactiveSuggestion(): Promise<string | null> {
    const context = await this.gatherEmployeeContext();

    // Check if there's something worth suggesting
    const hasActionableItems = await this.hasActionableItems(context);

    if (!hasActionableItems) {
      return null; // No suggestions needed
    }

    const prompt = `Based on this context, generate ONE proactive suggestion.

CONTEXT:
${JSON.stringify(context, null, 2)}

SUGGESTION FORMAT:
- Start with attention grabber ("👋 Quick heads up...")
- State the opportunity/issue
- Suggest specific action
- Keep it 1-2 sentences

Return only the suggestion text.`;

    const response = await this.query(
      prompt,
      {
        conversationId: `suggestion-${Date.now()}`,
        userId: this.employeeId,
        userType: 'employee',
        metadata: { action: 'proactive_suggestion', role: this.role },
      },
      {
        temperature: 0.8,
        maxTokens: 150,
      }
    );

    return response.content;
  }

  /**
   * Check if there are actionable items
   */
  private async hasActionableItems(context: any): boolean {
    if (this.role === 'recruiter') {
      return context.candidates_needing_followup > 0;
    }

    if (this.role === 'trainer') {
      return context.struggling_students > 0;
    }

    if (this.role === 'bench_sales') {
      return context.bench_count > 0 && context.avg_bench_days > 7;
    }

    return false;
  }
}
```

---

## Testing

```typescript
describe('Employee AI Twin', () => {
  it('generates morning briefing', async () => {
    const twin = new EmployeeTwin('test-employee-id', 'recruiter');

    const briefing = await twin.generateMorningBriefing();

    expect(briefing).toBeTruthy();
    expect(briefing.length).toBeGreaterThan(100);
    expect(briefing).toContain('priorities');
  });

  it('generates proactive suggestions', async () => {
    const twin = new EmployeeTwin('test-employee-id', 'trainer');

    const suggestion = await twin.generateProactiveSuggestion();

    if (suggestion) {
      expect(suggestion.length).toBeLessThan(200);
    }
  });

  it('role-specific prompts work', () => {
    const recruiterTwin = new EmployeeTwin('test-1', 'recruiter');
    const trainerTwin = new EmployeeTwin('test-2', 'trainer');

    expect(recruiterTwin['config'].systemPrompt).toContain('recruiter');
    expect(trainerTwin['config'].systemPrompt).toContain('trainer');
  });
});
```

---

## Verification

- [ ] Morning briefings personalized
- [ ] Proactive suggestions actionable
- [ ] Role-specific context accurate
- [ ] Privacy controls work
- [ ] Cost <$5/day per employee
- [ ] 80%+ engagement rate

---

## Dependencies

**Requires:**
- AI-INF-005 (Base Agent Framework)
- Employee role data
- Activity tracking data

**Blocks:**
- Employee productivity features
- Workflow automation

---

**Status:** ✅ Ready for Implementation

---

## Epic Complete

All 12 user stories for Epic 2.5 AI Infrastructure have been created!

**Stories:**
1. ✅ AI-INF-001: AI Model Router
2. ✅ AI-INF-002: RAG Infrastructure
3. ✅ AI-INF-003: Memory Layer
4. ✅ AI-INF-004: Cost Monitoring with Helicone
5. ✅ AI-INF-005: Base Agent Framework
6. ✅ AI-INF-006: Prompt Library
7. ✅ AI-INF-007: Multi-Agent Orchestrator
8. ✅ AI-GURU-001: Code Mentor Agent
9. ✅ AI-GURU-002: Resume Builder Agent
10. ✅ AI-GURU-003: Project Planner Agent
11. ✅ AI-GURU-004: Interview Coach Agent
12. ✅ AI-PROD-001: Desktop Screenshot Agent
13. ✅ AI-PROD-002: Activity Classification
14. ✅ AI-PROD-003: Daily Timeline Generator
15. ✅ AI-TWIN-001: Employee AI Twin Framework

**Total Story Points:** 87 points
**Timeline:** 8 weeks (Week 5-12)
