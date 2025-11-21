/**
 * InTime Screenshot Agent - Background Service
 *
 * Mandatory audit/compliance tool that captures screenshots every 30 seconds.
 * Runs as a background service on office desktops.
 *
 * @story AI-PROD-001
 */

import { createClient } from '@supabase/supabase-js';
import screenshot from 'screenshot-desktop';
import sharp from 'sharp';
import { hostname, platform } from 'os';
import { machineId } from 'node-machine-id';
import { config } from 'dotenv';

// Load environment variables
config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const EMPLOYEE_ID = process.env.EMPLOYEE_ID!; // Set during installation
const CAPTURE_INTERVAL = parseInt(process.env.CAPTURE_INTERVAL || '30000'); // 30 seconds

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !EMPLOYEE_ID) {
  console.error('[ScreenshotAgent] Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

class ScreenshotAgent {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private offlineQueue: Buffer[] = [];
  private machineId: string = '';
  private machineName: string = hostname();
  private osType: string = platform();

  async initialize(): Promise<void> {
    try {
      this.machineId = await machineId();
      console.log('[ScreenshotAgent] Initialized');
      console.log(`  Machine: ${this.machineName}`);
      console.log(`  OS: ${this.osType}`);
      console.log(`  Employee ID: ${EMPLOYEE_ID}`);
      console.log(`  Capture Interval: ${CAPTURE_INTERVAL}ms`);
    } catch (error) {
      console.error('[ScreenshotAgent] Initialization failed:', error);
      throw error;
    }
  }

  start(): void {
    if (this.isRunning) {
      console.warn('[ScreenshotAgent] Already running');
      return;
    }

    this.isRunning = true;
    console.log('[ScreenshotAgent] Starting...');

    // Capture immediately
    this.captureScreenshot();

    // Then capture at intervals
    this.interval = setInterval(() => {
      this.captureScreenshot();
    }, CAPTURE_INTERVAL);

    console.log('[ScreenshotAgent] Started successfully');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isRunning = false;
    console.log('[ScreenshotAgent] Stopped');
  }

  private async captureScreenshot(): Promise<void> {
    try {
      const timestamp = new Date();
      console.log(`[ScreenshotAgent] Capturing screenshot at ${timestamp.toISOString()}`);

      // Capture screenshot (all screens)
      const img = await screenshot({ format: 'png' });

      // Compress image (reduce to 50% quality, max 1280px width)
      const compressed = await sharp(img)
        .resize(1280, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 50 })
        .toBuffer();

      const fileSize = compressed.length;
      const filename = `${EMPLOYEE_ID}/${timestamp.toISOString().replace(/:/g, '-')}.jpg`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('employee-screenshots')
        .upload(filename, compressed, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) {
        console.error('[ScreenshotAgent] Upload failed:', uploadError.message);

        // Add to offline queue (max 100 screenshots = ~50MB)
        if (this.offlineQueue.length < 100) {
          this.offlineQueue.push(compressed);
          console.log(`[ScreenshotAgent] Queued for retry (queue size: ${this.offlineQueue.length})`);
        } else {
          console.warn('[ScreenshotAgent] Offline queue full, dropping screenshot');
        }
        return;
      }

      console.log(`[ScreenshotAgent] Uploaded: ${filename} (${(fileSize / 1024).toFixed(1)} KB)`);

      // Log metadata to database
      await this.logScreenshot(filename, fileSize, timestamp);

      // Process offline queue if any
      if (this.offlineQueue.length > 0) {
        await this.processOfflineQueue();
      }

    } catch (error) {
      console.error('[ScreenshotAgent] Capture failed:', error);
    }
  }

  private async logScreenshot(
    filename: string,
    fileSize: number,
    capturedAt: Date
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('employee_screenshots')
        .insert({
          user_id: EMPLOYEE_ID,
          filename,
          file_size: fileSize,
          captured_at: capturedAt.toISOString(),
          machine_name: this.machineName,
          os_type: this.osType,
          active_window_title: 'Unknown', // TODO: Get active window title
        });

      if (error) {
        console.error('[ScreenshotAgent] Database insert failed:', error.message);
      }
    } catch (error) {
      console.error('[ScreenshotAgent] Log failed:', error);
    }
  }

  private async processOfflineQueue(): Promise<void> {
    console.log(`[ScreenshotAgent] Processing offline queue (${this.offlineQueue.length} items)`);

    while (this.offlineQueue.length > 0) {
      const buffer = this.offlineQueue[0];
      const timestamp = new Date();
      const filename = `${EMPLOYEE_ID}/${timestamp.toISOString().replace(/:/g, '-')}.jpg`;

      const { error } = await supabase.storage
        .from('employee-screenshots')
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('[ScreenshotAgent] Queue upload failed:', error.message);
        break; // Stop processing if upload still fails
      }

      // Remove from queue
      this.offlineQueue.shift();
      await this.logScreenshot(filename, buffer.length, timestamp);

      console.log(`[ScreenshotAgent] Queue upload success (${this.offlineQueue.length} remaining)`);
    }
  }
}

// Main execution
const agent = new ScreenshotAgent();

async function main() {
  try {
    await agent.initialize();
    agent.start();

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[ScreenshotAgent] Received SIGTERM');
      agent.stop();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('[ScreenshotAgent] Received SIGINT');
      agent.stop();
      process.exit(0);
    });

    console.log('[ScreenshotAgent] Service running. Press Ctrl+C to stop.');
  } catch (error) {
    console.error('[ScreenshotAgent] Fatal error:', error);
    process.exit(1);
  }
}

main();
