# Implement: EPIC-01 - Foundation & Core Platform

## 📋 Specification
- **File:** docs/planning/epics/epic-01-foundation.md
- **Type:** Epic
- **Business Pillar:** Foundation (Core Infrastructure)
- **Pod Impact:** Enables 2-person pods to hit 2 placements/sprint target

## 🎯 Objectives

Establish unified technical foundation for all business pillars

**Business Value:** Enables all other epics; prevents technical debt from legacy mistakes; ensures scalability to 10× growth

**Success Metrics:**
- Zero duplicate user systems (1 table vs legacy's 3 tables)
- 100% RLS coverage on all tables
- 80%+ test coverage on critical paths
- Sub-2s page load times (Lighthouse Performance 90+)
- Event bus handling 1000+ events/day by Week 4

## 🏗️ Architecture Alignment

### Unified Schema
**Database Tables:** core

### Event-Driven Integration
**Events to Emit:**
- Review epic file for event requirements

**Events to Subscribe:**
- None identified (check dependencies)

### Cross-Pollination Opportunities
- Review epic file for cross-pillar integration points
- Consider: How does this create leads for other pillars?

### Multi-Role Support
**User Personas:**
- See epic file

## ✅ Quality Standards

### Code Quality
- **TypeScript:** Strict mode, no `any` types
- **Testing:** 80%+ coverage (unit + integration + E2E)
- **Performance:** <3s page load, <200ms API response
- **Accessibility:** WCAG 2.1 AA compliance

### Security
- **RLS Policies:** Required on ALL tables
- **Input Validation:** Zod schemas for all inputs
- **Authentication:** Supabase Auth with proper role checks
- **Audit Trails:** created_by, updated_by, deleted_at on sensitive tables

### Architecture
- **Server Components:** Default (use "use client" only when necessary)
- **API Pattern:** Server Actions + Zod validation
- **Error Handling:** Type-safe responses (discriminated unions)
- **Database:** Drizzle ORM with type-safe queries

## 🚀 Execution Plan

### Phase 1: Planning & Design (PM + Architect)
Use `/start-planning` to:
1. **PM Agent** - Validate requirements and clarify ambiguities
2. **Architect** - Design unified schema and API contracts
3. **CFO Review** - Validate business value and cost estimates
4. **Security Audit** - Review RLS policies and auth flows

### Phase 2: Implementation (Developer + QA)
Use `/feature epic-01` workflow:
1. **Database Architect** - Create migrations with RLS policies
2. **API Developer** - Implement server actions with Zod validation
3. **Frontend Developer** - Build UI with shadcn/ui components
4. **QA Engineer** - Write tests (unit + integration + E2E)

### Phase 3: Verification (QA + Security)
1. **QA Engineer** - Run comprehensive test suite
2. **Security Auditor** - Verify RLS, auth, input validation
3. **Performance Check** - Lighthouse audit, load testing

### Phase 4: Deployment
Use `/deploy` workflow:
1. **Deployment Specialist** - Deploy to staging
2. **Smoke Tests** - Verify critical paths
3. **Production Deploy** - Ship with monitoring

## 📊 Success Criteria

- [ ] All acceptance criteria met (from epic file)
- [ ] Tests passing with 80%+ coverage
- [ ] TypeScript compilation with no errors
- [ ] All quality gates passed (pre-commit hooks)
- [ ] RLS policies verified and tested
- [ ] API documentation updated
- [ ] E2E flows tested and working
- [ ] Performance benchmarks met (<3s page load)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Cross-pollination opportunities identified and documented
- [ ] Event bus integration working (emit/subscribe verified)
- [ ] Deployed to staging successfully

## 🎬 Start Implementation

**Recommended Approach:**
```bash
# Step 1: Start planning phase
/start-planning

# Step 2: After planning approved, run full feature workflow
/feature epic-01
```

**Or manual agent orchestration:**
1. Gather requirements with PM Agent
2. Design schema with Database Architect
3. Review strategy with CEO/CFO Advisors
4. Implement with Developer agents
5. Test with QA Engineer
6. Audit security with Security Auditor
7. Deploy with Deployment Specialist

## 📁 Key Files to Reference

- **Epic Spec:** `docs/planning/epics/epic-01-foundation.md`
- **Architecture:** `docs/audit/project-setup-architecture.md`
- **Code Conventions:** `CLAUDE.md`
- **Database Schema:** `docs/architecture/database-schema.md`
- **Agent Workflows:** `.claude/commands/workflows/`

## 💡 Additional Context

**Key Features (Top 5):**
1. Unified authentication system (Supabase Auth + RLS policies)
2. Single user management system (user_profiles table with multi-role support)
3. Event bus infrastructure (cross-module communication without tight coupling)
4. Core UI component library (shadcn/ui, Tailwind, consistent design system)
5. Database schema with audit trails (created_by, updated_by, soft deletes)

**Dependencies:**
- **Requires:** None (foundation)
- **Enables:** ALL other epics (Academy, Recruiting, HR, etc.)
- **Blocks:** Nothing (can be built in parallel with planning for other epics)

**Effort Estimate:** 4 weeks, ~15 stories
**Timeline:** Week 1-4 (Foundation Phase)

---

**Ready to begin? Start with `/start-planning` to initiate the full agent workflow! 🚀**