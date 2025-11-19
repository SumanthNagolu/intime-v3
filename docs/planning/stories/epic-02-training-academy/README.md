# Epic 2: Training Academy (LMS) - User Stories

**Epic Duration:** 6 weeks (Week 5-10)
**Total Stories:** 30 stories
**Total Story Points:** 112 points
**Sprint Breakdown:** 5 sprints (6 stories per sprint, ~2 weeks each)

---

## Sprint 1: Course Foundation (Week 5-6, 23 points)

### Database & Course Structure
- [ACAD-001](./ACAD-001-course-tables.md) - Create courses and curriculum tables (5 points)
- [ACAD-002](./ACAD-002-enrollment-system.md) - Implement enrollment and student tracking (5 points)
- [ACAD-003](./ACAD-003-progress-tracking.md) - Create progress tracking system (XP, completions) (5 points)

### Content Management
- [ACAD-004](./ACAD-004-content-upload.md) - Build content upload and management system (3 points)
- [ACAD-005](./ACAD-005-course-admin-ui.md) - Create course admin portal (CRUD courses) (3 points)
- [ACAD-006](./ACAD-006-prerequisites.md) - Implement prerequisites and sequencing (2 points)

**Sprint 1 Total:** 23 points

---

## Sprint 2: Learning Content (Week 7-8, 21 points)

### Video & Interactive Learning
- [ACAD-007](./ACAD-007-video-player.md) - Implement video player with progress tracking (5 points)
- [ACAD-008](./ACAD-008-lab-environments.md) - Create lab environment provisioning system (8 points)
- [ACAD-009](./ACAD-009-reading-materials.md) - Build reading materials system (markdown/PDF) (2 points)

### Assessments
- [ACAD-010](./ACAD-010-quiz-builder.md) - Create quiz builder and question bank (3 points)
- [ACAD-011](./ACAD-011-quiz-engine.md) - Implement quiz engine (attempts, scoring, retakes) (3 points)
- [ACAD-012](./ACAD-012-capstone-projects.md) - Build capstone project submission system (GitHub integration) (3 points)

**Sprint 2 Total:** 24 points (adjusted)

---

## Sprint 3: AI Mentor & Gamification (Week 9-10, 22 points)

### AI-Powered Learning
- [ACAD-013](./ACAD-013-ai-mentor.md) - Integrate AI mentor with Socratic method (8 points)
- [ACAD-014](./ACAD-014-escalation-logic.md) - Implement AI → human trainer escalation (3 points)
- [ACAD-015](./ACAD-015-ai-analytics.md) - Create AI mentor analytics dashboard (2 points)

### Gamification
- [ACAD-016](./ACAD-016-achievement-system.md) - Build achievement and badge system (5 points)
- [ACAD-017](./ACAD-017-leaderboards.md) - Create leaderboards (XP rankings, cohorts) (2 points)
- [ACAD-018](./ACAD-018-xp-transactions.md) - Implement XP transaction system (2 points)

**Sprint 3 Total:** 22 points

---

## Sprint 4: Student Experience (Week 11-12, 24 points)

### Student Portal
- [ACAD-019](./ACAD-019-student-dashboard.md) - Build student dashboard (progress, next steps) (5 points)
- [ACAD-020](./ACAD-020-ai-chat-interface.md) - Create AI mentor chat interface (5 points)
- [ACAD-021](./ACAD-021-course-navigation.md) - Implement course navigation and curriculum view (3 points)

### Completion & Certification
- [ACAD-022](./ACAD-022-graduation-workflow.md) - Create graduation workflow (event-driven) (5 points)
- [ACAD-023](./ACAD-023-certificate-generation.md) - Build certificate generation (PDF, LinkedIn) (3 points)
- [ACAD-024](./ACAD-024-enrollment-flow.md) - Implement enrollment and onboarding flow (3 points)

**Sprint 4 Total:** 24 points

---

## Sprint 5: Trainer Tools & Payments (Week 13-14, 23 points)

### Trainer Portal
- [ACAD-025](./ACAD-025-trainer-dashboard.md) - Build trainer dashboard (grading queue, analytics) (5 points)
- [ACAD-026](./ACAD-026-grading-system.md) - Create project grading and review system (5 points)
- [ACAD-027](./ACAD-027-at-risk-alerts.md) - Implement at-risk student detection (3 points)

### Payment & Revenue
- [ACAD-028](./ACAD-028-stripe-integration.md) - Integrate Stripe payment processing (5 points)
- [ACAD-029](./ACAD-029-pricing-tiers.md) - Implement pricing tiers (per-course, all-access) (3 points)
- [ACAD-030](./ACAD-030-revenue-analytics.md) - Create revenue analytics dashboard (2 points)

**Sprint 5 Total:** 23 points

---

## Story Point Reference

- **1-2 points:** Simple task, < 4 hours
- **3-5 points:** Moderate complexity, 4-12 hours
- **8 points:** Complex, requires research, 12-20 hours
- **13+ points:** Too large, needs breakdown

---

## Dependencies

### From Epic 1 (Foundation)
All Epic 2 stories depend on:
- FOUND-001: user_profiles table (student enrollment data)
- FOUND-002: RBAC system (student/trainer/admin roles)
- FOUND-007: Event bus (graduation events)
- FOUND-010: tRPC setup (API infrastructure)

### Internal Dependencies
- Sprint 1 (Course Foundation) must complete before Sprint 2
- ACAD-001 (Course tables) blocks all content-related stories
- ACAD-013 (AI Mentor) required before ACAD-020 (Chat interface)
- ACAD-022 (Graduation) required before ACAD-023 (Certificates)

---

## Definition of Done (All Stories)

- [ ] Code written and reviewed
- [ ] Unit tests written (80%+ coverage)
- [ ] Integration tests pass
- [ ] TypeScript compiles with no errors
- [ ] ESLint passes with no errors
- [ ] Documentation updated
- [ ] Event integrations tested (where applicable)
- [ ] Dependencies from Epic 1 verified
- [ ] Merged to main branch

---

## Success Metrics (Epic 2)

**Technical Metrics:**
- Course creation time: < 2 hours for new course
- Video playback latency: < 2 seconds
- AI mentor response time: < 3 seconds
- Quiz grading: Instant (auto-graded)
- System uptime: 99.5%+

**Business Metrics:**
- Student enrollment: 20 students/month (Month 1)
- Completion rate: 70%+ (target)
- AI mentor accuracy: 95%+ helpful responses
- Student satisfaction: 4.5+ stars
- Time to graduation: 8 weeks average

---

## Related Documentation

- [Epic 2 Canvas](../../epics/epic-02-training-academy.md)
- [Epic 1 Stories](../epic-01-foundation/README.md)
- [Database Schema](../../../architecture/DATABASE-SCHEMA.md)
- [Event-Driven Integration](../../../architecture/EVENT-DRIVEN-INTEGRATION.md)
- [AI Integration Patterns](../../../architecture/AI-INTEGRATION.md)

---

## Event Integrations

Epic 2 publishes the following events:

**Student Lifecycle:**
- `academy.student_enrolled` → Notify trainer, welcome email
- `academy.module_completed` → Update progress, award XP
- `academy.course_graduated` → Create candidate profile (Epic 3), certificate

**Learning Activity:**
- `academy.quiz_passed` → Unlock next module, award XP
- `academy.quiz_failed` → Trigger at-risk alert (3+ failures)
- `academy.lab_completed` → Update progress, award XP
- `academy.capstone_submitted` → Notify trainer for review

**AI Mentor:**
- `academy.ai_escalated` → Notify human trainer
- `academy.ai_feedback_negative` → Log for AI improvement

---

**Next Epic:** [Epic 3: Recruiting Services](../epic-03-recruiting-services/README.md)
