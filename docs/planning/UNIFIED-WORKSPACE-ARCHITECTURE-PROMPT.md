# InTime v3 - Unified Workspace Architecture Implementation

> **Comprehensive Implementation Prompt for Claude**
> 
> Created: 2025-11-29
> Purpose: Transform InTime from role-specific fragmented portals into a centralized workspace-centric architecture

---

## 🎯 Objective

Transform InTime from role-specific fragmented portals into a **centralized workspace-centric architecture** where:

1. **Core business object workspaces are shared** across teams (Recruiting, Bench Sales, Talent Acquisition)
2. **Role/user-specific consoles** provide personalized views with access control
3. **RCAI ownership model** governs who can do what on each object
4. **Activities and Events** are THE system of record for all operations

---

## 📊 Business Context

### The 5 Pillars of InTime
1. **Training Academy** - 8-week programs, certifications
2. **Recruiting Services** - Fill client jobs with sourced talent
3. **Bench Sales** - Place bench consultants on external/client jobs
4. **Talent Acquisition** - Source new talent through campaigns
5. **Cross-Border** - Immigration, international placements

### Teams Using Shared Workspaces
| Team | Primary Focus | Starting Point |
|------|---------------|----------------|
| **Recruiting** | Fill client jobs | Job → Source Talent → Submit |
| **Bench Sales** | Place bench consultants | Talent → Find Jobs → Submit |
| **Talent Acquisition** | Source new talent | Campaigns → Leads → Talent |

### Pod Structure
- 2-person pods (Senior + Junior)
- Target: 2 placements per 2-week sprint
- Cross-pollination: 1 conversation = 5+ lead opportunities

---

## 📋 Core Business Objects

### Current Objects (Existing)

| Object | Table | Description | Current State |
|--------|-------|-------------|---------------|
| **Campaigns** | `campaigns` | Marketing campaigns for talent sourcing/BD | ✅ Exists |
| **Leads** | `leads` | Company and person leads with BANT scoring | ✅ Exists |
| **Deals** | `deals` | Sales opportunities through pipeline stages | ✅ Exists |
| **Accounts** | `accounts` | Client companies with tiers, contracts | ✅ Exists |
| **Jobs (Requisitions)** | `jobs` | Open positions to fill | ✅ Exists |
| **Submissions** | `submissions` | Job + Candidate match through pipeline | ✅ Exists |
| **External Jobs** | `external_jobs` | Scraped jobs from job boards | ✅ Exists (bench) |

### New Objects (To Create)

| Object | Table | Description |
|--------|-------|-------------|
| **Job Orders** | `job_orders` | Confirmed client orders (vs requisitions which are open positions) |
| **Contacts** | `contacts` | Universal contacts table - POCs, candidates, vendors, all people |

### Object Relationships

```
Campaigns → Leads → Deals → Accounts
                         ↓
                   Job Requisitions → Job Orders
                         ↓              ↓
                   Submissions ←───────┘
                         ↓
              Interviews → Offers → Placements
                         
Contacts ←→ (linked to all objects as participants)
Talent (user_profiles with candidate fields) ←→ Submissions
```

---

## 🏗️ Architecture Design

### Design Principles

1. **Single Workspace per Object Type** - One `LeadsWorkspace` used by all teams
2. **Context from User Role** - Workspace adapts rendering based on user's primary role
3. **RCAI as Access Layer** - 4 owners per object with edit/view permissions
4. **Activities = User Actions** - Every user action creates an activity record
5. **Events = State Changes** - Every state change publishes an event
6. **Nothing Outside Activities + Events** - These two tables ARE the system of record

### Workspace Standard Structure

Every workspace follows this structure:

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                       │
│ [← Back] Object Title          [Status Badge] [Quick Actions]│
├─────────────────────────────────────────────────────────────┤
│ RCAI BAR                                                     │
│ 👤 R: John (Edit) │ 👤 A: Sarah (Edit) │ 👤 C: Mike │ 👤 I: Lisa│
├─────────────────────────────────────────────────────────────┤
│ TAB NAVIGATION (context-aware)                               │
│ [Overview] [Related Tab 1] [Related Tab 2] [Activity] [Docs] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐  │
│  │                     │  │                              │  │
│  │   PRIMARY CONTENT   │  │    SIDEBAR                   │  │
│  │   (Tab content)     │  │    - Quick Stats            │  │
│  │                     │  │    - Related Objects        │  │
│  │                     │  │    - Quick Actions          │  │
│  │                     │  │    - Access Info            │  │
│  │                     │  │                              │  │
│  └─────────────────────┘  └──────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ ACTIVITY COMPOSER (always visible)                           │
│ [📞 Call] [📧 Email] [📝 Note] [✅ Task] [📅 Meeting]        │
└─────────────────────────────────────────────────────────────┘
```

### RCAI Ownership Model

**Roles:**
- **R (Responsible)** - Does the work → EDIT permission
- **A (Accountable)** - Approves/owns outcome → EDIT permission (exactly 1 per object)
- **C (Consulted)** - Provides input → VIEW permission
- **I (Informed)** - Kept updated → VIEW permission

**Rules:**
- Every object MUST have exactly 1 Accountable (primary owner)
- Maximum 2 users can have EDIT permission (typically R + A)
- Managers are included in RCAI (typically as C or I)
- RCAI assignments are **Hybrid**: Auto-assigned on creation, manual override allowed

**Auto-Assignment Rules:**
- Creator → Responsible (Edit)
- Creator's Manager → Informed (View)
- If Deal/Job linked to Account → Account Manager → Consulted (View)
- Pod Partner (if applicable) → Consulted (View)

### Activities vs Events

| Activities | Events |
|------------|--------|
| User-performed actions | System state changes |
| Calls, emails, meetings, notes | Status changes, field updates |
| Manual tasks, follow-ups | Automated triggers |
| WHO did WHAT intentionally | WHAT happened to WHAT |
| Source: User input | Source: Triggers, automations |

**Rule: Nothing happens in the system outside these two tables.**

---

## 🗄️ Schema Changes

### Phase 1: New Tables

#### 1.1 `contacts` Table - Universal Contacts

```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Contact Type
    contact_type TEXT NOT NULL DEFAULT 'general',
    -- Values: 'client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general'
    
    -- Personal Information
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (
        COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')
    ) STORED,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    linkedin_url TEXT,
    
    -- Professional Information  
    title TEXT,
    company_name TEXT,
    company_id UUID REFERENCES accounts(id), -- Nullable, for POCs
    department TEXT,
    
    -- Status & Preferences
    status TEXT NOT NULL DEFAULT 'active',
    -- Values: 'active', 'inactive', 'do_not_contact', 'bounced', 'unsubscribed'
    preferred_contact_method TEXT DEFAULT 'email',
    timezone TEXT DEFAULT 'America/New_York',
    
    -- Source Tracking
    source TEXT,
    source_campaign_id UUID REFERENCES campaigns(id),
    source_lead_id UUID REFERENCES leads(id),
    
    -- For candidates: link to user_profile
    user_profile_id UUID REFERENCES user_profiles(id),
    
    -- Tags & Notes
    tags TEXT[],
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    deleted_at TIMESTAMPTZ,
    
    -- Search
    search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_user_profile_id ON contacts(user_profile_id);
CREATE INDEX idx_contacts_type_status ON contacts(contact_type, status);
CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);

-- RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON contacts
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Trigger for search vector
CREATE OR REPLACE FUNCTION contacts_search_trigger() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english',
        COALESCE(NEW.first_name, '') || ' ' ||
        COALESCE(NEW.last_name, '') || ' ' ||
        COALESCE(NEW.email, '') || ' ' ||
        COALESCE(NEW.company_name, '') || ' ' ||
        COALESCE(NEW.title, '')
    );
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contacts_search_update
    BEFORE INSERT OR UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION contacts_search_trigger();
```

#### 1.2 `job_orders` Table - Confirmed Client Orders

```sql
CREATE TABLE job_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Order Identification
    order_number TEXT UNIQUE, -- Auto-generated: JO-2024-0001
    
    -- Source (where this order came from)
    source_type TEXT NOT NULL DEFAULT 'direct',
    -- Values: 'requisition', 'external_job', 'direct'
    source_job_id UUID REFERENCES jobs(id),
    source_external_job_id UUID REFERENCES external_jobs(id),
    
    -- Client Association (REQUIRED - must have paying client)
    account_id UUID NOT NULL REFERENCES accounts(id),
    deal_id UUID REFERENCES deals(id),
    client_contact_id UUID REFERENCES contacts(id), -- POC who placed order
    
    -- Order Details
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    job_type TEXT DEFAULT 'contract',
    -- Values: 'contract', 'permanent', 'contract_to_hire', 'temp'
    
    -- Location
    location TEXT,
    is_remote BOOLEAN DEFAULT FALSE,
    hybrid_days INTEGER,
    
    -- Rates & Financials
    bill_rate NUMERIC(10,2) NOT NULL,
    pay_rate_max NUMERIC(10,2),
    markup_percentage NUMERIC(5,2),
    currency TEXT DEFAULT 'USD',
    
    -- Positions
    positions_count INTEGER NOT NULL DEFAULT 1,
    positions_filled INTEGER DEFAULT 0,
    
    -- Timing
    start_date DATE,
    end_date DATE,
    duration_months INTEGER,
    
    -- Priority & Status
    priority TEXT NOT NULL DEFAULT 'normal',
    -- Values: 'low', 'normal', 'high', 'urgent', 'critical'
    status TEXT NOT NULL DEFAULT 'pending',
    -- Values: 'pending', 'active', 'on_hold', 'fulfilled', 'cancelled', 'expired'
    
    -- Requirements
    required_skills TEXT[],
    nice_to_have_skills TEXT[],
    min_experience_years INTEGER,
    visa_requirements TEXT[],
    
    -- Notes
    internal_notes TEXT,
    client_notes TEXT,
    submission_instructions TEXT,
    
    -- RCAI Primary Owner
    accountable_id UUID NOT NULL REFERENCES user_profiles(id),
    
    -- Dates
    received_date TIMESTAMPTZ DEFAULT NOW(),
    target_fill_date DATE,
    filled_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    deleted_at TIMESTAMPTZ,
    
    -- Search
    search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_job_orders_org_id ON job_orders(org_id);
CREATE INDEX idx_job_orders_account_id ON job_orders(account_id);
CREATE INDEX idx_job_orders_status ON job_orders(status);
CREATE INDEX idx_job_orders_priority ON job_orders(priority);
CREATE INDEX idx_job_orders_accountable_id ON job_orders(accountable_id);
CREATE INDEX idx_job_orders_source ON job_orders(source_type, source_job_id);

-- RLS
ALTER TABLE job_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON job_orders
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_job_order_number() RETURNS trigger AS $$
DECLARE
    year_part TEXT;
    seq_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(
        CAST(SPLIT_PART(order_number, '-', 3) AS INTEGER)
    ), 0) + 1 INTO seq_num
    FROM job_orders 
    WHERE order_number LIKE 'JO-' || year_part || '-%';
    
    NEW.order_number := 'JO-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_orders_auto_number
    BEFORE INSERT ON job_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_job_order_number();
```

#### 1.3 `object_owners` Table - RCAI Assignments

```sql
CREATE TABLE object_owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Polymorphic Association
    entity_type TEXT NOT NULL,
    -- Values: 'campaign', 'lead', 'deal', 'account', 'job', 'job_order', 
    --         'submission', 'contact', 'external_job'
    entity_id UUID NOT NULL,
    
    -- Owner
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- RCAI Role
    role TEXT NOT NULL,
    -- Values: 'responsible', 'accountable', 'consulted', 'informed'
    
    -- Permission (derived from role, but can be overridden)
    permission TEXT NOT NULL DEFAULT 'view',
    -- Values: 'edit', 'view'
    
    -- Is this the primary owner (Accountable)?
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Assignment metadata
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES user_profiles(id),
    
    -- Auto-assigned or manual?
    assignment_type TEXT DEFAULT 'auto',
    -- Values: 'auto', 'manual'
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(entity_type, entity_id, user_id)
);

-- Indexes
CREATE INDEX idx_object_owners_entity ON object_owners(entity_type, entity_id);
CREATE INDEX idx_object_owners_user ON object_owners(user_id);
CREATE INDEX idx_object_owners_org ON object_owners(org_id);
CREATE INDEX idx_object_owners_role ON object_owners(role);
CREATE INDEX idx_object_owners_permission ON object_owners(permission);

-- RLS
ALTER TABLE object_owners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON object_owners
    FOR ALL
    USING (org_id = (auth.jwt() ->> 'org_id')::uuid);

-- Ensure exactly one Accountable per object
CREATE OR REPLACE FUNCTION check_single_accountable() RETURNS trigger AS $$
BEGIN
    IF NEW.role = 'accountable' THEN
        -- Set is_primary for accountable
        NEW.is_primary := TRUE;
        NEW.permission := 'edit';
        
        -- Remove existing accountable if any
        UPDATE object_owners 
        SET role = 'consulted', is_primary = FALSE, permission = 'view'
        WHERE entity_type = NEW.entity_type 
        AND entity_id = NEW.entity_id 
        AND role = 'accountable'
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    END IF;
    
    -- Responsible gets edit by default
    IF NEW.role = 'responsible' THEN
        NEW.permission := COALESCE(NEW.permission, 'edit');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER object_owners_check_accountable
    BEFORE INSERT OR UPDATE ON object_owners
    FOR EACH ROW EXECUTE FUNCTION check_single_accountable();

-- Function to check if user can access object
CREATE OR REPLACE FUNCTION can_access_object(
    p_user_id UUID,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_required_permission TEXT DEFAULT 'view'
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM object_owners
        WHERE user_id = p_user_id
        AND entity_type = p_entity_type
        AND entity_id = p_entity_id
        AND (
            p_required_permission = 'view' 
            OR permission = 'edit'
        )
    ) INTO v_has_access;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.4 Add `accountable_id` to Core Tables

```sql
-- Add accountable_id to all core object tables
ALTER TABLE leads ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);
ALTER TABLE deals ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);
ALTER TABLE accounts ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);
ALTER TABLE jobs ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);
ALTER TABLE submissions ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);
ALTER TABLE campaigns ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);
ALTER TABLE external_jobs ADD COLUMN accountable_id UUID REFERENCES user_profiles(id);

-- Update existing records: set accountable_id = owner_id
UPDATE leads SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;
UPDATE deals SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;
UPDATE accounts SET accountable_id = account_manager_id WHERE accountable_id IS NULL AND account_manager_id IS NOT NULL;
UPDATE jobs SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;
UPDATE submissions SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;
UPDATE campaigns SET accountable_id = owner_id WHERE accountable_id IS NULL AND owner_id IS NOT NULL;
```

#### 1.5 Update `activities` Table

```sql
-- Add action_code and enhance metadata
ALTER TABLE activities ADD COLUMN action_code TEXT;
ALTER TABLE activities ADD COLUMN action_metadata JSONB DEFAULT '{}';

-- Action codes follow pattern: entity.action
-- Examples: 'lead.create', 'lead.status_change', 'submission.submit_to_client'

-- Index for action queries
CREATE INDEX idx_activities_action_code ON activities(action_code);
CREATE INDEX idx_activities_entity_action ON activities(entity_type, action_code);
```

#### 1.6 Create Event Triggers

```sql
-- Generic event publishing function
CREATE OR REPLACE FUNCTION publish_entity_event() RETURNS trigger AS $$
DECLARE
    v_event_type TEXT;
    v_payload JSONB;
    v_changed_fields JSONB;
BEGIN
    -- Determine event type
    IF TG_OP = 'INSERT' THEN
        v_event_type := TG_TABLE_NAME || '.created';
        v_payload := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        -- Check for status change
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            v_event_type := TG_TABLE_NAME || '.status_changed';
        ELSE
            v_event_type := TG_TABLE_NAME || '.updated';
        END IF;
        
        -- Capture changed fields
        SELECT jsonb_object_agg(key, value) INTO v_changed_fields
        FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key;
        
        v_payload := jsonb_build_object(
            'before', to_jsonb(OLD),
            'after', to_jsonb(NEW),
            'changed_fields', v_changed_fields
        );
    ELSIF TG_OP = 'DELETE' THEN
        v_event_type := TG_TABLE_NAME || '.deleted';
        v_payload := to_jsonb(OLD);
    END IF;
    
    -- Insert event
    INSERT INTO events (
        org_id,
        event_type,
        event_category,
        aggregate_id,
        payload,
        user_id,
        status
    ) VALUES (
        COALESCE(NEW.org_id, OLD.org_id),
        v_event_type,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        v_payload,
        COALESCE(
            current_setting('app.current_user_id', TRUE)::UUID,
            COALESCE(NEW.updated_by, NEW.created_by, OLD.created_by)
        ),
        'completed'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to core tables
CREATE TRIGGER leads_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER deals_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON deals
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER accounts_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER jobs_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON jobs
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER submissions_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON submissions
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER campaigns_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER job_orders_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON job_orders
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();

CREATE TRIGGER contacts_event_trigger
    AFTER INSERT OR UPDATE OR DELETE ON contacts
    FOR EACH ROW EXECUTE FUNCTION publish_entity_event();
```

---

## 🖥️ Unified Workspaces

### File Structure

```
src/components/workspaces/
├── base/
│   ├── WorkspaceLayout.tsx          # Shared layout structure
│   ├── WorkspaceHeader.tsx          # Header with title, status, actions
│   ├── RCAIBar.tsx                   # RCAI ownership display/edit
│   ├── WorkspaceTabs.tsx             # Tab navigation
│   ├── WorkspaceSidebar.tsx          # Stats, related objects, actions
│   ├── ActivityPanel.tsx             # Composer + Timeline
│   └── AccessInfo.tsx                # Who can see/edit
│
├── LeadsWorkspace.tsx                # Same for all teams
├── DealsWorkspace.tsx                # Same for all teams
├── AccountsWorkspace.tsx             # Context-aware tabs by role
├── JobsWorkspace.tsx                 # Context-aware (Recruiting: Job→Talent, Bench: Talent→Job)
├── JobOrdersWorkspace.tsx            # New - confirmed orders
├── TalentWorkspace.tsx               # Same for all teams
├── SubmissionsWorkspace.tsx          # Same for all teams
├── CampaignsWorkspace.tsx            # Same for all teams
├── ContactsWorkspace.tsx             # New - universal contacts
│
└── hooks/
    ├── useWorkspaceContext.ts        # Determine context from user role
    ├── useRCAI.ts                    # RCAI assignments CRUD
    ├── useObjectAccess.ts            # Check/manage access
    └── useActivityLogger.ts          # Auto-log activities

src/components/consoles/
├── RecruiterConsole.tsx              # Recruiter dashboard
├── BenchSalesConsole.tsx             # Bench sales dashboard
├── TAConsole.tsx                     # Talent acquisition dashboard
├── ManagerConsole.tsx                # Team aggregate view
└── ExecutiveConsole.tsx              # Org-wide KPIs
```

### Workspace Context Hook

```typescript
// src/components/workspaces/hooks/useWorkspaceContext.ts

import { useCurrentUser } from '@/hooks/queries/users';

type WorkspaceContext = 'recruiting' | 'bench' | 'ta' | 'manager' | 'executive';

interface WorkspaceContextResult {
  context: WorkspaceContext;
  primaryRole: string;
  canEdit: boolean;
  canAssignRCAI: boolean;
}

export function useWorkspaceContext(entityType: string, entityId: string): WorkspaceContextResult {
  const { user } = useCurrentUser();
  
  // Determine context from user's primary role
  const primaryRole = user?.roles?.find(r => r.isPrimary)?.name || 'employee';
  
  const contextMap: Record<string, WorkspaceContext> = {
    'recruiter': 'recruiting',
    'senior_recruiter': 'recruiting',
    'bench_sales': 'bench',
    'bench_sales_rep': 'bench',
    'ta_specialist': 'ta',
    'ta_manager': 'ta',
    'recruiting_manager': 'manager',
    'bench_manager': 'manager',
    'vp_recruiting': 'executive',
    'ceo': 'executive',
  };
  
  const context = contextMap[primaryRole] || 'recruiting';
  
  // Check RCAI for edit permission
  // (would use actual query in implementation)
  const canEdit = true; // placeholder
  const canAssignRCAI = ['manager', 'executive'].includes(context);
  
  return {
    context,
    primaryRole,
    canEdit,
    canAssignRCAI,
  };
}
```

### RCAI Bar Component

```typescript
// src/components/workspaces/base/RCAIBar.tsx

interface RCAIOwner {
  userId: string;
  userName: string;
  avatarUrl?: string;
  role: 'responsible' | 'accountable' | 'consulted' | 'informed';
  permission: 'edit' | 'view';
  isPrimary: boolean;
}

interface RCAIBarProps {
  entityType: string;
  entityId: string;
  owners: RCAIOwner[];
  canEdit: boolean;
  onAssign?: (role: string, userId: string) => void;
}

const ROLE_BADGES = {
  responsible: { label: 'R', color: 'bg-blue-100 text-blue-700', title: 'Responsible' },
  accountable: { label: 'A', color: 'bg-green-100 text-green-700', title: 'Accountable' },
  consulted: { label: 'C', color: 'bg-amber-100 text-amber-700', title: 'Consulted' },
  informed: { label: 'I', color: 'bg-stone-100 text-stone-600', title: 'Informed' },
};

export function RCAIBar({ entityType, entityId, owners, canEdit, onAssign }: RCAIBarProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-stone-50 border-b border-stone-200">
      <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Owners:</span>
      <div className="flex items-center gap-3">
        {owners.map((owner) => {
          const badge = ROLE_BADGES[owner.role];
          return (
            <div 
              key={owner.userId} 
              className="flex items-center gap-2"
              title={`${badge.title} (${owner.permission})`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badge.color}`}>
                {badge.label}
              </div>
              <span className="text-sm text-charcoal">{owner.userName}</span>
              {owner.permission === 'edit' && (
                <span className="text-[10px] text-green-600">✎</span>
              )}
            </div>
          );
        })}
      </div>
      {canEdit && (
        <button className="ml-auto text-xs text-rust font-medium hover:underline">
          Edit Assignments
        </button>
      )}
    </div>
  );
}
```

### Context-Aware Workspace Example: Jobs

```typescript
// src/components/workspaces/JobsWorkspace.tsx

interface JobsWorkspaceProps {
  jobId: string;
}

export function JobsWorkspace({ jobId }: JobsWorkspaceProps) {
  const { context, canEdit } = useWorkspaceContext('job', jobId);
  const { job, isLoading } = useJob(jobId);
  const { owners } = useRCAI('job', jobId);
  
  // Context-aware tab configuration
  const tabs = useMemo(() => {
    const baseTabs = [
      { id: 'overview', label: 'Overview', icon: FileText },
      { id: 'activity', label: 'Activity', icon: Activity },
      { id: 'documents', label: 'Documents', icon: FolderOpen },
    ];
    
    // Recruiting context: Job → Talent → Submissions
    if (context === 'recruiting') {
      return [
        ...baseTabs.slice(0, 1),
        { id: 'pipeline', label: 'Candidate Pipeline', icon: Users },
        { id: 'source', label: 'Source Talent', icon: Search },
        { id: 'submissions', label: 'Submissions', icon: Send },
        ...baseTabs.slice(1),
      ];
    }
    
    // Bench context: Talent → Job matching
    if (context === 'bench') {
      return [
        ...baseTabs.slice(0, 1),
        { id: 'matches', label: 'Matching Talent', icon: Sparkles },
        { id: 'bench-submissions', label: 'Bench Submissions', icon: Send },
        ...baseTabs.slice(1),
      ];
    }
    
    // TA context: Job as campaign target
    if (context === 'ta') {
      return [
        ...baseTabs.slice(0, 1),
        { id: 'campaigns', label: 'Related Campaigns', icon: Target },
        { id: 'leads', label: 'Sourced Leads', icon: Users },
        ...baseTabs.slice(1),
      ];
    }
    
    return baseTabs;
  }, [context]);
  
  // Context-aware primary action
  const primaryAction = useMemo(() => {
    switch (context) {
      case 'recruiting':
        return { label: 'Source Talent', icon: Search, action: () => openSourcingModal() };
      case 'bench':
        return { label: 'Find Matches', icon: Sparkles, action: () => runMatchingAlgorithm() };
      case 'ta':
        return { label: 'Create Campaign', icon: Target, action: () => createCampaignForJob() };
      default:
        return { label: 'View Details', icon: Eye, action: () => {} };
    }
  }, [context]);
  
  return (
    <WorkspaceLayout>
      <WorkspaceHeader 
        title={job?.title}
        subtitle={job?.account?.name}
        status={job?.status}
        primaryAction={primaryAction}
        canEdit={canEdit}
      />
      
      <RCAIBar 
        entityType="job"
        entityId={jobId}
        owners={owners}
        canEdit={canEdit}
      />
      
      <WorkspaceTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      
      <div className="flex">
        <div className="flex-1 p-6">
          {/* Tab content renders based on context */}
          <TabContent tab={activeTab} context={context} job={job} />
        </div>
        
        <WorkspaceSidebar 
          stats={jobStats}
          relatedObjects={relatedObjects}
          quickActions={quickActions}
        />
      </div>
      
      <ActivityPanel 
        entityType="job"
        entityId={jobId}
      />
    </WorkspaceLayout>
  );
}
```

---

## 🛣️ Routes Structure

```
/employee/
  /workspace/
    /leads/[id]             → LeadsWorkspace
    /leads/                 → LeadsList (filtered by RCAI access)
    
    /deals/[id]             → DealsWorkspace
    /deals/                 → DealsList
    
    /accounts/[id]          → AccountsWorkspace (context from role)
    /accounts/              → AccountsList
    
    /jobs/[id]              → JobsWorkspace (context from role)
    /jobs/                  → JobsList
    
    /job-orders/[id]        → JobOrdersWorkspace
    /job-orders/            → JobOrdersList
    
    /talent/[id]            → TalentWorkspace
    /talent/                → TalentList
    
    /submissions/[id]       → SubmissionsWorkspace
    /submissions/           → SubmissionsList
    
    /campaigns/[id]         → CampaignsWorkspace
    /campaigns/             → CampaignsList
    
    /contacts/[id]          → ContactsWorkspace
    /contacts/              → ContactsList
  
  /console/                 → Role-specific console (auto-detects role)
  
  /recruiting/              → Redirects to /console for recruiters
  /bench/                   → Redirects to /console for bench
  /ta/                      → Redirects to /console for TA
```

---

## 📋 Implementation Plan

### Sprint 1: Schema Foundation (Week 1-2)

**Tasks:**
1. [ ] Create migration for `contacts` table with RLS
2. [ ] Create migration for `job_orders` table with RLS
3. [ ] Create migration for `object_owners` (RCAI) table with RLS
4. [ ] Add `accountable_id` to all core object tables
5. [ ] Update `activities` table with `action_code`
6. [ ] Create database triggers for event publishing
7. [ ] Create `can_access_object()` function
8. [ ] Write migration tests

**Files to create:**
- `src/lib/db/schema/contacts.ts`
- `src/lib/db/schema/job-orders.ts`
- `src/lib/db/schema/object-ownership.ts`
- `supabase/migrations/022_create_contacts.sql`
- `supabase/migrations/023_create_job_orders.sql`
- `supabase/migrations/024_create_object_ownership.sql`
- `supabase/migrations/025_add_accountable_ids.sql`
- `supabase/migrations/026_add_event_triggers.sql`

### Sprint 2: Server Layer (Week 2-3)

**Tasks:**
1. [ ] Create tRPC router for `contacts`
2. [ ] Create tRPC router for `jobOrders`
3. [ ] Create tRPC router for `objectOwners`
4. [ ] Create RCAI auto-assignment middleware
5. [ ] Create activity logging middleware
6. [ ] Update existing routers with RCAI checks
7. [ ] Create `useCanAccess` hook

**Files to create:**
- `src/server/routers/contacts.ts`
- `src/server/routers/job-orders.ts`
- `src/server/routers/object-owners.ts`
- `src/server/middleware/rcai.ts`
- `src/server/middleware/activity-logger.ts`
- `src/hooks/queries/object-owners.ts`
- `src/hooks/mutations/object-owners.ts`

### Sprint 3: Unified Workspaces (Week 3-4)

**Tasks:**
1. [ ] Create workspace base components
2. [ ] Implement `LeadsWorkspace`
3. [ ] Implement `DealsWorkspace`
4. [ ] Implement `AccountsWorkspace`
5. [ ] Implement `JobsWorkspace`
6. [ ] Implement `JobOrdersWorkspace`
7. [ ] Implement `TalentWorkspace`
8. [ ] Implement `SubmissionsWorkspace`
9. [ ] Implement `CampaignsWorkspace`
10. [ ] Implement `ContactsWorkspace`

**Files to create:**
- `src/components/workspaces/base/WorkspaceLayout.tsx`
- `src/components/workspaces/base/WorkspaceHeader.tsx`
- `src/components/workspaces/base/RCAIBar.tsx`
- `src/components/workspaces/base/WorkspaceTabs.tsx`
- `src/components/workspaces/base/WorkspaceSidebar.tsx`
- `src/components/workspaces/base/ActivityPanel.tsx`
- `src/components/workspaces/LeadsWorkspace.tsx`
- `src/components/workspaces/DealsWorkspace.tsx`
- `src/components/workspaces/AccountsWorkspace.tsx`
- `src/components/workspaces/JobsWorkspace.tsx`
- `src/components/workspaces/JobOrdersWorkspace.tsx`
- `src/components/workspaces/TalentWorkspace.tsx`
- `src/components/workspaces/SubmissionsWorkspace.tsx`
- `src/components/workspaces/CampaignsWorkspace.tsx`
- `src/components/workspaces/ContactsWorkspace.tsx`

### Sprint 4: Role Consoles (Week 4-5)

**Tasks:**
1. [ ] Design console components
2. [ ] Implement `RecruiterConsole`
3. [ ] Implement `BenchSalesConsole`
4. [ ] Implement `TAConsole`
5. [ ] Implement `ManagerConsole`
6. [ ] Implement `ExecutiveConsole`
7. [ ] Create unified routes
8. [ ] Add route redirects for legacy paths

**Files to create:**
- `src/components/consoles/RecruiterConsole.tsx`
- `src/components/consoles/BenchSalesConsole.tsx`
- `src/components/consoles/TAConsole.tsx`
- `src/components/consoles/ManagerConsole.tsx`
- `src/components/consoles/ExecutiveConsole.tsx`
- `src/app/employee/workspace/[...path]/page.tsx`
- `src/app/employee/console/page.tsx`

### Sprint 5: Testing & Polish (Week 5-6)

**Tasks:**
1. [ ] E2E test: Lead → Deal → Job → Submission → Placement
2. [ ] E2E test: External Job → Job Order → Bench Submission → Placement
3. [ ] Multi-tenancy isolation tests
4. [ ] RCAI permission tests
5. [ ] Activity logging verification
6. [ ] Event trail verification
7. [ ] Performance testing
8. [ ] Accessibility audit

---

## 🧪 Critical Test Scenarios

### Test 1: RCAI Enforcement

```typescript
describe('RCAI Enforcement', () => {
  test('only RCAI owners with edit permission can update', async () => {
    const job = await createJob({ accountableId: userA.id });
    await assignRCAI(job.id, 'job', userB.id, 'consulted', 'view');
    
    // User A (accountable, edit) can update
    await expect(updateJob(job.id, userA, { title: 'New Title' }))
      .resolves.toBeDefined();
    
    // User B (consulted, view) cannot update
    await expect(updateJob(job.id, userB, { title: 'New Title' }))
      .rejects.toThrow('Forbidden');
  });
  
  test('exactly one accountable per object', async () => {
    const job = await createJob({ accountableId: userA.id });
    
    // Assigning new accountable removes old one
    await assignRCAI(job.id, 'job', userB.id, 'accountable');
    
    const owners = await getRCAI(job.id, 'job');
    const accountables = owners.filter(o => o.role === 'accountable');
    expect(accountables).toHaveLength(1);
    expect(accountables[0].userId).toBe(userB.id);
  });
});
```

### Test 2: Object Visibility

```typescript
describe('Object Visibility', () => {
  test('users only see objects they have RCAI access to', async () => {
    const job1 = await createJob({ accountableId: userA.id });
    const job2 = await createJob({ accountableId: userB.id });
    
    // User A sees only their job
    const jobsA = await listJobs(userA);
    expect(jobsA.map(j => j.id)).toContain(job1.id);
    expect(jobsA.map(j => j.id)).not.toContain(job2.id);
  });
  
  test('managers see all team member objects', async () => {
    // Manager is auto-assigned as Informed on team member objects
    const job = await createJob({ accountableId: teamMember.id });
    
    const managerJobs = await listJobs(manager);
    expect(managerJobs.map(j => j.id)).toContain(job.id);
  });
});
```

### Test 3: Activity Logging

```typescript
describe('Activity Logging', () => {
  test('all mutations create activity records', async () => {
    const lead = await createLead({ companyName: 'Acme' });
    await updateLead(lead.id, { status: 'qualified' });
    
    const activities = await getActivities('lead', lead.id);
    expect(activities).toHaveLength(2);
    expect(activities[0].actionCode).toBe('lead.create');
    expect(activities[1].actionCode).toBe('lead.status_change');
  });
});
```

### Test 4: Event Trail

```typescript
describe('Event Trail', () => {
  test('all state changes produce events', async () => {
    const job = await createJob({ status: 'draft' });
    await updateJob(job.id, { status: 'open' });
    await updateJob(job.id, { status: 'filled' });
    
    const events = await getEvents('job', job.id);
    expect(events.map(e => e.eventType)).toEqual([
      'jobs.created',
      'jobs.status_changed',
      'jobs.status_changed',
    ]);
  });
});
```

### Test 5: Full Workflow E2E

```typescript
describe('Full Workflow E2E', () => {
  test('recruiting workflow: lead to placement', async () => {
    // 1. Create lead
    const lead = await createLead({ companyName: 'Acme Corp' });
    
    // 2. Qualify lead
    await updateLead(lead.id, { 
      bantBudget: 20, 
      bantNeed: 25, 
      status: 'qualified' 
    });
    
    // 3. Convert to deal + account
    const { deal, account } = await convertLead(lead.id);
    expect(deal.stage).toBe('discovery');
    expect(account.status).toBe('prospect');
    
    // 4. Progress deal, create job
    await updateDeal(deal.id, { stage: 'proposal' });
    const job = await createJob({ 
      accountId: account.id, 
      dealId: deal.id, 
      title: 'Sr Java Dev' 
    });
    
    // 5. Create job order (confirmed)
    const jobOrder = await createJobOrder({
      sourceType: 'requisition',
      sourceJobId: job.id,
      accountId: account.id,
      billRate: 120,
    });
    
    // 6. Source talent
    const talent = await createCandidate({ 
      firstName: 'John', 
      skills: ['Java', 'Spring'] 
    });
    
    // 7. Create submission
    const submission = await createSubmission({ 
      jobId: job.id, 
      candidateId: talent.id 
    });
    
    // 8. Progress pipeline
    await updateSubmission(submission.id, { status: 'submitted_to_client' });
    await updateSubmission(submission.id, { status: 'client_interview' });
    
    // 9. Create offer
    const offer = await createOffer({ 
      submissionId: submission.id, 
      rate: 75 
    });
    await updateOffer(offer.id, { status: 'accepted' });
    
    // 10. Create placement
    const placement = await createPlacement({ 
      submissionId: submission.id, 
      offerId: offer.id 
    });
    
    // Verify full audit trail
    const allEvents = await getEventsForWorkflow([
      { type: 'lead', id: lead.id },
      { type: 'deal', id: deal.id },
      { type: 'job', id: job.id },
      { type: 'job_order', id: jobOrder.id },
      { type: 'submission', id: submission.id },
    ]);
    
    expect(allEvents.length).toBeGreaterThan(10);
    
    // Verify activities logged
    const allActivities = await getActivitiesForWorkflow([
      { type: 'lead', id: lead.id },
      { type: 'deal', id: deal.id },
      { type: 'job', id: job.id },
    ]);
    
    expect(allActivities.length).toBeGreaterThan(5);
  });
});
```

---

## ✅ Success Criteria

| Criteria | Measurement |
|----------|-------------|
| Single Workspace per Object | Leads, Deals, Jobs, etc. have ONE workspace used by all teams |
| Context-Aware Rendering | Same component, different tabs/starting points based on user's primary role |
| RCAI Enforced | Objects have 4 owners with clear edit/view permissions |
| Hybrid Assignment | Auto-assign on creation, manual override supported |
| Access Control Working | Users only see objects they're RCAI members of |
| Activities as Action Record | Every user mutation creates an activity with action_code |
| Events as Audit Trail | Every state change produces an event |
| 100% Test Coverage | Multi-tenancy, RCAI, complete workflows tested |
| Backward Compatible | Existing data migrated, old routes redirect |

---

## 🚀 Execution

### For Claude Code CLI

```bash
# Execute with multi-agent orchestration
claude --multi-agent \
  --agents "schema:database-architect,api:api-developer,frontend:frontend-developer,test:qa-engineer" \
  --orchestration "sequential:schema->api,parallel:frontend+test" \
  --context-retention "full" \
  --file docs/planning/UNIFIED-WORKSPACE-ARCHITECTURE-PROMPT.md \
  "Execute the InTime v3 Unified Workspace Architecture Implementation"
```

### Phased Execution

If running in phases:

```bash
# Phase 1: Schema
claude --agent database-architect \
  "Execute Sprint 1 from UNIFIED-WORKSPACE-ARCHITECTURE-PROMPT.md - Schema Foundation"

# Phase 2: Server
claude --agent api-developer \
  "Execute Sprint 2 from UNIFIED-WORKSPACE-ARCHITECTURE-PROMPT.md - Server Layer"

# Phase 3: Workspaces
claude --agent frontend-developer \
  "Execute Sprint 3 from UNIFIED-WORKSPACE-ARCHITECTURE-PROMPT.md - Unified Workspaces"

# Phase 4: Consoles
claude --agent frontend-developer \
  "Execute Sprint 4 from UNIFIED-WORKSPACE-ARCHITECTURE-PROMPT.md - Role Consoles"

# Phase 5: Testing
claude --agent qa-engineer \
  "Execute Sprint 5 from UNIFIED-WORKSPACE-ARCHITECTURE-PROMPT.md - Testing & Polish"
```

---

## 📝 Notes

- **InTime is a living organism** - Every piece of work must consider cross-pollination across the 5 pillars
- **Multi-tenancy is non-negotiable** - All tables MUST have RLS enabled with org_id isolation
- **Quality over speed** - "Best, only the best, nothing but the best"
- **No hard deletes** - Use soft deletes (`deleted_at`) for all candidate/client data

---

*Last Updated: 2025-11-29*
*Version: 1.0*

