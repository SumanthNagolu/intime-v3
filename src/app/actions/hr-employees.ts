/**
 * HR Employee Server Actions
 *
 * Provides CRUD operations for employees with RBAC enforcement.
 * All actions require authentication and appropriate permissions.
 *
 * @module actions/hr-employees
 */

'use server';

import { createClient } from '@/lib/supabase/server';
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

export interface Employee {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  department: string | null;
  position: string | null;
  hireDate: string | null;
  status: string;
  salary: number | null;
  managerId: string | null;
  performanceRating: number | null;
  orgId: string;
  createdAt: string;
  // Extended metadata
  employmentType: string | null;
  employeeIdNumber: string | null;
  podId: string | null;
  podRole: string | null;
}

export interface EmployeeWithMetadata extends Employee {
  manager?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  pod?: {
    id: string;
    name: string;
    podType: string;
  } | null;
  directReports?: number;
}

export interface EmployeeFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: string;
  podId?: string;
  managerId?: string;
}

export interface CreateEmployeeInput {
  email: string;
  fullName: string;
  department?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
  managerId?: string;
  employmentType?: string;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  department?: string;
  position?: string;
  salary?: number;
  status?: string;
  managerId?: string;
  performanceRating?: number;
  employmentType?: string;
  podId?: string;
  podRole?: string;
}

// ============================================================================
// Validation Schemas
// ============================================================================

const employeeFiltersSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  podId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
});

const createEmployeeSchema = z.object({
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(1, 'Full name is required').max(255),
  department: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
  salary: z.number().min(0).optional(),
  managerId: z.string().uuid().optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contractor', 'intern']).optional(),
});

const updateEmployeeSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  salary: z.number().min(0).optional(),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']).optional(),
  managerId: z.string().uuid().nullable().optional(),
  performanceRating: z.number().min(1).max(5).optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contractor', 'intern']).optional(),
  podId: z.string().uuid().nullable().optional(),
  podRole: z.string().optional(),
});

// ============================================================================
// Actions
// ============================================================================

/**
 * Get paginated list of employees with filtering.
 */
export async function listEmployeesAction(
  filters: EmployeeFilters = {}
): Promise<ActionResult<PaginatedResult<Employee>>> {
  const validation = employeeFiltersSchema.safeParse(filters);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid filters',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { page, pageSize, search, department, status, podId, managerId } = validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'employees', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: employees:read required' };
  }

  // Build query
  let query = supabase
    .from('user_profiles')
    .select(
      `
      id,
      email,
      full_name,
      avatar_url,
      department,
      position,
      hire_date,
      status,
      salary,
      manager_id,
      performance_rating,
      org_id,
      created_at,
      employee_metadata (
        employment_type,
        employee_id_number,
        pod_id,
        pod_role
      )
    `,
      { count: 'exact' }
    )
    .eq('org_id', profile.orgId);

  // Apply filters
  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,position.ilike.%${search}%`
    );
  }

  if (department) {
    query = query.eq('department', department);
  }

  if (status) {
    query = query.eq('status', status);
  }

  if (managerId) {
    query = query.eq('manager_id', managerId);
  }

  // Apply pagination
  const { from, to } = calculateRange(page, pageSize);
  query = query.order('full_name', { ascending: true }).range(from, to);

  const { data: employees, error, count } = await query;

  if (error) {
    console.error('List employees error:', error);
    return { success: false, error: 'Failed to fetch employees' };
  }

  // Transform data
  const transformedEmployees: Employee[] = (employees || []).map((emp: any) => ({
    id: emp.id,
    email: emp.email,
    fullName: emp.full_name,
    avatarUrl: emp.avatar_url,
    department: emp.department,
    position: emp.position,
    hireDate: emp.hire_date,
    status: emp.status,
    salary: emp.salary ? parseFloat(emp.salary) : null,
    managerId: emp.manager_id,
    performanceRating: emp.performance_rating,
    orgId: emp.org_id,
    createdAt: emp.created_at,
    employmentType: emp.employee_metadata?.employment_type || null,
    employeeIdNumber: emp.employee_metadata?.employee_id_number || null,
    podId: emp.employee_metadata?.pod_id || null,
    podRole: emp.employee_metadata?.pod_role || null,
  }));

  // Filter by podId if specified (need to do client-side since it's in metadata)
  let filteredEmployees = transformedEmployees;
  if (podId) {
    filteredEmployees = transformedEmployees.filter((emp) => emp.podId === podId);
  }

  const total = podId ? filteredEmployees.length : count || 0;
  const pagination = calculatePagination(total, page, pageSize);

  return {
    success: true,
    data: {
      items: podId ? filteredEmployees : transformedEmployees,
      ...pagination,
    },
  };
}

/**
 * Get a single employee with full details.
 */
export async function getEmployeeAction(
  employeeId: string
): Promise<ActionResult<EmployeeWithMetadata>> {
  if (!employeeId || !z.string().uuid().safeParse(employeeId).success) {
    return { success: false, error: 'Invalid employee ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'employees', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: employees:read required' };
  }

  // Fetch employee with relations
  const { data: emp, error } = await supabase
    .from('user_profiles')
    .select(
      `
      id,
      email,
      full_name,
      avatar_url,
      department,
      position,
      hire_date,
      status,
      salary,
      manager_id,
      performance_rating,
      org_id,
      created_at,
      employee_metadata (
        employment_type,
        employee_id_number,
        pod_id,
        pod_role
      ),
      manager:user_profiles!user_profiles_manager_id_fkey (
        id,
        full_name,
        email
      )
    `
    )
    .eq('id', employeeId)
    .eq('org_id', profile.orgId)
    .single();

  if (error || !emp) {
    return { success: false, error: 'Employee not found' };
  }

  // Get direct reports count
  const { count: directReports } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('manager_id', employeeId);

  // Get pod info if assigned
  let pod = null;
  if (emp.employee_metadata?.pod_id) {
    const { data: podData } = await supabase
      .from('pods')
      .select('id, name, pod_type')
      .eq('id', emp.employee_metadata.pod_id)
      .single();

    if (podData) {
      pod = {
        id: podData.id,
        name: podData.name,
        podType: podData.pod_type,
      };
    }
  }

  const employee: EmployeeWithMetadata = {
    id: emp.id,
    email: emp.email,
    fullName: emp.full_name,
    avatarUrl: emp.avatar_url,
    department: emp.department,
    position: emp.position,
    hireDate: emp.hire_date,
    status: emp.status,
    salary: emp.salary ? parseFloat(emp.salary) : null,
    managerId: emp.manager_id,
    performanceRating: emp.performance_rating,
    orgId: emp.org_id,
    createdAt: emp.created_at,
    employmentType: emp.employee_metadata?.employment_type || null,
    employeeIdNumber: emp.employee_metadata?.employee_id_number || null,
    podId: emp.employee_metadata?.pod_id || null,
    podRole: emp.employee_metadata?.pod_role || null,
    manager: emp.manager
      ? {
          id: (emp.manager as any).id,
          fullName: (emp.manager as any).full_name,
          email: (emp.manager as any).email,
        }
      : null,
    pod,
    directReports: directReports || 0,
  };

  return { success: true, data: employee };
}

/**
 * Create a new employee.
 */
export async function createEmployeeAction(
  input: CreateEmployeeInput
): Promise<ActionResult<Employee>> {
  const validation = createEmployeeSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, fullName, department, position, hireDate, salary, managerId, employmentType } =
    validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'employees', 'create');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: employees:create required' };
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .eq('org_id', profile.orgId)
    .single();

  if (existingUser) {
    return { success: false, error: 'An employee with this email already exists' };
  }

  // Create user profile
  const { data: newEmployee, error } = await supabase
    .from('user_profiles')
    .insert({
      email,
      full_name: fullName,
      department,
      position,
      hire_date: hireDate,
      salary: salary?.toString(),
      manager_id: managerId,
      org_id: profile.orgId,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    console.error('Create employee error:', error);
    return { success: false, error: 'Failed to create employee' };
  }

  // Create employee metadata if employment type specified
  if (employmentType) {
    await supabase.from('employee_metadata').insert({
      user_id: newEmployee.id,
      employment_type: employmentType,
    });
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'user_profiles',
    action: 'create',
    recordId: newEmployee.id,
    userId: profile.id,
    newValues: { email, fullName, department, position },
    severity: 'info',
    orgId: profile.orgId,
  });

  return {
    success: true,
    data: {
      id: newEmployee.id,
      email: newEmployee.email,
      fullName: newEmployee.full_name,
      avatarUrl: newEmployee.avatar_url,
      department: newEmployee.department,
      position: newEmployee.position,
      hireDate: newEmployee.hire_date,
      status: newEmployee.status,
      salary: newEmployee.salary ? parseFloat(newEmployee.salary) : null,
      managerId: newEmployee.manager_id,
      performanceRating: newEmployee.performance_rating,
      orgId: newEmployee.org_id,
      createdAt: newEmployee.created_at,
      employmentType,
      employeeIdNumber: null,
      podId: null,
      podRole: null,
    },
  };
}

/**
 * Update an existing employee.
 */
export async function updateEmployeeAction(
  employeeId: string,
  input: UpdateEmployeeInput
): Promise<ActionResult<Employee>> {
  if (!employeeId || !z.string().uuid().safeParse(employeeId).success) {
    return { success: false, error: 'Invalid employee ID' };
  }

  const validation = updateEmployeeSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: 'Invalid input',
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  const { fullName, department, position, salary, status, managerId, performanceRating, employmentType, podId, podRole } =
    validation.data;

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'employees', 'update');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: employees:update required' };
  }

  // Verify employee exists and belongs to org
  const { data: existingEmployee } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', employeeId)
    .eq('org_id', profile.orgId)
    .single();

  if (!existingEmployee) {
    return { success: false, error: 'Employee not found' };
  }

  // Build update object for user_profiles
  const profileUpdates: Record<string, any> = {};
  if (fullName !== undefined) profileUpdates.full_name = fullName;
  if (department !== undefined) profileUpdates.department = department;
  if (position !== undefined) profileUpdates.position = position;
  if (salary !== undefined) profileUpdates.salary = salary?.toString();
  if (status !== undefined) profileUpdates.status = status;
  if (managerId !== undefined) profileUpdates.manager_id = managerId;
  if (performanceRating !== undefined) profileUpdates.performance_rating = performanceRating;

  // Update user_profiles
  if (Object.keys(profileUpdates).length > 0) {
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(profileUpdates)
      .eq('id', employeeId);

    if (updateError) {
      console.error('Update employee error:', updateError);
      return { success: false, error: 'Failed to update employee' };
    }
  }

  // Build update object for employee_metadata
  const metadataUpdates: Record<string, any> = {};
  if (employmentType !== undefined) metadataUpdates.employment_type = employmentType;
  if (podId !== undefined) metadataUpdates.pod_id = podId;
  if (podRole !== undefined) metadataUpdates.pod_role = podRole;

  if (Object.keys(metadataUpdates).length > 0) {
    // Upsert employee metadata
    const { error: metaError } = await supabase
      .from('employee_metadata')
      .upsert(
        {
          user_id: employeeId,
          ...metadataUpdates,
        },
        { onConflict: 'user_id' }
      );

    if (metaError) {
      console.error('Update employee metadata error:', metaError);
      // Non-fatal, continue
    }
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'user_profiles',
    action: 'update',
    recordId: employeeId,
    userId: profile.id,
    oldValues: existingEmployee,
    newValues: { ...profileUpdates, ...metadataUpdates },
    changedFields: [...Object.keys(profileUpdates), ...Object.keys(metadataUpdates)],
    severity: 'info',
    orgId: profile.orgId,
  });

  // Fetch updated employee
  const result = await getEmployeeAction(employeeId);
  if (!result.success || !result.data) {
    return { success: false, error: 'Failed to fetch updated employee' };
  }

  return { success: true, data: result.data };
}

/**
 * Get organization chart data - employees grouped by manager.
 */
export async function getOrgChartAction(): Promise<
  ActionResult<{
    employees: EmployeeWithMetadata[];
    departments: string[];
  }>
> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'employees', 'read');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: employees:read required' };
  }

  // Fetch all employees for org chart
  const { data: employees, error } = await supabase
    .from('user_profiles')
    .select(
      `
      id,
      email,
      full_name,
      avatar_url,
      department,
      position,
      hire_date,
      status,
      manager_id,
      performance_rating,
      org_id,
      employee_metadata (
        pod_id,
        pod_role
      )
    `
    )
    .eq('org_id', profile.orgId)
    .eq('status', 'active')
    .order('full_name');

  if (error) {
    console.error('Get org chart error:', error);
    return { success: false, error: 'Failed to fetch org chart data' };
  }

  // Transform and count direct reports
  const employeeMap = new Map<string, EmployeeWithMetadata>();
  const departments = new Set<string>();

  (employees || []).forEach((emp: any) => {
    if (emp.department) departments.add(emp.department);

    employeeMap.set(emp.id, {
      id: emp.id,
      email: emp.email,
      fullName: emp.full_name,
      avatarUrl: emp.avatar_url,
      department: emp.department,
      position: emp.position,
      hireDate: emp.hire_date,
      status: emp.status,
      salary: null,
      managerId: emp.manager_id,
      performanceRating: emp.performance_rating,
      orgId: emp.org_id,
      createdAt: emp.created_at,
      employmentType: null,
      employeeIdNumber: null,
      podId: emp.employee_metadata?.pod_id || null,
      podRole: emp.employee_metadata?.pod_role || null,
      directReports: 0,
    });
  });

  // Count direct reports
  employeeMap.forEach((emp) => {
    if (emp.managerId && employeeMap.has(emp.managerId)) {
      const manager = employeeMap.get(emp.managerId)!;
      manager.directReports = (manager.directReports || 0) + 1;
    }
  });

  return {
    success: true,
    data: {
      employees: Array.from(employeeMap.values()),
      departments: Array.from(departments).sort(),
    },
  };
}

/**
 * Get distinct departments in the organization.
 */
export async function getDepartmentsAction(): Promise<ActionResult<string[]>> {
  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('department')
    .eq('org_id', profile.orgId)
    .not('department', 'is', null);

  if (error) {
    return { success: false, error: 'Failed to fetch departments' };
  }

  const departments = [...new Set((data || []).map((d: any) => d.department).filter(Boolean))].sort();

  return { success: true, data: departments };
}

/**
 * Terminate an employee (soft delete).
 */
export async function terminateEmployeeAction(
  employeeId: string,
  reason?: string
): Promise<ActionResult<void>> {
  if (!employeeId || !z.string().uuid().safeParse(employeeId).success) {
    return { success: false, error: 'Invalid employee ID' };
  }

  const { error: authError, profile } = await getCurrentUserContext();
  if (authError || !profile) {
    return { success: false, error: authError || 'Not authenticated' };
  }

  const supabase = await createClient();

  const hasPermission = await checkPermission(supabase, profile.id, 'employees', 'delete');
  if (!hasPermission) {
    return { success: false, error: 'Permission denied: employees:delete required' };
  }

  // Verify employee exists
  const { data: employee } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', employeeId)
    .eq('org_id', profile.orgId)
    .single();

  if (!employee) {
    return { success: false, error: 'Employee not found' };
  }

  // Update status to terminated
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ status: 'terminated' })
    .eq('id', employeeId);

  if (updateError) {
    return { success: false, error: 'Failed to terminate employee' };
  }

  // Log audit event
  await logAuditEvent(supabase, {
    tableName: 'user_profiles',
    action: 'terminate',
    recordId: employeeId,
    userId: profile.id,
    oldValues: { status: employee.status },
    newValues: { status: 'terminated' },
    metadata: { reason },
    severity: 'warning',
    orgId: profile.orgId,
  });

  return { success: true };
}
