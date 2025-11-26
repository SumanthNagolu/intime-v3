/**
 * AI Twin Chat API
 *
 * Story: AI-TWIN-001
 *
 * Handles on-demand Q&A with employee's AI twin.
 *
 * @route POST /api/twin/chat
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmployeeTwin } from '@/lib/ai/twins/EmployeeTwin';
import { createClient } from '@/lib/supabase/server';
import type { TwinRole } from '@/types/productivity';

/**
 * Send message to AI twin
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { question } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('employee_role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    const role = mapEmployeeRoleToTwinRole(profile.employee_role);
    if (!role) {
      return NextResponse.json({ error: 'Invalid employee role' }, { status: 400 });
    }

    // Query twin
    const twin = new EmployeeTwin(user.id, role);
    const result = await twin.query(question);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      conversationId: result.conversationId,
    });
  } catch (error) {
    console.error('[TwinChat] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process question',
      },
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
    // Leadership
    ceo: 'ceo',
    admin: 'admin',
    administrator: 'admin',
    super_admin: 'admin',
    // Revenue Partners
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
    // Support Partners
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
