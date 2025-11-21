# InTime Screenshot Agent

Background service for employee screenshot capture (audit & compliance).

## Overview

Mandatory desktop service that captures screenshots every 30 seconds for audit and productivity analysis. Runs automatically on system boot.

## Features

- ✅ Auto-start on system boot
- ✅ Runs continuously in background
- ✅ Screenshot capture every 30 seconds (configurable)
- ✅ Image compression (50% quality, max 1280px width)
- ✅ Automatic upload to Supabase Storage
- ✅ Offline queue with retry logic
- ✅ Cross-platform (Windows, macOS, Linux)

## Installation

### Prerequisites

- Node.js 20+ installed
- Supabase project configured
- Employee ID assigned

### Linux (systemd)

```bash
# Build the service
cd services/screenshot-agent
pnpm install
pnpm build

# Install to system
sudo mkdir -p /opt/intime/screenshot-agent
sudo cp -r dist package.json node_modules /opt/intime/screenshot-agent/

# Create .env file
sudo nano /opt/intime/screenshot-agent/.env
# Add:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your-service-key
# EMPLOYEE_ID=uuid-here
# CAPTURE_INTERVAL=30000

# Install systemd service
sudo cp install/systemd/intime-screenshot-agent.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable intime-screenshot-agent
sudo systemctl start intime-screenshot-agent

# Check status
sudo systemctl status intime-screenshot-agent
sudo journalctl -u intime-screenshot-agent -f
```

### macOS (launchd)

```bash
# Build the service
cd services/screenshot-agent
pnpm install
pnpm build

# Install to Applications
sudo mkdir -p /Applications/InTime/screenshot-agent
sudo cp -r dist package.json node_modules /Applications/InTime/screenshot-agent/

# Create .env file
sudo nano /Applications/InTime/screenshot-agent/.env
# Add environment variables (same as Linux)

# Install launchd daemon
sudo cp install/launchd/com.intime.screenshot-agent.plist /Library/LaunchDaemons/
sudo launchctl load /Library/LaunchDaemons/com.intime.screenshot-agent.plist

# Check status
sudo launchctl list | grep intime
tail -f /var/log/intime-screenshot-agent.log
```

### Windows (Windows Service)

```powershell
# Run PowerShell as Administrator

# Install node-windows globally
npm install -g node-windows

# Run installation script
cd services\screenshot-agent
pnpm install
pnpm build

# Run installer (will prompt for credentials)
.\install\windows\install-service.ps1

# Check service status
Get-Service InTimeScreenshotAgent
```

## Configuration

Environment variables (`.env` file):

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
EMPLOYEE_ID=uuid-of-employee
CAPTURE_INTERVAL=30000  # 30 seconds (in milliseconds)
```

## Uninstallation

### Linux
```bash
sudo systemctl stop intime-screenshot-agent
sudo systemctl disable intime-screenshot-agent
sudo rm /etc/systemd/system/intime-screenshot-agent.service
sudo rm -rf /opt/intime/screenshot-agent
sudo systemctl daemon-reload
```

### macOS
```bash
sudo launchctl unload /Library/LaunchDaemons/com.intime.screenshot-agent.plist
sudo rm /Library/LaunchDaemons/com.intime.screenshot-agent.plist
sudo rm -rf /Applications/InTime/screenshot-agent
```

### Windows
```powershell
# Run as Administrator
Stop-Service InTimeScreenshotAgent
sc.exe delete InTimeScreenshotAgent
Remove-Item "C:\Program Files\InTime\ScreenshotAgent" -Recurse -Force
```

## Monitoring

### View Logs

**Linux:**
```bash
sudo journalctl -u intime-screenshot-agent -f
```

**macOS:**
```bash
tail -f /var/log/intime-screenshot-agent.log
tail -f /var/log/intime-screenshot-agent.error.log
```

**Windows:**
```powershell
Get-EventLog -LogName Application -Source "InTimeScreenshotAgent" -Newest 50
```

## Troubleshooting

### Service not starting

1. Check environment variables are set correctly
2. Verify Supabase URL and Service Key
3. Ensure Employee ID exists in `user_profiles` table
4. Check logs for error messages

### Screenshots not uploading

1. Verify Supabase Storage bucket `employee-screenshots` exists
2. Check network connectivity
3. Verify service role key has storage permissions
4. Check offline queue in logs

### High resource usage

1. Increase capture interval (default 30s → 60s)
2. Reduce image quality in `src/index.ts`
3. Check offline queue size (may be accumulating)

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build

# Test locally
pnpm start
```

## Security

- Service uses Supabase Service Role Key (stored in `.env`)
- Screenshots uploaded to private Supabase Storage bucket
- Row Level Security policies restrict access
- 90-day retention policy (auto-cleanup)

## Compliance

This service is designed for **audit and compliance** purposes in office environments. Ensure compliance with local laws and regulations before deployment.

## Story

- **ID:** AI-PROD-001
- **Sprint:** Sprint 7
- **Epic:** Epic 2.5 - AI Infrastructure
