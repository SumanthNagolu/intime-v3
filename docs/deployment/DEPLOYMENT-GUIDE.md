# InTime v3 - Deployment Guide

## ✅ Completed Steps

1. ✅ All code committed to git (2 commits)
2. ✅ Supabase connection verified and working
3. ✅ Migration scripts prepared (APPLY-MIGRATIONS.sql)
4. ✅ Next.js build successful (104-105 KB total)
5. ✅ TypeScript type checking passed
6. ✅ All dependencies installed

## 🚀 Next Steps (Manual)

### Step 1: Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `intime-v3`
3. Description: "InTime v3 - Multi-Agent Staffing Platform"
4. Visibility: **Private** (recommended)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

### Step 2: Push Code to GitHub

After creating the repository, run:

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/intime-v3.git

# Push all commits
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 3: Apply Database Migrations

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy
2. Navigate to **SQL Editor** in left sidebar
3. Click **New query**
4. Copy contents of `APPLY-MIGRATIONS.sql` (2,822 lines)
5. Paste into SQL Editor
6. Click **Run** to execute

**What gets created:**
- Timeline tables (for project tracking)
- User profiles (unified user table)
- RBAC system (roles, permissions)
- Audit logs (compliance tracking)
- Event bus (cross-module communication)
- RLS policies (database-level security)

### Step 4: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/new
2. Click **Import Project**
3. Select your `intime-v3` repository
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `pnpm build`
   - **Output Directory:** `.next`
   - **Install Command:** `pnpm install`

5. Add Environment Variables (from `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://gkwhxmvugnjwwwiufmdy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[copy from .env.local]
   SUPABASE_SERVICE_ROLE_KEY=[copy from .env.local]
   SUPABASE_DB_URL=[copy from .env.local]
   OPENAI_API_KEY=[copy from .env.local]
   ANTHROPIC_API_KEY=[copy from .env.local]
   NEXT_PUBLIC_APP_URL=[will be provided by Vercel after first deploy]
   ```

6. Click **Deploy**

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to configure project
```

### Step 5: Post-Deployment Configuration

After first deployment:

1. Update `NEXT_PUBLIC_APP_URL` in Vercel environment variables
   - Set to your Vercel deployment URL (e.g., `https://intime-v3.vercel.app`)
2. Redeploy to apply changes

### Step 6: Verify Deployment

1. Visit your deployed URL
2. You should see the minimal landing page
3. Check `/admin/timeline` route works

---

## 📊 Current Build Stats

```
Route (app)                                 Size  First Load JS
┌ ○ /                                    2.48 kB         104 kB
├ ○ /_not-found                            997 B         103 kB
└ ƒ /admin/timeline                      2.85 kB         105 kB
+ First Load JS shared by all             102 kB
```

- ○ (Static) = Pre-rendered at build time
- ƒ (Dynamic) = Server-rendered on demand

---

## 🔐 Security Notes

1. **Never commit `.env.local`** to git (already in `.gitignore`)
2. **Rotate keys** if accidentally exposed:
   - Supabase: Project Settings → API → Reset anon/service keys
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys
3. **Vercel Environment Variables** are encrypted and never exposed in logs

---

## 🎯 What's Deployed

### Currently Available:
- ✅ Landing page (minimal design)
- ✅ Admin timeline page (placeholder)
- ✅ Next.js 15 App Router
- ✅ TypeScript strict mode
- ✅ Tailwind CSS styling
- ✅ Environment configuration

### Not Yet Implemented (Epic 1):
- ❌ Database schema (migrations written, not applied)
- ❌ Authentication system
- ❌ RBAC middleware
- ❌ Event bus
- ❌ tRPC API
- ❌ Testing infrastructure
- ❌ Monitoring (Sentry)

---

## 📈 Next Development Steps

After deployment:

1. **Apply migrations** (Step 3 above) - enables database functionality
2. **Implement Epic 1 Sprint 1** (Week 1-2):
   - FOUND-001: Database schema ✅ (written, needs apply)
   - FOUND-002: RBAC system ✅ (written, needs apply)
   - FOUND-003: Audit tables ✅ (written, needs apply)
   - FOUND-004: RLS policies ✅ (written, needs apply)
   - FOUND-005: Supabase Auth (implement)
   - FOUND-006: Role assignment (implement)

3. **Set up CI/CD** (FOUND-016):
   - GitHub Actions for automated testing
   - Preview deployments for PRs

4. **Add monitoring** (FOUND-018):
   - Sentry error tracking
   - Performance monitoring

---

## 📚 Documentation

- **Epic Planning:** `docs/planning/epics/`
- **User Stories:** `docs/planning/stories/`
- **Architecture:** `docs/architecture/`
- **Database Migrations:** `src/lib/db/migrations/`

---

## 🆘 Troubleshooting

### Build Fails on Vercel

- Check environment variables are set correctly
- Verify Node.js version (18+ required)
- Check build logs for TypeScript errors

### Database Connection Fails

- Verify Supabase credentials in environment variables
- Check IP allowlist in Supabase (Settings → Database → Connection Pooling)
- Ensure RLS policies applied after migrations

### Deployment Shows Blank Page

- Check browser console for errors
- Verify `NEXT_PUBLIC_APP_URL` is set correctly
- Check Vercel function logs

---

**Status:** ✅ Ready to deploy (manual steps required)
**Commits:** 2 commits, 229 files, 55,797 insertions
**Build:** Production-ready, type-safe, optimized
**Next:** Create GitHub repo → Push → Apply migrations → Deploy to Vercel
