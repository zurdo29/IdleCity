# IdleCity Deployment Status Script (Windows PowerShell)
# Based on official Microsoft PowerShell documentation patterns

param(
    [Parameter(Position=0)]
    [string]$Command = "status",
    
    [string]$Url = "",
    [int]$Timeout = 30,
    [int]$Retries = 5
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    Write-Host "$Prefix$Message" -ForegroundColor $Color
}

function Show-DeploymentStatus {
    Write-ColorMessage "INFO: Checking deployment status..." "Blue" "* "
    Write-Host ""
    Write-ColorMessage "IdleCity Deployment Status" "Cyan"
    Write-ColorMessage "=============================" "Cyan"
    
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
    Write-ColorMessage "File Status:" "Yellow"
    
    $allFilesExist = $true
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $ProjectRoot $file
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            Write-ColorMessage "  OK $file ($size bytes)" "Green"
        } else {
            Write-ColorMessage "  MISSING $file" "Red"
            $allFilesExist = $false
        }
    }
    
    Write-Host ""
    if ($allFilesExist) {
        Write-ColorMessage "SUCCESS: All required files present" "Green" "* "
    } else {
        Write-ColorMessage "WARNING: Some files are missing" "Yellow" "* "
    }
}

function Show-Help {
    Write-ColorMessage "IdleCity Deployment Status Script (Windows PowerShell)" "Cyan"
    Write-Host ""
    Write-Host "Usage: .\deployment-status-working.ps1 [command] [options]"
    Write-Host ""
    Write-ColorMessage "Commands:" "Yellow"
    Write-Host "  status          Show current deployment status"
    Write-Host "  help            Show this help message"
    Write-Host ""
    Write-ColorMessage "Options:" "Yellow"
    Write-Host "  -Url [url]      Specify deployment URL"
    Write-Host "  -Timeout [s]    Set timeout in seconds (default: 30)"
    Write-Host "  -Retries [n]    Set number of retries (default: 5)"
    Write-Host ""
}

function Test-DeploymentUrl {
    param([string]$TestUrl)
    
    if (-not $TestUrl) {
        Write-ColorMessage "ERROR: URL required for testing" "Red" "* "
        return $false
    }
    
    Write-ColorMessage "INFO: Testing deployment URL: $TestUrl" "Blue" "* "
    
    try {
        $response = Invoke-WebRequest -Uri $TestUrl -TimeoutSec $Timeout -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-ColorMessage "SUCCESS: URL is accessible (Status: $($response.StatusCode))" "Green" "* "
            return $true
        } else {
            Write-ColorMessage "WARNING: URL returned status: $($response.StatusCode)" "Yellow" "* "
            return $false
        }
    }
    catch {
        Write-ColorMessage "ERROR: Failed to access URL - $($_.Exception.Message)" "Red" "* "
        return $false
    }
}

# Main execution logic
switch ($Command.ToLower()) {
    "status" {
        Show-DeploymentStatus
        if ($Url) {
            Write-Host ""
            Test-DeploymentUrl -TestUrl $Url
        }
    }
    { $_ -in @("help", "--help", "-h") } {
        Show-Help
    }
    default {
        Write-ColorMessage "WARNING: Unknown command: $Command" "Yellow" "* "
        Write-Host ""
        Show-Help
    }
}