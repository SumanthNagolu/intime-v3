# Vision Document: Technology Architecture

**Document Version:** 1.0
**Last Updated:** 2025-11-17
**Status:** Living Document
**Owner:** Founder + CTO

---

## Executive Summary

InTime v3's technology architecture is designed as a **living organism** - not traditional software. This document details our complete technical foundation including database schema, security policies, real-time systems, AI orchestration, and third-party integrations.

**Key Architectural Principles:**
- **Security First**: Row Level Security (RLS) on ALL tables
- **Real-Time Everything**: WebSocket-powered live updates
- **AI-Native**: 11 AI use cases with optimized model selection
- **Type-Safe End-to-End**: TypeScript strict mode, no `any` types
- **Cost-Optimized**: $93K/year tech spend (3.2% of revenue)

---

## Architectural Patterns (from Legacy Project Audit)

### Critical Lessons Applied to v3

The following architectural decisions are informed by a comprehensive audit of our 7-day legacy project (94,000 LOC, 8 modules). These are **non-negotiable principles** that prevent the critical failures we observed.

### 1. Unified Database Schema

**Principle:** Single source of truth for all entities

**Legacy Mistake:** 3 separate user systems (user_profiles, employees, candidates) causing data silos and inconsistency.

**v3 Solution:**

```sql
-- ONE user table (not separate employees, candidates, students)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,

  -- Universal fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active',

  -- Role-specific fields (nullable)
  student_enrollment_date TIMESTAMPTZ,
  employee_hire_date TIMESTAMPTZ,
  candidate_status TEXT,
  client_company_name TEXT
);

-- Multi-role support
CREATE TABLE user_roles (
  user_id UUID REFERENCES user_profiles(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**Why:** Prevents data silos, enables cross-module queries, supports multi-role users (e.g., student who becomes employee).

### 2. Event-Driven Integration

**Principle:** Modules communicate via events, not direct calls

**Legacy Mistake:** Event bus implemented but never used. Manual cross-module workflows leading to tight coupling.

**v3 Solution:**

```typescript
// Example: Student graduates → Auto-create candidate profile
eventBus.subscribe('course.graduated', async (event) => {
  await grantRole(event.payload.userId, 'candidate');
  await notifyRecruitmentTeam(event.payload.userId);
  await updateCrossPollinationMatrix(event.payload.userId);
});

// Example: Job placement → Update multiple systems
eventBus.publish('job.placed', {
  userId: candidateId,
  jobId: jobId,
  salary: 85000,
  clientId: clientId,
});
```

**Why:** Decouples modules, enables audit trail, easy to add new integrations without modifying existing code.

### 3. tRPC-Only API Layer

**Principle:** Type-safe APIs with single consistent pattern

**Legacy Mistake:** Mixed REST (35 routes) + tRPC (4 routers) causing developer confusion and 3 different error handling patterns.

**v3 Solution:**

```typescript
export const appRouter = router({
  academy: academyRouter,      // Type-safe
  hr: hrRouter,                // Type-safe
  recruiting: recruitingRouter, // Type-safe
  trikala: triakalaRouter,     // Type-safe
  // All modules use same pattern
});

export type AppRouter = typeof appRouter;
```

**Why:** End-to-end type safety, consistent error handling, auto-generated client types, single learning curve.

### 4. RLS-First Security

**Principle:** Enforce permissions at database level, not application level

**Legacy Mistake:** Application-level auth checks that could be bypassed, inconsistent permission logic.

**v3 Solution:**

```sql
-- Students can only view their own topics
CREATE POLICY "Students view own topics"
ON topic_completions FOR SELECT
USING (user_id = auth.uid());

-- Admins can view all topics
CREATE POLICY "Admins view all topics"
ON topic_completions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role_id = 'admin'
  )
);
```

**Why:** Impossible to bypass (enforced at DB level), consistent across all clients (web, mobile, API), audit trail built-in.

### 5. Testing Strategy

**Principle:** Tests alongside features, not "later"

**Legacy Mistake:** Vitest and Playwright configured but zero tests written. "We'll add tests later" never happened.

**v3 Solution:**

```typescript
// Write test BEFORE implementing feature (TDD)
describe('Candidate Bulk Upload', () => {
  it('should validate CSV format', async () => {
    const result = await validateCandidateCSV(invalidCSV);
    expect(result.errors).toHaveLength(3);
  });

  it('should create candidates with proper RLS', async () => {
    const candidates = await importCandidatesFromCSV(validCSV);
    expect(candidates).toHaveLength(50);
    // Verify each candidate has correct permissions
  });
});
```

**Pre-commit hooks enforce:**
- ✅ 80%+ coverage for critical paths
- ✅ All tests passing
- ✅ TypeScript compilation successful
- ✅ Build succeeds

**Why:** Prevents regressions, documents expected behavior, enables confident refactoring.

### 6. Cost Optimization Patterns

**Principle:** Optimize AI costs through batching and model selection

**Legacy Lessons:**
- **Batch processing:** 70% cost reduction (process every 5 minutes vs real-time)
- **Model selection:** Use GPT-4o-mini for simple tasks (10x cheaper)
- **Caching:** 24-hour cache for repeated queries (50% reduction)
- **Rate limiting:** Prevent abuse

**v3 Implementation:**

```typescript
// Batch AI processing
const batchProcessor = createBatchProcessor({
  interval: 5 * 60 * 1000, // 5 minutes
  maxBatchSize: 50,
  process: async (items) => {
    return await summarizeActivityBatch(items);
  },
});

// Smart model selection
function selectModel(taskComplexity: 'simple' | 'medium' | 'complex') {
  switch (taskComplexity) {
    case 'simple':
      return 'gpt-4o-mini'; // 10x cheaper
    case 'medium':
      return 'gpt-4o';      // Balanced
    case 'complex':
      return 'claude-opus'; // Most capable
  }
}
```

**Cost Comparison:**
- **Legacy (real-time):** $140/user/month
- **v3 (optimized):** $30/user/month
- **Savings:** 78% reduction

### 7. Dead Code Policy

**Principle:** Delete immediately, use git history for recovery

**Legacy Mistake:** ~15% of codebase unused (2,000+ LOC in old desktop-agent/, 500 LOC in ai-screenshot-agent/).

**v3 Policy:**

```bash
# When replacing implementation:
git rm -r src/old-implementation/
git commit -m "Remove old X implementation (replaced by Y)"

# For uncertain changes:
git checkout -b experiment/new-approach
# If successful: merge to main
# If failed: delete branch (no clutter)

# Monthly cleanup audit:
find src/ -type f -mtime +90 | review-for-deletion
```

**Why:** Reduces confusion ("which version is current?"), faster code navigation, cleaner git history.

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Database Architecture](#database-architecture)
3. [Authentication & Authorization](#authentication--authorization)
4. [Real-Time Systems](#real-time-systems)
5. [Cross-Pollination Event Bus](#cross-pollination-event-bus)
6. [API Architecture](#api-architecture)
7. [State Management](#state-management)
8. [File Storage Strategy](#file-storage-strategy)
9. [Third-Party Integrations](#third-party-integrations)
10. [AI Model Selection](#ai-model-selection)
11. [Performance & Scalability](#performance--scalability)
12. [Security & Compliance](#security--compliance)
13. [Cost Analysis](#cost-analysis)

---

## Tech Stack Overview

### Frontend Stack

**Framework: Next.js 15 (App Router)**
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
```

**Why Next.js 15:**
- ✅ Server Components (reduce client bundle size by 80%)
- ✅ App Router (nested layouts, streaming SSR)
- ✅ Server Actions (no API boilerplate needed)
- ✅ Image optimization (automatic WebP conversion, lazy loading)
- ✅ TypeScript-first (type-safe from database to UI)

**UI Framework: shadcn/ui + Tailwind CSS**
```typescript
// components/ui/button.tsx
import { cn } from "@/lib/utils"

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium",
        "bg-primary text-primary-foreground hover:bg-primary/90",
        className
      )}
      {...props}
    />
  )
}
```

**Why shadcn/ui:**
- ✅ Copy-paste components (not NPM bloat)
- ✅ Customizable (we own the code)
- ✅ Accessible by default (ARIA labels, keyboard navigation)
- ✅ Beautiful out-of-the-box (professional design)

**State Management: Zustand**
```typescript
// lib/stores/pod-store.ts
import create from 'zustand';

interface PodState {
  currentPodId: string | null;
  setCurrentPod: (podId: string) => void;
}

export const usePodStore = create<PodState>((set) => ({
  currentPodId: null,
  setCurrentPod: (podId) => set({ currentPodId: podId })
}));
```

**Why Zustand:**
- ✅ Lightweight (1KB vs Redux 10KB)
- ✅ No boilerplate (no actions, reducers, providers)
- ✅ TypeScript-first
- ✅ DevTools support

### Backend Stack

**Database: Supabase (PostgreSQL 15)**
- ✅ Managed PostgreSQL (auto-scaling, backups)
- ✅ Built-in Auth (JWT tokens, session management)
- ✅ Row Level Security (database-level authorization)
- ✅ Real-time subscriptions (WebSocket)
- ✅ Storage (S3-compatible object storage)

**ORM: Drizzle**
```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name').notNull(),
  roles: jsonb('roles').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Why Drizzle:**
- ✅ Type-safe queries (autocomplete in IDE)
- ✅ Zero runtime overhead (SQL generation at build time)
- ✅ Migration management (version control for schema)
- ✅ Lightweight (2KB vs Prisma 50KB)

**Validation: Zod**
```typescript
// lib/validators/candidate.ts
import { z } from 'zod';

export const CandidateSchema = z.object({
  fullName: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone"),
  yearsExperience: z.number().min(0).max(50),
  skills: z.array(z.string()).min(1, "At least one skill required")
});

export type Candidate = z.infer<typeof CandidateSchema>;
```

**Why Zod:**
- ✅ Runtime validation (catch bad data at API boundary)
- ✅ TypeScript inference (types from validators)
- ✅ Composable (reuse schemas)
- ✅ Error messages (user-friendly validation)

### Infrastructure

**Hosting: Vercel**
- ✅ Edge Network (global CDN, <50ms latency)
- ✅ Automatic deployments (Git push → live in 30 seconds)
- ✅ Preview environments (every PR gets a URL)
- ✅ Analytics (Web Vitals, Core Web Vitals)
- ✅ Cost: $50/month (Pro plan)

**Error Tracking: Sentry**
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of requests
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers?.Authorization) {
      delete event.request.headers.Authorization;
    }
    return event;
  }
});
```

**Why Sentry:**
- ✅ Real-time error alerts (Slack notifications)
- ✅ Stack traces (exact line that failed)
- ✅ User context (which user hit the error)
- ✅ Performance monitoring (slow queries)
- ✅ Cost: Free tier (10K events/month)

**Email: Resend**
- ✅ 99.9% deliverability
- ✅ $0.10/1,000 emails
- ✅ React email templates
- ✅ Webhook events (opened, clicked)

**SMS: Twilio**
- ✅ Global coverage
- ✅ $0.0079/SMS (US)
- ✅ 2FA support
- ✅ Programmable voice

---

## Database Architecture

### Core Tables (28 Total)

#### 1. Identity Tables

**Unified User Model:**
```sql
-- Managed by Supabase Auth
TABLE: auth.users
├─ id (uuid, PK)
├─ email (text, unique)
├─ encrypted_password (text)
├─ email_confirmed_at (timestamp)
├─ created_at (timestamp)
└─ updated_at (timestamp)

-- Our extended profile
TABLE: public.profiles
├─ id (uuid, PK, FK → auth.users.id)
├─ full_name (text)
├─ phone (text)
├─ avatar_url (text)
├─ timezone (text)
├─ roles (jsonb) -- ["student", "consultant", "employee"]
├─ metadata (jsonb) -- role-specific data
├─ created_at (timestamp)
├─ updated_at (timestamp)
└─ deleted_at (timestamp) -- soft delete
```

**Journey of "Priya" (Student → Consultant → Employee):**
```sql
-- DAY 0: Priya signs up as STUDENT
INSERT INTO profiles (id, full_name, roles)
VALUES ('uuid-123', 'Priya Sharma', '["student"]');

INSERT INTO students (user_id, enrollment_date, status)
VALUES ('uuid-123', '2026-01-01', 'active');

-- DAY 60: Priya GRADUATES (becomes consultant)
UPDATE profiles SET roles = '["student", "consultant"]'
WHERE id = 'uuid-123';

INSERT INTO consultants (user_id, full_name, source)
VALUES ('uuid-123', 'Priya Sharma', 'academy_graduate');

-- DAY 90: Priya PLACED at client
INSERT INTO placements (consultant_id, client_id, start_date)
VALUES ('consultant-priya-id', 'client-xyz-id', '2026-04-01');

-- YEAR 2: Priya HIRED as internal recruiter!
UPDATE profiles SET roles = '["student", "consultant", "employee", "recruiter"]'
WHERE id = 'uuid-123';

INSERT INTO employees (user_id, position, department)
VALUES ('uuid-123', 'junior_recruiter', 'recruiting');
```

**Benefits:**
- ✅ Single sign-on (one email, one password)
- ✅ Complete history (student → consultant → employee)
- ✅ Cross-reference easy (recruiter knows consultant was our grad)
- ✅ Flexible (add roles without schema changes)

#### 2. Training Academy Tables

```sql
TABLE: students
├─ id (uuid, PK)
├─ user_id (uuid, FK → profiles.id, unique)
├─ enrollment_date (date)
├─ expected_completion_date (date)
├─ actual_completion_date (date, nullable)
├─ status (text) -- "active", "completed", "dropped", "paused"
├─ subscription_status (text) -- "active", "past_due", "canceled"
├─ payment_method_id (text) -- Stripe payment method
├─ total_paid (numeric) -- lifetime revenue
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: courses
├─ id (uuid, PK)
├─ title (text) -- "Guidewire ClaimCenter Developer"
├─ slug (text, unique) -- "guidewire-claimcenter"
├─ description (text)
├─ level (text) -- "beginner", "intermediate", "advanced"
├─ duration_weeks (int) -- 8
├─ price_monthly (numeric) -- 499.00
├─ is_active (boolean)
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: lessons
├─ id (uuid, PK)
├─ course_id (uuid, FK → courses.id)
├─ title (text)
├─ slug (text)
├─ order_index (int) -- sequence within course
├─ content_type (text) -- "video", "text", "interactive"
├─ video_url (text, nullable)
├─ content_markdown (text)
├─ duration_minutes (int)
├─ prerequisites (jsonb array) -- lesson IDs required first
├─ learning_objectives (jsonb array)
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: student_progress
├─ id (uuid, PK)
├─ student_id (uuid, FK → students.id)
├─ lesson_id (uuid, FK → lessons.id)
├─ status (text) -- "not_started", "in_progress", "completed"
├─ started_at (timestamp)
├─ completed_at (timestamp, nullable)
├─ time_spent_minutes (int)
├─ quiz_score (numeric, nullable) -- 0-100
├─ assignment_submitted (boolean)
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: ai_mentor_conversations
├─ id (uuid, PK)
├─ student_id (uuid, FK → students.id)
├─ lesson_id (uuid, FK → lessons.id, nullable)
├─ messages (jsonb array)
│   -- [{role: "user", content: "..."}, {role: "assistant", ...}]
├─ context_tokens (int) -- track token usage
├─ cost (numeric) -- track AI cost per conversation
├─ created_at (timestamp)
└─ updated_at (timestamp)
```

**Sequential Mastery Enforcement:**
```typescript
// lib/academy/can-access-lesson.ts
export async function canAccessLesson(studentId: string, lessonId: string) {
  const lesson = await getLesson(lessonId);

  // Check prerequisites
  for (const prereqId of lesson.prerequisites) {
    const progress = await getProgress(studentId, prereqId);

    if (progress?.status !== 'completed') {
      return {
        allowed: false,
        reason: `Must complete "${prereqLessonTitle}" first`
      };
    }
  }

  return { allowed: true };
}
```

#### 3. Recruiting & Bench Tables

```sql
TABLE: consultants
├─ id (uuid, PK)
├─ user_id (uuid, FK → profiles.id, nullable)
├─ full_name (text)
├─ email (text, unique)
├─ phone (text)
├─ resume_url (text)
├─ linkedin_url (text)
├─ skills (jsonb array) -- ["PolicyCenter", "ClaimCenter", "Java"]
├─ years_experience (numeric)
├─ current_status (text)
│   -- "active_search", "placed", "on_bench", "passive"
├─ hourly_rate (numeric, nullable)
├─ salary_expectation (numeric, nullable)
├─ availability_date (date)
├─ source (text)
│   -- "linkedin", "referral", "academy_graduate", "job_board"
├─ referrer_id (uuid, FK → consultants.id, nullable)
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: clients
├─ id (uuid, PK)
├─ company_name (text)
├─ industry (text)
├─ size (text) -- "1-50", "51-200", "201-1000", "1000+"
├─ website (text)
├─ primary_contact_name (text)
├─ primary_contact_email (text)
├─ primary_contact_phone (text)
├─ address (jsonb)
├─ status (text) -- "prospect", "active", "inactive", "churned"
├─ payment_terms (text) -- "Net 30", "Net 60"
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: jobs
├─ id (uuid, PK)
├─ client_id (uuid, FK → clients.id)
├─ title (text)
├─ description (text)
├─ requirements (jsonb) -- skills, experience, certifications
├─ location (text)
├─ remote (boolean)
├─ employment_type (text) -- "full_time", "contract", "contract_to_hire"
├─ salary_min (numeric, nullable)
├─ salary_max (numeric, nullable)
├─ hourly_rate (numeric, nullable)
├─ status (text) -- "open", "filled", "on_hold", "canceled"
├─ urgency (text) -- "low", "medium", "high", "critical"
├─ assigned_pod_id (uuid, FK → pods.id)
├─ assigned_recruiter_id (uuid, FK → employees.id)
├─ created_at (timestamp)
├─ filled_at (timestamp, nullable)
└─ updated_at (timestamp)

TABLE: job_submissions
├─ id (uuid, PK)
├─ job_id (uuid, FK → jobs.id)
├─ consultant_id (uuid, FK → consultants.id)
├─ submitted_by_id (uuid, FK → employees.id)
├─ resume_version_url (text)
├─ cover_letter (text, nullable)
├─ status (text)
│   -- "submitted", "reviewed", "interview_scheduled",
│   -- "interviewing", "offer", "placed", "rejected"
├─ ai_match_score (numeric) -- 0-100
├─ submitted_at (timestamp)
├─ status_updated_at (timestamp)
└─ notes (text)

TABLE: placements
├─ id (uuid, PK)
├─ job_submission_id (uuid, FK → job_submissions.id)
├─ job_id (uuid, FK → jobs.id)
├─ consultant_id (uuid, FK → consultants.id)
├─ client_id (uuid, FK → clients.id)
├─ placed_by_pod_id (uuid, FK → pods.id)
├─ placed_by_recruiter_id (uuid, FK → employees.id)
├─ start_date (date)
├─ end_date (date, nullable)
├─ employment_type (text)
├─ salary (numeric, nullable)
├─ hourly_rate (numeric, nullable)
├─ placement_fee (numeric) -- what we charged
├─ placement_fee_type (text) -- "one_time", "percentage", "hybrid"
├─ ongoing_commission_rate (numeric, nullable)
├─ status (text) -- "active", "completed", "terminated_early"
├─ guarantee_period_days (int) -- 30, 60, 90
├─ replacement_count (int) -- quality metric
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: bench_consultants
├─ id (uuid, PK)
├─ consultant_id (uuid, FK → consultants.id)
├─ bench_start_date (date)
├─ expected_end_date (date) -- start + 30 days
├─ actual_placement_date (date, nullable)
├─ status (text) -- "active", "placed", "released", "extended"
├─ days_on_bench (int, computed)
├─ assigned_pod_id (uuid, FK → pods.id)
├─ aging_alert_sent (boolean)
├─ critical_alert_sent (boolean)
├─ created_at (timestamp)
└─ updated_at (timestamp)
```

**30-Day Bench Guarantee Logic:**
```sql
-- Automated aging calculation (runs daily via cron)
CREATE OR REPLACE FUNCTION update_bench_aging()
RETURNS void AS $$
BEGIN
  -- Update days_on_bench
  UPDATE bench_consultants
  SET days_on_bench = EXTRACT(DAY FROM NOW() - bench_start_date)
  WHERE status = 'active';

  -- 🟡 Yellow alert at 25 days
  UPDATE bench_consultants
  SET aging_alert_sent = true
  WHERE days_on_bench >= 25
    AND status = 'active'
    AND NOT aging_alert_sent;

  -- 🔴 Red alert at 28 days
  UPDATE bench_consultants
  SET critical_alert_sent = true
  WHERE days_on_bench >= 28
    AND status = 'active'
    AND NOT critical_alert_sent;

  -- ❌ Auto-release at 30 days
  UPDATE bench_consultants
  SET status = 'released'
  WHERE days_on_bench >= 30
    AND status = 'active';
END;
$$ LANGUAGE plpgsql;
```

#### 4. Cross-Pollination Tables

```sql
TABLE: leads
├─ id (uuid, PK)
├─ source_pod_type (text) -- "recruiting", "ta", "bench", "training"
├─ source_pod_id (uuid, FK → pods.id)
├─ source_employee_id (uuid, FK → employees.id)
├─ target_pod_type (text) -- where lead is being sent
├─ target_pod_id (uuid, FK → pods.id, nullable)
├─ lead_type (text) -- "candidate", "client", "student", "referral"
├─ consultant_id (uuid, FK → consultants.id, nullable)
├─ client_id (uuid, FK → clients.id, nullable)
├─ status (text) -- "new", "contacted", "qualified", "converted", "dead"
├─ conversion_value (numeric, nullable) -- revenue generated
├─ attribution_percentage (numeric) -- source pod credit
├─ notes (text)
├─ created_at (timestamp)
└─ updated_at (timestamp)
```

**Cross-Pollination Example:**
```
SCENARIO: Recruiter finds candidate who needs training

Recruiter → "This candidate is skilled but needs Guidewire training"
         ↓
System creates LEAD in `leads` table:
├─ source_pod_type: "recruiting"
├─ target_pod_type: "training"
├─ lead_type: "candidate"
├─ status: "new"
         ↓
Training pod manager sees lead in real-time (WebSocket)
         ↓
Training manager contacts candidate, enrolls them
         ↓
System updates lead:
├─ status: "converted"
├─ conversion_value: $3,992 (8 weeks × $499)
         ↓
Trigger fires: Create commission for source recruiter
├─ commission_type: "attribution"
├─ amount: $3,992 × 15% = $599
         ↓
RESULT: Recruiter gets $599 bonus for spotting training opportunity! 🎉
```

#### 5. Employee & Organization Tables

```sql
TABLE: employees
├─ id (uuid, PK)
├─ user_id (uuid, FK → profiles.id)
├─ employee_number (text, unique)
├─ hire_date (date)
├─ position (text) -- "junior_recruiter", "senior_recruiter", etc.
├─ department (text) -- "recruiting", "bench_sales", "ta", "training"
├─ pod_id (uuid, FK → pods.id, nullable)
├─ base_salary_monthly (numeric)
├─ commission_rate (numeric) -- percentage
├─ status (text) -- "active", "on_leave", "terminated"
├─ performance_score (numeric, nullable) -- 0-100
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: pods
├─ id (uuid, PK)
├─ name (text) -- "Recruiting Pod Alpha"
├─ type (text) -- "recruiting", "bench_sales", "ta", "training"
├─ team_lead_id (uuid, FK → employees.id)
├─ target_placements_per_sprint (int) -- 2
├─ current_sprint_placements (int)
├─ status (text) -- "active", "ramping", "paused"
├─ created_at (timestamp)
└─ updated_at (timestamp)
```

**Pod Performance Tracking:**
```typescript
// lib/analytics/pod-performance.ts
export async function getPodPerformance(podId: string, sprintNumber: int) {
  const sprint = await getSprint(sprintNumber);

  const placements = await supabase
    .from('placements')
    .select('*')
    .eq('placed_by_pod_id', podId)
    .gte('created_at', sprint.start_date)
    .lte('created_at', sprint.end_date);

  const target = 2; // 2 placements per sprint
  const actual = placements.length;

  return {
    podId,
    sprintNumber,
    target,
    actual,
    performanceRate: (actual / target) * 100,
    status: actual >= target ? 'on_track' : 'below_target'
  };
}
```

#### 6. Productivity & Activity Tables

```sql
TABLE: voice_logs
├─ id (uuid, PK)
├─ employee_id (uuid, FK → employees.id)
├─ recorded_at (timestamp)
├─ audio_url (text) -- Supabase Storage path
├─ transcription (text)
├─ duration_seconds (int)
├─ created_at (timestamp)

TABLE: productivity_logs
├─ id (uuid, PK)
├─ employee_id (uuid, FK → employees.id)
├─ voice_log_id (uuid, FK → voice_logs.id, nullable)
├─ tasks_completed (jsonb array)
├─ current_task (text)
├─ blockers (jsonb array)
├─ clients_mentioned (jsonb array)
├─ metrics (jsonb)
│   -- {candidates_screened: 5, submissions: 3, ...}
├─ sentiment (text) -- "positive", "neutral", "frustrated"
├─ needs_help (boolean)
├─ logged_at (timestamp)
└─ created_at (timestamp)

TABLE: activity_logs
├─ id (uuid, PK)
├─ user_id (uuid, FK → profiles.id)
├─ entity_type (text) -- "job", "candidate", "placement", etc.
├─ entity_id (uuid)
├─ action (text) -- "created", "updated", "deleted", "viewed"
├─ changes (jsonb) -- before/after values
├─ ip_address (text)
├─ user_agent (text)
├─ created_at (timestamp)
```

**Voice Logging Flow:**
```
STEP 1: Employee records voice message in Slack
        └─> "Screened 5 candidates, 3 look promising..."

STEP 2: Slack webhook → Our API receives voice file

STEP 3: Upload to Supabase Storage
        ├─ Bucket: voice-logs
        ├─ Path: /2026/11/{employee_id}/{timestamp}.mp3
        └─ Cost: $0.01/month storage

STEP 4: Whisper API transcribes
        ├─ Input: Voice file (MP3)
        ├─ Output: "Screened 5 candidates, 3 look promising..."
        ├─ Cost: $0.006 per minute
        └─ Store in voice_logs.transcription

STEP 5: GPT-4o-mini structures data
        ├─ Input: Transcription text
        ├─ Output: {
        │     tasks_completed: ["Screened 5 candidates"],
        │     metrics: {candidates_screened: 5, submissions: 3},
        │     sentiment: "positive",
        │     needs_help: false
        │   }
        ├─ Cost: $0.00003
        └─ Store in productivity_logs table

STEP 6: Manager sees update in real-time dashboard
        └─> WebSocket push → UI updates instantly

Cost per voice message: $0.006 + $0.00003 = $0.00603
3 messages/day × 200 employees = 600 messages/day
Monthly cost: 600 × 30 × $0.00603 = $108.54/month
```

#### 7. Payment & Financial Tables

```sql
TABLE: invoices
├─ id (uuid, PK)
├─ client_id (uuid, FK → clients.id)
├─ placement_id (uuid, FK → placements.id, nullable)
├─ student_id (uuid, FK → students.id, nullable)
├─ invoice_number (text, unique)
├─ amount (numeric)
├─ status (text) -- "draft", "sent", "paid", "overdue", "canceled"
├─ due_date (date)
├─ paid_at (timestamp, nullable)
├─ payment_method (text)
├─ stripe_invoice_id (text, nullable)
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: commissions
├─ id (uuid, PK)
├─ employee_id (uuid, FK → employees.id)
├─ placement_id (uuid, FK → placements.id, nullable)
├─ lead_id (uuid, FK → leads.id, nullable)
├─ amount (numeric)
├─ commission_type (text) -- "placement", "referral", "attribution"
├─ status (text) -- "pending", "approved", "paid"
├─ paid_at (timestamp, nullable)
├─ created_at (timestamp)
```

**Commission Calculation:**
```typescript
// lib/finance/calculate-commission.ts
export async function calculateCommission(placementId: string) {
  const placement = await getPlacement(placementId);
  const employee = await getEmployee(placement.placed_by_recruiter_id);

  // Base commission: 15% of placement fee
  const baseCommission = placement.placement_fee * 0.15;

  // Bonus for academy graduate placement (we created the talent!)
  const consultant = await getConsultant(placement.consultant_id);
  const academyBonus = consultant.source === 'academy_graduate'
    ? placement.placement_fee * 0.05 // +5% bonus
    : 0;

  // Pod performance multiplier
  const pod = await getPod(employee.pod_id);
  const performanceMultiplier = pod.current_sprint_placements >= 2
    ? 1.10 // 10% bonus if pod hit target
    : 1.0;

  const totalCommission = (baseCommission + academyBonus) * performanceMultiplier;

  return {
    baseCommission,
    academyBonus,
    performanceMultiplier,
    totalCommission,
    breakdown: `$${baseCommission.toFixed(2)} base + $${academyBonus.toFixed(2)} academy × ${performanceMultiplier} performance = $${totalCommission.toFixed(2)}`
  };
}
```

#### 8. Cross-Border Tables

```sql
TABLE: immigration_cases
├─ id (uuid, PK)
├─ consultant_id (uuid, FK → consultants.id)
├─ client_id (uuid, FK → clients.id, nullable)
├─ case_type (text) -- "H1B", "LMIA", "work_permit", etc.
├─ source_country (text)
├─ destination_country (text)
├─ status (text)
│   -- "document_collection", "application_submitted",
│   -- "pending_approval", "approved", "rejected"
├─ lawyer_partner_id (uuid, nullable)
├─ application_submitted_date (date, nullable)
├─ approval_date (date, nullable)
├─ total_cost (numeric)
├─ cost_paid_by (text) -- "candidate", "client", "intime"
├─ timeline_days (int) -- actual days taken
├─ created_at (timestamp)
└─ updated_at (timestamp)

TABLE: immigration_documents
├─ id (uuid, PK)
├─ immigration_case_id (uuid, FK → immigration_cases.id)
├─ document_type (text) -- "passport", "degree", "IELTS", etc.
├─ file_url (text)
├─ status (text) -- "pending", "received", "verified", "missing"
├─ uploaded_at (timestamp)
└─ verified_at (timestamp, nullable)
```

**LMIA Timeline Tracking:**
```typescript
// lib/immigration/lmia-timeline.ts
export const LMIA_TIMELINE = {
  DAY_0: "Candidate identified",
  DAY_7: "Documents collected",
  DAY_14: "Recruitment report started",
  DAY_30: "Recruitment period completed (4 weeks)",
  DAY_45: "LMIA application submitted to ESDC",
  DAY_90: "LMIA approval received (45-day processing)",
  DAY_100: "Work permit issued, candidate arrival"
};

export async function trackImmigrationProgress(caseId: string) {
  const immigrationCase = await getImmigrationCase(caseId);
  const daysSinceStart = daysBetween(immigrationCase.created_at, new Date());

  // Determine current milestone
  const currentMilestone = Object.entries(LMIA_TIMELINE)
    .reverse()
    .find(([day, _]) => daysSinceStart >= parseInt(day.replace('DAY_', '')));

  // Calculate progress percentage
  const progressPercentage = (daysSinceStart / 100) * 100;

  return {
    daysSinceStart,
    currentMilestone: currentMilestone[1],
    progressPercentage: Math.min(progressPercentage, 100),
    expectedCompletionDate: addDays(immigrationCase.created_at, 100),
    isOnTrack: immigrationCase.status === expectedStatusForDay(daysSinceStart)
  };
}
```

### Database Indexes

**Critical Indexes for Performance:**
```sql
-- Consultants search (by skills, status)
CREATE INDEX idx_consultants_skills ON consultants USING GIN (skills);
CREATE INDEX idx_consultants_status ON consultants (current_status);
CREATE INDEX idx_consultants_source ON consultants (source);

-- Jobs search (by status, urgency, pod)
CREATE INDEX idx_jobs_status ON jobs (status);
CREATE INDEX idx_jobs_urgency ON jobs (urgency);
CREATE INDEX idx_jobs_pod ON jobs (assigned_pod_id);

-- Student progress (by student, lesson)
CREATE INDEX idx_student_progress_student ON student_progress (student_id);
CREATE INDEX idx_student_progress_lesson ON student_progress (lesson_id);
CREATE INDEX idx_student_progress_status ON student_progress (status);

-- Placements (by date, pod, recruiter)
CREATE INDEX idx_placements_date ON placements (created_at DESC);
CREATE INDEX idx_placements_pod ON placements (placed_by_pod_id);
CREATE INDEX idx_placements_recruiter ON placements (placed_by_recruiter_id);

-- Productivity logs (by employee, date)
CREATE INDEX idx_productivity_employee ON productivity_logs (employee_id);
CREATE INDEX idx_productivity_date ON productivity_logs (logged_at DESC);

-- Activity logs (for audit trail)
CREATE INDEX idx_activity_user ON activity_logs (user_id);
CREATE INDEX idx_activity_entity ON activity_logs (entity_type, entity_id);
CREATE INDEX idx_activity_date ON activity_logs (created_at DESC);
```

---

## Authentication & Authorization

### Row Level Security (RLS)

**RLS Philosophy: Database-Level Authorization**
- ✅ Can't bypass with API manipulation
- ✅ No accidental data leaks
- ✅ Multi-tenant ready (same tables, different access)
- ✅ Audit-friendly (policies in code)

#### RLS Policies for `jobs` Table

```sql
-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Policy 1: STUDENTS can't see jobs (yet)
CREATE POLICY "students_cannot_see_jobs" ON jobs
  FOR SELECT
  USING (
    NOT EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.roles @> '["student"]'
      AND NOT (profiles.roles && ARRAY['employee', 'recruiter'])
    )
  );

-- Policy 2: RECRUITERS see jobs assigned to their pod
CREATE POLICY "recruiters_see_their_pods_jobs" ON jobs
  FOR SELECT
  USING (
    assigned_pod_id IN (
      SELECT pod_id FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.status = 'active'
    )
  );

-- Policy 3: POD MANAGERS see all jobs for their pods
CREATE POLICY "managers_see_all_pod_jobs" ON jobs
  FOR SELECT
  USING (
    assigned_pod_id IN (
      SELECT id FROM pods
      WHERE pods.team_lead_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

-- Policy 4: CEO sees EVERYTHING
CREATE POLICY "ceo_sees_all_jobs" ON jobs
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.roles @> '["ceo"]'
    )
  );

-- Policy 5: CLIENTS see only THEIR jobs
CREATE POLICY "clients_see_their_jobs" ON jobs
  FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients
      WHERE clients.primary_contact_email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );
```

#### RLS Policies for `consultants` Table

```sql
ALTER TABLE consultants ENABLE ROW LEVEL SECURITY;

-- Policy 1: CONSULTANTS see only their own profile
CREATE POLICY "consultants_see_own_profile" ON consultants
  FOR SELECT
  USING (
    user_id = auth.uid()
  );

-- Policy 2: RECRUITERS see all consultants
CREATE POLICY "recruiters_see_all_consultants" ON consultants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.department IN ('recruiting', 'bench_sales', 'ta')
      AND employees.status = 'active'
    )
  );

-- Policy 3: CLIENTS see consultants submitted to their jobs
CREATE POLICY "clients_see_submitted_consultants" ON consultants
  FOR SELECT
  USING (
    id IN (
      SELECT consultant_id FROM job_submissions
      WHERE job_id IN (
        SELECT id FROM jobs
        WHERE client_id IN (
          SELECT id FROM clients
          WHERE primary_contact_email = (
            SELECT email FROM auth.users WHERE id = auth.uid()
          )
        )
      )
    )
  );
```

#### RLS Policies for `student_progress` Table

```sql
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;

-- Policy 1: STUDENTS see only their own progress
CREATE POLICY "students_see_own_progress" ON student_progress
  FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );

-- Policy 2: TRAINERS see all student progress
CREATE POLICY "trainers_see_all_progress" ON student_progress
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.user_id = auth.uid()
      AND employees.department = 'training'
      AND employees.status = 'active'
    )
  );

-- Policy 3: STUDENTS can update their own progress
CREATE POLICY "students_update_own_progress" ON student_progress
  FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE user_id = auth.uid()
    )
  );
```

#### RLS Policies for `productivity_logs` Table

```sql
ALTER TABLE productivity_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: EMPLOYEES see only their own logs
CREATE POLICY "employees_see_own_logs" ON productivity_logs
  FOR SELECT
  USING (
    employee_id IN (
      SELECT id FROM employees WHERE user_id = auth.uid()
    )
  );

-- Policy 2: POD MANAGERS see logs for their team
CREATE POLICY "managers_see_team_logs" ON productivity_logs
  FOR SELECT
  USING (
    employee_id IN (
      SELECT employees.id FROM employees
      JOIN pods ON employees.pod_id = pods.id
      WHERE pods.team_lead_id IN (
        SELECT id FROM employees WHERE user_id = auth.uid()
      )
    )
  );

-- Policy 3: CEO sees all logs
CREATE POLICY "ceo_sees_all_logs" ON productivity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.roles @> '["ceo"]'
    )
  );
```

**RLS in Practice (Frontend Code):**
```typescript
// Frontend code - RLS filters automatically!
// No manual filtering needed.

// Student viewing their progress
const { data } = await supabase
  .from('student_progress')
  .select('*')
  .eq('lesson_id', lessonId);
// Returns: Only THEIR progress (RLS filters automatically)

// Recruiter viewing jobs
const { data } = await supabase
  .from('jobs')
  .select('*')
  .eq('status', 'open');
// Returns: Only jobs assigned to THEIR pod (RLS filters automatically)

// Client viewing submitted candidates
const { data } = await supabase
  .from('job_submissions')
  .select('*, consultant:consultants(*)')
  .eq('job_id', jobId);
// Returns: Only submissions to THEIR jobs (RLS filters automatically)
```

---

## Real-Time Systems

### Supabase Realtime Architecture

**Why Real-Time:**
- Managers see employee activity instantly
- Recruiters track candidate pipeline live
- Celebrate placements in real-time (confetti! 🎉)
- Bench aging alerts (25 days = yellow, 28 = red)

### Tables with Real-Time Subscriptions

#### 1. Productivity Logs (Manager Dashboard)

```typescript
// components/dashboard/manager-activity-feed.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function ManagerActivityFeed({ podId }: { podId: string }) {
  const supabase = createClientComponentClient();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Get team member IDs for this pod
    const { data: teamMembers } = await supabase
      .from('employees')
      .select('id')
      .eq('pod_id', podId);

    const teamMemberIds = teamMembers.map(tm => tm.id);

    // Subscribe to productivity logs
    const channel = supabase
      .channel('productivity-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'productivity_logs',
          filter: `employee_id=in.(${teamMemberIds.join(',')})`
        },
        (payload) => {
          // New voice log! Update dashboard
          setActivities(prev => [payload.new, ...prev]);

          // Show toast if employee needs help
          if (payload.new.needs_help) {
            toast.warning(`⚠️ ${payload.new.employee_name} needs help!`);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [podId]);

  return (
    <div className="space-y-4">
      <h2>Team Activity (Live)</h2>
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
```

#### 2. Job Submissions (Recruiter Pipeline)

```typescript
// components/recruiting/job-pipeline.tsx
export function JobPipeline({ jobId }: { jobId: string }) {
  const supabase = createClientComponentClient();
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('job-submissions')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'job_submissions',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // New candidate submitted!
            setSubmissions(prev => [payload.new, ...prev]);
            toast.success(`🆕 New candidate: ${payload.new.consultant_name}`);
          }

          if (payload.eventType === 'UPDATE') {
            // Status changed (submitted → interview → offer)
            setSubmissions(prev =>
              prev.map(sub =>
                sub.id === payload.new.id ? payload.new : sub
              )
            );

            if (payload.new.status === 'interview_scheduled') {
              confetti(); // 🎉
            }
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [jobId]);

  return (
    <div className="pipeline">
      {submissions.map(sub => (
        <CandidateCard key={sub.id} submission={sub} />
      ))}
    </div>
  );
}
```

#### 3. Placements (Celebration!)

```typescript
// components/dashboard/placement-celebrations.tsx
export function PlacementCelebrations() {
  const supabase = createClientComponentClient();

  useEffect(() => {
    const channel = supabase
      .channel('placements')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'placements'
        },
        async (payload) => {
          // 🎉 NEW PLACEMENT!
          const placement = payload.new;
          const consultant = await getConsultant(placement.consultant_id);
          const client = await getClient(placement.client_id);

          // Show celebration animation
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 }
          });

          // Toast notification
          toast.success(
            `🎉 ${consultant.full_name} placed at ${client.company_name}!`,
            {
              duration: 10000, // 10 seconds
              icon: '🎊'
            }
          );

          // Play celebration sound
          const audio = new Audio('/sounds/celebration.mp3');
          audio.play();

          // Update pod metrics in real-time
          updatePodMetrics(placement.placed_by_pod_id);
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, []);

  return null; // This component only listens, doesn't render
}
```

#### 4. Bench Consultants (Aging Alerts)

```typescript
// components/bench/aging-alerts.tsx
export function BenchAgingAlerts({ podId }: { podId: string }) {
  const supabase = createClientComponentClient();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('bench-alerts')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bench_consultants',
          filter: `assigned_pod_id=eq.${podId}`
        },
        async (payload) => {
          const oldData = payload.old;
          const newData = payload.new;

          // 🟡 Yellow alert: 25 days on bench
          if (newData.days_on_bench >= 25 && !oldData.aging_alert_sent) {
            const consultant = await getConsultant(newData.consultant_id);

            toast.warning(
              `⚠️ ${consultant.full_name} at 25 days on bench (5 days left!)`,
              { duration: Infinity } // Don't auto-dismiss
            );

            setAlerts(prev => [...prev, {
              type: 'warning',
              consultantId: newData.consultant_id,
              daysRemaining: 5
            }]);
          }

          // 🔴 Red alert: 28 days on bench
          if (newData.days_on_bench >= 28 && !oldData.critical_alert_sent) {
            const consultant = await getConsultant(newData.consultant_id);

            toast.error(
              `🚨 URGENT: ${consultant.full_name} at 28 days - release in 2 days!`,
              {
                duration: Infinity,
                icon: '🚨'
              }
            );

            // Send SMS to pod manager
            await sendSMS({
              to: podManager.phone,
              message: `🚨 ${consultant.full_name} at 28 days on bench. Release in 2 days!`
            });
          }
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [podId]);

  return (
    <div className="alerts">
      {alerts.map(alert => (
        <AlertCard key={alert.consultantId} alert={alert} />
      ))}
    </div>
  );
}
```

#### 5. Cross-Pollination Leads

```typescript
// components/leads/lead-notifications.tsx
export function LeadNotifications({ podId, podType }: Props) {
  const supabase = createClientComponentClient();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    const channel = supabase
      .channel('leads-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `target_pod_id=eq.${podId}` // Leads sent TO my pod
        },
        async (payload) => {
          const lead = payload.new;

          // New lead from another pod!
          toast.info(
            `📩 New ${lead.lead_type} lead from ${lead.source_pod_type} pod`,
            {
              action: {
                label: 'View',
                onClick: () => router.push(`/leads/${lead.id}`)
              }
            }
          );

          setLeads(prev => [lead, ...prev]);

          // Play notification sound
          playSound('/sounds/new-lead.mp3');
        }
      )
      .subscribe();

    return () => channel.unsubscribe();
  }, [podId]);

  return (
    <LeadsList leads={leads} />
  );
}
```

### Real-Time Performance Optimization

**Best Practices:**
```typescript
// ✅ GOOD: Filter at database level
const channel = supabase
  .channel('my-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'productivity_logs',
    filter: `employee_id=in.(${myTeamIds.join(',')})` // ← Filter here!
  }, handleUpdate)
  .subscribe();

// ❌ BAD: Receive all updates, filter client-side
const channel = supabase
  .channel('my-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'productivity_logs'
    // No filter → receives ALL productivity logs (waste of bandwidth)
  }, (payload) => {
    if (myTeamIds.includes(payload.new.employee_id)) {
      handleUpdate(payload); // Too late, already received all data
    }
  })
  .subscribe();
```

**Throttling Updates:**
```typescript
// Prevent UI thrashing with too many updates
import { throttle } from 'lodash';

const handleUpdate = throttle((payload) => {
  setActivities(prev => [payload.new, ...prev]);
}, 1000); // Max 1 update per second

const channel = supabase
  .channel('updates')
  .on('postgres_changes', {...}, handleUpdate)
  .subscribe();
```

**Graceful Degradation:**
```typescript
// If WebSocket fails, fall back to polling
const [useRealtime, setUseRealtime] = useState(true);

useEffect(() => {
  if (useRealtime) {
    // Try WebSocket
    const channel = supabase
      .channel('updates')
      .on('postgres_changes', {...}, handleUpdate)
      .subscribe((status) => {
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // WebSocket failed, fall back to polling
          setUseRealtime(false);
        }
      });

    return () => channel.unsubscribe();
  } else {
    // Polling fallback (refresh every 5 seconds)
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('productivity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setActivities(data);
    }, 5000);

    return () => clearInterval(interval);
  }
}, [useRealtime]);
```

---

## Cross-Pollination Event Bus

### Architecture

**How It Works:**
1. Recruiter submits screening form (checks "Needs Training")
2. Server Action creates lead in `leads` table
3. PostgreSQL trigger fires → assigns target pod
4. Supabase Realtime broadcasts to subscribed clients
5. Training pod manager's dashboard receives notification instantly
6. Manager contacts candidate, enrolls them
7. Lead status updated to "converted"
8. Trigger fires → creates attribution commission for source recruiter

### Implementation

#### STEP 1: Recruiter Submits Form

```typescript
// app/recruiting/candidate-screen/actions.ts
'use server';

export async function screenCandidate(formData: FormData) {
  const candidateId = formData.get('candidate_id');
  const needsTraining = formData.get('needs_training') === 'true';
  const availableImmediately = formData.get('available_immediately') === 'true';
  const international = formData.get('international') === 'true';

  const supabase = createServerClient();

  // Update candidate status
  await supabase
    .from('consultants')
    .update({ screening_status: 'screened' })
    .eq('id', candidateId);

  // Check cross-pollination opportunities
  const crossPollinations = [];

  if (needsTraining) {
    crossPollinations.push({
      type: 'training',
      priority: 'high',
      notes: 'Candidate has experience but needs Guidewire certification'
    });
  }

  if (availableImmediately) {
    crossPollinations.push({
      type: 'recruiting',
      priority: 'high',
      notes: 'Available now for immediate placement'
    });
  }

  if (international) {
    crossPollinations.push({
      type: 'cross_border',
      priority: 'medium',
      notes: 'International candidate, may need visa sponsorship'
    });
  }

  // Create leads
  if (crossPollinations.length > 0) {
    await createCrossPollationLeads(candidateId, crossPollinations);
  }

  revalidatePath('/recruiting/candidates');
  return { success: true };
}
```

#### STEP 2: Create Leads in Database

```typescript
// lib/cross-pollination/create-leads.ts
async function createCrossPollationLeads(
  consultantId: string,
  opportunities: Array<{type: string, priority: string, notes: string}>
) {
  const supabase = createServerClient();
  const currentEmployee = await getCurrentEmployee();
  const currentPod = await getCurrentPod();

  for (const opp of opportunities) {
    const targetPodType = opp.type;

    // Create lead in database
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        source_pod_type: currentPod.type, // 'recruiting'
        source_pod_id: currentPod.id,
        source_employee_id: currentEmployee.id,
        target_pod_type: targetPodType,
        lead_type: 'candidate',
        consultant_id: consultantId,
        status: 'new',
        notes: opp.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create lead:', error);
      continue;
    }

    // Lead created! PostgreSQL trigger will handle the rest
  }
}
```

#### STEP 3: Database Trigger (Auto-Assignment)

```sql
-- Create function to notify on new lead
CREATE OR REPLACE FUNCTION notify_new_lead()
RETURNS TRIGGER AS $$
DECLARE
  target_pod_id uuid;
BEGIN
  -- Get target pod ID (first active pod of target type)
  SELECT id INTO target_pod_id
  FROM pods
  WHERE type = NEW.target_pod_type
    AND status = 'active'
  LIMIT 1;

  -- Update lead with target pod
  UPDATE leads
  SET target_pod_id = target_pod_id
  WHERE id = NEW.id;

  -- Notification happens automatically via Supabase Realtime
  -- (clients subscribed to 'leads' table will receive this)

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_lead_created
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_lead();
```

#### STEP 4: Training Pod Manager Receives Notification

```typescript
// app/training/dashboard/page.tsx
'use client';

export default function TrainingDashboard() {
  const supabase = createClientComponentClient();
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    // Subscribe to new leads sent to training pod
    const channel = supabase
      .channel('training-leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `target_pod_type=eq.training`
        },
        (payload) => {
          // NEW LEAD RECEIVED! 🎉
          console.log('New lead from', payload.new.source_pod_type, 'pod');

          // Show notification
          toast.success(`📩 New candidate lead from ${payload.new.source_pod_type} pod!`);

          // Add to leads list
          setLeads(prev => [payload.new, ...prev]);

          // Play notification sound
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return (
    <div>
      <h1>Training Pod Dashboard</h1>

      <section>
        <h2>New Leads (From Other Pods)</h2>
        {leads.map(lead => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onContact={() => handleContactLead(lead.id)}
          />
        ))}
      </section>
    </div>
  );
}
```

#### STEP 5: Manager Enrolls Candidate (Conversion)

```typescript
// components/leads/lead-card.tsx
async function enrollInAcademy(consultant: Consultant) {
  const supabase = createClientComponentClient();

  // Create student record
  const { data: student } = await supabase
    .from('students')
    .insert({
      user_id: consultant.user_id,
      enrollment_date: new Date().toISOString(),
      status: 'active',
      subscription_status: 'active'
    })
    .select()
    .single();

  // Update lead status to 'converted'
  await supabase
    .from('leads')
    .update({
      status: 'converted',
      conversion_value: 499 * 8 // 8 weeks × $499/month = $3,992
    })
    .eq('consultant_id', consultant.id)
    .eq('target_pod_type', 'training');

  toast.success(`${consultant.full_name} enrolled! Lead converted.`);
}
```

#### STEP 6: Attribution Commission (Auto-Created)

```sql
-- Trigger to update attribution when lead converts
CREATE OR REPLACE FUNCTION update_attribution_on_conversion()
RETURNS TRIGGER AS $$
BEGIN
  -- If lead status changed to 'converted'
  IF NEW.status = 'converted' AND OLD.status != 'converted' THEN
    -- Credit source employee with attribution revenue
    INSERT INTO commissions (
      employee_id,
      lead_id,
      amount,
      commission_type,
      status
    ) VALUES (
      NEW.source_employee_id,
      NEW.id,
      NEW.conversion_value * 0.15, -- 15% attribution
      'attribution',
      'approved'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_lead_converted
  AFTER UPDATE ON leads
  FOR EACH ROW
  WHEN (NEW.status = 'converted' AND OLD.status != 'converted')
  EXECUTE FUNCTION update_attribution_on_conversion();
```

**Complete Cross-Pollination Flow:**
```
1. Recruiter submits screening form ✅
   └─> Server Action receives form data

2. Server Action creates lead(s) in database ✅
   └─> INSERT into `leads` table

3. PostgreSQL trigger fires ✅
   └─> Assigns target_pod_id
   └─> Notifies via Supabase Realtime (automatic)

4. Training Pod dashboard listening via WebSocket ✅
   └─> Receives real-time notification
   └─> Shows new lead instantly

5. Training manager sees lead, contacts candidate ✅

6. If candidate converts (enrolls): ✅
   └─> Lead status updated to 'converted'
   └─> Trigger credits source employee with attribution bonus ($599)
   └─> Source recruiter sees commission in their dashboard

RESULT: Seamless cross-pollination with full attribution tracking! 🎯
```

---

## API Architecture

### Server Actions vs API Routes

**Philosophy: Server Actions for 95% of use cases**

#### When to Use Server Actions

```typescript
// File: app/recruiting/candidate/actions.ts
'use server';

export async function submitCandidateToJob(formData: FormData) {
  // ✅ USE SERVER ACTIONS FOR:

  // 1. CREATE operations
  const candidateId = formData.get('candidate_id');
  const jobId = formData.get('job_id');

  const { data, error } = await supabase
    .from('job_submissions')
    .insert({
      candidate_id: candidateId,
      job_id: jobId,
      submitted_by_id: (await getUser()).id,
      status: 'submitted'
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // 2. UPDATE operations
  await supabase
    .from('jobs')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', jobId);

  // 3. Complex business logic
  await checkCrossPollination(candidateId);
  await sendNotification(jobId, 'new_submission');

  // 4. Return result
  revalidatePath('/recruiting/jobs/' + jobId); // Refresh UI
  return { success: true };
}
```

**Use Server Actions for:**
- ✅ Form submissions (create student, submit candidate)
- ✅ CRUD operations (create, read, update, delete)
- ✅ Business logic (placement fee calculation)
- ✅ Database mutations (insert, update, delete)
- ✅ Simple data fetching (get user profile)

**Benefits:**
- Type-safe (TypeScript end-to-end)
- No API endpoint boilerplate
- Automatic security (runs on server)
- Direct database access
- Easy to test

#### When to Use API Routes

```typescript
// File: app/api/webhooks/stripe/route.ts

export async function POST(request: Request) {
  // ✅ USE API ROUTES FOR:

  // 1. WEBHOOKS (third-party services calling us)
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'customer.subscription.updated') {
    // Handle subscription change
    await updateStudentSubscription(event.data.object);
  }

  return Response.json({ received: true });
}
```

**Use API Routes for:**
- ✅ Webhooks (Stripe payments, Slack integrations)
- ✅ Public APIs (if exposing data to third-parties)
- ✅ File uploads (multipart/form-data)
- ✅ Custom response headers (CORS, caching)
- ✅ Streaming responses (real-time data, SSE)
- ✅ Rate limiting (public endpoints)

**Decision Matrix:**

| Use Case | Server Action or API Route? |
|----------|---------------------------|
| Create student account | Server Action |
| Submit candidate to job | Server Action |
| Update productivity log | Server Action |
| Stripe payment webhook | API Route |
| Slack slash command | API Route |
| Upload resume file | API Route (or Server Action with FormData) |
| AI screening (internal) | Server Action |
| Public candidate search | API Route (if exposed) |
| Real-time updates | Supabase Realtime (neither!) |

### API Error Handling

```typescript
// lib/api/error-handler.ts
import { ZodError } from 'zod';

export function handleAPIError(error: unknown) {
  // Zod validation error
  if (error instanceof ZodError) {
    return {
      success: false,
      error: 'Validation failed',
      details: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    };
  }

  // Supabase error
  if (error?.code) {
    return {
      success: false,
      error: 'Database error',
      code: error.code,
      message: error.message
    };
  }

  // Generic error
  return {
    success: false,
    error: 'Internal server error',
    message: error?.message || 'Unknown error'
  };
}
```

**Usage in Server Actions:**
```typescript
'use server';

export async function createStudent(formData: FormData) {
  try {
    // Validate input
    const data = StudentSchema.parse({
      fullName: formData.get('full_name'),
      email: formData.get('email'),
      phone: formData.get('phone')
    });

    // Insert into database
    const { data: student, error } = await supabase
      .from('students')
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: student };
  } catch (error) {
    return handleAPIError(error);
  }
}
```

---

## State Management

### Zustand for Client-Side State

**What to Store in Zustand:**

#### 1. Current Pod Context (for managers)

```typescript
// lib/stores/pod-store.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';

interface PodState {
  currentPodId: string | null;
  currentPod: Pod | null;
  setCurrentPod: (podId: string) => Promise<void>;
}

export const usePodStore = create<PodState>()(
  persist(
    (set) => ({
      currentPodId: null,
      currentPod: null,
      setCurrentPod: async (podId) => {
        const pod = await fetchPod(podId);
        set({ currentPodId: podId, currentPod: pod });
      }
    }),
    {
      name: 'pod-storage' // LocalStorage key
    }
  )
);
```

#### 2. Dashboard Filters

```typescript
// lib/stores/dashboard-store.ts
import create from 'zustand';
import { subDays } from 'date-fns';

interface DashboardState {
  dateRange: { start: Date; end: Date };
  roleFilter: string[];
  searchQuery: string;
  setDateRange: (range: { start: Date; end: Date }) => void;
  setRoleFilter: (roles: string[]) => void;
  setSearchQuery: (query: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dateRange: { start: subDays(new Date(), 30), end: new Date() },
  roleFilter: [],
  searchQuery: '',
  setDateRange: (range) => set({ dateRange: range }),
  setRoleFilter: (roles) => set({ roleFilter: roles }),
  setSearchQuery: (query) => set({ searchQuery: query })
}));
```

#### 3. UI State

```typescript
// lib/stores/ui-store.ts
interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  modalOpen: string | null;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  modalOpen: null,
  openModal: (modalId) => set({ modalOpen: modalId }),
  closeModal: () => set({ modalOpen: null })
}));
```

#### 4. Multi-Step Form State

```typescript
// lib/stores/candidate-form-store.ts
interface CandidateFormState {
  step: number;
  formData: Partial<Candidate>;
  setStep: (step: number) => void;
  updateFormData: (data: Partial<Candidate>) => void;
  resetForm: () => void;
}

export const useCandidateFormStore = create<CandidateFormState>((set) => ({
  step: 1,
  formData: {},
  setStep: (step) => set({ step }),
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),
  resetForm: () => set({ step: 1, formData: {} })
}));
```

**What NOT to Store in Zustand:**

| Data | Where to Store | Why |
|------|---------------|-----|
| User auth | Supabase Auth | Built-in session management |
| Database data | React Query | Cache, refetch, invalidation |
| Real-time data | Supabase Realtime | WebSocket subscriptions |
| Form state (simple) | React useState | No need for global |
| URL state | Next.js router | Shareable, bookmarkable |

---

## File Storage Strategy

### Storage Breakdown

#### 1. Training Videos (73GB)

```
Storage: Supabase Storage (with CDN)
Path: /videos/{course_id}/{lesson_id}.mp4
Access: Public (with signed URLs for students only)

Cost calculation:
├─ Storage: 73GB × $0.021/GB = $1.53/month
├─ Transfer: 1,000 students × 10 videos/month × 500MB avg = 5TB
│   • First 2GB free
│   • 5,000GB × $0.09/GB = $450/month (😱 expensive!)
│
└─ OPTIMIZATION:
    • Use adaptive bitrate (HLS) - reduces transfer by 40%
    • 5TB × 0.6 = 3TB × $0.09 = $270/month
    • OR use dedicated video CDN:
      - Cloudflare Stream: $1/1,000 min watched = ~$50/month for 1,000 students
      - Mux: $0.05/GB delivered = 3TB × $0.05 = $150/month

RECOMMENDATION:
Year 1: Supabase Storage ($270/month) - simpler
Year 2: Migrate to Cloudflare Stream ($50/month) - 5× cheaper at scale
```

**Signed URL Implementation:**
```typescript
// lib/storage/get-video-url.ts
export async function getVideoURL(lessonId: string, studentId: string) {
  // Verify student has access to this lesson
  const canAccess = await canAccessLesson(studentId, lessonId);

  if (!canAccess.allowed) {
    throw new Error(canAccess.reason);
  }

  const lesson = await getLesson(lessonId);

  // Generate signed URL (expires in 1 hour)
  const { data, error } = await supabase.storage
    .from('videos')
    .createSignedUrl(lesson.video_url, 3600); // 1 hour

  if (error) throw error;

  return data.signedUrl;
}
```

#### 2. Resume Files

```
Storage: Supabase Storage
Path: /resumes/{candidate_id}/{timestamp}.pdf
Access: Private (only recruiters and candidate)
Retention: Indefinite (until candidate requests deletion)

Size estimate:
├─ Average resume: 500KB
├─ 1,000 candidates/year × 500KB = 500MB/year
├─ Storage cost: 0.5GB × $0.021 = $0.01/month (negligible!)
└─ Transfer: Minimal (resumes downloaded rarely)

RECOMMENDATION: Supabase Storage (default)
```

**Resume Upload:**
```typescript
// app/recruiting/candidates/upload-resume/actions.ts
'use server';

export async function uploadResume(formData: FormData) {
  const file = formData.get('resume') as File;
  const candidateId = formData.get('candidate_id') as string;

  // Validate file
  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  if (file.size > 5 * 1024 * 1024) { // 5MB max
    return { success: false, error: 'File too large (max 5MB)' };
  }

  if (!file.type.includes('pdf') && !file.type.includes('doc')) {
    return { success: false, error: 'Only PDF or DOC files allowed' };
  }

  // Upload to Supabase Storage
  const fileName = `${candidateId}/${Date.now()}.pdf`;

  const { data, error } = await supabase.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    return { success: false, error: error.message };
  }

  // Update candidate record with resume URL
  await supabase
    .from('consultants')
    .update({ resume_url: data.path })
    .eq('id', candidateId);

  return { success: true, url: data.path };
}
```

#### 3. Voice Message Recordings

```
Storage: Supabase Storage
Path: /voice-logs/{employee_id}/{date}/{timestamp}.mp3
Access: Private (only employee and their manager)
Retention: 90 days (then auto-delete via lifecycle policy)

Size estimate:
├─ Average voice message: 1MB (60 seconds)
├─ 200 employees × 3 messages/day × 1MB = 600MB/day
├─ 90-day retention: 600MB × 90 = 54GB
├─ Storage cost: 54GB × $0.021 = $1.13/month
└─ Transfer: Minimal (managers listen occasionally)

RECOMMENDATION: Supabase Storage with auto-deletion
```

**Auto-Cleanup (PostgreSQL Cron):**
```sql
-- Delete voice files older than 90 days (runs daily at 2 AM)
SELECT cron.schedule(
  'cleanup-old-voice-files',
  '0 2 * * *', -- 2 AM daily
  $$
  DELETE FROM storage.objects
  WHERE bucket_id = 'voice-logs'
  AND created_at < NOW() - INTERVAL '90 days'
  $$
);
```

#### 4. Screenshots (Productivity Tracking)

```
Storage: Supabase Storage
Path: /screenshots/{employee_id}/{date}/{timestamp}.jpg
Access: Private (only employee and manager)
Retention: Immediate deletion after AI analysis

OPTIMIZATION:
├─ Process & delete strategy (not store)
├─ Screenshot taken → Upload → AI analyzes → Delete image
├─ Store only text summary (1KB vs 200KB = 99.5% savings!)
└─ Cost: $0.12/month instead of $24/month (200× cheaper!)

RECOMMENDATION: Process & delete (keep only text summaries)
```

**Screenshot Processing Pipeline:**
```typescript
// lib/productivity/process-screenshot.ts
export async function processScreenshot(file: File, employeeId: string) {
  // 1. Upload to temp storage
  const tempPath = `temp/${employeeId}/${Date.now()}.jpg`;
  await supabase.storage
    .from('screenshots')
    .upload(tempPath, file, { upsert: false });

  // 2. Get signed URL for AI processing
  const { data } = await supabase.storage
    .from('screenshots')
    .createSignedUrl(tempPath, 300); // 5 min expiry

  // 3. AI analyzes screenshot
  const analysis = await analyzeScreenshot(data.signedUrl);
  // Returns: {
  //   application: "Microsoft Excel",
  //   activity: "Working on Q4 financial report",
  //   category: "productive",
  //   confidence: 0.92
  // }

  // 4. Save text summary to database
  await supabase
    .from('productivity_logs')
    .insert({
      employee_id: employeeId,
      logged_at: new Date().toISOString(),
      current_task: analysis.activity,
      metrics: { application: analysis.application }
    });

  // 5. Delete screenshot immediately
  await supabase.storage
    .from('screenshots')
    .remove([tempPath]);

  return { success: true, analysis };
}
```

### Total Storage Costs

| Item | Storage | Transfer | Total/Month |
|------|---------|----------|-------------|
| Training videos | $1.53 | $270 | $271.53 |
| Resumes | $0.01 | $0 | $0.01 |
| Voice logs | $1.13 | $0 | $1.13 |
| Screenshots (optimized) | $0.01 | $0 | $0.01 |
| **TOTAL** | **$2.68** | **$270** | **$272.68/month** |

**At scale: ~$273/month = $3,276/year**

**Year 2 Optimization (Cloudflare Stream for videos):**
- Save $220/month on video transfer
- **New total: $52/month = $624/year** 🎯

---

## Third-Party Integrations

### Email (Resend)

```typescript
// lib/email.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Transactional Emails
export async function sendTransactionalEmail(
  type: string,
  to: string,
  data: any
) {
  const templates = {
    signup_confirmation: {
      subject: 'Welcome to InTime! 🎉',
      html: `<h1>Welcome ${data.name}!</h1>...`
    },
    password_reset: {
      subject: 'Reset your password',
      html: `<p>Click here: ${data.resetLink}</p>`
    },
    placement_confirmed: {
      subject: 'Placement Confirmed! 🎉',
      html: `<h1>Congrats ${data.candidateName}!</h1>...`
    }
  };

  const template = templates[type];

  await resend.emails.send({
    from: 'InTime <noreply@intimeesolutions.com>',
    to,
    subject: template.subject,
    html: template.html
  });
}

// 2. Marketing Emails (Newsletters, Drip Campaigns)
export async function sendMarketingEmail(audienceId: string, campaign: any) {
  await resend.broadcasts.send({
    audience_id: audienceId,
    subject: campaign.subject,
    html: campaign.html,
    from: 'InTime Academy <marketing@intimeesolutions.com>'
  });
}

// Cost: $0.10/1,000 emails
// Year 1 estimate: 50,000 emails = $5/month
```

### SMS (Twilio)

```typescript
// lib/sms.ts
import twilio from 'twilio';
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 1. 2FA (Two-Factor Authentication)
export async function send2FA(phone: string, code: string) {
  await client.messages.create({
    body: `Your InTime verification code is: ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
}

// 2. Interview Reminders
export async function sendInterviewReminder(
  candidatePhone: string,
  details: InterviewDetails
) {
  await client.messages.create({
    body: `Reminder: Interview with ${details.client} tomorrow at ${details.time}. Good luck!`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: candidatePhone
  });
}

// 3. Critical Alerts (Bench consultant 30-day mark)
export async function sendCriticalAlert(managerPhone: string, alert: Alert) {
  await client.messages.create({
    body: `🚨 URGENT: ${alert.message}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: managerPhone
  });
}

// Cost: $0.0079/SMS (US)
// Year 1 estimate: 1,000 SMS = $8/month
```

### Calendar (Google Calendar API)

```typescript
// lib/calendar.ts
import { google } from 'googleapis';

const calendar = google.calendar({
  version: 'v3',
  auth: process.env.GOOGLE_CALENDAR_API_KEY
});

// Schedule Interview
export async function scheduleInterview(details: InterviewDetails) {
  const event = {
    summary: `Interview: ${details.candidateName} - ${details.role}`,
    start: { dateTime: details.startTime },
    end: { dateTime: details.endTime },
    attendees: [
      { email: details.candidateEmail },
      { email: details.clientEmail },
      { email: details.recruiterEmail }
    ],
    conferenceData: {
      createRequest: { requestId: crypto.randomUUID() }
    }
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1
  });

  return response.data; // Includes Google Meet link
}

// Cost: Free (Google Calendar API)
```

### Payment Processing (Stripe)

```typescript
// lib/stripe.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Student Subscriptions ($499/month recurring)
export async function createSubscription(
  customerId: string,
  priceId: string
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent']
  });

  return subscription;
}

// 2. Client Invoicing (placement fees)
export async function createInvoice(
  clientId: string,
  amount: number,
  description: string
) {
  const invoice = await stripe.invoices.create({
    customer: clientId,
    description,
    collection_method: 'send_invoice',
    days_until_due: 30
  });

  await stripe.invoiceItems.create({
    customer: clientId,
    amount: amount * 100, // cents
    currency: 'usd',
    description,
    invoice: invoice.id
  });

  await stripe.invoices.finalizeInvoice(invoice.id);

  return invoice;
}

// Cost: 2.9% + $0.30 per transaction
// Year 1: $2.95M revenue → ~$85K in Stripe fees (~3%)
```

### LinkedIn Automation

```
OPTION 1: LinkedIn Recruiter API
├─ Cost: $120/month per seat
├─ Official, compliant
└─ Best for: Year 2+ (when budget allows)

OPTION 2: Phantombuster
├─ Cost: $69/month
├─ Safe, reliable automation
├─ Legal gray area (not official API)
└─ Best for: Year 1 (bootstrap phase)

OPTION 3: RapidAPI LinkedIn Scraper
├─ Cost: $50/month
├─ Cheapest option
├─ Against LinkedIn ToS (risk of account ban)
└─ Best for: Testing only (not production)

RECOMMENDATION:
Year 1: Phantombuster ($69/month)
Year 2: LinkedIn Recruiter API ($120/month)
```

### Summary of Third-Party Costs

| Service | Purpose | Cost/Month | Cost/Year |
|---------|---------|------------|-----------|
| Resend | Email (transactional, marketing) | $5 | $60 |
| Twilio | SMS (2FA, alerts) | $8 | $96 |
| Google Calendar | Interview scheduling | $0 | $0 |
| Phantombuster | LinkedIn automation | $69 | $828 |
| Stripe | Payment processing | $7,129 | $85,548 |
| RapidAPI | LinkedIn scraping (backup) | $50 | $600 |
| Supabase | Database, auth, storage | $100 | $1,200 |
| Vercel | Hosting | $50 | $600 |
| OpenAI | AI (GPT-4o, Whisper) | $350 | $4,200 |
| **TOTAL** | | **$7,761** | **$93,132** |

**As % of revenue: $93K / $2.95M = 3.2%** (very lean!)

---

## AI Model Selection

### Model Decision Framework

**11 AI Use Cases → Specific Models:**

| Use Case | Model | Why | Cost/Request |
|----------|-------|-----|--------------|
| **Socratic student mentor** | GPT-4o-mini | Cost-effective, conversational | $0.0006 |
| **Resume generation** | GPT-4o | Professional writing quality | $0.03 |
| **JD parsing** | GPT-4o-mini | Simple extraction | $0.001 |
| **Candidate scoring** | GPT-4o-mini | Pattern matching | $0.0005 |
| **Voice transcription** | Whisper | Best accuracy | $0.006/min |
| **Screenshot analysis** | GPT-4o-mini vision | Image understanding | $0.0015 |
| **CEO insights** | Claude Sonnet 4 | Strategic reasoning | $0.15 |
| **Email drafting** | GPT-4o-mini | Good enough, fast | $0.002 |
| **Cross-pollination detection** | GPT-4o-mini | Classification | $0.0005 |
| **Contract review** | Claude Opus | Legal nuance | $0.75 |
| **Multi-model orchestration** | GPT-4o | Meta-reasoning | $0.05 |

### Rationale for Each Model

#### 1. Socratic Student Mentor (GPT-4o-mini)

**Why GPT-4o-mini:**
- Need: Conversational, patient, guides not tells
- Volume: 100K+ interactions/month, cost matters
- Why not Sonnet: 5× more expensive, no improvement for student Q&A

**Cost at scale:**
```
1,000 students × 30 interactions/month × $0.0006 = $18/month
```

**Example:**
```typescript
// lib/ai/socratic-mentor.ts
export async function askMentor(question: string, lessonContext: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a Socratic mentor teaching Guidewire.
                  Guide students with questions, don't give answers.
                  Context: ${lessonContext}`
      },
      { role: 'user', content: question }
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content;
}
```

#### 2. Resume Generation (GPT-4o)

**Why GPT-4o:**
- Need: Professional writing, persuasive, formatted
- Quality matters: Resume determines interview chances!
- Why not mini: Too important to cheap out

**Cost:**
```
100 resumes/month × $0.03 = $3/month (worth it!)
```

**Example:**
```typescript
// lib/ai/generate-resume.ts
export async function generateResume(candidate: Candidate) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an expert resume writer for Guidewire consultants.
                  Create a compelling resume optimized for ATS systems.`
      },
      {
        role: 'user',
        content: `Create resume for:
                  Name: ${candidate.fullName}
                  Skills: ${candidate.skills.join(', ')}
                  Experience: ${candidate.yearsExperience} years
                  Projects: ${JSON.stringify(candidate.projects)}`
      }
    ],
    temperature: 0.8
  });

  return response.choices[0].message.content;
}
```

#### 3. CEO Insights Generation (Claude Sonnet 4)

**Why Claude Sonnet 4:**
- Need: Strategic analysis, "what should we focus on?"
- Best reasoning: Sees patterns GPT misses
- Frequency: Once daily (not per-request)

**Cost:**
```
1 report/day × $0.15 × 30 = $4.50/month (worth every penny!)
```

**Example:**
```typescript
// lib/ai/ceo-insights.ts
export async function generateCEOInsights(metrics: DailyMetrics) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyze today's business metrics and provide strategic insights:

        Placements: ${metrics.placements}
        Bench aging: ${metrics.benchAging}
        Student progress: ${metrics.studentProgress}
        Revenue: ${metrics.revenue}

        Focus on:
        1. What's working well?
        2. What needs immediate attention?
        3. Strategic recommendation for tomorrow?`
      }
    ]
  });

  return response.content[0].text;
}
```

### Total AI Costs (Verified)

| Category | Models Used | Monthly Cost |
|----------|-------------|--------------|
| Academy (1,000 students) | GPT-4o-mini | $18 |
| Recruiting automation | GPT-4o-mini, GPT-4o | $30 |
| Productivity tracking | Whisper, GPT-4o-mini | $306 |
| Strategic insights | Claude Sonnet 4 | $5 |
| Misc (email, scoring) | GPT-4o-mini | $10 |
| **TOTAL** | | **$369/month** |

**User's original estimate: $350/month ✓ (Spot on!)**

---

## Performance & Scalability

### Performance Targets

**Page Load Times:**
- Homepage: <1 second
- Dashboard: <2 seconds
- Student portal: <1.5 seconds

**Database Queries:**
- Simple queries: <50ms
- Complex joins: <200ms
- Aggregations: <500ms

**API Response Times:**
- Server Actions: <100ms
- File uploads: <2 seconds (for 5MB file)
- AI operations: <3 seconds

### Caching Strategy

```typescript
// lib/cache/redis-cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN
});

// Cache expensive queries
export async function getCachedPodPerformance(podId: string) {
  const cacheKey = `pod-performance:${podId}`;

  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return cached;

  // If not cached, compute
  const performance = await computePodPerformance(podId);

  // Cache for 5 minutes
  await redis.set(cacheKey, performance, { ex: 300 });

  return performance;
}
```

### Database Connection Pooling

```typescript
// lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      pooler: {
        connectionString: process.env.SUPABASE_POOLER_URL,
        poolMode: 'transaction' // More connections (recommended for serverless)
      }
    }
  }
);
```

### Scaling Plan

**Year 1 (1,000 users):**
- Supabase Free Tier → Pro ($25/month)
- Vercel Hobby → Pro ($20/month)
- Single region deployment (US East)

**Year 2 (5,000 users):**
- Supabase Pro → Team ($599/month)
- Vercel Pro → Enterprise ($custom)
- Multi-region deployment (US, EU)
- Redis caching (Upstash)

**Year 3 (20,000 users):**
- Supabase Enterprise (custom pricing)
- Dedicated database (RDS PostgreSQL)
- CDN for global assets
- Read replicas for analytics

---

## Security & Compliance

### Security Checklist

**✅ Database Security:**
- RLS enabled on ALL tables
- Soft deletes for critical data
- Audit trails (activity_logs)
- Foreign key constraints
- Encrypted at rest (Supabase default)

**✅ Authentication:**
- JWT tokens (Supabase Auth)
- Password requirements (min 8 chars, special char)
- 2FA optional (Twilio SMS)
- Session timeout (24 hours)

**✅ API Security:**
- Rate limiting (100 req/min per IP)
- CORS configuration
- API keys in environment variables
- No secrets in client code

**✅ Data Privacy:**
- GDPR compliance (right to deletion)
- Data encryption in transit (HTTPS)
- PII anonymization in logs
- Consent tracking

**✅ File Security:**
- Signed URLs (time-limited access)
- File type validation
- Size limits (5MB resumes, 100MB videos)
- Virus scanning (ClamAV)

### Compliance

**GDPR:**
- User data export (JSON format)
- Right to be forgotten (soft delete)
- Consent tracking
- Data retention policies

**SOC 2:**
- Audit trails
- Access controls (RLS)
- Encryption (TLS 1.3)
- Incident response plan

---

## Cost Analysis

### Monthly Costs (Year 1)

| Category | Service | Cost |
|----------|---------|------|
| **Infrastructure** | |
| Database & Auth | Supabase Pro | $100 |
| Hosting | Vercel Pro | $50 |
| CDN | Vercel (included) | $0 |
| **Storage** | |
| Video CDN | Supabase | $270 |
| Files | Supabase (included) | $0 |
| **Third-Party** | |
| Email | Resend | $5 |
| SMS | Twilio | $8 |
| LinkedIn | Phantombuster | $69 |
| Payments | Stripe | $7,129 |
| **AI** | |
| OpenAI | GPT-4o, Whisper | $350 |
| Anthropic | Claude Sonnet 4 | $5 |
| **Monitoring** | |
| Error tracking | Sentry | $0 (free tier) |
| Analytics | Vercel (included) | $0 |
| **TOTAL** | | **$7,986/month** |

**Annual: $95,832**
**As % of revenue: $96K / $2.95M = 3.25%** ✅

---

## Conclusion

This technology architecture provides:

✅ **Scalability**: Supports 1,000 → 10,000+ users without major refactoring
✅ **Security**: Database-level RLS, encrypted data, audit trails
✅ **Performance**: <2s page loads, real-time updates, optimized queries
✅ **Cost-Efficiency**: 3.25% of revenue in tech costs
✅ **Developer Experience**: Type-safe, modern stack, clear patterns

**Living Document**: This architecture evolves with the business. Update quarterly.

---

**Last Updated:** 2025-11-17
**Next Review:** 2026-02-17
**Owner:** Founder + CTO
