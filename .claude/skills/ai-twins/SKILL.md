---
name: ai-twins
description: AI Twin system architecture for InTime v3
---

# AI Twins Skill

## Architecture Overview
Each employee gets a personalized AI assistant (Twin) that understands their role and provides proactive help.

## Core Files (src/lib/ai/twins/)

| File | Purpose |
|------|---------|
| EmployeeTwin.ts | Main Twin implementation (~65KB) |
| TwinDirectory.ts | Twin registry and lookup |
| TwinEventBus.ts | Inter-twin communication |
| OrganizationTwin.ts | Org-level AI orchestration |
| OrganizationContext.ts | Cross-pillar coordination |

## Twin Roles
```typescript
type TwinRole =
  | 'ceo'              // Strategic oversight
  | 'recruiter'        // Pipeline management
  | 'trainer'          // Student progress
  | 'bench_sales'      // Consultant marketing
  | 'talent_acquisition' // Lead/deal pipeline
  | 'hr'               // People ops
  | 'immigration'      // Visa tracking
  | 'admin';           // System health
```

## EmployeeTwin Class

### Key Methods
```typescript
class EmployeeTwin extends BaseAgent {
  // Generate morning briefing based on role
  async generateMorningBriefing(): Promise<string>

  // Proactive suggestions based on context
  async generateProactiveSuggestion(): Promise<string | null>

  // Answer questions with context
  async query(question: string): Promise<{
    answer: string;
    conversationId: string;
  }>

  // Get interaction history
  async getInteractionHistory(limit: number): Promise<TwinInteraction[]>
}
```

### Role-Specific Context
```typescript
protected async gatherRoleSpecificContext(): Promise<string> {
  switch (this.role) {
    case 'recruiter':
      return this.gatherRecruiterContext();
      // Open jobs, pipeline status, urgent follow-ups
    case 'trainer':
      return this.gatherTrainerContext();
      // Student progress, at-risk students
    case 'bench_sales':
      return this.gatherBenchContext();
      // Bench days, matching jobs
    // ... etc
  }
}
```

## Cross-Pillar Communication

Twins communicate via TwinEventBus to share insights:

```typescript
// Recruiter Twin notifies Training about new hire
twinEventBus.emit({
  type: 'NEW_HIRE_ONBOARDING',
  fromRole: 'recruiter',
  toRole: 'trainer',
  payload: { candidateId, startDate, role }
});

// Academy Twin alerts Bench Sales about graduate
twinEventBus.emit({
  type: 'TRAINING_COMPLETE',
  fromRole: 'trainer',
  toRole: 'bench_sales',
  payload: { studentId, courseId, skills }
});
```

## Organization Twin

Orchestrates org-wide AI capabilities:
- Morning briefing aggregation
- Cross-pillar opportunity detection
- Executive summaries
- Anomaly detection

## Components

| Component | Purpose |
|-----------|---------|
| TwinWidgetWrapper.tsx | Chat widget embedding |

## Usage Example

```typescript
import { EmployeeTwin } from '@/lib/ai/twins/EmployeeTwin';

// Initialize twin for current user
const twin = new EmployeeTwin({
  userId: session.user.id,
  role: user.primaryRole,
  orgId: user.orgId,
});

// Get morning briefing
const briefing = await twin.generateMorningBriefing();

// Ask a question
const response = await twin.query('What are my priorities today?');
```

## Cost Tracking

EmployeeTwin extends BaseAgent which includes:
- Token usage tracking
- Helicone integration for cost analytics
- Per-interaction cost logging
