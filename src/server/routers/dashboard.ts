/**
 * tRPC Router: Dashboard Metrics
 * Provides real-time dashboard metrics for recruiting module
 *
 * @see src/screens/recruiting/recruiter-dashboard.screen.ts for data requirements
 */

import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  jobs,
  submissions,
  interviews,
  placements,
  offers,
} from '@/lib/db/schema/ats';
import { accounts, leads, deals } from '@/lib/db/schema/crm';
import { activities } from '@/lib/db/schema/activities';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, sql, gte, lte, lt, or, isNull, desc, ne } from 'drizzle-orm';

export const dashboardRouter = router({
  /**
   * Get recruiter dashboard metrics
   * Returns all metrics needed for the recruiting dashboard
   */
  recruiterMetrics: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get current date ranges
    const now = new Date();
    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Fetch all metrics in parallel
    const [
      jobsData,
      placementsData,
      interviewsTodayData,
      pipelineData,
      conversionData,
    ] = await Promise.all([
      // Active jobs count
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(and(
          eq(jobs.orgId, orgId),
          eq(jobs.status, 'open')
        )),

      // Submissions by status
      db.select({
        status: submissions.status,
        count: sql<number>`count(*)::int`,
      })
        .from(submissions)
        .where(eq(submissions.orgId, orgId))
        .groupBy(submissions.status),

      // Placements this quarter
      db.select({
        count: sql<number>`count(*)::int`,
        totalValue: sql<number>`coalesce(sum(${placements.billRate})::int, 0)`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.startDate, quarterStart)
        )),

      // Interviews scheduled for today
      db.select({ count: sql<number>`count(*)::int` })
        .from(interviews)
        .where(and(
          eq(interviews.orgId, orgId),
          gte(interviews.scheduledAt, today),
          lte(interviews.scheduledAt, tomorrow)
        )),

      // Pipeline summary (submissions by status)
      db.select({
        status: submissions.status,
        count: sql<number>`count(*)::int`,
      })
        .from(submissions)
        .where(eq(submissions.orgId, orgId))
        .groupBy(submissions.status),

      // Conversion data (submissions to placements ratio this quarter)
      db.select({
        totalSubmissions: sql<number>`count(${submissions.id})::int`,
        placedSubmissions: sql<number>`count(case when ${submissions.status} = 'placed' then 1 end)::int`,
      })
        .from(submissions)
        .where(and(
          eq(submissions.orgId, orgId),
          gte(submissions.createdAt, quarterStart)
        )),
    ]);

    // Calculate pipeline stages
    const pipelineStages = {
      sourced: 0,
      screened: 0,
      submitted: 0,
      interviewing: 0,
      offered: 0,
      placed: 0,
    };

    for (const stage of pipelineData as Array<{ status: string; count: number }>) {
      const status = stage.status;
      const count = stage.count;
      if (status in pipelineStages) {
        pipelineStages[status as keyof typeof pipelineStages] = count;
      } else if (status === 'screening') {
        pipelineStages.screened = count;
      } else if (status === 'interview') {
        pipelineStages.interviewing = count;
      }
    }

    // Calculate conversion rate
    const conversionRecord = conversionData[0] as { totalSubmissions?: number; placedSubmissions?: number } | undefined;
    const totalSubmissions = conversionRecord?.totalSubmissions || 0;
    const placedSubmissions = conversionRecord?.placedSubmissions || 0;
    const conversionRate = totalSubmissions > 0
      ? Math.round((placedSubmissions / totalSubmissions) * 100)
      : 0;

    // Calculate average time-to-fill (mock for now - would need placement dates)
    const avgTimeToFill = 21; // days - would be calculated from actual data

    const placementRecord = placementsData[0] as { count?: number; totalValue?: number } | undefined;

    return {
      activeJobs: jobsData[0]?.count || 0,
      placementsThisQuarter: placementRecord?.count || 0,
      revenueGenerated: placementRecord?.totalValue || 0,
      interviewsToday: interviewsTodayData[0]?.count || 0,
      pipeline: pipelineStages,
      conversionRate,
      avgTimeToFill,
      totalSubmissions,
    };
  }),

  /**
   * Get CRM summary metrics for dashboard
   */
  crmMetrics: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const [
      accountsData,
      leadsData,
      dealsData,
    ] = await Promise.all([
      // Active accounts
      db.select({ count: sql<number>`count(*)::int` })
        .from(accounts)
        .where(and(
          eq(accounts.orgId, orgId),
          eq(accounts.status, 'active')
        )),

      // Leads by status
      db.select({
        status: leads.status,
        count: sql<number>`count(*)::int`,
      })
        .from(leads)
        .where(eq(leads.orgId, orgId))
        .groupBy(leads.status),

      // Deal pipeline
      db.select({
        stage: deals.stage,
        count: sql<number>`count(*)::int`,
        totalValue: sql<number>`coalesce(sum(${deals.value})::int, 0)`,
      })
        .from(deals)
        .where(eq(deals.orgId, orgId))
        .groupBy(deals.stage),
    ]);

    // Aggregate leads by status
    const leadsByStatus: Record<string, number> = {};
    for (const lead of leadsData) {
      leadsByStatus[lead.status] = lead.count;
    }

    // Aggregate deals by stage
    const dealsByStage: Record<string, { count: number; value: number }> = {};
    let totalPipelineValue = 0;
    for (const deal of dealsData) {
      dealsByStage[deal.stage] = {
        count: deal.count,
        value: deal.totalValue,
      };
      if (deal.stage !== 'closed_won' && deal.stage !== 'closed_lost') {
        totalPipelineValue += deal.totalValue;
      }
    }

    return {
      activeAccounts: accountsData[0]?.count || 0,
      leads: leadsByStatus,
      deals: dealsByStage,
      totalPipelineValue,
    };
  }),

  /**
   * Get activity summary for daily planner (legacy - use getActivitySummary instead)
   */
  activitySummary: orgProtectedProcedure.query(async () => {
    // For now return mock data - activities table needs to be created first
    return {
      pending: 0,
      inProgress: 0,
      completed: 0,
      escalated: 0,
      todaysTasks: [],
    };
  }),

  // ============================================================
  // NEW DASHBOARD PROCEDURES FOR METADATA-DRIVEN SCREENS
  // ============================================================

  /**
   * Get Sprint Progress metrics
   * Returns current/target values for 6 key metrics with color thresholds
   */
  getSprintProgress: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    // Calculate sprint dates (bi-weekly sprints)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekNumber = Math.floor((now.getDate() - 1) / 7);
    const isFirstWeek = weekNumber % 2 === 0;
    const sprintStart = new Date(now);
    sprintStart.setDate(now.getDate() - dayOfWeek - (isFirstWeek ? 0 : 7));
    sprintStart.setHours(0, 0, 0, 0);
    const sprintEnd = new Date(sprintStart);
    sprintEnd.setDate(sprintStart.getDate() + 13);
    sprintEnd.setHours(23, 59, 59, 999);

    const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

    // Get user profile ID for ownership queries
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id || userId;

    // Fetch all metrics in parallel
    const [
      placementsData,
      submissionsData,
      interviewsData,
      candidatesData,
      jobFillData,
      revenueData,
    ] = await Promise.all([
      // Placements this sprint (by owner)
      db.select({ count: sql<number>`count(*)::int` })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.startDate, sprintStart),
          lte(placements.startDate, sprintEnd)
        )),

      // Submissions this sprint
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(
          eq(submissions.orgId, orgId),
          gte(submissions.createdAt, sprintStart),
          lte(submissions.createdAt, sprintEnd)
        )),

      // Interviews scheduled this sprint
      db.select({ count: sql<number>`count(*)::int` })
        .from(interviews)
        .where(and(
          eq(interviews.orgId, orgId),
          gte(interviews.scheduledAt, sprintStart),
          lte(interviews.scheduledAt, sprintEnd)
        )),

      // Candidates sourced this sprint (submissions with status = 'sourced')
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(
          eq(submissions.orgId, orgId),
          eq(submissions.status, 'sourced'),
          gte(submissions.createdAt, sprintStart)
        )),

      // Job fill rate (filled jobs / total jobs this quarter)
      db.select({
        total: sql<number>`count(*)::int`,
        filled: sql<number>`count(case when ${jobs.status} = 'filled' then 1 end)::int`,
      })
        .from(jobs)
        .where(and(
          eq(jobs.orgId, orgId),
          gte(jobs.createdAt, quarterStart)
        )),

      // Revenue this quarter from placements
      db.select({
        total: sql<number>`coalesce(sum(${placements.billRate}), 0)::int`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active'),
          gte(placements.startDate, quarterStart)
        )),
    ]);

    // Calculate days remaining in sprint
    const daysRemaining = Math.max(0, Math.ceil((sprintEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const sprintWeek = isFirstWeek ? 1 : 2;

    // Calculate job fill percentage
    const jobFillRecord = jobFillData[0] as { total: number; filled: number } | undefined;
    const jobFillCurrent = jobFillRecord?.total ? Math.round((jobFillRecord.filled / jobFillRecord.total) * 100) : 0;

    return {
      sprintName: `Week ${sprintWeek} of 2: ${sprintStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sprintEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      daysRemaining,
      placements: {
        current: placementsData[0]?.count || 0,
        target: 2, // Sprint target
      },
      revenue: {
        current: revenueData[0]?.total || 0,
        target: 25000, // Sprint target
      },
      submissions: {
        current: submissionsData[0]?.count || 0,
        target: 10, // Sprint target
      },
      interviews: {
        current: interviewsData[0]?.count || 0,
        target: 3, // Sprint target
      },
      candidates: {
        current: candidatesData[0]?.count || 0,
        target: 75, // Sprint target
      },
      jobFill: {
        current: jobFillCurrent,
        target: 50, // Target 50% fill rate
      },
      onTrackCount: 0, // Will be calculated by frontend based on thresholds
    };
  }),

  /**
   * Get prioritized tasks for "Today's Priorities" widget
   * Returns tasks grouped by urgency: overdue, due today, high priority
   */
  getTasks: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get user profile for assignment lookup
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    if (!profileId) {
      return { overdue: [], dueToday: [], highPriority: [], upcoming: [] };
    }

    // Fetch all incomplete tasks assigned to user
    const allTasks = await db.select({
      id: activities.id,
      subject: activities.subject,
      body: activities.body,
      activityType: activities.activityType,
      status: activities.status,
      priority: activities.priority,
      dueDate: activities.dueDate,
      scheduledAt: activities.scheduledAt,
      entityType: activities.entityType,
      entityId: activities.entityId,
    })
      .from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.assignedTo, profileId),
        ne(activities.status, 'completed'),
        ne(activities.status, 'cancelled'),
        ne(activities.status, 'skipped')
      ))
      .orderBy(activities.dueDate)
      .limit(50);

    // Categorize tasks
    const overdue: typeof allTasks = [];
    const dueToday: typeof allTasks = [];
    const highPriority: typeof allTasks = [];
    const upcoming: typeof allTasks = [];

    for (const task of allTasks) {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;

      if (dueDate && dueDate < today) {
        overdue.push(task);
      } else if (dueDate && dueDate >= today && dueDate < tomorrow) {
        dueToday.push(task);
      } else if (task.priority === 'high' || task.priority === 'urgent') {
        highPriority.push(task);
      } else {
        upcoming.push(task);
      }
    }

    return {
      overdue: overdue.slice(0, 5),
      dueToday: dueToday.slice(0, 5),
      highPriority: highPriority.slice(0, 5),
      upcoming: upcoming.slice(0, 5),
    };
  }),

  /**
   * Get Pipeline Health metrics
   * Returns counts and alerts for pipeline stages
   */
  getPipelineHealth: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const [
      activeJobsData,
      urgentJobsData,
      highPriorityJobsData,
      sourcingData,
      pendingSubmissionsData,
      interviewsThisWeekData,
      interviewsNeedSchedulingData,
      offersOutstandingData,
      activePlacementsData,
      placementsDueCheckinData,
      staleJobsData,
      overdueFeedbackData,
    ] = await Promise.all([
      // Active jobs count
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(and(eq(jobs.orgId, orgId), eq(jobs.status, 'open'))),

      // Urgent jobs
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(and(eq(jobs.orgId, orgId), eq(jobs.status, 'open'), eq(jobs.urgency, 'high'))),

      // High priority jobs
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(and(eq(jobs.orgId, orgId), eq(jobs.status, 'open'), eq(jobs.priority, 'high'))),

      // Candidates in sourcing stage
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(eq(submissions.orgId, orgId), eq(submissions.status, 'sourced'))),

      // Submissions pending (awaiting client feedback)
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(eq(submissions.orgId, orgId), eq(submissions.status, 'submitted_to_client'))),

      // Interviews this week
      db.select({ count: sql<number>`count(*)::int` })
        .from(interviews)
        .where(and(
          eq(interviews.orgId, orgId),
          gte(interviews.scheduledAt, weekStart),
          lte(interviews.scheduledAt, weekEnd)
        )),

      // Interviews needing scheduling (submissions in interview stage without scheduled interview)
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(
          eq(submissions.orgId, orgId),
          eq(submissions.status, 'interview')
        )),

      // Offers outstanding
      db.select({ count: sql<number>`count(*)::int` })
        .from(offers)
        .where(and(eq(offers.orgId, orgId), eq(offers.status, 'pending'))),

      // Active placements
      db.select({ count: sql<number>`count(*)::int` })
        .from(placements)
        .where(and(eq(placements.orgId, orgId), eq(placements.status, 'active'))),

      // Placements due for check-in (active placements started > 30 days ago)
      db.select({ count: sql<number>`count(*)::int` })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active'),
          lt(placements.startDate, new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))
        )),

      // Stale jobs (open > 14 days with weak pipeline)
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobs)
        .where(and(
          eq(jobs.orgId, orgId),
          eq(jobs.status, 'open'),
          lt(jobs.createdAt, fourteenDaysAgo)
        )),

      // Overdue feedback (submissions sent > 3 days ago, still pending)
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(
          eq(submissions.orgId, orgId),
          eq(submissions.status, 'submitted_to_client'),
          lt(submissions.submittedToClientAt, threeDaysAgo)
        )),
    ]);

    return {
      activeJobs: activeJobsData[0]?.count || 0,
      urgentJobs: urgentJobsData[0]?.count || 0,
      highPriorityJobs: highPriorityJobsData[0]?.count || 0,
      candidatesSourcing: sourcingData[0]?.count || 0,
      submissionsPending: pendingSubmissionsData[0]?.count || 0,
      interviewsThisWeek: interviewsThisWeekData[0]?.count || 0,
      interviewsNeedScheduling: interviewsNeedSchedulingData[0]?.count || 0,
      offersOutstanding: offersOutstandingData[0]?.count || 0,
      placementsActive: activePlacementsData[0]?.count || 0,
      placementsDueCheckin: placementsDueCheckinData[0]?.count || 0,
      // Alert data
      staleJobs: staleJobsData[0]?.count || 0,
      overdueFeedback: overdueFeedbackData[0]?.count || 0,
    };
  }),

  /**
   * Get Account Health for portfolio widget
   * Returns accounts with health scores and status
   */
  getAccountHealth: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Get accounts with their stats
    const accountsData = await db.select({
      id: accounts.id,
      name: accounts.name,
      status: accounts.status,
      tier: accounts.tier,
      healthScore: accounts.healthScore,
      contractEndDate: accounts.contractEndDate,
    })
      .from(accounts)
      .where(and(
        eq(accounts.orgId, orgId),
        eq(accounts.status, 'active'),
        isNull(accounts.deletedAt)
      ))
      .orderBy(accounts.healthScore)
      .limit(10);

    // For each account, get job count and YTD revenue
    const enrichedAccounts = await Promise.all(
      accountsData.map(async (account) => {
        const [jobsCount, ytdRevenue] = await Promise.all([
          db.select({ count: sql<number>`count(*)::int` })
            .from(jobs)
            .where(and(eq(jobs.orgId, orgId), eq(jobs.accountId, account.id), eq(jobs.status, 'open'))),
          db.select({ total: sql<number>`coalesce(sum(${placements.billRate}), 0)::int` })
            .from(placements)
            .where(and(
              eq(placements.orgId, orgId),
              eq(placements.accountId, account.id),
              gte(placements.startDate, yearStart)
            )),
        ]);

        // Calculate health status based on health score since lastContactedAt doesn't exist
        let healthStatus: 'healthy' | 'needs_attention' | 'at_risk' = 'healthy';
        const healthScore = account.healthScore || 50;
        if (healthScore < 50) {
          healthStatus = 'at_risk';
        } else if (healthScore < 70) {
          healthStatus = 'needs_attention';
        }

        return {
          id: account.id,
          name: account.name,
          status: account.status,
          tier: account.tier,
          healthScore: healthScore,
          lastContactAt: account.contractEndDate, // Use contract end date as proxy
          activeJobs: jobsCount[0]?.count || 0,
          ytdRevenue: ytdRevenue[0]?.total || 0,
          nps: 8, // Would come from actual NPS data
          healthStatus,
        };
      })
    );

    return {
      accounts: enrichedAccounts,
      totalAccounts: enrichedAccounts.length,
      atRiskCount: enrichedAccounts.filter((a) => a.healthStatus === 'at_risk').length,
    };
  }),

  /**
   * Get Activity Summary for last 7 days
   * Returns activity counts by type with targets
   */
  getActivitySummary: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    if (!profileId) {
      return {
        calls: 0, callsTarget: 15, callsAvgPerDay: 0,
        emails: 0, emailsTarget: 25, emailsAvgPerDay: 0,
        meetings: 0, meetingsClient: 0, meetingsInternal: 0,
        candidatesSourced: 0, candidatesTarget: 75, candidatesStatus: 'on_track',
        phoneScreens: 0, phoneScreensTarget: 25, phoneScreensStatus: 'on_track',
        submissionsSent: 0, submissionsTarget: 5, submissionsStatus: 'on_track',
        interviewsScheduled: 0, interviewsTarget: 3, interviewsStatus: 'on_track',
      };
    }

    // Get activity counts by type
    const activityCounts = await db.select({
      activityType: activities.activityType,
      count: sql<number>`count(*)::int`,
    })
      .from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.assignedTo, profileId),
        eq(activities.status, 'completed'),
        gte(activities.completedAt, sevenDaysAgo)
      ))
      .groupBy(activities.activityType);

    // Convert to map
    const countMap: Record<string, number> = {};
    for (const row of activityCounts) {
      countMap[row.activityType] = row.count;
    }

    // Get submission and interview counts
    const [submissionsCount, interviewsCount, candidatesCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(eq(submissions.orgId, orgId), gte(submissions.createdAt, sevenDaysAgo))),
      db.select({ count: sql<number>`count(*)::int` })
        .from(interviews)
        .where(and(eq(interviews.orgId, orgId), gte(interviews.createdAt, sevenDaysAgo))),
      db.select({ count: sql<number>`count(*)::int` })
        .from(submissions)
        .where(and(eq(submissions.orgId, orgId), eq(submissions.status, 'sourced'), gte(submissions.createdAt, sevenDaysAgo))),
    ]);

    const calls = countMap['call'] || 0;
    const emails = countMap['email'] || 0;
    const meetings = countMap['meeting'] || 0;

    // Calculate status based on progress
    const getStatus = (current: number, target: number): 'ahead' | 'on_track' | 'behind' => {
      const progress = target > 0 ? (current / target) * 100 : 0;
      if (progress >= 100) return 'ahead';
      if (progress >= 70) return 'on_track';
      return 'behind';
    };

    return {
      calls,
      callsTarget: 15,
      callsAvgPerDay: Math.round((calls / 7) * 10) / 10,
      emails,
      emailsTarget: 25,
      emailsAvgPerDay: Math.round((emails / 7) * 10) / 10,
      meetings,
      meetingsClient: Math.floor(meetings * 0.5),
      meetingsInternal: Math.ceil(meetings * 0.5),
      candidatesSourced: candidatesCount[0]?.count || 0,
      candidatesTarget: 75,
      candidatesStatus: getStatus(candidatesCount[0]?.count || 0, 75),
      phoneScreens: countMap['call'] || 0,
      phoneScreensTarget: 25,
      phoneScreensStatus: getStatus(countMap['call'] || 0, 25),
      submissionsSent: submissionsCount[0]?.count || 0,
      submissionsTarget: 5,
      submissionsStatus: getStatus(submissionsCount[0]?.count || 0, 5),
      interviewsScheduled: interviewsCount[0]?.count || 0,
      interviewsTarget: 3,
      interviewsStatus: getStatus(interviewsCount[0]?.count || 0, 3),
    };
  }),

  /**
   * Get Quality Metrics for last 30 days
   * Returns quality KPIs with targets
   */
  getQualityMetrics: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      submissionsData,
      interviewsData,
      offersData,
      placementsData,
    ] = await Promise.all([
      // Submissions in last 30 days
      db.select({
        total: sql<number>`count(*)::int`,
        toInterview: sql<number>`count(case when ${submissions.status} in ('interview', 'offer', 'placed') then 1 end)::int`,
        avgTimeToSubmit: sql<number>`coalesce(avg(extract(epoch from (${submissions.submittedToClientAt} - ${submissions.createdAt})) / 3600), 0)::int`,
      })
        .from(submissions)
        .where(and(eq(submissions.orgId, orgId), gte(submissions.createdAt, thirtyDaysAgo))),

      // Interview to offer conversion
      db.select({
        total: sql<number>`count(*)::int`,
        toOffer: sql<number>`count(case when ${interviews.status} = 'completed' then 1 end)::int`,
      })
        .from(interviews)
        .where(and(eq(interviews.orgId, orgId), gte(interviews.createdAt, thirtyDaysAgo))),

      // Offer acceptance rate
      db.select({
        total: sql<number>`count(*)::int`,
        accepted: sql<number>`count(case when ${offers.status} = 'accepted' then 1 end)::int`,
      })
        .from(offers)
        .where(and(eq(offers.orgId, orgId), gte(offers.createdAt, thirtyDaysAgo))),

      // Placement retention (30-day)
      db.select({
        total: sql<number>`count(*)::int`,
        retained: sql<number>`count(case when ${placements.status} = 'active' then 1 end)::int`,
        avgTimeToFill: sql<number>`coalesce(avg(extract(epoch from (${placements.startDate} - ${placements.createdAt})) / 86400), 0)::int`,
      })
        .from(placements)
        .where(and(eq(placements.orgId, orgId), gte(placements.startDate, thirtyDaysAgo))),
    ]);

    const submissionRecord = submissionsData[0] as { total: number; toInterview: number; avgTimeToSubmit: number } | undefined;
    const interviewRecord = interviewsData[0] as { total: number; toOffer: number } | undefined;
    const offerRecord = offersData[0] as { total: number; accepted: number } | undefined;
    const placementRecord = placementsData[0] as { total: number; retained: number; avgTimeToFill: number } | undefined;

    const submissionQuality = submissionRecord?.total ? Math.round((submissionRecord.toInterview / submissionRecord.total) * 100) : 0;
    const interviewToOffer = interviewRecord?.total ? Math.round((interviewRecord.toOffer / interviewRecord.total) * 100) : 0;
    const offerAcceptance = offerRecord?.total ? Math.round((offerRecord.accepted / offerRecord.total) * 100) : 0;
    const thirtyDayRetention = placementRecord?.total ? Math.round((placementRecord.retained / placementRecord.total) * 100) : 100;

    // Calculate status
    const getStatus = (value: number, target: number): 'passing' | 'warning' | 'failing' => {
      if (value >= target) return 'passing';
      if (value >= target * 0.8) return 'warning';
      return 'failing';
    };

    // Calculate overall score
    const overallScore = Math.round(
      ((submissionQuality / 30) * 25) +
      ((interviewToOffer / 40) * 20) +
      ((offerAcceptance / 85) * 15) +
      ((thirtyDayRetention / 95) * 10) +
      30 // Base score for time metrics
    );

    return {
      timeToSubmit: submissionRecord?.avgTimeToSubmit || 36,
      timeToSubmitStatus: getStatus(48 - (submissionRecord?.avgTimeToSubmit || 36), 0),
      timeToFill: placementRecord?.avgTimeToFill || 18,
      timeToFillStatus: getStatus(21 - (placementRecord?.avgTimeToFill || 18), 0),
      submissionQuality,
      submissionQualityStatus: getStatus(submissionQuality, 30),
      interviewToOffer,
      interviewToOfferStatus: getStatus(interviewToOffer, 40),
      offerAcceptance,
      offerAcceptanceStatus: getStatus(offerAcceptance, 85),
      thirtyDayRetention,
      thirtyDayRetentionStatus: getStatus(thirtyDayRetention, 95),
      overallScore: Math.min(100, Math.max(0, overallScore)),
    };
  }),

  /**
   * Get Upcoming Calendar events
   * Returns interviews and scheduled activities for next 3 days
   */
  getUpcomingCalendar: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    // Get upcoming interviews
    const upcomingInterviews = await db.select({
      id: interviews.id,
      type: sql<string>`'interview'`,
      title: sql<string>`'Interview: ' || ${jobs.title}`,
      scheduledAt: interviews.scheduledAt,
      durationMinutes: interviews.durationMinutes,
      interviewType: interviews.interviewType,
      meetingLink: interviews.meetingLink,
    })
      .from(interviews)
      .innerJoin(jobs, eq(interviews.jobId, jobs.id))
      .where(and(
        eq(interviews.orgId, orgId),
        gte(interviews.scheduledAt, today),
        lte(interviews.scheduledAt, threeDaysFromNow),
        eq(interviews.status, 'scheduled')
      ))
      .orderBy(interviews.scheduledAt)
      .limit(20);

    // Get scheduled activities
    const scheduledActivities = profileId ? await db.select({
      id: activities.id,
      type: activities.activityType,
      title: activities.subject,
      scheduledAt: activities.scheduledAt,
      dueDate: activities.dueDate,
      priority: activities.priority,
    })
      .from(activities)
      .where(and(
        eq(activities.orgId, orgId),
        eq(activities.assignedTo, profileId),
        ne(activities.status, 'completed'),
        ne(activities.status, 'cancelled'),
        or(
          and(gte(activities.scheduledAt, today), lte(activities.scheduledAt, threeDaysFromNow)),
          and(gte(activities.dueDate, today), lte(activities.dueDate, threeDaysFromNow))
        )
      ))
      .orderBy(activities.scheduledAt)
      .limit(20) : [];

    // Combine and group by day
    const allEvents = [
      ...upcomingInterviews.map((i) => ({
        ...i,
        eventType: 'interview' as const,
        date: i.scheduledAt,
      })),
      ...scheduledActivities.map((a) => ({
        ...a,
        eventType: 'activity' as const,
        date: a.scheduledAt || a.dueDate,
      })),
    ].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });

    // Group by day
    const grouped: Record<string, typeof allEvents> = {};
    for (const event of allEvents) {
      if (!event.date) continue;
      const dateKey = new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    }

    return {
      events: allEvents.slice(0, 15),
      groupedByDay: grouped,
    };
  }),

  /**
   * Get RACI Watchlist - items where user is Consulted or Informed
   * Returns entities the user should be aware of
   */
  getRACIWatchlist: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    if (!profileId) {
      return { items: [], totalCount: 0 };
    }

    // Get recent jobs assigned to user's pod/team (as Consulted/Informed)
    const recentJobs = await db.select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      updatedAt: jobs.updatedAt,
      accountId: jobs.accountId,
    })
      .from(jobs)
      .where(and(
        eq(jobs.orgId, orgId),
        eq(jobs.status, 'open')
      ))
      .orderBy(desc(jobs.updatedAt))
      .limit(8);

    // Get recent submissions with activity
    const recentSubmissions = await db.select({
      id: submissions.id,
      candidateId: submissions.candidateId,
      jobId: submissions.jobId,
      status: submissions.status,
      updatedAt: submissions.updatedAt,
    })
      .from(submissions)
      .where(and(
        eq(submissions.orgId, orgId),
        ne(submissions.status, 'placed'),
        ne(submissions.status, 'rejected')
      ))
      .orderBy(desc(submissions.updatedAt))
      .limit(8);

    // Get recent deals
    const recentDeals = await db.select({
      id: deals.id,
      title: deals.title,
      stage: deals.stage,
      updatedAt: deals.updatedAt,
      accountId: deals.accountId,
    })
      .from(deals)
      .where(and(
        eq(deals.orgId, orgId),
        ne(deals.stage, 'closed_won'),
        ne(deals.stage, 'closed_lost')
      ))
      .orderBy(desc(deals.updatedAt))
      .limit(8);

    // Combine and format as watchlist items
    const items = [
      ...recentJobs.map((j) => ({
        id: `job-${j.id}`,
        entityType: 'job' as const,
        entityId: j.id,
        title: j.title,
        subtitle: `Status: ${j.status}`,
        raciRole: 'I' as const, // Informed
        lastActivityAt: j.updatedAt,
        hasNewActivity: new Date(j.updatedAt!).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      })),
      ...recentSubmissions.slice(0, 4).map((s) => ({
        id: `submission-${s.id}`,
        entityType: 'submission' as const,
        entityId: s.id,
        title: `Submission #${s.id.slice(0, 8)}`,
        subtitle: `Status: ${s.status}`,
        raciRole: 'C' as const, // Consulted
        lastActivityAt: s.updatedAt,
        hasNewActivity: new Date(s.updatedAt!).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      })),
      ...recentDeals.slice(0, 4).map((d) => ({
        id: `deal-${d.id}`,
        entityType: 'deal' as const,
        entityId: d.id,
        title: d.title,
        subtitle: `Stage: ${d.stage}`,
        raciRole: 'I' as const, // Informed
        lastActivityAt: d.updatedAt,
        hasNewActivity: new Date(d.updatedAt!).getTime() > Date.now() - 24 * 60 * 60 * 1000,
      })),
    ].sort((a, b) => {
      const dateA = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const dateB = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 8);

    return {
      items,
      totalCount: items.length,
    };
  }),

  /**
   * Get Cross-Pillar Opportunities
   * AI-detected opportunities from recent interactions
   */
  getCrossPillarOpportunities: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // In a real implementation, this would use AI to analyze interactions
    // For now, we detect simple patterns:
    // 1. Accounts with training mentions → Academy opportunity
    // 2. Candidates on bench → Bench Sales opportunity
    // 3. New leads from existing accounts → TA opportunity

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get placed candidates who might need training (Academy opportunity)
    const placedCandidates = await db.select({
      id: placements.id,
      candidateId: placements.candidateId,
      startDate: placements.startDate,
      accountId: placements.accountId,
    })
      .from(placements)
      .where(and(
        eq(placements.orgId, orgId),
        eq(placements.status, 'active'),
        gte(placements.startDate, sevenDaysAgo)
      ))
      .limit(3);

    // Get accounts with recent activity (TA opportunity)
    const activeAccounts = await db.select({
      id: accounts.id,
      name: accounts.name,
      tier: accounts.tier,
    })
      .from(accounts)
      .where(and(
        eq(accounts.orgId, orgId),
        eq(accounts.status, 'active'),
        eq(accounts.tier, 'tier_1')
      ))
      .limit(3);

    // Build opportunities
    const opportunities = [
      ...placedCandidates.map((p) => ({
        id: `academy-${p.id}`,
        pillar: 'academy' as const,
        title: 'New placement may need onboarding training',
        description: 'Recent placement started - consider offering upskilling courses',
        sourceActivity: {
          type: 'Placement',
          entityType: 'placement',
          entityName: `Placement #${p.id.slice(0, 8)}`,
          date: p.startDate,
        },
        confidence: 'medium' as const,
        actionUrl: '/employee/academy/courses',
      })),
      ...activeAccounts.slice(0, 2).map((a) => ({
        id: `ta-${a.id}`,
        pillar: 'ta' as const,
        title: `Expand relationship with ${a.name}`,
        description: 'Tier 1 account with potential for additional services',
        sourceActivity: {
          type: 'Account Review',
          entityType: 'account',
          entityName: a.name,
          date: now,
        },
        confidence: 'high' as const,
        actionUrl: `/employee/recruiting/accounts/${a.id}`,
      })),
    ];

    return {
      opportunities,
      length: opportunities.length,
    };
  }),

  /**
   * Get Recent Wins (placements, offers accepted, milestones)
   * Returns wins from last 30 days
   */
  getRecentWins: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get recent placements
    const recentPlacements = await db.select({
      id: placements.id,
      type: sql<string>`'placement'`,
      startDate: placements.startDate,
      billRate: placements.billRate,
      candidateId: placements.candidateId,
      accountId: placements.accountId,
    })
      .from(placements)
      .where(and(
        eq(placements.orgId, orgId),
        gte(placements.startDate, thirtyDaysAgo)
      ))
      .orderBy(desc(placements.startDate))
      .limit(5);

    // Get recent accepted offers
    const acceptedOffers = await db.select({
      id: offers.id,
      type: sql<string>`'offer_accepted'`,
      acceptedAt: offers.updatedAt,
      candidateId: offers.candidateId,
      jobId: offers.jobId,
    })
      .from(offers)
      .where(and(
        eq(offers.orgId, orgId),
        eq(offers.status, 'accepted'),
        gte(offers.updatedAt, thirtyDaysAgo)
      ))
      .orderBy(desc(offers.updatedAt))
      .limit(5);

    // Get closed won deals
    const closedDeals = await db.select({
      id: deals.id,
      type: sql<string>`'deal_won'`,
      title: deals.title,
      value: deals.value,
      closedAt: deals.actualCloseDate,
      accountId: deals.accountId,
    })
      .from(deals)
      .where(and(
        eq(deals.orgId, orgId),
        eq(deals.stage, 'closed_won'),
        gte(deals.actualCloseDate, thirtyDaysAgo)
      ))
      .orderBy(desc(deals.actualCloseDate))
      .limit(5);

    // Combine and format
    const wins = [
      ...recentPlacements.map((p) => ({
        id: p.id,
        type: 'placement' as const,
        title: 'Placement confirmed',
        date: p.startDate,
        value: p.billRate ? parseFloat(String(p.billRate)) : undefined,
      })),
      ...acceptedOffers.map((o) => ({
        id: o.id,
        type: 'offer' as const,
        title: 'Offer accepted',
        date: o.acceptedAt,
      })),
      ...closedDeals.map((d) => ({
        id: d.id,
        type: 'deal' as const,
        title: `Deal won: ${d.title}`,
        date: d.closedAt,
        value: d.value ? parseFloat(String(d.value)) : undefined,
      })),
    ].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    }).slice(0, 10);

    return {
      wins,
      totalCount: wins.length,
    };
  }),
});
