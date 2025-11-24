---
description: Run comprehensive testing and quality assurance
---

I'll route this through our QA Agent for comprehensive quality verification.

**Testing Workflow**:

The QA Agent will:

1. **Read Implementation Context**:
   - `implementation-log.md` (what was built)
   - `requirements.md` (acceptance criteria to verify)
   - `architecture.md` (technical design)

2. **Run Automated Tests**:
   - TypeScript compilation
   - ESLint validation
   - Unit tests
   - Integration tests
   - E2E tests (Playwright)
   - Production build

3. **Write Additional Tests**:
   - E2E tests for critical flows
   - Edge case coverage
   - Accessibility tests

4. **Manual Quality Checks**:
   - Verify all acceptance criteria
   - Test edge cases
   - Check keyboard navigation
   - Test screen reader compatibility
   - Verify mobile responsiveness
   - Check browser compatibility

5. **Security Verification**:
   - RLS policy enforcement
   - Input validation
   - Authentication requirements
   - Authorization checks

6. **Performance Testing**:
   - Page load times (<2s target)
   - Database query performance (<100ms target)
   - Bundle size analysis
   - Lighthouse audit

**Output**: `test-report.md` with comprehensive quality assessment

Let me spawn the QA Agent to begin testing...
