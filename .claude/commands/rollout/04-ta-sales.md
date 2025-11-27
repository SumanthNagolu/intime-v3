# Phase 3: Talent Acquisition / Sales

## Component Overview

**Priority:** HIGH
**Dependencies:** Authentication (Phase 0)
**Blocks:** None (parallel with Recruiting)

---

## Scope

### Database Tables
- `campaigns` - Outreach campaigns
- `campaign_contacts` - Campaign recipients
- `engagement_tracking` - Email/call tracking
- `leads` - Sales leads
- `accounts` - Client accounts
- `deals` - Sales pipeline

### Server Actions (TO CREATE)
- `src/app/actions/ta-leads.ts` - Lead management
- `src/app/actions/ta-campaigns.ts` - Campaign CRUD
- `src/app/actions/ta-deals.ts` - Deal pipeline
- `src/app/actions/ta-accounts.ts` - Account management

### UI Components
- `src/components/sales/TADashboard.tsx`
- `src/components/sales/CampaignManager.tsx`
- `src/components/recruiting/LeadsList.tsx`
- `src/components/recruiting/LeadDetail.tsx`
- `src/components/recruiting/AccountsList.tsx`
- `src/components/recruiting/AccountDetail.tsx`
- `src/components/recruiting/DealsPipeline.tsx`
- `src/components/recruiting/DealDetail.tsx`

### Pages
- `src/app/employee/ta/dashboard/page.tsx`

---

## Phase 1: Audit

### 1.1 Schema Check

Read and verify:
```
src/lib/db/schema/crm.ts
src/lib/db/schema/ta-hr.ts
```

Check for:
- `campaigns` table structure
- `leads` with qualification fields
- `accounts` for client companies
- `deals` with stage pipeline

### 1.2 Component Inventory

Document current state of:
- TADashboard.tsx - Metrics and overview
- CampaignManager.tsx - Campaign CRUD
- LeadsList.tsx / LeadDetail.tsx - Lead management
- DealsPipeline.tsx - Kanban/pipeline view

---

## Phase 2: Database Fixes

### 2.1 Ensure CRM Tables

```sql
-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  -- Contact info
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,

  -- Lead info
  source TEXT, -- 'linkedin', 'referral', 'cold_call', 'website'
  status TEXT DEFAULT 'new', -- new, contacted, qualified, converted, lost
  industry TEXT,
  company_size TEXT,
  estimated_value NUMERIC(12,2),

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id),

  -- Tracking
  last_contacted_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'email', 'linkedin', 'cold_call', 'multi_channel'
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed

  -- Targeting
  target_criteria JSONB,

  -- Content
  email_template TEXT,
  linkedin_template TEXT,
  call_script TEXT,

  -- Schedule
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Metrics
  total_contacts INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  responses_received INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  name TEXT NOT NULL,
  account_id UUID REFERENCES accounts(id),
  lead_id UUID REFERENCES leads(id),

  -- Pipeline
  stage TEXT DEFAULT 'prospecting', -- prospecting, qualification, proposal, negotiation, closed_won, closed_lost
  probability INTEGER DEFAULT 10,
  amount NUMERIC(12,2),

  -- Assignment
  owner_id UUID REFERENCES user_profiles(id),

  -- Timeline
  expected_close_date DATE,
  actual_close_date DATE,

  -- Details
  description TEXT,
  next_steps TEXT,

  -- Audit
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 RLS Policies

```sql
-- Leads: TA/Sales can view org leads
CREATE POLICY "ta_view_leads" ON leads FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Campaigns: TA/Sales access
CREATE POLICY "ta_campaigns" ON campaigns FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);

-- Deals: Sales team access
CREATE POLICY "ta_deals" ON deals FOR ALL USING (
  org_id = (SELECT org_id FROM user_profiles WHERE auth_id = auth.uid())
);
```

---

## Phase 3: Server Actions

### 3.1 Lead Management

Create `src/app/actions/ta-leads.ts`:

```typescript
'use server';

// List leads with filters
export async function listLeadsAction(filters?: {
  status?: string;
  assignedTo?: string;
  source?: string;
  search?: string;
  page?: number;
}): Promise<ActionResult<{ leads: Lead[]; total: number }>>

// Get lead detail
export async function getLeadAction(leadId: string): Promise<ActionResult<LeadWithActivity>>

// Create lead
export async function createLeadAction(input: {
  companyName: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  source: string;
  industry?: string;
  estimatedValue?: number;
}): Promise<ActionResult<Lead>>

// Update lead
export async function updateLeadAction(leadId: string, input: Partial<Lead>): Promise<ActionResult<Lead>>

// Qualify lead
export async function qualifyLeadAction(leadId: string, input: {
  status: 'qualified' | 'not_qualified';
  notes: string;
}): Promise<ActionResult<Lead>>

// Convert lead to account
export async function convertLeadAction(leadId: string): Promise<ActionResult<{ account: Account; deal?: Deal }>>

// Log activity
export async function logLeadActivityAction(leadId: string, input: {
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  outcome?: string;
}): Promise<ActionResult<void>>
```

### 3.2 Campaign Management

Create `src/app/actions/ta-campaigns.ts`:

```typescript
'use server';

// List campaigns
export async function listCampaignsAction(): Promise<ActionResult<Campaign[]>>

// Get campaign with contacts
export async function getCampaignAction(campaignId: string): Promise<ActionResult<CampaignWithContacts>>

// Create campaign
export async function createCampaignAction(input: {
  name: string;
  type: string;
  emailTemplate?: string;
  linkedinTemplate?: string;
  targetCriteria?: object;
}): Promise<ActionResult<Campaign>>

// Update campaign
export async function updateCampaignAction(campaignId: string, input: Partial<Campaign>): Promise<ActionResult<Campaign>>

// Launch campaign
export async function launchCampaignAction(campaignId: string): Promise<ActionResult<Campaign>>

// Pause campaign
export async function pauseCampaignAction(campaignId: string): Promise<ActionResult<Campaign>>

// Add contacts to campaign
export async function addCampaignContactsAction(campaignId: string, contactIds: string[]): Promise<ActionResult<void>>

// Get campaign analytics
export async function getCampaignAnalyticsAction(campaignId: string): Promise<ActionResult<CampaignAnalytics>>
```

### 3.3 Deal Pipeline

Create `src/app/actions/ta-deals.ts`:

```typescript
'use server';

// List deals by stage
export async function listDealsAction(filters?: {
  stage?: string;
  ownerId?: string;
  minAmount?: number;
  maxAmount?: number;
}): Promise<ActionResult<Deal[]>>

// Get deal detail
export async function getDealAction(dealId: string): Promise<ActionResult<DealWithActivity>>

// Create deal
export async function createDealAction(input: {
  name: string;
  accountId?: string;
  leadId?: string;
  amount?: number;
  expectedCloseDate?: string;
}): Promise<ActionResult<Deal>>

// Update deal stage
export async function updateDealStageAction(dealId: string, stage: string): Promise<ActionResult<Deal>>

// Close deal (won/lost)
export async function closeDealAction(dealId: string, input: {
  won: boolean;
  amount?: number;
  notes?: string;
}): Promise<ActionResult<Deal>>

// Get pipeline summary
export async function getPipelineSummaryAction(): Promise<ActionResult<PipelineSummary>>
```

---

## Phase 4: UI Integration

### 4.1 TADashboard.tsx

Wire metrics:
- Total leads by status
- Active campaigns count
- Pipeline value by stage
- Recent activities

### 4.2 LeadsList.tsx

```typescript
const [leads, setLeads] = useState<Lead[]>([]);
const [filters, setFilters] = useState({});

useEffect(() => {
  listLeadsAction(filters).then(result => {
    if (result.success) setLeads(result.data.leads);
  });
}, [filters]);
```

### 4.3 DealsPipeline.tsx

Implement Kanban board:
```typescript
const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];

const handleDragEnd = async (dealId: string, newStage: string) => {
  const result = await updateDealStageAction(dealId, newStage);
  if (result.success) {
    refreshDeals();
    toast.success('Deal updated');
  }
};
```

### 4.4 CampaignManager.tsx

Wire campaign CRUD:
- Create campaign form
- Contact import
- Launch/pause controls
- Analytics display

---

## Phase 5: E2E Tests

### Test File: `tests/e2e/ta-sales-workflows.spec.ts`

```typescript
test.describe('TA/Sales Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'jr_ta@intime.com', 'TestPass123!');
  });

  // Leads
  test('can view leads list');
  test('can create new lead');
  test('can update lead status');
  test('can qualify lead');
  test('can convert lead to account');
  test('can log activity on lead');

  // Campaigns
  test('can create campaign');
  test('can add contacts to campaign');
  test('can launch campaign');
  test('can pause campaign');
  test('can view campaign analytics');

  // Deals
  test('can view deal pipeline');
  test('can create deal');
  test('can drag deal to new stage');
  test('can close deal as won');
  test('can close deal as lost');
  test('pipeline summary shows correct totals');

  // Access Control
  test('recruiter can view leads');
  test('ta_sales can manage campaigns');
});
```

---

## Phase 6: Verification Checklist

### Database
- [ ] leads table exists with RLS
- [ ] campaigns table exists with RLS
- [ ] deals table exists with RLS
- [ ] engagement_tracking table exists
- [ ] Indexes on org_id, status, assigned_to

### Server Actions
- [ ] Lead CRUD operations work
- [ ] Lead qualification workflow works
- [ ] Lead conversion creates account
- [ ] Campaign CRUD works
- [ ] Campaign launch/pause works
- [ ] Deal pipeline operations work
- [ ] Stage updates work
- [ ] Deal close (won/lost) works

### UI
- [ ] TADashboard shows real metrics
- [ ] LeadsList loads and filters
- [ ] LeadDetail shows activities
- [ ] CampaignManager full CRUD
- [ ] DealsPipeline drag-and-drop
- [ ] All forms with loading states
- [ ] Toast notifications

### E2E Tests
- [ ] All TA/Sales scenarios passing

---

## Next Step

When complete, run:
```
Execute /rollout/05-recruiting
```
