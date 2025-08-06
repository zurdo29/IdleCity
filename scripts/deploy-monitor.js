#!/usr/bin/env node

// Advanced deployment monitoring and analytics script

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

class DeploymentMonitor {
    constructor() {
        this.config = {
            siteUrl: process.env.SITE_URL || 'https://localhost:3000',
            monitoringInterval: 30000, // 30 seconds
            healthCheckTimeout: 10000, // 10 seconds
            performanceThresholds: {
                loadTime: 3000, // 3 seconds
                firstContentfulPaint: 2000, // 2 seconds
                largestContentfulPaint: 2500, // 2.5 seconds
                cumulativeLayoutShift: 0.1,
                firstInputDelay: 100 // 100ms
            },
            errorThresholds: {
                errorRate: 0.01, // 1%
                uptimePercentage: 99.9
            }
        };
        
        this.metrics = {
            deploymentTime: Date.now(),
            healthChecks: [],
            performanceMetrics: [],
            errors: [],
            uptime: {
                total: 0,
                successful: 0
            }
        };
    }

    // Main monitoring function
    async startMonitoring() {
        console.log('🚀 Starting deployment monitoring...');
        console.log(`📊 Monitoring URL: ${this.config.siteUrl}`);
        
        try {
            // Initial health check
            await this.performHealthCheck();
            
            // Setup continuous monitoring
            this.setupContinuousMonitoring();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup error tracking
            this.setupErrorTracking();
            
            // Generate initial report
            await this.generateReport();
            
            console.log('✅ Monitoring started successfully');
            
        } catch (error) {
            console.error('❌ Failed to start monitoring:', error);
            process.exit(1);
        }
    }

    // Perform comprehensive health check
    async performHealthCheck() {
        console.log('🏥 Performing health check...');
        
        const healthCheck = {
            timestamp: Date.now(),
            status: 'unknown',
            responseTime: 0,
            statusCode: 0,
            contentLength: 0,
            errors: []
        };

        try {
            const startTime = Date.now();
            
            // Check main page
            const response = await this.makeRequest(this.config.siteUrl);
            healthCheck.responseTime = Date.now() - startTime;
            healthCheck.statusCode = response.statusCode;
            healthCheck.contentLength = response.data.length;
            
            // Validate response
            if (response.statusCode === 200) {
                // Check for critical content
                if (response.data.includes('IdleCity')) {
                    healthCheck.status = 'healthy';
                } else {
                    healthCheck.status = 'unhealthy';
                    healthCheck.errors.push('Missing critical content');
                }
            } else {
                healthCheck.status = 'unhealthy';
                healthCheck.errors.push(`HTTP ${response.statusCode}`);
            }
            
            // Check critical resources
            await this.checkCriticalResources(healthCheck);
            
            // Check PWA manifest
            await this.checkPWAManifest(healthCheck);
            
            // Check service worker
            await this.checkServiceWorker(healthCheck);
            
        } catch (error) {
            healthCheck.status = 'unhealthy';
            healthCheck.errors.push(error.message);
        }

        this.metrics.healthChecks.push(healthCheck);
        this.metrics.uptime.total++;
        
        if (healthCheck.status === 'healthy') {
            this.metrics.uptime.successful++;
            console.log(`✅ Health check passed (${healthCheck.responseTime}ms)`);
        } else {
            console.log(`❌ Health check failed: ${healthCheck.errors.join(', ')}`);
        }

        return healthCheck;
    }

    // Check critical resources
    async checkCriticalResources(healthCheck) {
        const criticalResources = [
            '/css/styles.css',
            '/js/game.js',
            '/js/ui.js',
            '/js/storage.js',
            '/manifest.json',
            '/sw.js'
        ];

        for (const resource of criticalResources) {
            try {
                const url = new URL(resource, this.config.siteUrl).href;
                const response = await this.makeRequest(url);
                
                if (response.statusCode !== 200) {
                    healthCheck.errors.push(`Resource ${resource} returned ${response.statusCode}`);
                }
            } catch (error) {
                healthCheck.errors.push(`Resource ${resource} failed: ${error.message}`);
            }
        }
    }

    // Check PWA manifest
    async checkPWAManifest(healthCheck) {
        try {
            const manifestUrl = new URL('/manifest.json', this.config.siteUrl).href;
            const response = await this.makeRequest(manifestUrl);
            
            if (response.statusCode === 200) {
                const manifest = JSON.parse(response.data);
                
                // Validate required PWA fields
                const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
                for (const field of requiredFields) {
                    if (!manifest[field]) {
                        healthCheck.errors.push(`PWA manifest missing ${field}`);
                    }
                }
            } else {
                healthCheck.errors.push('PWA manifest not accessible');
            }
        } catch (error) {
            healthCheck.errors.push(`PWA manifest check failed: ${error.message}`);
        }
    }

    // Check service worker
    async checkServiceWorker(healthCheck) {
        try {
            const swUrl = new URL('/sw.js', this.config.siteUrl).href;
            const response = await this.makeRequest(swUrl);
            
            if (response.statusCode !== 200) {
                healthCheck.errors.push('Service worker not accessible');
            } else if (!response.data.includes('CACHE_NAME')) {
                healthCheck.errors.push('Service worker appears invalid');
            }
        } catch (error) {
            healthCheck.errors.push(`Service worker check failed: ${error.message}`);
        }
    }

    // Setup continuous monitoring
    setupContinuousMonitoring() {
        console.log('⏰ Setting up continuous monitoring...');
        
        setInterval(async () => {
            await this.performHealthCheck();
            
            // Check if we need to alert
            const recentChecks = this.metrics.healthChecks.slice(-5);
            const failedChecks = recentChecks.filter(check => check.status !== 'healthy');
            
            if (failedChecks.length >= 3) {
                await this.sendAlert('High failure rate detected', {
                    failedChecks: failedChecks.length,
                    totalChecks: recentChecks.length,
                    errors: failedChecks.map(check => check.errors).flat()
                });
            }
            
        }, this.config.monitoringInterval);
    }

    // Setup performance monitoring
    setupPerformanceMonitoring() {
        console.log('⚡ Setting up performance monitoring...');
        
        // Run performance tests every 5 minutes
        setInterval(async () => {
            await this.runPerformanceTest();
        }, 5 * 60 * 1000);
        
        // Initial performance test
        setTimeout(() => this.runPerformanceTest(), 10000);
    }

    // Run performance test using Lighthouse
    async runPerformanceTest() {
        console.log('🔍 Running performance test...');
        
        try {
            // Use Lighthouse CI for performance testing
            const result = execSync('npx lhci autorun --config=.lighthouserc.json', {
                encoding: 'utf8',
                timeout: 60000
            });
            
            // Parse Lighthouse results
            const performanceMetric = {
                timestamp: Date.now(),
                scores: this.parseLighthouseResults(result),
                status: 'completed'
            };
            
            this.metrics.performanceMetrics.push(performanceMetric);
            
            // Check performance thresholds
            await this.checkPerformanceThresholds(performanceMetric);
            
            console.log('✅ Performance test completed');
            
        } catch (error) {
            console.error('❌ Performance test failed:', error.message);
            
            this.metrics.performanceMetrics.push({
                timestamp: Date.now(),
                status: 'failed',
                error: error.message
            });
        }
    }

    // Parse Lighthouse results
    parseLighthouseResults(output) {
        // This is a simplified parser - in reality, you'd parse the JSON output
        const scores = {
            performance: 0,
            accessibility: 0,
            bestPractices: 0,
            seo: 0,
            pwa: 0
        };
        
        // Extract scores from output (simplified)
        const lines = output.split('\n');
        for (const line of lines) {
            if (line.includes('Performance:')) {
                scores.performance = this.extractScore(line);
            } else if (line.includes('Accessibility:')) {
                scores.accessibility = this.extractScore(line);
            } else if (line.includes('Best Practices:')) {
                scores.bestPractices = this.extractScore(line);
            } else if (line.includes('SEO:')) {
                scores.seo = this.extractScore(line);
            } else if (line.includes('PWA:')) {
                scores.pwa = this.extractScore(line);
            }
        }
        
        return scores;
    }

    // Extract score from Lighthouse output line
    extractScore(line) {
        const match = line.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    // Check performance thresholds
    async checkPerformanceThresholds(metric) {
        const alerts = [];
        
        if (metric.scores.performance < 90) {
            alerts.push(`Performance score dropped to ${metric.scores.performance}`);
        }
        
        if (metric.scores.accessibility < 90) {
            alerts.push(`Accessibility score dropped to ${metric.scores.accessibility}`);
        }
        
        if (metric.scores.pwa < 80) {
            alerts.push(`PWA score dropped to ${metric.scores.pwa}`);
        }
        
        if (alerts.length > 0) {
            await this.sendAlert('Performance threshold breach', {
                alerts,
                scores: metric.scores
            });
        }
    }

    // Setup error tracking
    setupErrorTracking() {
        console.log('🔍 Setting up error tracking...');
        
        // Monitor for JavaScript errors (would typically integrate with error tracking service)
        process.on('uncaughtException', (error) => {
            this.logError('Uncaught Exception', error);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.logError('Unhandled Rejection', reason);
        });
    }

    // Log error
    logError(type, error) {
        const errorLog = {
            timestamp: Date.now(),
            type,
            message: error.message || error,
            stack: error.stack || null
        };
        
        this.metrics.errors.push(errorLog);
        console.error(`❌ ${type}:`, error);
        
        // Send alert for critical errors
        if (this.metrics.errors.length % 10 === 0) {
            this.sendAlert('Error threshold reached', {
                errorCount: this.metrics.errors.length,
                recentErrors: this.metrics.errors.slice(-5)
            });
        }
    }

    // Send alert
    async sendAlert(title, data) {
        console.log(`🚨 ALERT: ${title}`);
        console.log('📊 Data:', JSON.stringify(data, null, 2));
        
        // In a real implementation, this would send to:
        // - Slack webhook
        // - Email service
        // - PagerDuty
        // - Discord webhook
        // etc.
        
        // For now, just log to file
        const alert = {
            timestamp: Date.now(),
            title,
            data,
            severity: this.calculateSeverity(title, data)
        };
        
        const alertsFile = path.join(__dirname, '../logs/alerts.json');
        this.ensureDirectoryExists(path.dirname(alertsFile));
        
        let alerts = [];
        if (fs.existsSync(alertsFile)) {
            alerts = JSON.parse(fs.readFileSync(alertsFile, 'utf8'));
        }
        
        alerts.push(alert);
        fs.writeFileSync(alertsFile, JSON.stringify(alerts, null, 2));
    }

    // Calculate alert severity
    calculateSeverity(title, data) {
        if (title.includes('High failure rate') || title.includes('Critical')) {
            return 'critical';
        } else if (title.includes('Performance threshold') || title.includes('Error threshold')) {
            return 'warning';
        } else {
            return 'info';
        }
    }

    // Generate monitoring report
    async generateReport() {
        console.log('📊 Generating monitoring report...');
        
        const report = {
            generatedAt: Date.now(),
            deploymentTime: this.metrics.deploymentTime,
            uptime: {
                percentage: (this.metrics.uptime.successful / this.metrics.uptime.total) * 100,
                total: this.metrics.uptime.total,
                successful: this.metrics.uptime.successful
            },
            averageResponseTime: this.calculateAverageResponseTime(),
            recentHealthChecks: this.metrics.healthChecks.slice(-10),
            performanceMetrics: this.metrics.performanceMetrics.slice(-5),
            errorCount: this.metrics.errors.length,
            recentErrors: this.metrics.errors.slice(-5)
        };
        
        // Save report
        const reportsDir = path.join(__dirname, '../logs');
        this.ensureDirectoryExists(reportsDir);
        
        const reportFile = path.join(reportsDir, `monitoring-report-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
        
        // Generate HTML report
        const htmlReport = this.generateHTMLReport(report);
        const htmlFile = path.join(reportsDir, `monitoring-report-${Date.now()}.html`);
        fs.writeFileSync(htmlFile, htmlReport);
        
        console.log(`📄 Report saved: ${reportFile}`);
        console.log(`🌐 HTML report: ${htmlFile}`);
        
        return report;
    }

    // Calculate average response time
    calculateAverageResponseTime() {
        const healthyChecks = this.metrics.healthChecks.filter(check => check.status === 'healthy');
        if (healthyChecks.length === 0) return 0;
        
        const totalTime = healthyChecks.reduce((sum, check) => sum + check.responseTime, 0);
        return Math.round(totalTime / healthyChecks.length);
    }

    // Generate HTML report
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IdleCity Deployment Monitoring Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .metric { display: inline-block; margin: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; min-width: 150px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-error { color: #dc3545; }
        .section { margin: 40px 0; }
        .section h2 { border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        .timestamp { font-family: monospace; font-size: 0.9em; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏙️ IdleCity Deployment Monitoring Report</h1>
            <p class="timestamp">Generated: ${new Date(report.generatedAt).toISOString()}</p>
        </div>
        
        <div class="section">
            <h2>📊 Key Metrics</h2>
            <div class="metric">
                <div class="metric-value ${report.uptime.percentage >= 99 ? 'status-good' : 'status-warning'}">${report.uptime.percentage.toFixed(2)}%</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.averageResponseTime}ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric">
                <div class="metric-value ${report.errorCount === 0 ? 'status-good' : 'status-warning'}">${report.errorCount}</div>
                <div class="metric-label">Total Errors</div>
            </div>
        </div>
        
        <div class="section">
            <h2>🏥 Recent Health Checks</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Response Time</th>
                        <th>Status Code</th>
                        <th>Errors</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.recentHealthChecks.map(check => `
                        <tr>
                            <td class="timestamp">${new Date(check.timestamp).toISOString()}</td>
                            <td class="${check.status === 'healthy' ? 'status-good' : 'status-error'}">${check.status}</td>
                            <td>${check.responseTime}ms</td>
                            <td>${check.statusCode}</td>
                            <td>${check.errors.join(', ') || 'None'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="section">
            <h2>⚡ Performance Metrics</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Performance</th>
                        <th>Accessibility</th>
                        <th>Best Practices</th>
                        <th>SEO</th>
                        <th>PWA</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.performanceMetrics.map(metric => `
                        <tr>
                            <td class="timestamp">${new Date(metric.timestamp).toISOString()}</td>
                            <td class="${metric.scores?.performance >= 90 ? 'status-good' : 'status-warning'}">${metric.scores?.performance || 'N/A'}</td>
                            <td class="${metric.scores?.accessibility >= 90 ? 'status-good' : 'status-warning'}">${metric.scores?.accessibility || 'N/A'}</td>
                            <td class="${metric.scores?.bestPractices >= 90 ? 'status-good' : 'status-warning'}">${metric.scores?.bestPractices || 'N/A'}</td>
                            <td class="${metric.scores?.seo >= 90 ? 'status-good' : 'status-warning'}">${metric.scores?.seo || 'N/A'}</td>
                            <td class="${metric.scores?.pwa >= 80 ? 'status-good' : 'status-warning'}">${metric.scores?.pwa || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        ${report.recentErrors.length > 0 ? `
        <div class="section">
            <h2>❌ Recent Errors</h2>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Type</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    ${report.recentErrors.map(error => `
                        <tr>
                            <td class="timestamp">${new Date(error.timestamp).toISOString()}</td>
                            <td class="status-error">${error.type}</td>
                            <td>${error.message}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
    </div>
</body>
</html>
        `;
    }

    // Make HTTP request
    makeRequest(url) {
        return new Promise((resolve, reject) => {
            const request = https.get(url, {
                timeout: this.config.healthCheckTimeout
            }, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        data
                    });
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    // Ensure directory exists
    ensureDirectoryExists(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

// CLI interface
if (require.main === module) {
    const monitor = new DeploymentMonitor();
    
    // Handle CLI arguments
    const args = process.argv.slice(2);
    const command = args[0] || 'start';
    
    switch (command) {
        case 'start':
            monitor.startMonitoring();
            break;
            
        case 'health-check':
            monitor.performHealthCheck().then(result => {
                console.log('Health check result:', result);
                process.exit(result.status === 'healthy' ? 0 : 1);
            });
            break;
            
        case 'performance':
            monitor.runPerformanceTest().then(() => {
                console.log('Performance test completed');
                process.exit(0);
            });
            break;
            
        case 'report':
            monitor.generateReport().then(report => {
                console.log('Report generated:', report);
                process.exit(0);
            });
            break;
            
        default:
            console.log('Usage: node deploy-monitor.js [start|health-check|performance|report]');
            process.exit(1);
    }
}

module.exports = DeploymentMonitor;