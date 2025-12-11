---
date: 2025-12-09T05:32:51-05:00
researcher: claude-opus-4-5
git_commit: bfba1ba4789613a30e4a3048d3ae4d9b34a0b565
branch: main
repository: intime-v3
topic: "Guidewire UI Architecture Transformation - Phase 2 Wizard Conversions"
tags: [implementation, guidewire, wizard-conversion, dialog-to-page, zustand]
status: in_progress
last_updated: 2025-12-09
last_updated_by: claude-opus-4-5
type: implementation_strategy
---

# Handoff: Guidewire UI Architecture Transformation - Phase 2 Wizard Conversions

## Task(s)

Working on the **Guidewire UI Architecture Transformation** plan, specifically **Phase 2: Large Wizard Dialog Conversions**.

| Task | Status |
|------|--------|
| Phase 1: Desktop/My Work Restructure | ✅ Completed (previous session) |
| Phase 2.1: Job Intake Wizard Page | ✅ Completed |
| Phase 2.2: Account Onboarding Wizard Page | ✅ Completed |
| Phase 2.3: Create Job Page | ✅ Completed |
| Phase 2.4: Extend Offer Page | 🔲 Pending |
| Phase 2.5: Schedule Interview Page | 🔲 Pending |
| Phase 2.6: Terminate Placement Page | 🔲 Pending |
| Phase 2.7: Submit to Client Page | 🔲 Pending |
| Phases 3-7 | 🔲 Pending |

## Critical References

1. **Implementation Plan**: `thoughts/shared/plans/2025-12-07-guidewire-ui-architecture-transformation.md`
2. **Research Document**: `thoughts/shared/research/2025-12-07-guidewire-ui-architecture-comparison.md`

## Recent Changes

### New Files Created:

**Zustand Stores:**
- `src/stores/job-intake-store.ts` - Form state for 5-step job intake wizard
- `src/stores/account-onboarding-store.ts` - Form state for 6-step account onboarding
- `src/stores/create-job-store.ts` - Form state for 3-step create job wizard

**Job Intake Wizard Page:**
- `src/app/employee/recruiting/jobs/intake/layout.tsx`
- `src/app/employee/recruiting/jobs/intake/page.tsx`
- `src/components/recruiting/jobs/intake/IntakeStep1BasicInfo.tsx`
- `src/components/recruiting/jobs/intake/IntakeStep2Requirements.tsx`
- `src/components/recruiting/jobs/intake/IntakeStep3RoleDetails.tsx`
- `src/components/recruiting/jobs/intake/IntakeStep4Compensation.tsx`
- `src/components/recruiting/jobs/intake/IntakeStep5Interview.tsx`
- `src/components/recruiting/jobs/intake/index.ts`

**Account Onboarding Wizard Page:**
- `src/app/employee/recruiting/accounts/[id]/onboarding/layout.tsx`
- `src/app/employee/recruiting/accounts/[id]/onboarding/page.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep1Profile.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep2Contract.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep3Billing.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep4Contacts.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep5Categories.tsx`
- `src/components/recruiting/accounts/onboarding/OnboardingStep6Kickoff.tsx`
- `src/components/recruiting/accounts/onboarding/index.ts`

**Create Job Wizard Page:**
- `src/app/employee/recruiting/jobs/new/layout.tsx`
- `src/app/employee/recruiting/jobs/new/page.tsx`
- `src/components/recruiting/jobs/create/CreateJobStep1BasicInfo.tsx`
- `src/components/recruiting/jobs/create/CreateJobStep2Requirements.tsx`
- `src/components/recruiting/jobs/create/CreateJobStep3Compensation.tsx`
- `src/components/recruiting/jobs/create/index.ts`

### Files Modified:
- `src/components/lazy-dialogs.tsx` - Removed exports for migrated dialogs
- `src/components/recruiting/jobs/JobsListClient.tsx` - Changed dialog trigger to router.push()
- `src/components/recruiting/jobs/index.ts` - Removed CreateJobDialog export
- `src/components/navigation/AccountSectionSidebar.tsx` - Changed job quick action to navigate
- `src/app/employee/recruiting/accounts/[id]/page.tsx` - Removed dialog imports, use navigation

### Files Deleted:
- `src/components/recruiting/jobs/JobIntakeWizardDialog.tsx`
- `src/components/recruiting/jobs/CreateJobDialog.tsx`
- `src/components/recruiting/accounts/OnboardingWizardDialog.tsx`

## Learnings

1. **Pattern for Dialog-to-Page Conversion:**
   - Create Zustand store with `persist` middleware for form state
   - Use URL query param `?step=N` for step navigation
   - Create layout.tsx with simplified header (no sidebar)
   - Create step components that read/write to store
   - Main page orchestrates step rendering and validation
   - Update all trigger points (buttons, sidebar actions) to use `router.push()`

2. **TypeScript Type Casting for Mutations:**
   When form data has string types but mutations expect enums, use explicit casts:
   ```typescript
   companySize: (formData.companySize || undefined) as '1-50' | '51-200' | '201-500' | '501-1000' | '1000+' | undefined
   ```

3. **Property Name Mapping:**
   The `completeOnboarding` mutation has different property names than the store:
   - Store: `dbaName`, `postalCode` → Mutation: `dba`, `zipCode`
   - Always verify mutation input schema in `src/server/routers/` before building the mutation call

4. **Toast Variant:**
   Use `variant: 'error'` instead of `variant: 'destructive'` for error toasts

5. **Mutation Return Type:**
   For job creation, the mutation returns `{ jobId: string }`, not `{ id: string }`

## Artifacts

**Implementation Plan:**
- `thoughts/shared/plans/2025-12-07-guidewire-ui-architecture-transformation.md`

**New Zustand Stores:**
- `src/stores/job-intake-store.ts`
- `src/stores/account-onboarding-store.ts`
- `src/stores/create-job-store.ts`

**New Pages:**
- `/employee/recruiting/jobs/intake` - Job Intake Wizard
- `/employee/recruiting/accounts/[id]/onboarding` - Account Onboarding Wizard
- `/employee/recruiting/jobs/new` - Create Job Wizard

## Action Items & Next Steps

1. **Continue Phase 2 Wizard Conversions:**
   - 2.4 Extend Offer Page: Convert `ExtendOfferDialog` to `/employee/recruiting/submissions/[id]/extend-offer`
   - 2.5 Schedule Interview Page: Convert `ScheduleInterviewDialog` to `/employee/recruiting/submissions/[id]/schedule-interview`
   - 2.6 Terminate Placement Page: Convert `TerminatePlacementDialog` to `/employee/recruiting/placements/[id]/terminate`
   - 2.7 Submit to Client Page: Convert `SubmitToClientDialog` to `/employee/recruiting/submissions/[id]/submit-to-client`

2. **For Each Remaining Wizard:**
   - Create Zustand store in `src/stores/`
   - Create layout + page in appropriate App Router path
   - Create step components in `src/components/recruiting/[entity]/[wizard-name]/`
   - Update all trigger points to navigate
   - Remove old dialog from lazy-dialogs.tsx
   - Delete old dialog file
   - Update index.ts exports

3. **After Phase 2:**
   - Phase 3: Detail Dialogs to Inline Panels
   - Phase 4: Inline Editing Patterns
   - Phase 5: Job Detail Sections Toggle
   - Phase 6: Contact as Top-Level Entity
   - Phase 7: Remaining Dialog Conversions

## Other Notes

**Existing Dialog Locations (to convert):**
- `src/components/recruiting/offers/ExtendOfferDialog.tsx` (635 lines)
- `src/components/recruiting/interviews/ScheduleInterviewDialog.tsx` (611 lines)
- `src/components/recruiting/placements/TerminatePlacementDialog.tsx` (556 lines)
- `src/components/recruiting/submissions/SubmitToClientDialog.tsx` (460 lines)

**Key tRPC Router Files:**
- `src/server/routers/ats.ts` - Jobs, submissions, interviews, offers
- `src/server/routers/crm.ts` - Accounts, contacts, onboarding

**Design System Reference:**
- `.claude/rules/ui-design-system.md` - Color palette, typography, component patterns
- Use `bg-cream` for pages, `bg-white` for cards
- Use `hublot-900` (black) for primary actions
- Use `gold-500` (rose gold) for premium/accent actions
