#!/bin/bash
# Post-Developer Hook - Quality checks after Developer Agent completes

echo "🔍 Running post-development quality checks..."
echo ""

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm not found, skipping quality checks"
  exit 0
fi

# Check if package.json exists (Node.js project)
if [ ! -f "package.json" ]; then
  echo "⚠️  No package.json found, skipping quality checks"
  exit 0
fi

FAILED=0

# 1. TypeScript Type Checking
echo "📋 1/4: TypeScript compilation..."
if pnpm type-check 2>&1; then
  echo "   ✅ TypeScript compilation passed"
else
  echo "   ❌ TypeScript compilation failed"
  FAILED=1
fi
echo ""

# 2. ESLint
echo "🔍 2/4: ESLint validation..."
if pnpm lint 2>&1; then
  echo "   ✅ ESLint passed"
else
  echo "   ⚠️  ESLint issues found (warnings allowed)"
  # Don't fail on lint warnings
fi
echo ""

# 3. Unit Tests
echo "🧪 3/4: Running unit tests..."
if pnpm test 2>&1; then
  echo "   ✅ All tests passed"
else
  echo "   ❌ Tests failed"
  FAILED=1
fi
echo ""

# 4. Production Build
echo "🏗️  4/4: Production build test..."
if pnpm build 2>&1; then
  echo "   ✅ Build successful"
else
  echo "   ❌ Build failed"
  FAILED=1
fi
echo ""

# Summary
if [ $FAILED -eq 0 ]; then
  echo "✅ All post-development checks passed!"
  echo ""
  echo "Next steps:"
  echo "  1. Review implementation-log.md"
  echo "  2. Route to QA Agent for comprehensive testing"
  echo "  3. Then deploy via Deployment Agent"
  exit 0
else
  echo "❌ Post-development checks failed"
  echo ""
  echo "Please fix the issues above before proceeding to QA."
  echo ""
  exit 2  # Exit code 2 blocks proceeding
fi
