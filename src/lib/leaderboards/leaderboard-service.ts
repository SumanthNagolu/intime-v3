/**
 * Leaderboard Service
 * ACAD-017
 *
 * Handles all leaderboard data fetching and privacy filtering
 */

import { createClient } from '@/lib/supabase/server';
import type {
  GlobalLeaderboardEntry,
  GlobalLeaderboardResponse,
  CourseLeaderboardEntry,
  CourseLeaderboardResponse,
  CohortLeaderboardEntry,
  CohortLeaderboardResponse,
  WeeklyLeaderboardEntry,
  WeeklyLeaderboardResponse,
  AllTimeLeaderboardEntry,
  AllTimeLeaderboardResponse,
  UserGlobalRank,
  UserCourseRank,
  UserCohortRank,
  UserWeeklyPerformance,
  UserLeaderboardSummary,
} from '@/types/leaderboards';

// Server-side only - must never run in browser
if (typeof window !== 'undefined') {
  throw new Error('Leaderboard service must only run server-side');
}

// ============================================================================
// GLOBAL LEADERBOARD
// ============================================================================

export async function getGlobalLeaderboard(
  limit: number = 50,
  offset: number = 0,
  userId?: string
): Promise<GlobalLeaderboardResponse> {
  const supabase = await createClient();

  // Fetch leaderboard entries
  const { data: entries, error: entriesError } = await supabase
    .from('leaderboard_global')
    .select('*')
    .range(offset, offset + limit - 1);

  if (entriesError) {
    throw new Error(`Failed to fetch global leaderboard: ${entriesError.message}`);
  }

  // Get total count
  const { count, error: countError } = await supabase
    .from('leaderboard_global')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`Failed to count global leaderboard: ${countError.message}`);
  }

  // Get user's rank if userId provided
  let userRank: number | null = null;
  let userPercentile: number | null = null;

  if (userId) {
    const { data: rankData, error: rankError } = await supabase.rpc(
      'get_user_global_rank',
      { p_user_id: userId }
    );

    if (!rankError && rankData && rankData.length > 0) {
      userRank = rankData[0].rank;
      userPercentile = rankData[0].percentile;
    }
  }

  return {
    entries: entries as GlobalLeaderboardEntry[],
    total_count: count ?? 0,
    user_rank: userRank,
    user_percentile: userPercentile,
  };
}

// ============================================================================
// COURSE LEADERBOARD
// ============================================================================

export async function getCourseLeaderboard(
  courseId: string,
  limit: number = 50,
  offset: number = 0,
  userId?: string
): Promise<CourseLeaderboardResponse> {
  const supabase = await createClient();

  // Fetch leaderboard entries for this course
  const { data: entries, error: entriesError } = await supabase
    .from('leaderboard_by_course')
    .select('*')
    .eq('course_id', courseId)
    .range(offset, offset + limit - 1);

  if (entriesError) {
    throw new Error(`Failed to fetch course leaderboard: ${entriesError.message}`);
  }

  if (!entries || entries.length === 0) {
    return {
      course_id: courseId,
      course_title: 'Unknown Course',
      entries: [],
      total_students: 0,
      user_rank: null,
      user_percentile: null,
    };
  }

  const courseTitle = entries[0].course_title;
  const totalStudents = entries[0].total_students;

  // Get user's rank if userId provided
  let userRank: number | null = null;
  let userPercentile: number | null = null;

  if (userId) {
    const { data: rankData, error: rankError } = await supabase.rpc(
      'get_user_course_rank',
      {
        p_user_id: userId,
        p_course_id: courseId,
      }
    );

    if (!rankError && rankData && rankData.length > 0) {
      userRank = rankData[0].rank;
      userPercentile = rankData[0].percentile;
    }
  }

  return {
    course_id: courseId,
    course_title: courseTitle,
    entries: entries as CourseLeaderboardEntry[],
    total_students: totalStudents,
    user_rank: userRank,
    user_percentile: userPercentile,
  };
}

// ============================================================================
// COHORT LEADERBOARD
// ============================================================================

export async function getCohortLeaderboard(
  courseId: string,
  userId: string,
  cohortMonth?: string
): Promise<CohortLeaderboardResponse> {
  const supabase = await createClient();

  // If cohortMonth not provided, get user's cohort
  if (!cohortMonth) {
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('enrolled_at')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (enrollmentError || !enrollment) {
      throw new Error('User not enrolled in this course');
    }

    // Get cohort month from enrollment date
    const enrolledDate = new Date(enrollment.enrolled_at);
    cohortMonth = enrolledDate.toISOString().substring(0, 7); // YYYY-MM
  }

  // Fetch cohort leaderboard
  const { data: entries, error: entriesError } = await supabase
    .from('leaderboard_by_cohort')
    .select('*')
    .eq('course_id', courseId)
    .gte('cohort_month', cohortMonth)
    .lt('cohort_month', new Date(cohortMonth).toISOString().replace(/\d{2}T.*/, '01T00:00:00Z'))
    .order('rank', { ascending: true });

  if (entriesError) {
    throw new Error(`Failed to fetch cohort leaderboard: ${entriesError.message}`);
  }

  if (!entries || entries.length === 0) {
    return {
      course_id: courseId,
      course_title: 'Unknown Course',
      cohort_name: 'No Cohort',
      entries: [],
      cohort_size: 0,
      user_rank: null,
      user_percentile: null,
    };
  }

  const courseTitle = entries[0].course_title;
  const cohortName = entries[0].cohort_name;
  const cohortSize = entries[0].cohort_size;

  // Get user's rank
  let userRank: number | null = null;
  let userPercentile: number | null = null;

  const { data: rankData, error: rankError } = await supabase.rpc(
    'get_user_cohort_rank',
    {
      p_user_id: userId,
      p_course_id: courseId,
    }
  );

  if (!rankError && rankData && rankData.length > 0) {
    userRank = rankData[0].rank;
    userPercentile = rankData[0].cohort_percentile;
  }

  return {
    course_id: courseId,
    course_title: courseTitle,
    cohort_name: cohortName,
    entries: entries as CohortLeaderboardEntry[],
    cohort_size: cohortSize,
    user_rank: userRank,
    user_percentile: userPercentile,
  };
}

// ============================================================================
// WEEKLY LEADERBOARD
// ============================================================================

export async function getWeeklyLeaderboard(
  weekOffset: number = 0,
  limit: number = 50,
  userId?: string
): Promise<WeeklyLeaderboardResponse> {
  const supabase = await createClient();

  // Calculate week start date
  const now = new Date();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - now.getDay()); // Set to Sunday
  currentWeekStart.setHours(0, 0, 0, 0);

  const targetWeekStart = new Date(currentWeekStart);
  targetWeekStart.setDate(currentWeekStart.getDate() - weekOffset * 7);

  const weekStartStr = targetWeekStart.toISOString().split('T')[0];

  // Fetch weekly leaderboard
  const { data: entries, error: entriesError } = await supabase
    .from('leaderboard_weekly')
    .select('*')
    .eq('week_start', weekStartStr)
    .order('rank', { ascending: true })
    .limit(limit);

  if (entriesError) {
    throw new Error(`Failed to fetch weekly leaderboard: ${entriesError.message}`);
  }

  if (!entries || entries.length === 0) {
    return {
      week_label: 'No Data',
      is_current_week: weekOffset === 0,
      entries: [],
      total_participants: 0,
      user_rank: null,
      user_weekly_xp: null,
    };
  }

  const weekLabel = entries[0].week_label;
  const isCurrentWeek = entries[0].is_current_week;
  const totalParticipants = entries[0].participants;

  // Get user's rank for this week
  let userRank: number | null = null;
  let userWeeklyXp: number | null = null;

  if (userId) {
    const userEntry = entries.find((e) => e.user_id === userId);
    if (userEntry) {
      userRank = userEntry.rank;
      userWeeklyXp = userEntry.weekly_xp;
    }
  }

  return {
    week_label: weekLabel,
    is_current_week: isCurrentWeek,
    entries: entries as WeeklyLeaderboardEntry[],
    total_participants: totalParticipants,
    user_rank: userRank,
    user_weekly_xp: userWeeklyXp,
  };
}

// ============================================================================
// ALL-TIME LEADERBOARD
// ============================================================================

export async function getAllTimeLeaderboard(
  userId?: string
): Promise<AllTimeLeaderboardResponse> {
  const supabase = await createClient();

  // Fetch all-time top 100
  const { data: entries, error: entriesError } = await supabase
    .from('leaderboard_all_time')
    .select('*')
    .order('rank', { ascending: true });

  if (entriesError) {
    throw new Error(`Failed to fetch all-time leaderboard: ${entriesError.message}`);
  }

  // Check if user is in top 100
  let userInTop100 = false;
  let userRank: number | null = null;

  if (userId && entries) {
    const userEntry = entries.find((e) => e.user_id === userId);
    if (userEntry) {
      userInTop100 = true;
      userRank = userEntry.rank;
    }
  }

  return {
    entries: (entries as AllTimeLeaderboardEntry[]) ?? [],
    user_in_top_100: userInTop100,
    user_rank: userRank,
  };
}

// ============================================================================
// USER RANK LOOKUPS
// ============================================================================

export async function getUserGlobalRank(userId: string): Promise<UserGlobalRank | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_global_rank', {
    p_user_id: userId,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0] as UserGlobalRank;
}

export async function getUserCourseRank(
  userId: string,
  courseId: string
): Promise<UserCourseRank | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_course_rank', {
    p_user_id: userId,
    p_course_id: courseId,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0] as UserCourseRank;
}

export async function getUserCohortRank(
  userId: string,
  courseId: string
): Promise<UserCohortRank | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_cohort_rank', {
    p_user_id: userId,
    p_course_id: courseId,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0] as UserCohortRank;
}

export async function getUserWeeklyPerformance(
  userId: string
): Promise<UserWeeklyPerformance[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_weekly_performance', {
    p_user_id: userId,
  });

  if (error || !data) {
    return [];
  }

  return data as UserWeeklyPerformance[];
}

export async function getUserLeaderboardSummary(
  userId: string
): Promise<UserLeaderboardSummary | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_user_leaderboard_summary', {
    p_user_id: userId,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0] as UserLeaderboardSummary;
}

// ============================================================================
// PRIVACY SETTINGS
// ============================================================================

export async function updateLeaderboardVisibility(
  userId: string,
  visible: boolean
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('update_leaderboard_visibility', {
    p_user_id: userId,
    p_visible: visible,
  });

  if (error) {
    throw new Error(`Failed to update leaderboard visibility: ${error.message}`);
  }
}

export async function getLeaderboardVisibility(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('leaderboard_visible')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch leaderboard visibility: ${error.message}`);
  }

  return data?.leaderboard_visible ?? true;
}
