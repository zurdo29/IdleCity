#!/bin/bash

# IdleCity Deployment Status Script
# Provides deployment status and monitoring capabilities

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/deployment.log"
STATUS_FILE="$PROJECT_ROOT/.deployment-status"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}ℹ️  INFO: ${1}${NC}"
}

log_success() {
    log "${GREEN}✅ SUCCESS: ${1}${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  WARNING: ${1}${NC}"
}

log_error() {
    log "${RED}❌ ERROR: ${1}${NC}"
}

show_help() {
    echo "IdleCity Deployment Status Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  status          Show current deployment status"
    echo "  monitor <url>   Monitor deployment health"
    echo "  optimize        Optimize assets for deployment"
    echo "  deploy          Trigger manual deployment"
    echo "  logs            Show deployment logs"
    echo "  clean           Clean deployment artifacts"
    echo "  help            Show this help message"
    echo ""
    echo "Options:"
    echo "  --verbose       Enable verbose output"
    echo "  --url <url>     Specify deployment URL"
    echo "  --timeout <s>   Set timeout in seconds (default: 30)"
    echo "  --retries <n>   Set number of retries (default: 5)"
    echo ""
}

get_deployment_status() {
    if [ -f "$STATUS_FILE" ]; then
        cat "$STATUS_FILE"
    else
        echo "unknown"
    fi
}

set_deployment_status() {
    echo "$1" > "$STATUS_FILE"
    echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$STATUS_FILE"
}

show_status() {
    log_info "Checking deployment status..."
    
    local status=$(get_deployment_status)
    local timestamp=""
    
    if [ -f "$STATUS_FILE" ]; then
        timestamp=$(tail -n 1 "$STATUS_FILE")
    fi
    
    echo ""
    echo "🚀 IdleCity Deployment Status"
    echo "============================="
    
    case "$status" in
        "success")
            log_success "Last deployment: SUCCESSFUL"
            ;;
        "failed")
            log_error "Last deployment: FAILED"
            ;;
        "in-progress")
            log_info "Deployment: IN PROGRESS"
            ;;
        *)
            log_warning "Deployment status: UNKNOWN"
            ;;
    esac
    
    if [ -n "$timestamp" ]; then
        echo "Last update: $timestamp"
    fi
    
    echo ""
    
    # Check if GitHub Actions workflow exists
    if [ -f "$PROJECT_ROOT/.github/workflows/deploy.yml" ]; then
        log_success "GitHub Actions workflow: CONFIGURED"
    else
        log_warning "GitHub Actions workflow: NOT FOUND"
    fi
    
    # Check required files
    echo ""
    echo "📁 File Status:"
    
    required_files=(
        "index.html"
        "js/game.js"
        "js/ui.js"
        "js/storage.js"
        "js/achievements.js"
        "js/statistics.js"
        "css/styles.css"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            size=$(stat -c%s "$PROJECT_ROOT/$file" 2>/dev/null || stat -f%z "$PROJECT_ROOT/$file" 2>/dev/null || echo "0")
            echo "  ✅ $file ($size bytes)"
        else
            echo "  ❌ $file (missing)"
        fi
    done
}

monitor_deployment() {
    local url="$1"
    local timeout="${2:-30}"
    local retries="${3:-5}"
    
    if [ -z "$url" ]; then
        log_error "URL required for monitoring"
        exit 1
    fi
    
    log_info "Starting deployment monitoring for: $url"
    log_info "Timeout: ${timeout}s, Retries: $retries"
    
    # Use Node.js monitor if available
    if [ -f "$SCRIPT_DIR/deploy-monitor.js" ] && command -v node >/dev/null 2>&1; then
        log_info "Using Node.js deployment monitor..."
        node "$SCRIPT_DIR/deploy-monitor.js" "$url" --timeout $((timeout * 1000)) --retries "$retries" --verbose
    else
        # Fallback to curl-based monitoring
        log_info "Using curl-based monitoring..."
        
        for i in $(seq 1 "$retries"); do
            log_info "Health check attempt $i/$retries..."
            
            if curl -f -s -m "$timeout" "$url" > /dev/null; then
                log_success "Health check passed"
                
                # Additional content check
                content=$(curl -s -m "$timeout" "$url" 2>/dev/null || echo "")
                
                if echo "$content" | grep -q "IdleCity"; then
                    log_success "Game content verified"
                    return 0
                else
                    log_warning "Game content not found"
                fi
            else
                log_warning "Health check failed (attempt $i)"
            fi
            
            if [ $i -lt "$retries" ]; then
                log_info "Waiting 10 seconds before retry..."
                sleep 10
            fi
        done
        
        log_error "Monitoring failed after $retries attempts"
        return 1
    fi
}

optimize_assets() {
    log_info "Starting asset optimization..."
    
    if [ -f "$SCRIPT_DIR/optimize-assets.js" ] && command -v node >/dev/null 2>&1; then
        log_info "Using Node.js asset optimizer..."
        node "$SCRIPT_DIR/optimize-assets.js" --verbose
    else
        log_warning "Node.js optimizer not available, using basic optimization..."
        
        # Create dist directory
        mkdir -p "$PROJECT_ROOT/dist"
        
        # Copy files
        cp -r "$PROJECT_ROOT"/* "$PROJECT_ROOT/dist/" 2>/dev/null || true
        
        # Remove development files
        rm -rf "$PROJECT_ROOT/dist/.git" "$PROJECT_ROOT/dist/.github" "$PROJECT_ROOT/dist/node_modules" 2>/dev/null || true
        
        log_success "Basic optimization completed"
    fi
}

trigger_deployment() {
    log_info "Triggering manual deployment..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        exit 1
    fi
    
    # Check if GitHub CLI is available
    if command -v gh >/dev/null 2>&1; then
        log_info "Using GitHub CLI to trigger workflow..."
        
        if gh workflow run deploy.yml; then
            log_success "Deployment workflow triggered"
            log_info "Check status at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/actions"
        else
            log_error "Failed to trigger workflow"
            exit 1
        fi
    else
        log_warning "GitHub CLI not available"
        log_info "To trigger deployment manually:"
        log_info "1. Go to your repository on GitHub"
        log_info "2. Navigate to Actions tab"
        log_info "3. Select 'Deploy to GitHub Pages' workflow"
        log_info "4. Click 'Run workflow'"
    fi
}

show_logs() {
    log_info "Showing deployment logs..."
    
    if [ -f "$LOG_FILE" ]; then
        echo ""
        echo "📋 Recent Deployment Logs:"
        echo "=========================="
        tail -n 50 "$LOG_FILE"
    else
        log_warning "No deployment logs found"
    fi
}

clean_artifacts() {
    log_info "Cleaning deployment artifacts..."
    
    # Remove build artifacts
    rm -rf "$PROJECT_ROOT/dist" "$PROJECT_ROOT/node_modules" 2>/dev/null || true
    
    # Clean logs (keep last 100 lines)
    if [ -f "$LOG_FILE" ]; then
        tail -n 100 "$LOG_FILE" > "$LOG_FILE.tmp"
        mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi
    
    log_success "Cleanup completed"
}

# Main script logic
main() {
    local command="${1:-status}"
    local verbose=false
    local url=""
    local timeout=30
    local retries=5
    
    # Parse arguments
    shift || true
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose)
                verbose=true
                shift
                ;;
            --url)
                url="$2"
                shift 2
                ;;
            --timeout)
                timeout="$2"
                shift 2
                ;;
            --retries)
                retries="$2"
                shift 2
                ;;
            *)
                if [ -z "$url" ] && [[ "$1" =~ ^https?:// ]]; then
                    url="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Initialize log
    echo "$(date -u +"%Y-%m-%d %H:%M:%S UTC") - Starting $command" >> "$LOG_FILE"
    
    case "$command" in
        "status")
            show_status
            ;;
        "monitor")
            monitor_deployment "$url" "$timeout" "$retries"
            ;;
        "optimize")
            optimize_assets
            ;;
        "deploy")
            trigger_deployment
            ;;
        "logs")
            show_logs
            ;;
        "clean")
            clean_artifacts
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"