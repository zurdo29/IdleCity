# IdleCity Deployment Guide

## 🚀 Deployment Overview

IdleCity features a comprehensive deployment system with automated optimization, monitoring, and error handling. The deployment workflow is designed for GitHub Pages but can be adapted for other static hosting services.

## 📋 Features

### ✅ **Enhanced GitHub Actions Workflow**
- **Automated Asset Optimization**: JavaScript, CSS, and HTML minification
- **Retry Logic**: Automatic retry on deployment failures
- **Enhanced Health Checks**: Comprehensive site validation with content verification
- **Performance Monitoring**: Response time and size tracking
- **Manual Deployment Triggers**: Workflow dispatch with customizable options
- **Detailed Reporting**: Comprehensive deployment summaries with optimization metrics

### ✅ **Deployment Tools**
- **Asset Optimizer**: Standalone tool for optimizing game assets
- **Deployment Monitor**: Health checking and performance monitoring
- **Status Script**: Comprehensive deployment status and management

## 🔧 GitHub Actions Workflow

### Workflow Features

#### **Manual Deployment Options**
```yaml
# Trigger manual deployment with options
workflow_dispatch:
  inputs:
    environment:        # production/staging
    skip_tests:        # Skip asset verification
    force_deploy:      # Force deploy even if health checks fail
```

#### **Two-Stage Deployment**
1. **Prepare Stage**: Asset verification and optimization
2. **Deploy Stage**: Deployment with enhanced monitoring

#### **Asset Optimization**
- JavaScript minification with Terser
- CSS minification with clean-css
- HTML minification with html-minifier-terser
- Size reporting and savings calculation
- Development file cleanup

#### **Enhanced Health Checks**
- Multiple retry attempts (configurable)
- Content validation (game title, scripts, styles)
- Response time monitoring
- Detailed error reporting

#### **Comprehensive Reporting**
- Deployment summary with optimization metrics
- Performance analysis
- Quick links to deployed site and workflow
- Error tracking and notifications

## 🛠️ Deployment Tools

### 1. Asset Optimizer (`scripts/optimize-assets.js`)

Optimizes game assets for production deployment.

#### Usage:
```bash
node scripts/optimize-assets.js [options]

Options:
  --input <dir>     Input directory (default: .)
  --output <dir>    Output directory (default: dist)
  --no-js           Skip JavaScript minification
  --no-css          Skip CSS minification
  --no-html         Skip HTML minification
  --verbose         Verbose output
```

#### Features:
- JavaScript minification with compression and mangling
- CSS optimization with clean-css
- HTML minification with game-safe options
- Development file cleanup
- Detailed optimization reporting

### 2. Deployment Monitor (`scripts/deploy-monitor.js`)

Monitors deployment health and performance.

#### Usage:
```bash
node scripts/deploy-monitor.js <url> [options]

Options:
  --retries <n>     Number of retry attempts (default: 5)
  --timeout <ms>    Request timeout (default: 30000)
  --interval <ms>   Retry interval (default: 10000)
  --monitor <ms>    Monitor for duration (default: 300000)
  --verbose         Verbose output
```

#### Features:
- HTTP status code checking
- Content validation (game title, scripts, styles)
- Response time measurement
- Performance monitoring over time
- Detailed analysis and reporting

### 3. Deployment Status Script (`scripts/deployment-status.sh`)

Comprehensive deployment management tool.

#### Usage:
```bash
./scripts/deployment-status.sh [command] [options]

Commands:
  status          Show current deployment status
  monitor <url>   Monitor deployment health
  optimize        Optimize assets for deployment
  deploy          Trigger manual deployment
  logs            Show deployment logs
  clean           Clean deployment artifacts
```

#### Features:
- Deployment status tracking
- File verification
- GitHub Actions integration
- Log management
- Artifact cleanup

## 📊 Deployment Process

### Automatic Deployment (Push to main)
1. **Trigger**: Push to main branch
2. **Verification**: Enhanced asset verification with syntax checking
3. **Optimization**: Asset minification and compression
4. **Deployment**: Deploy to GitHub Pages with retry logic
5. **Health Check**: Comprehensive site validation
6. **Monitoring**: Performance metrics collection
7. **Reporting**: Detailed deployment summary

### Manual Deployment
1. **GitHub UI**: Go to Actions → Deploy to GitHub Pages → Run workflow
2. **GitHub CLI**: `gh workflow run deploy.yml`
3. **Status Script**: `./scripts/deployment-status.sh deploy`

## 🔍 Monitoring and Troubleshooting

### Health Check Process
1. **HTTP Status**: Verify 200 OK response
2. **Content Validation**: Check for game title and scripts
3. **Performance**: Measure response time and size
4. **Retry Logic**: Up to 10 attempts with configurable delays

### Common Issues and Solutions

#### **Deployment Fails**
- Check GitHub Actions logs
- Verify all required files exist
- Run local asset verification: `./scripts/deployment-status.sh status`

#### **Health Check Fails**
- Wait for DNS propagation (can take up to 10 minutes)
- Check if site is accessible manually
- Use force deploy option if content is correct

#### **Performance Issues**
- Review optimization report for large files
- Check network conditions
- Monitor over time: `node scripts/deploy-monitor.js <url> --monitor 300000`

### Debugging Commands
```bash
# Check deployment status
./scripts/deployment-status.sh status

# Monitor deployment health
./scripts/deployment-status.sh monitor https://your-site.github.io

# View deployment logs
./scripts/deployment-status.sh logs

# Optimize assets locally
./scripts/deployment-status.sh optimize

# Clean deployment artifacts
./scripts/deployment-status.sh clean
```

## 📈 Performance Optimization

### Asset Optimization Results
Typical optimization savings:
- **JavaScript**: 30-50% size reduction
- **CSS**: 20-40% size reduction  
- **HTML**: 10-20% size reduction
- **Total**: 25-45% overall size reduction

### Performance Targets
- **Load Time**: < 3 seconds
- **First Contentful Paint**: < 2 seconds
- **Time to Interactive**: < 4 seconds

## 🔐 Security Considerations

### Deployment Security
- GitHub Actions secrets for sensitive data
- Repository access controls
- Automated security scanning
- Content Security Policy headers

### Asset Security
- Input validation for all optimizations
- Safe HTML minification options
- Script integrity verification
- XSS prevention in dynamic content

## 🚀 Advanced Configuration

### Environment Variables
```yaml
env:
  DEPLOYMENT_TIMEOUT: 300      # Deployment timeout in seconds
  HEALTH_CHECK_RETRIES: 10     # Number of health check attempts
  HEALTH_CHECK_DELAY: 15       # Delay between health checks
```

### Custom Optimization
```javascript
// Custom optimization options
const optimizer = new AssetOptimizer({
  inputDir: './src',
  outputDir: './dist',
  minifyJS: true,
  minifyCSS: true,
  minifyHTML: false,  // Disable HTML minification
  verbose: true
});
```

### Monitoring Configuration
```javascript
// Custom monitoring setup
const monitor = new DeploymentMonitor(url, {
  timeout: 30000,
  retries: 10,
  interval: 15000,
  verbose: true
});
```

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Web Performance Best Practices](https://web.dev/performance/)
- [Asset Optimization Guide](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency)

## 🆘 Support

If you encounter issues with deployment:

1. **Check Status**: `./scripts/deployment-status.sh status`
2. **Review Logs**: Check GitHub Actions logs and local deployment logs
3. **Monitor Health**: Use deployment monitor to verify site functionality
4. **Force Deploy**: Use manual deployment with force option if needed
5. **Clean and Retry**: Clean artifacts and retry deployment

For persistent issues, check the GitHub repository issues or create a new issue with deployment logs and error details.