---
date: 2026-01-03T17:57:11Z
researcher: sumanthrajkumarnagolu
git_commit: 09814353d52031050a20bbaed9b3f4106ff3e5f1
branch: main
repository: intime-v3
topic: "Account and Contact Workspace Comparison - Section Components and Patterns"
tags: [research, codebase, account, contact, workspace, sections, ui-patterns]
status: complete
last_updated: 2026-01-03
last_updated_by: sumanthrajkumarnagolu
---

# Research: Account and Contact Workspace Comparison

**Date**: 2026-01-03T17:57:11Z
**Researcher**: sumanthrajkumarnagolu
**Git Commit**: 09814353d52031050a20bbaed9b3f4106ff3e5f1
**Branch**: main
**Repository**: intime-v3

## Research Question

User wants to understand the codebase structure for Account and Contact workspaces to:
1. Add a "Related Accounts" section to Account workspace (missing)
2. Identify gaps in Account workspace
3. Replicate Account workspace patterns to Contact workspace

Key requirement: List view at top with search/pagination, editable detail view at bottom when item selected.

---

## Summary

The Account workspace implements a **Premium SaaS-level UI pattern** with sophisticated section components featuring:
- List views with gradient headers, search, and pagination
- Grid-based table layouts with clickable rows
- Animated bottom detail panels with 3-column editable layouts
- Full inline editing with validation

The Contact workspace currently uses a **basic Card-based pattern** that is significantly simpler. Each Contact section component is ~100-150 lines vs Account sections at ~500-1400 lines.

**Key Finding: No "Related Accounts" section exists for the Account workspace.** The database has `parent_company_id` column in `companies` table to support parent/child relationships.

---

## File Structure Comparison

### Account Workspace Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/employee/recruiting/accounts/[id]/layout.tsx` | Server data loading | ~50 |
| `src/app/employee/recruiting/accounts/[id]/page.tsx` | Client page wrapper | ~20 |
| `src/components/workspaces/AccountWorkspace.tsx` | Section router | 162 |
| `src/components/workspaces/account/AccountSidebar.tsx` | Sidebar navigation | 224 |
| `src/components/workspaces/account/AccountWorkspaceProvider.tsx` | Context provider | ~60 |
| `src/server/actions/accounts.ts` | Server data fetching | 766 |

### Account Section Components

| Section | File Path | Lines | Pattern |
|---------|-----------|-------|---------|
| Overview | `src/components/workspaces/account/sections/AccountOverviewSection.tsx` | ~400 | Summary cards + quick stats |
| Contacts | `src/components/workspaces/account/sections/AccountContactsSection.tsx` | 1043 | **Premium list + detail** |
| Jobs | `src/components/workspaces/account/sections/AccountJobsSection.tsx` | ~800 | **Premium list + detail** |
| Placements | `src/components/workspaces/account/sections/AccountPlacementsSection.tsx` | ~400 | Premium list |
| Addresses | `src/components/workspaces/account/sections/AccountAddressesSection.tsx` | ~500 | Editable list |
| Meetings | `src/components/workspaces/account/sections/AccountMeetingsSection.tsx` | ~600 | **Premium list + detail** |
| Escalations | `src/components/workspaces/account/sections/AccountEscalationsSection.tsx` | ~700 | **Premium list + detail** |
| Activities | `src/components/workspaces/account/sections/AccountActivitiesSection.tsx` | 1387 | **Premium list + detail** |
| Notes | `src/components/workspaces/account/sections/AccountNotesSection.tsx` | 1027 | **Premium list + detail** |
| Documents | `src/components/workspaces/account/sections/AccountDocumentsSection.tsx` | 1096 | **Premium list + detail** |
| History | `src/components/workspaces/account/sections/AccountHistorySection.tsx` | ~300 | Timeline list |

### Contact Workspace Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/app/employee/contacts/[id]/layout.tsx` | Server data loading | ~50 |
| `src/app/employee/contacts/[id]/page.tsx` | Client page wrapper | ~20 |
| `src/components/workspaces/ContactWorkspace.tsx` | Section router | 147 |
| `src/server/actions/contacts.ts` | Server data fetching | 446 |

### Contact Section Components

| Section | File Path | Lines | Pattern |
|---------|-----------|-------|---------|
| Summary | `src/components/workspaces/contact/sections/ContactSummarySection.tsx` | ~200 | Basic cards |
| Accounts | `src/components/workspaces/contact/sections/ContactAccountsSection.tsx` | ~150 | Basic list |
| Submissions | `src/components/workspaces/contact/sections/ContactSubmissionsSection.tsx` | ~200 | Basic grouped list |
| Campaigns | `src/components/workspaces/contact/sections/ContactCampaignsSection.tsx` | ~150 | Basic list |
| Activities | `src/components/workspaces/contact/sections/ContactActivitiesSection.tsx` | 129 | **Basic card list** |
| Notes | `src/components/workspaces/contact/sections/ContactNotesSection.tsx` | ~150 | Basic list |
| Documents | `src/components/workspaces/contact/sections/ContactDocumentsSection.tsx` | ~150 | Basic list |
| History | `src/components/workspaces/contact/sections/ContactHistorySection.tsx` | ~150 | Basic timeline |

---

## Sidebar Configuration

### Account Sidebar (AccountSidebar.tsx:37-51)

**Sections Group:**
- `summary` - Summary (Building2 icon)
- `contacts` - Contacts (Users icon)
- `jobs` - Jobs (Briefcase icon)
- `placements` - Placements (UserCheck icon)
- `addresses` - Addresses (MapPin icon)
- `meetings` - Meetings (Calendar icon)
- `escalations` - Escalations (AlertTriangle icon)

**Tools Group:**
- `activities` - Activities (Activity icon)
- `notes` - Notes (StickyNote icon)
- `documents` - Documents (FileText icon)
- `history` - History (History icon)

**Missing:** No `related_accounts` or `subsidiaries` section

### Contact Sidebar (via entity-sections.ts:242-254)

**Sections Group:**
- `overview` - Overview
- `accounts` - Accounts
- `submissions` - Submissions
- `addresses` - Addresses (defined but not implemented)

**Tools Group:**
- `activities` - Activities
- `communications` - Communications (defined but not implemented)
- `meetings` - Meetings (defined but not implemented)
- `notes` - Notes
- `history` - History

---

## Section UI Patterns

### Pattern 1: Premium List with Bottom Detail Panel (Account Sections)

**Example:** `AccountContactsSection.tsx`

**Structure:**
```
┌────────────────────────────────────────────────────────┐
│ Header with gradient + icon + title + search + button  │
├────────────────────────────────────────────────────────┤
│ Table Header Row (grid columns)                        │
├────────────────────────────────────────────────────────┤
│ Row 1 - clickable                                      │
│ Row 2 - clickable (selected → gold background)         │
│ Row 3 - clickable                                      │
├────────────────────────────────────────────────────────┤
│ Pagination Footer (Showing X-Y of Z, Page controls)   │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Detail Panel (appears when row selected)               │
│ ├─ Gradient header with avatar, badges, edit/cancel   │
│ ├─ 3-column content layout                            │
│ │   ├─ Column 1: Person info                          │
│ │   ├─ Column 2: Address & Role                       │
│ │   └─ Column 3: Notes                                │
│ └─ Footer with "Go to Full Profile" link              │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Gradient header (`bg-gradient-to-r from-charcoal-50/80 via-white to-gold-50/30`)
- Grid-based table (`grid-cols-[1fr_140px_140px_180px_120px_90px]`)
- Search input with icon
- Pagination controls
- Row selection with gold highlight
- Animated detail panel (`animate-slide-up`)
- 3-column editable layout
- Form validation with errors
- tRPC mutations for save

**Key Components Used:**
- `Input`, `Textarea`, `Select` from `@/components/ui`
- `Badge` for status indicators
- `Button` with gradient styles
- `DropdownMenu` for row actions

### Pattern 2: Basic Card List (Contact Sections)

**Example:** `ContactActivitiesSection.tsx`

**Structure:**
```
┌────────────────────────────────────────────────────────┐
│ Card                                                   │
│ ├─ CardHeader (title + filter dropdown + button)       │
│ └─ CardContent                                         │
│     ├─ Row with icon, title, status badge, metadata    │
│     ├─ Row ...                                         │
│     └─ Row ...                                         │
└────────────────────────────────────────────────────────┘
```

**Features:**
- Simple Card wrapper
- Basic filter dropdown (no search)
- No pagination
- No row selection
- No detail panel
- No edit functionality

---

## Data Loading Pattern

### Account Data (accounts.ts:28-300)

Fetches ALL section data in ONE parallel Promise.all:
- `accountResult` - Core account with owner + client_details
- `contactsResult` - Contacts with addresses
- `jobsResult` - Jobs with owner + hiring_manager + submission/interview counts
- `placementsResult` - Placements with candidate + job
- `addressesResult` - Account addresses
- `meetingsResult` - Meetings with creator + action_items
- `escalationsResult` - Escalations with full SLA data
- `activitiesResult` - Activities with assignee
- `notesResult` - Notes with creator + tags
- `documentsResult` - Contracts with owner + terms
- `historyResult` - Entity history with user

### Contact Data (contacts.ts:25-188)

Similar pattern but simpler:
- `contactResult` - Core contact with owner
- `accountsResult` - Linked company
- `submissionsAsCandidateResult` - Submissions as candidate
- `submissionsAsPocResult` - Submissions as hiring manager
- `campaignsResult` - Campaign enrollments
- `activitiesResult` - Activities (basic fields)
- `notesResult` - Notes (basic fields)
- `documentsResult` - Documents (basic fields)
- `historyResult` - Audit logs

---

## Database Schema for Related Accounts

The `companies` table has `parent_company_id` column to support hierarchy:

```sql
-- From src/db/schema/schema.ts:13418
parentCompanyId: uuid("parent_company_id"),

-- Foreign key at line 13545
companies_parent_company_id_fkey: foreign key parent_company_id → companies.id

-- Constraint at line 13569
valid_hierarchy: CHECK ((parent_company_id IS NULL) OR (parent_company_id <> id))

-- Index at line 77098 (from meta snapshot)
idx_companies_parent: btree on parent_company_id WHERE deleted_at IS NULL
```

**Query Pattern for Related Accounts:**
```typescript
// Get child accounts (subsidiaries)
.from('companies')
.select('*')
.eq('parent_company_id', accountId)
.is('deleted_at', null)

// Get parent account
.from('companies')
.select('*')
.eq('id', parentCompanyId)
.is('deleted_at', null)

// Get sibling accounts (same parent)
.from('companies')
.select('*')
.eq('parent_company_id', parentCompanyId)
.neq('id', accountId)
.is('deleted_at', null)
```

---

## Section Component Comparison Table

| Feature | Account Sections | Contact Sections |
|---------|------------------|------------------|
| **List Header** | Gradient with icon | Basic CardHeader |
| **Search** | Yes, with icon | No |
| **Pagination** | Yes, with controls | No |
| **Table Layout** | CSS Grid columns | Simple dividers |
| **Row Selection** | Gold highlight | No selection |
| **Detail Panel** | Animated bottom panel | None |
| **3-Column Layout** | Yes, in detail panel | N/A |
| **Inline Editing** | Yes, with validation | No |
| **Form Validation** | Zod-style errors | N/A |
| **tRPC Mutations** | Yes | No |
| **Empty State** | Gradient background, CTA | Basic text + icon |
| **Quick Actions** | Email, Call, Menu | None |
| **Animations** | slide-up, fade-in | None |
| **Gradient Accents** | Throughout | None |
| **Component Lines** | 500-1400 | 100-200 |

---

## Missing Sections Analysis

### Account Workspace - Missing

| Section | Purpose | Database Support |
|---------|---------|------------------|
| **Related Accounts** | Parent/child/sibling accounts | `companies.parent_company_id` exists |

### Contact Workspace - Missing vs Account

| Account Section | Contact Equivalent | Status |
|-----------------|-------------------|--------|
| Jobs | - | Not applicable (contacts linked to accounts) |
| Placements | - | Could be added via submissions |
| Addresses | Addresses | Defined in sidebar but **not implemented** |
| Meetings | Meetings | Defined in sidebar but **not implemented** |
| Escalations | - | Not applicable |
| **Premium pattern** | All sections | **Not implemented** |

---

## Code References

### Premium UI Pattern (Reference Implementation)

**AccountContactsSection.tsx:**
- Lines 468-714: Premium list card with header, search, table, pagination
- Lines 716-1037: Detail panel with 3-column layout
- Lines 77-153: EditableField component
- Lines 159-467: Component logic (state, mutations, handlers)

**AccountActivitiesSection.tsx:**
- Lines 253-543: Premium list with filters and grid layout
- Lines 547-1346: Bottom detail panel with KPI cards

**AccountNotesSection.tsx:**
- Lines 80-550: List view with inline create form
- Lines 552-1027: Detail panel with reply functionality

### Basic UI Pattern (Contact Sections)

**ContactActivitiesSection.tsx:**
- Lines 48-93: Simple Card with header and list
- Lines 95-126: Basic ActivityRow component

---

## Architecture Notes

### Workspace Structure

Both workspaces follow the same architecture:
1. **Layout** (server) - Calls `getFullEntity()` once
2. **Page** (client) - Renders `EntityWorkspace` component
3. **Workspace** - Reads `?section=` param, renders section component
4. **Context Provider** - Provides data via hooks
5. **Section Components** - Receive data via props (no queries)

### Data Flow

```
layout.tsx (server) → getFullAccount()/getFullContact()
    ↓
EntityWorkspaceProvider (context)
    ↓
EntityWorkspace (client) → reads ?section= param
    ↓
SectionComponent (receives data via props)
```

### Sidebar Navigation

- Account: Custom `AccountSidebar.tsx` with sections + tools groups
- Contact: Uses generic `EntityJourneySidebar.tsx` with config from `entity-sections.ts`

---

## Related Research

None currently in `thoughts/shared/research/`

---

## Open Questions

1. Should Related Accounts section show parent, children, AND siblings? --> Whatever the relation between accounts is.. for example vendor might have multiple clients who can be implementing partner or end client or a partner vendor or sister company
2. Should Contact workspace get all Account sections (Jobs via account, Placements via submissions)? --> A contact can be a account employee or partner or contact can by himself be an account sharing jobs, or contact can be working for multiple accounts, an hr at client etc etc.. so i believe every section we have on Account will olso be applicable to Contact worspace with its own relations.. Contact as root object in this case
3. Should Contact sections support inline editing like Account sections? --> Yes, idea is if it is an object withour full workspace we have detailed detail panel with full inline edit functiinality.. If it is a section of object with its own workspace loike account, job, contact, deal, lead etc.. then we want basic einline edit primary fields with a link to full wizard for full workspace.
4. What permissions are needed for editing contacts vs accounts? --> Owner of the account and his supervisor and team manager.
