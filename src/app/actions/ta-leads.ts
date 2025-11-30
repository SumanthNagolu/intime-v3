/**
 * TA/Sales Leads, Deals, Accounts & CRM Server Actions
 *
 * Provides CRUD operations for CRM entities with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/ta-leads
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

// Database Row Types (from Supabase queries)
interface RoleRow {
  role?: {
    name?: string;
  } | null;
}

interface LeadRow {
  id: string;
  lead_type: string;
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  status: string;
  estimated_value: number | null;
  source: string | null;
  source_campaign_id: string | null;
  owner_id: string | null;
  owner?: { full_name?: string | null };
  last_contacted_at: string | null;
  last_response_at: string | null;
  engagement_score: number | null;
  converted_to_deal_id: string | null;
  converted_to_account_id: string | null;
  converted_at: string | null;
  lost_reason: string | null;
  created_at: string;
  updated_at: string;
}

interface DealRow {
  id: string;
  title: string;
  description: string | null;
  value: string | number;
  stage: string;
  probability: number | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  close_reason: string | null;
  lead_id: string | null;
  account_id: string | null;
  account?: { name?: string | null };
  owner_id: string;
  owner?: { full_name?: string | null };
  linked_job_ids: string[] | null;
  created_at: string;
  updated_at: string;
}

interface AccountRow {
  id: string;
  name: string;
  industry: string | null;
  company_type: string;
  status: string;
  tier: string | null;
  account_manager_id: string | null;
  account_manager?: { full_name?: string | null };
  responsiveness: string | null;
  preferred_quality: string | null;
  description: string | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  payment_terms_days: number;
  markup_percentage: number | null;
  annual_revenue_target: number | null;
  website: string | null;
  headquarters_location: string | null;
  phone: string | null;
  contact_count: number;
  deal_count: number;
  created_at: string;
  updated_at: string;
}

interface ContactRow {
  id: string;
  account_id: string;
  account?: { name?: string | null };
  first_name: string;
  last_name: string;
  full_name: string | null;
  title: string | null;
  role: string | null;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  preferred_contact_method: string;
  decision_authority: string | null;
  notes: string | null;
  is_primary: boolean;
  is_active: boolean;
  created_at: string;
}

interface ActivityRow {
  id: string;
  entity_type: string;
  entity_id: string;
  activity_type: string;
  subject: string | null;
  body: string | null;
  direction: string | null;
  performed_by: string | null;
  performed_by_user?: { full_name?: string | null };
  poc_id: string | null;
  poc?: { full_name?: string | null };
  activity_date: string;
  duration_minutes: number | null;
  outcome: string | null;
  next_action: string | null;
  next_action_date: string | null;
  created_at: string;
}

interface UserRoleRow {
  roles?: {
    name?: string;
  } | null;
}

interface TeamMemberRow {
  id?: string;
  full_name?: string | null;
  user_roles?: UserRoleRow[];
}

// Partial row types for metrics queries
interface LeadStatusRow {
  status: string;
}

interface DealStageValueRow {
  stage: string;
  value: string | number;
}

interface AccountStatusRow {
  status: string;
}

interface ActivityDateTypeRow {
  activity_date: string;
  activity_type: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Lead Types
export interface Lead {
  id: string;
  leadType: string;
  companyName: string | null;
  industry: string | null;
  companySize: string | null;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  status: string;
  estimatedValue: number | null;
  source: string | null;
  sourceCampaignId: string | null;
  ownerId: string | null;
  ownerName: string | null;
  lastContactedAt: string | null;
  lastResponseAt: string | null;
  engagementScore: number | null;
  convertedToDealId: string | null;
  convertedToAccountId: string | null;
  convertedAt: string | null;
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Deal Types
export interface Deal {
  id: string;
  title: string;
  description: string | null;
  value: number;
  stage: string;
  probability: number | null;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  closeReason: string | null;
  leadId: string | null;
  accountId: string | null;
  accountName: string | null;
  ownerId: string;
  ownerName: string | null;
  linkedJobIds: string[] | null;
  createdAt: string;
  updatedAt: string;
}

// Account Types
export interface Account {
  id: string;
  name: string;
  industry: string | null;
  companyType: string;
  status: string;
  tier: string | null;
  accountManagerId: string | null;
  accountManagerName: string | null;
  responsiveness: string | null;
  preferredQuality: string | null;
  description: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  paymentTermsDays: number;
  markupPercentage: number | null;
  annualRevenueTarget: number | null;
  website: string | null;
  headquartersLocation: string | null;
  phone: string | null;
  contactCount: number;
  dealCount: number;
  createdAt: string;
  updatedAt: string;
}

// Point of Contact Types
export interface PointOfContact {
  id: string;
  accountId: string;
  accountName: string | null;
  firstName: string;
  lastName: string;
  fullName: string | null;
  title: string | null;
  role: string | null;
  email: string;
  phone: string | null;
  linkedinUrl: string | null;
  preferredContactMethod: string;
  decisionAuthority: string | null;
  notes: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
}

// Activity Types
export interface Activity {
  id: string;
  entityType: string;
  entityId: string;
  activityType: string;
  subject: string | null;
  body: string | null;
  direction: string | null;
  performedBy: string | null;
  performedByName: string | null;
  pocId: string | null;
  pocName: string | null;
  activityDate: string;
  durationMinutes: number | null;
  outcome: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  createdAt: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

// Lead Schemas
const listLeadsFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']).optional(),
  leadType: z.enum(['company', 'individual']).optional(),
  ownerId: z.string().uuid().optional(),
  source: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'companyName', 'estimatedValue', 'engagementScore']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createLeadSchema = z.object({
  leadType: z.enum(['company', 'individual']).default('company'),
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  status: z.enum(['new', 'warm', 'hot', 'cold']).default('new'),
  estimatedValue: z.number().optional(),
  source: z.string().optional(),
  sourceCampaignId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
});

const updateLeadSchema = z.object({
  companyName: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  status: z.enum(['new', 'warm', 'hot', 'cold', 'converted', 'lost']).optional(),
  estimatedValue: z.number().optional(),
  ownerId: z.string().uuid().optional(),
  engagementScore: z.number().min(0).max(100).optional(),
  lostReason: z.string().optional(),
});

// Deal Schemas
const listDealsFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  stage: z.enum(['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  ownerId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'value', 'expectedCloseDate', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createDealSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  value: z.number().min(0, 'Value must be positive'),
  stage: z.enum(['discovery', 'proposal', 'negotiation']).default('discovery'),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  accountId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  linkedJobIds: z.array(z.string().uuid()).optional(),
});

const updateDealSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  value: z.number().min(0).optional(),
  stage: z.enum(['discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  linkedJobIds: z.array(z.string().uuid()).optional(),
  closeReason: z.string().optional(),
});

// Account Schemas
const listAccountsFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['prospect', 'active', 'inactive', 'churned']).optional(),
  tier: z.string().optional(),
  accountManagerId: z.string().uuid().optional(),
  industry: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'annualRevenueTarget']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createAccountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  industry: z.string().optional(),
  companyType: z.enum(['direct_client', 'vendor', 'msp', 'staffing_partner']).default('direct_client'),
  status: z.enum(['prospect', 'active']).default('prospect'),
  tier: z.string().optional(),
  accountManagerId: z.string().uuid().optional(),
  responsiveness: z.string().optional(),
  preferredQuality: z.string().optional(),
  description: z.string().optional(),
  paymentTermsDays: z.number().default(30),
  markupPercentage: z.number().optional(),
  annualRevenueTarget: z.number().optional(),
  website: z.string().url().optional(),
  headquartersLocation: z.string().optional(),
  phone: z.string().optional(),
});

const updateAccountSchema = z.object({
  name: z.string().min(2).optional(),
  industry: z.string().optional(),
  companyType: z.string().optional(),
  status: z.enum(['prospect', 'active', 'inactive', 'churned']).optional(),
  tier: z.string().optional(),
  accountManagerId: z.string().uuid().optional(),
  responsiveness: z.string().optional(),
  preferredQuality: z.string().optional(),
  description: z.string().optional(),
  contractStartDate: z.string().optional(),
  contractEndDate: z.string().optional(),
  paymentTermsDays: z.number().optional(),
  markupPercentage: z.number().optional(),
  annualRevenueTarget: z.number().optional(),
  website: z.string().url().optional(),
  headquartersLocation: z.string().optional(),
  phone: z.string().optional(),
});

// POC Schemas
const createPOCSchema = z.object({
  accountId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  title: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'linkedin']).default('email'),
  decisionAuthority: z.enum(['decision_maker', 'influencer', 'gatekeeper', 'user']).optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

const updatePOCSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  title: z.string().optional(),
  role: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'linkedin']).optional(),
  decisionAuthority: z.string().optional(),
  notes: z.string().optional(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Activity Schemas
const createActivitySchema = z.object({
  entityType: z.enum(['lead', 'deal', 'account', 'poc']),
  entityId: z.string().uuid(),
  activityType: z.enum(['email', 'call', 'meeting', 'note', 'linkedin_message']),
  subject: z.string().optional(),
  body: z.string().optional(),
  direction: z.enum(['inbound', 'outbound']).optional(),
  pocId: z.string().uuid().optional(),
  activityDate: z.string().optional(),
  durationMinutes: z.number().optional(),
  outcome: z.string().optional(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Not authenticated', user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, org_id, email, full_name')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) {
    return { error: 'User profile not found', user, profile: null };
  }

  return { error: null, user, profile };
}

async function checkPermission(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_required_scope: 'all',
  });

  if (error) {
    const { data: roles } = await supabase
      .from('user_roles')
      .select(`role:roles!inner(name)`)
      .eq('user_id', userId)
      .is('deleted_at', null);

    const roleNames = roles?.map((r: RoleRow) => r.role?.name) || [];
    return roleNames.includes('super_admin') || roleNames.includes('admin') || roleNames.includes('ta_manager') || roleNames.includes('sales');
  }

  return data === true;
}

async function logAuditEvent(
  adminSupabase: ReturnType<typeof createAdminClient>,
  params: {
    tableName: string;
    action: string;
    recordId: string;
    userId: string;
    userEmail: string;
    orgId: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }
) {
  const { tableName, action, recordId, userId, userEmail, orgId, oldValues, newValues, metadata } = params;

  await (adminSupabase.from as (table: string) => ReturnType<typeof adminSupabase.from>)('audit_logs').insert({
    table_name: tableName,
    action,
    record_id: recordId,
    user_id: userId,
    user_email: userEmail,
    org_id: orgId,
    old_values: oldValues ?? null,
    new_values: newValues ?? null,
    metadata: metadata ?? {},
    severity: action === 'DELETE' ? 'warning' : 'info',
  });
}

// ============================================================================
// LEAD ACTIONS
// ============================================================================

/**
 * List leads with pagination, search, and filtering
 */
export async function listLeadsAction(
  filters: z.infer<typeof listLeadsFiltersSchema>
): Promise<ActionResult<PaginatedResult<Lead>>> {
  const validation = listLeadsFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, status, leadType, ownerId, source, sortBy, sortOrder } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'leads', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: leads:read required' };
  }

  let query = supabase
    .from('leads')
    .select(`
      id,
      lead_type,
      company_name,
      industry,
      company_size,
      first_name,
      last_name,
      full_name,
      title,
      email,
      phone,
      linkedin_url,
      status,
      estimated_value,
      source,
      source_campaign_id,
      owner_id,
      last_contacted_at,
      last_response_at,
      engagement_score,
      converted_to_deal_id,
      converted_to_account_id,
      converted_at,
      lost_reason,
      created_at,
      updated_at,
      owner:user_profiles!owner_id(full_name)
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.or(`company_name.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  if (status) query = query.eq('status', status);
  if (leadType) query = query.eq('lead_type', leadType);
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (source) query = query.eq('source', source);

  const sortColumn = sortBy === 'companyName' ? 'company_name' :
                     sortBy === 'estimatedValue' ? 'estimated_value' :
                     sortBy === 'engagementScore' ? 'engagement_score' :
                     sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'updatedAt' ? 'updated_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: leads, error, count } = await query;

  if (error) {
    console.error('List leads error:', error);
    return { success: false, error: 'Failed to fetch leads' };
  }

  const transformedLeads: Lead[] = (leads || []).map((lead: LeadRow) => ({
    id: lead.id,
    leadType: lead.lead_type,
    companyName: lead.company_name,
    industry: lead.industry,
    companySize: lead.company_size,
    firstName: lead.first_name,
    lastName: lead.last_name,
    fullName: lead.full_name,
    title: lead.title,
    email: lead.email,
    phone: lead.phone,
    linkedinUrl: lead.linkedin_url,
    status: lead.status,
    estimatedValue: lead.estimated_value ? parseFloat(lead.estimated_value) : null,
    source: lead.source,
    sourceCampaignId: lead.source_campaign_id,
    ownerId: lead.owner_id,
    ownerName: lead.owner?.full_name || null,
    lastContactedAt: lead.last_contacted_at,
    lastResponseAt: lead.last_response_at,
    engagementScore: lead.engagement_score,
    convertedToDealId: lead.converted_to_deal_id,
    convertedToAccountId: lead.converted_to_account_id,
    convertedAt: lead.converted_at,
    lostReason: lead.lost_reason,
    createdAt: lead.created_at,
    updatedAt: lead.updated_at,
  }));

  return {
    success: true,
    data: {
      items: transformedLeads,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get a single lead by ID
 */
export async function getLeadAction(leadId: string): Promise<ActionResult<Lead>> {
  if (!leadId || !z.string().uuid().safeParse(leadId).success) {
    return { success: false, error: 'Invalid lead ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'leads', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: leads:read required' };
  }

  const { data: lead, error } = await supabase
    .from('leads')
    .select(`
      *,
      owner:user_profiles!owner_id(full_name)
    `)
    .eq('id', leadId)
    .is('deleted_at', null)
    .single();

  if (error || !lead) {
    return { success: false, error: 'Lead not found' };
  }

  const fullName = lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : null;

  return {
    success: true,
    data: {
      id: lead.id,
      leadType: lead.lead_type,
      companyName: lead.company_name,
      industry: lead.industry,
      companySize: lead.company_size,
      firstName: lead.first_name,
      lastName: lead.last_name,
      fullName,
      title: lead.title,
      email: lead.email,
      phone: lead.phone,
      linkedinUrl: lead.linkedin_url,
      status: lead.status,
      estimatedValue: typeof lead.estimated_value === 'string' ? parseFloat(lead.estimated_value) : lead.estimated_value,
      source: lead.source,
      sourceCampaignId: lead.source_campaign_id,
      ownerId: lead.owner_id,
      ownerName: lead.owner?.full_name ?? null,
      lastContactedAt: lead.last_contacted_at,
      lastResponseAt: lead.last_response_at,
      engagementScore: lead.engagement_score,
      convertedToDealId: lead.converted_to_deal_id,
      convertedToAccountId: lead.converted_to_account_id,
      convertedAt: lead.converted_at,
      lostReason: lead.lost_reason,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    },
  };
}

/**
 * Create a new lead
 */
export async function createLeadAction(
  input: z.infer<typeof createLeadSchema>
): Promise<ActionResult<Lead>> {
  const validation = createLeadSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'leads', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: leads:create required' };
  }

  const data = validation.data;
  const fullName = data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null;

  const { data: newLead, error } = await adminSupabase
    .from('leads')
    .insert({
      org_id: profile.org_id,
      lead_type: data.leadType,
      company_name: data.companyName || null,
      industry: data.industry || null,
      company_size: data.companySize || null,
      first_name: data.firstName || null,
      last_name: data.lastName || null,
      full_name: fullName,
      title: data.title || null,
      email: data.email || null,
      phone: data.phone || null,
      linkedin_url: data.linkedinUrl || null,
      status: data.status,
      estimated_value: data.estimatedValue || null,
      source: data.source || null,
      source_campaign_id: data.sourceCampaignId || null,
      owner_id: data.ownerId || profile.id,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newLead) {
    console.error('Create lead error:', error);
    return { success: false, error: 'Failed to create lead' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'leads',
    action: 'INSERT',
    recordId: newLead.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'ta_create_lead' },
  });

  revalidatePath('/employee/ta/leads');

  return getLeadAction(newLead.id);
}

/**
 * Update a lead
 */
export async function updateLeadAction(
  leadId: string,
  input: z.infer<typeof updateLeadSchema>
): Promise<ActionResult<Lead>> {
  if (!leadId || !z.string().uuid().safeParse(leadId).success) {
    return { success: false, error: 'Invalid lead ID' };
  }

  const validation = updateLeadSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'leads', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: leads:update required' };
  }

  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: profile.id,
  };

  if (data.companyName !== undefined) updateData.company_name = data.companyName;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.companySize !== undefined) updateData.company_size = data.companySize;
  if (data.firstName !== undefined) updateData.first_name = data.firstName;
  if (data.lastName !== undefined) updateData.last_name = data.lastName;
  if (data.firstName || data.lastName) {
    const fn = data.firstName || existingLead.first_name;
    const ln = data.lastName || existingLead.last_name;
    updateData.full_name = fn && ln ? `${fn} ${ln}` : null;
  }
  if (data.title !== undefined) updateData.title = data.title;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.linkedinUrl !== undefined) updateData.linkedin_url = data.linkedinUrl;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.estimatedValue !== undefined) updateData.estimated_value = data.estimatedValue;
  if (data.ownerId !== undefined) updateData.owner_id = data.ownerId;
  if (data.engagementScore !== undefined) updateData.engagement_score = data.engagementScore;
  if (data.lostReason !== undefined) updateData.lost_reason = data.lostReason;

  const { error: updateError } = await adminSupabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId);

  if (updateError) {
    console.error('Update lead error:', updateError);
    return { success: false, error: 'Failed to update lead' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'leads',
    action: 'UPDATE',
    recordId: leadId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingLead,
    newValues: updateData,
    metadata: { source: 'ta_update_lead' },
  });

  revalidatePath('/employee/ta/leads');
  revalidatePath(`/employee/ta/leads/${leadId}`);

  return getLeadAction(leadId);
}

/**
 * Delete a lead (soft delete)
 */
export async function deleteLeadAction(leadId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!leadId || !z.string().uuid().safeParse(leadId).success) {
    return { success: false, error: 'Invalid lead ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'leads', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: leads:delete required' };
  }

  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('company_name, first_name, last_name')
    .eq('id', leadId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingLead) {
    return { success: false, error: 'Lead not found' };
  }

  const { error: deleteError } = await adminSupabase
    .from('leads')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', leadId);

  if (deleteError) {
    console.error('Delete lead error:', deleteError);
    return { success: false, error: 'Failed to delete lead' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'leads',
    action: 'DELETE',
    recordId: leadId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingLead as Record<string, unknown>,
    metadata: { source: 'ta_delete_lead' },
  });

  revalidatePath('/employee/ta/leads');

  return { success: true, data: { deleted: true } };
}

/**
 * Convert a lead to a deal and/or account
 */
export async function convertLeadAction(
  leadId: string,
  options: {
    createAccount?: boolean;
    createDeal?: boolean;
    dealTitle?: string;
    dealValue?: number;
  }
): Promise<ActionResult<{ leadId: string; accountId?: string; dealId?: string }>> {
  if (!leadId || !z.string().uuid().safeParse(leadId).success) {
    return { success: false, error: 'Invalid lead ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'leads', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: leads:update required' };
  }

  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !lead) {
    return { success: false, error: 'Lead not found' };
  }

  if (lead.status === 'converted') {
    return { success: false, error: 'Lead is already converted' };
  }

  let accountId: string | undefined;
  let dealId: string | undefined;

  // Create account if requested
  if (options.createAccount && lead.company_name) {
    const { data: account, error: accountError } = await adminSupabase
      .from('accounts')
      .insert({
        org_id: profile.org_id,
        name: lead.company_name,
        industry: lead.industry,
        status: 'active',
        account_manager_id: lead.owner_id || profile.id,
        created_by: profile.id,
      })
      .select()
      .single();

    if (accountError) {
      console.error('Create account from lead error:', accountError);
      return { success: false, error: 'Failed to create account from lead' };
    }
    accountId = account.id;

    // Create POC from lead contact info
    if (lead.first_name && lead.email) {
      const pocFullName = lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : lead.first_name;
      await adminSupabase.from('point_of_contacts').insert({
        account_id: accountId,
        first_name: lead.first_name,
        last_name: lead.last_name ?? '',
        full_name: pocFullName,
        title: lead.title,
        email: lead.email,
        phone: lead.phone,
        linkedin_url: lead.linkedin_url,
        is_primary: true,
        created_by: profile.id,
      });
    }
  }

  // Create deal if requested
  if (options.createDeal) {
    const leadFullName = lead.first_name && lead.last_name ? `${lead.first_name} ${lead.last_name}` : lead.first_name;
    const { data: deal, error: dealError } = await adminSupabase
      .from('deals')
      .insert({
        org_id: profile.org_id,
        lead_id: leadId,
        account_id: accountId ?? null,
        title: options.dealTitle ?? `Deal from ${lead.company_name ?? leadFullName}`,
        value: options.dealValue ?? lead.estimated_value ?? 0,
        stage: 'discovery',
        owner_id: lead.owner_id ?? profile.id,
        created_by: profile.id,
      })
      .select()
      .single();

    if (dealError) {
      console.error('Create deal from lead error:', dealError);
      return { success: false, error: 'Failed to create deal from lead' };
    }
    dealId = deal.id;
  }

  // Update lead status
  await adminSupabase
    .from('leads')
    .update({
      status: 'converted',
      converted_at: new Date().toISOString(),
      converted_to_account_id: accountId || null,
      converted_to_deal_id: dealId || null,
      updated_at: new Date().toISOString(),
      updated_by: profile.id,
    })
    .eq('id', leadId);

  await logAuditEvent(adminSupabase, {
    tableName: 'leads',
    action: 'CONVERT',
    recordId: leadId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: { status: 'converted', accountId, dealId },
    metadata: { source: 'ta_convert_lead' },
  });

  revalidatePath('/employee/ta/leads');
  revalidatePath('/employee/ta/deals');
  revalidatePath('/employee/ta/accounts');

  return { success: true, data: { leadId, accountId, dealId } };
}

/**
 * Record contact with a lead
 */
export async function recordLeadContactAction(
  leadId: string,
  contactType: 'email' | 'call' | 'meeting' | 'linkedin_message',
  response?: boolean
): Promise<ActionResult<Lead>> {
  if (!leadId || !z.string().uuid().safeParse(leadId).success) {
    return { success: false, error: 'Invalid lead ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const adminSupabase = createAdminClient();

  const updateData: Record<string, unknown> = {
    last_contacted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: profile.id,
  };

  if (response) {
    updateData.last_response_at = new Date().toISOString();
  }

  const { error: updateError } = await adminSupabase
    .from('leads')
    .update(updateData)
    .eq('id', leadId);

  if (updateError) {
    console.error('Record lead contact error:', updateError);
    return { success: false, error: 'Failed to record contact' };
  }

  // Create activity log entry
  await adminSupabase.from('activity_log').insert({
    org_id: profile.org_id,
    entity_type: 'lead',
    entity_id: leadId,
    activity_type: contactType,
    direction: 'outbound',
    performed_by: profile.id,
    outcome: response ? 'response_received' : 'no_response',
  });

  revalidatePath('/employee/ta/leads');
  revalidatePath(`/employee/ta/leads/${leadId}`);

  return getLeadAction(leadId);
}

// ============================================================================
// DEAL ACTIONS
// ============================================================================

/**
 * List deals with pagination, search, and filtering
 */
export async function listDealsAction(
  filters: z.infer<typeof listDealsFiltersSchema>
): Promise<ActionResult<PaginatedResult<Deal>>> {
  const validation = listDealsFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, stage, ownerId, accountId, minValue, maxValue, sortBy, sortOrder } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'deals', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: deals:read required' };
  }

  let query = supabase
    .from('deals')
    .select(`
      id,
      title,
      description,
      value,
      stage,
      probability,
      expected_close_date,
      actual_close_date,
      close_reason,
      lead_id,
      account_id,
      owner_id,
      linked_job_ids,
      created_at,
      updated_at,
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name)
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }
  if (stage) query = query.eq('stage', stage);
  if (ownerId) query = query.eq('owner_id', ownerId);
  if (accountId) query = query.eq('account_id', accountId);
  if (minValue) query = query.gte('value', minValue);
  if (maxValue) query = query.lte('value', maxValue);

  const sortColumn = sortBy === 'expectedCloseDate' ? 'expected_close_date' :
                     sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'updatedAt' ? 'updated_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: deals, error, count } = await query;

  if (error) {
    console.error('List deals error:', error);
    return { success: false, error: 'Failed to fetch deals' };
  }

  const transformedDeals: Deal[] = (deals || []).map((deal: DealRow) => ({
    id: deal.id,
    title: deal.title,
    description: deal.description,
    value: parseFloat(deal.value),
    stage: deal.stage,
    probability: deal.probability,
    expectedCloseDate: deal.expected_close_date,
    actualCloseDate: deal.actual_close_date,
    closeReason: deal.close_reason,
    leadId: deal.lead_id,
    accountId: deal.account_id,
    accountName: deal.account?.name || null,
    ownerId: deal.owner_id,
    ownerName: deal.owner?.full_name || null,
    linkedJobIds: deal.linked_job_ids,
    createdAt: deal.created_at,
    updatedAt: deal.updated_at,
  }));

  return {
    success: true,
    data: {
      items: transformedDeals,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get a single deal by ID
 */
export async function getDealAction(dealId: string): Promise<ActionResult<Deal>> {
  if (!dealId || !z.string().uuid().safeParse(dealId).success) {
    return { success: false, error: 'Invalid deal ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'deals', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: deals:read required' };
  }

  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      account:accounts!account_id(name),
      owner:user_profiles!owner_id(full_name)
    `)
    .eq('id', dealId)
    .is('deleted_at', null)
    .single();

  if (error || !deal) {
    return { success: false, error: 'Deal not found' };
  }

  return {
    success: true,
    data: {
      id: deal.id,
      title: deal.title,
      description: deal.description,
      value: typeof deal.value === 'string' ? parseFloat(deal.value) : deal.value,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expected_close_date,
      actualCloseDate: deal.actual_close_date,
      closeReason: deal.close_reason,
      leadId: deal.lead_id,
      accountId: deal.account_id,
      accountName: deal.account?.name ?? null,
      ownerId: deal.owner_id,
      ownerName: deal.owner?.full_name ?? null,
      linkedJobIds: deal.linked_job_ids,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at,
    },
  };
}

/**
 * Create a new deal
 */
export async function createDealAction(
  input: z.infer<typeof createDealSchema>
): Promise<ActionResult<Deal>> {
  const validation = createDealSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'deals', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: deals:create required' };
  }

  const data = validation.data;

  const { data: newDeal, error } = await adminSupabase
    .from('deals')
    .insert({
      org_id: profile.org_id,
      title: data.title,
      description: data.description || null,
      value: data.value,
      stage: data.stage,
      probability: data.probability || null,
      expected_close_date: data.expectedCloseDate || null,
      account_id: data.accountId || null,
      lead_id: data.leadId || null,
      owner_id: data.ownerId || profile.id,
      linked_job_ids: data.linkedJobIds || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newDeal) {
    console.error('Create deal error:', error);
    return { success: false, error: 'Failed to create deal' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'deals',
    action: 'INSERT',
    recordId: newDeal.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'ta_create_deal' },
  });

  revalidatePath('/employee/ta/deals');

  return getDealAction(newDeal.id);
}

/**
 * Update a deal
 */
export async function updateDealAction(
  dealId: string,
  input: z.infer<typeof updateDealSchema>
): Promise<ActionResult<Deal>> {
  if (!dealId || !z.string().uuid().safeParse(dealId).success) {
    return { success: false, error: 'Invalid deal ID' };
  }

  const validation = updateDealSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'deals', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: deals:update required' };
  }

  const { data: existingDeal, error: fetchError } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingDeal) {
    return { success: false, error: 'Deal not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: profile.id,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.value !== undefined) updateData.value = data.value;
  if (data.stage !== undefined) {
    updateData.stage = data.stage;
    if (data.stage === 'closed_won' || data.stage === 'closed_lost') {
      updateData.actual_close_date = new Date().toISOString();
    }
  }
  if (data.probability !== undefined) updateData.probability = data.probability;
  if (data.expectedCloseDate !== undefined) updateData.expected_close_date = data.expectedCloseDate;
  if (data.ownerId !== undefined) updateData.owner_id = data.ownerId;
  if (data.linkedJobIds !== undefined) updateData.linked_job_ids = data.linkedJobIds;
  if (data.closeReason !== undefined) updateData.close_reason = data.closeReason;

  const { error: updateError } = await adminSupabase
    .from('deals')
    .update(updateData)
    .eq('id', dealId);

  if (updateError) {
    console.error('Update deal error:', updateError);
    return { success: false, error: 'Failed to update deal' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'deals',
    action: 'UPDATE',
    recordId: dealId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingDeal,
    newValues: updateData,
    metadata: { source: 'ta_update_deal' },
  });

  revalidatePath('/employee/ta/deals');
  revalidatePath(`/employee/ta/deals/${dealId}`);

  return getDealAction(dealId);
}

/**
 * Delete a deal (soft delete)
 */
export async function deleteDealAction(dealId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!dealId || !z.string().uuid().safeParse(dealId).success) {
    return { success: false, error: 'Invalid deal ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'deals', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: deals:delete required' };
  }

  const { data: existingDeal, error: fetchError } = await supabase
    .from('deals')
    .select('title')
    .eq('id', dealId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingDeal) {
    return { success: false, error: 'Deal not found' };
  }

  const { error: deleteError } = await adminSupabase
    .from('deals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', dealId);

  if (deleteError) {
    console.error('Delete deal error:', deleteError);
    return { success: false, error: 'Failed to delete deal' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'deals',
    action: 'DELETE',
    recordId: dealId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingDeal,
    metadata: { source: 'ta_delete_deal' },
  });

  revalidatePath('/employee/ta/deals');

  return { success: true, data: { deleted: true } };
}

/**
 * Move deal to next stage
 */
export async function advanceDealStageAction(dealId: string): Promise<ActionResult<Deal>> {
  if (!dealId || !z.string().uuid().safeParse(dealId).success) {
    return { success: false, error: 'Invalid deal ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: deal, error: fetchError } = await supabase
    .from('deals')
    .select('stage')
    .eq('id', dealId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !deal) {
    return { success: false, error: 'Deal not found' };
  }

  const stageOrder = ['discovery', 'proposal', 'negotiation', 'closed_won'];
  const currentIndex = stageOrder.indexOf(deal.stage);

  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) {
    return { success: false, error: 'Cannot advance deal stage' };
  }

  const nextStage = stageOrder[currentIndex + 1];
  const updateData: Record<string, unknown> = {
    stage: nextStage,
    updated_at: new Date().toISOString(),
    updated_by: profile.id,
  };

  // Set probability based on stage
  const probabilityMap: Record<string, number> = {
    discovery: 20,
    proposal: 50,
    negotiation: 75,
    closed_won: 100,
  };
  updateData.probability = probabilityMap[nextStage];

  if (nextStage === 'closed_won') {
    updateData.actual_close_date = new Date().toISOString();
  }

  const { error: updateError } = await adminSupabase
    .from('deals')
    .update(updateData)
    .eq('id', dealId);

  if (updateError) {
    console.error('Advance deal stage error:', updateError);
    return { success: false, error: 'Failed to advance deal stage' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'deals',
    action: 'STAGE_ADVANCE',
    recordId: dealId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: { stage: deal.stage },
    newValues: { stage: nextStage },
    metadata: { source: 'ta_advance_deal' },
  });

  revalidatePath('/employee/ta/deals');
  revalidatePath(`/employee/ta/deals/${dealId}`);

  return getDealAction(dealId);
}

/**
 * Get deal pipeline summary
 */
export async function getDealPipelineAction(): Promise<ActionResult<{
  stages: Array<{
    stage: string;
    count: number;
    totalValue: number;
    weightedValue: number;
  }>;
  totalPipelineValue: number;
  totalWeightedValue: number;
}>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: deals, error } = await supabase
    .from('deals')
    .select('stage, value, probability')
    .is('deleted_at', null)
    .not('stage', 'in', '(closed_won,closed_lost)');

  if (error) {
    console.error('Get deal pipeline error:', error);
    return { success: false, error: 'Failed to fetch pipeline' };
  }

  const stageMap = new Map<string, { count: number; totalValue: number; weightedValue: number }>();
  const stages = ['discovery', 'proposal', 'negotiation'];

  stages.forEach(stage => {
    stageMap.set(stage, { count: 0, totalValue: 0, weightedValue: 0 });
  });

  let totalPipelineValue = 0;
  let totalWeightedValue = 0;

  (deals || []).forEach((deal: DealRow) => {
    const value = parseFloat(deal.value) || 0;
    const probability = deal.probability || 0;
    const weighted = value * (probability / 100);

    const stageData = stageMap.get(deal.stage);
    if (stageData) {
      stageData.count++;
      stageData.totalValue += value;
      stageData.weightedValue += weighted;
    }

    totalPipelineValue += value;
    totalWeightedValue += weighted;
  });

  return {
    success: true,
    data: {
      stages: stages.map(stage => ({
        stage,
        ...stageMap.get(stage)!,
      })),
      totalPipelineValue,
      totalWeightedValue,
    },
  };
}

// ============================================================================
// ACCOUNT ACTIONS
// ============================================================================

/**
 * List accounts with pagination, search, and filtering
 */
export async function listAccountsAction(
  filters: z.infer<typeof listAccountsFiltersSchema>
): Promise<ActionResult<PaginatedResult<Account>>> {
  const validation = listAccountsFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, status, tier, accountManagerId, industry, sortBy, sortOrder } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'accounts', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: accounts:read required' };
  }

  let query = supabase
    .from('accounts')
    .select(`
      id,
      name,
      industry,
      company_type,
      status,
      tier,
      account_manager_id,
      responsiveness,
      preferred_quality,
      description,
      contract_start_date,
      contract_end_date,
      payment_terms_days,
      markup_percentage,
      annual_revenue_target,
      website,
      headquarters_location,
      phone,
      created_at,
      updated_at,
      account_manager:user_profiles!account_manager_id(full_name),
      point_of_contacts(id),
      deals(id)
    `, { count: 'exact' })
    .is('deleted_at', null);

  if (search) {
    query = query.or(`name.ilike.%${search}%,industry.ilike.%${search}%`);
  }
  if (status) query = query.eq('status', status);
  if (tier) query = query.eq('tier', tier);
  if (accountManagerId) query = query.eq('account_manager_id', accountManagerId);
  if (industry) query = query.eq('industry', industry);

  const sortColumn = sortBy === 'annualRevenueTarget' ? 'annual_revenue_target' :
                     sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'updatedAt' ? 'updated_at' : sortBy;
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data: accounts, error, count } = await query;

  if (error) {
    console.error('List accounts error:', error);
    return { success: false, error: 'Failed to fetch accounts' };
  }

  const transformedAccounts: Account[] = (accounts || []).map((account: AccountRow) => ({
    id: account.id,
    name: account.name,
    industry: account.industry,
    companyType: account.company_type,
    status: account.status,
    tier: account.tier,
    accountManagerId: account.account_manager_id,
    accountManagerName: account.account_manager?.full_name || null,
    responsiveness: account.responsiveness,
    preferredQuality: account.preferred_quality,
    description: account.description,
    contractStartDate: account.contract_start_date,
    contractEndDate: account.contract_end_date,
    paymentTermsDays: account.payment_terms_days,
    markupPercentage: account.markup_percentage ? parseFloat(account.markup_percentage) : null,
    annualRevenueTarget: account.annual_revenue_target ? parseFloat(account.annual_revenue_target) : null,
    website: account.website,
    headquartersLocation: account.headquarters_location,
    phone: account.phone,
    contactCount: account.point_of_contacts?.length || 0,
    dealCount: account.deals?.length || 0,
    createdAt: account.created_at,
    updatedAt: account.updated_at,
  }));

  return {
    success: true,
    data: {
      items: transformedAccounts,
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  };
}

/**
 * Get a single account by ID
 */
export async function getAccountAction(accountId: string): Promise<ActionResult<Account>> {
  if (!accountId || !z.string().uuid().safeParse(accountId).success) {
    return { success: false, error: 'Invalid account ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'accounts', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: accounts:read required' };
  }

  const { data: account, error } = await supabase
    .from('accounts')
    .select(`
      *,
      account_manager:user_profiles!account_manager_id(full_name),
      point_of_contacts(id),
      deals(id)
    `)
    .eq('id', accountId)
    .is('deleted_at', null)
    .single();

  if (error || !account) {
    return { success: false, error: 'Account not found' };
  }

  return {
    success: true,
    data: {
      id: account.id,
      name: account.name,
      industry: account.industry,
      companyType: account.company_type ?? 'direct_client',
      status: account.status ?? 'prospect',
      tier: account.tier,
      accountManagerId: account.account_manager_id,
      accountManagerName: account.account_manager?.full_name ?? null,
      responsiveness: account.responsiveness,
      preferredQuality: account.preferred_quality,
      description: account.description,
      contractStartDate: account.contract_start_date,
      contractEndDate: account.contract_end_date,
      paymentTermsDays: account.payment_terms_days ?? 30,
      markupPercentage: typeof account.markup_percentage === 'string' ? parseFloat(account.markup_percentage) : account.markup_percentage,
      annualRevenueTarget: typeof account.annual_revenue_target === 'string' ? parseFloat(account.annual_revenue_target) : account.annual_revenue_target,
      website: account.website,
      headquartersLocation: account.headquarters_location,
      phone: account.phone,
      contactCount: account.point_of_contacts?.length ?? 0,
      dealCount: account.deals?.length ?? 0,
      createdAt: account.created_at,
      updatedAt: account.updated_at,
    },
  };
}

/**
 * Create a new account
 */
export async function createAccountAction(
  input: z.infer<typeof createAccountSchema>
): Promise<ActionResult<Account>> {
  const validation = createAccountSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'accounts', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: accounts:create required' };
  }

  const data = validation.data;

  const { data: newAccount, error } = await adminSupabase
    .from('accounts')
    .insert({
      org_id: profile.org_id,
      name: data.name,
      industry: data.industry || null,
      company_type: data.companyType,
      status: data.status,
      tier: data.tier || null,
      account_manager_id: data.accountManagerId || profile.id,
      responsiveness: data.responsiveness || null,
      preferred_quality: data.preferredQuality || null,
      description: data.description || null,
      payment_terms_days: data.paymentTermsDays,
      markup_percentage: data.markupPercentage || null,
      annual_revenue_target: data.annualRevenueTarget || null,
      website: data.website || null,
      headquarters_location: data.headquartersLocation || null,
      phone: data.phone || null,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error || !newAccount) {
    console.error('Create account error:', error);
    return { success: false, error: 'Failed to create account' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'accounts',
    action: 'INSERT',
    recordId: newAccount.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'ta_create_account' },
  });

  revalidatePath('/employee/ta/accounts');

  return getAccountAction(newAccount.id);
}

/**
 * Update an account
 */
export async function updateAccountAction(
  accountId: string,
  input: z.infer<typeof updateAccountSchema>
): Promise<ActionResult<Account>> {
  if (!accountId || !z.string().uuid().safeParse(accountId).success) {
    return { success: false, error: 'Invalid account ID' };
  }

  const validation = updateAccountSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'accounts', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: accounts:update required' };
  }

  const { data: existingAccount, error: fetchError } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingAccount) {
    return { success: false, error: 'Account not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: profile.id,
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.industry !== undefined) updateData.industry = data.industry;
  if (data.companyType !== undefined) updateData.company_type = data.companyType;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.tier !== undefined) updateData.tier = data.tier;
  if (data.accountManagerId !== undefined) updateData.account_manager_id = data.accountManagerId;
  if (data.responsiveness !== undefined) updateData.responsiveness = data.responsiveness;
  if (data.preferredQuality !== undefined) updateData.preferred_quality = data.preferredQuality;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.contractStartDate !== undefined) updateData.contract_start_date = data.contractStartDate;
  if (data.contractEndDate !== undefined) updateData.contract_end_date = data.contractEndDate;
  if (data.paymentTermsDays !== undefined) updateData.payment_terms_days = data.paymentTermsDays;
  if (data.markupPercentage !== undefined) updateData.markup_percentage = data.markupPercentage;
  if (data.annualRevenueTarget !== undefined) updateData.annual_revenue_target = data.annualRevenueTarget;
  if (data.website !== undefined) updateData.website = data.website;
  if (data.headquartersLocation !== undefined) updateData.headquarters_location = data.headquartersLocation;
  if (data.phone !== undefined) updateData.phone = data.phone;

  const { error: updateError } = await adminSupabase
    .from('accounts')
    .update(updateData)
    .eq('id', accountId);

  if (updateError) {
    console.error('Update account error:', updateError);
    return { success: false, error: 'Failed to update account' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'accounts',
    action: 'UPDATE',
    recordId: accountId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingAccount,
    newValues: updateData,
    metadata: { source: 'ta_update_account' },
  });

  revalidatePath('/employee/ta/accounts');
  revalidatePath(`/employee/ta/accounts/${accountId}`);

  return getAccountAction(accountId);
}

/**
 * Delete an account (soft delete)
 */
export async function deleteAccountAction(accountId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!accountId || !z.string().uuid().safeParse(accountId).success) {
    return { success: false, error: 'Invalid account ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'accounts', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: accounts:delete required' };
  }

  const { data: existingAccount, error: fetchError } = await supabase
    .from('accounts')
    .select('name')
    .eq('id', accountId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingAccount) {
    return { success: false, error: 'Account not found' };
  }

  const { error: deleteError } = await adminSupabase
    .from('accounts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', accountId);

  if (deleteError) {
    console.error('Delete account error:', deleteError);
    return { success: false, error: 'Failed to delete account' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'accounts',
    action: 'DELETE',
    recordId: accountId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingAccount,
    metadata: { source: 'ta_delete_account' },
  });

  revalidatePath('/employee/ta/accounts');

  return { success: true, data: { deleted: true } };
}

// ============================================================================
// POINT OF CONTACT ACTIONS
// ============================================================================

/**
 * List contacts for an account
 */
export async function listAccountContactsAction(
  accountId: string
): Promise<ActionResult<PointOfContact[]>> {
  if (!accountId || !z.string().uuid().safeParse(accountId).success) {
    return { success: false, error: 'Invalid account ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: contacts, error } = await supabase
    .from('point_of_contacts')
    .select(`
      *,
      account:accounts!account_id(name)
    `)
    .eq('account_id', accountId)
    .is('deleted_at', null)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('List account contacts error:', error);
    return { success: false, error: 'Failed to fetch contacts' };
  }

  const transformedContacts: PointOfContact[] = (contacts || []).map((contact: ContactRow) => ({
    id: contact.id,
    accountId: contact.account_id,
    accountName: contact.account?.name || null,
    firstName: contact.first_name,
    lastName: contact.last_name,
    fullName: contact.full_name,
    title: contact.title,
    role: contact.role,
    email: contact.email,
    phone: contact.phone,
    linkedinUrl: contact.linkedin_url,
    preferredContactMethod: contact.preferred_contact_method,
    decisionAuthority: contact.decision_authority,
    notes: contact.notes,
    isPrimary: contact.is_primary,
    isActive: contact.is_active,
    createdAt: contact.created_at,
  }));

  return { success: true, data: transformedContacts };
}

/**
 * Create a new contact for an account
 */
export async function createContactAction(
  input: z.infer<typeof createPOCSchema>
): Promise<ActionResult<PointOfContact>> {
  const validation = createPOCSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'accounts', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: accounts:update required' };
  }

  const data = validation.data;
  const fullName = `${data.firstName} ${data.lastName}`;

  // If setting as primary, unset other primary contacts
  if (data.isPrimary) {
    await adminSupabase
      .from('point_of_contacts')
      .update({ is_primary: false })
      .eq('account_id', data.accountId)
      .is('deleted_at', null);
  }

  const { data: newContact, error } = await adminSupabase
    .from('point_of_contacts')
    .insert({
      account_id: data.accountId,
      first_name: data.firstName,
      last_name: data.lastName,
      full_name: fullName,
      title: data.title || null,
      role: data.role || null,
      email: data.email,
      phone: data.phone || null,
      linkedin_url: data.linkedinUrl || null,
      preferred_contact_method: data.preferredContactMethod,
      decision_authority: data.decisionAuthority || null,
      notes: data.notes || null,
      is_primary: data.isPrimary,
      is_active: true,
      created_by: profile.id,
    })
    .select(`
      *,
      account:accounts!account_id(name)
    `)
    .single();

  if (error || !newContact) {
    console.error('Create contact error:', error);
    return { success: false, error: 'Failed to create contact' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'point_of_contacts',
    action: 'INSERT',
    recordId: newContact.id,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    newValues: data as Record<string, unknown>,
    metadata: { source: 'ta_create_contact', accountId: data.accountId },
  });

  revalidatePath('/employee/ta/accounts');
  revalidatePath(`/employee/ta/accounts/${data.accountId}`);

  return {
    success: true,
    data: {
      id: newContact.id,
      accountId: newContact.account_id,
      accountName: newContact.account?.name ?? null,
      firstName: newContact.first_name,
      lastName: newContact.last_name,
      fullName: newContact.full_name,
      title: newContact.title,
      role: newContact.role,
      email: newContact.email,
      phone: newContact.phone,
      linkedinUrl: newContact.linkedin_url,
      preferredContactMethod: newContact.preferred_contact_method ?? 'email',
      decisionAuthority: newContact.decision_authority,
      notes: newContact.notes,
      isPrimary: newContact.is_primary ?? false,
      isActive: newContact.is_active ?? true,
      createdAt: newContact.created_at,
    },
  };
}

/**
 * Update a contact
 */
export async function updateContactAction(
  contactId: string,
  input: z.infer<typeof updatePOCSchema>
): Promise<ActionResult<PointOfContact>> {
  if (!contactId || !z.string().uuid().safeParse(contactId).success) {
    return { success: false, error: 'Invalid contact ID' };
  }

  const validation = updatePOCSchema.safeParse(input);
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
  const adminSupabase = createAdminClient();

  const { data: existingContact, error: fetchError } = await supabase
    .from('point_of_contacts')
    .select('*')
    .eq('id', contactId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingContact) {
    return { success: false, error: 'Contact not found' };
  }

  const data = validation.data;
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.firstName !== undefined) updateData.first_name = data.firstName;
  if (data.lastName !== undefined) updateData.last_name = data.lastName;
  if (data.firstName || data.lastName) {
    const fn = data.firstName || existingContact.first_name;
    const ln = data.lastName || existingContact.last_name;
    updateData.full_name = `${fn} ${ln}`;
  }
  if (data.title !== undefined) updateData.title = data.title;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.linkedinUrl !== undefined) updateData.linkedin_url = data.linkedinUrl;
  if (data.preferredContactMethod !== undefined) updateData.preferred_contact_method = data.preferredContactMethod;
  if (data.decisionAuthority !== undefined) updateData.decision_authority = data.decisionAuthority;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  // Handle primary flag
  if (data.isPrimary !== undefined) {
    updateData.is_primary = data.isPrimary;
    if (data.isPrimary) {
      await adminSupabase
        .from('point_of_contacts')
        .update({ is_primary: false })
        .eq('account_id', existingContact.account_id)
        .neq('id', contactId)
        .is('deleted_at', null);
    }
  }

  const { error: updateError } = await adminSupabase
    .from('point_of_contacts')
    .update(updateData)
    .eq('id', contactId);

  if (updateError) {
    console.error('Update contact error:', updateError);
    return { success: false, error: 'Failed to update contact' };
  }

  const { data: updatedContact, error: refetchError } = await supabase
    .from('point_of_contacts')
    .select(`
      *,
      account:accounts!account_id(name)
    `)
    .eq('id', contactId)
    .single();

  if (refetchError || !updatedContact) {
    return { success: false, error: 'Failed to fetch updated contact' };
  }

  revalidatePath('/employee/ta/accounts');
  revalidatePath(`/employee/ta/accounts/${existingContact.account_id}`);

  return {
    success: true,
    data: {
      id: updatedContact.id,
      accountId: updatedContact.account_id,
      accountName: updatedContact.account?.name ?? null,
      firstName: updatedContact.first_name,
      lastName: updatedContact.last_name,
      fullName: updatedContact.full_name,
      title: updatedContact.title,
      role: updatedContact.role,
      email: updatedContact.email,
      phone: updatedContact.phone,
      linkedinUrl: updatedContact.linkedin_url,
      preferredContactMethod: updatedContact.preferred_contact_method ?? 'email',
      decisionAuthority: updatedContact.decision_authority,
      notes: updatedContact.notes,
      isPrimary: updatedContact.is_primary ?? false,
      isActive: updatedContact.is_active ?? true,
      createdAt: updatedContact.created_at,
    },
  };
}

/**
 * Delete a contact (soft delete)
 */
export async function deleteContactAction(contactId: string): Promise<ActionResult<{ deleted: boolean }>> {
  if (!contactId || !z.string().uuid().safeParse(contactId).success) {
    return { success: false, error: 'Invalid contact ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: existingContact, error: fetchError } = await supabase
    .from('point_of_contacts')
    .select('account_id, full_name')
    .eq('id', contactId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !existingContact) {
    return { success: false, error: 'Contact not found' };
  }

  const { error: deleteError } = await adminSupabase
    .from('point_of_contacts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contactId);

  if (deleteError) {
    console.error('Delete contact error:', deleteError);
    return { success: false, error: 'Failed to delete contact' };
  }

  await logAuditEvent(adminSupabase, {
    tableName: 'point_of_contacts',
    action: 'DELETE',
    recordId: contactId,
    userId: profile.id,
    userEmail: profile.email,
    orgId: profile.org_id,
    oldValues: existingContact,
    metadata: { source: 'ta_delete_contact' },
  });

  revalidatePath('/employee/ta/accounts');
  revalidatePath(`/employee/ta/accounts/${existingContact.account_id}`);

  return { success: true, data: { deleted: true } };
}

// ============================================================================
// ACTIVITY ACTIONS
// ============================================================================

/**
 * List activities for an entity
 */
export async function listActivitiesAction(
  entityType: 'lead' | 'deal' | 'account' | 'poc',
  entityId: string
): Promise<ActionResult<Activity[]>> {
  if (!entityId || !z.string().uuid().safeParse(entityId).success) {
    return { success: false, error: 'Invalid entity ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data: activities, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      performer:user_profiles!performed_by(full_name),
      poc:point_of_contacts!poc_id(full_name)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('activity_date', { ascending: false });

  if (error) {
    console.error('List activities error:', error);
    return { success: false, error: 'Failed to fetch activities' };
  }

  const transformedActivities: Activity[] = (activities || []).map((activity: ActivityRow) => ({
    id: activity.id,
    entityType: activity.entity_type,
    entityId: activity.entity_id,
    activityType: activity.activity_type,
    subject: activity.subject,
    body: activity.body,
    direction: activity.direction,
    performedBy: activity.performed_by,
    performedByName: activity.performer?.full_name || null,
    pocId: activity.poc_id,
    pocName: activity.poc?.full_name || null,
    activityDate: activity.activity_date,
    durationMinutes: activity.duration_minutes,
    outcome: activity.outcome,
    nextAction: activity.next_action,
    nextActionDate: activity.next_action_date,
    createdAt: activity.created_at,
  }));

  return { success: true, data: transformedActivities };
}

/**
 * Create an activity
 */
export async function createActivityAction(
  input: z.infer<typeof createActivitySchema>
): Promise<ActionResult<Activity>> {
  const validation = createActivitySchema.safeParse(input);
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

  const adminSupabase = createAdminClient();
  const data = validation.data;

  const { data: newActivity, error } = await adminSupabase
    .from('activity_log')
    .insert({
      org_id: profile.org_id,
      entity_type: data.entityType,
      entity_id: data.entityId,
      activity_type: data.activityType,
      subject: data.subject || null,
      body: data.body || null,
      direction: data.direction || null,
      performed_by: profile.id,
      poc_id: data.pocId || null,
      activity_date: data.activityDate || new Date().toISOString(),
      duration_minutes: data.durationMinutes || null,
      outcome: data.outcome || null,
      next_action: data.nextAction || null,
      next_action_date: data.nextActionDate || null,
    })
    .select(`
      *,
      performer:user_profiles!performed_by(full_name),
      poc:point_of_contacts!poc_id(full_name)
    `)
    .single();

  if (error || !newActivity) {
    console.error('Create activity error:', error);
    return { success: false, error: 'Failed to create activity' };
  }

  // Update last_contacted_at on lead if applicable
  if (data.entityType === 'lead') {
    await adminSupabase
      .from('leads')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', data.entityId);
  }

  revalidatePath(`/employee/ta/${data.entityType}s`);
  revalidatePath(`/employee/ta/${data.entityType}s/${data.entityId}`);

  return {
    success: true,
    data: {
      id: newActivity.id,
      entityType: newActivity.entity_type,
      entityId: newActivity.entity_id,
      activityType: newActivity.activity_type,
      subject: newActivity.subject,
      body: newActivity.body,
      direction: newActivity.direction,
      performedBy: newActivity.performed_by,
      performedByName: newActivity.performer?.full_name || null,
      pocId: newActivity.poc_id,
      pocName: newActivity.poc?.full_name || null,
      activityDate: newActivity.activity_date,
      durationMinutes: newActivity.duration_minutes,
      outcome: newActivity.outcome,
      nextAction: newActivity.next_action,
      nextActionDate: newActivity.next_action_date,
      createdAt: newActivity.created_at,
    },
  };
}

// ============================================================================
// ANALYTICS / DASHBOARD ACTIONS
// ============================================================================

/**
 * Get TA/Sales dashboard metrics
 */
export async function getTADashboardMetricsAction(): Promise<ActionResult<{
  leads: {
    total: number;
    new: number;
    hot: number;
    converted: number;
    conversionRate: number;
  };
  deals: {
    total: number;
    pipelineValue: number;
    closedWonValue: number;
    avgDealSize: number;
    winRate: number;
  };
  accounts: {
    total: number;
    active: number;
    prospect: number;
  };
  activities: {
    thisWeek: number;
    lastWeek: number;
    callsMade: number;
    emailsSent: number;
    meetingsHeld: number;
  };
}>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Fetch leads stats
  const { data: leads } = await supabase
    .from('leads')
    .select('status')
    .is('deleted_at', null);

  const leadStats = {
    total: leads?.length || 0,
    new: leads?.filter((l: LeadStatusRow) => l.status === 'new').length || 0,
    hot: leads?.filter((l: LeadStatusRow) => l.status === 'hot').length || 0,
    converted: leads?.filter((l: LeadStatusRow) => l.status === 'converted').length || 0,
    conversionRate: 0,
  };
  if (leadStats.total > 0) {
    leadStats.conversionRate = Math.round((leadStats.converted / leadStats.total) * 100);
  }

  // Fetch deals stats
  const { data: deals } = await supabase
    .from('deals')
    .select('stage, value')
    .is('deleted_at', null);

  const openDeals = deals?.filter((d: DealStageValueRow) => !['closed_won', 'closed_lost'].includes(d.stage)) || [];
  const closedWonDeals = deals?.filter((d: DealStageValueRow) => d.stage === 'closed_won') || [];
  const closedDeals = deals?.filter((d: DealStageValueRow) => ['closed_won', 'closed_lost'].includes(d.stage)) || [];

  const dealStats = {
    total: deals?.length || 0,
    pipelineValue: openDeals.reduce((sum: number, d: DealStageValueRow) => sum + parseFloat(String(d.value || 0)), 0),
    closedWonValue: closedWonDeals.reduce((sum: number, d: DealStageValueRow) => sum + parseFloat(String(d.value || 0)), 0),
    avgDealSize: 0,
    winRate: 0,
  };
  if (closedWonDeals.length > 0) {
    dealStats.avgDealSize = Math.round(dealStats.closedWonValue / closedWonDeals.length);
  }
  if (closedDeals.length > 0) {
    dealStats.winRate = Math.round((closedWonDeals.length / closedDeals.length) * 100);
  }

  // Fetch accounts stats
  const { data: accounts } = await supabase
    .from('accounts')
    .select('status')
    .is('deleted_at', null);

  const accountStats = {
    total: accounts?.length || 0,
    active: accounts?.filter((a: AccountStatusRow) => a.status === 'active').length || 0,
    prospect: accounts?.filter((a: AccountStatusRow) => a.status === 'prospect').length || 0,
  };

  // Fetch activities stats
  const now = new Date();
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - now.getDay());
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const { data: activities } = await supabase
    .from('activity_log')
    .select('activity_type, activity_date')
    .gte('activity_date', lastWeekStart.toISOString());

  const thisWeekActivities = activities?.filter((a: ActivityDateTypeRow) =>
    new Date(a.activity_date) >= thisWeekStart
  ) || [];
  const lastWeekActivities = activities?.filter((a: ActivityDateTypeRow) =>
    new Date(a.activity_date) >= lastWeekStart && new Date(a.activity_date) < thisWeekStart
  ) || [];

  const activityStats = {
    thisWeek: thisWeekActivities.length,
    lastWeek: lastWeekActivities.length,
    callsMade: thisWeekActivities.filter((a: ActivityDateTypeRow) => a.activity_type === 'call').length,
    emailsSent: thisWeekActivities.filter((a: ActivityDateTypeRow) => a.activity_type === 'email').length,
    meetingsHeld: thisWeekActivities.filter((a: ActivityDateTypeRow) => a.activity_type === 'meeting').length,
  };

  return {
    success: true,
    data: {
      leads: leadStats,
      deals: dealStats,
      accounts: accountStats,
      activities: activityStats,
    },
  };
}

/**
 * Get team leaderboard
 */
export async function getTeamLeaderboardAction(): Promise<ActionResult<Array<{
  userId: string;
  userName: string;
  dealsWon: number;
  revenue: number;
  leadsConverted: number;
  activitiesLogged: number;
}>>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  // Get team members with sales/ta roles
  const { data: teamMembers } = await supabase
    .from('user_profiles')
    .select(`
      id,
      full_name,
      user_roles!inner(
        roles!inner(name)
      )
    `)
    .is('deleted_at', null);

  const salesTeam = (teamMembers || []).filter((m: TeamMemberRow) => {
    const roles = m.user_roles?.map((ur: UserRoleRow) => ur.roles?.name) || [];
    return roles.some((r: string | undefined) => r && ['ta_manager', 'sales', 'recruiter'].includes(r));
  });

  const leaderboard = await Promise.all(salesTeam.map(async (member: TeamMemberRow) => {
    // Get deals won
    const { data: deals } = await supabase
      .from('deals')
      .select('value')
      .eq('owner_id', member.id)
      .eq('stage', 'closed_won')
      .is('deleted_at', null);

    // Get leads converted
    const { data: leads } = await supabase
      .from('leads')
      .select('id')
      .eq('owner_id', member.id)
      .eq('status', 'converted')
      .is('deleted_at', null);

    // Get activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: activities } = await supabase
      .from('activity_log')
      .select('id')
      .eq('performed_by', member.id)
      .gte('activity_date', thirtyDaysAgo.toISOString());

    return {
      userId: member.id,
      userName: member.full_name,
      dealsWon: deals?.length || 0,
      revenue: deals?.reduce((sum: number, d: DealStageValueRow) => sum + parseFloat(String(d.value || 0)), 0) || 0,
      leadsConverted: leads?.length || 0,
      activitiesLogged: activities?.length || 0,
    };
  }));

  // Sort by revenue
  leaderboard.sort((a, b) => b.revenue - a.revenue);

  return { success: true, data: leaderboard };
}
