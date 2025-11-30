/**
 * Strategy Router
 * 
 * CRUD operations for lead strategies.
 * Includes talking points, objection handling, stakeholder maps, etc.
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { 
  leadStrategies,
  talkingPointTemplates,
  DEFAULT_TALKING_POINTS,
  type TalkingPoint,
  type Objection,
  type Stakeholder,
  type Competitor,
  type AgendaItem,
} from '@/lib/db/schema/strategy';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc } from 'drizzle-orm';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const talkingPointSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number(),
});

const objectionSchema = z.object({
  id: z.string(),
  objection: z.string(),
  response: z.string(),
});

const stakeholderSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  influence: z.enum(['high', 'medium', 'low']),
  stance: z.enum(['champion', 'supporter', 'neutral', 'skeptic', 'blocker']),
  notes: z.string().optional(),
});

const competitorSchema = z.object({
  id: z.string(),
  name: z.string(),
  theirStrengths: z.array(z.string()),
  ourAdvantages: z.array(z.string()),
});

const agendaItemSchema = z.object({
  id: z.string(),
  topic: z.string(),
  duration: z.number(),
  owner: z.string().optional(),
});

// =====================================================
// STRATEGY ROUTER
// =====================================================

export const strategyRouter = router({
  
  // ─────────────────────────────────────────────────────
  // GET STRATEGY FOR A LEAD
  // ─────────────────────────────────────────────────────
  
  get: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      const [strategy] = await db.select()
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);
      
      // If no strategy exists, return default structure
      if (!strategy) {
        return {
          id: null,
          leadId: input.leadId,
          strategyNotes: '',
          talkingPoints: DEFAULT_TALKING_POINTS,
          valueProposition: '',
          differentiators: [],
          objections: [],
          stakeholders: [],
          competitors: [],
          winThemes: [],
          painPoints: [],
          meetingAgenda: [],
          questionsToAsk: [],
          desiredOutcomes: [],
        };
      }
      
      return strategy;
    }),

  // ─────────────────────────────────────────────────────
  // CREATE OR UPDATE STRATEGY
  // ─────────────────────────────────────────────────────
  
  upsert: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      strategyNotes: z.string().optional(),
      talkingPoints: z.array(talkingPointSchema).optional(),
      valueProposition: z.string().optional(),
      differentiators: z.array(z.string()).optional(),
      objections: z.array(objectionSchema).optional(),
      stakeholders: z.array(stakeholderSchema).optional(),
      competitors: z.array(competitorSchema).optional(),
      winThemes: z.array(z.string()).optional(),
      painPoints: z.array(z.string()).optional(),
      meetingAgenda: z.array(agendaItemSchema).optional(),
      questionsToAsk: z.array(z.string()).optional(),
      desiredOutcomes: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get user profile
      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Check if strategy exists
      const [existing] = await db.select({ id: leadStrategies.id })
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);

      const updateData = {
        strategyNotes: input.strategyNotes,
        talkingPoints: input.talkingPoints as TalkingPoint[] | undefined,
        valueProposition: input.valueProposition,
        differentiators: input.differentiators,
        objections: input.objections as Objection[] | undefined,
        stakeholders: input.stakeholders as Stakeholder[] | undefined,
        competitors: input.competitors as Competitor[] | undefined,
        winThemes: input.winThemes,
        painPoints: input.painPoints,
        meetingAgenda: input.meetingAgenda as AgendaItem[] | undefined,
        questionsToAsk: input.questionsToAsk,
        desiredOutcomes: input.desiredOutcomes,
        updatedAt: new Date(),
        updatedBy: userProfile.id,
      };

      if (existing) {
        // Update
        const [updated] = await db.update(leadStrategies)
          .set(updateData)
          .where(eq(leadStrategies.id, existing.id))
          .returning();
        return updated;
      } else {
        // Create
        const [created] = await db.insert(leadStrategies)
          .values({
            orgId,
            leadId: input.leadId,
            ...updateData,
            createdBy: userProfile.id,
          })
          .returning();
        return created;
      }
    }),

  // ─────────────────────────────────────────────────────
  // UPDATE SPECIFIC SECTION
  // ─────────────────────────────────────────────────────
  
  updateTalkingPoints: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      talkingPoints: z.array(talkingPointSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get or create strategy
      const [existing] = await db.select()
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);

      if (existing) {
        const [updated] = await db.update(leadStrategies)
          .set({
            talkingPoints: input.talkingPoints as TalkingPoint[],
            updatedAt: new Date(),
            updatedBy: userProfile.id,
          })
          .where(eq(leadStrategies.id, existing.id))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(leadStrategies)
          .values({
            orgId,
            leadId: input.leadId,
            talkingPoints: input.talkingPoints as TalkingPoint[],
            createdBy: userProfile.id,
            updatedBy: userProfile.id,
          })
          .returning();
        return created;
      }
    }),

  updateStakeholders: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      stakeholders: z.array(stakeholderSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const [existing] = await db.select()
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);

      if (existing) {
        const [updated] = await db.update(leadStrategies)
          .set({
            stakeholders: input.stakeholders as Stakeholder[],
            updatedAt: new Date(),
            updatedBy: userProfile.id,
          })
          .where(eq(leadStrategies.id, existing.id))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(leadStrategies)
          .values({
            orgId,
            leadId: input.leadId,
            stakeholders: input.stakeholders as Stakeholder[],
            createdBy: userProfile.id,
            updatedBy: userProfile.id,
          })
          .returning();
        return created;
      }
    }),

  updateObjections: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      objections: z.array(objectionSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const [existing] = await db.select()
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);

      if (existing) {
        const [updated] = await db.update(leadStrategies)
          .set({
            objections: input.objections as Objection[],
            updatedAt: new Date(),
            updatedBy: userProfile.id,
          })
          .where(eq(leadStrategies.id, existing.id))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(leadStrategies)
          .values({
            orgId,
            leadId: input.leadId,
            objections: input.objections as Objection[],
            createdBy: userProfile.id,
            updatedBy: userProfile.id,
          })
          .returning();
        return created;
      }
    }),

  updateCompetitors: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      competitors: z.array(competitorSchema),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const [existing] = await db.select()
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);

      if (existing) {
        const [updated] = await db.update(leadStrategies)
          .set({
            competitors: input.competitors as Competitor[],
            updatedAt: new Date(),
            updatedBy: userProfile.id,
          })
          .where(eq(leadStrategies.id, existing.id))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(leadStrategies)
          .values({
            orgId,
            leadId: input.leadId,
            competitors: input.competitors as Competitor[],
            createdBy: userProfile.id,
            updatedBy: userProfile.id,
          })
          .returning();
        return created;
      }
    }),

  // ─────────────────────────────────────────────────────
  // TALKING POINT TEMPLATES
  // ─────────────────────────────────────────────────────
  
  listTemplates: orgProtectedProcedure
    .input(z.object({
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { orgId } = ctx;
      
      let query = db.select()
        .from(talkingPointTemplates)
        .where(and(
          eq(talkingPointTemplates.orgId, orgId),
          eq(talkingPointTemplates.isActive, true)
        ));
      
      const templates = await query.orderBy(desc(talkingPointTemplates.isDefault));
      
      if (input.category) {
        return templates.filter(t => t.category === input.category);
      }
      
      return templates;
    }),

  createTemplate: orgProtectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      talkingPoints: z.array(talkingPointSchema),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const [template] = await db.insert(talkingPointTemplates)
        .values({
          orgId,
          name: input.name,
          description: input.description,
          category: input.category,
          talkingPoints: input.talkingPoints as TalkingPoint[],
          isDefault: input.isDefault,
          createdBy: userProfile.id,
        })
        .returning();

      return template;
    }),

  applyTemplate: orgProtectedProcedure
    .input(z.object({
      leadId: z.string().uuid(),
      templateId: z.string().uuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, orgId } = ctx;

      // Get template
      const [template] = await db.select()
        .from(talkingPointTemplates)
        .where(and(
          eq(talkingPointTemplates.id, input.templateId),
          eq(talkingPointTemplates.orgId, orgId)
        ))
        .limit(1);

      if (!template) {
        throw new Error('Template not found');
      }

      const [userProfile] = await db.select({ id: userProfiles.id })
        .from(userProfiles)
        .where(eq(userProfiles.authId, userId as string))
        .limit(1);

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Get or create strategy
      const [existing] = await db.select()
        .from(leadStrategies)
        .where(and(
          eq(leadStrategies.leadId, input.leadId),
          eq(leadStrategies.orgId, orgId)
        ))
        .limit(1);

      if (existing) {
        const [updated] = await db.update(leadStrategies)
          .set({
            talkingPoints: template.talkingPoints as TalkingPoint[],
            updatedAt: new Date(),
            updatedBy: userProfile.id,
          })
          .where(eq(leadStrategies.id, existing.id))
          .returning();
        return updated;
      } else {
        const [created] = await db.insert(leadStrategies)
          .values({
            orgId,
            leadId: input.leadId,
            talkingPoints: template.talkingPoints as TalkingPoint[],
            createdBy: userProfile.id,
            updatedBy: userProfile.id,
          })
          .returning();
        return created;
      }
    }),
});

export type StrategyRouter = typeof strategyRouter;







