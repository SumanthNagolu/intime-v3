#!/bin/bash
#
# Deployment script for AI-PROD-001: Screenshot Agent
#
# This script:
# 1. Creates Supabase Storage bucket
# 2. Applies database migration
# 3. Verifies deployment
#

set -e

echo "🚀 Deploying AI-PROD-001: Desktop Screenshot Agent"
echo "=================================================="
echo ""

# Check environment
if [ -z "$SUPABASE_PROJECT_REF" ]; then
  echo "❌ Error: SUPABASE_PROJECT_REF not set"
  echo "   Run: export SUPABASE_PROJECT_REF=your-project-ref"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_KEY not set"
  echo "   Run: export SUPABASE_SERVICE_KEY=your-service-key"
  exit 1
fi

echo "✅ Environment variables configured"
echo ""

# Step 1: Create Storage Bucket
echo "📦 Step 1: Creating Supabase Storage bucket..."
echo ""

# Check if bucket exists
BUCKET_EXISTS=$(curl -s \
  "https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/bucket/employee-screenshots" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  | grep -c "\"name\":\"employee-screenshots\"" || true)

if [ "$BUCKET_EXISTS" -gt 0 ]; then
  echo "✅ Bucket 'employee-screenshots' already exists"
else
  echo "Creating bucket 'employee-screenshots'..."

  curl -X POST \
    "https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/bucket" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -d '{
      "id": "employee-screenshots",
      "name": "employee-screenshots",
      "public": false,
      "file_size_limit": 5242880,
      "allowed_mime_types": ["image/jpeg", "image/png"]
    }'

  echo ""
  echo "✅ Bucket created successfully"
fi

echo ""

# Step 2: Apply Database Migration
echo "🗄️  Step 2: Applying database migration..."
echo ""

# Use Supabase CLI if available, otherwise use psql
if command -v supabase &> /dev/null; then
  echo "Using Supabase CLI..."
  supabase db push
else
  echo "Using psql..."

  if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL not set"
    echo "   Run: export DATABASE_URL=postgresql://..."
    exit 1
  fi

  psql "$DATABASE_URL" -f supabase/migrations/20251120200000_employee_screenshots.sql
fi

echo ""
echo "✅ Migration applied successfully"
echo ""

# Step 3: Verify Deployment
echo "🔍 Step 3: Verifying deployment..."
echo ""

# Check if table exists
TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'employee_screenshots');" 2>/dev/null || echo "f")

if [ "$TABLE_EXISTS" = " t" ]; then
  echo "✅ Table 'employee_screenshots' created"
else
  echo "❌ Error: Table not found"
  exit 1
fi

# Check RLS enabled
RLS_ENABLED=$(psql "$DATABASE_URL" -t -c "SELECT relrowsecurity FROM pg_class WHERE relname = 'employee_screenshots';" 2>/dev/null || echo "f")

if [ "$RLS_ENABLED" = " t" ]; then
  echo "✅ Row Level Security enabled"
else
  echo "⚠️  Warning: RLS not enabled"
fi

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo ""
echo "Next Steps:"
echo "1. Build screenshot agent: cd services/screenshot-agent && pnpm install && pnpm build"
echo "2. Test locally: pnpm dev"
echo "3. Deploy to office desktops using installation scripts"
echo ""
echo "Admin UI available at: /admin/screenshots"
echo ""
