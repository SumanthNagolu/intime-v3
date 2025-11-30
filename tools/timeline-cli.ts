#!/usr/bin/env tsx

/**
 * Timeline CLI Tool
 *
 * Quick command-line interface for logging project timeline entries.
 *
 * Usage:
 *   pnpm timeline add "Implemented user authentication"
 *   pnpm timeline add "Fixed bug in payment flow" --tags bug,payment --status success
 *   pnpm timeline list
 *   pnpm timeline search "authentication"
 *   pnpm timeline session start "Working on feature X"
 *   pnpm timeline session end
 */

import { Command } from 'commander';
import { readFileTimeline, writeToFileTimeline, type TimelineInput, type SessionInput } from '../src/lib/db/timeline';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

const program = new Command();

// ============================================================================
// Helper Functions
// ============================================================================

function getCurrentSessionId(): string {
  const sessionFile = '.claude/state/current-session.txt';
  try {
    if (fs.existsSync(sessionFile)) {
      return fs.readFileSync(sessionFile, 'utf-8').trim();
    }
  } catch {
    // Ignore
  }

  // Generate new session ID
  const timestamp = new Date().toISOString().split('T')[0];
  return `session-${timestamp}-${randomUUID().substring(0, 8)}`;
}

function saveCurrentSessionId(sessionId: string): void {
  const sessionFile = path.join(process.cwd(), '.claude/state/current-session.txt');

  // Ensure directory exists
  fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
  fs.writeFileSync(sessionFile, sessionId, 'utf-8');
}

function getGitInfo() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    const changedFiles = execSync('git diff --name-only', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);
    const untrackedFiles = execSync('git ls-files --others --exclude-standard', { encoding: 'utf-8' }).trim().split('\n').filter(Boolean);

    return {
      branch,
      hash,
      changedFiles,
      untrackedFiles,
    };
  } catch {
    return {
      branch: 'unknown',
      hash: 'unknown',
      changedFiles: [],
      untrackedFiles: [],
    };
  }
}

// ============================================================================
// Commands
// ============================================================================

program
  .name('timeline')
  .description('Project timeline logging tool for InTime v3')
  .version('1.0.0');

// Add command
program
  .command('add')
  .description('Add a new timeline entry')
  .argument('<summary>', 'Conversation/action summary')
  .option('-i, --intent <intent>', 'User intent or goal')
  .option('-a, --agent <agent>', 'Agent type (claude, pm, developer, etc.)', 'claude')
  .option('-m, --model <model>', 'Model name', 'claude-sonnet-4-5')
  .option('-d, --duration <duration>', 'Session duration (e.g., "30 minutes")')
  .option('-t, --tags <tags>', 'Comma-separated tags', (val) => val.split(',').map((t) => t.trim()))
  .option('-s, --status <status>', 'Result status (success|partial|blocked|failed)', 'success')
  .option('--decision <decision>', 'Record a decision made')
  .option('--assumption <assumption>', 'Record an assumption')
  .option('--note <note>', 'Future note or TODO')
  .action(async (summary, options) => {
    const sessionId = getCurrentSessionId();
    const gitInfo = getGitInfo();

    const entry: TimelineInput = {
      sessionId,
      conversationSummary: summary,
      userIntent: options.intent,
      agentType: options.agent,
      agentModel: options.model,
      duration: options.duration,
      tags: options.tags || [],
      results: {
        status: options.status,
        summary: summary,
      },
      filesChanged: {
        created: gitInfo.untrackedFiles,
        modified: gitInfo.changedFiles,
        deleted: [],
      },
    };

    if (options.decision) {
      entry.decisions = [{
        decision: options.decision,
        reasoning: 'Recorded via CLI',
      }];
    }

    if (options.assumption) {
      entry.assumptions = [{
        assumption: options.assumption,
        rationale: 'Recorded via CLI',
      }];
    }

    if (options.note) {
      entry.futureNotes = [{
        note: options.note,
        priority: 'medium',
      }];
    }

    try {
      // Use file-based storage for now (until DB is set up)
      await writeToFileTimeline(entry);
      console.log('✅ Timeline entry added successfully!');
      console.log(`   Session: ${sessionId}`);
      console.log(`   Summary: ${summary}`);
      if (options.tags) {
        console.log(`   Tags: ${options.tags.join(', ')}`);
      }
    } catch (error: unknown) {
      console.error('❌ Error adding timeline entry:', error);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List recent timeline entries')
  .option('-l, --limit <limit>', 'Number of entries to show', '10')
  .option('-s, --session <sessionId>', 'Filter by session ID')
  .action(async (options) => {
    try {
      const entries = await readFileTimeline(options.session);
      const limit = parseInt(options.limit, 10);
      const display = entries.slice(0, limit);

      if (display.length === 0) {
        console.log('No timeline entries found.');
        return;
      }

      console.log(`\n📋 Recent Timeline Entries (${display.length} of ${entries.length})\n`);
      display.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.sessionId}]`);
        console.log(`   Summary: ${entry.conversationSummary}`);
        if (entry.tags && entry.tags.length > 0) {
          console.log(`   Tags: ${entry.tags.join(', ')}`);
        }
        if (entry.results) {
          console.log(`   Status: ${entry.results.status}`);
        }
        console.log('');
      });
    } catch (error: unknown) {
      console.error('❌ Error listing timeline entries:', error);
      process.exit(1);
    }
  });

// Search command
program
  .command('search')
  .description('Search timeline entries')
  .argument('<query>', 'Search query')
  .action(async (query) => {
    try {
      const entries = await readFileTimeline();
      const results = entries.filter((entry) =>
        entry.conversationSummary.toLowerCase().includes(query.toLowerCase()) ||
        entry.userIntent?.toLowerCase().includes(query.toLowerCase()) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );

      if (results.length === 0) {
        console.log(`No results found for: "${query}"`);
        return;
      }

      console.log(`\n🔍 Search Results for "${query}" (${results.length} found)\n`);
      results.forEach((entry, index) => {
        console.log(`${index + 1}. [${entry.sessionId}]`);
        console.log(`   ${entry.conversationSummary}`);
        if (entry.tags && entry.tags.length > 0) {
          console.log(`   Tags: ${entry.tags.join(', ')}`);
        }
        console.log('');
      });
    } catch (error: unknown) {
      console.error('❌ Error searching timeline:', error);
      process.exit(1);
    }
  });

// Session commands
const sessionCmd = program.command('session').description('Manage sessions');

sessionCmd
  .command('start')
  .description('Start a new session')
  .argument('<goal>', 'Overall goal for this session')
  .action(async (goal) => {
    const timestamp = new Date().toISOString().split('T')[0];
    const sessionId = `session-${timestamp}-${randomUUID().substring(0, 8)}`;
    const gitInfo = getGitInfo();

    saveCurrentSessionId(sessionId);

    const session: SessionInput = {
      sessionId,
      startedAt: new Date(),
      branch: gitInfo.branch,
      overallGoal: goal,
      environment: 'development',
    };

    try {
      // Save session metadata to file
      const sessionFile = path.join(process.cwd(), '.claude/state/timeline', `${sessionId}-session.json`);

      fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
      fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2), 'utf-8');

      console.log('✅ New session started!');
      console.log(`   Session ID: ${sessionId}`);
      console.log(`   Goal: ${goal}`);
      console.log(`   Branch: ${gitInfo.branch}`);
    } catch (error: unknown) {
      console.error('❌ Error starting session:', error);
      process.exit(1);
    }
  });

sessionCmd
  .command('end')
  .description('End the current session')
  .option('-s, --success', 'Mark session as successfully completed', true)
  .action(async (options) => {
    const sessionId = getCurrentSessionId();

    try {
      const sessionFile = path.join(process.cwd(), '.claude/state/timeline', `${sessionId}-session.json`);

      if (fs.existsSync(sessionFile)) {
        const session = JSON.parse(fs.readFileSync(sessionFile, 'utf-8'));
        session.endedAt = new Date();
        session.successfullyCompleted = options.success;

        // Calculate duration
        const start = new Date(session.startedAt);
        const end = new Date(session.endedAt);
        const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
        session.duration = minutes < 60 ? `${minutes} minutes` : `${Math.round(minutes / 60)} hours`;

        fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2), 'utf-8');

        console.log('✅ Session ended!');
        console.log(`   Session ID: ${sessionId}`);
        console.log(`   Duration: ${session.duration}`);
        console.log(`   Completed: ${options.success ? 'Yes' : 'No'}`);
      } else {
        console.log('⚠️  No active session found.');
      }
    } catch (error: unknown) {
      console.error('❌ Error ending session:', error);
      process.exit(1);
    }
  });

sessionCmd
  .command('current')
  .description('Show current session info')
  .action(() => {
    const sessionId = getCurrentSessionId();
    const gitInfo = getGitInfo();

    console.log('\n📊 Current Session Info\n');
    console.log(`   Session ID: ${sessionId}`);
    console.log(`   Branch: ${gitInfo.branch}`);
    console.log(`   Changed files: ${gitInfo.changedFiles.length + gitInfo.untrackedFiles.length}`);
  });

// Stats command
program
  .command('stats')
  .description('Show timeline statistics')
  .action(async () => {
    try {
      const entries = await readFileTimeline();

      const totalEntries = entries.length;
      const uniqueSessions = new Set(entries.map((e) => e.sessionId)).size;
      const allTags = entries.flatMap((e) => e.tags || []);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log('\n📊 Timeline Statistics\n');
      console.log(`   Total Entries: ${totalEntries}`);
      console.log(`   Unique Sessions: ${uniqueSessions}`);
      console.log(`   Total Tags: ${allTags.length}`);
      console.log(`   Unique Tags: ${Object.keys(tagCounts).length}`);
      console.log('\n   Top Tags:');
      Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([tag, count]) => {
          console.log(`     ${tag}: ${count}`);
        });
    } catch (error: unknown) {
      console.error('❌ Error fetching stats:', error);
      process.exit(1);
    }
  });

program.parse();
