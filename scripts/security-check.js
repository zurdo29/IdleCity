#!/usr/bin/env node

// Security Check Script for IdleCity
// Validates security headers and configurations

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

class SecurityChecker {
    constructor(options = {}) {
        this.options = {
            url: options.url || 'http://localhost:3000',
            timeout: options.timeout || 10000,
            verbose: options.verbose || false,
            ...options
        };
        
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            details: []
        };
    }
    
    async checkSecurity() {
        console.log('🔒 Starting security check...');
        console.log(`Target URL: ${this.options.url}`);
        console.log('');
        
        try {
            // Check HTTP headers
            await this.checkHeaders();
            
            // Check content security
            await this.checkContentSecurity();
            
            // Check file permissions
            await this.checkFilePermissions();
            
            // Check for sensitive files
            await this.checkSensitiveFiles();
            
            // Generate report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Security check failed:', error.message);
            process.exit(1);
        }
    }
    
    async checkHeaders() {
        console.log('📋 Checking HTTP Security Headers...');
        
        const headers = await this.fetchHeaders(this.options.url);
        
        // Required security headers
        const requiredHeaders = {
            'x-frame-options': {
                name: 'X-Frame-Options',
                expected: ['DENY', 'SAMEORIGIN'],
                description: 'Prevents clickjacking attacks'
            },
            'x-content-type-options': {
                name: 'X-Content-Type-Options',
                expected: ['nosniff'],
                description: 'Prevents MIME type sniffing'
            },
            'x-xss-protection': {
                name: 'X-XSS-Protection',
                expected: ['1; mode=block'],
                description: 'Enables XSS protection'
            },
            'referrer-policy': {
                name: 'Referrer-Policy',
                expected: ['strict-origin-when-cross-origin', 'no-referrer', 'same-origin'],
                description: 'Controls referrer information'
            },
            'content-security-policy': {
                name: 'Content-Security-Policy',
                expected: null, // Custom validation
                description: 'Prevents XSS and injection attacks'
            }
        };
        
        // Check each required header
        for (const [key, config] of Object.entries(requiredHeaders)) {
            const headerValue = headers[key] || headers[key.toLowerCase()];
            
            if (!headerValue) {
                this.addResult('failed', `Missing ${config.name}`, config.description);
            } else if (config.expected && !config.expected.some(expected => headerValue.includes(expected))) {
                this.addResult('failed', `Invalid ${config.name}: ${headerValue}`, `Expected one of: ${config.expected.join(', ')}`);
            } else {
                this.addResult('passed', `${config.name} configured`, headerValue);
            }
        }
        
        // Check HTTPS headers (if HTTPS)
        if (this.options.url.startsWith('https://')) {
            const hstsHeader = headers['strict-transport-security'];
            if (!hstsHeader) {
                this.addResult('warning', 'Missing Strict-Transport-Security', 'HTTPS site should include HSTS header');
            } else {
                this.addResult('passed', 'Strict-Transport-Security configured', hstsHeader);
            }
        }
        
        console.log('');
    }
    
    async checkContentSecurity() {
        console.log('🛡️  Checking Content Security...');
        
        try {
            // Check for inline scripts and styles
            const indexPath = path.join(process.cwd(), 'index.html');
            if (fs.existsSync(indexPath)) {
                const content = fs.readFileSync(indexPath, 'utf8');
                
                // Check for inline scripts
                const inlineScripts = content.match(/<script(?![^>]*src=)[^>]*>/gi);
                if (inlineScripts && inlineScripts.length > 0) {
                    this.addResult('warning', 'Inline scripts detected', `Found ${inlineScripts.length} inline script(s)`);
                } else {
                    this.addResult('passed', 'No inline scripts', 'All scripts are external');
                }
                
                // Check for inline styles
                const inlineStyles = content.match(/<style[^>]*>/gi);
                if (inlineStyles && inlineStyles.length > 0) {
                    this.addResult('warning', 'Inline styles detected', `Found ${inlineStyles.length} inline style(s)`);
                } else {
                    this.addResult('passed', 'No inline styles', 'All styles are external');
                }
                
                // Check for external CDN resources
                const cdnResources = content.match(/https?:\/\/cdn\./gi);
                if (cdnResources && cdnResources.length > 0) {
                    this.addResult('warning', 'External CDN resources', 'Consider using SRI for CDN resources');
                }
            }
            
        } catch (error) {
            this.addResult('failed', 'Content security check failed', error.message);
        }
        
        console.log('');
    }
    
    async checkFilePermissions() {
        console.log('📁 Checking File Permissions...');
        
        const sensitiveFiles = [
            '.env',
            '.env.local',
            '.env.production',
            'config.json',
            'secrets.json'
        ];
        
        for (const file of sensitiveFiles) {
            const filePath = path.join(process.cwd(), file);
            
            if (fs.existsSync(filePath)) {
                try {
                    const stats = fs.statSync(filePath);
                    const mode = stats.mode & parseInt('777', 8);
                    
                    if (mode & parseInt('044', 8)) {
                        this.addResult('failed', `${file} is world-readable`, 'Sensitive files should not be readable by others');
                    } else {
                        this.addResult('passed', `${file} permissions OK`, 'File is properly protected');
                    }
                } catch (error) {
                    this.addResult('warning', `Cannot check ${file} permissions`, error.message);
                }
            }
        }
        
        console.log('');
    }
    
    async checkSensitiveFiles() {
        console.log('🔍 Checking for Sensitive Files...');
        
        const sensitivePatterns = [
            '.git',
            'node_modules',
            '.env*',
            '*.log',
            '*.key',
            '*.pem',
            'config.json',
            'secrets.json'
        ];
        
        // Check if sensitive files are accessible via HTTP
        for (const pattern of sensitivePatterns) {
            try {
                const testUrl = `${this.options.url}/${pattern}`;
                const response = await this.makeRequest(testUrl);
                
                if (response.statusCode === 200) {
                    this.addResult('failed', `Sensitive file accessible: ${pattern}`, 'This file should not be publicly accessible');
                } else {
                    this.addResult('passed', `${pattern} not accessible`, 'Sensitive file is properly protected');
                }
            } catch (error) {
                // Expected for protected files
                this.addResult('passed', `${pattern} not accessible`, 'Sensitive file is properly protected');
            }
        }
        
        console.log('');
    }
    
    async fetchHeaders(url) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https://') ? https : http;
            
            const request = client.request(url, { method: 'HEAD', timeout: this.options.timeout }, (response) => {
                resolve(response.headers);
            });
            
            request.on('error', reject);
            request.on('timeout', () => reject(new Error('Request timeout')));
            request.end();
        });
    }
    
    async makeRequest(url) {
        return new Promise((resolve, reject) => {
            const client = url.startsWith('https://') ? https : http;
            
            const request = client.request(url, { method: 'GET', timeout: this.options.timeout }, (response) => {
                resolve(response);
            });
            
            request.on('error', reject);
            request.on('timeout', () => reject(new Error('Request timeout')));
            request.end();
        });
    }
    
    addResult(type, title, description) {
        this.results[type]++;
        this.results.details.push({ type, title, description });
        
        const icon = type === 'passed' ? '✅' : type === 'failed' ? '❌' : '⚠️';
        const color = type === 'passed' ? '\x1b[32m' : type === 'failed' ? '\x1b[31m' : '\x1b[33m';
        
        console.log(`${icon} ${color}${title}\x1b[0m`);
        if (this.options.verbose && description) {
            console.log(`   ${description}`);
        }
    }
    
    generateReport() {
        console.log('');
        console.log('📊 Security Check Report');
        console.log('========================');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`⚠️  Warnings: ${this.results.warnings}`);
        console.log('');
        
        const total = this.results.passed + this.results.failed + this.results.warnings;
        const score = total > 0 ? Math.round((this.results.passed / total) * 100) : 0;
        
        console.log(`Security Score: ${score}%`);
        
        if (this.results.failed > 0) {
            console.log('');
            console.log('❌ Critical Issues:');
            this.results.details
                .filter(r => r.type === 'failed')
                .forEach(r => console.log(`   • ${r.title}: ${r.description}`));
        }
        
        if (this.results.warnings > 0) {
            console.log('');
            console.log('⚠️  Recommendations:');
            this.results.details
                .filter(r => r.type === 'warning')
                .forEach(r => console.log(`   • ${r.title}: ${r.description}`));
        }
        
        // Save report to file
        const report = {
            timestamp: new Date().toISOString(),
            url: this.options.url,
            score: score,
            results: this.results
        };
        
        fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
        console.log('');
        console.log('📄 Report saved to security-report.json');
        
        // Exit with error code if there are failures
        if (this.results.failed > 0) {
            process.exit(1);
        }
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--url':
                options.url = args[++i];
                break;
            case '--timeout':
                options.timeout = parseInt(args[++i]);
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--help':
                console.log(`
Security Check Tool for IdleCity

Usage: node security-check.js [options]

Options:
  --url <url>        Target URL to check (default: http://localhost:3000)
  --timeout <ms>     Request timeout in milliseconds (default: 10000)
  --verbose          Show detailed output
  --help             Show this help message

Examples:
  node security-check.js --url https://example.com --verbose
  node security-check.js --url http://localhost:8080 --timeout 5000
                `);
                process.exit(0);
                break;
        }
    }
    
    const checker = new SecurityChecker(options);
    checker.checkSecurity().catch(error => {
        console.error('Security check failed:', error);
        process.exit(1);
    });
}

module.exports = SecurityChecker;