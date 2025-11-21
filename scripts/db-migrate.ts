#!/usr/bin/env tsx

/**
 * SINGLE SOURCE OF TRUTH FOR DATABASE MIGRATIONS
 *
 * This is THE ONLY script that should run migrations.
 * No more ad-hoc scripts. No more manual commands.
 *
 * Usage:
 *   pnpm db:migrate              # Run all pending migrations
 *   pnpm db:migrate --local      # Test locally first
 *   pnpm db:migrate --rollback   # Rollback last migration
 *   pnpm db:migrate --status     # Show migration status
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationResult {
  success: boolean;
  output: string[];
  errors: string[];
  duration: number;
}

class DatabaseMigration {
  private projectRoot: string;
  private migrationsDir: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.migrationsDir = path.join(this.projectRoot, 'supabase', 'migrations');
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const isLocal = args.includes('--local');
    const isRollback = args.includes('--rollback');
    const isStatus = args.includes('--status');

    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│  🗄️  Database Migration Manager                        │');
    console.log('└─────────────────────────────────────────────────────────┘\n');

    try {
      // Check prerequisites
      await this.checkPrerequisites();

      if (isStatus) {
        await this.showStatus();
        return;
      }

      if (isRollback) {
        await this.rollback();
        return;
      }

      // Run migrations
      await this.migrate(isLocal);

    } catch (error) {
      console.error('\n❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('📋 Checking prerequisites...\n');

    // Check Supabase CLI
    const supabaseVersion = await this.runCommand('supabase', ['--version']);
    if (!supabaseVersion.success) {
      throw new Error(
        'Supabase CLI not installed.\n' +
        'Install: brew install supabase/tap/supabase'
      );
    }
    console.log('✓ Supabase CLI:', supabaseVersion.output[0]?.trim());

    // Check .env.local
    const envPath = path.join(this.projectRoot, '.env.local');
    try {
      await fs.access(envPath);
      console.log('✓ .env.local found');
    } catch {
      throw new Error(
        '.env.local not found.\n' +
        'Copy .env.local.example and fill in SUPABASE_DB_URL'
      );
    }

    // Check SUPABASE_DB_URL
    const envContent = await fs.readFile(envPath, 'utf-8');
    if (!envContent.includes('SUPABASE_DB_URL=')) {
      throw new Error('SUPABASE_DB_URL not set in .env.local');
    }
    console.log('✓ Database connection configured');

    // Check migrations directory
    try {
      await fs.access(this.migrationsDir);
      const files = await fs.readdir(this.migrationsDir);
      const sqlFiles = files.filter(f => f.endsWith('.sql'));
      console.log(`✓ Found ${sqlFiles.length} migration file(s)\n`);
    } catch {
      throw new Error(`Migrations directory not found: ${this.migrationsDir}`);
    }
  }

  private async showStatus(): Promise<void> {
    console.log('📊 Migration Status\n');

    // Get remote migrations (linked project)
    const result = await this.runCommand('supabase', [
      'migration',
      'list',
      '--linked'
    ]);

    if (result.success) {
      console.log(result.output.join('\n'));
    } else {
      console.log('Could not fetch migration status. Using local check...\n');

      // Fallback: show local migrations
      const files = await fs.readdir(this.migrationsDir);
      const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

      console.log('Local migration files:');
      for (const file of sqlFiles) {
        console.log(`  - ${file}`);
      }
    }
  }

  private async migrate(localFirst: boolean): Promise<void> {
    const startTime = Date.now();

    if (localFirst) {
      console.log('🧪 Testing migrations locally first...\n');

      // Start local Supabase
      console.log('Starting local Supabase...');
      const startResult = await this.runCommand('supabase', ['start'], { timeout: 120000 });

      if (!startResult.success) {
        throw new Error('Failed to start local Supabase:\n' + startResult.errors.join('\n'));
      }

      console.log('✓ Local Supabase started\n');

      // Run migrations locally
      console.log('Running migrations on local database...');
      const localMigrate = await this.runCommand('supabase', ['db', 'push', '--local']);

      if (!localMigrate.success) {
        console.error('\n❌ Local migration failed:\n');
        console.error(localMigrate.errors.join('\n'));

        // Stop local Supabase
        await this.runCommand('supabase', ['stop']);

        throw new Error('Migrations failed on local database. Fix errors before deploying to production.');
      }

      console.log('✓ Local migration successful\n');

      // Stop local Supabase
      console.log('Stopping local Supabase...');
      await this.runCommand('supabase', ['stop']);
      console.log('✓ Local Supabase stopped\n');
    }

    // Run on production
    console.log('🚀 Running migrations on production database...\n');

    const prodMigrate = await this.runCommand('supabase', [
      'db',
      'push',
      '--linked'
    ]);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (!prodMigrate.success) {
      console.error('\n❌ Production migration failed:\n');
      console.error(prodMigrate.errors.join('\n'));
      console.error(`\nDuration: ${duration}s`);

      throw new Error(
        'Migration failed on production.\n' +
        'Run with --local first to test migrations before deploying.'
      );
    }

    console.log('✓ Production migration successful');
    console.log(`✓ Duration: ${duration}s\n`);

    // Show what was applied
    console.log('📝 Applied migrations:\n');
    console.log(prodMigrate.output.join('\n'));

    console.log('\n┌─────────────────────────────────────────────────────────┐');
    console.log('│  ✅ Migration completed successfully!                  │');
    console.log('└─────────────────────────────────────────────────────────┘\n');
  }

  private async rollback(): Promise<void> {
    console.log('⏪ Rolling back last migration...\n');

    console.warn('⚠️  WARNING: Rollback will drop the last migration.');
    console.warn('   Make sure you have a backup!\n');

    // Get list of migrations
    const files = await fs.readdir(this.migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    if (sqlFiles.length === 0) {
      throw new Error('No migrations found to rollback');
    }

    const lastMigration = sqlFiles[sqlFiles.length - 1];
    console.log(`Last migration: ${lastMigration}\n`);

    // For now, we'll just document this - actual rollback requires custom logic per migration
    console.log('To rollback this migration:');
    console.log('1. Review the migration file');
    console.log('2. Write a down migration (reverse of the up migration)');
    console.log('3. Apply it using: pnpm db:execute path/to/rollback.sql\n');

    console.log('❌ Automatic rollback not yet implemented.');
    console.log('   Manual rollback required for safety.');
  }

  private async getProjectRef(): Promise<string> {
    // Extract project ref from SUPABASE_DB_URL
    // Format: postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
    const envPath = path.join(this.projectRoot, '.env.local');
    const envContent = await fs.readFile(envPath, 'utf-8');

    const match = envContent.match(/SUPABASE_DB_URL=.*?@db\.([^.]+)\.supabase\.co/);
    if (!match) {
      throw new Error('Could not extract project ref from SUPABASE_DB_URL');
    }

    return match[1];
  }

  private runCommand(
    command: string,
    args: string[],
    options: { timeout?: number } = {}
  ): Promise<MigrationResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const output: string[] = [];
      const errors: string[] = [];

      const proc = spawn(command, args, {
        cwd: this.projectRoot,
        env: { ...process.env },
        shell: true
      });

      // Handle timeout
      const timeout = options.timeout || 30000;
      const timeoutId = setTimeout(() => {
        proc.kill();
        resolve({
          success: false,
          output,
          errors: ['Command timed out after ' + timeout + 'ms'],
          duration: Date.now() - startTime
        });
      }, timeout);

      proc.stdout?.on('data', (data) => {
        const text = data.toString();
        output.push(text);
        process.stdout.write(text);
      });

      proc.stderr?.on('data', (data) => {
        const text = data.toString();
        errors.push(text);
        process.stderr.write(text);
      });

      proc.on('close', (code) => {
        clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          output,
          errors,
          duration: Date.now() - startTime
        });
      });

      proc.on('error', (error) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          output,
          errors: [error.message],
          duration: Date.now() - startTime
        });
      });
    });
  }
}

// Run
const migration = new DatabaseMigration();
migration.run().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
