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

## Color Usage

### Primary Palette
- **Page background**: `bg-cream` (#FDFBF7)
- **Card background**: `bg-white`
- **Primary text**: `text-charcoal-900` (#171717)
- **Secondary text**: `text-charcoal-600`
- **Muted text**: `text-charcoal-500`

### Brand Colors
- **Primary actions**: `hublot-900` (pure black #000000)
- **Premium actions**: `gold-500` (#B76E79 rose gold)
- **Active/selected states**: `gold-500` or gold gradient
- **Focus rings**: `ring-gold-500`
- **Hover accents**: `gold-400` (#D4A574)

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

### Sidebar
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

## DO's and DON'Ts

### DO
- Use generous whitespace
- Use pure black for primary actions
- Use rose gold for premium/accent actions
- Add subtle hover lift animations (300ms)
- Use Raleway for headings with wide letter-spacing
- Use uppercase for navigation text
- Keep corners sharp (4px-8px radius)

### DON'T
- Use forest green (deprecated)
- Use rounded-xl or larger for cards/buttons
- Use transitions faster than 250ms
- Use serif fonts for headings
- Box everything with heavy borders
- Use too many accent colors
- Skip hover/focus states
