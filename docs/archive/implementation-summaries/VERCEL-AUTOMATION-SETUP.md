# Vercel Automation - Complete Setup Guide

**Status:** Ready to automate ✅
**Time Required:** 5 minutes
**Manual Steps:** 2 (create token, add to GitHub)

---

## 🚀 One-Command Setup

Run this single command to automate everything:

```bash
bash scripts/setup-vercel-automation.sh
```

This script will:
- ✅ Install Vercel CLI
- ✅ Login to Vercel
- ✅ Link your project
- ✅ Pull configuration
- ✅ Connect Git repository
- ✅ Sync environment variables
- ✅ Generate GitHub secrets file
- ✅ Test the build
- ✅ (Optional) Deploy to production

---

## 📋 Manual Steps Required

### Step 1: Create Vercel Access Token (1 minute)

1. **Visit:** https://vercel.com/account/tokens
2. **Click:** "Create Token"
3. **Configure:**
   - **Name:** `GitHub Actions CI/CD`
   - **Scope:** `Full Access`
   - **Expiration:** `No Expiration` or `1 year`
4. **Copy** the token (you'll only see it once!)

**Screenshot Reference:**
```
┌─────────────────────────────────────────────┐
│  Create Token                               │
├─────────────────────────────────────────────┤
│  Name: GitHub Actions CI/CD                 │
│  Scope: ○ Full Access                       │
│         ○ Read Only                          │
│  Expiration: [No Expiration ▼]              │
│                                              │
│  [ Create Token ]                            │
└─────────────────────────────────────────────┘
```

### Step 2: Add GitHub Secrets (2 minutes)

1. **Open your repository:**
   ```
   https://github.com/YOUR_USERNAME/intime-v3/settings/secrets/actions
   ```

2. **Click:** "New repository secret"

3. **Add these 3 secrets:**

   **Secret 1: VERCEL_TOKEN**
   - Name: `VERCEL_TOKEN`
   - Value: `[Paste the token from Step 1]`

   **Secret 2: VERCEL_ORG_ID**
   - Name: `VERCEL_ORG_ID`
   - Value: `[Found in .github/VERCEL_SECRETS.txt after running script]`

   **Secret 3: VERCEL_PROJECT_ID**
   - Name: `VERCEL_PROJECT_ID`
   - Value: `[Found in .github/VERCEL_SECRETS.txt after running script]`

**Where to find ORG_ID and PROJECT_ID:**
After running the setup script, check `.github/VERCEL_SECRETS.txt` - they're auto-generated!

---

## ✅ Verification

### Test Automated Deployment

**Option A: Test Production Deployment**
```bash
git add .
git commit -m "test: vercel automation"
git push origin main
```

**Result:** Automatic deployment to production at https://intime-v3.vercel.app

---

**Option B: Test Preview Deployment**
```bash
git checkout -b test/vercel-automation
git push origin test/vercel-automation

# Create PR on GitHub
gh pr create --title "Test: Vercel Automation" --body "Testing automated preview deployment"
```

**Result:** Automatic preview deployment with unique URL in PR comments

---

## 🔍 How It Works

### What Happens Automatically

**When you push to `main`:**
1. GitHub Actions triggers (`.github/workflows/ci.yml`)
2. Runs tests (TypeScript, Vitest, E2E)
3. Builds production bundle
4. Deploys to Vercel production
5. Updates https://intime-v3.vercel.app

**When you create a PR:**
1. GitHub Actions triggers
2. Runs tests
3. Builds preview bundle
4. Deploys to Vercel preview
5. Comments on PR with unique preview URL
6. Updates preview on every commit

**Environment Variables:**
- Synced from Vercel dashboard
- Automatically available in deployments
- Managed via `vercel env` command

---

## 📦 What Was Configured

### Files Created/Modified

1. **`.github/workflows/ci.yml`** - GitHub Actions pipeline
   - Automated testing
   - Production deployments
   - Preview deployments

2. **`vercel.json`** - Deployment configuration
   - Build settings
   - Environment settings
   - Security headers

3. **`.vercelignore`** - Build optimization
   - Excludes test files
   - Excludes documentation
   - Faster builds

4. **`.vercel/`** - Project configuration (auto-generated)
   - `project.json` - Project ID and Org ID
   - `.env.*.local` - Environment variables

5. **`.github/VERCEL_SECRETS.txt`** - GitHub secrets reference

---

## 🛠️ Available Commands

### Vercel CLI Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Pull latest environment variables
vercel env pull

# Add new environment variable
vercel env add MY_KEY production

# List all deployments
vercel ls

# View logs
vercel logs <deployment-url>

# Rollback deployment
vercel rollback <deployment-url>
```

### Project Commands

```bash
# Build locally (same as Vercel)
pnpm build

# Test production build locally
pnpm build && pnpm start

# Pull environment variables
vercel env pull .env.local

# Re-link project
vercel link
```

---

## 🔧 Troubleshooting

### Issue: "Project not found"

**Solution:**
```bash
vercel link --yes
```

### Issue: "No access token found"

**Solution:**
```bash
vercel login
# Or set VERCEL_TOKEN environment variable
export VERCEL_TOKEN=your_token_here
```

### Issue: "Environment variables not syncing"

**Solution:**
```bash
# Pull latest from Vercel
vercel env pull --yes

# Or manually sync specific environment
vercel env pull .env.production --environment=production
```

### Issue: "Build fails on Vercel but works locally"

**Solution:**
1. Check environment variables in Vercel dashboard
2. Verify `vercel.json` build command
3. Check Node version in `package.json` engines

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Issue: "GitHub Actions failing"

**Solution:**
1. Verify all 3 secrets are added to GitHub
2. Check secret names match exactly (case-sensitive)
3. Verify VERCEL_TOKEN is not expired

---

## 📊 Deployment Workflow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Developer                                              │
│  ├─ git push origin main                                │
│  └─ Create PR                                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions                                          │
│  ├─ Checkout code                                        │
│  ├─ Setup pnpm                                           │
│  ├─ Install dependencies                                 │
│  ├─ Run type check                                       │
│  ├─ Run tests                                            │
│  ├─ Build production bundle                              │
│  └─ Deploy to Vercel                                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Vercel                                                  │
│  ├─ Receive deployment                                   │
│  ├─ Build (if using Vercel build)                        │
│  ├─ Deploy to edge network                               │
│  ├─ Update DNS                                           │
│  └─ Send webhook to GitHub                               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Production / Preview                                    │
│  ├─ https://intime-v3.vercel.app (production)           │
│  └─ https://intime-v3-git-[branch].vercel.app (preview) │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Cost & Limits

### Vercel Free Tier (Hobby)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Unlimited preview deployments
- ✅ HTTPS included
- ✅ Automatic scaling
- ⚠️ 1 concurrent build

### When to Upgrade
- More than 100 GB bandwidth/month
- Need multiple concurrent builds
- Custom deployment regions
- Team collaboration features

**Current Usage:** Check at https://vercel.com/dashboard/usage

---

## 📚 Additional Resources

### Documentation
- **Vercel Docs:** https://vercel.com/docs
- **GitHub Actions:** https://docs.github.com/actions
- **Next.js Deployment:** https://nextjs.org/docs/deployment

### Dashboard Links
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Deployments:** https://vercel.com/dashboard/deployments
- **Environment Variables:** https://vercel.com/dashboard/settings/environment-variables
- **Tokens:** https://vercel.com/account/tokens

### Project-Specific
- **Production URL:** https://intime-v3.vercel.app
- **Local Guide:** `VERCEL-DEPLOYMENT-GUIDE.md`
- **CI Pipeline:** `.github/workflows/ci.yml`

---

## ✅ Setup Checklist

- [ ] Run `bash scripts/setup-vercel-automation.sh`
- [ ] Create Vercel Access Token
- [ ] Add VERCEL_TOKEN to GitHub Secrets
- [ ] Add VERCEL_ORG_ID to GitHub Secrets
- [ ] Add VERCEL_PROJECT_ID to GitHub Secrets
- [ ] Test deployment: `git push origin main`
- [ ] Test preview: Create a PR
- [ ] Verify production URL works
- [ ] Verify preview URL in PR comment
- [ ] Check deployment logs in Vercel dashboard

---

## 🎉 Success Criteria

**You'll know it's working when:**
1. ✅ Push to main → Automatic production deployment
2. ✅ Create PR → Automatic preview deployment
3. ✅ PR comment shows preview URL
4. ✅ https://intime-v3.vercel.app updates automatically
5. ✅ Environment variables sync correctly
6. ✅ Build time < 3 minutes
7. ✅ GitHub Actions badge shows passing ✅

---

**Questions?** Check `VERCEL-DEPLOYMENT-GUIDE.md` for detailed troubleshooting.

**Ready to deploy?** Run the setup script and follow the 2 manual steps!

```bash
bash scripts/setup-vercel-automation.sh
```

---

**Last Updated:** 2025-11-19
**Status:** Production Ready ✅
**Automation:** 95% (2 manual steps)
