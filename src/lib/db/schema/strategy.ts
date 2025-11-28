/**
 * Lead Strategy Schema
 * 
 * Comprehensive strategy planning for sales leads.
 * Stores talking points, objection handling, stakeholder maps,
 * competition analysis, and win themes.
 */

import { pgTable, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';
import { userProfiles } from './user-profiles';
import { leads } from './crm';

// =====================================================
// LEAD STRATEGIES
// =====================================================

export const leadStrategies = pgTable('lead_strategies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  leadId: uuid('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  
  // ─────────────────────────────────────────────────────
  // Sales Strategy Notes (free-form)
  // ─────────────────────────────────────────────────────
  strategyNotes: text('strategy_notes'),
  
  // ─────────────────────────────────────────────────────
  // Talking Points (JSON array)
  // Each item: { id, title, description, order }
  // ─────────────────────────────────────────────────────
  talkingPoints: jsonb('talking_points').$type<TalkingPoint[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Value Proposition
  // Why this lead should choose us
  // ─────────────────────────────────────────────────────
  valueProposition: text('value_proposition'),
  differentiators: jsonb('differentiators').$type<string[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Objection Handling (JSON array)
  // Each item: { id, objection, response }
  // ─────────────────────────────────────────────────────
  objections: jsonb('objections').$type<Objection[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Stakeholder Map (JSON array)
  // Each item: { id, name, role, influence, stance, notes }
  // ─────────────────────────────────────────────────────
  stakeholders: jsonb('stakeholders').$type<Stakeholder[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Competition Analysis (JSON array)
  // Each item: { id, competitor, theirStrengths, ourAdvantages }
  // ─────────────────────────────────────────────────────
  competitors: jsonb('competitors').$type<Competitor[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Win Themes
  // Key messages and pain points
  // ─────────────────────────────────────────────────────
  winThemes: jsonb('win_themes').$type<string[]>().default([]),
  painPoints: jsonb('pain_points').$type<string[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Call/Meeting Strategy
  // ─────────────────────────────────────────────────────
  meetingAgenda: jsonb('meeting_agenda').$type<AgendaItem[]>().default([]),
  questionsToAsk: jsonb('questions_to_ask').$type<string[]>().default([]),
  desiredOutcomes: jsonb('desired_outcomes').$type<string[]>().default([]),
  
  // ─────────────────────────────────────────────────────
  // Audit Trail
  // ─────────────────────────────────────────────────────
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
  updatedBy: uuid('updated_by').references(() => userProfiles.id),
});

// =====================================================
// TALKING POINT TEMPLATES
// Reusable templates that can be copied to leads
// =====================================================

export const talkingPointTemplates = pgTable('talking_point_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'), // 'discovery', 'demo', 'negotiation', 'closing'
  
  // Template content (JSON array)
  talkingPoints: jsonb('talking_points').$type<TalkingPoint[]>().default([]),
  
  // Template settings
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  
  // Audit
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => userProfiles.id),
});

// =====================================================
// RELATIONS
// =====================================================

export const leadStrategiesRelations = relations(leadStrategies, ({ one }) => ({
  organization: one(organizations, {
    fields: [leadStrategies.orgId],
    references: [organizations.id],
  }),
  lead: one(leads, {
    fields: [leadStrategies.leadId],
    references: [leads.id],
  }),
  creator: one(userProfiles, {
    fields: [leadStrategies.createdBy],
    references: [userProfiles.id],
    relationName: 'strategyCreator',
  }),
  updater: one(userProfiles, {
    fields: [leadStrategies.updatedBy],
    references: [userProfiles.id],
    relationName: 'strategyUpdater',
  }),
}));

export const talkingPointTemplatesRelations = relations(talkingPointTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [talkingPointTemplates.orgId],
    references: [organizations.id],
  }),
  creator: one(userProfiles, {
    fields: [talkingPointTemplates.createdBy],
    references: [userProfiles.id],
  }),
}));

// =====================================================
// TYPES
// =====================================================

export interface TalkingPoint {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface Objection {
  id: string;
  objection: string;
  response: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  influence: 'high' | 'medium' | 'low';
  stance: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';
  notes?: string;
}

export interface Competitor {
  id: string;
  name: string;
  theirStrengths: string[];
  ourAdvantages: string[];
}

export interface AgendaItem {
  id: string;
  topic: string;
  duration: number; // minutes
  owner?: string;
}

export type LeadStrategy = typeof leadStrategies.$inferSelect;
export type NewLeadStrategy = typeof leadStrategies.$inferInsert;
export type TalkingPointTemplate = typeof talkingPointTemplates.$inferSelect;
export type NewTalkingPointTemplate = typeof talkingPointTemplates.$inferInsert;

// =====================================================
// CONSTANTS
// =====================================================

export const STAKEHOLDER_INFLUENCE_OPTIONS = [
  { value: 'high', label: 'High', color: 'text-red-600 bg-red-50' },
  { value: 'medium', label: 'Medium', color: 'text-amber-600 bg-amber-50' },
  { value: 'low', label: 'Low', color: 'text-stone-600 bg-stone-50' },
] as const;

export const STAKEHOLDER_STANCE_OPTIONS = [
  { value: 'champion', label: 'Champion', color: 'text-green-600 bg-green-50', icon: '🏆' },
  { value: 'supporter', label: 'Supporter', color: 'text-blue-600 bg-blue-50', icon: '👍' },
  { value: 'neutral', label: 'Neutral', color: 'text-stone-600 bg-stone-50', icon: '😐' },
  { value: 'skeptic', label: 'Skeptic', color: 'text-amber-600 bg-amber-50', icon: '🤔' },
  { value: 'blocker', label: 'Blocker', color: 'text-red-600 bg-red-50', icon: '🚫' },
] as const;

export const TEMPLATE_CATEGORIES = [
  { value: 'discovery', label: 'Discovery Call' },
  { value: 'demo', label: 'Product Demo' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closing', label: 'Closing' },
  { value: 'follow_up', label: 'Follow-up' },
] as const;

// Default talking points for new leads
export const DEFAULT_TALKING_POINTS: TalkingPoint[] = [
  {
    id: '1',
    title: 'Opening',
    description: 'Build rapport and establish context',
    order: 1,
  },
  {
    id: '2',
    title: 'Pain Discovery',
    description: 'Understand their current challenges and pain points',
    order: 2,
  },
  {
    id: '3',
    title: 'Value Proposition',
    description: 'Present how we solve their specific problems',
    order: 3,
  },
  {
    id: '4',
    title: 'Next Steps',
    description: 'Agree on clear action items and timeline',
    order: 4,
  },
];

