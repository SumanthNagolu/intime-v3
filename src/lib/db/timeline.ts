/**
 * Project Timeline Database Helpers
 *
 * CRUD operations and query helpers for the timeline logging system.
 */

import { eq } from 'drizzle-orm';
import { projectTimeline, sessionMetadata, type NewProjectTimeline, type NewSessionMetadata, type ProjectTimeline, type SessionMetadata } from './schema/timeline';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Re-export types
export type { ProjectTimeline, NewProjectTimeline, SessionMetadata, NewSessionMetadata };

/**
 * Timeline Entry Input (simplified for CLI/API usage)
 */
export interface TimelineInput {
  orgId?: string;
  sessionId: string;
  conversationSummary: string;
  userIntent?: string;
  agentType?: string;
  agentModel?: string;
  duration?: string;
  actionsTaken?: {
    completed: string[];
    inProgress?: string[];
    blocked?: string[];
  };
  filesChanged?: {
    created: string[];
    modified: string[];
    deleted: string[];
  };
  decisions?: Array<{
    decision: string;
    reasoning: string;
    alternatives?: string[];
  }>;
  assumptions?: Array<{
    assumption: string;
    rationale: string;
    riskLevel?: 'low' | 'medium' | 'high';
  }>;
  results?: {
    status: 'success' | 'partial' | 'blocked' | 'failed';
    summary: string;
    metrics?: Record<string, number>;
    artifacts?: string[];
  };
  futureNotes?: Array<{
    note: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    category?: string;
  }>;
  relatedCommits?: string[];
  relatedPRs?: string[];
  relatedDocs?: string[];
  tags?: string[];
}

/**
 * Session Input (simplified)
 */
export interface SessionInput {
  orgId?: string;
  sessionId: string;
  startedAt: Date;
  endedAt?: Date;
  branch?: string;
  overallGoal?: string;
  environment?: 'development' | 'staging' | 'production';
}

/**
 * Timeline Query Filters
 */
export interface TimelineFilters {
  sessionId?: string;
  agentType?: string;
  tags?: string[];
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

/**
 * Database client placeholder
 * TODO: Replace with actual Drizzle client when Supabase is configured
 */
import { db } from './index';

/**
 * Create a new timeline entry
 */
export async function createTimelineEntry(input: TimelineInput): Promise<ProjectTimeline | null> {


  try {
    const entry: NewProjectTimeline = {
      orgId: input.orgId || DEFAULT_ORG_ID,
      sessionId: input.sessionId,
      conversationSummary: input.conversationSummary,
      userIntent: input.userIntent,
      agentType: input.agentType,
      agentModel: input.agentModel,
      duration: input.duration,
      actionsTaken: input.actionsTaken,
      filesChanged: input.filesChanged,
      decisions: input.decisions,
      assumptions: input.assumptions,
      results: input.results,
      futureNotes: input.futureNotes,
      relatedCommits: input.relatedCommits,
      relatedPRs: input.relatedPRs,
      relatedDocs: input.relatedDocs,
      tags: input.tags,
    };

    const [created] = await db.insert(projectTimeline).values(entry).returning();
    return created;
  } catch (error) {
    console.error('Error creating timeline entry:', error);
    throw error;
  }
}

/**
 * Create or update a session
 */
export async function upsertSession(input: SessionInput): Promise<SessionMetadata | null> {


  try {
    const session: NewSessionMetadata = {
      orgId: input.orgId || DEFAULT_ORG_ID,
      sessionId: input.sessionId,
      startedAt: input.startedAt,
      endedAt: input.endedAt,
      branch: input.branch,
      overallGoal: input.overallGoal,
      environment: input.environment,
    };

    // Use INSERT ... ON CONFLICT for upsert
    const [upserted] = await db
      .insert(sessionMetadata)
      .values(session)
      .onConflictDoUpdate({
        target: sessionMetadata.sessionId,
        set: {
          endedAt: input.endedAt,
          overallGoal: input.overallGoal,
        },
      })
      .returning();

    return upserted;
  } catch (error) {
    console.error('Error upserting session:', error);
    throw error;
  }
}

/**
 * Get timeline entries with filters
 */
export async function getTimelineEntries(filters: TimelineFilters = {}): Promise<ProjectTimeline[]> {


  try {
    // TODO: Implement full query with Drizzle
    // This is a placeholder - implement proper filtering when DB is set up
    const entries = await db.select().from(projectTimeline).limit(filters.limit || 50);
    return entries;
  } catch (error) {
    console.error('Error fetching timeline entries:', error);
    throw error;
  }
}

/**
 * Search timeline entries using full-text search
 */
export async function searchTimeline(query: string, limit = 20): Promise<ProjectTimeline[]> {


  try {
    // TODO: Implement full-text search with tsvector
    // Placeholder implementation
    const results = await db.select().from(projectTimeline).limit(limit);
    return results;
  } catch (error) {
    console.error('Error searching timeline:', error);
    throw error;
  }
}

/**
 * Get timeline entries by session ID
 */
export async function getSessionTimeline(sessionId: string): Promise<ProjectTimeline[]> {


  try {
    // TODO: Implement with proper Drizzle query
    const entries = await db.select().from(projectTimeline).where(eq(projectTimeline.sessionId, sessionId));
    return entries;
  } catch (error) {
    console.error('Error fetching session timeline:', error);
    throw error;
  }
}

/**
 * Get all unique tags
 */
export async function getAllTags(): Promise<string[]> {


  try {
    // TODO: Implement with proper query to unnest tags array
    return [];
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

/**
 * Get timeline statistics
 */
export async function getTimelineStats() {


  try {
    // TODO: Implement stats queries
    return {
      totalEntries: 0,
      totalSessions: 0,
      tagsCount: 0,
      recentActivity: [],
    };
  } catch (error) {
    console.error('Error fetching timeline stats:', error);
    throw error;
  }
}

/**
 * Archive old entries (soft delete)
 */
export async function archiveOldEntries(beforeDate: Date): Promise<number> {


  try {
    // TODO: Implement archive logic
    return 0;
  } catch (error) {
    console.error('Error archiving entries:', error);
    throw error;
  }
}

/**
 * File-based fallback for when database is not available
 * Writes to a JSON file in .claude/state/timeline/
 */
export async function writeToFileTimeline(input: TimelineInput): Promise<void> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const timelineDir = path.join(process.cwd(), '.claude', 'state', 'timeline');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${input.sessionId}-${timestamp}.json`;
  const filepath = path.join(timelineDir, filename);

  try {
    // Ensure directory exists
    await fs.mkdir(timelineDir, { recursive: true });

    // Write file
    await fs.writeFile(filepath, JSON.stringify(input, null, 2), 'utf-8');
    console.log(`Timeline entry saved to: ${filepath}`);
  } catch (error) {
    console.error('Error writing timeline to file:', error);
    throw error;
  }
}

/**
 * Read file-based timeline entries
 */
export async function readFileTimeline(sessionId?: string): Promise<TimelineInput[]> {
  const fs = await import('fs/promises');
  const path = await import('path');

  const timelineDir = path.join(process.cwd(), '.claude', 'state', 'timeline');

  try {
    const files = await fs.readdir(timelineDir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));

    const entries: TimelineInput[] = [];
    for (const file of jsonFiles) {
      if (sessionId && !file.startsWith(sessionId)) {
        continue;
      }

      const content = await fs.readFile(path.join(timelineDir, file), 'utf-8');
      entries.push(JSON.parse(content));
    }

    return entries.sort((a, b) => {
      // Sort by session ID (which includes timestamp)
      return b.sessionId.localeCompare(a.sessionId);
    });
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return [];
    }
    console.error('Error reading file timeline:', error);
    throw error;
  }
}
