# Sprint 5 Production Deployment Plan

**Epic:** 2.5 - AI Infrastructure (Final Sprint)
**Sprint:** Sprint 5 (Week 13-14)
**Deployment Date:** 2025-11-20
**Deployment Agent:** InTime Deployment Agent
**Status:** READY FOR DEPLOYMENT (Option A - Fix-First)

---

## Executive Summary

### Deployment Recommendation: OPTION A - FIX-FIRST (RECOMMENDED)

**Decision:** Deploy to production AFTER fixing critical test infrastructure issues.

**Rationale:**
1. Test execution failure is a **testing infrastructure issue**, NOT a code quality issue
2. Code review shows high-quality implementation (85/100 from QA)
3. TypeScript compilation passes with 0 errors
4. Production build succeeds with only acceptable warnings
5. Fixing tests adds 6 hours but significantly reduces deployment risk
6. Cost of delay (6 hours) << Cost of production runtime failure

**Timeline:**
- Pre-Deployment Fixes: 6 hours
- Deployment Day: 2.5 hours
- Total to Production: 8.5 hours (1 business day)
- Post-Deployment: Week 1 intensive monitoring

**Risk Level:** MEDIUM (down from HIGH with Option B)

---

## Risk Assessment

### Critical Issues Analysis

#### CRITICAL #1: Test Execution Failure
**Severity:** CRITICAL
**Current Status:** Tests fail due to SDK instantiation in jsdom environment
**Blast Radius:** If tests were actually running, this would catch runtime bugs
**Risk if Deployed Untested:** 30% chance of runtime failures in first week

**Root Cause:**
```typescript
// vitest.config.ts line 9
environment: 'jsdom',  // Browser-like environment

// Problem: Anthropic SDK doesn't allow browser instantiation without dangerouslyAllowBrowser flag
// This is a TEST INFRASTRUCTURE issue, not a CODE issue
```

**Mitigation Strategy:**
```typescript
// Option 1: Mock SDK clients in tests (RECOMMENDED)
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({ content: [...] })
    }
  }
}));

// Option 2: Switch to Node environment for backend tests
// vitest.config.ts
test: {
  environment: 'node',  // Change from jsdom
}
```

**Rollback Plan:** If runtime failures occur:
1. Immediately revert to previous deployment (git revert)
2. Estimated rollback time: 5 minutes
3. Data loss: None (tables exist, just no new data)
4. User impact: Guru features unavailable for 5 minutes

**DECISION:** Fix before deployment (adds 4 hours)

---

#### CRITICAL #2: Missing Test Coverage Data
**Severity:** CRITICAL
**Current Status:** 0% coverage due to test execution failure
**Blast Radius:** Cannot verify quality gates (80% target)
**Dependency:** Must fix CRITICAL #1 first

**Mitigation Strategy:**
1. Fix test execution (CRITICAL #1)
2. Run full test suite: `pnpm test`
3. Verify coverage meets 80% target for new Sprint 5 code
4. Review any failing tests

**Expected Coverage (based on test files):**
- CoordinatorAgent.test.ts: 236 lines covering CoordinatorAgent.ts (273 lines) = ~86%
- ResumeMatchingService.test.ts: 294 lines covering ResumeMatchingService.ts (532 lines) = ~55%
- guidewire-guru-flow.test.ts: 248 lines integration tests = additional coverage

**Rollback Plan:** If coverage falls short of 80%:
1. Delay deployment by 2 hours
2. Write additional tests for uncovered critical paths
3. Re-run coverage analysis

**DECISION:** Fix before deployment (included in CRITICAL #1 fix time)

---

#### CRITICAL #3: Database Migration Not Applied
**Severity:** CRITICAL
**Current Status:** Migration 021 exists but not applied to production
**Blast Radius:** Application WILL FAIL on first Guru question (tables don't exist)
**Risk Level:** 100% failure if not applied

**Migration Contents:**
- 4 new tables (generated_resumes, candidate_embeddings, requisition_embeddings, resume_matches)
- 3 PostgreSQL functions (search_candidates, calculate_matching_accuracy, get_resume_stats)
- pgvector indexes (ivfflat, lists=100)
- RLS policies (multi-tenancy enforcement)
- 659 lines of SQL

**Mitigation Strategy:**
1. Test migration on Supabase staging database FIRST
2. Backup production database before applying
3. Apply migration via Supabase Dashboard (safer than CLI for first production migration)
4. Verify all tables/functions/indexes created
5. Run migration validation view: `SELECT * FROM v_sprint_5_status`

**Rollback Plan:** If migration fails:
1. Restore from backup (30 minutes)
2. Investigate failure reason
3. Fix migration SQL
4. Re-test on staging
5. OR: Create rollback migration (021_down.sql)

**Time Required:**
- Staging test: 15 minutes
- Backup: 5 minutes
- Apply migration: 10 minutes
- Validation: 10 minutes
- Total: 40 minutes

**DECISION:** Must fix during deployment (cannot deploy without this)

---

### High Priority Issues Analysis

#### HIGH #1: ESLint Configuration Incomplete
**Severity:** HIGH
**Current Status:** ESLint setup wizard not completed
**Blast Radius:** No automated code quality checks, but doesn't block runtime
**Risk Level:** LOW (affects developer experience, not production)

**Impact:**
- No automated style enforcement
- No unused variable detection
- No import order enforcement
- Code quality drift over time

**Mitigation Strategy:**
```bash
# Quick fix (15 minutes)
pnpm next lint
# Select: "Strict (recommended)"
# Commit .eslintrc.json
git add .eslintrc.json
git commit -m "chore: complete ESLint configuration"
```

**Rollback Plan:** N/A (doesn't affect production runtime)

**DECISION:** Fix before deployment (adds 15 minutes)

---

#### HIGH #2: Environment Variables Missing
**Severity:** HIGH
**Current Status:** `.env.local` exists locally but production variables not verified in Vercel
**Blast Radius:** Application will fail to start or API calls will fail
**Risk Level:** HIGH (100% failure if keys invalid/missing)

**Required Environment Variables:**
```bash
# Supabase (CRITICAL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI APIs (CRITICAL for Sprint 5)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-api03-...
HELICONE_API_KEY=sk-helicone-...

# Optional but recommended
SLACK_WEBHOOK_URL=https://hooks.slack.com/... (for escalations)
```

**Mitigation Strategy:**
1. Verify all keys present in Vercel environment variables
2. Test API keys locally before deployment
3. Set up Helicone budget alerts (<$10/day)
4. Configure Slack webhook for escalations

**Verification Steps:**
```bash
# Test OpenAI API key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test Anthropic API key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"

# Test Supabase connection
psql $SUPABASE_DB_URL -c "SELECT 1"
```

**Rollback Plan:** If API keys fail in production:
1. Update Vercel environment variables immediately
2. Redeploy (2 minutes)
3. User impact: 2-5 minutes downtime

**DECISION:** Must verify during deployment

---

### Medium Priority Issues Analysis

#### MEDIUM #1: API Documentation Gaps
**Severity:** MEDIUM
**Impact:** Developer experience only
**Risk Level:** NONE (doesn't affect production)

**Status:** Can fix post-deployment

---

#### MEDIUM #2: Manual Testing Not Performed
**Severity:** MEDIUM
**Impact:** Quality assurance confidence
**Risk Level:** MEDIUM (unknown quality metrics)

**Mitigation:** First week intensive monitoring will serve as de-facto manual testing

**Status:** Post-deployment (first week tasks)

---

#### MEDIUM #3: Performance Benchmarks Not Verified
**Severity:** MEDIUM
**Impact:** User experience unknown
**Risk Level:** MEDIUM (could be slow, but won't fail)

**Expected Performance (from implementation docs):**
| Operation | Target | Method |
|-----------|--------|--------|
| Classification | <500ms | GPT-4o-mini + caching |
| Code Mentor | <2s | GPT-4o-mini + RAG |
| Resume generation | <5s | GPT-4o-mini (80%) / GPT-4o (20%) |
| Semantic search | <500ms | pgvector ivfflat |
| Deep matching | <5s | GPT-4o-mini batch |

**Mitigation:** Monitor actual performance in production, optimize if needed

**Status:** Post-deployment (first week monitoring)

---

#### MEDIUM #4: RAG Indexing Not Performed
**Severity:** MEDIUM
**Impact:** Guru responses will lack curriculum context
**Risk Level:** MEDIUM (reduced quality, but not broken)

**Status:** Must fix during deployment (1 hour)

**Note:** RAG indexing script does not exist yet. Need to create it.

---

### Low Priority Issues

#### LOW #1: Cost Monitoring Dashboard Access
**Severity:** LOW
**Impact:** Visibility only
**Status:** Post-deployment

---

## Deployment Timeline

### Pre-Deployment Phase (6 hours)

#### Task 1: Fix Test Execution (4 hours)
**Owner:** Developer Agent
**Priority:** CRITICAL

**Steps:**
1. Create mock for Anthropic SDK (1 hour)
2. Create mock for OpenAI SDK (1 hour)
3. Update test setup file (30 minutes)
4. Run full test suite (30 minutes)
5. Review test results and fix any failures (1 hour)

**Deliverables:**
- All tests passing
- 80%+ coverage on Sprint 5 code
- Test report documenting coverage

**Success Criteria:**
```bash
pnpm test
# Expected: All tests pass
# Expected: Coverage > 80% on new code
```

---

#### Task 2: Complete ESLint Setup (15 minutes)
**Owner:** Developer Agent
**Priority:** HIGH

**Steps:**
```bash
# Run setup wizard
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3
pnpm next lint
# Select: "Strict (recommended)"

# Fix any linting errors
pnpm next lint --fix

# Commit configuration
git add .eslintrc.json
git commit -m "chore: complete ESLint configuration"
```

**Success Criteria:**
- `.eslintrc.json` exists
- `pnpm next lint` runs without errors

---

#### Task 3: Environment Variable Verification (1 hour)
**Owner:** Deployment Agent
**Priority:** HIGH

**Steps:**
1. Test all API keys locally (15 minutes)
2. Verify Vercel environment variables (15 minutes)
3. Configure Helicone budget alerts (15 minutes)
4. Test Slack webhook (15 minutes)

**Checklist:**
- [ ] OPENAI_API_KEY tested and valid
- [ ] ANTHROPIC_API_KEY tested and valid
- [ ] HELICONE_API_KEY tested and valid
- [ ] SUPABASE credentials tested and valid
- [ ] SLACK_WEBHOOK_URL tested (optional)
- [ ] All variables configured in Vercel
- [ ] Helicone budget alert set (<$10/day)

**Success Criteria:**
```bash
# All API tests return 200 OK
curl -s -o /dev/null -w "%{http_code}" https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
# Expected: 200
```

---

### Deployment Day (2.5 hours)

#### Pre-Deployment Checklist (15 minutes)
**Owner:** Deployment Agent

**Verification:**
- [ ] All tests passing (Task 1 complete)
- [ ] ESLint configured (Task 2 complete)
- [ ] Environment variables verified (Task 3 complete)
- [ ] TypeScript compilation: 0 errors
- [ ] Production build: successful
- [ ] Git status clean (all changes committed)
- [ ] On latest main branch
- [ ] Database backup completed

---

#### Step 1: Database Staging Test (15 minutes)
**Owner:** Deployment Agent

**Steps:**
```sql
-- Connect to staging database
psql $SUPABASE_STAGING_DB_URL

-- Apply migration
\i /Users/sumanthrajkumarnagolu/Projects/intime-v3/src/lib/db/migrations/021_add_sprint_5_features.sql

-- Verify tables created
\dt generated_resumes
\dt candidate_embeddings
\dt requisition_embeddings
\dt resume_matches

-- Verify functions
\df search_candidates
\df calculate_matching_accuracy
\df get_resume_stats

-- Check migration status
SELECT * FROM v_sprint_5_status;
```

**Success Criteria:**
- All 4 tables created
- All 3 functions created
- All indexes created
- All RLS policies enabled
- Migration status view returns success

**If Failed:**
- Review error messages
- Fix migration SQL
- Re-test on staging
- DO NOT proceed to production

---

#### Step 2: Production Database Backup (5 minutes)
**Owner:** Deployment Agent

**Steps:**
1. Go to Supabase Dashboard → Database → Backups
2. Click "Create Backup"
3. Name: `pre-sprint-5-deployment-2025-11-20`
4. Wait for completion
5. Verify backup exists

**Success Criteria:**
- Backup visible in Supabase Dashboard
- Backup status: "Completed"
- Backup size: >0 bytes

---

#### Step 3: Apply Production Migration (10 minutes)
**Owner:** Deployment Agent

**Method:** Supabase Dashboard (safer than CLI)

**Steps:**
1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `021_add_sprint_5_features.sql`
4. Review SQL (verify org_id, RLS policies, indexes)
5. Click "Run"
6. Wait for completion (expected: 30-60 seconds)

**Verification:**
```sql
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('generated_resumes', 'candidate_embeddings', 'requisition_embeddings', 'resume_matches');
-- Expected: 4 rows

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('search_candidates', 'calculate_matching_accuracy', 'get_resume_stats');
-- Expected: 3 rows

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('candidate_embeddings', 'requisition_embeddings');
-- Expected: 2+ rows (vector indexes)

-- Run migration validation
SELECT * FROM v_sprint_5_status;
-- Expected: All checks pass
```

**If Failed:**
- DO NOT PROCEED
- Restore from backup
- Review error logs
- Fix migration SQL
- Re-test on staging
- Try again

**Success Criteria:**
- All tables exist
- All functions exist
- All indexes exist
- Migration validation view passes

---

#### Step 4: Create Storage Bucket (15 minutes)
**Owner:** Deployment Agent

**Steps:**
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `generated-resumes`
4. Privacy: Private (RLS enforced)
5. File size limit: 5MB
6. Allowed MIME types:
   - `application/pdf`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX)
   - `text/plain` (TXT)
7. Create bucket

**RLS Policy:**
```sql
-- Users can only access their own org's resumes
CREATE POLICY "Users can view own org resumes"
ON storage.objects FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM user_profiles
    WHERE org_id = (SELECT org_id FROM user_profiles WHERE user_id = auth.uid())
  )
  AND bucket_id = 'generated-resumes'
);
```

**Verification:**
- Upload test file
- Verify download works
- Verify RLS blocks cross-org access
- Delete test file

**Success Criteria:**
- Bucket exists
- RLS policy applied
- Test upload/download successful

---

#### Step 5: RAG Indexing (1 hour)
**Owner:** Deployment Agent

**Status:** RAG indexing script does not exist yet

**Required:** Create script first

**Script Location:** `/Users/sumanthrajkumarnagolu/Projects/intime-v3/scripts/index-rag-collections.ts`

**Script Requirements:**
```typescript
// Script should:
// 1. Read curriculum documents from specified directory
// 2. Chunk documents (1000 tokens, 200 token overlap)
// 3. Generate embeddings (OpenAI text-embedding-3-small)
// 4. Store in Supabase rag_collections table
// 5. Log progress and errors
// 6. Handle rate limits (max 3000 RPM)
```

**Expected Output:**
- 100-200 curriculum documents indexed
- ~500-1000 chunks created
- ~500-1000 embeddings generated
- Total cost: <$0.10

**If Script Doesn't Exist:**
- **Option 1:** Create script (2 hours) - DELAYS DEPLOYMENT
- **Option 2:** Deploy without RAG indexing, add in Week 1 - REDUCES QUALITY
- **Option 3:** Index manually via Supabase Dashboard - TEDIOUS

**DECISION REQUIRED:** Determine if RAG indexing script exists before deployment

**Verification:**
```sql
-- Check RAG collections
SELECT collection_name, COUNT(*) as chunks
FROM rag_chunks
GROUP BY collection_name;
-- Expected: guidewire-curriculum with 500-1000 chunks

-- Test RAG search
SELECT title, similarity
FROM search_rag_chunks('Java programming basics', 5);
-- Expected: 5 relevant chunks
```

---

#### Step 6: Deploy Application to Vercel (15 minutes)
**Owner:** Deployment Agent

**Steps:**
```bash
# Verify git status
git status
# Expected: nothing to commit, working tree clean

# Push to main branch (triggers auto-deploy)
git push origin main

# Monitor Vercel deployment
# Go to: https://vercel.com/your-project/deployments

# Watch build logs for errors
# Expected build time: 3-5 minutes
```

**Vercel Build Checklist:**
- [ ] Build started
- [ ] Dependencies installed
- [ ] TypeScript compilation successful
- [ ] Next.js build successful
- [ ] Deployment successful
- [ ] New deployment URL available

**Success Criteria:**
- Vercel deployment status: "Ready"
- Build logs show no errors
- Deployment URL accessible

**If Failed:**
- Review build logs
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Dependency resolution failures
- Fix issues and redeploy

---

#### Step 7: Smoke Tests (30 minutes)
**Owner:** Deployment Agent

**Test 1: Student Question Flow (10 minutes)**
```bash
# Test classification and routing
curl -X POST https://your-app.vercel.app/api/trpc/guidewireGuru.ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "studentId": "test-student-id",
    "question": "How do I use Java generics?"
  }'

# Expected response:
# - Classification: "code_question"
# - Agent: "Code Mentor"
# - Response contains questions (Socratic method)
# - Response time: <2s
# - Cost logged in Helicone
```

**Test 2: Resume Generation (10 minutes)**
```bash
# Test resume builder
curl -X POST https://your-app.vercel.app/api/trpc/guidewireGuru.generateResume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "userId": "test-user-id",
    "targetRole": "Java Developer",
    "experience": { ... }
  }'

# Expected response:
# - Resume text generated
# - Quality score: >80
# - ATS keywords present
# - Response time: <5s
# - Cost logged in Helicone
```

**Test 3: Resume Matching (10 minutes)**
```bash
# Test semantic search
curl -X POST https://your-app.vercel.app/api/trpc/resumeMatching.findMatches \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "requisitionId": "test-req-id",
    "limit": 10,
    "minSimilarity": 0.70
  }'

# Expected response:
# - 10 candidate matches
# - Similarity scores: >0.70
# - Matches ranked by score
# - Response time: <5s
# - Cost logged in Helicone
```

**Verification:**
- [ ] All 3 smoke tests pass
- [ ] No errors in Sentry
- [ ] Costs logged in Helicone
- [ ] Response times meet targets
- [ ] Database queries successful

**If Failed:**
- Review error logs
- Check environment variables
- Verify database migration applied
- Fix issues and redeploy

---

### Post-Deployment Phase (Week 1)

#### Day 1-2: Intensive Monitoring (16 hours)

**Monitoring Checklist:**
- [ ] Sentry: Check for errors every 2 hours
- [ ] Helicone: Verify costs <$10/day
- [ ] Supabase: Monitor query performance (slow query log)
- [ ] Vercel: Check function execution time
- [ ] Slack: Monitor escalation alerts

**Key Metrics:**
| Metric | Target | Check Frequency |
|--------|--------|-----------------|
| Error rate | <0.1% | Every 2 hours |
| Response time (Guru) | <2s | Every 4 hours |
| Response time (Matching) | <5s | Every 4 hours |
| Daily AI cost | <$10 | Every 12 hours |
| Database CPU | <70% | Every 4 hours |
| RLS policy violations | 0 | Every 6 hours |

**Alert Thresholds:**
- Critical: Error rate >1% → Investigate immediately
- High: Response time >5s → Optimize within 24 hours
- Medium: Daily cost >$15 → Review model selection
- Low: Database CPU >80% → Add indexes

**Daily Summary Report:**
```markdown
## Day 1 Deployment Report

**Status:** [GREEN/YELLOW/RED]

**Traffic:**
- Guru questions: X
- Resume generations: Y
- Match requests: Z

**Performance:**
- Avg response time (Guru): Xs
- Avg response time (Matching): Ys
- P95 response time: Zs

**Costs:**
- OpenAI: $X
- Anthropic: $Y
- Total: $Z

**Errors:**
- Critical: 0
- High: 0
- Medium: X
- Low: Y

**Actions Required:**
- [List any issues found]
```

---

#### Day 3-4: Quality Validation (16 hours)

**Task 1: Socratic Compliance Testing (4 hours)**
- Generate 100 test questions across all topics
- Submit to Code Mentor agent
- Manually review responses for Socratic method (questions vs. answers)
- Target: 95%+ compliance
- Document any failures

**Task 2: Resume Quality Testing (4 hours)**
- Generate 10 sample resumes (varying experience levels)
- Recruiter review for ATS compliance
- Check: keywords, formatting, achievements, action verbs
- Target: 90%+ ATS-compliant
- Document quality scores

**Task 3: Match Accuracy Testing (4 hours)**
- Create 50 labeled candidate-job pairs (recruiter labels)
- Run semantic search + deep analysis
- Calculate accuracy vs. ground truth
- Target: 85%+ accuracy
- Document false positives/negatives

**Task 4: Load Testing (4 hours)**
- Test 10 concurrent users
- Test 50 concurrent users
- Test 100 concurrent users
- Measure: response time, error rate, database CPU
- Target: <2s response time at 100 concurrent users

**Deliverable:** Quality validation report

---

#### Day 5-7: Optimization (24 hours)

**Database Optimization:**
- Review slow queries (>1s) in Supabase Dashboard
- Add missing indexes if needed
- Adjust pgvector lists parameter if search >500ms
- Run ANALYZE on all new tables

**Cost Optimization:**
- Review Helicone dashboard
- Verify model selection (GPT-4o-mini for most operations)
- Check prompt caching effectiveness
- Adjust batch sizes if needed

**Performance Optimization:**
- Profile slow endpoints
- Optimize database queries
- Add caching where appropriate
- Review function execution time

**Deliverable:** Optimization report

---

## Success Criteria

### Week 1 Success Criteria (Must Meet)
- [ ] No critical errors in production
- [ ] Error rate <0.1%
- [ ] Guru response time <2s (P95)
- [ ] Matching response time <5s (P95)
- [ ] Daily AI cost <$10
- [ ] Database CPU <70%
- [ ] 0 RLS policy violations
- [ ] 0 cross-org data leaks

### Week 2 Success Criteria (Should Meet)
- [ ] Socratic compliance: 95%+
- [ ] Resume quality: 90%+ ATS-compliant
- [ ] Match accuracy: 85%+
- [ ] 100 concurrent users supported
- [ ] Cost within budget ($2.14/day average)

### Month 1 Success Criteria (Nice to Have)
- [ ] 1,000+ Guru questions answered
- [ ] 100+ resumes generated
- [ ] 500+ match requests processed
- [ ] Average cost: <$100/month
- [ ] User satisfaction: 4.5/5 stars

---

## Rollback Procedures

### Scenario 1: Critical Runtime Errors (Error Rate >5%)
**Symptoms:**
- Sentry showing multiple errors
- Users reporting failures
- Database queries failing

**Rollback Steps:**
1. Revert to previous deployment in Vercel (2 minutes)
2. Click "Redeploy" on last known good deployment
3. Verify rollback successful via smoke tests
4. Investigate error logs
5. Fix issues in development
6. Re-test thoroughly
7. Redeploy

**Data Loss:** None (database intact)
**User Impact:** 5 minutes downtime
**Recovery Time:** 2 minutes

---

### Scenario 2: Database Migration Failure
**Symptoms:**
- Tables missing
- Functions not found
- RLS policy errors

**Rollback Steps:**
1. Restore database from pre-deployment backup
2. Estimated time: 30 minutes
3. Verify all tables restored
4. Redeploy previous application version
5. Investigate migration failure
6. Fix migration SQL
7. Re-test on staging
8. Attempt migration again

**Data Loss:** Any data created during failed deployment (minimal)
**User Impact:** 30-60 minutes downtime
**Recovery Time:** 30 minutes

---

### Scenario 3: Performance Degradation (Response Time >10s)
**Symptoms:**
- Slow response times
- Database CPU >90%
- Timeout errors

**Immediate Actions:**
1. DO NOT ROLLBACK (not a breaking issue)
2. Scale database resources (Supabase Dashboard)
3. Review slow queries
4. Add missing indexes
5. Optimize problematic queries
6. Monitor improvement

**Data Loss:** None
**User Impact:** Slow but functional
**Recovery Time:** 1-4 hours

---

### Scenario 4: Cost Overrun (Daily Cost >$50)
**Symptoms:**
- Helicone showing unexpected costs
- Budget alerts triggered

**Immediate Actions:**
1. DO NOT ROLLBACK (not a breaking issue)
2. Review Helicone dashboard for high-cost operations
3. Implement rate limiting if abuse detected
4. Switch models (GPT-4o → GPT-4o-mini)
5. Add caching for repeated queries
6. Monitor cost reduction

**Data Loss:** None
**User Impact:** None (transparent to users)
**Recovery Time:** 2-4 hours

---

## Communication Plan

### Pre-Deployment Communication
**Audience:** Development team, QA team, stakeholders
**Timing:** 24 hours before deployment
**Message:**
> "Sprint 5 (Guidewire Guru & Resume Matching) will be deployed to production on 2025-11-20. Deployment window: 9am-12pm EST. Expected downtime: 5 minutes for database migration. Please report any issues to #engineering-alerts."

---

### Deployment Communication
**Audience:** All stakeholders
**Timing:** During deployment
**Channel:** Slack #engineering-alerts

**Milestones to Announce:**
- [ ] Deployment started
- [ ] Database migration complete
- [ ] Application deployed
- [ ] Smoke tests passed
- [ ] Deployment complete

---

### Post-Deployment Communication
**Audience:** All stakeholders
**Timing:** End of Day 1, Day 7, Day 30
**Format:** Deployment report (see Day 1-2 monitoring section)

---

## Appendix A: Environment Variables Checklist

### Required (CRITICAL - App Won't Start)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`

### Recommended (HIGH - Features Won't Work)
- [ ] `HELICONE_API_KEY`
- [ ] `SLACK_WEBHOOK_URL`

### Optional (MEDIUM - Nice to Have)
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `RESEND_API_KEY` (email notifications)

---

## Appendix B: Database Migration Validation Queries

```sql
-- Verify all Sprint 5 tables exist
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('generated_resumes', 'candidate_embeddings', 'requisition_embeddings', 'resume_matches')
ORDER BY table_name;
-- Expected: 4 rows

-- Verify RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('generated_resumes', 'candidate_embeddings', 'requisition_embeddings', 'resume_matches');
-- Expected: rowsecurity = true for all

-- Verify indexes created
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE tablename IN ('candidate_embeddings', 'requisition_embeddings')
AND indexname LIKE '%vector%';
-- Expected: 2 rows (ivfflat indexes)

-- Verify functions created
SELECT routine_name, routine_type, data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('search_candidates', 'calculate_matching_accuracy', 'get_resume_stats');
-- Expected: 3 rows

-- Verify pgvector extension
SELECT extname, extversion
FROM pg_extension
WHERE extname = 'vector';
-- Expected: 1 row

-- Test semantic search function
SELECT search_candidates(
  '{"skills": ["Java", "Spring Boot"], "experience_years": 5}'::jsonb,
  0.70,
  10
);
-- Expected: Empty array (no candidates yet) OR array of candidate matches

-- Check migration status view
SELECT * FROM v_sprint_5_status;
-- Expected: All checks pass
```

---

## Appendix C: Smoke Test Scripts

### Test Script 1: Guru Question Flow
```typescript
// tests/smoke/guru-question.test.ts
import { test, expect } from '@playwright/test';

test('Guidewire Guru answers student question', async ({ request }) => {
  const response = await request.post('/api/trpc/guidewireGuru.ask', {
    data: {
      studentId: 'test-student-123',
      question: 'How do I use Java generics?'
    },
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN}`
    }
  });

  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.classification).toBe('code_question');
  expect(data.agentUsed).toBe('Code Mentor');
  expect(data.response).toContain('?'); // Socratic method = questions
  expect(data.responseTime).toBeLessThan(2000);
  expect(data.cost).toBeGreaterThan(0);
});
```

### Test Script 2: Resume Generation
```typescript
// tests/smoke/resume-generation.test.ts
import { test, expect } from '@playwright/test';

test('Resume Builder generates ATS-compliant resume', async ({ request }) => {
  const response = await request.post('/api/trpc/guidewireGuru.generateResume', {
    data: {
      userId: 'test-user-123',
      targetRole: 'Java Developer',
      experience: {
        education: 'BS Computer Science',
        skills: ['Java', 'Spring Boot', 'SQL'],
        projects: ['E-commerce platform', 'Banking API']
      }
    },
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN}`
    }
  });

  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.resumeText).toBeTruthy();
  expect(data.qualityScore).toBeGreaterThan(80);
  expect(data.atsKeywords.length).toBeGreaterThan(10);
  expect(data.hasActionVerbs).toBe(true);
  expect(data.responseTime).toBeLessThan(5000);
});
```

### Test Script 3: Resume Matching
```typescript
// tests/smoke/resume-matching.test.ts
import { test, expect } from '@playwright/test';

test('Resume Matching finds qualified candidates', async ({ request }) => {
  // First, index a test candidate
  await request.post('/api/trpc/resumeMatching.indexCandidate', {
    data: {
      candidateId: 'test-candidate-123',
      skills: ['Java', 'Spring Boot', 'Microservices'],
      experienceYears: 5,
      location: 'Remote'
    },
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN}`
    }
  });

  // Search for matching candidates
  const response = await request.post('/api/trpc/resumeMatching.findMatches', {
    data: {
      requisitionId: 'test-req-123',
      requirements: {
        skills: ['Java', 'Spring Boot'],
        minExperienceYears: 3,
        location: 'Remote'
      },
      limit: 10,
      minSimilarity: 0.70
    },
    headers: {
      'Authorization': `Bearer ${process.env.TEST_TOKEN}`
    }
  });

  expect(response.status()).toBe(200);
  const data = await response.json();

  expect(data.matches.length).toBeGreaterThan(0);
  expect(data.matches[0].similarity).toBeGreaterThan(0.70);
  expect(data.matches[0].overallScore).toBeGreaterThan(70);
  expect(data.responseTime).toBeLessThan(5000);
});
```

---

## Appendix D: First Week Monitoring Checklist

### Daily Checks (Every 24 hours)
- [ ] Sentry error count
- [ ] Helicone daily cost
- [ ] Vercel function execution count
- [ ] Database storage usage
- [ ] Database connection count

### Twice Daily Checks (Every 12 hours)
- [ ] Response time metrics (P50, P95, P99)
- [ ] Error rate percentage
- [ ] Database CPU usage
- [ ] Database memory usage
- [ ] Slow query log review

### Hourly Checks (First 48 hours only)
- [ ] Sentry for new errors
- [ ] Vercel logs for warnings
- [ ] Helicone for cost spikes
- [ ] User feedback channels

---

## Deployment Sign-Off

### Pre-Deployment Sign-Off
**Required Approvals:**
- [ ] Developer Agent: All tests passing, code quality verified
- [ ] QA Agent: Quality gates met, deployment plan reviewed
- [ ] Deployment Agent: Environment ready, rollback plan confirmed
- [ ] Product Owner: Feature complete, business requirements met

**Sign-Off Date:** _________________

---

### Post-Deployment Sign-Off (Day 7)
**Success Validation:**
- [ ] Week 1 success criteria met
- [ ] No critical errors
- [ ] Performance targets met
- [ ] Cost within budget
- [ ] Quality metrics acceptable

**Sign-Off Date:** _________________

**Next Review:** Day 30 (Month 1 success criteria)

---

**END OF DEPLOYMENT PLAN**

**Status:** READY FOR EXECUTION
**Deployment Agent:** InTime Deployment Agent
**Last Updated:** 2025-11-20
**Version:** 1.0
