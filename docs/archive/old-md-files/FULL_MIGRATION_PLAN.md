# Migration Plan: Comprehensive Corporate Site

## Phase 1: Create "Mega-Menu" Navigation Structure
- [ ] Update `src/components/marketing/CorporateNavbar.tsx`
  - [ ] Add `Industries` Dropdown (12+ industries)
  - [ ] Add `Careers` Dropdown (Open Positions, Join Team)
  - [ ] Add `Resources` Dropdown (Blog, Whitepapers - placeholders)
  - [ ] Update `Solutions` Dropdown (Staffing, Consulting, Cross-Border, Training)
  - [ ] Implement "Generic Sign In" modal/redirect logic.

## Phase 2: Migrate "Industries" Pages (10+ Pages)
- [ ] Create `src/app/(public)/industries/layout.tsx` (Shared layout)
- [ ] Create generic `IndustryPage` component to reuse layout logic.
- [ ] Implement specific industry pages:
  - [ ] `/industries/technology`
  - [ ] `/industries/healthcare`
  - [ ] `/industries/finance`
  - [ ] `/industries/manufacturing`
  - [ ] `/industries/retail`
  - [ ] (And others from the list)

## Phase 3: Migrate "Careers" Section
- [ ] Create `/careers` landing page.
- [ ] Create `/careers/open-positions` (Job Board placeholder).
- [ ] Create `/careers/join-team` (Internal hiring).

## Phase 4: Academy Integration Points
- [ ] Update `/solutions/training` to redirect or link deeply to Academy.
- [ ] Implement the "Generic Sign In" that routes based on user role (Student -> Academy, Client -> Dashboard).

## Phase 5: Content Migration (The "100+ Pages")
- [ ] Systematically create the folder structure for all remaining pages.
- [ ] **Strict Rule**: Use the `CorporateLayout` and V3 Design System for ALL pages. No legacy styles.

## Phase 6: Logo Preservation
- [ ] Ensure the "I InTime Solutions" logo remains exactly as requested (as implemented in current V3 Navbar).


