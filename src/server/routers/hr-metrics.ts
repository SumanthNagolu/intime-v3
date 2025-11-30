/**
 * tRPC Router: HR Metrics
 * Provides real-time dashboard metrics for HR role
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, sql, gte, lte, desc, isNull, isNotNull } from 'drizzle-orm';

export const hrMetricsRouter = router({
  /**
   * Get total headcount for the organization
   */
  getHeadcount: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const [employeesData, contractorsData] = await Promise.all([
      // Active employees (those with employee hire date and no candidate status)
      db.select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(
          eq(userProfiles.orgId, orgId),
          eq(userProfiles.isActive, true),
          isNotNull(userProfiles.employeeHireDate),
          isNull(userProfiles.candidateStatus)
        )),

      // Active contractors (candidates who are placed)
      db.select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(
          eq(userProfiles.orgId, orgId),
          eq(userProfiles.isActive, true),
          eq(userProfiles.candidateStatus, 'placed')
        )),
    ]);

    const employees = employeesData[0]?.count || 0;
    const contractors = contractorsData[0]?.count || 0;

    return {
      value: employees + contractors,
      label: `${employees} employees, ${contractors} contractors`,
      trend: 'up' as const,
      change: 5, // Would calculate from historical data
    };
  }),

  /**
   * Get onboarding count - employees in onboarding process
   */
  getOnboardingCount: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get employees hired in last 30 days (simplified onboarding detection)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const onboardingData = await db.select({ count: sql<number>`count(*)::int` })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.isActive, true),
        isNotNull(userProfiles.employeeHireDate),
        sql`${userProfiles.employeeHireDate} >= ${thirtyDaysAgo.toISOString()}`
      ));

    return {
      value: onboardingData[0]?.count || 0,
      label: 'New hires in last 30 days',
      trend: 'neutral' as const,
    };
  }),

  /**
   * Get attrition rate
   */
  getAttritionRate: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const [totalData, terminatedData] = await Promise.all([
      // Total employees at start of year (approximation)
      db.select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(
          eq(userProfiles.orgId, orgId),
          isNotNull(userProfiles.employeeHireDate),
          sql`${userProfiles.employeeHireDate} <= ${yearStart.toISOString()}`
        )),

      // Terminated employees this year (using updatedAt as proxy for termination date)
      db.select({ count: sql<number>`count(*)::int` })
        .from(userProfiles)
        .where(and(
          eq(userProfiles.orgId, orgId),
          eq(userProfiles.isActive, false),
          isNotNull(userProfiles.employeeHireDate),
          sql`${userProfiles.updatedAt} >= ${yearStart.toISOString()}`
        )),
    ]);

    const total = totalData[0]?.count || 1; // Avoid division by zero
    const terminated = terminatedData[0]?.count || 0;
    const rate = Math.round((terminated / total) * 100);

    return {
      value: rate,
      label: `${terminated} departures YTD`,
      trend: rate > 15 ? 'down' as const : rate < 10 ? 'up' as const : 'neutral' as const,
      change: rate,
    };
  }),

  /**
   * Get onboarding list - employees currently onboarding
   */
  getOnboardingList: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const onboarding = await db.select({
      id: userProfiles.id,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      title: userProfiles.title,
      employeePosition: userProfiles.employeePosition,
      hireDate: userProfiles.employeeHireDate,
      department: userProfiles.employeeDepartment,
    })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.isActive, true),
        isNotNull(userProfiles.employeeHireDate),
        sql`${userProfiles.employeeHireDate} >= ${thirtyDaysAgo.toISOString()}`
      ))
      .orderBy(desc(userProfiles.employeeHireDate))
      .limit(10);

    return onboarding.map((emp) => {
      const daysOnboarded = emp.hireDate
        ? Math.floor((Date.now() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const completionPercent = Math.min(100, Math.round((daysOnboarded / 30) * 100));

      return {
        id: emp.id,
        title: `${emp.firstName} ${emp.lastName}`,
        subtitle: emp.title || emp.employeePosition || emp.department || 'New Hire',
        status: completionPercent < 50 ? 'In Progress' : completionPercent < 100 ? 'Almost Done' : 'Complete',
        statusColor: completionPercent < 50 ? 'warning' as const : completionPercent < 100 ? 'success' as const : 'success' as const,
        timestamp: emp.hireDate ? `Day ${daysOnboarded}` : 'Unknown',
      };
    });
  }),

  /**
   * Get pending approvals (PTO, expenses, etc.)
   */
  getPendingApprovals: orgProtectedProcedure.query(async ({ ctx }) => {
    // For now return mock data - would need time_attendance or approval tables
    return [
      {
        id: '1',
        title: 'PTO Request - John Smith',
        subtitle: 'Dec 23-27, 2024',
        status: 'Pending',
        statusColor: 'warning' as const,
        timestamp: '2 hours ago',
      },
      {
        id: '2',
        title: 'Expense Report - Sarah Johnson',
        subtitle: '$450 - Client Dinner',
        status: 'Pending',
        statusColor: 'warning' as const,
        timestamp: '1 day ago',
      },
    ];
  }),

  /**
   * Get compliance alerts
   */
  getComplianceAlerts: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get employees with visa expiring in next 60 days
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    const alerts = await db.select({
      id: userProfiles.id,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      visaStatus: userProfiles.candidateCurrentVisa,
      visaExpiry: userProfiles.candidateVisaExpiry,
    })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.isActive, true),
        isNotNull(userProfiles.candidateVisaExpiry),
        sql`${userProfiles.candidateVisaExpiry} <= ${sixtyDaysFromNow.toISOString()}`
      ))
      .limit(10);

    return alerts.map((emp) => {
      const daysUntilExpiry = emp.visaExpiry
        ? Math.floor((emp.visaExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: emp.id,
        title: `Work Authorization Expiring - ${emp.firstName} ${emp.lastName}`,
        subtitle: `${emp.visaStatus || 'Work Visa'} expires in ${daysUntilExpiry} days`,
        status: daysUntilExpiry < 30 ? 'Urgent' : 'Warning',
        statusColor: daysUntilExpiry < 30 ? 'error' as const : 'warning' as const,
        timestamp: emp.visaExpiry?.toLocaleDateString() || 'Unknown',
      };
    });
  }),

  /**
   * Get retention trend data
   */
  getRetentionTrend: orgProtectedProcedure.query(async ({ ctx }) => {
    // Return monthly retention rates (mock data for now)
    return [
      { label: 'Jan', value: 95, color: '#10B981' },
      { label: 'Feb', value: 94, color: '#10B981' },
      { label: 'Mar', value: 96, color: '#10B981' },
      { label: 'Apr', value: 93, color: '#F59E0B' },
      { label: 'May', value: 94, color: '#10B981' },
      { label: 'Jun', value: 92, color: '#F59E0B' },
    ];
  }),

  /**
   * Get recent HR activity
   */
  getRecentActivity: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    // Get recent hires
    const recentHires = await db.select({
      id: userProfiles.id,
      firstName: userProfiles.firstName,
      lastName: userProfiles.lastName,
      title: userProfiles.title,
      employeePosition: userProfiles.employeePosition,
      hireDate: userProfiles.employeeHireDate,
    })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        isNotNull(userProfiles.employeeHireDate)
      ))
      .orderBy(desc(userProfiles.employeeHireDate))
      .limit(5);

    return recentHires.map((emp) => ({
      id: emp.id,
      title: `New Hire: ${emp.firstName} ${emp.lastName}`,
      subtitle: emp.title || emp.employeePosition || 'Employee',
      status: 'Completed',
      statusColor: 'success' as const,
      timestamp: emp.hireDate?.toLocaleDateString() || 'Unknown',
    }));
  }),

  /**
   * Get headcount by department
   */
  getHeadcountByDepartment: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const departments = await db.select({
      department: userProfiles.employeeDepartment,
      count: sql<number>`count(*)::int`,
    })
      .from(userProfiles)
      .where(and(
        eq(userProfiles.orgId, orgId),
        eq(userProfiles.isActive, true),
        isNotNull(userProfiles.employeeDepartment)
      ))
      .groupBy(userProfiles.employeeDepartment)
      .orderBy(desc(sql`count(*)`));

    const colors = ['#D87254', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899'];

    return departments.map((dept, index) => ({
      label: dept.department || 'Unassigned',
      value: dept.count,
      color: colors[index % colors.length],
    }));
  }),
});
