/**
 * HR Payroll Server Actions
 *
 * Provides CRUD operations for payroll runs and items with approval workflows.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/hr-payroll
 */

'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';
import type { ActionResult, PaginatedResult } from './types';
import {
  getCurrentUserContext,
  checkPermission,
  calculatePagination,
  calculateRange,
  logAuditEvent,
} from './helpers';

// ============================================================================
// Types
// ============================================================================

// Database row types (as returned from Supabase)
interface DatabaseApprover {
  id: string;
  full_name: string;
  email: string;
}

interface DatabaseCreator {
  id: string;
  full_name: string;
  email: string;
}

interface DatabasePayrollRunRow {
  id: string;
  period_start_date: string;
  period_end_date: string;
  pay_date: string;
  status: string;
  employee_count: number;
  total_gross_pay: string | number;
  total_taxes: string | number;
  total_net_pay: string | number;
  approved_by: string | null;
  approved_at: string | null;
  processed_at: string | null;
  processing_error: string | null;
  org_id: string;
  created_at: string;
  created_by: string | null;
  approver?: DatabaseApprover;
  creator?: DatabaseCreator;
}

interface DatabaseEmployeeForPayroll {
  id: string;
  full_name: string;
  email: string;
  department: string | null;
  position: string | null;
}

interface DatabasePayrollItemRow {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  base_salary: string | number | null;
  commission: string | number | null;
  bonus: string | number | null;
  overtime_hours: string | number | null;
  overtime_pay: string | number | null;
  other_earnings: string | number | null;
  gross_pay: string | number;
  taxes_withheld: string | number | null;
  benefits_deductions: string | number | null;
  other_deductions: string | number | null;
  net_pay: string | number;
  employee?: DatabaseEmployeeForPayroll;
}

interface DatabasePayrollItemWithRun extends DatabasePayrollItemRow {
  payroll_runs: {
    id: string;
    org_id: string;
    status: string;
  };
}

interface DatabaseEmployeeWithSalary {
  id: string;
  salary: string | number | null;
}

export interface PayrollRun {
  id: string;
  periodStartDate: string;
  periodEndDate: string;
  payDate: string;
  status: string;
  employeeCount: number;
  totalGrossPay: number;
  totalTaxes: number;
  totalNetPay: number;
  approvedBy: string | null;
  approvedAt: string | null;
  processedAt: string | null;
  processingError: string | null;
  orgId: string;
  createdAt: string;
  createdBy: string | null;
}

export interface PayrollRunWithDetails extends PayrollRun {
  approver?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  creator?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface PayrollItem {
  id: string;
  payrollRunId: string;
  employeeId: string;
  baseSalary: number | null;
  commission: number | null;
  bonus: number | null;
  overtimeHours: number | null;
  overtimePay: number | null;
  otherEarnings: number | null;
  grossPay: number;
  taxesWithheld: number | null;
  benefitsDeductions: number | null;
  otherDeductions: number | null;
  netPay: number;
  employee?: {
    id: string;
    fullName: string;
    email: string;
    department: string | null;
    position: string | null;
  };
}

export interface PayrollFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  year?: number;
}

export interface CreatePayrollRunInput {
  periodStartDate: string;
  periodEndDate: string;
  payDate: string;
}

export interface UpdatePayrollItemInput {
  baseSalary?: number;
  commission?: number;
  bonus?: number;
  overtimeHours?: number;
  overtimePay?: number;
  otherEarnings?: number;
  taxesWithheld?: number;
  benefitsDeductions?: number;
  otherDeductions?: number;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const payrollFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  status: z.string().optional(),
  year: z.number().min(2000).max(2100).optional(),
});

const createPayrollRunSchema = z.object({
  periodStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  periodEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
});

const updatePayrollItemSchema = z.object({
  baseSalary: z.number().min(0).optional(),
  commission: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).optional(),
  overtimePay: z.number().min(0).optional(),
  otherEarnings: z.number().min(0).optional(),
  taxesWithheld: z.number().min(0).optional(),
  benefitsDeductions: z.number().min(0).optional(),
  otherDeductions: z.number().min(0).optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get paginated list of payroll runs.
 */
export async function listPayrollRunsAction(
  filters: PayrollFilters = {}
): Promise<ActionResult<PaginatedResult<PayrollRunWithDetails>>> {
  const validation = payrollFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, status, year } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:read required' };
  }

  // Build query
  let query = supabase
    .from('payroll_runs')
    .select(
      `
      id,
      period_start_date,
      period_end_date,
      pay_date,
      status,
      employee_count,
      total_gross_pay,
      total_taxes,
      total_net_pay,
      approved_by,
      approved_at,
      processed_at,
      processing_error,
      org_id,
      created_at,
      created_by,
      approver:user_profiles!payroll_runs_approved_by_fkey (
        id,
        full_name,
        email
      ),
      creator:user_profiles!payroll_runs_created_by_fkey (
        id,
        full_name,
        email
      )
    `,
      { count: 'exact' }
    )
    .eq('org_id', profile.orgId);

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }

  if (year) {
    query = query.gte('period_start_date', `${year}-01-01`).lte('period_end_date', `${year}-12-31`);
  }

  // Apply pagination
  const { from, to } = calculateRange(page, pageSize);
  query = query.order('pay_date', { ascending: false }).range(from, to);

  const { data: runs, error, count } = await query;

  if (error) {
    console.error('List payroll runs error:', error);
    return { success: false, error: 'Failed to fetch payroll runs' };
  }

  // Transform data
  const transformedRuns: PayrollRunWithDetails[] = (runs || []).map((run) => {
    const typedRun = run as unknown as DatabasePayrollRunRow;
    return {
      id: typedRun.id,
      periodStartDate: typedRun.period_start_date,
      periodEndDate: typedRun.period_end_date,
      payDate: typedRun.pay_date,
      status: typedRun.status,
      employeeCount: typedRun.employee_count,
      totalGrossPay: typedRun.total_gross_pay ? parseFloat(String(typedRun.total_gross_pay)) : 0,
      totalTaxes: typedRun.total_taxes ? parseFloat(String(typedRun.total_taxes)) : 0,
      totalNetPay: typedRun.total_net_pay ? parseFloat(String(typedRun.total_net_pay)) : 0,
      approvedBy: typedRun.approved_by,
      approvedAt: typedRun.approved_at,
      processedAt: typedRun.processed_at,
      processingError: typedRun.processing_error,
      orgId: typedRun.org_id,
      createdAt: typedRun.created_at,
      createdBy: typedRun.created_by,
      approver: typedRun.approver
        ? {
            id: typedRun.approver.id,
            fullName: typedRun.approver.full_name,
            email: typedRun.approver.email,
          }
        : null,
      creator: typedRun.creator
        ? {
            id: typedRun.creator.id,
            fullName: typedRun.creator.full_name,
            email: typedRun.creator.email,
          }
        : null,
    };
  });

  const total = count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: transformedRuns,
      ...pagination,
    },
  };
}

/**
 * Get a single payroll run with items.
 */
export async function getPayrollRunAction(
  runId: string
): Promise<ActionResult<PayrollRunWithDetails & { items: PayrollItem[] }>> {
  if (!runId || !z.string().uuid().safeParse(runId).success) {
    return { success: false, error: 'Invalid payroll run ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:read required' };
  }

  // Fetch payroll run
  const { data: run, error } = await supabase
    .from('payroll_runs')
    .select(
      `
      id,
      period_start_date,
      period_end_date,
      pay_date,
      status,
      employee_count,
      total_gross_pay,
      total_taxes,
      total_net_pay,
      approved_by,
      approved_at,
      processed_at,
      processing_error,
      org_id,
      created_at,
      created_by,
      approver:user_profiles!payroll_runs_approved_by_fkey (
        id,
        full_name,
        email
      ),
      creator:user_profiles!payroll_runs_created_by_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .eq('id', runId)
    .eq('org_id', profile.orgId)
    .single();

  if (error || !run) {
    return { success: false, error: 'Payroll run not found' };
  }

  // Fetch payroll items
  const { data: items } = await supabase
    .from('payroll_items')
    .select(
      `
      id,
      payroll_run_id,
      employee_id,
      base_salary,
      commission,
      bonus,
      overtime_hours,
      overtime_pay,
      other_earnings,
      gross_pay,
      taxes_withheld,
      benefits_deductions,
      other_deductions,
      net_pay,
      employee:user_profiles!payroll_items_employee_id_fkey (
        id,
        full_name,
        email,
        department,
        position
      )
    `
    )
    .eq('payroll_run_id', runId)
    .order('employee_id');

  const transformedItems: PayrollItem[] = (items || []).map((item) => {
    const typedItem = item as unknown as DatabasePayrollItemRow;
    return {
      id: typedItem.id,
      payrollRunId: typedItem.payroll_run_id,
      employeeId: typedItem.employee_id,
      baseSalary: typedItem.base_salary ? parseFloat(String(typedItem.base_salary)) : null,
      commission: typedItem.commission ? parseFloat(String(typedItem.commission)) : null,
      bonus: typedItem.bonus ? parseFloat(String(typedItem.bonus)) : null,
      overtimeHours: typedItem.overtime_hours ? parseFloat(String(typedItem.overtime_hours)) : null,
      overtimePay: typedItem.overtime_pay ? parseFloat(String(typedItem.overtime_pay)) : null,
      otherEarnings: typedItem.other_earnings ? parseFloat(String(typedItem.other_earnings)) : null,
      grossPay: parseFloat(String(typedItem.gross_pay)),
      taxesWithheld: typedItem.taxes_withheld ? parseFloat(String(typedItem.taxes_withheld)) : null,
      benefitsDeductions: typedItem.benefits_deductions ? parseFloat(String(typedItem.benefits_deductions)) : null,
      otherDeductions: typedItem.other_deductions ? parseFloat(String(typedItem.other_deductions)) : null,
      netPay: parseFloat(String(typedItem.net_pay)),
      employee: typedItem.employee
        ? {
            id: typedItem.employee.id,
            fullName: typedItem.employee.full_name,
            email: typedItem.employee.email,
            department: typedItem.employee.department,
            position: typedItem.employee.position,
          }
        : undefined,
    };
  });

  const typedRun = run as unknown as DatabasePayrollRunRow;

  return {
    success: true,
    data: {
      id: typedRun.id,
      periodStartDate: typedRun.period_start_date,
      periodEndDate: typedRun.period_end_date,
      payDate: typedRun.pay_date,
      status: typedRun.status,
      employeeCount: typedRun.employee_count,
      totalGrossPay: typedRun.total_gross_pay ? parseFloat(String(typedRun.total_gross_pay)) : 0,
      totalTaxes: typedRun.total_taxes ? parseFloat(String(typedRun.total_taxes)) : 0,
      totalNetPay: typedRun.total_net_pay ? parseFloat(String(typedRun.total_net_pay)) : 0,
      approvedBy: typedRun.approved_by,
      approvedAt: typedRun.approved_at,
      processedAt: typedRun.processed_at,
      processingError: typedRun.processing_error,
      orgId: typedRun.org_id,
      createdAt: typedRun.created_at,
      createdBy: typedRun.created_by,
      approver: typedRun.approver
        ? {
            id: typedRun.approver.id,
            fullName: typedRun.approver.full_name,
            email: typedRun.approver.email,
          }
        : null,
      creator: typedRun.creator
        ? {
            id: typedRun.creator.id,
            fullName: typedRun.creator.full_name,
            email: typedRun.creator.email,
          }
        : null,
      items: transformedItems,
    },
  };
}

/**
 * Create a new payroll run.
 */
export async function createPayrollRunAction(
  input: CreatePayrollRunInput
): Promise<ActionResult<PayrollRun>> {
  const validation = createPayrollRunSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { periodStartDate, periodEndDate, payDate } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:create required' };
  }

  // Create payroll run
  const { data: newRun, error } = await supabase
    .from('payroll_runs')
    .insert({
      period_start_date: periodStartDate,
      period_end_date: periodEndDate,
      pay_date: payDate,
      status: 'draft',
      org_id: profile.orgId,
      created_by: profile.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create payroll run error:', error);
    return { success: false, error: 'Failed to create payroll run' };
  }

  // Get all active employees and create payroll items
  const { data: employees } = await supabase
    .from('user_profiles')
    .select('id, salary')
    .eq('org_id', profile.orgId)
    .eq('status', 'active');

  if (employees && employees.length > 0) {
    const payrollItems = employees.map((emp) => {
      const typedEmp = emp as unknown as DatabaseEmployeeWithSalary;
      const baseSalary = typedEmp.salary ? parseFloat(String(typedEmp.salary)) / 24 : 0; // Bi-weekly
      const estimatedTax = baseSalary * 0.25; // 25% estimated tax
      const estimatedBenefits = baseSalary * 0.05; // 5% benefits

      return {
        payroll_run_id: newRun.id,
        employee_id: typedEmp.id,
        base_salary: baseSalary,
        gross_pay: baseSalary,
        taxes_withheld: estimatedTax,
        benefits_deductions: estimatedBenefits,
        net_pay: baseSalary - estimatedTax - estimatedBenefits,
      };
    });

    await supabase.from('payroll_items').insert(payrollItems);

    // Update totals on payroll run
    const totalGross = payrollItems.reduce((sum, item) => sum + item.gross_pay, 0);
    const totalTaxes = payrollItems.reduce((sum, item) => sum + item.taxes_withheld, 0);
    const totalNet = payrollItems.reduce((sum, item) => sum + item.net_pay, 0);

    await supabase
      .from('payroll_runs')
      .update({
        employee_count: employees.length,
        total_gross_pay: totalGross,
        total_taxes: totalTaxes,
        total_net_pay: totalNet,
      })
      .eq('id', newRun.id);
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_runs',
    action: 'create',
    recordId: newRun.id,
    userId: profile.id,
    userEmail: profile.email,
    newValues: { periodStartDate, periodEndDate, payDate },
    severity: 'info',
    orgId: profile.orgId,
  });

  return {
    success: true,
    data: {
      id: newRun.id,
      periodStartDate: newRun.period_start_date,
      periodEndDate: newRun.period_end_date,
      payDate: newRun.pay_date,
      status: newRun.status,
      employeeCount: employees?.length || 0,
      totalGrossPay: 0,
      totalTaxes: 0,
      totalNetPay: 0,
      approvedBy: null,
      approvedAt: null,
      processedAt: null,
      processingError: null,
      orgId: newRun.org_id,
      createdAt: newRun.created_at,
      createdBy: newRun.created_by,
    },
  };
}

/**
 * Update a payroll item.
 */
export async function updatePayrollItemAction(
  itemId: string,
  input: UpdatePayrollItemInput
): Promise<ActionResult<PayrollItem>> {
  if (!itemId || !z.string().uuid().safeParse(itemId).success) {
    return { success: false, error: 'Invalid payroll item ID' };
  }

  const validation = updatePayrollItemSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:update required' };
  }

  // Verify item exists and run is still editable
  const { data: item } = await supabase
    .from('payroll_items')
    .select(
      `
      *,
      payroll_runs!inner (
        id,
        org_id,
        status
      )
    `
    )
    .eq('id', itemId)
    .single();

  const typedItem = item as unknown as DatabasePayrollItemWithRun;

  if (!typedItem || typedItem.payroll_runs.org_id !== profile.orgId) {
    return { success: false, error: 'Payroll item not found' };
  }

  if (typedItem.payroll_runs.status !== 'draft') {
    return { success: false, error: 'Cannot edit items in a non-draft payroll run' };
  }

  // Build update object
  const updates: Record<string, number> = {};
  if (input.baseSalary !== undefined) updates.base_salary = input.baseSalary;
  if (input.commission !== undefined) updates.commission = input.commission;
  if (input.bonus !== undefined) updates.bonus = input.bonus;
  if (input.overtimeHours !== undefined) updates.overtime_hours = input.overtimeHours;
  if (input.overtimePay !== undefined) updates.overtime_pay = input.overtimePay;
  if (input.otherEarnings !== undefined) updates.other_earnings = input.otherEarnings;
  if (input.taxesWithheld !== undefined) updates.taxes_withheld = input.taxesWithheld;
  if (input.benefitsDeductions !== undefined)
    updates.benefits_deductions = input.benefitsDeductions;
  if (input.otherDeductions !== undefined)
    updates.other_deductions = input.otherDeductions;

  // Recalculate gross and net pay
  const baseSalary = input.baseSalary ?? (typedItem.base_salary ? parseFloat(String(typedItem.base_salary)) : 0);
  const commission = input.commission ?? (typedItem.commission ? parseFloat(String(typedItem.commission)) : 0);
  const bonus = input.bonus ?? (typedItem.bonus ? parseFloat(String(typedItem.bonus)) : 0);
  const overtimePay = input.overtimePay ?? (typedItem.overtime_pay ? parseFloat(String(typedItem.overtime_pay)) : 0);
  const otherEarnings = input.otherEarnings ?? (typedItem.other_earnings ? parseFloat(String(typedItem.other_earnings)) : 0);
  const taxesWithheld = input.taxesWithheld ?? (typedItem.taxes_withheld ? parseFloat(String(typedItem.taxes_withheld)) : 0);
  const benefitsDeductions = input.benefitsDeductions ?? (typedItem.benefits_deductions ? parseFloat(String(typedItem.benefits_deductions)) : 0);
  const otherDeductions = input.otherDeductions ?? (typedItem.other_deductions ? parseFloat(String(typedItem.other_deductions)) : 0);

  const grossPay = baseSalary + commission + bonus + overtimePay + otherEarnings;
  const netPay = grossPay - taxesWithheld - benefitsDeductions - otherDeductions;

  updates.gross_pay = grossPay;
  updates.net_pay = netPay;

  const { error: updateError } = await supabase
    .from('payroll_items')
    .update(updates)
    .eq('id', itemId);

  if (updateError) {
    console.error('Update payroll item error:', updateError);
    return { success: false, error: 'Failed to update payroll item' };
  }

  // Recalculate payroll run totals
  await recalculatePayrollRunTotals(supabase, typedItem.payroll_run_id);

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_items',
    action: 'update',
    recordId: itemId,
    userId: profile.id,
    userEmail: profile.email,
    oldValues: typedItem as unknown as Record<string, unknown>,
    newValues: updates,
    metadata: { changedFields: Object.keys(updates) },
    severity: 'info',
    orgId: profile.orgId,
  });

  // Fetch updated item
  const { data: updatedItem, error: fetchError } = await supabase
    .from('payroll_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (fetchError || !updatedItem) {
    return { success: false, error: 'Failed to fetch updated payroll item' };
  }

  return {
    success: true,
    data: {
      id: updatedItem.id,
      payrollRunId: updatedItem.payroll_run_id,
      employeeId: updatedItem.employee_id,
      baseSalary: updatedItem.base_salary ? parseFloat(String(updatedItem.base_salary)) : null,
      commission: updatedItem.commission ? parseFloat(String(updatedItem.commission)) : null,
      bonus: updatedItem.bonus ? parseFloat(String(updatedItem.bonus)) : null,
      overtimeHours: updatedItem.overtime_hours ? parseFloat(String(updatedItem.overtime_hours)) : null,
      overtimePay: updatedItem.overtime_pay ? parseFloat(String(updatedItem.overtime_pay)) : null,
      otherEarnings: updatedItem.other_earnings ? parseFloat(String(updatedItem.other_earnings)) : null,
      grossPay: parseFloat(String(updatedItem.gross_pay)),
      taxesWithheld: updatedItem.taxes_withheld ? parseFloat(String(updatedItem.taxes_withheld)) : null,
      benefitsDeductions: updatedItem.benefits_deductions
        ? parseFloat(String(updatedItem.benefits_deductions))
        : null,
      otherDeductions: updatedItem.other_deductions
        ? parseFloat(String(updatedItem.other_deductions))
        : null,
      netPay: parseFloat(String(updatedItem.net_pay)),
    },
  };
}

/**
 * Submit payroll run for approval.
 */
export async function submitPayrollRunAction(runId: string): Promise<ActionResult<void>> {
  if (!runId || !z.string().uuid().safeParse(runId).success) {
    return { success: false, error: 'Invalid payroll run ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:update required' };
  }

  // Verify run exists and is in draft status
  const { data: run } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .eq('org_id', profile.orgId)
    .single();

  if (!run) {
    return { success: false, error: 'Payroll run not found' };
  }

  if (run.status !== 'draft') {
    return { success: false, error: 'Only draft payroll runs can be submitted' };
  }

  const { error: updateError } = await supabase
    .from('payroll_runs')
    .update({ status: 'ready_for_approval' })
    .eq('id', runId);

  if (updateError) {
    return { success: false, error: 'Failed to submit payroll run' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_runs',
    action: 'submit',
    recordId: runId,
    userId: profile.id,
    userEmail: profile.email,
    metadata: { previousStatus: 'draft', newStatus: 'ready_for_approval' },
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Approve a payroll run.
 */
export async function approvePayrollRunAction(runId: string): Promise<ActionResult<void>> {
  if (!runId || !z.string().uuid().safeParse(runId).success) {
    return { success: false, error: 'Invalid payroll run ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'approve');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:approve required' };
  }

  // Verify run exists and is ready for approval
  const { data: run } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .eq('org_id', profile.orgId)
    .single();

  if (!run) {
    return { success: false, error: 'Payroll run not found' };
  }

  if (run.status !== 'ready_for_approval') {
    return { success: false, error: 'Payroll run is not ready for approval' };
  }

  const { error: updateError } = await supabase
    .from('payroll_runs')
    .update({
      status: 'approved',
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', runId);

  if (updateError) {
    return { success: false, error: 'Failed to approve payroll run' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_runs',
    action: 'approve',
    recordId: runId,
    userId: profile.id,
    userEmail: profile.email,
    metadata: {
      totalGrossPay: run.total_gross_pay,
      totalNetPay: run.total_net_pay,
      employeeCount: run.employee_count,
    },
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Reject a payroll run back to draft.
 */
export async function rejectPayrollRunAction(
  runId: string,
  reason: string
): Promise<ActionResult<void>> {
  if (!runId || !z.string().uuid().safeParse(runId).success) {
    return { success: false, error: 'Invalid payroll run ID' };
  }

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Rejection reason is required' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'approve');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:approve required' };
  }

  // Verify run exists and is ready for approval
  const { data: run } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .eq('org_id', profile.orgId)
    .single();

  if (!run) {
    return { success: false, error: 'Payroll run not found' };
  }

  if (run.status !== 'ready_for_approval') {
    return { success: false, error: 'Payroll run is not in approval status' };
  }

  const { error: updateError } = await supabase
    .from('payroll_runs')
    .update({
      status: 'draft',
      processing_error: `Rejected: ${reason}`,
    })
    .eq('id', runId);

  if (updateError) {
    return { success: false, error: 'Failed to reject payroll run' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_runs',
    action: 'reject',
    recordId: runId,
    userId: profile.id,
    userEmail: profile.email,
    metadata: { reason },
    severity: 'warning',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Process an approved payroll run.
 */
export async function processPayrollRunAction(runId: string): Promise<ActionResult<void>> {
  if (!runId || !z.string().uuid().safeParse(runId).success) {
    return { success: false, error: 'Invalid payroll run ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'process');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:process required' };
  }

  // Verify run exists and is approved
  const { data: run } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .eq('org_id', profile.orgId)
    .single();

  if (!run) {
    return { success: false, error: 'Payroll run not found' };
  }

  if (run.status !== 'approved') {
    return { success: false, error: 'Only approved payroll runs can be processed' };
  }

  // Update to processing status
  await supabase.from('payroll_runs').update({ status: 'processing' }).eq('id', runId);

  // Simulate processing (in production, this would integrate with Gusto or similar)
  // For now, just mark as completed
  const { error: updateError } = await supabase
    .from('payroll_runs')
    .update({
      status: 'completed',
      processed_at: new Date().toISOString(),
    })
    .eq('id', runId);

  if (updateError) {
    await supabase
      .from('payroll_runs')
      .update({
        status: 'failed',
        processing_error: 'Processing failed',
      })
      .eq('id', runId);

    return { success: false, error: 'Failed to process payroll run' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_runs',
    action: 'process',
    recordId: runId,
    userId: profile.id,
    userEmail: profile.email,
    metadata: {
      totalGrossPay: run.total_gross_pay,
      totalNetPay: run.total_net_pay,
      employeeCount: run.employee_count,
    },
    severity: 'info',
    orgId: profile.orgId,
  });

  return { success: true };
}

/**
 * Delete a draft payroll run.
 */
export async function deletePayrollRunAction(runId: string): Promise<ActionResult<void>> {
  if (!runId || !z.string().uuid().safeParse(runId).success) {
    return { success: false, error: 'Invalid payroll run ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'payroll', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: payroll:delete required' };
  }

  // Verify run exists and is in draft status
  const { data: run } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('id', runId)
    .eq('org_id', profile.orgId)
    .single();

  if (!run) {
    return { success: false, error: 'Payroll run not found' };
  }

  if (run.status !== 'draft') {
    return { success: false, error: 'Only draft payroll runs can be deleted' };
  }

  // Delete items first (cascade should handle this, but being explicit)
  await supabase.from('payroll_items').delete().eq('payroll_run_id', runId);

  // Delete run
  const { error: deleteError } = await supabase.from('payroll_runs').delete().eq('id', runId);

  if (deleteError) {
    return { success: false, error: 'Failed to delete payroll run' };
  }

  // Log audit event
  const adminSupabase = createAdminClient();
  await logAuditEvent(adminSupabase, {
    tableName: 'payroll_runs',
    action: 'delete',
    recordId: runId,
    userId: profile.id,
    userEmail: profile.email,
    oldValues: run,
    severity: 'warning',
    orgId: profile.orgId,
  });

  return { success: true };
}

// ============================================================================
// Helper Functions
// ============================================================================

interface PayrollItemTotals {
  gross_pay: string | number;
  taxes_withheld: string | number | null;
  net_pay: string | number;
}

async function recalculatePayrollRunTotals(supabase: Awaited<ReturnType<typeof createClient>>, runId: string): Promise<void> {
  const { data: items } = await supabase
    .from('payroll_items')
    .select('gross_pay, taxes_withheld, net_pay')
    .eq('payroll_run_id', runId);

  if (items && items.length > 0) {
    const typedItems = items as unknown as PayrollItemTotals[];
    const totalGross = typedItems.reduce((sum: number, item: PayrollItemTotals) => sum + parseFloat(String(item.gross_pay)), 0);
    const totalTaxes = typedItems.reduce(
      (sum: number, item: PayrollItemTotals) => sum + parseFloat(item.taxes_withheld ? String(item.taxes_withheld) : '0'),
      0
    );
    const totalNet = typedItems.reduce((sum: number, item: PayrollItemTotals) => sum + parseFloat(String(item.net_pay)), 0);

    await supabase
      .from('payroll_runs')
      .update({
        employee_count: items.length,
        total_gross_pay: parseFloat(totalGross.toFixed(2)),
        total_taxes: parseFloat(totalTaxes.toFixed(2)),
        total_net_pay: parseFloat(totalNet.toFixed(2)),
      } as Record<string, unknown>)
      .eq('id', runId);
  }
}
