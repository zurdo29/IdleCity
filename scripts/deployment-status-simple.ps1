# Simple Deployment Status Script for IdleCity (Windows PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command = "status"
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Main logic
if ($Command.ToLower() -eq "status") {
    Write-Host "ℹ️  INFO: Checking deployment status..." -ForegroundColor Blue
    
    Write-Host ""
    Write-Host "🚀 IdleCity Deployment Status" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    
    # Check if main files exist
    $requiredFiles = @(
        "index.html",
        "js\game.js",
        "js\ui.js",
        "js\storage.js",
        "js\achievements.js",
        "js\statistics.js",
        "css\styles.css"
    )
    
    Write-Host ""
    Write-Host "📁 File Status:" -ForegroundColor Yellow
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $ProjectRoot $file
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            Write-Host "  ✅ $file ($size bytes)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✅ SUCCESS: Status check completed" -ForegroundColor Green

} elseif ($Command.ToLower() -in @("help", "--help", "-h")) {
    Write-Host "IdleCity Deployment Status Script (Windows PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deployment-status-simple.ps1 [command]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  status          Show current deployment status" -ForegroundColor White
    Write-Host "  help            Show this help message" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  WARNING: Unknown command: $Command" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "IdleCity Deployment Status Script (Windows PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deployment-status-simple.ps1 [command]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  status          Show current deployment status" -ForegroundColor White
    Write-Host "  help            Show this help message" -ForegroundColor White
    Write-Host ""
}