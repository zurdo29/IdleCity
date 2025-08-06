# Deployment Status and Rollback Script for IdleCity (Windows PowerShell)

param(
    [Parameter(Position=0)]
    [string]$Command = "status",
    
    [switch]$Verbose,
    [string]$Url = "",
    [int]$Timeout = 30,
    [int]$Retries = 5
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$LogFile = Join-Path $ProjectRoot "deployment.log"
$StatusFile = Join-Path $ProjectRoot ".deployment-status"

# Colors for output (using Write-Host with colors)
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    $logMessage = "$timestamp - $Prefix$Message"
    
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $LogFile -Value $logMessage
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput -Message "ℹ️  INFO: $Message" -Color "Blue" -Prefix ""
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput -Message "✅ SUCCESS: $Message" -Color "Green" -Prefix ""
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput -Message "⚠️  WARNING: $Message" -Color "Yellow" -Prefix ""
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput -Message "❌ ERROR: $Message" -Color "Red" -Prefix ""
}

function Show-Help {
    Write-Host "IdleCity Deployment Status Script (Windows PowerShell)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deployment-status.ps1 [command] [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  status          Show current deployment status" -ForegroundColor White
    Write-Host "  monitor [url]   Monitor deployment health" -ForegroundColor White
    Write-Host "  optimize        Optimize assets for deployment" -ForegroundColor White
    Write-Host "  deploy          Trigger manual deployment" -ForegroundColor White
    Write-Host "  logs            Show deployment logs" -ForegroundColor White
    Write-Host "  clean           Clean deployment artifacts" -ForegroundColor White
    Write-Host "  help            Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Verbose        Enable verbose output" -ForegroundColor White
    Write-Host "  -Url [url]      Specify deployment URL" -ForegroundColor White
    Write-Host "  -Timeout [s]    Set timeout in seconds (default: 30)" -ForegroundColor White
    Write-Host "  -Retries [n]    Set number of retries (default: 5)" -ForegroundColor White
    Write-Host ""
}

function Get-DeploymentStatus {
    if (Test-Path $StatusFile) {
        $content = Get-Content $StatusFile
        return $content[0]
    }
    return "unknown"
}

function Set-DeploymentStatus {
    param([string]$Status)
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    @($Status, $timestamp) | Out-File -FilePath $StatusFile -Encoding UTF8
}

function Show-Status {
    Write-Info "Checking deployment status..."
    
    $status = Get-DeploymentStatus
    $timestamp = ""
    
    if (Test-Path $StatusFile) {
        $content = Get-Content $StatusFile
        if ($content.Length -gt 1) {
            $timestamp = $content[1]
        }
    }
    
    Write-Host ""
    Write-Host "🚀 IdleCity Deployment Status" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    
    switch ($status) {
        "success" {
            Write-Success "Last deployment: SUCCESSFUL"
        }
        "failed" {
            Write-Error "Last deployment: FAILED"
        }
        "in-progress" {
            Write-Info "Deployment: IN PROGRESS"
        }
        default {
            Write-Warning "Deployment status: UNKNOWN"
        }
    }
    
    if ($timestamp) {
        Write-Host "Last update: $timestamp" -ForegroundColor White
    }
    
    Write-Host ""
    
    # Check if GitHub Actions workflow exists
    $workflowPath = Join-Path $ProjectRoot ".github\workflows\deploy.yml"
    if (Test-Path $workflowPath) {
        Write-Success "GitHub Actions workflow: CONFIGURED"
    } else {
        Write-Warning "GitHub Actions workflow: NOT FOUND"
    }
    
    # Check required files
    Write-Host ""
    Write-Host "📁 File Status:" -ForegroundColor Yellow
    
    $requiredFiles = @(
        "index.html",
        "js\game.js",
        "js\ui.js",
        "js\storage.js",
        "js\achievements.js",
        "js\statistics.js",
        "css\styles.css"
    )
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $ProjectRoot $file
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            Write-Host "  ✅ $file ($size bytes)" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        }
    }
}fu
nction Monitor-Deployment {
    param(
        [string]$Url,
        [int]$Timeout = 30,
        [int]$Retries = 5
    )
    
    if (-not $Url) {
        Write-Error "URL required for monitoring"
        exit 1
    }
    
    Write-Info "Starting deployment monitoring for: $Url"
    Write-Info "Timeout: ${Timeout}s, Retries: $Retries"
    
    # Check if Node.js monitor is available
    $nodeMonitor = Join-Path $ScriptDir "deploy-monitor.js"
    if ((Test-Path $nodeMonitor) -and (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Info "Using Node.js deployment monitor..."
        $timeoutMs = $Timeout * 1000
        & node $nodeMonitor $Url --timeout $timeoutMs --retries $Retries --verbose
    } else {
        # Fallback to PowerShell-based monitoring
        Write-Info "Using PowerShell-based monitoring..."
        
        for ($i = 1; $i -le $Retries; $i++) {
            Write-Info "Health check attempt $i/$Retries..."
            
            try {
                $response = Invoke-WebRequest -Uri $Url -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
                
                if ($response.StatusCode -eq 200) {
                    Write-Success "Health check passed"
                    
                    # Additional content check
                    if ($response.Content -match "IdleCity") {
                        Write-Success "Game content verified"
                        return $true
                    } else {
                        Write-Warning "Game content not found"
                    }
                } else {
                    Write-Warning "Health check failed with status: $($response.StatusCode)"
                }
            }
            catch {
                Write-Warning "Health check failed (attempt $i): $($_.Exception.Message)"
            }
            
            if ($i -lt $Retries) {
                Write-Info "Waiting 10 seconds before retry..."
                Start-Sleep -Seconds 10
            }
        }
        
        Write-Error "Monitoring failed after $Retries attempts"
        return $false
    }
}

function Optimize-Assets {
    Write-Info "Starting asset optimization..."
    
    $nodeOptimizer = Join-Path $ScriptDir "optimize-assets.js"
    if ((Test-Path $nodeOptimizer) -and (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Info "Using Node.js asset optimizer..."
        & node $nodeOptimizer --verbose
    } else {
        Write-Warning "Node.js optimizer not available, using basic optimization..."
        
        # Create dist directory
        $distDir = Join-Path $ProjectRoot "dist"
        if (-not (Test-Path $distDir)) {
            New-Item -ItemType Directory -Path $distDir -Force | Out-Null
        }
        
        # Copy files (excluding development directories)
        $excludeDirs = @(".git", ".github", "node_modules", "tests", ".kiro")
        
        Get-ChildItem -Path $ProjectRoot -Recurse | Where-Object {
            $relativePath = $_.FullName.Substring($ProjectRoot.Length + 1)
            $shouldExclude = $false
            
            foreach ($excludeDir in $excludeDirs) {
                if ($relativePath.StartsWith($excludeDir)) {
                    $shouldExclude = $true
                    break
                }
            }
            
            return -not $shouldExclude
        } | ForEach-Object {
            $relativePath = $_.FullName.Substring($ProjectRoot.Length + 1)
            $destPath = Join-Path $distDir $relativePath
            
            if ($_.PSIsContainer) {
                if (-not (Test-Path $destPath)) {
                    New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                }
            } else {
                $destDir = Split-Path -Parent $destPath
                if (-not (Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
                Copy-Item -Path $_.FullName -Destination $destPath -Force
            }
        }
        
        Write-Success "Basic optimization completed"
    }
}

function Invoke-Deployment {
    Write-Info "Triggering manual deployment..."
    
    # Check if we're in a git repository
    if (-not (Test-Path (Join-Path $ProjectRoot ".git"))) {
        Write-Error "Not in a git repository"
        exit 1
    }
    
    # Check if GitHub CLI is available
    if (Get-Command gh -ErrorAction SilentlyContinue) {
        Write-Info "Using GitHub CLI to trigger workflow..."
        
        try {
            & gh workflow run deploy.yml
            Write-Success "Deployment workflow triggered"
            
            # Get repository URL for actions link
            $remoteUrl = & git config --get remote.origin.url
            if ($remoteUrl -match "github\.com[:/]([^.]+)") {
                $repoPath = $matches[1]
                Write-Info "Check status at: https://github.com/$repoPath/actions"
            }
        }
        catch {
            Write-Error "Failed to trigger workflow: $($_.Exception.Message)"
            exit 1
        }
    } else {
        Write-Warning "GitHub CLI not available"
        Write-Info "To trigger deployment manually:"
        Write-Info "1. Go to your repository on GitHub"
        Write-Info "2. Navigate to Actions tab"
        Write-Info "3. Select 'Deploy to GitHub Pages' workflow"
        Write-Info "4. Click 'Run workflow'"
    }
}

function Show-Logs {
    Write-Info "Showing deployment logs..."
    
    if (Test-Path $LogFile) {
        Write-Host ""
        Write-Host "📋 Recent Deployment Logs:" -ForegroundColor Yellow
        Write-Host "==========================" -ForegroundColor Yellow
        
        # Show last 50 lines
        $logs = Get-Content $LogFile | Select-Object -Last 50
        $logs | ForEach-Object { Write-Host $_ }
    } else {
        Write-Warning "No deployment logs found"
    }
}

function Clear-Artifacts {
    Write-Info "Cleaning deployment artifacts..."
    
    # Remove build artifacts
    $distDir = Join-Path $ProjectRoot "dist"
    $nodeModulesDir = Join-Path $ProjectRoot "node_modules"
    
    if (Test-Path $distDir) {
        Remove-Item -Path $distDir -Recurse -Force
        Write-Info "Removed dist directory"
    }
    
    if (Test-Path $nodeModulesDir) {
        Remove-Item -Path $nodeModulesDir -Recurse -Force
        Write-Info "Removed node_modules directory"
    }
    
    # Clean logs (keep last 100 lines)
    if (Test-Path $LogFile) {
        $logs = Get-Content $LogFile | Select-Object -Last 100
        $logs | Out-File -FilePath $LogFile -Encoding UTF8
        Write-Info "Cleaned deployment logs"
    }
    
    Write-Success "Cleanup completed"
}

# Main script logic
function Main {
    # Initialize log
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC"
    Add-Content -Path $LogFile -Value "$timestamp - Starting $Command"
    
    switch ($Command.ToLower()) {
        "status" {
            Show-Status
        }
        "monitor" {
            Monitor-Deployment -Url $Url -Timeout $Timeout -Retries $Retries
        }
        "optimize" {
            Optimize-Assets
        }
        "deploy" {
            Invoke-Deployment
        }
        "logs" {
            Show-Logs
        }
        "clean" {
            Clear-Artifacts
        }
        { $_ -in @("help", "--help", "-h") } {
            Show-Help
        }
        default {
            Write-Error "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }
}

# Run main function
Main
Main
Main