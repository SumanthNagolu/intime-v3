/**
 * SQL Validation Script
 *  
 * Validates all migration SQL files for common syntax errors
 * Run: npx tsx scripts/validate-sql.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  filename: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  lineCount: number;
}

/**
 * Common SQL syntax patterns to check
 */
const validationRules = [
  {
    name: 'Unclosed string literals',
    pattern: /'[^']*$/gm,
    severity: 'error',
    message: 'Found unclosed string literal (odd number of single quotes on line)'
  },
  {
    name: 'Unclosed double quotes',
    pattern: /"[^"]*$/gm,
    severity: 'error',
    message: 'Found unclosed double quote (odd number of double quotes on line)'
  },
  {
    name: 'Nested array_agg with DISTINCT unnest',
    pattern: /array_agg\s*\(\s*DISTINCT\s+unnest\s*\(/gi,
    severity: 'error',
    message: 'Invalid PostgreSQL syntax: array_agg(DISTINCT unnest(...)) is not allowed. Use LATERAL unnest() instead.'
  },
  {
    name: 'Missing semicolons at end of statements',
    pattern: /(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|SELECT)\s+.+[^;]\s*(?=(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|SELECT|$))/gis,
    severity: 'warning',
    message: 'Statement may be missing semicolon'
  },
  {
    name: 'SQL injection risk',
    pattern: /EXECUTE\s+['"]/gi,
    severity: 'warning',
    message: 'EXECUTE with string concatenation may be unsafe. Use parameterized queries or format() function.'
  }
];

/**
 * Validate a single SQL file
 */
function validateSqlFile(filePath: string): ValidationResult {
  const filename = path.basename(filePath);
  const result: ValidationResult = {
    filename,
    valid: true,
    errors: [],
    warnings: [],
    lineCount: 0
  };

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    result.lineCount = lines.length;

    // Check for unclosed string literals line by line
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Skip comments
      if (line.trim().startsWith('--')) return;
      
      // Check for odd number of single quotes (unclosed string)
      const singleQuotes = (line.match(/'/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        // Check if it's a string continuation from previous line
        const prevLine = index > 0 ? lines[index - 1] : '';
        const prevQuotes = (prevLine.match(/'/g) || []).length;
        
        // If previous line also had odd quotes, this might be a continuation
        if (prevQuotes % 2 === 0) {
          result.errors.push(`Line ${lineNum}: Unclosed string literal (odd number of single quotes)`);
          result.valid = false;
        }
      }

      // Check for specific problematic patterns
      if (/array_agg\s*\(\s*DISTINCT\s+unnest\s*\(/i.test(line)) {
        result.errors.push(
          `Line ${lineNum}: Invalid syntax - array_agg(DISTINCT unnest(...)) is not allowed in PostgreSQL. ` +
          `Use: SELECT array_agg(DISTINCT tag) FROM unnest(pt.tags) AS tag`
        );
        result.valid = false;
      }

      // Check for common typos
      if (/CRATE\s+TABLE/i.test(line)) {
        result.errors.push(`Line ${lineNum}: Typo - 'CRATE' should be 'CREATE'`);
        result.valid = false;
      }

      if (/TABEL\s+/i.test(line)) {
        result.errors.push(`Line ${lineNum}: Typo - 'TABEL' should be 'TABLE'`);
        result.valid = false;
      }

      // Check for unbalanced parentheses
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        // This is just a warning since parentheses can span multiple lines
        // We'll do a full check later
      }
    });

    // Full-file checks
    const fullContent = content.replace(/--[^\n]*/g, ''); // Remove comments

    // Check overall parentheses balance
    const allOpenParens = (fullContent.match(/\(/g) || []).length;
    const allCloseParens = (fullContent.match(/\)/g) || []).length;
    if (allOpenParens !== allCloseParens) {
      result.errors.push(
        `Unbalanced parentheses: ${allOpenParens} opening, ${allCloseParens} closing`
      );
      result.valid = false;
    }

    // Check for common SQL keywords at end of file without semicolon
    const lastNonCommentLine = lines
      .reverse()
      .find(line => line.trim() && !line.trim().startsWith('--'));
    
    if (lastNonCommentLine && !lastNonCommentLine.trim().endsWith(';') && 
        /(?:VALUES|RETURNS|END|LANGUAGE|SECURITY)/i.test(lastNonCommentLine)) {
      result.warnings.push('Last statement may be missing a semicolon');
    }

    // Check for deprecated Supabase patterns
    if (/auth\.uid\(\s*\)/i.test(fullContent)) {
      result.warnings.push('Using auth.uid() - ensure Supabase auth is properly configured');
    }

    // Check for hardcoded UUIDs
    if (/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(fullContent)) {
      result.warnings.push('Found hardcoded UUIDs - consider using uuid_generate_v4()');
    }

  } catch (error: any) {
    result.errors.push(`Failed to read file: ${error.message}`);
    result.valid = false;
  }

  return result;
}

/**
 * Main validation function
 */
function main() {
  console.log('🔍 SQL Migration Validation\n');
  console.log('='.repeat(60));
  
  const migrationsDir = path.join(process.cwd(), 'src/lib/db/migrations');
  
  // Find all SQL files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('rollback'))
    .sort();

  if (files.length === 0) {
    console.log('❌ No migration files found in:', migrationsDir);
    process.exit(1);
  }

  console.log(`Found ${files.length} migration files\n`);

  const results: ValidationResult[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;
  let totalLines = 0;

  // Validate each file
  files.forEach((filename, index) => {
    const filePath = path.join(migrationsDir, filename);
    console.log(`[${index + 1}/${files.length}] Validating ${filename}...`);
    
    const result = validateSqlFile(filePath);
    results.push(result);
    
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
    totalLines += result.lineCount;

    if (result.valid && result.warnings.length === 0) {
      console.log(`  ✅ Valid (${result.lineCount} lines)\n`);
    } else if (result.valid && result.warnings.length > 0) {
      console.log(`  ⚠️  Valid with warnings (${result.lineCount} lines)`);
      result.warnings.forEach(warning => {
        console.log(`     • ${warning}`);
      });
      console.log('');
    } else {
      console.log(`  ❌ Invalid (${result.lineCount} lines)`);
      result.errors.forEach(error => {
        console.log(`     • ${error}`);
      });
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => {
          console.log(`     ⚠️  ${warning}`);
        });
      }
      console.log('');
    }
  });

  // Summary
  console.log('='.repeat(60));
  console.log('\n📊 Validation Summary\n');
  console.log(`Total Files:    ${results.length}`);
  console.log(`Total Lines:    ${totalLines.toLocaleString()}`);
  console.log(`Valid Files:    ${results.filter(r => r.valid).length} ✅`);
  console.log(`Invalid Files:  ${results.filter(r => !r.valid).length} ❌`);
  console.log(`Total Errors:   ${totalErrors} ${totalErrors === 0 ? '✅' : '❌'}`);
  console.log(`Total Warnings: ${totalWarnings} ${totalWarnings === 0 ? '✅' : '⚠️'}`);
  console.log('');

  // List problematic files
  const invalidFiles = results.filter(r => !r.valid);
  if (invalidFiles.length > 0) {
    console.log('❌ Files with errors:\n');
    invalidFiles.forEach(result => {
      console.log(`  • ${result.filename}`);
      result.errors.forEach(error => {
        console.log(`    - ${error}`);
      });
    });
    console.log('');
  }

  const filesWithWarnings = results.filter(r => r.valid && r.warnings.length > 0);
  if (filesWithWarnings.length > 0) {
    console.log('⚠️  Files with warnings:\n');
    filesWithWarnings.forEach(result => {
      console.log(`  • ${result.filename}`);
      result.warnings.forEach(warning => {
        console.log(`    - ${warning}`);
      });
    });
    console.log('');
  }

  // Exit code
  if (totalErrors > 0) {
    console.log('❌ Validation FAILED. Please fix errors before running migrations.\n');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('⚠️  Validation PASSED with warnings. Review warnings before proceeding.\n');
    process.exit(0);
  } else {
    console.log('✅ All migration files are valid! Safe to run migrations.\n');
    process.exit(0);
  }
}

// Run validation
main();


