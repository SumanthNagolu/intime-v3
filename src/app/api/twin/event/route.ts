/**
 * Twin Event Bus API
 *
 * Epic: AI Twin Living Organism
 *
 * Emit and retrieve events from the twin event bus.
 *
 * @route POST /api/twin/event - Emit an event
 * @route GET /api/twin/event - Get events for current user's role
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TwinEventBus, type CreateEventInput } from '@/lib/ai/twins/TwinEventBus';
import type { TwinRole } from '@/types/productivity';
import { z } from 'zod';

// Validation schema for event creation
const createEventSchema = z.object({
  sourceRole: z.enum([
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer',
  ]),
  targetRole: z.enum([
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer',
  ]).optional().nullable(),
  eventType: z.enum([
    'placement_complete', 'bench_ending', 'training_graduate',
    'deal_closed', 'escalation', 'approval_needed',
    'milestone_reached', 'cross_sell_opportunity', 'custom',
  ]),
  payload: z.record(z.unknown()).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

/**
 * Emit an event to the twin event bus
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id, employee_role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Parse and validate request
    const body = await request.json();
    const parseResult = createEventSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const eventInput = parseResult.data;

    // Create event bus and emit
    const eventBus = new TwinEventBus(profile.org_id, user.id, supabase);
    const eventId = await eventBus.emit(eventInput as CreateEventInput);

    return NextResponse.json({
      success: true,
      eventId,
      message: `Event emitted to ${eventInput.targetRole || 'all'}`,
    });
  } catch (error) {
    console.error('[TwinEvent] POST Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to emit event' },
      { status: 500 }
    );
  }
}

/**
 * Get events for the current user's role
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('org_id, employee_role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const unprocessedOnly = searchParams.get('unprocessed') !== 'false';

    // Get role from profile
    const role = mapEmployeeRoleToTwinRole(profile.employee_role);
    if (!role) {
      return NextResponse.json({ error: 'Invalid employee role' }, { status: 400 });
    }

    // Create event bus and get events
    const eventBus = new TwinEventBus(profile.org_id, user.id, supabase);
    const events = await eventBus.getEventsForRole(role, {
      limit,
      unprocessedOnly,
    });

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('[TwinEvent] GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get events' },
      { status: 500 }
    );
  }
}

/**
 * Map employee role to twin role
 */
function mapEmployeeRoleToTwinRole(employeeRole: string | null): TwinRole | null {
  if (!employeeRole) return null;

  const roleMap: Record<string, TwinRole> = {
    ceo: 'ceo',
    admin: 'admin',
    administrator: 'admin',
    super_admin: 'admin',
    recruiter: 'recruiter',
    junior_recruiter: 'recruiter',
    senior_recruiter: 'recruiter',
    bench_sales: 'bench_sales',
    junior_bench_sales: 'bench_sales',
    senior_bench_sales: 'bench_sales',
    talent_acquisition: 'talent_acquisition',
    ta: 'talent_acquisition',
    junior_ta: 'talent_acquisition',
    senior_ta: 'talent_acquisition',
    hr: 'hr',
    hr_manager: 'hr',
    hr_specialist: 'hr',
    immigration: 'immigration',
    immigration_specialist: 'immigration',
    trainer: 'trainer',
    academy_admin: 'trainer',
  };

  return roleMap[employeeRole.toLowerCase()] || null;
}
