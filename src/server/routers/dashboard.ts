/**
 * tRPC Router: Dashboard Metrics
 * Provides real-time dashboard metrics for recruiting module
 */

import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  jobs,
  submissions,
  interviews,
  placements,
} from '@/lib/db/schema/ats';
import { accounts, leads, deals } from '@/lib/db/schema/crm';
import { eq, and, sql, gte, lte } from 'drizzle-orm';

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
   * Get activity summary for daily planner
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
});
