# Wave 6: CRM & Automation - Enterprise Implementation Research

---
date: 2025-12-13T05:40:33-05:00
git_commit: 76890fa
branch: main
repository: intime-v3
type: research
scope: Wave 6 - CRM & Automation
issues: DEALS-01, COMMS-01, WORKFLOWS-01 (Phase 1 & 2), NOTIFICATIONS-01, CAMPAIGNS-01
status: FINAL
---

## Executive Summary

Wave 6 encompasses the CRM and Automation systems of InTime v3, consisting of 6 issues across 5 domains. This research document provides complete technical specifications for enterprise-grade implementation.

### Scope Overview

| Issue ID | Domain | Description | Estimated Effort |
|----------|--------|-------------|------------------|
| DEALS-01 | CRM | Migrate CRM Deals to Unified System | 60% complete |
| COMMS-01 | Communications | Unified Communications System | 50% complete |
| WORKFLOWS-01 Phase 1 | Automation | Workflow Automation Engine (Core) | 30% complete |
| WORKFLOWS-01 Phase 2 | Automation | Workflow Automation Engine (Notifications) | 0% complete |
| NOTIFICATIONS-01 | Notifications | Template-Based Notification System | 40% complete |
| CAMPAIGNS-01 | Campaigns | Multi-Channel Campaign Management | 80% complete |

### Implementation Status Matrix

| System | Database Schema | tRPC Router | UI Components | Integration Points | Production Readiness |
|--------|-----------------|-------------|---------------|-------------------|---------------------|
| **Deals** | 5 tables, 50+ columns | 20 procedures | PCF config-driven | Activities, History | 85% Ready |
| **Communications** | 3 tables + activities | 12 procedures | Basic | Email (Resend) | 60% Ready |
| **Workflows** | 5 tables (SCHEMA MISMATCH) | 25 procedures | Minimal | BROKEN | 15% Ready |
| **Notifications** | 1 table (MISSING 2) | 12 procedures | Basic toast | None | 40% Ready |
| **Campaigns** | 6 tables | 30+ procedures | Full wizard | Email, Enrollments | 80% Ready |

### Critical Findings

1. **WORKFLOW ENGINE SCHEMA MISMATCH (CRITICAL)**: The workflow engine code (`src/lib/workflows/workflow-engine.ts`) references 5 tables that DO NOT EXIST in the database. The baseline migration has a different state-machine based approach. **18 of 25 tRPC procedures are non-functional.**

2. **MISSING NOTIFICATION TABLES**: The notifications router references `notification_preferences` and `notification_templates` tables that don't exist. **3 of 12 procedures are broken.**

3. **NO REAL-TIME INFRASTRUCTURE**: The notification system lacks WebSocket/SSE for real-time delivery. All notifications are pull-based.

4. **CAMPAIGN AUTOMATION GAP**: Campaign sequence execution is manual-only. No automated step progression, no reply detection, no scheduled execution.

5. **POLYMORPHIC INFRASTRUCTURE COMPLETE**: The foundational polymorphic tables (`entity_history`, `documents`, `comments`, `notes`, `activities`) are fully implemented with proper partitioning and indexing.

---

## 1. CRM Deals System (DEALS-01)

### 1.1 Database Schema - Complete Specification

**Primary Table: `deals`**
- **Location**: `supabase/migrations/00000000000000_baseline.sql` lines 17525-17623
- **Columns**: 55
- **Indexes**: 7
- **Constraints**: 4 CHECK, 2 GENERATED

```sql
-- File: supabase/migrations/00000000000000_baseline.sql
-- Lines: 17525-17623

CREATE TABLE deals (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Multi-Tenancy (REQUIRED on all queries)
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Core Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  deal_number VARCHAR(50) UNIQUE,

  -- Entity References (FK relationships)
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Pipeline Stage Management
  pipeline_id UUID REFERENCES pipelines(id),
  stage_id UUID REFERENCES pipeline_stages(id),
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  stage_days INTEGER DEFAULT 0,

  -- Revenue Fields (Currency Support)
  value NUMERIC(15,2) DEFAULT 0 CHECK (value >= 0),
  currency VARCHAR(3) DEFAULT 'USD',
  weighted_value NUMERIC(15,2) GENERATED ALWAYS AS (value * probability / 100) STORED,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),

  -- Revenue Classification
  deal_type VARCHAR(50) CHECK (deal_type IN ('new_business', 'upsell', 'renewal', 'expansion', 'cross_sell')),
  revenue_type VARCHAR(50) CHECK (revenue_type IN ('one_time', 'recurring', 'usage_based', 'hybrid')),
  arr NUMERIC(15,2) CHECK (arr >= 0),  -- Annual Recurring Revenue
  mrr NUMERIC(15,2) CHECK (mrr >= 0),  -- Monthly Recurring Revenue
  contract_value NUMERIC(15,2) CHECK (contract_value >= 0),
  contract_term_months INTEGER CHECK (contract_term_months > 0),

  -- Forecasting
  forecast_category VARCHAR(50) CHECK (forecast_category IN ('pipeline', 'best_case', 'commit', 'closed', 'omitted')),
  expected_close_date DATE,
  actual_close_date DATE,
  next_step TEXT,
  next_step_due_date DATE,

  -- Competition Intelligence
  competitors JSONB DEFAULT '[]',  -- Array of { name, threat_level, notes }
  competitive_notes TEXT,

  -- Win/Loss Analysis
  outcome VARCHAR(50) CHECK (outcome IN ('won', 'lost', 'no_decision', 'deferred')),
  outcome_at TIMESTAMPTZ,
  outcome_reason VARCHAR(255),
  outcome_notes TEXT,
  loss_competitor_id UUID,  -- Which competitor won

  -- Source Attribution
  source VARCHAR(100),  -- 'inbound', 'outbound', 'referral', 'partner', 'event'
  source_campaign_id UUID REFERENCES campaigns(id),
  source_detail TEXT,

  -- Qualification
  qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
  qualification_criteria JSONB,  -- BANT, MEDDIC, etc.

  -- Status & Lifecycle
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'stalled')),
  is_stale BOOLEAN DEFAULT false,
  stale_days INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Performance Indexes
CREATE INDEX idx_deals_org ON deals(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_account ON deals(account_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_owner ON deals(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_pipeline_stage ON deals(pipeline_id, stage_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_deals_close_date ON deals(expected_close_date) WHERE status = 'open' AND deleted_at IS NULL;
CREATE INDEX idx_deals_forecast ON deals(org_id, forecast_category, expected_close_date) WHERE status = 'open';
CREATE INDEX idx_deals_status ON deals(org_id, status) WHERE deleted_at IS NULL;
```

**Related Tables**:

```sql
-- deal_competitors (lines 17411-17432)
CREATE TABLE deal_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  competitor_name VARCHAR(255) NOT NULL,
  threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  strengths TEXT,
  weaknesses TEXT,
  strategy TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- deal_products (lines 17439-17463) - Line items
CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(15,2) NOT NULL CHECK (unit_price >= 0),
  discount_percent NUMERIC(5,2) DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  total_price NUMERIC(15,2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent/100)) STORED,
  billing_frequency VARCHAR(20) CHECK (billing_frequency IN ('one_time', 'monthly', 'quarterly', 'annual')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- deal_stages_history (lines 17470-17489)
CREATE TABLE deal_stages_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  from_stage_id UUID REFERENCES pipeline_stages(id),
  to_stage_id UUID REFERENCES pipeline_stages(id),
  from_probability INTEGER,
  to_probability INTEGER,
  days_in_stage INTEGER,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- deal_stakeholders (lines 17496-17518) - Contact relationships
CREATE TABLE deal_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),
  role VARCHAR(50) CHECK (role IN ('decision_maker', 'influencer', 'champion', 'blocker', 'user', 'economic_buyer', 'technical_buyer')),
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative', 'unknown')),
  engagement_level VARCHAR(20) CHECK (engagement_level IN ('low', 'medium', 'high')),
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_id, contact_id)
);
```

### 1.2 tRPC Router - Complete Procedure Inventory

**Location**: `src/server/routers/crm.ts` lines 2088-3253
**Procedure Count**: 20

| Procedure | Type | Input Schema | Description |
|-----------|------|--------------|-------------|
| `deals.list` | Query | `{ orgId, page?, pageSize?, status?, stageId?, ownerId?, accountId?, search?, sortBy?, sortOrder? }` | Paginated list with comprehensive filtering |
| `deals.pipeline` | Query | `{ orgId, pipelineId? }` | Kanban view grouped by stage with value sums |
| `deals.getById` | Query | `{ id }` | Single deal with all relations (account, contacts, products, stages history) |
| `deals.create` | Mutation | `CreateDealInput` | Create with validation, auto-assigns deal_number |
| `deals.update` | Mutation | `{ id, ...UpdateDealInput }` | Partial update, tracks history via entity_history |
| `deals.updateStage` | Mutation | `{ id, stageId, notes? }` | Move through pipeline, creates stages_history entry |
| `deals.closeWon` | Mutation | `{ id, actualCloseDate, notes? }` | Mark as won, sets outcome fields |
| `deals.closeLost` | Mutation | `{ id, reason, competitorId?, notes? }` | Mark as lost with reason tracking |
| `deals.reopen` | Mutation | `{ id }` | Reopen a closed deal |
| `deals.forecast` | Query | `{ orgId, startDate, endDate, forecastCategory? }` | Revenue forecast by date range |
| `deals.addStakeholder` | Mutation | `{ dealId, contactId, role, sentiment? }` | Add contact to deal |
| `deals.removeStakeholder` | Mutation | `{ dealId, contactId }` | Remove contact from deal |
| `deals.updateStakeholder` | Mutation | `{ dealId, contactId, role?, sentiment?, isPrimary? }` | Update stakeholder attributes |
| `deals.getStakeholders` | Query | `{ dealId }` | List stakeholders with contact details |
| `deals.addProduct` | Mutation | `{ dealId, productId?, productName, quantity, unitPrice, discountPercent?, billingFrequency? }` | Add line item |
| `deals.removeProduct` | Mutation | `{ dealId, productId }` | Remove line item |
| `deals.getProducts` | Query | `{ dealId }` | List line items with totals |
| `deals.stats` | Query | `{ orgId }` | Dashboard metrics (total, open value, won MTD, avg cycle) |
| `deals.export` | Query | `{ orgId, format, filters? }` | Export to CSV/Excel |
| `deals.bulkUpdate` | Mutation | `{ ids, updates }` | Batch field updates |

### 1.3 Frontend Configuration

**PCF Config Location**: `src/configs/entities/deals.config.ts`

```typescript
// List View Configuration
export const dealsListConfig: ListViewConfig<Deal> = {
  entityType: 'deal',
  entityName: { singular: 'Deal', plural: 'Deals' },
  baseRoute: '/employee/crm/deals',
  title: 'Deals Pipeline',
  icon: Briefcase,

  // Stats Cards (connected to deals.stats query)
  statsCards: [
    { key: 'total', label: 'Total Deals', icon: Briefcase },
    { key: 'openValue', label: 'Open Pipeline', format: 'currency', color: 'bg-blue-100' },
    { key: 'wonValue', label: 'Won (MTD)', format: 'currency', color: 'bg-green-100' },
    { key: 'avgCycleTime', label: 'Avg Cycle', format: 'days' },
  ],

  // Filters (synced to URL params)
  filters: [
    { key: 'search', type: 'search', placeholder: 'Search deals...' },
    { key: 'status', type: 'select', options: DEAL_STATUS_OPTIONS },
    { key: 'stage', type: 'select', options: DEAL_STAGE_OPTIONS },
    { key: 'owner', type: 'user-select', placeholder: 'Owner' },
    { key: 'account', type: 'entity-select', entityType: 'account' },
    { key: 'forecastCategory', type: 'select', options: FORECAST_CATEGORY_OPTIONS },
  ],

  // Table Columns
  columns: [
    { key: 'name', header: 'Deal Name', sortable: true, width: 'min-w-[200px]' },
    { key: 'account', header: 'Account', render: 'entity-link' },
    { key: 'value', header: 'Value', format: 'currency', align: 'right', sortable: true },
    { key: 'probability', header: 'Prob', format: 'percent', align: 'right' },
    { key: 'stage', header: 'Stage', format: 'status' },
    { key: 'forecastCategory', header: 'Forecast', format: 'badge' },
    { key: 'expectedCloseDate', header: 'Close Date', format: 'date', sortable: true },
    { key: 'owner', header: 'Owner', render: 'avatar' },
    { key: 'stageDays', header: 'Days', align: 'right' },
  ],

  renderMode: 'table',
  useListQuery: (filters) => trpc.crm.deals.list.useQuery(filters),
  useStatsQuery: () => trpc.crm.deals.stats.useQuery(),
}

// Detail View Configuration
export const dealsDetailConfig: DetailViewConfig<Deal> = {
  entityType: 'deal',
  entityName: { singular: 'Deal', plural: 'Deals' },

  // Journey Navigation (step-based workflow)
  navigationStyle: 'journey',
  journeySteps: [
    { id: 'discovery', label: 'Discovery', status: 'discovery' },
    { id: 'qualification', label: 'Qualification', status: 'qualification' },
    { id: 'proposal', label: 'Proposal', status: 'proposal' },
    { id: 'negotiation', label: 'Negotiation', status: 'negotiation' },
    { id: 'closed', label: 'Closed', status: ['closed_won', 'closed_lost'] },
  ],

  // Sections (rendered based on current journey step)
  sections: [
    { id: 'overview', label: 'Overview', component: 'DealOverviewSection' },
    { id: 'stakeholders', label: 'Stakeholders', component: 'DealStakeholdersSection' },
    { id: 'products', label: 'Products', component: 'DealProductsSection', count: 'productsCount' },
    { id: 'competition', label: 'Competition', component: 'DealCompetitionSection' },
    { id: 'activities', label: 'Activities', component: 'ActivitiesSection', count: 'activitiesCount' },
    { id: 'notes', label: 'Notes', component: 'NotesSection', count: 'notesCount' },
    { id: 'documents', label: 'Documents', component: 'DocumentsSection', count: 'documentsCount' },
    { id: 'history', label: 'History', component: 'HistorySection' },
  ],

  // Quick Actions (in header)
  quickActions: [
    { id: 'edit', label: 'Edit', icon: Edit },
    { id: 'advance', label: 'Advance Stage', icon: ArrowRight, variant: 'default' },
    { id: 'closeWon', label: 'Close Won', icon: Trophy, variant: 'success', visibility: (d) => d.status === 'open' },
    { id: 'closeLost', label: 'Close Lost', icon: X, variant: 'destructive', visibility: (d) => d.status === 'open' },
  ],
}
```

**UI Components**:
- `src/components/crm/deals/DealPipeline.tsx` - Kanban board with drag-drop
- `src/components/crm/deals/DealCard.tsx` - Card in kanban view
- `src/components/crm/deals/DealInlinePanel.tsx` - Side panel (480px width)
- `src/components/crm/deals/DealStakeholders.tsx` - Contact relationship management
- `src/components/crm/deals/DealProducts.tsx` - Line items with calculations
- `src/components/crm/deals/DealCompetition.tsx` - Competitor analysis
- `src/components/crm/deals/sections/` - Section components

### 1.4 DEALS-01 Gap Analysis

| Requirement | Current State | Gap | Priority |
|-------------|---------------|-----|----------|
| `company_id` FK | `account_id` exists | Rename column (breaking change) or add alias | LOW |
| `lead_contact_id` FK | Not present | Add FK column + migration | MEDIUM |
| `deal_contacts` junction | `deal_stakeholders` exists | Already complete | NONE |
| ARR/MRR fields | Present with validation | Complete | NONE |
| Multi-currency | `currency` field only | Need exchange_rate table | LOW |
| Stage history to entity_history | Separate table | Migration needed | MEDIUM |
| Weighted pipeline reporting | `weighted_value` generated | Complete | NONE |
| Product line items | `deal_products` with calculations | Complete | NONE |
| Competitor tracking | `deal_competitors` table | Complete | NONE |

**Estimated Completion**: 60% - Schema mostly ready, needs FK updates and history consolidation.

---

## 2. Communications System (COMMS-01)

### 2.1 Database Schema - Complete Specification

**Email Templates Table**
- **Location**: `supabase/migrations/00000000000000_baseline.sql` lines 17963-17990

```sql
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Template Identity
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100),  -- For programmatic access

  -- Content
  subject VARCHAR(500) NOT NULL,
  body_html TEXT,
  body_text TEXT,  -- Plain text fallback

  -- Classification
  category VARCHAR(100) CHECK (category IN ('outreach', 'follow_up', 'notification', 'transactional', 'marketing')),

  -- Merge Fields
  variables JSONB DEFAULT '[]',  -- Array of { name, description, default_value }

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id)
);

CREATE UNIQUE INDEX idx_email_templates_slug ON email_templates(org_id, slug) WHERE deleted_at IS NULL;
```

**Email Sends Table** (Delivery tracking)
- **Location**: `supabase/migrations/00000000000000_baseline.sql` lines 17917-17942

```sql
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  template_id UUID REFERENCES email_templates(id),

  -- Recipient
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  recipient_type VARCHAR(50) CHECK (recipient_type IN ('contact', 'candidate', 'user', 'external')),
  recipient_id UUID,  -- Polymorphic reference

  -- Entity Context (what this email is about)
  entity_type VARCHAR(50),
  entity_id UUID,

  -- Resolved Content
  subject VARCHAR(500),
  body_html TEXT,
  body_text TEXT,

  -- Delivery Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam', 'unsubscribed')),

  -- Timestamps
  queued_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  opened_count INTEGER DEFAULT 0,
  clicked_at TIMESTAMPTZ,
  clicked_count INTEGER DEFAULT 0,

  -- Error Handling
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- Provider
  provider VARCHAR(50) DEFAULT 'resend',
  provider_message_id VARCHAR(255),
  provider_batch_id VARCHAR(255),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_email_sends_recipient ON email_sends(recipient_email);
CREATE INDEX idx_email_sends_entity ON email_sends(entity_type, entity_id);
CREATE INDEX idx_email_sends_status ON email_sends(status, next_retry_at) WHERE status IN ('pending', 'queued');
```

**Email Logs Table** (Event tracking)
- **Location**: `supabase/migrations/00000000000000_baseline.sql` lines 17871-17890

```sql
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_send_id UUID REFERENCES email_sends(id) ON DELETE CASCADE,

  -- Event Details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed')),
  event_data JSONB,  -- Provider-specific event payload

  -- Tracking Info
  ip_address INET,
  user_agent TEXT,
  click_url TEXT,  -- For click events

  -- Timestamp
  occurred_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_email_logs_send ON email_logs(email_send_id);
CREATE INDEX idx_email_logs_event ON email_logs(event_type, occurred_at DESC);
```

### 2.2 Activities Table (Unified Communication Log)

**Location**: `supabase/migrations/00000000000000_baseline.sql` lines 11671-11711

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic Entity Link (supports multiple entities per activity)
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('account', 'contact', 'deal', 'job', 'candidate', 'submission', 'placement', 'campaign', 'lead')),
  entity_id UUID NOT NULL,

  -- Secondary Entity (optional - for linking activity to multiple entities)
  secondary_entity_type VARCHAR(50),
  secondary_entity_id UUID,

  -- Activity Type
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'call', 'meeting', 'note', 'linkedin_message', 'sms', 'task', 'follow_up', 'demo', 'proposal', 'contract_sent', 'system')),
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),

  -- Content
  subject VARCHAR(500),
  description TEXT,

  -- Type-specific Metadata
  metadata JSONB DEFAULT '{}',
  /*
  For 'email': { template_id, email_send_id, thread_id }
  For 'call': { phone_number, duration_seconds, call_recording_url, outcome }
  For 'meeting': { location, attendees[], meeting_link, calendar_event_id }
  For 'linkedin_message': { linkedin_profile_url, message_id }
  For 'sms': { phone_number, sms_send_id }
  */

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('scheduled', 'open', 'in_progress', 'completed', 'skipped', 'canceled')),
  outcome VARCHAR(100),  -- 'connected', 'left_voicemail', 'no_answer', 'busy', 'wrong_number', 'meeting_held', 'meeting_canceled'
  outcome_notes TEXT,

  -- Assignment
  assignee_id UUID REFERENCES user_profiles(id),

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_pinned BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id)
);

-- Performance Indexes (21 total)
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_secondary ON activities(secondary_entity_type, secondary_entity_id) WHERE secondary_entity_id IS NOT NULL;
CREATE INDEX idx_activities_assignee ON activities(assignee_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_due ON activities(due_date) WHERE status IN ('open', 'in_progress') AND deleted_at IS NULL;
CREATE INDEX idx_activities_type ON activities(org_id, type) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_status ON activities(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_created ON activities(org_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_activities_pinned ON activities(entity_type, entity_id) WHERE is_pinned = true AND deleted_at IS NULL;
```

### 2.3 tRPC Router - Activities

**Location**: `src/server/routers/activities.ts`
**Procedure Count**: 15

| Procedure | Type | Input Schema | Description |
|-----------|------|--------------|-------------|
| `log` | Mutation | `{ entityType, entityId, type, subject?, description?, metadata?, scheduledAt?, dueDate?, assigneeId? }` | Create activity |
| `listByEntity` | Query | `{ entityType, entityId, types?, page?, pageSize? }` | Activities for entity |
| `getById` | Query | `{ id }` | Single activity with creator |
| `update` | Mutation | `{ id, subject?, description?, status?, outcome?, outcomeNotes? }` | Update activity |
| `delete` | Mutation | `{ id }` | Soft delete |
| `complete` | Mutation | `{ id, outcome?, outcomeNotes? }` | Mark completed |
| `skip` | Mutation | `{ id, reason? }` | Skip with reason |
| `reschedule` | Mutation | `{ id, dueDate }` | Update due date |
| `reassign` | Mutation | `{ id, assigneeId }` | Change assignee |
| `getMyTasks` | Query | `{ status?, dueDate?, types? }` | Assigned to current user |
| `getOverdue` | Query | `{ limit? }` | Overdue activities |
| `getDueToday` | Query | - | Due today |
| `getDueThisWeek` | Query | - | Due this week |
| `stats` | Query | `{ entityType?, entityId? }` | Activity metrics by type |
| `pin` | Mutation | `{ id }` | Pin/unpin activity |

### 2.4 Email Template Service

**Location**: `src/lib/email/template-service.ts` lines 120-238

```typescript
interface SendTemplatedEmailParams {
  orgId: string;
  templateId?: string;
  templateSlug?: string;
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  variables?: Record<string, string | number | boolean>;
  entityType?: string;
  entityId?: string;
  userId?: string;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType: string }>;
}

export async function sendTemplatedEmail({
  orgId,
  templateId,
  templateSlug,
  to,
  variables = {},
  entityType,
  entityId,
  userId,
  ...options
}: SendTemplatedEmailParams): Promise<EmailSend> {
  // 1. Fetch template by ID or slug
  const template = templateId
    ? await getTemplateById(templateId)
    : await getTemplateBySlug(orgId, templateSlug);

  if (!template || !template.is_active) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Template not found or inactive' });
  }

  // 2. Merge variables into template
  const resolvedSubject = renderTemplate(template.subject, variables);
  const resolvedHtml = renderTemplate(template.body_html, variables);
  const resolvedText = renderTemplate(template.body_text, variables);

  // 3. Create email_send record
  const [emailSend] = await adminClient
    .from('email_sends')
    .insert({
      org_id: orgId,
      template_id: template.id,
      recipient_email: Array.isArray(to) ? to[0] : to,
      recipient_type: entityType ? mapEntityTypeToRecipientType(entityType) : 'external',
      entity_type: entityType,
      entity_id: entityId,
      subject: resolvedSubject,
      body_html: resolvedHtml,
      body_text: resolvedText,
      status: 'pending',
      created_by: userId,
    })
    .select()
    .single();

  // 4. Send via Resend
  const result = await resend.emails.send({
    from: `InTime <${process.env.EMAIL_FROM || 'noreply@intime.io'}>`,
    to: Array.isArray(to) ? to : [to],
    cc: options.cc,
    bcc: options.bcc,
    subject: resolvedSubject,
    html: resolvedHtml,
    text: resolvedText,
    reply_to: options.replyTo,
    attachments: options.attachments,
    headers: {
      'X-Entity-Type': entityType || '',
      'X-Entity-Id': entityId || '',
      'X-Email-Send-Id': emailSend.id,
    },
  });

  // 5. Update with provider ID and status
  await adminClient
    .from('email_sends')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      provider_message_id: result.data?.id,
    })
    .eq('id', emailSend.id);

  // 6. Create activity log
  if (entityType && entityId) {
    await adminClient.from('activities').insert({
      org_id: orgId,
      entity_type: entityType,
      entity_id: entityId,
      type: 'email',
      direction: 'outbound',
      subject: resolvedSubject,
      metadata: {
        template_id: template.id,
        email_send_id: emailSend.id,
        recipient: to,
      },
      status: 'completed',
      completed_at: new Date().toISOString(),
      created_by: userId,
    });
  }

  return emailSend;
}
```

### 2.5 COMMS-01 Gap Analysis

| Requirement | Current State | Gap | Priority |
|-------------|---------------|-----|----------|
| Unified communications table | `activities` (polymorphic) | Complete | NONE |
| Email templates | `email_templates` table | Complete | NONE |
| Email tracking (opens/clicks) | `email_sends` + `email_logs` | Complete | NONE |
| Resend webhook handler | Not implemented | **MISSING** - Need `/api/webhooks/resend` | HIGH |
| Thread tracking | Not present | **MISSING** - Need `thread_id` and threading logic | HIGH |
| Call logging | Via `activities.type = 'call'` | Complete | NONE |
| Call recording integration | `metadata.call_recording_url` | Placeholder only | MEDIUM |
| LinkedIn tracking | Via `activities.type = 'linkedin_message'` | Complete | NONE |
| SMS support | Schema exists, no provider | **MISSING** - Need Twilio integration | MEDIUM |
| Unified inbox view | Not present | **MISSING** - Need new component | MEDIUM |
| Conversation threading | Not present | **MISSING** - Need threading UI | HIGH |
| Reply detection | Not present | **MISSING** - Need inbound email parsing | HIGH |

**Estimated Completion**: 50% - Basic infrastructure complete, needs threading, webhooks, and SMS.

---

## 3. Workflow Automation System (WORKFLOWS-01)

### 3.1 CRITICAL: Schema Mismatch Analysis

**THE WORKFLOW ENGINE IS NON-FUNCTIONAL**

The workflow engine code expects a different schema than what exists in the database. This is a critical blocker.

**Tables in Database (Actual)**:
| Table | Lines | Description |
|-------|-------|-------------|
| `workflows` | 25487-25500 | Workflow definitions with JSONB |
| `workflow_states` | 25447-25459 | State definitions |
| `workflow_transitions` | 25978-26005 | Transition rules |
| `workflow_instances` | 25402-25419 | Entity workflow tracking |
| `workflow_history` | 25811-25835 | State change history |

**Tables Expected by Code (Missing)**:
| Table | Expected By | Purpose |
|-------|-------------|---------|
| `workflow_executions` | workflow-engine.ts:89 | Execution run tracking |
| `workflow_steps` | workflow-engine.ts:145 | Step-by-step execution |
| `workflow_actions` | workflow-engine.ts:203 | Action execution log |
| `workflow_approvals` | workflow-engine.ts:267 | Approval chain tracking |
| `workflow_execution_logs` | workflow-engine.ts:312 | Detailed execution logs |

### 3.2 Database Schema (Current)

```sql
-- workflows (lines 25487-25500)
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Definition
  name VARCHAR(255) NOT NULL,
  description TEXT,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('job', 'submission', 'placement', 'deal', 'candidate', 'campaign')),

  -- JSONB Definition (entire workflow structure)
  definition JSONB NOT NULL,
  /*
  {
    "triggers": [
      { "type": "status_change", "from": null, "to": "submitted" },
      { "type": "field_change", "field": "stage_id" }
    ],
    "states": [...],  // Duplicated in workflow_states table
    "transitions": [...],  // Duplicated in workflow_transitions table
    "actions": [
      { "type": "send_email", "template_id": "xxx" },
      { "type": "create_activity", "activity_type": "task" },
      { "type": "update_field", "field": "status", "value": "in_progress" }
    ]
  }
  */

  -- Versioning
  version INTEGER DEFAULT 1,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id)
);

-- workflow_states (lines 25447-25459)
CREATE TABLE workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- State Definition
  name VARCHAR(100) NOT NULL,
  state_type VARCHAR(50) NOT NULL CHECK (state_type IN ('initial', 'intermediate', 'terminal', 'error')),

  -- Configuration
  config JSONB DEFAULT '{}',
  /*
  {
    "entry_actions": [...],
    "exit_actions": [...],
    "timeout": { "days": 3, "action": "escalate" },
    "allowed_transitions": ["state_id_1", "state_id_2"]
  }
  */

  -- Ordering
  position INTEGER DEFAULT 0,

  -- Display
  color VARCHAR(20),
  icon VARCHAR(50),

  created_at TIMESTAMPTZ DEFAULT now()
);

-- workflow_transitions (lines 25978-26005)
CREATE TABLE workflow_transitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- From/To States
  from_state_id UUID REFERENCES workflow_states(id),
  to_state_id UUID NOT NULL REFERENCES workflow_states(id),

  -- Transition Definition
  name VARCHAR(100),

  -- Conditions (all must be true)
  conditions JSONB DEFAULT '[]',
  /*
  [
    { "field": "value", "operator": "gte", "value": 10000 },
    { "field": "approval_status", "operator": "eq", "value": "approved" }
  ]
  */

  -- Actions to Execute
  actions JSONB DEFAULT '[]',
  /*
  [
    { "type": "send_email", "template_id": "xxx", "to": "owner" },
    { "type": "create_task", "assignee": "manager", "due_days": 1 }
  ]
  */

  -- Permissions Required
  permissions JSONB DEFAULT '[]',
  /* ["deals.advance_stage", "deals.close"] */

  -- Approvals Required (if any)
  requires_approval BOOLEAN DEFAULT false,
  approval_config JSONB,
  /*
  {
    "approvers": [{ "type": "role", "value": "manager" }],
    "min_approvals": 1,
    "timeout_hours": 48
  }
  */

  created_at TIMESTAMPTZ DEFAULT now()
);

-- workflow_instances (lines 25402-25419)
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  workflow_id UUID NOT NULL REFERENCES workflows(id),

  -- Entity Being Tracked
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Current State
  current_state_id UUID REFERENCES workflow_states(id),

  -- Instance Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled', 'error')),

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,

  -- Runtime Context
  context JSONB DEFAULT '{}',  -- Variables accumulated during execution

  -- Audit
  created_by UUID REFERENCES user_profiles(id),

  UNIQUE(workflow_id, entity_type, entity_id)
);

-- workflow_history (lines 25811-25835)
CREATE TABLE workflow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,

  -- Transition
  from_state_id UUID REFERENCES workflow_states(id),
  to_state_id UUID REFERENCES workflow_states(id),
  transition_id UUID REFERENCES workflow_transitions(id),

  -- Context
  triggered_by UUID REFERENCES user_profiles(id),
  trigger_type VARCHAR(50),  -- 'manual', 'automatic', 'timeout', 'approval'

  -- Execution Details
  actions_executed JSONB DEFAULT '[]',
  conditions_evaluated JSONB DEFAULT '[]',

  -- Notes
  notes TEXT,

  occurred_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.3 tRPC Router - Complete Inventory

**Location**: `src/server/routers/workflows.ts`
**Procedure Count**: 25 (18 BROKEN due to missing tables)

| Procedure | Type | Status | Description |
|-----------|------|--------|-------------|
| `list` | Query | **WORKING** | All workflows for org |
| `getById` | Query | **WORKING** | Single workflow with states/transitions |
| `create` | Mutation | **WORKING** | Create workflow |
| `update` | Mutation | **WORKING** | Update workflow definition |
| `delete` | Mutation | **WORKING** | Soft delete |
| `activate` | Mutation | **WORKING** | Activate workflow |
| `deactivate` | Mutation | **WORKING** | Deactivate workflow |
| `duplicate` | Mutation | **PARTIAL** | Clone workflow (states copy fails) |
| `setDefault` | Mutation | **WORKING** | Set as default for entity type |
| `addState` | Mutation | **WORKING** | Add state to workflow |
| `updateState` | Mutation | **WORKING** | Update state |
| `removeState` | Mutation | **WORKING** | Remove state |
| `addTransition` | Mutation | **WORKING** | Add transition |
| `updateTransition` | Mutation | **WORKING** | Update transition |
| `removeTransition` | Mutation | **WORKING** | Remove transition |
| `getInstance` | Query | **WORKING** | Get workflow instance for entity |
| `startInstance` | Mutation | **BROKEN** | References workflow_executions |
| `transitionInstance` | Mutation | **BROKEN** | References workflow_actions |
| `getHistory` | Query | **WORKING** | Transition history |
| `getAvailableTransitions` | Query | **WORKING** | Valid next states |
| `cancelInstance` | Mutation | **PARTIAL** | Cancel workflow |
| `restartInstance` | Mutation | **BROKEN** | References workflow_executions |
| `execute` | Mutation | **BROKEN** | Full execution engine |
| `createApproval` | Mutation | **BROKEN** | References workflow_approvals |
| `approveStep` | Mutation | **BROKEN** | References workflow_approvals |

### 3.4 Workflow Engine Code Analysis

**Location**: `src/lib/workflows/workflow-engine.ts`

```typescript
// This code is BROKEN - references tables that don't exist
export class WorkflowEngine {
  private db: Database;
  private eventEmitter: EventEmitter;

  async startExecution(instanceId: string, triggeredBy: string) {
    // ERROR: workflow_executions table doesn't exist
    const execution = await this.db.insert(workflow_executions).values({
      instance_id: instanceId,
      status: 'running',
      started_at: new Date(),
      triggered_by: triggeredBy,
    }).returning();

    return execution;
  }

  async executeStep(executionId: string, stepConfig: StepConfig) {
    // ERROR: workflow_steps table doesn't exist
    const step = await this.db.insert(workflow_steps).values({
      execution_id: executionId,
      step_type: stepConfig.type,
      config: stepConfig,
      status: 'pending',
    }).returning();

    // Execute actions
    for (const action of stepConfig.actions) {
      await this.executeAction(executionId, action);
    }

    return step;
  }

  async executeAction(executionId: string, action: WorkflowAction) {
    // ERROR: workflow_actions table doesn't exist
    const actionRecord = await this.db.insert(workflow_actions).values({
      execution_id: executionId,
      action_type: action.type,
      config: action,
      status: 'pending',
    }).returning();

    switch (action.type) {
      case 'send_email':
        await this.sendEmailAction(action, executionId);
        break;
      case 'create_task':
        await this.createTaskAction(action, executionId);
        break;
      case 'update_field':
        await this.updateFieldAction(action, executionId);
        break;
      case 'webhook':
        await this.webhookAction(action, executionId);
        break;
      case 'wait':
        await this.waitAction(action, executionId);
        break;
    }

    return actionRecord;
  }

  async createApprovalRequest(executionId: string, config: ApprovalConfig) {
    // ERROR: workflow_approvals table doesn't exist
    const approvals = await Promise.all(
      config.approvers.map(approver =>
        this.db.insert(workflow_approvals).values({
          execution_id: executionId,
          approver_id: approver.id,
          approver_type: approver.type,
          status: 'pending',
          requested_at: new Date(),
          due_at: addHours(new Date(), config.timeout_hours || 48),
        }).returning()
      )
    );

    return approvals;
  }
}
```

### 3.5 Resolution Options

**Option A: Create Missing Tables**
```sql
-- Create the tables expected by the workflow engine
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  instance_id UUID NOT NULL REFERENCES workflow_instances(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  triggered_by UUID REFERENCES user_profiles(id),
  trigger_type VARCHAR(50),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  position INTEGER NOT NULL
);

CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES workflow_steps(id),
  action_type VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  result JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE TABLE workflow_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES user_profiles(id),
  approver_type VARCHAR(50),  -- 'user', 'role', 'manager'
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'escalated', 'expired')),
  requested_at TIMESTAMPTZ DEFAULT now(),
  due_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  response_notes TEXT
);

CREATE TABLE workflow_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  level VARCHAR(20) NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  data JSONB,
  occurred_at TIMESTAMPTZ DEFAULT now()
);
```

**Option B: Refactor Engine to Use Existing Tables**
- Use `workflow_instances.context` for execution state
- Use `workflow_history` for step/action logging
- Add approval tracking to `workflow_history.actions_executed`
- Simplify engine to state-machine approach

**Recommendation**: **Option A** - The engine code is well-designed for complex workflows. Creating the missing tables is cleaner than refactoring.

### 3.6 WORKFLOWS-01 Gap Analysis

| Requirement | Current State | Gap | Priority |
|-------------|---------------|-----|----------|
| Workflow definitions | `workflows`, `workflow_states`, `workflow_transitions` | Complete | NONE |
| Workflow instances | `workflow_instances` | Complete | NONE |
| State machine execution | Engine code exists | **BROKEN - Missing tables** | CRITICAL |
| Trigger system | Defined in JSONB | **NOT IMPLEMENTED** | HIGH |
| Condition evaluation | Partial in transitions | **NOT IMPLEMENTED** | HIGH |
| Action execution | Engine code exists | **BROKEN - Missing tables** | CRITICAL |
| Approval workflows | Engine code exists | **BROKEN - Missing table** | HIGH |
| Execution history | `workflow_history` exists | Partial | MEDIUM |
| Parallel branches | Not present | **MISSING** | MEDIUM |
| Timeout handling | Config exists | **NOT IMPLEMENTED** | MEDIUM |
| Error recovery | Not present | **MISSING** | MEDIUM |

**Estimated Completion**: 30% - Definitions ready, execution engine completely non-functional.

---

## 4. Notification System (NOTIFICATIONS-01)

### 4.1 Database Schema - Current

**Notifications Table**
- **Location**: `supabase/migrations/00000000000000_baseline.sql` lines 21252-21274

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Recipient
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error', 'action_required')),
  category VARCHAR(100) CHECK (category IN ('submission', 'interview', 'placement', 'deal', 'campaign', 'workflow', 'system', 'mention', 'assignment')),

  -- Entity Context
  entity_type VARCHAR(50),
  entity_id UUID,

  -- Action
  action_url TEXT,  -- Where to navigate
  action_label VARCHAR(100),  -- Button text

  -- Read State
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Archive State
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,

  -- Multi-Channel Delivery
  channels JSONB DEFAULT '["in_app"]',  -- ['in_app', 'email', 'sms', 'push']
  delivery_status JSONB DEFAULT '{}',  -- { in_app: 'delivered', email: 'sent', ... }

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Grouping (for collapsing similar notifications)
  group_key VARCHAR(100),
  group_count INTEGER DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false AND is_archived = false;
CREATE INDEX idx_notifications_entity ON notifications(entity_type, entity_id);
CREATE INDEX idx_notifications_group ON notifications(user_id, group_key) WHERE group_key IS NOT NULL;
```

### 4.2 Missing Tables (Referenced by Router)

**notification_preferences** - User notification settings
```sql
-- MISSING - Needs to be created
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  -- Category-specific settings
  category VARCHAR(100) NOT NULL,

  -- Channel Preferences
  channels JSONB DEFAULT '["in_app"]',  -- Enabled channels for this category

  -- Frequency
  frequency VARCHAR(50) DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'hourly_digest', 'daily_digest', 'weekly_digest', 'never')),

  -- Quiet Hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,  -- e.g., '22:00'
  quiet_hours_end TIME,    -- e.g., '08:00'
  quiet_hours_timezone VARCHAR(50) DEFAULT 'America/New_York',

  -- Do Not Disturb
  dnd_enabled BOOLEAN DEFAULT false,
  dnd_until TIMESTAMPTZ,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, category)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
```

**notification_templates** - Template definitions
```sql
-- MISSING - Needs to be created
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Template Identity
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,  -- Programmatic identifier
  category VARCHAR(100) NOT NULL,

  -- Content Templates (with variable placeholders)
  title_template VARCHAR(500) NOT NULL,  -- e.g., "New submission for {{job.title}}"
  message_template TEXT NOT NULL,

  -- Channel-specific Templates
  email_subject_template VARCHAR(500),
  email_body_template TEXT,
  sms_template VARCHAR(500),  -- 160 char limit
  push_title_template VARCHAR(100),
  push_body_template VARCHAR(255),

  -- Default Channels
  default_channels JSONB DEFAULT '["in_app"]',

  -- Variables Definition
  variables JSONB DEFAULT '[]',  -- [{ name, type, required, description }]

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,  -- Built-in templates

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(org_id, slug)
);

CREATE INDEX idx_notification_templates_category ON notification_templates(org_id, category) WHERE is_active = true;
```

### 4.3 tRPC Router

**Location**: `src/server/routers/notifications.ts`
**Procedure Count**: 12 (3 BROKEN)

| Procedure | Type | Status | Description |
|-----------|------|--------|-------------|
| `listRecent` | Query | **WORKING** | Recent notifications with pagination |
| `getUnread` | Query | **WORKING** | Unread notifications |
| `getUnreadCount` | Query | **WORKING** | Count of unread |
| `markAsRead` | Mutation | **WORKING** | Mark single as read |
| `markAllAsRead` | Mutation | **WORKING** | Mark all as read |
| `archive` | Mutation | **WORKING** | Archive notification |
| `archiveAll` | Mutation | **WORKING** | Archive all read |
| `delete` | Mutation | **WORKING** | Delete notification |
| `getStats` | Query | **WORKING** | Notification statistics |
| `getPreferences` | Query | **BROKEN** | References missing table |
| `updatePreference` | Mutation | **BROKEN** | References missing table |
| `getTemplates` | Query | **BROKEN** | References missing table |

### 4.4 Notification Service (Proposed)

```typescript
// src/lib/notifications/notification-service.ts

interface SendNotificationParams {
  orgId: string;
  userId: string;
  templateSlug?: string;
  category: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'action_required';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionLabel?: string;
  variables?: Record<string, string | number>;
  channels?: string[];
  groupKey?: string;
}

export async function sendNotification(params: SendNotificationParams) {
  // 1. Get user preferences for this category
  const preferences = await getUserPreferences(params.userId, params.category);

  // 2. Resolve channels (respecting preferences)
  const channels = resolveChannels(params.channels, preferences);

  // 3. Check quiet hours / DND
  if (isInQuietHours(preferences)) {
    channels = channels.filter(c => c === 'in_app');  // Only in-app during quiet hours
  }

  // 4. Resolve template if provided
  let title = params.title;
  let message = params.message;
  if (params.templateSlug) {
    const template = await getTemplate(params.orgId, params.templateSlug);
    title = renderTemplate(template.title_template, params.variables);
    message = renderTemplate(template.message_template, params.variables);
  }

  // 5. Create notification record
  const notification = await createNotification({
    ...params,
    title,
    message,
    channels,
    delivery_status: {},
  });

  // 6. Deliver to each channel
  const deliveryPromises = channels.map(async (channel) => {
    switch (channel) {
      case 'in_app':
        // Immediate - already in DB
        return { channel, status: 'delivered' };
      case 'email':
        return await deliverEmail(notification, preferences);
      case 'sms':
        return await deliverSms(notification, preferences);
      case 'push':
        return await deliverPush(notification, preferences);
    }
  });

  const results = await Promise.allSettled(deliveryPromises);

  // 7. Update delivery status
  await updateDeliveryStatus(notification.id, results);

  // 8. Emit real-time event (for WebSocket)
  await emitNotificationEvent(params.userId, notification);

  return notification;
}
```

### 4.5 NOTIFICATIONS-01 Gap Analysis

| Requirement | Current State | Gap | Priority |
|-------------|---------------|-----|----------|
| In-app notifications | `notifications` table | Complete | NONE |
| Email delivery | Via Resend integration | Complete | NONE |
| SMS delivery | Not present | **MISSING** - Need Twilio | MEDIUM |
| Push notifications | Not present | **MISSING** - Need FCM/APNs | LOW |
| User preferences | Router exists | **BROKEN - Table missing** | HIGH |
| Notification templates | Router exists | **BROKEN - Table missing** | HIGH |
| Real-time delivery | Not present | **MISSING** - Need WebSocket/SSE | HIGH |
| Digest support | Frequency field planned | **NOT IMPLEMENTED** | MEDIUM |
| Quiet hours | Schema planned | **NOT IMPLEMENTED** | LOW |
| Notification grouping | `group_key` exists | Partial | LOW |

**Estimated Completion**: 40% - Basic in-app works, preferences/templates/realtime missing.

---

## 5. Campaign Management System (CAMPAIGNS-01)

### 5.1 Database Schema - Complete Specification

**Campaigns Table**
- **Location**: `supabase/migrations/00000000000000_baseline.sql` lines 15028-15091

```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL CHECK (campaign_type IN ('outreach', 'nurture', 're_engagement', 'event', 'announcement', 'recruitment', 'referral')),

  -- Targeting Segment
  target_segment JSONB DEFAULT '{}',
  /*
  {
    "filters": [
      { "field": "job_title", "operator": "contains", "value": "engineer" },
      { "field": "company_size", "operator": "gte", "value": 100 }
    ],
    "exclude_enrolled_in_campaigns": ["campaign_id_1"],
    "exclude_recent_contact_days": 30
  }
  */

  -- Channels
  channels JSONB DEFAULT '["email"]',  -- ['email', 'linkedin', 'phone', 'sms']

  -- Scheduling
  start_date DATE,
  end_date DATE,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  send_window_start TIME DEFAULT '09:00',
  send_window_end TIME DEFAULT '17:00',
  send_days JSONB DEFAULT '["mon","tue","wed","thu","fri"]',

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),
  activated_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Budget & Goals
  budget NUMERIC(12,2),
  goal_metrics JSONB DEFAULT '{}',  -- { enrollments: 1000, opens: 500, replies: 100, meetings: 50 }

  -- A/B Testing
  ab_test_enabled BOOLEAN DEFAULT false,
  ab_test_config JSONB,
  /*
  {
    "variants": [
      { "id": "A", "name": "Control", "weight": 50 },
      { "id": "B", "name": "Variant B", "weight": 50 }
    ],
    "winner_criteria": "open_rate",  // 'open_rate', 'click_rate', 'reply_rate'
    "sample_size_percent": 20,
    "auto_select_winner": true,
    "selection_delay_hours": 24
  }
  */
  ab_test_winner VARCHAR(50),
  ab_test_winner_selected_at TIMESTAMPTZ,

  -- Compliance
  compliance_settings JSONB DEFAULT '{}',
  /*
  {
    "include_unsubscribe_link": true,
    "honor_opt_outs": true,
    "gdpr_compliant": true,
    "can_spam_compliant": true
  }
  */

  -- Performance Metrics (Denormalized)
  total_enrolled INTEGER DEFAULT 0,
  total_active INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  total_replied INTEGER DEFAULT 0,
  total_bounced INTEGER DEFAULT 0,
  total_unsubscribed INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id),
  owner_id UUID REFERENCES user_profiles(id)
);

-- Indexes
CREATE INDEX idx_campaigns_org ON campaigns(org_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON campaigns(org_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_owner ON campaigns(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type ON campaigns(org_id, campaign_type) WHERE deleted_at IS NULL;
```

**Campaign Enrollments Table**
- **Location**: lines 14371-14400

```sql
CREATE TABLE campaign_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES contacts(id),

  -- Enrollment Status
  status VARCHAR(50) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'active', 'paused', 'completed', 'unsubscribed', 'bounced', 'replied', 'converted', 'excluded')),

  -- Sequence Progress
  current_step INTEGER DEFAULT 0,
  next_step_at TIMESTAMPTZ,
  last_step_at TIMESTAMPTZ,
  steps_completed INTEGER DEFAULT 0,

  -- A/B Variant Assignment
  ab_variant VARCHAR(50),

  -- Engagement Metrics
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  calls_made INTEGER DEFAULT 0,
  linkedin_sent INTEGER DEFAULT 0,
  sms_sent INTEGER DEFAULT 0,

  -- Engagement Score (0-100)
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  engagement_level VARCHAR(20) CHECK (engagement_level IN ('cold', 'warm', 'hot', 'engaged')),
  last_engagement_at TIMESTAMPTZ,

  -- Conversion Tracking
  converted_at TIMESTAMPTZ,
  conversion_type VARCHAR(50),  -- 'lead', 'meeting', 'opportunity', 'deal', 'placement'
  conversion_entity_id UUID,

  -- Compliance
  opted_out_at TIMESTAMPTZ,
  opt_out_reason TEXT,
  opt_out_channel VARCHAR(50),  -- 'email', 'manual', 'link'

  -- Error Tracking
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,

  -- Audit
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  enrolled_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(campaign_id, contact_id)
);

-- Performance Indexes
CREATE INDEX idx_enrollments_campaign ON campaign_enrollments(campaign_id) WHERE status = 'active';
CREATE INDEX idx_enrollments_contact ON campaign_enrollments(contact_id);
CREATE INDEX idx_enrollments_next_step ON campaign_enrollments(next_step_at) WHERE status = 'active';
CREATE INDEX idx_enrollments_engagement ON campaign_enrollments(campaign_id, engagement_level) WHERE status = 'active';
```

**Campaign Sequences Table**
- **Location**: lines 14592-14660

```sql
CREATE TABLE campaign_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,

  -- Step Position
  step_number INTEGER NOT NULL,
  name VARCHAR(255),

  -- Channel
  channel VARCHAR(50) NOT NULL CHECK (channel IN ('email', 'linkedin', 'phone', 'sms', 'task', 'wait')),

  -- Timing (delay from previous step)
  delay_days INTEGER DEFAULT 0 CHECK (delay_days >= 0),
  delay_hours INTEGER DEFAULT 0 CHECK (delay_hours >= 0 AND delay_hours < 24),
  delay_minutes INTEGER DEFAULT 0 CHECK (delay_minutes >= 0 AND delay_minutes < 60),

  -- Send Window
  send_time TIME,  -- Preferred send time
  send_days JSONB DEFAULT '["mon","tue","wed","thu","fri"]',

  -- Content (for email/linkedin/sms)
  template_id UUID REFERENCES email_templates(id),
  subject VARCHAR(500),
  body_html TEXT,
  body_text TEXT,

  -- A/B Variants for this step
  ab_variants JSONB,
  /*
  [
    { "id": "A", "subject": "Subject A", "body_html": "...", "weight": 50 },
    { "id": "B", "subject": "Subject B", "body_html": "...", "weight": 50 }
  ]
  */

  -- Task Configuration (for channel = 'task')
  task_config JSONB,
  /*
  {
    "title": "Follow up call",
    "description": "...",
    "assignee_type": "owner",  // 'owner', 'specific_user', 'round_robin'
    "assignee_id": null,
    "priority": "high",
    "due_hours": 24
  }
  */

  -- Skip Conditions
  skip_conditions JSONB DEFAULT '[]',
  /*
  [
    { "field": "has_replied", "operator": "eq", "value": true },
    { "field": "engagement_score", "operator": "gte", "value": 80 }
  ]
  */

  -- Reply Detection
  stop_on_reply BOOLEAN DEFAULT true,
  reply_detection_window_hours INTEGER DEFAULT 72,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(campaign_id, step_number)
);
```

**Campaign Sequence Logs Table** (Execution history)
- **Location**: lines 14708-14750

```sql
CREATE TABLE campaign_sequence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  campaign_id UUID REFERENCES campaigns(id),
  enrollment_id UUID REFERENCES campaign_enrollments(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES campaign_sequences(id),

  -- Step Info
  step_number INTEGER NOT NULL,
  channel VARCHAR(50) NOT NULL,

  -- Content Snapshot (what was actually sent)
  content_snapshot JSONB,
  ab_variant VARCHAR(50),

  -- Delivery Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed', 'skipped')),

  -- Timestamps
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Open/Click Counts
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,

  -- Error Tracking
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,

  -- Provider Info
  provider VARCHAR(50),
  provider_message_id VARCHAR(255),

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sequence_logs_enrollment ON campaign_sequence_logs(enrollment_id);
CREATE INDEX idx_sequence_logs_status ON campaign_sequence_logs(status, scheduled_at) WHERE status IN ('pending', 'scheduled');
```

### 5.2 tRPC Router - Complete Inventory

**Location**: `src/server/routers/crm.ts` lines 4586-6923
**Procedure Count**: 35

**Campaign CRUD**:
| Procedure | Type | Input Schema | Description |
|-----------|------|--------------|-------------|
| `campaigns.list` | Query | `{ page?, pageSize?, status?, type?, ownerId?, search? }` | Paginated list |
| `campaigns.getById` | Query | `{ id }` | Campaign with counts |
| `campaigns.create` | Mutation | `CreateCampaignInput` | Create campaign |
| `campaigns.update` | Mutation | `{ id, ...UpdateCampaignInput }` | Update campaign |
| `campaigns.delete` | Mutation | `{ id }` | Soft delete |
| `campaigns.duplicate` | Mutation | `{ id, name }` | Clone campaign |
| `campaigns.stats` | Query | - | Dashboard metrics |

**Campaign Lifecycle**:
| Procedure | Type | Description |
|-----------|------|-------------|
| `campaigns.activate` | Mutation | Start campaign (sets status = 'active') |
| `campaigns.pause` | Mutation | Pause campaign |
| `campaigns.resume` | Mutation | Resume paused campaign |
| `campaigns.complete` | Mutation | Mark as completed |
| `campaigns.cancel` | Mutation | Cancel campaign |

**Enrollment Management**:
| Procedure | Type | Description |
|-----------|------|-------------|
| `campaigns.enrollments.list` | Query | List enrollments with filters |
| `campaigns.enrollments.add` | Mutation | Enroll single contact |
| `campaigns.enrollments.addBulk` | Mutation | Bulk enroll contacts |
| `campaigns.enrollments.remove` | Mutation | Remove enrollment |
| `campaigns.enrollments.pause` | Mutation | Pause enrollment |
| `campaigns.enrollments.resume` | Mutation | Resume enrollment |
| `campaigns.enrollments.updateStatus` | Mutation | Update enrollment status |
| `campaigns.enrollments.updateEngagement` | Mutation | Update engagement score |
| `campaigns.enrollments.markConverted` | Mutation | Mark as converted |

**Sequence Builder**:
| Procedure | Type | Description |
|-----------|------|-------------|
| `campaigns.sequences.list` | Query | List sequence steps |
| `campaigns.sequences.add` | Mutation | Add sequence step |
| `campaigns.sequences.update` | Mutation | Update step |
| `campaigns.sequences.remove` | Mutation | Remove step |
| `campaigns.sequences.reorder` | Mutation | Reorder steps |
| `campaigns.sequences.duplicate` | Mutation | Duplicate step |
| `campaigns.sequences.preview` | Query | Preview step for contact |

**Execution (MANUAL)**:
| Procedure | Type | Description |
|-----------|------|-------------|
| `campaigns.sequences.execute` | Mutation | Execute step for enrollment |
| `campaigns.sequences.skip` | Mutation | Skip step for enrollment |
| `campaigns.sequences.retry` | Mutation | Retry failed step |

**Analytics**:
| Procedure | Type | Description |
|-----------|------|-------------|
| `campaigns.analytics.overview` | Query | High-level metrics |
| `campaigns.analytics.funnel` | Query | Conversion funnel data |
| `campaigns.analytics.engagement` | Query | Engagement breakdown |
| `campaigns.analytics.timeline` | Query | Activity over time |
| `campaigns.analytics.abTest` | Query | A/B test results |

### 5.3 Frontend Components

**Campaign Creation Wizard Store**
- **Location**: `src/stores/create-campaign-store.ts`

```typescript
interface CreateCampaignFormData {
  // Step 1: Setup
  name: string;
  description: string;
  campaignType: string;
  channels: string[];
  ownerId: string;

  // Step 2: Audience
  targetSegment: {
    filters: Array<{ field: string; operator: string; value: any }>;
    excludeEnrolledIn: string[];
    excludeRecentContactDays: number;
  };
  estimatedAudienceSize: number;

  // Step 3: Sequence
  sequences: Array<{
    stepNumber: number;
    channel: string;
    delayDays: number;
    delayHours: number;
    templateId?: string;
    subject?: string;
    bodyHtml?: string;
    taskConfig?: object;
    skipConditions: object[];
  }>;

  // Step 4: Schedule
  startDate: string;
  endDate?: string;
  timezone: string;
  sendWindowStart: string;
  sendWindowEnd: string;
  sendDays: string[];

  // Step 5: Review
  abTestEnabled: boolean;
  abTestConfig?: object;
  complianceSettings: object;
  goalMetrics: object;
}

export const useCreateCampaignStore = create<CreateCampaignStore>()(
  persist(
    (set) => ({
      formData: defaultFormData,
      currentStep: 1,
      isDirty: false,
      lastSaved: null,

      setFormData: (data) => set((state) => ({
        formData: { ...state.formData, ...data },
        isDirty: true,
        lastSaved: new Date(),
      })),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetForm: () => set({
        formData: defaultFormData,
        currentStep: 1,
        isDirty: false,
        lastSaved: null,
      }),
    }),
    {
      name: 'create-campaign-draft',
      version: 1,
    }
  )
);
```

**UI Component Tree**:
```
src/components/crm/campaigns/
├── CampaignList.tsx              # PCF list view
├── CampaignDetail.tsx            # Workspace container
├── CampaignWorkspace.tsx         # Main workspace
├── sections/
│   ├── CampaignOverviewSection.tsx
│   ├── CampaignAudienceSection.tsx
│   ├── CampaignSequenceSection.tsx
│   ├── CampaignAnalyticsSection.tsx
│   ├── CampaignActivitiesSection.tsx
│   ├── CampaignNotesSection.tsx
│   └── CampaignDocumentsSection.tsx
├── sequence/
│   ├── SequenceBuilder.tsx       # Visual step editor
│   ├── SequenceStep.tsx          # Individual step card
│   ├── SequenceStepForm.tsx      # Step edit modal
│   ├── SequencePreview.tsx       # Email preview
│   └── SequenceTimeline.tsx      # Timeline visualization
├── enrollments/
│   ├── EnrollmentsList.tsx       # Prospect table
│   ├── EnrollmentCard.tsx        # Individual prospect
│   ├── EnrollmentDetail.tsx      # Side panel
│   └── BulkEnrollmentModal.tsx   # Bulk add
├── analytics/
│   ├── CampaignFunnel.tsx        # Conversion funnel
│   ├── EngagementChart.tsx       # Engagement over time
│   ├── ABTestResults.tsx         # A/B test comparison
│   └── ChannelBreakdown.tsx      # Per-channel metrics
└── wizard/
    ├── CreateCampaignWizard.tsx  # Main wizard
    ├── steps/
    │   ├── SetupStep.tsx
    │   ├── AudienceStep.tsx
    │   ├── SequenceStep.tsx
    │   ├── ScheduleStep.tsx
    │   └── ReviewStep.tsx
    └── CampaignWizardSidebar.tsx
```

### 5.4 Campaign Automation Engine (MISSING)

**Current State**: All sequence execution is MANUAL. There is no automated progression.

**Proposed Implementation**:

```typescript
// src/lib/campaigns/campaign-automation-engine.ts

export class CampaignAutomationEngine {
  // Scheduled job runner (cron every minute)
  async processScheduledSteps() {
    // 1. Get all active enrollments with due steps
    const dueEnrollments = await this.getDueEnrollments();

    for (const enrollment of dueEnrollments) {
      try {
        await this.executeNextStep(enrollment);
      } catch (error) {
        await this.handleStepError(enrollment, error);
      }
    }
  }

  async getDueEnrollments() {
    return await db
      .from('campaign_enrollments')
      .select(`
        *,
        campaign:campaigns(*),
        contact:contacts(*),
        current_sequence:campaign_sequences!inner(*)
      `)
      .eq('status', 'active')
      .lte('next_step_at', new Date().toISOString())
      .limit(100);  // Process in batches
  }

  async executeNextStep(enrollment: Enrollment) {
    const sequence = await this.getNextSequence(enrollment);
    if (!sequence) {
      return await this.completeEnrollment(enrollment);
    }

    // Check skip conditions
    if (await this.shouldSkipStep(enrollment, sequence)) {
      return await this.skipToNextStep(enrollment, sequence);
    }

    // Execute based on channel
    switch (sequence.channel) {
      case 'email':
        await this.sendEmail(enrollment, sequence);
        break;
      case 'linkedin':
        await this.createLinkedInTask(enrollment, sequence);
        break;
      case 'phone':
        await this.createCallTask(enrollment, sequence);
        break;
      case 'sms':
        await this.sendSms(enrollment, sequence);
        break;
      case 'task':
        await this.createTask(enrollment, sequence);
        break;
      case 'wait':
        // Just update next_step_at
        break;
    }

    // Log execution
    await this.createSequenceLog(enrollment, sequence, 'sent');

    // Calculate next step timing
    await this.scheduleNextStep(enrollment, sequence);
  }

  async handleReplyDetection(emailSendId: string) {
    // Called by webhook when reply detected
    const log = await this.findLogByEmailSend(emailSendId);
    if (!log) return;

    const enrollment = await this.getEnrollment(log.enrollment_id);
    const sequence = await this.getSequence(log.sequence_id);

    if (sequence.stop_on_reply) {
      await this.pauseEnrollment(enrollment, 'replied');
    }

    // Update engagement
    await this.updateEngagement(enrollment, 'replied');
  }
}
```

### 5.5 CAMPAIGNS-01 Gap Analysis

| Requirement | Current State | Gap | Priority |
|-------------|---------------|-----|----------|
| Campaign definitions | `campaigns` table with full config | Complete | NONE |
| Multi-channel support | `channels` JSONB field | Complete | NONE |
| Sequence builder | `campaign_sequences` table + UI | Complete | NONE |
| Enrollment management | `campaign_enrollments` + procedures | Complete | NONE |
| Touchpoint tracking | `campaign_sequence_logs` table | Complete | NONE |
| A/B testing config | Fields + JSONB config | Complete | NONE |
| A/B test execution | Not implemented | **MISSING** - Need variant selection | MEDIUM |
| A/B winner selection | Not implemented | **MISSING** - Need auto-selection | MEDIUM |
| Engagement scoring | 0-100 score field | Complete | NONE |
| **Automated execution** | Manual only | **MISSING** - Need automation engine | CRITICAL |
| Scheduled job runner | Not present | **MISSING** - Need cron job | CRITICAL |
| Reply detection | Not present | **MISSING** - Need inbound webhook | HIGH |
| Bounce handling | Not present | **MISSING** - Need email webhook | HIGH |
| Analytics dashboard | Basic charts | Partial | MEDIUM |
| Funnel visualization | Component exists | Complete | NONE |
| Compliance (opt-out) | Fields + logic exist | Complete | NONE |
| Send window enforcement | Config exists | **NOT IMPLEMENTED** | MEDIUM |

**Estimated Completion**: 80% - Infrastructure ready, needs automated execution engine.

---

## 6. Polymorphic Infrastructure (Cross-Cutting)

### 6.1 Entity History Table

**Location**: `supabase/migrations/00000000000000_baseline.sql` lines 18295-18345
**Partitioning**: Monthly partitions for performance

```sql
CREATE TABLE entity_history (
  id UUID DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic Entity Reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Change Type
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN ('created', 'updated', 'deleted', 'status_change', 'stage_change', 'assignment_change', 'field_change')),

  -- Field-Level Tracking
  field_name VARCHAR(100),
  old_value JSONB,
  new_value JSONB,

  -- Context
  metadata JSONB DEFAULT '{}',

  -- Audit
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT now(),

  PRIMARY KEY (id, changed_at)
) PARTITION BY RANGE (changed_at);

-- Create monthly partitions
CREATE TABLE entity_history_2024_01 PARTITION OF entity_history
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
-- ... more partitions

-- Indexes
CREATE INDEX idx_entity_history_entity ON entity_history(entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_entity_history_org ON entity_history(org_id, changed_at DESC);
CREATE INDEX idx_entity_history_user ON entity_history(changed_by, changed_at DESC);
```

### 6.2 Documents Table

**Location**: lines 16421-16480

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic Entity Reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- File Info
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  file_hash VARCHAR(64),  -- SHA-256 for deduplication

  -- Classification
  category VARCHAR(100),  -- 'resume', 'contract', 'proposal', 'collateral', 'compliance'
  document_type VARCHAR(100),  -- More specific: 'signed_contract', 'nda', 'offer_letter'

  -- Versioning
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES documents(id),  -- Previous version
  is_current BOOLEAN DEFAULT true,

  -- OCR/Text Extraction
  extracted_text TEXT,
  ocr_status VARCHAR(20) CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),

  -- Expiration
  expires_at TIMESTAMPTZ,
  expiration_notified_at TIMESTAMPTZ,

  -- Access Control
  visibility VARCHAR(20) DEFAULT 'internal' CHECK (visibility IN ('internal', 'client', 'candidate', 'public')),

  -- Audit
  uploaded_by UUID REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_expiring ON documents(expires_at) WHERE expires_at IS NOT NULL AND deleted_at IS NULL;
```

### 6.3 Comments Table

**Location**: lines 15872-15920

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic Entity Reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Content
  content TEXT NOT NULL,
  content_html TEXT,  -- Rich text rendered

  -- Threading
  parent_id UUID REFERENCES comments(id),
  root_id UUID REFERENCES comments(id),  -- Top-level comment
  thread_depth INTEGER DEFAULT 0,

  -- Mentions
  mentions JSONB DEFAULT '[]',  -- [{ user_id, display_name, position }]

  -- Reactions
  reactions JSONB DEFAULT '{}',  -- { "thumbs_up": ["user_id_1"], "heart": ["user_id_2"] }

  -- Status
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_thread ON comments(root_id) WHERE deleted_at IS NULL;
```

### 6.4 Notes Table

**Location**: lines 21052-21095

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Polymorphic Entity Reference
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,

  -- Content
  title VARCHAR(255),
  content TEXT NOT NULL,
  content_html TEXT,

  -- Classification
  note_type VARCHAR(50) CHECK (note_type IN ('general', 'internal', 'client_facing', 'action_item', 'decision', 'risk', 'blocker')),

  -- Pinning & Priority
  is_pinned BOOLEAN DEFAULT false,
  pinned_at TIMESTAMPTZ,
  priority VARCHAR(20) CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Tagging
  tags JSONB DEFAULT '[]',

  -- Reminders
  reminder_at TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,

  -- Search
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B')
  ) STORED,

  -- Audit
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_notes_entity ON notes(entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_pinned ON notes(entity_type, entity_id) WHERE is_pinned = true AND deleted_at IS NULL;
CREATE INDEX idx_notes_search ON notes USING gin(search_vector);
```

### 6.5 Entity Type Registry

**Location**: lines 18150-18180

```sql
CREATE TABLE entity_type_registry (
  entity_type VARCHAR(50) PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  supports_activities BOOLEAN DEFAULT true,
  supports_notes BOOLEAN DEFAULT true,
  supports_documents BOOLEAN DEFAULT true,
  supports_comments BOOLEAN DEFAULT true,
  supports_history BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed data
INSERT INTO entity_type_registry VALUES
  ('account', 'accounts', 'Account', true, true, true, true, true),
  ('contact', 'contacts', 'Contact', true, true, true, true, true),
  ('job', 'jobs', 'Job', true, true, true, true, true),
  ('candidate', 'candidates', 'Candidate', true, true, true, true, true),
  ('submission', 'submissions', 'Submission', true, true, true, true, true),
  ('placement', 'placements', 'Placement', true, true, true, true, true),
  ('deal', 'deals', 'Deal', true, true, true, true, true),
  ('lead', 'leads', 'Lead', true, true, true, true, true),
  ('campaign', 'campaigns', 'Campaign', true, true, true, true, true);

-- Validation function
CREATE OR REPLACE FUNCTION validate_entity_type(p_entity_type VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM entity_type_registry WHERE entity_type = p_entity_type);
END;
$$ LANGUAGE plpgsql;
```

---

## 7. tRPC Router Summary

### 7.1 Complete Router Inventory

| Router | File | Procedures | Working | Broken | Notes |
|--------|------|------------|---------|--------|-------|
| `crm.deals` | `src/server/routers/crm.ts:2088-3253` | 20 | 20 | 0 | Complete |
| `crm.campaigns` | `src/server/routers/crm.ts:4586-6923` | 35 | 35 | 0 | Complete |
| `activities` | `src/server/routers/activities.ts` | 15 | 15 | 0 | Complete |
| `workflows` | `src/server/routers/workflows.ts` | 25 | 7 | 18 | Schema mismatch |
| `notifications` | `src/server/routers/notifications.ts` | 12 | 9 | 3 | Missing tables |
| `documents` | `src/server/routers/documents.ts` | 8 | 8 | 0 | Complete |
| `comments` | `src/server/routers/comments.ts` | 6 | 6 | 0 | Complete |
| `notes` | `src/server/routers/notes.ts` | 8 | 8 | 0 | Complete |
| `history` | `src/server/routers/history.ts` | 4 | 4 | 0 | Complete |

**Wave 6 Total**: 133 procedures (112 working, 21 broken)

### 7.2 Common Router Patterns

All routers follow consistent patterns:

```typescript
// 1. Org-protected procedure
export const entityRouter = router({
  list: orgProtectedProcedure
    .input(z.object({
      page: z.number().default(1),
      pageSize: z.number().default(25),
      search: z.string().optional(),
      status: z.enum(['active', 'inactive']).optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Always filter by org_id and deleted_at
      const { data, count } = await adminClient
        .from('entities')
        .select('*', { count: 'exact' })
        .eq('org_id', ctx.orgId)
        .is('deleted_at', null)
        .range(
          (input.page - 1) * input.pageSize,
          input.page * input.pageSize - 1
        );

      return {
        items: data,
        pagination: {
          total: count,
          page: input.page,
          pageSize: input.pageSize,
          totalPages: Math.ceil(count / input.pageSize),
        },
      };
    }),
});

// 2. Input validation with Zod
const createInput = z.object({
  name: z.string().min(1).max(255),
  status: z.enum(['draft', 'active']).default('draft'),
  metadata: z.record(z.unknown()).optional(),
});

// 3. Audit fields
.mutation(async ({ ctx, input }) => {
  const [record] = await adminClient
    .from('entities')
    .insert({
      ...input,
      org_id: ctx.orgId,
      created_by: ctx.userId,
      updated_by: ctx.userId,
    })
    .select()
    .single();

  // Create history entry
  await adminClient.from('entity_history').insert({
    org_id: ctx.orgId,
    entity_type: 'entity',
    entity_id: record.id,
    change_type: 'created',
    changed_by: ctx.userId,
  });

  return record;
});
```

---

## 8. Implementation Roadmap

### 8.1 Critical Path (Must Fix First)

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 0: Critical Fixes (Week 1)                                │
├─────────────────────────────────────────────────────────────────┤
│ 1. Create missing workflow tables (Option A)                   │
│    - workflow_executions                                        │
│    - workflow_steps                                             │
│    - workflow_actions                                           │
│    - workflow_approvals                                         │
│    - workflow_execution_logs                                    │
│                                                                 │
│ 2. Create missing notification tables                          │
│    - notification_preferences                                   │
│    - notification_templates                                     │
│                                                                 │
│ 3. Run migration and verify                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Wave 6 Implementation Order

Based on dependencies and business priority:

```
WEEK 1-2: DEALS-01 (60% → 100%)
├── Migration: Add lead_contact_id FK
├── Migration: Consolidate deal_stages_history → entity_history
├── Verify: All 20 procedures working
└── Test: E2E deal lifecycle

WEEK 3-4: COMMS-01 (50% → 85%)
├── Implement: Resend webhook handler (/api/webhooks/resend)
├── Add: Email thread tracking (thread_id, in_reply_to)
├── Add: Unified inbox component
├── Integrate: Reply detection
└── Test: Email send/receive/track flow

WEEK 5-6: WORKFLOWS-01 Phase 1 (30% → 75%)
├── Create: Missing tables (5)
├── Verify: All 25 procedures working
├── Implement: Trigger system (status_change, field_change)
├── Implement: Condition evaluator
├── Implement: Action executor (email, task, field_update)
└── Test: Basic workflow execution

WEEK 7: NOTIFICATIONS-01 (40% → 80%)
├── Create: Missing tables (2)
├── Verify: All 12 procedures working
├── Implement: Real-time delivery (Supabase Realtime)
├── Add: Preference management UI
└── Test: Multi-channel delivery

WEEK 8: WORKFLOWS-01 Phase 2 (0% → 60%)
├── Implement: Notification actions
├── Implement: Approval workflows
├── Add: Workflow builder UI enhancements
└── Test: Complex approval chains

WEEK 9-10: CAMPAIGNS-01 (80% → 100%)
├── Implement: Campaign automation engine
├── Add: Scheduled job runner (cron)
├── Implement: Reply detection via webhooks
├── Implement: A/B test winner selection
├── Implement: Send window enforcement
└── Test: Full automated campaign flow
```

### 8.3 Dependency Graph

```
                    ┌──────────────────┐
                    │   DEALS-01       │
                    │   (Independent)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   COMMS-01       │
                    │   (Email base)   │
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
  ┌────────▼─────────┐ ┌─────▼──────┐ ┌───────▼────────┐
  │ WORKFLOWS-01 P1  │ │NOTIFICATIONS│ │  CAMPAIGNS-01  │
  │ (Core Engine)    │ │   -01       │ │ (Automation)   │
  └────────┬─────────┘ └─────┬──────┘ └───────┬────────┘
           │                 │                 │
           └─────────────────┼─────────────────┘
                             │
                    ┌────────▼─────────┐
                    │ WORKFLOWS-01 P2  │
                    │ (Integration)    │
                    └──────────────────┘
```

### 8.4 Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Workflow schema migration breaks existing data | Low | High | No existing workflow instances |
| Email webhook integration failures | Medium | Medium | Retry queue, manual fallback |
| Campaign automation overwhelms email provider | Medium | High | Rate limiting, batching |
| Real-time notifications impact performance | Low | Medium | Use Supabase Realtime, not polling |
| A/B test winner selection bias | Medium | Low | Statistical significance checks |

---

## 9. Testing Strategy

### 9.1 Unit Tests

| Component | Test Coverage Target | Priority |
|-----------|---------------------|----------|
| Workflow Engine | 90% | HIGH |
| Campaign Automation Engine | 85% | HIGH |
| Notification Service | 80% | MEDIUM |
| Email Template Rendering | 85% | MEDIUM |
| Condition Evaluator | 95% | HIGH |

### 9.2 Integration Tests

| Flow | Description | Priority |
|------|-------------|----------|
| Deal Lifecycle | Create → Stage progression → Close | HIGH |
| Email Send/Track | Template → Send → Open → Click | HIGH |
| Workflow Execution | Trigger → Condition → Action | CRITICAL |
| Campaign Sequence | Enroll → Step execution → Complete | CRITICAL |
| Notification Delivery | Create → Multi-channel deliver | MEDIUM |

### 9.3 E2E Tests

| Scenario | Steps | Priority |
|----------|-------|----------|
| Deal Win Flow | Create deal → Add products → Progress stages → Close won | HIGH |
| Campaign Execution | Create → Add prospects → Execute sequence → Track opens | CRITICAL |
| Approval Workflow | Trigger → Create approval → Approve → Continue | HIGH |
| Notification Preferences | Set preferences → Trigger notification → Verify channels | MEDIUM |

---

## 10. File Reference Index

### 10.1 Database Migrations

| File | Lines | Content |
|------|-------|---------|
| `supabase/migrations/00000000000000_baseline.sql` | - | Complete schema |
| Lines 17525-17623 | deals | Deal table |
| Lines 17411-17518 | deal_* | Deal related tables |
| Lines 17871-17990 | email_* | Email tables |
| Lines 11671-11711 | activities | Activities table |
| Lines 25402-26005 | workflow_* | Workflow tables |
| Lines 21252-21274 | notifications | Notifications table |
| Lines 14371-14750 | campaign_* | Campaign tables |
| Lines 18295-18345 | entity_history | History (partitioned) |
| Lines 16421-16480 | documents | Documents table |
| Lines 15872-15920 | comments | Comments table |
| Lines 21052-21095 | notes | Notes table |

### 10.2 tRPC Routers

| File | Lines | Procedures |
|------|-------|------------|
| `src/server/routers/crm.ts` | 2088-3253 | Deals (20) |
| `src/server/routers/crm.ts` | 4586-6923 | Campaigns (35) |
| `src/server/routers/activities.ts` | Full | Activities (15) |
| `src/server/routers/workflows.ts` | Full | Workflows (25) |
| `src/server/routers/notifications.ts` | Full | Notifications (12) |

### 10.3 Service Layer

| File | Purpose |
|------|---------|
| `src/lib/email/template-service.ts` | Email template rendering |
| `src/lib/email/resend-client.ts` | Resend API client |
| `src/lib/workflows/workflow-engine.ts` | Workflow execution (BROKEN) |
| `src/lib/notifications/notification-service.ts` | Notification delivery (PROPOSED) |
| `src/lib/campaigns/campaign-automation-engine.ts` | Campaign execution (PROPOSED) |

### 10.4 Frontend Components

| Path | Purpose |
|------|---------|
| `src/configs/entities/deals.config.ts` | Deals PCF config |
| `src/configs/entities/campaigns.config.ts` | Campaigns PCF config |
| `src/stores/create-campaign-store.ts` | Campaign wizard store |
| `src/components/crm/deals/` | Deal components |
| `src/components/crm/campaigns/` | Campaign components |

---

## 11. Appendix: Issue Specifications

Detailed issue specifications are located at:
- `thoughts/shared/issues/deals-01/` - DEALS-01 spec
- `thoughts/shared/issues/comms-01/` - COMMS-01 spec
- `thoughts/shared/issues/workflows-01/` - WORKFLOWS-01 spec
- `thoughts/shared/issues/notifications-01/` - NOTIFICATIONS-01 spec
- `thoughts/shared/issues/campaigns-01/` - CAMPAIGNS-01 spec

Each directory contains:
- `problem.md` - Problem description
- `proposed-schema.sql` - Schema changes
- `migration-strategy.md` - Migration approach
- `acceptance-criteria.md` - Success criteria
- `rollback-plan.md` - Rollback procedure

---

## 12. Appendix: GitHub Permalinks

All line references are based on commit `76890fa` on branch `main`.

Example permalink format:
```
https://github.com/[org]/intime-v3/blob/76890fa/supabase/migrations/00000000000000_baseline.sql#L17525-L17623
```

---

*Document generated: 2025-12-13T05:40:33-05:00*
*Git commit: 76890fa*
*Branch: main*
*Repository: intime-v3*
