# InTime v3 Frontend Architecture Rules

## Overview

This document defines the **Guidewire-inspired metadata-driven UI architecture** for InTime v3. All frontend development must follow these patterns to ensure consistency, maintainability, and type safety.

---

## Core Principles

### 1. Metadata-Driven UI
- **Screens are defined via TypeScript configuration**, not hardcoded JSX
- Use `ScreenDefinition` types to declare screen structure
- The `ScreenRenderer` interprets metadata and renders components
- **Never hardcode layout/field structure in React components**

### 2. Reuse Before Create
- **Always check for existing InputSets** before creating new form fragments
- **Always check for existing widgets** before creating custom ones
- **Use entity registry** for all entity-related configuration
- Search for existing patterns: `src/lib/metadata/input-sets/`, `src/lib/metadata/widgets/`

### 3. Type Safety First
- All screen definitions must pass Zod validation
- Use TypeScript interfaces from `src/lib/metadata/types/`
- Never use `any` - use `unknown` with type guards if needed

---

## Component Hierarchy (Guidewire-Inspired)

```
SCREEN (Top-level container)
├── LAYOUT (sidebar-main, tabs, wizard-steps)
│   ├── SIDEBAR (optional)
│   │   └── SECTION (info-card, quick-actions)
│   │       └── WIDGET/FIELD
│   └── MAIN CONTENT
│       ├── TABS (optional)
│       │   └── TAB
│       │       └── SECTION
│       │           └── WIDGET/FIELD
│       └── SECTIONS (if no tabs)
│           └── WIDGET/FIELD
└── ACTIONS (buttons, menus)
```

---

## Screen Types

### 1. Detail Screen (`type: 'detail'`)
**Use for:** Single entity view (JobDetail, TalentDetail, AccountDetail)

```typescript
const jobDetailScreen: ScreenDefinition = {
  id: 'job-detail',
  type: 'detail',
  entityType: 'job',
  title: { type: 'field', path: 'title' },
  dataSource: {
    type: 'entity',
    entityType: 'job',
    entityId: { type: 'param', path: 'id' },
  },
  layout: {
    type: 'sidebar-main',
    sidebar: { ... },
    tabs: [ ... ],
  },
};
```

### 2. List Screen (`type: 'list'`)
**Use for:** Entity list views (JobsList, LeadsList)

```typescript
const jobsListScreen: ScreenDefinition = {
  id: 'jobs-list',
  type: 'list',
  entityType: 'job',
  title: 'Jobs',
  dataSource: {
    type: 'query',
    query: { procedure: 'ats.jobs.list' },
  },
  layout: {
    type: 'single-column',
    sections: [
      { id: 'filters', type: 'form', ... },
      { id: 'list', type: 'table', ... },
    ],
  },
};
```

### 3. List-Detail Screen (`type: 'list-detail'`)
**Use for:** Master-detail split views (Pipeline, Kanban)

```typescript
const pipelineScreen: ScreenDefinition = {
  id: 'pipeline',
  type: 'list-detail',
  entityType: 'submission',
  layout: {
    type: 'sidebar-main',
    sidebarWidth: 'lg',
    sidebar: {
      id: 'list-panel',
      type: 'list',
      dataSource: { ... },
    },
    sections: [
      { id: 'detail-panel', type: 'info-card', ... },
    ],
  },
};
```

### 4. Wizard Screen (`type: 'wizard'`)
**Use for:** Multi-step workflows (PlacementWizard, OnboardingWizard)

```typescript
const placementWizard: WizardScreenDefinition = {
  id: 'placement-wizard',
  type: 'wizard',
  title: 'Create Placement',
  steps: [
    { id: 'select-job', title: 'Select Job', sections: [...] },
    { id: 'select-candidate', title: 'Select Candidate', sections: [...] },
    { id: 'compensation', title: 'Compensation', sections: [...] },
    { id: 'review', title: 'Review', sections: [...] },
  ],
  navigation: { showProgress: true, saveDraft: true },
  onComplete: { action: 'create', entityType: 'placement' },
};
```

### 5. Dashboard Screen (`type: 'dashboard'`)
**Use for:** Role-specific dashboards with KPIs and widgets

```typescript
const recruiterDashboard: ScreenDefinition = {
  id: 'recruiter-dashboard',
  type: 'dashboard',
  title: 'Dashboard',
  layout: {
    type: 'single-column',
    sections: [
      { id: 'metrics', type: 'metrics-grid', ... },
      { id: 'recent-activity', type: 'timeline', ... },
      { id: 'tasks', type: 'list', ... },
    ],
  },
};
```

---

## Section Types

### `info-card`
Key-value information display with optional inline editing.

```typescript
{
  id: 'job-info',
  type: 'info-card',
  title: 'Job Details',
  columns: 2,
  editable: true,
  fields: [
    { id: 'location', dataField: 'location', label: 'Location', type: 'text' },
    { id: 'status', dataField: 'status', label: 'Status', type: 'enum' },
  ],
}
```

### `metrics-grid`
KPI/metric cards in a grid layout.

```typescript
{
  id: 'metrics',
  type: 'metrics-grid',
  columns: 4,
  widgets: [
    { id: 'total', type: 'metric-card', dataField: 'metrics.total', label: 'Total', config: { icon: 'Users' } },
  ],
}
```

### `table`
Data table with sorting, filtering, pagination.

```typescript
{
  id: 'submissions-table',
  type: 'table',
  dataSource: { type: 'query', query: { procedure: 'ats.submissions.list' } },
  columns_config: [
    { id: 'candidate', header: 'Candidate', accessor: 'candidateName', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', type: 'enum' },
  ],
}
```

### `form`
Editable form with validation.

```typescript
{
  id: 'edit-form',
  type: 'form',
  columns: 2,
  fields: [
    { id: 'title', dataField: 'title', label: 'Title', type: 'text', required: true },
  ],
}
```

### `input-set`
Reference to a reusable InputSet.

```typescript
{
  id: 'compensation-section',
  type: 'input-set',
  inputSet: 'compensation',  // References CompensationInputSet
  inputSetPrefix: 'billing', // Optional prefix for nested data
}
```

### `timeline`
Activity/event timeline.

```typescript
{
  id: 'activity',
  type: 'timeline',
  dataSource: { type: 'query', query: { procedure: 'activities.list' } },
}
```

### `custom`
Escape hatch for complex custom components.

```typescript
{
  id: 'custom-chart',
  type: 'custom',
  component: 'PipelineChart',
  componentProps: { showLegend: true },
}
```

---

## Standard InputSets

**ALWAYS USE EXISTING INPUTSETS** when available:

### AddressInputSet
```typescript
{
  id: 'address',
  fields: ['street1', 'street2', 'city', 'state', 'zip', 'country'],
}
```
**Use for:** Candidate addresses, Account addresses, Contact addresses

### ContactInputSet
```typescript
{
  id: 'contact',
  fields: ['firstName', 'lastName', 'email', 'phone', 'title'],
}
```
**Use for:** POC forms, Quick contact add

### CompensationInputSet
```typescript
{
  id: 'compensation',
  fields: ['rateMin', 'rateMax', 'rateType', 'currency', 'benefits'],
}
```
**Use for:** Job compensation, Placement rates, Offer details

### SkillsInputSet
```typescript
{
  id: 'skills',
  fields: ['requiredSkills', 'niceToHaveSkills', 'yearsExperience'],
}
```
**Use for:** Job requirements, Candidate profile

### WorkAuthInputSet
```typescript
{
  id: 'workauth',
  fields: ['visaStatus', 'visaType', 'visaExpiry', 'workAuthorization', 'sponsorshipNeeded'],
}
```
**Use for:** Candidate work authorization

### InterviewInputSet
```typescript
{
  id: 'interview',
  fields: ['type', 'datetime', 'duration', 'interviewers', 'location', 'meetingLink'],
}
```
**Use for:** Interview scheduling

---

## Field Types

### Text Fields
| Type | Use For | Widget |
|------|---------|--------|
| `text` | Single line text | TextInput |
| `textarea` | Multi-line text | TextareaInput |
| `richtext` | Formatted text | RichTextEditor |
| `email` | Email addresses | EmailInput |
| `phone` | Phone numbers | PhoneInput |
| `url` | URLs | UrlInput |

### Numeric Fields
| Type | Use For | Widget |
|------|---------|--------|
| `number` | Integers/decimals | NumberInput |
| `currency` | Money values | CurrencyInput |
| `percentage` | Percentages | PercentageInput |

### Date/Time Fields
| Type | Use For | Widget |
|------|---------|--------|
| `date` | Date only | DatePicker |
| `datetime` | Date + time | DateTimePicker |
| `time` | Time only | TimePicker |

### Choice Fields
| Type | Use For | Widget |
|------|---------|--------|
| `boolean` | Yes/No | Checkbox/Toggle |
| `enum` | Fixed options | Select |
| `select` | Entity reference | EntitySelect |
| `multiselect` | Multiple entities | EntityMultiSelect |
| `tags` | String array | TagInput |

---

## Data Binding

### Dynamic Values
Use `DynamicValue` to reference runtime data:

```typescript
// Entity field
{ type: 'field', path: 'title' }

// URL parameter
{ type: 'param', path: 'id' }

// User context
{ type: 'context', path: 'user.id' }

// Computed value
{ type: 'computed', path: 'fullName' }
```

### Data Sources
```typescript
// Single entity by ID
dataSource: {
  type: 'entity',
  entityType: 'job',
  entityId: { type: 'param', path: 'id' },
}

// Query with filters
dataSource: {
  type: 'query',
  query: {
    procedure: 'ats.jobs.list',
    filters: { status: 'open' },
  },
}
```

---

## Visibility Rules

Control field/section visibility:

```typescript
// Always visible
visible: { type: 'always' }

// Permission-based
visible: { type: 'permission', permission: 'job.compensation.view' }

// Role-based
visible: { type: 'role', roles: ['admin', 'manager'] }

// Condition-based
visible: {
  type: 'condition',
  condition: {
    operator: 'eq',
    field: 'status',
    value: 'active',
  },
}
```

---

## Converting Existing Screens

### Step-by-Step Process

1. **Identify Screen Type**
   - Is it a detail view? → `type: 'detail'`
   - Is it a list? → `type: 'list'`
   - Is it multi-step? → `type: 'wizard'`

2. **Map Current Layout**
   - Has sidebar? → `layout.type: 'sidebar-main'`
   - Has tabs? → `layout.tabs: [...]`
   - Simple layout? → `layout.type: 'single-column'`

3. **Identify Sections**
   - Info cards → `type: 'info-card'`
   - Tables → `type: 'table'`
   - Forms → `type: 'form'`
   - Metrics → `type: 'metrics-grid'`

4. **Check for Existing InputSets**
   - Address fields? → Use `AddressInputSet`
   - Contact fields? → Use `ContactInputSet`
   - Rate/compensation? → Use `CompensationInputSet`

5. **Map Fields to Types**
   - Use the Field Types table above
   - Set `required`, `validation` as needed

6. **Add Actions**
   - Edit button → `{ type: 'modal', modal: 'EditModal' }`
   - Navigate → `{ type: 'navigate', route: '...' }`

7. **Add Visibility Rules**
   - Permission checks for sensitive data
   - Role checks for admin-only sections

### Example Conversion

**Before (hardcoded):**
```tsx
function JobDetail({ job }) {
  return (
    <div>
      <h1>{job.title}</h1>
      <Card>
        <p>Location: {job.location}</p>
        <p>Status: {job.status}</p>
      </Card>
    </div>
  );
}
```

**After (metadata-driven):**
```typescript
// src/screens/recruiting/job-detail.screen.ts
export const jobDetailScreen: ScreenDefinition = {
  id: 'job-detail',
  type: 'detail',
  entityType: 'job',
  title: { type: 'field', path: 'title' },
  dataSource: {
    type: 'entity',
    entityType: 'job',
    entityId: { type: 'param', path: 'id' },
  },
  layout: {
    type: 'single-column',
    sections: [
      {
        id: 'info',
        type: 'info-card',
        fields: [
          { id: 'location', dataField: 'location', label: 'Location', type: 'text' },
          { id: 'status', dataField: 'status', label: 'Status', type: 'enum' },
        ],
      },
    ],
  },
};

// src/app/employee/recruiting/jobs/[id]/page.tsx
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { jobDetailScreen } from '@/screens/recruiting/job-detail.screen';

export default function JobDetailPage() {
  return <ScreenRenderer definition={jobDetailScreen} />;
}
```

---

## File Organization

```
src/
├── lib/metadata/
│   ├── types/           # TypeScript interfaces
│   ├── schemas/         # Zod validation
│   ├── registry/        # Entity, widget, screen registries
│   ├── renderers/       # ScreenRenderer, LayoutRenderer, etc.
│   ├── widgets/         # Widget components
│   │   ├── display/     # Read-only widgets
│   │   └── input/       # Form input widgets
│   ├── patterns/        # DetailView, ListView, Wizard
│   ├── input-sets/      # Reusable form fragments
│   ├── data/            # Data binding utilities
│   └── entities/        # Entity configurations
│
├── screens/             # Screen definitions
│   ├── recruiting/      # ATS screens
│   ├── crm/             # CRM screens
│   ├── academy/         # Academy screens
│   └── index.ts
│
└── app/                 # Next.js pages (thin wrappers)
    └── employee/
        └── recruiting/
            └── jobs/
                └── [id]/
                    └── page.tsx  # Uses ScreenRenderer
```

---

## Checklist for New Screens

- [ ] Screen definition created in `src/screens/[domain]/`
- [ ] Correct screen type selected
- [ ] Data source configured
- [ ] All sections use standard types
- [ ] InputSets used for reusable form fragments
- [ ] Fields mapped to correct types
- [ ] Visibility rules for sensitive data
- [ ] Actions defined for edit/create/delete
- [ ] Page component uses `ScreenRenderer`
- [ ] Zod validation passes
- [ ] Entity registry updated if new entity

---

## Anti-Patterns to Avoid

### ❌ Don't: Hardcode layout in JSX
```tsx
// BAD
function JobDetail({ job }) {
  return (
    <div className="grid grid-cols-2">
      <div>{job.title}</div>
      <div>{job.status}</div>
    </div>
  );
}
```

### ✅ Do: Define in screen metadata
```typescript
// GOOD
const jobDetailScreen = {
  layout: {
    type: 'single-column',
    sections: [{ type: 'info-card', columns: 2, fields: [...] }],
  },
};
```

### ❌ Don't: Create duplicate InputSets
```typescript
// BAD - Creating new address fields
fields: [
  { id: 'addr1', dataField: 'address1', label: 'Address', type: 'text' },
  { id: 'city', dataField: 'city', label: 'City', type: 'text' },
  // ...duplicating AddressInputSet
]
```

### ✅ Do: Reference existing InputSet
```typescript
// GOOD
{ id: 'address', type: 'input-set', inputSet: 'address' }
```

### ❌ Don't: Use `any` types
```typescript
// BAD
const screen: any = { ... };
```

### ✅ Do: Use proper types
```typescript
// GOOD
const screen: ScreenDefinition = { ... };
```

---

## Quick Reference

### Common Imports
```typescript
import type { ScreenDefinition, WizardScreenDefinition } from '@/lib/metadata/types';
import { ScreenRenderer } from '@/lib/metadata/renderers';
import { validateScreenDefinition } from '@/lib/metadata/schemas';
```

### Entity Types
```typescript
type EntityType =
  | 'job' | 'submission' | 'talent' | 'interview' | 'offer' | 'placement'
  | 'lead' | 'deal' | 'account' | 'contact'
  | 'course' | 'enrollment' | 'certificate';
```

### tRPC Namespaces
```typescript
'ats.jobs' | 'ats.submissions' | 'ats.interviews' | 'ats.offers' | 'ats.placements'
'crm.leads' | 'crm.deals' | 'crm.accounts' | 'crm.contacts'
'academy.courses' | 'academy.enrollments'
'workplan.activities' | 'workplan.patterns' | 'workplan.templates'
```

---

## Activity/Workplan Integration

### Root Entities

Root entities have full lifecycle tracking with workplans:

```typescript
const ROOT_ENTITIES = ['lead', 'job', 'submission', 'deal', 'placement'];

// Root entity detail screens MUST include:
// 1. WorkplanProgress component (sidebar or header)
// 2. Activity tab with timeline
// 3. Activity logging on all mutations
```

### Standard Activity Tab

Every root entity detail screen should include an Activity tab:

```typescript
{
  id: 'activity',
  label: 'Activity',
  icon: 'Activity',
  sections: [
    {
      id: 'workplan-progress',
      type: 'custom',
      component: 'WorkplanProgress',
      componentProps: {
        showPhases: true,
        showCompletedCount: true,
      },
    },
    {
      id: 'activity-timeline',
      type: 'timeline',
      dataSource: {
        type: 'query',
        query: {
          router: 'workplan',
          procedure: 'listActivities',
          input: {
            entityType: { type: 'context', path: 'entityType' },
            entityId: { type: 'param', path: 'id' },
          },
        },
      },
      config: {
        showWorkplanActivities: true,
        showManualActivities: true,
        allowAddActivity: true,
        allowCompleteActivity: true,
      },
    },
  ],
}
```

### Timeline Section Type

The `timeline` section type displays activities:

```typescript
{
  id: 'activities',
  type: 'timeline',
  title: 'Activity Timeline',
  dataSource: {
    type: 'query',
    query: {
      router: 'workplan',
      procedure: 'listActivities',
      input: {
        entityType: paramValue('entityType'),
        entityId: paramValue('id'),
      },
    },
  },
  config: {
    // Filter options
    showWorkplanActivities: true,  // Activities from workplan
    showManualActivities: true,     // Manually logged activities
    showSystemActivities: false,    // Auto-logged system events

    // UI options
    groupByDate: true,
    showAvatars: true,
    maxItems: 50,

    // Actions
    allowAddActivity: true,
    allowCompleteActivity: true,
    allowSkipActivity: true,
    allowReassignActivity: true,
  },
}
```

### WorkplanProgress Component

Shows workplan progress in sidebar or header:

```typescript
// Usage in sidebar
{
  id: 'sidebar',
  type: 'info-card',
  fields: [
    // ... other fields
  ],
  footer: {
    type: 'custom',
    component: 'WorkplanProgress',
    componentProps: {
      compact: true,
      showCurrentActivity: true,
    },
  },
}

// WorkplanProgress displays:
// - Progress bar (completed/total)
// - Current phase name
// - Next activity due
// - Days since start
```

### Activity-Aware Actions

Root entity screens should include activity-related actions:

```typescript
actions: [
  {
    id: 'log-activity',
    label: 'Log Activity',
    icon: 'Plus',
    variant: 'outline',
    action: {
      type: 'modal',
      modal: 'LogActivityModal',
      modalProps: {
        entityType: { type: 'context', path: 'entityType' },
        entityId: { type: 'param', path: 'id' },
      },
    },
  },
  {
    id: 'view-workplan',
    label: 'View Workplan',
    icon: 'ListTodo',
    visible: {
      type: 'condition',
      condition: {
        field: 'workplanInstanceId',
        operator: 'exists',
      },
    },
    action: {
      type: 'modal',
      modal: 'WorkplanDetailModal',
    },
  },
]
```

### Complete Entity Detail Screen Example (with Activities)

```typescript
// src/screens/crm/lead-detail.screen.ts

export const leadDetailScreen: ScreenDefinition = {
  id: 'lead-detail',
  type: 'detail',
  entityType: 'lead',

  title: { type: 'field', path: 'companyName' },
  subtitle: { type: 'field', path: 'status' },

  dataSource: {
    type: 'entity',
    entityType: 'lead',
    entityId: { type: 'param', path: 'id' },
  },

  layout: {
    type: 'sidebar-main',

    sidebar: {
      id: 'lead-sidebar',
      type: 'info-card',
      fields: [
        { id: 'status', dataField: 'status', label: 'Status', type: 'enum' },
        { id: 'tier', dataField: 'tier', label: 'Tier', type: 'enum' },
        { id: 'owner', dataField: 'owner.name', label: 'Owner', type: 'text' },
        { id: 'estimatedValue', dataField: 'estimatedValue', label: 'Value', type: 'currency' },
        { id: 'created', dataField: 'createdAt', label: 'Created', type: 'date' },
      ],
      footer: {
        type: 'custom',
        component: 'WorkplanProgress',
        componentProps: { compact: true },
      },
    },

    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        icon: 'LayoutGrid',
        sections: [
          // Company info, contact info, etc.
        ],
      },
      {
        id: 'qualification',
        label: 'Qualification',
        icon: 'Target',
        sections: [
          // BANT scores, qualification status
        ],
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Activity',
        badge: { type: 'field', path: 'openActivityCount' },
        sections: [
          {
            id: 'workplan-progress',
            type: 'custom',
            component: 'WorkplanProgress',
          },
          {
            id: 'activity-timeline',
            type: 'timeline',
            dataSource: {
              type: 'query',
              query: {
                router: 'workplan',
                procedure: 'listActivities',
              },
            },
            config: {
              showWorkplanActivities: true,
              showManualActivities: true,
              allowAddActivity: true,
              allowCompleteActivity: true,
            },
          },
        ],
      },
    ],
  },

  actions: [
    { id: 'edit', label: 'Edit', icon: 'Edit', variant: 'primary' },
    { id: 'log-activity', label: 'Log Activity', icon: 'Plus', variant: 'outline' },
    {
      id: 'more',
      type: 'dropdown',
      label: 'More',
      items: [
        { id: 'convert', label: 'Convert to Deal', icon: 'ArrowRight' },
        { id: 'mark-lost', label: 'Mark as Lost', icon: 'X' },
      ],
    },
  ],
};
```

---

## Activity Components Reference

### Standard Activity Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `WorkplanProgress` | Shows progress bar and current phase | `compact`, `showPhases`, `showCurrentActivity` |
| `ActivityTimeline` | Timeline of activities | `entityType`, `entityId`, `filters` |
| `ActivityCard` | Single activity display | `activity`, `onComplete`, `onSkip` |
| `ActivityForm` | Create/edit activity | `entityType`, `entityId`, `patternCode?` |
| `LogActivityModal` | Modal for logging activity | `entityType`, `entityId` |
| `WorkplanDetailModal` | Full workplan view | `workplanInstanceId` |
| `CompleteActivityModal` | Complete with outcome | `activityId`, `onComplete` |

### Activity Status Icons

```typescript
const ACTIVITY_STATUS_ICONS = {
  open: 'Circle',
  in_progress: 'PlayCircle',
  completed: 'CheckCircle2',
  skipped: 'SkipForward',
  canceled: 'XCircle',
  blocked: 'AlertCircle',
};

const ACTIVITY_PRIORITY_COLORS = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};
```
