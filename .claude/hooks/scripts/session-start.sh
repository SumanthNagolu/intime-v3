#!/bin/bash
# Session Start Hook - Display project status when Claude Code starts

echo "┌─────────────────────────────────────────────────┐"
echo "│  🚀 InTime v3 - Project Status                 │"
echo "└─────────────────────────────────────────────────┘"
echo ""

# Git Status
if command -v git &> /dev/null && [ -d ".git" ]; then
  BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  STATUS=$(git status --short 2>/dev/null | wc -l | tr -d ' ')

  echo "📦 Git Status"
  echo "   Branch: $BRANCH"

  if [ "$STATUS" -gt 0 ]; then
    echo "   Changes: $STATUS uncommitted files"
  else
    echo "   Changes: Working directory clean ✅"
  fi

  # Recent commits
  echo ""
  echo "📝 Recent Commits"
  git log --oneline -3 2>/dev/null | sed 's/^/   /'
fi

echo ""

# Node/pnpm Status
if command -v pnpm &> /dev/null; then
  NODE_VERSION=$(node --version 2>/dev/null || echo "unknown")
  PNPM_VERSION=$(pnpm --version 2>/dev/null || echo "unknown")

  echo "🔧 Development Environment"
  echo "   Node: $NODE_VERSION"
  echo "   pnpm: $PNPM_VERSION"
else
  echo "⚠️  pnpm not installed"
  echo "   Install: npm install -g pnpm"
fi

echo ""

# Check for environment file
if [ -f ".env.local" ]; then
  echo "🔐 Environment: .env.local exists ✅"
else
  echo "⚠️  Environment: .env.local not found"
  echo "   Copy .env.local.example to .env.local and fill in values"
fi

echo ""

# MCP Status
if [ -f ".mcp.json" ]; then
  MCP_COUNT=$(grep -o '"[^"]*":' .mcp.json | grep -v "mcpServers" | wc -l | tr -d ' ')
  echo "🔌 MCP Servers: $MCP_COUNT configured"
else
  echo "⚠️  .mcp.json not found"
fi

echo ""

# Claude Code Setup
if [ -f ".claude/AGENTS-REFERENCE.md" ]; then
  echo "🤖 Claude Code: Simplified setup ✅"
  echo "   See .claude/QUICK-COMMANDS.md for usage"
else
  echo "⚠️  Claude Code setup incomplete"
fi

echo ""

# Quick Tips
echo "💡 Quick Tips"
echo "   Read .claude/QUICK-COMMANDS.md for common patterns"
echo "   Read .claude/AGENTS-REFERENCE.md to understand expertise areas"
echo "   Just talk directly - no complex workflows needed!"

echo ""
echo "┌─────────────────────────────────────────────────┐"
echo "│  Ready to build! 🚀                            │"
echo "└─────────────────────────────────────────────────┘"
echo ""

exit 0
