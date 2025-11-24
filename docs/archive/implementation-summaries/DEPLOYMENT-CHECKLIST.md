# Critical Fixes Deployment Checklist

**Date:** 2025-11-21
**Deployment Type:** Database Migrations (Critical Bug Fixes)
**Risk Level:** 🟢 **LOW** (Additive changes only, zero downtime)

---

## Pre-Deployment

### 1. Verify Migration Files

```bash
# Check all 4 new migration files exist
ls -la supabase/migrations/202511211*.sql

# Expected output:
# 20251121180000_create_student_interventions.sql
# 20251121190000_create_quiz_functions.sql
# 20251121200000_create_onboarding_checklist.sql
# 20251121210000_fix_rls_policies.sql
```

✅ **All 4 files should be present**

### 2. Review Changes

```bash
# View what will be applied
head -20 supabase/migrations/20251121180000_create_student_interventions.sql
head -20 supabase/migrations/20251121190000_create_quiz_functions.sql
head -20 supabase/migrations/20251121200000_create_onboarding_checklist.sql
head -20 supabase/migrations/20251121210000_fix_rls_policies.sql
```

✅ **All files should have proper headers and comments**

### 3. Backup Current Database (IMPORTANT!)

```bash
# Create backup before applying migrations
supabase db dump -f backup-before-critical-fixes-$(date +%Y%m%d).sql

# Verify backup was created
ls -lh backup-before-critical-fixes-*.sql
```

✅ **Backup file should exist and have size > 0**

---

## Deployment (Development Environment)

### 4. Apply Migrations

```bash
# Method 1: Full reset (recommended for dev)
supabase db reset

# Method 2: Apply new migrations only
supabase db push
```

Expected output:
```
Applying migration 20251121180000_create_student_interventions.sql...
Applying migration 20251121190000_create_quiz_functions.sql...
Applying migration 20251121200000_create_onboarding_checklist.sql...
Applying migration 20251121210000_fix_rls_policies.sql...
✅ All migrations applied successfully
```

✅ **No errors in migration application**

### 5. Verify Schema Changes

```bash
# Connect to database
supabase db shell

# Run verification queries
```

```sql
-- 1. Verify student_interventions table exists
\d student_interventions;
-- Should show table with 15+ columns

-- 2. Verify is_at_risk columns added
\d student_enrollments;
-- Should show: is_at_risk, at_risk_since, risk_level, risk_reasons

-- 3. Count quiz functions
SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%quiz%';
-- Should return at least 13

-- 4. Verify onboarding_checklist table
\d onboarding_checklist;
-- Should show table with 20+ columns

-- 5. Verify has_role function
SELECT has_role('00000000-0000-0000-0000-000000000000'::UUID, ARRAY['admin']);
-- Should return TRUE or FALSE (not error)

-- 6. Verify RLS policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%Admins%'
ORDER BY tablename, policyname;
-- Should show many policies with "Admins" in the name
```

✅ **All verification queries should succeed**

---

## Testing (Development Environment)

### 6. Test At-Risk Student Detection

```bash
# Run test script
npm run test:integration -- --grep "at-risk"
```

**Manual Test:**
1. Navigate to trainer dashboard
2. View "At-Risk Students" widget
3. Create a test intervention
4. Verify email notification queued

✅ **At-risk detection working**

### 7. Test Quiz System

```bash
# Run quiz tests
npm run test:integration -- --grep "quiz"
```

**Manual Test:**
1. Login as admin/trainer
2. Create a new quiz question
3. Login as student
4. Take the quiz
5. Verify grading and XP award

✅ **Quiz system fully functional**

### 8. Test Onboarding Checklist

**Manual Test:**
1. Create new student account
2. Check onboarding_checklist table for new row
3. Enroll in course → Verify "enrolled_first_course" checked
4. Watch video → Verify "watched_first_video" checked
5. Complete quiz → Verify "completed_first_quiz" checked

✅ **Onboarding milestones auto-detected**

### 9. Test RLS Policies

**Manual Test (CRITICAL):**
1. Login as **student**
2. Try to view other students' data → Should **FAIL**
3. Try to edit quiz questions → Should **FAIL**
4. View own progress → Should **SUCCEED**

5. Login as **trainer**
6. View student progress → Should **SUCCEED**
7. Edit quiz questions → Should **SUCCEED**
8. Edit pricing plans → Should **FAIL**

9. Login as **admin**
10. All operations → Should **SUCCEED**

✅ **RLS policies properly enforced**

---

## Performance Verification

### 10. Check Query Performance

```sql
-- Test at-risk student query performance
EXPLAIN ANALYZE
SELECT * FROM student_enrollments
WHERE is_at_risk = TRUE;
-- Should use idx_student_enrollments_at_risk

-- Test quiz question query performance
EXPLAIN ANALYZE
SELECT * FROM get_question_bank(NULL, NULL, NULL, NULL, TRUE, NULL);
-- Should complete in < 100ms

-- Test onboarding query performance
EXPLAIN ANALYZE
SELECT * FROM get_onboarding_progress('00000000-0000-0000-0000-000000000000'::UUID);
-- Should complete in < 50ms
```

✅ **All queries use indexes and complete quickly**

---

## Rollback Plan (If Needed)

### 11. Emergency Rollback

**Only if critical issues are discovered:**

```bash
# Restore from backup
supabase db restore backup-before-critical-fixes-YYYYMMDD.sql
```

**OR**

```sql
-- Selective rollback (not recommended)
-- Undo in reverse order

-- 4. Remove fixed RLS policies
DROP FUNCTION IF EXISTS has_role(UUID, TEXT[]);
-- Drop new policies (too many to list - restore from backup recommended)

-- 3. Remove onboarding checklist
DROP TABLE IF EXISTS onboarding_checklist CASCADE;

-- 2. Remove quiz functions
DROP FUNCTION IF EXISTS create_quiz_question CASCADE;
-- ... (drop all 13 functions)

-- 1. Remove interventions
DROP TABLE IF EXISTS student_interventions CASCADE;
ALTER TABLE student_enrollments
  DROP COLUMN IF EXISTS is_at_risk,
  DROP COLUMN IF EXISTS at_risk_since,
  DROP COLUMN IF EXISTS risk_level,
  DROP COLUMN IF EXISTS risk_reasons;
```

⚠️ **Rollback should NOT be needed if testing passed**

---

## Production Deployment

### 12. Pre-Production Checklist

- [ ] All dev tests passed
- [ ] Performance verified
- [ ] Security audit passed (RLS policies)
- [ ] Staging deployment successful
- [ ] QA sign-off received
- [ ] Backup created
- [ ] Rollback plan reviewed
- [ ] Deployment window scheduled
- [ ] Stakeholders notified

### 13. Production Migration

```bash
# Set production environment
export SUPABASE_DB_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Apply migrations
supabase db push --db-url $SUPABASE_DB_URL

# Verify
supabase db shell --db-url $SUPABASE_DB_URL
```

### 14. Post-Deployment Monitoring

**Monitor for 24 hours:**
- [ ] Error logs (no new errors)
- [ ] Query performance (no degradation)
- [ ] User reports (no complaints)
- [ ] At-risk detection (working correctly)
- [ ] Quiz submissions (grading correctly)
- [ ] RLS policies (no unauthorized access)

---

## Success Criteria

✅ **Deployment is successful if:**

1. All 4 migrations applied without errors
2. Schema verification queries pass
3. At-risk student detection works
4. Quiz system fully functional
5. Onboarding tracking works
6. RLS policies properly enforced
7. No performance degradation
8. No new error logs
9. All tests passing
10. Zero production incidents

---

## Contact Information

**For Issues During Deployment:**
- Check logs: `supabase db logs`
- Review errors: Check Sentry/error tracking
- Rollback if needed: Use backup restore
- Report critical issues: Immediately escalate

---

## Sign-Off

**Developer:** ___________________ Date: ___________

**QA Lead:** ___________________ Date: ___________

**DevOps:** ___________________ Date: ___________

**Approval:** ___________________ Date: ___________

---

**Deployment Status:** 🟡 **PENDING**

Update after completion:
- [ ] ✅ SUCCESS - No issues
- [ ] ⚠️ SUCCESS - Minor issues (documented below)
- [ ] ❌ FAILED - Rolled back (incident report attached)

**Notes:**
_________________________________________________
_________________________________________________
_________________________________________________
