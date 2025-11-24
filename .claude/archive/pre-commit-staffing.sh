#!/bin/bash
# Pre-Commit Hook for Staffing Platform Quality Gates
# Enforces InTime-specific requirements: RLS, audit trails, GDPR compliance

echo "🔍 Running InTime Staffing Platform Quality Checks..."
echo ""

ERRORS=0
WARNINGS=0

# ============================================
# Quality Gate 1: Database Schema Validation
# ============================================

echo "📊 Quality Gate 1: Database Schema Validation"

# Check for RLS on all new table migrations
NEW_MIGRATIONS=$(git diff --cached --name-only --diff-filter=A | grep "drizzle/migrations/.*\.sql")

if [ -n "$NEW_MIGRATIONS" ]; then
  for migration in $NEW_MIGRATIONS; do
    if ! grep -q "ENABLE ROW LEVEL SECURITY" "$migration"; then
      echo "  ❌ ERROR: Missing RLS in migration: $migration"
      echo "     All tables must have Row Level Security enabled"
      ERRORS=$((ERRORS + 1))
    fi

    if ! grep -q "CREATE POLICY" "$migration"; then
      echo "  ❌ ERROR: Missing RLS policies in migration: $migration"
      echo "     All tables must have at least org_isolation policy"
      ERRORS=$((ERRORS + 1))
    fi

    # Check for audit columns
    if ! grep -q "created_at.*TIMESTAMPTZ" "$migration"; then
      echo "  ⚠️  WARNING: Missing created_at audit field in: $migration"
      WARNINGS=$((WARNINGS + 1))
    fi

    if ! grep -q "updated_at.*TIMESTAMPTZ" "$migration"; then
      echo "  ⚠️  WARNING: Missing updated_at audit field in: $migration"
      WARNINGS=$((WARNINGS + 1))
    fi

    if ! grep -q "deleted_at.*TIMESTAMPTZ" "$migration"; then
      echo "  ⚠️  WARNING: Missing deleted_at (soft delete) field in: $migration"
      WARNINGS=$((WARNINGS + 1))
    fi

    # Check for org_id (multi-tenancy)
    if grep -q "CREATE TABLE" "$migration" && ! grep -q "org_id.*UUID" "$migration"; then
      echo "  ❌ ERROR: Missing org_id (multi-tenancy) in: $migration"
      echo "     All tables must have org_id for organization isolation"
      ERRORS=$((ERRORS + 1))
    fi
  done
fi

if [ $ERRORS -eq 0 ]; then
  echo "  ✅ Database schema validation passed"
fi

echo ""

# ============================================
# Quality Gate 2: Staffing Business Logic
# ============================================

echo "📋 Quality Gate 2: Staffing Business Logic Validation"

# Check for candidate-related files
CANDIDATE_FILES=$(git diff --cached --name-only | grep -E "(candidate|job|placement|pod|cross-pollination)")

if [ -n "$CANDIDATE_FILES" ]; then
  for file in $CANDIDATE_FILES; do
    # Skip if file doesn't exist (deleted)
    if [ ! -f "$file" ]; then
      continue
    fi

    # Check TypeScript/JavaScript files for staffing-specific patterns
    if [[ "$file" == *.ts || "$file" == *.tsx || "$file" == *.js || "$file" == *.jsx ]]; then

      # Ensure RLS is considered in database queries
      if grep -q "db\.query\|db\.select\|db\.insert\|db\.update" "$file"; then
        if ! grep -q "orgId\|org_id" "$file"; then
          echo "  ⚠️  WARNING: Database query without org_id check in: $file"
          echo "     Ensure multi-tenancy is enforced (check may be in RLS policy)"
          WARNINGS=$((WARNINGS + 1))
        fi
      fi

      # Check for hard deletes (should use soft delete)
      if grep -q "db\.delete" "$file" && ! grep -q "deleted_at\|deletedAt" "$file"; then
        echo "  ⚠️  WARNING: Potential hard delete detected in: $file"
        echo "     Use soft deletes (set deleted_at timestamp) for candidate/client data"
        WARNINGS=$((WARNINGS + 1))
      fi

      # Check for PII handling (email, phone, SSN)
      if grep -E "ssn|socialSecurity|taxId" "$file"; then
        if ! grep -q "encrypt\|hash\|mask\|redact" "$file"; then
          echo "  ❌ ERROR: Unprotected PII (SSN) detected in: $file"
          echo "     Sensitive data must be encrypted/hashed"
          ERRORS=$((ERRORS + 1))
        fi
      fi
    fi
  done
fi

if [ $ERRORS -eq 0 ]; then
  echo "  ✅ Staffing business logic validation passed"
fi

echo ""

# ============================================
# Quality Gate 3: Cross-Pollination Tracking
# ============================================

echo "🔄 Quality Gate 3: Cross-Pollination Tracking"

# Check if interaction logging is present in client/candidate workflows
INTERACTION_FILES=$(git diff --cached --name-only | grep -E "(client|candidate|interaction|workflow)")

if [ -n "$INTERACTION_FILES" ]; then
  for file in $INTERACTION_FILES; do
    if [ ! -f "$file" ]; then
      continue
    fi

    if [[ "$file" == *.ts || "$file" == *.tsx ]]; then
      # Check for client interaction logging
      if grep -q "createClient\|updateClient\|logCall\|recordInteraction" "$file"; then
        if ! grep -q "crossPollination\|opportunity\|detectOpportunities" "$file"; then
          echo "  ⚠️  REMINDER: Consider cross-pollination tracking in: $file"
          echo "     Client interactions should detect opportunities across pillars"
          # Not counted as warning - just a reminder
        fi
      fi
    fi
  done
fi

echo "  ✅ Cross-pollination check complete"
echo ""

# ============================================
# Quality Gate 4: Performance & Scalability
# ============================================

echo "⚡ Quality Gate 4: Performance & Scalability"

# Check for N+1 query patterns
DB_FILES=$(git diff --cached --name-only | grep -E "\.ts$|\.tsx$")

if [ -n "$DB_FILES" ]; then
  for file in $DB_FILES; do
    if [ ! -f "$file" ]; then
      continue
    fi

    # Check for loops with database queries (potential N+1)
    if grep -E "for.*\(|forEach|map.*=>" "$file" | grep -q "await.*db\." 2>/dev/null; then
      echo "  ⚠️  WARNING: Potential N+1 query detected in: $file"
      echo "     Use JOIN or batch queries instead of loops with individual queries"
      WARNINGS=$((WARNINGS + 1))
    fi

    # Check for missing indexes on foreign keys
    if grep -q "FOREIGN KEY\|REFERENCES" "$file" && ! grep -q "CREATE INDEX" "$file"; then
      echo "  ⚠️  WARNING: Foreign key without index in: $file"
      echo "     Add indexes for better query performance"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
fi

if [ $ERRORS -eq 0 ]; then
  echo "  ✅ Performance validation passed"
fi

echo ""

# ============================================
# Quality Gate 5: Test Coverage
# ============================================

echo "🧪 Quality Gate 5: Test Coverage"

# Check if new features have corresponding tests
NEW_FEATURES=$(git diff --cached --name-only --diff-filter=A | grep -E "src/.*\.(ts|tsx)$" | grep -v "\.test\." | grep -v "\.spec\.")

if [ -n "$NEW_FEATURES" ]; then
  for feature in $NEW_FEATURES; do
    # Extract feature name without extension
    feature_base=$(echo "$feature" | sed 's/\.tsx\?$//')

    # Check if test file exists
    if [ ! -f "${feature_base}.test.ts" ] && [ ! -f "${feature_base}.test.tsx" ] && [ ! -f "${feature_base}.spec.ts" ]; then
      echo "  ⚠️  WARNING: No test file found for: $feature"
      echo "     Expected: ${feature_base}.test.ts or ${feature_base}.spec.ts"
      WARNINGS=$((WARNINGS + 1))
    fi
  done
fi

echo "  ✅ Test coverage check complete"
echo ""

# ============================================
# Summary
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Quality Gate Summary:"
echo "  ❌ Errors: $ERRORS"
echo "  ⚠️  Warnings: $WARNINGS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "❌ Commit BLOCKED: Fix errors before committing"
  echo ""
  echo "InTime Quality Standards:"
  echo "  1. All tables must have RLS enabled"
  echo "  2. All tables must have audit trails (created_at, updated_at, deleted_at)"
  echo "  3. All tables must have org_id for multi-tenancy"
  echo "  4. Use soft deletes (deleted_at), not hard deletes"
  echo "  5. Encrypt sensitive PII (SSN, visa details)"
  echo ""
  exit 1
fi

if [ $WARNINGS -gt 0 ]; then
  echo "⚠️  Commit ALLOWED with $WARNINGS warning(s)"
  echo "   Review warnings and address if applicable"
  echo ""
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All quality gates passed! InTime standards maintained."
  echo ""
fi

exit 0
