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

# Check if update script exists
UPDATE_SCRIPT="scripts/update-documentation.ts"
if [ ! -f "$UPDATE_SCRIPT" ]; then
  echo "⚠️  Warning: Documentation update script not found at $UPDATE_SCRIPT"
  echo "Documentation will not be auto-updated."
  exit 0
fi

# Run update script
echo ""
echo "📝 Updating documentation after workflow: $WORKFLOW_TYPE"
echo ""

pnpm tsx "$UPDATE_SCRIPT" \
  --workflow "$WORKFLOW_TYPE" \
  --entity "$ENTITY_ID" \
  --timestamp "$TIMESTAMP" \
  --format console

# Save JSON report for reference
pnpm tsx "$UPDATE_SCRIPT" \
  --workflow "$WORKFLOW_TYPE" \
  --entity "$ENTITY_ID" \
  --timestamp "$TIMESTAMP" \
  --format json \
  > .claude/state/last-update-report.json 2>/dev/null || true

echo ""
echo "✅ Documentation update complete"
echo ""
