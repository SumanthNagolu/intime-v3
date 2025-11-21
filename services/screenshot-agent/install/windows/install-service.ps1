# InTime Screenshot Agent - Windows Service Installation Script
# Run as Administrator

param(
    [string]$EmployeeId = $(Read-Host "Enter Employee ID"),
    [string]$SupabaseUrl = $(Read-Host "Enter Supabase URL"),
    [string]$SupabaseKey = $(Read-Host "Enter Supabase Service Key")
)

$ServiceName = "InTimeScreenshotAgent"
$DisplayName = "InTime Screenshot Agent"
$Description = "Employee screenshot capture for audit compliance"
$InstallPath = "C:\Program Files\InTime\ScreenshotAgent"
$NodePath = "C:\Program Files\nodejs\node.exe"

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

Write-Host "Installing InTime Screenshot Agent as Windows Service..." -ForegroundColor Green

# Create installation directory
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force
    Write-Host "Created installation directory: $InstallPath"
}

# Copy service files
Copy-Item -Path ".\*" -Destination $InstallPath -Recurse -Force
Write-Host "Copied service files to $InstallPath"

# Create .env file
$envContent = @"
SUPABASE_URL=$SupabaseUrl
SUPABASE_SERVICE_KEY=$SupabaseKey
EMPLOYEE_ID=$EmployeeId
CAPTURE_INTERVAL=30000
NODE_ENV=production
"@

$envContent | Out-File -FilePath "$InstallPath\.env" -Encoding utf8
Write-Host "Created .env configuration file"

# Install node-windows package globally if not installed
npm install -g node-windows

# Create Windows Service using node-windows
$serviceScript = @"
const Service = require('node-windows').Service;

const svc = new Service({
  name: '$ServiceName',
  description: '$Description',
  script: '$InstallPath\\dist\\index.js',
  nodeOptions: ['--max_old_space_size=4096'],
  workingDirectory: '$InstallPath',
  env: [
    {
      name: 'NODE_ENV',
      value: 'production'
    }
  ]
});

svc.on('install', function() {
  console.log('Service installed successfully');
  svc.start();
});

svc.on('alreadyinstalled', function() {
  console.log('Service already installed');
});

svc.on('start', function() {
  console.log('Service started');
});

svc.install();
"@

$serviceScript | Out-File -FilePath "$InstallPath\install-service.js" -Encoding utf8
node "$InstallPath\install-service.js"

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "Service Name: $ServiceName"
Write-Host "Display Name: $DisplayName"
Write-Host "Install Path: $InstallPath"
Write-Host ""
Write-Host "The service will start automatically and run in the background."
Write-Host "To manage the service, use Services.msc or PowerShell commands:"
Write-Host "  Get-Service $ServiceName"
Write-Host "  Stop-Service $ServiceName"
Write-Host "  Start-Service $ServiceName"
