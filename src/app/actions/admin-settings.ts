/**
 * Admin Organization Settings Server Actions
 *
 * Provides operations for managing organization settings with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/admin-settings
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { ActionResult } from './types';
import { getCurrentUserContext, checkPermission, logAuditEvent } from './helpers';

// ============================================================================
// Types
// ============================================================================

export interface OrgSettings {
  // General Settings
  orgId: string;
  orgName: string;
  orgSlug: string;
  supportEmail: string | null;
  timezone: string;
  locale: string;
  logoUrl: string | null;
  faviconUrl: string | null;

  // Auth Settings (stored in metadata)
  passwordMinLength: number;
  passwordRequireSpecialChars: boolean;
  mfaRequired: boolean;
  sessionTimeoutMinutes: number;

  // Feature Flags
  features: {
    academyEnabled: boolean;
    recruitingEnabled: boolean;
    benchSalesEnabled: boolean;
    crmEnabled: boolean;
    hrEnabled: boolean;
  };

  // Branding
  branding: {
    primaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };

  // Billing Info (read-only for display)
  plan: string;
  billingEmail: string | null;
  maxUsers: number;
  currentUserCount: number;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const updateGeneralSettingsSchema = z.object({
  orgName: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  supportEmail: z.string().email('Invalid email address').nullable().optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  logoUrl: z.string().url('Invalid URL').nullable().optional(),
  faviconUrl: z.string().url('Invalid URL').nullable().optional(),
});

const updateAuthSettingsSchema = z.object({
  passwordMinLength: z.number().min(8).max(128).optional(),
  passwordRequireSpecialChars: z.boolean().optional(),
  mfaRequired: z.boolean().optional(),
  sessionTimeoutMinutes: z.number().min(5).max(1440).optional(),
});

const updateFeaturesSchema = z.object({
  academyEnabled: z.boolean().optional(),
  recruitingEnabled: z.boolean().optional(),
  benchSalesEnabled: z.boolean().optional(),
  crmEnabled: z.boolean().optional(),
  hrEnabled: z.boolean().optional(),
});

const updateBrandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  darkMode: z.boolean().optional(),
});

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_SETTINGS = {
  passwordMinLength: 12,
  passwordRequireSpecialChars: true,
  mfaRequired: false,
  sessionTimeoutMinutes: 60,
  features: {
    academyEnabled: true,
    recruitingEnabled: true,
    benchSalesEnabled: true,
    crmEnabled: true,
    hrEnabled: true,
  },
  branding: {
    primaryColor: '#6366f1',
    accentColor: '#8b5cf6',
    darkMode: true,
  },
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Get organization settings for the current user's organization.
 */
export async function getOrgSettingsAction(): Promise<ActionResult<OrgSettings>> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'org_settings', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: org_settings:read required' };
  }

  // Fetch organization
  const { data: org, error } = await supabase
    .from('organizations')
    .select(
      `
      id,
      name,
      slug,
      email,
      timezone,
      locale,
      logo_url,
      favicon_url,
      metadata,
      plan,
      billing_email,
      max_users
    `
    )
    .eq('id', profile.orgId)
    .single();

  if (error || !org) {
    console.error('Get org settings error:', error);
    return { success: false, error: 'Organization not found' };
  }

  // Get current user count
  const { count: userCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', profile.orgId)
    .is('deleted_at', null)
    .eq('is_active', true);

  // Parse metadata (stored settings)
  const metadata = (org.metadata as Record<string, any>) || {};

  const settings: OrgSettings = {
    orgId: org.id,
    orgName: org.name,
    orgSlug: org.slug,
    supportEmail: org.email,
    timezone: org.timezone || 'America/New_York',
    locale: org.locale || 'en-US',
    logoUrl: org.logo_url,
    faviconUrl: org.favicon_url,

    // Auth settings from metadata
    passwordMinLength: metadata.passwordMinLength ?? DEFAULT_SETTINGS.passwordMinLength,
    passwordRequireSpecialChars:
      metadata.passwordRequireSpecialChars ?? DEFAULT_SETTINGS.passwordRequireSpecialChars,
    mfaRequired: metadata.mfaRequired ?? DEFAULT_SETTINGS.mfaRequired,
    sessionTimeoutMinutes:
      metadata.sessionTimeoutMinutes ?? DEFAULT_SETTINGS.sessionTimeoutMinutes,

    // Features from metadata
    features: {
      academyEnabled: metadata.features?.academyEnabled ?? DEFAULT_SETTINGS.features.academyEnabled,
      recruitingEnabled:
        metadata.features?.recruitingEnabled ?? DEFAULT_SETTINGS.features.recruitingEnabled,
      benchSalesEnabled:
        metadata.features?.benchSalesEnabled ?? DEFAULT_SETTINGS.features.benchSalesEnabled,
      crmEnabled: metadata.features?.crmEnabled ?? DEFAULT_SETTINGS.features.crmEnabled,
      hrEnabled: metadata.features?.hrEnabled ?? DEFAULT_SETTINGS.features.hrEnabled,
    },

    // Branding from metadata
    branding: {
      primaryColor: metadata.branding?.primaryColor ?? DEFAULT_SETTINGS.branding.primaryColor,
      accentColor: metadata.branding?.accentColor ?? DEFAULT_SETTINGS.branding.accentColor,
      darkMode: metadata.branding?.darkMode ?? DEFAULT_SETTINGS.branding.darkMode,
    },

    // Billing (read-only)
    plan: org.plan || 'free',
    billingEmail: org.billing_email,
    maxUsers: org.max_users || 10,
    currentUserCount: userCount || 0,
  };

  return { success: true, data: settings };
}

/**
 * Update general organization settings.
 */
export async function updateGeneralSettingsAction(
  input: z.infer<typeof updateGeneralSettingsSchema>
): Promise<ActionResult<OrgSettings>> {
  // Validate input
  const validation = updateGeneralSettingsSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'org_settings', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: org_settings:update required' };
  }

  // Get current settings for audit
  const { data: currentOrg } = await supabase
    .from('organizations')
    .select('name, email, timezone, locale, logo_url, favicon_url')
    .eq('id', profile.orgId)
    .single();

  // Build update object
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.orgName !== undefined) updateData.name = input.orgName;
  if (input.supportEmail !== undefined) updateData.email = input.supportEmail;
  if (input.timezone !== undefined) updateData.timezone = input.timezone;
  if (input.locale !== undefined) updateData.locale = input.locale;
  if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
  if (input.faviconUrl !== undefined) updateData.favicon_url = input.faviconUrl;

  // Update organization
  const { error: updateError } = await adminSupabase
    .from('organizations')
    .update(updateData)
    .eq('id', profile.orgId);

  if (updateError) {
    console.error('Update general settings error:', updateError);
    return { success: false, error: 'Failed to update settings' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'organizations',
    action: 'UPDATE_SETTINGS',
    recordId: profile.orgId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: currentOrg || {},
    newValues: updateData,
    metadata: { source: 'admin_settings', settingsType: 'general' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/settings');

  return getOrgSettingsAction();
}

/**
 * Update authentication settings.
 */
export async function updateAuthSettingsAction(
  input: z.infer<typeof updateAuthSettingsSchema>
): Promise<ActionResult<OrgSettings>> {
  // Validate input
  const validation = updateAuthSettingsSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'org_settings', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: org_settings:update required' };
  }

  // Get current metadata
  const { data: currentOrg } = await supabase
    .from('organizations')
    .select('metadata')
    .eq('id', profile.orgId)
    .single();

  const currentMetadata = (currentOrg?.metadata as Record<string, any>) || {};

  // Update metadata with auth settings
  const newMetadata = {
    ...currentMetadata,
    ...(input.passwordMinLength !== undefined && { passwordMinLength: input.passwordMinLength }),
    ...(input.passwordRequireSpecialChars !== undefined && {
      passwordRequireSpecialChars: input.passwordRequireSpecialChars,
    }),
    ...(input.mfaRequired !== undefined && { mfaRequired: input.mfaRequired }),
    ...(input.sessionTimeoutMinutes !== undefined && {
      sessionTimeoutMinutes: input.sessionTimeoutMinutes,
    }),
  };

  // Update organization
  const { error: updateError } = await adminSupabase
    .from('organizations')
    .update({
      metadata: newMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.orgId);

  if (updateError) {
    console.error('Update auth settings error:', updateError);
    return { success: false, error: 'Failed to update auth settings' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'organizations',
    action: 'UPDATE_SETTINGS',
    recordId: profile.orgId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: { auth: currentMetadata },
    newValues: { auth: input },
    metadata: { source: 'admin_settings', settingsType: 'auth' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/settings');

  return getOrgSettingsAction();
}

/**
 * Update feature flags.
 */
export async function updateFeaturesAction(
  input: z.infer<typeof updateFeaturesSchema>
): Promise<ActionResult<OrgSettings>> {
  // Validate input
  const validation = updateFeaturesSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'org_settings', 'manage');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: org_settings:manage required' };
  }

  // Get current metadata
  const { data: currentOrg } = await supabase
    .from('organizations')
    .select('metadata')
    .eq('id', profile.orgId)
    .single();

  const currentMetadata = (currentOrg?.metadata as Record<string, any>) || {};
  const currentFeatures = currentMetadata.features || {};

  // Update features in metadata
  const newMetadata = {
    ...currentMetadata,
    features: {
      ...currentFeatures,
      ...input,
    },
  };

  // Update organization
  const { error: updateError } = await adminSupabase
    .from('organizations')
    .update({
      metadata: newMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.orgId);

  if (updateError) {
    console.error('Update features error:', updateError);
    return { success: false, error: 'Failed to update feature flags' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'organizations',
    action: 'UPDATE_SETTINGS',
    recordId: profile.orgId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: { features: currentFeatures },
    newValues: { features: input },
    metadata: { source: 'admin_settings', settingsType: 'features' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/settings');

  return getOrgSettingsAction();
}

/**
 * Update branding settings.
 */
export async function updateBrandingAction(
  input: z.infer<typeof updateBrandingSchema>
): Promise<ActionResult<OrgSettings>> {
  // Validate input
  const validation = updateBrandingSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'org_settings', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: org_settings:update required' };
  }

  // Get current metadata
  const { data: currentOrg } = await supabase
    .from('organizations')
    .select('metadata')
    .eq('id', profile.orgId)
    .single();

  const currentMetadata = (currentOrg?.metadata as Record<string, any>) || {};
  const currentBranding = currentMetadata.branding || {};

  // Update branding in metadata
  const newMetadata = {
    ...currentMetadata,
    branding: {
      ...currentBranding,
      ...input,
    },
  };

  // Update organization
  const { error: updateError } = await adminSupabase
    .from('organizations')
    .update({
      metadata: newMetadata,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.orgId);

  if (updateError) {
    console.error('Update branding error:', updateError);
    return { success: false, error: 'Failed to update branding settings' };
  }

  // Audit log
  await logAuditEvent(adminSupabase, {
    tableName: 'organizations',
    action: 'UPDATE_SETTINGS',
    recordId: profile.orgId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.orgId,
    oldValues: { branding: currentBranding },
    newValues: { branding: input },
    metadata: { source: 'admin_settings', settingsType: 'branding' },
  });

  revalidatePath('/employee/admin/dashboard');
  revalidatePath('/employee/admin/settings');

  return getOrgSettingsAction();
}

/**
 * Update all organization settings at once.
 */
export async function updateOrgSettingsAction(input: {
  general?: z.infer<typeof updateGeneralSettingsSchema>;
  auth?: z.infer<typeof updateAuthSettingsSchema>;
  features?: z.infer<typeof updateFeaturesSchema>;
  branding?: z.infer<typeof updateBrandingSchema>;
}): Promise<ActionResult<OrgSettings>> {
  // Get current user context
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Check permission
  const hasPermission = await checkPermission(supabase, profile.id, 'org_settings', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: org_settings:update required' };
  }

  // Update each section if provided
  if (input.general) {
    const result = await updateGeneralSettingsAction(input.general);
    if (!result.success) return result;
  }

  if (input.auth) {
    const result = await updateAuthSettingsAction(input.auth);
    if (!result.success) return result;
  }

  if (input.features) {
    const result = await updateFeaturesAction(input.features);
    if (!result.success) return result;
  }

  if (input.branding) {
    const result = await updateBrandingAction(input.branding);
    if (!result.success) return result;
  }

  return getOrgSettingsAction();
}
