#!/bin/bash
# Check current migration status

SUPABASE_URL="https://gkwhxmvugnjwwwiufmdy.supabase.co"
EDGE_FUNCTION_URL="${SUPABASE_URL}/functions/v1/execute-sql"

# Check what tables exist
SQL_QUERY="SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE '%guidewire%' ORDER BY tablename;"

echo "🔍 Checking for Guidewire-related tables..."
echo ""

RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL_QUERY\"}")

echo "$RESPONSE" | jq '.'

echo ""
echo "🔍 Checking if guidewire_guru_interactions table exists..."
SQL_CHECK="SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guidewire_guru_interactions');"

RESPONSE2=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL_CHECK\"}")

echo "$RESPONSE2" | jq '.'
