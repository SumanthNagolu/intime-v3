# Phase 4 UI Completion - Issue Template

**Copy this content to create a GitHub issue**

---

## Title: Phase 4: Complete UI Migration and Launch Preparation

## Labels: enhancement, phase-4, ui, priority-high

## Description

### Summary

Phase 4 screen migration is **90% complete**. The metadata-driven UI framework is in place with 100+ screen definitions and all pages using ScreenRenderer or specialized renderers. This issue tracks the remaining work to achieve production readiness.

### Current State (December 3, 2025)

**What's Complete:**
- ✅ 127 screen definitions created across all modules
- ✅ All pages migrated to ScreenRenderer pattern (no old workspace components)
- ✅ 11 specialized renderers for domain-specific needs
- ✅ 20+ dashboard widgets registered
- ✅ Navigation system with role-based routing
- ✅ Form system with comprehensive field definitions
- ✅ Portal screens for clients, talent, and academy
- ✅ TypeScript compilation passes with zero errors
- ✅ Legacy files cleaned up (321 deleted, 116 new files added)

**What Needs Attention:**

### 1. Widget Placeholders (4 widgets)
These widgets use temporary implementations:
- [ ] `PlacementCardList` - currently uses AlertList placeholder
- [ ] `ImmigrationAlertsDashboard` - currently uses AlertList placeholder
- [ ] `MarketingActivityWidget` - currently uses SprintProgressWidget placeholder
- [ ] `RevenueCommissionWidget` - currently uses SprintProgressWidget placeholder

**Location**: `src/lib/metadata/widgets/dashboard/index.ts:81-85`

### 2. Custom Components Verification
Some screen definitions reference custom components that need implementation verification:
- [ ] `DocumentRepository`
- [ ] `LearningAdminPanel`
- [ ] `HRAnalyticsDashboard`
- [ ] `RecruitmentWorkflow`
- [ ] `ResumeViewer`
- [ ] `InterviewerList`
- [ ] `WorkHistoryTimeline`
- [ ] `FieldMappingEditor`
- [ ] `WebhookEventSelector`
- [ ] `DuplicateMergePreview`
- [ ] `BusinessHoursEditor`
- [ ] `PermissionsMatrix`
- [ ] `CheckInProgressTracker`
- [ ] `IntegrationCategoryGrid`

### 3. tRPC Procedure Verification
Ensure all referenced procedures exist and return expected data:
- [ ] `dashboard.getSprintProgress`
- [ ] `dashboard.getTasks`
- [ ] `activities.list`
- [ ] All CRM procedures (accounts, leads, deals, contacts)
- [ ] All ATS procedures (jobs, candidates, submissions)
- [ ] All Bench procedures (consultants, vendors, placements)

### 4. Testing Coverage
- [ ] Unit tests for screen definitions
- [ ] Integration tests for renderers
- [ ] E2E tests for all user flows (Phase 4 Window 7-8)
- [ ] Target: >80% coverage

### 5. Performance Optimization
- [ ] Verify lazy loading works for all screen registries
- [ ] Check bundle sizes
- [ ] Run Lighthouse audit (target: >80)

## Acceptance Criteria

1. All 4 placeholder widgets replaced with actual implementations
2. All referenced custom components verified/implemented
3. All tRPC procedures return correct data
4. `pnpm build` succeeds
5. `pnpm test` passes
6. Manual testing of all user flows complete
7. Performance benchmarks met

## Related Files

- Phase 4 Index: `docs/specs/PROMPTS/phase4/00-INDEX.md`
- Final Cleanup Spec: `docs/specs/PROMPTS/phase4/06-final-cleanup.md`
- Screen Registry: `src/screens/index.ts`
- Widget Registry: `src/lib/metadata/widgets/dashboard/index.ts`

## Estimated Effort

| Task | Time |
|------|------|
| Widget implementations | 1 day |
| Component verification | 0.5 days |
| tRPC verification | 0.5 days |
| Testing | 2-3 days |
| Performance tuning | 0.5 days |
| **Total** | **4-5 days** |
