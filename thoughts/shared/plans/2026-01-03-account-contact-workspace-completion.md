# Account & Contact Workspace Completion - Implementation Plan

## Overview

Complete the Account workspace by adding the Related Accounts section, then replicate the entire Account workspace premium UI pattern to the Contact workspace. Both workspaces will have identical sections with consistent premium SaaS-level UI.

## Current State Analysis

### Account Workspace (90% Complete)
- **11 sections implemented** with premium UI pattern (gradient headers, search, pagination, animated detail panels, inline editing)
- **Missing**: Related Accounts section
- **Pattern**: ~500-1400 LOC per section

### Contact Workspace (30% Complete)
- **8 sections implemented** with basic Card pattern (~100-200 LOC each)
- **Missing**: Jobs, Placements, Addresses, Meetings, Escalations, Related Contacts
- **Pattern**: Basic Card with no search, pagination, detail panel, or inline editing

### Key Discoveries
- `company_relationships` table exists for account-to-account relationships (`schema.ts:6725`)
- Premium pattern reference: `AccountContactsSection.tsx` (1043 lines)
- Contact Summary is 223 lines vs Account Overview at 839 lines

## Desired End State

After implementation:
1. **Account Workspace**: 12 complete sections including Related Accounts
2. **Contact Workspace**: 12 complete sections mirroring Account (same UI pattern, different data)
3. **Consistency**: Both workspaces use identical premium UI patterns

### Verification
- All sections render with gradient headers, search, pagination
- Row selection triggers animated detail panel
- Inline editing works with validation
- Empty states display correctly with CTAs

## What We're NOT Doing

- Modifying database schema (using existing `company_relationships` table)
- Adding new tRPC routers (extending existing ones)
- Creating new shared components (reusing existing patterns)
- Parent/child hierarchy for accounts (relationships only)

## Implementation Approach

**Strategy**:
1. Create Related Accounts section for Account workspace first
2. Audit and fix any gaps in Account workspace
3. Upgrade each Contact section to premium pattern, using Account equivalents as templates
4. Add missing Contact sections

**Template**: Use `AccountContactsSection.tsx` as the primary reference for the premium pattern.

---

## Phase 1: Add Related Accounts Section to Account Workspace

### Overview
Create the missing Related Accounts section showing account-to-account relationships (vendor, client, partner, etc.) using the `company_relationships` table.

### Changes Required:

#### 1.1 Update Server Actions - Fetch Related Accounts

**File**: `src/server/actions/accounts.ts`
**Changes**: Add `relatedAccountsResult` to Promise.all and transform function

```typescript
// Add to Promise.all (after line ~206)
relatedAccountsResult = adminClient
  .from('company_relationships')
  .select(`
    id,
    relationship_category,
    notes,
    effective_date,
    created_at,
    company_a:companies!company_relationships_company_a_id_fkey(id, name, industry, status, website, phone, tier),
    company_b:companies!company_relationships_company_b_id_fkey(id, name, industry, status, website, phone, tier)
  `)
  .or(`company_a_id.eq.${id},company_b_id.eq.${id}`)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .limit(50),

// Add transform function
function transformRelatedAccounts(
  data: Record<string, unknown>[],
  currentAccountId: string
): AccountRelatedAccount[] {
  return data.map((r) => {
    const companyA = r.company_a as { id: string; name: string; industry: string | null; status: string; website: string | null; phone: string | null; tier: string | null }
    const companyB = r.company_b as { id: string; name: string; industry: string | null; status: string; website: string | null; phone: string | null; tier: string | null }

    // Determine which company is the "other" one
    const relatedCompany = companyA.id === currentAccountId ? companyB : companyA

    return {
      relationshipId: r.id as string,
      id: relatedCompany.id,
      name: relatedCompany.name,
      industry: relatedCompany.industry,
      status: relatedCompany.status,
      website: relatedCompany.website,
      phone: relatedCompany.phone,
      tier: relatedCompany.tier,
      relationshipCategory: r.relationship_category as string,
      notes: r.notes as string | null,
      effectiveDate: r.effective_date as string | null,
      createdAt: r.created_at as string,
    }
  })
}
```

#### 1.2 Update Types

**File**: `src/types/workspace.ts`
**Changes**: Add `AccountRelatedAccount` type and update `FullAccountData`

```typescript
// Add new type (after AccountDocument)
export interface AccountRelatedAccount {
  relationshipId: string
  id: string
  name: string
  industry: string | null
  status: string
  website: string | null
  phone: string | null
  tier: string | null
  relationshipCategory: string
  notes: string | null
  effectiveDate: string | null
  createdAt: string
}

// Update FullAccountData interface
export interface FullAccountData {
  // ... existing fields ...
  relatedAccounts: AccountRelatedAccount[]  // Add this
}
```

#### 1.3 Create Section Component

**File**: `src/components/workspaces/account/sections/AccountRelatedAccountsSection.tsx`
**Changes**: Create new premium section component (~800-1000 lines)

**Structure**:
```
- Gradient header with Building2 icon + search + "Link Account" button
- Grid columns: [1fr_120px_120px_140px_100px_90px] for Name, Industry, Status, Relationship, Since, Actions
- Pagination footer
- Detail panel with 3-column layout:
  - Column 1: Company info (Name, Industry, Website, Phone)
  - Column 2: Relationship info (Category, Since, Notes)
  - Column 3: Quick Stats (from related account)
- Edit mode for relationship notes and category
```

**Key Features**:
- Filter by relationship category (vendor, client, partner, etc.)
- Edit relationship details (category, notes)
- Remove relationship action
- Link to full account workspace

#### 1.4 Update Account Sidebar

**File**: `src/components/workspaces/account/AccountSidebar.tsx`
**Changes**: Add `related_accounts` section to sections array

```typescript
// Add to sections array (after addresses)
{ id: 'related_accounts', label: 'Related Accounts', icon: Link2, count: counts.relatedAccounts },
```

#### 1.5 Update AccountWorkspace

**File**: `src/components/workspaces/AccountWorkspace.tsx`
**Changes**: Add section type, import, and render case

```typescript
// Add to AccountSection type
| 'related_accounts'

// Add to imports
import { AccountRelatedAccountsSection } from './account/sections/AccountRelatedAccountsSection'

// Add render case
{currentSection === 'related_accounts' && (
  <AccountRelatedAccountsSection
    relatedAccounts={data.relatedAccounts}
    accountId={data.account.id}
    onNavigate={handleSectionChange}
  />
)}
```

#### 1.6 Add tRPC Mutations

**File**: `src/server/routers/crm.ts`
**Changes**: Add mutations for managing account relationships

```typescript
// In accounts sub-router
linkAccount: orgProtectedProcedure
  .input(z.object({
    accountId: z.string().uuid(),
    relatedAccountId: z.string().uuid(),
    relationshipCategory: z.enum(['vendor', 'client', 'partner', 'sister_company', 'subsidiary', 'reseller', 'implementer']),
    notes: z.string().optional(),
    effectiveDate: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('company_relationships')
      .insert({
        org_id: ctx.orgId,
        company_a_id: input.accountId,
        company_b_id: input.relatedAccountId,
        relationship_category: input.relationshipCategory,
        notes: input.notes,
        effective_date: input.effectiveDate,
        created_by: ctx.userProfileId,
      })
      .select()
      .single()

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data
  }),

unlinkAccount: orgProtectedProcedure
  .input(z.object({ relationshipId: z.string().uuid() }))
  .mutation(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    await adminClient
      .from('company_relationships')
      .update({ deleted_at: new Date().toISOString(), updated_by: ctx.userProfileId })
      .eq('id', input.relationshipId)
    return { success: true }
  }),

updateAccountRelationship: orgProtectedProcedure
  .input(z.object({
    relationshipId: z.string().uuid(),
    relationshipCategory: z.enum(['vendor', 'client', 'partner', 'sister_company', 'subsidiary', 'reseller', 'implementer']).optional(),
    notes: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('company_relationships')
      .update({
        relationship_category: input.relationshipCategory,
        notes: input.notes,
        updated_by: ctx.userProfileId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.relationshipId)
      .select()
      .single()

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message })
    return data
  }),
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compiles: `pnpm tsc --noEmit` (pre-existing errors in other files, none in Phase 1 changes)
- [x] Lint passes: `pnpm lint` (no new lint errors)
- [x] Dev server starts: `pnpm dev` (verified with curl check)

#### Manual Verification:
- [ ] Related Accounts section appears in Account sidebar
- [ ] Related accounts list displays with correct data
- [ ] Row selection shows animated detail panel
- [ ] Inline editing works for relationship category and notes
- [ ] Link/Unlink account actions work
- [ ] Empty state displays correctly

**Implementation Note**: After completing this phase and all automated verification passes, pause for manual testing before proceeding to Phase 2.

---

## Phase 2: Audit & Fix Account Workspace Gaps ✅ COMPLETED

### Overview
Review all 11 existing Account sections for consistency with the premium pattern and fix any gaps.

### Audit Results:

| Section | Gradient Header | Search | Pagination | Detail Panel | Inline Edit | Status |
|---------|-----------------|--------|------------|--------------|-------------|--------|
| Overview | ✅ | N/A | N/A | N/A | ✅ | Complete |
| Contacts | ✅ | ✅ | ✅ | ✅ | ✅ | Reference |
| Jobs | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Placements | ✅ | ✅ | ✅ | ✅ | N/A (read-only) | Complete |
| Addresses | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Meetings | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Escalations | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Activities | ✅ | ✅ | ✅ | ✅ | ✅ | Reference |
| Notes | ✅ | ✅ | ✅ | ✅ | ✅ | Reference |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| History | ✅ | ✅ | ✅ | N/A | N/A | **Upgraded** |

### Changes Made:

#### 2.1 AccountAddressesSection - ✅ Already Complete
**File**: `src/components/workspaces/account/sections/AccountAddressesSection.tsx` (828 lines)
**Result**: Already had all premium features:
- ✅ Gradient header with MapPin icon
- ✅ Search functionality
- ✅ Pagination (10 items/page)
- ✅ Row selection with gold highlight
- ✅ Animated detail panel with full editing

#### 2.2 AccountPlacementsSection - ✅ Already Complete
**File**: `src/components/workspaces/account/sections/AccountPlacementsSection.tsx` (683 lines)
**Result**: Already had all premium features:
- ✅ Gradient header with Award icon
- ✅ Search functionality
- ✅ Pagination
- ✅ Row selection with 3-column detail panel
- N/A for inline editing (read-only view, editing in full Placement workspace)

#### 2.3 AccountHistorySection - 🔧 UPGRADED
**File**: `src/components/workspaces/account/sections/AccountHistorySection.tsx`
**Changes**: Upgraded from 320 lines → 509 lines with:
- ✅ Added gradient header with History icon
- ✅ Added search functionality (by user name, field, values, reason)
- ✅ Added filter dropdown (All/Status/Owner/Field/Related changes)
- ✅ Added pagination (15 items/page)
- ✅ Added "Today"/"Yesterday" date labels
- ✅ Enhanced entry styling with rounded icons and hover effects
- ✅ Improved empty state messaging

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compiles: `pnpm tsc --noEmit` (no new errors in Phase 2 files)
- [x] No ESLint errors: `pnpm lint` (no errors in Phase 2 files)

#### Manual Verification:
- [ ] All Account sections have consistent gradient headers
- [ ] Search works in all applicable sections
- [ ] Pagination displays correctly in all list sections
- [ ] Detail panels animate correctly
- [ ] Inline editing saves properly

**Implementation Note**: Phase 2 complete. Ready for manual testing before proceeding to Phase 3.

---

## Phase 3: Upgrade Contact Workspace Infrastructure

### Overview
Update the backend data fetching and types to support all new Contact sections before building the UI.

**Note**: Escalations are skipped for Contact workspace because the `escalations` table only has `account_id`, not `contact_id`. Existing lead/prospect sections (campaigns, pipeline, qualification, deals) are preserved.

### Changes Required:

#### 3.1 Update Contact Server Action - Fetch Additional Data

**File**: `src/server/actions/contacts.ts`
**Changes**: Add jobs, placements, addresses, meetings, related contacts to Promise.all (NO escalations - see note above)

```typescript
// Add to Promise.all (after line ~161)
// Jobs via linked account
jobsViaAccountResult = contactBase.company_id ? adminClient
  .from('jobs')
  .select(`
    id, title, status, job_type, rate_min, rate_max, positions_count, positions_filled,
    priority, created_at,
    owner:user_profiles!jobs_owner_id_fkey(id, full_name, avatar_url),
    account:companies!jobs_company_id_fkey(id, name)
  `)
  .or(`company_id.eq.${contactBase.company_id},client_company_id.eq.${contactBase.company_id}`)
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .limit(50)
: Promise.resolve({ data: [], error: null }),

// Placements where contact is the candidate
placementsResult = adminClient
  .from('placements')
  .select(`
    id, start_date, end_date, status, billing_rate, pay_rate, extension_count, created_at,
    job:jobs!placements_job_id_fkey(id, title, company_id, account:companies!jobs_company_id_fkey(id, name)),
    candidate:contacts!placements_candidate_id_fkey(id, first_name, last_name)
  `)
  .eq('candidate_id', id)
  .is('deleted_at', null)
  .order('start_date', { ascending: false })
  .limit(50),

// Contact addresses (polymorphic - NOTE: addresses table has NO deleted_at column)
addressesResult = adminClient
  .from('addresses')
  .select('*')
  .eq('entity_type', 'contact')
  .eq('entity_id', id)
  .order('is_primary', { ascending: false }),

// Meetings where contact is a participant
meetingsResult = adminClient
  .from('meeting_notes')
  .select(`
    id, title, meeting_type, scheduled_at, status, location_type, location_details,
    agenda, discussion_notes, key_takeaways, action_items, created_at,
    account:companies!meeting_notes_account_id_fkey(id, name),
    creator:user_profiles!meeting_notes_created_by_fkey(id, full_name, avatar_url)
  `)
  .contains('contact_ids', [id])
  .is('deleted_at', null)
  .order('scheduled_at', { ascending: false })
  .limit(50),

// Related contacts at the same company
relatedContactsResult = contactBase.company_id ? adminClient
  .from('contacts')
  .select('id, first_name, last_name, title, email, phone, is_primary, decision_authority')
  .eq('company_id', contactBase.company_id as string)
  .neq('id', id)  // Exclude self
  .is('deleted_at', null)
  .order('is_primary', { ascending: false })
  .limit(50)
: Promise.resolve({ data: [], error: null }),
```

**Add transform functions after line ~390:**
```typescript
function transformJobs(data: Record<string, unknown>[]): ContactJob[] {
  return data.map((j) => {
    const owner = j.owner as { id: string; full_name: string; avatar_url?: string } | null
    const account = j.account as { id: string; name: string } | null
    return {
      id: j.id as string,
      title: j.title as string,
      status: j.status as string,
      jobType: j.job_type as string | null,
      rateMin: j.rate_min ? parseFloat(j.rate_min as string) : null,
      rateMax: j.rate_max ? parseFloat(j.rate_max as string) : null,
      positionsCount: (j.positions_count as number) || 0,
      positionsFilled: (j.positions_filled as number) || 0,
      priority: j.priority as string | null,
      createdAt: j.created_at as string,
      owner: owner ? { id: owner.id, name: owner.full_name } : null,
      account: account ? { id: account.id, name: account.name } : null,
    }
  })
}

function transformPlacements(data: Record<string, unknown>[]): ContactPlacement[] {
  return data.map((p) => {
    const job = p.job as { id: string; title: string; account?: { id: string; name: string } } | null
    return {
      id: p.id as string,
      startDate: p.start_date as string,
      endDate: p.end_date as string | null,
      status: p.status as string,
      billingRate: p.billing_rate as number | null,
      payRate: p.pay_rate as number | null,
      extensionCount: (p.extension_count as number) || 0,
      createdAt: p.created_at as string,
      job: job ? {
        id: job.id,
        title: job.title,
        account: job.account ? { id: job.account.id, name: job.account.name } : null,
      } : null,
    }
  })
}

function transformAddresses(data: Record<string, unknown>[]): ContactAddress[] {
  return data.map((a) => ({
    id: a.id as string,
    addressType: (a.address_type as string) || 'work',
    street: a.address_line_1 as string | null,
    city: a.city as string | null,
    state: a.state_province as string | null,
    zip: a.postal_code as string | null,
    country: a.country_code as string | null,
    isPrimary: (a.is_primary as boolean) || false,
  }))
}

function transformMeetings(data: Record<string, unknown>[]): ContactMeeting[] {
  return data.map((m) => {
    const creator = m.creator as { id: string; full_name: string; avatar_url?: string } | null
    const account = m.account as { id: string; name: string } | null
    return {
      id: m.id as string,
      title: m.title as string,
      meetingType: (m.meeting_type as string) || 'other',
      scheduledAt: m.scheduled_at as string,
      status: (m.status as string) || 'scheduled',
      locationType: m.location_type as string | null,
      locationDetails: m.location_details as string | null,
      agenda: m.agenda as string | null,
      discussionNotes: m.discussion_notes as string | null,
      keyTakeaways: m.key_takeaways as string[] | null,
      actionItems: m.action_items as Record<string, unknown>[] | null,
      createdAt: m.created_at as string,
      creator: creator ? { id: creator.id, name: creator.full_name } : null,
      account: account ? { id: account.id, name: account.name } : null,
    }
  })
}

function transformRelatedContacts(data: Record<string, unknown>[]): ContactRelatedContact[] {
  return data.map((c) => ({
    id: c.id as string,
    name: [c.first_name, c.last_name].filter(Boolean).join(' ') || 'Unknown',
    title: c.title as string | null,
    email: c.email as string | null,
    phone: c.phone as string | null,
    isPrimary: (c.is_primary as boolean) || false,
    decisionAuthority: c.decision_authority as string | null,
  }))
}
```

**Update return statement (after line ~186):**
```typescript
return {
  contact: transformContact(contact),
  accounts: transformAccounts(accountsResult.data || [], contact),
  submissions: allSubmissions,
  campaigns: transformCampaigns(campaignsResult.data || []),
  jobs: transformJobs(jobsViaAccountResult.data || []),           // Add
  placements: transformPlacements(placementsResult.data || []),   // Add
  addresses: transformAddresses(addressesResult.data || []),      // Add
  meetings: transformMeetings(meetingsResult.data || []),         // Add
  relatedContacts: transformRelatedContacts(relatedContactsResult.data || []), // Add
  activities: transformActivities(activitiesResult.data || []),
  notes: transformNotes(notesResult.data || []),
  documents: transformDocuments(documentsResult.data || []),
  history: transformHistory(historyResult.data || []),
  warnings: computeWarnings(contact),
}
```

#### 3.2 Update Types

**File**: `src/types/workspace.ts`
**Changes**: Add new Contact types and update `FullContactData` (NO escalations)

```typescript
// Add after existing Contact types (around line 730)
export interface ContactJob {
  id: string
  title: string
  status: string
  jobType: string | null
  rateMin: number | null
  rateMax: number | null
  positionsCount: number
  positionsFilled: number
  priority: string | null
  createdAt: string
  owner: { id: string; name: string } | null
  account: { id: string; name: string } | null
}

export interface ContactPlacement {
  id: string
  startDate: string
  endDate: string | null
  status: string
  billingRate: number | null
  payRate: number | null
  extensionCount: number
  createdAt: string
  job: { id: string; title: string; account: { id: string; name: string } | null } | null
}

export interface ContactAddress {
  id: string
  addressType: string
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  isPrimary: boolean
}

export interface ContactMeeting {
  id: string
  title: string
  meetingType: string
  scheduledAt: string
  status: string
  locationType: string | null
  locationDetails: string | null
  agenda: string | null
  discussionNotes: string | null
  keyTakeaways: string[] | null
  actionItems: Record<string, unknown>[] | null
  createdAt: string
  creator: { id: string; name: string } | null
  account: { id: string; name: string } | null
}

export interface ContactRelatedContact {
  id: string
  name: string
  title: string | null
  email: string | null
  phone: string | null
  isPrimary: boolean
  decisionAuthority: string | null
}

// Update FullContactData (around line 640)
export interface FullContactData {
  contact: ContactData
  accounts: ContactAccount[]
  submissions: ContactSubmission[]
  campaigns: ContactCampaign[]       // Keep for leads/prospects
  jobs: ContactJob[]                  // Add
  placements: ContactPlacement[]      // Add
  addresses: ContactAddress[]         // Add
  meetings: ContactMeeting[]          // Add
  relatedContacts: ContactRelatedContact[] // Add
  // Universal tools
  activities: ContactActivity[]
  notes: ContactNote[]
  documents: ContactDocument[]
  history: HistoryEntry[]
  warnings: WorkspaceWarning[]
}
```

#### 3.3 Update Contact Sidebar Configuration

**File**: `src/lib/navigation/entity-sections.ts`
**Changes**: Update `contactSections` to include new sections while preserving existing ones

Replace the existing `contactSections` (around line 244):

```typescript
/**
 * Contact sections - Hybrid of Account pattern + lead/prospect-specific sections
 * Main: Overview, Accounts, Jobs, Placements, Submissions, Addresses, Meetings, Related Contacts
 * Lead-specific: Campaigns, Pipeline, Qualification, Deals (only shown for lead/prospect contacts)
 * Tools: Activities, Notes, Documents, History
 */
export const contactSections: SectionDefinition[] = [
  // Main sections (shared with Account pattern)
  { id: 'overview', label: 'Overview', icon: UserCircle },
  { id: 'accounts', label: 'Accounts', icon: Building2, showCount: true },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, showCount: true },
  { id: 'placements', label: 'Placements', icon: Award, showCount: true },
  { id: 'submissions', label: 'Submissions', icon: Send, showCount: true },
  { id: 'addresses', label: 'Addresses', icon: MapPin, showCount: true },
  { id: 'meetings', label: 'Meetings', icon: Calendar, showCount: true },
  { id: 'related_contacts', label: 'Related Contacts', icon: Users, showCount: true },
  // Lead/Prospect-specific sections (conditionally shown based on contact subtype)
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, showCount: true },
  { id: 'pipeline', label: 'Pipeline', icon: Layers, showCount: true },
  { id: 'qualification', label: 'Qualification', icon: ListChecks },
  { id: 'deals', label: 'Deals', icon: DollarSign, showCount: true },
  // Tools section
  { id: 'activities', label: 'Activities', icon: Activity, showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, isToolSection: true },
]
```

**Note**: Add these icons to the imports at the top of the file:
```typescript
import { Megaphone, Layers, ListChecks, DollarSign } from 'lucide-react'
```

#### 3.4 Update ContactWorkspace Section Type

**File**: `src/components/workspaces/ContactWorkspace.tsx`
**Changes**: Update section type to include all sections (existing + new)

```typescript
type ContactSection =
  | 'overview'           // Was 'summary', renamed for consistency with sidebar
  | 'accounts'
  | 'jobs'               // New
  | 'placements'         // New
  | 'submissions'
  | 'addresses'
  | 'meetings'           // New (promoted from tool)
  | 'related_contacts'   // New
  | 'campaigns'          // Existing (for leads/prospects)
  | 'pipeline'           // Existing (for leads/prospects)
  | 'qualification'      // Existing (for leads/prospects)
  | 'deals'              // Existing (for leads/prospects)
  | 'activities'
  | 'notes'
  | 'documents'
  | 'history'
```

**Update section navigation default:**
```typescript
// Get section from URL, default to 'overview' (not 'summary')
const currentSection = (searchParams.get('section') || 'overview') as ContactSection
```

**Add placeholder render cases for new sections** (actual components built in Phase 4-5):
```typescript
{currentSection === 'jobs' && (
  <div className="p-6 text-center text-charcoal-500">Jobs section coming soon...</div>
)}
{currentSection === 'placements' && (
  <div className="p-6 text-center text-charcoal-500">Placements section coming soon...</div>
)}
{currentSection === 'meetings' && (
  <div className="p-6 text-center text-charcoal-500">Meetings section coming soon...</div>
)}
{currentSection === 'related_contacts' && (
  <div className="p-6 text-center text-charcoal-500">Related Contacts section coming soon...</div>
)}
```

### Success Criteria:

#### Automated Verification:
- [x] TypeScript compiles: `pnpm tsc --noEmit` (no new errors in Phase 3 files)
- [x] No new lint errors: `pnpm lint` (warnings only, no errors)
- [x] Dev server starts: `pnpm dev` runs without errors

#### Manual Verification:
- [ ] Contact sidebar shows all new sections (jobs, placements, meetings, related_contacts)
- [ ] Section navigation works for all sections (including placeholders)
- [ ] Data loads correctly - check browser console for errors
- [ ] Section counts display in sidebar badges

**Implementation Note**: After completing this phase, verify data is flowing correctly before proceeding to Phase 4. The placeholder components will be replaced with full implementations.

---

## Phase 4: Upgrade Existing Contact Sections to Premium Pattern

### Overview
Convert each existing Contact section from basic Card pattern to premium pattern (~200 lines → ~800-1000 lines each).

### Changes Required:

Each section upgrade follows this pattern:
1. Add gradient header with icon + search + action button
2. Add grid-based table layout
3. Add pagination
4. Add row selection with gold highlight
5. Add animated detail panel with 3-column layout
6. Add inline editing with validation
7. Add empty state with CTA

#### 4.1 Upgrade ContactSummarySection → ContactOverviewSection

**File**: `src/components/workspaces/contact/sections/ContactSummarySection.tsx` → `ContactOverviewSection.tsx`
**Template**: `AccountOverviewSection.tsx` (839 lines)
**Target**: ~700-850 lines

**Structure**:
- 4 KPI cards: Profile Completeness, Submissions, Placements, Activities
- Main grid (8/4 cols):
  - Left: Contact Details card (name, title, email, phone, department, etc.) with EditableInfoCard
  - Left: Action Items card (pending activities)
  - Right: Primary Account card
  - Right: Quick Stats card
- Full width: Recent Activity card

**Primary Fields for Inline Edit**:
- First Name, Last Name, Title, Department
- Email, Phone, Mobile
- LinkedIn, Category, Status

#### 4.2 Upgrade ContactAccountsSection

**File**: `src/components/workspaces/contact/sections/ContactAccountsSection.tsx`
**Template**: `AccountContactsSection.tsx` (1043 lines)
**Target**: ~800-900 lines

**Structure**:
- Gradient header with Building2 icon + search + "Link Account" button
- Grid columns: [1fr_120px_120px_140px_100px_90px] for Name, Industry, Status, Role, Since, Actions
- Pagination footer
- Detail panel (3-column):
  - Column 1: Company info (Name, Industry, Website, Phone)
  - Column 2: Role at this account
  - Column 3: Quick Stats from account

**Primary Fields for Inline Edit** (when selected):
- Role at this account
- Link to full Account workspace

#### 4.3 Upgrade ContactSubmissionsSection

**File**: `src/components/workspaces/contact/sections/ContactSubmissionsSection.tsx`
**Template**: `AccountJobsSection.tsx`
**Target**: ~800-900 lines

**Structure**:
- Gradient header with Send icon + search + filters (status, role as candidate/poc)
- Grid columns: Job Title, Account, Status, Role, Submitted, Actions
- Pagination
- Detail panel (3-column):
  - Column 1: Job info
  - Column 2: Submission details
  - Column 3: Status history

#### 4.4 Upgrade ContactCampaignsSection

**File**: `src/components/workspaces/contact/sections/ContactCampaignsSection.tsx`
**Template**: Use Activities pattern
**Target**: ~600-700 lines

**Structure**:
- Gradient header with Megaphone icon + search + filters (status)
- Grid columns: Campaign Name, Status, Step, Enrolled, Score, Actions
- Pagination
- Detail panel (3-column):
  - Column 1: Campaign details
  - Column 2: Engagement metrics
  - Column 3: Conversion status

#### 4.5 Upgrade ContactActivitiesSection

**File**: `src/components/workspaces/contact/sections/ContactActivitiesSection.tsx`
**Template**: `AccountActivitiesSection.tsx` (1387 lines)
**Target**: ~1200-1400 lines

**Copy exact structure** from AccountActivitiesSection, updating:
- Entity type from 'account' to 'contact'
- Entity ID references

#### 4.6 Upgrade ContactNotesSection

**File**: `src/components/workspaces/contact/sections/ContactNotesSection.tsx`
**Template**: `AccountNotesSection.tsx` (1027 lines)
**Target**: ~900-1000 lines

**Copy exact structure** from AccountNotesSection, updating entity references.

#### 4.7 Upgrade ContactDocumentsSection

**File**: `src/components/workspaces/contact/sections/ContactDocumentsSection.tsx`
**Template**: `AccountDocumentsSection.tsx` (1096 lines)
**Target**: ~900-1000 lines

**Copy exact structure** from AccountDocumentsSection, updating entity references.

#### 4.8 Upgrade ContactHistorySection

**File**: `src/components/workspaces/contact/sections/ContactHistorySection.tsx`
**Template**: `AccountHistorySection.tsx`
**Target**: ~300-400 lines

**Copy exact structure** from AccountHistorySection, updating entity references.

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] No ESLint errors: `pnpm lint`

#### Manual Verification:
- [ ] Each upgraded section matches Account equivalent visually
- [ ] Search works in all sections
- [ ] Pagination works correctly
- [ ] Row selection shows detail panel
- [ ] Inline editing saves correctly
- [ ] Empty states display with CTAs

**Implementation Note**: Upgrade one section at a time, testing each before proceeding to the next. Start with Activities, Notes, Documents as they're most similar to Account versions.

---

## Phase 5: Add New Contact Sections

### Overview
Create new Contact sections that don't have existing basic versions: Jobs, Placements, Addresses, Meetings, Escalations, Related Contacts.

### Changes Required:

#### 5.1 Create ContactJobsSection

**File**: `src/components/workspaces/contact/sections/ContactJobsSection.tsx`
**Template**: `AccountJobsSection.tsx`
**Target**: ~800-900 lines

**Note**: Jobs for contact come via their linked accounts. Show jobs from all accounts the contact is linked to.

**Structure**:
- Gradient header with Briefcase icon + search + account filter dropdown
- Grid columns: Title, Account, Status, Rate, Positions, Priority, Actions
- Pagination
- Detail panel (3-column):
  - Column 1: Job details
  - Column 2: Submission status (if contact is candidate)
  - Column 3: Link to full Job workspace

#### 5.2 Create ContactPlacementsSection

**File**: `src/components/workspaces/contact/sections/ContactPlacementsSection.tsx`
**Template**: `AccountPlacementsSection.tsx`
**Target**: ~600-700 lines

**Note**: Shows placements where the contact is the candidate.

**Structure**:
- Gradient header with Award icon + search + status filter
- Grid columns: Job Title, Account, Status, Start Date, End Date, Rate, Actions
- Pagination
- Detail panel (3-column):
  - Column 1: Placement details
  - Column 2: Rate info
  - Column 3: Link to Job workspace

#### 5.3 Create ContactAddressesSection

**File**: `src/components/workspaces/contact/sections/ContactAddressesSection.tsx`
**Template**: `AccountAddressesSection.tsx`
**Target**: ~500-600 lines

**Structure**:
- Gradient header with MapPin icon + "Add Address" button
- Grid columns: Type, Address, City, State/Country, Primary, Actions
- Detail panel with inline editing for all address fields

#### 5.4 Create ContactMeetingsSection

**File**: `src/components/workspaces/contact/sections/ContactMeetingsSection.tsx`
**Template**: `AccountMeetingsSection.tsx`
**Target**: ~700-800 lines

**Note**: Shows meetings where this contact was a participant.

**Structure**:
- Gradient header with Calendar icon + search + type filter
- Grid columns: Title, Type, Date, Location, Account, Actions
- Detail panel (3-column):
  - Column 1: Meeting details
  - Column 2: Discussion notes / Key takeaways
  - Column 3: Action items

#### 5.5 Create ContactEscalationsSection

**File**: `src/components/workspaces/contact/sections/ContactEscalationsSection.tsx`
**Template**: `AccountEscalationsSection.tsx`
**Target**: ~700-800 lines

**Note**: Shows escalations related to this contact.

**Structure**:
- Gradient header with AlertTriangle icon + search + status filter + priority filter
- Grid columns: Title, Category, Priority, Status, SLA, Owner, Actions
- Detail panel (3-column):
  - Column 1: Escalation details
  - Column 2: SLA tracking
  - Column 3: Resolution info

#### 5.6 Create ContactRelatedContactsSection

**File**: `src/components/workspaces/contact/sections/ContactRelatedContactsSection.tsx`
**Template**: `AccountContactsSection.tsx`
**Target**: ~800-900 lines

**Note**: Shows other contacts at the same company or linked contacts.

**Structure**:
- Gradient header with Users icon + search + "Add Related Contact" button
- Grid columns: Name, Title, Email, Phone, Authority, Primary, Actions
- Detail panel (3-column):
  - Column 1: Contact info
  - Column 2: Role at account
  - Column 3: Link to full Contact workspace

#### 5.7 Update ContactWorkspace Routing

**File**: `src/components/workspaces/ContactWorkspace.tsx`
**Changes**: Add imports and render cases for all new sections

```typescript
// Add imports
import { ContactOverviewSection } from './contact/sections/ContactOverviewSection'
import { ContactJobsSection } from './contact/sections/ContactJobsSection'
import { ContactPlacementsSection } from './contact/sections/ContactPlacementsSection'
import { ContactAddressesSection } from './contact/sections/ContactAddressesSection'
import { ContactMeetingsSection } from './contact/sections/ContactMeetingsSection'
import { ContactEscalationsSection } from './contact/sections/ContactEscalationsSection'
import { ContactRelatedContactsSection } from './contact/sections/ContactRelatedContactsSection'

// Add render cases
{currentSection === 'summary' && (
  <ContactOverviewSection
    contact={data.contact}
    accounts={data.accounts}
    activities={data.activities}
    jobs={data.jobs}
    placements={data.placements}
    onNavigate={handleSectionChange}
  />
)}
{currentSection === 'jobs' && (
  <ContactJobsSection
    jobs={data.jobs}
    contactId={data.contact.id}
    onNavigate={handleSectionChange}
  />
)}
// ... etc for all new sections
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] No ESLint errors: `pnpm lint`
- [ ] Dev server runs without errors: `pnpm dev`

#### Manual Verification:
- [ ] All 12 Contact sections render correctly
- [ ] Each section matches the visual style of Account equivalents
- [ ] Navigation between sections works
- [ ] Data displays correctly in all sections
- [ ] Detail panels work in all sections
- [ ] Empty states display with appropriate CTAs

**Implementation Note**: This is the largest phase. Build one section at a time, testing thoroughly before proceeding.

---

## Testing Strategy

### Unit Tests
Not required for UI components in this project.

### Integration Tests
Not required - manual testing covers functionality.

### Manual Testing Steps

#### Account Workspace
1. Navigate to any account detail page
2. Click through all 12 sections in sidebar
3. Verify Related Accounts section shows related companies
4. Add a new account relationship
5. Edit relationship details
6. Remove a relationship
7. Verify all other sections still work correctly

#### Contact Workspace
1. Navigate to any contact detail page
2. Click through all 12 sections in sidebar
3. Verify each section shows correct data
4. Test search in each applicable section
5. Test pagination in list sections
6. Select rows and verify detail panel appears
7. Edit inline fields and verify save works
8. Test empty states (create a new contact with no data)

---

## Performance Considerations

- **Data Fetching**: Both workspaces already use ONE Promise.all call. Adding new queries to this batch maintains performance.
- **Component Size**: Large section components (1000+ lines) are acceptable as they're code-split per section.
- **Pagination**: All list sections limit to 50 items per page to prevent large DOM trees.
- **Animation**: `animate-slide-up` is hardware-accelerated, no performance impact.

---

## Migration Notes

No database migrations required. Using existing:
- `company_relationships` table for Related Accounts
- `addresses` table (polymorphic) for Contact Addresses
- `meeting_notes` table with `contact_ids` array
- `escalations` table with `contact_id` column

---

## References

- Original research: `thoughts/shared/research/2026-01-03-account-contact-workspace-comparison.md`
- Premium pattern reference: `src/components/workspaces/account/sections/AccountContactsSection.tsx`
- Account server action: `src/components/workspaces/account/sections/accounts.ts`
- Contact server action: `src/server/actions/contacts.ts`
- Workspace types: `src/types/workspace.ts`
