/**
 * SQL Validation Utility
 * Validates SQL before deployment to prevent injection attacks
 */

export interface SqlValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate SQL for deployment safety
 */
export function validateSql(sql: string, options: {
  allowedStatements?: string[];
  forbiddenCommands?: string[];
} = {}): SqlValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const defaultAllowed = [
    'CREATE OR REPLACE FUNCTION',
    'CREATE OR REPLACE VIEW',
    'CREATE TABLE IF NOT EXISTS',
    'CREATE INDEX IF NOT EXISTS',
    'ALTER TABLE',
    'DROP TRIGGER IF EXISTS',
    'CREATE TRIGGER',
    'COMMENT ON',
    'INSERT INTO',
  ];

  const defaultForbidden = [
    'DROP DATABASE',
    'DROP SCHEMA',
    'DROP TABLE',
    'TRUNCATE TABLE',
    'DELETE FROM user',
    'UPDATE user SET',
    'GRANT',
    'REVOKE',
    'ALTER ROLE',
    'CREATE ROLE',
  ];

  const allowedStatements = options.allowedStatements || defaultAllowed;
  const forbiddenCommands = options.forbiddenCommands || defaultForbidden;

  const normalizedSql = sql.trim().toUpperCase();

  // Check 1: SQL must not be empty
  if (!sql.trim()) {
    errors.push('SQL is empty');
    return { isValid: false, errors, warnings };
  }

  // Remove comments from beginning for validation
  const sqlWithoutComments = normalizedSql.replace(/^--.*$/gm, '').trim();

  // Check 2: Must start with allowed statement (after removing comments)
  const startsWithAllowed = allowedStatements.some(stmt =>
    sqlWithoutComments.startsWith(stmt.toUpperCase())
  );

  if (!startsWithAllowed) {
    errors.push(`SQL must start with one of: ${allowedStatements.join(', ')}`);
  }

  // Check 3: Must not contain forbidden commands
  for (const forbidden of forbiddenCommands) {
    if (normalizedSql.includes(forbidden.toUpperCase())) {
      errors.push(`Forbidden command detected: ${forbidden}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

