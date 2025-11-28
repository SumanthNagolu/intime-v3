/**
 * Authentication Server Actions
 *
 * Handles signup with automatic role assignment and user profile creation
 *
 * Epic: FOUND-006 - Create Role Assignment During Signup
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  role: z.enum(['student', 'candidate', 'client', 'recruiter', 'trainer']).default('student'),
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// Types
// ============================================================================

type SignUpInput = z.infer<typeof signUpSchema>;
type SignInInput = z.infer<typeof signInSchema>;

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

// ============================================================================
// Sign Up Action with Role Assignment
// ============================================================================

/**
 * Sign up a new user and create their profile with assigned role
 * @param input - Sign up form data
 * @returns ActionResult with success status or error
 */
export async function signUpAction(
  input: SignUpInput
): Promise<ActionResult> {
  // Validate input
  const validation = signUpSchema.safeParse(input);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors)[0];
    const errorMessage = firstError
      ? `Invalid ${firstError[0]}: ${firstError[1]?.[0] || 'validation failed'}`
      : 'Invalid input';

    return {
      success: false,
      error: errorMessage,
      fieldErrors,
    };
  }

  const { email, password, full_name, phone, role } = validation.data;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Step 1: Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      data: {
        full_name,
      },
    },
  });

  if (authError) {
    console.error('Auth signup error:', JSON.stringify(authError, null, 2));
    return {
      success: false,
      error: authError.message || 'Failed to create account',
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: 'Failed to create user account',
    };
  }

  // Step 1.5: Create organization for the new user
  // Generate a unique slug from email (remove @ and domain)
  const orgSlug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now().toString().slice(-6);

  const { data: orgData, error: orgError } = await adminSupabase
    .from('organizations')
    .insert({
      name: `${full_name}'s Organization`,
      slug: `${orgSlug}-${timestamp}`,
      status: 'active',
      subscription_tier: 'free',
      subscription_status: 'active',
    })
    .select()
    .single();

  if (orgError || !orgData) {
    console.error('Organization creation error:', orgError);
    return {
      success: false,
      error: 'Failed to create organization',
    };
  }

  // Step 2: Create user profile in database
  const { data: profileData, error: profileError } = await adminSupabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      auth_id: authData.user.id,
      email,
      full_name,
      phone: phone || null,
      org_id: orgData.id,
    })
    .select()
    .single();

  if (profileError) {
    console.error('Profile creation error:', profileError);
    return {
      success: false,
      error: 'Failed to create user profile',
    };
  }

  // Step 3: Get the role ID for the requested role
  const { data: roleData, error: roleError } = await adminSupabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .single();

  if (roleError || !roleData) {
    console.error('Role lookup error:', roleError);
    return {
      success: false,
      error: `Failed to assign ${role} role. Please contact support.`,
    };
  }

  // Step 4: Assign role to user
  const { error: roleAssignmentError } = await adminSupabase
    .from('user_roles')
    .insert({
      user_id: authData.user.id,
      role_id: roleData.id,
    });

  if (roleAssignmentError) {
    console.error('Role assignment error:', roleAssignmentError);
    return {
      success: false,
      error: 'Failed to assign user role',
    };
  }

  // Step 5: Log audit event
  await adminSupabase.from('audit_logs').insert({
    table_name: 'user_profiles',
    action: 'INSERT',
    record_id: authData.user.id,
    user_id: authData.user.id,
    user_email: email,
    org_id: orgData.id,
    new_values: {
      email,
      full_name,
      role,
    },
    metadata: {
      source: 'signup',
      role_assigned: role,
    },
    severity: 'info',
  });

  return {
    success: true,
    data: {
      user: authData.user,
      profile: profileData,
      message: 'Account created successfully! Please check your email to verify your account.',
    },
  };
}

// ============================================================================
// Sign In Action
// ============================================================================

/**
 * Sign in an existing user
 * @param input - Sign in form data
 * @returns ActionResult with success status or error
 */
export async function signInAction(
  input: SignInInput
): Promise<ActionResult> {
  // Validate input
  const validation = signInSchema.safeParse(input);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors)[0];
    const errorMessage = firstError
      ? `Invalid ${firstError[0]}: ${firstError[1]?.[0] || 'validation failed'}`
      : 'Invalid input';

    return {
      success: false,
      error: errorMessage,
      fieldErrors,
    };
  }

  const { email, password } = validation.data;

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Get user's org_id for audit log
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('org_id')
    .eq('auth_id', data.user.id)
    .single();

  // Log audit event
  if (profile) {
    await adminSupabase.from('audit_logs').insert({
      table_name: 'user_profiles',
      action: 'LOGIN',
      record_id: data.user.id,
      user_id: data.user.id,
      user_email: email,
      org_id: profile.org_id,
      metadata: {
        source: 'login',
      },
      severity: 'info',
    });
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// ============================================================================
// Get User Portal Action
// ============================================================================

/**
 * Get the appropriate portal for the current user based on their roles
 * Uses admin client to bypass RLS
 * @returns The portal type or null if not authenticated
 */
export async function getUserPortalAction(): Promise<ActionResult<{ portal: string | null }>> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: true,
      data: { portal: null },
    };
  }

  // Get user profile using admin client
  const { data: profile } = await adminSupabase
    .from('user_profiles')
    .select('id')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single();

  if (!profile) {
    return {
      success: true,
      data: { portal: null },
    };
  }

  // Get user roles using admin client
  const { data: rolesData } = await adminSupabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', profile.id)
    .is('deleted_at', null);

  const roles = rolesData?.map((item: any) => item.role?.name).filter(Boolean) || [];

  // Determine correct portal based on roles
  const portalRoles: Record<string, string[]> = {
    employee: [
      'super_admin', 'admin', 'ceo',
      'recruiter', 'senior_recruiter', 'junior_recruiter',
      'bench_manager', 'bench_sales',
      'ta_specialist', 'talent_acquisition',
      'hr_admin', 'hr_manager',
      'academy_admin',
      'trainer', 'training_coordinator',
      'immigration_specialist',
      'employee'
    ],
    academy: ['student'],
    client: ['client', 'client_admin', 'client_poc'],
    talent: ['candidate', 'talent'],
  };

  const portalPriority = ['employee', 'academy', 'client', 'talent'];

  for (const portal of portalPriority) {
    const allowedRoles = portalRoles[portal];
    if (roles.some((role: string) => allowedRoles.includes(role))) {
      return {
        success: true,
        data: { portal },
      };
    }
  }

  return {
    success: true,
    data: { portal: null },
  };
}

// ============================================================================
// Sign Out Action
// ============================================================================

/**
 * Sign out the current user
 * @returns ActionResult with success status or error
 */
export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Get current user for audit log
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: 'Failed to sign out',
    };
  }

  // Log audit event
  if (user) {
    // Get user's org_id for audit log
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id')
      .eq('auth_id', user.id)
      .single();

    if (profile) {
      await adminSupabase.from('audit_logs').insert({
        table_name: 'user_profiles',
        action: 'LOGOUT',
        record_id: user.id,
        user_id: user.id,
        org_id: profile.org_id,
        metadata: {
          source: 'logout',
        },
        severity: 'info',
      });
    }
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}
