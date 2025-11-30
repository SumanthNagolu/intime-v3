/**
 * tRPC Router: Finance Metrics
 * Provides real-time dashboard metrics for CFO role
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import { placements } from '@/lib/db/schema/ats';
import { accounts, deals } from '@/lib/db/schema/crm';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';

export const financeMetricsRouter = router({
  /**
   * Get Revenue MTD
   */
  getRevenueMTD: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [currentData, lastMonthData] = await Promise.all([
      // Current month revenue from placements
      db.select({
        revenue: sql<number>`coalesce(sum(${placements.billRate} * 160)::int, 0)`, // Assuming 160 hours/month
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active'),
          gte(placements.startDate, monthStart)
        )),

      // Last month revenue
      db.select({
        revenue: sql<number>`coalesce(sum(${placements.billRate} * 160)::int, 0)`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          eq(placements.status, 'active'),
          gte(placements.startDate, lastMonthStart),
          lte(placements.startDate, lastMonthEnd)
        )),
    ]);

    const current = currentData[0]?.revenue || 0;
    const lastMonth = lastMonthData[0]?.revenue || 1;
    const change = Math.round(((current - lastMonth) / lastMonth) * 100);

    return {
      value: current,
      label: `$${(current / 1000).toFixed(0)}K MTD`,
      trend: change >= 0 ? 'up' as const : 'down' as const,
      change: Math.abs(change),
    };
  }),

  /**
   * Get Revenue YTD
   */
  getRevenueYTD: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const lastYearStart = new Date(new Date().getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(new Date().getFullYear() - 1, 11, 31);

    const [currentData, lastYearData] = await Promise.all([
      // Current year revenue
      db.select({
        revenue: sql<number>`coalesce(sum(${placements.billRate} * 160 *
          EXTRACT(MONTH FROM age(LEAST(${placements.endDate}, CURRENT_DATE), ${placements.startDate})))::int, 0)`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.startDate, yearStart)
        )),

      // Last year total
      db.select({
        revenue: sql<number>`coalesce(sum(${placements.billRate} * 160 * 12)::int, 0)`,
      })
        .from(placements)
        .where(and(
          eq(placements.orgId, orgId),
          gte(placements.startDate, lastYearStart),
          lte(placements.endDate, lastYearEnd)
        )),
    ]);

    const current = currentData[0]?.revenue || 0;
    const lastYear = lastYearData[0]?.revenue || 1;
    const growth = Math.round(((current - lastYear) / lastYear) * 100);

    return {
      value: current,
      label: `$${(current / 1000000).toFixed(1)}M YTD`,
      trend: growth >= 0 ? 'up' as const : 'down' as const,
      change: Math.abs(growth),
      target: current * 1.2, // 20% growth target
    };
  }),

  /**
   * Get Gross Margin
   */
  getGrossMargin: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const data = await db.select({
      avgBillRate: sql<number>`coalesce(avg(${placements.billRate})::int, 0)`,
      avgPayRate: sql<number>`coalesce(avg(${placements.payRate})::int, 0)`,
    })
      .from(placements)
      .where(and(
        eq(placements.orgId, orgId),
        eq(placements.status, 'active')
      ));

    const billRate = data[0]?.avgBillRate || 0;
    const payRate = data[0]?.avgPayRate || 0;
    const margin = billRate > 0 ? Math.round(((billRate - payRate) / billRate) * 100) : 0;

    return {
      value: margin,
      label: `${margin}% average margin`,
      trend: margin >= 25 ? 'up' as const : margin >= 20 ? 'neutral' as const : 'down' as const,
      change: margin,
    };
  }),

  /**
   * Get Days Sales Outstanding (DSO)
   */
  getDSO: orgProtectedProcedure.query(async ({ ctx }) => {
    // Mock DSO calculation - would need invoices table
    const dso = 42; // days
    const target = 45;

    return {
      value: dso,
      label: `${dso} days`,
      trend: dso <= target ? 'up' as const : 'down' as const,
      change: Math.abs(dso - target),
      target,
    };
  }),

  /**
   * Get Revenue vs Expenses trend
   */
  getRevenueTrend: orgProtectedProcedure.query(async ({ ctx }) => {
    // Return monthly data (mock for now)
    return [
      { label: 'Jan', value: 850000, color: '#10B981' },
      { label: 'Feb', value: 920000, color: '#10B981' },
      { label: 'Mar', value: 880000, color: '#10B981' },
      { label: 'Apr', value: 950000, color: '#10B981' },
      { label: 'May', value: 1020000, color: '#10B981' },
      { label: 'Jun', value: 980000, color: '#10B981' },
    ];
  }),

  /**
   * Get Revenue by Client (Top 10)
   */
  getRevenueByClient: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const yearStart = new Date(new Date().getFullYear(), 0, 1);

    const clientRevenue = await db.select({
      accountId: placements.accountId,
      accountName: accounts.name,
      revenue: sql<number>`coalesce(sum(${placements.billRate} * 160)::int, 0)`,
    })
      .from(placements)
      .innerJoin(accounts, eq(placements.accountId, accounts.id))
      .where(and(
        eq(placements.orgId, orgId),
        gte(placements.startDate, yearStart)
      ))
      .groupBy(placements.accountId, accounts.name)
      .orderBy(desc(sql`sum(${placements.billRate})`))
      .limit(10);

    const colors = ['#D87254', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'];

    return clientRevenue.map((client, index) => ({
      label: client.accountName || 'Unknown Client',
      value: client.revenue,
      color: colors[index % colors.length],
    }));
  }),

  /**
   * Get Revenue by Division
   */
  getRevenueByDivision: orgProtectedProcedure.query(async ({ ctx }) => {
    // Mock data for division breakdown
    return [
      { label: 'Recruiting', value: 2500000, color: '#D87254' },
      { label: 'Bench Sales', value: 1800000, color: '#10B981' },
      { label: 'TA/BD', value: 700000, color: '#3B82F6' },
    ];
  }),

  /**
   * Get Outstanding Invoices (AR Aging)
   */
  getOutstandingInvoices: orgProtectedProcedure.query(async ({ ctx }) => {
    // Mock data - would need invoices table
    return [
      {
        id: '1',
        title: 'Acme Corp - Invoice #1234',
        subtitle: '$45,000 - 45 days overdue',
        status: 'Overdue',
        statusColor: 'error' as const,
        timestamp: 'Due Oct 15',
      },
      {
        id: '2',
        title: 'TechStart Inc - Invoice #1235',
        subtitle: '$28,500 - 30 days overdue',
        status: 'Overdue',
        statusColor: 'warning' as const,
        timestamp: 'Due Oct 30',
      },
      {
        id: '3',
        title: 'GlobalCo - Invoice #1236',
        subtitle: '$67,000 - Due in 15 days',
        status: 'Current',
        statusColor: 'success' as const,
        timestamp: 'Due Dec 14',
      },
    ];
  }),

  /**
   * Get Profitability by Account
   */
  getProfitabilityByAccount: orgProtectedProcedure.query(async ({ ctx }) => {
    const { orgId } = ctx;

    const profitability = await db.select({
      accountId: placements.accountId,
      accountName: accounts.name,
      avgMargin: sql<number>`coalesce(avg((${placements.billRate} - ${placements.payRate}) / NULLIF(${placements.billRate}, 0) * 100)::int, 0)`,
      revenue: sql<number>`coalesce(sum(${placements.billRate} * 160)::int, 0)`,
    })
      .from(placements)
      .innerJoin(accounts, eq(placements.accountId, accounts.id))
      .where(and(
        eq(placements.orgId, orgId),
        eq(placements.status, 'active')
      ))
      .groupBy(placements.accountId, accounts.name)
      .orderBy(desc(sql`sum(${placements.billRate})`))
      .limit(10);

    return profitability.map((account) => ({
      id: account.accountId,
      title: account.accountName || 'Unknown',
      subtitle: `$${(account.revenue / 1000).toFixed(0)}K revenue`,
      status: `${account.avgMargin}% margin`,
      statusColor: account.avgMargin >= 25 ? 'success' as const : account.avgMargin >= 20 ? 'warning' as const : 'error' as const,
      timestamp: account.avgMargin >= 25 ? 'Healthy' : account.avgMargin >= 20 ? 'Monitor' : 'At Risk',
    }));
  }),

  /**
   * Get Cash Flow Projection
   */
  getCashFlowProjection: orgProtectedProcedure.query(async ({ ctx }) => {
    // Mock data for cash flow projection
    return [
      { label: 'Week 1', value: 250000, color: '#10B981' },
      { label: 'Week 2', value: 280000, color: '#10B981' },
      { label: 'Week 3', value: 320000, color: '#10B981' },
      { label: 'Week 4', value: 290000, color: '#10B981' },
      { label: 'Week 5', value: 350000, color: '#3B82F6' },
      { label: 'Week 6', value: 380000, color: '#3B82F6' },
    ];
  }),
});
