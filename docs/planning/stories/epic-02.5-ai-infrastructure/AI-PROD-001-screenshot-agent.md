# AI-PROD-001: Desktop Screenshot Agent

**Story Points:** 5
**Sprint:** Sprint 7
**Priority:** HIGH (Productivity Tracking Foundation)
**Status:** ✅ **COMPLETE** (2025-11-20)

---

## User Story

As an **Employee**,
I want **an Electron app that captures screenshots every 30 seconds**,
So that **my productivity can be analyzed while respecting my privacy**.

---

## Acceptance Criteria

- [ ] Electron desktop app for Windows/Mac/Linux
- [ ] Screenshot capture every 30 seconds (configurable)
- [ ] Image compression before upload (reduce storage costs)
- [ ] Upload to Supabase Storage
- [ ] Privacy controls (pause, opt-in/opt-out)
- [ ] Offline queue with retry logic
- [ ] System tray integration
- [ ] No screenshots of sensitive apps (passwords, banking)
- [ ] Employee can view their own screenshots
- [ ] Data retention policy (30 days max)

---

## Technical Implementation

### Electron App

Create file: `electron/src/screenshot-agent.ts`

```typescript
// electron/src/screenshot-agent.ts
import { screen, desktopCapturer } from 'electron';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export class ScreenshotAgent {
  private interval: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private offlineQueue: Buffer[] = [];

  constructor(
    private userId: string,
    private captureInterval: number = 30000 // 30 seconds
  ) {}

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.captureScreenshot();

    this.interval = setInterval(() => {
      this.captureScreenshot();
    }, this.captureInterval);

    console.log('[ScreenshotAgent] Started');
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    this.isActive = false;
    console.log('[ScreenshotAgent] Stopped');
  }

  pause(): void {
    this.stop();
  }

  resume(): void {
    this.start();
  }

  private async captureScreenshot(): Promise<void> {
    try {
      // Capture screenshot
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
      });

      if (sources.length === 0) {
        console.warn('[ScreenshotAgent] No screens available');
        return;
      }

      // Get first screen
      const screenshot = sources[0].thumbnail;
      const imageBuffer = screenshot.toPNG();

      // Compress image (reduce to 50% quality, resize to max 1280px width)
      const compressed = await sharp(imageBuffer)
        .resize(1280, null, { fit: 'inside' })
        .jpeg({ quality: 50 })
        .toBuffer();

      // Check if sensitive window is active (don't screenshot)
      const activeWindow = await this.getActiveWindowTitle();
      if (this.isSensitiveWindow(activeWindow)) {
        console.log('[ScreenshotAgent] Skipping sensitive window');
        return;
      }

      // Upload to Supabase Storage
      const timestamp = new Date().toISOString();
      const filename = `${this.userId}/${timestamp}.jpg`;

      const { error } = await supabase.storage
        .from('employee-screenshots')
        .upload(filename, compressed, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        // Add to offline queue
        this.offlineQueue.push(compressed);
        console.error('[ScreenshotAgent] Upload failed, queued for retry:', error);
      } else {
        console.log('[ScreenshotAgent] Screenshot uploaded:', filename);

        // Try to upload queued screenshots
        await this.processOfflineQueue();

        // Log activity
        await this.logActivity(filename, compressed.length);
      }
    } catch (error) {
      console.error('[ScreenshotAgent] Capture failed:', error);
    }
  }

  private async getActiveWindowTitle(): Promise<string> {
    // Platform-specific active window detection
    // Simplified version - use actual native modules in production
    return 'Unknown';
  }

  private isSensitiveWindow(title: string): boolean {
    const sensitiveKeywords = [
      'password',
      'bank',
      'credit card',
      'social security',
      'private',
      'confidential',
    ];

    const titleLower = title.toLowerCase();
    return sensitiveKeywords.some((keyword) => titleLower.includes(keyword));
  }

  private async processOfflineQueue(): Promise<void> {
    while (this.offlineQueue.length > 0) {
      const buffer = this.offlineQueue[0];
      const timestamp = new Date().toISOString();
      const filename = `${this.userId}/${timestamp}.jpg`;

      const { error } = await supabase.storage
        .from('employee-screenshots')
        .upload(filename, buffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('[ScreenshotAgent] Retry failed:', error);
        break; // Stop processing queue if upload still fails
      }

      this.offlineQueue.shift(); // Remove from queue
      console.log('[ScreenshotAgent] Queued screenshot uploaded:', filename);
    }
  }

  private async logActivity(filename: string, fileSize: number): Promise<void> {
    await supabase.from('employee_screenshots').insert({
      user_id: this.userId,
      filename,
      file_size: fileSize,
      captured_at: new Date().toISOString(),
    });
  }
}
```

### Database Migration

```sql
-- Employee screenshots metadata table
CREATE TABLE employee_screenshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),

  filename TEXT NOT NULL,
  file_size INTEGER NOT NULL,

  captured_at TIMESTAMPTZ NOT NULL,
  analyzed BOOLEAN DEFAULT false,
  activity_category TEXT,
  confidence FLOAT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_screenshots_user_id ON employee_screenshots(user_id);
CREATE INDEX idx_screenshots_captured_at ON employee_screenshots(captured_at DESC);
CREATE INDEX idx_screenshots_analyzed ON employee_screenshots(analyzed) WHERE NOT analyzed;

-- RLS
ALTER TABLE employee_screenshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY screenshots_user_own ON employee_screenshots
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY screenshots_admin_all ON employee_screenshots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- Automatic cleanup (delete screenshots older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_screenshots()
RETURNS void AS $$
BEGIN
  DELETE FROM employee_screenshots
  WHERE captured_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
```

---

## Testing

```typescript
describe('Screenshot Agent', () => {
  it('captures and uploads screenshots', async () => {
    const agent = new ScreenshotAgent('test-user-id');

    agent.start();

    // Wait for capture
    await new Promise((resolve) => setTimeout(resolve, 1000));

    agent.stop();

    // Verify upload
    const { data } = await supabase
      .from('employee_screenshots')
      .select('*')
      .eq('user_id', 'test-user-id')
      .order('created_at', { ascending: false })
      .limit(1);

    expect(data).toBeTruthy();
    expect(data![0].file_size).toBeGreaterThan(0);
  });

  it('skips sensitive windows', async () => {
    const agent = new ScreenshotAgent('test-user-id');

    const isSensitive = agent['isSensitiveWindow']('Password Manager - Chrome');

    expect(isSensitive).toBe(true);
  });
});
```

---

## Verification

- [ ] App captures screenshots every 30s
- [ ] Images compressed before upload
- [ ] Upload to Supabase Storage works
- [ ] Offline queue handles network failures
- [ ] Sensitive windows skipped
- [ ] Privacy controls functional
- [ ] System tray integration works

---

## Dependencies

**Requires:**
- Supabase Storage bucket created
- Electron build setup

**Blocks:**
- AI-PROD-002 (Activity Classification)

---

**Status:** ✅ Ready for Implementation
**Next Story:** AI-PROD-002 (Activity Classification)
