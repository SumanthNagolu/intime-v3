# Development Authentication Setup

## Problem
Supabase requires email confirmation by default, making local development difficult with test emails like `testuser@example.com`.

## Solution: Configure Supabase for Development

### Option 1: Disable Email Confirmation (Easiest)

**Recommended for local development**

1. Go to your Supabase Dashboard:
   - URL: https://app.supabase.com/project/gkwhxmvugnjwwwiufmdy/auth/settings

2. Navigate to **Authentication > Settings**

3. Find **"Email Auth"** section

4. **Disable** "Confirm email" checkbox
   - This allows users to sign in immediately without email verification

5. **Enable** "Enable email signups" (should already be on)

6. **Save changes**

### Option 2: Use Local Supabase (Advanced)

For complete isolation, use Supabase CLI with local database:

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# This gives you:
# - Local PostgreSQL database
# - Local Auth service (no email confirmation required)
# - Local Storage service
# - Studio UI at http://localhost:54323
```

Then update your `.env.local`:
```env
# Use local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
```

### Option 3: Auto-Confirm via Admin API (Code-based)

Create a development-only signup function that bypasses email confirmation:

```typescript
// src/lib/auth/dev-signup.ts
import { createClient } from '@supabase/supabase-js';

// Only available in development
export async function devSignUp(email: string, password: string) {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Dev signup only available in development mode');
  }

  // Use admin client with service role key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Create user with auto-confirm
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      full_name: 'Test User',
    },
  });

  return { data, error };
}
```

## Recommended Approach

**For Development:** Use **Option 1** (Disable Email Confirmation)
- Fastest to set up
- No code changes required
- Easy to toggle back for production

**For Production:** Re-enable email confirmation
- Go to Supabase Dashboard
- Enable "Confirm email" checkbox
- Configure SMTP provider (Resend, SendGrid, etc.)

## Testing After Setup

After disabling email confirmation, test signup:

```bash
# Start dev server
pnpm dev

# Navigate to http://localhost:3000/signup

# Try signing up with:
Email: testuser@example.com
Password: Test123456!
Full Name: Test User
Role: Student
```

You should be able to:
1. Sign up successfully ✅
2. Be automatically logged in ✅
3. Access the dashboard ✅

## Environment-Specific Configuration

### Development (.env.local)
```env
# No email confirmation required
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Production (Vercel Environment Variables)
```env
# Email confirmation enabled in Supabase dashboard
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production

# Optional: Configure SMTP
RESEND_API_KEY=re_your_key_here
REMINDER_EMAIL_FROM="noreply@yourdomain.com"
```

## Troubleshooting

### Issue: "Email address is invalid"
- **Cause:** Supabase email validation or confirmation required
- **Fix:** Disable "Confirm email" in Supabase dashboard

### Issue: "User already exists"
- **Cause:** Email already registered
- **Fix:** Delete user from Supabase dashboard > Authentication > Users
- Or use a different test email

### Issue: "Failed to create user profile"
- **Cause:** Database trigger or RLS policy blocking insert
- **Fix:** Check Supabase logs and RLS policies

### Issue: Can't access dashboard after signup
- **Cause:** Email not confirmed
- **Fix:** Either disable email confirmation, or manually confirm user in Supabase dashboard

## Security Notes

⚠️ **Never disable email confirmation in production**
- Only disable for local development
- Production should always verify emails
- Use environment variables to control behavior

✅ **Production Checklist**
- [ ] Email confirmation enabled in Supabase
- [ ] SMTP provider configured (Resend, etc.)
- [ ] Email templates customized
- [ ] Rate limiting enabled
- [ ] CAPTCHA configured (optional)

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Email Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
