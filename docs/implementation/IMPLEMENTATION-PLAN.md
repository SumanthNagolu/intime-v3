# InTime: Implementation Plan

## Unified Desktop Platform Transformation

**Duration:** 16 weeks (4 phases)
**Goal:** Transform InTime from a Guidewire-inspired web app to a unified desktop platform

---

## Phase Overview

| Phase | Duration | Focus | Key Deliverables |
|-------|----------|-------|------------------|
| **Phase 1** | Weeks 1-4 | Foundation | Unified Inbox, Context Panel, Workflow Guide |
| **Phase 2** | Weeks 5-8 | Communications | Email, Calendar, Communication Context |
| **Phase 3** | Weeks 9-12 | Desktop & Phone | Tauri Shell, Phone Integration, Global Shortcuts |
| **Phase 4** | Weeks 13-16 | Intelligence | AI Assistant, Smart Suggestions, Predictive Features |

---

# Phase 1: Foundation (Weeks 1-4)

## Objective
Create the core unified experience layer that makes InTime feel like one living workspace.

---

## Week 1: Design System Convergence & Unified Inbox Structure

### 1.1 Design System Finalization
**Owner:** Frontend Lead
**Deliverable:** Unified V4 design system

**Tasks:**
- [ ] Audit V4 components vs main app components
- [ ] Create unified component mapping document
- [ ] Migrate remaining components to V4 patterns
- [ ] Update Tailwind config with final design tokens
- [ ] Create component storybook documentation

**Files to modify:**
- `src/components/v4/` - Finalize all V4 components
- `tailwind.config.ts` - Finalize design tokens
- `src/components/ui/` - Deprecate conflicting components

### 1.2 Unified Inbox Database Schema
**Owner:** Backend Lead
**Deliverable:** Database schema for unified inbox

**New tables:**
```sql
-- Unified inbox items (work queue)
CREATE TABLE inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- What type of item
  item_type TEXT NOT NULL, -- 'task', 'follow_up', 'approval', 'alert', 'mention'

  -- Source entity
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Display
  title TEXT NOT NULL,
  subtitle TEXT,
  priority TEXT NOT NULL DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'

  -- Timing
  due_at TIMESTAMPTZ,
  snoozed_until TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'dismissed'
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX inbox_items_user_pending ON inbox_items(user_id, status, due_at)
  WHERE status IN ('pending', 'in_progress');

-- Inbox item sources (what creates inbox items)
CREATE TABLE inbox_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  source_type TEXT NOT NULL, -- 'activity', 'workflow_approval', 'sla_alert', 'mention', 'assignment'
  source_id UUID NOT NULL,
  inbox_item_id UUID NOT NULL REFERENCES inbox_items(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Design inbox_items schema
- [ ] Design inbox_sources schema
- [ ] Create migration in Supabase
- [ ] Run `pnpm db:introspect`
- [ ] Add Drizzle schema types

### 1.3 Unified Inbox API
**Owner:** Backend Lead
**Deliverable:** tRPC router for unified inbox

**New file:** `src/server/routers/inbox.ts`

```typescript
// Router structure
export const inboxRouter = router({
  // Get inbox items for current user
  list: orgProtectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'in_progress', 'completed', 'all']).optional(),
      type: z.enum(['task', 'follow_up', 'approval', 'alert', 'mention', 'all']).optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent', 'all']).optional(),
      dueBy: z.enum(['overdue', 'today', 'this_week', 'all']).optional(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => { /* ... */ }),

  // Get counts by type/priority
  counts: orgProtectedProcedure.query(async ({ ctx }) => { /* ... */ }),

  // Mark item as in_progress
  start: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Mark item as completed
  complete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Dismiss item
  dismiss: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Snooze item
  snooze: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid(), until: z.date() }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),

  // Bulk actions
  bulkComplete: orgProtectedProcedure
    .input(z.object({ ids: z.array(z.string().uuid()) }))
    .mutation(async ({ ctx, input }) => { /* ... */ }),
})
```

**Tasks:**
- [ ] Create `src/server/routers/inbox.ts`
- [ ] Implement list with filtering and pagination
- [ ] Implement counts aggregation
- [ ] Implement status mutations
- [ ] Implement snooze functionality
- [ ] Implement bulk actions
- [ ] Add to main router
- [ ] Write unit tests

---

## Week 2: Unified Inbox UI & Context Panel Foundation

### 2.1 Unified Inbox View
**Owner:** Frontend Lead
**Deliverable:** Inbox page as the new home view

**New files:**
- `src/app/employee/inbox/page.tsx`
- `src/components/inbox/InboxView.tsx`
- `src/components/inbox/InboxItem.tsx`
- `src/components/inbox/InboxFilters.tsx`
- `src/components/inbox/InboxGrouping.tsx`

**InboxView design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Inbox                                          [Filter ▼] [⋮]  │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ OVERDUE (3)                                                 │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Follow up: Sarah Chen → Acme Corp                       │ │
│ │    Submission sent 3 days ago • No response                 │ │
│ │    [Call] [Email] [Snooze] [Complete]                       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ⚠️ Approval needed: Rate exception                         │ │
│ │    Mike Johnson • $95/hr (above band)                       │ │
│ │    [Approve] [Reject] [View Details]                        │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TODAY (5)                                                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 📋 Prep call: John Smith                                    │ │
│ │    Interview tomorrow at 2pm • Acme Corp                    │ │
│ │    [Start Call] [Reschedule] [View Profile]                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Create inbox page route
- [ ] Build InboxView component with virtualized list
- [ ] Build InboxItem component with actions
- [ ] Build InboxFilters component
- [ ] Build InboxGrouping (by due date, type, priority)
- [ ] Implement click → opens entity in split view
- [ ] Implement keyboard navigation (j/k, Enter)
- [ ] Add loading and empty states

### 2.2 Context Panel Foundation
**Owner:** Frontend Lead
**Deliverable:** Right sidebar context panel component

**New files:**
- `src/components/context-panel/ContextPanel.tsx`
- `src/components/context-panel/ContextPanelProvider.tsx`
- `src/components/context-panel/EntityContext.tsx`
- `src/components/context-panel/RecentActivity.tsx`
- `src/components/context-panel/QuickActions.tsx`

**Context state:**
```typescript
// src/stores/context-panel-store.ts
interface ContextPanelState {
  // Current context
  entityType: string | null
  entityId: string | null

  // Panel state
  isOpen: boolean
  width: number

  // History (for back navigation)
  history: Array<{ entityType: string; entityId: string }>

  // Actions
  setContext: (type: string, id: string) => void
  clearContext: () => void
  goBack: () => void
  togglePanel: () => void
  setWidth: (width: number) => void
}
```

**Tasks:**
- [ ] Create context panel store (Zustand)
- [ ] Build ContextPanel wrapper component
- [ ] Build ContextPanelProvider for layout
- [ ] Build EntityContext component (shows entity details)
- [ ] Build RecentActivity component
- [ ] Build QuickActions component
- [ ] Integrate into main layout
- [ ] Make panel resizable
- [ ] Add collapse/expand toggle

### 2.3 Inbox Item Creation Triggers
**Owner:** Backend Lead
**Deliverable:** Automatic inbox item creation from existing systems

**Triggers to implement:**
```typescript
// Events that create inbox items
const INBOX_TRIGGERS = {
  // Activities
  'activity.assigned': (activity) => ({
    item_type: 'task',
    entity_type: activity.entity_type,
    entity_id: activity.entity_id,
    title: activity.subject,
    due_at: activity.due_date,
    priority: activity.priority,
  }),

  // Workflow approvals
  'approval.requested': (approval) => ({
    item_type: 'approval',
    entity_type: approval.entity_type,
    entity_id: approval.entity_id,
    title: `Approval needed: ${approval.workflow_name}`,
    priority: 'high',
  }),

  // SLA alerts
  'sla.warning': (sla) => ({
    item_type: 'alert',
    entity_type: sla.entity_type,
    entity_id: sla.entity_id,
    title: `SLA warning: ${sla.activity_type}`,
    priority: 'high',
  }),

  // Mentions
  'mention.created': (mention) => ({
    item_type: 'mention',
    entity_type: mention.entity_type,
    entity_id: mention.entity_id,
    title: `${mention.from_user.name} mentioned you`,
    priority: 'normal',
  }),
}
```

**Tasks:**
- [ ] Create inbox item creation service
- [ ] Wire activity creation to inbox
- [ ] Wire workflow approval requests to inbox
- [ ] Wire SLA warnings to inbox
- [ ] Wire mentions to inbox
- [ ] Test all triggers
- [ ] Ensure proper deduplication

---

## Week 3: Workflow Guide System

### 3.1 Workflow Definitions
**Owner:** Backend Lead
**Deliverable:** Define ideal workflows for each entity type

**New file:** `src/lib/workflows/workflow-definitions.ts`

```typescript
export const JOB_WORKFLOW = {
  id: 'job_fulfillment',
  name: 'Job Fulfillment',
  entityType: 'job',
  stages: [
    {
      id: 'intake',
      name: 'Intake',
      description: 'Understand job requirements',
      isComplete: (job) => job.requirements_complete,
      actions: [
        { id: 'intake_call', label: 'Conduct intake call', type: 'human' },
        { id: 'complete_requirements', label: 'Complete requirements', type: 'confirm' },
      ],
      sla: { hours: 24, warning: 0.75 },
    },
    {
      id: 'sourcing',
      name: 'Sourcing',
      description: 'Find qualified candidates',
      isComplete: (job) => job.submissions_count > 0,
      actions: [
        { id: 'view_matches', label: 'View matched candidates', type: 'auto' },
        { id: 'submit_candidate', label: 'Submit candidate', type: 'confirm' },
      ],
      sla: { hours: 24, warning: 0.75 },
    },
    // ... more stages
  ],
}

export const WORKFLOWS = {
  job: JOB_WORKFLOW,
  candidate: CANDIDATE_WORKFLOW,
  submission: SUBMISSION_WORKFLOW,
  placement: PLACEMENT_WORKFLOW,
  account: ACCOUNT_WORKFLOW,
  deal: DEAL_WORKFLOW,
}
```

**Tasks:**
- [ ] Define Job Fulfillment workflow (6 stages)
- [ ] Define Candidate Recruiting workflow (5 stages)
- [ ] Define Submission workflow (4 stages)
- [ ] Define Placement workflow (5 stages)
- [ ] Define Account Acquisition workflow (7 stages)
- [ ] Define Deal workflow (6 stages)
- [ ] Define Delivery workflow (5 stages)
- [ ] Create workflow validation schemas

### 3.2 Workflow Progress API
**Owner:** Backend Lead
**Deliverable:** API to calculate workflow progress for any entity

**New file:** `src/server/routers/workflow-progress.ts`

```typescript
export const workflowProgressRouter = router({
  // Get current workflow progress for an entity
  get: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const workflow = WORKFLOWS[input.entityType]
      const entity = await getEntity(input.entityType, input.entityId)

      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        currentStage: calculateCurrentStage(workflow, entity),
        stages: workflow.stages.map(stage => ({
          ...stage,
          status: getStageStatus(stage, entity),
          completedAt: getStageCompletedAt(stage, entity),
        })),
        nextActions: getNextActions(workflow, entity),
        blockers: getBlockers(workflow, entity),
        slaStatus: getSlaStatus(workflow, entity),
      }
    }),

  // Get guidance for current stage
  guidance: orgProtectedProcedure
    .input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      // Return stage-specific guidance
    }),
})
```

**Tasks:**
- [ ] Create workflow progress router
- [ ] Implement stage completion detection
- [ ] Implement next actions calculation
- [ ] Implement blocker detection
- [ ] Implement SLA status calculation
- [ ] Implement guidance content
- [ ] Add to main router
- [ ] Write tests

### 3.3 Workflow Guide UI
**Owner:** Frontend Lead
**Deliverable:** Visual workflow progress component

**New files:**
- `src/components/workflow-guide/WorkflowGuide.tsx`
- `src/components/workflow-guide/WorkflowStage.tsx`
- `src/components/workflow-guide/WorkflowGuidance.tsx`
- `src/components/workflow-guide/WorkflowSla.tsx`

**WorkflowGuide design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ○────────●────────○────────○────────○────────○                 │
│ Intake   Source   Submit   Interview  Offer   Close             │
│          ↑                                                      │
│     You are here                                                │
├─────────────────────────────────────────────────────────────────┤
│ 💡 SOURCING                                                     │
│                                                                 │
│ Goal: Find 3-5 qualified candidates to submit                   │
│                                                                 │
│ ✓ AI matched 12 candidates                                      │
│ ○ Select candidates to submit                                   │
│                                                                 │
│ [View Matches] [Search Pool]                                    │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️ SLA: First submission due in 4 hours                        │
└─────────────────────────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Build WorkflowGuide wrapper component
- [ ] Build WorkflowStage with visual indicators
- [ ] Build stage progress bar (SVG/CSS)
- [ ] Build WorkflowGuidance with dynamic content
- [ ] Build WorkflowSla with countdown
- [ ] Add click interactions (navigate to stage)
- [ ] Add keyboard shortcuts
- [ ] Integrate into entity detail pages

---

## Week 4: Enhanced Command Palette & Navigation Integration

### 4.1 Enhanced Command Palette
**Owner:** Frontend Lead
**Deliverable:** Full-featured command palette with natural language

**Enhance:** `src/components/v4/command/CommandPalette.tsx`

**Command types:**
```typescript
const COMMAND_TYPES = {
  // Navigation
  navigation: [
    { pattern: /^go to (.+)$/i, action: 'navigate', examples: ['go to jobs', 'go to inbox'] },
    { pattern: /^open (.+)$/i, action: 'open_entity', examples: ['open sarah chen', 'open acme job'] },
  ],

  // Actions
  actions: [
    { pattern: /^submit (.+) to (.+)$/i, action: 'submit_candidate', examples: ['submit sarah to acme'] },
    { pattern: /^call (.+)$/i, action: 'call', examples: ['call john at acme'] },
    { pattern: /^email (.+)$/i, action: 'compose_email', examples: ['email sarah about interview'] },
    { pattern: /^schedule (.+)$/i, action: 'schedule', examples: ['schedule interview with sarah'] },
  ],

  // Search
  search: [
    { pattern: /^find (.+)$/i, action: 'search', examples: ['find react developers in sf'] },
    { pattern: /^show (.+)$/i, action: 'filter', examples: ['show jobs with no submissions'] },
  ],

  // Create
  create: [
    { pattern: /^(new|create) (.+)$/i, action: 'create', examples: ['new candidate', 'create job'] },
  ],
}
```

**Tasks:**
- [ ] Implement natural language parsing
- [ ] Add entity fuzzy search (candidates, jobs, accounts)
- [ ] Add action commands (submit, call, email)
- [ ] Add filter commands (show overdue, my tasks)
- [ ] Add create commands
- [ ] Add recent commands history
- [ ] Add command suggestions based on context
- [ ] Add keyboard navigation (↑↓, Enter, Esc)
- [ ] Add loading states for async commands

### 4.2 Navigation Integration
**Owner:** Frontend Lead
**Deliverable:** Unified navigation with inbox as home

**Tasks:**
- [ ] Update sidebar to show inbox first
- [ ] Add inbox badge with pending count
- [ ] Update home route to redirect to inbox
- [ ] Add context panel toggle to header
- [ ] Add workflow guide toggle per entity
- [ ] Update breadcrumbs for new structure
- [ ] Add keyboard shortcuts help modal (⌘?)

### 4.3 Split View Implementation
**Owner:** Frontend Lead
**Deliverable:** Click item → detail opens in side panel

**New files:**
- `src/components/layout/SplitView.tsx`
- `src/components/layout/SplitViewProvider.tsx`

**Split view behavior:**
```
List View                    Detail Panel
┌──────────────────────────┐ ┌──────────────────────────────┐
│ ● Job #1234 ← selected   │ │ Job #1234                    │
│   Job #1235              │ │ Acme Corporation             │
│   Job #1236              │ │ ──────────────────────────── │
│   Job #1237              │ │ Status: Sourcing             │
│   Job #1238              │ │ Bill Rate: $120/hr           │
│                          │ │ ──────────────────────────── │
│                          │ │ [Full workflow guide]        │
│                          │ │ [Submissions]                │
│                          │ │ [Activities]                 │
└──────────────────────────┘ └──────────────────────────────┘
```

**Tasks:**
- [ ] Build SplitView component
- [ ] Build SplitViewProvider for state
- [ ] Implement split view for all list views
- [ ] Add keyboard navigation (Enter to open, Esc to close)
- [ ] Add panel width persistence
- [ ] Add panel collapse/expand
- [ ] Handle deep links (URL updates)

### 4.4 Phase 1 Testing & Polish
**Owner:** QA / All
**Deliverable:** Tested and polished Phase 1 features

**Tasks:**
- [ ] Write E2E tests for inbox
- [ ] Write E2E tests for context panel
- [ ] Write E2E tests for workflow guide
- [ ] Write E2E tests for command palette
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (axe)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness check

---

# Phase 2: Communications (Weeks 5-8)

## Objective
Bring email and calendar into InTime, with automatic context linking.

---

## Week 5: Email Integration - Backend

### 5.1 Email Database Schema
**Owner:** Backend Lead
**Deliverable:** Database schema for email sync

**New tables:**
```sql
-- Email accounts (connected Gmail/Outlook)
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  provider TEXT NOT NULL, -- 'gmail', 'outlook'
  email_address TEXT NOT NULL,

  -- OAuth
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Sync state
  last_sync_at TIMESTAMPTZ,
  sync_cursor TEXT, -- Provider-specific cursor

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'disconnected', 'error'
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email threads (conversations)
CREATE TABLE email_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  email_account_id UUID NOT NULL REFERENCES email_accounts(id),

  provider_thread_id TEXT NOT NULL, -- Gmail thread ID
  subject TEXT,

  -- Participants
  participants JSONB NOT NULL DEFAULT '[]', -- Array of email addresses

  -- Latest message
  last_message_at TIMESTAMPTZ,
  snippet TEXT,

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Labels/folders
  labels JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(email_account_id, provider_thread_id)
);

-- Email messages
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  thread_id UUID NOT NULL REFERENCES email_threads(id),

  provider_message_id TEXT NOT NULL,

  -- Participants
  from_address TEXT NOT NULL,
  from_name TEXT,
  to_addresses JSONB NOT NULL DEFAULT '[]',
  cc_addresses JSONB DEFAULT '[]',
  bcc_addresses JSONB DEFAULT '[]',

  -- Content
  subject TEXT,
  body_text TEXT,
  body_html TEXT,
  snippet TEXT,

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',

  -- Timestamps
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,

  -- Status
  is_read BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email-entity links (auto-detected)
CREATE TABLE email_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  thread_id UUID NOT NULL REFERENCES email_threads(id),
  message_id UUID REFERENCES email_messages(id),

  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  -- Link type
  link_type TEXT NOT NULL, -- 'auto', 'manual', 'mentioned'
  confidence DECIMAL(3,2), -- 0.00-1.00 for auto links

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX email_entity_links_entity ON email_entity_links(entity_type, entity_id);
CREATE INDEX email_threads_last_message ON email_threads(email_account_id, last_message_at DESC);
```

**Tasks:**
- [ ] Design email_accounts schema
- [ ] Design email_threads schema
- [ ] Design email_messages schema
- [ ] Design email_entity_links schema
- [ ] Create migrations
- [ ] Run db:introspect
- [ ] Add Drizzle types

### 5.2 Gmail Integration
**Owner:** Backend Lead
**Deliverable:** Gmail OAuth and sync

**New files:**
- `src/lib/integrations/email/gmail/GmailProvider.ts`
- `src/lib/integrations/email/gmail/gmail-api.ts`
- `src/lib/integrations/email/gmail/gmail-sync.ts`

**Tasks:**
- [ ] Set up Google Cloud project
- [ ] Configure OAuth consent screen
- [ ] Implement OAuth flow
- [ ] Implement thread list sync
- [ ] Implement message fetch
- [ ] Implement send email
- [ ] Implement reply email
- [ ] Implement incremental sync (watch/push)
- [ ] Handle rate limits
- [ ] Handle token refresh

### 5.3 Outlook Integration
**Owner:** Backend Lead
**Deliverable:** Outlook OAuth and sync

**New files:**
- `src/lib/integrations/email/outlook/OutlookProvider.ts`
- `src/lib/integrations/email/outlook/outlook-api.ts`
- `src/lib/integrations/email/outlook/outlook-sync.ts`

**Tasks:**
- [ ] Set up Azure AD app
- [ ] Configure OAuth permissions
- [ ] Implement OAuth flow
- [ ] Implement thread list sync
- [ ] Implement message fetch
- [ ] Implement send email
- [ ] Implement reply email
- [ ] Implement webhook notifications
- [ ] Handle token refresh

### 5.4 Email API Router
**Owner:** Backend Lead
**Deliverable:** tRPC router for email

**New file:** `src/server/routers/email.ts`

```typescript
export const emailRouter = router({
  // Account management
  accounts: router({
    list: orgProtectedProcedure.query(...),
    connect: orgProtectedProcedure.input(...).mutation(...),
    disconnect: orgProtectedProcedure.input(...).mutation(...),
    sync: orgProtectedProcedure.input(...).mutation(...),
  }),

  // Threads
  threads: router({
    list: orgProtectedProcedure.input(z.object({
      accountId: z.string().uuid().optional(),
      filter: z.enum(['inbox', 'sent', 'drafts', 'starred', 'all']),
      search: z.string().optional(),
      limit: z.number().default(50),
      cursor: z.string().optional(),
    })).query(...),

    get: orgProtectedProcedure.input(z.object({
      threadId: z.string().uuid(),
    })).query(...),

    markRead: ...,
    archive: ...,
    star: ...,
  }),

  // Messages
  messages: router({
    send: orgProtectedProcedure.input(z.object({
      to: z.array(z.string().email()),
      cc: z.array(z.string().email()).optional(),
      subject: z.string(),
      body: z.string(),
      replyToMessageId: z.string().optional(),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
    })).mutation(...),

    saveDraft: ...,
  }),

  // Entity linking
  links: router({
    getForEntity: orgProtectedProcedure.input(z.object({
      entityType: z.string(),
      entityId: z.string().uuid(),
    })).query(...),

    link: orgProtectedProcedure.input(z.object({
      threadId: z.string().uuid(),
      entityType: z.string(),
      entityId: z.string().uuid(),
    })).mutation(...),

    unlink: ...,
  }),
})
```

**Tasks:**
- [ ] Create email router
- [ ] Implement account endpoints
- [ ] Implement thread endpoints
- [ ] Implement message endpoints
- [ ] Implement linking endpoints
- [ ] Add to main router
- [ ] Write tests

---

## Week 6: Email Integration - Frontend

### 6.1 Email View
**Owner:** Frontend Lead
**Deliverable:** Email inbox view in app

**New files:**
- `src/app/employee/email/page.tsx`
- `src/components/email/EmailInbox.tsx`
- `src/components/email/EmailThread.tsx`
- `src/components/email/EmailMessage.tsx`
- `src/components/email/EmailCompose.tsx`

**Email view design:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Email                                     [Compose] [⚙️]        │
├─────────────────────────────────────────────────────────────────┤
│ [Inbox] [Sent] [Drafts] [Starred]    🔍 Search emails...       │
├───────────────────────────┬─────────────────────────────────────┤
│ Thread List               │ Thread Detail                       │
│ ┌───────────────────────┐ │ ┌─────────────────────────────────┐ │
│ │ ● John Smith          │ │ │ From: john@acme.com             │ │
│ │   Re: Interview...    │ │ │ To: me                          │ │
│ │   2 hours ago         │ │ │ Subject: Re: Interview Feedback │ │
│ │ ─────────────────────│ │ │                                 │ │
│ │   Sarah Chen          │ │ │ Hi,                             │ │
│ │   Thanks for the...   │ │ │                                 │ │
│ │   Yesterday           │ │ │ The interview went great...     │ │
│ └───────────────────────┘ │ │                                 │ │
│                           │ │ [Reply] [Forward] [Archive]     │ │
│                           │ └─────────────────────────────────┘ │
│                           │ ┌─────────────────────────────────┐ │
│                           │ │ 🔗 LINKED ENTITIES              │ │
│                           │ │                                 │ │
│                           │ │ 📋 Sarah Chen → Acme Corp       │ │
│                           │ │    Submission • Interviewing    │ │
│                           │ │    [Open] [Unlink]              │ │
│                           │ └─────────────────────────────────┘ │
└───────────────────────────┴─────────────────────────────────────┘
```

**Tasks:**
- [ ] Build EmailInbox component
- [ ] Build EmailThread list component
- [ ] Build EmailMessage component (HTML rendering)
- [ ] Build EmailCompose component (rich text)
- [ ] Implement thread selection and split view
- [ ] Implement search
- [ ] Implement filters (inbox/sent/etc)
- [ ] Implement keyboard shortcuts (j/k, r, a)
- [ ] Add loading states

### 6.2 Email Compose Modal
**Owner:** Frontend Lead
**Deliverable:** Compose email from anywhere

**Features:**
- Rich text editor (already exists)
- To/CC/BCC fields with autocomplete
- Entity linking (link to candidate/job)
- Template insertion
- Draft auto-save
- Reply/forward modes

**Tasks:**
- [ ] Build compose modal component
- [ ] Implement recipient autocomplete (contacts)
- [ ] Implement entity linking UI
- [ ] Implement template insertion
- [ ] Implement draft auto-save
- [ ] Add to command palette (email X)
- [ ] Add to context panel quick actions

### 6.3 Email Account Connection
**Owner:** Frontend Lead
**Deliverable:** UI to connect email accounts

**New files:**
- `src/app/employee/settings/email/page.tsx`
- `src/components/settings/EmailAccountSettings.tsx`
- `src/components/settings/EmailAccountConnect.tsx`

**Tasks:**
- [ ] Build settings page for email
- [ ] Build OAuth connection flow
- [ ] Build account management UI
- [ ] Handle connection errors
- [ ] Show sync status

---

## Week 7: Calendar Integration

### 7.1 Calendar Database Schema
**Owner:** Backend Lead
**Deliverable:** Calendar sync schema

**New tables:**
```sql
-- Calendar accounts
CREATE TABLE calendar_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,

  provider TEXT NOT NULL, -- 'google', 'outlook'
  calendar_id TEXT NOT NULL, -- Primary calendar ID

  -- OAuth (may share with email)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Sync state
  last_sync_at TIMESTAMPTZ,
  sync_token TEXT,

  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar events
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  calendar_account_id UUID NOT NULL REFERENCES calendar_accounts(id),

  provider_event_id TEXT NOT NULL,

  -- Event details
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,

  -- Timing
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  timezone TEXT,

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,

  -- Participants
  organizer_email TEXT,
  attendees JSONB DEFAULT '[]',

  -- Status
  status TEXT NOT NULL DEFAULT 'confirmed', -- 'confirmed', 'tentative', 'cancelled'
  my_response TEXT, -- 'accepted', 'declined', 'tentative', 'needs_action'

  -- Links
  meeting_url TEXT, -- Zoom/Meet/Teams link

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(calendar_account_id, provider_event_id)
);

-- Calendar-entity links
CREATE TABLE calendar_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  event_id UUID NOT NULL REFERENCES calendar_events(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  link_type TEXT NOT NULL, -- 'auto', 'manual'

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Design calendar_accounts schema
- [ ] Design calendar_events schema
- [ ] Design calendar_entity_links schema
- [ ] Create migrations
- [ ] Run db:introspect

### 7.2 Google Calendar Integration
**Owner:** Backend Lead
**Deliverable:** Google Calendar OAuth and sync

**Tasks:**
- [ ] Implement OAuth (reuse Gmail if connected)
- [ ] Implement calendar list
- [ ] Implement event sync
- [ ] Implement event creation
- [ ] Implement event update
- [ ] Implement free/busy lookup
- [ ] Implement webhook notifications

### 7.3 Outlook Calendar Integration
**Owner:** Backend Lead
**Deliverable:** Outlook Calendar OAuth and sync

**Tasks:**
- [ ] Implement OAuth (reuse Outlook mail if connected)
- [ ] Implement calendar list
- [ ] Implement event sync
- [ ] Implement event creation
- [ ] Implement event update
- [ ] Implement free/busy lookup
- [ ] Implement webhook notifications

### 7.4 Calendar API Router
**Owner:** Backend Lead
**Deliverable:** tRPC router for calendar

**New file:** `src/server/routers/calendar.ts`

```typescript
export const calendarRouter = router({
  accounts: router({ ... }),

  events: router({
    list: orgProtectedProcedure.input(z.object({
      start: z.date(),
      end: z.date(),
      accountId: z.string().uuid().optional(),
    })).query(...),

    get: ...,

    create: orgProtectedProcedure.input(z.object({
      title: z.string(),
      start: z.date(),
      end: z.date(),
      attendees: z.array(z.string().email()),
      location: z.string().optional(),
      description: z.string().optional(),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
    })).mutation(...),

    update: ...,
    delete: ...,
  }),

  availability: router({
    check: orgProtectedProcedure.input(z.object({
      attendees: z.array(z.string().email()),
      duration: z.number(), // minutes
      dateRange: z.object({ start: z.date(), end: z.date() }),
    })).query(...),

    suggest: ..., // Suggest available times
  }),
})
```

**Tasks:**
- [ ] Create calendar router
- [ ] Implement event endpoints
- [ ] Implement availability endpoints
- [ ] Add to main router
- [ ] Write tests

### 7.5 Calendar View
**Owner:** Frontend Lead
**Deliverable:** Calendar view in app

**New files:**
- `src/app/employee/calendar/page.tsx`
- `src/components/calendar/CalendarView.tsx`
- `src/components/calendar/CalendarEvent.tsx`
- `src/components/calendar/EventCreateModal.tsx`

**Tasks:**
- [ ] Build CalendarView (day/week/month)
- [ ] Build event display
- [ ] Build event creation modal
- [ ] Implement drag to create
- [ ] Implement event editing
- [ ] Show linked entities
- [ ] Add to navigation

---

## Week 8: Communication Context Engine

### 8.1 Auto-Linking Service
**Owner:** Backend Lead
**Deliverable:** Service that automatically links communications to entities

**New file:** `src/lib/services/communication-context.ts`

**Auto-linking logic:**
```typescript
class CommunicationContextEngine {
  async linkEmail(thread: EmailThread): Promise<EntityLink[]> {
    const links: EntityLink[] = []

    // 1. Match participants to contacts
    const contacts = await this.matchParticipants(thread.participants)

    for (const contact of contacts) {
      // 2. Find related entities
      const relatedEntities = await this.findRelatedEntities(contact)

      // 3. Score relevance based on:
      //    - Recent activity
      //    - Subject line keywords
      //    - Active workflows
      const scored = this.scoreRelevance(relatedEntities, thread)

      // 4. Create links for high-confidence matches
      for (const entity of scored.filter(e => e.confidence > 0.7)) {
        links.push({
          entityType: entity.type,
          entityId: entity.id,
          confidence: entity.confidence,
          linkType: 'auto',
        })
      }
    }

    return links
  }

  async linkCalendarEvent(event: CalendarEvent): Promise<EntityLink[]> {
    // Similar logic for calendar events
  }
}
```

**Tasks:**
- [ ] Build participant matching (email → contact)
- [ ] Build related entity finder
- [ ] Build relevance scoring
- [ ] Implement email auto-linking
- [ ] Implement calendar auto-linking
- [ ] Run on sync and new items
- [ ] Allow manual override

### 8.2 Communication History in Context Panel
**Owner:** Frontend Lead
**Deliverable:** Show email/calendar for any entity in context panel

**Context panel additions:**
```
┌─────────────────────────────┐
│ COMMUNICATIONS              │
├─────────────────────────────┤
│ 📧 EMAILS (3)               │
│ ┌─────────────────────────┐ │
│ │ John Smith              │ │
│ │ Re: Interview Feedback  │ │
│ │ 2 hours ago             │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Sarah Chen              │ │
│ │ Thanks for the prep...  │ │
│ │ Yesterday               │ │
│ └─────────────────────────┘ │
│ [View All Emails →]         │
├─────────────────────────────┤
│ 📅 MEETINGS (1)             │
│ ┌─────────────────────────┐ │
│ │ Interview - Sarah Chen  │ │
│ │ Tomorrow 2:00 PM        │ │
│ │ [Join] [Reschedule]     │ │
│ └─────────────────────────┘ │
│ [View Calendar →]           │
└─────────────────────────────┘
```

**Tasks:**
- [ ] Add Communications section to context panel
- [ ] Fetch emails linked to current entity
- [ ] Fetch calendar events linked to current entity
- [ ] Show preview with quick actions
- [ ] Link to full email/calendar views

### 8.3 Phase 2 Testing & Polish
**Owner:** QA / All
**Deliverable:** Tested communications features

**Tasks:**
- [ ] Test Gmail OAuth flow
- [ ] Test Outlook OAuth flow
- [ ] Test email sync (all providers)
- [ ] Test email send/reply
- [ ] Test calendar sync
- [ ] Test event creation
- [ ] Test auto-linking accuracy
- [ ] Test context panel communications
- [ ] Performance testing (large inboxes)
- [ ] Security audit (OAuth, token storage)

---

# Phase 3: Desktop & Phone (Weeks 9-12)

## Objective
Wrap the app in a desktop shell with native phone integration.

---

## Week 9: Desktop Shell Foundation

### 9.1 Tauri Project Setup
**Owner:** Platform Lead
**Deliverable:** Tauri desktop app wrapper

**New directory:** `desktop/`

```
desktop/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs      # Native commands
│   │   ├── shortcuts.rs     # Global shortcuts
│   │   ├── notifications.rs # OS notifications
│   │   └── phone.rs         # Phone bridge
│   └── icons/
├── package.json
└── README.md
```

**Tasks:**
- [ ] Initialize Tauri project
- [ ] Configure app metadata (name, icons)
- [ ] Configure window settings
- [ ] Set up development workflow
- [ ] Configure auto-updater
- [ ] Test on macOS
- [ ] Test on Windows
- [ ] Configure code signing

### 9.2 Global Keyboard Shortcuts
**Owner:** Platform Lead
**Deliverable:** ⌘K works from anywhere (even when app hidden)

**Implementation:**
```rust
// desktop/src-tauri/src/shortcuts.rs
use tauri::GlobalShortcutManager;

pub fn register_shortcuts(app: &tauri::App) {
    let mut shortcut_manager = app.global_shortcut_manager();

    // ⌘K - Open command palette
    shortcut_manager.register("CmdOrCtrl+K", || {
        // Bring window to front
        // Focus command palette
    });

    // ⌘Shift+P - Open phone dialer
    shortcut_manager.register("CmdOrCtrl+Shift+P", || {
        // Open phone dialer
    });

    // ⌘Shift+M - Compose email
    shortcut_manager.register("CmdOrCtrl+Shift+M", || {
        // Open compose
    });
}
```

**Tasks:**
- [ ] Implement global shortcut registration
- [ ] ⌘K - Command palette
- [ ] ⌘N - Quick create
- [ ] ⌘⇧P - Phone dialer
- [ ] ⌘⇧M - Compose email
- [ ] Handle shortcut conflicts
- [ ] Add shortcut customization settings

### 9.3 System Tray
**Owner:** Platform Lead
**Deliverable:** App lives in system tray

**Features:**
- Minimize to tray
- Tray icon with unread badge
- Quick actions menu
- Show/hide toggle

**Tasks:**
- [ ] Create tray icon
- [ ] Implement minimize to tray
- [ ] Show unread count badge
- [ ] Build tray context menu
- [ ] Handle click to show/hide

### 9.4 Native Notifications
**Owner:** Platform Lead
**Deliverable:** OS-level notifications

**Bridge web → native notifications:**
```typescript
// Web layer
window.__TAURI__.notification.sendNotification({
  title: 'New Task',
  body: 'Follow up with Sarah Chen',
  icon: '/notification-icon.png',
});

// Click handler → navigate to entity
window.__TAURI__.notification.onAction((action) => {
  if (action.entityType && action.entityId) {
    router.push(`/${action.entityType}/${action.entityId}`);
  }
});
```

**Tasks:**
- [ ] Implement notification bridge
- [ ] Handle notification clicks
- [ ] Add notification grouping
- [ ] Add notification actions
- [ ] Respect DND settings

---

## Week 10: Phone Integration - Backend

### 10.1 Phone Database Schema
**Owner:** Backend Lead
**Deliverable:** Phone call tracking schema

**New tables:**
```sql
-- Phone accounts (connected numbers)
CREATE TABLE phone_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID NOT NULL,

  provider TEXT NOT NULL, -- 'twilio', 'ringcentral', 'vonage'
  phone_number TEXT NOT NULL,

  -- Provider credentials
  credentials JSONB,

  status TEXT NOT NULL DEFAULT 'active',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call records
CREATE TABLE phone_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  phone_account_id UUID NOT NULL REFERENCES phone_accounts(id),

  -- Call details
  direction TEXT NOT NULL, -- 'inbound', 'outbound'
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,

  -- Status
  status TEXT NOT NULL, -- 'ringing', 'in_progress', 'completed', 'missed', 'voicemail', 'failed'

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT,

  -- Recording
  recording_url TEXT,
  transcription TEXT,

  -- Notes
  notes TEXT,
  outcome TEXT, -- 'positive', 'neutral', 'negative', 'voicemail', 'no_answer'

  -- Provider
  provider_call_id TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call-entity links
CREATE TABLE phone_call_entity_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,

  call_id UUID NOT NULL REFERENCES phone_calls(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tasks:**
- [ ] Design phone_accounts schema
- [ ] Design phone_calls schema
- [ ] Design phone_call_entity_links schema
- [ ] Create migrations
- [ ] Run db:introspect

### 10.2 Twilio Integration
**Owner:** Backend Lead
**Deliverable:** Twilio voice API integration

**New files:**
- `src/lib/integrations/phone/twilio/TwilioProvider.ts`
- `src/lib/integrations/phone/twilio/twilio-api.ts`

**Features:**
- Outbound calling via browser
- Inbound call handling
- Call recording
- Voicemail
- Call transfer

**Tasks:**
- [ ] Set up Twilio account
- [ ] Implement browser-based calling (TwiML)
- [ ] Implement outbound call initiation
- [ ] Implement inbound call routing
- [ ] Implement call recording
- [ ] Implement voicemail
- [ ] Handle call events (ring, answer, end)

### 10.3 Phone API Router
**Owner:** Backend Lead
**Deliverable:** tRPC router for phone

**New file:** `src/server/routers/phone.ts`

```typescript
export const phoneRouter = router({
  accounts: router({
    list: ...,
    connect: ...,
    disconnect: ...,
  }),

  calls: router({
    // Initiate outbound call
    dial: orgProtectedProcedure.input(z.object({
      to: z.string(),
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
    })).mutation(...),

    // Get call token for browser
    getToken: orgProtectedProcedure.query(...),

    // End active call
    hangup: orgProtectedProcedure.input(z.object({
      callId: z.string().uuid(),
    })).mutation(...),

    // Log call outcome
    logOutcome: orgProtectedProcedure.input(z.object({
      callId: z.string().uuid(),
      outcome: z.enum(['positive', 'neutral', 'negative', 'voicemail', 'no_answer']),
      notes: z.string().optional(),
    })).mutation(...),

    // Get call history
    list: orgProtectedProcedure.input(z.object({
      entityType: z.string().optional(),
      entityId: z.string().uuid().optional(),
      limit: z.number().default(50),
    })).query(...),
  }),
})
```

**Tasks:**
- [ ] Create phone router
- [ ] Implement dial mutation
- [ ] Implement token generation
- [ ] Implement call status updates
- [ ] Implement outcome logging
- [ ] Implement call history
- [ ] Add webhooks for call events
- [ ] Add to main router

---

## Week 11: Phone Integration - Frontend

### 11.1 Phone Dialer UI
**Owner:** Frontend Lead
**Deliverable:** In-app phone dialer

**New files:**
- `src/components/phone/PhoneDialer.tsx`
- `src/components/phone/ActiveCall.tsx`
- `src/components/phone/CallHistory.tsx`
- `src/components/phone/CallOutcomeModal.tsx`

**Active call UI:**
```
┌─────────────────────────────────────────────────────────────────┐
│                      ACTIVE CALL                                │
│                                                                 │
│                         00:03:42                                │
│                                                                 │
│                      John Smith                                 │
│                   +1 (555) 123-4567                            │
│                   Acme Corporation                              │
│                                                                 │
│        [🔇 Mute]    [⏸️ Hold]    [📞 Transfer]    [🔴 End]      │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ 📋 CONTEXT                                                      │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Sarah Chen → Acme Corp                                      │ │
│ │ Submission • Interview stage                                │ │
│ │ Interview scheduled for tomorrow                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 💬 TALKING POINTS                                               │
│ • Confirm interview time (2pm tomorrow)                         │
│ • Ask about travel arrangements                                 │
│ • Discuss rate expectations                                     │
│                                                                 │
│ 📝 NOTES                                                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Start typing notes...                                       │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Build PhoneDialer component
- [ ] Build ActiveCall component
- [ ] Build call controls (mute, hold, end)
- [ ] Show caller/callee context
- [ ] Show talking points from workflow
- [ ] Build real-time notes capture
- [ ] Build CallOutcomeModal
- [ ] Handle inbound calls
- [ ] Add call notification sounds
- [ ] Implement click-to-call everywhere

### 11.2 Click-to-Call Integration
**Owner:** Frontend Lead
**Deliverable:** Click any phone number to call

**Tasks:**
- [ ] Create PhoneNumber component (clickable)
- [ ] Replace all phone displays with PhoneNumber
- [ ] Add "Call" button to context panel
- [ ] Add to command palette ("call X")
- [ ] Handle multiple numbers (select modal)

### 11.3 Call Logging in Activity
**Owner:** Frontend Lead
**Deliverable:** Calls auto-log as activities

**Tasks:**
- [ ] Create call_completed event handler
- [ ] Auto-create activity from call
- [ ] Link activity to entity
- [ ] Include duration, outcome, notes
- [ ] Show in activity timeline

---

## Week 12: Desktop Polish & Testing

### 12.1 Deep Links
**Owner:** Platform Lead
**Deliverable:** intime:// protocol handling

**Examples:**
- `intime://candidate/123` → Opens candidate 123
- `intime://call/+15551234567` → Initiates call
- `intime://compose?to=john@acme.com` → Opens compose

**Tasks:**
- [ ] Register protocol handler
- [ ] Parse deep link URLs
- [ ] Navigate to correct view
- [ ] Handle when app not running (launch and navigate)

### 12.2 Auto-Updates
**Owner:** Platform Lead
**Deliverable:** Automatic app updates

**Tasks:**
- [ ] Configure update server
- [ ] Implement update check
- [ ] Implement download and install
- [ ] Show update notification
- [ ] Handle update on quit

### 12.3 Offline Support
**Owner:** Platform Lead
**Deliverable:** Basic offline functionality

**Tasks:**
- [ ] Cache critical data locally
- [ ] Show offline indicator
- [ ] Queue actions when offline
- [ ] Sync when back online
- [ ] Handle conflicts

### 12.4 Phase 3 Testing
**Owner:** QA / All
**Deliverable:** Tested desktop and phone features

**Tasks:**
- [ ] Test desktop app on macOS
- [ ] Test desktop app on Windows
- [ ] Test global shortcuts
- [ ] Test system tray
- [ ] Test notifications
- [ ] Test phone calling (outbound)
- [ ] Test phone calling (inbound)
- [ ] Test call logging
- [ ] Test deep links
- [ ] Test auto-updates
- [ ] Test offline behavior
- [ ] Performance testing
- [ ] Security audit

---

# Phase 4: Intelligence (Weeks 13-16)

## Objective
Add AI-powered features for smart suggestions and automation.

---

## Week 13: AI Infrastructure

### 13.1 AI Service Setup
**Owner:** Backend Lead
**Deliverable:** AI service integration

**Tasks:**
- [ ] Set up OpenAI API integration
- [ ] Create AI service abstraction
- [ ] Implement prompt management
- [ ] Add response caching
- [ ] Add rate limiting
- [ ] Add cost tracking

### 13.2 AI Router
**Owner:** Backend Lead
**Deliverable:** tRPC router for AI features

**New file:** `src/server/routers/ai.ts`

```typescript
export const aiRouter = router({
  // Suggest candidates for a job
  suggestCandidates: orgProtectedProcedure
    .input(z.object({ jobId: z.string().uuid() }))
    .query(...),

  // Suggest reply to email
  suggestReply: orgProtectedProcedure
    .input(z.object({ threadId: z.string().uuid() }))
    .query(...),

  // Generate submission summary
  generateSubmissionSummary: orgProtectedProcedure
    .input(z.object({ candidateId: z.string().uuid(), jobId: z.string().uuid() }))
    .mutation(...),

  // Analyze call transcript
  analyzeCall: orgProtectedProcedure
    .input(z.object({ callId: z.string().uuid() }))
    .mutation(...),

  // Natural language query
  query: orgProtectedProcedure
    .input(z.object({ query: z.string() }))
    .mutation(...),
})
```

**Tasks:**
- [ ] Create AI router
- [ ] Implement candidate suggestion
- [ ] Implement email reply suggestion
- [ ] Implement submission summary generation
- [ ] Implement call analysis
- [ ] Implement natural language query
- [ ] Add to main router

---

## Week 14: Smart Suggestions

### 14.1 Candidate Matching
**Owner:** Backend Lead
**Deliverable:** AI-powered candidate matching

**Tasks:**
- [ ] Implement semantic search on candidates
- [ ] Score candidates against job requirements
- [ ] Rank by fit score
- [ ] Explain match reasoning
- [ ] Surface in job detail view

### 14.2 Email Reply Suggestions
**Owner:** Frontend Lead
**Deliverable:** Suggested email replies

**Tasks:**
- [ ] Generate reply suggestions based on context
- [ ] Show suggestions in email view
- [ ] One-click to use suggestion
- [ ] Allow editing before send
- [ ] Learn from user edits

### 14.3 Next Action Suggestions
**Owner:** Frontend Lead
**Deliverable:** Suggest what to do next

**Tasks:**
- [ ] Analyze current workflow state
- [ ] Suggest next action
- [ ] Show in context panel
- [ ] One-click to execute
- [ ] Learn from user behavior

---

## Week 15: AI Assistant

### 15.1 Conversational Assistant
**Owner:** Full Stack
**Deliverable:** Chat-based AI assistant

**New files:**
- `src/components/assistant/Assistant.tsx`
- `src/components/assistant/AssistantChat.tsx`
- `src/components/assistant/AssistantSuggestions.tsx`

**Assistant capabilities:**
- Answer questions about entities ("When did we last talk to Acme?")
- Execute actions ("Submit Sarah to Acme")
- Search and filter ("Show me React developers in SF")
- Generate content ("Draft an email to John about the interview")

**Tasks:**
- [ ] Build Assistant component
- [ ] Implement chat interface
- [ ] Implement action execution
- [ ] Implement search queries
- [ ] Implement content generation
- [ ] Add to context panel
- [ ] Add to command palette (/ask)

### 15.2 Voice Commands (Optional)
**Owner:** Platform Lead
**Deliverable:** Voice input for assistant

**Tasks:**
- [ ] Implement speech-to-text
- [ ] Parse voice commands
- [ ] Execute actions
- [ ] Provide voice feedback

---

## Week 16: Final Polish & Launch

### 16.1 Performance Optimization
**Owner:** Full Stack
**Deliverable:** Optimized performance

**Tasks:**
- [ ] Audit and fix slow queries
- [ ] Implement query caching
- [ ] Optimize bundle size
- [ ] Implement code splitting
- [ ] Add performance monitoring

### 16.2 Security Audit
**Owner:** Security Lead
**Deliverable:** Security review

**Tasks:**
- [ ] Review OAuth implementations
- [ ] Review data access controls
- [ ] Review API security
- [ ] Penetration testing
- [ ] Fix identified issues

### 16.3 Documentation
**Owner:** All
**Deliverable:** User and developer documentation

**Tasks:**
- [ ] Write user guide
- [ ] Write keyboard shortcuts reference
- [ ] Write API documentation
- [ ] Write deployment guide
- [ ] Create training videos

### 16.4 Launch Preparation
**Owner:** All
**Deliverable:** Ready for launch

**Tasks:**
- [ ] Final QA pass
- [ ] Load testing
- [ ] Backup and recovery testing
- [ ] Monitoring and alerting setup
- [ ] Support process setup
- [ ] Launch checklist completion

---

# Appendix

## Team Structure

| Role | Responsibilities |
|------|------------------|
| **Project Lead** | Overall coordination, stakeholder communication |
| **Frontend Lead** | UI components, user experience |
| **Backend Lead** | APIs, database, integrations |
| **Platform Lead** | Desktop shell, native features |
| **QA Lead** | Testing, quality assurance |

## Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gmail/Outlook API rate limits | High | Implement caching, batch operations |
| Phone integration complexity | High | Start with Twilio, add others later |
| Desktop app distribution | Medium | Use auto-update, start with Mac/Win |
| AI costs | Medium | Implement caching, rate limiting |
| User adoption | High | Gradual rollout, training, support |

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users | 80%+ of org | Analytics |
| Time in app | 6+ hours/day | Analytics |
| External tool usage | <30 min/day | Survey |
| Task completion rate | 90%+ | Inbox metrics |
| User satisfaction | 4.5+ stars | Survey |
