#!/bin/bash

# Setup Development Authentication
# Makes auth easier for local development

echo "🔧 InTime - Development Auth Setup"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "❌ .env.local not found!"
  echo "Please create .env.local first"
  exit 1
fi

# Extract Supabase project ID
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
PROJECT_ID=$(echo $SUPABASE_URL | sed 's|https://||' | cut -d '.' -f1)

echo "📋 Your Supabase Project Info:"
echo "   URL: $SUPABASE_URL"
echo "   Project ID: $PROJECT_ID"
echo ""

echo "🔗 Quick Links:"
echo "   Auth Settings: https://app.supabase.com/project/$PROJECT_ID/auth/settings"
echo "   Users: https://app.supabase.com/project/$PROJECT_ID/auth/users"
echo "   Database: https://app.supabase.com/project/$PROJECT_ID/database/tables"
echo ""

echo "✅ Steps to disable email confirmation:"
echo "   1. Click the Auth Settings link above"
echo "   2. Scroll to 'Email Auth' section"
echo "   3. UNCHECK 'Confirm email' checkbox"
echo "   4. Click 'Save'"
echo ""

echo "🧪 After disabling email confirmation, test with:"
echo "   pnpm test:auth"
echo "   (or: npx tsx scripts/test-auth.ts)"
echo ""

echo "📖 Full documentation:"
echo "   docs/setup/DEVELOPMENT-AUTH-SETUP.md"
echo ""
