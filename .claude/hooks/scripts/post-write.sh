#!/bin/bash
# Post-Write Hook - Auto-formats files after writing

FILE_PATH="${CLAUDE_FILE_PATH:-}"

if [ -z "$FILE_PATH" ]; then
  echo "⚠️  No file path provided"
  exit 0
fi

echo "🔧 Running post-write formatting..."

# Only format if pnpm is available
if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm not found, skipping formatting"
  exit 0
fi

# Only format TypeScript/JavaScript/JSON files
FILE_EXT="${FILE_PATH##*.}"

case "$FILE_EXT" in
  ts|tsx|js|jsx|json|md)
    echo "   Formatting: $FILE_PATH"

    # Run Prettier if available
    if [ -f "node_modules/.bin/prettier" ]; then
      pnpm prettier --write "$FILE_PATH" 2>&1 | grep -v "^$"
      if [ $? -eq 0 ]; then
        echo "✅ Formatted successfully"
      else
        echo "⚠️  Prettier formatting failed (non-blocking)"
      fi
    else
      echo "⚠️  Prettier not installed, skipping formatting"
    fi
    ;;
  *)
    echo "   Skipping formatting for .$FILE_EXT files"
    ;;
esac

exit 0  # Always succeed (formatting is non-blocking)
