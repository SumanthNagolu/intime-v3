# Project Timeline System

**Status:** ✅ Implemented
**Version:** 1.0.0
**Created:** 2025-11-17

---

## 📚 Overview

The Project Timeline System is a comprehensive logging and history tracking solution for InTime v3. It captures every interaction with Claude Code, including conversations, decisions, actions, outcomes, and context.

### Key Features

- 📝 **Comprehensive Logging** - Captures conversations, decisions, assumptions, and results
- 🔍 **Full-Text Search** - PostgreSQL tsvector-based search across all entries
- 📊 **Rich Dashboard** - Next.js UI for visualizing and filtering timeline
- ⚡ **CLI Tool** - Quick command-line interface for logging
- 🤖 **Auto-Capture** - Session hooks automatically log data
- 🗄️ **Database + File Storage** - Dual storage for flexibility
- 📈 **Analytics** - Statistics, trends, and insights

---

## 🏗️ Architecture

### Components

1. **Database Layer** (`src/lib/db/`)
   - PostgreSQL tables via Drizzle ORM
   - Full-text search with tsvector
   - Row-level security (RLS)
   - Audit trails

2. **CLI Tool** (`tools/timeline-cli.ts`)
   - Quick entry logging
   - Session management
   - Search and statistics
   - File-based fallback

3. **Dashboard UI** (`src/app/admin/timeline/`)
   - Server Components for data fetching
   - Client Components for interactivity
   - Filtering and search
   - Real-time statistics

4. **Auto-Capture Hooks** (`.claude/hooks/scripts/`)
   - Session start/end hooks
   - Git integration
   - Auto-tagging based on file changes

---

## 📊 Database Schema

### `project_timeline` Table

Stores individual timeline entries with rich metadata.

**Key Fields:**
- `session_id` - Groups related entries
- `conversation_summary` - Main description
- `user_intent` - What the user wanted to accomplish
- `actions_taken` - JSONB array of completed actions
- `files_changed` - Created/modified/deleted files
- `decisions` - Important decisions with reasoning
- `assumptions` - Assumptions made during work
- `results` - Outcome status and metrics
- `future_notes` - TODOs and follow-ups
- `tags` - Categorization tags
- `search_vector` - Full-text search index

### `session_metadata` Table

Tracks session-level information.

**Key Fields:**
- `session_id` - Unique session identifier
- `started_at` / `ended_at` - Session duration
- `branch` - Git branch
- `commit_hash` - Git commit
- `files_modified`, `lines_added`, `lines_removed` - Statistics
- `overall_goal` - Session objective
- `successfully_completed` - Success indicator

### Helper Views

- `v_timeline_recent` - Recent entries with session metadata
- `v_timeline_stats_by_tag` - Tag statistics
- `v_session_summary` - Session summaries with aggregated data

---

## 🚀 Usage

### 1. Database Setup

Run the migration in Supabase:

```bash
# Copy the SQL from src/lib/db/migrations/001_create_timeline_tables.sql
# Run in Supabase SQL Editor
```

### 2. CLI Usage

#### Add a Timeline Entry

```bash
# Basic entry
pnpm timeline add "Implemented user authentication"

# With tags and status
pnpm timeline add "Fixed bug in payment flow" \
  --tags bug,payment \
  --status success

# With decision and note
pnpm timeline add "Refactored database schema" \
  --tags database,refactor \
  --decision "Use soft deletes instead of hard deletes" \
  --note "Need to add cleanup job for old deleted records"
```

#### Session Management

```bash
# Start a new session
pnpm timeline session start "Working on authentication feature"

# End current session
pnpm timeline session end

# View current session
pnpm timeline session current
```

#### List and Search

```bash
# List recent entries
pnpm timeline list

# List with limit
pnpm timeline list --limit 20

# Filter by session
pnpm timeline list --session session-2025-11-17-abc123

# Search timeline
pnpm timeline search "authentication"

# View statistics
pnpm timeline stats
```

### 3. Dashboard UI

Access the dashboard at:

```
http://localhost:3000/admin/timeline
```

**Features:**
- 📊 Statistics cards (entries, sessions, success rate, files changed)
- 🔍 Search and filter controls
- 🏷️ Tag filtering
- 📋 Expandable entry cards
- 📈 Status breakdown charts

### 4. Programmatic Usage

```typescript
import {
  createTimelineEntry,
  upsertSession,
  getTimelineEntries,
  searchTimeline,
} from '@/lib/db/timeline';

// Create an entry
await createTimelineEntry({
  sessionId: 'session-001',
  conversationSummary: 'Implemented feature X',
  userIntent: 'Add new functionality',
  tags: ['feature', 'ui'],
  results: {
    status: 'success',
    summary: 'Feature completed and tested',
  },
});

// Search
const results = await searchTimeline('authentication');

// Get entries with filters
const entries = await getTimelineEntries({
  tags: ['database'],
  startDate: new Date('2025-11-01'),
  limit: 50,
});
```

### 5. Auto-Capture via Hooks

The system automatically captures session data when:

1. **Session Starts** - Records session metadata
2. **Session Ends** - Logs git changes, tags, and summary

To enable/disable auto-capture:

```bash
# Enable (default)
export CLAUDE_AUTO_LOG_SESSION=true

# Disable
export CLAUDE_AUTO_LOG_SESSION=false
```

---

## 📂 File Structure

```
intime-v3/
├── src/
│   ├── app/
│   │   └── admin/
│   │       └── timeline/
│   │           └── page.tsx           # Dashboard page
│   ├── components/
│   │   └── timeline/
│   │       ├── TimelineList.tsx       # Entry list
│   │       ├── TimelineEntry.tsx      # Entry card
│   │       ├── TimelineFilters.tsx    # Filter controls
│   │       └── TimelineStats.tsx      # Statistics
│   └── lib/
│       └── db/
│           ├── schema/
│           │   └── timeline.ts        # Drizzle schema
│           ├── migrations/
│           │   └── 001_create_timeline_tables.sql
│           └── timeline.ts            # Helper functions
├── tools/
│   └── timeline-cli.ts                # CLI tool
├── .claude/
│   ├── hooks/
│   │   └── scripts/
│   │       ├── session-start.sh
│   │       └── session-end.sh         # Auto-capture hook
│   └── state/
│       └── timeline/                  # File-based storage
└── docs/
    └── PROJECT-TIMELINE-SYSTEM.md     # This file
```

---

## 🎯 Use Cases

### 1. Project Biography

Create a comprehensive history of the project:

```bash
# Daily standup - what was accomplished
pnpm timeline add "Completed authentication flow" \
  --tags auth,milestone \
  --status success

# Decision tracking
pnpm timeline add "Chose PostgreSQL over MongoDB" \
  --decision "Better support for complex queries and transactions" \
  --tags architecture,database
```

### 2. Learning Journal

Track assumptions and learnings:

```bash
pnpm timeline add "Implemented real-time updates with Supabase" \
  --assumption "Real-time subscriptions work with RLS policies" \
  --note "Need to test with large datasets"
```

### 3. Audit Trail

Maintain compliance and accountability:

```bash
pnpm timeline add "Updated user permissions" \
  --tags security,compliance \
  --decision "Implemented role-based access control" \
  --status success
```

### 4. Performance Analysis

Track productivity and velocity:

```bash
# View statistics
pnpm timeline stats

# Analyze by tags
pnpm timeline search "bug" | grep "status: success"
```

---

## 🔧 Configuration

### Environment Variables

```env
# Database connection (for when DB is set up)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Auto-logging
CLAUDE_AUTO_LOG_SESSION=true
```

### Customization

#### Add Custom Tags

Edit `.claude/hooks/scripts/session-end.sh` to add auto-detection:

```bash
if echo "$CHANGED_FILES" | grep -q "your-pattern"; then
    TAGS="$TAGS,your-tag"
fi
```

#### Modify Dashboard

Edit components in `src/components/timeline/` to customize:
- Entry card layout
- Statistics calculations
- Filter options
- Search behavior

---

## 🚦 Current Status

### ✅ Completed

- Database schema and migrations
- TypeScript types and helpers
- CLI tool with full functionality
- Dashboard UI with search and filters
- Auto-capture hooks
- File-based fallback storage
- Documentation

### 🚧 Pending

- [ ] Supabase database setup
- [ ] Database client configuration
- [ ] AI-generated summaries
- [ ] Export functionality (CSV, JSON, PDF)
- [ ] Email notifications for milestones
- [ ] Timeline visualization (Gantt chart)
- [ ] Integration with git commits (auto-link)

### 🔮 Future Enhancements

- Real-time updates via Supabase subscriptions
- AI-powered insights and patterns
- Team collaboration features
- Mobile app for timeline access
- Integration with project management tools
- Automated reporting and digests

---

## 📖 Examples

### Example 1: Feature Development Session

```bash
# Start session
pnpm timeline session start "Implement user profile feature"

# Log design decision
pnpm timeline add "Designed user profile schema" \
  --tags database,design \
  --decision "Separate table for profile data to keep auth table lean"

# Log implementation
pnpm timeline add "Implemented profile CRUD operations" \
  --tags api,feature \
  --status success

# Log testing
pnpm timeline add "Added tests for profile endpoints" \
  --tags testing \
  --status success

# End session
pnpm timeline session end --success
```

### Example 2: Bug Fix

```bash
pnpm timeline add "Fixed infinite loop in data sync" \
  --tags bug,critical \
  --decision "Added cycle detection to prevent infinite recursion" \
  --assumption "Users won't create deeply nested structures (>100 levels)" \
  --note "Monitor for performance impact" \
  --status success
```

### Example 3: Research and Planning

```bash
pnpm timeline add "Researched authentication options" \
  --tags research,auth \
  --decision "Will use Supabase Auth for simplicity and integration" \
  --assumption "Built-in MFA will be sufficient for our needs" \
  --note "Revisit if enterprise customers need SSO"
```

---

## 🛠️ Troubleshooting

### CLI Not Working

```bash
# Make sure dependencies are installed
pnpm install

# Check if tsx is available
pnpm tsx --version

# Try running directly
tsx tools/timeline-cli.ts add "Test entry"
```

### Hook Not Running

```bash
# Check if script is executable
chmod +x .claude/hooks/scripts/session-end.sh

# Test hook manually
bash .claude/hooks/scripts/session-end.sh

# Check settings.json syntax
cat .claude/settings.json | jq .
```

### Dashboard Not Loading

```bash
# Make sure Next.js dependencies are installed
pnpm install

# Start dev server
pnpm dev

# Check for TypeScript errors
pnpm tsc --noEmit
```

---

## 📚 Related Documentation

- [Project Setup Architecture](/docs/audit/project-setup-architecture.md)
- [User Vision](/docs/audit/user-vision.md)
- [Implementation Guide](/docs/audit/implementation-guide.md)
- [Claude Code Hooks](/.claude/hooks/CLAUDE.md)

---

## 🤝 Contributing

When adding new features to the timeline system:

1. Update database schema if needed (new migration)
2. Update TypeScript types
3. Update CLI commands
4. Update dashboard UI
5. Update this documentation
6. Add tests

---

**Last Updated:** 2025-11-17
**Maintained By:** InTime v3 Team
**Status:** Production Ready (file-based), Database Setup Pending
