#!/bin/bash
# Pre-Edit Hook - Validates file paths before allowing edits

# Get file path from environment variable passed by Gemini Code
FILE_PATH="${CLAUDE_FILE_PATH:-}"

if [ -z "$FILE_PATH" ]; then
  echo "⚠️  No file path provided"
  exit 0
fi

# Blocked patterns
BLOCKED_PATTERNS=(
  "node_modules/"
  ".git/"
  ".next/"
  "dist/"
  "build/"
  ".vercel/"
)

# Check if file path matches any blocked pattern
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if [[ "$FILE_PATH" == *"$pattern"* ]]; then
    echo "❌ BLOCKED: Cannot edit files in $pattern"
    echo "   File: $FILE_PATH"
    exit 2  # Exit code 2 blocks the operation
  fi
done

# Check if file is too large (>10MB)
if [ -f "$FILE_PATH" ]; then
  FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null)
  MAX_SIZE=$((10 * 1024 * 1024))  # 10MB

  if [ "$FILE_SIZE" -gt "$MAX_SIZE" ]; then
    echo "❌ BLOCKED: File too large (>10MB)"
    echo "   File: $FILE_PATH"
    echo "   Size: $(( FILE_SIZE / 1024 / 1024 ))MB"
    exit 2
  fi
fi

# Check if file is binary (basic check)
if [ -f "$FILE_PATH" ] && file "$FILE_PATH" | grep -q "binary"; then
  echo "⚠️  WARNING: File appears to be binary"
  echo "   File: $FILE_PATH"
  # Allow but warn (exit 0)
fi

echo "✅ File edit allowed: $FILE_PATH"
exit 0
