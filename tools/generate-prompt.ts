#!/usr/bin/env tsx

/**
 * Generate Implementation Prompt CLI
 *
 * Auto-generates perfect implementation prompts from epic/story files.
 *
 * Usage:
 *   pnpm prompt epic-02               # Generate prompt for Epic 2
 *   pnpm prompt epic-02 --story 3     # Generate prompt for specific story
 *   pnpm prompt epic-02 --output file # Save to file
 *   pnpm prompt epic-02 --copy        # Copy to clipboard (requires pbcopy/xclip)
 *   pnpm prompt list                  # List all epics
 */

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const program = new Command();

// ============================================================================
// Types
// ============================================================================

interface EpicMetadata {
  id: string;
  name: string;
  goal: string;
  businessValue: string;
  personas: string[];
  features: string[];
  successMetrics: string[];
  dependencies: string[];
  effort: string;
  timeline: string;
  stories: string[];
  filePath: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getEpicsDirectory(): string {
  return path.join(process.cwd(), 'docs/planning/epics');
}

function getAllEpicFiles(): string[] {
  const epicsDir = getEpicsDirectory();
  if (!fs.existsSync(epicsDir)) {
    throw new Error(`Epics directory not found: ${epicsDir}`);
  }

  return fs.readdirSync(epicsDir)
    .filter(file => file.startsWith('epic-') && file.endsWith('.md'))
    .map(file => path.join(epicsDir, file));
}

function parseEpicFile(filePath: string): EpicMetadata {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const metadata: Partial<EpicMetadata> = {
    filePath,
    personas: [],
    features: [],
    successMetrics: [],
    dependencies: [],
    stories: [],
  };

  // Extract epic ID from filename (e.g., epic-02-training-academy.md -> epic-02)
  const filename = path.basename(filePath);
  const epicIdMatch = filename.match(/^(epic-[\d.]+)/);
  metadata.id = epicIdMatch ? epicIdMatch[1] : filename.replace('.md', '');

  let currentSection = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Extract title (first heading)
    if (line.startsWith('# Epic') && !metadata.name) {
      metadata.name = line.replace(/^# Epic \d+:?\s*/, '').trim();
    }

    // Extract metadata fields
    if (line.startsWith('**📋 Epic Name:**')) {
      metadata.name = line.replace('**📋 Epic Name:**', '').trim();
    }
    if (line.startsWith('**🎯 Goal:**')) {
      metadata.goal = line.replace('**🎯 Goal:**', '').trim();
    }
    if (line.startsWith('**💰 Business Value:**')) {
      metadata.businessValue = line.replace('**💰 Business Value:**', '').trim();
    }
    if (line.startsWith('**⏱️ Effort Estimate:**')) {
      metadata.effort = line.replace('**⏱️ Effort Estimate:**', '').trim();
    }
    if (line.startsWith('**📅 Tentative Timeline:**')) {
      metadata.timeline = line.replace('**📅 Tentative Timeline:**', '').trim();
    }

    // Track sections
    if (line.startsWith('**👥 User Personas:**')) {
      currentSection = 'personas';
      // Handle inline personas (e.g., "**👥 User Personas:** All users (students, ...)")
      const inlineValue = line.replace('**👥 User Personas:**', '').trim();
      if (inlineValue) {
        metadata.personas!.push(inlineValue);
      }
      continue;
    }
    if (line.startsWith('**🎁 Key Features:**')) {
      currentSection = 'features';
      continue;
    }
    if (line.startsWith('**📊 Success Metrics:**')) {
      currentSection = 'metrics';
      continue;
    }
    if (line.startsWith('**🔗 Dependencies:**')) {
      currentSection = 'dependencies';
      continue;
    }
    if (line.startsWith('**Key Stories')) {
      currentSection = 'stories';
      continue;
    }

    // Stop sections
    if (line.startsWith('**') && !line.startsWith('**-')) {
      if (currentSection && !['personas', 'features', 'metrics', 'dependencies', 'stories'].includes(currentSection)) {
        currentSection = '';
      }
    }

    // Extract list items
    if (line.startsWith('- ') && currentSection) {
      const item = line.substring(2).trim();
      if (currentSection === 'personas') metadata.personas!.push(item);
      if (currentSection === 'features') metadata.features!.push(item);
      if (currentSection === 'metrics') metadata.successMetrics!.push(item);
      if (currentSection === 'dependencies') metadata.dependencies!.push(item);
    }

    // Extract numbered stories
    if (/^\d+\.\s/.test(line) && currentSection === 'stories') {
      const story = line.replace(/^\d+\.\s/, '').trim();
      metadata.stories!.push(story);
    }
  }

  return metadata as EpicMetadata;
}

function detectBusinessPillar(epicId: string, epicName: string): string {
  const id = epicId.toLowerCase();
  const name = epicName.toLowerCase();

  if (id.includes('02') || name.includes('training') || name.includes('academy')) {
    return 'Training Academy';
  }
  if (id.includes('03') || name.includes('recruiting')) {
    return 'Recruiting Services';
  }
  if (id.includes('04') || name.includes('bench')) {
    return 'Bench Sales';
  }
  if (id.includes('05') || name.includes('talent') || name.includes('acquisition')) {
    return 'Talent Acquisition';
  }
  if (id.includes('08') || name.includes('cross-border') || name.includes('international')) {
    return 'Cross-Border Solutions';
  }
  if (id.includes('06') || name.includes('hr') || name.includes('employee')) {
    return 'HR/Employee Management';
  }
  if (id.includes('07') || name.includes('pod') || name.includes('productivity')) {
    return 'Productivity & Pods';
  }
  if (id.includes('01') || name.includes('foundation')) {
    return 'Foundation (Core Infrastructure)';
  }
  if (id.includes('2.5') || name.includes('ai infrastructure')) {
    return 'AI Infrastructure';
  }

  return 'Cross-Cutting';
}

function extractDatabaseTables(metadata: EpicMetadata): string {
  const content = fs.readFileSync(metadata.filePath, 'utf-8');

  // Look for CREATE TABLE statements
  const tableMatches = content.match(/CREATE TABLE\s+(\w+)/gi);
  if (tableMatches && tableMatches.length > 0) {
    const tables = tableMatches.map(m => m.replace(/CREATE TABLE\s+/i, '').trim());
    return tables.join(', ');
  }

  // Look for mentions in stories
  const storyTables = metadata.stories
    .filter(s => s.toLowerCase().includes('table'))
    .map(s => {
      const match = s.match(/(\w+)\s+table/i);
      return match ? match[1] : null;
    })
    .filter(Boolean);

  if (storyTables.length > 0) {
    return storyTables.join(', ');
  }

  return 'See epic file for schema details';
}

function extractEvents(metadata: EpicMetadata): { emit: string[]; subscribe: string[] } {
  const content = fs.readFileSync(metadata.filePath, 'utf-8');
  const emit: string[] = [];
  const subscribe: string[] = [];

  // Look for event patterns in content
  const eventPatterns = [
    /emit\(['"]([^'"]+)['"]/gi,
    /publish\(['"]([^'"]+)['"]/gi,
    /\*\*Event:\*\*\s*`([^`]+)`/gi,
  ];

  eventPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      emit.push(match[1]);
    }
  });

  // Common event patterns based on epic type
  if (metadata.name.toLowerCase().includes('training') || metadata.name.toLowerCase().includes('academy')) {
    if (!emit.includes('course.completed')) emit.push('course.completed');
    if (!emit.includes('course.graduated')) emit.push('course.graduated');
  }
  if (metadata.name.toLowerCase().includes('recruiting')) {
    subscribe.push('course.graduated');
  }

  return { emit, subscribe };
}

// ============================================================================
// Prompt Generation
// ============================================================================

function generateEpicPrompt(metadata: EpicMetadata, options: { story?: number } = {}): string {
  const pillar = detectBusinessPillar(metadata.id, metadata.name);
  const tables = extractDatabaseTables(metadata);
  const events = extractEvents(metadata);

  const prompt = `
# Implement: ${metadata.id.toUpperCase()} - ${metadata.name}

## 📋 Specification
- **File:** ${path.relative(process.cwd(), metadata.filePath)}
- **Type:** Epic${options.story ? ` (Story ${options.story})` : ''}
- **Business Pillar:** ${pillar}
- **Pod Impact:** Enables 2-person pods to hit 2 placements/sprint target

## 🎯 Objectives

${metadata.goal || 'See epic file for detailed goals'}

**Business Value:** ${metadata.businessValue || 'See epic file'}

**Success Metrics:**
${metadata.successMetrics.slice(0, 5).map(m => `- ${m}`).join('\n') || '- See epic file for metrics'}

## 🏗️ Architecture Alignment

### Unified Schema
**Database Tables:** ${tables}

### Event-Driven Integration
**Events to Emit:**
${events.emit.length > 0 ? events.emit.map(e => `- \`${e}\``).join('\n') : '- Review epic file for event requirements'}

**Events to Subscribe:**
${events.subscribe.length > 0 ? events.subscribe.map(e => `- \`${e}\``).join('\n') : '- None identified (check dependencies)'}

### Cross-Pollination Opportunities
${pillar === 'Training Academy'
  ? '- Every graduate creates 1 recruiting lead\n- Course completions trigger candidate pipeline\n- Student network = future client prospects'
  : pillar === 'Recruiting Services'
  ? '- Every placement creates 1 training referral\n- Client conversations reveal bench sales opportunities\n- Unfilled roles feed talent acquisition pipeline'
  : '- Review epic file for cross-pillar integration points\n- Consider: How does this create leads for other pillars?'}

### Multi-Role Support
**User Personas:**
${metadata.personas.slice(0, 4).map(p => `- ${p}`).join('\n') || '- See epic file'}

## ✅ Quality Standards

### Code Quality
- **TypeScript:** Strict mode, no \`any\` types
- **Testing:** 80%+ coverage (unit + integration + E2E)
- **Performance:** <3s page load, <200ms API response
- **Accessibility:** WCAG 2.1 AA compliance

### Security
- **RLS Policies:** Required on ALL tables
- **Input Validation:** Zod schemas for all inputs
- **Authentication:** Supabase Auth with proper role checks
- **Audit Trails:** created_by, updated_by, deleted_at on sensitive tables

### Architecture
- **Server Components:** Default (use "use client" only when necessary)
- **API Pattern:** Server Actions + Zod validation
- **Error Handling:** Type-safe responses (discriminated unions)
- **Database:** Drizzle ORM with type-safe queries

## 🚀 Execution Plan

### Phase 1: Planning & Design (PM + Architect)
Use \`/start-planning\` to:
1. **PM Agent** - Validate requirements and clarify ambiguities
2. **Architect** - Design unified schema and API contracts
3. **CFO Review** - Validate business value and cost estimates
4. **Security Audit** - Review RLS policies and auth flows

### Phase 2: Implementation (Developer + QA)
Use \`/feature ${metadata.id}\` workflow:
1. **Database Architect** - Create migrations with RLS policies
2. **API Developer** - Implement server actions with Zod validation
3. **Frontend Developer** - Build UI with shadcn/ui components
4. **QA Engineer** - Write tests (unit + integration + E2E)

### Phase 3: Verification (QA + Security)
1. **QA Engineer** - Run comprehensive test suite
2. **Security Auditor** - Verify RLS, auth, input validation
3. **Performance Check** - Lighthouse audit, load testing

### Phase 4: Deployment
Use \`/deploy\` workflow:
1. **Deployment Specialist** - Deploy to staging
2. **Smoke Tests** - Verify critical paths
3. **Production Deploy** - Ship with monitoring

## 📊 Success Criteria

- [ ] All acceptance criteria met (from epic file)
- [ ] Tests passing with 80%+ coverage
- [ ] TypeScript compilation with no errors
- [ ] All quality gates passed (pre-commit hooks)
- [ ] RLS policies verified and tested
- [ ] API documentation updated
- [ ] E2E flows tested and working
- [ ] Performance benchmarks met (<3s page load)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Cross-pollination opportunities identified and documented
- [ ] Event bus integration working (emit/subscribe verified)
- [ ] Deployed to staging successfully

## 🎬 Start Implementation

**Recommended Approach:**
\`\`\`bash
# Step 1: Start planning phase
/start-planning

# Step 2: After planning approved, run full feature workflow
/feature ${metadata.id}
\`\`\`

**Or manual agent orchestration:**
1. Gather requirements with PM Agent
2. Design schema with Database Architect
3. Review strategy with CEO/CFO Advisors
4. Implement with Developer agents
5. Test with QA Engineer
6. Audit security with Security Auditor
7. Deploy with Deployment Specialist

## 📁 Key Files to Reference

- **Epic Spec:** \`${path.relative(process.cwd(), metadata.filePath)}\`
- **Architecture:** \`docs/audit/project-setup-architecture.md\`
- **Code Conventions:** \`CLAUDE.md\`
- **Database Schema:** \`docs/architecture/database-schema.md\`
- **Agent Workflows:** \`.claude/commands/workflows/\`

## 💡 Additional Context

**Key Features (Top 5):**
${metadata.features.slice(0, 5).map((f, i) => `${i + 1}. ${f}`).join('\n') || 'See epic file for complete feature list'}

**Dependencies:**
${metadata.dependencies.slice(0, 3).map(d => `- ${d}`).join('\n') || '- None (this is a foundational epic)'}

**Effort Estimate:** ${metadata.effort || 'See epic file'}
**Timeline:** ${metadata.timeline || 'To be determined'}

---

**Ready to begin? Start with \`/start-planning\` to initiate the full agent workflow! 🚀**
`.trim();

  return prompt;
}

function generateStoryPrompt(metadata: EpicMetadata, storyNumber: number): string {
  if (storyNumber > metadata.stories.length) {
    throw new Error(`Story ${storyNumber} not found in ${metadata.id}. Epic has ${metadata.stories.length} stories.`);
  }

  const story = metadata.stories[storyNumber - 1];
  const pillar = detectBusinessPillar(metadata.id, metadata.name);

  const prompt = `
# Implement User Story: ${metadata.id.toUpperCase()}-${String(storyNumber).padStart(3, '0')}

## 📋 Story Details

**Epic:** ${metadata.id.toUpperCase()} - ${metadata.name}
**Story ${storyNumber}:** ${story}

**File:** ${path.relative(process.cwd(), metadata.filePath)}

## 🎯 User Story Format

As a [role], I want [feature] so that [benefit]

**Inferred from story:**
${story}

## 🏗️ Technical Context

**Business Pillar:** ${pillar}
**Affects Modules:** [Identify from story - e.g., academy, hr, recruiting]
**Database Changes:** [Analyze story for table/schema changes needed]

### Integration Points

**Events to Emit:**
- [Identify events from story context]

**Events to Subscribe:**
- [Identify event dependencies]

**Cross-Pillar Impact:**
- [How does this create opportunities in other pillars?]

## ✅ Acceptance Criteria

Based on story description:
1. [Extract or infer from story]
2. [Add specific technical criteria]
3. [Add test requirements]

## 🚀 Implementation Checklist

### Backend
- [ ] Create/update database tables with RLS policies
- [ ] Implement server actions with Zod validation
- [ ] Write unit tests for business logic
- [ ] Write integration tests for DB operations

### Frontend
- [ ] Build UI components (shadcn/ui)
- [ ] Implement form validation
- [ ] Add loading/error states
- [ ] Test accessibility (ARIA labels, keyboard nav)

### Testing
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests (API + DB)
- [ ] E2E test for user flow
- [ ] Performance check (<3s load)

### Quality Gates
- [ ] TypeScript strict mode (no \`any\`)
- [ ] ESLint passing
- [ ] Pre-commit hooks passing
- [ ] Code review completed

## 🎬 Quick Start

**Targeted Implementation:**
1. **API Developer** - Build backend logic and server actions
2. **Frontend Developer** - Create UI components
3. **QA Engineer** - Write comprehensive tests
4. Run quality gates and verify

**Or use full workflow:**
\`\`\`bash
/feature ${metadata.id.toUpperCase()}-${String(storyNumber).padStart(3, '0')}
\`\`\`

## 📁 Related Files

- **Epic:** \`${path.relative(process.cwd(), metadata.filePath)}\`
- **Conventions:** \`CLAUDE.md\`
- **Database Schema:** \`docs/architecture/database-schema.md\`

---

**Implement incrementally with test-first approach! 🚀**
`.trim();

  return prompt;
}

// ============================================================================
// CLI Commands
// ============================================================================

program
  .name('generate-prompt')
  .description('Generate implementation prompts from epic/story files')
  .version('1.0.0');

program
  .command('list')
  .description('List all available epics')
  .action(() => {
    const epicFiles = getAllEpicFiles();

    console.log('\n📚 Available Epics:\n');

    epicFiles.forEach(filePath => {
      const metadata = parseEpicFile(filePath);
      const pillar = detectBusinessPillar(metadata.id, metadata.name);
      console.log(`  ${metadata.id.padEnd(15)} ${metadata.name}`);
      console.log(`  ${' '.repeat(15)} └─ ${pillar}`);
      console.log(`  ${' '.repeat(15)} └─ ${metadata.stories.length} stories, ${metadata.effort || 'TBD'}`);
      console.log('');
    });
  });

program
  .command('generate')
  .argument('<epic-id>', 'Epic ID (e.g., epic-02)')
  .option('-s, --story <number>', 'Generate prompt for specific story number')
  .option('-o, --output <type>', 'Output type: console (default), file, clipboard', 'console')
  .option('-f, --file <path>', 'Custom output file path')
  .description('Generate implementation prompt for an epic or story')
  .action((epicId: string, options: { story?: string; output: 'console' | 'file' | 'clipboard'; file?: string }) => {
    try {
      // Find epic file
      const epicFiles = getAllEpicFiles();
      const epicFile = epicFiles.find(f => path.basename(f).startsWith(epicId));

      if (!epicFile) {
        console.error(`❌ Epic not found: ${epicId}`);
        console.log('\nAvailable epics:');
        epicFiles.forEach(f => {
          console.log(`  - ${path.basename(f, '.md')}`);
        });
        process.exit(1);
      }

      // Parse epic
      const metadata = parseEpicFile(epicFile);

      // Generate prompt
      let prompt: string;
      if (options.story) {
        const storyNum = parseInt(options.story, 10);
        prompt = generateStoryPrompt(metadata, storyNum);
      } else {
        prompt = generateEpicPrompt(metadata);
      }

      // Output based on option
      if (options.output === 'file') {
        const filename = options.file || `prompt-${epicId}${options.story ? `-story-${options.story}` : ''}.md`;
        const outputPath = path.join(process.cwd(), filename);
        fs.writeFileSync(outputPath, prompt, 'utf-8');
        console.log(`✅ Prompt saved to: ${outputPath}`);
      } else if (options.output === 'clipboard') {
        // Try to copy to clipboard
        try {
          if (process.platform === 'darwin') {
            execSync('pbcopy', { input: prompt });
          } else if (process.platform === 'linux') {
            execSync('xclip -selection clipboard', { input: prompt });
          } else {
            console.error('❌ Clipboard not supported on this platform. Use --output file instead.');
            process.exit(1);
          }
          console.log('✅ Prompt copied to clipboard!');
        } catch {
          console.error('❌ Failed to copy to clipboard. Install pbcopy (macOS) or xclip (Linux).');
          console.log('\nPrompt output:\n');
          console.log(prompt);
        }
      } else {
        // Console output
        console.log('\n' + '='.repeat(80) + '\n');
        console.log(prompt);
        console.log('\n' + '='.repeat(80) + '\n');
      }

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse();
