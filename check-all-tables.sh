#!/bin/bash
# Check all tables in database

SUPABASE_URL="https://gkwhxmvugnjwwwiufmdy.supabase.co"
EDGE_FUNCTION_URL="${SUPABASE_URL}/functions/v1/execute-sql"

echo "🔍 Checking all public tables..."
SQL_QUERY="SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

RESPONSE=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL_QUERY\"}")

echo "$RESPONSE" | jq -r '.rows[]' 2>/dev/null || echo "$RESPONSE"
