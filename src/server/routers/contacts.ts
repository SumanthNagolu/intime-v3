/**
 * tRPC Router: Contacts Module
 * Handles universal contacts (POCs, candidates, vendors, partners)
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema/workspace';
import { accounts } from '@/lib/db/schema/crm';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, sql, isNull, or, ilike, inArray } from 'drizzle-orm';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const contactTypeValues = ['client_poc', 'candidate', 'vendor', 'partner', 'internal', 'general'] as const;
const contactStatusValues = ['active', 'inactive', 'do_not_contact', 'bounced', 'unsubscribed'] as const;
const decisionAuthorityValues = ['decision_maker', 'influencer', 'gatekeeper', 'end_user', 'champion'] as const;
const preferredContactMethodValues = ['email', 'phone', 'linkedin', 'text', 'video_call'] as const;

const createContactSchema = z.object({
  // Contact Type
  contactType: z.enum(contactTypeValues).default('general'),

  // Personal Information
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  mobile: z.string().max(50).optional().nullable(),
  linkedinUrl: z.string().url().max(500).optional().nullable(),
  avatarUrl: z.string().url().max(500).optional().nullable(),

  // Professional Information
  title: z.string().max(200).optional().nullable(),
  companyName: z.string().max(200).optional().nullable(),
  companyId: z.string().uuid().optional().nullable(),
  department: z.string().max(100).optional().nullable(),

  // Work Location
  workLocation: z.string().max(200).optional().nullable(),
  timezone: z.string().max(50).default('America/New_York'),

  // Communication Preferences
  preferredContactMethod: z.enum(preferredContactMethodValues).default('email'),
  bestTimeToContact: z.string().max(100).optional().nullable(),
  doNotCallBefore: z.string().max(10).optional().nullable(),
  doNotCallAfter: z.string().max(10).optional().nullable(),

  // Status
  status: z.enum(contactStatusValues).default('active'),

  // Source Tracking
  source: z.string().max(100).optional().nullable(),
  sourceDetail: z.string().max(200).optional().nullable(),
  sourceCampaignId: z.string().uuid().optional().nullable(),

  // Link to user profile (for candidates)
  userProfileId: z.string().uuid().optional().nullable(),

  // Social Media
  twitterUrl: z.string().url().max(500).optional().nullable(),
  githubUrl: z.string().url().max(500).optional().nullable(),

  // Decision Making
  decisionAuthority: z.enum(decisionAuthorityValues).optional().nullable(),
  buyingRole: z.string().max(100).optional().nullable(),
  influenceLevel: z.enum(['high', 'medium', 'low']).optional().nullable(),

  // Tags & Notes
  tags: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),

  // Assignment
  ownerId: z.string().uuid().optional().nullable(),
});

const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().uuid(),
});

const listContactsSchema = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  contactType: z.enum(contactTypeValues).optional(),
  status: z.enum(contactStatusValues).optional(),
  companyId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  search: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// =====================================================
// ROUTER
// =====================================================

export const contactsRouter = router({
  /**
   * List contacts with filtering
   */
  list: orgProtectedProcedure
    .input(listContactsSchema)
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { limit, offset, contactType, status, companyId, ownerId, search, tags } = input;

      const conditions = [
        eq(contacts.orgId, orgId),
        isNull(contacts.deletedAt),
      ];

      if (contactType) {
        conditions.push(eq(contacts.contactType, contactType));
      }

      if (status) {
        conditions.push(eq(contacts.status, status));
      }

      if (companyId) {
        conditions.push(eq(contacts.companyId, companyId));
      }

      if (ownerId) {
        conditions.push(eq(contacts.ownerId, ownerId));
      }

      if (search) {
        conditions.push(
          or(
            ilike(contacts.firstName, `%${search}%`),
            ilike(contacts.lastName, `%${search}%`),
            ilike(contacts.email, `%${search}%`),
            ilike(contacts.companyName, `%${search}%`),
            ilike(contacts.title, `%${search}%`)
          )!
        );
      }

      if (tags && tags.length > 0) {
        conditions.push(sql`${contacts.tags} && ${tags}`);
      }

      const results = await db
        .select({
          contact: contacts,
          company: accounts,
          owner: userProfiles,
        })
        .from(contacts)
        .leftJoin(accounts, eq(contacts.companyId, accounts.id))
        .leftJoin(userProfiles, eq(contacts.ownerId, userProfiles.id))
        .where(and(...conditions))
        .orderBy(desc(contacts.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(contacts)
        .where(and(...conditions));

      return {
        items: results.map(r => ({
          ...r.contact,
          company: r.company,
          owner: r.owner,
        })),
        total: count,
        limit,
        offset,
      };
    }),

  /**
   * Get single contact by ID
   */
  getById: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const result = await db
        .select({
          contact: contacts,
          company: accounts,
          owner: userProfiles,
        })
        .from(contacts)
        .leftJoin(accounts, eq(contacts.companyId, accounts.id))
        .leftJoin(userProfiles, eq(contacts.ownerId, userProfiles.id))
        .where(
          and(
            eq(contacts.id, input.id),
            eq(contacts.orgId, orgId),
            isNull(contacts.deletedAt)
          )
        )
        .limit(1);

      if (!result.length) {
        throw new Error('Contact not found');
      }

      return {
        ...result[0].contact,
        company: result[0].company,
        owner: result[0].owner,
      };
    }),

  /**
   * Create new contact
   */
  create: orgProtectedProcedure
    .input(createContactSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [newContact] = await db.insert(contacts).values({
        ...input,
        orgId,
        ownerId: input.ownerId || userId,
        createdBy: userId,
      }).returning();

      return newContact;
    }),

  /**
   * Update contact
   */
  update: orgProtectedProcedure
    .input(updateContactSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;
      const { id, ...data } = input;

      const [updatedContact] = await db.update(contacts)
        .set({
          ...data,
          updatedBy: userId,
        })
        .where(
          and(
            eq(contacts.id, id),
            eq(contacts.orgId, orgId),
            isNull(contacts.deletedAt)
          )
        )
        .returning();

      if (!updatedContact) {
        throw new Error('Contact not found or unauthorized');
      }

      return updatedContact;
    }),

  /**
   * Delete contact (soft delete)
   */
  delete: orgProtectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [deletedContact] = await db.update(contacts)
        .set({
          deletedAt: new Date(),
          updatedBy: userId,
        })
        .where(
          and(
            eq(contacts.id, input.id),
            eq(contacts.orgId, orgId),
            isNull(contacts.deletedAt)
          )
        )
        .returning();

      if (!deletedContact) {
        throw new Error('Contact not found or unauthorized');
      }

      return { success: true, id: input.id };
    }),

  /**
   * Bulk import contacts
   */
  bulkImport: orgProtectedProcedure
    .input(z.object({
      contacts: z.array(createContactSchema).max(500),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const contactsToInsert = input.contacts.map(contact => ({
        ...contact,
        orgId,
        ownerId: contact.ownerId || userId,
        createdBy: userId,
      }));

      const imported = await db.insert(contacts)
        .values(contactsToInsert)
        .returning();

      return {
        success: true,
        imported: imported.length,
      };
    }),

  /**
   * Get contacts by company
   */
  getByCompany: orgProtectedProcedure
    .input(z.object({
      companyId: z.string().uuid(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;

      const results = await db
        .select()
        .from(contacts)
        .where(
          and(
            eq(contacts.orgId, orgId),
            eq(contacts.companyId, input.companyId),
            isNull(contacts.deletedAt)
          )
        )
        .orderBy(contacts.lastName, contacts.firstName)
        .limit(input.limit);

      return results;
    }),

  /**
   * Search contacts for autocomplete
   */
  search: orgProtectedProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      contactType: z.enum(contactTypeValues).optional(),
      limit: z.number().min(1).max(20).default(10),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      const { query, contactType, limit } = input;

      const conditions = [
        eq(contacts.orgId, orgId),
        isNull(contacts.deletedAt),
        or(
          ilike(contacts.firstName, `%${query}%`),
          ilike(contacts.lastName, `%${query}%`),
          ilike(contacts.email, `%${query}%`),
          ilike(contacts.companyName, `%${query}%`)
        )!,
      ];

      if (contactType) {
        conditions.push(eq(contacts.contactType, contactType));
      }

      const results = await db
        .select({
          id: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          email: contacts.email,
          title: contacts.title,
          companyName: contacts.companyName,
          contactType: contacts.contactType,
          avatarUrl: contacts.avatarUrl,
        })
        .from(contacts)
        .where(and(...conditions))
        .limit(limit);

      return results;
    }),

  /**
   * Merge duplicate contacts
   */
  merge: orgProtectedProcedure
    .input(z.object({
      primaryId: z.string().uuid(),
      duplicateIds: z.array(z.string().uuid()).min(1).max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get primary contact
      const [primary] = await db.select()
        .from(contacts)
        .where(
          and(
            eq(contacts.id, input.primaryId),
            eq(contacts.orgId, orgId),
            isNull(contacts.deletedAt)
          )
        )
        .limit(1);

      if (!primary) {
        throw new Error('Primary contact not found');
      }

      // Soft delete duplicates
      await db.update(contacts)
        .set({
          deletedAt: new Date(),
          updatedBy: userId,
          internalNotes: sql`COALESCE(${contacts.internalNotes}, '') || '\n[Merged into contact ' || ${input.primaryId} || ']'`,
        })
        .where(
          and(
            inArray(contacts.id, input.duplicateIds),
            eq(contacts.orgId, orgId),
            isNull(contacts.deletedAt)
          )
        );

      return { success: true, primaryId: input.primaryId };
    }),

  /**
   * Update engagement score
   */
  updateEngagement: orgProtectedProcedure
    .input(z.object({
      id: z.string().uuid(),
      incrementInteractions: z.boolean().default(true),
      engagementScore: z.number().min(0).max(100).optional(),
      lastContactedAt: z.date().optional(),
      lastResponseAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;
      const { id, incrementInteractions, ...data } = input;

      const updateData: Record<string, unknown> = {
        ...data,
        updatedBy: userId,
      };

      if (incrementInteractions) {
        updateData.totalInteractions = sql`COALESCE(${contacts.totalInteractions}, 0) + 1`;
      }

      const [updated] = await db.update(contacts)
        .set(updateData)
        .where(
          and(
            eq(contacts.id, id),
            eq(contacts.orgId, orgId),
            isNull(contacts.deletedAt)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Contact not found');
      }

      return updated;
    }),
});

export type ContactsRouter = typeof contactsRouter;
