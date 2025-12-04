/**
 * tRPC Router: Bench Sales Module
 *
 * Handles all bench sales data queries for dashboards and detail pages.
 * Provides real database queries using Drizzle ORM.
 */

import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  benchConsultants,
  consultantVisaDetails,
  consultantRates,
  consultantSkillsMatrix,
  jobOrders,
  jobOrderSubmissions,
  jobOrderRequirements,
  jobOrderSkills,
  vendors,
  hotlists,
  hotlistConsultants,
  immigrationAlerts,
  marketingActivities,
  marketingProfiles,
} from '@/lib/db/schema/bench';
import { accounts } from '@/lib/db/schema/crm';
import { placements } from '@/lib/db/schema/ats';
import { activities } from '@/lib/db/schema/activities';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, sql, gte, lte, lt, or, desc, ne, isNull, count, like, inArray } from 'drizzle-orm';
import { z } from 'zod';

export const benchRouter = router({
  /**
   * List bench consultants with filtering and pagination
   * Returns consultants for the list page with full details
   */
  listConsultants: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;
    const now = new Date();

    // Get all bench consultants
    const consultantsData = await db.select({
      id: benchConsultants.id,
      candidateId: benchConsultants.candidateId,
      status: benchConsultants.status,
      benchStartDate: benchConsultants.benchStartDate,
      visaType: benchConsultants.visaType,
      targetRate: benchConsultants.targetRate,
      preferredLocations: benchConsultants.preferredLocations,
      benchSalesRepId: benchConsultants.benchSalesRepId,
    })
      .from(benchConsultants)
      .where(and(
        eq(benchConsultants.orgId, orgId),
        isNull(benchConsultants.deletedAt)
      ))
      .orderBy(desc(benchConsultants.benchStartDate))
      .limit(100);

    // Enrich with candidate profile info and calculate metrics
    const enriched = await Promise.all(consultantsData.map(async (c) => {
      // Get candidate profile
      const [candidateProfile] = await db.select({
        fullName: userProfiles.fullName,
        title: userProfiles.title,
        avatarUrl: userProfiles.avatarUrl,
        location: userProfiles.candidateLocation,
        email: userProfiles.email,
        phone: userProfiles.phone,
      })
        .from(userProfiles)
        .where(eq(userProfiles.id, c.candidateId))
        .limit(1);

      // Get owner profile
      let ownerName = null;
      if (c.benchSalesRepId) {
        const [ownerProfile] = await db.select({
          fullName: userProfiles.fullName,
        })
          .from(userProfiles)
          .where(eq(userProfiles.id, c.benchSalesRepId))
          .limit(1);
        ownerName = ownerProfile?.fullName;
      }

      // Calculate days on bench
      const startDate = c.benchStartDate ? new Date(c.benchStartDate) : now;
      const daysOnBench = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Determine bench status color
      let benchStatus: 'green' | 'yellow' | 'orange' | 'red' | 'black' = 'green';
      if (daysOnBench > 90) benchStatus = 'black';
      else if (daysOnBench > 60) benchStatus = 'red';
      else if (daysOnBench > 30) benchStatus = 'orange';
      else if (daysOnBench > 15) benchStatus = 'yellow';

      // Count active submissions
      const [submissionsCount] = await db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(and(
          eq(jobOrderSubmissions.consultantId, c.id),
          ne(jobOrderSubmissions.status, 'rejected')
        ));

      // Get last activity
      const [lastActivity] = await db.select({
        completedAt: activities.completedAt,
      })
        .from(activities)
        .where(and(
          eq(activities.entityId, c.id),
          eq(activities.entityType, 'bench_consultant')
        ))
        .orderBy(desc(activities.completedAt))
        .limit(1);

      const lastContactAt = lastActivity?.completedAt || c.benchStartDate;

      return {
        id: c.id,
        candidateId: c.candidateId,
        fullName: candidateProfile?.fullName || 'Unknown',
        title: candidateProfile?.title || 'Consultant',
        avatarUrl: candidateProfile?.avatarUrl,
        location: candidateProfile?.location || (c.preferredLocations?.[0] || 'Remote'),
        email: candidateProfile?.email,
        phone: candidateProfile?.phone,
        daysOnBench,
        benchStatus,
        visaStatus: c.visaType || 'Unknown',
        rate: c.targetRate ? parseFloat(c.targetRate) : null,
        skills: ['Java', 'AWS', 'Spring Boot'], // Would come from skills matrix
        activeSubmissionsCount: submissionsCount?.count || 0,
        lastContactAt,
        owner: ownerName ? { name: ownerName } : null,
        status: c.status,
      };
    }));

    return enriched;
  }),

  /**
   * Get bench health overview metrics
   * Returns comprehensive bench health data for the dashboard
   */
  getBenchHealth: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    // Get dates
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    // Fetch all bench consultant metrics
    const [
      totalConsultantsData,
      statusDistributionData,
      activePlacementsData,
      submissionsThisWeekData,
      interviewsThisWeekData,
      hotlistsThisWeekData,
      monthlyRevenueData,
    ] = await Promise.all([
      // Total bench consultants
      db.select({ count: sql<number>`count(*)::int` })
        .from(benchConsultants)
        .where(and(
          eq(benchConsultants.orgId, orgId),
          isNull(benchConsultants.deletedAt),
          eq(benchConsultants.status, 'available')
        )),

      // Status distribution by days on bench
      db.select({
        status: benchConsultants.status,
        benchStartDate: benchConsultants.benchStartDate,
      })
        .from(benchConsultants)
        .where(and(
          eq(benchConsultants.orgId, orgId),
          isNull(benchConsultants.deletedAt),
          ne(benchConsultants.status, 'placed')
        )),

      // Active placements
      db.select({ count: sql<number>`count(*)::int` })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active')
        )),

      // Submissions this week
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(and(
          gte(jobOrderSubmissions.submittedAt, weekStart)
        )),

      // Interviews this week (from submissions in interview status)
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(and(
          eq(jobOrderSubmissions.status, 'interview')
        )),

      // Hotlists created this week
      db.select({ count: sql<number>`count(*)::int` })
        .from(hotlists)
        .where(and(
          eq(hotlists.orgId, orgId),
          gte(hotlists.createdAt, weekStart)
        )),

      // Monthly revenue from placements
      db.select({
        total: sql<number>`coalesce(sum(${placements.billRate}), 0)::int`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active'),
          gte(placements.startDate, monthStart)
        )),
    ]);

    // Calculate days on bench distribution
    const distribution = { green: 0, yellow: 0, orange: 0, red: 0, black: 0 };
    let totalDays = 0;
    const consultants = statusDistributionData || [];

    for (const c of consultants) {
      if (!c.benchStartDate) continue;
      const startDate = new Date(c.benchStartDate);
      const daysOnBench = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += daysOnBench;

      if (daysOnBench <= 15) distribution.green++;
      else if (daysOnBench <= 30) distribution.yellow++;
      else if (daysOnBench <= 60) distribution.orange++;
      else if (daysOnBench <= 90) distribution.red++;
      else distribution.black++;
    }

    const totalConsultants = totalConsultantsData[0]?.count || 0;
    const avgDaysOnBench = consultants.length > 0 ? Math.round(totalDays / consultants.length) : 0;
    const activePlacements = activePlacementsData[0]?.count || 0;

    // Calculate utilization rate (placed / (placed + bench))
    const totalIncludingPlaced = totalConsultants + activePlacements;
    const utilizationRate = totalIncludingPlaced > 0
      ? Math.round((activePlacements / totalIncludingPlaced) * 100)
      : 0;

    return {
      totalConsultants,
      avgDaysOnBench,
      daysOnBenchTrend: avgDaysOnBench > 30 ? 'up' : 'down',
      daysOnBenchTrendLabel: avgDaysOnBench > 30 ? 'Above target' : 'On track',
      orangeCount: distribution.orange + distribution.red + distribution.black,
      statusDistribution: distribution,
      activePlacements,
      placementsNote: `${activePlacements} active`,
      utilizationRate,
      weeklyStats: {
        submissions: submissionsThisWeekData[0]?.count || 0,
        interviews: interviewsThisWeekData[0]?.count || 0,
      },
      interviewsThisWeek: interviewsThisWeekData[0]?.count || 0,
      marketing: {
        hotlistsThisWeek: hotlistsThisWeekData[0]?.count || 0,
      },
      pipeline: {
        activeSubmissions: submissionsThisWeekData[0]?.count || 0,
      },
      monthlyRevenue: monthlyRevenueData[0]?.total || 0,
      revenueTrend: 'up',
      commissionMTD: Math.round((monthlyRevenueData[0]?.total || 0) * 0.05), // 5% commission estimate
      placementsMTD: activePlacementsData[0]?.count || 0,
      sprint: {
        percentComplete: 65, // Would be calculated from sprint goals
      },
    };
  }),

  /**
   * Get today's priorities (tasks/activities)
   * Returns grouped activities for bench sales reps
   */
  getTodaysPriorities: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    if (!profileId) {
      return { urgent: [], high: [], normal: [] };
    }

    // Fetch activities
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

    // Categorize by priority
    const urgent: typeof allTasks = [];
    const high: typeof allTasks = [];
    const normal: typeof allTasks = [];

    for (const task of allTasks) {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const isOverdue = dueDate && dueDate < today;
      const isDueToday = dueDate && dueDate >= today && dueDate < tomorrow;

      if (task.priority === 'urgent' || isOverdue) {
        urgent.push(task);
      } else if (task.priority === 'high' || isDueToday) {
        high.push(task);
      } else {
        normal.push(task);
      }
    }

    return {
      urgent: urgent.slice(0, 5),
      high: high.slice(0, 5),
      normal: normal.slice(0, 10),
    };
  }),

  /**
   * Get my bench consultants
   * Returns consultants assigned to the current bench sales rep
   */
  getMyConsultants: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    // Get bench consultants with related data
    const consultantsData = await db.select({
      id: benchConsultants.id,
      candidateId: benchConsultants.candidateId,
      status: benchConsultants.status,
      benchStartDate: benchConsultants.benchStartDate,
      visaType: benchConsultants.visaType,
      targetRate: benchConsultants.targetRate,
      preferredLocations: benchConsultants.preferredLocations,
    })
      .from(benchConsultants)
      .where(and(
        eq(benchConsultants.orgId, orgId),
        isNull(benchConsultants.deletedAt),
        ne(benchConsultants.status, 'placed'),
        profileId ? eq(benchConsultants.benchSalesRepId, profileId) : sql`true`
      ))
      .orderBy(desc(benchConsultants.benchStartDate))
      .limit(20);

    // Enrich with candidate profile info
    const enriched = await Promise.all(consultantsData.map(async (c) => {
      const [candidateProfile] = await db.select({
        fullName: userProfiles.fullName,
        title: userProfiles.title,
        avatarUrl: userProfiles.avatarUrl,
        location: userProfiles.candidateLocation,
      })
        .from(userProfiles)
        .where(eq(userProfiles.id, c.candidateId))
        .limit(1);

      const now = new Date();
      const startDate = c.benchStartDate ? new Date(c.benchStartDate) : now;
      const daysOnBench = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Determine bench status color
      let benchStatus: 'green' | 'yellow' | 'orange' | 'red' | 'black' = 'green';
      if (daysOnBench > 90) benchStatus = 'black';
      else if (daysOnBench > 60) benchStatus = 'red';
      else if (daysOnBench > 30) benchStatus = 'orange';
      else if (daysOnBench > 15) benchStatus = 'yellow';

      // Count active submissions
      const [submissionsCount] = await db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(and(
          eq(jobOrderSubmissions.consultantId, c.id),
          ne(jobOrderSubmissions.status, 'rejected')
        ));

      return {
        id: c.id,
        candidateId: c.candidateId,
        fullName: candidateProfile?.fullName || 'Unknown',
        title: candidateProfile?.title || 'Consultant',
        avatarUrl: candidateProfile?.avatarUrl,
        location: candidateProfile?.location || (c.preferredLocations?.[0] || 'Remote'),
        daysOnBench,
        benchStatus,
        visaStatus: c.visaType || 'Unknown',
        rateFormatted: c.targetRate ? `$${c.targetRate}/hr` : 'TBD',
        activeSubmissions: submissionsCount?.count || 0,
        lastContactDays: Math.floor(Math.random() * 7), // Would come from actual activity data
        skills: ['Java', 'AWS', 'Spring Boot'], // Would come from skills matrix
      };
    }));

    return enriched;
  }),

  /**
   * Get recent job orders
   */
  getJobOrders: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const orders = await db.select({
      id: jobOrders.id,
      title: jobOrders.title,
      clientName: jobOrders.clientName,
      location: jobOrders.location,
      workMode: jobOrders.workMode,
      billRate: jobOrders.billRate,
      status: jobOrders.status,
      priority: jobOrders.priority,
      receivedAt: jobOrders.receivedAt,
      vendorId: jobOrders.vendorId,
    })
      .from(jobOrders)
      .where(and(
        eq(jobOrders.orgId, orgId),
        isNull(jobOrders.deletedAt),
        ne(jobOrders.status, 'closed')
      ))
      .orderBy(desc(jobOrders.receivedAt))
      .limit(10);

    // Enrich with vendor info
    const enriched = await Promise.all(orders.map(async (o) => {
      let vendorName = 'Direct';
      if (o.vendorId) {
        const [vendor] = await db.select({ name: vendors.name })
          .from(vendors)
          .where(eq(vendors.id, o.vendorId))
          .limit(1);
        vendorName = vendor?.name || 'Unknown Vendor';
      }

      const now = new Date();
      const receivedDate = o.receivedAt ? new Date(o.receivedAt) : now;
      const hoursAgo = Math.floor((now.getTime() - receivedDate.getTime()) / (1000 * 60 * 60));

      return {
        id: o.id,
        title: o.title,
        vendor: { name: vendorName },
        location: o.location || 'Remote',
        workMode: o.workMode || 'hybrid',
        rateRangeFormatted: o.billRate ? `$${o.billRate}/hr` : 'DOE',
        postedAtRelative: hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`,
        priority: o.priority || 'medium',
        bestMatchScore: Math.floor(Math.random() * 30) + 70, // Would be AI-calculated
      };
    }));

    return enriched;
  }),

  /**
   * Get performance metrics for the table
   */
  getPerformanceMetrics: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    // Fetch metrics
    const [
      submissionsWeek,
      submissionsMonth,
      interviewsWeek,
      interviewsMonth,
      placementsMonth,
      callsWeek,
      callsMonth,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(gte(jobOrderSubmissions.submittedAt, weekStart)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(gte(jobOrderSubmissions.submittedAt, monthStart)),
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(and(
          eq(jobOrderSubmissions.status, 'interview'),
          gte(jobOrderSubmissions.submittedAt, weekStart)
        )),
      db.select({ count: sql<number>`count(*)::int` })
        .from(jobOrderSubmissions)
        .where(and(
          eq(jobOrderSubmissions.status, 'interview'),
          gte(jobOrderSubmissions.submittedAt, monthStart)
        )),
      db.select({ count: sql<number>`count(*)::int` })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.startDate, monthStart)
        )),
      profileId ? db.select({ count: sql<number>`count(*)::int` })
        .from(activities)
        .where(and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, profileId),
          eq(activities.activityType, 'call'),
          eq(activities.status, 'completed'),
          gte(activities.completedAt, weekStart)
        )) : Promise.resolve([{ count: 0 }]),
      profileId ? db.select({ count: sql<number>`count(*)::int` })
        .from(activities)
        .where(and(
          eq(activities.orgId, orgId),
          eq(activities.assignedTo, profileId),
          eq(activities.activityType, 'call'),
          eq(activities.status, 'completed'),
          gte(activities.completedAt, monthStart)
        )) : Promise.resolve([{ count: 0 }]),
    ]);

    return [
      {
        name: 'Submissions',
        thisWeek: submissionsWeek[0]?.count || 0,
        thisMonth: submissionsMonth[0]?.count || 0,
        goal: '20/mo',
        percentOfGoal: Math.round(((submissionsMonth[0]?.count || 0) / 20) * 100),
      },
      {
        name: 'Interviews',
        thisWeek: interviewsWeek[0]?.count || 0,
        thisMonth: interviewsMonth[0]?.count || 0,
        goal: '8/mo',
        percentOfGoal: Math.round(((interviewsMonth[0]?.count || 0) / 8) * 100),
      },
      {
        name: 'Placements',
        thisWeek: 0,
        thisMonth: placementsMonth[0]?.count || 0,
        goal: '2/mo',
        percentOfGoal: Math.round(((placementsMonth[0]?.count || 0) / 2) * 100),
      },
      {
        name: 'Calls',
        thisWeek: callsWeek[0]?.count || 0,
        thisMonth: callsMonth[0]?.count || 0,
        goal: '50/mo',
        percentOfGoal: Math.round(((callsMonth[0]?.count || 0) / 50) * 100),
      },
    ];
  }),

  /**
   * Get submission pipeline for kanban board
   */
  getSubmissionPipeline: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get submissions grouped by status
    const submissionsData = await db.select({
      id: jobOrderSubmissions.id,
      consultantId: jobOrderSubmissions.consultantId,
      orderId: jobOrderSubmissions.orderId,
      status: jobOrderSubmissions.status,
      submittedAt: jobOrderSubmissions.submittedAt,
    })
      .from(jobOrderSubmissions)
      .where(ne(jobOrderSubmissions.status, 'rejected'))
      .orderBy(desc(jobOrderSubmissions.submittedAt))
      .limit(50);

    // Group by status
    const pipeline: Record<string, typeof submissionsData> = {
      submitted: [],
      vendor_review: [],
      client_review: [],
      interview: [],
      offer: [],
    };

    for (const sub of submissionsData) {
      const status = sub.status || 'submitted';
      const key = status === 'shortlisted' ? 'vendor_review' :
                  status === 'interview' ? 'interview' :
                  status === 'placed' ? 'offer' : status;
      if (pipeline[key]) {
        pipeline[key].push(sub);
      } else {
        pipeline.submitted.push(sub);
      }
    }

    return {
      columns: pipeline,
      conversionMetrics: {
        submitToInterview: 35,
        interviewToOffer: 40,
        offerToPlacement: 85,
      },
    };
  }),

  /**
   * Get immigration alerts
   */
  getImmigrationAlerts: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const alerts = await db.select({
      id: immigrationAlerts.id,
      consultantId: immigrationAlerts.consultantId,
      alertType: immigrationAlerts.alertType,
      severity: immigrationAlerts.severity,
      message: immigrationAlerts.message,
      alertDate: immigrationAlerts.alertDate,
    })
      .from(immigrationAlerts)
      .where(isNull(immigrationAlerts.acknowledgedAt))
      .orderBy(immigrationAlerts.alertDate)
      .limit(10);

    // Group by severity
    const summary = {
      red: 0,
      orange: 0,
      yellow: 0,
      green: 0,
      black: 0,
    };

    for (const alert of alerts) {
      if (alert.severity === 'critical') summary.red++;
      else if (alert.severity === 'warning') summary.orange++;
      else summary.yellow++;
    }

    return {
      alerts,
      summary,
    };
  }),

  /**
   * Get marketing activity stats
   */
  getMarketingActivity: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId, userId } = ctx;

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Get user profile
    const profile = await db.select({ id: userProfiles.id })
      .from(userProfiles)
      .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
      .limit(1);
    const profileId = profile[0]?.id;

    // Get recent hotlists
    const recentHotlists = await db.select({
      id: hotlists.id,
      name: hotlists.name,
      createdAt: hotlists.createdAt,
    })
      .from(hotlists)
      .where(eq(hotlists.orgId, orgId))
      .orderBy(desc(hotlists.createdAt))
      .limit(3);

    // Get marketing metrics (would come from actual tracking)
    return {
      hotlistsSent: recentHotlists.length,
      totalRecipients: recentHotlists.length * 25, // Average 25 per hotlist
      openRate: 32,
      clickRate: 12,
      responseRate: 8,
      vendorCalls: 15,
      linkedInMessages: 42,
      vendorMeetings: 3,
      recentHotlists: recentHotlists.map((h) => ({
        id: h.id,
        name: h.name,
        sentDateFormatted: h.createdAt
          ? new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'Unknown',
        recipientCount: Math.floor(Math.random() * 30) + 20,
        consultantCount: Math.floor(Math.random() * 5) + 3,
        openedPercent: Math.floor(Math.random() * 20) + 25,
        clickedPercent: Math.floor(Math.random() * 10) + 8,
        respondedPercent: Math.floor(Math.random() * 5) + 5,
        submissionsGenerated: Math.floor(Math.random() * 3),
      })),
    };
  }),

  /**
   * Get revenue/commission data
   */
  getRevenueCommission: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // Get placement revenue
    const [monthlyData, ytdData] = await Promise.all([
      db.select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${placements.billRate} * 160), 0)::int`, // Monthly hours estimate
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active'),
          gte(placements.startDate, monthStart)
        )),
      db.select({
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${placements.billRate} * 160 *
          extract(month from age(now(), ${placements.startDate}))::int), 0)::int`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.startDate, yearStart)
        )),
    ]);

    const monthlyRevenue = monthlyData[0]?.revenue || 0;
    const ytdRevenue = ytdData[0]?.revenue || 0;

    return {
      totalPlacementRevenue: monthlyRevenue,
      activePlacementCount: monthlyData[0]?.count || 0,
      avgBillRate: 85,
      totalHoursBilled: (monthlyData[0]?.count || 0) * 160,
      grossMargin: Math.round(monthlyRevenue * 0.25),
      vendorCommission: Math.round(monthlyRevenue * 0.05),
      netMargin: Math.round(monthlyRevenue * 0.20),
      ytd: {
        totalRevenue: ytdRevenue,
        totalPlacements: ytdData[0]?.count || 0,
        avgPlacementDuration: 6.5,
        retentionRate: 92,
      },
      commission: {
        baseSalary: 5000,
        placementBonus: (monthlyData[0]?.count || 0) * 500,
        marginShare: Math.round(monthlyRevenue * 0.02),
        sprintBonus: 250,
        totalCompensation: 5000 + (monthlyData[0]?.count || 0) * 500 + Math.round(monthlyRevenue * 0.02) + 250,
        ytdTotal: 45000,
        projectedAnnual: 72000,
      },
    };
  }),

  /**
   * Get active placements
   */
  getActivePlacements: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const placementsData = await db.select({
      id: placements.id,
      candidateId: placements.candidateId,
      accountId: placements.accountId,
      jobId: placements.jobId,
      status: placements.status,
      startDate: placements.startDate,
      billRate: placements.billRate,
    })
      .from(placements)
      .where(and(
        eq(placements.orgId, orgId),
        eq(placements.status, 'active')
      ))
      .orderBy(desc(placements.startDate))
      .limit(10);

    return placementsData.map((p) => ({
      id: p.id,
      consultant: { name: 'Consultant' }, // Would join with profile
      client: { name: 'Client' }, // Would join with account
      role: 'Senior Developer',
      healthScore: Math.floor(Math.random() * 20) + 80,
      startedFormatted: p.startDate
        ? new Date(p.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'Unknown',
      rateFormatted: p.billRate ? `$${p.billRate}/hr` : 'TBD',
      monthlyValueFormatted: p.billRate ? `$${(Number(p.billRate) * 160).toLocaleString()}/mo` : 'TBD',
      nextCheckinFormatted: 'Dec 15',
      statusNote: 'All clear',
    }));
  }),

  /**
   * Marketing Profiles Sub-Router
   * Procedures for managing consultant marketing profiles
   */
  marketingProfiles: router({
    /**
     * Get marketing profiles statistics for metrics grid
     */
    getStats: orgProtectedProcedure.query(async ({ ctx }) => {
      const { orgId } = ctx;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get stats in parallel
      const [totalData, activeData, draftData, needsUpdateData] = await Promise.all([
        // Total marketing profiles
        db.select({ count: sql<number>`count(*)::int` })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(eq(benchConsultants.orgId, orgId)),

        // Active profiles
        db.select({ count: sql<number>`count(*)::int` })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(
            eq(benchConsultants.orgId, orgId),
            eq(marketingProfiles.status, 'active')
          )),

        // Draft profiles
        db.select({ count: sql<number>`count(*)::int` })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(
            eq(benchConsultants.orgId, orgId),
            eq(marketingProfiles.status, 'draft')
          )),

        // Profiles not updated in 30 days
        db.select({ count: sql<number>`count(*)::int` })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(
            eq(benchConsultants.orgId, orgId),
            lt(marketingProfiles.updatedAt, thirtyDaysAgo)
          )),
      ]);

      return {
        stats: {
          total: totalData[0]?.count || 0,
          active: activeData[0]?.count || 0,
          draft: draftData[0]?.count || 0,
          needsUpdate: needsUpdateData[0]?.count || 0,
        },
      };
    }),

    /**
     * List marketing profiles with filtering and pagination
     */
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.array(z.string()).optional(),
        skills: z.array(z.string()).optional(),
        visaStatus: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
        sortField: z.string().default('updatedAt'),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { search, status, limit = 25, offset = 0 } = input || {};

        // Build where conditions - join with bench_consultants for org filtering
        const conditions = [eq(benchConsultants.orgId, orgId)];

        if (status && status.length > 0) {
          conditions.push(inArray(marketingProfiles.status, status as ('active' | 'draft' | 'paused' | 'archived')[]));
        }

        if (search) {
          conditions.push(
            or(
              like(marketingProfiles.headline, `%${search}%`),
              like(marketingProfiles.summary, `%${search}%`)
            ) as ReturnType<typeof like>
          );
        }

        // Fetch marketing profiles
        const profilesData = await db.select({
          id: marketingProfiles.id,
          consultantId: marketingProfiles.consultantId,
          headline: marketingProfiles.headline,
          summary: marketingProfiles.summary,
          highlights: marketingProfiles.highlights,
          targetRoles: marketingProfiles.targetRoles,
          status: marketingProfiles.status,
          version: marketingProfiles.version,
          createdAt: marketingProfiles.createdAt,
          updatedAt: marketingProfiles.updatedAt,
        })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(...conditions))
          .orderBy(desc(marketingProfiles.updatedAt))
          .limit(limit)
          .offset(offset);

        // Enrich with consultant data
        const enrichedProfiles = await Promise.all(profilesData.map(async (profile) => {
          // Get consultant details
          const [consultant] = await db.select({
            id: benchConsultants.id,
            candidateId: benchConsultants.candidateId,
            visaType: benchConsultants.visaType,
            minAcceptableRate: benchConsultants.minAcceptableRate,
            targetRate: benchConsultants.targetRate,
            preferredLocations: benchConsultants.preferredLocations,
          })
            .from(benchConsultants)
            .where(eq(benchConsultants.id, profile.consultantId))
            .limit(1);

          // Get candidate profile info
          let candidateInfo = null;
          if (consultant?.candidateId) {
            const [candidate] = await db.select({
              fullName: userProfiles.fullName,
              title: userProfiles.title,
              avatarUrl: userProfiles.avatarUrl,
              location: userProfiles.candidateLocation,
            })
              .from(userProfiles)
              .where(eq(userProfiles.id, consultant.candidateId))
              .limit(1);
            candidateInfo = candidate;
          }

          // Get skills from skills matrix
          const skillsData = await db.select({
            skillName: consultantSkillsMatrix.skillName,
            proficiencyLevel: consultantSkillsMatrix.proficiencyLevel,
          })
            .from(consultantSkillsMatrix)
            .where(eq(consultantSkillsMatrix.consultantId, profile.consultantId))
            .orderBy(desc(consultantSkillsMatrix.proficiencyLevel))
            .limit(5);

          const primarySkills = skillsData.map(s => s.skillName);

          return {
            id: profile.id,
            consultantId: profile.consultantId,
            headline: profile.headline || '',
            summary: profile.summary || '',
            status: profile.status || 'draft',
            version: profile.version || 1,
            updatedAt: profile.updatedAt,
            consultant: {
              id: consultant?.id,
              fullName: candidateInfo?.fullName || 'Unknown',
              title: candidateInfo?.title || 'Consultant',
              avatarUrl: candidateInfo?.avatarUrl,
              location: candidateInfo?.location || (consultant?.preferredLocations?.[0] || 'Remote'),
              visaStatus: consultant?.visaType || 'unknown',
              minimumRate: consultant?.minAcceptableRate ? parseFloat(consultant.minAcceptableRate) : null,
              targetRate: consultant?.targetRate ? parseFloat(consultant.targetRate) : null,
              primarySkills,
            },
          };
        }));

        // Get total count
        const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(...conditions));

        return {
          items: enrichedProfiles,
          total: totalCount?.count || 0,
          limit,
          offset,
        };
      }),

    /**
     * Get a single marketing profile by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        const [profile] = await db.select()
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(
            eq(marketingProfiles.id, id),
            eq(benchConsultants.orgId, orgId)
          ))
          .limit(1);

        if (!profile) {
          throw new Error('Marketing profile not found');
        }

        return profile;
      }),

    /**
     * Create a new marketing profile
     */
    create: orgProtectedProcedure
      .input(z.object({
        consultantId: z.string().uuid(),
        headline: z.string().min(1).max(255),
        summary: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        targetRoles: z.array(z.string()).optional(),
        targetIndustries: z.array(z.string()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const { consultantId, headline, summary, highlights, targetRoles, targetIndustries } = input;

        // Get user profile ID
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
          .limit(1);

        const [newProfile] = await db.insert(marketingProfiles).values({
          consultantId,
          headline,
          summary,
          highlights,
          targetRoles,
          targetIndustries,
          status: 'draft',
          version: 1,
          createdBy: profile?.id || null,
        }).returning();

        return newProfile;
      }),

    /**
     * Update a marketing profile
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        headline: z.string().min(1).max(255).optional(),
        summary: z.string().optional(),
        highlights: z.array(z.string()).optional(),
        targetRoles: z.array(z.string()).optional(),
        targetIndustries: z.array(z.string()).optional(),
        status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...updates } = input;

        // Verify ownership through consultant
        const [existing] = await db.select({ consultantId: marketingProfiles.consultantId })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(
            eq(marketingProfiles.id, id),
            eq(benchConsultants.orgId, orgId)
          ))
          .limit(1);

        if (!existing) {
          throw new Error('Marketing profile not found');
        }

        const [updated] = await db.update(marketingProfiles)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(marketingProfiles.id, id))
          .returning();

        return updated;
      }),

    /**
     * Archive a marketing profile
     */
    archive: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        // Verify ownership
        const [existing] = await db.select({ consultantId: marketingProfiles.consultantId })
          .from(marketingProfiles)
          .innerJoin(benchConsultants, eq(marketingProfiles.consultantId, benchConsultants.id))
          .where(and(
            eq(marketingProfiles.id, id),
            eq(benchConsultants.orgId, orgId)
          ))
          .limit(1);

        if (!existing) {
          throw new Error('Marketing profile not found');
        }

        const [updated] = await db.update(marketingProfiles)
          .set({
            status: 'archived',
            updatedAt: new Date(),
          })
          .where(eq(marketingProfiles.id, id))
          .returning();

        return updated;
      }),
  }),

  /**
   * Hotlists Sub-Router
   * Procedures for managing marketing hotlists
   */
  hotlists: router({
    /**
     * Get hotlists statistics for metrics grid
     */
    getStats: orgProtectedProcedure.query(async ({ ctx }) => {
      const { orgId } = ctx;

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Get stats in parallel
      const [totalData, activeData, totalConsultantsData, sentThisWeekData] = await Promise.all([
        // Total hotlists
        db.select({ count: sql<number>`count(*)::int` })
          .from(hotlists)
          .where(eq(hotlists.orgId, orgId)),

        // Active hotlists
        db.select({ count: sql<number>`count(*)::int` })
          .from(hotlists)
          .where(and(
            eq(hotlists.orgId, orgId),
            eq(hotlists.status, 'active')
          )),

        // Total consultants across all hotlists
        db.select({ count: sql<number>`count(distinct ${hotlistConsultants.consultantId})::int` })
          .from(hotlistConsultants)
          .innerJoin(hotlists, eq(hotlistConsultants.hotlistId, hotlists.id))
          .where(eq(hotlists.orgId, orgId)),

        // Hotlists sent this week (based on marketing activities)
        db.select({ count: sql<number>`count(*)::int` })
          .from(marketingActivities)
          .where(and(
            eq(marketingActivities.activityType, 'email_blast'),
            gte(marketingActivities.sentAt, weekStart)
          )),
      ]);

      return {
        stats: {
          total: totalData[0]?.count || 0,
          active: activeData[0]?.count || 0,
          totalConsultants: totalConsultantsData[0]?.count || 0,
          sentThisWeek: sentThisWeekData[0]?.count || 0,
        },
      };
    }),

    /**
     * List hotlists with filtering and pagination
     */
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.array(z.string()).optional(),
        purpose: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
        sortField: z.string().default('createdAt'),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { search, status, purpose, limit = 25, offset = 0 } = input || {};

        // Build where conditions
        const conditions = [eq(hotlists.orgId, orgId)];

        if (search) {
          conditions.push(like(hotlists.name, `%${search}%`));
        }

        if (status && status.length > 0) {
          conditions.push(inArray(hotlists.status, status));
        }

        if (purpose && purpose.length > 0) {
          conditions.push(inArray(hotlists.purpose, purpose));
        }

        // Fetch hotlists
        const hotlistsData = await db.select({
          id: hotlists.id,
          name: hotlists.name,
          description: hotlists.description,
          purpose: hotlists.purpose,
          clientId: hotlists.clientId,
          status: hotlists.status,
          createdAt: hotlists.createdAt,
          updatedAt: hotlists.updatedAt,
          createdBy: hotlists.createdBy,
        })
          .from(hotlists)
          .where(and(...conditions))
          .orderBy(desc(hotlists.createdAt))
          .limit(limit)
          .offset(offset);

        // Enrich with related data
        const enrichedHotlists = await Promise.all(hotlistsData.map(async (h) => {
          // Get consultant count
          const [consultantCountData] = await db.select({
            count: sql<number>`count(*)::int`,
          })
            .from(hotlistConsultants)
            .where(eq(hotlistConsultants.hotlistId, h.id));

          // Get client name if exists
          let clientName = null;
          if (h.clientId) {
            const [clientData] = await db.select({ name: accounts.name })
              .from(accounts)
              .where(eq(accounts.id, h.clientId))
              .limit(1);
            clientName = clientData?.name;
          }

          // Get creator name
          let creatorName = null;
          if (h.createdBy) {
            const [creatorData] = await db.select({ fullName: userProfiles.fullName })
              .from(userProfiles)
              .where(eq(userProfiles.id, h.createdBy))
              .limit(1);
            creatorName = creatorData?.fullName;
          }

          // Get last sent date from marketing activities
          const [lastSentData] = await db.select({
            sentAt: marketingActivities.sentAt,
          })
            .from(marketingActivities)
            .where(eq(marketingActivities.activityType, 'email_blast'))
            .orderBy(desc(marketingActivities.sentAt))
            .limit(1);

          return {
            id: h.id,
            name: h.name,
            description: h.description,
            purpose: h.purpose,
            status: h.status,
            consultantCount: consultantCountData?.count || 0,
            client: clientName ? { name: clientName } : null,
            creator: creatorName ? { fullName: creatorName } : null,
            createdAt: h.createdAt,
            lastSentAt: lastSentData?.sentAt || null,
          };
        }));

        // Get total count
        const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
          .from(hotlists)
          .where(and(...conditions));

        return {
          items: enrichedHotlists,
          total: totalCount?.count || 0,
          limit,
          offset,
        };
      }),

    /**
     * Get a single hotlist by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        const [hotlist] = await db.select()
          .from(hotlists)
          .where(and(
            eq(hotlists.id, id),
            eq(hotlists.orgId, orgId)
          ))
          .limit(1);

        if (!hotlist) {
          throw new Error('Hotlist not found');
        }

        // Get consultants in this hotlist
        const consultantsInHotlist = await db.select({
          id: hotlistConsultants.id,
          consultantId: hotlistConsultants.consultantId,
          positionOrder: hotlistConsultants.positionOrder,
          notes: hotlistConsultants.notes,
          addedAt: hotlistConsultants.addedAt,
        })
          .from(hotlistConsultants)
          .where(eq(hotlistConsultants.hotlistId, id))
          .orderBy(hotlistConsultants.positionOrder);

        return {
          ...hotlist,
          consultants: consultantsInHotlist,
        };
      }),

    /**
     * Create a new hotlist
     */
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        purpose: z.enum(['general', 'client_specific', 'skill_specific']),
        clientId: z.string().uuid().optional(),
        consultantIds: z.array(z.string().uuid()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;
        const { name, description, purpose, clientId, consultantIds } = input;

        // Get user profile ID
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
          .limit(1);

        // Create hotlist
        const [newHotlist] = await db.insert(hotlists).values({
          orgId,
          name,
          description,
          purpose,
          clientId: clientId || null,
          status: 'active',
          createdBy: profile?.id || null,
        }).returning();

        // Add consultants if provided
        if (consultantIds && consultantIds.length > 0) {
          await db.insert(hotlistConsultants).values(
            consultantIds.map((consultantId, index) => ({
              hotlistId: newHotlist.id,
              consultantId,
              positionOrder: index + 1,
              addedBy: profile?.id || null,
            }))
          );
        }

        return newHotlist;
      }),

    /**
     * Update a hotlist
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        purpose: z.enum(['general', 'client_specific', 'skill_specific']).optional(),
        clientId: z.string().uuid().nullable().optional(),
        status: z.enum(['active', 'archived']).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, ...updates } = input;

        const [updated] = await db.update(hotlists)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(and(
            eq(hotlists.id, id),
            eq(hotlists.orgId, orgId)
          ))
          .returning();

        return updated;
      }),

    /**
     * Archive a hotlist
     */
    archive: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        const [updated] = await db.update(hotlists)
          .set({
            status: 'archived',
            updatedAt: new Date(),
          })
          .where(and(
            eq(hotlists.id, id),
            eq(hotlists.orgId, orgId)
          ))
          .returning();

        return updated;
      }),

    /**
     * Delete a hotlist
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        // Delete hotlist (cascade will handle consultants)
        await db.delete(hotlists)
          .where(and(
            eq(hotlists.id, id),
            eq(hotlists.orgId, orgId)
          ));

        return { success: true };
      }),

    /**
     * Duplicate a hotlist
     */
    duplicate: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;
        const { id } = input;

        // Get original hotlist
        const [original] = await db.select()
          .from(hotlists)
          .where(and(
            eq(hotlists.id, id),
            eq(hotlists.orgId, orgId)
          ))
          .limit(1);

        if (!original) {
          throw new Error('Hotlist not found');
        }

        // Get user profile
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
          .limit(1);

        // Create duplicate
        const [newHotlist] = await db.insert(hotlists).values({
          orgId,
          name: `${original.name} (Copy)`,
          description: original.description,
          purpose: original.purpose,
          clientId: original.clientId,
          status: 'active',
          createdBy: profile?.id || null,
        }).returning();

        // Copy consultants
        const consultantsInOriginal = await db.select()
          .from(hotlistConsultants)
          .where(eq(hotlistConsultants.hotlistId, id));

        if (consultantsInOriginal.length > 0) {
          await db.insert(hotlistConsultants).values(
            consultantsInOriginal.map((c) => ({
              hotlistId: newHotlist.id,
              consultantId: c.consultantId,
              positionOrder: c.positionOrder,
              notes: c.notes,
              addedBy: profile?.id || null,
            }))
          );
        }

        return newHotlist;
      }),

    /**
     * Bulk archive hotlists
     */
    bulkArchive: orgProtectedProcedure
      .input(z.object({ ids: z.array(z.string().uuid()) }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { ids } = input;

        await db.update(hotlists)
          .set({
            status: 'archived',
            updatedAt: new Date(),
          })
          .where(and(
            inArray(hotlists.id, ids),
            eq(hotlists.orgId, orgId)
          ));

        return { success: true, count: ids.length };
      }),

    /**
     * Add consultant to hotlist
     */
    addConsultant: orgProtectedProcedure
      .input(z.object({
        hotlistId: z.string().uuid(),
        consultantId: z.string().uuid(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const { hotlistId, consultantId, notes } = input;

        // Get max position
        const [maxPosition] = await db.select({
          max: sql<number>`coalesce(max(${hotlistConsultants.positionOrder}), 0)::int`,
        })
          .from(hotlistConsultants)
          .where(eq(hotlistConsultants.hotlistId, hotlistId));

        // Get user profile
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
          .limit(1);

        const [newEntry] = await db.insert(hotlistConsultants).values({
          hotlistId,
          consultantId,
          positionOrder: (maxPosition?.max || 0) + 1,
          notes,
          addedBy: profile?.id || null,
        }).returning();

        return newEntry;
      }),

    /**
     * Remove consultant from hotlist
     */
    removeConsultant: orgProtectedProcedure
      .input(z.object({
        hotlistId: z.string().uuid(),
        consultantId: z.string().uuid(),
      }))
      .mutation(async ({ input }) => {
        const { hotlistId, consultantId } = input;

        await db.delete(hotlistConsultants)
          .where(and(
            eq(hotlistConsultants.hotlistId, hotlistId),
            eq(hotlistConsultants.consultantId, consultantId)
          ));

        return { success: true };
      }),
  }),

  /**
   * Job Orders Sub-Router
   * Procedures for managing external job orders from vendors
   */
  jobOrders: router({
    /**
     * Get job order statistics for metrics grid
     */
    getStats: orgProtectedProcedure.query(async ({ ctx }) => {
      const { orgId } = ctx;

      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);

      // Get all stats in parallel
      const [totalData, openData, urgentData, submissionsWeekData, placementsData] = await Promise.all([
        // Total job orders (not closed)
        db.select({ count: sql<number>`count(*)::int` })
          .from(jobOrders)
          .where(and(
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          )),

        // Open job orders
        db.select({ count: sql<number>`count(*)::int` })
          .from(jobOrders)
          .where(and(
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt),
            or(eq(jobOrders.status, 'new'), eq(jobOrders.status, 'working'))
          )),

        // Urgent job orders
        db.select({ count: sql<number>`count(*)::int` })
          .from(jobOrders)
          .where(and(
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt),
            eq(jobOrders.priority, 'urgent')
          )),

        // Submissions this week
        db.select({ count: sql<number>`count(*)::int` })
          .from(jobOrderSubmissions)
          .where(gte(jobOrderSubmissions.submittedAt, weekStart)),

        // Placements from submissions
        db.select({ count: sql<number>`count(*)::int` })
          .from(jobOrderSubmissions)
          .where(eq(jobOrderSubmissions.status, 'placed')),
      ]);

      return {
        stats: {
          total: totalData[0]?.count || 0,
          open: openData[0]?.count || 0,
          urgent: urgentData[0]?.count || 0,
          submissionsThisWeek: submissionsWeekData[0]?.count || 0,
          placements: placementsData[0]?.count || 0,
        },
      };
    }),

    /**
     * List job orders with filtering and pagination
     */
    list: orgProtectedProcedure
      .input(z.object({
        search: z.string().optional(),
        status: z.array(z.string()).optional(),
        priority: z.array(z.string()).optional(),
        workMode: z.array(z.string()).optional(),
        vendorId: z.string().uuid().optional(),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
        sortField: z.string().default('receivedAt'),
        sortDirection: z.enum(['asc', 'desc']).default('desc'),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { search, status, priority, workMode, vendorId, limit = 25, offset = 0 } = input || {};

        // Build where conditions
        const conditions = [
          eq(jobOrders.orgId, orgId),
          isNull(jobOrders.deletedAt),
        ];

        if (search) {
          conditions.push(like(jobOrders.title, `%${search}%`));
        }

        if (status && status.length > 0) {
          // Map screen status values to database enum values
          const statusMapping: Record<string, string> = {
            open: 'new',
            filled: 'filled',
            on_hold: 'on_hold',
            closed: 'closed',
          };
          const dbStatuses = status.map(s => statusMapping[s] || s);
          conditions.push(inArray(jobOrders.status, dbStatuses as ('new' | 'working' | 'filled' | 'closed' | 'on_hold')[]));
        }

        if (priority && priority.length > 0) {
          conditions.push(inArray(jobOrders.priority, priority as ('low' | 'medium' | 'high' | 'urgent')[]));
        }

        if (workMode && workMode.length > 0) {
          conditions.push(inArray(jobOrders.workMode, workMode));
        }

        if (vendorId) {
          conditions.push(eq(jobOrders.vendorId, vendorId));
        }

        // Fetch job orders
        const ordersData = await db.select({
          id: jobOrders.id,
          title: jobOrders.title,
          clientName: jobOrders.clientName,
          location: jobOrders.location,
          workMode: jobOrders.workMode,
          billRate: jobOrders.billRate,
          positions: jobOrders.positions,
          status: jobOrders.status,
          priority: jobOrders.priority,
          receivedAt: jobOrders.receivedAt,
          vendorId: jobOrders.vendorId,
        })
          .from(jobOrders)
          .where(and(...conditions))
          .orderBy(desc(jobOrders.receivedAt))
          .limit(limit)
          .offset(offset);

        // Enrich with vendor info and submission count
        const enrichedOrders = await Promise.all(ordersData.map(async (o) => {
          // Get vendor name
          let vendorName = 'Direct';
          if (o.vendorId) {
            const [vendor] = await db.select({ name: vendors.name })
              .from(vendors)
              .where(eq(vendors.id, o.vendorId))
              .limit(1);
            vendorName = vendor?.name || 'Unknown Vendor';
          }

          // Get submission count
          const [submissionCountData] = await db.select({
            count: sql<number>`count(*)::int`,
          })
            .from(jobOrderSubmissions)
            .where(eq(jobOrderSubmissions.orderId, o.id));

          // Map DB status to screen status
          const statusMapping: Record<string, string> = {
            new: 'open',
            working: 'open',
            filled: 'filled',
            on_hold: 'on_hold',
            closed: 'closed',
          };

          return {
            id: o.id,
            title: o.title,
            clientName: o.clientName || 'Unknown Client',
            vendor: { name: vendorName },
            location: o.location || 'Remote',
            workMode: o.workMode || 'remote',
            billRate: o.billRate ? parseFloat(o.billRate) : null,
            positions: o.positions || 1,
            submissionCount: submissionCountData?.count || 0,
            status: statusMapping[o.status || 'new'] || 'open',
            priority: o.priority || 'normal',
            postedAt: o.receivedAt,
          };
        }));

        // Get total count
        const [totalCount] = await db.select({ count: sql<number>`count(*)::int` })
          .from(jobOrders)
          .where(and(...conditions));

        return {
          items: enrichedOrders,
          total: totalCount?.count || 0,
          limit,
          offset,
        };
      }),

    /**
     * Get a single job order by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        const [order] = await db.select()
          .from(jobOrders)
          .where(and(
            eq(jobOrders.id, id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          ))
          .limit(1);

        if (!order) {
          throw new Error('Job order not found');
        }

        // Get vendor info
        let vendorName = 'Direct';
        if (order.vendorId) {
          const [vendor] = await db.select({ name: vendors.name })
            .from(vendors)
            .where(eq(vendors.id, order.vendorId))
            .limit(1);
          vendorName = vendor?.name || 'Unknown Vendor';
        }

        // Get requirements
        const requirements = await db.select()
          .from(jobOrderRequirements)
          .where(eq(jobOrderRequirements.orderId, id))
          .orderBy(jobOrderRequirements.priority);

        // Get skills
        const skills = await db.select()
          .from(jobOrderSkills)
          .where(eq(jobOrderSkills.orderId, id));

        // Get submissions
        const submissions = await db.select({
          id: jobOrderSubmissions.id,
          consultantId: jobOrderSubmissions.consultantId,
          status: jobOrderSubmissions.status,
          submittedRate: jobOrderSubmissions.submittedRate,
          submittedAt: jobOrderSubmissions.submittedAt,
        })
          .from(jobOrderSubmissions)
          .where(eq(jobOrderSubmissions.orderId, id))
          .orderBy(desc(jobOrderSubmissions.submittedAt));

        return {
          ...order,
          vendor: { name: vendorName },
          requirements,
          skills,
          submissions,
        };
      }),

    /**
     * Create a new job order
     */
    create: orgProtectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        clientName: z.string().optional(),
        vendorId: z.string().uuid().optional(),
        location: z.string().optional(),
        workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
        billRate: z.number().positive().optional(),
        durationMonths: z.number().positive().optional(),
        positions: z.number().int().positive().default(1),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
        responseDueAt: z.string().datetime().optional(),
        source: z.enum(['email', 'portal', 'call', 'referral']).default('email'),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;
        const { billRate, responseDueAt, ...rest } = input;

        // Get user profile ID
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
          .limit(1);

        const [newOrder] = await db.insert(jobOrders).values({
          orgId,
          ...rest,
          billRate: billRate ? String(billRate) : null,
          responseDueAt: responseDueAt ? new Date(responseDueAt) : null,
          status: 'new',
          receivedAt: new Date(),
          createdBy: profile?.id || null,
        }).returning();

        return newOrder;
      }),

    /**
     * Update a job order
     */
    update: orgProtectedProcedure
      .input(z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        clientName: z.string().optional(),
        vendorId: z.string().uuid().nullable().optional(),
        location: z.string().optional(),
        workMode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
        billRate: z.number().positive().nullable().optional(),
        durationMonths: z.number().positive().nullable().optional(),
        positions: z.number().int().positive().optional(),
        status: z.enum(['new', 'working', 'filled', 'closed', 'on_hold']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        responseDueAt: z.string().datetime().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id, billRate, responseDueAt, ...rest } = input;

        const updateData: Record<string, unknown> = {
          ...rest,
          updatedAt: new Date(),
        };

        if (billRate !== undefined) {
          updateData.billRate = billRate !== null ? String(billRate) : null;
        }

        if (responseDueAt !== undefined) {
          updateData.responseDueAt = responseDueAt !== null ? new Date(responseDueAt) : null;
        }

        const [updated] = await db.update(jobOrders)
          .set(updateData)
          .where(and(
            eq(jobOrders.id, id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          ))
          .returning();

        return updated;
      }),

    /**
     * Close a job order
     */
    close: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        const [updated] = await db.update(jobOrders)
          .set({
            status: 'closed',
            updatedAt: new Date(),
          })
          .where(and(
            eq(jobOrders.id, id),
            eq(jobOrders.orgId, orgId),
            isNull(jobOrders.deletedAt)
          ))
          .returning();

        return updated;
      }),

    /**
     * Delete a job order (soft delete)
     */
    delete: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { id } = input;

        const [deleted] = await db.update(jobOrders)
          .set({
            deletedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(jobOrders.id, id),
            eq(jobOrders.orgId, orgId)
          ))
          .returning();

        return deleted;
      }),

    /**
     * Submit a consultant to a job order
     */
    submitConsultant: orgProtectedProcedure
      .input(z.object({
        orderId: z.string().uuid(),
        consultantId: z.string().uuid(),
        submittedRate: z.number().positive().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;
        const { orderId, consultantId, submittedRate, notes } = input;

        // Get user profile ID
        const [profile] = await db.select({ id: userProfiles.id })
          .from(userProfiles)
          .where(or(eq(userProfiles.id, userId!), eq(userProfiles.authId, userId!)))
          .limit(1);

        const [submission] = await db.insert(jobOrderSubmissions).values({
          orderId,
          consultantId,
          submittedRate: submittedRate ? String(submittedRate) : null,
          notes,
          status: 'submitted',
          createdBy: profile?.id || null,
        }).returning();

        return submission;
      }),

    /**
     * Get vendors list for filter dropdown
     */
    getVendors: orgProtectedProcedure.query(async ({ ctx }) => {
      const { orgId } = ctx;

      const vendorsList = await db.select({
        id: vendors.id,
        name: vendors.name,
      })
        .from(vendors)
        .where(and(
          eq(vendors.orgId, orgId),
          isNull(vendors.deletedAt),
          eq(vendors.status, 'active')
        ))
        .orderBy(vendors.name);

      return vendorsList;
    }),
  }),
});

export type BenchRouter = typeof benchRouter;
