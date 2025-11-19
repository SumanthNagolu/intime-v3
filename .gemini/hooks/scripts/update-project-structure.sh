#!/usr/bin/env bash
#
# Auto-Update PROJECT-STRUCTURE.md
# Runs after agent workflows complete and before git commits
#

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Auto-updating PROJECT-STRUCTURE.md...${NC}"

# Run the TypeScript update script
if command -v pnpm &> /dev/null; then
    pnpm exec tsx .gemini/orchestration/scripts/update-project-structure.ts
elif command -v npx &> /dev/null; then
    npx tsx .gemini/orchestration/scripts/update-project-structure.ts
else
    echo "Error: Neither pnpm nor npx found. Cannot run update script."
    exit 1
fi

echo -e "${GREEN}✅ PROJECT-STRUCTURE.md updated successfully${NC}"
