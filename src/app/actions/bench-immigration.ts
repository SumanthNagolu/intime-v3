'use server';

/**
 * Immigration Cases Server Actions
 * Handles immigration case management, tracking, and timeline management
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { db } from '@/lib/db';
import {
  immigrationCases,
  benchMetadata,
  ImmigrationCaseType,
  ImmigrationCaseStatus
} from '@/lib/db/schema/bench';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, or, ilike, desc, asc, sql, gte, lte, isNull, isNotNull } from 'drizzle-orm';

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

export interface ImmigrationCase {
  id: string;
  candidateId: string;
  candidateName: string | null;
  candidateEmail: string | null;
  caseType: string;
  status: string;
  currentVisaType: string | null;
  currentVisaExpiry: string | null;
  newVisaType: string | null;
  newVisaStartDate: string | null;
  newVisaEndDate: string | null;
  petitionNumber: string | null;
  filedDate: string | null;
  approvedDate: string | null;
  deniedDate: string | null;
  denialReason: string | null;
  rfeReceivedDate: string | null;
  rfeResponseDueDate: string | null;
  rfeResponseSubmittedDate: string | null;
  filingFee: number | null;
  attorneyFee: number | null;
  premiumProcessingFee: number | null;
  totalCost: number | null;
  paidBy: string | null;
  daysElapsed: number | null;
  nextAction: string | null;
  nextActionDate: string | null;
  expectedDecisionDate: string | null;
  caseManagerId: string | null;
  caseManagerName: string | null;
  attorneyName: string | null;
  attorneyFirm: string | null;
  attorneyEmail: string | null;
  attorneyPhone: string | null;
  internalNotes: string | null;
  timelineNotes: unknown | null;
  createdAt: string;
  createdBy: string | null;
}

export interface ImmigrationCaseSummary {
  id: string;
  candidateId: string;
  candidateName: string | null;
  caseType: string;
  status: string;
  currentVisaExpiry: string | null;
  nextAction: string | null;
  nextActionDate: string | null;
  daysElapsed: number | null;
}

export interface TimelineNote {
  date: string;
  note: string;
  addedBy: string;
  addedAt: string;
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

  return profile ? { userId: user.id, userEmail: profile.email ?? user.email ?? '', orgId: profile.orgId } : null;
}

async function checkPermission(
  userId: string,
  resource: string,
  action: string,
  requiredScope: string = 'all'
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_user_permission', {
    p_user_id: userId,
    p_resource: resource,
    p_action: action,
    p_required_scope: requiredScope,
  });

  if (error) {
    console.error('Permission check error:', error);
    return false;
  }

  return data === true;
}

async function logAuditEvent(
  userId: string,
  userEmail: string,
  orgId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  const adminSupabase = createAdminClient();

  await (adminSupabase.from as any)('audit_logs').insert({
    user_id: userId,
    user_email: userEmail,
    org_id: orgId,
    action,
    table_name: resourceType,
    record_id: resourceId,
    metadata: details,
    severity,
  });
}

// =====================================================
// Immigration Case Actions
// =====================================================

const listImmigrationCasesSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  candidateId: z.string().uuid().optional(),
  caseType: z.enum(['H1B', 'H1B_transfer', 'H1B_extension', 'L1', 'green_card', 'OPT_extension', 'TN']).optional(),
  status: z.enum(['drafting', 'submitted', 'rfe', 'approved', 'denied', 'withdrawn']).optional(),
  caseManagerId: z.string().uuid().optional(),
  hasRfe: z.boolean().optional(),
  expiringWithinDays: z.number().optional(),
  sortBy: z.enum(['createdAt', 'currentVisaExpiry', 'nextActionDate', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function listImmigrationCasesAction(
  input: z.infer<typeof listImmigrationCasesSchema>
): Promise<PaginatedResult<ImmigrationCaseSummary>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = listImmigrationCasesSchema.parse(input);
    const { page, pageSize, search, candidateId, caseType, status, caseManagerId, hasRfe, expiringWithinDays, sortBy, sortOrder } = validated;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = [eq(immigrationCases.orgId, context.orgId)];

    if (candidateId) {
      conditions.push(eq(immigrationCases.candidateId, candidateId));
    }

    if (caseType) {
      conditions.push(eq(immigrationCases.caseType, caseType));
    }

    if (status) {
      conditions.push(eq(immigrationCases.status, status));
    }

    if (caseManagerId) {
      conditions.push(eq(immigrationCases.caseManagerId, caseManagerId));
    }

    if (hasRfe !== undefined) {
      if (hasRfe) {
        conditions.push(isNotNull(immigrationCases.rfeReceivedDate));
      } else {
        conditions.push(isNull(immigrationCases.rfeReceivedDate));
      }
    }

    if (expiringWithinDays !== undefined) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiringWithinDays);
      conditions.push(lte(immigrationCases.currentVisaExpiry, expiryDate.toISOString().split('T')[0]));
    }

    // Build query with candidate join
    let query = db
      .select({
        id: immigrationCases.id,
        candidateId: immigrationCases.candidateId,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        caseType: immigrationCases.caseType,
        status: immigrationCases.status,
        currentVisaExpiry: immigrationCases.currentVisaExpiry,
        nextAction: immigrationCases.nextAction,
        nextActionDate: immigrationCases.nextActionDate,
        daysElapsed: immigrationCases.daysElapsed,
        createdAt: immigrationCases.createdAt,
      })
      .from(immigrationCases)
      .innerJoin(userProfiles, eq(immigrationCases.candidateId, userProfiles.id))
      .where(and(...conditions));

    // Apply search filter if provided
    if (search) {
      query = db
        .select({
          id: immigrationCases.id,
          candidateId: immigrationCases.candidateId,
          candidateFirstName: userProfiles.firstName,
          candidateLastName: userProfiles.lastName,
          caseType: immigrationCases.caseType,
          status: immigrationCases.status,
          currentVisaExpiry: immigrationCases.currentVisaExpiry,
          nextAction: immigrationCases.nextAction,
          nextActionDate: immigrationCases.nextActionDate,
          daysElapsed: immigrationCases.daysElapsed,
          createdAt: immigrationCases.createdAt,
        })
        .from(immigrationCases)
        .innerJoin(userProfiles, eq(immigrationCases.candidateId, userProfiles.id))
        .where(and(
          ...conditions,
          or(
            ilike(userProfiles.firstName, `%${search}%`),
            ilike(userProfiles.lastName, `%${search}%`),
            ilike(immigrationCases.petitionNumber, `%${search}%`)
          )
        )) as typeof query;
    }

    // Apply sorting
    const orderFn = sortOrder === 'asc' ? asc : desc;
    switch (sortBy) {
      case 'createdAt':
        query = query.orderBy(orderFn(immigrationCases.createdAt)) as typeof query;
        break;
      case 'currentVisaExpiry':
        query = query.orderBy(orderFn(immigrationCases.currentVisaExpiry)) as typeof query;
        break;
      case 'nextActionDate':
        query = query.orderBy(orderFn(immigrationCases.nextActionDate)) as typeof query;
        break;
      case 'status':
        query = query.orderBy(orderFn(immigrationCases.status)) as typeof query;
        break;
    }

    const cases = await query.limit(pageSize).offset(offset);

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(immigrationCases)
      .where(and(...conditions));

    const total = Number(countResult[0]?.count || 0);

    const caseData: ImmigrationCaseSummary[] = cases.map(c => ({
      id: c.id,
      candidateId: c.candidateId,
      candidateName: `${c.candidateFirstName || ''} ${c.candidateLastName || ''}`.trim() || null,
      caseType: c.caseType,
      status: c.status,
      currentVisaExpiry: c.currentVisaExpiry,
      nextAction: c.nextAction,
      nextActionDate: c.nextActionDate,
      daysElapsed: c.daysElapsed,
    }));

    return {
      success: true,
      data: caseData,
      total,
      page,
      pageSize,
    };
  } catch (error) {
    console.error('List immigration cases error:', error);
    return { success: false, error: 'Failed to list immigration cases' };
  }
}

export async function getImmigrationCaseAction(
  caseId: string
): Promise<ActionResult<ImmigrationCase>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const immigrationCase = await db.query.immigrationCases.findFirst({
      where: and(
        eq(immigrationCases.id, caseId),
        eq(immigrationCases.orgId, context.orgId)
      ),
    });

    if (!immigrationCase) {
      return { success: false, error: 'Immigration case not found' };
    }

    // Get candidate info
    const candidate = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, immigrationCase.candidateId),
      columns: { firstName: true, lastName: true, email: true },
    });

    // Get case manager info
    let caseManagerName: string | null = null;
    if (immigrationCase.caseManagerId) {
      const manager = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, immigrationCase.caseManagerId),
        columns: { firstName: true, lastName: true },
      });
      caseManagerName = manager ? `${manager.firstName || ''} ${manager.lastName || ''}`.trim() : null;
    }

    return {
      success: true,
      data: {
        id: immigrationCase.id,
        candidateId: immigrationCase.candidateId,
        candidateName: candidate ? `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() : null,
        candidateEmail: candidate?.email || null,
        caseType: immigrationCase.caseType,
        status: immigrationCase.status,
        currentVisaType: immigrationCase.currentVisaType,
        currentVisaExpiry: immigrationCase.currentVisaExpiry,
        newVisaType: immigrationCase.newVisaType,
        newVisaStartDate: immigrationCase.newVisaStartDate,
        newVisaEndDate: immigrationCase.newVisaEndDate,
        petitionNumber: immigrationCase.petitionNumber,
        filedDate: immigrationCase.filedDate,
        approvedDate: immigrationCase.approvedDate,
        deniedDate: immigrationCase.deniedDate,
        denialReason: immigrationCase.denialReason,
        rfeReceivedDate: immigrationCase.rfeReceivedDate,
        rfeResponseDueDate: immigrationCase.rfeResponseDueDate,
        rfeResponseSubmittedDate: immigrationCase.rfeResponseSubmittedDate,
        filingFee: immigrationCase.filingFee ? Number(immigrationCase.filingFee) : null,
        attorneyFee: immigrationCase.attorneyFee ? Number(immigrationCase.attorneyFee) : null,
        premiumProcessingFee: immigrationCase.premiumProcessingFee ? Number(immigrationCase.premiumProcessingFee) : null,
        totalCost: immigrationCase.totalCost ? Number(immigrationCase.totalCost) : null,
        paidBy: immigrationCase.paidBy,
        daysElapsed: immigrationCase.daysElapsed,
        nextAction: immigrationCase.nextAction,
        nextActionDate: immigrationCase.nextActionDate,
        expectedDecisionDate: immigrationCase.expectedDecisionDate,
        caseManagerId: immigrationCase.caseManagerId,
        caseManagerName,
        attorneyName: immigrationCase.attorneyName,
        attorneyFirm: immigrationCase.attorneyFirm,
        attorneyEmail: immigrationCase.attorneyEmail,
        attorneyPhone: immigrationCase.attorneyPhone,
        internalNotes: immigrationCase.internalNotes,
        timelineNotes: immigrationCase.timelineNotes,
        createdAt: immigrationCase.createdAt.toISOString(),
        createdBy: immigrationCase.createdBy,
      },
    };
  } catch (error) {
    console.error('Get immigration case error:', error);
    return { success: false, error: 'Failed to get immigration case' };
  }
}

const createImmigrationCaseSchema = z.object({
  candidateId: z.string().uuid(),
  caseType: z.enum(['H1B', 'H1B_transfer', 'H1B_extension', 'L1', 'green_card', 'OPT_extension', 'TN']),
  currentVisaType: z.string().optional(),
  currentVisaExpiry: z.string().optional(),
  newVisaType: z.string().optional(),
  caseManagerId: z.string().uuid().optional(),
  attorneyName: z.string().optional(),
  attorneyFirm: z.string().optional(),
  attorneyEmail: z.string().email().optional(),
  attorneyPhone: z.string().optional(),
  filingFee: z.number().optional(),
  attorneyFee: z.number().optional(),
  premiumProcessingFee: z.number().optional(),
  paidBy: z.enum(['employer', 'employee', 'split']).default('employer'),
  internalNotes: z.string().optional(),
});

export async function createImmigrationCaseAction(
  input: z.infer<typeof createImmigrationCaseSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = createImmigrationCaseSchema.parse(input);

    // Verify candidate exists
    const candidate = await db.query.userProfiles.findFirst({
      where: and(
        eq(userProfiles.id, validated.candidateId),
        eq(userProfiles.orgId, context.orgId)
      ),
    });

    if (!candidate) {
      return { success: false, error: 'Candidate not found' };
    }

    // Calculate total cost
    const totalCost = (validated.filingFee || 0) +
                      (validated.attorneyFee || 0) +
                      (validated.premiumProcessingFee || 0);

    const [immigrationCase] = await db.insert(immigrationCases).values({
      orgId: context.orgId,
      candidateId: validated.candidateId,
      caseType: validated.caseType,
      status: ImmigrationCaseStatus.DRAFTING,
      currentVisaType: validated.currentVisaType,
      currentVisaExpiry: validated.currentVisaExpiry,
      newVisaType: validated.newVisaType,
      caseManagerId: validated.caseManagerId,
      attorneyName: validated.attorneyName,
      attorneyFirm: validated.attorneyFirm,
      attorneyEmail: validated.attorneyEmail,
      attorneyPhone: validated.attorneyPhone,
      filingFee: validated.filingFee?.toString(),
      attorneyFee: validated.attorneyFee?.toString(),
      premiumProcessingFee: validated.premiumProcessingFee?.toString(),
      totalCost: totalCost > 0 ? totalCost.toString() : null,
      paidBy: validated.paidBy,
      internalNotes: validated.internalNotes,
      createdBy: context.userId,
      timelineNotes: [],
    }).returning({ id: immigrationCases.id });

    // Update bench metadata if candidate is on bench
    await db.update(benchMetadata)
      .set({
        hasActiveImmigrationCase: true,
        immigrationCaseId: immigrationCase.id,
        updatedAt: new Date(),
      })
      .where(eq(benchMetadata.userId, validated.candidateId));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.created',
      'immigration_cases',
      immigrationCase.id,
      { candidateId: validated.candidateId, caseType: validated.caseType }
    );

    return { success: true, data: { id: immigrationCase.id } };
  } catch (error) {
    console.error('Create immigration case error:', error);
    return { success: false, error: 'Failed to create immigration case' };
  }
}

const updateImmigrationCaseSchema = z.object({
  caseId: z.string().uuid(),
  status: z.enum(['drafting', 'submitted', 'rfe', 'approved', 'denied', 'withdrawn']).optional(),
  currentVisaType: z.string().optional().nullable(),
  currentVisaExpiry: z.string().optional().nullable(),
  newVisaType: z.string().optional().nullable(),
  newVisaStartDate: z.string().optional().nullable(),
  newVisaEndDate: z.string().optional().nullable(),
  petitionNumber: z.string().optional().nullable(),
  filedDate: z.string().optional().nullable(),
  caseManagerId: z.string().uuid().optional().nullable(),
  attorneyName: z.string().optional().nullable(),
  attorneyFirm: z.string().optional().nullable(),
  attorneyEmail: z.string().email().optional().nullable(),
  attorneyPhone: z.string().optional().nullable(),
  filingFee: z.number().optional().nullable(),
  attorneyFee: z.number().optional().nullable(),
  premiumProcessingFee: z.number().optional().nullable(),
  paidBy: z.enum(['employer', 'employee', 'split']).optional(),
  nextAction: z.string().optional().nullable(),
  nextActionDate: z.string().optional().nullable(),
  expectedDecisionDate: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

export async function updateImmigrationCaseAction(
  input: z.infer<typeof updateImmigrationCaseSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = updateImmigrationCaseSchema.parse(input);
    const { caseId, ...updates } = validated;

    // Verify case exists
    const existing = await db.query.immigrationCases.findFirst({
      where: and(
        eq(immigrationCases.id, caseId),
        eq(immigrationCases.orgId, context.orgId)
      ),
    });

    if (!existing) {
      return { success: false, error: 'Immigration case not found' };
    }

    // Build update object
    const updateObj: Record<string, unknown> = { updatedAt: new Date() };

    if (updates.status !== undefined) updateObj.status = updates.status;
    if (updates.currentVisaType !== undefined) updateObj.currentVisaType = updates.currentVisaType;
    if (updates.currentVisaExpiry !== undefined) updateObj.currentVisaExpiry = updates.currentVisaExpiry;
    if (updates.newVisaType !== undefined) updateObj.newVisaType = updates.newVisaType;
    if (updates.newVisaStartDate !== undefined) updateObj.newVisaStartDate = updates.newVisaStartDate;
    if (updates.newVisaEndDate !== undefined) updateObj.newVisaEndDate = updates.newVisaEndDate;
    if (updates.petitionNumber !== undefined) updateObj.petitionNumber = updates.petitionNumber;
    if (updates.filedDate !== undefined) updateObj.filedDate = updates.filedDate;
    if (updates.caseManagerId !== undefined) updateObj.caseManagerId = updates.caseManagerId;
    if (updates.attorneyName !== undefined) updateObj.attorneyName = updates.attorneyName;
    if (updates.attorneyFirm !== undefined) updateObj.attorneyFirm = updates.attorneyFirm;
    if (updates.attorneyEmail !== undefined) updateObj.attorneyEmail = updates.attorneyEmail;
    if (updates.attorneyPhone !== undefined) updateObj.attorneyPhone = updates.attorneyPhone;
    if (updates.filingFee !== undefined) updateObj.filingFee = updates.filingFee?.toString() || null;
    if (updates.attorneyFee !== undefined) updateObj.attorneyFee = updates.attorneyFee?.toString() || null;
    if (updates.premiumProcessingFee !== undefined) updateObj.premiumProcessingFee = updates.premiumProcessingFee?.toString() || null;
    if (updates.paidBy !== undefined) updateObj.paidBy = updates.paidBy;
    if (updates.nextAction !== undefined) updateObj.nextAction = updates.nextAction;
    if (updates.nextActionDate !== undefined) updateObj.nextActionDate = updates.nextActionDate;
    if (updates.expectedDecisionDate !== undefined) updateObj.expectedDecisionDate = updates.expectedDecisionDate;
    if (updates.internalNotes !== undefined) updateObj.internalNotes = updates.internalNotes;

    // Recalculate total cost if any fee changed
    if (updates.filingFee !== undefined || updates.attorneyFee !== undefined || updates.premiumProcessingFee !== undefined) {
      const filingFee = updates.filingFee ?? (existing.filingFee ? Number(existing.filingFee) : 0);
      const attorneyFee = updates.attorneyFee ?? (existing.attorneyFee ? Number(existing.attorneyFee) : 0);
      const premiumFee = updates.premiumProcessingFee ?? (existing.premiumProcessingFee ? Number(existing.premiumProcessingFee) : 0);
      const totalCost = (filingFee || 0) + (attorneyFee || 0) + (premiumFee || 0);
      updateObj.totalCost = totalCost > 0 ? totalCost.toString() : null;
    }

    await db.update(immigrationCases)
      .set(updateObj)
      .where(eq(immigrationCases.id, caseId));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.updated',
      'immigration_cases',
      caseId,
      { updates }
    );

    return { success: true, data: { id: caseId } };
  } catch (error) {
    console.error('Update immigration case error:', error);
    return { success: false, error: 'Failed to update immigration case' };
  }
}

export async function submitCaseAction(
  caseId: string,
  petitionNumber: string,
  filedDate: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(immigrationCases)
      .set({
        status: ImmigrationCaseStatus.SUBMITTED,
        petitionNumber,
        filedDate,
        updatedAt: new Date(),
      })
      .where(and(
        eq(immigrationCases.id, caseId),
        eq(immigrationCases.orgId, context.orgId)
      ));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.submitted',
      'immigration_cases',
      caseId,
      { petitionNumber, filedDate }
    );

    return { success: true, data: { id: caseId } };
  } catch (error) {
    console.error('Submit case error:', error);
    return { success: false, error: 'Failed to submit case' };
  }
}

const recordRfeSchema = z.object({
  caseId: z.string().uuid(),
  rfeReceivedDate: z.string(),
  rfeResponseDueDate: z.string(),
});

export async function recordRfeAction(
  input: z.infer<typeof recordRfeSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = recordRfeSchema.parse(input);

    await db.update(immigrationCases)
      .set({
        status: ImmigrationCaseStatus.RFE,
        rfeReceivedDate: validated.rfeReceivedDate,
        rfeResponseDueDate: validated.rfeResponseDueDate,
        nextAction: 'Respond to RFE',
        nextActionDate: validated.rfeResponseDueDate,
        updatedAt: new Date(),
      })
      .where(and(
        eq(immigrationCases.id, validated.caseId),
        eq(immigrationCases.orgId, context.orgId)
      ));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.rfe_received',
      'immigration_cases',
      validated.caseId,
      { rfeReceivedDate: validated.rfeReceivedDate, rfeResponseDueDate: validated.rfeResponseDueDate },
      'warning'
    );

    return { success: true, data: { id: validated.caseId } };
  } catch (error) {
    console.error('Record RFE error:', error);
    return { success: false, error: 'Failed to record RFE' };
  }
}

export async function submitRfeResponseAction(
  caseId: string,
  responseDate: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    await db.update(immigrationCases)
      .set({
        status: ImmigrationCaseStatus.SUBMITTED,
        rfeResponseSubmittedDate: responseDate,
        nextAction: 'Await decision',
        nextActionDate: null,
        updatedAt: new Date(),
      })
      .where(and(
        eq(immigrationCases.id, caseId),
        eq(immigrationCases.orgId, context.orgId)
      ));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.rfe_responded',
      'immigration_cases',
      caseId,
      { responseDate }
    );

    return { success: true, data: { id: caseId } };
  } catch (error) {
    console.error('Submit RFE response error:', error);
    return { success: false, error: 'Failed to submit RFE response' };
  }
}

const approveCaseSchema = z.object({
  caseId: z.string().uuid(),
  approvedDate: z.string(),
  newVisaStartDate: z.string().optional(),
  newVisaEndDate: z.string().optional(),
});

export async function approveCaseAction(
  input: z.infer<typeof approveCaseSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = approveCaseSchema.parse(input);

    // Get case to find candidate
    const immigrationCase = await db.query.immigrationCases.findFirst({
      where: and(
        eq(immigrationCases.id, validated.caseId),
        eq(immigrationCases.orgId, context.orgId)
      ),
    });

    if (!immigrationCase) {
      return { success: false, error: 'Case not found' };
    }

    await db.update(immigrationCases)
      .set({
        status: ImmigrationCaseStatus.APPROVED,
        approvedDate: validated.approvedDate,
        newVisaStartDate: validated.newVisaStartDate,
        newVisaEndDate: validated.newVisaEndDate,
        nextAction: null,
        nextActionDate: null,
        updatedAt: new Date(),
      })
      .where(eq(immigrationCases.id, validated.caseId));

    // Update bench metadata
    await db.update(benchMetadata)
      .set({
        hasActiveImmigrationCase: false,
        updatedAt: new Date(),
      })
      .where(eq(benchMetadata.userId, immigrationCase.candidateId));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.approved',
      'immigration_cases',
      validated.caseId,
      { approvedDate: validated.approvedDate }
    );

    return { success: true, data: { id: validated.caseId } };
  } catch (error) {
    console.error('Approve case error:', error);
    return { success: false, error: 'Failed to approve case' };
  }
}

const denyCaseSchema = z.object({
  caseId: z.string().uuid(),
  deniedDate: z.string(),
  denialReason: z.string(),
});

export async function denyCaseAction(
  input: z.infer<typeof denyCaseSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = denyCaseSchema.parse(input);

    // Get case to find candidate
    const immigrationCase = await db.query.immigrationCases.findFirst({
      where: and(
        eq(immigrationCases.id, validated.caseId),
        eq(immigrationCases.orgId, context.orgId)
      ),
    });

    if (!immigrationCase) {
      return { success: false, error: 'Case not found' };
    }

    await db.update(immigrationCases)
      .set({
        status: ImmigrationCaseStatus.DENIED,
        deniedDate: validated.deniedDate,
        denialReason: validated.denialReason,
        nextAction: null,
        nextActionDate: null,
        updatedAt: new Date(),
      })
      .where(eq(immigrationCases.id, validated.caseId));

    // Update bench metadata
    await db.update(benchMetadata)
      .set({
        hasActiveImmigrationCase: false,
        updatedAt: new Date(),
      })
      .where(eq(benchMetadata.userId, immigrationCase.candidateId));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.denied',
      'immigration_cases',
      validated.caseId,
      { deniedDate: validated.deniedDate, denialReason: validated.denialReason },
      'warning'
    );

    return { success: true, data: { id: validated.caseId } };
  } catch (error) {
    console.error('Deny case error:', error);
    return { success: false, error: 'Failed to deny case' };
  }
}

export async function withdrawCaseAction(
  caseId: string,
  reason: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    // Get case to find candidate
    const immigrationCase = await db.query.immigrationCases.findFirst({
      where: and(
        eq(immigrationCases.id, caseId),
        eq(immigrationCases.orgId, context.orgId)
      ),
    });

    if (!immigrationCase) {
      return { success: false, error: 'Case not found' };
    }

    await db.update(immigrationCases)
      .set({
        status: ImmigrationCaseStatus.WITHDRAWN,
        internalNotes: immigrationCase.internalNotes
          ? `${immigrationCase.internalNotes}\n\nWithdrawn: ${reason}`
          : `Withdrawn: ${reason}`,
        nextAction: null,
        nextActionDate: null,
        updatedAt: new Date(),
      })
      .where(eq(immigrationCases.id, caseId));

    // Update bench metadata
    await db.update(benchMetadata)
      .set({
        hasActiveImmigrationCase: false,
        updatedAt: new Date(),
      })
      .where(eq(benchMetadata.userId, immigrationCase.candidateId));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.withdrawn',
      'immigration_cases',
      caseId,
      { reason },
      'warning'
    );

    return { success: true, data: { id: caseId } };
  } catch (error) {
    console.error('Withdraw case error:', error);
    return { success: false, error: 'Failed to withdraw case' };
  }
}

// =====================================================
// Timeline Notes Actions
// =====================================================

const addTimelineNoteSchema = z.object({
  caseId: z.string().uuid(),
  date: z.string(),
  note: z.string().min(1),
});

export async function addTimelineNoteAction(
  input: z.infer<typeof addTimelineNoteSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'write');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = addTimelineNoteSchema.parse(input);

    // Get current case
    const immigrationCase = await db.query.immigrationCases.findFirst({
      where: and(
        eq(immigrationCases.id, validated.caseId),
        eq(immigrationCases.orgId, context.orgId)
      ),
    });

    if (!immigrationCase) {
      return { success: false, error: 'Case not found' };
    }

    // Get user name for the note
    const user = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, context.userId),
      columns: { firstName: true, lastName: true },
    });
    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown';

    const newNote: TimelineNote = {
      date: validated.date,
      note: validated.note,
      addedBy: userName,
      addedAt: new Date().toISOString(),
    };

    const currentNotes = (immigrationCase.timelineNotes as TimelineNote[]) || [];
    const updatedNotes = [...currentNotes, newNote];

    await db.update(immigrationCases)
      .set({
        timelineNotes: updatedNotes,
        updatedAt: new Date(),
      })
      .where(eq(immigrationCases.id, validated.caseId));

    await logAuditEvent(
      context.userId,
      context.userEmail,
      context.orgId,
      'immigration.case.note_added',
      'immigration_cases',
      validated.caseId,
      { date: validated.date, note: validated.note }
    );

    return { success: true, data: { id: validated.caseId } };
  } catch (error) {
    console.error('Add timeline note error:', error);
    return { success: false, error: 'Failed to add timeline note' };
  }
}

// =====================================================
// Dashboard & Analytics Actions
// =====================================================

export interface ImmigrationDashboardMetrics {
  totalActiveCases: number;
  pendingRfe: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  approvedThisMonth: number;
  deniedThisMonth: number;
  casesByType: { type: string; count: number }[];
  casesByStatus: { status: string; count: number }[];
}

export async function getImmigrationDashboardMetricsAction(): Promise<ActionResult<ImmigrationDashboardMetrics>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    const in60Days = new Date();
    in60Days.setDate(in60Days.getDate() + 60);

    // Get aggregate stats
    const stats = await db
      .select({
        totalActiveCases: sql<number>`count(*) filter (where status in ('drafting', 'submitted', 'rfe'))`,
        pendingRfe: sql<number>`count(*) filter (where status = 'rfe')`,
        expiringIn30Days: sql<number>`count(*) filter (where current_visa_expiry <= ${in30Days.toISOString().split('T')[0]} and status not in ('approved', 'denied', 'withdrawn'))`,
        expiringIn60Days: sql<number>`count(*) filter (where current_visa_expiry <= ${in60Days.toISOString().split('T')[0]} and status not in ('approved', 'denied', 'withdrawn'))`,
        approvedThisMonth: sql<number>`count(*) filter (where status = 'approved' and approved_date >= ${startOfMonth.toISOString().split('T')[0]})`,
        deniedThisMonth: sql<number>`count(*) filter (where status = 'denied' and denied_date >= ${startOfMonth.toISOString().split('T')[0]})`,
      })
      .from(immigrationCases)
      .where(eq(immigrationCases.orgId, context.orgId));

    // Get cases by type
    const casesByType = await db
      .select({
        type: immigrationCases.caseType,
        count: sql<number>`count(*)`,
      })
      .from(immigrationCases)
      .where(eq(immigrationCases.orgId, context.orgId))
      .groupBy(immigrationCases.caseType);

    // Get cases by status
    const casesByStatus = await db
      .select({
        status: immigrationCases.status,
        count: sql<number>`count(*)`,
      })
      .from(immigrationCases)
      .where(eq(immigrationCases.orgId, context.orgId))
      .groupBy(immigrationCases.status);

    return {
      success: true,
      data: {
        totalActiveCases: Number(stats[0]?.totalActiveCases || 0),
        pendingRfe: Number(stats[0]?.pendingRfe || 0),
        expiringIn30Days: Number(stats[0]?.expiringIn30Days || 0),
        expiringIn60Days: Number(stats[0]?.expiringIn60Days || 0),
        approvedThisMonth: Number(stats[0]?.approvedThisMonth || 0),
        deniedThisMonth: Number(stats[0]?.deniedThisMonth || 0),
        casesByType: casesByType.map(c => ({ type: c.type, count: Number(c.count) })),
        casesByStatus: casesByStatus.map(c => ({ status: c.status, count: Number(c.count) })),
      },
    };
  } catch (error) {
    console.error('Get immigration dashboard metrics error:', error);
    return { success: false, error: 'Failed to get dashboard metrics' };
  }
}

export async function getUpcomingDeadlinesAction(
  daysAhead: number = 30
): Promise<ActionResult<ImmigrationCaseSummary[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const cases = await db
      .select({
        id: immigrationCases.id,
        candidateId: immigrationCases.candidateId,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        caseType: immigrationCases.caseType,
        status: immigrationCases.status,
        currentVisaExpiry: immigrationCases.currentVisaExpiry,
        nextAction: immigrationCases.nextAction,
        nextActionDate: immigrationCases.nextActionDate,
        daysElapsed: immigrationCases.daysElapsed,
      })
      .from(immigrationCases)
      .innerJoin(userProfiles, eq(immigrationCases.candidateId, userProfiles.id))
      .where(and(
        eq(immigrationCases.orgId, context.orgId),
        or(
          and(
            isNotNull(immigrationCases.nextActionDate),
            lte(immigrationCases.nextActionDate, futureDate.toISOString().split('T')[0])
          ),
          and(
            isNotNull(immigrationCases.rfeResponseDueDate),
            lte(immigrationCases.rfeResponseDueDate, futureDate.toISOString().split('T')[0])
          )
        )
      ))
      .orderBy(asc(immigrationCases.nextActionDate));

    return {
      success: true,
      data: cases.map(c => ({
        id: c.id,
        candidateId: c.candidateId,
        candidateName: `${c.candidateFirstName || ''} ${c.candidateLastName || ''}`.trim() || null,
        caseType: c.caseType,
        status: c.status,
        currentVisaExpiry: c.currentVisaExpiry,
        nextAction: c.nextAction,
        nextActionDate: c.nextActionDate,
        daysElapsed: c.daysElapsed,
      })),
    };
  } catch (error) {
    console.error('Get upcoming deadlines error:', error);
    return { success: false, error: 'Failed to get upcoming deadlines' };
  }
}

export async function getExpiringVisasAction(
  daysAhead: number = 60
): Promise<ActionResult<ImmigrationCaseSummary[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const allowed = await checkPermission(context.userId, 'immigration', 'read');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const cases = await db
      .select({
        id: immigrationCases.id,
        candidateId: immigrationCases.candidateId,
        candidateFirstName: userProfiles.firstName,
        candidateLastName: userProfiles.lastName,
        caseType: immigrationCases.caseType,
        status: immigrationCases.status,
        currentVisaExpiry: immigrationCases.currentVisaExpiry,
        nextAction: immigrationCases.nextAction,
        nextActionDate: immigrationCases.nextActionDate,
        daysElapsed: immigrationCases.daysElapsed,
      })
      .from(immigrationCases)
      .innerJoin(userProfiles, eq(immigrationCases.candidateId, userProfiles.id))
      .where(and(
        eq(immigrationCases.orgId, context.orgId),
        isNotNull(immigrationCases.currentVisaExpiry),
        lte(immigrationCases.currentVisaExpiry, futureDate.toISOString().split('T')[0]),
        sql`${immigrationCases.status} not in ('approved', 'denied', 'withdrawn')`
      ))
      .orderBy(asc(immigrationCases.currentVisaExpiry));

    return {
      success: true,
      data: cases.map(c => ({
        id: c.id,
        candidateId: c.candidateId,
        candidateName: `${c.candidateFirstName || ''} ${c.candidateLastName || ''}`.trim() || null,
        caseType: c.caseType,
        status: c.status,
        currentVisaExpiry: c.currentVisaExpiry,
        nextAction: c.nextAction,
        nextActionDate: c.nextActionDate,
        daysElapsed: c.daysElapsed,
      })),
    };
  } catch (error) {
    console.error('Get expiring visas error:', error);
    return { success: false, error: 'Failed to get expiring visas' };
  }
}
