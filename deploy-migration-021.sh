#!/bin/bash
# Sprint 5 Deployment Script
# Applies migration 021 via Supabase Edge Function

set -e

echo "================================================"
echo "Sprint 5 Production Deployment"
echo "Migration: 021_add_sprint_5_features.sql"
echo "================================================"
echo ""

# Check environment variables
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not set"
  echo "Please set: export SUPABASE_SERVICE_ROLE_KEY=your_key_here"
  exit 1
fi

SUPABASE_URL="https://gkwhxmvugnjwwwiufmdy.supabase.co"
EDGE_FUNCTION_URL="${SUPABASE_URL}/functions/v1/execute-sql"

echo "✅ Environment variables verified"
echo ""

# Read migration SQL
echo "📖 Reading migration file..."
MIGRATION_SQL=$(cat src/lib/db/migrations/021_add_sprint_5_features.sql)

echo "✅ Migration file loaded (660 lines)"
echo ""

# Apply migration via Edge Function
echo "🚀 Applying migration to production..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":$(jq -Rs . <<< "$MIGRATION_SQL")}")

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
# Extract response body (all but last line)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Response Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✅ Migration applied successfully!"
  echo ""
  echo "Response:"
  echo "$BODY" | jq '.'
  
  echo ""
  echo "================================================"
  echo "✅ MIGRATION 021 COMPLETE"
  echo "================================================"
  echo ""
  echo "Next steps:"
  echo "1. Verify tables created"
  echo "2. Check pgvector indexes"
  echo "3. Test database functions"
  echo "4. Deploy to Vercel"
  
  exit 0
else
  echo "❌ Migration failed!"
  echo ""
  echo "Response:"
  echo "$BODY" | jq '.' || echo "$BODY"
  
  exit 1
fi
