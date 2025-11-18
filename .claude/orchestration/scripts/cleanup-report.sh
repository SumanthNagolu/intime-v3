#!/bin/bash
# Generate cleanup report showing current project state

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    InTime v3 - Cleanup Report                              ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Active Files
echo "📁 ACTIVE FILES"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "Core Components (8 files):"
ls -lh .claude/orchestration/core/*.ts | awk '{printf "  %-30s %8s\n", $9, $5}'
echo ""
echo "Workflows (3 files):"
ls -lh .claude/orchestration/workflows/*.ts | awk '{printf "  %-30s %8s\n", $9, $5}'
echo ""
echo "Active Tests (3 files):"
ls -lh .claude/orchestration/test-*.ts 2>/dev/null | awk '{printf "  %-30s %8s\n", $9, $5}'
echo ""
echo "Scripts (1 file):"
ls -lh .claude/orchestration/scripts/*.ts 2>/dev/null | awk '{printf "  %-30s %8s\n", $9, $5}'
echo ""

# Archived Files
echo "🗄️  ARCHIVED FILES"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
if [ -d ".archive" ]; then
  echo "Archives:"
  find .archive -type d -name "202*" | while read dir; do
    echo "  📦 $(basename $dir)"
    ls -lh "$dir"/*.ts 2>/dev/null | awk '{printf "     %-30s %8s\n", $9, $5}'
  done
  echo ""
  echo "Retention: 30 days from archive date"
  echo ""
else
  echo "  No archives found"
  echo ""
fi

# Statistics
echo "📊 STATISTICS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
CORE_LINES=$(find .claude/orchestration/core -name "*.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')
WORKFLOW_LINES=$(find .claude/orchestration/workflows -name "*.ts" -exec wc -l {} + | tail -1 | awk '{print $1}')
TEST_LINES=$(find .claude/orchestration -name "test-*.ts" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
TOTAL_ACTIVE=$((CORE_LINES + WORKFLOW_LINES + TEST_LINES))

echo "  Core Components:     $(printf "%'6d" $CORE_LINES) lines"
echo "  Workflows:           $(printf "%'6d" $WORKFLOW_LINES) lines"
echo "  Active Tests:        $(printf "%'6d" $TEST_LINES) lines"
echo "  ─────────────────────────────"
echo "  Total Active Code:   $(printf "%'6d" $TOTAL_ACTIVE) lines"
echo ""

if [ -d ".archive" ]; then
  ARCHIVED_LINES=$(find .archive -name "*.ts" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
  echo "  Archived Code:       $(printf "%'6d" $ARCHIVED_LINES) lines"
  echo ""
fi

# Documentation Status
echo "📚 DOCUMENTATION STATUS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
if [ -f "PROJECT-STRUCTURE.md" ]; then
  echo "  ✅ PROJECT-STRUCTURE.md ($(stat -f%z PROJECT-STRUCTURE.md) bytes)"
else
  echo "  ❌ PROJECT-STRUCTURE.md missing"
fi
if [ -f ".claude/orchestration/FILE-STRUCTURE.md" ]; then
  echo "  ✅ FILE-STRUCTURE.md ($(stat -f%z .claude/orchestration/FILE-STRUCTURE.md) bytes)"
else
  echo "  ❌ FILE-STRUCTURE.md missing"
fi
if [ -f ".archive/README.md" ]; then
  echo "  ✅ Archive Policy ($(stat -f%z .archive/README.md) bytes)"
else
  echo "  ❌ Archive Policy missing"
fi
echo ""

# Next Steps
echo "🎯 RECOMMENDED NEXT STEPS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo "  1. Review archived files (can be deleted after 2025-12-16)"
echo "  2. Update documentation: pnpm exec tsx .claude/orchestration/scripts/update-docs.ts"
echo "  3. Begin feature development: /start-planning"
echo ""
echo "════════════════════════════════════════════════════════════════════════════"

