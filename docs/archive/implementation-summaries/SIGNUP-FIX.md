# Signup Issue Fix - Quick Guide

## The Problem
Signup fails with "Email address is invalid" because Supabase requires email confirmation by default.

## The Solution (2 minutes)

### Step 1: Disable Email Confirmation in Supabase

**Click this link:** https://app.supabase.com/project/gkwhxmvugnjwwwiufmdy/auth/settings

1. Scroll down to **"Email Auth"** section
2. Find **"Confirm email"** checkbox
3. **UNCHECK** the "Confirm email" box
4. Click **"Save"** at the bottom

That's it! 🎉

### Step 2: Test It

```bash
# Option 1: Use the test script
pnpm test:auth

# Option 2: Test in browser
pnpm dev
# Visit http://localhost:3000/signup
# Try: testuser@example.com / Test123456!
```

## Why This Happens

Supabase's default behavior:
- ✅ Production-ready (requires email verification)
- ❌ Development-unfriendly (can't test with fake emails)

By disabling email confirmation:
- ✅ Can test with any email (testuser@example.com works!)
- ✅ Users can sign in immediately
- ⚠️ Remember to re-enable before production

## What Got Changed

### New Files Created
1. **docs/setup/DEVELOPMENT-AUTH-SETUP.md** - Complete guide
2. **scripts/test-auth.ts** - Interactive auth testing tool
3. **scripts/setup-dev-auth.sh** - Quick setup helper

### Package.json Update
Added: `"test:auth": "tsx scripts/test-auth.ts"`

### Code Changes
- Fixed redirect URL in auth.ts (uses NEXT_PUBLIC_APP_URL)
- No other code changes needed!

## Quick Commands

```bash
# Run setup helper (shows links)
bash scripts/setup-dev-auth.sh

# Test authentication
pnpm test:auth

# Start dev server
pnpm dev
```

## Before Production

⚠️ **IMPORTANT:** Before deploying to production:

1. Re-enable email confirmation in Supabase dashboard
2. Configure SMTP provider (Resend, SendGrid, etc.)
3. Test email verification flow
4. Customize email templates

See: `docs/setup/DEVELOPMENT-AUTH-SETUP.md` for production setup.

## Additional Links

- **Auth Settings:** https://app.supabase.com/project/gkwhxmvugnjwwwiufmdy/auth/settings
- **Manage Users:** https://app.supabase.com/project/gkwhxmvugnjwwwiufmdy/auth/users
- **Database Tables:** https://app.supabase.com/project/gkwhxmvugnjwwwiufmdy/database/tables

## Need Help?

Check the full documentation:
- `docs/setup/DEVELOPMENT-AUTH-SETUP.md` - Complete setup guide
- `scripts/test-auth.ts` - Interactive testing tool
- Or ask in the team chat!

---

**TL;DR:** Go to the Auth Settings link above, uncheck "Confirm email", save. Done! ✅
