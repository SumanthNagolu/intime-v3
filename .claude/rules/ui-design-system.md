# UI Design System Rules

## Design Philosophy

InTime uses a **Premium Minimalist Design System** inspired by:
- **Hublot**: Luxury watch aesthetic (monochrome foundation, generous whitespace, photography-dominant)
- **HumanLayer**: Modern documentation (clean navigation, content-first, excellent UX)

### Core Principle: "Content as Art"

Every screen should feel like a curated gallery - content breathes, forms feel effortless, navigation disappears when not needed. **Reject boxed everything** in favor of page-like flows with visual hierarchy through spacing, not borders.

---

## Color Usage

### Primary Palette
- **Page background**: `bg-cream` (#FDFBF7)
- **Card background**: `bg-white`
- **Primary text**: `text-charcoal-900` (#1A1A1A)
- **Secondary text**: `text-charcoal-600`
- **Muted text**: `text-charcoal-500`

### Brand Colors (Use Sparingly)
- **Primary actions**: `forest-500` (#0D4C3B)
- **Active/selected states**: `gold-500` or gold gradient
- **Focus rings**: `ring-gold-500/20`
- **Warm accents**: `rust-500` (#C75B39)

### Status Colors
- **Success**: `success-500` (#0A8754)
- **Warning**: `warning-500` (#D97706)
- **Error**: `error-500` (#DC2626)
- **Info**: `info-500` (#0369A1)

---

## Typography

### Font Families
- **Headlines**: `font-heading` (Cormorant Garamond) - Elegant serif
- **UI Elements**: `font-subheading` (Plus Jakarta Sans) - Modern sans
- **Body Text**: `font-body` (Plus Jakarta Sans) - Readable sans
- **Code**: `font-mono` (JetBrains Mono)

### Type Scale
- `text-display`: 72px (hero headlines)
- `text-h1`: 48px (page titles)
- `text-h2`: 36px (section headers)
- `text-h3`: 28px (subsections)
- `text-h4`: 20px (card titles)
- `text-body-lg`: 18px (lead paragraphs)
- `text-body`: 16px (default)
- `text-body-sm`: 14px (compact)
- `text-caption`: 12px (labels, uppercase)

### Rules
- Headlines always use `font-heading` (serif)
- UI elements use `font-subheading` (sans)
- Captions use uppercase with `tracking-wider`
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
- **Generous whitespace** = premium feel
- **Internal spacing < External spacing** (group related items)
- **Prefer spacing over borders** for visual separation

---

## Components

### Buttons

#### Variants
- `variant="default"`: Forest-500 bg, white text
- `variant="premium"`: Gold gradient + shimmer
- `variant="secondary"`: Outlined, forest border
- `variant="ghost"`: No background, text only
- `variant="destructive"`: Error-500 bg

#### Sizes
- `size="sm"`: 36px height
- `size="default"`: 44px height
- `size="lg"`: 52px height

#### States
- Hover: `hover:-translate-y-0.5 hover:shadow-elevation-md`
- Focus: `focus:ring-4 focus:ring-gold-500/20`
- Disabled: `opacity-50`

### Cards

Standard card:
```tsx
<Card className="bg-white rounded-xl border-charcoal-100 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300">
```

Glass card:
```tsx
<div className="glass rounded-xl p-6">
```

### Form Inputs

```tsx
<Input className="h-11 rounded-md border-charcoal-200 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500" />
```

### Shadows
- `shadow-elevation-sm`: Default cards
- `shadow-elevation-md`: Hovered cards
- `shadow-elevation-lg`: Modals
- `shadow-premium`: Hero elements
- `shadow-glass`: Glass components

---

## Navigation Patterns

### Top Navigation
- Glass effect: `glass-strong rounded-2xl shadow-premium`
- Horizontal tabs for primary sections
- Active state: Gold gradient background
- Dropdowns expand on hover

### Sidebar
- Width: 280px
- No visible border
- Active item: `border-l-2 border-gold-600`
- Collapsible sections

### Command Palette (Cmd+K)
- Centered glass modal
- Search with auto-focus
- Recent actions + suggestions
- Keyboard navigation

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

### Timing
- 150ms: Micro-interactions
- 300ms: Standard transitions
- 400ms: Slide animations
- 500ms: Fade animations

### Easing
- Standard: `cubic-bezier(0.4, 0, 0.2, 1)`

### Patterns
- Cards: Lift on hover (`hover:-translate-y-0.5`)
- Buttons: Scale on press (`active:scale-95`)
- Modals: Fade + scale in

---

## Role-Specific UI

### Recruiter
- Sidebar-main layout
- Pipeline kanban/list toggle
- Activity timeline
- Forest/gold accents

### Bench Sales
- Status-based tabs
- Prominent utilization metrics
- Color-coded bench days (green/yellow/orange/red)
- Immigration alerts

### Admin
- Settings-style sidebar
- Neutral colors
- Data-focused

### Client Portal
- Minimal navigation
- Quick action cards
- Interview calendar
- Client brand colors if white-labeled

### Talent Portal
- Profile-centric
- Job search focus
- Progress indicators
- Encouraging greens/golds

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
- Visible focus ring on all interactive elements
- Tab order follows logical flow
- Focus trapped in modals

---

## DO's and DON'Ts

### DO
- Use generous whitespace
- Prefer spacing over borders
- Use serif fonts for headlines
- Add subtle hover animations
- Use gold accents for premium feel
- Keep forms clean and scannable

### DON'T
- Box everything with borders
- Use too many colors
- Crowd content together
- Skip hover/focus states
- Use generic sans-serif for headlines
- Add unnecessary decorative elements
