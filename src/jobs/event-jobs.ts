/**
 * Event Jobs
 *
 * Scheduled jobs for processing event-related tasks:
 * - Process notification queue
 * - Process webhook deliveries
 * - Retry failed deliveries
 *
 * In production, these would be triggered by a cron scheduler
 * (e.g., Vercel Cron, AWS EventBridge, or a dedicated job runner).
 *
 * @see docs/specs/20-USER-ROLES/01-ACTIVITIES-EVENTS-FRAMEWORK.md
 */

import { deliveryService } from '@/lib/events/DeliveryService';

// ============================================================================
// JOB FUNCTIONS
// ============================================================================

/**
 * Process notification queue
 *
 * Sends pending notifications to users via their preferred channels.
 * Should run every minute.
 *
 * @returns Result with counts of sent and failed notifications
 */
export async function processNotifications(): Promise<{
  sent: number;
  failed: number;
}> {
  console.log('[Notification Processor] Starting...');
  const startTime = Date.now();

  const result = await deliveryService.processPendingNotifications();

  const duration = Date.now() - startTime;
  console.log(
    `[Notification Processor] Complete in ${duration}ms. Sent: ${result.sent}, Failed: ${result.failed}`
  );

  return result;
}

/**
 * Process webhook deliveries
 *
 * Delivers pending webhooks to external endpoints.
 * Should run every minute.
 *
 * @returns Result with counts of delivered and failed webhooks
 */
export async function processWebhooks(): Promise<{
  delivered: number;
  failed: number;
}> {
  console.log('[Webhook Processor] Starting...');
  const startTime = Date.now();

  const result = await deliveryService.processPendingWebhooks();

  const duration = Date.now() - startTime;
  console.log(
    `[Webhook Processor] Complete in ${duration}ms. Delivered: ${result.delivered}, Failed: ${result.failed}`
  );

  return result;
}

/**
 * Retry failed deliveries
 *
 * Resets failed notifications and webhooks for retry.
 * Should run every hour.
 */
export async function retryFailedDeliveries(): Promise<void> {
  console.log('[Retry Processor] Starting...');
  const startTime = Date.now();

  await deliveryService.retryFailed();

  const duration = Date.now() - startTime;
  console.log(`[Retry Processor] Complete in ${duration}ms`);
}

/**
 * Get queue statistics
 *
 * Returns current queue statistics for monitoring.
 */
export function getQueueStats() {
  return deliveryService.getQueueStats();
}

// ============================================================================
// JOB RUNNER
// ============================================================================

interface JobConfig {
  name: string;
  handler: () => Promise<unknown>;
  intervalMs: number;
  enabled: boolean;
}

const DEFAULT_JOBS: JobConfig[] = [
  {
    name: 'processNotifications',
    handler: processNotifications,
    intervalMs: 60 * 1000, // Every minute
    enabled: true,
  },
  {
    name: 'processWebhooks',
    handler: processWebhooks,
    intervalMs: 60 * 1000, // Every minute
    enabled: true,
  },
  {
    name: 'retryFailedDeliveries',
    handler: retryFailedDeliveries,
    intervalMs: 60 * 60 * 1000, // Every hour
    enabled: true,
  },
];

const runningIntervals: Map<string, NodeJS.Timeout> = new Map();

/**
 * Start all event jobs
 *
 * Starts interval timers for each job.
 * Call this at application startup.
 */
export function startEventJobs(): void {
  console.log('[Event Jobs] Starting job runner...');

  for (const job of DEFAULT_JOBS) {
    if (!job.enabled) {
      console.log(`[Event Jobs] Job "${job.name}" is disabled, skipping`);
      continue;
    }

    // Run immediately
    job.handler().catch((error) => {
      console.error(`[Event Jobs] Job "${job.name}" failed:`, error);
    });

    // Schedule recurring runs
    const interval = setInterval(async () => {
      try {
        await job.handler();
      } catch (error) {
        console.error(`[Event Jobs] Job "${job.name}" failed:`, error);
      }
    }, job.intervalMs);

    runningIntervals.set(job.name, interval);
    console.log(
      `[Event Jobs] Started job "${job.name}" (interval: ${job.intervalMs}ms)`
    );
  }

  console.log(`[Event Jobs] Started ${DEFAULT_JOBS.filter((j) => j.enabled).length} jobs`);
}

/**
 * Stop all event jobs
 *
 * Clears all interval timers.
 * Call this on application shutdown.
 */
export function stopEventJobs(): void {
  console.log('[Event Jobs] Stopping job runner...');

  for (const [name, interval] of runningIntervals) {
    clearInterval(interval);
    console.log(`[Event Jobs] Stopped job "${name}"`);
  }

  runningIntervals.clear();
  console.log('[Event Jobs] All jobs stopped');
}

/**
 * Run a specific job manually
 *
 * Useful for testing or one-off processing.
 */
export async function runJob(jobName: string): Promise<unknown> {
  const job = DEFAULT_JOBS.find((j) => j.name === jobName);
  if (!job) {
    throw new Error(`Job "${jobName}" not found`);
  }

  console.log(`[Event Jobs] Running job "${jobName}" manually...`);
  return job.handler();
}

// ============================================================================
// SCHEDULER INTERFACE
// ============================================================================

/**
 * Register jobs with an external scheduler
 *
 * Use this to integrate with cron-based schedulers.
 *
 * @example
 * // With a cron library
 * registerEventJobs({
 *   schedule: (cronExpression, handler) => {
 *     cron.schedule(cronExpression, handler);
 *   }
 * });
 */
export function registerEventJobs(scheduler: {
  schedule: (cronExpression: string, handler: () => Promise<unknown>) => void;
}): void {
  scheduler.schedule('* * * * *', processNotifications); // Every minute
  scheduler.schedule('* * * * *', processWebhooks); // Every minute
  scheduler.schedule('0 * * * *', retryFailedDeliveries); // Every hour

  console.log('[Event Jobs] Registered jobs with external scheduler');
}
