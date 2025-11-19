# FOUND-005: Configure Supabase Auth with Email/Password

**Story Points:** 5
**Sprint:** Sprint 1 (Week 1-2)
**Priority:** CRITICAL

---

## User Story

As a **new user**,
I want **to sign up and log in using email/password**,
So that **I can access the platform securely**.

---

## Acceptance Criteria

- [ ] Supabase Auth configured with email/password provider
- [ ] Email confirmation enabled (with customizable templates)
- [ ] Password reset flow implemented
- [ ] Auth state managed in client and server components
- [ ] Protected routes redirect to login
- [ ] Session persists across page refreshes
- [ ] Logout functionality works correctly
- [ ] Error handling for invalid credentials, duplicate emails

---

## Technical Implementation

### Supabase Configuration

1. **Enable Email Provider** in Supabase Dashboard:
   - Navigate to Authentication → Providers
   - Enable "Email" provider
   - Configure email templates (welcome, password reset)
   - Set site URL: `https://your-domain.com`
   - Add redirect URLs for development: `http://localhost:3000`

2. **Email Templates**:

**Welcome Email:**
```html
<h2>Welcome to InTime! 🎉</h2>
<p>Thank you for joining InTime. Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
<p>If you didn't create this account, you can safely ignore this email.</p>
```

**Password Reset:**
```html
<h2>Reset Your Password</h2>
<p>Someone requested a password reset for your InTime account.</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link expires in 1 hour.</p>
```

### Auth Helpers

Create file: `src/lib/auth/server.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function getSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error);
    return null;
  }

  return session;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting user:', error);
    return null;
  }

  return user;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}

export async function getUserProfile(userId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}
```

Create file: `src/lib/auth/client.ts`

```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import type { AuthError, User } from '@supabase/supabase-js';

export async function signUp(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function resetPassword(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
}
```

### Auth Callback Route

Create file: `src/app/auth/callback/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page after successful auth
  return NextResponse.redirect(new URL('/', request.url));
}
```

### Middleware for Protected Routes

Create file: `src/middleware.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value: '',
            ...options
          });
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  const protectedPaths = ['/dashboard', '/admin', '/students', '/employees'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
```

### Login Page Component

Create file: `src/app/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold">Sign in to InTime</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
```

---

## Dependencies

- **Requires:** FOUND-001 (user_profiles table), Supabase project configured
- **Blocks:** All feature development (users need to authenticate)

---

## Testing Checklist

### Happy Path
- [ ] User can sign up with valid email/password
- [ ] Confirmation email sent
- [ ] User can confirm email via link
- [ ] User can log in with confirmed account
- [ ] Session persists across page refreshes
- [ ] User can log out successfully

### Error Handling
- [ ] Duplicate email shows clear error
- [ ] Invalid credentials show error
- [ ] Weak password rejected
- [ ] Invalid email format rejected
- [ ] Network errors handled gracefully

### Security
- [ ] Passwords never logged or exposed
- [ ] Session tokens stored securely in HttpOnly cookies
- [ ] CSRF protection enabled
- [ ] Rate limiting on auth endpoints (Supabase handles this)

---

## Verification Steps

1. **Sign Up Flow:**
```bash
curl -X POST 'https://your-project.supabase.co/auth/v1/signup' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

2. **Sign In Flow:**
```bash
curl -X POST 'https://your-project.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

3. **Browser Test:**
- Visit `/signup` → Create account
- Check email → Click confirmation link
- Visit `/login` → Sign in
- Navigate to `/dashboard` → Should see protected content
- Click "Logout" → Redirected to home
- Try to visit `/dashboard` → Redirected to `/login`

---

## Documentation Updates

- [ ] Create `/docs/implementation/AUTHENTICATION.md` with setup guide
- [ ] Document email template customization
- [ ] Add troubleshooting section for common auth issues
- [ ] Document session management best practices

---

## Related Stories

- **Leads to:** FOUND-006 (role assignment during signup)
- **Blocks:** All feature epics (authentication required)

---

## Notes

- Email confirmation required by default (improves security)
- Session tokens automatically refreshed by Supabase client
- Rate limiting handled by Supabase (60 requests per hour per IP)
- Consider adding OAuth providers (Google, GitHub) in future

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
