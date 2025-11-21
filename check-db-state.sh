#!/bin/bash
# Check database state

SUPABASE_URL="https://gkwhxmvugnjwwwiufmdy.supabase.co"
EDGE_FUNCTION_URL="${SUPABASE_URL}/functions/v1/execute-sql"

echo "================================================"
echo "Database State Check"
echo "================================================"
echo ""

# Check table count
echo "1. Total table count:"
SQL="SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public';"
curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL\"}" | jq '.rows[0][0]' 2>/dev/null || echo "Error"

echo ""

# Check for specific critical tables
echo "2. Critical tables exist:"
for TABLE in "organizations" "user_profiles" "roles" "user_roles" "ai_agents" "ai_interactions"; do
  SQL="SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = '$TABLE') as exists;"
  RESULT=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
    -H "Content-Type: application/json" \
    -d "{\"sql\":\"$SQL\"}" | jq -r '.rows[0][0]' 2>/dev/null)

  if [ "$RESULT" = "t" ]; then
    echo "  ✅ $TABLE"
  else
    echo "  ❌ $TABLE"
  fi
done

echo ""

# Check for Guru table
echo "3. Sprint 4 Guru tables:"
SQL="SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'guidewire_guru_interactions') as exists;"
RESULT=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL\"}" | jq -r '.rows[0][0]' 2>/dev/null)

if [ "$RESULT" = "t" ]; then
  echo "  ✅ guidewire_guru_interactions (Migration 019 applied)"
else
  echo "  ❌ guidewire_guru_interactions (Migration 019 NOT applied)"
fi

echo ""

# Check pgvector extension
echo "4. pgvector extension:"
SQL="SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') as exists;"
RESULT=$(curl -s -X POST "$EDGE_FUNCTION_URL" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\":\"$SQL\"}" | jq -r '.rows[0][0]' 2>/dev/null)

if [ "$RESULT" = "t" ]; then
  echo "  ✅ pgvector installed"
else
  echo "  ❌ pgvector NOT installed"
fi

echo ""
echo "================================================"
