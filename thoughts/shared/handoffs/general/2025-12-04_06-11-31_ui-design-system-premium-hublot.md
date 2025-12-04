---
date: 2025-12-04T11:11:31Z
researcher: Claude
git_commit: df2bd23
branch: main
repository: intime-v3
topic: "UI Design Architecture - Premium Hublot-Inspired Design System Implementation"
tags: [implementation, ui-design, design-system, hublot, humanlayer, tailwind, forms, navigation, components]
status: in_progress
last_updated: 2025-12-04
last_updated_by: Claude
type: implementation_strategy
---

# Handoff: UI Design System - Premium Hublot-Inspired Implementation

## Task(s)

Implementing a comprehensive premium UI design system inspired by Hublot (luxury watch) and HumanLayer (modern documentation) websites.

**Working from plan document:** `thoughts/shared/research/2025-12-04-ui-design-architecture-hublot-inspired.md`

### Implementation Checklist Status:

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1: Foundation** | **COMPLETE** | Design tokens, CSS variables, fonts, base components |
| **Phase 2: Navigation** | **COMPLETE** | Navbar glass effect, sidebar, command palette, breadcrumbs |
| **Phase 3: Forms** | PENDING | Floating labels, portal dropdowns, validation states |
| **Phase 4: Role Dashboards** | PENDING | Recruiter, Bench Sales, Admin, Client, Talent portal redesigns |
| **Phase 5: Polish** | PENDING | Animations, dark mode, accessibility audit |

## Critical References

1. **Design System Plan:** `thoughts/shared/research/2025-12-04-ui-design-architecture-hublot-inspired.md` - Contains all design specifications (colors, typography, spacing, components)
2. **Tailwind Config:** `tailwind.config.ts` - Already contains full design tokens
3. **Global Styles:** `src/app/globals.css` - CSS variables, utilities, glass effects

## Recent Changes

### Phase 1 - Completed:

1. `src/components/ui/input.tsx:5-30` - Updated Input with premium styling:
   - Height h-11 (44px touch target)
   - Border border-charcoal-200
   - Gold focus ring (ring-2 ring-gold-500/20 border-gold-500)
   - Elevation shadows

2. `src/components/ui/select.tsx:15-42` - Updated SelectTrigger with matching premium styling

3. `src/components/ui/select.tsx:70-113` - Updated SelectContent with glass effect (bg-white/95 backdrop-blur-xl)

4. `src/components/ui/select.tsx:114-142` - Updated SelectItem with premium hover states and forest-50 checked state

5. `src/components/ui/textarea.tsx:5-30` - Updated Textarea with:
   - Minimum height 120px
   - Gold focus ring
   - Vertical resize only

6. `thoughts/shared/research/2025-12-04-ui-design-architecture-hublot-inspired.md:671-675` - Marked Phase 1 checkboxes as complete

## Learnings

### Already Implemented (Pre-existing):
- **tailwind.config.ts** already had full design token system (colors, fonts, shadows, spacing, animations)
- **globals.css** already had CSS variables, typography classes, glass utilities, premium animations
- **Google Fonts** already imported (Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono)
- **Button component** (`src/components/ui/button.tsx`) already had premium variants (default, gold, premium, secondary, outline, ghost, destructive, link, glass)
- **Card component** (`src/components/ui/card.tsx`) already had elevation shadows
- **Navbar** (`src/components/Navbar.tsx`) already had glass effect styling (`glass-strong shadow-premium rounded-2xl`)
- **Command Palette** (`src/components/GlobalCommand.tsx`) exists with Cmd+K/Ctrl+K support

### Build Status:
- Build has pre-existing errors unrelated to UI changes (missing HRLayout, ScreenRenderer, HR screen modules)
- ESLint passes on all modified UI component files

### Design System Color Palette:
- **Primary:** Forest green (#0D4C3B)
- **Accent:** Gold (#C9A961, #D4AF37)
- **Neutrals:** Charcoal scale (#0D0D0D to #F8F9FA)
- **Background:** Cream (#FDFBF7)

## Artifacts

1. **Plan Document:** `thoughts/shared/research/2025-12-04-ui-design-architecture-hublot-inspired.md`
2. **Updated Input:** `src/components/ui/input.tsx`
3. **Updated Select:** `src/components/ui/select.tsx`
4. **Updated Textarea:** `src/components/ui/textarea.tsx`

## Action Items & Next Steps

### Phase 2: Navigation (COMPLETE)
- [x] Navbar glass effect - Already done
- [x] Update GlobalCommand.tsx (`src/components/GlobalCommand.tsx`) with premium design system styling (replaced `stone` colors with `charcoal`, added glass effect)
- [x] Create Breadcrumb component at `src/components/ui/breadcrumb.tsx`
- [x] Create Sidebar navigation component at `src/components/ui/sidebar.tsx`
- [x] Update plan file checkboxes for Phase 2

### Phase 3: Forms
- [ ] Create floating label Input variant
- [ ] Ensure Select uses portal dropdown (already does via Radix)
- [ ] Create form layout pattern components
- [ ] Implement validation state styling

### Phase 4: Role Dashboards
- [ ] Recruiter dashboard redesign
- [ ] Bench sales dashboard redesign
- [ ] Admin settings redesign
- [ ] Client portal redesign
- [ ] Talent portal redesign

### Phase 5: Polish
- [ ] Add page transition animations
- [ ] Implement full dark mode support
- [ ] Accessibility audit (focus states, contrast, ARIA)
- [ ] Performance optimization

## Other Notes

### Key Files to Reference:
- **Navigation Config:** `src/components/Navbar.tsx:17-256` - ROLE_NAV structure defines all role-based navigation
- **App Layout:** `src/components/AppLayout.tsx` - Uses GlobalCommand, premium mesh gradient background
- **Existing Command Modal:** `src/components/modals/specialized/CommandBarModal.tsx` - More advanced version (not currently used in AppLayout)

### Design System Classes Available:
- Glass: `.glass`, `.glass-strong`, `.glass-dark`, `.glass-hover`
- Gradients: `.bg-gradient-forest`, `.bg-gradient-gold`, `.bg-gradient-premium`
- Shadows: `.shadow-elevation-xs` through `.shadow-elevation-2xl`, `.shadow-premium`
- Typography: `.text-display`, `.text-h1` through `.text-h4`, `.text-body-lg`, `.text-body`, `.text-caption`
- Containers: `.container-premium`, `.container-narrow`, `.container-wide`

### GlobalCommand Needs Update:
The `GlobalCommand.tsx` component still uses `stone` colors instead of `charcoal` from the design system. Key lines to update:
- Line 41: `bg-charcoal/60` instead of `bg-charcoal`
- Line 43-56: Replace all `stone-*` classes with equivalent `charcoal-*` classes
