#!/usr/bin/env node
/**
 * Generate CLAUDE.md files for each directory
 *
 * This script creates folder-specific documentation that includes:
 * - Purpose and description
 * - File listing with descriptions
 * - Dependencies and relationships
 * - Change log
 * - Quick start guides
 */

import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

interface DirectoryConfig {
  path: string;
  name: string;
  description: string;
  keyPoints: string[];
  dependencies: string[];
  dependents: string[];
  developerGuide: string;
  agentGuide: string;
  importantNotes: string[];
}

/**
 * Directory configurations
 */
const directoryConfigs: DirectoryConfig[] = [
  {
    path: '.claude/orchestration/core',
    name: 'Core Components',
    description: 'Core orchestration system components that power the multi-agent workflow engine.',
    keyPoints: [
      'Agent execution and tool calling',
      'MCP integration (14 filesystem tools)',
      'Custom validation tools (4 tools)',
      'Workflow orchestration (sequential & parallel)',
      'State management and persistence',
      'Cost tracking and optimization',
    ],
    dependencies: [
      '@anthropic-ai/sdk - Claude API',
      '@modelcontextprotocol/sdk - MCP integration',
    ],
    dependents: [
      '../workflows/ - Uses these components',
      '../cli/ - CLI interface to core',
      'Test files - Verify core functionality',
    ],
    developerGuide: `
1. **agent-runner.ts** - Start here to understand agent execution
2. **tool-manager.ts** - See how MCP tools are managed
3. **workflow-engine.ts** - Understand workflow orchestration
4. **types.ts** - Review type definitions for interfaces
`,
    agentGuide: `
When working with core components:
- Use tool-manager for file operations (14 MCP tools available)
- Use agent-runner to execute other agents
- Use workflow-engine for multi-step workflows
- Reference types.ts for proper type usage
`,
    importantNotes: [
      'Never modify core components without running full test suite',
      'All core components use strict TypeScript (no any types)',
      'Tool manager must be initialized before use',
      'Prompt caching is enabled by default (90%+ savings)',
    ],
  },
  {
    path: '.claude/orchestration/workflows',
    name: 'Workflows',
    description: 'Pre-built workflow implementations for common development tasks.',
    keyPoints: [
      'Feature development workflow (PM → Architect → Developer → QA → Deploy)',
      'Bug fix workflow',
      'Workflow composition and reuse',
    ],
    dependencies: [
      '../core/workflow-engine.ts - Orchestration',
      '../core/agent-runner.ts - Agent execution',
      '../core/state-manager.ts - State persistence',
    ],
    dependents: [
      '../../commands/ - Slash commands trigger workflows',
      '../cli/ - CLI can run workflows',
    ],
    developerGuide: `
1. Review existing workflows in this folder
2. Copy and modify for new workflow types
3. Test with: pnpm exec tsx workflows/[workflow-name].ts
4. Integrate with CLI or slash commands
`,
    agentGuide: `
Workflows orchestrate multiple agents in sequence or parallel:
- feature.ts: Complete feature development pipeline
- bug-fix.ts: Bug investigation and fix workflow
- index.ts: Exports all workflows for easy importing
`,
    importantNotes: [
      'Workflows are composable - can call other workflows',
      'State is persisted between workflow steps',
      'Always handle errors gracefully (workflow may be resumed)',
    ],
  },
  {
    path: '.claude/orchestration/scripts',
    name: 'Utility Scripts',
    description: 'Automation scripts for documentation, cleanup, and maintenance tasks.',
    keyPoints: [
      'Auto-generate documentation from code',
      'Project status and cleanup reports',
      'Maintenance automation',
    ],
    dependencies: [
      'None - standalone utility scripts',
    ],
    dependents: [
      '../../hooks/ - Git hooks call these scripts',
      'Manual execution - Developers run as needed',
    ],
    developerGuide: `
Run scripts directly:
\`\`\`bash
# Update documentation
pnpm exec tsx .claude/orchestration/scripts/update-docs.ts

# View cleanup report
.claude/orchestration/scripts/cleanup-report.sh

# Generate folder docs (this creates CLAUDE.md files)
pnpm exec tsx .claude/orchestration/scripts/generate-folder-docs.ts
\`\`\`
`,
    agentGuide: `
Scripts available for automation:
- update-docs.ts: Regenerate FILE-STRUCTURE.md
- cleanup-report.sh: Show project status
- generate-folder-docs.ts: Create/update CLAUDE.md in folders
`,
    importantNotes: [
      'Scripts can be run manually or via git hooks',
      'Always test scripts before committing',
      'Scripts should be idempotent (safe to run multiple times)',
    ],
  },
  {
    path: '.claude/agents/implementation',
    name: 'Implementation Agents',
    description: 'Specialist agents for code implementation tasks.',
    keyPoints: [
      'Database schema design (database-architect)',
      'Frontend development (frontend-developer)',
      'API development (api-developer)',
      'Integration work (integration-specialist)',
    ],
    dependencies: [
      '../../orchestration/core/ - Agent execution framework',
      'MCP tools - File operations',
    ],
    dependents: [
      '../../orchestration/workflows/ - Workflows use these agents',
      '../../commands/ - Slash commands trigger agents',
    ],
    developerGuide: `
Each agent is defined in a markdown file with:
1. Frontmatter (YAML) - Agent configuration
2. System prompt - Instructions for the agent
3. Tool access - Which tools the agent can use

Edit agent files to customize behavior.
`,
    agentGuide: `
Implementation agents available:
- database-architect: Schema design, migrations, RLS
- frontend-developer: React components, UI
- api-developer: Server actions, APIs
- integration-specialist: Third-party integrations

Each agent has specific tools and expertise.
`,
    importantNotes: [
      'Agents use Sonnet model (fast, cost-effective)',
      'Each agent has access to specific MCP tools',
      'System prompts can be customized per project needs',
    ],
  },
  {
    path: '.claude/agents/strategic',
    name: 'Strategic Agents',
    description: 'Executive-level agents for business strategy and financial analysis.',
    keyPoints: [
      'CEO Advisor - Business strategy, vision alignment',
      'CFO Advisor - Financial analysis, cost optimization',
    ],
    dependencies: [
      '../../orchestration/core/ - Agent execution framework',
    ],
    dependents: [
      '../../commands/ceo-review - Strategic review workflow',
    ],
    developerGuide: `
Strategic agents use Opus model (deep reasoning):
- More expensive but higher quality analysis
- Use for important business decisions
- Can provide strategic guidance on features

Trigger via: /ceo-review
`,
    agentGuide: `
Strategic agents for high-level decisions:
- ceo-advisor: Vision, strategy, market fit
- cfo-advisor: Costs, ROI, financial planning

Use when business context is critical.
`,
    importantNotes: [
      'Use Opus model (more expensive, ~10x cost of Sonnet)',
      'Reserve for strategic decisions, not routine tasks',
      'Can guide product direction and feature prioritization',
    ],
  },
  {
    path: 'src/lib/db/schema',
    name: 'Database Schemas',
    description: 'Drizzle ORM database schema definitions for the application.',
    keyPoints: [
      'Type-safe database schemas',
      'PostgreSQL with Drizzle ORM',
      'Includes RLS policies and migrations',
    ],
    dependencies: [
      'drizzle-orm/pg-core - Schema definition',
      'Supabase - PostgreSQL database',
    ],
    dependents: [
      '../../app/ - Next.js app uses these schemas',
      '../../../.claude/agents/implementation/database-architect - Creates schemas',
    ],
    developerGuide: `
Schema files follow this pattern:
\`\`\`typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const tableName = pgTable('table_name', {
  id: uuid('id').defaultRandom().primaryKey(),
  // ... other columns
});
\`\`\`

Create new schemas with: /database
`,
    agentGuide: `
When creating database schemas:
1. Import from 'drizzle-orm/pg-core'
2. Use pgTable() for table definitions
3. Include proper types (uuid, text, timestamp, etc.)
4. Add constraints (primaryKey, notNull, etc.)
5. Consider RLS policies for multi-tenant apps
`,
    importantNotes: [
      'All tables should have RLS (Row Level Security) in production',
      'Use uuid for primary keys (better for distributed systems)',
      'Include created_at and updated_at timestamps',
      'Soft delete with deleted_at instead of hard deletes',
    ],
  },
];

/**
 * Extract file descriptions from code
 */
async function getFileDescription(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const blockComment = content.match(/^\/\*\*\n([\s\S]*?)\*\//);
    if (blockComment) {
      const lines = blockComment[1]
        .split('\n')
        .map(line => line.replace(/^\s*\*\s?/, '').trim())
        .filter(line => line && !line.startsWith('@'));
      return lines[0] || 'No description';
    }
    const lineComment = content.match(/^\/\/\s*(.+)$/m);
    if (lineComment) return lineComment[1].trim();
    return 'No description';
  } catch {
    return 'Error reading file';
  }
}

/**
 * Generate file list with descriptions
 */
async function generateFileList(dirPath: string): Promise<string> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = entries.filter(e => e.isFile() && (e.name.endsWith('.ts') || e.name.endsWith('.md')));

    let list = '';
    for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
      const fullPath = path.join(dirPath, file.name);
      const desc = file.name.endsWith('.ts') ? await getFileDescription(fullPath) : 'Documentation';
      const lines = file.name.endsWith('.ts') ? await countLines(fullPath) : 0;
      list += `- **${file.name}** ${lines > 0 ? `(${lines} lines)` : ''}\n  ${desc}\n\n`;
    }
    return list || 'No files yet';
  } catch {
    return 'Directory not found';
  }
}

/**
 * Count lines in a file
 */
async function countLines(filePath: string): Promise<number> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

/**
 * Generate CLAUDE.md content
 */
async function generateClaudeMd(config: DirectoryConfig): Promise<string> {
  const timestamp = new Date().toISOString().split('T')[0];
  const fileList = await generateFileList(config.path);

  let md = `# ${config.name}\n\n`;
  md += `**Last Updated:** ${timestamp}\n`;
  md += `**Auto-Generated:** Yes (with manual edit sections)\n\n`;
  md += `---\n\n`;

  md += `## 📁 Purpose\n\n`;
  md += `${config.description}\n\n`;
  md += `---\n\n`;

  md += `## 📋 Contents\n\n`;
  md += `### Files in This Directory\n\n`;
  md += fileList;
  md += `---\n\n`;

  md += `## 🎯 Key Concepts\n\n`;
  config.keyPoints.forEach(point => {
    md += `- ${point}\n`;
  });
  md += `\n---\n\n`;

  md += `## 🔗 Dependencies\n\n`;
  md += `### This Folder Depends On:\n\n`;
  config.dependencies.forEach(dep => {
    md += `- ${dep}\n`;
  });
  md += `\n### Other Folders That Depend On This:\n\n`;
  config.dependents.forEach(dep => {
    md += `- ${dep}\n`;
  });
  md += `\n---\n\n`;

  md += `## 🚀 Quick Start\n\n`;
  md += `### For Developers\n\n`;
  md += config.developerGuide.trim() + '\n\n';
  md += `### For AI Agents\n\n`;
  md += config.agentGuide.trim() + '\n\n';
  md += `---\n\n`;

  md += `## ⚠️ Important Notes\n\n`;
  config.importantNotes.forEach(note => {
    md += `- ⚠️ ${note}\n`;
  });
  md += `\n---\n\n`;

  md += `## 📝 Change Log\n\n`;
  md += `<!-- MANUAL EDIT SECTION - Add your changes below -->\n\n`;
  md += `### Recent Changes\n\n`;
  md += `- ${timestamp}: Initial CLAUDE.md created\n\n`;
  md += `<!-- END MANUAL EDIT SECTION -->\n\n`;
  md += `---\n\n`;

  md += `## 📚 Related Documentation\n\n`;
  md += `- **Project Root:** [/CLAUDE.md](/CLAUDE.md) - Main project instructions\n`;
  md += `- **Project Structure:** [/PROJECT-STRUCTURE.md](/PROJECT-STRUCTURE.md) - Complete overview\n`;
  md += `- **File Structure:** [/.claude/orchestration/FILE-STRUCTURE.md](/.claude/orchestration/FILE-STRUCTURE.md) - Detailed file docs\n\n`;
  md += `---\n\n`;

  md += `*Auto-generated on ${timestamp} - Manual edits in marked sections are preserved*\n`;

  return md;
}

/**
 * Main execution
 */
async function main() {
  console.log('📚 Generating folder-specific CLAUDE.md files...\n');

  let generated = 0;
  let skipped = 0;

  for (const config of directoryConfigs) {
    const fullPath = path.join(process.cwd(), config.path);
    const outputPath = path.join(fullPath, 'CLAUDE.md');

    // Check if directory exists
    if (!existsSync(fullPath)) {
      console.log(`⏭️  Skipping ${config.path} (directory doesn't exist yet)`);
      skipped++;
      continue;
    }

    console.log(`📝 Generating ${config.path}/CLAUDE.md...`);

    // Generate content
    const content = await generateClaudeMd(config);

    // Create directory if needed
    await fs.mkdir(fullPath, { recursive: true });

    // Write file
    await fs.writeFile(outputPath, content, 'utf-8');

    console.log(`   ✅ Created (${content.length} bytes)\n`);
    generated++;
  }

  console.log('═'.repeat(80));
  console.log(`\n✅ Generated: ${generated} files`);
  console.log(`⏭️  Skipped: ${skipped} files (directories don't exist yet)\n`);

  // Generate master index
  console.log('📑 Generating master documentation index...\n');
  await generateMasterIndex();

  console.log('✅ All folder documentation generated!\n');
}

/**
 * Generate master index of all CLAUDE.md files
 */
async function generateMasterIndex() {
  const indexPath = path.join(process.cwd(), '.claude/DOCUMENTATION-INDEX.md');
  const timestamp = new Date().toISOString().split('T')[0];

  let md = `# Documentation Index\n\n`;
  md += `**Last Updated:** ${timestamp}\n`;
  md += `**Purpose:** Quick reference to all documentation in the project\n\n`;
  md += `---\n\n`;

  md += `## 📚 Project-Wide Documentation\n\n`;
  md += `- [CLAUDE.md](/CLAUDE.md) - Main project instructions for AI agents\n`;
  md += `- [PROJECT-STRUCTURE.md](/PROJECT-STRUCTURE.md) - Complete project overview\n`;
  md += `- [.claude/orchestration/FILE-STRUCTURE.md](.claude/orchestration/FILE-STRUCTURE.md) - Detailed file documentation\n`;
  md += `- [.claude/CLEANUP-SUMMARY.md](.claude/CLEANUP-SUMMARY.md) - Recent cleanup report\n`;
  md += `- [.claude/TEST-RESULTS-FINAL-WORKING.md](.claude/TEST-RESULTS-FINAL-WORKING.md) - Test results\n\n`;
  md += `---\n\n`;

  md += `## 📁 Folder-Specific Documentation (CLAUDE.md)\n\n`;

  for (const config of directoryConfigs) {
    const fullPath = path.join(process.cwd(), config.path, 'CLAUDE.md');
    if (existsSync(fullPath)) {
      md += `### ${config.name}\n\n`;
      md += `**Path:** \`${config.path}/\`  \n`;
      md += `**Description:** ${config.description}\n\n`;
      md += `📄 [View ${config.path}/CLAUDE.md](${config.path}/CLAUDE.md)\n\n`;
    }
  }

  md += `---\n\n`;

  md += `## 🔄 Updating Documentation\n\n`;
  md += `### Auto-Update All Docs\n\`\`\`bash\n`;
  md += `# Update file structure docs\n`;
  md += `pnpm exec tsx .claude/orchestration/scripts/update-docs.ts\n\n`;
  md += `# Regenerate folder docs\n`;
  md += `pnpm exec tsx .claude/orchestration/scripts/generate-folder-docs.ts\n`;
  md += `\`\`\`\n\n`;

  md += `### Git Hook\n`;
  md += `Documentation auto-updates on commit via \`.claude/hooks/pre-commit-docs\`\n\n`;

  md += `---\n\n`;
  md += `*Auto-generated on ${timestamp}*\n`;

  await fs.writeFile(indexPath, md, 'utf-8');
  console.log(`   ✅ Master index created: .claude/DOCUMENTATION-INDEX.md\n`);
}

main().catch(error => {
  console.error('Error generating folder docs:', error);
  process.exit(1);
});
