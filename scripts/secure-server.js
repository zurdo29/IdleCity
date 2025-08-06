#!/usr/bin/env node

// Secure Development Server for IdleCity
// Applies security headers during local development

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

class SecureServer {
    constructor(options = {}) {
        this.options = {
            port: options.port || 8080,
            root: options.root || '.',
            ...options
        };
        
        // Security headers to apply
        this.securityHeaders = {
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';",
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
            'X-Permitted-Cross-Domain-Policies': 'none'
        };
        
        // MIME types
        this.mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon'
        };
    }
    
    start() {
        const server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
        
        server.listen(this.options.port, () => {
            console.log(`🔒 Secure server running at http://localhost:${this.options.port}`);
            console.log(`📁 Serving files from: ${path.resolve(this.options.root)}`);
            console.log(`🛡️  Security headers enabled`);
            console.log('');
        });
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('\\n🛑 Shutting down secure server...');
            server.close(() => {
                console.log('✅ Server stopped');
                process.exit(0);
            });
        });
    }
    
    handleRequest(req, res) {
        const parsedUrl = url.parse(req.url);
        let pathname = parsedUrl.pathname;
        
        // Default to index.html for root requests
        if (pathname === '/') {
            pathname = '/index.html';
        }
        
        const filePath = path.join(this.options.root, pathname);
        const ext = path.extname(filePath).toLowerCase();
        
        // Apply security headers
        this.applySecurityHeaders(res, pathname);
        
        // Check if file exists
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                this.send404(res);
                return;
            }
            
            // Read and serve file
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    this.send500(res, err);
                    return;
                }
                
                // Set content type
                const contentType = this.mimeTypes[ext] || 'application/octet-stream';
                res.setHeader('Content-Type', contentType);
                
                // Set cache headers based on file type
                this.applyCacheHeaders(res, pathname);
                
                res.writeHead(200);
                res.end(data);
                
                console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - 200`);
            });
        });
    }
    
    applySecurityHeaders(res, pathname) {
        // Apply all security headers
        Object.entries(this.securityHeaders).forEach(([header, value]) => {
            res.setHeader(header, value);
        });
        
        // Special headers for specific file types
        if (pathname.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (pathname === '/sw.js') {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (pathname === '/manifest.json') {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        } else if (pathname.match(/\\.(css|js|png|jpg|gif|svg|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
    }
    
    applyCacheHeaders(res, pathname) {
        // Cache headers are already applied in applySecurityHeaders
        // This method is kept for potential future enhancements
    }
    
    send404(res) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Not Found</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #e74c3c; }
                </style>
            </head>
            <body>
                <h1>404 - File Not Found</h1>
                <p>The requested file could not be found.</p>
                <a href="/">← Back to IdleCity</a>
            </body>
            </html>
        `);
    }
    
    send500(res, error) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>500 - Server Error</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    h1 { color: #e74c3c; }
                </style>
            </head>
            <body>
                <h1>500 - Server Error</h1>
                <p>An error occurred while serving the file.</p>
                <p><code>${error.message}</code></p>
                <a href="/">← Back to IdleCity</a>
            </body>
            </html>
        `);
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
            case '--root':
                options.root = args[++i];
                break;
            case '--help':
                console.log(`
Secure Development Server for IdleCity

Usage: node secure-server.js [options]

Options:
  --port <port>    Server port (default: 8080)
  --root <path>    Root directory to serve (default: .)
  --help           Show this help message

Examples:
  node secure-server.js --port 3000
  node secure-server.js --root ./dist --port 8080
                `);
                process.exit(0);
                break;
        }
    }
    
    const server = new SecureServer(options);
    server.start();
}

module.exports = SecureServer;