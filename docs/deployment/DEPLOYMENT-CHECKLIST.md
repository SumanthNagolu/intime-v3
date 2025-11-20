# Sprint 5 Deployment Checklist

**Use this as your step-by-step guide on deployment day**

---

## Pre-Deployment Phase (Complete Before Deployment Day)

### Task 1: Fix Test Execution
- [ ] Create Anthropic SDK mock in test setup
- [ ] Create OpenAI SDK mock in test setup
- [ ] Update `/src/lib/testing/setup.ts`
- [ ] Run `pnpm test` - verify all tests pass
- [ ] Run `pnpm test -- --coverage` - verify >80% coverage on Sprint 5 code
- [ ] Review test output for any failures
- [ ] Commit and push test fixes

**Time:** 4 hours
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

### Task 2: Complete ESLint Setup
- [ ] Run `pnpm next lint`
- [ ] Select "Strict (recommended)"
- [ ] Run `pnpm next lint --fix` to auto-fix issues
- [ ] Review any remaining linting errors
- [ ] Commit `.eslintrc.json`

**Time:** 15 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

### Task 3: Verify Environment Variables
- [ ] Test OpenAI API key locally
- [ ] Test Anthropic API key locally
- [ ] Test Helicone API key locally
- [ ] Test Supabase connection locally
- [ ] Verify all keys in Vercel dashboard
- [ ] Configure Helicone budget alert (<$10/day)
- [ ] Test Slack webhook (optional)

**Time:** 1 hour
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

### Task 4: Pre-Deployment Verification
- [ ] All tests passing
- [ ] Coverage >80% on Sprint 5 code
- [ ] ESLint configured
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
- [ ] Production build succeeds: `pnpm build`
- [ ] Git status clean
- [ ] On latest main branch

**Time:** 15 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

## Deployment Day Checklist

### Step 0: Final Pre-Flight Check
- [ ] All pre-deployment tasks complete (above)
- [ ] Team notified of deployment window
- [ ] Slack #engineering-alerts ready for updates
- [ ] Backup plan reviewed
- [ ] Rollback procedure reviewed

**Time:** 5 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

### Step 1: Database Staging Test
- [ ] Connect to staging database (if available)
- [ ] Apply migration 021
- [ ] Verify 4 tables created
- [ ] Verify 3 functions created
- [ ] Verify indexes created
- [ ] Check `v_sprint_5_status` view
- [ ] Document any issues

**Time:** 15 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Notes:**
```
Staging DB results:
- Tables: ___/4 created
- Functions: ___/3 created
- Indexes: ___/2 created
- Issues: _______________
```

---

### Step 2: Production Database Backup
- [ ] Go to Supabase Dashboard → Database → Backups
- [ ] Click "Create Backup"
- [ ] Name: `pre-sprint-5-deployment-2025-11-20`
- [ ] Wait for completion
- [ ] Verify backup status: "Completed"
- [ ] Document backup name

**Time:** 5 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Backup Name:** ___________________________

---

### Step 3: Apply Production Migration
- [ ] Go to Supabase Dashboard → SQL Editor
- [ ] Open `021_add_sprint_5_features.sql`
- [ ] Review SQL (verify org_id, RLS policies)
- [ ] Click "Run"
- [ ] Wait for completion (30-60 seconds)
- [ ] Verify tables: `SELECT * FROM generated_resumes LIMIT 1;`
- [ ] Verify functions: `SELECT search_candidates('[]'::jsonb, 0.7, 10);`
- [ ] Check migration status: `SELECT * FROM v_sprint_5_status;`

**Time:** 10 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Migration Status:** ⬜ SUCCESS | ⬜ FAILED
**If Failed:** Stop deployment, restore backup, investigate

---

### Step 4: Create Storage Bucket
- [ ] Go to Supabase Dashboard → Storage
- [ ] Click "New Bucket"
- [ ] Name: `generated-resumes`
- [ ] Privacy: Private
- [ ] File size limit: 5MB
- [ ] Allowed MIME types: PDF, DOCX, TXT
- [ ] Create bucket
- [ ] Test upload
- [ ] Test download
- [ ] Delete test file

**Time:** 15 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

### Step 5: RAG Indexing
**⚠️ WARNING: Script may not exist - verify first**

- [ ] Check if script exists: `ls scripts/index-rag-collections.ts`
- [ ] If exists: Run `node scripts/index-rag-collections.ts`
- [ ] If not exists: **DECISION REQUIRED**
  - [ ] Option A: Create script (adds 2 hours)
  - [ ] Option B: Deploy without RAG (reduces quality)
  - [ ] Option C: Index manually (tedious)
- [ ] Verify chunks: `SELECT COUNT(*) FROM rag_chunks;`
- [ ] Test RAG search: `SELECT * FROM search_rag_chunks('Java', 5);`

**Time:** 1 hour (if script exists)
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE | ⚠️ SKIPPED

**Decision if Script Missing:** ___________________________

---

### Step 6: Deploy to Vercel
- [ ] Verify git status clean: `git status`
- [ ] Push to main: `git push origin main`
- [ ] Go to Vercel dashboard
- [ ] Monitor deployment logs
- [ ] Wait for "Ready" status
- [ ] Note deployment URL

**Time:** 15 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Deployment URL:** ___________________________

**Build Status:** ⬜ SUCCESS | ⬜ FAILED
**If Failed:** Review logs, fix issues, redeploy

---

### Step 7: Smoke Tests
**Test 1: Guru Question Flow**
- [ ] Send test question to Guru API
- [ ] Verify response contains questions (Socratic)
- [ ] Verify response time <2s
- [ ] Check Sentry for errors
- [ ] Check Helicone for cost logging

**Time:** 10 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Results:**
```
Response time: _____ms
Classification: _________
Agent used: _________
Socratic? Yes / No
Cost logged? Yes / No
```

---

**Test 2: Resume Generation**
- [ ] Send resume generation request
- [ ] Verify resume text generated
- [ ] Verify quality score >80
- [ ] Verify response time <5s
- [ ] Check Sentry for errors

**Time:** 10 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Results:**
```
Response time: _____ms
Quality score: _____
ATS keywords: _____
Response saved? Yes / No
Cost logged? Yes / No
```

---

**Test 3: Resume Matching**
- [ ] Index test candidate
- [ ] Search for matches
- [ ] Verify matches returned
- [ ] Verify similarity >0.70
- [ ] Verify response time <5s
- [ ] Check Sentry for errors

**Time:** 10 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Results:**
```
Response time: _____ms
Matches found: _____
Similarity: _____
Ranking correct? Yes / No
Cost logged? Yes / No
```

---

### Step 8: Post-Deployment Monitoring (First 2 Hours)
- [ ] Check Sentry every 30 minutes
- [ ] Check Vercel logs every 30 minutes
- [ ] Monitor Helicone dashboard
- [ ] Watch Supabase query performance
- [ ] Document any errors

**Time:** 2 hours
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

**Monitoring Notes:**
```
Hour 1:
- Errors: _____
- Response time: _____
- Cost: $_____

Hour 2:
- Errors: _____
- Response time: _____
- Cost: $_____
```

---

### Step 9: Deployment Communication
- [ ] Post "Deployment Started" to Slack
- [ ] Post "Database Migration Complete" to Slack
- [ ] Post "Application Deployed" to Slack
- [ ] Post "Smoke Tests Passed" to Slack
- [ ] Post "Deployment Complete" to Slack with summary

**Time:** 5 minutes
**Status:** ⬜ NOT STARTED | 🔄 IN PROGRESS | ✅ COMPLETE

---

## Deployment Complete

### Final Verification
- [ ] All deployment steps complete
- [ ] All smoke tests passed
- [ ] No critical errors in Sentry
- [ ] Costs logging in Helicone
- [ ] Team notified
- [ ] Monitoring schedule set

**Total Deployment Time:** _____ hours

**Status:** ⬜ SUCCESS | ⬜ PARTIAL | ⬜ FAILED

---

## If Deployment Failed

### Emergency Rollback
- [ ] Identify failure point (Step #___)
- [ ] Assess severity (CRITICAL / HIGH / MEDIUM)
- [ ] Execute rollback procedure:
  - [ ] Revert Vercel deployment (if app deployed)
  - [ ] Restore database backup (if migration applied)
  - [ ] Verify rollback successful
- [ ] Document failure reason
- [ ] Schedule fix and retry

**Rollback Time:** _____ minutes
**User Impact:** _____ minutes downtime
**Next Steps:** ___________________________

---

## Post-Deployment Tasks (Week 1)

### Day 1-2: Intensive Monitoring
- [ ] Check Sentry every 2 hours
- [ ] Check Helicone every 12 hours
- [ ] Monitor database performance every 4 hours
- [ ] Create Day 1 report
- [ ] Create Day 2 report

### Day 3-4: Quality Validation
- [ ] Socratic compliance testing (100 questions)
- [ ] Resume quality testing (10 resumes)
- [ ] Match accuracy testing (50 pairs)
- [ ] Load testing (10/50/100 users)

### Day 5-7: Optimization
- [ ] Review slow queries
- [ ] Optimize indexes if needed
- [ ] Review cost optimization
- [ ] Create Week 1 report

---

## Sign-Off

**Deployment Date:** ___________________________
**Deployment Agent:** ___________________________
**Deployment Duration:** _____ hours
**Status:** ⬜ SUCCESS | ⬜ PARTIAL | ⬜ FAILED

**Issues Encountered:**
1. ___________________________
2. ___________________________
3. ___________________________

**Next Review Date:** ___________________________ (Day 7)

---

**END OF CHECKLIST**
