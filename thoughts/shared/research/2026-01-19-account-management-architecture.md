---
date: 2026-01-19T22:02:21Z
researcher: Claude
git_commit: 2673376b4300195fba13e2626384dcc38ba0436a
branch: main
repository: intime-v3
topic: "Account Management System Architecture"
tags: [research, codebase, accounts, wizard, workspace, sections, tRPC]
status: complete
last_updated: 2026-01-19
last_updated_by: Claude
---

# Research: Account Management System Architecture

**Date**: 2026-01-19T22:02:21Z
**Researcher**: Claude
**Git Commit**: 2673376b4300195fba13e2626384dcc38ba0436a
**Branch**: main
**Repository**: intime-v3

## Research Question

Document the current account management system architecture including the wizard (create mode), workspace (detail view), section components, backend procedures, and state management.

## Summary

The InTime v3 account management system follows a **unified section component architecture** where the same components handle create, view, and edit modes. The system uses:

1. **Zustand store** (`create-account-store.ts`) for client-side form state during wizard
2. **PCF Wizard framework** (`WizardWithSidebar`) for multi-step account creation
3. **Draft pattern** via `useEntityDraft` hook - auto-saves to database every 2 seconds
4. **ONE database call pattern** - layout fetches all data, sections consume from context
5. **InlinePanel editing** - detail page sections use sliding panels for edits
6. **tRPC backend** with `createEnhanced`/`updateEnhanced` endpoints handling all section data

---

## Detailed Findings

### 1. File Structure Overview

```
src/
├── stores/
│   └── create-account-store.ts                    # Zustand store (386 lines)
│
├── components/accounts/
│   ├── sections/
│   │   ├── IdentitySection.tsx                    # 832 lines - 3 modes
│   │   ├── LocationsSection.tsx                   # 472 lines - 3 modes
│   │   ├── BillingSection.tsx                     # ~750 lines - 3 modes
│   │   ├── ContactsSection.tsx                    # ~590 lines - 3 modes
│   │   ├── ContractsSection.tsx                   # ~720 lines - 3 modes
│   │   ├── ComplianceSection.tsx                  # ~510 lines - 3 modes
│   │   └── TeamSection.tsx                        # ~650 lines - 3 modes
│   ├── wizard/
│   │   └── index.tsx                              # Step wrappers (236 lines)
│   ├── workspace/
│   │   └── index.tsx                              # Section wrappers (539 lines)
│   ├── layouts/
│   │   ├── SectionHeader.tsx                      # Shared header component
│   │   ├── FieldGrid.tsx                          # Grid layout helper
│   │   └── CardView.tsx                           # InfoRow component
│   └── fields/
│       └── (to be created)                        # UnifiedField component
│
├── lib/accounts/
│   ├── types.ts                                   # Section data types (436 lines)
│   └── constants.ts                               # Constants + helpers (307 lines)
│
├── hooks/
│   ├── use-entity-draft.ts                        # Draft auto-save (521 lines)
│   └── use-entity-wizard.ts                       # Wizard navigation (309 lines)
│
├── components/pcf/wizard/
│   ├── WizardWithSidebar.tsx                      # Main orchestrator
│   ├── WizardStep.tsx                             # Step renderer
│   ├── WizardReview.tsx                           # Review step
│   └── WizardStepsSidebar.tsx                     # Progress sidebar
│
├── components/workspaces/
│   ├── AccountWorkspace.tsx                       # Main workspace (230 lines)
│   └── account/
│       ├── AccountWorkspaceProvider.tsx           # Context provider (65 lines)
│       ├── AccountHeader.tsx                      # Header component
│       ├── AccountSidebar.tsx                     # Navigation sidebar
│       └── sections/                              # Non-unified sections
│
├── configs/entities/wizards/
│   └── account-create.config.tsx                  # Wizard config (205 lines)
│
├── app/employee/recruiting/accounts/
│   ├── new/page.tsx                               # Create wizard (610 lines)
│   └── [id]/
│       ├── layout.tsx                             # Server component - ONE db call
│       └── page.tsx                               # Dialog orchestration
│
└── server/routers/
    └── crm.ts                                     # accounts router (lines 32-2483)
```

---

### 2. Zustand Store Architecture

**File**: `src/stores/create-account-store.ts`

The store manages all account form data during creation/editing:

```typescript
interface CreateAccountStore {
  formData: CreateAccountFormData    // All section data
  currentStep: number                // Current wizard step
  isDirty: boolean                   // Has unsaved changes
  lastSaved: Date | null             // Last auto-save timestamp

  // Actions
  setFormData: (data: Partial<CreateAccountFormData>) => void
  setCurrentStep: (step: number) => void
  resetForm: () => void
  toggleIndustry: (industry: string) => void

  // Array helpers for addresses, contacts, contracts
  addAddress / removeAddress / updateAddress
  addContact / removeContact / updateContact
  addContract / removeContract / updateContract
}
```

**Key Characteristics**:
- NO localStorage persistence (line 275) - database is source of truth
- `setFormData` updates `isDirty` and `lastSaved` timestamps
- Array helpers handle nested collections (addresses, contacts, contracts)
- Default form data defined at lines 186-273

**Data Shape** (`CreateAccountFormData`):
- Step 1: Identity (`accountType`, `name`, `legalName`, `dba`, `taxId`, `email`, `phone`, `website`, `linkedinUrl`, `description`, `industries`, `companyType`, `tier`, `segment`, etc.)
- Step 2: Locations (`addresses[]`)
- Step 3: Billing (`billingEntityName`, `billingEmail`, `billingPhone`, `billingFrequency`, `paymentTermsDays`, `poRequired`, etc.)
- Step 4: Contacts (`contacts[]`)
- Step 5: Contracts (`contracts[]`)
- Step 6: Compliance (`compliance` nested object)
- Step 7: Team (`team` object with `ownerId`, `accountManagerId`, etc.)

---

### 3. Wizard System (PCF Framework)

#### 3.1 Configuration

**File**: `src/configs/entities/wizards/account-create.config.tsx`

The wizard is configured with 7 steps:

| Step | ID | Component | Validation |
|------|-----|-----------|------------|
| 1 | identity | IdentityStepWrapper | name >= 2 chars, industries >= 1 |
| 2 | locations | LocationsStepWrapper | Optional |
| 3 | billing | BillingStepWrapper | Valid billing email |
| 4 | contacts | ContactsStepWrapper | Optional |
| 5 | contracts | ContractsStepWrapper | Optional |
| 6 | compliance | ComplianceStepWrapper | Optional |
| 7 | team | TeamStepWrapper | Account Owner required |

Plus a review step showing all collected data.

#### 3.2 Draft Management (`useEntityDraft` hook)

**File**: `src/hooks/use-entity-draft.ts:111-513`

Key behaviors:
1. **Initialization** (lines 243-334):
   - New wizard: Resets form to clean state
   - Resume mode: Loads draft from DB, restores step position

2. **Auto-save** (lines 337-359):
   - Watches form data changes
   - Debounced 2-second delay
   - Only saves if form has meaningful data (name field populated)

3. **Draft Creation** (lines 172-240):
   - First save creates entity with `status: 'draft'`
   - Subsequent saves update existing draft
   - Uses `draftIdRef` to prevent race conditions

4. **Finalization** (lines 445-501):
   - Updates draft to target status (e.g., 'active')
   - Clears `wizard_state` from entity
   - Resets form after success

**Storage Strategy**:
- Drafts stored in main `companies` table with `status: 'draft'`
- `wizard_state` stored in `custom_fields` JSONB column
- Contains: `formData`, `currentStep`, `totalSteps`, `lastSavedAt`

#### 3.3 Wizard Components

| Component | File | Purpose |
|-----------|------|---------|
| WizardWithSidebar | `src/components/pcf/wizard/WizardWithSidebar.tsx` | Main orchestrator |
| WizardStep | `src/components/pcf/wizard/WizardStep.tsx` | Renders current step |
| WizardReview | `src/components/pcf/wizard/WizardReview.tsx` | Final review display |
| WizardStepsSidebar | `src/components/pcf/wizard/WizardStepsSidebar.tsx` | Progress navigation |
| useEntityWizard | `src/hooks/use-entity-wizard.ts` | Navigation + validation |

#### 3.4 Step Wrappers

**File**: `src/components/accounts/wizard/index.tsx`

Each step wrapper bridges the Zustand store to section components:

```typescript
export function IdentityStepWrapper() {
  const { formData, setFormData, toggleIndustry } = useCreateAccountStore()

  // Map store data to section data type
  const data: IdentitySectionData = {
    accountType: formData.accountType,
    name: formData.name,
    // ... map all fields
  }

  const handleChange = (field: string, value: unknown) => {
    if (field === 'industries') {
      toggleIndustry(value as string)
    } else {
      setFormData({ [field]: value })
    }
  }

  return (
    <IdentitySection
      mode="create"
      data={data}
      onChange={handleChange}
      onToggleIndustry={toggleIndustry}
    />
  )
}
```

---

### 4. Section Component Architecture

All 7 section components follow a **unified three-mode pattern**:

#### 4.1 Common Props Interface

```typescript
interface SectionProps {
  mode: 'create' | 'view' | 'edit'    // Determines rendering
  data: SectionData                    // Section-specific data
  onChange?: (field, value) => void   // Field change handler
  onSave?: () => Promise<void>        // Edit mode save
  onCancel?: () => void               // Edit mode cancel
  isSaving?: boolean                   // Loading state
  errors?: Record<string, string>     // Validation errors
  className?: string                   // Additional styles
}
```

#### 4.2 Mode Rendering Patterns

**CREATE Mode** (wizard step):
- Full form layout using `SectionWrapper` components
- `FieldGrid` for responsive layouts
- Direct inputs (Input, Select, PhoneInput, etc.)
- Inline validation error display

**VIEW Mode** (detail page section):
- Card-based read-only display
- `InfoRow` component for label/value pairs
- Edit button in section header
- `InlinePanel` for editing (opens as sliding panel)

**EDIT Mode** (within view):
- Managed via `isEditing` state
- `InlinePanel` component (width="lg")
- Organized in `InlinePanelSection` groups
- Save/Cancel actions in panel footer

#### 4.3 Section Summary

| Section | File | Create UI | View UI | Edit UI |
|---------|------|-----------|---------|---------|
| Identity | `IdentitySection.tsx:80-831` | 5 SectionWrappers with account type cards, industry chips, selects | 4 cards (Identity, Classification, Corporate, Digital) | InlinePanel with 4 sections |
| Locations | `LocationsSection.tsx:85-469` | Table + inline add/edit panel | Table with actions | Same as create |
| Billing | `BillingSection.tsx:94-738` | 4 SectionWrappers | 5 cards (Payment, Rates, Credit, PO, Financial) | InlinePanel with 4 sections |
| Contacts | `ContactsSection.tsx:101-586` | Table + inline add/edit panel | Table with actions | Same as create |
| Contracts | `ContractsSection.tsx:100-715` | Table + inline add/edit panel | Table with file upload | Same as create |
| Compliance | `ComplianceSection.tsx:103-509` | 3 SectionWrappers with checkbox cards | 2 cards (Insurance, Screening) | InlinePanel with 3 sections |
| Team | `TeamSection.tsx:89-653` | 2 SectionWrappers with role cards | Team member cards + preferences | InlinePanel with 2 sections |

---

### 5. Workspace Architecture (Detail View)

#### 5.1 ONE Database Call Pattern

**Layout** (`src/app/employee/recruiting/accounts/[id]/layout.tsx`):
```typescript
export default async function AccountDetailLayout({ children, params }) {
  const { id } = await params
  const account = await getFullAccount(id)  // ONE call here

  if (!account) return notFound()

  return (
    <EntityContextProvider entityType="account" entityId={id} ...>
      <AccountWorkspaceProvider initialData={account}>
        {children}
      </AccountWorkspaceProvider>
    </EntityContextProvider>
  )
}
```

**Server Action** (`src/app/employee/recruiting/accounts/[id]/actions/accounts.ts:29-421`):

`getFullAccount` fetches all data in parallel via `Promise.all`:
1. Core account with owner, manager, client details
2. Direct contacts (via `company_id` FK)
3. Junction contacts (via `company_contacts` table)
4. Jobs (where account is client)
5. Placements
6. Addresses (polymorphic)
7. Meetings
8. Escalations
9. Activities
10. Notes
11. Documents/Contracts
12. History
13. Related accounts

#### 5.2 AccountWorkspaceProvider

**File**: `src/components/workspaces/account/AccountWorkspaceProvider.tsx:35-62`

```typescript
export function AccountWorkspaceProvider({ initialData, children }) {
  const router = useRouter()
  const [data, setData] = useState(initialData)

  // Sync with initialData changes (after router.refresh)
  useEffect(() => setData(initialData), [initialData])

  // Refresh triggers router.refresh() to reload layout
  const refreshData = useCallback(() => router.refresh(), [router])

  return (
    <AccountWorkspaceContext.Provider value={{ data, refreshData }}>
      {children}
    </AccountWorkspaceContext.Provider>
  )
}
```

#### 5.3 AccountWorkspace Component

**File**: `src/components/workspaces/AccountWorkspace.tsx:75-227`

URL-driven section switching:
```typescript
export function AccountWorkspace() {
  const { data, refreshData } = useAccountWorkspace()
  const searchParams = useSearchParams()

  // Section from URL, default to 'summary'
  const currentSection = searchParams.get('section') || 'summary'

  return (
    <div>
      {currentSection === 'identity' && <AccountIdentitySectionWrapper />}
      {currentSection === 'locations' && <AccountLocationsSectionWrapper />}
      {currentSection === 'billing' && <AccountBillingSectionWrapper />}
      {/* ... other sections */}
    </div>
  )
}
```

#### 5.4 Workspace Section Wrappers

**File**: `src/components/accounts/workspace/index.tsx`

Each wrapper:
1. Gets data from `useAccountWorkspace()` context
2. Sets up mutations via tRPC
3. Manages local edit state
4. Maps workspace data to section data types
5. Calls section component with `mode="view"`

Example:
```typescript
export function AccountIdentitySectionWrapper() {
  const { data, refreshData } = useAccountWorkspace()
  const [editData, setEditData] = useState({})
  const updateMutation = trpc.crm.accounts.update.useMutation()

  // Map workspace data to section data
  const sectionData: IdentitySectionData = {
    name: data.account.name,
    legalName: data.account.legal_name || '',
    // ... map all fields
    ...editData,  // Merge local edits
  }

  const handleSave = async () => {
    await updateMutation.mutateAsync({
      id: data.account.id,
      ...mapFieldsToDbColumns(editData),
    })
    refreshData()
    setEditData({})
  }

  return (
    <IdentitySection
      mode="view"
      data={sectionData}
      onChange={(field, value) => setEditData(prev => ({ ...prev, [field]: value }))}
      onSave={handleSave}
      onCancel={() => setEditData({})}
      isSaving={updateMutation.isPending}
    />
  )
}
```

---

### 6. Backend tRPC Procedures

**File**: `src/server/routers/crm.ts:32-2483`

#### 6.1 Key Procedures

| Procedure | Lines | Purpose |
|-----------|-------|---------|
| `list` | 34-109 | Query accounts with filters, pagination |
| `getById` | 110-181 | Basic account + addresses + primary contact |
| `getByIdLite` | 185-209 | Minimal fields for layout header |
| `getByIdForEdit` | 213-459 | ALL data for wizard edit mode |
| `createEnhanced` | 573-896 | Full wizard create with all sections |
| `updateEnhanced` | 1169-1483 | Full wizard update with all sections |
| `update` | 1486-1934 | Standard update with status transitions |
| `listMyDrafts` | 2390-2425 | User's draft accounts |
| `deleteDraft` | 2428-2482 | Delete with ownership verification |

#### 6.2 createEnhanced Input Schema (lines 574-644)

Accepts all section data in one mutation:
```typescript
{
  // Identity
  accountType, name, legalName, dba, taxId, website, linkedinUrl, description, phone, email,
  industries, companyType, tier, segment, status, foundedYear, employeeCount, revenueRange, ownershipType,

  // Locations
  addresses: AccountAddress[],

  // Billing
  billingEntityName, billingEmail, billingPhone, billingFrequency, paymentTermsDays, poRequired, currentPoNumber, poExpirationDate, currency, invoiceFormat,

  // Contacts
  contacts: AccountContact[],

  // Contracts
  contracts: AccountContract[],

  // Compliance
  compliance: AccountCompliance,

  // Team
  team: TeamAssignment,

  // Draft state
  wizard_state: any,
}
```

#### 6.3 Data Storage

| Data | Table | Relationship |
|------|-------|-------------|
| Account | `companies` | Main entity |
| Billing | `company_client_details` | One-to-one |
| Addresses | `addresses` | One-to-many (polymorphic) |
| Contacts | `contacts` + `company_contacts` | One-to-many + junction |
| Contracts | `contracts` | One-to-many (polymorphic) |
| Compliance | `company_compliance_requirements` | One-to-one |
| Team | `companies.owner_id`, etc. | FK to `user_profiles` |

#### 6.4 Idempotent Upserts

All array data uses client-provided UUIDs for idempotency:
```typescript
for (const addr of input.addresses) {
  await tx.insert(addresses)
    .values({
      id: addr.id,  // Client-provided UUID
      entity_type: 'account',
      entity_id: accountId,
      // ... fields
    })
    .onConflictDoUpdate({
      target: addresses.id,
      set: { /* updated fields */ }
    })
}
```

---

### 7. Type System

**File**: `src/lib/accounts/types.ts`

#### 7.1 Mode Type
```typescript
type SectionMode = 'create' | 'view' | 'edit'
```

#### 7.2 Section Data Types

| Type | Lines | Fields |
|------|-------|--------|
| `IdentitySectionData` | 128-152 | accountType, name, legalName, dba, taxId, email, phone, website, linkedinUrl, description, industries, companyType, tier, segment, status, foundedYear, employeeRange, revenueRange, ownershipType |
| `LocationsSectionData` | 154-156 | addresses[] |
| `BillingSectionData` | 158-177 | billing fields, credit, rates |
| `ContactsSectionData` | 179-181 | contacts[] |
| `ContractsSectionData` | 183-185 | contracts[] |
| `ComplianceSectionData` | 187-189 | compliance (nested) |
| `TeamSectionData` | 191-196 | team, preferredContactMethod, meetingCadence, submissionMethod |

#### 7.3 Sub-entity Types

| Type | Lines | Usage |
|------|-------|-------|
| `AccountAddress` | 44-54 | Addresses array item |
| `AccountContact` | 56-76 | Contacts array item |
| `AccountContract` | 78-94 | Contracts array item |
| `AccountCompliance` | 96-111 | Compliance nested object |
| `TeamAssignment` | 113-124 | Team nested object |

---

## Code References

### Frontend - Components
- `src/components/accounts/sections/IdentitySection.tsx:80-831` - Identity section component
- `src/components/accounts/sections/LocationsSection.tsx:85-469` - Locations section component
- `src/components/accounts/wizard/index.tsx:40-235` - Wizard step wrappers
- `src/components/accounts/workspace/index.tsx:41-538` - Workspace section wrappers
- `src/components/workspaces/AccountWorkspace.tsx:75-227` - Main workspace component
- `src/components/workspaces/account/AccountWorkspaceProvider.tsx:35-62` - Context provider

### Frontend - Hooks & State
- `src/stores/create-account-store.ts:155-385` - Zustand store
- `src/hooks/use-entity-draft.ts:111-513` - Draft management hook
- `src/hooks/use-entity-wizard.ts:52-309` - Wizard navigation hook

### Frontend - Configuration
- `src/configs/entities/wizards/account-create.config.tsx:27-204` - Wizard configuration
- `src/lib/accounts/types.ts:44-196` - Type definitions
- `src/lib/accounts/constants.ts:9-306` - Constants and helpers

### Backend - tRPC
- `src/server/routers/crm.ts:32-2483` - Accounts router
- `src/server/routers/crm.ts:573-896` - createEnhanced procedure
- `src/server/routers/crm.ts:1169-1483` - updateEnhanced procedure
- `src/server/routers/crm.ts:213-459` - getByIdForEdit procedure

### Page Components
- `src/app/employee/recruiting/accounts/new/page.tsx:277-609` - Create wizard page
- `src/app/employee/recruiting/accounts/[id]/layout.tsx:14-52` - Detail layout (ONE db call)
- `src/app/employee/recruiting/accounts/[id]/actions/accounts.ts:29-421` - getFullAccount action

---

## Architecture Documentation

### Current Patterns

1. **Unified Section Components**: Same component handles create/view/edit with mode prop
2. **Store-Based Wizard**: Zustand manages form state, `useEntityDraft` handles persistence
3. **Draft Pattern**: Entities created with `status: 'draft'`, auto-saved every 2 seconds
4. **ONE Database Call**: Server layout fetches all data, context distributes to children
5. **InlinePanel Editing**: View mode sections use sliding panels for edits
6. **Idempotent Upserts**: Client-provided UUIDs enable safe repeated saves
7. **Event-Driven Dialogs**: Sidebar dispatches events, page orchestrates dialogs

### Data Flow - Create

```
User enters wizard
  └─> Page creates WizardWithSidebar
      └─> useEntityDraft initializes (resets form if new)
          └─> WizardStep renders current step
              └─> StepWrapper maps store to section props
                  └─> Section renders create mode UI
                      └─> onChange calls store.setFormData
                          └─> useEntityDraft detects change
                              └─> debouncedSave (2s delay)
                                  └─> createEnhanced/updateEnhanced mutation
                                      └─> Draft saved to companies table
```

### Data Flow - View/Edit

```
User navigates to /accounts/[id]
  └─> layout.tsx (Server)
      └─> getFullAccount(id) - ONE database call
          └─> AccountWorkspaceProvider receives data
              └─> AccountWorkspace renders
                  └─> URL ?section=X determines section
                      └─> SectionWrapper gets data from context
                          └─> Section renders view mode
                              └─> User clicks Edit
                                  └─> isEditing = true
                                      └─> InlinePanel opens
                                          └─> User edits, clicks Save
                                              └─> trpc.accounts.update mutation
                                                  └─> refreshData() triggers router.refresh()
```

---

## Related Research

*(No prior research documents found)*

---

## Open Questions

1. **Event System**: No current event emitter for side effects (activities, notifications). Spec proposes adding one.
2. **Section Containers**: Current architecture uses wrapper components. Spec proposes consolidating.
3. **Backend Services**: No service layer currently. All logic in tRPC procedures. Spec proposes AccountService.
4. **Status Transitions**: Validation exists in `update` procedure but not formalized as state machine.
