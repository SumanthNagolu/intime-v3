# Entity Workspace Implementation Rulebook

This rulebook defines the standard patterns for implementing Hublot-inspired entity workspaces in InTime v3. The **Account workspace** serves as the reference implementation.

---

## Overview

Every root entity (Account, Contact, Job, Candidate, Lead, Deal, Campaign, Team) follows a unified workspace architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    TOP NAVIGATION                        │
├───────────────────┬─────────────────────────────────────┤
│                   │                                     │
│  EntityJourney    │        CONTENT AREA                 │
│     Sidebar       │                                     │
│                   │   [EntityHeader]                    │
│  ┌─────────────┐  │   [Section Content]                 │
│  │ ← Back      │  │                                     │
│  │  [Actions ▼]│  │                                     │
│  ├─────────────┤  │                                     │
│  │ ENTITY      │  │                                     │
│  │ HEADER      │  │                                     │
│  │ (dark bg)   │  │                                     │
│  ├─────────────┤  │                                     │
│  │ Sections    │  │                                     │
│  │ Related  ▼  │  │                                     │
│  │ Tools    ▼  │  │                                     │
│  └─────────────┘  │                                     │
└───────────────────┴─────────────────────────────────────┘
```

---

## 1. Sidebar Architecture

### 1.1 Structure

The sidebar follows this fixed structure (top to bottom):

1. **Back + Actions Row** - Navigation back link + Actions dropdown popover
2. **Entity Header** - Dark premium header with entity name, status, and type badge
3. **Sections** - Main navigation sections (no numbers, clean icons)
4. **Related** - Collapsible related data sections
5. **Tools** - Collapsible tool sections (Activities, Notes, Documents, History)

### 1.2 Sidebar Component: `EntityJourneySidebar`

All entities use the unified `EntityJourneySidebar` component. Location: `src/components/navigation/EntityJourneySidebar.tsx`

**Key Props:**
```typescript
interface EntityJourneySidebarProps {
  entityType: EntityType
  entityId: string
  entityName: string
  entitySubtitle?: string
  entityStatus: string
  toolCounts?: { activities?: number; notes?: number; documents?: number }
  sectionCounts?: Record<string, number>
}
```

### 1.3 Navigation Item Styling (SectionNavItem)

**Active State (Black highlight):**
```tsx
className={cn(
  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
  isActive
    ? 'bg-charcoal-900 text-white'  // ACTIVE: Black background, white text
    : 'text-charcoal-600 hover:bg-charcoal-100 hover:text-charcoal-800'
)}
```

**Icon Styling:**
```tsx
<Icon className={cn(
  'w-4 h-4 flex-shrink-0 transition-colors',
  isActive ? 'text-white' : 'text-charcoal-400 group-hover:text-charcoal-500'
)} />
```

**Count Badge (no colors, just subtle text):**
```tsx
<span className={cn(
  'text-xs tabular-nums transition-colors',
  isActive ? 'text-charcoal-400' : hasAlert ? 'text-error-600 font-medium' : 'text-charcoal-400'
)}>
  {count}
</span>
```

### 1.4 Entity Header (Dark Premium)

**Location:** Top of sidebar, below Back+Actions row

```tsx
<div className="bg-charcoal-900 text-white">
  <div className="px-4 py-4">
    {/* Entity Type + Status Row */}
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gold-500">
        {entityType.replace(/_/g, ' ')}
      </span>
      <StatusBadgeDark status={entityStatus} />
    </div>
    {/* Entity Name */}
    <h2 className="font-heading font-bold text-white text-lg truncate leading-tight">
      {entityName}
    </h2>
    {/* Subtitle */}
    {entitySubtitle && (
      <p className="text-sm text-charcoal-400 truncate mt-1">{entitySubtitle}</p>
    )}
  </div>
</div>
```

### 1.5 Collapsible Section Headers

```tsx
<CollapsibleTrigger className={cn(
  'flex items-center gap-2 w-full px-4 py-3 text-left transition-all duration-200 hover:bg-charcoal-50/50',
  isCollapsed && 'justify-center px-2'
)}>
  <ChevronRight className={cn(
    'w-3 h-3 text-charcoal-400 transition-transform duration-200',
    isOpen && 'rotate-90'
  )} />
  <span className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider">
    Related
  </span>
</CollapsibleTrigger>
```

### 1.6 Actions Popover

Use `SidebarActionsPopover` for quick actions dropdown. Location: `src/components/navigation/SidebarActionsPopover.tsx`

```tsx
<SidebarActionsPopover
  actions={visibleQuickActions.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon,
    variant: action.variant,
    separator: action.separator,
  }))}
  onAction={(actionId) => handleQuickAction(actionId)}
/>
```

---

## 2. Header Architecture

### 2.1 EntityHeader Component

The header displays entity information **without action buttons**. All actions are centralized in the sidebar.

**Key Elements:**
- Entity icon with gradient background
- Entity name (large, bold)
- Status badge
- Tier badge (for accounts)
- Metadata row (industry, location, owner)
- Copy ID button

**Styling:**
```tsx
<div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm">
  {/* Subtle gradient background */}
  <div className="absolute inset-0 bg-gradient-to-br from-charcoal-50/30 via-transparent to-gold-50/20" />

  {/* Top accent line */}
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-500 via-gold-500 to-forest-500" />

  <div className="relative p-6">
    {/* Content */}
  </div>
</div>
```

---

## 3. Overview/Summary Section

### 3.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ KPI Grid (4 columns)                                    │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│ │ Health   │ │ Revenue  │ │ Active   │ │ Fill     │    │
│ │ Score    │ │ YTD      │ │ Jobs     │ │ Rate     │    │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
├─────────────────────────────────────────────────────────┤
│ Main Content Grid (8 + 4 columns)                       │
│ ┌──────────────────────┐  ┌────────────────┐           │
│ │ Company Details      │  │ Primary Contact│           │
│ │ Corporate Profile    │  │ Team           │           │
│ │ Billing & Terms      │  │ Quick Stats    │           │
│ │ Engagement           │  │                │           │
│ │ Action Items         │  │                │           │
│ └──────────────────────┘  └────────────────┘           │
├─────────────────────────────────────────────────────────┤
│ Recent Activity (full width)                            │
└─────────────────────────────────────────────────────────┘
```

### 3.2 KPI Card Pattern

```tsx
<div
  className="group relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white p-5 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
  style={{ animationDelay: '75ms' }}
>
  <div className="flex items-start justify-between">
    <div className="space-y-2">
      <p className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">
        Health Score
      </p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-charcoal-900 tracking-tight">
          85
        </span>
        <span className="text-sm text-charcoal-400">/100</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal-600">
          <span className="w-2 h-2 rounded-full bg-charcoal-600" />
          Healthy
        </span>
      </div>
    </div>
    <div className="w-11 h-11 rounded-lg bg-charcoal-100 flex items-center justify-center transition-all duration-300 group-hover:bg-charcoal-200">
      <Heart className="h-5 w-5 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" />
    </div>
  </div>
</div>
```

### 3.3 Info Card Pattern

```tsx
<div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden animate-slide-up">
  {/* Header */}
  <div className="px-6 py-4 border-b border-charcoal-100">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-charcoal-600" />
        </div>
        <div>
          <h3 className="font-semibold text-charcoal-900">Company Details</h3>
          <p className="text-xs text-charcoal-500">Core business information</p>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="text-xs text-charcoal-500 hover:text-charcoal-700 hover:bg-charcoal-100">
        <ExternalLink className="h-3.5 w-3.5 mr-1" />
        Edit
      </Button>
    </div>
  </div>
  {/* Content */}
  <div className="p-6">
    {/* Grid of fields */}
  </div>
</div>
```

### 3.4 Quick Stats Card (Light Background)

```tsx
<div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden">
  <div className="px-5 py-4 border-b border-charcoal-200/60">
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-charcoal-500" />
      <h3 className="font-semibold text-charcoal-900 text-sm">Quick Stats</h3>
    </div>
  </div>
  <div className="p-5 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
          <Users className="h-4 w-4 text-charcoal-500" />
        </div>
        <span className="text-sm text-charcoal-600">Contacts</span>
      </div>
      <span className="text-lg font-semibold text-charcoal-900">12</span>
    </div>
  </div>
</div>
```

---

## 4. Section Configuration

### 4.1 Section Definition Structure

Location: `src/lib/navigation/entity-sections.ts`

```typescript
export interface SectionDefinition {
  id: string
  label: string
  icon: LucideIcon
  showCount?: boolean
  alertOnCount?: boolean      // Show alert styling when count > 0
  isToolSection?: boolean     // Part of collapsible Tools group
  group?: 'main' | 'related' | 'tools'
  description?: string
  isOverview?: boolean        // True for summary sections
  isRelatedData?: boolean     // True for related data sections
}
```

### 4.2 Standard Section Groups

```typescript
// Example: Account sections
export const accountSections: SectionDefinition[] = [
  // Overview (summary dashboard)
  { id: 'summary', label: 'Summary', icon: LayoutDashboard, group: 'main', isOverview: true },

  // Main sections
  { id: 'identity', label: 'Identity & Classification', icon: Building2, group: 'main' },
  { id: 'locations', label: 'Locations', icon: MapPin, group: 'main', showCount: true },
  { id: 'billing', label: 'Billing & Terms', icon: CreditCard, group: 'main' },
  { id: 'contacts', label: 'Contacts', icon: Users, group: 'main', showCount: true },
  { id: 'contracts', label: 'Contracts', icon: FileText, group: 'main', showCount: true },
  { id: 'compliance', label: 'Compliance', icon: Shield, group: 'main' },
  { id: 'team', label: 'Team', icon: UserCog, group: 'main' },

  // Related data (collapsible)
  { id: 'jobs', label: 'Jobs', icon: Briefcase, group: 'related', showCount: true, isRelatedData: true },
  { id: 'placements', label: 'Placements', icon: Award, group: 'related', showCount: true, isRelatedData: true },

  // Tools (collapsible)
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools', showCount: true, isToolSection: true },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools', showCount: true, isToolSection: true },
  { id: 'documents', label: 'Documents', icon: FileText, group: 'tools', showCount: true, isToolSection: true },
  { id: 'history', label: 'History', icon: History, group: 'tools', isToolSection: true },
]
```

### 4.3 Helper Function Pattern

```typescript
export function getEntitySectionsByGroup(): {
  overviewSection: SectionDefinition | undefined
  mainSections: SectionDefinition[]
  relatedSections: SectionDefinition[]
  toolSections: SectionDefinition[]
} {
  return {
    overviewSection: entitySections.find(s => s.isOverview),
    mainSections: entitySections.filter(s => s.group === 'main' && !s.isOverview),
    relatedSections: entitySections.filter(s => s.isRelatedData),
    toolSections: entitySections.filter(s => s.isToolSection),
  }
}
```

---

## 5. Status Badges

### 5.1 Light Background (for content area)

```tsx
function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500', border: 'border-success-200' },
    prospect: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
    inactive: { bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400', border: 'border-charcoal-200' },
    on_hold: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  }[status]

  return (
    <Badge className={cn(config.bg, config.text, config.border)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
```

### 5.2 Dark Background (for sidebar header)

```tsx
function StatusBadgeDark({ status }: { status: string }) {
  const config = {
    active: { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400', border: 'border-green-500/30' },
    prospect: { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400', border: 'border-blue-500/30' },
    inactive: { bg: 'bg-white/10', text: 'text-charcoal-300', dot: 'bg-charcoal-400', border: 'border-white/20' },
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border', config.bg, config.text, config.border)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}
```

---

## 6. Typography & Spacing

### 6.1 Labels

```css
/* Field labels */
.label {
  font-size: 11px;           /* text-[11px] */
  font-weight: 500;          /* font-medium */
  text-transform: uppercase; /* uppercase */
  letter-spacing: 0.05em;    /* tracking-wider */
  color: charcoal-500;
}

/* Section headers */
.section-header {
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;     /* tracking-widest */
  color: charcoal-500;
}
```

### 6.2 Spacing

```css
/* Card padding */
.card { padding: 24px; }     /* p-6 */

/* Card header */
.card-header {
  padding: 16px 24px;        /* px-6 py-4 */
  border-bottom: 1px solid charcoal-100;
}

/* Grid gaps */
.grid { gap: 24px; }         /* gap-6 */
.kpi-grid { gap: 16px; }     /* gap-4 */
```

---

## 7. Animation Patterns

### 7.1 Staggered Fade-In

```tsx
const getDelay = (index: number) => ({ animationDelay: `${index * 75}ms` })

<div className="animate-fade-in" style={getDelay(0)}>Card 1</div>
<div className="animate-fade-in" style={getDelay(1)}>Card 2</div>
<div className="animate-fade-in" style={getDelay(2)}>Card 3</div>
```

### 7.2 Hover Effects

```css
/* Card hover */
.card:hover {
  transform: translateY(-2px);  /* hover:-translate-y-0.5 */
  box-shadow: elevation-md;
}

/* Icon hover */
.icon-container:hover {
  background: charcoal-200;
}

/* Arrow reveal */
.arrow {
  opacity: 0.3;
  transform: translateX(0);
}
.card:hover .arrow {
  opacity: 0.5;
  transform: translateX(4px);
}
```

---

## 8. Entity-Specific Implementation Checklist

For each new entity workspace, implement:

### 8.1 Configuration Files

- [ ] `src/lib/navigation/entity-sections.ts` - Add section definitions
- [ ] `src/lib/navigation/entity-journeys.ts` - Add quick actions configuration
- [ ] `src/lib/navigation/entity-navigation.types.ts` - Add entity type and base path

### 8.2 Workspace Components

- [ ] `src/components/workspaces/{entity}/` - Create workspace directory
- [ ] `{Entity}Header.tsx` - Entity header (no actions)
- [ ] `{Entity}WorkspaceProvider.tsx` - Context provider for data
- [ ] `sections/{Entity}OverviewSection.tsx` - Summary/overview section
- [ ] `sections/{Entity}*Section.tsx` - Other section components

### 8.3 Page Files

- [ ] `src/app/employee/.../[id]/page.tsx` - Detail page
- [ ] `src/app/employee/.../[id]/layout.tsx` - Layout with data fetching

### 8.4 API/Router

- [ ] `src/server/routers/{entity}.ts` - tRPC router with `getFullEntity`

---

## 9. Contact Entity Special Case

### 9.1 Subtype Architecture

Contact is a **polymorphic entity** with subtypes:
- `person` (individual contact)
- `company` (organization)

Each subtype has its own:
- Section definitions
- Field configurations
- Validation rules

### 9.2 Subtype-Specific Sections

```typescript
// Person subtype
export const personContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: UserCircle, group: 'main' },
  { id: 'employment', label: 'Employment', icon: Briefcase, group: 'main' },
  { id: 'social', label: 'Social Profiles', icon: Link2, group: 'main' },
  // ... universal tools
]

// Company subtype
export const companyContactSections: SectionDefinition[] = [
  { id: 'overview', label: 'Overview', icon: Building2, group: 'main' },
  { id: 'hierarchy', label: 'Hierarchy', icon: GitBranch, group: 'main' },
  { id: 'locations', label: 'Locations', icon: MapPin, group: 'main', showCount: true },
  { id: 'people', label: 'People', icon: Users, group: 'main', showCount: true },
  // ... universal tools
]
```

### 9.3 Dynamic Section Loading

```typescript
export function getContactSectionsBySubtype(subtype: 'person' | 'company'): SectionDefinition[] {
  const contextSections = subtype === 'company'
    ? companyContactSections
    : personContactSections

  return [...contextSections, ...universalContactSections]
}
```

---

## 10. Color Reference

### 10.1 Primary Colors

| Use | Class | Description |
|-----|-------|-------------|
| Page background | `bg-cream` | Warm off-white (#FDFBF7) |
| Card background | `bg-white` | Pure white |
| Primary text | `text-charcoal-900` | Near black |
| Secondary text | `text-charcoal-600` | Medium gray |
| Muted text | `text-charcoal-500` | Light gray |
| Labels | `text-charcoal-400` | Very light gray |

### 10.2 Status Colors

| Status | Background | Text | Dot |
|--------|------------|------|-----|
| Success | `bg-success-50` | `text-success-700` | `bg-success-500` |
| Warning | `bg-amber-50` | `text-amber-700` | `bg-amber-500` |
| Error | `bg-error-50` | `text-error-700` | `bg-error-500` |
| Info | `bg-blue-50` | `text-blue-700` | `bg-blue-500` |
| Neutral | `bg-charcoal-100` | `text-charcoal-600` | `bg-charcoal-400` |

### 10.3 Icon Backgrounds

| Context | Background | Hover |
|---------|------------|-------|
| Card icon | `bg-charcoal-100` | `bg-charcoal-200` |
| Quick stats | `bg-white border border-charcoal-200/60` | - |
| Sidebar active | `bg-charcoal-900` | - |

---

## 11. DO's and DON'Ts

### DO

- Use `bg-cream` for page backgrounds
- Use monochromatic icons (charcoal-100 bg, charcoal-500/600 icon)
- Use black (`bg-charcoal-900`) for active sidebar items
- Use subtle animations (300ms, 75ms stagger)
- Keep actions in sidebar dropdown (not header)
- Use uppercase tracking-wider for labels
- Use collapsible sections for Related/Tools

### DON'T

- Use colored count badges in sidebar
- Use colored icon backgrounds (no gold-100, blue-100, etc.)
- Put action buttons in headers
- Use numbered sections (sections are navigation, not wizard)
- Use heavy borders or shadows
- Skip hover states
- Mix navigation styles within same entity type
