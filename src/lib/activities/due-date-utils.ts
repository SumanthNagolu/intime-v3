/**
 * Due Date Utilities
 * 
 * Calculates due dates for activities based on offset rules.
 * Supports hours, business days, and specific times.
 * 
 * @see docs/specs/20-USER-ROLES/02-ACTIVITY-PATTERN-LIBRARY.md
 */

export interface DueDateOptions {
  /** Hours offset from base time (can be negative for "before" scenarios) */
  offsetHours?: number;
  
  /** Business days offset (excludes weekends) */
  offsetBusinessDays?: number;
  
  /** Specific time of day (HH:MM format) */
  specificTime?: string;
  
  /** Whether to use business hours only (9 AM - 5 PM) */
  useBusinessHours?: boolean;
  
  /** Timezone for calculations (default: 'America/New_York') */
  timezone?: string;
}

/**
 * Calculate due date based on offset rules
 * 
 * @param baseDate The starting date (usually event timestamp)
 * @param options Offset configuration
 * @returns Calculated due date
 * 
 * @example
 * // Due in 24 hours
 * calculateDueDate(new Date(), { offsetHours: 24 });
 * 
 * // Due in 2 business days
 * calculateDueDate(new Date(), { offsetBusinessDays: 2 });
 * 
 * // Due tomorrow at 9 AM
 * calculateDueDate(new Date(), { offsetHours: 24, specificTime: '09:00' });
 * 
 * // Due 24 hours BEFORE (negative offset, e.g., interview prep)
 * calculateDueDate(interviewDate, { offsetHours: -24 });
 */
export function calculateDueDate(
  baseDate: Date,
  options: DueDateOptions
): Date {
  let result = new Date(baseDate);
  
  // Apply hours offset first
  if (options.offsetHours !== undefined) {
    result = addHours(result, options.offsetHours);
  }
  
  // Apply business days offset
  if (options.offsetBusinessDays !== undefined) {
    result = addBusinessDays(result, options.offsetBusinessDays);
  }
  
  // Apply specific time if provided
  if (options.specificTime) {
    result = setSpecificTime(result, options.specificTime);
  }
  
  // If using business hours, adjust to next business hour if outside
  if (options.useBusinessHours) {
    result = adjustToBusinessHours(result);
  }
  
  return result;
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setTime(result.getTime() + hours * 60 * 60 * 1000);
  return result;
}

/**
 * Add business days to a date (skips weekends)
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  const direction = days >= 0 ? 1 : -1;
  let remaining = Math.abs(days);
  
  while (remaining > 0) {
    result.setDate(result.getDate() + direction);
    
    // Skip weekends
    if (!isWeekend(result)) {
      remaining--;
    }
  }
  
  return result;
}

/**
 * Set specific time on a date
 */
export function setSpecificTime(date: Date, time: string): Date {
  const result = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  
  result.setHours(hours, minutes, 0, 0);
  
  return result;
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if a time is within business hours (9 AM - 5 PM)
 */
export function isBusinessHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 9 && hour < 17;
}

/**
 * Adjust date to next business hour if outside business hours
 */
export function adjustToBusinessHours(date: Date): Date {
  const result = new Date(date);
  
  // If weekend, move to Monday
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }
  
  const hour = result.getHours();
  
  // If before 9 AM, set to 9 AM
  if (hour < 9) {
    result.setHours(9, 0, 0, 0);
  }
  
  // If after 5 PM, set to 9 AM next business day
  if (hour >= 17) {
    result.setDate(result.getDate() + 1);
    while (isWeekend(result)) {
      result.setDate(result.getDate() + 1);
    }
    result.setHours(9, 0, 0, 0);
  }
  
  return result;
}

/**
 * Get the start of a business day
 */
export function getBusinessDayStart(date: Date): Date {
  const result = new Date(date);
  result.setHours(9, 0, 0, 0);
  
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}

/**
 * Get the end of a business day
 */
export function getBusinessDayEnd(date: Date): Date {
  const result = new Date(date);
  result.setHours(17, 0, 0, 0);
  
  while (isWeekend(result)) {
    result.setDate(result.getDate() - 1);
  }
  
  return result;
}

/**
 * Calculate business hours between two dates
 */
export function getBusinessHoursBetween(start: Date, end: Date): number {
  const HOURS_PER_DAY = 8; // 9 AM - 5 PM
  let hours = 0;
  
  const current = new Date(start);
  
  while (current < end) {
    if (!isWeekend(current) && isBusinessHours(current)) {
      hours++;
    }
    current.setTime(current.getTime() + 60 * 60 * 1000); // Add 1 hour
  }
  
  return hours;
}

/**
 * Format a due date for display
 */
export function formatDueDate(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  // Overdue
  if (diffMs < 0) {
    if (diffHours > -24) {
      return `${Math.abs(diffHours)} hours overdue`;
    }
    return `${Math.abs(diffDays)} days overdue`;
  }
  
  // Today
  if (isToday(date)) {
    return `Today at ${formatTime(date)}`;
  }
  
  // Tomorrow
  if (isTomorrow(date)) {
    return `Tomorrow at ${formatTime(date)}`;
  }
  
  // Within a week
  if (diffDays < 7) {
    return `${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${formatTime(date)}`;
  }
  
  // Default: full date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

/**
 * Format time for display
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get due date status
 */
export function getDueDateStatus(date: Date): 'overdue' | 'due_today' | 'due_soon' | 'on_track' {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  
  if (diffMs < 0) return 'overdue';
  if (isToday(date)) return 'due_today';
  if (diffHours <= 48) return 'due_soon';
  return 'on_track';
}

