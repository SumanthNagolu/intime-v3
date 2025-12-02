/**
 * SLA Calculation Utilities
 *
 * Utilities for calculating SLA status, time remaining, and risk levels.
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { differenceInMinutes, differenceInHours, differenceInDays, isPast, addHours, addMinutes } from 'date-fns';

// ==========================================
// TYPES
// ==========================================

export type SLAStatus = 'on_track' | 'at_risk' | 'breached';

export type Priority = 'critical' | 'urgent' | 'high' | 'normal' | 'low';

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  totalMinutes: number;
  text: string;
  isOverdue: boolean;
}

export interface SLAConfig {
  /** Minutes before due date to show "at_risk" status */
  atRiskThreshold: number;
  /** Business hours only (9-5) */
  businessHoursOnly?: boolean;
}

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Default SLA thresholds by priority (in minutes)
 * These define how long before due date an activity is considered "at risk"
 */
export const DEFAULT_SLA_THRESHOLDS: Record<Priority, number> = {
  critical: 60,    // 1 hour before due
  urgent: 120,     // 2 hours before due
  high: 240,       // 4 hours before due
  normal: 480,     // 8 hours before due
  low: 1440,       // 24 hours before due
};

/**
 * Default SLA durations by priority (in hours)
 * Used when creating activities without explicit due dates
 */
export const DEFAULT_SLA_DURATIONS: Record<Priority, number> = {
  critical: 1,     // 1 hour
  urgent: 2,       // 2 hours
  high: 4,         // 4 hours
  normal: 24,      // 1 day
  low: 72,         // 3 days
};

// ==========================================
// SLA CALCULATION FUNCTIONS
// ==========================================

/**
 * Calculate the SLA status based on due date and priority
 *
 * @param dueAt - The due date/time
 * @param priority - Activity priority level
 * @param config - Optional SLA configuration overrides
 * @returns SLA status: 'on_track', 'at_risk', or 'breached'
 */
export function calculateSLAStatus(
  dueAt: Date | string | null | undefined,
  priority: Priority = 'normal',
  config?: Partial<SLAConfig>
): SLAStatus {
  if (!dueAt) return 'on_track';

  const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();

  // Breached if past due
  if (isPast(dueDate)) {
    return 'breached';
  }

  // Calculate minutes until due
  const minutesUntilDue = differenceInMinutes(dueDate, now);

  // Get threshold for this priority
  const threshold = config?.atRiskThreshold ?? DEFAULT_SLA_THRESHOLDS[priority];

  // At risk if within threshold
  if (minutesUntilDue <= threshold) {
    return 'at_risk';
  }

  return 'on_track';
}

/**
 * Get time remaining until due date
 *
 * @param dueAt - The due date/time
 * @returns TimeRemaining object with formatted text
 */
export function getTimeRemaining(dueAt: Date | string | null | undefined): TimeRemaining {
  if (!dueAt) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      text: 'No due date',
      isOverdue: false,
    };
  }

  const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();
  const isOverdue = isPast(dueDate);

  // Calculate difference (absolute value for overdue)
  const totalMinutes = Math.abs(differenceInMinutes(dueDate, now));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  // Format text
  let text: string;
  if (totalMinutes === 0) {
    text = 'Due now';
  } else if (days > 0) {
    text = `${days}d ${hours}h`;
  } else if (hours > 0) {
    text = `${hours}h ${minutes}m`;
  } else {
    text = `${minutes}m`;
  }

  if (isOverdue) {
    text = `Overdue by ${text}`;
  } else {
    text = `${text} remaining`;
  }

  return {
    days,
    hours,
    minutes,
    totalMinutes,
    text,
    isOverdue,
  };
}

/**
 * Check if an activity is overdue
 *
 * @param dueAt - The due date/time
 * @returns boolean
 */
export function isOverdue(dueAt: Date | string | null | undefined): boolean {
  if (!dueAt) return false;
  const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  return isPast(dueDate);
}

/**
 * Get the "at risk" threshold in minutes for a given priority
 *
 * @param priority - Activity priority level
 * @returns Number of minutes before due that activity becomes "at risk"
 */
export function getAtRiskThreshold(priority: Priority = 'normal'): number {
  return DEFAULT_SLA_THRESHOLDS[priority];
}

/**
 * Calculate the default due date based on priority
 *
 * @param priority - Activity priority level
 * @param startFrom - Optional start date (defaults to now)
 * @returns Calculated due date
 */
export function calculateDefaultDueDate(
  priority: Priority = 'normal',
  startFrom: Date = new Date()
): Date {
  const hours = DEFAULT_SLA_DURATIONS[priority];
  return addHours(startFrom, hours);
}

/**
 * Get a human-readable SLA label
 *
 * @param status - SLA status
 * @returns Human-readable label
 */
export function getSLALabel(status: SLAStatus): string {
  switch (status) {
    case 'on_track':
      return 'On Track';
    case 'at_risk':
      return 'At Risk';
    case 'breached':
      return 'SLA Breached';
  }
}

/**
 * Get SLA color configuration
 *
 * @param status - SLA status
 * @returns Color configuration for UI
 */
export function getSLAColors(status: SLAStatus): {
  text: string;
  bg: string;
  dot: string;
  border: string;
} {
  switch (status) {
    case 'on_track':
      return {
        text: 'text-green-600',
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        border: 'border-green-300',
      };
    case 'at_risk':
      return {
        text: 'text-yellow-600',
        bg: 'bg-yellow-100',
        dot: 'bg-yellow-500',
        border: 'border-yellow-300',
      };
    case 'breached':
      return {
        text: 'text-red-600',
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        border: 'border-red-300',
      };
  }
}

/**
 * Check if SLA will breach soon (within next N minutes)
 *
 * @param dueAt - The due date/time
 * @param withinMinutes - Number of minutes to check (default: 60)
 * @returns boolean
 */
export function willBreachSoon(
  dueAt: Date | string | null | undefined,
  withinMinutes: number = 60
): boolean {
  if (!dueAt) return false;

  const dueDate = typeof dueAt === 'string' ? new Date(dueAt) : dueAt;
  const now = new Date();

  if (isPast(dueDate)) return true; // Already breached

  const minutesUntilDue = differenceInMinutes(dueDate, now);
  return minutesUntilDue <= withinMinutes;
}

/**
 * Sort activities by SLA priority (most urgent first)
 *
 * @param activities - Array of activities with dueAt and priority
 * @returns Sorted array
 */
export function sortBySLAPriority<T extends { dueAt?: Date | string | null; priority?: Priority }>(
  activities: T[]
): T[] {
  const priorityOrder: Record<Priority, number> = {
    critical: 0,
    urgent: 1,
    high: 2,
    normal: 3,
    low: 4,
  };

  return [...activities].sort((a, b) => {
    // First sort by SLA status (breached first)
    const statusA = calculateSLAStatus(a.dueAt, a.priority);
    const statusB = calculateSLAStatus(b.dueAt, b.priority);

    const statusOrder: Record<SLAStatus, number> = {
      breached: 0,
      at_risk: 1,
      on_track: 2,
    };

    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }

    // Then sort by priority
    const priorityA = priorityOrder[a.priority || 'normal'];
    const priorityB = priorityOrder[b.priority || 'normal'];

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Finally sort by due date (earliest first)
    if (a.dueAt && b.dueAt) {
      const dateA = typeof a.dueAt === 'string' ? new Date(a.dueAt) : a.dueAt;
      const dateB = typeof b.dueAt === 'string' ? new Date(b.dueAt) : b.dueAt;
      return dateA.getTime() - dateB.getTime();
    }

    // Activities with due dates come before those without
    if (a.dueAt && !b.dueAt) return -1;
    if (!a.dueAt && b.dueAt) return 1;

    return 0;
  });
}
