# UI Design System Rules

## Design Philosophy

InTime uses a **Hublot-inspired Luxury Design System** featuring:
- **Pure black/white foundation** with rose gold accents
- **Geometric sans-serif typography** (Raleway for headings, Inter for body)
- **Sharp/subtle corners** (4px-8px radius)
- **Deliberate animations** (300ms+ transitions)
- **Generous whitespace** for premium feel

### Core Principle: "Art of Fusion"

Every screen combines technical precision with refined luxury. Content breathes, forms feel effortless, navigation is intuitive. Use restraint with color - let black, white, and rose gold create visual impact.

---

## Screen Architecture (PCF)

**Every screen MUST follow this three-zone layout:**

```
┌─────────────────────────────────────────────────────────┐
│                    HEADER                               │
│              (TopNavigation)                            │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│  SIDE NAV     │           SCREEN AREA                   │
│               │                                         │
│  (Sidebar)    │    (EntityListView or EntityDetailView) │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

### Components

| Zone | Component | File |
|------|-----------|------|
| Header | TopNavigation | `src/components/navigation/TopNavigation.tsx` |
| Side Nav | EntityJourneySidebar (detail) or SectionSidebar (list) | `src/components/navigation/` |
| Screen Area | EntityListView or EntityDetailView | `src/components/pcf/` |
| Layout Wrapper | SidebarLayout | `src/components/layouts/SidebarLayout.tsx` |

### Implementation Pattern

All pages use SidebarLayout which composes the three zones:

```
Page → SidebarLayout → TopNavigation + Sidebar + Content
```

### Screen Types

**List Pages**:
- Use `EntityListView<T>` with config from `@/configs/entities/`
- Sidebar: SectionSidebar (section links + recent entities)
- URL state: `?search=&status=&page=`

**Detail Pages**:
- Use `EntityDetailView` with config from `@/configs/entities/`
- Sidebar: EntityJourneySidebar (journey steps OR sections + tools + quick actions)
- URL state: `?section=overview`

### DO NOT
- Create custom layouts bypassing SidebarLayout
- Build screens without TopNavigation
- Implement custom sidebars (use existing patterns)
- Skip the config-driven approach for list/detail views

---

## Color Usage

### Primary Palette
- **Page background**: `bg-cream` (#FDFBF7)
- **Card background**: `bg-white`
- **Primary text**: `text-charcoal-900` (#171717)
- **Secondary text**: `text-charcoal-600`
- **Muted text**: `text-charcoal-500`

### Brand Colors
- **Primary actions**: `hublot-900` (pure black #000000)
- **Premium actions**: `gold-500` (#C9A961 warm gold)
- **Classic gold accent**: `gold-400` (#D4AF37)
- **Active/selected states**: `gold-500` or gold gradient
- **Focus rings**: `ring-gold-500`
- **Hover accents**: `gold-400`

### Status Colors
- **Success**: `success-500` (#0A8754)
- **Warning**: `warning-500` (#D97706)
- **Error**: `error-500` (#DC2626)
- **Info**: `info-500` (#0369A1)

---

## Typography

### Font Families
- **Headlines**: `font-heading` (Raleway) - Geometric sans-serif
- **UI Elements**: `font-subheading` (Raleway)
- **Body Text**: `font-body` (Inter) - Clean sans-serif
- **Code**: `font-mono` (JetBrains Mono)

### Type Scale
- `text-display`: 72px (hero headlines, tracking-wide)
- `text-h1`: 48px (page titles, tracking-wide)
- `text-h2`: 36px (section headers, tracking-wide)
- `text-h3`: 28px (subsections, tracking-wide)
- `text-h4`: 20px (card titles)
- `text-body-lg`: 18px (lead paragraphs)
- `text-body`: 16px (default)
- `text-body-sm`: 14px (compact)
- `text-nav`: 14px (navigation, uppercase, tracking-widest)
- `text-caption`: 12px (labels, uppercase, tracking-widest)

### Rules
- Headlines use `font-heading` (Raleway) with wider letter-spacing
- Navigation uses uppercase with `tracking-widest`
- Body text uses Inter for readability
- Maximum line length: 65 characters

---

## Spacing (8px Grid)

### Scale
- `space-xs`: 4px (0.25rem)
- `space-sm`: 8px (0.5rem)
- `space-md`: 16px (1rem)
- `space-lg`: 24px (1.5rem)
- `space-xl`: 32px (2rem)
- `space-2xl`: 48px (3rem)
- `space-3xl`: 64px (4rem)

### Standard Patterns
- Container padding: `px-6 lg:px-12`
- Card padding: `p-8`
- Section spacing: `py-16`
- Form field gaps: `space-y-6`
- Inline gaps: `gap-2` or `gap-4`

### Philosophy
- **Generous whitespace** = luxury feel
- **Internal spacing < External spacing** (group related items)
- **Prefer spacing over borders** for visual separation

---

## Components

### Buttons

#### Variants
- `variant="default"`: Black bg, white text, lift on hover
- `variant="premium"`: Rose gold gradient + gold glow shadow
- `variant="gold"`: Solid gold with glow
- `variant="outline"`: 2px black border, fills on hover
- `variant="secondary"`: Light gray bg
- `variant="ghost"`: No background, text only
- `variant="glass"`: White/90 with blur
- `variant="destructive"`: Error-500 bg

#### Sizes
- `size="sm"`: 36px height
- `size="default"`: 44px height
- `size="lg"`: 52px height

#### States
- Hover: `hover:-translate-y-0.5 hover:shadow-elevation-md`
- Focus: `focus:ring-2 focus:ring-gold-500`
- Disabled: `opacity-50`

#### Styling
- All buttons use uppercase text with `tracking-wider`
- Border radius: `rounded-sm` (4px)
- Transition: 300ms

### Cards

Standard card:
```tsx
<Card className="bg-white rounded-lg border-charcoal-100 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-1 transition-all duration-300">
```

Glass card:
```tsx
<div className="glass rounded-lg p-6">
```

### Form Inputs

```tsx
<Input className="h-11 rounded-sm border-charcoal-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all duration-300" />
```

- Focus state: Rose gold border and ring
- Border radius: `rounded-sm` (4px)

### Shadows
- `shadow-elevation-xs`: Subtle elevation
- `shadow-elevation-sm`: Default cards
- `shadow-elevation-md`: Hovered cards
- `shadow-elevation-lg`: Dropdowns
- `shadow-elevation-xl`: Modals
- `shadow-premium`: Hero elements
- `shadow-glass`: Glass components
- `shadow-gold-glow`: Gold button glow
- `shadow-gold-glow-lg`: Enhanced gold glow

---

## Navigation Patterns

### Unified Sidebar System

The sidebar is **context-dependent** - it changes based on where the user is:

| Context | Sidebar Type | Shows |
|---------|-------------|-------|
| **List pages** (from top nav) | `SectionSidebar` | Navigation links + Recent entities (10) |
| **Detail pages** (entity open) | `EntityJourneySidebar` | Journey steps OR Sections + Tools + Quick actions |

**Automatic Detection** (in `SidebarLayout.tsx`):
```tsx
// If currentEntity exists → EntityJourneySidebar (detail pages)
// If no currentEntity → SectionSidebar (list pages)
{currentEntity ? <EntityJourneySidebar /> : <SectionSidebar sectionId={sectionId} />}
```

**Key Rule**: Sidebar content is driven by the entity type being viewed, not the route.

### Recent Entities System

Recent entities are tracked per entity type and shown in:
- **SectionSidebar**: Recent items for current section's entity type
- **TopNavigation dropdowns**: Recent items per tab
- **CommandPalette**: Recent actions

**Configuration** (MAX = 10 items):
| File | Purpose |
|------|---------|
| `EntityNavigationContext.tsx:8` | Storage limit |
| `SectionSidebar.tsx:240` | Sidebar display |
| `TopNavigation.tsx:95,375` | Dropdown display |
| `CommandPalette.tsx:203` | Palette display |

**IMPORTANT**: If changing the limit, update ALL these locations.

### Sidebar Styling
- Width: 256px
- Background: `bg-white` with subtle border
- Section titles: Uppercase, `text-nav` style
- Active item: `bg-gold-50 text-gold-600 border-l-[3px] border-gold-500`
- Hover: `hover:bg-charcoal-50 hover:text-gold-500`
- Transition: 300ms

### Breadcrumbs
- Separator: ChevronRight
- Link hover: `hover:text-gold-500`
- Active: `font-semibold text-charcoal-900`

### Command Palette (Cmd+K)
- Centered glass modal
- Search with auto-focus
- Recent actions + suggestions (10 max)
- Keyboard navigation

---

## Guidewire-Inspired Patterns

### Navigation Styles

Two distinct navigation patterns based on entity type:

| Style | Entities | Use Case | URL Pattern |
|-------|----------|----------|-------------|
| **Journey** | job, candidate, submission, placement | Sequential workflow stages | `?step=1` |
| **Sections** | account, contact, deal, lead | Information categories | `?section=overview` |

### Journey Navigation (Workflow Entities)

Visual step indicator with state colors:
- **Completed**: Green circle with checkmark
- **Current**: Gold circle with number, highlighted background
- **Future**: Gray circle with number
- **Connector lines**: Between steps, colored based on completion

```tsx
// Journey step styling
<div className={cn(
  'rounded-full w-8 h-8 flex items-center justify-center',
  isCompleted && 'bg-success-500 text-white',
  isCurrent && 'bg-gold-500 text-charcoal-900',
  isFuture && 'bg-charcoal-200 text-charcoal-500'
)}>
```

### Section Navigation (Information Entities)

Category tabs with counts:
- **Active section**: `bg-gold-50 text-gold-600 border-l-[3px] border-gold-500`
- **Counts**: Badge after section name (e.g., "Contacts (12)")
- **Alert styling**: Red badge for escalations

---

## PCF List View Architecture

List pages use a **configuration-driven architecture** where all behavior is defined in config objects, not page code.

### Page File Pattern

List pages should be minimal (< 10 lines):

```tsx
// src/app/employee/crm/campaigns/page.tsx
'use client'
import { EntityListView } from '@/components/pcf/list-view/EntityListView'
import { campaignsListConfig, Campaign } from '@/configs/entities/campaigns.config'

export default function CampaignsPage() {
  return <EntityListView<Campaign> config={campaignsListConfig} />
}
```

### Config File Structure

All list behavior defined in `src/configs/entities/{entity}.config.ts`:

```tsx
export const campaignsListConfig: ListViewConfig<Campaign> = {
  // Entity metadata
  entityType: 'campaign',
  entityName: { singular: 'Campaign', plural: 'Campaigns' },
  baseRoute: '/employee/crm/campaigns',
  title: 'Campaigns',
  icon: Megaphone,

  // Stats cards (connected to useStatsQuery)
  statsCards: [
    { key: 'total', label: 'Total Campaigns', icon: Megaphone },
    { key: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  ],

  // Filters (synced to URL params)
  filters: [
    { key: 'search', type: 'search', placeholder: 'Search...' },
    { key: 'status', type: 'select', options: [...] },
  ],

  // Columns (for table view)
  columns: [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status', format: 'status' },
    { key: 'createdAt', header: 'Created', format: 'relative-date' },
  ],

  // Render mode
  renderMode: 'table',  // or 'cards'
  statusField: 'status',
  statusConfig: CAMPAIGN_STATUS_CONFIG,

  // Data hooks
  useListQuery: (filters) => trpc.crm.campaigns.list.useQuery({...}),
  useStatsQuery: () => trpc.crm.campaigns.stats.useQuery(),
}
```

### Table View with Sortable Columns

When `renderMode: 'table'`, columns support sorting:

```tsx
columns: [
  {
    key: 'name',           // Field key (maps to data property)
    header: 'Campaign Name', // Display header
    sortable: true,         // Enable click-to-sort
    width: 'min-w-[200px]', // Tailwind width class
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    format: 'status',       // Use StatusBadge component
  },
  {
    key: 'budgetSpent',
    header: 'Budget',
    sortable: true,
    align: 'right',         // Right-align numbers
    render: (value, entity) => `$${value.toLocaleString()}`, // Custom render
  },
]
```

**Sort State**: Stored in URL params (`?sortBy=name&sortOrder=asc`)

**Sort Field Mapping**: Frontend column keys must map to backend fields:
```tsx
const sortFieldMap: Record<string, string> = {
  startDate: 'start_date',   // camelCase → snake_case
  campaignType: 'campaign_type',
}
```

### Stats Cards with Real Data

Stats connect to a dedicated tRPC procedure:

```tsx
// In router (crm.ts)
stats: orgProtectedProcedure.query(async ({ ctx }) => {
  const { count } = await adminClient.from('campaigns').select('*', { count: 'exact' })
  return { total: count, active: activeCount, ... }
})

// In config
useStatsQuery: () => trpc.crm.campaigns.stats.useQuery()
```

### URL State Management

All filter/pagination/sort state lives in URL params:
- **Filters**: `?search=test&status=active`
- **Pagination**: `?page=2`
- **Sorting**: `?sortBy=name&sortOrder=asc`

Benefits:
- Shareable links
- Browser back/forward works
- No state loss on refresh

---

## Inline Panel Pattern

Inline panels slide in from the right, replacing modal dialogs for entity details:

### Panel Widths
- `sm`: 320px - Compact info
- `md`: 384px - Standard forms
- `lg`: 480px - Most common, detail views
- `xl`: 560px - Complex content

### Layout Pattern

```tsx
<div className="flex gap-4">
  {/* List area - shrinks when panel open */}
  <div className={cn(
    'flex-1 transition-all duration-300',
    selectedId ? 'max-w-[calc(100%-496px)]' : 'max-w-full'
  )}>
    {items.map(item => <Card onClick={() => setSelectedId(item.id)} />)}
  </div>
  
  {/* Inline panel - appears when item selected */}
  {selectedId && (
    <InlinePanel onClose={() => setSelectedId(null)} width="lg">
      <InlinePanelHeader title="Contact Details" />
      <InlinePanelContent>...</InlinePanelContent>
    </InlinePanel>
  )}
</div>
```

### Panel States
- **View mode**: Display content with Edit button in header
- **Edit mode**: Form inputs with Save/Cancel/Delete in footer
- **Transition**: 300ms slide-in animation
- **Escape key**: Closes panel

---

## Editable Info Card Pattern

In-place editing for entity details without navigation:

```tsx
<EditableInfoCard
  title="Company Details"
  fields={[
    { key: 'name', label: 'Company Name', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'select', options: [...] },
    { key: 'website', label: 'Website', type: 'url' },
  ]}
  data={account}
  onSave={handleSave}
  columns={2}
/>
```

### Field Types
`text`, `email`, `phone`, `url`, `number`, `currency`, `date`, `select`, `textarea`, `checkbox`

---

## Inline Form Pattern

Quick entry without leaving context:

```tsx
// Collapsed state: "+ Log Activity" button
// Expanded state: Full form with fields
<InlineActivityForm 
  entityType="account" 
  entityId={accountId} 
  onSuccess={refetch} 
/>
```

### Behavior
- Collapsed by default (shows action button)
- Expands in place when clicked
- Validates on submit
- Collapses after successful submit
- Shows toast notification

---

## Form Design

### View Mode vs Edit Mode

| Aspect | View Mode | Edit Mode |
|--------|-----------|-----------|
| Layout | Content flows | Clear field boundaries |
| Spacing | Tighter | Expanded |
| Borders | None/minimal | Visible |
| Labels | Inline | Above inputs |

### Layout Patterns
1. **Single column** (default): Stack fields vertically
2. **Two column**: For related pairs (first/last name)
3. **Wizard**: Multi-step with progress indicator

### Validation
- Show errors on blur, not every keystroke
- Error message below field (never tooltip)
- Red border + message for errors

---

## Animations

### Timing (Hublot-style - slower, deliberate)
- 250ms: Micro-interactions
- 300ms: Standard transitions
- 350ms: Slide animations
- 400ms: Fade animations

### Easing
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)`

### Patterns
- Cards: Lift on hover (`hover:-translate-y-1`)
- Buttons: Lift on hover (`hover:-translate-y-0.5`)
- Modals: Fade + scale in (300ms)
- Navigation: Color transitions (300ms)

---

## Dark Mode

Hublot-style pure black aesthetic:
- Background: Pure black (#000000)
- Cards: Very dark gray (#121212)
- Text: Off-white (#FAFAFA)
- Accents: Rose gold lighter variant
- Borders: Dark gray (#262626)

---

## Responsive Design

### Breakpoints
- Mobile: < 640px
- `sm`: >= 640px
- `md`: >= 768px
- `lg`: >= 1024px
- `xl`: >= 1280px
- `2xl`: >= 1536px

### Patterns
- Navigation: Hamburger at `md`
- Sidebars: Overlay on mobile
- Grids: Single column mobile
- Tables: Horizontal scroll on mobile

---

## Accessibility

### Color Contrast
- Text: 4.5:1 minimum
- Large text: 3:1 minimum

### Focus States
- Visible gold focus ring on all interactive elements
- Tab order follows logical flow
- Focus trapped in modals

---

## Component Reuse Rules (CRITICAL)

### One Component Per Pattern

**NEVER duplicate components. ALWAYS reuse unified components with configuration.**

| Pattern | Single Component | Config Location |
|---------|------------------|-----------------|
| **List View** | `EntityListView` | `src/configs/entities/{entity}.config.ts` |
| **Detail View** | `EntityDetailView` | `src/configs/entities/{entity}.config.ts` |
| **Intake Form** | `EntityIntakeForm` | `src/configs/entities/{entity}.config.ts` |
| **Wizard** | `EntityWizard` | `src/configs/entities/{entity}.config.ts` |
| **Inline Panel** | `InlinePanel` | Props only |
| **Stats Cards** | `ListStats` | Config `statsCards` |
| **Filters** | `ListFilters` | Config `filters` |
| **Table** | `ListTable` | Config `columns` |

### The Pattern

```
Page (< 10 lines) → Unified Component → Config Object
```

### WRONG - Creating Duplicates
```tsx
// ❌ DON'T: Create entity-specific list components
src/components/crm/CampaignsList.tsx
src/components/crm/LeadsList.tsx
src/components/recruiting/JobsList.tsx

// ❌ DON'T: Create entity-specific detail components
src/components/crm/CampaignDetail.tsx
src/components/recruiting/JobDetail.tsx
```

### RIGHT - Reusing Unified Components
```tsx
// ✅ DO: One unified component, multiple configs
src/components/pcf/list-view/EntityListView.tsx  // ONE component
src/configs/entities/campaigns.config.ts          // Config for campaigns
src/configs/entities/leads.config.ts              // Config for leads
src/configs/entities/jobs.config.ts               // Config for jobs

// ✅ DO: Minimal page files
// src/app/employee/crm/campaigns/page.tsx
export default function CampaignsPage() {
  return <EntityListView config={campaignsListConfig} />
}
```

### When to Extend vs Create New

| Situation | Action |
|-----------|--------|
| Need new column type | Add to `ColumnConfig` type + `ListTable` |
| Need new filter type | Add to `FilterConfig` type + `ListFilters` |
| Need new stat format | Add to `StatCardConfig` type + `ListStats` |
| Need entity-specific behavior | Add to config, not new component |
| Need completely different layout | Discuss first, probably config variant |

### Config-Driven Architecture Benefits
- Single source of truth per pattern
- Consistent behavior across entities
- Easier testing (test once, works everywhere)
- Smaller bundle size
- Faster development (config vs code)

---

## DO's and DON'Ts

### DO
- Use generous whitespace
- Use pure black for primary actions
- Use rose gold for premium/accent actions
- Add subtle hover lift animations (300ms)
- Use Raleway for headings with wide letter-spacing
- Use uppercase for navigation text
- Keep corners sharp (4px-8px radius)
- **REUSE unified components with config**
- **Extend existing components, don't duplicate**

### DON'T
- Use forest green (deprecated)
- Use rounded-xl or larger for cards/buttons
- Use transitions faster than 250ms
- Use serif fonts for headings
- Box everything with heavy borders
- Use too many accent colors
- Skip hover/focus states
- **Create entity-specific list/detail/form components**
- **Duplicate component logic across entities**
- **Build custom pages when config works**
