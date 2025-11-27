/**
 * TA Campaigns Server Actions
 *
 * Provides CRUD operations for outreach campaigns (talent sourcing & business dev)
 * with engagement tracking and A/B testing support.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/ta-campaigns
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { ActionResult, PaginatedResult } from './types';
import {
  getCurrentUserContext,
  checkPermission,
  calculatePagination,
  calculateRange,
  logAuditEvent,
} from './helpers';

// ============================================================================
// Types
// ============================================================================

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  campaignType: string;
  channel: string;
  status: string;
  targetAudience: string | null;
  targetLocations: string[] | null;
  targetSkills: string[] | null;
  targetCompanySizes: string[] | null;
  isAbTest: boolean;
  variantATemplateId: string | null;
  variantBTemplateId: string | null;
  abSplitPercentage: number;
  targetContactsCount: number | null;
  targetResponseRate: number | null;
  targetConversionCount: number | null;
  contactsReached: number;
  emailsSent: number;
  linkedinMessagesSent: number;
  responsesReceived: number;
  conversions: number;
  responseRate: number | null;
  startDate: string | null;
  endDate: string | null;
  ownerId: string;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
}

export interface CampaignWithOwner extends Campaign {
  owner?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface CampaignContact {
  id: string;
  campaignId: string;
  contactType: string;
  userId: string | null;
  leadId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  linkedinUrl: string | null;
  companyName: string | null;
  title: string | null;
  status: string;
  abVariant: string | null;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  respondedAt: string | null;
  responseText: string | null;
  convertedAt: string | null;
  conversionType: string | null;
  createdAt: string;
}

export interface CampaignFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  campaignType?: string;
  channel?: string;
  ownerId?: string;
}

export interface CreateCampaignInput {
  name: string;
  description?: string;
  campaignType: string;
  channel: string;
  targetAudience?: string;
  targetLocations?: string[];
  targetSkills?: string[];
  targetCompanySizes?: string[];
  isAbTest?: boolean;
  abSplitPercentage?: number;
  targetContactsCount?: number;
  targetResponseRate?: number;
  targetConversionCount?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  status?: string;
  targetAudience?: string;
  targetLocations?: string[];
  targetSkills?: string[];
  targetCompanySizes?: string[];
  isAbTest?: boolean;
  abSplitPercentage?: number;
  targetContactsCount?: number;
  targetResponseRate?: number;
  targetConversionCount?: number;
  startDate?: string;
  endDate?: string;
}

export interface AddCampaignContactInput {
  contactType: string;
  userId?: string;
  leadId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  linkedinUrl?: string;
  companyName?: string;
  title?: string;
  abVariant?: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const campaignFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  campaignType: z.string().optional(),
  channel: z.string().optional(),
  ownerId: z.string().uuid().optional(),
});

const createCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(255),
  description: z.string().optional(),
  campaignType: z.enum(['talent_sourcing', 'business_development', 'mixed']),
  channel: z.enum(['email', 'linkedin', 'combined']),
  targetAudience: z.string().optional(),
  targetLocations: z.array(z.string()).optional(),
  targetSkills: z.array(z.string()).optional(),
  targetCompanySizes: z.array(z.string()).optional(),
  isAbTest: z.boolean().default(false),
  abSplitPercentage: z.number().min(0).max(100).default(50),
  targetContactsCount: z.number().min(0).optional(),
  targetResponseRate: z.number().min(0).max(100).optional(),
  targetConversionCount: z.number().min(0).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).optional(),
  targetAudience: z.string().optional(),
  targetLocations: z.array(z.string()).optional(),
  targetSkills: z.array(z.string()).optional(),
  targetCompanySizes: z.array(z.string()).optional(),
  isAbTest: z.boolean().optional(),
  abSplitPercentage: z.number().min(0).max(100).optional(),
  targetContactsCount: z.number().min(0).optional(),
  targetResponseRate: z.number().min(0).max(100).optional(),
  targetConversionCount: z.number().min(0).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

const addContactSchema = z.object({
  contactType: z.enum(['candidate', 'business_lead']),
  userId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  linkedinUrl: z.string().url().optional(),
  companyName: z.string().optional(),
  title: z.string().optional(),
  abVariant: z.enum(['A', 'B']).optional(),
});

// ============================================================================
// Campaign Actions
// ============================================================================

/**
 * Get paginated list of campaigns.
 */
export async function listCampaignsAction(
  filters: CampaignFilters = {}
): Promise<ActionResult<PaginatedResult<CampaignWithOwner>>> {
  const validation = campaignFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, status, campaignType, channel, ownerId } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:read required' };
  }

  // Build query
  let query = supabase
    .from('campaigns')
    .select(
      `
      id,
      name,
      description,
      campaign_type,
      channel,
      status,
      target_audience,
      target_locations,
      target_skills,
      target_company_sizes,
      is_ab_test,
      variant_a_template_id,
      variant_b_template_id,
      ab_split_percentage,
      target_contacts_count,
      target_response_rate,
      target_conversion_count,
      contacts_reached,
      emails_sent,
      linkedin_messages_sent,
      responses_received,
      conversions,
      response_rate,
      start_date,
      end_date,
      owner_id,
      org_id,
      created_at,
      created_by,
      owner:user_profiles!campaigns_owner_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `,
      { count: 'exact' }
    )
    .eq('org_id', profile.orgId);

  // Apply filters
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (campaignType) {
    query = query.eq('campaign_type', campaignType);
  }

  if (channel) {
    query = query.eq('channel', channel);
  }

  if (ownerId) {
    query = query.eq('owner_id', ownerId);
  }

  // Apply pagination
  const { from, to } = calculateRange(page, pageSize);
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: campaigns, error, count } = await query;

  if (error) {
    console.error('List campaigns error:', error);
    return { success: false, error: 'Failed to fetch campaigns' };
  }

  // Transform data
  const transformedCampaigns: CampaignWithOwner[] = (campaigns || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    campaignType: c.campaign_type,
    channel: c.channel,
    status: c.status,
    targetAudience: c.target_audience,
    targetLocations: c.target_locations,
    targetSkills: c.target_skills,
    targetCompanySizes: c.target_company_sizes,
    isAbTest: c.is_ab_test,
    variantATemplateId: c.variant_a_template_id,
    variantBTemplateId: c.variant_b_template_id,
    abSplitPercentage: c.ab_split_percentage,
    targetContactsCount: c.target_contacts_count,
    targetResponseRate: c.target_response_rate ? parseFloat(c.target_response_rate) : null,
    targetConversionCount: c.target_conversion_count,
    contactsReached: c.contacts_reached || 0,
    emailsSent: c.emails_sent || 0,
    linkedinMessagesSent: c.linkedin_messages_sent || 0,
    responsesReceived: c.responses_received || 0,
    conversions: c.conversions || 0,
    responseRate: c.response_rate ? parseFloat(c.response_rate) : null,
    startDate: c.start_date,
    endDate: c.end_date,
    ownerId: c.owner_id,
    orgId: c.org_id,
    createdAt: c.created_at,
    createdBy: c.created_by,
    owner: c.owner
      ? {
          id: c.owner.id,
          fullName: c.owner.full_name,
          email: c.owner.email,
          avatarUrl: c.owner.avatar_url,
        }
      : null,
  }));

  const total = count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: transformedCampaigns,
      ...pagination,
    },
  };
}

/**
 * Get a single campaign with details.
 */
export async function getCampaignAction(
  campaignId: string
): Promise<ActionResult<CampaignWithOwner>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:read required' };
  }

  const { data: c, error } = await supabase
    .from('campaigns')
    .select(
      `
      *,
      owner:user_profiles!campaigns_owner_id_fkey (
        id,
        full_name,
        email,
        avatar_url
      )
    `
    )
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (error || !c) {
    return { success: false, error: 'Campaign not found' };
  }

  return {
    success: true,
    data: {
      id: c.id,
      name: c.name,
      description: c.description,
      campaignType: c.campaign_type,
      channel: c.channel,
      status: c.status,
      targetAudience: c.target_audience,
      targetLocations: c.target_locations,
      targetSkills: c.target_skills,
      targetCompanySizes: c.target_company_sizes,
      isAbTest: c.is_ab_test,
      variantATemplateId: c.variant_a_template_id,
      variantBTemplateId: c.variant_b_template_id,
      abSplitPercentage: c.ab_split_percentage,
      targetContactsCount: c.target_contacts_count,
      targetResponseRate: c.target_response_rate ? parseFloat(c.target_response_rate) : null,
      targetConversionCount: c.target_conversion_count,
      contactsReached: c.contacts_reached || 0,
      emailsSent: c.emails_sent || 0,
      linkedinMessagesSent: c.linkedin_messages_sent || 0,
      responsesReceived: c.responses_received || 0,
      conversions: c.conversions || 0,
      responseRate: c.response_rate ? parseFloat(c.response_rate) : null,
      startDate: c.start_date,
      endDate: c.end_date,
      ownerId: c.owner_id,
      orgId: c.org_id,
      createdAt: c.created_at,
      createdBy: c.created_by,
      owner: c.owner
        ? {
            id: (c.owner as any).id,
            fullName: (c.owner as any).full_name,
            email: (c.owner as any).email,
            avatarUrl: (c.owner as any).avatar_url,
          }
        : null,
    },
  };
}

/**
 * Create a new campaign.
 */
export async function createCampaignAction(
  input: CreateCampaignInput
): Promise<ActionResult<Campaign>> {
  const validation = createCampaignSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:create required' };
  }

  const {
    name,
    description,
    campaignType,
    channel,
    targetAudience,
    targetLocations,
    targetSkills,
    targetCompanySizes,
    isAbTest,
    abSplitPercentage,
    targetContactsCount,
    targetResponseRate,
    targetConversionCount,
    startDate,
    endDate,
  } = validation.data;

  const { data: newCampaign, error } = await supabase
    .from('campaigns')
    .insert({
      name,
      description,
      campaign_type: campaignType,
      channel,
      status: 'draft',
      target_audience: targetAudience,
      target_locations: targetLocations,
      target_skills: targetSkills,
      target_company_sizes: targetCompanySizes,
      is_ab_test: isAbTest,
      ab_split_percentage: abSplitPercentage,
      target_contacts_count: targetContactsCount,
      target_response_rate: targetResponseRate?.toString(),
      target_conversion_count: targetConversionCount,
      start_date: startDate,
      end_date: endDate,
      owner_id: profile.id,
      org_id: profile.orgId,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create campaign error:', error);
    return { success: false, error: 'Failed to create campaign' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'campaigns',
    action: 'create',
    recordId: newCampaign.id,
    userId: profile.id,
    newValues: { name, campaignType, channel },
    severity: 'info',
    orgId: profile.orgId,
  });

  return {
    success: true,
    data: {
      id: newCampaign.id,
      name: newCampaign.name,
      description: newCampaign.description,
      campaignType: newCampaign.campaign_type,
      channel: newCampaign.channel,
      status: newCampaign.status,
      targetAudience: newCampaign.target_audience,
      targetLocations: newCampaign.target_locations,
      targetSkills: newCampaign.target_skills,
      targetCompanySizes: newCampaign.target_company_sizes,
      isAbTest: newCampaign.is_ab_test,
      variantATemplateId: newCampaign.variant_a_template_id,
      variantBTemplateId: newCampaign.variant_b_template_id,
      abSplitPercentage: newCampaign.ab_split_percentage,
      targetContactsCount: newCampaign.target_contacts_count,
      targetResponseRate: null,
      targetConversionCount: newCampaign.target_conversion_count,
      contactsReached: 0,
      emailsSent: 0,
      linkedinMessagesSent: 0,
      responsesReceived: 0,
      conversions: 0,
      responseRate: null,
      startDate: newCampaign.start_date,
      endDate: newCampaign.end_date,
      ownerId: newCampaign.owner_id,
      orgId: newCampaign.org_id,
      createdAt: newCampaign.created_at,
      createdBy: newCampaign.created_by,
    },
  };
}

/**
 * Update an existing campaign.
 */
export async function updateCampaignAction(
  campaignId: string,
  input: UpdateCampaignInput
): Promise<ActionResult<Campaign>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const validation = updateCampaignSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:update required' };
  }

  // Verify campaign exists
  const { data: existingCampaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!existingCampaign) {
    return { success: false, error: 'Campaign not found' };
  }

  // Build update object
  const updates: Record<string, any> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.status !== undefined) updates.status = input.status;
  if (input.targetAudience !== undefined) updates.target_audience = input.targetAudience;
  if (input.targetLocations !== undefined) updates.target_locations = input.targetLocations;
  if (input.targetSkills !== undefined) updates.target_skills = input.targetSkills;
  if (input.targetCompanySizes !== undefined) updates.target_company_sizes = input.targetCompanySizes;
  if (input.isAbTest !== undefined) updates.is_ab_test = input.isAbTest;
  if (input.abSplitPercentage !== undefined) updates.ab_split_percentage = input.abSplitPercentage;
  if (input.targetContactsCount !== undefined) updates.target_contacts_count = input.targetContactsCount;
  if (input.targetResponseRate !== undefined) updates.target_response_rate = input.targetResponseRate?.toString();
  if (input.targetConversionCount !== undefined) updates.target_conversion_count = input.targetConversionCount;
  if (input.startDate !== undefined) updates.start_date = input.startDate;
  if (input.endDate !== undefined) updates.end_date = input.endDate;

  const { error: updateError } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', campaignId);

  if (updateError) {
    console.error('Update campaign error:', updateError);
    return { success: false, error: 'Failed to update campaign' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'campaigns',
    action: 'update',
    recordId: campaignId,
    userId: profile.id,
    oldValues: existingCampaign,
    newValues: updates,
    changedFields: Object.keys(updates),
    severity: 'info',
    orgId: profile.orgId,
  });

  // Fetch updated campaign
  const result = await getCampaignAction(campaignId);
  if (!result.success || !result.data) {
    return { success: false, error: 'Failed to fetch updated campaign' };
  }

  return { success: true, data: result.data };
}

/**
 * Delete a campaign (soft delete by archiving).
 */
export async function deleteCampaignAction(campaignId: string): Promise<ActionResult<void>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:delete required' };
  }

  // Verify campaign exists
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  // Soft delete by setting status to archived
  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ status: 'archived' })
    .eq('id', campaignId);

  if (updateError) {
    return { success: false, error: 'Failed to delete campaign' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'campaigns',
    action: 'delete',
    recordId: campaignId,
    userId: profile.id,
    oldValues: campaign,
    severity: 'warning',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Launch a campaign (set status to active).
 */
export async function launchCampaignAction(campaignId: string): Promise<ActionResult<void>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:update required' };
  }

  // Verify campaign exists and is in draft status
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  if (campaign.status !== 'draft' && campaign.status !== 'paused') {
    return { success: false, error: 'Only draft or paused campaigns can be launched' };
  }

  // Check if campaign has contacts
  const { count } = await supabase
    .from('campaign_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId);

  if (!count || count === 0) {
    return { success: false, error: 'Campaign must have at least one contact before launching' };
  }

  const { error: updateError } = await supabase
    .from('campaigns')
    .update({
      status: 'active',
      start_date: campaign.start_date || new Date().toISOString().split('T')[0],
    })
    .eq('id', campaignId);

  if (updateError) {
    return { success: false, error: 'Failed to launch campaign' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'campaigns',
    action: 'launch',
    recordId: campaignId,
    userId: profile.id,
    metadata: { contactCount: count },
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Pause an active campaign.
 */
export async function pauseCampaignAction(campaignId: string): Promise<ActionResult<void>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:update required' };
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  if (campaign.status !== 'active') {
    return { success: false, error: 'Only active campaigns can be paused' };
  }

  const { error: updateError } = await supabase
    .from('campaigns')
    .update({ status: 'paused' })
    .eq('id', campaignId);

  if (updateError) {
    return { success: false, error: 'Failed to pause campaign' };
  }

  await logAuditEvent(supabase, {
    tableName: 'campaigns',
    action: 'pause',
    recordId: campaignId,
    userId: profile.id,
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Complete a campaign.
 */
export async function completeCampaignAction(campaignId: string): Promise<ActionResult<void>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:update required' };
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('status')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  const { error: updateError } = await supabase
    .from('campaigns')
    .update({
      status: 'completed',
      end_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', campaignId);

  if (updateError) {
    return { success: false, error: 'Failed to complete campaign' };
  }

  await logAuditEvent(supabase, {
    tableName: 'campaigns',
    action: 'complete',
    recordId: campaignId,
    userId: profile.id,
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

// ============================================================================
// Campaign Contact Actions
// ============================================================================

/**
 * Get contacts for a campaign.
 */
export async function getCampaignContactsAction(
  campaignId: string,
  filters: { page?: number; pageSize?: number; status?: string } = {}
): Promise<ActionResult<PaginatedResult<CampaignContact>>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:read required' };
  }

  // Verify campaign belongs to org
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 50;

  let query = supabase
    .from('campaign_contacts')
    .select('*', { count: 'exact' })
    .eq('campaign_id', campaignId);

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { from, to } = calculateRange(page, pageSize);
  query = query.order('created_at', { ascending: false }).range(from, to);

  const { data: contacts, error, count } = await query;

  if (error) {
    return { success: false, error: 'Failed to fetch contacts' };
  }

  const transformedContacts: CampaignContact[] = (contacts || []).map((c: any) => ({
    id: c.id,
    campaignId: c.campaign_id,
    contactType: c.contact_type,
    userId: c.user_id,
    leadId: c.lead_id,
    firstName: c.first_name,
    lastName: c.last_name,
    email: c.email,
    linkedinUrl: c.linkedin_url,
    companyName: c.company_name,
    title: c.title,
    status: c.status,
    abVariant: c.ab_variant,
    sentAt: c.sent_at,
    openedAt: c.opened_at,
    clickedAt: c.clicked_at,
    respondedAt: c.responded_at,
    responseText: c.response_text,
    convertedAt: c.converted_at,
    conversionType: c.conversion_type,
    createdAt: c.created_at,
  }));

  const total = count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: transformedContacts,
      ...pagination,
    },
  };
}

/**
 * Add a contact to a campaign.
 */
export async function addCampaignContactAction(
  campaignId: string,
  input: AddCampaignContactInput
): Promise<ActionResult<CampaignContact>> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const validation = addContactSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  // Must have either userId, leadId, or email+name
  if (!input.userId && !input.leadId && (!input.email || !input.firstName)) {
    return {
      success: false,
      error: 'Must provide userId, leadId, or email with firstName',
    };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:update required' };
  }

  // Verify campaign belongs to org
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, is_ab_test')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  // Determine A/B variant if needed
  let abVariant = input.abVariant;
  if (campaign.is_ab_test && !abVariant) {
    // Random assignment based on split percentage
    abVariant = Math.random() < 0.5 ? 'A' : 'B';
  }

  const { data: newContact, error } = await supabase
    .from('campaign_contacts')
    .insert({
      campaign_id: campaignId,
      contact_type: input.contactType,
      user_id: input.userId,
      lead_id: input.leadId,
      first_name: input.firstName,
      last_name: input.lastName,
      email: input.email,
      linkedin_url: input.linkedinUrl,
      company_name: input.companyName,
      title: input.title,
      status: 'pending',
      ab_variant: abVariant,
    })
    .select()
    .single();

  if (error) {
    console.error('Add contact error:', error);
    return { success: false, error: 'Failed to add contact' };
  }

  // Update campaign contacts_reached count
  await supabase.rpc('increment_campaign_contacts', { campaign_id: campaignId }).catch(() => {
    // Fallback: manual increment
    supabase
      .from('campaigns')
      .update({ contacts_reached: campaign.contacts_reached + 1 })
      .eq('id', campaignId);
  });

  return {
    success: true,
    data: {
      id: newContact.id,
      campaignId: newContact.campaign_id,
      contactType: newContact.contact_type,
      userId: newContact.user_id,
      leadId: newContact.lead_id,
      firstName: newContact.first_name,
      lastName: newContact.last_name,
      email: newContact.email,
      linkedinUrl: newContact.linkedin_url,
      companyName: newContact.company_name,
      title: newContact.title,
      status: newContact.status,
      abVariant: newContact.ab_variant,
      sentAt: null,
      openedAt: null,
      clickedAt: null,
      respondedAt: null,
      responseText: null,
      convertedAt: null,
      conversionType: null,
      createdAt: newContact.created_at,
    },
  };
}

/**
 * Update contact status (for engagement tracking).
 */
export async function updateContactStatusAction(
  contactId: string,
  status: string,
  responseText?: string
): Promise<ActionResult<void>> {
  if (!contactId || !z.string().uuid().safeParse(contactId).success) {
    return { success: false, error: 'Invalid contact ID' };
  }

  const validStatuses = ['pending', 'sent', 'opened', 'responded', 'converted', 'bounced', 'unsubscribed'];
  if (!validStatuses.includes(status)) {
    return { success: false, error: 'Invalid status' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:update required' };
  }

  // Build update object with timestamp
  const updates: Record<string, any> = { status };
  const now = new Date().toISOString();

  switch (status) {
    case 'sent':
      updates.sent_at = now;
      break;
    case 'opened':
      updates.opened_at = now;
      break;
    case 'responded':
      updates.responded_at = now;
      if (responseText) updates.response_text = responseText;
      break;
    case 'converted':
      updates.converted_at = now;
      break;
  }

  const { error: updateError } = await supabase
    .from('campaign_contacts')
    .update(updates)
    .eq('id', contactId);

  if (updateError) {
    return { success: false, error: 'Failed to update contact status' };
  }

  return { success: true };
}

/**
 * Get campaign metrics/analytics.
 */
export async function getCampaignMetricsAction(
  campaignId: string
): Promise<
  ActionResult<{
    totalContacts: number;
    sent: number;
    opened: number;
    responded: number;
    converted: number;
    bounced: number;
    openRate: number;
    responseRate: number;
    conversionRate: number;
    byVariant?: {
      A: { sent: number; opened: number; responded: number };
      B: { sent: number; opened: number; responded: number };
    };
  }>
> {
  if (!campaignId || !z.string().uuid().safeParse(campaignId).success) {
    return { success: false, error: 'Invalid campaign ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'campaigns', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: campaigns:read required' };
  }

  // Verify campaign belongs to org
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, is_ab_test')
    .eq('id', campaignId)
    .eq('org_id', profile.orgId)
    .single();

  if (!campaign) {
    return { success: false, error: 'Campaign not found' };
  }

  // Get all contacts for this campaign
  const { data: contacts } = await supabase
    .from('campaign_contacts')
    .select('status, ab_variant')
    .eq('campaign_id', campaignId);

  if (!contacts) {
    return {
      success: true,
      data: {
        totalContacts: 0,
        sent: 0,
        opened: 0,
        responded: 0,
        converted: 0,
        bounced: 0,
        openRate: 0,
        responseRate: 0,
        conversionRate: 0,
      },
    };
  }

  const totalContacts = contacts.length;
  const sent = contacts.filter((c) => c.status !== 'pending').length;
  const opened = contacts.filter((c) => ['opened', 'responded', 'converted'].includes(c.status)).length;
  const responded = contacts.filter((c) => ['responded', 'converted'].includes(c.status)).length;
  const converted = contacts.filter((c) => c.status === 'converted').length;
  const bounced = contacts.filter((c) => c.status === 'bounced').length;

  const openRate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
  const responseRate = sent > 0 ? Math.round((responded / sent) * 100) : 0;
  const conversionRate = sent > 0 ? Math.round((converted / sent) * 100) : 0;

  let byVariant;
  if (campaign.is_ab_test) {
    const variantA = contacts.filter((c) => c.ab_variant === 'A');
    const variantB = contacts.filter((c) => c.ab_variant === 'B');

    byVariant = {
      A: {
        sent: variantA.filter((c) => c.status !== 'pending').length,
        opened: variantA.filter((c) => ['opened', 'responded', 'converted'].includes(c.status)).length,
        responded: variantA.filter((c) => ['responded', 'converted'].includes(c.status)).length,
      },
      B: {
        sent: variantB.filter((c) => c.status !== 'pending').length,
        opened: variantB.filter((c) => ['opened', 'responded', 'converted'].includes(c.status)).length,
        responded: variantB.filter((c) => ['responded', 'converted'].includes(c.status)).length,
      },
    };
  }

  return {
    success: true,
    data: {
      totalContacts,
      sent,
      opened,
      responded,
      converted,
      bounced,
      openRate,
      responseRate,
      conversionRate,
      byVariant,
    },
  };
}
