#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  InTime v3 - Test Data Reset & Seed                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check for required environment variable
if [ -z "$SUPABASE_DB_URL" ]; then
  echo "❌ Error: SUPABASE_DB_URL environment variable not set"
  echo ""
  echo "Please set it in your .env.local file or export it:"
  echo "  export SUPABASE_DB_URL='postgresql://...'"
  exit 1
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Step 1: Cleanup
echo "🧹 Step 1: Cleaning up existing test data..."
psql "$SUPABASE_DB_URL" -f "$SCRIPT_DIR/cleanup-test-users.sql" -q
if [ $? -eq 0 ]; then
  echo "   ✅ Cleanup completed"
else
  echo "   ❌ Cleanup failed"
  exit 1
fi

echo ""

# Step 2: Seed
echo "🌱 Step 2: Seeding comprehensive test data..."
psql "$SUPABASE_DB_URL" -f "$SCRIPT_DIR/seed-comprehensive-test-data.sql" -q
if [ $? -eq 0 ]; then
  echo "   ✅ Seed completed"
else
  echo "   ❌ Seed failed"
  exit 1
fi

echo ""

# Step 3: Verify
echo "🔍 Step 3: Verifying test data..."
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) as users FROM user_profiles WHERE email LIKE '%@intime.com' AND deleted_at IS NULL;" -q
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) as roles FROM roles WHERE is_system_role = true;" -q
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) as assignments FROM user_roles;" -q

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ Database seeding completed!                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📖 Next: Create Supabase Auth users"
echo "   Run: npm run seed:auth"
echo ""
echo "   Or manually in Supabase Dashboard:"
echo "   - Email: [from TEST-CREDENTIALS.md]"
echo "   - Password: TestPass123!"
echo "   - Email Verified: Yes"
echo ""
