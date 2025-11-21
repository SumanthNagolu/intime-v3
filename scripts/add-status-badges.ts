#!/usr/bin/env tsx

/**
 * Add Status Badges to Story Files
 *
 * Adds "**Status:** ⚪ Not Started" badge to all story files that don't have one.
 * This is required for the auto-update documentation system to work properly.
 *
 * Usage:
 *   pnpm tsx scripts/add-status-badges.ts
 *   pnpm tsx scripts/add-status-badges.ts --dry-run
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ProcessResult {
  totalFiles: number;
  filesUpdated: number;
  filesSkipped: number;
  errors: string[];
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  console.log('\n┌─────────────────────────────────────────────────────────┐');
  console.log('│  📝 Add Status Badges to Story Files                   │');
  console.log(`│  Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}                                         │`);
  console.log('└─────────────────────────────────────────────────────────┘\n');

  const projectRoot = path.resolve(__dirname, '..');
  const storiesDir = path.join(projectRoot, 'docs', 'planning', 'stories');

  const result: ProcessResult = {
    totalFiles: 0,
    filesUpdated: 0,
    filesSkipped: 0,
    errors: []
  };

  try {
    // Find all epic directories
    const epicDirs = await fs.readdir(storiesDir);

    for (const epicDir of epicDirs) {
      if (!epicDir.startsWith('epic-')) {
        continue;
      }

      const epicPath = path.join(storiesDir, epicDir);
      const stat = await fs.stat(epicPath);

      if (!stat.isDirectory()) {
        continue;
      }

      // Process story files in this epic
      const files = await fs.readdir(epicPath);
      const storyFiles = files.filter(
        f =>
          f.endsWith('.md') &&
          !['README.md', 'CLAUDE.md', 'COMPLETION-REPORT.md'].includes(f)
      );

      for (const storyFile of storyFiles) {
        const storyPath = path.join(epicPath, storyFile);
        result.totalFiles++;

        try {
          let content = await fs.readFile(storyPath, 'utf-8');

          // Check if file already has status badge
          if (content.includes('**Status:**')) {
            console.log(`✓ ${epicDir}/${storyFile} - Already has status badge`);
            result.filesSkipped++;
            continue;
          }

          // Add status badge after the header
          // Pattern: Find first header, then add status badge after it
          const lines = content.split('\n');
          let insertIndex = -1;

          // Find the first header line
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('# ')) {
              insertIndex = i + 1;
              break;
            }
          }

          if (insertIndex === -1) {
            result.errors.push(`${epicDir}/${storyFile}: No header found`);
            console.log(`✗ ${epicDir}/${storyFile} - No header found`);
            continue;
          }

          // Insert status badge
          lines.splice(insertIndex, 0, '', '**Status:** ⚪ Not Started');
          const newContent = lines.join('\n');

          if (!dryRun) {
            await fs.writeFile(storyPath, newContent);
          }

          console.log(`✓ ${epicDir}/${storyFile} - Added status badge`);
          result.filesUpdated++;
        } catch (error) {
          result.errors.push(`${epicDir}/${storyFile}: ${error}`);
          console.log(`✗ ${epicDir}/${storyFile} - Error: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error('Error processing story files:', error);
    process.exit(1);
  }

  // Print summary
  console.log('\n┌─────────────────────────────────────────────────────────┐');
  console.log('│  📊 Summary                                             │');
  console.log('└─────────────────────────────────────────────────────────┘\n');
  console.log(`Total files: ${result.totalFiles}`);
  console.log(`Files updated: ${result.filesUpdated}`);
  console.log(`Files skipped: ${result.filesSkipped}`);
  console.log(`Errors: ${result.errors.length}`);

  if (result.errors.length > 0) {
    console.log('\n❌ Errors:\n');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }

  if (dryRun) {
    console.log('\n💡 This was a dry run. No files were modified.');
    console.log('   Run without --dry-run to apply changes.\n');
  } else {
    console.log('\n✅ Status badges added successfully!\n');
  }
}

main().catch(console.error);
