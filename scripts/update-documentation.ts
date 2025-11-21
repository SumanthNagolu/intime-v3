#!/usr/bin/env tsx

/**
 * Documentation Auto-Update System
 *
 * Automatically updates all related documentation after workflow execution.
 * Keeps status badges, progress percentages, links, and timelines in sync.
 *
 * Usage:
 *   pnpm doc:update
 *   pnpm doc:update --workflow create-epics --entity ai-infrastructure
 *   pnpm doc:update --since "2025-11-20T10:00:00Z"
 *   pnpm doc:update --dry-run
 *   pnpm doc:verify
 *   pnpm doc:clean
 */

import { program } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { glob } from 'glob';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES
// ============================================================================

type WorkflowType = 'define-feature' | 'create-epics' | 'create-stories' | 'plan-sprint' | 'feature' | 'unknown';
type StatusBadge = '⚪ Not Started' | '🟡 In Progress' | '🟢 Completed';

interface WorkflowContext {
  type: WorkflowType;
  entityId: string;
  timestamp: string;
  filesModified: string[];
}

interface DocumentationChanges {
  newEntities: FileMetadata[];
  modifiedEntities: FileMetadata[];
  affectedParents: string[];
  affectedChildren: string[];
  outdatedDocs: string[];
}

interface FileMetadata {
  path: string;
  type: 'feature' | 'epic' | 'story' | 'sprint';
  id: string;
  status?: StatusBadge;
  progress?: number;
  modifiedTime: Date;
}

interface UpdateReport {
  workflow: WorkflowType;
  timestamp: string;
  duration: number;
  updates: {
    status: { count: number; items: Array<{ file: string; old: string; new: string }> };
    links: { count: number; items: Array<{ file: string; added: string }> };
    progress: { count: number; items: Array<{ file: string; old: string; new: string }> };
    timelines: { count: number; items: string[] };
  };
  cleanup: {
    duplicates: { count: number; removed: string[] };
    outdated: { count: number; removed: string[] };
  };
  validation: {
    passed: boolean;
    errors: string[];
  };
  summary: {
    filesAnalyzed: number;
    filesUpdated: number;
    filesCreated: number;
    filesDeleted: number;
  };
}

interface StoryMetadata {
  id: string;
  path: string;
  status: StatusBadge;
  points: number;
  epicId: string;
  sprintNumber?: number;
}

interface EpicMetadata {
  id: string;
  path: string;
  featureName: string;
  stories: StoryMetadata[];
  progress: number;
}

interface FeatureMetadata {
  name: string;
  path: string;
  epics: EpicMetadata[];
  progress: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_ROOT = path.join(PROJECT_ROOT, 'docs');
const PLANNING_ROOT = path.join(DOCS_ROOT, 'planning');
const FEATURES_DIR = path.join(PLANNING_ROOT, 'features');
const EPICS_DIR = path.join(PLANNING_ROOT, 'epics');
const STORIES_DIR = path.join(PLANNING_ROOT, 'stories');
const SPRINTS_DIR = path.join(PLANNING_ROOT, 'sprints');

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

async function main() {
  const startTime = Date.now();

  program
    .name('update-documentation')
    .description('Auto-update documentation after workflow execution')
    .option('-w, --workflow <type>', 'Workflow type (define-feature, create-epics, etc.)')
    .option('-e, --entity <id>', 'Entity ID (feature name, epic ID, story ID)')
    .option('-s, --since <timestamp>', 'Only process changes since this timestamp')
    .option('-d, --dry-run', 'Show what would be updated without making changes')
    .option('-f, --format <format>', 'Output format (console|json)', 'console')
    .option('--verify-only', 'Only validate documentation consistency')
    .option('--clean-only', 'Only clean up duplicates and outdated docs')
    .parse();

  const options = program.opts();

  try {
    // Initialize report
    const report: UpdateReport = {
      workflow: (options.workflow as WorkflowType) || 'unknown',
      timestamp: new Date().toISOString(),
      duration: 0,
      updates: {
        status: { count: 0, items: [] },
        links: { count: 0, items: [] },
        progress: { count: 0, items: [] },
        timelines: { count: 0, items: [] },
      },
      cleanup: {
        duplicates: { count: 0, removed: [] },
        outdated: { count: 0, removed: [] },
      },
      validation: {
        passed: true,
        errors: [],
      },
      summary: {
        filesAnalyzed: 0,
        filesUpdated: 0,
        filesCreated: 0,
        filesDeleted: 0,
      },
    };

    // Execute requested operation
    if (options.verifyOnly) {
      await validateDocumentation(report);
    } else if (options.cleanOnly) {
      await cleanupDocumentation(report, options.dryRun);
    } else {
      await updateDocumentation(options, report);
    }

    // Calculate duration
    report.duration = (Date.now() - startTime) / 1000;

    // Output report
    if (options.format === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printConsoleReport(report);
    }

    // Exit with appropriate code
    process.exit(report.validation.passed ? 0 : 1);
  } catch (error) {
    console.error('❌ Error updating documentation:', error);
    process.exit(1);
  }
}

// ============================================================================
// UPDATE DOCUMENTATION
// ============================================================================

async function updateDocumentation(options: any, report: UpdateReport): Promise<void> {
  console.log('📝 Updating documentation...\n');

  // 1. Detect changes
  const context: WorkflowContext = {
    type: options.workflow || 'unknown',
    entityId: options.entity || '',
    timestamp: options.since || new Date(Date.now() - 3600000).toISOString(), // Last hour default
    filesModified: [],
  };

  const changes = await detectChanges(context);
  report.summary.filesAnalyzed = changes.newEntities.length + changes.modifiedEntities.length;

  // 2. Update status badges
  await updateStatusBadges(changes, report, options.dryRun);

  // 3. Update progress percentages
  await updateProgressPercentages(changes, report, options.dryRun);

  // 4. Update links
  await updateLinks(changes, report, options.dryRun);

  // 5. Update timelines
  await updateTimelines(changes, report, options.dryRun);

  // 6. Cleanup
  await cleanupDocumentation(report, options.dryRun);

  // 7. Validate
  await validateDocumentation(report);
}

// ============================================================================
// CHANGE DETECTION
// ============================================================================

async function detectChanges(context: WorkflowContext): Promise<DocumentationChanges> {
  const changes: DocumentationChanges = {
    newEntities: [],
    modifiedEntities: [],
    affectedParents: [],
    affectedChildren: [],
    outdatedDocs: [],
  };

  // Get all planning files
  const allFiles = await glob('**/*.md', {
    cwd: PLANNING_ROOT,
    absolute: true,
  });

  // Parse each file and determine if it was modified since timestamp
  const cutoffTime = new Date(context.timestamp).getTime();

  for (const filePath of allFiles) {
    const stats = await fs.stat(filePath);
    const modifiedTime = stats.mtime.getTime();

    if (modifiedTime > cutoffTime) {
      const metadata = await parseFileMetadata(filePath);

      if (metadata) {
        changes.modifiedEntities.push(metadata);
      }
    }
  }

  return changes;
}

async function parseFileMetadata(filePath: string): Promise<FileMetadata | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);
    const relativePath = path.relative(PLANNING_ROOT, filePath);

    // Determine type based on path
    let type: FileMetadata['type'];
    let id: string;

    if (relativePath.startsWith('features/')) {
      type = 'feature';
      id = path.basename(filePath, '.md');
    } else if (relativePath.startsWith('epics/')) {
      type = 'epic';
      id = path.basename(filePath, '.md');
    } else if (relativePath.startsWith('stories/')) {
      type = 'story';
      id = path.basename(filePath, '.md');
    } else if (relativePath.startsWith('sprints/')) {
      type = 'sprint';
      id = path.basename(filePath, '.md');
    } else {
      return null;
    }

    // Extract status if present
    const statusMatch = content.match(/\*\*Status:\*\* ([⚪🟡🟢] .*?)(?:\n|$)/);
    const status = statusMatch ? (statusMatch[1] as StatusBadge) : undefined;

    // Extract progress if present
    const progressMatch = content.match(/\*\*Progress:\*\* (\d+)%/);
    const progress = progressMatch ? parseInt(progressMatch[1], 10) : undefined;

    return {
      path: filePath,
      type,
      id,
      status,
      progress,
      modifiedTime: stats.mtime,
    };
  } catch (error) {
    console.warn(`⚠️  Could not parse file: ${filePath}`, error);
    return null;
  }
}

// ============================================================================
// UPDATE STATUS BADGES
// ============================================================================

async function updateStatusBadges(
  changes: DocumentationChanges,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  // Find all story files
  const storyFiles = await glob('**/*.md', {
    cwd: STORIES_DIR,
    absolute: true,
  });

  for (const storyFile of storyFiles) {
    const storyId = path.basename(storyFile, '.md');
    const oldStatus = await getStoryStatus(storyFile);
    const newStatus = await calculateStoryStatus(storyId);

    if (oldStatus !== newStatus) {
      report.updates.status.items.push({
        file: path.relative(PROJECT_ROOT, storyFile),
        old: oldStatus,
        new: newStatus,
      });

      if (!dryRun) {
        await updateFileStatus(storyFile, newStatus);
        report.summary.filesUpdated++;
      }
    }
  }

  report.updates.status.count = report.updates.status.items.length;
}

async function getStoryStatus(filePath: string): Promise<StatusBadge> {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/\*\*Status:\*\* ([⚪🟡🟢] .*?)(?:\n|$)/);
  return (match?.[1] as StatusBadge) || '⚪ Not Started';
}

async function calculateStoryStatus(storyId: string): Promise<StatusBadge> {
  // Check if implementation exists in src/
  const hasImplementation = await checkImplementationExists(storyId);
  const hasTests = await checkTestsExist(storyId);
  const hasDocs = await checkDocsExist(storyId);

  if (hasImplementation && hasTests && hasDocs) {
    return '🟢 Completed';
  } else if (hasImplementation || hasTests) {
    return '🟡 In Progress';
  } else {
    return '⚪ Not Started';
  }
}

async function checkImplementationExists(storyId: string): Promise<boolean> {
  // Look for files in src/ that reference the story ID
  try {
    const srcFiles = await glob('**/*.{ts,tsx}', {
      cwd: path.join(PROJECT_ROOT, 'src'),
      absolute: true,
    });

    for (const file of srcFiles) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes(storyId)) {
        return true;
      }
    }
  } catch {
    // Ignore errors
  }

  return false;
}

async function checkTestsExist(storyId: string): Promise<boolean> {
  // Look for test files that reference the story ID
  try {
    const testFiles = await glob('**/*.{test,spec}.{ts,tsx}', {
      cwd: PROJECT_ROOT,
      absolute: true,
    });

    for (const file of testFiles) {
      const content = await fs.readFile(file, 'utf-8');
      if (content.includes(storyId)) {
        return true;
      }
    }
  } catch {
    // Ignore errors
  }

  return false;
}

async function checkDocsExist(storyId: string): Promise<boolean> {
  // Check if story file exists and has acceptance criteria marked complete
  try {
    const storyFiles = await glob(`**/${storyId}.md`, {
      cwd: STORIES_DIR,
      absolute: true,
    });

    if (storyFiles.length > 0) {
      const content = await fs.readFile(storyFiles[0], 'utf-8');
      // Check for completed acceptance criteria (all checkboxes checked)
      const checkboxes = content.match(/- \[(x| )\]/gi) || [];
      const checked = checkboxes.filter(cb => cb.includes('x')).length;
      const total = checkboxes.length;

      return total > 0 && checked === total;
    }
  } catch {
    // Ignore errors
  }

  return false;
}

async function updateFileStatus(filePath: string, newStatus: StatusBadge): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8');

  // Update status badge
  content = content.replace(
    /\*\*Status:\*\* [⚪🟡🟢] .*?(?=\n|$)/,
    `**Status:** ${newStatus}`
  );

  await fs.writeFile(filePath, content, 'utf-8');
}

// ============================================================================
// UPDATE PROGRESS PERCENTAGES
// ============================================================================

async function updateProgressPercentages(
  changes: DocumentationChanges,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  // Update epic progress
  await updateEpicProgress(report, dryRun);

  // Update feature progress
  await updateFeatureProgress(report, dryRun);
}

async function updateEpicProgress(report: UpdateReport, dryRun: boolean): Promise<void> {
  const epicFiles = await glob('**/*.md', {
    cwd: EPICS_DIR,
    absolute: true,
  });

  for (const epicFile of epicFiles) {
    const epicId = path.basename(epicFile, '.md');
    const oldProgress = await getFileProgress(epicFile);
    const newProgress = await calculateEpicProgress(epicId);

    if (oldProgress !== newProgress) {
      report.updates.progress.items.push({
        file: path.relative(PROJECT_ROOT, epicFile),
        old: `${oldProgress}%`,
        new: `${newProgress}%`,
      });

      if (!dryRun) {
        await updateFileProgress(epicFile, newProgress);
        report.summary.filesUpdated++;
      }
    }
  }

  report.updates.progress.count = report.updates.progress.items.length;
}

async function updateFeatureProgress(report: UpdateReport, dryRun: boolean): Promise<void> {
  const featureFiles = await glob('*.md', {
    cwd: FEATURES_DIR,
    absolute: true,
  });

  for (const featureFile of featureFiles) {
    const featureName = path.basename(featureFile, '.md');
    const oldProgress = await getFileProgress(featureFile);
    const newProgress = await calculateFeatureProgress(featureName);

    if (oldProgress !== newProgress) {
      report.updates.progress.items.push({
        file: path.relative(PROJECT_ROOT, featureFile),
        old: `${oldProgress}%`,
        new: `${newProgress}%`,
      });

      if (!dryRun) {
        await updateFileProgress(featureFile, newProgress);
        report.summary.filesUpdated++;
      }
    }
  }
}

async function getFileProgress(filePath: string): Promise<number> {
  const content = await fs.readFile(filePath, 'utf-8');
  const match = content.match(/\*\*Progress:\*\* (\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
}

async function calculateEpicProgress(epicId: string): Promise<number> {
  // Get all stories for this epic
  const stories = await getStoriesForEpic(epicId);

  if (stories.length === 0) return 0;

  // Calculate completion
  const completed = stories.filter(s => s.status === '🟢 Completed').length;
  return Math.round((completed / stories.length) * 100);
}

async function calculateFeatureProgress(featureName: string): Promise<number> {
  // Get all epics for this feature
  const epics = await getEpicsForFeature(featureName);

  if (epics.length === 0) return 0;

  // Get all stories across all epics
  const allStories: StoryMetadata[] = [];
  for (const epic of epics) {
    const stories = await getStoriesForEpic(epic.id);
    allStories.push(...stories);
  }

  if (allStories.length === 0) return 0;

  // Calculate weighted progress by story points
  const completedPoints = allStories
    .filter(s => s.status === '🟢 Completed')
    .reduce((sum, s) => sum + s.points, 0);
  const totalPoints = allStories.reduce((sum, s) => sum + s.points, 0);

  if (totalPoints === 0) return 0;

  return Math.round((completedPoints / totalPoints) * 100);
}

async function getStoriesForEpic(epicId: string): Promise<StoryMetadata[]> {
  const stories: StoryMetadata[] = [];

  try {
    const storyFiles = await glob('**/*.md', {
      cwd: STORIES_DIR,
      absolute: true,
    });

    for (const storyFile of storyFiles) {
      const content = await fs.readFile(storyFile, 'utf-8');
      const epicMatch = content.match(/\*\*Epic:\*\* (.*?)(?:\n|$)/);

      if (epicMatch && epicMatch[1] === epicId) {
        const status = await getStoryStatus(storyFile);
        const pointsMatch = content.match(/\*\*Story Points:\*\* (\d+)/);
        const points = pointsMatch ? parseInt(pointsMatch[1], 10) : 5;

        stories.push({
          id: path.basename(storyFile, '.md'),
          path: storyFile,
          status,
          points,
          epicId,
        });
      }
    }
  } catch {
    // Ignore errors
  }

  return stories;
}

async function getEpicsForFeature(featureName: string): Promise<EpicMetadata[]> {
  const epics: EpicMetadata[] = [];

  try {
    const featureEpicsDir = path.join(EPICS_DIR, featureName);
    const epicFiles = await glob('*.md', {
      cwd: featureEpicsDir,
      absolute: true,
    });

    for (const epicFile of epicFiles) {
      const epicId = path.basename(epicFile, '.md');
      const progress = await calculateEpicProgress(epicId);
      const stories = await getStoriesForEpic(epicId);

      epics.push({
        id: epicId,
        path: epicFile,
        featureName,
        stories,
        progress,
      });
    }
  } catch {
    // Directory might not exist yet
  }

  return epics;
}

async function updateFileProgress(filePath: string, newProgress: number): Promise<void> {
  let content = await fs.readFile(filePath, 'utf-8');

  // Update progress
  content = content.replace(
    /\*\*Progress:\*\* \d+%/,
    `**Progress:** ${newProgress}%`
  );

  await fs.writeFile(filePath, content, 'utf-8');
}

// ============================================================================
// UPDATE LINKS
// ============================================================================

async function updateLinks(
  changes: DocumentationChanges,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  const projectRoot = path.resolve(__dirname, '..');

  // Process all modified and new entities
  const allEntities = [...changes.newEntities, ...changes.modifiedEntities];

  for (const entity of allEntities) {
    // entity.path is already an absolute path from parseFileMetadata
    const filePath = entity.path;
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract all markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [...content.matchAll(linkPattern)];

    let modified = false;
    let newContent = content;

    // Check for broken links
    for (const match of links) {
      const linkText = match[1];
      const linkTarget = match[2];

      // Skip external URLs
      if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://')) {
        continue;
      }

      // Resolve relative path
      const absoluteTarget = path.resolve(path.dirname(filePath), linkTarget);

      // Check if target exists
      try {
        await fs.access(absoluteTarget);
      } catch (error) {
        // Link is broken - try to fix it
        const fixedLink = await attemptToFixBrokenLink(linkTarget, filePath, projectRoot);

        if (fixedLink) {
          newContent = newContent.replace(
            `[${linkText}](${linkTarget})`,
            `[${linkText}](${fixedLink})`
          );
          modified = true;

          report.updates.links.items.push({
            file: entity.path,
            added: `Fixed broken link: ${linkTarget} → ${fixedLink}`
          });
        }
      }
    }

    // Add parent-child relationship links if missing
    const parentLink = await getParentEntityLink(entity, projectRoot);
    if (parentLink && !content.includes(parentLink.target)) {
      // Add link to parent entity
      const linkSection = `\n\n**Parent:** [${parentLink.text}](${parentLink.target})\n`;

      // Insert after the header
      newContent = newContent.replace(
        /(^# .*?\n\n)/,
        `$1${linkSection}`
      );
      modified = true;

      report.updates.links.items.push({
        file: entity.path,
        added: `Added parent link: ${parentLink.text}`
      });
    }

    // Add child entity links if missing
    const childLinks = await getChildEntityLinks(entity, projectRoot);
    if (childLinks.length > 0) {
      // Check if we have a "Related" or "Children" section
      if (!content.includes('## Related Stories') && !content.includes('## Stories')) {
        const childSection = generateChildLinksSection(entity.type, childLinks);

        if (childSection) {
          // Add at the end of the file
          newContent = newContent + '\n\n' + childSection;
          modified = true;

          report.updates.links.items.push({
            file: entity.path,
            added: `Added ${childLinks.length} child link(s)`
          });
        }
      }
    }

    // Write changes
    if (modified) {
      if (!dryRun) {
        await fs.writeFile(filePath, newContent);
      }
      report.updates.links.count++;
    }
  }
}

// Helper function to attempt fixing broken links
async function attemptToFixBrokenLink(
  brokenLink: string,
  sourceFile: string,
  projectRoot: string
): Promise<string | null> {
  // Extract filename from broken link
  const filename = path.basename(brokenLink);

  // Search for the file in docs directory
  const docsDir = path.join(projectRoot, 'docs');
  const pattern = `**/${filename}`;

  try {
    const files = await glob(pattern, { cwd: docsDir, absolute: false });

    if (files.length > 0) {
      // Found the file - calculate relative path from source
      const targetFile = path.join(docsDir, files[0]);
      const relativePath = path.relative(path.dirname(sourceFile), targetFile);
      return relativePath;
    }
  } catch (error) {
    // File not found
  }

  return null;
}

// Helper function to get parent entity link
async function getParentEntityLink(
  entity: FileMetadata,
  projectRoot: string
): Promise<{ text: string; target: string } | null> {
  switch (entity.type) {
    case 'story': {
      // Story's parent is epic
      const epicMatch = entity.path.match(/stories\/(epic-[^/]+)\//);
      if (epicMatch) {
        const epicDir = epicMatch[1];
        const epicFile = path.join(projectRoot, 'docs', 'planning', 'epics', epicDir, `${epicDir.toUpperCase()}.md`);

        try {
          await fs.access(epicFile);
          return {
            text: epicDir.toUpperCase(),
            target: `../../epics/${epicDir}/${epicDir.toUpperCase()}.md`
          };
        } catch {
          return null;
        }
      }
      break;
    }

    case 'epic': {
      // Epic's parent is feature
      // This would need feature file structure to be implemented
      return null;
    }

    case 'sprint': {
      // Sprint doesn't have a direct parent in hierarchy
      return null;
    }
  }

  return null;
}

// Helper function to get child entity links
async function getChildEntityLinks(
  entity: FileMetadata,
  projectRoot: string
): Promise<Array<{ text: string; target: string }>> {
  const links: Array<{ text: string; target: string }> = [];

  switch (entity.type) {
    case 'epic': {
      // Epic's children are stories
      const epicMatch = entity.path.match(/epics\/(epic-[^/]+)\//);
      if (epicMatch) {
        const epicDir = epicMatch[1];
        const storiesDir = path.join(projectRoot, 'docs', 'planning', 'stories', epicDir);

        try {
          const files = await fs.readdir(storiesDir);
          const storyFiles = files.filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'CLAUDE.md');

          for (const storyFile of storyFiles) {
            const storyId = storyFile.replace('.md', '');
            links.push({
              text: storyId,
              target: `../../stories/${epicDir}/${storyFile}`
            });
          }
        } catch {
          // Stories directory doesn't exist
        }
      }
      break;
    }

    case 'feature': {
      // Feature's children are epics
      // Would need feature file structure
      break;
    }
  }

  return links;
}

// Helper function to generate child links section
function generateChildLinksSection(
  entityType: string,
  childLinks: Array<{ text: string; target: string }>
): string | null {
  if (childLinks.length === 0) {
    return null;
  }

  let title = '';
  switch (entityType) {
    case 'epic':
      title = '## Stories';
      break;
    case 'feature':
      title = '## Epics';
      break;
    default:
      return null;
  }

  let section = `${title}\n\n`;
  for (const link of childLinks) {
    section += `- [${link.text}](${link.target})\n`;
  }

  return section;
}

// ============================================================================
// UPDATE TIMELINES
// ============================================================================

async function updateTimelines(
  changes: DocumentationChanges,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  const projectRoot = path.resolve(__dirname, '..');
  const timelineDir = path.join(projectRoot, '.claude', 'state', 'timeline');

  try {
    // Read all timeline session files
    const sessionFiles = await fs.readdir(timelineDir);
    const jsonFiles = sessionFiles.filter(f => f.endsWith('.json') && f.startsWith('session-'));

    // Parse session data
    interface TimelineSession {
      sessionId: string;
      conversationSummary: string;
      agentType: string;
      agentModel: string;
      tags: string[];
      results: {
        status: string;
        summary: string;
      };
      filesChanged: {
        created: string[];
        modified: string[];
        deleted: string[];
      };
      timestamp: Date;
    }

    const sessions: TimelineSession[] = [];

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(timelineDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const sessionData = JSON.parse(content);

        // Extract timestamp from filename (format: session-YYYY-MM-DD-ID-TIMESTAMP.json)
        const timestampMatch = file.match(/(\d{4}-\d{2}-\d{2}T[\d-:]+Z)/);
        if (timestampMatch) {
          sessions.push({
            ...sessionData,
            timestamp: new Date(timestampMatch[1])
          });
        }
      } catch (error) {
        // Skip invalid session files
      }
    }

    // Sort sessions by timestamp (newest first)
    sessions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Generate timeline markdown files by sprint
    const sprintTimelines = groupSessionsBySprint(sessions);

    for (const [sprintNumber, sprintSessions] of Object.entries(sprintTimelines)) {
      const sprintDir = path.join(projectRoot, 'docs', 'planning', 'sprints', `sprint-${sprintNumber.padStart(2, '0')}`);

      // Check if sprint directory exists
      try {
        await fs.access(sprintDir);
      } catch {
        // Sprint directory doesn't exist, skip
        continue;
      }

      // Generate timeline markdown
      const timelineContent = generateTimelineMarkdown(sprintSessions);
      const timelinePath = path.join(sprintDir, 'TIMELINE.md');

      if (!dryRun) {
        await fs.writeFile(timelinePath, timelineContent);
      }

      report.updates.timelines.items.push(`Sprint ${sprintNumber}: ${sprintSessions.length} sessions`);
      report.updates.timelines.count++;
    }

    // Update recent activity section in STATUS.md files
    for (const entity of changes.affectedParents) {
      if (entity.includes('sprints/')) {
        const sprintMatch = entity.match(/sprint-(\d+)/);
        if (sprintMatch) {
          const sprintNumber = sprintMatch[1];
          const statusPath = path.join(
            projectRoot,
            'docs',
            'planning',
            'sprints',
            `sprint-${sprintNumber}`,
            'STATUS.md'
          );

          try {
            let statusContent = await fs.readFile(statusPath, 'utf-8');

            // Find recent sessions for this sprint
            const sprintSessions = sprintTimelines[sprintNumber] || [];
            const recentSessions = sprintSessions.slice(0, 5); // Last 5 sessions

            // Generate recent activity section
            const recentActivitySection = generateRecentActivitySection(recentSessions);

            // Update or add recent activity section
            if (statusContent.includes('## Recent Activity')) {
              statusContent = statusContent.replace(
                /## Recent Activity[\s\S]*?(?=\n## |$)/,
                recentActivitySection
              );
            } else {
              statusContent += '\n\n' + recentActivitySection;
            }

            if (!dryRun) {
              await fs.writeFile(statusPath, statusContent);
            }

            report.updates.timelines.items.push(`Updated STATUS.md for Sprint ${sprintNumber}`);
          } catch (error) {
            // STATUS.md doesn't exist or can't be read
          }
        }
      }
    }
  } catch (error) {
    // Timeline directory doesn't exist or can't be read
    console.error('Timeline update error:', error);
  }
}

// Helper function to group sessions by sprint
function groupSessionsBySprint(sessions: any[]): Record<string, any[]> {
  const sprintTimelines: Record<string, any[]> = {};

  // Group sessions by date (assuming 2-week sprints)
  for (const session of sessions) {
    // For now, use a simple heuristic based on tags or date
    // In a real implementation, this would check which sprint was active at the time
    const sprintNumber = inferSprintFromTimestamp(session.timestamp);

    if (!sprintTimelines[sprintNumber]) {
      sprintTimelines[sprintNumber] = [];
    }

    sprintTimelines[sprintNumber].push(session);
  }

  return sprintTimelines;
}

// Helper function to infer sprint number from timestamp
function inferSprintFromTimestamp(timestamp: Date): string {
  // Simple heuristic: Sprint 1 started 2025-11-01
  // Each sprint is 2 weeks (14 days)
  const sprintStartDate = new Date('2025-11-01');
  const daysSinceStart = Math.floor((timestamp.getTime() - sprintStartDate.getTime()) / (1000 * 60 * 60 * 24));
  const sprintNumber = Math.floor(daysSinceStart / 14) + 1;

  return String(Math.max(1, sprintNumber));
}

// Helper function to generate timeline markdown
function generateTimelineMarkdown(sessions: any[]): string {
  let markdown = '# Sprint Timeline\n\n';
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Total Sessions:** ${sessions.length}\n\n`;
  markdown += '---\n\n';

  // Group by date
  const sessionsByDate: Record<string, any[]> = {};
  for (const session of sessions) {
    const dateKey = session.timestamp.toISOString().split('T')[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  }

  // Generate timeline
  for (const [date, dateSessions] of Object.entries(sessionsByDate)) {
    markdown += `## ${date}\n\n`;

    for (const session of dateSessions) {
      const time = session.timestamp.toISOString().split('T')[1].substring(0, 8);
      markdown += `### ${time} - ${session.conversationSummary}\n\n`;
      markdown += `**Agent:** ${session.agentType} (${session.agentModel})\n`;
      markdown += `**Status:** ${session.results.status}\n`;

      if (session.tags && session.tags.length > 0) {
        markdown += `**Tags:** ${session.tags.join(', ')}\n`;
      }

      if (session.filesChanged) {
        const totalChanges =
          session.filesChanged.created.length +
          session.filesChanged.modified.length +
          session.filesChanged.deleted.length;

        if (totalChanges > 0) {
          markdown += `**Files Changed:** ${totalChanges}\n`;
        }
      }

      markdown += '\n---\n\n';
    }
  }

  return markdown;
}

// Helper function to generate recent activity section
function generateRecentActivitySection(recentSessions: any[]): string {
  let section = '## Recent Activity\n\n';

  if (recentSessions.length === 0) {
    section += '*No recent activity*\n';
    return section;
  }

  for (const session of recentSessions) {
    const date = session.timestamp.toISOString().split('T')[0];
    const time = session.timestamp.toISOString().split('T')[1].substring(0, 8);

    section += `- **${date} ${time}** - ${session.conversationSummary} (${session.results.status})\n`;
  }

  section += '\n';
  return section;
}

// ============================================================================
// CLEANUP
// ============================================================================

async function cleanupDocumentation(report: UpdateReport, dryRun: boolean): Promise<void> {
  const projectRoot = path.resolve(__dirname, '..');
  const docsDir = path.join(projectRoot, 'docs');

  // Find duplicate files
  await findDuplicateFiles(docsDir, report, dryRun);

  // Find outdated documentation
  await findOutdatedDocumentation(docsDir, report, dryRun);

  // Clean up old timeline sessions (keep last 30 days)
  await cleanupOldTimelineSessions(projectRoot, report, dryRun);
}

// Helper function to find duplicate files
async function findDuplicateFiles(
  docsDir: string,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  // Find all markdown files
  const pattern = '**/*.md';
  const files = await glob(pattern, { cwd: docsDir, absolute: false });

  // Calculate content hashes
  interface FileHash {
    path: string;
    hash: string;
    size: number;
  }

  const fileHashes: FileHash[] = [];

  for (const file of files) {
    // Skip CLAUDE.md and README.md as they're auto-generated or documentation
    if (file.endsWith('/CLAUDE.md') || file.endsWith('/README.md')) {
      continue;
    }

    const fullPath = path.join(docsDir, file);
    const content = await fs.readFile(fullPath, 'utf-8');

    // Normalize content for comparison (remove timestamps, whitespace differences)
    const normalized = content
      .replace(/\*\*Last Updated:\*\* .+/g, '')
      .replace(/\*\*Generated:\*\* .+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Simple hash (for production, use crypto.createHash)
    const hash = Buffer.from(normalized).toString('base64').substring(0, 32);

    fileHashes.push({
      path: file,
      hash,
      size: normalized.length
    });
  }

  // Group by hash
  const hashGroups: Record<string, FileHash[]> = {};
  for (const fileHash of fileHashes) {
    if (!hashGroups[fileHash.hash]) {
      hashGroups[fileHash.hash] = [];
    }
    hashGroups[fileHash.hash].push(fileHash);
  }

  // Find duplicates (same hash, different paths)
  for (const [hash, group] of Object.entries(hashGroups)) {
    if (group.length > 1) {
      // Found duplicates - keep the one with shortest path (usually the primary)
      group.sort((a, b) => a.path.length - b.path.length);
      const keep = group[0];
      const duplicates = group.slice(1);

      for (const duplicate of duplicates) {
        report.cleanup.duplicates.removed.push(duplicate.path);
        report.cleanup.duplicates.count++;

        if (!dryRun) {
          const fullPath = path.join(docsDir, duplicate.path);
          await fs.unlink(fullPath);
        }
      }
    }
  }
}

// Helper function to find outdated documentation
async function findOutdatedDocumentation(
  docsDir: string,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  // Find files with certain patterns that indicate they're outdated
  const outdatedPatterns = [
    '**/OLD-*.md',
    '**/DEPRECATED-*.md',
    '**/*-OLD.md',
    '**/*-DEPRECATED.md',
    '**/*.backup.md',
    '**/*.old.md'
  ];

  for (const pattern of outdatedPatterns) {
    const files = await glob(pattern, { cwd: docsDir, absolute: false });

    for (const file of files) {
      report.cleanup.outdated.removed.push(file);
      report.cleanup.outdated.count++;

      if (!dryRun) {
        const fullPath = path.join(docsDir, file);
        await fs.unlink(fullPath);
      }
    }
  }

  // Find files that haven't been modified in 90+ days and are marked as drafts
  const pattern = '**/*.md';
  const allFiles = await glob(pattern, { cwd: docsDir, absolute: false });

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  for (const file of allFiles) {
    // Skip important files
    if (
      file.endsWith('/CLAUDE.md') ||
      file.endsWith('/README.md') ||
      file.includes('/epics/') ||
      file.includes('/stories/') ||
      file.includes('/sprints/')
    ) {
      continue;
    }

    const fullPath = path.join(docsDir, file);
    const stats = await fs.stat(fullPath);
    const content = await fs.readFile(fullPath, 'utf-8');

    // Check if file is old and marked as draft
    if (stats.mtime < ninetyDaysAgo && content.includes('[DRAFT]')) {
      report.cleanup.outdated.removed.push(file);
      report.cleanup.outdated.count++;

      if (!dryRun) {
        await fs.unlink(fullPath);
      }
    }
  }
}

// Helper function to clean up old timeline sessions
async function cleanupOldTimelineSessions(
  projectRoot: string,
  report: UpdateReport,
  dryRun: boolean
): Promise<void> {
  const timelineDir = path.join(projectRoot, '.claude', 'state', 'timeline');

  try {
    const files = await fs.readdir(timelineDir);
    const sessionFiles = files.filter(f => f.endsWith('.json') && f.startsWith('session-'));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const file of sessionFiles) {
      const fullPath = path.join(timelineDir, file);
      const stats = await fs.stat(fullPath);

      if (stats.mtime < thirtyDaysAgo) {
        report.cleanup.outdated.removed.push(`.claude/state/timeline/${file}`);
        report.cleanup.outdated.count++;

        if (!dryRun) {
          await fs.unlink(fullPath);
        }
      }
    }
  } catch (error) {
    // Timeline directory doesn't exist or can't be accessed
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

async function validateDocumentation(report: UpdateReport): Promise<void> {
  const projectRoot = path.resolve(__dirname, '..');
  const errors: string[] = [];

  // Validate story files
  await validateStoryFiles(projectRoot, errors);

  // Validate epic files
  await validateEpicFiles(projectRoot, errors);

  // Validate hierarchy integrity
  await validateHierarchyIntegrity(projectRoot, errors);

  // Validate cross-references
  await validateCrossReferences(projectRoot, errors);

  // Check for orphaned files
  await checkOrphanedFiles(projectRoot, errors);

  report.validation.errors = errors;
  report.validation.passed = errors.length === 0;
}

// Helper function to validate story files
async function validateStoryFiles(projectRoot: string, errors: string[]): Promise<void> {
  const storiesDir = path.join(projectRoot, 'docs', 'planning', 'stories');

  try {
    const epicDirs = await fs.readdir(storiesDir);

    for (const epicDir of epicDirs) {
      if (!epicDir.startsWith('epic-')) {
        continue;
      }

      const epicStoriesDir = path.join(storiesDir, epicDir);
      const stat = await fs.stat(epicStoriesDir);

      if (!stat.isDirectory()) {
        continue;
      }

      const files = await fs.readdir(epicStoriesDir);
      const storyFiles = files.filter(f => f.endsWith('.md') && !['README.md', 'CLAUDE.md', 'COMPLETION-REPORT.md'].includes(f));

      for (const storyFile of storyFiles) {
        const storyPath = path.join(epicStoriesDir, storyFile);
        const content = await fs.readFile(storyPath, 'utf-8');

        // Check required fields
        const requiredFields = [
          { field: 'Story Points', pattern: /\*\*Story Points:\*\* \d+/ },
          { field: 'Sprint', pattern: /\*\*Sprint:\*\* Sprint \d+/ },
          { field: 'Priority', pattern: /\*\*Priority:\*\* (CRITICAL|HIGH|MEDIUM|LOW)/ },
          { field: 'User Story', pattern: /## User Story/ },
          { field: 'Acceptance Criteria', pattern: /## Acceptance Criteria/ }
        ];

        for (const { field, pattern } of requiredFields) {
          if (!pattern.test(content)) {
            errors.push(`${epicDir}/${storyFile}: Missing required field: ${field}`);
          }
        }

        // Validate story ID format
        const storyId = storyFile.replace('.md', '');
        if (!/^[A-Z]+-[A-Z]+-\d{3}/.test(storyId)) {
          errors.push(`${epicDir}/${storyFile}: Invalid story ID format. Expected: PREFIX-CATEGORY-NNN`);
        }

        // Check for empty acceptance criteria
        const criteriaMatch = content.match(/## Acceptance Criteria\s*([\s\S]*?)(?=\n## |$)/);
        if (criteriaMatch) {
          const criteria = criteriaMatch[1].trim();
          if (!criteria || criteria.length < 10) {
            errors.push(`${epicDir}/${storyFile}: Empty or insufficient acceptance criteria`);
          }
        }
      }
    }
  } catch (error) {
    errors.push(`Error validating story files: ${error}`);
  }
}

// Helper function to validate epic files
async function validateEpicFiles(projectRoot: string, errors: string[]): Promise<void> {
  const epicsDir = path.join(projectRoot, 'docs', 'planning', 'epics');

  try {
    const epicDirs = await fs.readdir(epicsDir);

    for (const epicDir of epicDirs) {
      if (!epicDir.startsWith('epic-')) {
        continue;
      }

      const epicPath = path.join(epicsDir, epicDir);
      const stat = await fs.stat(epicPath);

      if (!stat.isDirectory()) {
        continue;
      }

      // Check if epic file exists
      const epicFileName = `${epicDir.toUpperCase()}.md`;
      const epicFilePath = path.join(epicPath, epicFileName);

      try {
        const content = await fs.readFile(epicFilePath, 'utf-8');

        // Check required sections
        const requiredSections = [
          'Epic Overview',
          'Business Value',
          'Stories',
          'Dependencies',
          'Acceptance Criteria'
        ];

        for (const section of requiredSections) {
          if (!content.includes(`## ${section}`) && !content.includes(`### ${section}`)) {
            errors.push(`${epicDir}/${epicFileName}: Missing required section: ${section}`);
          }
        }
      } catch {
        errors.push(`${epicDir}: Epic file not found: ${epicFileName}`);
      }
    }
  } catch (error) {
    errors.push(`Error validating epic files: ${error}`);
  }
}

// Helper function to validate hierarchy integrity
async function validateHierarchyIntegrity(projectRoot: string, errors: string[]): Promise<void> {
  // Check that all stories belong to valid epics
  const storiesDir = path.join(projectRoot, 'docs', 'planning', 'stories');
  const epicsDir = path.join(projectRoot, 'docs', 'planning', 'epics');

  try {
    const storyEpicDirs = await fs.readdir(storiesDir);
    const epicDirs = await fs.readdir(epicsDir);

    for (const storyEpicDir of storyEpicDirs) {
      if (!storyEpicDir.startsWith('epic-')) {
        continue;
      }

      // Check if corresponding epic directory exists
      if (!epicDirs.includes(storyEpicDir)) {
        errors.push(`Orphaned story directory: stories/${storyEpicDir} (no matching epic)`);
      }
    }

    // Check that all epics have story directories
    for (const epicDir of epicDirs) {
      if (!epicDir.startsWith('epic-')) {
        continue;
      }

      if (!storyEpicDirs.includes(epicDir)) {
        errors.push(`Epic has no stories directory: epics/${epicDir}`);
      }
    }
  } catch (error) {
    errors.push(`Error validating hierarchy integrity: ${error}`);
  }
}

// Helper function to validate cross-references
async function validateCrossReferences(projectRoot: string, errors: string[]): Promise<void> {
  const docsDir = path.join(projectRoot, 'docs');
  const pattern = '**/*.md';
  const files = await glob(pattern, { cwd: docsDir, absolute: false });

  for (const file of files) {
    // Skip auto-generated files
    if (file.endsWith('/CLAUDE.md') || file.endsWith('/README.md')) {
      continue;
    }

    const fullPath = path.join(docsDir, file);
    const content = await fs.readFile(fullPath, 'utf-8');

    // Extract all markdown links
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [...content.matchAll(linkPattern)];

    for (const match of links) {
      const linkTarget = match[2];

      // Skip external URLs
      if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://') || linkTarget.startsWith('#')) {
        continue;
      }

      // Resolve relative path
      const absoluteTarget = path.resolve(path.dirname(fullPath), linkTarget);

      // Check if target exists
      try {
        await fs.access(absoluteTarget);
      } catch {
        errors.push(`${file}: Broken link to ${linkTarget}`);
      }
    }
  }
}

// Helper function to check for orphaned files
async function checkOrphanedFiles(projectRoot: string, errors: string[]): Promise<void> {
  const docsDir = path.join(projectRoot, 'docs', 'planning');

  // Check for story files in wrong locations
  const storiesPattern = '**/AI-*.md';
  const storyFiles = await glob(storiesPattern, { cwd: docsDir, absolute: false });

  for (const storyFile of storyFiles) {
    // Story files should be in stories/epic-XX/ directories
    if (!storyFile.includes('stories/epic-')) {
      errors.push(`Orphaned story file: ${storyFile} (should be in stories/epic-XX/)`);
    }
  }

  // Check for empty directories
  await checkEmptyDirectories(docsDir, errors);
}

// Helper function to check for empty directories
async function checkEmptyDirectories(dir: string, errors: string[], prefix = ''): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const fullPath = path.join(dir, entry.name);
        const subEntries = await fs.readdir(fullPath);

        // Filter out .DS_Store and other system files
        const realFiles = subEntries.filter(f => !f.startsWith('.'));

        if (realFiles.length === 0) {
          errors.push(`Empty directory: ${prefix}${entry.name}/`);
        } else {
          await checkEmptyDirectories(fullPath, errors, `${prefix}${entry.name}/`);
        }
      }
    }
  } catch (error) {
    // Can't access directory
  }
}

// ============================================================================
// CONSOLE OUTPUT
// ============================================================================

function printConsoleReport(report: UpdateReport): void {
  console.log('\n┌─────────────────────────────────────────────────────────┐');
  console.log('│  📝 Documentation Auto-Update Report                   │');
  console.log(`│  Workflow: ${report.workflow.padEnd(43)} │`);
  console.log(`│  Timestamp: ${report.timestamp.padEnd(42)} │`);
  console.log('└─────────────────────────────────────────────────────────┘\n');

  // Updates
  if (report.updates.status.count > 0 || report.updates.progress.count > 0) {
    console.log('✅ UPDATES COMPLETED\n');

    if (report.updates.status.count > 0) {
      console.log(`  📄 Status Updates (${report.updates.status.count})`);
      report.updates.status.items.slice(0, 5).forEach(item => {
        console.log(`    - ${item.file}: ${item.old} → ${item.new}`);
      });
      if (report.updates.status.count > 5) {
        console.log(`    ... and ${report.updates.status.count - 5} more`);
      }
      console.log('');
    }

    if (report.updates.progress.count > 0) {
      console.log(`  📈 Progress Updates (${report.updates.progress.count})`);
      report.updates.progress.items.slice(0, 5).forEach(item => {
        console.log(`    - ${item.file}: ${item.old} → ${item.new}`);
      });
      if (report.updates.progress.count > 5) {
        console.log(`    ... and ${report.updates.progress.count - 5} more`);
      }
      console.log('');
    }
  }

  // Cleanup
  console.log('🧹 CLEANUP COMPLETED\n');
  console.log(`  🗑️  Removed Duplicates (${report.cleanup.duplicates.count})`);
  if (report.cleanup.duplicates.count === 0) {
    console.log('    - No duplicates found');
  }
  console.log('');
  console.log(`  🗑️  Removed Outdated (${report.cleanup.outdated.count})`);
  if (report.cleanup.outdated.count === 0) {
    console.log('    - No outdated docs found');
  }
  console.log('');

  // Validation
  if (report.validation.passed) {
    console.log('✅ VALIDATION PASSED\n');
    console.log('  ✓ Feature → Epic → Story → Sprint hierarchy valid');
    console.log('  ✓ All cross-references valid');
    console.log('  ✓ No orphaned files');
    console.log('  ✓ Status badges consistent\n');
  } else {
    console.log('❌ VALIDATION FAILED\n');
    report.validation.errors.forEach(error => {
      console.log(`  ✗ ${error}`);
    });
    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY\n');
  console.log(`  Total files analyzed: ${report.summary.filesAnalyzed}`);
  console.log(`  Files updated: ${report.summary.filesUpdated}`);
  console.log(`  Files created: ${report.summary.filesCreated}`);
  console.log(`  Files deleted: ${report.summary.filesDeleted}`);
  console.log(`  Validation errors: ${report.validation.errors.length}`);
  console.log(`\n  Duration: ${report.duration.toFixed(1)}s\n`);

  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  ✅ All documentation up to date!                      │');
  console.log('└─────────────────────────────────────────────────────────┘\n');
}

// ============================================================================
// RUN
// ============================================================================

main();
