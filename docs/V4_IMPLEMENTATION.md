# InTime v4 Implementation Guide

## Overview

InTime v4 is a lean redesign following Apple's "less is best" philosophy with **Linear-style design**. This document describes the implementation architecture and how to use the new system.

## Quick Start

Access v4 by navigating to any of these routes:
- `/inbox` - Work queue
- `/jobs` - Job listings
- `/candidates` - Candidate listings
- `/accounts` - Account listings
- `/leads` - Lead listings
- `/deals` - Deal listings

## Key Features

### 1. Unified Entity System

All entities (Job, Candidate, Account, Contact, Lead, Deal) share a single schema-driven architecture:

```typescript
// Define entity schema once
export const jobSchema: EntitySchema = {
  type: 'job',
  label: { singular: 'Job', plural: 'Jobs' },
  icon: Briefcase,
  basePath: '/jobs',
  titleField: 'title',
  status: {
    field: 'status',
    values: [
      { value: 'draft', label: 'Draft', color: 'neutral' },
      { value: 'open', label: 'Open', color: 'success' },
      // ...
    ],
    transitions: {
      draft: ['open', 'closed'],
      // ...
    },
  },
  tabs: [...],
  actions: {...},
  list: {...},
  fields: {...},
}
```

### 2. Linear-Style Design

Dark mode by default with minimal chrome:

```css
/* Core colors */
--linear-bg: #0d0d0d;           /* Background */
--linear-surface: #1a1a1a;       /* Card surfaces */
--linear-text-primary: #ffffff;  /* Primary text */
--linear-accent: #6c7ae0;        /* Accent color */
```

### 3. Command Palette (Cmd+K)

The command palette provides quick access to:
- Navigation (G+J for Jobs, G+C for Candidates, etc.)
- Create actions (C+J for new Job, C+C for new Candidate)
- Settings and theme toggle

### 4. Keyboard Navigation

Vim-style navigation throughout:
```
j/k or ↑/↓  - Navigate list items
Enter       - Open selected item
G+J         - Go to Jobs
G+C         - Go to Candidates
C+J         - Create new Job
Cmd+K       - Open command palette
```

## Architecture

### Directory Structure

```
src/
├── app/(v4)/                    # V4 pages (route group)
│   ├── layout.tsx               # V4 layout with AppLayout
│   ├── inbox/page.tsx           # Inbox/work queue
│   ├── [entityType]/            # Dynamic entity routes
│   │   ├── page.tsx             # Entity list
│   │   └── [id]/page.tsx        # Entity detail
│
├── components/v4/               # V4 components
│   ├── entity/                  # Entity components
│   │   ├── EntityView.tsx       # Unified detail view
│   │   └── EntityList.tsx       # Unified list view
│   ├── layout/                  # Layout components
│   │   ├── AppLayout.tsx        # Main app layout
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── command/                 # Command palette
│   │   └── CommandPalette.tsx   # Cmd+K implementation
│   └── theme/                   # Theme management
│       └── ThemeProvider.tsx    # Dark/light mode
│
├── lib/entity/                  # Entity system
│   ├── schema.ts                # Schema types and registry
│   └── schemas/                 # Entity schemas
│       ├── index.ts             # Schema exports
│       ├── job.ts               # Job schema
│       ├── candidate.ts         # Candidate schema
│       ├── account.ts           # Account schema
│       ├── contact.ts           # Contact schema
│       ├── lead.ts              # Lead schema
│       └── deal.ts              # Deal schema
│
├── styles/
│   └── linear.css               # Linear-style CSS
│
├── hooks/
│   └── useKeyboardNavigation.ts # Keyboard nav hooks
│
└── server/routers/
    └── entity.ts                # Unified entity router
```

### Component Usage

#### EntityList

```tsx
import { EntityList } from '@/components/v4/entity'
import { getEntitySchema } from '@/lib/entity/schema'

const schema = getEntitySchema('job')

<EntityList
  schema={schema}
  entities={jobs}
  onCreateNew={() => router.push('/jobs/new')}
/>
```

#### EntityView

```tsx
import { EntityView } from '@/components/v4/entity'
import { getEntitySchema } from '@/lib/entity/schema'

const schema = getEntitySchema('job')

<EntityView
  schema={schema}
  entity={job}
/>
```

### Schema System

The schema system is the single source of truth for entity configuration:

```typescript
interface EntitySchema {
  type: EntityType
  label: { singular: string; plural: string }
  icon: LucideIcon
  basePath: string

  // Display
  titleField: string
  subtitleField?: string

  // Status configuration
  status: {
    field: string
    values: StatusValue[]
    transitions?: Record<string, string[]>
  }

  // Quick info bar
  quickInfo: QuickInfoField[]

  // Tabs for detail view
  tabs: TabDefinition[]

  // Actions
  actions: {
    primary?: ActionDefinition
    secondary?: ActionDefinition[]
    dropdown?: ActionDefinition[]
  }

  // List view
  list: {
    columns: ColumnDefinition[]
    filters: FilterDefinition[]
    defaultSort?: { key: string; direction: 'asc' | 'desc' }
    searchableFields?: string[]
  }

  // Field definitions
  fields: Record<string, FieldDefinition>

  // tRPC procedures
  procedures: {
    list: string
    get: string
    create?: string
    update?: string
    delete?: string
  }
}
```

### Theme System

Toggle between dark and light modes:

```tsx
import { useTheme } from '@/components/v4/theme'

const { theme, toggleTheme, setTheme } = useTheme()

// Toggle
<button onClick={toggleTheme}>Toggle Theme</button>

// Set specific theme
setTheme('dark')   // Dark mode
setTheme('light')  // Light mode
setTheme('system') // Follow system preference
```

### Keyboard Navigation

Use the `useKeyboardNavigation` hook for list navigation:

```tsx
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation'

const items = entities.map(e => ({ id: e.id, href: `/jobs/${e.id}` }))

const { selectedIndex, selectedId } = useKeyboardNavigation({
  items,
  enabled: true,
  onSelect: (item) => router.push(item.href),
})
```

## Migration Guide

### From V3 to V4

1. **Routes**: V4 uses simplified dynamic routes
   - V3: `/employee/recruiting/jobs/[id]`
   - V4: `/jobs/[id]`

2. **Components**: Replace entity-specific components with unified ones
   - V3: `JobWorkspace`, `CandidateWorkspace`, etc.
   - V4: `EntityView`, `EntityList`

3. **Configuration**: Replace verbose configs with schemas
   - V3: `jobs.config.tsx` (3000+ lines)
   - V4: `job.ts` schema (~200 lines)

4. **Styling**: Replace Hublot classes with Linear classes
   - V3: `bg-cream`, `text-charcoal-900`
   - V4: `bg-[var(--linear-bg)]`, `text-[var(--linear-text-primary)]`

## Best Practices

### Adding a New Entity

1. Create schema in `src/lib/entity/schemas/{entity}.ts`
2. Import in `src/lib/entity/schemas/index.ts`
3. Add to navigation in `src/components/v4/layout/Sidebar.tsx`
4. Add to command palette in `src/components/v4/command/CommandPalette.tsx`

### Customizing Tabs

Override the default tab rendering with custom components:

```typescript
tabs: [
  {
    id: 'custom',
    label: 'Custom Tab',
    icon: CustomIcon,
    component: CustomTabComponent,  // Your custom component
  },
]
```

### Adding Actions

Define actions in the schema:

```typescript
actions: {
  primary: {
    id: 'main-action',
    label: 'Primary Action',
    icon: Play,
    variant: 'primary',
    shortcut: 'P',
    type: 'mutation',
    mutation: 'entity.performAction',
    showForStatus: ['active'],
  },
}
```

## File Counts Comparison

| Metric | V3 | V4 | Reduction |
|--------|----|----|-----------|
| Component files | 792 | ~50 | 94% |
| Page files | 248 | ~10 | 96% |
| Config files | 70+ | ~10 | 86% |
| Navigation configs | 12 | 1 | 92% |

## Next Steps

- [ ] Integrate with existing tRPC routers
- [ ] Add activity feed component
- [ ] Add inline editing
- [ ] Add kanban/pipeline view
- [ ] Add mobile responsive design
- [ ] Add accessibility improvements
