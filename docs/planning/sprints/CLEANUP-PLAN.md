# Project Cleanup Plan

**Created:** 2025-11-19
**Issue:** 56+ .md files in project root, old sprint files not cleaned up
**Goal:** Clean, organized structure with files in proper locations

---

## 📊 Current Situation

### Project Root Files (56 .md files)
- ❌ Too many files in root
- ❌ Sprint documents scattered everywhere
- ❌ Old/duplicate files not removed
- ❌ No clear organization

---

## 🎯 Cleanup Actions

### 1. Sprint-Related Files → Sprint Folders

#### Sprint 1 Files (Move to sprint-01/deliverables/docs/)
- SPRINT-1-DB-VALIDATION.md
- SPRINT-1-E2E-TEST-REPORT.md
- SPRINT-1-POST-MIGRATION-REVIEW.md
- SPRINT-1-PROGRESS-REVIEW.md
- SPRINT-1-STATUS.md
- SPRINT-1-TEST-SUMMARY.md
- MANUAL-TESTING-SPRINT-1.md

**Delete (duplicates):**
- SPRINT-1-COMPLETE.md (already in sprint-01/REVIEW.md)

#### Sprint 2 Files (Move to sprint-02/deliverables/docs/)
- SPRINT-2-DEPLOYMENT-CHECKLIST.md
- SPRINT-2-FINAL-REVIEW.md
- SPRINT-2-HANDOFF-TO-DEPLOYMENT.md
- SPRINT-2-HANDOFF.md
- SPRINT-2-IMPLEMENTATION-SUMMARY.md
- SPRINT-2-KNOWN-ISSUES.md
- SPRINT-2-PROGRESS-REPORT.md
- SPRINT-2-PROGRESS-TRACKING.md
- SPRINT-2-PROGRESS-UPDATE.md
- SPRINT-2-QA-FINAL-REPORT.md
- SPRINT-2-READY-TO-DEPLOY.md

**Delete (duplicates):**
- SPRINT-2-COMPLETE.md (already in sprint-02/REVIEW.md)

#### Sprint 3 Files (Move to sprint-03/deliverables/docs/)
- SPRINT-3-DEVELOPER-HANDOFF.md
- SPRINT-3-IMPLEMENTATION-REPORT.md
- SPRINT-3-IMPLEMENTATION-SUMMARY.md

**Delete from sprints/ folder:**
- SPRINT-1-COMPLETE.md
- SPRINT-2-COMPLETE.md
- SPRINT-3-COMPLETE.md
- SPRINT-4-PROMPTS.md
- SPRINT-5-PROMPTS.md
- SPRINT-6-PROMPTS.md
- SPRINT-7-PROMPTS.md
- QUICK-START-GUIDE.md (old, replaced by README.md)

---

### 2. QA/Testing Files → docs/qa/

**Move to docs/qa/:**
- EPIC-01-VERIFICATION-REPORT.md
- QA-REPORT-EPIC-01-FOUNDATION.md
- TESTING-GUIDE.md
- TESTING-QUICK-REFERENCE.md
- TESTING-REPORT.md
- SQL-VALIDATION-REPORT.md

---

### 3. Deployment Files → docs/deployment/

**Move to docs/deployment/:**
- DEPLOYMENT-GUIDE.md
- DEPLOYMENT-SUCCESS.md

---

### 4. Migration Files → docs/migration/

**Move to docs/migration/:**
- APPLY-MIGRATIONS-NOW.md
- AUTOMATED-MIGRATION-GUIDE.md
- MIGRATION-APPLICATION-GUIDE.md
- MIGRATION-INSTRUCTIONS.md
- RUN-MIGRATIONS-NOW.md
- RUN-MIGRATIONS.md

---

### 5. Working Docs → docs/planning/

**Move to docs/planning/:**
- EPIC-2.5-READY-TO-EXECUTE.md
- STATUS-UPDATE-SUMMARY.md
- SPRINT-STRUCTURE-REORGANIZATION-COMPLETE.md

---

### 6. Keep in Root (Essential Only)

**Keep:**
- CLAUDE.md (project instructions)
- PROJECT-STRUCTURE.md (project overview)
- START-HERE.md (if it exists)
- README.md (if it exists, or create one)
- QUICK-REFERENCE.md (keep as quick access)

**Move to docs/:**
- CURSOR-CLAUDE-WORKFLOW.md → docs/
- CURSOR-SYNC-STATUS.md → docs/
- GEMINI-USAGE-GUIDE.md → docs/
- GEMINI.md → docs/
- KNOWN-ISSUES.md → docs/
- QUICK-START.md → docs/
- REPLICATION-SUMMARY.md → docs/
- REVIEW-RESOLUTION.md → docs/
- SECURITY-ALERT.md → docs/
- SETUP-SENTRY-NOW.md → docs/
- SYNC-COMPLETE.md → docs/
- TIMELINE-QUICKSTART.md → docs/

---

## 📁 Final Structure

```
intime-v3/
├── CLAUDE.md                              # Project instructions
├── PROJECT-STRUCTURE.md                   # Project overview
├── START-HERE.md                          # Quick start guide
├── QUICK-REFERENCE.md                     # Quick commands
├── docs/
│   ├── planning/
│   │   ├── epics/
│   │   ├── stories/
│   │   ├── sprints/
│   │   │   ├── README.md
│   │   │   ├── SPRINT-PLAN-TEMPLATE.md
│   │   │   ├── SPRINT-REVIEW-TEMPLATE.md
│   │   │   ├── sprint-01/
│   │   │   │   ├── PLAN.md
│   │   │   │   ├── REVIEW.md
│   │   │   │   ├── stories/
│   │   │   │   └── deliverables/
│   │   │   │       └── docs/
│   │   │   │           ├── SPRINT-1-DB-VALIDATION.md
│   │   │   │           ├── SPRINT-1-E2E-TEST-REPORT.md
│   │   │   │           └── ... (all Sprint 1 docs)
│   │   │   ├── sprint-02/
│   │   │   │   └── deliverables/
│   │   │   │       └── docs/
│   │   │   │           ├── SPRINT-2-DEPLOYMENT-CHECKLIST.md
│   │   │   │           └── ... (all Sprint 2 docs)
│   │   │   ├── sprint-03/
│   │   │   ├── sprint-04/
│   │   │   ├── sprint-05/
│   │   │   ├── sprint-06/
│   │   │   └── sprint-07/
│   │   ├── EPIC-2.5-READY-TO-EXECUTE.md
│   │   ├── STATUS-UPDATE-SUMMARY.md
│   │   └── SPRINT-STRUCTURE-REORGANIZATION-COMPLETE.md
│   ├── qa/
│   │   ├── EPIC-01-VERIFICATION-REPORT.md
│   │   ├── QA-REPORT-EPIC-01-FOUNDATION.md
│   │   ├── TESTING-GUIDE.md
│   │   ├── TESTING-QUICK-REFERENCE.md
│   │   ├── TESTING-REPORT.md
│   │   └── SQL-VALIDATION-REPORT.md
│   ├── deployment/
│   │   ├── DEPLOYMENT-GUIDE.md
│   │   └── DEPLOYMENT-SUCCESS.md
│   ├── migration/
│   │   ├── APPLY-MIGRATIONS-NOW.md
│   │   ├── AUTOMATED-MIGRATION-GUIDE.md
│   │   ├── MIGRATION-APPLICATION-GUIDE.md
│   │   ├── MIGRATION-INSTRUCTIONS.md
│   │   ├── RUN-MIGRATIONS-NOW.md
│   │   └── RUN-MIGRATIONS.md
│   ├── CURSOR-CLAUDE-WORKFLOW.md
│   ├── CURSOR-SYNC-STATUS.md
│   ├── GEMINI-USAGE-GUIDE.md
│   ├── GEMINI.md
│   ├── KNOWN-ISSUES.md
│   ├── QUICK-START.md
│   ├── REPLICATION-SUMMARY.md
│   ├── REVIEW-RESOLUTION.md
│   ├── SECURITY-ALERT.md
│   ├── SETUP-SENTRY-NOW.md
│   ├── SYNC-COMPLETE.md
│   └── TIMELINE-QUICKSTART.md
└── src/
```

---

## ✅ Expected Result

### Project Root
- **Before:** 56 .md files
- **After:** 4-5 essential files (CLAUDE.md, PROJECT-STRUCTURE.md, START-HERE.md, QUICK-REFERENCE.md)
- **Reduction:** 90%+ cleanup

### Sprint Folders
- All sprint deliverables organized in `sprint-XX/deliverables/docs/`
- Clear separation of planning vs. execution artifacts

### Documentation
- Organized by category (qa/, deployment/, migration/)
- Easy to find what you need

---

## 🚀 Execution Steps

1. Create missing directories (docs/qa/, docs/deployment/, docs/migration/)
2. Move sprint files to sprint-XX/deliverables/docs/
3. Delete duplicate sprint files
4. Move QA/testing files to docs/qa/
5. Move deployment files to docs/deployment/
6. Move migration files to docs/migration/
7. Move working docs to docs/planning/
8. Move misc docs to docs/
9. Verify all moves complete
10. Clean up empty directories

---

**Execute?** Ready to run cleanup when you approve.
