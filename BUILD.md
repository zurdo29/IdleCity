# IdleCity - Build Instructions

This document provides instructions for building, testing, and deploying IdleCity.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Build Process](#build-process)
- [Testing](#testing)
- [Deployment](#deployment)
- [Asset Optimization](#asset-optimization)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Git**: Version control system
- **Modern Web Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+
- **Text Editor/IDE**: VS Code, Sublime Text, or similar
- **Local Web Server** (optional): Python, Node.js, or PHP for local development

### Optional Tools
- **Node.js**: For running optimization scripts
- **Python**: For simple HTTP server
- **Browser Extensions**: Web Developer tools, accessibility checkers

## Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/username/idlecity.git
cd idlecity
```

### 2. Set Up Local Development Server (Optional)

#### Using Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Using Node.js
```bash
# Install serve globally
npm install -g serve

# Serve current directory
serve -s . -l 8000
```

#### Using PHP
```bash
php -S localhost:8000
```

### 3. Open in Browser
Navigate to `http://localhost:8000` or open `index.html` directly in your browser.

## Build Process

IdleCity is a client-side only application that doesn't require a traditional build process. However, there are optimization steps for production deployment.

### Development Build
For development, simply open the files in a web browser:
1. Open `index.html` in your browser
2. The game will load all JavaScript and CSS files
3. All features will be available for testing

### Production Optimization

#### 1. Asset Optimization
Run the asset optimization script:
```bash
node scripts/optimize-assets.js
```

This script:
- Validates HTML, CSS, and JavaScript syntax
- Checks for missing dependencies
- Optimizes file sizes where possible
- Generates optimization report

#### 2. Manual Optimization Steps
- **Minify CSS**: Compress `css/styles.css` for production
- **Optimize Images**: Compress any image assets
- **Validate HTML**: Ensure HTML5 compliance
- **Check Links**: Verify all internal links work

#### 3. Performance Validation
```bash
# Run performance tests
node scripts/performance-test.js

# Check bundle size
node scripts/check-bundle-size.js
```

## Testing

### Automated Testing
```bash
# Run all automated tests
node scripts/run-tests.js

# Run specific test suites
node scripts/run-tests.js --suite=core
node scripts/run-tests.js --suite=ui
node scripts/run-tests.js --suite=storage
```

### Manual Testing
1. **Open Testing Console**: Press F12 in browser
2. **Run Test Suite**: Execute `Testing.runAllTests()` in console
3. **Check Results**: Review test output for any failures
4. **Performance Check**: Run `Performance.getReport()` to check performance

### Browser Testing
Test on all supported browsers:
- Chrome (latest and 80+)
- Firefox (latest and 75+)
- Safari (latest and 13+)
- Edge (latest and 80+)

### Mobile Testing
Test on mobile devices:
- iOS Safari (iPhone/iPad)
- Android Chrome
- Various screen sizes and orientations

## Deployment

### GitHub Pages Deployment (Automated)
The project uses GitHub Actions for automatic deployment:

1. **Push to Main**: Push changes to the main branch
2. **Automatic Build**: GitHub Actions triggers deployment
3. **Live Update**: Game is automatically deployed to GitHub Pages

### Manual Deployment
For manual deployment to other platforms:

#### 1. Prepare Files
```bash
# Create deployment directory
mkdir deploy
cp -r * deploy/
cd deploy

# Remove development files
rm -rf .git
rm -rf scripts/dev-*
rm README.md
```

#### 2. Upload to Server
Upload the contents of the `deploy` directory to your web server.

#### 3. Configure Server
Ensure your web server:
- Serves static files correctly
- Has proper MIME types configured
- Supports HTTPS (recommended)
- Has appropriate caching headers

### Deployment Checklist
- [ ] All files copied correctly
- [ ] Game loads without errors
- [ ] All features function properly
- [ ] Performance is acceptable
- [ ] Save/load works correctly
- [ ] Mobile version works
- [ ] HTTPS is configured (if applicable)

## Asset Optimization

### CSS Optimization
```bash
# Minify CSS (manual process)
# Use online tools or build tools to minify css/styles.css
```

### JavaScript Optimization
The JavaScript files are already optimized for readability and maintainability. For production, you can:
- Minify individual files
- Combine files (optional)
- Remove console.log statements (optional)

### Image Optimization
If you add images to the project:
- Use WebP format when possible
- Compress images appropriately
- Provide multiple sizes for responsive images
- Use lazy loading for non-critical images

### Performance Optimization
- **Enable Gzip**: Configure server to compress files
- **Set Cache Headers**: Cache static assets appropriately
- **Use CDN**: Consider using a CDN for better global performance
- **Optimize Fonts**: Use system fonts or optimize web fonts

## Troubleshooting

### Common Build Issues

#### Files Not Loading
- **Check File Paths**: Ensure all file paths are correct
- **Case Sensitivity**: Check file name case on case-sensitive systems
- **CORS Issues**: Use a local server instead of file:// protocol

#### JavaScript Errors
- **Syntax Errors**: Check browser console for syntax errors
- **Missing Dependencies**: Ensure all script files are loaded
- **Load Order**: Verify scripts load in correct order

#### CSS Not Applied
- **File Path**: Check CSS file path in HTML
- **Syntax Errors**: Validate CSS syntax
- **Specificity**: Check CSS specificity conflicts

#### Performance Issues
- **Browser Compatibility**: Test on different browsers
- **Memory Leaks**: Check for memory leaks in long sessions
- **Frame Rate**: Monitor frame rate during gameplay

### Development Issues

#### Local Server Problems
```bash
# Check if port is in use
netstat -an | grep 8000

# Use different port
python -m http.server 8080
```

#### Git Issues
```bash
# Reset to clean state
git reset --hard HEAD
git clean -fd

# Update from remote
git pull origin main
```

#### Browser Cache Issues
- Clear browser cache and cookies
- Use incognito/private mode
- Hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Deployment Issues

#### GitHub Pages Not Updating
- Check GitHub Actions status
- Verify branch settings in repository
- Check for build errors in Actions log

#### Files Not Found (404)
- Verify file paths are correct
- Check case sensitivity
- Ensure all files are committed and pushed

#### Performance Issues on Server
- Check server resources
- Verify gzip compression is enabled
- Monitor server response times

## Scripts Reference

### Available Scripts
- `scripts/optimize-assets.js` - Optimize assets for production
- `scripts/deploy-monitor.js` - Monitor deployment status
- `scripts/deployment-status.sh` - Check deployment health
- `scripts/run-tests.js` - Run automated tests
- `scripts/performance-test.js` - Performance testing
- `scripts/check-bundle-size.js` - Check file sizes

### Running Scripts
```bash
# Make scripts executable (Unix/Linux/Mac)
chmod +x scripts/*.sh

# Run shell scripts
./scripts/deployment-status.sh

# Run Node.js scripts
node scripts/optimize-assets.js
```

## Environment Variables

### Development
No environment variables required for development.

### Production
For production deployment, you may want to set:
- `NODE_ENV=production` (if using Node.js scripts)
- `GITHUB_TOKEN` (for GitHub Actions deployment)

## File Structure for Deployment

```
idlecity/
├── index.html          # Main game file
├── css/
│   └── styles.css      # Game styles
├── js/
│   ├── game.js         # Core game logic
│   ├── ui.js           # UI management
│   ├── storage.js      # Save/load system
│   ├── achievements.js # Achievement system
│   ├── statistics.js   # Statistics tracking
│   ├── performance.js  # Performance monitoring
│   └── testing.js      # Testing utilities
└── docs/               # Documentation (optional for deployment)
```

## Quality Assurance

### Pre-Deployment Checklist
- [ ] All tests pass
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Works on all target browsers
- [ ] Mobile experience is good
- [ ] Accessibility standards met
- [ ] Save/load functionality works
- [ ] All features function correctly

### Post-Deployment Verification
- [ ] Game loads correctly on live site
- [ ] All features work as expected
- [ ] Performance is acceptable
- [ ] No broken links or missing files
- [ ] Mobile version works properly
- [ ] Save/load works on live site

---

## Conclusion

IdleCity's build process is straightforward due to its client-side nature. The focus is on testing, optimization, and ensuring compatibility across different browsers and devices.

For questions about the build process, please refer to the issue tracker or contact the development team.

Happy building! 🔨