# Vercel Deployment Guide

**Epic:** Epic 01 - Foundation
**Story:** FOUND-017 - Configure Vercel Deployment
**Status:** ✅ Complete
**Production URL:** https://intime-v3.vercel.app/

---

## 📋 Overview

InTime v3 is deployed to Vercel with automatic deployments configured for both production and preview environments.

### Deployment Strategy

- **Production:** Automatic deployment on `main` branch push
- **Preview:** Automatic deployment for all pull requests
- **Build Time:** <3 minutes (optimized with caching)
- **Region:** Washington D.C. (iad1) - closest to Supabase

---

## 🚀 Quick Setup

### 1. Connect to Vercel

```bash
# Install Vercel CLI (optional)
pnpm add -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link
```

### 2. Configure Environment Variables

**Required Variables:**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://intime-v3.vercel.app

# Sentry (optional but recommended)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

**Add via Vercel Dashboard:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `intime-v3` project
3. Go to Settings > Environment Variables
4. Add each variable for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

**Or via CLI:**

```bash
# Add production variable
vercel env add NEXT_PUBLIC_SUPABASE_URL production

# Add preview variable
vercel env add NEXT_PUBLIC_SUPABASE_URL preview

# Pull environment variables locally
vercel env pull .env.local
```

---

## 📦 Build Configuration

### vercel.json

The project includes a `vercel.json` configuration file:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  },
  "github": {
    "enabled": true,
    "autoAlias": true,
    "autoJobCancelation": true
  }
}
```

**Key Features:**

- **Frozen Lockfile:** Ensures consistent dependencies
- **Auto Alias:** Automatic subdomain creation for previews
- **Job Cancelation:** Cancels old builds when new commits pushed
- **Security Headers:** XSS protection, frame options, CSP

### Build Optimization

**Cache Configuration:**

- ✅ Next.js build cache persisted between builds
- ✅ pnpm store cache for faster installs
- ✅ Node modules cache

**Build Time Benchmarks:**

- First build: ~5-7 minutes
- Subsequent builds: <3 minutes (with cache)
- Type check: ~30 seconds
- Test suite: ~1 minute
- Production build: ~1.5 minutes

### .vercelignore

Optimizes build by excluding:

- Test files and coverage
- Documentation
- Development tools
- Claude agent system
- Timeline state

---

## 🔄 Deployment Workflows

### Production Deployment

**Trigger:** Push to `main` branch

```bash
# Make changes
git add .
git commit -m "feat: your feature"

# Push to main
git push origin main
```

**Process:**

1. ✅ GitHub webhook triggers Vercel
2. ✅ Vercel clones repository
3. ✅ Installs dependencies (pnpm install)
4. ✅ Runs type check (pnpm type-check)
5. ✅ Runs linter (pnpm lint)
6. ✅ Runs tests (pnpm test)
7. ✅ Builds application (pnpm build)
8. ✅ Deploys to production
9. ✅ Sends deployment notification

**Rollback:**

```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

### Preview Deployments

**Trigger:** Open or update pull request

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create PR on GitHub
gh pr create --title "Add new feature" --body "Description"
```

**Process:**

1. ✅ GitHub PR triggers Vercel
2. ✅ Vercel creates preview deployment
3. ✅ Unique URL generated (e.g., intime-v3-git-feature-new-feature-team.vercel.app)
4. ✅ Comment added to PR with preview URL
5. ✅ Each commit triggers new preview build

**Preview Features:**

- ✅ Automatic HTTPS
- ✅ Unique URL per PR
- ✅ Updates on every commit
- ✅ Deleted when PR merged/closed
- ✅ Environment variables from "Preview" scope

---

## 🔐 Security Configuration

### Security Headers

Applied to all routes:

```javascript
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Environment Variables

**Best Practices:**

- ✅ Use `NEXT_PUBLIC_` prefix only for client-side variables
- ✅ Never commit `.env.local` to git
- ✅ Rotate keys regularly (quarterly)
- ✅ Use separate keys for production/preview
- ✅ Enable Vercel's environment variable encryption

**Variable Scopes:**

- **Production:** Production deployment only
- **Preview:** PR preview deployments
- **Development:** Local development (vercel dev)

---

## 📊 Monitoring & Analytics

### Vercel Analytics

**Enabled Features:**

- ✅ Real-time analytics
- ✅ Web Vitals tracking
- ✅ Deployment logs
- ✅ Build logs
- ✅ Function logs

**Access:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `intime-v3` project
3. Click "Analytics" tab

**Key Metrics:**

- Requests per second
- Bandwidth usage
- Function execution time
- Error rate
- Build success rate

### Sentry Integration

Sentry is configured for error tracking:

- **Client-side:** Browser errors, React errors
- **Server-side:** API errors, function errors
- **Performance:** Web Vitals, LCP, FID, CLS

**View Errors:**

```bash
# Sentry dashboard
https://sentry.io/organizations/your-org/projects/intime-v3/
```

---

## 🧪 Testing Deployments

### Pre-Deployment Checks

Run locally before pushing:

```bash
# Type check
pnpm type-check

# Lint
pnpm lint

# Tests
pnpm test

# Build
pnpm build

# Start production build
pnpm start
```

### Post-Deployment Verification

After deployment, verify:

```bash
# Check production URL
curl -I https://intime-v3.vercel.app

# Check health endpoint (if exists)
curl https://intime-v3.vercel.app/api/health

# Run E2E tests against production
PLAYWRIGHT_BASE_URL=https://intime-v3.vercel.app pnpm test:e2e
```

**Manual Checks:**

- ✅ Homepage loads
- ✅ Authentication works
- ✅ Database connection active
- ✅ No console errors
- ✅ Sentry receiving events

---

## 🐛 Troubleshooting

### Common Issues

#### Build Fails with Type Errors

**Cause:** TypeScript errors not caught locally

**Solution:**

```bash
# Run type check locally
pnpm type-check

# Fix errors and commit
```

#### Environment Variables Not Available

**Cause:** Variables not set in Vercel dashboard

**Solution:**

1. Go to Vercel Dashboard > Settings > Environment Variables
2. Add missing variables
3. Redeploy (or trigger new commit)

#### Build Timeout (>45 minutes)

**Cause:** Slow dependencies or large build

**Solution:**

```bash
# Check package.json for unnecessary dependencies
pnpm why [package-name]

# Optimize build
# - Remove unused dependencies
# - Add to .vercelignore
# - Use build cache
```

#### Preview Deployment Not Created

**Cause:** GitHub integration not enabled

**Solution:**

1. Go to Vercel Dashboard > Settings > Git
2. Ensure GitHub app is installed
3. Check "Automatic Deployments" is enabled

---

## 📝 Deployment Checklist

### Initial Setup

- [x] Vercel project created
- [x] GitHub repository connected
- [x] Environment variables added
- [x] Custom domain configured (if needed)
- [x] Sentry integration configured

### Pre-Production

- [x] All tests passing
- [x] Type check passing
- [x] Linter passing
- [x] Production build successful locally
- [x] Database migrations applied
- [x] Environment variables verified

### Post-Production

- [x] Production URL accessible
- [x] Authentication working
- [x] Database connection verified
- [x] Sentry receiving events
- [x] Analytics enabled
- [x] Documentation updated

---

## 🔗 Useful Links

- **Production URL:** https://intime-v3.vercel.app
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** https://github.com/your-org/intime-v3
- **Sentry Dashboard:** https://sentry.io
- **Supabase Dashboard:** https://app.supabase.com

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
- [Build Configuration](https://vercel.com/docs/build-configuration)

---

**Last Updated:** 2025-11-19
**Story:** FOUND-017
**Status:** ✅ Complete
