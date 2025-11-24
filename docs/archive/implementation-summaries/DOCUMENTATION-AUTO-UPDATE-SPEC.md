# Documentation Auto-Update System

**Created:** 2025-11-20
**Status:** 🟢 Active
**Purpose:** Automatically update all related documentation when workflows execute

---

## 🎯 Problem Statement

**User Requirement:**
> "when i run any work flow at the end all other documentations needs to be updatd and clean the documentation accordginglt."

**Current Issue:**
- Workflow commands execute in isolation
- Documentation gets out of sync
- Manual updates required for status badges, progress percentages, timelines
- Duplicate or outdated documentation accumulates

**Solution:**
Post-workflow automation system that detects changes, updates related docs, and cleans up inconsistencies.

---

## 🏗️ System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│           WORKFLOW EXECUTION                            │
│  /define-feature │ /create-epics │ /create-stories     │
│  /plan-sprint    │ /feature                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│         POST-WORKFLOW HOOK                              │
│  .claude/hooks/post-workflow.sh                        │
│  - Captures workflow type                              │
│  - Passes context to update script                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│    DOCUMENTATION UPDATE ENGINE                          │
│  scripts/update-documentation.ts                       │
│                                                         │
│  1. ANALYZE: Detect changes in planning files          │
│  2. UPDATE: Status badges, progress %, timelines       │
│  3. CLEAN: Remove duplicates, outdated content         │
│  4. VALIDATE: Check consistency across hierarchy       │
│  5. REPORT: Generate update summary                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Workflow Detection Matrix

### Workflow Types and Triggers

| Workflow | Trigger Command | Files Created | Docs to Update |
|----------|----------------|---------------|----------------|
| **Define Feature** | `/workflows:define-feature` | `docs/planning/features/[name].md` | - Feature index<br>- Epic templates<br>- Project roadmap |
| **Create Epics** | `/workflows:create-epics` | `docs/planning/epics/[feature]/[epic].md` | - Feature file (add epic links)<br>- Epic index<br>- Story templates |
| **Create Stories** | `/workflows:create-stories` | `docs/planning/stories/[epic]/[story].md` | - Epic file (add story links)<br>- Story index<br>- Sprint templates |
| **Plan Sprint** | `/workflows:plan-sprint` | `docs/planning/sprints/sprint-[N].md` | - Sprint index<br>- Story files (assign sprint)<br>- Timeline updates |
| **Execute Story** | `/workflows:feature [STORY-ID]` | Code, tests, docs | - Story status (⚪→🟡→🟢)<br>- Sprint progress<br>- Epic completion %<br>- Feature progress |

---

## 🔍 Detection Mechanism

### How System Detects Changes

```typescript
interface WorkflowContext {
  type: 'define-feature' | 'create-epics' | 'create-stories' | 'plan-sprint' | 'feature';
  entityId: string; // Feature name, Epic ID, Story ID, Sprint number
  timestamp: string;
  filesModified: string[];
}

async function detectChanges(context: WorkflowContext): Promise<DocumentationChanges> {
  // 1. Scan planning directory for new/modified files
  const recentFiles = await getFilesModifiedSince(context.timestamp);

  // 2. Parse files to extract metadata
  const metadata = await parseMetadata(recentFiles);

  // 3. Identify relationships (Feature → Epic → Story → Sprint)
  const relationships = buildRelationshipGraph(metadata);

  // 4. Determine which docs need updates
  return {
    newEntities: [...], // Newly created files
    modifiedEntities: [...], // Updated files
    affectedParents: [...], // Parent docs that need child links
    affectedChildren: [...], // Child docs that need status updates
    outdatedDocs: [...], // Files to clean up
  };
}
```

### File Timestamp Tracking

```bash
# Before workflow execution
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > .claude/state/last-workflow-timestamp.txt

# After workflow execution
TIMESTAMP=$(cat .claude/state/last-workflow-timestamp.txt)
pnpm tsx scripts/update-documentation.ts --since "$TIMESTAMP" --workflow "$WORKFLOW_TYPE"
```

---

## 🔄 Update Operations

### 1. Status Badge Updates

**Story Status Flow:**
```
⚪ Not Started → 🟡 In Progress → 🟢 Completed
```

**Detection:**
```typescript
async function updateStoryStatus(storyId: string): Promise<void> {
  const storyFile = `docs/planning/stories/**/${storyId}.md`;
  const content = await fs.readFile(storyFile, 'utf-8');

  // Check if code files exist
  const hasImplementation = await checkImplementationExists(storyId);
  const hasTests = await checkTestsExist(storyId);
  const hasDocs = await checkDocsExist(storyId);

  let newStatus: string;
  if (hasImplementation && hasTests && hasDocs) {
    newStatus = '🟢 Completed';
  } else if (hasImplementation || hasTests) {
    newStatus = '🟡 In Progress';
  } else {
    newStatus = '⚪ Not Started';
  }

  // Update status badge in file
  const updatedContent = content.replace(
    /\*\*Status:\*\* [⚪🟡🟢] .*/,
    `**Status:** ${newStatus}`
  );

  await fs.writeFile(storyFile, updatedContent);
}
```

### 2. Progress Percentage Updates

**Epic Progress Calculation:**
```typescript
async function updateEpicProgress(epicId: string): Promise<void> {
  // Get all stories in epic
  const stories = await getStoriesForEpic(epicId);

  // Calculate completion
  const completed = stories.filter(s => s.status === '🟢 Completed').length;
  const total = stories.length;
  const percentage = Math.round((completed / total) * 100);

  // Update epic file
  const epicFile = `docs/planning/epics/**/${epicId}.md`;
  const content = await fs.readFile(epicFile, 'utf-8');

  const updatedContent = content.replace(
    /\*\*Progress:\*\* \d+%/,
    `**Progress:** ${percentage}%`
  );

  await fs.writeFile(epicFile, updatedContent);
}
```

**Feature Progress Calculation:**
```typescript
async function updateFeatureProgress(featureName: string): Promise<void> {
  // Get all epics in feature
  const epics = await getEpicsForFeature(featureName);

  // Get all stories across all epics
  const allStories = await Promise.all(
    epics.map(epic => getStoriesForEpic(epic.id))
  );
  const stories = allStories.flat();

  // Calculate weighted progress
  const completedPoints = stories
    .filter(s => s.status === '🟢 Completed')
    .reduce((sum, s) => sum + s.points, 0);
  const totalPoints = stories.reduce((sum, s) => sum + s.points, 0);
  const percentage = Math.round((completedPoints / totalPoints) * 100);

  // Update feature file
  const featureFile = `docs/planning/features/${featureName}.md`;
  const content = await fs.readFile(featureFile, 'utf-8');

  const updatedContent = content.replace(
    /\*\*Overall Progress:\*\* \d+%/,
    `**Overall Progress:** ${percentage}%`
  );

  await fs.writeFile(featureFile, updatedContent);
}
```

### 3. Link Updates (Parent-Child Relationships)

**When Epic is Created:**
```typescript
async function linkEpicToFeature(epicId: string, featureName: string): Promise<void> {
  const featureFile = `docs/planning/features/${featureName}.md`;
  const content = await fs.readFile(featureFile, 'utf-8');

  // Find ## Epics section
  const epicSection = /## Epics\n\n([\s\S]*?)(?=\n##|$)/;

  // Add new epic link
  const epicLink = `- [${epicId}](../epics/${featureName}/${epicId}.md) - ⚪ Not Started (0%)`;

  const updatedContent = content.replace(
    epicSection,
    (match, epicsList) => {
      return `## Epics\n\n${epicsList.trim()}\n${epicLink}\n\n`;
    }
  );

  await fs.writeFile(featureFile, updatedContent);
}
```

**When Story is Created:**
```typescript
async function linkStoryToEpic(storyId: string, epicId: string): Promise<void> {
  const epicFile = `docs/planning/epics/**/${epicId}.md`;
  const content = await fs.readFile(epicFile, 'utf-8');

  // Find ## Stories section
  const storySection = /## Stories\n\n([\s\S]*?)(?=\n##|$)/;

  // Get story metadata
  const story = await parseStoryFile(storyId);

  // Add new story link
  const storyLink = `- [${storyId}](../../stories/${epicId}/${storyId}.md) - ${story.points}pts - ⚪ Not Started`;

  const updatedContent = content.replace(
    storySection,
    (match, storiesList) => {
      return `## Stories\n\n${storiesList.trim()}\n${storyLink}\n\n`;
    }
  );

  await fs.writeFile(epicFile, updatedContent);
}
```

### 4. Timeline Updates

**Sprint Timeline Generation:**
```typescript
interface SprintTimeline {
  sprintNumber: number;
  startDate: string;
  endDate: string;
  stories: string[];
  totalPoints: number;
  completedPoints: number;
  velocity: number;
}

async function updateSprintTimelines(): Promise<void> {
  // Get all sprint files
  const sprints = await getSprintFiles();

  // Generate timeline
  const timeline: SprintTimeline[] = [];

  for (const sprint of sprints) {
    const stories = await getStoriesForSprint(sprint.number);
    const completedPoints = stories
      .filter(s => s.status === '🟢 Completed')
      .reduce((sum, s) => sum + s.points, 0);
    const totalPoints = stories.reduce((sum, s) => sum + s.points, 0);

    timeline.push({
      sprintNumber: sprint.number,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      stories: stories.map(s => s.id),
      totalPoints,
      completedPoints,
      velocity: completedPoints, // For completed sprints
    });
  }

  // Write timeline file
  await writeTimelineFile(timeline);
}
```

### 5. Cleanup Operations

**Detect Duplicate Documentation:**
```typescript
async function detectDuplicates(): Promise<DuplicateReport> {
  const duplicates: DuplicateReport = {
    features: [],
    epics: [],
    stories: [],
  };

  // Check for duplicate feature files
  const features = await getAllFeatureFiles();
  const featureNames = features.map(f => f.name.toLowerCase());
  const duplicateFeatures = featureNames.filter(
    (name, index) => featureNames.indexOf(name) !== index
  );

  if (duplicateFeatures.length > 0) {
    duplicates.features = duplicateFeatures;
  }

  // Similar logic for epics and stories...

  return duplicates;
}

async function cleanupDuplicates(report: DuplicateReport): Promise<void> {
  // For each duplicate, keep the newest version, delete older ones
  for (const duplicate of report.features) {
    const files = await findFeatureFiles(duplicate);
    const sorted = files.sort((a, b) => b.modifiedTime - a.modifiedTime);

    // Keep first (newest), delete rest
    for (let i = 1; i < sorted.length; i++) {
      console.log(`🗑️  Deleting duplicate: ${sorted[i].path}`);
      await fs.unlink(sorted[i].path);
    }
  }
}
```

**Detect Outdated Documentation:**
```typescript
async function detectOutdatedDocs(): Promise<string[]> {
  const outdated: string[] = [];

  // Check for stories marked completed >30 days ago without code
  const stories = await getAllStoryFiles();

  for (const story of stories) {
    if (story.status === '🟢 Completed') {
      const hasImplementation = await checkImplementationExists(story.id);
      const completedDate = new Date(story.completedDate);
      const daysSince = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);

      if (!hasImplementation && daysSince > 30) {
        outdated.push(story.path);
      }
    }
  }

  return outdated;
}
```

---

## 🚀 Implementation Files

### File Structure

```
scripts/
├── update-documentation.ts          # Main update engine
├── update-documentation/
│   ├── analyzers/
│   │   ├── detect-changes.ts       # Change detection
│   │   ├── detect-duplicates.ts    # Duplicate detection
│   │   └── detect-outdated.ts      # Outdated doc detection
│   ├── updaters/
│   │   ├── update-status.ts        # Status badge updates
│   │   ├── update-progress.ts      # Progress percentage updates
│   │   ├── update-links.ts         # Parent-child links
│   │   └── update-timelines.ts     # Timeline generation
│   ├── cleaners/
│   │   ├── clean-duplicates.ts     # Remove duplicates
│   │   └── clean-outdated.ts       # Remove outdated docs
│   └── validators/
│       ├── validate-hierarchy.ts   # Check Feature→Epic→Story→Sprint
│       └── validate-consistency.ts # Check cross-references
└── update-documentation.test.ts    # Unit tests

.claude/
├── hooks/
│   ├── post-workflow.sh            # Bash hook (calls update script)
│   └── post-workflow.json          # Hook configuration
└── state/
    ├── last-workflow-timestamp.txt # Timestamp tracking
    └── last-update-report.json     # Last update summary
```

### Integration with Workflow Commands

**Update Each Workflow Command:**

```markdown
# Before (current)
---
description: Stage 1 - Define a new feature
---

[Workflow instructions...]

# After (with auto-update)
---
description: Stage 1 - Define a new feature
---

[Workflow instructions...]

## 📋 Post-Workflow Updates

After this workflow completes, the following documentation will be auto-updated:

- ✅ Feature index (`docs/planning/FEATURES-INDEX.md`)
- ✅ Epic templates created in `docs/planning/epics/[feature-name]/`
- ✅ Project roadmap updated
- ✅ Timeline regenerated

**How it works:**
1. Workflow creates feature file
2. Post-workflow hook detects new file
3. Update script runs automatically
4. You receive update report

**Manual verification:**
Run `pnpm doc:verify` to validate all documentation is consistent.
```

---

## 📊 Update Report Format

### Console Output

```bash
┌─────────────────────────────────────────────────────────┐
│  📝 Documentation Auto-Update Report                   │
│  Workflow: create-epics                                │
│  Timestamp: 2025-11-20T15:30:00Z                       │
└─────────────────────────────────────────────────────────┘

✅ UPDATES COMPLETED

  📄 Status Updates (3)
    - Epic 2.5 → 98% complete
    - Feature AI-Infrastructure → 95% complete
    - Sprint 5 → 100% complete

  🔗 Link Updates (5)
    - Added 3 epic links to Feature file
    - Updated 2 story references in Epic files

  📈 Progress Updates (2)
    - Feature progress: 45% → 47%
    - Epic progress: 90% → 95%

  📅 Timeline Updates (1)
    - Sprint 5 marked complete
    - Sprint 6 timeline generated

🧹 CLEANUP COMPLETED

  🗑️  Removed Duplicates (0)
    - No duplicates found

  🗑️  Removed Outdated (0)
    - No outdated docs found

✅ VALIDATION PASSED

  ✓ Feature → Epic → Story → Sprint hierarchy valid
  ✓ All cross-references valid
  ✓ No orphaned files
  ✓ Status badges consistent

📊 SUMMARY

  Total files analyzed: 127
  Files updated: 8
  Files created: 0
  Files deleted: 0
  Validation errors: 0

  Duration: 2.3s

┌─────────────────────────────────────────────────────────┐
│  ✅ All documentation up to date!                      │
└─────────────────────────────────────────────────────────┘
```

### JSON Output (for CI/CD)

```json
{
  "workflow": "create-epics",
  "timestamp": "2025-11-20T15:30:00Z",
  "duration": 2.3,
  "updates": {
    "status": {
      "count": 3,
      "items": [
        { "file": "docs/planning/epics/epic-2.5.md", "old": "90%", "new": "98%" }
      ]
    },
    "links": {
      "count": 5,
      "items": [...]
    },
    "progress": {
      "count": 2,
      "items": [...]
    },
    "timelines": {
      "count": 1,
      "items": [...]
    }
  },
  "cleanup": {
    "duplicates": { "count": 0, "removed": [] },
    "outdated": { "count": 0, "removed": [] }
  },
  "validation": {
    "passed": true,
    "errors": []
  },
  "summary": {
    "filesAnalyzed": 127,
    "filesUpdated": 8,
    "filesCreated": 0,
    "filesDeleted": 0
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe('update-documentation', () => {
  describe('detectChanges', () => {
    it('should detect new feature files', async () => {
      const context = { type: 'define-feature', entityId: 'test-feature' };
      const changes = await detectChanges(context);
      expect(changes.newEntities).toHaveLength(1);
    });
  });

  describe('updateStoryStatus', () => {
    it('should update status from ⚪ to 🟡 when code exists', async () => {
      await createTestStory('TEST-001');
      await createTestImplementation('TEST-001');
      await updateStoryStatus('TEST-001');

      const content = await readStoryFile('TEST-001');
      expect(content).toContain('**Status:** 🟡 In Progress');
    });
  });

  describe('updateEpicProgress', () => {
    it('should calculate correct percentage', async () => {
      await createTestEpic('EPIC-001', [
        { id: 'STORY-001', status: '🟢 Completed' },
        { id: 'STORY-002', status: '🟢 Completed' },
        { id: 'STORY-003', status: '⚪ Not Started' },
      ]);

      await updateEpicProgress('EPIC-001');

      const content = await readEpicFile('EPIC-001');
      expect(content).toContain('**Progress:** 67%'); // 2/3 = 66.67% → 67%
    });
  });
});
```

### Integration Tests

```typescript
describe('full workflow integration', () => {
  it('should update all docs after /create-epics', async () => {
    // Setup: Create feature
    await createFeatureFile('ai-infrastructure');

    // Action: Run create-epics workflow (simulated)
    await runWorkflow('create-epics', 'ai-infrastructure');

    // Verify: Feature file updated with epic links
    const featureContent = await readFeatureFile('ai-infrastructure');
    expect(featureContent).toContain('[AI-GURU](../epics/');
    expect(featureContent).toContain('[AI-PROD](../epics/');

    // Verify: Epic templates created
    const epicFiles = await getEpicFiles('ai-infrastructure');
    expect(epicFiles).toHaveLength(5);

    // Verify: Timeline updated
    const timeline = await readTimeline();
    expect(timeline.features).toContainEqual({
      name: 'ai-infrastructure',
      epics: 5,
      stories: 0,
      progress: 0,
    });
  });
});
```

---

## 📚 Configuration

### `.claude/hooks/post-workflow.json`

```json
{
  "name": "post-workflow",
  "description": "Auto-update documentation after workflow execution",
  "enabled": true,
  "trigger": "workflow-complete",
  "command": ".claude/hooks/post-workflow.sh",
  "timeout": 30000,
  "failureMode": "warn"
}
```

### `.claude/hooks/post-workflow.sh`

```bash
#!/bin/bash

# Post-Workflow Documentation Update Hook
# Automatically updates all related documentation after workflow execution

set -e

# Get workflow context
WORKFLOW_TYPE="${1:-unknown}"
ENTITY_ID="${2:-}"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Save timestamp
mkdir -p .claude/state
echo "$TIMESTAMP" > .claude/state/last-workflow-timestamp.txt

# Run update script
echo "📝 Updating documentation after workflow: $WORKFLOW_TYPE"
pnpm tsx scripts/update-documentation.ts \
  --workflow "$WORKFLOW_TYPE" \
  --entity "$ENTITY_ID" \
  --timestamp "$TIMESTAMP" \
  --format console

# Save report
pnpm tsx scripts/update-documentation.ts \
  --workflow "$WORKFLOW_TYPE" \
  --entity "$ENTITY_ID" \
  --timestamp "$TIMESTAMP" \
  --format json \
  > .claude/state/last-update-report.json

echo "✅ Documentation update complete"
```

---

## 🚦 Rollout Plan

### Phase 1: Core Implementation (Week 1)
- [ ] Create `scripts/update-documentation.ts` skeleton
- [ ] Implement change detection (`analyzers/detect-changes.ts`)
- [ ] Implement status updates (`updaters/update-status.ts`)
- [ ] Implement progress updates (`updaters/update-progress.ts`)
- [ ] Unit tests for core functions

### Phase 2: Link Updates (Week 1)
- [ ] Implement link updates (`updaters/update-links.ts`)
- [ ] Implement timeline updates (`updaters/update-timelines.ts`)
- [ ] Integration tests for link updates

### Phase 3: Cleanup (Week 2)
- [ ] Implement duplicate detection (`cleaners/clean-duplicates.ts`)
- [ ] Implement outdated doc detection (`cleaners/clean-outdated.ts`)
- [ ] Implement validators (`validators/`)

### Phase 4: Hook Integration (Week 2)
- [ ] Create `.claude/hooks/post-workflow.sh`
- [ ] Update all 5 workflow commands with auto-update documentation
- [ ] Test hook execution after each workflow type

### Phase 5: Validation & Launch (Week 2)
- [ ] End-to-end testing of full workflow → update cycle
- [ ] Documentation review and updates
- [ ] Launch to production
- [ ] Monitor first week of usage

---

## 📖 Usage

### Manual Execution

```bash
# Update documentation based on recent changes
pnpm doc:update

# Update after specific workflow
pnpm doc:update --workflow create-epics --entity ai-infrastructure

# Update with custom timestamp
pnpm doc:update --since "2025-11-20T10:00:00Z"

# Dry run (show what would be updated)
pnpm doc:update --dry-run

# Validate documentation consistency
pnpm doc:verify

# Clean up duplicates and outdated docs
pnpm doc:clean
```

### Add to `package.json`

```json
{
  "scripts": {
    "doc:update": "tsx scripts/update-documentation.ts",
    "doc:verify": "tsx scripts/update-documentation.ts --verify-only",
    "doc:clean": "tsx scripts/update-documentation.ts --clean-only"
  }
}
```

### Automatic Execution

The system runs automatically after every workflow execution via the post-workflow hook. No manual intervention required.

---

## ✅ Success Criteria

### System is successful if:

1. **Automatic Execution:** Updates run after every workflow without manual intervention
2. **Accuracy:** Status badges, progress percentages, and links are always correct
3. **Performance:** Updates complete in <5 seconds for typical workloads
4. **Reliability:** Zero errors during normal operation
5. **Validation:** Hierarchy and cross-references remain valid
6. **Cleanup:** No duplicate or outdated documentation accumulates
7. **Visibility:** Clear reports show exactly what was updated

### Metrics to Track:

- **Update frequency:** Number of auto-updates per day
- **Update accuracy:** % of updates that are correct
- **Performance:** Average update duration
- **Validation pass rate:** % of runs with no validation errors
- **User satisfaction:** Reduced manual documentation work

---

## 🎯 Benefits

### For You (Project Owner)

- ✅ **Always up-to-date documentation** - No manual updates needed
- ✅ **Complete visibility** - See exactly what changed and when
- ✅ **Reduced errors** - Automated consistency checks
- ✅ **Clean documentation** - No duplicate or outdated files

### For Developers

- ✅ **Accurate status tracking** - Know exactly what's done
- ✅ **Reliable progress metrics** - Trust the percentages
- ✅ **Valid cross-references** - All links work
- ✅ **Focus on code** - Less time on documentation

### For AI Agents

- ✅ **Correct context** - Always have latest information
- ✅ **Valid hierarchy** - Follow proper Feature→Epic→Story→Sprint structure
- ✅ **Automated workflow** - No need to manually update docs after execution

---

## 📞 Support

If the auto-update system encounters errors:

1. **Check the report:** `.claude/state/last-update-report.json`
2. **Run validation:** `pnpm doc:verify`
3. **Manual update:** `pnpm doc:update`
4. **Check logs:** System logs errors to console and Sentry

---

**Status:** 🟡 In Development
**Expected Completion:** Week 2
**Owner:** AI Infrastructure Team
**Priority:** HIGH (explicit user requirement)
