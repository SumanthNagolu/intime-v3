# InTime Design System

## Philosophy

InTime uses a **Hublot-inspired Luxury Design System**: pure black/white foundation with gold accents, geometric sans-serif typography (Raleway), sharp corners (4px-8px), deliberate animations (300ms+), and generous whitespace. Every screen combines technical precision with refined luxury.

---

## Screen Architecture (PCF)

Every screen follows this three-zone layout:

```
┌─────────────────────────────────────────────────────────┐
│                    TOP NAVIGATION                        │
├───────────────┬─────────────────────────────────────────┤
│               │                                         │
│   SIDEBAR     │           SCREEN AREA                   │
│               │                                         │
│               │    (EntityListView or EntityDetailView) │
│               │                                         │
└───────────────┴─────────────────────────────────────────┘
```

| Zone | Component | Context |
|------|-----------|---------|
| Header | `TopNavigation` | Always present |
| Sidebar (List) | `SectionSidebar` | Navigation + recent entities |
| Sidebar (Detail) | `EntityJourneySidebar` | Journey steps OR sections + tools |
| Content | `EntityListView` / `EntityDetailView` | Config-driven |

**All pages use `SidebarLayout` which composes these zones.**

---

## Navigation Patterns

### Two Navigation Styles

| Style | Entities | URL Pattern |
|-------|----------|-------------|
| **Journey** | job, candidate, submission, placement | `?step=1` |
| **Sections** | account, contact, deal, lead | `?section=overview` |

**Journey** - Sequential workflow with visual step indicator:
- Completed: Green circle + checkmark
- Current: Gold circle + number
- Future: Gray circle

**Sections** - Category tabs with counts:
- Active: `bg-gold-50 text-gold-600 border-l-[3px] border-gold-500`

### Sidebar Structure (Detail Pages)

1. **Actions Panel** (collapsible) - Quick actions based on entity status
2. **Sections** - Entity sections with counts
3. **Tools** (separator) - Activities, Notes, Documents, History

---

## Colors

### Primary Palette

| Use | Class | Value |
|-----|-------|-------|
| Page background | `bg-cream` | #FDFBF7 |
| Card background | `bg-white` | #FFFFFF |
| Primary text | `text-charcoal-900` | #171717 |
| Secondary text | `text-charcoal-600` | - |
| Muted text | `text-charcoal-500` | - |

### Brand Colors

| Use | Class | Value |
|-----|-------|-------|
| Primary actions | `hublot-900` | #000000 (pure black) |
| Premium/accent | `gold-500` | #C9A961 |
| Hover accents | `gold-400` | #D4AF37 |
| Focus rings | `ring-gold-500` | - |
| Active states | `bg-gold-50` | - |

---

## Typography

| Scale | Size | Use |
|-------|------|-----|
| `text-h1` | 48px | Page titles |
| `text-h2` | 36px | Section headers |
| `text-h3` | 28px | Subsections |
| `text-h4` | 20px | Card titles |
| `text-body` | 16px | Default |
| `text-body-sm` | 14px | Compact |
| `text-nav` | 14px | Navigation (uppercase, tracking-widest) |
| `text-caption` | 12px | Labels (uppercase) |

**Rules:**
- Headlines: `font-heading` (Raleway) with wide letter-spacing
- Navigation: Uppercase with `tracking-widest`
- Body: `font-body` (Inter)
- Max line length: 65 characters

---

## Spacing (8px Grid)

| Token | Value | Use |
|-------|-------|-----|
| `space-xs` | 4px | Tight gaps |
| `space-sm` | 8px | Small gaps |
| `space-md` | 16px | Default |
| `space-lg` | 24px | Section gaps |
| `space-xl` | 32px | Large sections |

**Patterns:**
- Container: `px-6 lg:px-12`
- Cards: `p-8`
- Form gaps: `space-y-6`

---

## Components

### Buttons

| Variant | Use |
|---------|-----|
| `default` | Black bg, white text, lift on hover |
| `premium` | Gold gradient + glow |
| `outline` | 2px black border, fills on hover |
| `ghost` | Text only |
| `destructive` | Error-500 bg |

**Styling:** Uppercase text, `tracking-wider`, `rounded-sm` (4px), 300ms transitions.

### Cards

```tsx
<Card className="bg-white rounded-lg border-charcoal-100 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-1 transition-all duration-300">
```

### Form Inputs

```tsx
<Input className="h-11 rounded-sm border-charcoal-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all duration-300" />
```

### Shadows

| Token | Use |
|-------|-----|
| `shadow-elevation-sm` | Default cards |
| `shadow-elevation-md` | Hovered cards |
| `shadow-elevation-lg` | Dropdowns |
| `shadow-elevation-xl` | Modals |
| `shadow-gold-glow` | Gold buttons |

---

## Animations

| Duration | Use |
|----------|-----|
| 250ms | Micro-interactions |
| 300ms | Standard transitions |
| 350ms | Slide animations |
| 400ms | Fade animations |

**Patterns:**
- Cards: `hover:-translate-y-1`
- Buttons: `hover:-translate-y-0.5`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`

---

## Config-Driven Architecture

### List Pages

```tsx
// Page file (< 10 lines)
export default function CampaignsPage() {
  return <EntityListView<Campaign> config={campaignsListConfig} />
}

// Config file
export const campaignsListConfig: ListViewConfig<Campaign> = {
  entityType: 'campaign',
  entityName: { singular: 'Campaign', plural: 'Campaigns' },
  baseRoute: '/employee/crm/campaigns',
  statsCards: [...],
  filters: [...],
  columns: [...],
  useListQuery: (filters) => trpc.crm.campaigns.list.useQuery({...}),
}
```

### Detail Pages

- Use `EntityDetailView` with config
- Sidebar: EntityJourneySidebar (journey steps OR sections + tools)
- Quick Actions: Header area only

### Inline Panels

Slide-in panels replace modals for entity details:

| Width | Use |
|-------|-----|
| `sm` (320px) | Compact info |
| `md` (384px) | Standard forms |
| `lg` (480px) | Detail views (most common) |
| `xl` (560px) | Complex content |

---

## Universal Patterns

### List Page Layout

```
Page Title                           [+ New] [Filter]
─────────────────────────────────────────────────────
[Search...] [Filter ▼] [Sort ▼] [View: Cards | List]

┌─────────────────────────────────────────────────┐
│ Items grid/table                                │
└─────────────────────────────────────────────────┘

Pagination: [← Prev] Page 1 of 10 [Next →]
```

### Detail Page Layout

```
[Back] Entity Name                      [Actions ▼]
─────────────────────────────────────────────────────
┌─────────────────────────┐  ┌───────────────────┐
│ Main Content            │  │ Sidebar           │
│                         │  │ - Quick Facts     │
│ [Tabs: Overview|...]    │  │ - Related Items   │
│                         │  │ - Actions         │
└─────────────────────────┘  └───────────────────┘
```

### Empty States

```
         [Illustration]
     No [items] yet
     Get started by [action]
         [Primary CTA]
```

---

## DO's and DON'Ts

### DO

- Use `bg-cream` for page backgrounds
- Use generous whitespace (luxury feel)
- Use gold for premium/accent actions
- Add hover lift animations (300ms)
- Use Raleway for headings with wide letter-spacing
- Use uppercase for navigation text
- Keep corners sharp (4px-8px)
- Reuse unified components with config
- Extend existing components, don't duplicate

### DON'T

- Use `bg-gray-50` (use `bg-cream`)
- Use rounded-xl or larger
- Use transitions faster than 250ms
- Use serif fonts for headings
- Box everything with heavy borders
- Use too many accent colors
- Skip hover/focus states
- Create entity-specific list/detail components
- Add quick actions to sidebar (header only)
- Add "New X" buttons to sidebar bottom

