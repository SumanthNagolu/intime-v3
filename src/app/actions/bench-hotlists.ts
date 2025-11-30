'use server';

/**
 * Bench Hotlists Server Actions
 * Handles hotlist creation, management, and distribution
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { hotlists, HotlistStatus } from '@/lib/db/schema/bench';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { accounts } from '@/lib/db/schema/crm';
import { eq, and, desc, asc, sql, ilike, inArray, isNull } from 'drizzle-orm';

// =====================================================
// Types
// =====================================================

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface Hotlist {
  id: string;
  title: string;
  description: string | null;
  candidateIds: string[];
  candidateCount: number;
  candidates: HotlistCandidate[];
  targetAccounts: string[] | null;
  targetSkills: string[] | null;
  targetRoles: string[] | null;
  status: string;
  documentFileId: string | null;
  sentAt: string | null;
  sentBy: string | null;
  sentByName: string | null;
  sentToEmails: string[] | null;
  sentToAccountIds: string[] | null;
  sentToAccountNames: string[];
  viewCount: number | null;
  responseCount: number | null;
  responsesText: string[] | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
  expiresAt: string | null;
}

export interface HotlistCandidate {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  candidateLocation: string | null;
}

export interface HotlistSummary {
  id: string;
  title: string;
  candidateCount: number;
  status: string;
  sentAt: string | null;
  viewCount: number | null;
  responseCount: number | null;
  createdAt: string;
}

// =====================================================
// Helper Functions
// =====================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, user.id),
  });

  return profile ? { userId: user.id, orgId: profile.orgId, email: profile.email } : null;
}

async function checkPermission(
  userId: string,
  permission: string,
  resourceType?: string,
  resourceId?: string
): Promise<{ allowed: boolean; scope?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: permission.split(':')[0] || permission,
    p_action: permission.split(':')[1] || 'read',
    p_required_scope: 'all',
  });

  if (error) {
    console.error('Permission check error:', error);
    return { allowed: false };
  }

  return { allowed: data ?? false, scope: undefined };
}

async function logAuditEvent(
  userId: string,
  orgId: string,
  userEmail: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  const supabase = await createClient();

  await (supabase.from as any)('audit_logs').insert({
    user_id: userId,
    org_id: orgId,
    user_email: userEmail,
    action,
    table_name: resourceType,
    record_id: resourceId,
    metadata: details,
    severity,
    user_ip_address: null,
    user_agent: null,
  });
}

// =====================================================
// Hotlist Actions
// =====================================================

const listHotlistsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['draft', 'sent', 'expired']).optional(),
  createdBy: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'sentAt', 'candidateCount', 'responseCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listHotlistsAction(
  input: z.infer<typeof listHotlistsSchema>
): Promise<PaginatedResult<HotlistSummary>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listHotlistsSchema.parse(input);
    const { page, pageSize, search, status, createdBy, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [eq(hotlists.orgId, context.orgId)];

    if (search) {
      conditions.push(ilike(hotlists.title, `%${search}%`));
    }

    if (status) {
      conditions.push(eq(hotlists.status, status));
    }

    if (createdBy) {
      conditions.push(eq(hotlists.createdBy, createdBy));
    }

    // Build query
    let query = db
      .select({
        id: hotlists.id,
        title: hotlists.title,
        candidateCount: hotlists.candidateCount,
        status: hotlists.status,
        sentAt: hotlists.sentAt,
        viewCount: hotlists.viewCount,
        responseCount: hotlists.responseCount,
        createdAt: hotlists.createdAt,
      })
      .from(hotlists)
      .where(and(...conditions));

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'createdAt':
        query = query.orderBy(orderFn(hotlists.createdAt)) as typeof query;
        break;
      case 'sentAt':
        query = query.orderBy(orderFn(hotlists.sentAt)) as typeof query;
        break;
      case 'candidateCount':
        query = query.orderBy(orderFn(hotlists.candidateCount)) as typeof query;
        break;
      case 'responseCount':
        query = query.orderBy(orderFn(hotlists.responseCount)) as typeof query;
        break;
    }

    const hotlistResults = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(hotlists)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const hotlistData: HotlistSummary[] = hotlistResults.map(h => ({
      id: h.id,
      title: h.title,
      candidateCount: h.candidateCount,
      status: h.status,
      sentAt: h.sentAt?.toISOString() || null,
      viewCount: h.viewCount,
      responseCount: h.responseCount,
      createdAt: h.createdAt.toISOString(),
    }));

    return {
      success: true,
      data: hotlistData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List hotlists error:', error);
    return { success: false, error: 'Failed to list hotlists' };
  }
}

export async function getHotlistAction(
  hotlistId: string
): Promise<ActionResult<Hotlist>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const hotlist = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!hotlist) {
      return { success: false, error: 'Hotlist not found' };
    }

    // Get candidate details
    const candidates: HotlistCandidate[] = [];
    if (hotlist.candidateIds && hotlist.candidateIds.length > 0) {
      const candidateProfiles = await db.query.userProfiles.findMany({
        where: inArray(userProfiles.id, hotlist.candidateIds),
        columns: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          candidateLocation: true,
        },
      });
      candidates.push(...candidateProfiles);
    }

    // Get sent by name
    let sentByName: string | null = null;
    if (hotlist.sentBy) {
      const sender = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, hotlist.sentBy),
        columns: { firstName: true, lastName: true },
      });
      sentByName = sender ? `${sender.firstName || ''} ${sender.lastName || ''}`.trim() : null;
    }

    // Get created by name
    let createdByName: string | null = null;
    if (hotlist.createdBy) {
      const creator = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, hotlist.createdBy),
        columns: { firstName: true, lastName: true },
      });
      createdByName = creator ? `${creator.firstName || ''} ${creator.lastName || ''}`.trim() : null;
    }

    // Get sent to account names
    const sentToAccountNames: string[] = [];
    if (hotlist.sentToAccountIds && hotlist.sentToAccountIds.length > 0) {
      const accountsList = await db.query.accounts.findMany({
        where: inArray(accounts.id, hotlist.sentToAccountIds),
        columns: { name: true },
      });
      sentToAccountNames.push(...accountsList.map(a => a.name));
    }

    return {
      success: true,
      data: {
        id: hotlist.id,
        title: hotlist.title,
        description: hotlist.description,
        candidateIds: hotlist.candidateIds,
        candidateCount: hotlist.candidateCount,
        candidates,
        targetAccounts: hotlist.targetAccounts,
        targetSkills: hotlist.targetSkills,
        targetRoles: hotlist.targetRoles,
        status: hotlist.status,
        documentFileId: hotlist.documentFileId,
        sentAt: hotlist.sentAt?.toISOString() || null,
        sentBy: hotlist.sentBy,
        sentByName,
        sentToEmails: hotlist.sentToEmails,
        sentToAccountIds: hotlist.sentToAccountIds,
        sentToAccountNames,
        viewCount: hotlist.viewCount,
        responseCount: hotlist.responseCount,
        responsesText: hotlist.responsesText,
        createdAt: hotlist.createdAt.toISOString(),
        createdBy: hotlist.createdBy,
        createdByName,
        expiresAt: hotlist.expiresAt?.toISOString() || null,
      },
    };
  } catch (error) {
    console.error('Get hotlist error:', error);
    return { success: false, error: 'Failed to get hotlist' };
  }
}

const createHotlistSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  candidateIds: z.array(z.string().uuid()).min(1),
  targetAccounts: z.array(z.string().uuid()).optional(),
  targetSkills: z.array(z.string()).optional(),
  targetRoles: z.array(z.string()).optional(),
  expiresAt: z.string().optional(),
});

export async function createHotlistAction(
  input: z.infer<typeof createHotlistSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = createHotlistSchema.parse(input);

    // Verify all candidates exist in org
    const existingCandidates = await db.query.userProfiles.findMany({
      where: and(
        inArray(userProfiles.id, validated.candidateIds),
        eq(userProfiles.orgId, context.orgId)
      ),
      columns: { id: true },
    });

    if (existingCandidates.length !== validated.candidateIds.length) {
      return { success: false, error: 'Some candidates not found in organization' };
    }

    const [hotlist] = await db.insert(hotlists).values({
      orgId: context.orgId,
      title: validated.title,
      description: validated.description,
      candidateIds: validated.candidateIds,
      candidateCount: validated.candidateIds.length,
      targetAccounts: validated.targetAccounts,
      targetSkills: validated.targetSkills,
      targetRoles: validated.targetRoles,
      status: HotlistStatus.DRAFT,
      createdBy: context.userId,
      expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
    }).returning({ id: hotlists.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.created',
      'hotlists',
      hotlist.id,
      { title: validated.title, candidateCount: validated.candidateIds.length }
    );

    return { success: true, data: { id: hotlist.id } };
  } catch (error) {
    console.error('Create hotlist error:', error);
    return { success: false, error: 'Failed to create hotlist' };
  }
}

const updateHotlistSchema = z.object({
  hotlistId: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
  candidateIds: z.array(z.string().uuid()).min(1).optional(),
  targetAccounts: z.array(z.string().uuid()).optional().nullable(),
  targetSkills: z.array(z.string()).optional().nullable(),
  targetRoles: z.array(z.string()).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export async function updateHotlistAction(
  input: z.infer<typeof updateHotlistSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = updateHotlistSchema.parse(input);
    const { hotlistId, ...updates } = validated;

    // Check hotlist exists and is draft
    const existing = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!existing) {
      return { success: false, error: 'Hotlist not found' };
    }

    if (existing.status !== HotlistStatus.DRAFT) {
      return { success: false, error: 'Cannot update sent hotlist' };
    }

    // Build update object
    const updateObj: Record<string, unknown> = { updatedAt: new Date() };

    if (updates.title !== undefined) updateObj.title = updates.title;
    if (updates.description !== undefined) updateObj.description = updates.description;
    if (updates.candidateIds !== undefined) {
      updateObj.candidateIds = updates.candidateIds;
      updateObj.candidateCount = updates.candidateIds.length;
    }
    if (updates.targetAccounts !== undefined) updateObj.targetAccounts = updates.targetAccounts;
    if (updates.targetSkills !== undefined) updateObj.targetSkills = updates.targetSkills;
    if (updates.targetRoles !== undefined) updateObj.targetRoles = updates.targetRoles;
    if (updates.expiresAt !== undefined) {
      updateObj.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
    }

    await db.update(hotlists)
      .set(updateObj)
      .where(eq(hotlists.id, hotlistId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.updated',
      'hotlists',
      hotlistId,
      { updates }
    );

    return { success: true, data: { id: hotlistId } };
  } catch (error) {
    console.error('Update hotlist error:', error);
    return { success: false, error: 'Failed to update hotlist' };
  }
}

export async function addCandidatesToHotlistAction(
  hotlistId: string,
  candidateIds: string[]
): Promise<ActionResult<{ id: string; candidateCount: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get current hotlist
    const hotlist = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!hotlist) {
      return { success: false, error: 'Hotlist not found' };
    }

    if (hotlist.status !== HotlistStatus.DRAFT) {
      return { success: false, error: 'Cannot modify sent hotlist' };
    }

    // Merge candidate IDs (avoiding duplicates)
    const existingIds = new Set(hotlist.candidateIds);
    const newIds = candidateIds.filter(id => !existingIds.has(id));
    const mergedIds = [...hotlist.candidateIds, ...newIds];

    await db.update(hotlists)
      .set({
        candidateIds: mergedIds,
        candidateCount: mergedIds.length,
        updatedAt: new Date(),
      })
      .where(eq(hotlists.id, hotlistId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.candidates_added',
      'hotlists',
      hotlistId,
      { addedCount: newIds.length, totalCount: mergedIds.length }
    );

    return { success: true, data: { id: hotlistId, candidateCount: mergedIds.length } };
  } catch (error) {
    console.error('Add candidates to hotlist error:', error);
    return { success: false, error: 'Failed to add candidates' };
  }
}

export async function removeCandidateFromHotlistAction(
  hotlistId: string,
  candidateId: string
): Promise<ActionResult<{ id: string; candidateCount: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get current hotlist
    const hotlist = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!hotlist) {
      return { success: false, error: 'Hotlist not found' };
    }

    if (hotlist.status !== HotlistStatus.DRAFT) {
      return { success: false, error: 'Cannot modify sent hotlist' };
    }

    const filteredIds = hotlist.candidateIds.filter(id => id !== candidateId);

    if (filteredIds.length === 0) {
      return { success: false, error: 'Hotlist must have at least one candidate' };
    }

    await db.update(hotlists)
      .set({
        candidateIds: filteredIds,
        candidateCount: filteredIds.length,
        updatedAt: new Date(),
      })
      .where(eq(hotlists.id, hotlistId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.candidate_removed',
      'hotlists',
      hotlistId,
      { candidateId, remainingCount: filteredIds.length }
    );

    return { success: true, data: { id: hotlistId, candidateCount: filteredIds.length } };
  } catch (error) {
    console.error('Remove candidate from hotlist error:', error);
    return { success: false, error: 'Failed to remove candidate' };
  }
}

const sendHotlistSchema = z.object({
  hotlistId: z.string().uuid(),
  emails: z.array(z.string().email()).optional(),
  accountIds: z.array(z.string().uuid()).optional(),
});

export async function sendHotlistAction(
  input: z.infer<typeof sendHotlistSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = sendHotlistSchema.parse(input);

    if (!validated.emails?.length && !validated.accountIds?.length) {
      return { success: false, error: 'Must specify emails or accounts to send to' };
    }

    // Get hotlist
    const hotlist = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, validated.hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!hotlist) {
      return { success: false, error: 'Hotlist not found' };
    }

    if (hotlist.status === HotlistStatus.SENT) {
      return { success: false, error: 'Hotlist already sent' };
    }

    // Get account emails if accountIds provided
    let allEmails = validated.emails || [];
    if (validated.accountIds?.length) {
      // Would typically get POC emails from accounts
      // For now, just track the account IDs
    }

    // Update hotlist
    await db.update(hotlists)
      .set({
        status: HotlistStatus.SENT,
        sentAt: new Date(),
        sentBy: context.userId,
        sentToEmails: allEmails.length > 0 ? allEmails : null,
        sentToAccountIds: validated.accountIds || null,
        updatedAt: new Date(),
      })
      .where(eq(hotlists.id, validated.hotlistId));

    // TODO: Actually send emails via email service

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.sent',
      'hotlists',
      validated.hotlistId,
      {
        emailCount: allEmails.length,
        accountCount: validated.accountIds?.length || 0,
      }
    );

    return { success: true, data: { id: validated.hotlistId } };
  } catch (error) {
    console.error('Send hotlist error:', error);
    return { success: false, error: 'Failed to send hotlist' };
  }
}

export async function recordHotlistViewAction(
  hotlistId: string
): Promise<ActionResult<{ viewCount: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    // Increment view count
    await db.update(hotlists)
      .set({
        viewCount: sql`coalesce(view_count, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(hotlists.id, hotlistId));

    const updated = await db.query.hotlists.findFirst({
      where: eq(hotlists.id, hotlistId),
      columns: { viewCount: true },
    });

    return { success: true, data: { viewCount: updated?.viewCount || 0 } };
  } catch (error) {
    console.error('Record hotlist view error:', error);
    return { success: false, error: 'Failed to record view' };
  }
}

const recordHotlistResponseSchema = z.object({
  hotlistId: z.string().uuid(),
  responseText: z.string().min(1),
});

export async function recordHotlistResponseAction(
  input: z.infer<typeof recordHotlistResponseSchema>
): Promise<ActionResult<{ responseCount: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = recordHotlistResponseSchema.parse(input);

    // Get current responses
    const hotlist = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, validated.hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!hotlist) {
      return { success: false, error: 'Hotlist not found' };
    }

    const updatedResponses = [...(hotlist.responsesText || []), validated.responseText];

    await db.update(hotlists)
      .set({
        responseCount: sql`coalesce(response_count, 0) + 1`,
        responsesText: updatedResponses,
        updatedAt: new Date(),
      })
      .where(eq(hotlists.id, validated.hotlistId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.response_recorded',
      'hotlists',
      validated.hotlistId,
      { responseText: validated.responseText }
    );

    return { success: true, data: { responseCount: updatedResponses.length } };
  } catch (error) {
    console.error('Record hotlist response error:', error);
    return { success: false, error: 'Failed to record response' };
  }
}

export async function deleteHotlistAction(
  hotlistId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:delete');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Check hotlist exists
    const hotlist = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!hotlist) {
      return { success: false, error: 'Hotlist not found' };
    }

    await db.delete(hotlists).where(eq(hotlists.id, hotlistId));

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.deleted',
      'hotlists',
      hotlistId,
      { title: hotlist.title },
      'warning'
    );

    return { success: true, data: { id: hotlistId } };
  } catch (error) {
    console.error('Delete hotlist error:', error);
    return { success: false, error: 'Failed to delete hotlist' };
  }
}

export async function duplicateHotlistAction(
  hotlistId: string,
  newTitle?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get original hotlist
    const original = await db.query.hotlists.findFirst({
      where: and(
        eq(hotlists.id, hotlistId),
        eq(hotlists.orgId, context.orgId)
      ),
    });

    if (!original) {
      return { success: false, error: 'Hotlist not found' };
    }

    const [duplicate] = await db.insert(hotlists).values({
      orgId: context.orgId,
      title: newTitle || `${original.title} (Copy)`,
      description: original.description,
      candidateIds: original.candidateIds,
      candidateCount: original.candidateCount,
      targetAccounts: original.targetAccounts,
      targetSkills: original.targetSkills,
      targetRoles: original.targetRoles,
      status: HotlistStatus.DRAFT,
      createdBy: context.userId,
    }).returning({ id: hotlists.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      context.email,
      'bench.hotlist.duplicated',
      'hotlists',
      duplicate.id,
      { originalId: hotlistId, title: newTitle || `${original.title} (Copy)` }
    );

    return { success: true, data: { id: duplicate.id } };
  } catch (error) {
    console.error('Duplicate hotlist error:', error);
    return { success: false, error: 'Failed to duplicate hotlist' };
  }
}

// =====================================================
// Analytics Actions
// =====================================================

export interface HotlistAnalytics {
  totalHotlists: number;
  sentHotlists: number;
  totalCandidatesMarketed: number;
  totalViews: number;
  totalResponses: number;
  averageResponseRate: number;
  topPerformingHotlists: HotlistSummary[];
}

export async function getHotlistAnalyticsAction(): Promise<ActionResult<HotlistAnalytics>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get aggregate stats
    const stats = await db
      .select({
        totalHotlists: sql<number>`count(*)`,
        sentHotlists: sql<number>`count(*) filter (where status = 'sent')`,
        totalCandidatesMarketed: sql<number>`sum(candidate_count) filter (where status = 'sent')`,
        totalViews: sql<number>`sum(view_count)`,
        totalResponses: sql<number>`sum(response_count)`,
      })
      .from(hotlists)
      .where(eq(hotlists.orgId, context.orgId));

    // Get top performing hotlists (by response rate)
    const topHotlists = await db
      .select({
        id: hotlists.id,
        title: hotlists.title,
        candidateCount: hotlists.candidateCount,
        status: hotlists.status,
        sentAt: hotlists.sentAt,
        viewCount: hotlists.viewCount,
        responseCount: hotlists.responseCount,
        createdAt: hotlists.createdAt,
      })
      .from(hotlists)
      .where(and(
        eq(hotlists.orgId, context.orgId),
        eq(hotlists.status, 'sent')
      ))
      .orderBy(desc(hotlists.responseCount))
      .limit(5);

    const totalViews = Number(stats[0]?.totalViews || 0);
    const totalResponses = Number(stats[0]?.totalResponses || 0);
    const avgResponseRate = totalViews > 0 ? (totalResponses / totalViews) * 100 : 0;

    return {
      success: true,
      data: {
        totalHotlists: Number(stats[0]?.totalHotlists || 0),
        sentHotlists: Number(stats[0]?.sentHotlists || 0),
        totalCandidatesMarketed: Number(stats[0]?.totalCandidatesMarketed || 0),
        totalViews,
        totalResponses,
        averageResponseRate: Math.round(avgResponseRate * 10) / 10,
        topPerformingHotlists: topHotlists.map(h => ({
          id: h.id,
          title: h.title,
          candidateCount: h.candidateCount,
          status: h.status,
          sentAt: h.sentAt?.toISOString() || null,
          viewCount: h.viewCount,
          responseCount: h.responseCount,
          createdAt: h.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error('Get hotlist analytics error:', error);
    return { success: false, error: 'Failed to get analytics' };
  }
}

// =====================================================
// Quick Actions
// =====================================================

export async function createQuickHotlistAction(
  title: string,
  candidateIds: string[]
): Promise<ActionResult<{ id: string }>> {
  return createHotlistAction({
    title,
    candidateIds,
  });
}

export async function getRecentHotlistsAction(
  limit: number = 5
): Promise<ActionResult<HotlistSummary[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'bench:read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const recentHotlists = await db
      .select({
        id: hotlists.id,
        title: hotlists.title,
        candidateCount: hotlists.candidateCount,
        status: hotlists.status,
        sentAt: hotlists.sentAt,
        viewCount: hotlists.viewCount,
        responseCount: hotlists.responseCount,
        createdAt: hotlists.createdAt,
      })
      .from(hotlists)
      .where(eq(hotlists.orgId, context.orgId))
      .orderBy(desc(hotlists.createdAt))
      .limit(limit);

    return {
      success: true,
      data: recentHotlists.map(h => ({
        id: h.id,
        title: h.title,
        candidateCount: h.candidateCount,
        status: h.status,
        sentAt: h.sentAt?.toISOString() || null,
        viewCount: h.viewCount,
        responseCount: h.responseCount,
        createdAt: h.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get recent hotlists error:', error);
    return { success: false, error: 'Failed to get recent hotlists' };
  }
}
