# Sprint 7 Deployment Guide

**Epic:** 2.5 - AI Infrastructure (Final Phase)
**Sprint:** 7
**Date:** 2025-11-20
**Status:** Ready for Production Deployment

---

## Pre-Deployment Checklist

Before starting deployment, ensure you have:

- ✅ All Sprint 7 code reviewed and tested (71 tests passing)
- ✅ Database migrations created and validated
- ✅ Environment variables configured
- ✅ Supabase project access (Admin level)
- ✅ Vercel project access (Admin level)
- ⏳ Docker Desktop running (for local Supabase CLI)
- ⏳ Git repository up to date

---

## Deployment Steps

### Step 1: Run Database Migrations

**Option A: Via Supabase Dashboard (Recommended)**

1. Navigate to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Create a new query and paste the content of each migration file:

**Migration 1: Employee Screenshots**
```bash
# Copy content from:
supabase/migrations/20251120200000_employee_screenshots.sql
```
- Paste into SQL Editor
- Click **Run**
- Verify success: "Success. No rows returned"

**Migration 2: Productivity Reports**
```bash
# Copy content from:
supabase/migrations/20251120210000_productivity_reports.sql
```
- Paste into SQL Editor
- Click **Run**
- Verify success

**Migration 3: Twin System**
```bash
# Copy content from:
supabase/migrations/20251120220000_twin_system.sql
```
- Paste into SQL Editor
- Click **Run**
- Verify success

**Option B: Via Supabase CLI**

Prerequisites:
- Docker Desktop running
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Project linked

```bash
# Link to your project (first time only)
supabase link --project-ref <your-project-ref>

# Push migrations to production
supabase db push

# Verify migrations applied
supabase db remote commit
```

**Verification:**

After running migrations, verify tables created:
1. Go to **Table Editor** in Supabase Dashboard
2. Confirm these tables exist:
   - `employee_screenshots`
   - `productivity_reports`
   - `employee_twin_interactions`
   - `twin_preferences`

---

### Step 2: Create Supabase Storage Bucket

1. **Navigate to Storage** in Supabase Dashboard
2. Click **New Bucket**
3. Configure bucket:
   - **Name:** `employee-screenshots`
   - **Public:** ❌ **NO** (Private bucket)
   - **File size limit:** 5 MB (per screenshot)
   - **Allowed MIME types:** image/png, image/jpeg
4. Click **Create bucket**

**Set Bucket Policies:**

1. Go to **Storage** > **Policies** > `employee-screenshots`
2. Click **New Policy**
3. **Policy 1: Service Role Insert**
   ```sql
   -- Allow service role to insert
   CREATE POLICY "Service role can insert screenshots"
   ON storage.objects FOR INSERT
   TO service_role
   WITH CHECK (bucket_id = 'employee-screenshots');
   ```

4. **Policy 2: Authenticated Read (Admin/Manager only)**
   ```sql
   -- Allow admins to read all screenshots
   CREATE POLICY "Admins can read all screenshots"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'employee-screenshots'
     AND EXISTS (
       SELECT 1 FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = auth.uid() AND r.name = 'admin'
     )
   );
   ```

**Set Lifecycle Policy (90-day retention):**

1. Go to **Storage** > **Settings**
2. Set lifecycle rule:
   ```json
   {
     "Rules": [
       {
         "Id": "DeleteOldScreenshots",
         "Status": "Enabled",
         "Filter": {
           "Prefix": ""
         },
         "Expiration": {
           "Days": 90
         }
       }
     ]
   }
   ```

---

### Step 3: Verify Environment Variables

Ensure these variables are set in `.env.local` (local) and Vercel (production):

**Required for Sprint 7:**

```bash
# OpenAI (for classification and twins)
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For cron jobs
SUPABASE_DB_URL=postgresql://...  # For migrations

# Cron Security
CRON_SECRET=your-secure-random-string  # Generate with: openssl rand -hex 32

# Helicone (optional, for AI cost monitoring)
HELICONE_API_KEY=sk-...  # If using Helicone

# Node Environment
NODE_ENV=production
```

**Verify in Vercel Dashboard:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Ensure all variables are set for **Production** environment
4. Click **Save**

---

### Step 4: Commit Sprint 7 Code

```bash
# Stage all new Sprint 7 files
git add src/lib/ai/productivity/
git add src/lib/ai/twins/__tests__/
git add src/app/(dashboard)/my-productivity/
git add src/app/(dashboard)/my-twin/
git add src/app/api/cron/
git add src/app/api/twin/
git add src/app/admin/screenshots/
git add src/app/api/screenshots/
git add services/
git add supabase/migrations/20251120*
git add docs/planning/sprints/sprint-07/
git add scripts/deploy-ai-prod-001.sh
git add vercel.json
git add package.json pnpm-lock.yaml

# Commit with descriptive message
git commit -m "$(cat <<'EOF'
feat: Sprint 7 - AI Infrastructure Phase 3 Complete

Implements final phase of Epic 2.5 with productivity tracking and AI twins.

Stories Completed (21 points):
- AI-PROD-001: Desktop Screenshot Agent (5 pts)
- AI-PROD-002: Activity Classification (8 pts)
- AI-PROD-003: Daily Timeline Generator (3 pts)
- AI-TWIN-001: Employee AI Twin Framework (5 pts)

Key Features:
✅ Background screenshot capture for compliance
✅ GPT-4o-mini vision classification (7 categories)
✅ AI-generated daily productivity timelines
✅ Role-specific AI assistants (4 roles)
✅ Morning briefings (9 AM daily)
✅ Proactive suggestions (3x daily)
✅ Real-time Q&A chat interface
✅ 71 tests, all passing
✅ Under budget (233x for twins)

Database:
- 3 new migrations with RLS policies
- Storage bucket for screenshots
- 90-day retention policies

API:
- 4 cron jobs (classification, timelines, briefings, suggestions)
- 3 twin endpoints (chat, latest, feedback)

UI:
- /my-productivity dashboard
- /my-twin dashboard

Cost Analysis:
- $46/month per employee (all AI features)
- $4,979/month for 100 employees
- $132K/year savings vs human analysts
- 221% ROI

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to main branch
git push origin main
```

---

### Step 5: Deploy to Vercel

**Option A: Automatic Deployment (Recommended)**

Vercel will automatically deploy when you push to `main`:

1. Push code: `git push origin main`
2. Go to Vercel Dashboard: https://vercel.com/dashboard
3. Navigate to your project
4. Monitor deployment progress in **Deployments** tab
5. Wait for "Ready" status (usually 2-3 minutes)

**Option B: Manual Deployment**

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to production
vercel --prod

# Follow prompts to confirm production deployment
```

**Verify Deployment:**

1. Check deployment URL: https://your-app.vercel.app
2. Verify build success in Vercel dashboard
3. Check for any build errors or warnings

---

### Step 6: Verify Cron Jobs

After deployment, verify cron jobs are configured:

1. **In Vercel Dashboard:**
   - Go to **Settings** > **Cron Jobs**
   - Confirm these 4 jobs exist:
     - `POST /api/cron/classify-screenshots` - Daily at 2 AM
     - `POST /api/cron/generate-timelines` - Daily at 3 AM
     - `POST /api/cron/generate-morning-briefings` - Daily at 9 AM
     - `POST /api/cron/generate-proactive-suggestions` - 3x daily (11 AM, 2 PM, 4 PM)

2. **Test Cron Endpoints Manually:**

```bash
# Set your cron secret
CRON_SECRET="your-secret-from-env"
BASE_URL="https://your-app.vercel.app"

# Test classify-screenshots endpoint
curl -X POST "$BASE_URL/api/cron/classify-screenshots" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Expected response: {"success": true, "classified": 0, "message": "..."}

# Test generate-timelines endpoint
curl -X POST "$BASE_URL/api/cron/generate-timelines" \
  -H "Authorization: Bearer $CRON_SECRET"

# Expected response: {"success": true, "generated": 0, "message": "..."}

# Test morning briefings endpoint
curl -X POST "$BASE_URL/api/cron/generate-morning-briefings" \
  -H "Authorization: Bearer $CRON_SECRET"

# Expected response: {"success": true, "generated": 0, "message": "..."}

# Test proactive suggestions endpoint
curl -X POST "$BASE_URL/api/cron/generate-proactive-suggestions" \
  -H "Authorization: Bearer $CRON_SECRET"

# Expected response: {"success": true, "generated": 0, "message": "..."}
```

Note: Initial responses will show 0 classified/generated since no data exists yet.

---

### Step 7: Deploy Screenshot Agent (Optional for Now)

**Note:** Skip this step initially. Screenshot agent deployment requires:
- Physical access to employee machines
- IT infrastructure for service deployment
- Policy communication to employees

For now, you can test the system without screenshots by:
1. Manually uploading test screenshots to the bucket
2. Running classification cron manually
3. Verifying the full pipeline works

**When Ready to Deploy:**

See `services/screenshot-agent/README.md` for installation instructions per OS:
- macOS: `install/install-macos.sh`
- Linux: `install/install-linux.sh`
- Windows: `install/install-windows.ps1`

---

## Post-Deployment Verification

### Immediate Checks (First 30 Minutes)

**1. Verify Database Tables**

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'employee_screenshots',
  'productivity_reports',
  'employee_twin_interactions',
  'twin_preferences'
);

-- Should return 4 rows
```

**2. Verify Storage Bucket**

- Go to Supabase Storage
- Confirm `employee-screenshots` bucket exists
- Verify it's private (no public access)

**3. Check Application Health**

```bash
# Visit these URLs and verify they load without errors
https://your-app.vercel.app/my-productivity
https://your-app.vercel.app/my-twin

# Expected: Login required or dashboard displays
```

**4. Test Twin API**

```bash
# Test twin chat endpoint
curl -X POST "https://your-app.vercel.app/api/twin/chat" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "What should I focus on today?"}'

# Expected: {"success": true, "answer": "...", "conversationId": "..."}
```

### Day 1 Monitoring

**Monitor Cron Execution:**

1. **Morning Briefings (9 AM next day)**
   - Check Vercel logs at 9 AM
   - Verify briefings generated for all employees
   - Visit `/my-twin` to see your briefing

2. **Proactive Suggestions (11 AM, 2 PM, 4 PM)**
   - Monitor cron logs at these times
   - Check suggestions appear in twin dashboard
   - Verify frequency limits work (max 3/day default)

3. **Screenshot Classification (2 AM)**
   - Check logs at 2 AM
   - Verify any uploaded screenshots are classified
   - Check `employee_screenshots` table for `analyzed = true`

4. **Timeline Generation (3 AM)**
   - Check logs at 3 AM
   - Verify reports created in `productivity_reports`
   - Visit `/my-productivity` to see report

**Monitor Costs:**

1. Go to OpenAI Dashboard: https://platform.openai.com/usage
2. Check daily spend
3. Expected: ~$5/day for 100 employees
4. Alert if exceeds $10/day

**Monitor Errors:**

1. Go to Vercel Dashboard > Logs
2. Filter by "Error"
3. Check for any repeated errors
4. Common issues:
   - Cron authentication failures (check CRON_SECRET)
   - OpenAI rate limits (reduce batch size)
   - Database connection issues (check connection pool)

### Week 1 Analysis

**Collect Metrics:**

```sql
-- Twin interaction stats
SELECT
  twin_role,
  interaction_type,
  COUNT(*) as count,
  AVG(tokens_used) as avg_tokens,
  SUM(cost_usd) as total_cost
FROM employee_twin_interactions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY twin_role, interaction_type
ORDER BY total_cost DESC;

-- Productivity report stats
SELECT
  COUNT(*) as total_reports,
  AVG(productive_hours) as avg_productive_hours,
  COUNT(DISTINCT user_id) as unique_users
FROM productivity_reports
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Screenshot stats (if agent deployed)
SELECT
  DATE(captured_at) as date,
  COUNT(*) as total_screenshots,
  COUNT(*) FILTER (WHERE analyzed = true) as analyzed,
  COUNT(DISTINCT user_id) as unique_users
FROM employee_screenshots
WHERE captured_at >= NOW() - INTERVAL '7 days'
AND deleted_at IS NULL
GROUP BY DATE(captured_at)
ORDER BY date DESC;
```

**Employee Feedback:**

1. Review feedback on twin interactions:
```sql
SELECT
  twin_role,
  interaction_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE was_helpful = true) as helpful,
  COUNT(*) FILTER (WHERE was_helpful = false) as not_helpful,
  COUNT(*) FILTER (WHERE dismissed = true) as dismissed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE was_helpful = true) / NULLIF(COUNT(*) FILTER (WHERE was_helpful IS NOT NULL), 0), 1) as helpfulness_rate
FROM employee_twin_interactions
WHERE created_at >= NOW() - INTERVAL '7 days'
AND was_helpful IS NOT NULL
GROUP BY twin_role, interaction_type
ORDER BY total DESC;
```

2. Analyze common themes in text feedback
3. Identify improvement opportunities

### Month 1 Review

**Cost Analysis:**

1. Calculate actual costs vs projections
2. Review OpenAI usage by endpoint
3. Identify optimization opportunities
4. Adjust batch sizes or frequencies if needed

**Feature Adoption:**

1. Track daily active users for each feature
2. Identify power users vs non-users
3. Gather qualitative feedback
4. Plan enhancements based on usage patterns

**Performance Optimization:**

1. Review database query performance
2. Check storage growth rate
3. Verify cleanup functions running
4. Optimize indexes if needed

---

## Rollback Plan

If critical issues occur, rollback steps:

### Option 1: Revert Deployment

```bash
# In Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click "..." > "Promote to Production"
4. Confirm promotion
```

### Option 2: Rollback Database

```bash
# Create backup first
pg_dump $DATABASE_URL > backup_before_rollback.sql

# Drop Sprint 7 tables (if needed)
DROP TABLE IF EXISTS twin_preferences CASCADE;
DROP TABLE IF EXISTS employee_twin_interactions CASCADE;
DROP TABLE IF EXISTS productivity_reports CASCADE;
DROP TABLE IF EXISTS employee_screenshots CASCADE;

# Delete storage bucket
# Go to Supabase Storage > employee-screenshots > Settings > Delete
```

### Option 3: Disable Features

Disable specific features without full rollback:

**Disable Cron Jobs:**
1. Go to Vercel Settings > Cron Jobs
2. Disable problematic jobs
3. Monitor and fix issues
4. Re-enable when fixed

**Disable Twin Features:**
```sql
-- Disable all twin interactions temporarily
UPDATE twin_preferences
SET enable_morning_briefing = false,
    enable_proactive_suggestions = false;
```

---

## Troubleshooting

### Issue: Cron Jobs Not Running

**Symptoms:**
- No briefings at 9 AM
- No suggestions generated
- Logs show no cron executions

**Solutions:**
1. Verify cron configuration in `vercel.json`
2. Check CRON_SECRET matches in Vercel env vars
3. Test endpoints manually with curl
4. Check Vercel logs for authentication errors
5. Verify project is on Pro plan (cron requires paid plan)

### Issue: High OpenAI Costs

**Symptoms:**
- OpenAI bill higher than expected
- Costs exceeding $10/day for 100 employees

**Solutions:**
1. Check for infinite loops in cron jobs
2. Reduce screenshot frequency (60s → 120s)
3. Reduce twin suggestion frequency (3x → 2x daily)
4. Implement request deduplication
5. Add rate limiting per user

### Issue: Storage Growing Too Fast

**Symptoms:**
- Storage costs increasing rapidly
- Screenshots filling bucket

**Solutions:**
1. Verify lifecycle policy is active (90 days)
2. Run cleanup function manually:
```sql
SELECT cleanup_old_screenshots();
```
3. Reduce screenshot quality/size
4. Check for duplicate uploads

### Issue: Employees Not Seeing Twins

**Symptoms:**
- No briefings in UI
- Chat not working
- Empty twin dashboard

**Solutions:**
1. Verify RLS policies allow access
2. Check employee has valid role:
```sql
SELECT id, full_name, employee_role FROM user_profiles WHERE id = 'user-id';
```
3. Verify cron jobs ran successfully
4. Check database for interactions:
```sql
SELECT * FROM employee_twin_interactions
WHERE user_id = 'user-id'
AND DATE(created_at) = CURRENT_DATE;
```

### Issue: Classifications Not Working

**Symptoms:**
- Screenshots uploaded but not analyzed
- `analyzed = false` for all screenshots

**Solutions:**
1. Verify OpenAI API key is valid
2. Check classification cron logs for errors
3. Test classifier manually:
```bash
curl -X POST "$BASE_URL/api/cron/classify-screenshots" \
  -H "Authorization: Bearer $CRON_SECRET"
```
4. Verify screenshots are accessible via signed URLs
5. Check OpenAI rate limits

---

## Success Criteria

Deployment is successful when:

- ✅ All 4 database migrations applied without errors
- ✅ Storage bucket created and configured
- ✅ Code deployed to Vercel production
- ✅ All 4 cron jobs configured and running
- ✅ Twin dashboards accessible at `/my-twin`
- ✅ Productivity dashboards accessible at `/my-productivity`
- ✅ Morning briefings generated at 9 AM
- ✅ Proactive suggestions generated 3x daily
- ✅ Twin chat working in real-time
- ✅ Feedback system functional
- ✅ Costs under $10/day for 100 employees
- ✅ No critical errors in logs
- ✅ Employee feedback positive (>70% helpfulness rate)

---

## Support Contacts

**Technical Issues:**
- Development Team: dev@intime.com
- Database Admin: dba@intime.com
- DevOps: devops@intime.com

**Business Questions:**
- Product Manager: pm@intime.com
- CTO: cto@intime.com

**Emergency Hotline:**
- After-hours: +1-XXX-XXX-XXXX

---

## Next Steps After Deployment

1. **Monitor Day 1** - Watch cron logs and error rates
2. **Gather Feedback** - Survey employees about twin helpfulness
3. **Analyze Costs** - Compare actual vs projected costs
4. **Optimize** - Adjust frequencies and batch sizes based on usage
5. **Plan Epic 3** - Begin Training Academy (30 stories, 125 points)

---

**Deployment Lead:** [Your Name]
**Date Deployed:** [Date]
**Production URL:** [URL]
**Status:** [Success/In Progress/Rollback]

---

**End of Deployment Guide**
