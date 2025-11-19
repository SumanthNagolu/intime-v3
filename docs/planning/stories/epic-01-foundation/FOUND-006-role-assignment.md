# FOUND-006: Create Role Assignment During Signup

**Story Points:** 5
**Sprint:** Sprint 1 (Week 1-2)
**Priority:** HIGH

---

## User Story

As a **new user signing up**,
I want **to be automatically assigned the appropriate role**,
So that **I immediately have the right permissions without manual intervention**.

---

## Acceptance Criteria

- [ ] Signup flow asks user to select their role (student, candidate, client)
- [ ] User profile created in `user_profiles` table with role-specific fields populated
- [ ] Role assigned via `user_roles` junction table
- [ ] Database trigger creates profile automatically after auth signup
- [ ] Event published when new user created (for cross-module integration)
- [ ] Admin can manually assign additional roles later
- [ ] Validation prevents invalid role combinations (documented rules)

---

## Technical Implementation

### Database Trigger for Auto Profile Creation

Create file: `supabase/migrations/006_auto_create_user_profile.sql`

```sql
-- Function: Create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile in user_profiles table
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Assign default 'guest' role until user completes onboarding
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, id FROM roles WHERE name = 'guest';

  -- Publish event (processed by event bus)
  PERFORM pg_notify(
    'events',
    json_build_object(
      'type', 'user.created',
      'payload', json_build_object(
        'user_id', NEW.id,
        'email', NEW.email,
        'created_at', NOW()
      )
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Execute after user signs up in auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Signup with Role Selection

Create file: `src/app/signup/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth/client';
import { completeOnboarding } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type UserRole = 'student' | 'candidate' | 'client';

export default function SignupPage() {
  const [step, setStep] = useState<'credentials' | 'role' | 'details'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('role');
  };

  const handleRoleSubmit = () => {
    setStep('details');
  };

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create auth user
      const { data: authData } = await signUp(email, password);

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      // Complete onboarding (assign role, populate profile)
      await completeOnboarding(authData.user.id, {
        fullName,
        role
      });

      // Redirect to appropriate dashboard
      const redirectMap: Record<UserRole, string> = {
        student: '/academy/dashboard',
        candidate: '/candidate/dashboard',
        client: '/client/dashboard'
      };

      router.push(redirectMap[role]);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign in
            </a>
          </p>
        </div>

        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                At least 8 characters
              </p>
            </div>

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}

        {step === 'role' && (
          <div className="space-y-6">
            <div>
              <Label>I am a...</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="student" id="student" />
                  <div>
                    <Label htmlFor="student" className="font-medium">
                      Student
                    </Label>
                    <p className="text-sm text-gray-500">
                      I want to learn Guidewire and get certified
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="candidate" id="candidate" />
                  <div>
                    <Label htmlFor="candidate" className="font-medium">
                      Candidate
                    </Label>
                    <p className="text-sm text-gray-500">
                      I'm looking for Guidewire job opportunities
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-md border p-4">
                  <RadioGroupItem value="client" id="client" />
                  <div>
                    <Label htmlFor="client" className="font-medium">
                      Client
                    </Label>
                    <p className="text-sm text-gray-500">
                      I'm hiring Guidewire talent for my company
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleRoleSubmit} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 'details' && (
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {role === 'client' && (
              <div>
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  disabled={loading}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
```

### Server Action for Onboarding

Create file: `src/app/signup/actions.ts`

```typescript
'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { grantRole } from '@/lib/rbac';

interface OnboardingData {
  fullName: string;
  role: 'student' | 'candidate' | 'client';
  companyName?: string;
}

export async function completeOnboarding(
  userId: string,
  data: OnboardingData
) {
  const supabase = createAdminClient();

  // Update user profile with onboarding data
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({
      full_name: data.fullName,
      // Role-specific fields
      ...(data.role === 'student' && {
        student_enrollment_date: new Date().toISOString(),
        student_current_module: 'module_1'
      }),
      ...(data.role === 'candidate' && {
        candidate_status: 'active'
      }),
      ...(data.role === 'client' && {
        client_company_name: data.companyName
      })
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`);
  }

  // Assign role (replaces 'guest' role)
  await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role_id', (
      await supabase.from('roles').select('id').eq('name', 'guest').single()
    ).data?.id);

  await grantRole(userId, data.role);

  // Publish event
  await supabase.rpc('publish_event', {
    event_type: 'user.onboarding_completed',
    payload: {
      user_id: userId,
      role: data.role,
      timestamp: new Date().toISOString()
    }
  });

  return { success: true };
}
```

---

## Dependencies

- **Requires:** FOUND-001 (database), FOUND-002 (roles), FOUND-005 (auth)
- **Leads to:** Role-specific dashboards and features

---

## Testing Checklist

### Signup Flow
- [ ] Student signup creates profile with `student_enrollment_date`
- [ ] Candidate signup creates profile with `candidate_status: 'active'`
- [ ] Client signup creates profile with `client_company_name`
- [ ] Role correctly assigned in `user_roles` table
- [ ] Event published after onboarding completion

### Validation
- [ ] Cannot assign invalid role
- [ ] Full name required
- [ ] Company name required for clients
- [ ] Duplicate email prevented (Supabase handles this)

### Edge Cases
- [ ] Network error during signup handled gracefully
- [ ] Partial signup (auth created but profile fails) rolls back
- [ ] Trigger creates profile even if custom logic fails

---

## Verification Queries

```sql
-- Test: Sign up as student
-- (After signup via UI)

-- Verify profile created
SELECT * FROM user_profiles
WHERE email = 'newstudent@example.com';

-- Expected: Row with student_enrollment_date set

-- Verify role assigned
SELECT r.name FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.user_id = (SELECT id FROM user_profiles WHERE email = 'newstudent@example.com');

-- Expected: 'student'

-- Verify event published
SELECT * FROM audit_logs
WHERE table_name = 'user_profiles'
  AND operation = 'INSERT'
  AND record_id = (SELECT id FROM user_profiles WHERE email = 'newstudent@example.com');
```

---

## Documentation Updates

- [ ] Document signup flow in `/docs/implementation/USER-ONBOARDING.md`
- [ ] Add role assignment rules documentation
- [ ] Document event structure for `user.onboarding_completed`
- [ ] Create troubleshooting guide for signup issues

---

## Related Stories

- **Depends on:** FOUND-002 (roles), FOUND-005 (auth)
- **Leads to:** Epic 2 (Training Academy onboarding)

---

## Notes

- Default 'guest' role assigned immediately upon auth signup
- Full role assigned after user completes onboarding flow
- Trigger ensures profile always created (fallback safety)
- Event published for cross-module integration (e.g., send welcome email)

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
