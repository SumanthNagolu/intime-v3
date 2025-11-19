# FOUND-009: Implement Event History and Replay

**Story Points:** 3
**Sprint:** Sprint 2 (Week 3-4)
**Priority:** MEDIUM

---

## User Story

As a **System Administrator**,
I want **to view event history and replay failed events**,
So that **I can debug issues and recover from temporary failures**.

---

## Acceptance Criteria

- [ ] Event history viewer shows all events with filters (type, status, date range)
- [ ] Dead letter queue viewer shows events that failed after 3 retries
- [ ] Manual replay functionality for individual events
- [ ] Bulk replay for all failed events (with confirmation)
- [ ] Event details modal shows full payload, metadata, error messages
- [ ] Timeline view shows event processing flow
- [ ] Export events to CSV/JSON for analysis

---

## Technical Implementation

### API Routes

Create file: `src/app/api/admin/events/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth/server';
import { checkPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  const session = await requireAuth();

  // Check admin permission
  const isAdmin = await checkPermission(session.user.id, 'system', 'admin');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get('type');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '100');
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = createAdminClient();

  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventType) {
    query = query.eq('type', eventType);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data, total: count });
}
```

Create file: `src/app/api/admin/events/replay/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { eventBus } from '@/lib/events/event-bus';
import { requireAuth } from '@/lib/auth/server';
import { checkPermission } from '@/lib/rbac';

export async function POST(request: Request) {
  const session = await requireAuth();

  // Check admin permission
  const isAdmin = await checkPermission(session.user.id, 'system', 'admin');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { eventIds } = await request.json();

  if (!Array.isArray(eventIds) || eventIds.length === 0) {
    return NextResponse.json(
      { error: 'eventIds must be a non-empty array' },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Get events
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .in('id', eventIds)
    .in('status', ['failed', 'dead_letter']);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Reset status to pending
  await supabase
    .from('events')
    .update({
      status: 'pending',
      retry_count: 0,
      error_message: null
    })
    .in('id', eventIds);

  // Republish events
  for (const event of events || []) {
    await eventBus.publish(
      event.type,
      event.payload,
      { ...event.metadata, replayed: true },
      event.created_by
    );
  }

  return NextResponse.json({
    success: true,
    replayed: events?.length || 0
  });
}
```

Create file: `src/app/api/admin/events/export/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth/server';
import { checkPermission } from '@/lib/rbac';

export async function GET(request: Request) {
  const session = await requireAuth();

  // Check admin permission
  const isAdmin = await checkPermission(session.user.id, 'system', 'admin');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const eventType = searchParams.get('type');
  const status = searchParams.get('status');

  const supabase = createAdminClient();

  let query = supabase
    .from('events')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(1000);

  if (eventType) {
    query = query.eq('type', eventType);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (format === 'csv') {
    const csv = convertToCSV(data || []);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=events.csv'
      }
    });
  }

  // JSON format
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=events.json'
    }
  });
}

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row =>
    Object.values(row)
      .map(val => `"${String(val).replace(/"/g, '""')}"`)
      .join(',')
  );

  return [headers, ...rows].join('\n');
}
```

### Event History UI

Create file: `src/app/admin/events/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface Event {
  id: string;
  type: string;
  payload: any;
  metadata: any;
  published_at: string;
  processed_at?: string;
  status: 'pending' | 'processed' | 'failed' | 'dead_letter';
  retry_count: number;
  error_message?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchEvents();
  }, [selectedType, selectedStatus]);

  const fetchEvents = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);

    const res = await fetch(`/api/admin/events?${params}`);
    const data = await res.json();

    setEvents(data.events || []);
    setLoading(false);
  };

  const replaySelectedEvents = async () => {
    if (selectedEvents.size === 0) return;

    const confirmed = confirm(
      `Replay ${selectedEvents.size} events? This will republish them.`
    );

    if (!confirmed) return;

    await fetch('/api/admin/events/replay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventIds: Array.from(selectedEvents) })
    });

    setSelectedEvents(new Set());
    fetchEvents();
  };

  const exportEvents = async (format: 'json' | 'csv') => {
    const params = new URLSearchParams();
    params.set('format', format);
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);

    const url = `/api/admin/events/export?${params}`;
    window.open(url, '_blank');
  };

  const toggleEventSelection = (eventId: string) => {
    const newSet = new Set(selectedEvents);
    if (newSet.has(eventId)) {
      newSet.delete(eventId);
    } else {
      newSet.add(eventId);
    }
    setSelectedEvents(newSet);
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'pending':
        return 'default';
      case 'failed':
        return 'warning';
      case 'dead_letter':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Event History</h1>

        <div className="flex gap-2">
          <Button onClick={() => exportEvents('json')} variant="outline">
            Export JSON
          </Button>
          <Button onClick={() => exportEvents('csv')} variant="outline">
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="user.created">user.created</SelectItem>
            <SelectItem value="course.graduated">course.graduated</SelectItem>
            <SelectItem value="candidate.placed">candidate.placed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="dead_letter">Dead Letter</SelectItem>
          </SelectContent>
        </Select>

        {selectedEvents.size > 0 && (
          <Button onClick={replaySelectedEvents} variant="default">
            Replay {selectedEvents.size} Events
          </Button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => toggleEventSelection(event.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedEvents.has(event.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleEventSelection(event.id);
                    }}
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{event.type}</span>
                      <Badge variant={statusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(event.published_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  {event.retry_count > 0 && (
                    <p className="text-xs text-red-600">
                      Retries: {event.retry_count}
                    </p>
                  )}
                  {event.error_message && (
                    <p className="text-xs text-red-600 max-w-xs truncate">
                      {event.error_message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Dependencies

- **Requires:** FOUND-007 (event bus), FOUND-008 (subscriptions)
- **Used by:** Admins for debugging

---

## Testing Checklist

- [ ] Event history displays all events
- [ ] Filters work (type, status)
- [ ] Event selection and bulk replay works
- [ ] Export to JSON works
- [ ] Export to CSV works
- [ ] Failed events can be individually replayed
- [ ] Replayed events republished successfully

---

## Documentation Updates

- [ ] Add admin guide for event troubleshooting
- [ ] Document replay best practices
- [ ] Add guide for analyzing event patterns

---

## Related Stories

- **Depends on:** FOUND-007, FOUND-008

---

**Created:** 2025-11-18
**Assigned:** TBD
**Status:** Ready for Development
