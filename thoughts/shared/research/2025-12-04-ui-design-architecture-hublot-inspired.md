---
date: 2025-12-04T02:23:25Z
researcher: Claude
git_commit: df2bd23
branch: main
repository: intime-v3
topic: "UI Design Architecture - Hublot/HumanLayer Inspired Premium Design System"
tags: [research, ui-design, design-system, hublot, humanlayer, tailwind, forms, navigation, components]
status: complete
last_updated: 2025-12-04
last_updated_by: Claude
---

# Research: UI Design Architecture - Premium Design System

**Date**: 2025-12-04T02:23:25Z
**Researcher**: Claude
**Git Commit**: df2bd23
**Branch**: main
**Repository**: intime-v3

## Research Question

Design a premium UI architecture inspired by Hublot (luxury watch) and HumanLayer (modern documentation) websites. Document comprehensive design specifications for colors, typography, navigation, forms, spacing, and role-specific UI patterns. This research will inform project rules and Claude configuration for UI development.

---

## Executive Summary

This document establishes a **Premium Minimalist Design System** that fuses:
- **Hublot's luxury aesthetic**: Black/white foundation, generous whitespace, photography-dominant layouts, premium elevation shadows, 8px grid system
- **HumanLayer's documentation clarity**: Clean navigation, floating labels, subtle interactivity, content-first layouts, excellent dark mode support

### Core Philosophy: "Content as Art"

Every screen should feel like a **curated gallery exhibition** - where content breathes, forms feel effortless, and navigation disappears when not needed. Reject the old-school "boxed everything" approach in favor of **page-like flows** with clear visual hierarchy through spacing, not borders.

---

## 1. Color System

### 1.1 Foundation: Monochrome Core

Following Hublot's approach, establish a **monochrome foundation** that highlights content:

```css
/* Primary Palette */
--color-black: #0D0D0D;           /* True black for headlines */
--color-charcoal: #1A1A1A;        /* Primary text */
--color-slate: #2D3E50;           /* Secondary text */
--color-gray: #6C757D;            /* Tertiary/muted */
--color-cloud: #F8F9FA;           /* Light backgrounds */
--color-cream: #FDFBF7;           /* Warm white background */
--color-white: #FFFFFF;           /* Pure white cards */
```

### 1.2 Brand Accents (Use Sparingly)

```css
/* Forest Green - Primary Brand (CTAs, active states) */
--color-forest-500: #0D4C3B;
--color-forest-600: #0B3F31;
--color-forest-900: #0A3A2A;

/* Gold - Premium Accent (highlights, focus rings, success) */
--color-gold-500: #C9A961;
--color-gold-600: #D4AF37;         /* Bright gold for highlights */

/* Rust - Warm Accent (optional secondary CTAs) */
--color-rust-500: #C75B39;
```

### 1.3 Semantic Colors

```css
/* Status Indicators */
--color-success: #0A8754;
--color-warning: #D97706;
--color-error: #DC2626;
--color-info: #0369A1;
```

### 1.4 Color Usage Rules

| Context | Color | Notes |
|---------|-------|-------|
| **Page background** | cream `#FDFBF7` | Warm, inviting |
| **Card background** | white `#FFFFFF` | Clean contrast |
| **Primary text** | charcoal-900 `#1A1A1A` | Strong readability |
| **Secondary text** | charcoal-600 `#495057` | Subtle hierarchy |
| **Muted text** | charcoal-500 `#6C757D` | Captions, hints |
| **Primary CTA** | forest-500 `#0D4C3B` | Actions |
| **Active/Selected** | gold gradient | Premium feel |
| **Focus ring** | gold-500 at 20% opacity | Accessible, premium |
| **Dividers** | charcoal-100 `#E9ECEF` | Barely visible |

---

## 2. Typography System

### 2.1 Font Stack

Following Hublot's Gotham-inspired clarity with a distinctive serif for headings:

```css
/* Headlines - Elegant Serif */
font-heading: "Cormorant Garamond", "Playfair Display", Georgia, serif;

/* UI Text - Modern Sans */
font-subheading: "Plus Jakarta Sans", "Space Grotesk", Inter, system-ui, sans-serif;

/* Body - Readable Sans */
font-body: "Plus Jakarta Sans", Inter, -apple-system, system-ui, sans-serif;

/* Code - Developer Friendly */
font-mono: "JetBrains Mono", "IBM Plex Mono", "Fira Code", monospace;
```

### 2.2 Type Scale (8px Grid)

| Token | Size | Line Height | Weight | Use Case |
|-------|------|-------------|--------|----------|
| `display` | 72px / 4.5rem | 80px / 5rem | 900 | Hero headlines |
| `h1` | 48px / 3rem | 56px / 3.5rem | 900 | Page titles |
| `h2` | 36px / 2.25rem | 44px / 2.75rem | 700 | Section headers |
| `h3` | 28px / 1.75rem | 36px / 2.25rem | 700 | Subsections |
| `h4` | 20px / 1.25rem | 28px / 1.75rem | 600 | Card titles |
| `body-lg` | 18px / 1.125rem | 28px / 1.75rem | 400 | Lead paragraphs |
| `body` | 16px / 1rem | 24px / 1.5rem | 400 | Default text |
| `body-sm` | 14px / 0.875rem | 20px / 1.25rem | 400 | Compact text |
| `caption` | 12px / 0.75rem | 16px / 1rem | 500 | Labels, hints |

### 2.3 Typography Rules

1. **Headlines use serif** (font-heading) - Creates elegance
2. **UI elements use sans-serif** (font-subheading) - Clean, modern
3. **Body text uses readable sans** (font-body) - Comfortable reading
4. **Captions are uppercase** with 0.05em letter-spacing
5. **Maximum line length**: 65 characters for readability

---

## 3. Spacing System (8px Grid)

### 3.1 Base Units

```css
/* Spacing Scale */
--space-xs: 0.25rem;    /* 4px - Icons, tight elements */
--space-sm: 0.5rem;     /* 8px - Base unit */
--space-md: 1rem;       /* 16px - Default padding */
--space-lg: 1.5rem;     /* 24px - Section gaps */
--space-xl: 2rem;       /* 32px - Card padding */
--space-2xl: 3rem;      /* 48px - Section dividers */
--space-3xl: 4rem;      /* 64px - Major sections */
--space-4xl: 6rem;      /* 96px - Hero spacing */
--space-5xl: 8rem;      /* 128px - Full-bleed breaks */
```

### 3.2 Spacing Rules

1. **Container padding**: `px-6 lg:px-12` (24px mobile, 48px desktop)
2. **Card padding**: `p-8` (32px) for standard cards
3. **Section vertical spacing**: `py-16` (64px) between major sections
4. **Form field gaps**: `space-y-6` (24px) between fields
5. **Inline element gaps**: `gap-2` (8px) or `gap-4` (16px)

### 3.3 Whitespace Philosophy

> "White space focuses attention by creating contrast through absence"

- **Generous margins** around content create premium feel
- **Internal spacing < External spacing** (group related items)
- **Let content breathe** - when in doubt, add more space
- **No borders when spacing suffices** - prefer visual separation through space

---

## 4. Navigation Patterns

### 4.1 Top Navigation (Hublot-Inspired)

Structure follows glassmorphism navbar with clear hierarchy:

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]        [Primary Nav Tabs]           [Actions] [Profile] │
└─────────────────────────────────────────────────────────────────┘
```

**Styling:**
- Glass background: `bg-white/85 backdrop-blur-xl`
- Rounded container: `rounded-2xl`
- Shadow: `shadow-premium` (20px 40px spread)
- Sticky positioning with `z-50`

**Navigation Items:**
- Horizontal tabs for primary sections
- Dropdowns expand on hover with 300ms delay
- Active state: Gold gradient background
- Hover state: Subtle background change

### 4.2 Sidebar Navigation (HumanLayer-Inspired)

For documentation/admin contexts:

```
┌──────────────────────────┐
│ [Section Label]          │
│   ├── Item 1             │
│   ├── Item 2 (active)    │
│   └── Item 3             │
│                          │
│ [Section Label 2]        │
│   ├── Item A             │
│   └── Item B             │
└──────────────────────────┘
```

**Styling:**
- Width: 280px fixed
- Background: transparent or subtle `bg-cloud`
- No visible borders
- Active item: Left border accent (`border-l-2 border-gold-600`)
- Collapsible sections with smooth animation

### 4.3 Breadcrumbs

Minimal, contextual navigation:

```
Dashboard / Recruiting / Jobs / Senior Developer
```

- Use `/` separator (not `>`)
- Current page is bold, non-clickable
- Muted text color for ancestors

### 4.4 Command Palette (⌘K)

Global quick navigation:

- Trigger: `Cmd+K` or `Ctrl+K`
- Glass modal centered on screen
- Search input with auto-focus
- Recent actions + suggested commands
- Keyboard navigation (up/down arrows)

---

## 5. Form Design Philosophy

### 5.1 Core Principle: Forms as Content

Reject boxed, cramped forms. Instead:

> "When viewing, content flows like a page. When editing, spacing expands to show clear field boundaries."

### 5.2 View Mode vs Edit Mode

| Aspect | View Mode | Edit Mode |
|--------|-----------|-----------|
| **Layout** | Content flows naturally | Fields have clear boundaries |
| **Spacing** | Tighter, content-dense | Expanded, more breathing room |
| **Labels** | Inline with values | Above inputs (or floating) |
| **Borders** | None or minimal | Visible field boundaries |
| **Background** | Transparent | Subtle field background |

### 5.3 Field Component Patterns

#### Text Inputs

```
[Label]
┌──────────────────────────────────────┐
│ Placeholder or value                 │
└──────────────────────────────────────┘
[Helper text or validation message]
```

**Styling:**
- Height: `h-11` (44px) for touch targets
- Border: `border-charcoal-200`
- Border radius: `rounded-md` (8px)
- Focus: `ring-2 ring-gold-500/20 border-gold-500`
- Background: `bg-transparent` or `bg-white`

#### Floating Labels (Optional Premium Pattern)

```
┌──────────────────────────────────────┐
│ [Label floats up when focused]       │
│ Value here                           │
└──────────────────────────────────────┘
```

Use when space is constrained but maintain readability.

#### Select/Dropdown

- Same dimensions as text inputs
- Chevron icon on right
- Options appear in portal (not inline)
- Selected item shows checkmark

#### Textarea

- Minimum height: 120px
- Resize: vertical only
- Same focus styling as inputs

### 5.4 Form Layout Patterns

#### Single Column (Default)

```
┌─────────────────────────────────────────┐
│ [Field 1]                               │
│                                         │
│ [Field 2]                               │
│                                         │
│ [Field 3]                               │
│                                         │
│ [Field 4]                               │
│                                         │
│          [Cancel]   [Save]              │
└─────────────────────────────────────────┘
```

Best for: Most forms, mobile-first design.

#### Two Column

```
┌────────────────────┬────────────────────┐
│ [First Name]       │ [Last Name]        │
├────────────────────┴────────────────────┤
│ [Email]                                 │
├────────────────────┬────────────────────┤
│ [Phone]            │ [Extension]        │
└────────────────────┴────────────────────┘
```

Use for: Related field pairs (name, address).

#### Wizard/Steps

```
Step 1 ──● Step 2 ──○ Step 3 ──○ Step 4

┌─────────────────────────────────────────┐
│ [Step 1 Content]                        │
│                                         │
│          [Back]   [Next: Step 2 →]      │
└─────────────────────────────────────────┘
```

Use for: Complex multi-step processes.

### 5.5 Form Validation

- **Inline validation**: Show on blur, not on every keystroke
- **Error styling**: Red border + error message below field
- **Success styling**: Green checkmark (optional, not mandatory)
- **Error message position**: Below field, never in tooltip

---

## 6. Component Library

### 6.1 Buttons

#### Variants

| Variant | Use Case | Styling |
|---------|----------|---------|
| **Primary** | Main CTA | Forest-500 bg, white text, hover lift |
| **Premium** | Special actions | Gold gradient + shimmer overlay |
| **Secondary** | Secondary actions | Outlined, forest border |
| **Ghost** | Tertiary actions | No background, text only |
| **Destructive** | Delete/danger | Error-500 bg |

#### Sizes

| Size | Height | Padding | Use Case |
|------|--------|---------|----------|
| `sm` | 36px | px-4 | Compact contexts |
| `default` | 44px | px-6 | Standard |
| `lg` | 52px | px-8 | Prominent CTAs |
| `xl` | 64px | px-12 | Hero buttons |

#### Button States

- **Hover**: Slight lift (`-translate-y-0.5`) + shadow increase
- **Active**: Scale down (`scale-95`)
- **Disabled**: 50% opacity, no pointer events
- **Loading**: Spinner replaces text

### 6.2 Cards

#### Standard Card

```css
.card {
  background: white;
  border-radius: 1rem; /* 16px */
  border: 1px solid var(--charcoal-100);
  box-shadow: var(--elevation-sm);
  transition: all 300ms ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--elevation-md);
}
```

#### Glass Card

```css
.card-glass {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid rgba(10, 58, 42, 0.15);
}
```

### 6.3 Tables

Following HumanLayer's clean table aesthetic:

- No outer border
- Header row: Muted background
- Row dividers: Subtle 1px border
- Row hover: Slight background highlight
- Cell padding: `p-4`

### 6.4 Modals/Dialogs

- Overlay: `bg-black/80` with fade animation
- Content: Centered, max-width 560px (forms) or 900px (complex)
- Border radius: `rounded-xl` (24px)
- Shadow: `shadow-2xl`
- Close button: Top-right corner

### 6.5 Dropdowns

- Same glass styling as navbar menus
- Max height with scroll for long lists
- Grouped items with subtle separators
- Icons on left, keyboard shortcuts on right

---

## 7. Shadows & Elevation

### 7.1 Elevation Scale

```css
/* Progressive elevation using forest green rgba */
--elevation-xs: 0 1px 2px rgba(10, 58, 42, 0.05);
--elevation-sm: 0 2px 8px rgba(10, 58, 42, 0.08);
--elevation-md: 0 4px 16px rgba(10, 58, 42, 0.10);
--elevation-lg: 0 8px 24px rgba(10, 58, 42, 0.12);
--elevation-xl: 0 16px 32px rgba(10, 58, 42, 0.16);
--elevation-2xl: 0 24px 48px rgba(10, 58, 42, 0.20);

/* Premium shadows */
--shadow-premium: 0 20px 40px -12px rgba(10, 58, 42, 0.25);
--shadow-glass: 0 8px 32px 0 rgba(10, 58, 42, 0.12);
```

### 7.2 When to Use Elevation

| Elevation | Use Case |
|-----------|----------|
| `xs` | Subtle cards, inputs |
| `sm` | Default cards |
| `md` | Hovered cards |
| `lg` | Modals, popovers |
| `xl` | Featured content |
| `premium` | Hero elements |

---

## 8. Animation & Transitions

### 8.1 Timing Function

Standard easing: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)

### 8.2 Duration Scale

| Duration | Use Case |
|----------|----------|
| 150ms | Micro-interactions (hover states) |
| 300ms | Standard transitions (buttons, cards) |
| 400ms | Slide animations (modals, drawers) |
| 500ms | Fade animations (page transitions) |

### 8.3 Animation Patterns

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide Up */
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale In */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

### 8.4 Hover Patterns

- **Cards**: Lift + shadow increase
- **Buttons**: Slight scale + shadow
- **Links**: Underline reveal or color change
- **Images**: Subtle zoom (scale 1.02)

---

## 9. Role-Specific UI Patterns

### 9.1 Recruiter Dashboard

**Layout**: Sidebar-main with activity feed

**Key Sections**:
- Quick stats cards (4-column grid)
- Pipeline kanban or list toggle
- Activity timeline
- Upcoming interviews calendar

**Color Accents**: Forest green for KPIs, gold for wins

### 9.2 Bench Sales Dashboard

**Layout**: Full-width with status-based tabs

**Key Sections**:
- Bench utilization metrics (prominent)
- Consultant grid with status badges
- Immigration alerts (color-coded)
- Hotlist management

**Color Accents**: Status colors (green/yellow/orange/red) for bench days

### 9.3 Admin Dashboard

**Layout**: Settings-style sidebar

**Key Sections**:
- User management with role badges
- Pod organization tree
- System settings cards
- Audit log timeline

**Color Accents**: Neutral, minimal - focus on data

### 9.4 Client Portal

**Layout**: Clean, minimal navigation

**Key Sections**:
- Jobs overview with quick actions
- Candidate review cards
- Interview calendar
- Placement status

**Color Accents**: Client's brand colors if white-labeled

### 9.5 Talent Portal

**Layout**: Profile-centric with job search

**Key Sections**:
- Profile completion progress
- Job search/saved jobs
- Application tracker
- Interview prep

**Color Accents**: Encouraging greens and golds

---

## 10. Responsive Breakpoints

Following Tailwind's mobile-first approach:

| Breakpoint | Width | Typical Device |
|------------|-------|----------------|
| Default | < 640px | Mobile phones |
| `sm` | ≥ 640px | Large phones |
| `md` | ≥ 768px | Tablets portrait |
| `lg` | ≥ 1024px | Tablets landscape |
| `xl` | ≥ 1280px | Laptops |
| `2xl` | ≥ 1536px | Large desktops |

### Responsive Patterns

1. **Navigation**: Collapse to hamburger at `md` breakpoint
2. **Sidebars**: Overlay drawer on mobile, fixed on desktop
3. **Grids**: Single column mobile, multi-column desktop
4. **Cards**: Stack vertically on mobile
5. **Tables**: Horizontal scroll or card view on mobile

---

## 11. Accessibility Standards

### 11.1 Color Contrast

- Text on background: Minimum 4.5:1 ratio
- Large text: Minimum 3:1 ratio
- Interactive elements: Visible focus states

### 11.2 Focus Management

- **Focus ring**: Gold ring with 20% opacity
- **Skip links**: Hidden until focused
- **Tab order**: Logical flow through content
- **Focus trapping**: In modals and dialogs

### 11.3 Screen Reader Support

- Semantic HTML elements
- ARIA labels where needed
- Live regions for dynamic updates
- Descriptive alt text for images

---

## 12. Dark Mode Support

### 12.1 Dark Palette

```css
.dark {
  --background: #0D0D0D;
  --foreground: #FDFBF7;
  --card: #1A1A1A;
  --primary: #1A6B56;           /* Lighter forest for dark bg */
  --accent: #D4AF37;            /* Gold stays bright */
  --muted: #2D2D2D;
  --border: #333333;
}
```

### 12.2 Dark Mode Rules

- Background shifts to charcoal
- Cards become slightly lighter charcoal
- Primary colors increase lightness
- Gold accent remains vibrant
- Shadows use white at low opacity

---

## 13. Implementation Checklist

### Phase 1: Foundation
- [x] Update `tailwind.config.ts` with design tokens
- [x] Update `globals.css` with CSS variables
- [x] Import Google Fonts (Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono)
- [x] Create base component variants (Button, Card, Input)

### Phase 2: Navigation
- [x] Redesign Navbar with glass effect
- [x] Create sidebar navigation component
- [x] Implement command palette
- [x] Add breadcrumb component

### Phase 3: Forms
- [x] Create Input component with floating labels option
- [x] Create Select with portal dropdown
- [x] Create Textarea component
- [x] Create form layout patterns
- [x] Implement validation states

### Phase 4: Role Dashboards
- [ ] Recruiter dashboard redesign
- [ ] Bench sales dashboard redesign
- [ ] Admin settings redesign
- [ ] Client portal redesign
- [ ] Talent portal redesign

### Phase 5: Polish
- [ ] Add animations and transitions
- [ ] Implement dark mode
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Code References

### Existing Design System Files
- `tailwind.config.ts` - Complete design token configuration
- `src/app/globals.css` - CSS utilities and component classes
- `src/components/ui/` - Shadcn/UI base components
- `src/components/Navbar.tsx:372-630` - Current navigation implementation
- `src/components/AppLayout.tsx:16-71` - App shell structure

### Specs for Reference
- `docs/specs/20-USER-ROLES/` - All role workflow specifications
- `docs/specs/10-DATABASE/` - Entity relationships for forms

---

## Related Research

- `thoughts/shared/research/2025-12-03-ui-cleanup-architecture-reference.md` - Current UI architecture
- `thoughts/shared/research/2025-12-03-database-system-architecture-overview.md` - Database structure for forms

---

## Sources

### Hublot Design Patterns
- Hublot.com website analysis
- Gotham font family (Hoefler & Co.)
- 8px grid system best practices
- Luxury website mega menu patterns

### HumanLayer/Mintlify Patterns
- Mintlify documentation platform
- Inter and Geist font families
- Tailwind CSS responsive design
- Modern documentation site patterns

---

*This document serves as the authoritative reference for UI development decisions in InTime v3. All new components and screens should follow these guidelines.*
