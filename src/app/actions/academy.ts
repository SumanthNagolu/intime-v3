/**
 * Academy Server Actions
 *
 * Handles academy-specific actions like enrollment checks and callback requests
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

// ============================================================================
// Types
// ============================================================================

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EnrollmentStatus {
  hasActiveEnrollment: boolean;
  enrollments: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    status: string;
    enrolledAt: string;
    completionPercentage: number;
  }>;
}

interface EnrollmentWithCourse {
  id: string;
  course_id: string;
  status: string;
  enrolled_at: string | null;
  completion_percentage: number | null;
  courses: {
    title: string;
  } | null;
}

// ============================================================================
// Check Student Enrollment Status
// ============================================================================

/**
 * Check if the current user has any active course enrollments
 * Students without active enrollments should see the demo page
 */
export async function getStudentEnrollmentStatus(): Promise<ActionResult<EnrollmentStatus>> {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: 'Not authenticated',
    };
  }

  // Get user profile
  const { data: profile } = await adminSupabase
    .from('user_profiles')
    .select('id')
    .eq('auth_id', user.id)
    .is('deleted_at', null)
    .single();

  if (!profile) {
    return {
      success: false,
      error: 'User profile not found',
    };
  }

  // Get active enrollments
  const { data: enrollments, error: enrollmentError } = await adminSupabase
    .from('student_enrollments')
    .select(`
      id,
      course_id,
      status,
      enrolled_at,
      completion_percentage,
      courses!inner (
        title
      )
    `)
    .eq('user_id', profile.id)
    .in('status', ['active', 'completed']);

  if (enrollmentError) {
    console.error('Error fetching enrollments:', enrollmentError);
    return {
      success: false,
      error: 'Failed to fetch enrollments',
    };
  }

  const hasActiveEnrollment = enrollments && enrollments.length > 0;

  return {
    success: true,
    data: {
      hasActiveEnrollment,
      enrollments: (enrollments || []).map((e: EnrollmentWithCourse) => ({
        id: e.id,
        courseId: e.course_id,
        courseTitle: e.courses?.title || 'Unknown Course',
        status: e.status,
        enrolledAt: e.enrolled_at || new Date().toISOString(),
        completionPercentage: e.completion_percentage || 0,
      })),
    },
  };
}

// ============================================================================
// Callback Request Schema
// ============================================================================

const callbackRequestSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  interest: z.string().min(200, 'Please tell us more about your background (min 200 characters)'),
});

type CallbackRequestInput = z.infer<typeof callbackRequestSchema>;

// ============================================================================
// Submit Callback Request
// ============================================================================

/**
 * Submit a callback request from a student interested in the academy
 * This creates a lead record that admins can follow up on
 */
export async function submitCallbackRequest(
  input: CallbackRequestInput
): Promise<ActionResult<{ requestId: string }>> {
  // Validate input
  const validation = callbackRequestSchema.safeParse(input);
  if (!validation.success) {
    const fieldErrors = validation.error.flatten().fieldErrors;
    const firstError = Object.entries(fieldErrors)[0];
    return {
      success: false,
      error: firstError ? `${firstError[1]?.[0]}` : 'Invalid input',
    };
  }

  const { name, email, phone, interest } = validation.data;
  const adminSupabase = createAdminClient();

  // Create a callback request record in audit_logs
  // This will show up in admin reports for follow-up
  const requestId = crypto.randomUUID();

  const { error: auditError } = await adminSupabase
    .from('audit_logs')
    .insert({
      table_name: 'academy_callback_requests',
      action: 'INSERT',
      record_id: requestId,
      user_email: email,
      metadata: {
        name,
        email,
        phone,
        interest,
        source: 'academy_demo_page',
        submitted_at: new Date().toISOString(),
      },
      severity: 'info',
    });

  if (auditError) {
    console.error('Error creating callback request:', auditError);
    return {
      success: false,
      error: 'Failed to submit request. Please try again.',
    };
  }

  return {
    success: true,
    data: { requestId },
  };
}
