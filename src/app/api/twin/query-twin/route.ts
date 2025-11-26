/**
 * Twin Direct Query API
 *
 * Epic: AI Twin Living Organism
 *
 * Query another twin directly (synchronous communication).
 *
 * @route POST /api/twin/query-twin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TwinDirectory } from '@/lib/ai/twins/TwinDirectory';
import type { TwinRole } from '@/types/productivity';
import { z } from 'zod';

// Validation schema
const queryTwinSchema = z.object({
  targetRole: z.enum([
    'ceo', 'admin', 'recruiter', 'bench_sales',
    'talent_acquisition', 'hr', 'immigration', 'trainer',
  ]),
  question: z.string().min(1).max(2000),
  includeContext: z.boolean().optional(),
});

/**
 * Query another twin directly
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
    const parseResult = queryTwinSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { targetRole, question, includeContext } = parseResult.data;

    // Get source role
    const sourceRole = mapEmployeeRoleToTwinRole(profile.employee_role);
    if (!sourceRole) {
      return NextResponse.json({ error: 'Invalid employee role' }, { status: 400 });
    }

    // Create directory and query
    const directory = new TwinDirectory(profile.org_id, user.id, { supabase });
    const result = await directory.queryTwin(sourceRole, targetRole, question, {
      includeContext,
    });

    return NextResponse.json({
      success: true,
      answer: result.answer,
      respondingRole: result.respondingRole,
      conversationId: result.conversationId,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    console.error('[QueryTwin] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to query twin' },
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
