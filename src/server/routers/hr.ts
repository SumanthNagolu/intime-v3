/**
 * tRPC Router: HR (Human Resources) Module
 * Handles employees, onboarding, time-off, payroll, benefits, performance, compliance, pods
 */

import { z } from 'zod';
import { router, orgProtectedProcedure } from '../trpc/trpc';
import { db } from '@/lib/db';
import {
  employees,
  employeeProfiles,
  employeeDocuments,
  employeeOnboarding,
  onboardingTasks,
  employeeTimeOff,
  benefitPlans,
  benefitPlanOptions,
  employeeBenefits,
  benefitDependents,
  complianceRequirements,
  employeeCompliance,
  i9Records,
  performanceGoals,
  performanceFeedback,
} from '@/lib/db/schema/hr';
import { pods, payrollRuns, payrollItems, performanceReviews, timeAttendance, ptoBalances } from '@/lib/db/schema/ta-hr';
import { userProfiles } from '@/lib/db/schema/user-profiles';
import { eq, and, desc, asc, sql, isNull, ilike, or, inArray, gte, lte, count, type SQL } from 'drizzle-orm';

// =====================================================
// VALIDATION SCHEMAS
// =====================================================

const listEmployeesInput = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(25),
  sortBy: z.enum(['name', 'department', 'status', 'hireDate', 'createdAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  filters: z.object({
    status: z.array(z.enum(['onboarding', 'active', 'on_leave', 'terminated'])).optional(),
    employmentType: z.array(z.enum(['fte', 'contractor', 'intern', 'part_time'])).optional(),
    department: z.array(z.string()).optional(),
    workMode: z.array(z.enum(['on_site', 'remote', 'hybrid'])).optional(),
    managerId: z.string().uuid().optional(),
  }).optional(),
});

const createEmployeeInput = z.object({
  userId: z.string().uuid(),
  employeeNumber: z.string().optional(),
  status: z.enum(['onboarding', 'active', 'on_leave', 'terminated']).default('onboarding'),
  employmentType: z.enum(['fte', 'contractor', 'intern', 'part_time']).default('fte'),
  hireDate: z.string(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  managerId: z.string().uuid().optional(),
  location: z.string().optional(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  salaryType: z.enum(['hourly', 'annual']).default('annual'),
  salaryAmount: z.number().optional(),
  currency: z.string().default('USD'),
});

const updateEmployeeInput = z.object({
  id: z.string().uuid(),
  status: z.enum(['onboarding', 'active', 'on_leave', 'terminated']).optional(),
  employmentType: z.enum(['fte', 'contractor', 'intern', 'part_time']).optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
  managerId: z.string().uuid().optional(),
  location: z.string().optional(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  salaryType: z.enum(['hourly', 'annual']).optional(),
  salaryAmount: z.number().optional(),
});

const terminateEmployeeInput = z.object({
  id: z.string().uuid(),
  terminationDate: z.string(),
  terminationReason: z.string(),
});

const createTimeOffInput = z.object({
  employeeId: z.string().uuid(),
  type: z.enum(['pto', 'sick', 'personal', 'bereavement', 'jury_duty', 'parental', 'unpaid']),
  startDate: z.string(),
  endDate: z.string(),
  hours: z.number().positive(),
  reason: z.string().optional(),
});

const approveTimeOffInput = z.object({
  id: z.string().uuid(),
});

const denyTimeOffInput = z.object({
  id: z.string().uuid(),
  denialReason: z.string(),
});

const startOnboardingInput = z.object({
  employeeId: z.string().uuid(),
  assignedTo: z.string().uuid().optional(),
});

const updateOnboardingTaskInput = z.object({
  taskId: z.string().uuid(),
  status: z.enum(['pending', 'completed', 'skipped']),
  notes: z.string().optional(),
});

const createGoalInput = z.object({
  employeeId: z.string().uuid(),
  goal: z.string(),
  category: z.enum(['business', 'development', 'behavioral']),
  weightPercent: z.number().int().min(0).max(100).optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});

const enrollBenefitInput = z.object({
  employeeId: z.string().uuid(),
  planOptionId: z.string().uuid(),
  coverageStart: z.string(),
});

const addDependentInput = z.object({
  employeeBenefitId: z.string().uuid(),
  name: z.string(),
  relationship: z.enum(['spouse', 'child', 'domestic_partner', 'other']),
  dateOfBirth: z.string().optional(),
});

const completeComplianceInput = z.object({
  employeeId: z.string().uuid(),
  requirementId: z.string().uuid(),
  documentUrl: z.string().optional(),
  notes: z.string().optional(),
});

// =====================================================
// HR ROUTER
// =====================================================

export const hrRouter = router({
  // =====================================================
  // EMPLOYEES
  // =====================================================

  employees: router({
    /**
     * List employees with pagination, search, and filters
     */
    list: orgProtectedProcedure
      .input(listEmployeesInput)
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const { page, pageSize, sortBy, sortDirection, search, filters } = input;
        const offset = (page - 1) * pageSize;

        // Build where conditions
        const conditions: SQL<unknown>[] = [
          eq(employees.orgId, orgId!),
          isNull(employees.deletedAt),
        ];

        // Search
        if (search) {
          conditions.push(
            or(
              ilike(employees.department, `%${search}%`),
              ilike(employees.jobTitle, `%${search}%`),
              ilike(employees.location, `%${search}%`),
            )!
          );
        }

        // Apply filters
        if (filters?.status?.length) {
          conditions.push(inArray(employees.status, filters.status));
        }
        if (filters?.employmentType?.length) {
          conditions.push(inArray(employees.employmentType, filters.employmentType));
        }
        if (filters?.workMode?.length) {
          conditions.push(inArray(employees.workMode, filters.workMode));
        }
        if (filters?.managerId) {
          conditions.push(eq(employees.managerId, filters.managerId));
        }

        // Build sort
        const sortColumn = sortBy === 'department' ? employees.department
          : sortBy === 'status' ? employees.status
          : sortBy === 'hireDate' ? employees.hireDate
          : employees.createdAt;

        const orderBy = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

        // Execute queries
        const [items, countResult] = await Promise.all([
          db.select({
            id: employees.id,
            orgId: employees.orgId,
            userId: employees.userId,
            employeeNumber: employees.employeeNumber,
            status: employees.status,
            employmentType: employees.employmentType,
            hireDate: employees.hireDate,
            terminationDate: employees.terminationDate,
            department: employees.department,
            jobTitle: employees.jobTitle,
            managerId: employees.managerId,
            location: employees.location,
            workMode: employees.workMode,
            salaryType: employees.salaryType,
            salaryAmount: employees.salaryAmount,
            currency: employees.currency,
            createdAt: employees.createdAt,
            updatedAt: employees.updatedAt,
          })
            .from(employees)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(pageSize)
            .offset(offset),
          db.select({ count: count() })
            .from(employees)
            .where(and(...conditions)),
        ]);

        // Get user profiles for names
        const userIds = items.map(e => e.userId);
        const profiles = userIds.length > 0
          ? await db.select({
              id: userProfiles.id,
              firstName: userProfiles.firstName,
              lastName: userProfiles.lastName,
              email: userProfiles.email,
              avatarUrl: userProfiles.avatarUrl,
            })
              .from(userProfiles)
              .where(inArray(userProfiles.id, userIds))
          : [];

        // Merge profiles with employees
        const profileMap = new Map(profiles.map(p => [p.id, p]));
        const itemsWithProfiles = items.map(e => ({
          ...e,
          user: profileMap.get(e.userId),
        }));

        return {
          items: itemsWithProfiles,
          total: countResult[0]?.count ?? 0,
          page,
          pageSize,
          totalPages: Math.ceil((countResult[0]?.count ?? 0) / pageSize),
        };
      }),

    /**
     * Get single employee by ID with all relations
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const employee = await db.query.employees.findFirst({
          where: and(
            eq(employees.id, input.id),
            eq(employees.orgId, orgId!),
            isNull(employees.deletedAt),
          ),
          with: {
            user: true,
            profile: true,
            manager: {
              with: { user: true },
            },
            documents: {
              orderBy: desc(employeeDocuments.createdAt),
            },
            onboarding: {
              with: { tasks: true },
              orderBy: desc(employeeOnboarding.createdAt),
              limit: 1,
            },
            timeOffRequests: {
              orderBy: desc(employeeTimeOff.createdAt),
              limit: 10,
            },
            benefits: {
              with: {
                planOption: {
                  with: { plan: true },
                },
                dependents: true,
              },
            },
            compliance: {
              with: { requirement: true },
            },
            i9Records: true,
            performanceGoals: {
              orderBy: desc(performanceGoals.createdAt),
              limit: 10,
            },
          },
        });

        if (!employee) {
          throw new Error('Employee not found');
        }

        return employee;
      }),

    /**
     * Create new employee
     */
    create: orgProtectedProcedure
      .input(createEmployeeInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [newEmployee] = await db.insert(employees)
          .values({
            orgId: orgId!,
            userId: input.userId,
            employeeNumber: input.employeeNumber,
            status: input.status,
            employmentType: input.employmentType,
            hireDate: input.hireDate,
            department: input.department,
            jobTitle: input.jobTitle,
            managerId: input.managerId,
            location: input.location,
            workMode: input.workMode,
            salaryType: input.salaryType,
            salaryAmount: input.salaryAmount?.toString(),
            currency: input.currency,
            createdBy: userId,
          })
          .returning();

        // Create empty profile
        await db.insert(employeeProfiles)
          .values({ employeeId: newEmployee.id });

        return newEmployee;
      }),

    /**
     * Update employee
     */
    update: orgProtectedProcedure
      .input(updateEmployeeInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;
        const { id, ...data } = input;

        const [updated] = await db.update(employees)
          .set({
            ...data,
            salaryAmount: data.salaryAmount?.toString(),
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .where(and(
            eq(employees.id, id),
            eq(employees.orgId, orgId!),
          ))
          .returning();

        return updated;
      }),

    /**
     * Terminate employee
     */
    terminate: orgProtectedProcedure
      .input(terminateEmployeeInput)
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(employees)
          .set({
            status: 'terminated',
            terminationDate: input.terminationDate,
            terminationReason: input.terminationReason,
            updatedAt: new Date(),
            updatedBy: userId,
          })
          .where(and(
            eq(employees.id, input.id),
            eq(employees.orgId, orgId!),
          ))
          .returning();

        return updated;
      }),

    /**
     * Get dashboard metrics
     */
    getMetrics: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const [
          totalResult,
          activeResult,
          onboardingResult,
          onLeaveResult,
        ] = await Promise.all([
          db.select({ count: count() })
            .from(employees)
            .where(and(
              eq(employees.orgId, orgId!),
              isNull(employees.deletedAt),
            )),
          db.select({ count: count() })
            .from(employees)
            .where(and(
              eq(employees.orgId, orgId!),
              eq(employees.status, 'active'),
              isNull(employees.deletedAt),
            )),
          db.select({ count: count() })
            .from(employees)
            .where(and(
              eq(employees.orgId, orgId!),
              eq(employees.status, 'onboarding'),
              isNull(employees.deletedAt),
            )),
          db.select({ count: count() })
            .from(employees)
            .where(and(
              eq(employees.orgId, orgId!),
              eq(employees.status, 'on_leave'),
              isNull(employees.deletedAt),
            )),
        ]);

        // Get pending time-off requests
        const pendingTimeOffResult = await db.select({ count: count() })
          .from(employeeTimeOff)
          .innerJoin(employees, eq(employeeTimeOff.employeeId, employees.id))
          .where(and(
            eq(employees.orgId, orgId!),
            eq(employeeTimeOff.status, 'pending'),
          ));

        // Get pending compliance
        const pendingComplianceResult = await db.select({ count: count() })
          .from(employeeCompliance)
          .innerJoin(employees, eq(employeeCompliance.employeeId, employees.id))
          .where(and(
            eq(employees.orgId, orgId!),
            eq(employeeCompliance.status, 'pending'),
          ));

        return {
          totalEmployees: totalResult[0]?.count ?? 0,
          activeEmployees: activeResult[0]?.count ?? 0,
          onboardingPending: onboardingResult[0]?.count ?? 0,
          onLeave: onLeaveResult[0]?.count ?? 0,
          pendingTimeOff: pendingTimeOffResult[0]?.count ?? 0,
          complianceAlerts: pendingComplianceResult[0]?.count ?? 0,
        };
      }),
  }),

  // =====================================================
  // ONBOARDING
  // =====================================================

  onboarding: router({
    /**
     * List onboarding workflows
     */
    list: orgProtectedProcedure
      .input(z.object({
        status: z.array(z.enum(['not_started', 'in_progress', 'completed', 'cancelled'])).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [];

        if (input?.status?.length) {
          conditions.push(inArray(employeeOnboarding.status, input.status));
        }

        const results = await db.select({
          onboarding: employeeOnboarding,
          employee: employees,
        })
          .from(employeeOnboarding)
          .innerJoin(employees, eq(employeeOnboarding.employeeId, employees.id))
          .where(and(
            eq(employees.orgId, orgId!),
            ...conditions,
          ))
          .orderBy(desc(employeeOnboarding.createdAt));

        // Get user profiles
        const userIds = results.map(r => r.employee.userId);
        const profiles = userIds.length > 0
          ? await db.select()
              .from(userProfiles)
              .where(inArray(userProfiles.id, userIds))
          : [];

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        return results.map(r => ({
          ...r.onboarding,
          employee: {
            ...r.employee,
            user: profileMap.get(r.employee.userId),
          },
        }));
      }),

    /**
     * Get onboarding by ID with tasks
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const result = await db.query.employeeOnboarding.findFirst({
          where: eq(employeeOnboarding.id, input.id),
          with: {
            employee: {
              with: { user: true },
            },
            tasks: {
              orderBy: asc(onboardingTasks.sortOrder),
            },
            assignedUser: true,
          },
        });

        return result;
      }),

    /**
     * Start onboarding for employee
     */
    start: orgProtectedProcedure
      .input(startOnboardingInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        // Create onboarding record
        const [onboarding] = await db.insert(employeeOnboarding)
          .values({
            employeeId: input.employeeId,
            status: 'in_progress',
            startedAt: new Date(),
            assignedTo: input.assignedTo ?? userId,
            createdBy: userId,
          })
          .returning();

        // Create default onboarding tasks
        const defaultTasks = [
          { taskName: 'Complete employee information form', category: 'paperwork' as const, sortOrder: 1 },
          { taskName: 'Send welcome email', category: 'orientation' as const, sortOrder: 2 },
          { taskName: 'Complete I-9 Section 1', category: 'paperwork' as const, sortOrder: 3 },
          { taskName: 'Complete tax forms (W-4)', category: 'paperwork' as const, sortOrder: 4 },
          { taskName: 'Set up payroll & direct deposit', category: 'paperwork' as const, sortOrder: 5 },
          { taskName: 'Order background check', category: 'paperwork' as const, sortOrder: 6 },
          { taskName: 'Set up IT equipment & access', category: 'it_setup' as const, sortOrder: 7 },
          { taskName: 'Review and finalize onboarding', category: 'orientation' as const, sortOrder: 8 },
        ];

        await db.insert(onboardingTasks)
          .values(defaultTasks.map(t => ({
            onboardingId: onboarding.id,
            taskName: t.taskName,
            category: t.category,
            isRequired: true,
            sortOrder: t.sortOrder,
          })));

        return onboarding;
      }),

    /**
     * Update onboarding task status
     */
    updateTask: orgProtectedProcedure
      .input(updateOnboardingTaskInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [updated] = await db.update(onboardingTasks)
          .set({
            status: input.status,
            completedAt: input.status === 'completed' ? new Date() : null,
            completedBy: input.status === 'completed' ? userId : null,
            notes: input.notes,
            updatedAt: new Date(),
          })
          .where(eq(onboardingTasks.id, input.taskId))
          .returning();

        // Check if all tasks are completed
        const remainingTasks = await db.select({ count: count() })
          .from(onboardingTasks)
          .where(and(
            eq(onboardingTasks.onboardingId, updated.onboardingId),
            eq(onboardingTasks.status, 'pending'),
            eq(onboardingTasks.isRequired, true),
          ));

        // If all required tasks are done, complete onboarding
        if (remainingTasks[0]?.count === 0) {
          await db.update(employeeOnboarding)
            .set({
              status: 'completed',
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(employeeOnboarding.id, updated.onboardingId));
        }

        return updated;
      }),
  }),

  // =====================================================
  // TIME OFF
  // =====================================================

  timeOff: router({
    /**
     * List time-off requests
     */
    list: orgProtectedProcedure
      .input(z.object({
        status: z.array(z.enum(['pending', 'approved', 'denied', 'cancelled'])).optional(),
        employeeId: z.string().uuid().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [eq(employees.orgId, orgId!)];

        if (input?.status?.length) {
          conditions.push(inArray(employeeTimeOff.status, input.status));
        }
        if (input?.employeeId) {
          conditions.push(eq(employeeTimeOff.employeeId, input.employeeId));
        }

        const results = await db.select({
          timeOff: employeeTimeOff,
          employee: employees,
        })
          .from(employeeTimeOff)
          .innerJoin(employees, eq(employeeTimeOff.employeeId, employees.id))
          .where(and(...conditions))
          .orderBy(desc(employeeTimeOff.createdAt));

        // Get user profiles
        const userIds = results.map(r => r.employee.userId);
        const profiles = userIds.length > 0
          ? await db.select()
              .from(userProfiles)
              .where(inArray(userProfiles.id, userIds))
          : [];

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        return results.map(r => ({
          ...r.timeOff,
          employee: {
            ...r.employee,
            user: profileMap.get(r.employee.userId),
          },
        }));
      }),

    /**
     * Get time-off request by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const result = await db.query.employeeTimeOff.findFirst({
          where: eq(employeeTimeOff.id, input.id),
          with: {
            employee: {
              with: { user: true },
            },
            approver: true,
          },
        });

        return result;
      }),

    /**
     * Create time-off request
     */
    create: orgProtectedProcedure
      .input(createTimeOffInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [request] = await db.insert(employeeTimeOff)
          .values({
            employeeId: input.employeeId,
            type: input.type,
            startDate: input.startDate,
            endDate: input.endDate,
            hours: input.hours.toString(),
            reason: input.reason,
            status: 'pending',
            createdBy: userId,
          })
          .returning();

        return request;
      }),

    /**
     * Approve time-off request
     */
    approve: orgProtectedProcedure
      .input(approveTimeOffInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [updated] = await db.update(employeeTimeOff)
          .set({
            status: 'approved',
            approvedBy: userId,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(employeeTimeOff.id, input.id))
          .returning();

        return updated;
      }),

    /**
     * Deny time-off request
     */
    deny: orgProtectedProcedure
      .input(denyTimeOffInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [updated] = await db.update(employeeTimeOff)
          .set({
            status: 'denied',
            approvedBy: userId,
            approvedAt: new Date(),
            denialReason: input.denialReason,
            updatedAt: new Date(),
          })
          .where(eq(employeeTimeOff.id, input.id))
          .returning();

        return updated;
      }),

    /**
     * Get PTO balances
     */
    getBalances: orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
        year: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;
        const year = input?.year ?? new Date().getFullYear();

        const conditions: SQL<unknown>[] = [
          eq(employees.orgId, orgId!),
          eq(ptoBalances.year, year),
        ];

        if (input?.employeeId) {
          conditions.push(eq(ptoBalances.employeeId, input.employeeId));
        }

        const results = await db.select({
          balance: ptoBalances,
          employee: employees,
        })
          .from(ptoBalances)
          .innerJoin(employees, eq(ptoBalances.employeeId, employees.userId))
          .where(and(...conditions));

        return results.map(r => ({
          ...r.balance,
          employee: r.employee,
        }));
      }),
  }),

  // =====================================================
  // PAYROLL
  // =====================================================

  payroll: router({
    /**
     * List payroll runs
     */
    'runs.list': orgProtectedProcedure
      .input(z.object({
        status: z.string().optional(),
        limit: z.number().default(10),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [eq(payrollRuns.orgId, orgId!)];

        if (input?.status) {
          conditions.push(eq(payrollRuns.status, input.status));
        }

        const results = await db.select()
          .from(payrollRuns)
          .where(and(...conditions))
          .orderBy(desc(payrollRuns.createdAt))
          .limit(input?.limit ?? 10);

        return results;
      }),

    /**
     * Get payroll run by ID
     */
    'runs.getById': orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const run = await db.select()
          .from(payrollRuns)
          .where(and(
            eq(payrollRuns.id, input.id),
            eq(payrollRuns.orgId, orgId!),
          ))
          .limit(1);

        if (!run[0]) {
          throw new Error('Payroll run not found');
        }

        // Get items
        const items = await db.select()
          .from(payrollItems)
          .where(eq(payrollItems.payrollRunId, input.id));

        return {
          ...run[0],
          items,
        };
      }),

    /**
     * Create new payroll run
     */
    'runs.create': orgProtectedProcedure
      .input(z.object({
        periodStartDate: z.string(),
        periodEndDate: z.string(),
        payDate: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [run] = await db.insert(payrollRuns)
          .values({
            orgId: orgId!,
            periodStartDate: input.periodStartDate,
            periodEndDate: input.periodEndDate,
            payDate: input.payDate,
            status: 'draft',
            employeeCount: 0,
            createdBy: userId,
          })
          .returning();

        return run;
      }),

    /**
     * Approve payroll run
     */
    'runs.approve': orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [updated] = await db.update(payrollRuns)
          .set({
            status: 'approved',
            approvedBy: userId,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(payrollRuns.id, input.id),
            eq(payrollRuns.orgId, orgId!),
          ))
          .returning();

        return updated;
      }),

    /**
     * Get payroll items for a run
     */
    'items.list': orgProtectedProcedure
      .input(z.object({ payrollRunId: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const items = await db.select()
          .from(payrollItems)
          .where(eq(payrollItems.payrollRunId, input.payrollRunId));

        return items;
      }),
  }),

  // =====================================================
  // BENEFITS
  // =====================================================

  benefits: router({
    /**
     * List benefit plans
     */
    'plans.list': orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const plans = await db.query.benefitPlans.findMany({
          where: and(
            eq(benefitPlans.orgId, orgId!),
            eq(benefitPlans.status, 'active'),
          ),
          with: {
            options: true,
          },
        });

        return plans;
      }),

    /**
     * List employee enrollments
     */
    'enrollments.list': orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [eq(employees.orgId, orgId!)];

        if (input?.employeeId) {
          conditions.push(eq(employeeBenefits.employeeId, input.employeeId));
        }

        const results = await db.select({
          enrollment: employeeBenefits,
          employee: employees,
        })
          .from(employeeBenefits)
          .innerJoin(employees, eq(employeeBenefits.employeeId, employees.id))
          .where(and(...conditions));

        return results.map(r => ({
          ...r.enrollment,
          employee: r.employee,
        }));
      }),

    /**
     * Enroll employee in benefit
     */
    'enrollments.create': orgProtectedProcedure
      .input(enrollBenefitInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [enrollment] = await db.insert(employeeBenefits)
          .values({
            employeeId: input.employeeId,
            planOptionId: input.planOptionId,
            status: 'active',
            enrollmentDate: new Date().toISOString().split('T')[0],
            coverageStart: input.coverageStart,
            createdBy: userId,
          })
          .returning();

        return enrollment;
      }),

    /**
     * Add dependent
     */
    'dependents.add': orgProtectedProcedure
      .input(addDependentInput)
      .mutation(async ({ ctx, input }) => {
        const [dependent] = await db.insert(benefitDependents)
          .values({
            employeeBenefitId: input.employeeBenefitId,
            name: input.name,
            relationship: input.relationship,
            dateOfBirth: input.dateOfBirth,
          })
          .returning();

        // Update dependents count
        await db.update(employeeBenefits)
          .set({
            dependentsCount: sql`${employeeBenefits.dependentsCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(employeeBenefits.id, input.employeeBenefitId));

        return dependent;
      }),
  }),

  // =====================================================
  // PERFORMANCE
  // =====================================================

  performance: router({
    /**
     * List performance reviews
     */
    'reviews.list': orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [eq(performanceReviews.orgId, orgId!)];

        if (input?.employeeId) {
          conditions.push(eq(performanceReviews.employeeId, input.employeeId));
        }
        if (input?.status) {
          conditions.push(eq(performanceReviews.status, input.status));
        }

        const results = await db.select()
          .from(performanceReviews)
          .where(and(...conditions))
          .orderBy(desc(performanceReviews.createdAt));

        return results;
      }),

    /**
     * Get performance review by ID
     */
    'reviews.getById': orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const review = await db.select()
          .from(performanceReviews)
          .where(and(
            eq(performanceReviews.id, input.id),
            eq(performanceReviews.orgId, orgId!),
          ))
          .limit(1);

        return review[0];
      }),

    /**
     * List goals
     */
    'goals.list': orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
        status: z.enum(['not_started', 'in_progress', 'completed', 'cancelled']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [];

        if (input?.employeeId) {
          conditions.push(eq(performanceGoals.employeeId, input.employeeId));
        }
        if (input?.status) {
          conditions.push(eq(performanceGoals.status, input.status));
        }

        // Join to filter by org
        const results = await db.select({
          goal: performanceGoals,
          employee: employees,
        })
          .from(performanceGoals)
          .innerJoin(employees, eq(performanceGoals.employeeId, employees.id))
          .where(and(
            eq(employees.orgId, orgId!),
            ...conditions,
          ))
          .orderBy(desc(performanceGoals.createdAt));

        return results.map(r => ({
          ...r.goal,
          employee: r.employee,
        }));
      }),

    /**
     * Create goal
     */
    'goals.create': orgProtectedProcedure
      .input(createGoalInput)
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [goal] = await db.insert(performanceGoals)
          .values({
            employeeId: input.employeeId,
            goal: input.goal,
            category: input.category,
            weightPercent: input.weightPercent,
            startDate: input.startDate,
            targetDate: input.targetDate,
            status: 'not_started',
            createdBy: userId,
          })
          .returning();

        return goal;
      }),

    /**
     * Create feedback
     */
    'feedback.create': orgProtectedProcedure
      .input(z.object({
        reviewId: z.string().uuid(),
        feedbackType: z.enum(['strength', 'improvement', 'comment']),
        content: z.string(),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { userId } = ctx;

        const [feedback] = await db.insert(performanceFeedback)
          .values({
            reviewId: input.reviewId,
            feedbackType: input.feedbackType,
            content: input.content,
            category: input.category,
            createdBy: userId,
          })
          .returning();

        return feedback;
      }),
  }),

  // =====================================================
  // COMPLIANCE
  // =====================================================

  compliance: router({
    /**
     * List compliance requirements
     */
    'requirements.list': orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const requirements = await db.select()
          .from(complianceRequirements)
          .where(and(
            eq(complianceRequirements.orgId, orgId!),
            eq(complianceRequirements.isActive, true),
          ));

        return requirements;
      }),

    /**
     * List employee compliance status
     */
    'employee.list': orgProtectedProcedure
      .input(z.object({
        employeeId: z.string().uuid().optional(),
        status: z.enum(['pending', 'completed', 'overdue', 'exempt']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [eq(employees.orgId, orgId!)];

        if (input?.employeeId) {
          conditions.push(eq(employeeCompliance.employeeId, input.employeeId));
        }
        if (input?.status) {
          conditions.push(eq(employeeCompliance.status, input.status));
        }

        const results = await db.select({
          compliance: employeeCompliance,
          employee: employees,
          requirement: complianceRequirements,
        })
          .from(employeeCompliance)
          .innerJoin(employees, eq(employeeCompliance.employeeId, employees.id))
          .innerJoin(complianceRequirements, eq(employeeCompliance.requirementId, complianceRequirements.id))
          .where(and(...conditions));

        return results.map(r => ({
          ...r.compliance,
          employee: r.employee,
          requirement: r.requirement,
        }));
      }),

    /**
     * Complete compliance requirement
     */
    'employee.complete': orgProtectedProcedure
      .input(completeComplianceInput)
      .mutation(async ({ ctx, input }) => {
        // Check if record exists
        const existing = await db.select()
          .from(employeeCompliance)
          .where(and(
            eq(employeeCompliance.employeeId, input.employeeId),
            eq(employeeCompliance.requirementId, input.requirementId),
          ))
          .limit(1);

        if (existing[0]) {
          // Update
          const [updated] = await db.update(employeeCompliance)
            .set({
              status: 'completed',
              completedAt: new Date(),
              documentUrl: input.documentUrl,
              notes: input.notes,
              updatedAt: new Date(),
            })
            .where(eq(employeeCompliance.id, existing[0].id))
            .returning();

          return updated;
        } else {
          // Create
          const [created] = await db.insert(employeeCompliance)
            .values({
              employeeId: input.employeeId,
              requirementId: input.requirementId,
              status: 'completed',
              completedAt: new Date(),
              documentUrl: input.documentUrl,
              notes: input.notes,
            })
            .returning();

          return created;
        }
      }),

    /**
     * List I-9 records
     */
    'i9.list': orgProtectedProcedure
      .input(z.object({
        status: z.enum(['pending', 'section1_complete', 'completed', 'expired']).optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const conditions: SQL<unknown>[] = [eq(employees.orgId, orgId!)];

        if (input?.status) {
          conditions.push(eq(i9Records.status, input.status));
        }

        const results = await db.select({
          i9: i9Records,
          employee: employees,
        })
          .from(i9Records)
          .innerJoin(employees, eq(i9Records.employeeId, employees.id))
          .where(and(...conditions));

        // Get user profiles
        const userIds = results.map(r => r.employee.userId);
        const profiles = userIds.length > 0
          ? await db.select()
              .from(userProfiles)
              .where(inArray(userProfiles.id, userIds))
          : [];

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        return results.map(r => ({
          ...r.i9,
          employee: {
            ...r.employee,
            user: profileMap.get(r.employee.userId),
          },
        }));
      }),
  }),

  // =====================================================
  // PODS
  // =====================================================

  pods: router({
    /**
     * List pods
     */
    list: orgProtectedProcedure
      .query(async ({ ctx }) => {
        const { orgId } = ctx;

        const podsList = await db.select()
          .from(pods)
          .where(and(
            eq(pods.orgId, orgId!),
            eq(pods.isActive, true),
          ));

        // Get member profiles
        const memberIds = podsList.flatMap(p => [p.seniorMemberId, p.juniorMemberId].filter(Boolean)) as string[];
        const profiles = memberIds.length > 0
          ? await db.select()
              .from(userProfiles)
              .where(inArray(userProfiles.id, memberIds))
          : [];

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        return podsList.map(p => ({
          ...p,
          seniorMember: p.seniorMemberId ? profileMap.get(p.seniorMemberId) : null,
          juniorMember: p.juniorMemberId ? profileMap.get(p.juniorMemberId) : null,
        }));
      }),

    /**
     * Get pod by ID
     */
    getById: orgProtectedProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const { orgId } = ctx;

        const pod = await db.select()
          .from(pods)
          .where(and(
            eq(pods.id, input.id),
            eq(pods.orgId, orgId!),
          ))
          .limit(1);

        if (!pod[0]) {
          throw new Error('Pod not found');
        }

        // Get member profiles
        const memberIds = [pod[0].seniorMemberId, pod[0].juniorMemberId].filter(Boolean) as string[];
        const profiles = memberIds.length > 0
          ? await db.select()
              .from(userProfiles)
              .where(inArray(userProfiles.id, memberIds))
          : [];

        const profileMap = new Map(profiles.map(p => [p.id, p]));

        return {
          ...pod[0],
          seniorMember: pod[0].seniorMemberId ? profileMap.get(pod[0].seniorMemberId) : null,
          juniorMember: pod[0].juniorMemberId ? profileMap.get(pod[0].juniorMemberId) : null,
        };
      }),

    /**
     * Create pod
     */
    create: orgProtectedProcedure
      .input(z.object({
        name: z.string(),
        podType: z.string(),
        seniorMemberId: z.string().uuid().optional(),
        juniorMemberId: z.string().uuid().optional(),
        placementsPerSprintTarget: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { orgId, userId } = ctx;

        const [pod] = await db.insert(pods)
          .values({
            orgId: orgId!,
            name: input.name,
            podType: input.podType,
            seniorMemberId: input.seniorMemberId,
            juniorMemberId: input.juniorMemberId,
            placementsPerSprintTarget: input.placementsPerSprintTarget ?? 2,
            formedDate: new Date().toISOString().split('T')[0],
            createdBy: userId,
          })
          .returning();

        return pod;
      }),

    /**
     * Get pod performance metrics
     */
    getPerformance: orgProtectedProcedure
      .input(z.object({
        podId: z.string().uuid(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const pod = await db.select()
          .from(pods)
          .where(eq(pods.id, input.podId))
          .limit(1);

        if (!pod[0]) {
          throw new Error('Pod not found');
        }

        // Return basic metrics from pod record
        return {
          podId: pod[0].id,
          name: pod[0].name,
          totalPlacements: pod[0].totalPlacements ?? 0,
          currentSprintPlacements: pod[0].currentSprintPlacements ?? 0,
          averagePlacementsPerSprint: pod[0].averagePlacementsPerSprint ?? 0,
          placementsPerSprintTarget: pod[0].placementsPerSprintTarget ?? 2,
          currentSprintStartDate: pod[0].currentSprintStartDate,
        };
      }),
  }),
});

export type HrRouter = typeof hrRouter;
