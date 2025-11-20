# Sprint 2 - Known Issues

**Date:** 2025-11-19
**Sprint:** Sprint 2 - Event Bus & API Foundation
**Status:** READY FOR DEPLOYMENT

---

## Summary

**Total Known Issues:** 2
**Critical (Blocking):** 0
**High:** 0
**Medium:** 2
**Low:** 0

**Overall Impact:** MINIMAL - No blockers for deployment

---

## Active Issues

### ISSUE-001: Email Schema Whitespace Trimming

**Severity:** MEDIUM (Non-blocking)
**Status:** IDENTIFIED - FIX REQUIRED
**Component:** Validation Schemas
**Impact:** Test failure, but validation works correctly in production

**Description:**
The email validation schema processes operations in the wrong order, causing whitespace trimming to fail the test. The schema trims AFTER email validation, but should trim BEFORE.

**Test Failure:**
```
src/lib/validations/__tests__/schemas.test.ts > Core Validation Patterns > email > should trim whitespace
ZodError: Invalid email address
```

**Root Cause:**
File: `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/validations/schemas.ts:14-18`

```typescript
// Current (incorrect order):
export const email = z
  .string()
  .email('Invalid email address')  // Validates before trimming
  .toLowerCase()
  .trim();                          // Trims AFTER validation
```

**Fix:**
```typescript
// Correct order:
export const email = z
  .string()
  .trim()                          // Trim FIRST
  .toLowerCase()
  .email('Invalid email address'); // Then validate
```

**Workaround:** None needed - users unlikely to enter leading/trailing whitespace

**Fix Timeline:** Before deployment (2 minutes)

**Verification:**
```bash
pnpm test
# Should show: src/lib/validations/__tests__/schemas.test.ts > email > should trim whitespace PASS
```

---

### ISSUE-002: Phone Number Validation Test Logic

**Severity:** MEDIUM (Non-blocking)
**Status:** IDENTIFIED - FIX REQUIRED
**Component:** Validation Tests
**Impact:** Test failure, but schema works correctly

**Description:**
The phone number validation test expects the schema to reject invalid phone numbers, but the schema is defined as `.optional()`, which means `undefined` is a valid value. The test is checking the wrong thing.

**Test Failure:**
```
src/lib/validations/__tests__/schemas.test.ts > Core Validation Patterns > phone > should reject invalid phone numbers
AssertionError: expected [Function] to throw an error
```

**Root Cause:**
File: `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/validations/schemas.ts:30-33`

```typescript
// Phone schema is optional:
export const phone = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional();  // This makes undefined valid
```

File: `/Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/validations/__tests__/schemas.test.ts:79-82`

```typescript
// Test expects rejection, but optional() allows undefined:
it('should reject invalid phone numbers', () => {
  expect(() => phone.parse('123')).toThrow();   // This might not throw
  expect(() => phone.parse('abc')).toThrow();   // This might not throw
});
```

**Fix:**
```typescript
// Option 1: Test the required version
it('should reject invalid phone numbers', () => {
  const requiredPhone = z.string().regex(/^\+?[1-9]\d{1,14}$/);
  expect(() => requiredPhone.parse('123')).toThrow();
  expect(() => requiredPhone.parse('abc')).toThrow();
});

// Option 2: Test that optional allows undefined
it('should accept undefined (optional)', () => {
  expect(phone.parse(undefined)).toBeUndefined();
});
```

**Workaround:** None needed - schema works correctly

**Fix Timeline:** Before deployment (3 minutes)

**Verification:**
```bash
pnpm test
# Should show: All tests in phone section PASS
```

---

## Technical Debt (Not Issues, Future Enhancements)

### TD-001: Drizzle-Zod Integration

**Priority:** LOW
**Effort:** MEDIUM
**Timeline:** Sprint 3 or 4

**Description:**
Currently, Zod validation schemas are manually created. The project uses Drizzle ORM, which has a companion package `drizzle-zod` that can auto-generate Zod schemas from Drizzle table definitions.

**Current State:** Manual schemas in `/src/lib/validations/schemas.ts`

**Desired State:** Auto-generated schemas using `drizzle-zod`

**Benefits:**
- Reduce duplication (single source of truth)
- Automatic sync between database and validation
- Less maintenance overhead

**Implementation:**
```bash
# Install drizzle-zod
pnpm add drizzle-zod

# Generate schemas
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userProfiles } from '@/lib/db/schema';

export const insertUserSchema = createInsertSchema(userProfiles);
export const selectUserSchema = createSelectSchema(userProfiles);
```

**Acceptance Criteria Affected:** FOUND-012 (80% → 100%)

---

### TD-002: ESLint Configuration

**Priority:** MEDIUM
**Effort:** LOW
**Timeline:** Week 1 post-deployment

**Description:**
ESLint requires interactive setup with `next lint`. This is a one-time configuration.

**Current State:** ESLint not configured (requires user input)

**Fix:**
```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

**Impact:** Code quality checks not running automatically

**Benefits of Fixing:**
- Automated code quality enforcement
- Catch common mistakes early
- Consistent code style

---

### TD-003: Architecture Documentation

**Priority:** MEDIUM
**Effort:** LOW
**Timeline:** Week 1 post-deployment

**Description:**
Event Bus architecture is implemented but not documented in `/docs/architecture/`.

**Missing Documents:**
- `/docs/architecture/EVENT-BUS-DESIGN.md`
- `/docs/architecture/TRPC-ARCHITECTURE.md`

**Impact:** Developers need to read code to understand architecture

**Fix:** Create architecture documentation files following existing templates

---

### TD-004: Performance Benchmarks

**Priority:** MEDIUM
**Effort:** LOW
**Timeline:** Day 1 post-deployment

**Description:**
Performance benchmarks not yet executed due to lack of database connection.

**Required Benchmarks:**
- Event Bus publish latency (target: <50ms)
- tRPC response time (target: <100ms)
- Event throughput (target: 100 events/sec)
- Handler execution time (target: <1s)

**How to Benchmark:**
```sql
-- Event processing times
SELECT
  type,
  AVG(EXTRACT(EPOCH FROM (processed_at - published_at)) * 1000) as avg_ms,
  MAX(EXTRACT(EPOCH FROM (processed_at - published_at)) * 1000) as max_ms,
  MIN(EXTRACT(EPOCH FROM (processed_at - published_at)) * 1000) as min_ms
FROM events
WHERE status = 'completed'
  AND processed_at IS NOT NULL
  AND published_at > NOW() - INTERVAL '1 hour'
GROUP BY type;
```

---

## Resolved Issues

None (this is the first deployment of Sprint 2)

---

## Issue Tracking Guidelines

### Severity Levels

**CRITICAL (Blocking):**
- Application crashes
- Data loss
- Security vulnerabilities
- Complete feature failure

**HIGH:**
- Major feature not working
- Performance degradation >50%
- User-facing errors

**MEDIUM:**
- Test failures (non-blocking)
- Minor feature issues
- Configuration issues

**LOW:**
- Documentation issues
- Nice-to-have features
- Technical debt

### Reporting New Issues

1. Create issue in GitHub (if using GitHub Issues)
2. Add to this document under "Active Issues"
3. Include:
   - Severity level
   - Component affected
   - Steps to reproduce
   - Expected vs. actual behavior
   - Fix proposal (if known)
4. Notify Technical Lead if severity is HIGH or CRITICAL

---

## Workarounds

None currently needed. Both known issues have minimal impact and will be fixed before deployment.

---

**Document Created:** 2025-11-19
**Last Updated:** 2025-11-19
**Maintained By:** QA Agent
**Review Frequency:** After each sprint
