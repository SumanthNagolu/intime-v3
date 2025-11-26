/**
 * Cron Job: Generate Morning Briefings
 *
 * Story: AI-TWIN-001
 *
 * Runs daily to generate personalized morning briefings for all employees.
 * Runs at 9 AM local time.
 *
 * Schedule: Daily at 9 AM (0 9 * * *)
 *
 * @route POST /api/cron/generate-morning-briefings
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmployeeTwin } from '@/lib/ai/twins/EmployeeTwin';
import { createClient } from '@/lib/supabase/server';
import type { TwinRole } from '@/types/productivity';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution

/**
 * Verify cron secret (prevent unauthorized access)
 */
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return false;
  }

  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) {
    console.warn('[MorningBriefings] CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${expectedSecret}`;
}

/**
 * Generate morning briefings for all employees
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[MorningBriefings] Starting batch briefing generation');

    // Get all employees with their roles
    const { data: employees, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, employee_role')
      .not('employee_role', 'is', null) // Only employees with roles
      .eq('is_active', true);

    if (error) {
      console.error('[MorningBriefings] Error fetching employees:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!employees || employees.length === 0) {
      console.log('[MorningBriefings] No employees found');
      return NextResponse.json({
        success: true,
        stats: {
          briefingsGenerated: 0,
          durationMs: Date.now() - startTime,
        },
      });
    }

    console.log(`[MorningBriefings] Generating briefings for ${employees.length} employees`);

    let generated = 0;
    let failed = 0;

    for (const employee of employees) {
      try {
        // Check preferences - skip if disabled
        const { data: prefs } = await supabase
          .from('twin_preferences')
          .select('enable_morning_briefing')
          .eq('user_id', employee.id)
          .single();

        if (prefs && prefs.enable_morning_briefing === false) {
          console.log(`[MorningBriefings] Skipping ${employee.email} (disabled by user)`);
          continue;
        }

        // Map employee role to twin role
        const role = mapEmployeeRoleToTwinRole(employee.employee_role);
        if (!role) {
          console.log(`[MorningBriefings] Skipping ${employee.email} (unknown role: ${employee.employee_role})`);
          continue;
        }

        // Generate briefing
        const twin = new EmployeeTwin(employee.id, role);
        await twin.generateMorningBriefing();

        generated++;
      } catch (error) {
        console.error(`[MorningBriefings] Failed for ${employee.email}:`, error);
        failed++;
      }
    }

    const durationMs = Date.now() - startTime;

    console.log(
      `[MorningBriefings] Job complete: ${generated} generated, ${failed} failed in ${durationMs}ms`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees: employees.length,
        briefingsGenerated: generated,
        failed,
        durationMs,
      },
    });
  } catch (error) {
    console.error('[MorningBriefings] Job failed:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
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
    recruiter: 'recruiter',
    trainer: 'trainer',
    bench_sales: 'bench_sales',
    admin: 'admin',
    administrator: 'admin',
  };

  return roleMap[employeeRole.toLowerCase()] || null;
}

/**
 * Manual trigger (for testing)
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  return POST(request);
}
