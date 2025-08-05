#!/usr/bin/env node

/**
 * IdleCity Deployment Monitor
 * Monitors deployment health and performance
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class DeploymentMonitor {
    constructor(url, options = {}) {
        this.url = url;
        this.options = {
            timeout: options.timeout || 30000,
            retries: options.retries || 5,
            interval: options.interval || 10000,
            verbose: options.verbose || false,
            ...options
        };
        this.results = [];
    }

    async checkHealth() {
        console.log(`🏥 Starting health check for: ${this.url}`);
        
        for (let attempt = 1; attempt <= this.options.retries; attempt++) {
            console.log(`🔍 Attempt ${attempt}/${this.options.retries}...`);
            
            try {
                const result = await this.performCheck();
                
                if (result.success) {
                    console.log(`✅ Health check passed on attempt ${attempt}`);
                    console.log(`📊 Response time: ${result.responseTime}ms`);
                    console.log(`📦 Content size: ${result.contentSize} bytes`);
                    return result;
                }
                
                console.log(`❌ Attempt ${attempt} failed: ${result.error}`);
                
                if (attempt < this.options.retries) {
                    console.log(`⏳ Waiting ${this.options.interval}ms before retry...`);
                    await this.sleep(this.options.interval);
                }
                
            } catch (error) {
                console.log(`❌ Attempt ${attempt} error: ${error.message}`);
                
                if (attempt < this.options.retries) {
                    await this.sleep(this.options.interval);
                }
            }
        }
        
        throw new Error(`Health check failed after ${this.options.retries} attempts`);
    }

    async performCheck() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            
            const req = https.get(this.url, {
                timeout: this.options.timeout,
                headers: {
                    'User-Agent': 'IdleCity-Deploy-Monitor/1.0'
                }
            }, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    const contentSize = Buffer.byteLength(data, 'utf8');
                    
                    // Check response status
                    if (res.statusCode !== 200) {
                        return resolve({
                            success: false,
                            error: `HTTP ${res.statusCode}`,
                            responseTime,
                            contentSize
                        });
                    }
                    
                    // Check content validity
                    const contentChecks = this.validateContent(data);
                    
                    resolve({
                        success: contentChecks.valid,
                        error: contentChecks.error,
                        responseTime,
                        contentSize,
                        checks: contentChecks.checks
                    });
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({
                    success: false,
                    error: 'Request timeout',
                    responseTime: this.options.timeout
                });
            });
            
            req.on('error', (error) => {
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: Date.now() - startTime
                });
            });
        });
    }

    validateContent(content) {
        const checks = {
            hasTitle: content.includes('IdleCity'),
            hasGameScript: content.includes('js/game.js'),
            hasUIScript: content.includes('js/ui.js'),
            hasStorageScript: content.includes('js/storage.js'),
            hasAchievementsScript: content.includes('js/achievements.js'),
            hasStatisticsScript: content.includes('js/statistics.js'),
            hasStyles: content.includes('css/styles.css'),
            hasGameContainer: content.includes('container') || content.includes('game'),
            validHTML: content.includes('<!DOCTYPE html>') && content.includes('</html>')
        };
        
        const failedChecks = Object.entries(checks)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
        
        return {
            valid: failedChecks.length === 0,
            error: failedChecks.length > 0 ? `Failed checks: ${failedChecks.join(', ')}` : null,
            checks
        };
    }

    async monitorPerformance(duration = 300000) { // 5 minutes default
        console.log(`📈 Starting performance monitoring for ${duration}ms...`);
        
        const startTime = Date.now();
        const results = [];
        
        while (Date.now() - startTime < duration) {
            try {
                const result = await this.performCheck();
                results.push({
                    timestamp: new Date().toISOString(),
                    ...result
                });
                
                if (this.options.verbose) {
                    console.log(`📊 ${result.responseTime}ms - ${result.success ? '✅' : '❌'}`);
                }
                
                await this.sleep(5000); // Check every 5 seconds
                
            } catch (error) {
                console.log(`⚠️ Monitoring error: ${error.message}`);
                await this.sleep(10000); // Wait longer on error
            }
        }
        
        return this.analyzeResults(results);
    }

    analyzeResults(results) {
        if (results.length === 0) {
            return { error: 'No results to analyze' };
        }
        
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        const responseTimes = successful.map(r => r.responseTime);
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const minResponseTime = Math.min(...responseTimes);
        const maxResponseTime = Math.max(...responseTimes);
        
        const analysis = {
            totalChecks: results.length,
            successful: successful.length,
            failed: failed.length,
            successRate: (successful.length / results.length) * 100,
            avgResponseTime: Math.round(avgResponseTime),
            minResponseTime,
            maxResponseTime,
            errors: [...new Set(failed.map(r => r.error))]
        };
        
        console.log('\n📊 Performance Analysis:');
        console.log(`- Total checks: ${analysis.totalChecks}`);
        console.log(`- Success rate: ${analysis.successRate.toFixed(1)}%`);
        console.log(`- Avg response time: ${analysis.avgResponseTime}ms`);
        console.log(`- Min response time: ${analysis.minResponseTime}ms`);
        console.log(`- Max response time: ${analysis.maxResponseTime}ms`);
        
        if (analysis.errors.length > 0) {
            console.log(`- Errors encountered: ${analysis.errors.join(', ')}`);
        }
        
        return analysis;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('Usage: node deploy-monitor.js <url> [options]');
        console.log('Options:');
        console.log('  --retries <n>     Number of retry attempts (default: 5)');
        console.log('  --timeout <ms>    Request timeout (default: 30000)');
        console.log('  --interval <ms>   Retry interval (default: 10000)');
        console.log('  --monitor <ms>    Monitor for duration (default: 300000)');
        console.log('  --verbose         Verbose output');
        process.exit(1);
    }
    
    const url = args[0];
    const options = {};
    
    for (let i = 1; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        
        switch (flag) {
            case '--retries':
                options.retries = parseInt(value);
                break;
            case '--timeout':
                options.timeout = parseInt(value);
                break;
            case '--interval':
                options.interval = parseInt(value);
                break;
            case '--monitor':
                options.monitor = parseInt(value);
                break;
            case '--verbose':
                options.verbose = true;
                i--; // No value for this flag
                break;
        }
    }
    
    const monitor = new DeploymentMonitor(url, options);
    
    async function run() {
        try {
            if (options.monitor) {
                await monitor.monitorPerformance(options.monitor);
            } else {
                await monitor.checkHealth();
            }
            process.exit(0);
        } catch (error) {
            console.error(`❌ Monitoring failed: ${error.message}`);
            process.exit(1);
        }
    }
    
    run();
}

module.exports = DeploymentMonitor;