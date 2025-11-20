# Epic 2.5 - Production Deployment Checklist

**Use this checklist to complete the deployment.**

---

## Pre-Deployment (Completed ✅)

- [x] TypeScript compilation (0 errors)
- [x] Production build successful
- [x] QA approval (93/100)
- [x] Code pushed to GitHub
- [x] Vercel deployment triggered
- [x] Documentation complete

---

## Manual Actions Required

### 1. Database Migrations (CRITICAL - DO FIRST)

**Before running:** Create backup via Supabase Dashboard
1. Go to Supabase Dashboard → Database → Backups
2. Click "Create Backup"
3. Label: "pre-epic-2.5-deployment"

**Run migrations in order:**

- [ ] Migration 017: AI Foundation
  ```bash
  psql $SUPABASE_DB_URL -f src/lib/db/migrations/017_add_ai_foundation.sql
  ```

- [ ] Verify RLS functions created:
  ```bash
  psql $SUPABASE_DB_URL -c "SELECT proname FROM pg_proc WHERE proname IN ('auth_user_id', 'auth_user_org_id', 'user_is_admin', 'user_has_role');"
  ```

- [ ] Migration 018: Agent Framework
  ```bash
  psql $SUPABASE_DB_URL -f src/lib/db/migrations/018_add_agent_framework.sql
  ```

- [ ] Migration 019: Guru Agents
  ```bash
  psql $SUPABASE_DB_URL -f src/lib/db/migrations/019_add_guru_agents.sql
  ```

- [ ] Migration 020: Sprint 4 Fixes
  ```bash
  psql $SUPABASE_DB_URL -f src/lib/db/migrations/020_fix_sprint_4_deployment.sql
  ```

- [ ] Verify all 14 tables created:
  ```bash
  psql $SUPABASE_DB_URL -c "SELECT tablename FROM pg_tables WHERE tablename LIKE 'ai_%' OR tablename LIKE 'guru_%' ORDER BY tablename;"
  ```

**Expected output:** 14 table names

---

### 2. Environment Variables (CRITICAL)

**Add these to Vercel environment variables:**

- [ ] `OPENAI_API_KEY` (Required for all agents)
  ```bash
  vercel env add OPENAI_API_KEY production
  # Paste your OpenAI API key when prompted
  ```

- [ ] `ANTHROPIC_API_KEY` (Required for Code Mentor)
  ```bash
  vercel env add ANTHROPIC_API_KEY production
  # Paste your Anthropic API key when prompted
  ```

- [ ] `REDIS_URL` (Required for memory caching)
  ```bash
  vercel env add REDIS_URL production
  # For Upstash: rediss://:password@host:6379
  # For local dev: redis://localhost:6379
  ```

- [ ] `HELICONE_API_KEY` (Recommended for cost tracking)
  ```bash
  vercel env add HELICONE_API_KEY production
  # Optional but highly recommended
  ```

- [ ] Redeploy Vercel to apply environment variables:
  ```bash
  vercel --prod
  ```

---

### 3. Supabase Storage Bucket (REQUIRED)

- [ ] Go to Supabase Dashboard → Storage
- [ ] Click "Create Bucket"
- [ ] Bucket name: `employee-screenshots`
- [ ] Public: **false** (unchecked)
- [ ] Click "Create bucket"

**Apply RLS Policies:**

- [ ] Go to bucket settings → Policies
- [ ] Click "New Policy"
- [ ] Add policies from migration 020 comments:
  - Users can upload their own screenshots
  - Users can view their own screenshots
  - Admins can view all screenshots

Or run SQL from migration 020:
```sql
-- See migration file for exact policy definitions
```

---

### 4. Post-Deployment Verification

**Health Checks:**

- [ ] Verify Vercel deployment succeeded
  ```bash
  vercel ls
  # Check latest deployment status
  ```

- [ ] Test database connectivity:
  ```bash
  psql $SUPABASE_DB_URL -c "SELECT COUNT(*) FROM ai_conversations;"
  ```

- [ ] Test storage bucket exists:
  - Go to Supabase Dashboard → Storage
  - Verify `employee-screenshots` bucket listed

- [ ] Check Vercel logs for errors:
  ```bash
  vercel logs --follow
  ```

**Function Tests (once env vars configured):**

- [ ] Test AI Router (if endpoint created)
  ```bash
  curl https://your-domain.vercel.app/api/ai/test
  ```

- [ ] Test authentication still works
  - Visit: https://your-domain.vercel.app/login
  - Try logging in with test account

---

### 5. Monitoring Setup

**Helicone (Cost Tracking):**

- [ ] Visit: https://helicone.ai/dashboard
- [ ] Create account if needed
- [ ] Add project: "InTime v3"
- [ ] Set budget alert: $500/day
- [ ] Configure organization settings

**Vercel Analytics:**

- [ ] Enable analytics:
  ```bash
  vercel analytics enable
  ```

- [ ] Verify analytics dashboard shows data

**Supabase Monitoring:**

- [ ] Check Database → Performance tab
- [ ] Check Storage → Usage tab
- [ ] Verify RLS policies working (try accessing data as different users)

---

## Rollback (If Needed)

**If critical issues arise:**

### Code Rollback

- [ ] Option 1: Vercel rollback
  ```bash
  vercel rollback
  ```

- [ ] Option 2: Git revert
  ```bash
  git revert 974a055
  git push origin main
  ```

### Database Rollback

- [ ] Restore backup via Supabase Dashboard
  - Go to Database → Backups
  - Select "pre-epic-2.5-deployment"
  - Click "Restore"

---

## Final Sign-Off

Once all items above are checked:

- [ ] All database migrations applied successfully
- [ ] All environment variables configured
- [ ] Storage bucket created with RLS policies
- [ ] Post-deployment health checks passing
- [ ] Monitoring dashboards configured
- [ ] No critical errors in logs
- [ ] Team notified of deployment completion

**Deployment Complete:** [ ] Yes / [ ] No

**Signed off by:** _________________ **Date:** _________

---

## Support

**Issues or Questions:**
- Full Deployment Report: `/docs/deployment/EPIC-2.5-DEPLOYMENT-REPORT.md`
- Quick Reference: `/DEPLOYMENT-SUMMARY.md`
- Architecture: `/docs/planning/EPIC-2.5-ARCHITECTURE.md`

**Rollback Required:**
- See "Rollback (If Needed)" section above
- Restore from Supabase backup
- Revert Vercel deployment

---

**Created:** 2025-11-20
**Epic:** 2.5 - AI Infrastructure & Services
**Status:** Awaiting Manual Actions
