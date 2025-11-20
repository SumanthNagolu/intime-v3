/**
 * Course Event Handlers
 *
 * Handlers for course-related events (graduation, enrollment, etc.)
 */

import { registerEventHandler } from '../decorators';
import type { Event, CourseGraduatedPayload } from '../types';
import { createClient } from '@/lib/supabase/server';

/**
 * When student graduates, create candidate profile
 *
 * This demonstrates cross-module integration via events:
 * Academy module publishes 'course.graduated' → Recruiting module creates candidate
 *
 * @param event - course.graduated event
 */
export async function handleCourseGraduated(event: Event<CourseGraduatedPayload>) {
  const { studentId, courseName, grade } = event.payload;

  console.log(`[Handler:create_candidate_profile] Processing graduation for student ${studentId}`);

  const supabase = await createClient();

  try {
    // Grant candidate role
    await supabase.rpc('grant_role_to_user', {
      p_user_id: studentId,
      p_role_name: 'candidate'
    });

    // Update user profile with candidate status
    await supabase
      .from('user_profiles')
      .update({
        candidate_status: 'bench',
        candidate_ready_for_placement: grade >= 80 // Only if grade is B or higher
      })
      .eq('id', studentId);

    console.log(`[Handler:create_candidate_profile] Student ${studentId} promoted to candidate after completing ${courseName} (grade: ${grade})`);
  } catch (error) {
    console.error(`[Handler:create_candidate_profile] Failed to create candidate profile:`, error);
    throw error;
  }
}

/**
 * Notify recruiting team of new graduate
 *
 * @param event - course.graduated event
 */
export async function notifyRecruitingTeam(event: Event<CourseGraduatedPayload>) {
  const { studentId, courseName, grade } = event.payload;

  console.log(`[Handler:notify_recruiting_team] Notifying team about new graduate`);

  // In Sprint 2, just log. In future sprints, send Slack notification
  console.log(`[Handler:notify_recruiting_team] New graduate available: Student ${studentId} completed ${courseName} with grade ${grade}`);

  // TODO: Send Slack notification to recruiting channel
  /*
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🎓 New graduate available!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `Student ${studentId} completed *${courseName}* with grade *${grade}*`
          }
        }
      ]
    })
  });
  */
}

// Register handlers
registerEventHandler('course.graduated', 'create_candidate_profile', handleCourseGraduated);
registerEventHandler('course.graduated', 'notify_recruiting_team', notifyRecruitingTeam);
