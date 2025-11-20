import { pgTable, uuid, text, timestamp, jsonb, boolean, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organizations } from './organizations';

/**
 * Project Timeline Schema
 *
 * Captures comprehensive history of all interactions with Claude Code,
 * including conversations, decisions, actions, and outcomes.
 *
 * Features:
 * - Full-text search via tsvector
 * - Structured data in JSONB for queryability
 * - Session tracking and linking
 * - Auto-generated summaries
 */
export const projectTimeline = pgTable('project_timeline', {
  // Primary identification
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: varchar('session_id', { length: 50 }).notNull(),
  sessionDate: timestamp('session_date', { withTimezone: true }).notNull().defaultNow(),

  // Session metadata
  agentType: varchar('agent_type', { length: 50 }), // 'claude', 'ceo', 'pm', 'developer', etc.
  agentModel: varchar('agent_model', { length: 100 }), // 'claude-sonnet-4-5', etc.
  duration: varchar('duration', { length: 50 }), // '45 minutes', '2 hours', etc.

  // Content
  conversationSummary: text('conversation_summary').notNull(),
  userIntent: text('user_intent'), // What the user was trying to accomplish

  // Actions and results (structured data)
  actionsTaken: jsonb('actions_taken').$type<{
    completed: string[];
    inProgress?: string[];
    blocked?: string[];
  }>(),

  filesChanged: jsonb('files_changed').$type<{
    created: string[];
    modified: string[];
    deleted: string[];
  }>(),

  // Decisions and context
  decisions: jsonb('decisions').$type<Array<{
    decision: string;
    reasoning: string;
    alternatives?: string[];
    timestamp?: string;
  }>>(),

  assumptions: jsonb('assumptions').$type<Array<{
    assumption: string;
    rationale: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }>>(),

  // Results and outcomes
  results: jsonb('results').$type<{
    status: 'success' | 'partial' | 'blocked' | 'failed';
    summary: string;
    metrics?: Record<string, number>;
    artifacts?: string[]; // Links to created docs, PRs, commits
  }>(),

  // Future planning
  futureNotes: jsonb('future_notes').$type<Array<{
    note: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
  }>>(),

  // Linking and categorization
  relatedCommits: text('related_commits').array(),
  relatedPRs: text('related_prs').array(),
  relatedDocs: text('related_docs').array(),
  tags: text('tags').array(), // ['database', 'auth', 'ui', 'testing', etc.]

  // AI-generated insights
  aiGeneratedSummary: text('ai_generated_summary'),
  keyLearnings: text('key_learnings').array(),

  // Full-text search
  searchVector: text('search_vector'), // Will be tsvector in actual DB

  // Multi-tenancy
  orgId: uuid('org_id').notNull(),

  // Audit fields
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  isArchived: boolean('is_archived').default(false),
});

/**
 * Session Metadata Table
 *
 * Tracks individual sessions separately for quick lookups
 */
export const sessionMetadata = pgTable('session_metadata', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: varchar('session_id', { length: 50 }).notNull().unique(),

  // Timing
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  duration: varchar('duration', { length: 50 }),

  // Context
  branch: varchar('branch', { length: 100 }),
  commitHash: varchar('commit_hash', { length: 40 }),
  environment: varchar('environment', { length: 20 }), // 'development', 'staging', 'production'

  // Stats
  filesModified: jsonb('files_modified').$type<number>(),
  linesAdded: jsonb('lines_added').$type<number>(),
  linesRemoved: jsonb('lines_removed').$type<number>(),
  commandsExecuted: jsonb('commands_executed').$type<number>(),

  // Summary
  overallGoal: text('overall_goal'),
  successfullyCompleted: boolean('successfully_completed').default(false),

  // Multi-tenancy
  orgId: uuid('org_id').notNull(),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

/**
 * Relations
 */
export const projectTimelineRelations = relations(projectTimeline, ({ one }) => ({
  organization: one(organizations, {
    fields: [projectTimeline.orgId],
    references: [organizations.id],
  }),
}));

export const sessionMetadataRelations = relations(sessionMetadata, ({ one }) => ({
  organization: one(organizations, {
    fields: [sessionMetadata.orgId],
    references: [organizations.id],
  }),
}));

// Type exports for use in application
export type ProjectTimeline = typeof projectTimeline.$inferSelect;
export type NewProjectTimeline = typeof projectTimeline.$inferInsert;
export type SessionMetadata = typeof sessionMetadata.$inferSelect;
export type NewSessionMetadata = typeof sessionMetadata.$inferInsert;
