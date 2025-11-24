#!/bin/bash

# SAFE MIGRATION 021 APPLICATION SCRIPT
# This script applies migration 021 with proper safety checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         SAFE MIGRATION 021 APPLICATION                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Step 1: Verify environment
echo -e "\n${BOLD}Step 1: Verifying Environment${NC}"

if [ ! -f .env.local ]; then
    echo -e "${RED}❌ ERROR: .env.local not found${NC}"
    exit 1
fi

source .env.local

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Step 2: Check migration file exists
echo -e "\n${BOLD}Step 2: Checking Migration File${NC}"

MIGRATION_FILE="src/lib/db/migrations/021_add_sprint_5_features.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}❌ ERROR: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

FILE_SIZE=$(wc -l < "$MIGRATION_FILE")
echo -e "${GREEN}✅ Migration file found (${FILE_SIZE} lines)${NC}"

# Step 3: Preview migration (first 30 lines)
echo -e "\n${BOLD}Step 3: Migration Preview${NC}"
echo -e "${YELLOW}First 30 lines of migration:${NC}\n"
head -30 "$MIGRATION_FILE"
echo -e "\n${YELLOW}... (showing first 30 of ${FILE_SIZE} lines)${NC}"

# Step 4: Ask for confirmation
echo -e "\n${BOLD}${YELLOW}Step 4: MANUAL CONFIRMATION REQUIRED${NC}"
echo -e "${YELLOW}This migration will create:${NC}"
echo "  - candidate_embeddings table (pgvector)"
echo "  - requisition_embeddings table (pgvector)"
echo "  - resume_matches table"
echo "  - generated_resumes table"
echo "  - 3 PostgreSQL functions"
echo "  - RLS policies for all tables"
echo ""
echo -e "${BOLD}${RED}⚠️  WARNING: This will modify the production database!${NC}"
echo ""
read -p "Type 'YES' to proceed with migration: " confirmation

if [ "$confirmation" != "YES" ]; then
    echo -e "${RED}❌ Migration cancelled by user${NC}"
    exit 1
fi

# Step 5: Create backup marker
echo -e "\n${BOLD}Step 5: Creating Backup Marker${NC}"
BACKUP_TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_MARKER="backup_before_migration_021_${BACKUP_TIMESTAMP}.txt"

echo "Migration 021 applied at: $(date)" > "$BACKUP_MARKER"
echo "Supabase URL: $NEXT_PUBLIC_SUPABASE_URL" >> "$BACKUP_MARKER"
echo "Migration file: $MIGRATION_FILE" >> "$BACKUP_MARKER"

echo -e "${GREEN}✅ Backup marker created: $BACKUP_MARKER${NC}"
echo -e "${YELLOW}ℹ️  Supabase maintains automatic backups - restore from dashboard if needed${NC}"

# Step 6: Apply migration via Supabase SQL Editor (instructions)
echo -e "\n${BOLD}Step 6: Applying Migration${NC}"
echo -e "${YELLOW}⚠️  MANUAL STEP REQUIRED:${NC}"
echo ""
echo "Due to connection issues with psql, please apply migration manually:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/gkwhxmvugnjwwwiufmdy/editor"
echo "2. Open a new SQL query"
echo "3. Copy and paste the contents of: $MIGRATION_FILE"
echo "4. Click 'Run' to execute"
echo "5. Verify no errors appear"
echo ""
read -p "Press ENTER after you've applied the migration in Supabase dashboard..."

# Step 7: Verify migration applied
echo -e "\n${BOLD}Step 7: Verifying Migration${NC}"

# Use the Node.js verification script
if [ -f "scripts/verify-migration-021.ts" ]; then
    echo "Running verification script..."
    pnpm exec tsx scripts/verify-migration-021.ts
else
    echo -e "${YELLOW}⚠️  Verification script not found, skipping automated verification${NC}"
    echo "Please manually verify in Supabase dashboard that these tables exist:"
    echo "  - candidate_embeddings"
    echo "  - requisition_embeddings"
    echo "  - resume_matches"
    echo "  - generated_resumes"
fi

echo -e "\n${BOLD}${GREEN}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         MIGRATION 021 APPLICATION COMPLETE                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${GREEN}✅ Migration 021 applied successfully${NC}"
echo -e "${YELLOW}ℹ️  Backup marker saved to: $BACKUP_MARKER${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify tables in Supabase dashboard"
echo "  2. Test basic queries"
echo "  3. Proceed with Vercel deployment"
