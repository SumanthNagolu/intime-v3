/**
 * Template Utilities
 * 
 * Interpolates activity templates with event data.
 * Supports {{variable}} syntax with nested paths.
 * 
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md#template-variables
 */

/**
 * Interpolate a template string with data
 * 
 * @example
 * interpolateTemplate(
 *   "Follow up on {{candidate.name}} submission to {{job.title}}",
 *   { candidate: { name: "John Smith" }, job: { title: "Senior Java Developer" } }
 * )
 * // Returns: "Follow up on John Smith submission to Senior Java Developer"
 */
export function interpolateTemplate(
  template: string,
  data: Record<string, unknown>,
  options?: {
    defaultValue?: string;
    formatters?: Record<string, (value: unknown) => string>;
  }
): string {
  const { defaultValue = '', formatters = {} } = options ?? {};
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const trimmedPath = path.trim();
    
    // Check for formatter syntax: {{path|formatter}}
    const [actualPath, formatterName] = trimmedPath.split('|').map((s: string) => s.trim());
    
    // Get the value
    const value = getNestedValue(data, actualPath);
    
    // Handle undefined/null
    if (value === undefined || value === null) {
      return defaultValue;
    }
    
    // Apply formatter if specified
    if (formatterName && formatters[formatterName]) {
      return formatters[formatterName](value);
    }
    
    // Format dates
    if (value instanceof Date) {
      return formatDate(value);
    }
    
    // Format numbers
    if (typeof value === 'number') {
      return formatNumber(value);
    }
    
    // Format arrays
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    // Default: convert to string
    return String(value);
  });
}

/**
 * Get nested value from object using dot notation
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    // Handle array index notation: items[0]
    const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, indexStr] = arrayMatch;
      const arr = (current as Record<string, unknown>)[key];
      if (Array.isArray(arr)) {
        current = arr[parseInt(indexStr, 10)];
      } else {
        return undefined;
      }
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  
  return current;
}

/**
 * Format a date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a number for display
 */
function formatNumber(num: number): string {
  // Format as currency if looks like money (has 2 decimal places)
  if (num % 1 !== 0 && num.toString().split('.')[1]?.length === 2) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  }
  
  // Format with thousands separator
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Built-in formatters
 */
export const DEFAULT_FORMATTERS: Record<string, (value: unknown) => string> = {
  // Date formatters
  date: (v) => v instanceof Date ? formatDate(v) : String(v),
  datetime: (v) => v instanceof Date 
    ? v.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }) 
    : String(v),
  time: (v) => v instanceof Date 
    ? v.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : String(v),
  
  // Number formatters
  currency: (v) => typeof v === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)
    : String(v),
  percent: (v) => typeof v === 'number' 
    ? new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 0 }).format(v / 100)
    : String(v),
  number: (v) => typeof v === 'number' 
    ? new Intl.NumberFormat('en-US').format(v)
    : String(v),
  
  // String formatters
  uppercase: (v) => String(v).toUpperCase(),
  lowercase: (v) => String(v).toLowerCase(),
  capitalize: (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
  truncate: (v) => {
    const str = String(v);
    return str.length > 50 ? str.slice(0, 47) + '...' : str;
  },
  
  // List formatters
  list: (v) => Array.isArray(v) ? v.join(', ') : String(v),
  count: (v) => Array.isArray(v) ? String(v.length) : '0',
};

/**
 * Create a context object for template interpolation
 * Combines various sources into a single flat object
 */
export function createTemplateContext(
  eventData: Record<string, unknown>,
  additionalContext?: Record<string, unknown>
): Record<string, unknown> {
  const now = new Date();
  
  return {
    // Event data (flattened at root)
    ...eventData,
    
    // Additional context
    ...additionalContext,
    
    // System context
    today: now,
    now: now,
    current_date: formatDate(now),
    current_time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    current_year: now.getFullYear(),
    current_month: now.toLocaleString('en-US', { month: 'long' }),
    current_quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
  };
}

/**
 * Validate a template string
 * Returns list of variables used
 */
export function validateTemplate(template: string): {
  valid: boolean;
  variables: string[];
  errors: string[];
} {
  const variables: string[] = [];
  const errors: string[] = [];
  
  const regex = /\{\{([^}]+)\}\}/g;
  let match;
  
  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    
    // Check for empty variable
    if (!variable) {
      errors.push('Empty variable found');
      continue;
    }
    
    // Check for valid variable name
    const [path, formatter] = variable.split('|').map(s => s.trim());
    
    if (!/^[\w.[\]]+$/.test(path)) {
      errors.push(`Invalid variable path: ${path}`);
    }
    
    if (formatter && !/^\w+$/.test(formatter)) {
      errors.push(`Invalid formatter: ${formatter}`);
    }
    
    variables.push(path);
  }
  
  return {
    valid: errors.length === 0,
    variables,
    errors,
  };
}

