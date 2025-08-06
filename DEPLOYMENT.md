# IdleCity - Deployment Guide

This document provides comprehensive instructions for deploying IdleCity to various hosting platforms.

## Table of Contents
- [Overview](#overview)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Alternative Hosting Platforms](#alternative-hosting-platforms)
- [Custom Server Deployment](#custom-server-deployment)
- [CDN Configuration](#cdn-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Overview

IdleCity is a client-side web application that can be deployed to any static hosting service. The game requires:
- Static file hosting
- HTTPS support (recommended)
- No server-side processing
- No database requirements

### Deployment Requirements
- **Web Server**: Any static file server (Apache, Nginx, GitHub Pages, etc.)
- **HTTPS**: Recommended for security and modern browser features
- **Compression**: Gzip compression recommended for better performance
- **Caching**: Appropriate cache headers for static assets

## GitHub Pages Deployment

### Automatic Deployment (Recommended)

The project includes GitHub Actions for automatic deployment:

#### 1. Repository Setup
```bash
# Clone or fork the repository
git clone https://github.com/username/idlecity.git
cd idlecity

# Ensure you're on the main branch
git checkout main
```

#### 2. Enable GitHub Pages
1. Go to repository Settings
2. Navigate to "Pages" section
3. Select "GitHub Actions" as source
4. The workflow will deploy automatically on push to main

#### 3. Workflow Configuration
The `.github/workflows/deploy.yml` file handles deployment:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Pages
        uses: actions/configure-pages@v3
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
          
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

#### 4. Verify Deployment
- Check Actions tab for deployment status
- Visit `https://username.github.io/idlecity`
- Test all game functionality

### Manual GitHub Pages Deployment

#### 1. Create gh-pages Branch
```bash
# Create and switch to gh-pages branch
git checkout --orphan gh-pages

# Remove all files
git rm -rf .

# Copy game files
cp -r ../main-branch/* .

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
```

#### 2. Configure Repository
1. Go to Settings > Pages
2. Select "Deploy from a branch"
3. Choose "gh-pages" branch
4. Select "/ (root)" folder

## Alternative Hosting Platforms

### Netlify Deployment

#### 1. Direct Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: (leave empty)
3. Set publish directory: `/`
4. Deploy automatically on git push

#### 2. Manual Upload
1. Create a zip file of your project
2. Drag and drop to Netlify dashboard
3. Configure custom domain if needed

#### 3. Netlify Configuration
Create `netlify.toml` in project root:
```toml
[build]
  publish = "."
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

### Vercel Deployment

#### 1. Git Integration
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Follow prompts to configure
```

#### 2. Configuration
Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Firebase Hosting

#### 1. Setup Firebase
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting
```

#### 2. Configuration
Configure `firebase.json`:
```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

#### 3. Deploy
```bash
firebase deploy
```

### Surge.sh Deployment

#### 1. Install and Deploy
```bash
# Install Surge
npm install -g surge

# Deploy from project directory
surge

# Follow prompts for domain configuration
```

## Custom Server Deployment

### Apache Configuration

#### 1. Virtual Host Setup
```apache
<VirtualHost *:80>
    ServerName idlecity.example.com
    DocumentRoot /var/www/idlecity
    
    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Cache headers
    <FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </FilesMatch>
    
    # Security headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

#### 2. .htaccess Configuration
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache headers
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/ico "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### Nginx Configuration

#### 1. Server Block
```nginx
server {
    listen 80;
    server_name idlecity.example.com;
    root /var/www/idlecity;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Main location
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 2. HTTPS Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name idlecity.example.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Include previous configuration here
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name idlecity.example.com;
    return 301 https://$server_name$request_uri;
}
```

## CDN Configuration

### Cloudflare Setup

#### 1. DNS Configuration
1. Add your domain to Cloudflare
2. Update nameservers at your registrar
3. Configure DNS records to point to your hosting

#### 2. Performance Settings
- **Caching Level**: Standard
- **Browser Cache TTL**: 1 year for static assets
- **Always Online**: Enabled
- **Minification**: Enable for CSS, JS, HTML

#### 3. Security Settings
- **Security Level**: Medium
- **Challenge Passage**: 30 minutes
- **Browser Integrity Check**: Enabled
- **Hotlink Protection**: Enabled

#### 4. Page Rules
```
idlecity.example.com/css/*
- Cache Level: Cache Everything
- Edge Cache TTL: 1 year

idlecity.example.com/js/*
- Cache Level: Cache Everything
- Edge Cache TTL: 1 year
```

### AWS CloudFront

#### 1. Distribution Setup
```json
{
  "DistributionConfig": {
    "CallerReference": "idlecity-distribution",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "idlecity-origin",
          "DomainName": "your-bucket.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "idlecity-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "Compress": true,
      "CachePolicyId": "managed-caching-optimized"
    }
  }
}
```

## Monitoring and Maintenance

### Health Checks

#### 1. Automated Monitoring
Create `scripts/health-check.js`:
```javascript
const https = require('https');

function healthCheck(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                resolve('OK');
            } else {
                reject(`Status: ${res.statusCode}`);
            }
        }).on('error', reject);
    });
}

// Check main site
healthCheck('https://idlecity.example.com')
    .then(() => console.log('✅ Site is healthy'))
    .catch(err => console.error('❌ Site check failed:', err));
```

#### 2. Uptime Monitoring
Set up monitoring with services like:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Comprehensive monitoring
- **StatusCake**: Website monitoring
- **New Relic**: Application performance monitoring

### Performance Monitoring

#### 1. Core Web Vitals
Monitor key metrics:
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

#### 2. Monitoring Tools
- **Google PageSpeed Insights**: Performance analysis
- **GTmetrix**: Detailed performance reports
- **WebPageTest**: Advanced performance testing
- **Lighthouse**: Built-in Chrome auditing

### Log Analysis

#### 1. Server Logs
Monitor for:
- 404 errors (missing files)
- 500 errors (server issues)
- High traffic patterns
- Bot traffic

#### 2. Client-Side Monitoring
```javascript
// Add to performance.js
window.addEventListener('error', (event) => {
    // Log client-side errors
    console.error('Client error:', event.error);
    
    // Send to monitoring service (optional)
    // sendErrorToMonitoring(event.error);
});
```

## Troubleshooting

### Common Deployment Issues

#### 1. Files Not Loading (404 Errors)
**Symptoms**: Game doesn't load, missing resources
**Solutions**:
- Check file paths are correct
- Verify case sensitivity (especially on Linux servers)
- Ensure all files are uploaded
- Check server configuration

#### 2. CORS Issues
**Symptoms**: JavaScript errors about cross-origin requests
**Solutions**:
- Use proper web server instead of file:// protocol
- Configure CORS headers if needed
- Check for mixed content (HTTP/HTTPS)

#### 3. Caching Issues
**Symptoms**: Changes not appearing, old version loading
**Solutions**:
- Clear browser cache
- Update cache headers
- Use cache busting techniques
- Check CDN cache settings

#### 4. Performance Issues
**Symptoms**: Slow loading, poor frame rates
**Solutions**:
- Enable compression (gzip)
- Optimize images
- Use CDN
- Check server resources

#### 5. Mobile Issues
**Symptoms**: Game doesn't work on mobile devices
**Solutions**:
- Test responsive design
- Check touch event handling
- Verify mobile browser compatibility
- Test on actual devices

### Debugging Deployment

#### 1. Browser Developer Tools
- **Network Tab**: Check for failed requests
- **Console Tab**: Look for JavaScript errors
- **Application Tab**: Check localStorage functionality
- **Performance Tab**: Analyze loading performance

#### 2. Server-Side Debugging
```bash
# Check server logs
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log

# Test server response
curl -I https://idlecity.example.com

# Check file permissions
ls -la /var/www/idlecity/
```

#### 3. Network Testing
```bash
# Test DNS resolution
nslookup idlecity.example.com

# Test connectivity
ping idlecity.example.com

# Test HTTPS certificate
openssl s_client -connect idlecity.example.com:443
```

### Recovery Procedures

#### 1. Rollback Deployment
```bash
# GitHub Pages
git revert HEAD
git push origin main

# Manual deployment
cp -r backup/* /var/www/idlecity/
```

#### 2. Emergency Maintenance
```html
<!-- Create maintenance.html -->
<!DOCTYPE html>
<html>
<head>
    <title>IdleCity - Maintenance</title>
</head>
<body>
    <h1>Maintenance in Progress</h1>
    <p>IdleCity is currently undergoing maintenance. Please check back soon!</p>
</body>
</html>
```

## Security Considerations

### Content Security Policy
Add CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' cdn.tailwindcss.com; img-src 'self' data:; connect-src 'self';
```

### HTTPS Configuration
- Use strong SSL/TLS configuration
- Enable HSTS headers
- Redirect HTTP to HTTPS
- Use secure cookies if applicable

### Regular Updates
- Monitor for security vulnerabilities
- Update server software regularly
- Review access logs for suspicious activity
- Implement rate limiting if needed

---

## Conclusion

IdleCity can be deployed to various hosting platforms with minimal configuration. The key is ensuring proper static file serving, compression, and security headers.

Choose the deployment method that best fits your needs:
- **GitHub Pages**: Free, automatic, great for open source
- **Netlify/Vercel**: Easy setup, good performance, free tier available
- **Custom Server**: Full control, requires more maintenance
- **CDN**: Best performance, higher cost

For questions about deployment, please refer to the issue tracker or contact the development team.

Happy deploying! 🚀