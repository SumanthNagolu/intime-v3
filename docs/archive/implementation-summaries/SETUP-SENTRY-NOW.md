# 🔍 Configure Sentry - Quick Guide

## What You Need to Do (5 minutes)

Get your Sentry DSN and add it to `.env.local`

---

## Step 1: Create/Access Sentry Project

### Option A: New Sentry Account
1. Go to: https://sentry.io/signup/
2. Sign up (free tier is fine)
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **intime-v3**
   - Alert frequency: **On every new issue** (recommended)

### Option B: Existing Sentry Account
1. Go to: https://sentry.io/
2. Login
3. Click "Projects" → "Create Project"
4. Select **Next.js** platform
5. Name it **intime-v3**

---

## Step 2: Get Your DSN

After creating the project:

1. You'll see a setup page with your **DSN**
2. It looks like: `https://xxxxxxxxxxxx@o123456.ingest.sentry.io/7654321`
3. **Copy this DSN**

**OR** if you missed it:
1. Go to: Settings → Projects → intime-v3 → Client Keys (DSN)
2. Copy the DSN shown

---

## Step 3: Add DSN to Environment

Open `.env.local` and add these lines:

```bash
# Sentry Error Tracking
SENTRY_DSN=<paste-your-dsn-here>
NEXT_PUBLIC_SENTRY_DSN=<paste-your-dsn-here>
```

**Example:**
```bash
SENTRY_DSN=https://xxxxxxxxxxxx@o123456.ingest.sentry.io/7654321
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxxxxx@o123456.ingest.sentry.io/7654321
```

---

## Step 4: Test Sentry (Optional)

After deployment, you can test error tracking:

1. Visit your app
2. Trigger an error (click a broken button)
3. Check Sentry dashboard - should see the error logged

---

## ✅ Done!

Sentry is now configured. Errors will be automatically tracked in production.

---

## 🔧 Sentry Configuration Details

We've already set up Sentry with:

✅ PII scrubbing (emails, passwords, cookies removed)
✅ 10% sampling rate (reduces costs)
✅ Error boundaries for React errors
✅ Custom error pages (404, 500)
✅ Environment tagging (dev/staging/prod)

You don't need to do anything else - just provide the DSN!

---

## 💰 Cost

**Free Tier:**
- 5,000 errors/month
- 10,000 performance transactions/month
- 30-day error retention

This should be plenty for MVP stage.

---

## 🆘 Troubleshooting

### Can't find my DSN
- Go to: Settings → Projects → [your-project] → Client Keys (DSN)
- Should be visible at top

### Getting rate limit errors
- You're on free tier and exceeded 5,000 errors/month
- Either upgrade or reduce error logging

### Not seeing errors in Sentry
- Check `.env.local` has correct DSN
- Make sure it's `SENTRY_DSN` not `SENTRY_URL`
- Rebuild and redeploy: `pnpm build`

---

**Need help?** Let me know and I'll assist!
