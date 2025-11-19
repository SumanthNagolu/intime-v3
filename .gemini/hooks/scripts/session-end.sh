#!/bin/bash

###############################################################################
# Session End Hook
#
# Automatically captures session data when a Gemini Code session ends.
#
# This hook:
# 1. Collects git changes since session start
# 2. Generates a summary of the session
# 3. Logs the session to the timeline
# 4. Optionally prompts for additional context
###############################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Capturing session data...${NC}"

# Get current session ID
SESSION_ID=""
if [ -f ".gemini/state/current-session.txt" ]; then
    SESSION_ID=$(cat .gemini/state/current-session.txt)
else
    # Generate session ID based on date
    SESSION_ID="session-$(date +%Y-%m-%d)-$(uuidgen | cut -c1-8)"
    mkdir -p .gemini/state
    echo "$SESSION_ID" > .gemini/state/current-session.txt
fi

# Get git information
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Get changed files
CHANGED_FILES=$(git diff --name-only 2>/dev/null | tr '\n' ',' || echo "")
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | tr '\n' ',' || echo "")

# Count changes
FILES_MODIFIED=$(git diff --name-only 2>/dev/null | wc -l || echo "0")
LINES_ADDED=$(git diff --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo "0")
LINES_REMOVED=$(git diff --stat 2>/dev/null | tail -1 | grep -oE '[0-9]+ deletion' | grep -oE '[0-9]+' || echo "0")

# Get recent commit messages (if any commits were made)
RECENT_COMMITS=$(git log --oneline -5 --format="%h - %s" 2>/dev/null || echo "No commits")

# Create session summary
SUMMARY="Session on $BRANCH branch"

# Auto-generate tags based on git changes
TAGS=""
if echo "$CHANGED_FILES $UNTRACKED_FILES" | grep -q "schema\|migration\|database"; then
    TAGS="$TAGS,database"
fi
if echo "$CHANGED_FILES $UNTRACKED_FILES" | grep -q "component\|tsx\|jsx"; then
    TAGS="$TAGS,ui"
fi
if echo "$CHANGED_FILES $UNTRACKED_FILES" | grep -q "test\|spec"; then
    TAGS="$TAGS,testing"
fi
if echo "$CHANGED_FILES $UNTRACKED_FILES" | grep -q "doc\|md\|README"; then
    TAGS="$TAGS,documentation"
fi
if echo "$CHANGED_FILES $UNTRACKED_FILES" | grep -q "api\|route"; then
    TAGS="$TAGS,api"
fi
if echo "$CHANGED_FILES $UNTRACKED_FILES" | grep -q "auth"; then
    TAGS="$TAGS,auth"
fi

# Remove leading comma
TAGS=$(echo "$TAGS" | sed 's/^,//')

# Display session info
echo -e "${GREEN}Session Summary:${NC}"
echo "  Session ID: $SESSION_ID"
echo "  Branch: $BRANCH"
echo "  Commit: $COMMIT_HASH"
echo "  Files Modified: $FILES_MODIFIED"
echo "  Lines Added: $LINES_ADDED"
echo "  Lines Removed: $LINES_REMOVED"
if [ -n "$TAGS" ]; then
    echo "  Auto-detected Tags: $TAGS"
fi

# Check if we should auto-log (check for environment variable)
AUTO_LOG=${CLAUDE_AUTO_LOG_SESSION:-true}

if [ "$AUTO_LOG" = "true" ]; then
    echo -e "${BLUE}📝 Auto-logging session to timeline...${NC}"

    # Use the timeline CLI to log the session
    # Build the command
    CMD="pnpm timeline add \"$SUMMARY\""

    if [ -n "$TAGS" ]; then
        CMD="$CMD --tags $TAGS"
    fi

    # Execute the command
    eval "$CMD" 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Timeline CLI not available. Session data saved for manual logging.${NC}"

        # Fallback: create a simple JSON file
        mkdir -p .gemini/state/timeline
        cat > ".gemini/state/timeline/${SESSION_ID}-auto.json" <<EOF
{
  "sessionId": "$SESSION_ID",
  "branch": "$BRANCH",
  "filesModified": $FILES_MODIFIED,
  "linesAdded": $LINES_ADDED,
  "linesRemoved": $LINES_REMOVED,
  "tags": "$TAGS",
  "changedFiles": "$CHANGED_FILES",
  "untrackedFiles": "$UNTRACKED_FILES",
  "recentCommits": "$RECENT_COMMITS"
}
EOF
        echo "  Saved to: .gemini/state/timeline/${SESSION_ID}-auto.json"
    }
else
    echo -e "${YELLOW}Auto-logging disabled. Set CLAUDE_AUTO_LOG_SESSION=true to enable.${NC}"
fi

# Optional: Prompt for additional notes
if [ -t 0 ]; then  # Check if running in interactive terminal
    echo ""
    echo -e "${BLUE}Would you like to add session notes? (y/N)${NC}"
    read -r -t 5 ADD_NOTES || ADD_NOTES="n"

    if [ "$ADD_NOTES" = "y" ] || [ "$ADD_NOTES" = "Y" ]; then
        echo "Enter session notes (or press Ctrl+C to skip):"
        read -r NOTES

        if [ -n "$NOTES" ]; then
            pnpm timeline add "$NOTES" --tags "session-notes,$TAGS" 2>/dev/null || {
                echo -e "${YELLOW}⚠️  Could not log notes via CLI. Please log manually.${NC}"
            }
        fi
    fi
fi

echo -e "${GREEN}✅ Session data captured!${NC}"
echo ""
