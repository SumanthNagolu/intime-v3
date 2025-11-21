/**
 * Cron Job: Generate Proactive Suggestions
 *
 * Story: AI-TWIN-001
 *
 * Runs 3 times daily to generate personalized proactive suggestions for employees.
 * Runs at 11 AM, 2 PM, and 4 PM local time.
 *
 * Schedule: 11 AM (0 11 * * *), 2 PM (0 14 * * *), 4 PM (0 16 * * *)
 *
 * @route POST /api/cron/generate-proactive-suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { EmployeeTwin } from '@/lib/ai/twins/EmployeeTwin';
import { createClient } from '@/lib/supabase/client';
import type { TwinRole } from '@/types/productivity';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max execution

const supabase = createClient();

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
    console.warn('[ProactiveSuggestions] CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${expectedSecret}`;
}

/**
 * Generate proactive suggestions for all employees
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[ProactiveSuggestions] Starting batch suggestion generation');

    // Get all employees with their roles
    const { data: employees, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, employee_role')
      .not('employee_role', 'is', null)
      .eq('is_active', true);

    if (error) {
      console.error('[ProactiveSuggestions] Error fetching employees:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!employees || employees.length === 0) {
      console.log('[ProactiveSuggestions] No employees found');
      return NextResponse.json({
        success: true,
        stats: {
          suggestionsGenerated: 0,
          durationMs: Date.now() - startTime,
        },
      });
    }

    console.log(`[ProactiveSuggestions] Generating suggestions for ${employees.length} employees`);

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (const employee of employees) {
      try {
        // Check preferences
        const { data: prefs } = await supabase
          .from('twin_preferences')
          .select('enable_proactive_suggestions, suggestion_frequency')
          .eq('user_id', employee.id)
          .single();

        if (prefs && prefs.enable_proactive_suggestions === false) {
          console.log(`[ProactiveSuggestions] Skipping ${employee.email} (disabled by user)`);
          skipped++;
          continue;
        }

        // Check if we've already hit frequency limit for today
        const todayCount = await getTodaySuggestionCount(employee.id);
        const maxSuggestions = prefs?.suggestion_frequency || 3;

        if (todayCount >= maxSuggestions) {
          console.log(
            `[ProactiveSuggestions] Skipping ${employee.email} (limit reached: ${todayCount}/${maxSuggestions})`
          );
          skipped++;
          continue;
        }

        // Map employee role to twin role
        const role = mapEmployeeRoleToTwinRole(employee.employee_role);
        if (!role) {
          console.log(
            `[ProactiveSuggestions] Skipping ${employee.email} (unknown role: ${employee.employee_role})`
          );
          skipped++;
          continue;
        }

        // Generate suggestion (may return null if no actionable items)
        const twin = new EmployeeTwin(employee.id, role);
        const suggestion = await twin.generateProactiveSuggestion();

        if (suggestion) {
          generated++;
        } else {
          console.log(`[ProactiveSuggestions] No actionable items for ${employee.email}`);
          skipped++;
        }
      } catch (error) {
        console.error(`[ProactiveSuggestions] Failed for ${employee.email}:`, error);
        failed++;
      }
    }

    const durationMs = Date.now() - startTime;

    console.log(
      `[ProactiveSuggestions] Job complete: ${generated} generated, ${skipped} skipped, ${failed} failed in ${durationMs}ms`
    );

    return NextResponse.json({
      success: true,
      stats: {
        totalEmployees: employees.length,
        suggestionsGenerated: generated,
        skipped,
        failed,
        durationMs,
      },
    });
  } catch (error) {
    console.error('[ProactiveSuggestions] Job failed:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get count of suggestions already generated today for a user
 */
async function getTodaySuggestionCount(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('employee_twin_interactions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('interaction_type', 'suggestion')
    .gte('created_at', `${today}T00:00:00Z`)
    .lt('created_at', `${today}T23:59:59Z`);

  if (error) {
    console.error('[ProactiveSuggestions] Error counting suggestions:', error);
    return 0;
  }

  return data ? (data as unknown as { count: number }).count : 0;
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
