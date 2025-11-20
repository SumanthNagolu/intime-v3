#!/bin/bash

# Copy Migration 021 to clipboard for safe paste

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${BOLD}${BLUE}╔════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${BLUE}║      MIGRATION 021 - AUTOMATED COPY TO CLIPBOARD             ║${RESET}"
echo -e "${BOLD}${BLUE}╚════════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Check if migration file exists
MIGRATION_FILE="src/lib/db/migrations/021_add_sprint_5_features.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo -e "${RED}❌ Migration file not found: $MIGRATION_FILE${RESET}"
  exit 1
fi

# Copy to clipboard
cat "$MIGRATION_FILE" | pbcopy

echo -e "${GREEN}✅ Migration 021 copied to clipboard${RESET}"
echo ""
echo -e "${YELLOW}Next steps:${RESET}"
echo -e "  1. Open: ${GREEN}https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy/sql/new${RESET}"
echo -e "  2. Press ${BOLD}Cmd+V${RESET} to paste the migration"
echo -e "  3. Click ${GREEN}\"Run\"${RESET}"
echo -e "  4. Come back here and press Enter when done"
echo ""

# Wait for user confirmation
read -p "Press Enter after you've applied the migration in Supabase dashboard..."

echo ""
echo -e "${YELLOW}Running verification...${RESET}"
echo ""

# Run verification
source .env.local
pnpm exec tsx scripts/verify-migration-021.ts

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}${BOLD}✅ MIGRATION 021 APPLIED SUCCESSFULLY${RESET}"
  echo ""
else
  echo ""
  echo -e "${RED}${BOLD}❌ VERIFICATION FAILED${RESET}"
  echo -e "${YELLOW}Please check the Supabase SQL Editor for errors${RESET}"
  echo ""
  exit 1
fi
