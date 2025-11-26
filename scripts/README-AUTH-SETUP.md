# Authentication & Test Users

## Problem

The seed script (`supabase/seeds/test_data.sql`) creates user records in the `user_profiles` table, but **does not create Supabase Auth accounts**. The login form authenticates against Supabase Auth, not the application database.

**Two Separate Systems:**
1. **Supabase Auth** - Handles authentication (login/signup)
2. **Application Database** - Stores user profiles and business data

For users to login, they must exist in **both systems**.

---

## Solution

Use the `seed-auth-users.ts` script to create Supabase Auth users for all test accounts.

### Step 1: Run the Auth Seeding Script

```bash
# Make sure you have environment variables set in .env.local
# Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

tsx scripts/seed-auth-users.ts
```

This will create Supabase Auth accounts for all test users with the default password: **`Test1234!`**

### Step 2: Test Login

Navigate to any auth page:
- **Academy**: http://localhost:3000/auth/academy
- **Client Portal**: http://localhost:3000/auth/client
- **Talent Portal**: http://localhost:3000/auth/talent
- **Employee Portal**: http://localhost:3000/auth/employee

Use any test credentials:

```
Email: student@intime.com
Password: Test1234!
```

```
Email: admin@intime.com
Password: Test1234!
```

All test users use the same password for convenience.

---

## Test User Credentials

### Leadership & Admin
- `ceo@intime.com` - Sumanth Nagolu (CEO)
- `admin@intime.com` - System Administrator
- `hr@intime.com` - HR Manager

### Training Academy (Pillar 1)
- `student@intime.com` - John Student (68% progress)
- `student1@intime.com` - Jane Learner (25% progress)
- `student2@intime.com` - Bob Graduate (Completed with certificate)
- `trainer@intime.com` - Senior Trainer

### Recruiting Services (Pillar 2)
- `sr_rec@intime.com` - Alice Senior Recruiter
- `jr_rec@intime.com` - Bob Junior Recruiter
- `sr_rec2@intime.com` - Carol Senior Recruiter
- `jr_rec2@intime.com` - David Junior Recruiter

### Bench Sales (Pillar 3)
- `sr_bs@intime.com` - Eve Senior Bench Sales
- `jr_bs@intime.com` - Frank Junior Bench Sales
- `sr_bs2@intime.com` - Grace Senior Bench Sales
- `jr_bs2@intime.com` - Henry Junior Bench Sales

### Talent Acquisition (Pillar 4)
- `sr_ta@intime.com` - Ivy Senior TA
- `jr_ta@intime.com` - Jack Junior TA

### Candidates
- `candidate@intime.com` - Active Candidate (5 years Java/Spring)
- `candidate1@intime.com` - Bench Consultant (7 years Guidewire)
- `candidate2@intime.com` - Placed Consultant (Salesforce)
- `candidate3@intime.com` - Inactive Candidate (Python)

### Clients
- `client@intime.com` - TechCorp USA (Strategic tier)
- `client1@intime.com` - HealthPlus Inc (Preferred tier)
- `client2@intime.com` - FinanceHub (Exclusive tier)

**Password for all:** `Test1234!`

---

## How Authentication Works

### Registration Flow (New Users)

1. User fills out signup form
2. `signUp()` creates Supabase Auth user
3. Supabase Auth triggers webhook (optional)
4. Application creates user profile in `user_profiles` table
5. User receives email verification
6. User confirms email and can login

### Login Flow (Existing Users)

1. User enters email/password
2. `signIn()` authenticates against Supabase Auth
3. If successful, Supabase returns session token
4. Middleware validates session on each request
5. Server Components fetch user profile from `user_profiles` using `auth.getUser()`

### Session Management

- **Middleware**: Refreshes sessions, protects routes
- **Client Components**: Use `signIn()`, `signOut()`, `getCurrentUser()`
- **Server Components**: Use `createClient()` from `@/lib/supabase/server`

---

## Development Tips

### Clear Session (Logout)

If you're stuck with an old session, clear cookies in browser:

```javascript
// Run in browser console
document.cookie.split(";").forEach(cookie => {
  document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
});
location.reload();
```

### Check Current User (Server)

```typescript
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Check Current User (Client)

```typescript
import { getCurrentUser } from '@/lib/auth/client';

const user = await getCurrentUser();
console.log('Current user:', user);
```

### Verify User Profile Exists

```typescript
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const profile = await db.query.userProfiles.findFirst({
  where: eq(userProfiles.email, 'student@intime.com')
});
console.log('Profile:', profile);
```

---

## Common Issues

### Issue: "Invalid login credentials"

**Cause**: Auth user doesn't exist in Supabase Auth (only in `user_profiles`)

**Fix**: Run `tsx scripts/seed-auth-users.ts`

### Issue: "Email not confirmed"

**Cause**: Email verification required in production mode

**Fix 1**: Use the seeding script (auto-confirms emails)
**Fix 2**: Check Supabase email settings (disable confirmation for development)

### Issue: Redirects to 404 after login

**Cause**: The redirect path doesn't exist yet

**Fix**: Check `config.redirectPath` in `AuthPage.tsx` and create the corresponding page

### Issue: "Session expired" immediately after login

**Cause**: Cookie/session configuration issue

**Fix**: Check middleware cookie handling and Supabase client configuration

---

## Production Considerations

### Security Checklist

- [ ] Change default test passwords before production
- [ ] Enable email confirmation
- [ ] Set up proper password policies
- [ ] Configure rate limiting on auth endpoints
- [ ] Set up MFA (Multi-Factor Authentication)
- [ ] Review and lock down RLS policies
- [ ] Rotate service role keys regularly

### Email Configuration

For production, configure Supabase email settings:
1. Custom SMTP server (SendGrid, Mailgun, etc.)
2. Custom email templates
3. Email verification required
4. Password reset flow

### OAuth Providers

Current implementation supports:
- ✅ Google OAuth (configured)
- 🚧 GitHub, Microsoft, Apple (easy to add)

To add more providers, update `signInWithOAuth()` in `lib/auth/client.ts`

---

## Next Steps

After seeding auth users:

1. ✅ Run `tsx scripts/seed-auth-users.ts`
2. ✅ Test login with `student@intime.com` / `Test1234!`
3. 🚧 Create dashboard pages for each portal
4. 🚧 Implement role-based redirects after login
5. 🚧 Set up user profile sync (auth.user ↔ user_profiles)
6. 🚧 Add password reset functionality
7. 🚧 Implement session refresh logic

---

## Files Reference

### Authentication Files
- `src/lib/auth/client.ts` - Client-side auth functions
- `src/lib/auth/server.ts` - Server-side auth helpers
- `src/lib/supabase/client.ts` - Supabase client (browser)
- `src/lib/supabase/server.ts` - Supabase client (server)
- `src/middleware.ts` - Route protection & session refresh

### Auth UI Components
- `src/components/auth/AuthPage.tsx` - Universal auth page
- `src/app/auth/academy/page.tsx` - Academy auth
- `src/app/auth/client/page.tsx` - Client auth
- `src/app/auth/talent/page.tsx` - Talent auth
- `src/app/auth/employee/page.tsx` - Employee auth

### Seeding Scripts
- `supabase/seeds/test_data.sql` - Database seed (user profiles)
- `scripts/seed-auth-users.ts` - Auth users seed (Supabase Auth)

---

**Last Updated**: 2025-11-25
**Status**: Auth system functional, test users ready

