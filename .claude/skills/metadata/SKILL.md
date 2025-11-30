---
name: metadata
description: Metadata-driven UI framework patterns for InTime v3 screen definitions
---

# Metadata Skill - Screen Definition Framework

## Overview

Guidewire-inspired metadata-driven UI framework for defining screens, layouts, and actions declaratively.

## File Locations
```
src/lib/metadata/
├── types/
│   ├── screen.types.ts    # ScreenDefinition, LayoutDefinition, SectionDefinition
│   ├── widget.types.ts    # FieldDefinition, WidgetDefinition
│   └── data.types.ts      # DataSourceDefinition, DynamicValue, VisibilityRule
├── schemas/               # Zod validation schemas
├── registry/              # Entity/field registries
├── inputsets/             # Reusable input set definitions
├── widgets/               # Widget implementations
└── renderers/             # Screen/section renderers

src/screens/               # Screen definitions by module
├── crm/
│   ├── account-list.screen.ts
│   └── account-detail.screen.ts
├── recruiting/
├── bench/
└── academy/
```

## Screen Definition Pattern

```typescript
import type { ScreenDefinition } from '@/lib/metadata';

export const entityListScreen: ScreenDefinition = {
  id: 'entity-list',
  type: 'list',         // 'detail' | 'list' | 'list-detail' | 'wizard' | 'dashboard' | 'popup'
  entityType: 'account',

  title: 'Accounts',
  subtitle: 'Manage client accounts',

  dataSource: { /* See Data Source section */ },
  layout: { /* See Layout section */ },
  actions: [ /* See Actions section */ ],
  navigation: { /* See Navigation section */ },
};
```

## TypeScript Patterns (CRITICAL)

### Field Type Property

Use `type` not `fieldType`:

```typescript
// ❌ BAD - Wrong property name
const field: FieldDefinition = {
  id: 'name',
  fieldType: 'text',  // ERROR: 'fieldType' doesn't exist
};

// ✅ GOOD - Correct property name
const field: FieldDefinition = {
  id: 'name',
  type: 'text',       // Correct
};
```

### Visibility Property

Use `visible` not `visibility`:

```typescript
// ❌ BAD - Wrong property name
{
  id: 'section',
  visibility: { field: 'status', operator: 'eq', value: 'active' },
}

// ✅ GOOD - Correct property name
{
  id: 'section',
  visible: { field: 'status', operator: 'eq', value: 'active' },
}
```

### Data Source Structure

DataSource requires nested `query` object:

```typescript
// ❌ BAD - Flat structure (old pattern)
dataSource: {
  type: 'query',
  procedure: 'crm.accounts.list',    // ERROR: 'procedure' not at root level
  params: {},
}

// ✅ GOOD - Nested query structure
dataSource: {
  type: 'query',
  query: {
    procedure: 'crm.accounts.list',
    params: {},
  },
}

// ✅ With dynamic params
dataSource: {
  type: 'query',
  query: {
    procedure: 'crm.accounts.getById',
    params: { id: fieldValue('id') },  // Use fieldValue() helper
  },
}
```

### Action Definitions

Actions require both `type` at root AND in config:

```typescript
// ❌ BAD - Missing type or incomplete config
{
  id: 'export',
  label: 'Export',
  config: { type: 'custom' },  // Missing 'handler'!
}

// ✅ GOOD - Complete action definition
{
  id: 'export',
  type: 'custom',              // Required ActionType at root
  label: 'Export',
  icon: 'Download',
  variant: 'secondary',
  config: {
    type: 'custom',
    handler: 'handleExport',   // Required for custom actions
  },
}

// Action types and their config requirements:
// - navigate: { type: 'navigate', route: '/path' }
// - modal:    { type: 'modal', modal: 'modalName', props?: {} }
// - mutation: { type: 'mutation', procedure: 'router.mutation', input?: {} }
// - download: { type: 'download', url: '/file', filename?: 'name.csv' }
// - custom:   { type: 'custom', handler: 'handlerFunctionName' }
```

### Visibility Condition Operators

Use abbreviated operators:

```typescript
// ❌ BAD - Full operator names (don't exist)
{ operator: 'equals', field: 'status', value: 'active' }
{ operator: 'notEquals', field: 'type', value: 'draft' }

// ✅ GOOD - Abbreviated operators
{ operator: 'eq', field: 'status', value: 'active' }
{ operator: 'neq', field: 'type', value: 'draft' }

// All operators:
// 'eq'       - equals
// 'neq'      - not equals
// 'gt'       - greater than
// 'gte'      - greater than or equal
// 'lt'       - less than
// 'lte'      - less than or equal
// 'contains' - string contains
// 'in'       - value in array
// 'nin'      - value not in array
```

## Layout Types

```typescript
type LayoutType =
  | 'single-column'  // Simple stacked sections
  | 'two-column'     // Two equal columns
  | 'sidebar-main'   // Narrow sidebar + main content
  | 'tabs'           // Tabbed content
  | 'wizard-steps';  // Wizard with step navigation
```

### Single Column Layout
```typescript
layout: {
  type: 'single-column',
  sections: [
    { id: 'metrics', type: 'metrics-grid', fields: [...] },
    { id: 'table', type: 'table', columns_config: [...] },
  ],
}
```

### Sidebar Layout
```typescript
layout: {
  type: 'sidebar-main',
  sidebarWidth: 'md',        // 'sm' | 'md' | 'lg'
  sidebarPosition: 'left',   // 'left' | 'right'
  sidebar: {
    id: 'entity-info',
    type: 'info-card',
    fields: [...],
  },
  sections: [
    { id: 'details', type: 'field-grid', columns: 2, fields: [...] },
  ],
}
```

### Tabbed Layout
```typescript
layout: {
  type: 'tabs',
  tabPosition: 'top',        // 'top' | 'left'
  defaultTab: 'overview',
  tabs: [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'Info',
      sections: [...],
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: 'Users',
      badge: { field: 'contactCount' },  // Dynamic badge
      sections: [...],
    },
  ],
}
```

## Section Types

```typescript
type SectionType =
  | 'info-card'       // Key-value info display
  | 'metrics-grid'    // KPI metrics
  | 'field-grid'      // Form field grid
  | 'table'           // Data table
  | 'list'            // Simple list
  | 'form'            // Editable form
  | 'input-set'       // Reusable input set
  | 'timeline'        // Activity timeline
  | 'tabs'            // Nested tabs
  | 'collapsible'     // Collapsible panel
  | 'custom';         // Custom component
```

### Metrics Grid Section
```typescript
{
  id: 'metrics',
  type: 'metrics-grid',
  columns: 4,
  fields: [
    { id: 'total', label: 'Total', type: 'number', path: 'total' },
    { id: 'active', label: 'Active', type: 'number', path: 'metrics.active' },
    { id: 'revenue', label: 'Revenue', type: 'currency', path: 'metrics.revenue' },
  ],
}
```

### Table Section
```typescript
{
  id: 'contacts-table',
  type: 'table',
  title: 'Contacts',
  columns_config: [
    { id: 'name', label: 'Name', path: 'name', type: 'text', sortable: true },
    { id: 'email', label: 'Email', path: 'email', type: 'email' },
    { id: 'role', label: 'Role', path: 'role', type: 'enum', config: { options: [...] } },
  ],
  dataSource: {
    type: 'query',
    query: {
      procedure: 'crm.contacts.list',
      params: { accountId: fieldValue('id') },
    },
  },
  actions: [
    { id: 'add', type: 'modal', label: 'Add Contact', config: { type: 'modal', modal: 'AddContactModal' } },
  ],
}
```

## Column Type Reference

| Type | Description | Config Options |
|------|-------------|----------------|
| `text` | Plain text | - |
| `email` | Email with link | - |
| `phone` | Phone with link | - |
| `url` | Clickable URL | - |
| `number` | Formatted number | `decimals`, `prefix`, `suffix` |
| `currency` | Currency format | `currency` (default: 'USD') |
| `date` | Date format | `format`: 'short' \| 'long' \| 'relative' |
| `datetime` | Date + time | `format` |
| `enum` | Enum with badge | `options`, `badgeColors` |
| `boolean` | Yes/No badge | `trueLabel`, `falseLabel` |
| `avatar` | User avatar | `fallback` |
| `progress` | Progress bar | `max`, `showLabel` |

## Dynamic Values

Use `fieldValue()` helper for dynamic values:

```typescript
import { fieldValue } from '@/lib/metadata';

// In params
params: { id: fieldValue('id') }

// In routes
route: `/entity/${fieldValue('id')}`

// In titles
title: fieldValue('name')
```

## Complete Screen Example

```typescript
import type { ScreenDefinition, TableColumnDefinition } from '@/lib/metadata';
import { fieldValue } from '@/lib/metadata';

const columns: TableColumnDefinition[] = [
  { id: 'name', label: 'Name', path: 'name', type: 'text', sortable: true, width: '200px' },
  {
    id: 'status',
    label: 'Status',
    path: 'status',
    type: 'enum',
    config: {
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
      badgeColors: { active: 'green', inactive: 'gray' },
    },
  },
  { id: 'createdAt', label: 'Created', path: 'createdAt', type: 'date', sortable: true },
];

export const accountListScreen: ScreenDefinition = {
  id: 'account-list',
  type: 'list',
  entityType: 'account',

  title: 'Accounts',
  subtitle: 'Manage client accounts',

  dataSource: {
    type: 'query',
    query: {
      procedure: 'crm.accounts.list',
      params: {},
    },
  },

  layout: {
    type: 'single-column',
    sections: [
      { id: 'table', type: 'table', columns_config: columns },
    ],
  },

  actions: [
    {
      id: 'create',
      type: 'navigate',
      label: 'New Account',
      variant: 'primary',
      icon: 'Plus',
      config: { type: 'navigate', route: '/employee/crm/accounts/new' },
    },
    {
      id: 'export',
      type: 'custom',
      label: 'Export',
      variant: 'secondary',
      icon: 'Download',
      config: { type: 'custom', handler: 'handleExport' },
    },
  ],

  navigation: {
    breadcrumbs: [
      { label: 'CRM', route: '/employee/crm' },
      { label: 'Accounts' },
    ],
  },
};
```

## Quick Reference Checklist

Before committing screen definitions:

- [ ] Use `type` not `fieldType` for fields
- [ ] Use `visible` not `visibility` for conditions
- [ ] DataSource has `query: { procedure, params }` structure
- [ ] Actions have both root `type` and `config.type`
- [ ] Custom actions include `handler` in config
- [ ] Condition operators use abbreviated form (`eq`, `neq`, etc.)
- [ ] Dynamic values use `fieldValue()` helper
- [ ] Column configs use `path` or `accessor` (both work)
