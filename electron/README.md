# InTime Productivity Tracker - Electron Desktop App

**Epic:** 2.5 - AI Infrastructure (Sprint 4)
**Story:** AI-PROD-001 - Desktop Screenshot Agent
**Status:** 🚧 Documentation Only (Separate Project)

---

## Overview

The InTime Productivity Tracker is an **Electron desktop application** that captures screenshots every 30 seconds for productivity analysis. This is a **separate project** from the main InTime v3 web application.

### Key Features

- **Privacy-First Design**: Employees own their data; managers see aggregates only
- **Automatic Screenshot Capture**: Every 30 seconds (configurable)
- **Smart Compression**: Reduces to 1280px max width, 50% JPEG quality
- **Sensitive Window Detection**: Skips password managers, banking apps
- **Offline Queue**: Continues capturing when network is down, syncs later
- **System Tray Integration**: Minimizes to tray, pause/resume controls
- **Cross-Platform**: Windows, Mac, Linux support

---

## Architecture

```
electron/
├── src/
│   ├── main.ts                 # Electron main process
│   ├── preload.ts              # Preload script (IPC bridge)
│   ├── screenshot-agent.ts     # Screenshot capture logic
│   ├── storage-client.ts       # Supabase Storage integration
│   └── tray-manager.ts         # System tray integration
├── package.json                # Dependencies and scripts
├── electron-builder.json       # Build configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Technology Stack

- **Electron**: Desktop app framework
- **TypeScript**: Type-safe development
- **Sharp**: Image compression library
- **Supabase Client**: Storage and database integration
- **node-window-manager**: Active window detection (for sensitive window filtering)

---

## Installation & Setup

### Prerequisites

```bash
# Node.js 18+ required
node --version

# Install dependencies
npm install
```

### Dependencies

```json
{
  "dependencies": {
    "electron": "^28.0.0",
    "@supabase/supabase-js": "^2.38.0",
    "sharp": "^0.33.0",
    "node-window-manager": "^2.2.4"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "electron-builder": "^24.9.0",
    "@types/node": "^20.10.0"
  }
}
```

---

## Configuration

### Environment Variables

Create `.env` file in the electron root:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
```

### Screenshot Agent Config

```typescript
interface ScreenshotAgentConfig {
  userId: string;                   // User ID from authentication
  captureInterval: number;          // Default: 30000 (30s)
  compressionQuality: number;       // Default: 50 (0-100)
  maxWidth: number;                 // Default: 1280px
  sensitiveKeywords: string[];      // Window titles to skip
}
```

---

## Screenshot Agent Implementation

### Core Logic

```typescript
// electron/src/screenshot-agent.ts

import { screen, desktopCapturer } from 'electron';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export class ScreenshotAgent {
  private interval: NodeJS.Timeout | null = null;
  private isActive: boolean = false;
  private offlineQueue: Buffer[] = [];

  constructor(
    private userId: string,
    private captureInterval: number = 30000
  ) {}

  start(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.captureScreenshot();
    this.interval = setInterval(() => {
      this.captureScreenshot();
    }, this.captureInterval);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isActive = false;
  }

  private async captureScreenshot(): Promise<void> {
    try {
      // 1. Capture screenshot
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
      });

      if (sources.length === 0) return;

      const screenshot = sources[0].thumbnail;
      const imageBuffer = screenshot.toPNG();

      // 2. Compress image
      const compressed = await sharp(imageBuffer)
        .resize(1280, null, { fit: 'inside' })
        .jpeg({ quality: 50 })
        .toBuffer();

      // 3. Check if sensitive window is active
      const activeWindow = await this.getActiveWindowTitle();
      if (this.isSensitiveWindow(activeWindow)) {
        console.log('[ScreenshotAgent] Skipping sensitive window');
        return;
      }

      // 4. Upload to Supabase Storage
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
        console.error('[ScreenshotAgent] Upload failed, queued for retry');
      } else {
        console.log('[ScreenshotAgent] Screenshot uploaded:', filename);

        // Log to database
        await this.logActivity(filename, compressed.length);

        // Try to upload queued screenshots
        await this.processOfflineQueue();
      }
    } catch (error) {
      console.error('[ScreenshotAgent] Capture failed:', error);
    }
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
        break; // Stop processing if upload still fails
      }

      this.offlineQueue.shift();
      console.log('[ScreenshotAgent] Queued screenshot uploaded');
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

---

## System Tray Integration

```typescript
// electron/src/tray-manager.ts

import { Tray, Menu } from 'electron';
import path from 'path';

export class TrayManager {
  private tray: Tray | null = null;

  constructor(private agent: ScreenshotAgent) {}

  create(): void {
    this.tray = new Tray(path.join(__dirname, 'assets/icon.png'));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Pause Tracking',
        click: () => {
          this.agent.stop();
        },
      },
      {
        label: 'Resume Tracking',
        click: () => {
          this.agent.start();
        },
      },
      { type: 'separator' },
      {
        label: 'Settings',
        click: () => {
          // Open settings window
        },
      },
      {
        label: 'View Screenshots',
        click: () => {
          // Open web dashboard
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        },
      },
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('InTime Productivity Tracker');
  }
}
```

---

## Build & Distribution

### Build Configuration

```json
// electron-builder.json
{
  "appId": "com.intimeesolutions.productivity-tracker",
  "productName": "InTime Productivity Tracker",
  "directories": {
    "output": "dist-electron"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "target": ["dmg", "zip"],
    "icon": "assets/icon.icns"
  },
  "win": {
    "target": ["nsis", "portable"],
    "icon": "assets/icon.ico"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "assets/icon.png"
  }
}
```

### Build Scripts

```json
{
  "scripts": {
    "dev": "electron .",
    "build": "tsc && electron-builder",
    "build:mac": "tsc && electron-builder --mac",
    "build:win": "tsc && electron-builder --win",
    "build:linux": "tsc && electron-builder --linux"
  }
}
```

---

## Privacy & Security

### Data Ownership

- **Employees own their data**: Full control over screenshots
- **Managers see aggregates only**: No access to raw screenshots
- **30-day retention policy**: Auto-delete after 30 days
- **RLS enforcement**: Database-level privacy controls

### Sensitive Content Detection

```typescript
const sensitiveKeywords = [
  'password',
  'bank',
  'credit card',
  'social security',
  'private',
  'confidential',
  '1password',
  'lastpass',
  'bitwarden',
];
```

### User Controls

- **Pause tracking**: Stop capturing anytime
- **Resume tracking**: Start capturing again
- **View screenshots**: Access via web dashboard
- **Delete screenshots**: Soft delete via web dashboard
- **Export data**: Download all screenshots (GDPR compliance)

---

## Auto-Update Strategy

### Electron Updater

```typescript
// electron/src/auto-updater.ts

import { autoUpdater } from 'electron-updater';

export function setupAutoUpdater() {
  // Check for updates on app launch
  autoUpdater.checkForUpdatesAndNotify();

  // Check every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 4 * 60 * 60 * 1000);

  autoUpdater.on('update-available', () => {
    console.log('Update available - downloading...');
  });

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version is ready. Restart to update?',
      buttons: ['Restart', 'Later'],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}
```

---

## Testing

### Unit Tests

```typescript
// electron/tests/screenshot-agent.test.ts

import { ScreenshotAgent } from '../src/screenshot-agent';

describe('ScreenshotAgent', () => {
  it('detects sensitive windows', () => {
    const agent = new ScreenshotAgent('test-user-id');

    expect(agent['isSensitiveWindow']('Password Manager - Chrome')).toBe(true);
    expect(agent['isSensitiveWindow']('VS Code - main.ts')).toBe(false);
  });

  it('compresses images correctly', async () => {
    // Test image compression logic
  });

  it('handles offline queue', async () => {
    // Test offline queue processing
  });
});
```

---

## Performance Considerations

### Resource Usage

- **CPU**: <5% average (during capture)
- **Memory**: ~100MB typical
- **Disk**: Minimal (compressed images ~50KB each)
- **Network**: ~2KB/s average upload

### Optimization Tips

1. **Capture interval**: Increase to 60s if performance is an issue
2. **Compression quality**: Reduce to 30% for smaller files
3. **Max width**: Reduce to 800px for even smaller files
4. **Offline queue limit**: Cap at 100 screenshots (prevent memory issues)

---

## Deployment

### Distribution Channels

1. **Internal Download Portal**: Authenticated download from InTime dashboard
2. **Direct Download Links**: Sent via email to employees
3. **MDM Deployment**: Company-wide deployment via Mobile Device Management

### Installation Instructions

```bash
# macOS
1. Download InTime-Productivity-Tracker.dmg
2. Drag to Applications folder
3. Launch and sign in with InTime credentials

# Windows
1. Download InTime-Productivity-Tracker-Setup.exe
2. Run installer (requires admin rights)
3. Launch and sign in with InTime credentials

# Linux
1. Download InTime-Productivity-Tracker.AppImage
2. Make executable: chmod +x InTime-Productivity-Tracker.AppImage
3. Run: ./InTime-Productivity-Tracker.AppImage
```

---

## Integration with Web App

### Authentication Flow

```typescript
// electron/src/auth.ts

import { createClient } from '@supabase/supabase-js';

export async function authenticateUser() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  // Open browser for OAuth login
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  if (error) {
    console.error('Authentication failed:', error);
    return null;
  }

  return data.session;
}
```

### Data Sync

- **Real-time**: Screenshots uploaded immediately
- **Metadata logging**: Database record created on upload
- **Offline sync**: Queue processed when network available
- **Web dashboard**: View screenshots and reports at `app.intime.com/productivity`

---

## Troubleshooting

### Common Issues

**Issue**: Screenshots not uploading
**Solution**: Check network connection, verify Supabase credentials

**Issue**: High CPU usage
**Solution**: Increase capture interval to 60s

**Issue**: App not starting
**Solution**: Check logs at:
- macOS: `~/Library/Logs/InTime/`
- Windows: `%APPDATA%\InTime\logs\`
- Linux: `~/.config/InTime/logs/`

---

## Future Enhancements

- [ ] Activity detection (keyboard/mouse events)
- [ ] Focus time tracking (window titles)
- [ ] Break reminders (Pomodoro technique)
- [ ] Task tagging (manual categorization)
- [ ] Browser extension fallback (for remote workers)

---

## Development Status

**Current Status**: Documentation complete, implementation pending

**Next Steps**:
1. Set up Electron project structure
2. Implement screenshot capture logic
3. Test on all platforms (Mac, Windows, Linux)
4. Create installers with electron-builder
5. Beta test with 10 employees
6. Roll out company-wide

---

## Support

For development support, contact:
- **Technical Lead**: [Your Name]
- **Documentation**: This file + story docs in `/docs/planning/stories/epic-02.5-ai-infrastructure/AI-PROD-001-screenshot-agent.md`
- **Architecture**: See `/docs/planning/SPRINT-4-ARCHITECTURE.md`

---

**Last Updated**: 2025-11-19
**Version**: 1.0 (Documentation)
**Maintainer**: InTime Development Team
