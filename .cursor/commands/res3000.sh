#!/bin/bash
# Kill process on port 3000 and restart dev server

echo "Killing process on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "No process found on port 3000"

echo "Starting dev server..."
cd /Users/sumanthrajkumarnagolu/Projects/intime-v3
NODE_TLS_REJECT_UNAUTHORIZED=0 pnpm dev







