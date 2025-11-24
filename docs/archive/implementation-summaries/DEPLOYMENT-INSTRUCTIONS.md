# Epic 2.5 - AI Infrastructure Deployment Instructions

**Status:** Ready for Manual Deployment
**Generated:** 2025-11-20
**Epic:** 2.5 - AI Infrastructure & Services

---

## 🚨 REQUIRED MANUAL STEPS

Due to Supabase API limitations, the following steps must be completed manually:

### Step 1: Execute Database Migrations (5 minutes)

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy/sql/new
   ```

2. **Copy the entire contents of:**
   ```
   deployment-migrations.sql
   ```

3. **Paste into SQL Editor and click "Run"**

4. **Verify Success:**
   - All 14 tables should be created
   - No error messages
   - Check Tables tab: ai_conversations, ai_embeddings, ai_prompts, etc.

---

### Step 2: Create Storage Bucket (2 minutes)

1. **Navigate to Storage:**
   ```
   https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy/storage/buckets
   ```

2. **Click "New Bucket"**

3. **Configure:**
   - Name: `employee-screenshots`
   - Public: **NO** (Private bucket)
   - File size limit: `5MB`
   - Allowed MIME types: `image/png, image/jpeg, image/webp`

4. **Set Bucket Policies** (Storage > employee-screenshots > Policies):

   **Policy 1: Users can upload own screenshots**
   ```sql
   CREATE POLICY "Users can upload own screenshots"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'employee-screenshots'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 2: Users can view own screenshots**
   ```sql
   CREATE POLICY "Users can view own screenshots"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'employee-screenshots'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **Policy 3: Users can delete own screenshots**
   ```sql
   CREATE POLICY "Users can delete own screenshots"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'employee-screenshots'
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

---

### Step 3: Configure Vercel Environment Variables (3 minutes)

The following environment variables are already configured in `.env.local` but need to be added to Vercel:

1. **Navigate to Vercel Project Settings:**
   ```
   https://vercel.com/intimes-projects-f94edf35/intime-v3/settings/environment-variables
   ```

2. **Add the following variables for Production:**

   ```bash
   # AI Services (REQUIRED for Epic 2.5)
   OPENAI_API_KEY=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

   ANTHROPIC_API_KEY=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

   # Redis for Memory Layer (OPTIONAL - configure when ready)
   REDIS_URL=<your-redis-url>

   # Helicone for Cost Tracking (OPTIONAL)
   HELICONE_API_KEY=<your-helicone-key>
   ```

3. **Click "Save" for each variable**

---

### Step 4: Deploy to Production (1 minute)

Once Steps 1-3 are complete:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **Vercel will auto-deploy** (already configured)

3. **Monitor deployment:**
   ```
   https://vercel.com/intimes-projects-f94edf35/intime-v3
   ```

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] **Database Tables:** 14 new AI tables exist
- [ ] **Storage Bucket:** employee-screenshots bucket created with RLS policies
- [ ] **Environment Variables:** API keys configured in Vercel
- [ ] **Production Deployment:** Latest code deployed successfully
- [ ] **Health Check:** Visit production URL and test AI features

---

## 📊 WHAT WAS DEPLOYED

### AI Agents (7 Total)
1. Code Mentor Agent
2. Resume Builder Agent
3. Interview Coach Agent
4. Project Planner Agent
5. Activity Classifier
6. Timeline Generator
7. Employee Twin (4 personas)

### Infrastructure
- AI Router (model selection)
- RAG System (vector search)
- Memory Layer (Redis + PostgreSQL)
- Cost Tracking (Helicone)
- Prompt Library (10 templates)
- BaseAgent Framework

### Database Schema
- 14 new tables
- 4 new migrations (017-020)
- Complete RLS policies
- Vector search enabled (pgvector)

---

## 🆘 TROUBLESHOOTING

### Issue: Migrations fail in SQL Editor

**Solution:**
- Run migrations one at a time (017, then 018, then 019, then 020)
- Check for existing tables that might conflict
- Ensure pgvector extension is enabled

### Issue: Storage bucket policies not working

**Solution:**
- Verify auth.uid() is working (test with: SELECT auth.uid())
- Check bucket name is exact: 'employee-screenshots'
- Ensure policies are created on storage.objects table

### Issue: AI features not working in production

**Solution:**
- Verify environment variables in Vercel dashboard
- Check API keys are valid and not rate-limited
- Review production logs for errors

---

## 📞 SUPPORT

If you encounter issues:
1. Check production logs: Vercel Dashboard > Logs
2. Check database logs: Supabase Dashboard > Logs
3. Review this deployment report
4. Consult: `/docs/deployment/EPIC-2.5-DEPLOYMENT-REPORT.md`

---

**Total Deployment Time:** ~15 minutes
**Complexity:** Medium (requires manual SQL execution)
**Risk Level:** Low (all migrations are idempotent)
