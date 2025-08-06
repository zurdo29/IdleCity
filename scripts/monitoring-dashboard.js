#!/usr/bin/env node

// Monitoring Dashboard for IdleCity
// Provides real-time monitoring and alerting capabilities

const http = require('http');
const fs = require('fs');
const path = require('path');

class MonitoringDashboard {
    constructor(options = {}) {
        this.options = {
            port: options.port || 3001,
            checkInterval: options.checkInterval || 30000, // 30 seconds
            alertThresholds: {
                responseTime: options.responseTimeThreshold || 2000, // 2 seconds
                errorRate: options.errorRateThreshold || 5, // 5%
                memoryUsage: options.memoryThreshold || 80, // 80%
                ...options.alertThresholds
            },
            targets: options.targets || ['http://localhost:3000'],
            ...options
        };
        
        this.metrics = {
            uptime: {},
            responseTime: {},
            errorRate: {},
            lastCheck: {},
            alerts: []
        };
        
        this.server = null;
        this.monitoringInterval = null;
    }
    
    start() {
        console.log('🚀 Starting Monitoring Dashboard...');
        console.log(`Dashboard will be available at http://localhost:${this.options.port}`);
        console.log(`Monitoring ${this.options.targets.length} target(s)`);
        console.log('');
        
        // Start HTTP server
        this.startServer();
        
        // Start monitoring
        this.startMonitoring();
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            this.stop();
        });
        
        process.on('SIGTERM', () => {
            this.stop();
        });
    }
    
    stop() {
        console.log('🛑 Stopping Monitoring Dashboard...');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        if (this.server) {
            this.server.close();
        }
        
        console.log('✅ Monitoring Dashboard stopped');
        process.exit(0);
    }
    
    startServer() {
        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        
        this.server.listen(this.options.port, () => {
            console.log(`✅ Dashboard server started on port ${this.options.port}`);
        });
    }
    
    startMonitoring() {
        // Initial check
        this.checkAllTargets();
        
        // Set up periodic checks
        this.monitoringInterval = setInterval(() => {
            this.checkAllTargets();
        }, this.options.checkInterval);
        
        console.log(`✅ Monitoring started (checking every ${this.options.checkInterval / 1000}s)`);
    }
    
    async checkAllTargets() {
        const timestamp = Date.now();
        
        for (const target of this.options.targets) {
            try {
                await this.checkTarget(target, timestamp);
            } catch (error) {
                console.error(`❌ Error checking ${target}:`, error.message);
                this.recordError(target, timestamp, error);
            }
        }
        
        // Check for alerts
        this.checkAlerts();
    }
    
    async checkTarget(target, timestamp) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const client = target.startsWith('https://') ? require('https') : require('http');
            
            const request = client.request(target, { method: 'GET', timeout: 10000 }, (response) => {
                const responseTime = Date.now() - startTime;
                const isSuccess = response.statusCode >= 200 && response.statusCode < 400;
                
                this.recordMetrics(target, timestamp, {
                    responseTime: responseTime,
                    statusCode: response.statusCode,
                    success: isSuccess
                });
                
                if (isSuccess) {
                    console.log(`✅ ${target} - ${response.statusCode} (${responseTime}ms)`);
                } else {
                    console.log(`⚠️  ${target} - ${response.statusCode} (${responseTime}ms)`);
                }
                
                resolve();
            });
            
            request.on('error', (error) => {
                const responseTime = Date.now() - startTime;
                
                this.recordMetrics(target, timestamp, {
                    responseTime: responseTime,
                    statusCode: 0,
                    success: false,
                    error: error.message
                });
                
                console.log(`❌ ${target} - Error: ${error.message} (${responseTime}ms)`);
                reject(error);
            });
            
            request.on('timeout', () => {
                request.destroy();
                const error = new Error('Request timeout');
                reject(error);
            });
            
            request.end();
        });
    }
    
    recordMetrics(target, timestamp, data) {
        // Initialize target metrics if not exists
        if (!this.metrics.uptime[target]) {
            this.metrics.uptime[target] = [];
            this.metrics.responseTime[target] = [];
            this.metrics.errorRate[target] = [];
        }
        
        // Record uptime
        this.metrics.uptime[target].push({
            timestamp: timestamp,
            up: data.success
        });
        
        // Record response time
        this.metrics.responseTime[target].push({
            timestamp: timestamp,
            time: data.responseTime
        });
        
        // Calculate error rate
        const recentChecks = this.metrics.uptime[target].slice(-20); // Last 20 checks
        const errorCount = recentChecks.filter(check => !check.up).length;
        const errorRate = (errorCount / recentChecks.length) * 100;
        
        this.metrics.errorRate[target].push({
            timestamp: timestamp,
            rate: errorRate
        });
        
        // Update last check
        this.metrics.lastCheck[target] = {
            timestamp: timestamp,
            ...data
        };
        
        // Keep only recent data (last 1000 points)
        ['uptime', 'responseTime', 'errorRate'].forEach(metric => {
            if (this.metrics[metric][target].length > 1000) {
                this.metrics[metric][target] = this.metrics[metric][target].slice(-1000);
            }
        });
    }
    
    recordError(target, timestamp, error) {
        this.recordMetrics(target, timestamp, {
            responseTime: 0,
            statusCode: 0,
            success: false,
            error: error.message
        });
    }
    
    checkAlerts() {
        const now = Date.now();
        
        for (const target of this.options.targets) {
            const lastCheck = this.metrics.lastCheck[target];
            if (!lastCheck) continue;
            
            // Check response time alert
            if (lastCheck.responseTime > this.options.alertThresholds.responseTime) {
                this.createAlert('high_response_time', target, {
                    responseTime: lastCheck.responseTime,
                    threshold: this.options.alertThresholds.responseTime
                });
            }
            
            // Check error rate alert
            const recentErrorRate = this.metrics.errorRate[target];
            if (recentErrorRate && recentErrorRate.length > 0) {
                const currentErrorRate = recentErrorRate[recentErrorRate.length - 1].rate;
                
                if (currentErrorRate > this.options.alertThresholds.errorRate) {
                    this.createAlert('high_error_rate', target, {
                        errorRate: currentErrorRate,
                        threshold: this.options.alertThresholds.errorRate
                    });
                }
            }
            
            // Check if target is down
            if (!lastCheck.success) {
                this.createAlert('target_down', target, {
                    error: lastCheck.error,
                    statusCode: lastCheck.statusCode
                });
            }
        }
        
        // Clean old alerts (older than 1 hour)
        this.metrics.alerts = this.metrics.alerts.filter(alert => 
            now - alert.timestamp < 60 * 60 * 1000
        );
    }
    
    createAlert(type, target, data) {
        const alert = {
            id: `${type}_${target}_${Date.now()}`,
            type: type,
            target: target,
            timestamp: Date.now(),
            data: data,
            resolved: false
        };
        
        // Check if similar alert already exists
        const existingAlert = this.metrics.alerts.find(a => 
            a.type === type && a.target === target && !a.resolved
        );
        
        if (!existingAlert) {
            this.metrics.alerts.push(alert);
            console.log(`🚨 ALERT: ${type} for ${target}`, data);
        }
    }
    
    handleRequest(req, res) {
        const url = new URL(req.url, `http://localhost:${this.options.port}`);
        
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        
        switch (url.pathname) {
            case '/':
                this.serveDashboard(res);
                break;
            case '/api/metrics':
                this.serveMetrics(res);
                break;
            case '/api/alerts':
                this.serveAlerts(res);
                break;
            case '/api/health':
                this.serveHealth(res);
                break;
            default:
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Not Found');
        }
    }
    
    serveDashboard(res) {
        const html = this.generateDashboardHTML();
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }
    
    serveMetrics(res) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(this.metrics, null, 2));
    }
    
    serveAlerts(res) {
        const activeAlerts = this.metrics.alerts.filter(alert => !alert.resolved);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(activeAlerts, null, 2));
    }
    
    serveHealth(res) {
        const health = {
            status: 'healthy',
            timestamp: Date.now(),
            targets: this.options.targets.length,
            activeAlerts: this.metrics.alerts.filter(alert => !alert.resolved).length,
            uptime: process.uptime()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health, null, 2));
    }
    
    generateDashboardHTML() {
        const activeAlerts = this.metrics.alerts.filter(alert => !alert.resolved);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IdleCity Monitoring Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: #2563eb;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .status-up {
            color: #10b981;
            font-weight: bold;
        }
        .status-down {
            color: #ef4444;
            font-weight: bold;
        }
        .alert {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .refresh-btn {
            background: #2563eb;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
        }
        .refresh-btn:hover {
            background: #1d4ed8;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏙️ IdleCity Monitoring Dashboard</h1>
        <p>Real-time monitoring and alerting for IdleCity deployment</p>
        <button class="refresh-btn" onclick="location.reload()">🔄 Refresh</button>
    </div>
    
    ${activeAlerts.length > 0 ? `
    <div class="card">
        <h2>🚨 Active Alerts (${activeAlerts.length})</h2>
        ${activeAlerts.map(alert => `
            <div class="alert">
                <strong>${alert.type.replace(/_/g, ' ').toUpperCase()}</strong> - ${alert.target}
                <br>
                <small>${new Date(alert.timestamp).toLocaleString()}</small>
                ${alert.data ? `<br><small>${JSON.stringify(alert.data)}</small>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    <div class="grid">
        ${this.options.targets.map(target => {
            const lastCheck = this.metrics.lastCheck[target];
            const isUp = lastCheck && lastCheck.success;
            
            return `
            <div class="card">
                <h3>${target}</h3>
                <div class="metric">
                    <span>Status</span>
                    <span class="${isUp ? 'status-up' : 'status-down'}">
                        ${isUp ? '✅ UP' : '❌ DOWN'}
                    </span>
                </div>
                ${lastCheck ? `
                <div class="metric">
                    <span>Response Time</span>
                    <span>${lastCheck.responseTime}ms</span>
                </div>
                <div class="metric">
                    <span>Status Code</span>
                    <span>${lastCheck.statusCode}</span>
                </div>
                <div class="metric">
                    <span>Last Check</span>
                    <span>${new Date(lastCheck.timestamp).toLocaleString()}</span>
                </div>
                ` : '<div class="metric"><span>No data available</span></div>'}
            </div>
            `;
        }).join('')}
    </div>
    
    <div class="card">
        <h3>📊 System Information</h3>
        <div class="metric">
            <span>Dashboard Uptime</span>
            <span>${Math.floor(process.uptime())} seconds</span>
        </div>
        <div class="metric">
            <span>Check Interval</span>
            <span>${this.options.checkInterval / 1000} seconds</span>
        </div>
        <div class="metric">
            <span>Targets Monitored</span>
            <span>${this.options.targets.length}</span>
        </div>
        <div class="metric">
            <span>Total Alerts</span>
            <span>${this.metrics.alerts.length}</span>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            location.reload();
        }, 30000);
    </script>
</body>
</html>
        `;
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--port':
                options.port = parseInt(args[++i]);
                break;
            case '--interval':
                options.checkInterval = parseInt(args[++i]) * 1000;
                break;
            case '--target':
                if (!options.targets) options.targets = [];
                options.targets.push(args[++i]);
                break;
            case '--response-time-threshold':
                if (!options.alertThresholds) options.alertThresholds = {};
                options.alertThresholds.responseTime = parseInt(args[++i]);
                break;
            case '--error-rate-threshold':
                if (!options.alertThresholds) options.alertThresholds = {};
                options.alertThresholds.errorRate = parseInt(args[++i]);
                break;
            case '--help':
                console.log(`
Monitoring Dashboard for IdleCity

Usage: node monitoring-dashboard.js [options]

Options:
  --port <port>                    Dashboard port (default: 3001)
  --interval <seconds>             Check interval in seconds (default: 30)
  --target <url>                   Target URL to monitor (can be used multiple times)
  --response-time-threshold <ms>   Response time alert threshold (default: 2000)
  --error-rate-threshold <%>       Error rate alert threshold (default: 5)
  --help                           Show this help message

Examples:
  node monitoring-dashboard.js --port 3001 --target http://localhost:3000
  node monitoring-dashboard.js --interval 60 --target https://example.com --target https://api.example.com
                `);
                process.exit(0);
                break;
        }
    }
    
    const dashboard = new MonitoringDashboard(options);
    dashboard.start();
}

module.exports = MonitoringDashboard;