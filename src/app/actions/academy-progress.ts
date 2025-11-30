'use server';

/**
 * Academy Progress Server Actions
 * Handles XP, badges, topic completions, quiz attempts, and gamification
 */

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import {
  topicCompletions,
  xpTransactions,
  userXpTotals,
  badges,
  userBadges,
  quizAttempts,
  capstoneSubmissions,
  studentEnrollments,
  courses,
  courseModules,
  moduleTopics,
} from '@/lib/db/schema/academy';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

// =====================================================
// Types
// =====================================================

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  success: boolean;
  data?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface TopicCompletion {
  id: string;
  userId: string;
  enrollmentId: string;
  topicId: string;
  topicTitle: string | null;
  completedAt: string;
}

export interface XPTransaction {
  id: string;
  userId: string;
  amount: number;
  transactionType: string;
  referenceType: string | null;
  referenceId: string | null;
  description: string | null;
  awardedAt: string;
  awardedBy: string | null;
}

export interface UserXPSummary {
  userId: string;
  totalXp: number;
  transactionCount: number;
  level: number;
  xpToNextLevel: number;
  rank: number;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconUrl: string | null;
  xpReward: number;
  rarity: string;
  displayOrder: number;
  isHidden: boolean;
  triggerType: string;
  triggerThreshold: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
  progressValue: number;
  isNew: boolean;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  enrollmentId: string;
  quizId: string;
  score: number;
  passed: boolean;
  attemptedAt: string;
}

export interface CapstoneSubmission {
  id: string;
  userId: string;
  enrollmentId: string;
  courseId: string;
  courseTitle: string | null;
  submissionUrl: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewerName: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string | null;
  totalXp: number;
  badgeCount: number;
  level: number;
}

// =====================================================
// Helper Functions
// =====================================================

async function getCurrentUserContext() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, user.id),
  });

  return profile ? { userId: user.id, orgId: profile.orgId } : null;
}

async function checkPermission(
  userId: string,
  permission: string,
  resourceType?: string,
  resourceId?: string
): Promise<{ allowed: boolean; scope?: string }> {
  const supabase = await createClient();

  const { data, error } = await (supabase.rpc as unknown as (name: string, params: Record<string, string | null>) => Promise<{ data: boolean | null; error: unknown }>)('check_user_permission', {
    p_user_id: userId,
    p_permission: permission,
    p_table_name: resourceType || null,
    p_record_id: resourceId || null,
  });

  if (error) {
    console.error('Permission check error:', error);
    return { allowed: false };
  }

  // RPC returns boolean directly, not an object
  return { allowed: data ?? false };
}

async function logAuditEvent(
  userId: string,
  orgId: string,
  action: string,
  resourceType: string,
  resourceId: string | null,
  details: Record<string, unknown>,
  severity: 'info' | 'warning' | 'critical' = 'info'
) {
  const supabase = await createClient();

  await (supabase.from as unknown as (table: string) => { insert: (data: Record<string, unknown>) => Promise<void> })('audit_logs').insert({
    user_id: userId,
    org_id: orgId,
    action,
    table_name: resourceType,
    record_id: resourceId,
    metadata: details as Record<string, unknown>,
    severity,
    user_ip_address: null,
    user_agent: null,
  });
}

// XP level calculation
function calculateLevel(xp: number): { level: number; xpToNextLevel: number } {
  // Each level requires progressively more XP
  // Level 1: 0-99, Level 2: 100-299, Level 3: 300-599, etc.
  let level = 1;
  let threshold = 100;
  let totalRequired = 0;

  while (xp >= totalRequired + threshold) {
    totalRequired += threshold;
    level++;
    threshold = level * 100; // Each level requires 100 * level XP
  }

  const xpToNextLevel = (totalRequired + threshold) - xp;
  return { level, xpToNextLevel };
}

// =====================================================
// Topic Completion Actions
// =====================================================

export async function completeTopicAction(
  enrollmentId: string,
  topicId: string
): Promise<ActionResult<{ id: string; xpAwarded: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify enrollment belongs to user
    const enrollment = await db.query.studentEnrollments.findFirst({
      where: and(
        eq(studentEnrollments.id, enrollmentId),
        eq(studentEnrollments.user_id, context.userId)
      ),
    });

    if (!enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    // Check if already completed
    const existing = await db.query.topicCompletions.findFirst({
      where: and(
        eq(topicCompletions.enrollment_id, enrollmentId),
        eq(topicCompletions.topic_id, topicId)
      ),
    });

    if (existing) {
      return { success: false, error: 'Topic already completed' };
    }

    // Get topic to determine XP value
    const topic = await db.query.moduleTopics.findFirst({
      where: eq(moduleTopics.id, topicId),
    });

    if (!topic) {
      return { success: false, error: 'Topic not found' };
    }

    // Create completion record
    const [completion] = await db.insert(topicCompletions).values({
      user_id: context.userId,
      enrollment_id: enrollmentId,
      topic_id: topicId,
    }).returning({ id: topicCompletions.id });

    // Award XP based on content type
    let xpAmount = 10; // Default XP
    switch (topic.content_type) {
      case 'video':
        xpAmount = 15;
        break;
      case 'reading':
        xpAmount = 10;
        break;
      case 'quiz':
        xpAmount = 25;
        break;
      case 'lab':
        xpAmount = 50;
        break;
      case 'project':
        xpAmount = 100;
        break;
    }

    // Award XP
    await awardXPAction({
      userId: context.userId,
      amount: xpAmount,
      transactionType: 'topic_completion',
      referenceType: 'topic_completion',
      referenceId: completion.id,
      description: `Completed topic: ${topic.title}`,
    });

    // Update enrollment progress
    await updateEnrollmentProgress(enrollmentId);

    // Check for badges
    await checkAndAwardBadges(context.userId);

    return { success: true, data: { id: completion.id, xpAwarded: xpAmount } };
  } catch (error) {
    console.error('Complete topic error:', error);
    return { success: false, error: 'Failed to complete topic' };
  }
}

async function updateEnrollmentProgress(enrollmentId: string): Promise<void> {
  const enrollment = await db.query.studentEnrollments.findFirst({
    where: eq(studentEnrollments.id, enrollmentId),
  });

  if (!enrollment) return;

  // Get course total topics
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, enrollment.course_id),
  });

  if (!course) return;

  // Count completed topics
  const completedCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(topicCompletions)
    .where(eq(topicCompletions.enrollment_id, enrollmentId));

  const completed = Number(completedCount[0]?.count || 0);
  const total = course.total_topics;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Find next topic
  const completedTopicIds = await db
    .select({ topicId: topicCompletions.topic_id })
    .from(topicCompletions)
    .where(eq(topicCompletions.enrollment_id, enrollmentId));

  const completedIds = completedTopicIds.map(t => t.topicId);

  // Get next incomplete topic
  const modules = await db.query.courseModules.findMany({
    where: eq(courseModules.course_id, course.id),
    orderBy: [asc(courseModules.module_number)],
  });

  let nextModuleId: string | null = null;
  let nextTopicId: string | null = null;

  for (const module of modules) {
    const topics = await db.query.moduleTopics.findMany({
      where: eq(moduleTopics.module_id, module.id),
      orderBy: [asc(moduleTopics.topic_number)],
    });

    for (const topic of topics) {
      if (!completedIds.includes(topic.id)) {
        nextModuleId = module.id;
        nextTopicId = topic.id;
        break;
      }
    }
    if (nextTopicId) break;
  }

  // Update enrollment
  const updateObj: Record<string, unknown> = {
    completion_percentage: percentage,
    current_module_id: nextModuleId,
    current_topic_id: nextTopicId,
    updated_at: new Date(),
  };

  if (percentage >= 100) {
    updateObj.status = 'completed';
    updateObj.completed_at = new Date();
  }

  await db.update(studentEnrollments)
    .set(updateObj)
    .where(eq(studentEnrollments.id, enrollmentId));
}

export async function getTopicCompletionsAction(
  enrollmentId: string
): Promise<ActionResult<TopicCompletion[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const completions = await db
      .select({
        id: topicCompletions.id,
        userId: topicCompletions.user_id,
        enrollmentId: topicCompletions.enrollment_id,
        topicId: topicCompletions.topic_id,
        completedAt: topicCompletions.completed_at,
        topicTitle: moduleTopics.title,
      })
      .from(topicCompletions)
      .leftJoin(moduleTopics, eq(topicCompletions.topic_id, moduleTopics.id))
      .where(eq(topicCompletions.enrollment_id, enrollmentId))
      .orderBy(desc(topicCompletions.completed_at));

    return {
      success: true,
      data: completions.map(c => ({
        id: c.id,
        userId: c.userId,
        enrollmentId: c.enrollmentId,
        topicId: c.topicId,
        topicTitle: c.topicTitle,
        completedAt: c.completedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get topic completions error:', error);
    return { success: false, error: 'Failed to get completions' };
  }
}

// =====================================================
// XP Actions
// =====================================================

const awardXPSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int(),
  transactionType: z.enum([
    'topic_completion', 'quiz_passed', 'lab_completed', 'project_submitted',
    'bonus_achievement', 'badge_earned', 'penalty', 'adjustment'
  ]),
  referenceType: z.enum([
    'topic_completion', 'enrollment', 'achievement', 'badge', 'admin_action'
  ]).optional(),
  referenceId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export async function awardXPAction(
  input: z.infer<typeof awardXPSchema>
): Promise<ActionResult<{ id: string; newTotal: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = awardXPSchema.parse(input);

    // Create transaction
    const [transaction] = await db.insert(xpTransactions).values({
      user_id: validated.userId,
      amount: validated.amount,
      transaction_type: validated.transactionType,
      reference_type: validated.referenceType,
      reference_id: validated.referenceId,
      description: validated.description,
      awarded_by: context.userId,
    }).returning({ id: xpTransactions.id });

    // Update or create XP total
    const existingTotal = await db.query.userXpTotals.findFirst({
      where: eq(userXpTotals.user_id, validated.userId),
    });

    let newTotal: number;
    if (existingTotal) {
      newTotal = existingTotal.total_xp + validated.amount;
      await db.update(userXpTotals)
        .set({
          total_xp: newTotal,
          transaction_count: existingTotal.transaction_count + 1,
          updated_at: new Date(),
        })
        .where(eq(userXpTotals.user_id, validated.userId));
    } else {
      newTotal = validated.amount;
      await db.insert(userXpTotals).values({
        user_id: validated.userId,
        total_xp: newTotal,
        transaction_count: 1,
      });
    }

    return { success: true, data: { id: transaction.id, newTotal } };
  } catch (error) {
    console.error('Award XP error:', error);
    return { success: false, error: 'Failed to award XP' };
  }
}

export async function getMyXPAction(): Promise<ActionResult<UserXPSummary>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const xpTotal = await db.query.userXpTotals.findFirst({
      where: eq(userXpTotals.user_id, context.userId),
    });

    const totalXp = xpTotal?.total_xp || 0;
    const { level, xpToNextLevel } = calculateLevel(totalXp);

    // Calculate rank
    const higherRanked = await db
      .select({ count: sql<number>`count(*)` })
      .from(userXpTotals)
      .where(sql`total_xp > ${totalXp}`);

    const rank = Number(higherRanked[0]?.count || 0) + 1;

    return {
      success: true,
      data: {
        userId: context.userId,
        totalXp,
        transactionCount: xpTotal?.transaction_count || 0,
        level,
        xpToNextLevel,
        rank,
      },
    };
  } catch (error) {
    console.error('Get my XP error:', error);
    return { success: false, error: 'Failed to get XP' };
  }
}

export async function getXPHistoryAction(
  userId?: string,
  limit: number = 50
): Promise<ActionResult<XPTransaction[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const targetUserId = userId || context.userId;

    // Users can view their own history; admins can view anyone's
    if (targetUserId !== context.userId) {
      const { allowed } = await checkPermission(context.userId, 'academy:admin');
      if (!allowed) {
        return { success: false, error: 'Permission denied' };
      }
    }

    const transactions = await db.query.xpTransactions.findMany({
      where: eq(xpTransactions.user_id, targetUserId),
      orderBy: [desc(xpTransactions.awarded_at)],
      limit,
    });

    return {
      success: true,
      data: transactions.map(t => ({
        id: t.id,
        userId: t.user_id,
        amount: t.amount,
        transactionType: t.transaction_type,
        referenceType: t.reference_type,
        referenceId: t.reference_id,
        description: t.description,
        awardedAt: t.awarded_at.toISOString(),
        awardedBy: t.awarded_by,
      })),
    };
  } catch (error) {
    console.error('Get XP history error:', error);
    return { success: false, error: 'Failed to get XP history' };
  }
}

// =====================================================
// Badge Actions
// =====================================================

export async function listBadgesAction(): Promise<ActionResult<Badge[]>> {
  try {
    const allBadges = await db.query.badges.findMany({
      where: eq(badges.is_hidden, false),
      orderBy: [asc(badges.display_order)],
    });

    return {
      success: true,
      data: allBadges.map(b => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        iconUrl: b.icon_url,
        xpReward: b.xp_reward,
        rarity: b.rarity,
        displayOrder: b.display_order,
        isHidden: b.is_hidden,
        triggerType: b.trigger_type,
        triggerThreshold: b.trigger_threshold,
      })),
    };
  } catch (error) {
    console.error('List badges error:', error);
    return { success: false, error: 'Failed to list badges' };
  }
}

export async function getMyBadgesAction(): Promise<ActionResult<UserBadge[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const myBadges = await db
      .select({
        id: userBadges.id,
        userId: userBadges.user_id,
        badgeId: userBadges.badge_id,
        earnedAt: userBadges.earned_at,
        progressValue: userBadges.progress_value,
        isNew: userBadges.is_new,
        badgeSlug: badges.slug,
        badgeName: badges.name,
        badgeDescription: badges.description,
        badgeIconUrl: badges.icon_url,
        badgeXpReward: badges.xp_reward,
        badgeRarity: badges.rarity,
        badgeDisplayOrder: badges.display_order,
        badgeIsHidden: badges.is_hidden,
        badgeTriggerType: badges.trigger_type,
        badgeTriggerThreshold: badges.trigger_threshold,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badge_id, badges.id))
      .where(eq(userBadges.user_id, context.userId))
      .orderBy(desc(userBadges.earned_at));

    return {
      success: true,
      data: myBadges.map(b => ({
        id: b.id,
        userId: b.userId,
        badgeId: b.badgeId,
        badge: {
          id: b.badgeId,
          slug: b.badgeSlug,
          name: b.badgeName,
          description: b.badgeDescription,
          iconUrl: b.badgeIconUrl,
          xpReward: b.badgeXpReward,
          rarity: b.badgeRarity,
          displayOrder: b.badgeDisplayOrder,
          isHidden: b.badgeIsHidden,
          triggerType: b.badgeTriggerType,
          triggerThreshold: b.badgeTriggerThreshold,
        },
        earnedAt: b.earnedAt.toISOString(),
        progressValue: b.progressValue,
        isNew: b.isNew,
      })),
    };
  } catch (error) {
    console.error('Get my badges error:', error);
    return { success: false, error: 'Failed to get badges' };
  }
}

export async function markBadgeViewedAction(
  userBadgeId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    await db.update(userBadges)
      .set({
        is_new: false,
        viewed_at: new Date(),
      })
      .where(and(
        eq(userBadges.id, userBadgeId),
        eq(userBadges.user_id, context.userId)
      ));

    return { success: true, data: { id: userBadgeId } };
  } catch (error) {
    console.error('Mark badge viewed error:', error);
    return { success: false, error: 'Failed to mark badge as viewed' };
  }
}

async function checkAndAwardBadges(userId: string): Promise<void> {
  // Get all badges user doesn't have
  const userBadgeIds = await db
    .select({ badgeId: userBadges.badge_id })
    .from(userBadges)
    .where(eq(userBadges.user_id, userId));

  const earnedBadgeIds = userBadgeIds.map(b => b.badgeId);

  const availableBadges = await db.query.badges.findMany({
    where: earnedBadgeIds.length > 0
      ? sql`${badges.id} not in (${sql.join(earnedBadgeIds.map(id => sql`${id}`), sql`, `)})`
      : undefined,
  });

  // Check each badge trigger
  for (const badge of availableBadges) {
    let shouldAward = false;
    let progressValue = 0;

    switch (badge.trigger_type) {
      case 'first_video':
      case 'first_quiz':
      case 'first_lab': {
        const contentType = badge.trigger_type.replace('first_', '') as 'video' | 'reading' | 'quiz' | 'lab' | 'project';
        const completions = await db
          .select({ count: sql<number>`count(*)` })
          .from(topicCompletions)
          .innerJoin(moduleTopics, eq(topicCompletions.topic_id, moduleTopics.id))
          .where(and(
            eq(topicCompletions.user_id, userId),
            eq(moduleTopics.content_type, contentType)
          ));
        progressValue = Number(completions[0]?.count || 0);
        shouldAward = progressValue >= badge.trigger_threshold;
        break;
      }

      case 'course_completion': {
        const completedCourses = await db
          .select({ count: sql<number>`count(*)` })
          .from(studentEnrollments)
          .where(and(
            eq(studentEnrollments.user_id, userId),
            eq(studentEnrollments.status, 'completed')
          ));
        progressValue = Number(completedCourses[0]?.count || 0);
        shouldAward = progressValue >= badge.trigger_threshold;
        break;
      }

      case 'quiz_streak': {
        // Count consecutive passed quizzes
        const quizzes = await db.query.quizAttempts.findMany({
          where: eq(quizAttempts.user_id, userId),
          orderBy: [desc(quizAttempts.attempted_at)],
        });
        let streak = 0;
        for (const quiz of quizzes) {
          if (quiz.passed) streak++;
          else break;
        }
        progressValue = streak;
        shouldAward = streak >= badge.trigger_threshold;
        break;
      }

      case 'perfect_quiz': {
        const perfectQuizzes = await db
          .select({ count: sql<number>`count(*)` })
          .from(quizAttempts)
          .where(and(
            eq(quizAttempts.user_id, userId),
            eq(quizAttempts.score, 100)
          ));
        progressValue = Number(perfectQuizzes[0]?.count || 0);
        shouldAward = progressValue >= badge.trigger_threshold;
        break;
      }

      case 'lab_completion': {
        const labCompletions = await db
          .select({ count: sql<number>`count(*)` })
          .from(topicCompletions)
          .innerJoin(moduleTopics, eq(topicCompletions.topic_id, moduleTopics.id))
          .where(and(
            eq(topicCompletions.user_id, userId),
            eq(moduleTopics.content_type, 'lab')
          ));
        progressValue = Number(labCompletions[0]?.count || 0);
        shouldAward = progressValue >= badge.trigger_threshold;
        break;
      }

      // Add more trigger types as needed
    }

    if (shouldAward) {
      // Award badge
      await db.insert(userBadges).values({
        user_id: userId,
        badge_id: badge.id,
        progress_value: progressValue,
        is_new: true,
      });

      // Award XP for badge
      if (badge.xp_reward > 0) {
        await db.insert(xpTransactions).values({
          user_id: userId,
          amount: badge.xp_reward,
          transaction_type: 'badge_earned',
          reference_type: 'badge',
          reference_id: badge.id,
          description: `Earned badge: ${badge.name}`,
        });

        // Update XP total
        const existingTotal = await db.query.userXpTotals.findFirst({
          where: eq(userXpTotals.user_id, userId),
        });

        if (existingTotal) {
          await db.update(userXpTotals)
            .set({
              total_xp: existingTotal.total_xp + badge.xp_reward,
              transaction_count: existingTotal.transaction_count + 1,
              updated_at: new Date(),
            })
            .where(eq(userXpTotals.user_id, userId));
        }
      }
    }
  }
}

// =====================================================
// Quiz Actions
// =====================================================

const submitQuizSchema = z.object({
  enrollmentId: z.string().uuid(),
  quizId: z.string().uuid(),
  score: z.number().min(0).max(100),
  answers: z.record(z.unknown()).optional(),
});

export async function submitQuizAction(
  input: z.infer<typeof submitQuizSchema>
): Promise<ActionResult<{ id: string; passed: boolean; xpAwarded: number }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = submitQuizSchema.parse(input);

    // Verify enrollment
    const enrollment = await db.query.studentEnrollments.findFirst({
      where: and(
        eq(studentEnrollments.id, validated.enrollmentId),
        eq(studentEnrollments.user_id, context.userId)
      ),
    });

    if (!enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    const passed = validated.score >= 70; // 70% passing threshold

    const [attempt] = await db.insert(quizAttempts).values({
      user_id: context.userId,
      enrollment_id: validated.enrollmentId,
      quiz_id: validated.quizId,
      score: validated.score,
      passed,
      answers: validated.answers,
    }).returning({ id: quizAttempts.id });

    // Award XP for passing
    let xpAwarded = 0;
    if (passed) {
      xpAwarded = validated.score === 100 ? 50 : 25; // Bonus for perfect score
      await awardXPAction({
        userId: context.userId,
        amount: xpAwarded,
        transactionType: 'quiz_passed',
        referenceType: 'achievement',
        referenceId: attempt.id,
        description: `Quiz passed with ${validated.score}%`,
      });

      // Check for badges
      await checkAndAwardBadges(context.userId);
    }

    return { success: true, data: { id: attempt.id, passed, xpAwarded } };
  } catch (error) {
    console.error('Submit quiz error:', error);
    return { success: false, error: 'Failed to submit quiz' };
  }
}

export async function getQuizAttemptsAction(
  enrollmentId: string
): Promise<ActionResult<QuizAttempt[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const attempts = await db.query.quizAttempts.findMany({
      where: and(
        eq(quizAttempts.enrollment_id, enrollmentId),
        eq(quizAttempts.user_id, context.userId)
      ),
      orderBy: [desc(quizAttempts.attempted_at)],
    });

    return {
      success: true,
      data: attempts.map(a => ({
        id: a.id,
        userId: a.user_id,
        enrollmentId: a.enrollment_id,
        quizId: a.quiz_id,
        score: a.score,
        passed: a.passed,
        attemptedAt: a.attempted_at.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Get quiz attempts error:', error);
    return { success: false, error: 'Failed to get quiz attempts' };
  }
}

// =====================================================
// Capstone Actions
// =====================================================

const submitCapstoneSchema = z.object({
  enrollmentId: z.string().uuid(),
  courseId: z.string().uuid(),
  submissionUrl: z.string().url(),
});

export async function submitCapstoneAction(
  input: z.infer<typeof submitCapstoneSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = submitCapstoneSchema.parse(input);

    // Verify enrollment
    const enrollment = await db.query.studentEnrollments.findFirst({
      where: and(
        eq(studentEnrollments.id, validated.enrollmentId),
        eq(studentEnrollments.user_id, context.userId)
      ),
    });

    if (!enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    const [submission] = await db.insert(capstoneSubmissions).values({
      user_id: context.userId,
      enrollment_id: validated.enrollmentId,
      course_id: validated.courseId,
      submission_url: validated.submissionUrl,
      status: 'pending',
    }).returning({ id: capstoneSubmissions.id });

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.capstone.submitted',
      'capstone_submissions',
      submission.id,
      { courseId: validated.courseId }
    );

    return { success: true, data: { id: submission.id } };
  } catch (error) {
    console.error('Submit capstone error:', error);
    return { success: false, error: 'Failed to submit capstone' };
  }
}

const reviewCapstoneSchema = z.object({
  submissionId: z.string().uuid(),
  status: z.enum(['approved', 'needs_revision', 'rejected']),
  grade: z.number().min(0).max(100).optional(),
  feedback: z.string().optional(),
});

export async function reviewCapstoneAction(
  input: z.infer<typeof reviewCapstoneSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const validated = reviewCapstoneSchema.parse(input);

    // Get submission
    const submission = await db.query.capstoneSubmissions.findFirst({
      where: eq(capstoneSubmissions.id, validated.submissionId),
    });

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    await db.update(capstoneSubmissions)
      .set({
        status: validated.status,
        grade: validated.grade,
        feedback: validated.feedback,
        reviewed_at: new Date(),
        reviewed_by: context.userId,
      })
      .where(eq(capstoneSubmissions.id, validated.submissionId));

    // Award XP for approved capstone
    if (validated.status === 'approved' && validated.grade) {
      const xpAmount = Math.round(validated.grade * 2); // Up to 200 XP
      await awardXPAction({
        userId: submission.user_id,
        amount: xpAmount,
        transactionType: 'project_submitted',
        referenceType: 'achievement',
        referenceId: submission.id,
        description: `Capstone approved with grade ${validated.grade}%`,
      });
    }

    await logAuditEvent(
      context.userId,
      context.orgId,
      'academy.capstone.reviewed',
      'capstone_submissions',
      validated.submissionId,
      { status: validated.status, grade: validated.grade }
    );

    return { success: true, data: { id: validated.submissionId } };
  } catch (error) {
    console.error('Review capstone error:', error);
    return { success: false, error: 'Failed to review capstone' };
  }
}

export async function listCapstoneSubmissionsAction(
  courseId?: string,
  status?: string
): Promise<ActionResult<CapstoneSubmission[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const { allowed } = await checkPermission(context.userId, 'academy:admin');
    if (!allowed) {
      return { success: false, error: 'Permission denied' };
    }

    const conditions = [];
    if (courseId) {
      conditions.push(eq(capstoneSubmissions.course_id, courseId));
    }
    if (status) {
      conditions.push(eq(capstoneSubmissions.status, status));
    }

    const submissions = await db
      .select({
        id: capstoneSubmissions.id,
        userId: capstoneSubmissions.user_id,
        enrollmentId: capstoneSubmissions.enrollment_id,
        courseId: capstoneSubmissions.course_id,
        submissionUrl: capstoneSubmissions.submission_url,
        status: capstoneSubmissions.status,
        grade: capstoneSubmissions.grade,
        feedback: capstoneSubmissions.feedback,
        submittedAt: capstoneSubmissions.submitted_at,
        reviewedAt: capstoneSubmissions.reviewed_at,
        reviewedBy: capstoneSubmissions.reviewed_by,
        courseTitle: courses.title,
      })
      .from(capstoneSubmissions)
      .innerJoin(courses, eq(capstoneSubmissions.course_id, courses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(capstoneSubmissions.submitted_at));

    // Get reviewer names
    const submissionData: CapstoneSubmission[] = await Promise.all(
      submissions.map(async (s) => {
        let reviewerName: string | null = null;
        if (s.reviewedBy) {
          const reviewer = await db.query.userProfiles.findFirst({
            where: eq(userProfiles.id, s.reviewedBy),
            columns: { firstName: true, lastName: true },
          });
          reviewerName = reviewer ? `${reviewer.firstName || ''} ${reviewer.lastName || ''}`.trim() : null;
        }

        return {
          id: s.id,
          userId: s.userId,
          enrollmentId: s.enrollmentId,
          courseId: s.courseId,
          courseTitle: s.courseTitle,
          submissionUrl: s.submissionUrl,
          status: s.status,
          grade: s.grade,
          feedback: s.feedback,
          submittedAt: s.submittedAt.toISOString(),
          reviewedAt: s.reviewedAt?.toISOString() || null,
          reviewedBy: s.reviewedBy,
          reviewerName,
        };
      })
    );

    return { success: true, data: submissionData };
  } catch (error) {
    console.error('List capstone submissions error:', error);
    return { success: false, error: 'Failed to list submissions' };
  }
}

// =====================================================
// Leaderboard Actions
// =====================================================

export async function getLeaderboardAction(
  limit: number = 20
): Promise<ActionResult<LeaderboardEntry[]>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    const leaderboard = await db
      .select({
        userId: userXpTotals.user_id,
        totalXp: userXpTotals.total_xp,
        firstName: userProfiles.firstName,
        lastName: userProfiles.lastName,
      })
      .from(userXpTotals)
      .innerJoin(userProfiles, eq(userXpTotals.user_id, userProfiles.id))
      .orderBy(desc(userXpTotals.total_xp))
      .limit(limit);

    // Get badge counts for each user
    const entries: LeaderboardEntry[] = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const badgeCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(userBadges)
          .where(eq(userBadges.user_id, entry.userId));

        const { level } = calculateLevel(entry.totalXp);

        return {
          rank: index + 1,
          userId: entry.userId,
          userName: `${entry.firstName || ''} ${entry.lastName || ''}`.trim() || null,
          totalXp: entry.totalXp,
          badgeCount: Number(badgeCount[0]?.count || 0),
          level,
        };
      })
    );

    return { success: true, data: entries };
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return { success: false, error: 'Failed to get leaderboard' };
  }
}

// =====================================================
// Dashboard Actions
// =====================================================

export interface StudentProgressDashboard {
  xp: UserXPSummary;
  badges: UserBadge[];
  recentCompletions: TopicCompletion[];
  activeEnrollments: number;
  completedCourses: number;
  currentStreak: number;
}

export async function getMyProgressDashboardAction(): Promise<ActionResult<StudentProgressDashboard>> {
  try {
    const context = await getCurrentUserContext();
    if (!context) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get XP
    const xpResult = await getMyXPAction();
    if (!xpResult.success || !xpResult.data) {
      return { success: false, error: 'Failed to get XP' };
    }

    // Get badges
    const badgesResult = await getMyBadgesAction();
    const badges = badgesResult.data || [];

    // Get recent completions
    const recentCompletions = await db
      .select({
        id: topicCompletions.id,
        userId: topicCompletions.user_id,
        enrollmentId: topicCompletions.enrollment_id,
        topicId: topicCompletions.topic_id,
        completedAt: topicCompletions.completed_at,
        topicTitle: moduleTopics.title,
      })
      .from(topicCompletions)
      .leftJoin(moduleTopics, eq(topicCompletions.topic_id, moduleTopics.id))
      .where(eq(topicCompletions.user_id, context.userId))
      .orderBy(desc(topicCompletions.completed_at))
      .limit(10);

    // Get enrollment counts
    const enrollmentStats = await db
      .select({
        activeEnrollments: sql<number>`count(*) filter (where status = 'active')`,
        completedCourses: sql<number>`count(*) filter (where status = 'completed')`,
      })
      .from(studentEnrollments)
      .where(eq(studentEnrollments.user_id, context.userId));

    // Calculate streak (days with activity)
    const recentActivity = await db
      .select({
        date: sql<string>`date(completed_at)`,
      })
      .from(topicCompletions)
      .where(eq(topicCompletions.user_id, context.userId))
      .orderBy(desc(topicCompletions.completed_at))
      .limit(30);

    let streak = 0;
    const dates = recentActivity.map(a => a.date);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }

    return {
      success: true,
      data: {
        xp: xpResult.data,
        badges,
        recentCompletions: recentCompletions.map(c => ({
          id: c.id,
          userId: c.userId,
          enrollmentId: c.enrollmentId,
          topicId: c.topicId,
          topicTitle: c.topicTitle,
          completedAt: c.completedAt.toISOString(),
        })),
        activeEnrollments: Number(enrollmentStats[0]?.activeEnrollments || 0),
        completedCourses: Number(enrollmentStats[0]?.completedCourses || 0),
        currentStreak: streak,
      },
    };
  } catch (error) {
    console.error('Get my progress dashboard error:', error);
    return { success: false, error: 'Failed to get progress dashboard' };
  }
}
