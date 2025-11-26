# AI Twin Living Organism - Claude Code Continuation Prompt

> Use this prompt to continue the AI Twin implementation in Claude Code CLI

---

## Context for Claude

I've been planning an AI Twin ecosystem for InTime v3 with Cursor. Here's the complete context:

### What We're Building

**Goal:** Expand the existing EmployeeTwin framework to cover ALL employee roles with a multi-layer communication system enabling a "living organism" architecture where AI twins collaborate across the organizational hierarchy.

### Key Design Decisions Made

1. **Twin Communication - ALL FOUR mechanisms:**
   - **Event-Driven:** Twins emit events (e.g., 'needs_approval') that trigger notifications to higher-level twins
   - **Direct Query:** Twins can directly ask other twins questions (e.g., Recruiter twin asks CEO twin 'What are Q4 priorities?')
   - **Shared Context Pool:** All twins access a shared organizational knowledge base
   - **Full Orchestration:** A central 'OrganizationTwin' coordinates all individual twins (like a digital scrum master)

2. **Trainee Twins:** Separate approach - Trainees use Guru agents (CodeMentor, InterviewCoach, etc.), fresh twins when hired as employees

3. **Partner Approach (NOT Pods):** Each partner handles end-to-end (recruiter handles full cycle, bench sales handles full cycle, etc.)

---

## Existing Infrastructure Discovered

### Current Files:
- `src/lib/ai/agents/BaseAgent.ts` - Abstract base class with memory, RAG, cost tracking
- `src/lib/ai/twins/EmployeeTwin.ts` - Current implementation (4 roles only)
- `src/types/productivity.ts` - TwinRole type definition
- `src/app/api/twin/chat/route.ts` - Chat API endpoint
- `src/app/api/twin/feedback/route.ts` - Feedback endpoint
- `src/app/api/twin/latest/route.ts` - Latest interactions
- `src/lib/ai/prompts/templates/employee_twin_*.txt` - Role-specific prompts

### Current TwinRole (needs expansion):
```typescript
export type TwinRole = 'recruiter' | 'trainer' | 'bench_sales' | 'admin';
```

### Employee Roles in System (from dashboard router):
- CEO
- Admin/Super Admin
- Recruiting: recruiter, senior_recruiter, junior_recruiter
- Bench Sales: bench_sales, senior_bench_sales, junior_bench_sales
- Talent Acquisition: talent_acquisition, senior_ta, junior_ta
- HR: hr_manager, hr_specialist
- Immigration: immigration_specialist
- Training: trainer, academy_admin

### Layout Files (common pattern):
- `src/components/layouts/RecruitingLayout.tsx`
- `src/components/layouts/BenchLayout.tsx`
- `src/components/layouts/TALayout.tsx`
- `src/components/layouts/HRLayout.tsx`
- `src/components/layouts/CEOLayout.tsx`
- `src/components/layouts/ImmigrationLayout.tsx`
- etc.

---

## The Complete Plan

### Phase 1: Expand Twin Roles (Partner Approach)

**1.1 Extended TwinRole Types**

Update `src/types/productivity.ts`:
```typescript
export type TwinRole =
  // Leadership
  | 'ceo'
  | 'admin'
  // Revenue Partners (End-to-End)
  | 'recruiter'           // Full recruiting cycle
  | 'bench_sales'         // Full bench sales cycle
  | 'talent_acquisition'  // Full TA cycle
  // Support Partners
  | 'hr'
  | 'immigration'
  | 'trainer';
```

**1.2 New Twin Prompt Templates to Create:**
- `src/lib/ai/prompts/templates/employee_twin_ceo.txt`
- `src/lib/ai/prompts/templates/employee_twin_ta.txt`
- `src/lib/ai/prompts/templates/employee_twin_hr.txt`
- `src/lib/ai/prompts/templates/employee_twin_immigration.txt`

**1.3 Update EmployeeTwin.ts** - Extend `getRolePrompt()` method for all new roles

---

### Phase 2: Communication Layer Architecture

**2.1 Event-Driven Communication**

New file: `src/lib/ai/twins/TwinEventBus.ts`
```typescript
export type TwinEvent = {
  type: 'approval_needed' | 'escalation' | 'milestone' | 'alert' | 'cross_sell';
  sourceRole: TwinRole;
  targetRole?: TwinRole;  // Optional: broadcast if null
  payload: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
};

export class TwinEventBus {
  emit(event: TwinEvent): Promise<void>;
  subscribe(role: TwinRole, handler: EventHandler): void;
  getEventsForRole(role: TwinRole): Promise<TwinEvent[]>;
}
```

**2.2 Direct Query Between Twins**

New file: `src/lib/ai/twins/TwinDirectory.ts`
```typescript
export class TwinDirectory {
  getTwin(employeeId: string, role: TwinRole): EmployeeTwin;
  async queryTwin(fromRole: TwinRole, toRole: TwinRole, question: string): Promise<string>;
  getHierarchy(): Map<TwinRole, TwinRole[]>;  // Reports to
}
```

**2.3 Shared Organizational Context Pool**

New file: `src/lib/ai/twins/OrganizationContext.ts`
```typescript
export class OrganizationContext {
  getOrgPriorities(): Promise<string[]>;
  getOrgMetrics(): Promise<OrgMetrics>;
  getPillarHealth(): Promise<Record<Pillar, HealthScore>>;
  getCrossPollinationOpportunities(): Promise<Opportunity[]>;
  searchOrgKnowledge(query: string): Promise<RAGDocument[]>;
}
```

**2.4 Organization Twin (Central Orchestrator)**

New file: `src/lib/ai/twins/OrganizationTwin.ts`
```typescript
export class OrganizationTwin extends BaseAgent {
  async generateDailyStandup(): Promise<StandupReport>;
  async orchestrate(task: OrgTask): Promise<void>;
  async getOrganismHealth(): Promise<OrganismHealth>;
  async routeQuery(question: string): Promise<{ targetTwins: TwinRole[]; reasoning: string }>;
}
```

---

### Phase 3: Database Schema

```sql
-- Twin event bus persistence
CREATE TABLE twin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  source_user_id UUID NOT NULL REFERENCES user_profiles(id),
  source_role TEXT NOT NULL,
  target_role TEXT,  -- NULL = broadcast
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Twin-to-twin conversations
CREATE TABLE twin_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  initiator_role TEXT NOT NULL,
  responder_role TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization context cache
CREATE TABLE org_context_cache (
  org_id UUID PRIMARY KEY REFERENCES organizations(id),
  priorities JSONB,
  metrics JSONB,
  pillar_health JSONB,
  cross_pollination JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Remember:** ALL tables need RLS policies for multi-tenancy!

---

### Phase 4: Common Dashboard/Console Structure

**4.1 Twin Widget Component**

New file: `src/components/twin/TwinWidget.tsx`

A universal AI Twin widget for every employee dashboard:
- Morning briefing display
- Quick chat interface
- Proactive suggestion notifications
- Cross-twin collaboration alerts
- "Ask the Organization" quick action

**4.2 Integrate into All Layouts**

Update all layout files to include TwinWidget.

---

### Phase 5: Partner Approach Integration

Each partner twin understands the FULL lifecycle:
- **Recruiter Twin:** Sourcing → Screening → Interview → Offer → Placement → Follow-up
- **Bench Sales Twin:** Bench onboard → Marketing → Submission → Interview → Placement → Extension
- **TA Twin:** Prospecting → Outreach → Qualification → Handoff → Deal close

Cross-pillar awareness built into prompts:
- Recruiter completing placement → Alert Bench Sales
- Bench placement ending → Alert TA for renewal
- Training graduate → Alert Recruiter for placement

---

### Phase 6: API Endpoints

```
POST /api/twin/event          - Emit event to bus
GET  /api/twin/events         - Get events for current user's twin
POST /api/twin/query-twin     - Query another twin directly
GET  /api/twin/org-context    - Get shared org context
POST /api/twin/org-standup    - Trigger org standup (CEO only)
GET  /api/twin/organism-health - Get organism health metrics
```

---

## Implementation Order

1. **Phase 1** - Expand TwinRole types and prompts (foundation)
2. **Phase 3** - Database schema (storage layer)
3. **Phase 2.3** - Shared context pool (simplest communication)
4. **Phase 2.1** - Event bus (async communication)
5. **Phase 2.2** - Direct query (sync communication)
6. **Phase 2.4** - Organization Twin orchestrator
7. **Phase 4** - Dashboard widget integration
8. **Phase 5** - Partner approach refinements

---

## Files Summary

**New Files to Create:**
- `src/lib/ai/twins/TwinEventBus.ts`
- `src/lib/ai/twins/TwinDirectory.ts`
- `src/lib/ai/twins/OrganizationContext.ts`
- `src/lib/ai/twins/OrganizationTwin.ts`
- `src/components/twin/TwinWidget.tsx`
- `src/components/twin/TwinChat.tsx`
- `src/lib/ai/prompts/templates/employee_twin_ceo.txt`
- `src/lib/ai/prompts/templates/employee_twin_ta.txt`
- `src/lib/ai/prompts/templates/employee_twin_hr.txt`
- `src/lib/ai/prompts/templates/employee_twin_immigration.txt`
- `supabase/migrations/XXXX_twin_communication.sql`

**Files to Modify:**
- `src/types/productivity.ts` - Expand TwinRole
- `src/lib/ai/twins/EmployeeTwin.ts` - Add new roles, communication methods
- `src/components/layouts/*Layout.tsx` - Add TwinWidget integration
- `src/app/api/twin/` - New API routes

---

## Start Command for Claude Code

```
Please implement the AI Twin Living Organism architecture as outlined in docs/planning/AI-TWIN-LIVING-ORGANISM-PROMPT.md

Start with Phase 1: Expanding TwinRole types and creating new prompt templates.

Follow the .cursorrules for:
- Database patterns (RLS, audit trails, soft deletes)
- TypeScript strict mode
- Server Components by default
- Zod validation on all inputs
```

---

## Notes

- No pod structure - use partner approach (end-to-end ownership)
- Trainees use Guru agents, not Employee Twins
- All communication mechanisms work together (not either/or)
- OrganizationTwin is the "brain" that coordinates everything
- Cross-pollination opportunities should flow through the event bus

