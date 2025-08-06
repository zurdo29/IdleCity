#!/usr/bin/env node

// CDN Optimization and Asset Management for IdleCity
// Optimizes assets for global CDN delivery

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

class CDNOptimizer {
    constructor(options = {}) {
        this.options = {
            inputDir: options.inputDir || '.',
            outputDir: options.outputDir || 'dist',
            cdnUrl: options.cdnUrl || '',
            enableCompression: options.enableCompression !== false,
            enableMinification: options.enableMinification !== false,
            enableVersioning: options.enableVersioning !== false,
            enablePreload: options.enablePreload !== false,
            verbose: options.verbose || false,
            ...options
        };
        
        this.assetMap = {};
        this.preloadAssets = [];
        this.compressionStats = {};
    }
    
    async optimize() {
        console.log('🚀 Starting CDN optimization...');
        console.log(`Input: ${this.options.inputDir}`);
        console.log(`Output: ${this.options.outputDir}`);
        console.log('');
        
        try {
            // Create output directory
            this.ensureDirectory(this.options.outputDir);
            
            // Copy and optimize assets
            await this.processAssets();
            
            // Generate asset manifest
            await this.generateAssetManifest();
            
            // Update HTML with optimized assets
            await this.updateHTML();
            
            // Generate preload hints
            if (this.options.enablePreload) {
                await this.generatePreloadHints();
            }
            
            // Generate compression report
            this.generateCompressionReport();
            
            console.log('✅ CDN optimization completed!');
            
        } catch (error) {
            console.error('❌ CDN optimization failed:', error);
            throw error;
        }
    }
    
    async processAssets() {
        console.log('📦 Processing assets...');
        
        const files = this.getAllFiles(this.options.inputDir);
        
        for (const file of files) {
            const relativePath = path.relative(this.options.inputDir, file);
            
            // Skip certain files
            if (this.shouldSkipFile(relativePath)) {
                continue;
            }
            
            await this.processFile(file, relativePath);
        }
        
        console.log(`Processed ${Object.keys(this.assetMap).length} assets`);
        console.log('');
    }
    
    async processFile(filePath, relativePath) {
        const ext = path.extname(filePath).toLowerCase();
        const originalSize = fs.statSync(filePath).size;
        let outputPath = path.join(this.options.outputDir, relativePath);
        let content = fs.readFileSync(filePath);
        
        // Generate hash for versioning
        const hash = this.options.enableVersioning ? 
            crypto.createHash('md5').update(content).digest('hex').substring(0, 8) : '';
        
        // Add hash to filename if versioning is enabled
        if (hash && this.shouldVersionFile(ext)) {
            const parsedPath = path.parse(outputPath);
            outputPath = path.join(parsedPath.dir, `${parsedPath.name}.${hash}${parsedPath.ext}`);
            relativePath = path.relative(this.options.outputDir, outputPath);
        }
        
        // Minify if applicable
        if (this.options.enableMinification) {
            content = await this.minifyContent(content, ext, filePath);
        }
        
        // Ensure output directory exists
        this.ensureDirectory(path.dirname(outputPath));
        
        // Write optimized file
        fs.writeFileSync(outputPath, content);
        
        // Compress if enabled
        let compressedSize = content.length;
        if (this.options.enableCompression && this.shouldCompressFile(ext)) {
            await this.compressFile(outputPath);
            compressedSize = this.getCompressedSize(outputPath);
        }
        
        // Update asset map
        this.assetMap[path.posix.join(...relativePath.split(path.sep))] = {
            original: path.posix.join(...path.relative(this.options.inputDir, filePath).split(path.sep)),
            optimized: path.posix.join(...relativePath.split(path.sep)),
            hash: hash,
            originalSize: originalSize,
            optimizedSize: content.length,
            compressedSize: compressedSize,
            compressionRatio: originalSize > 0 ? (1 - compressedSize / originalSize) : 0
        };
        
        // Add to preload list if critical
        if (this.isCriticalAsset(relativePath)) {
            this.preloadAssets.push({
                href: this.options.cdnUrl + '/' + relativePath,
                as: this.getAssetType(ext),
                type: this.getMimeType(ext)
            });
        }
        
        if (this.options.verbose) {
            const savings = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;
            console.log(`  ✓ ${relativePath} (${savings}% smaller)`);
        }
    }
    
    async minifyContent(content, ext, filePath) {
        try {
            switch (ext) {
                case '.js':
                    return await this.minifyJavaScript(content.toString());
                case '.css':
                    return await this.minifyCSS(content.toString());
                case '.html':
                    return await this.minifyHTML(content.toString());
                case '.json':
                    return JSON.stringify(JSON.parse(content.toString()));
                default:
                    return content;
            }
        } catch (error) {
            console.warn(`⚠️  Could not minify ${filePath}:`, error.message);
            return content;
        }
    }
    
    async minifyJavaScript(content) {
        // Simple JavaScript minification (remove comments and extra whitespace)
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
            .replace(/\/\/.*$/gm, '') // Remove line comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
            .trim();
    }
    
    async minifyCSS(content) {
        // Simple CSS minification
        return content
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/;\s*}/g, '}') // Remove semicolons before closing braces
            .replace(/\s*{\s*/g, '{') // Clean up braces
            .replace(/;\s*/g, ';') // Clean up semicolons
            .trim();
    }
    
    async minifyHTML(content) {
        // Simple HTML minification
        return content
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/>\s+</g, '><') // Remove whitespace between tags
            .trim();
    }
    
    async compressFile(filePath) {
        try {
            // Create gzip version
            execSync(`gzip -9 -c "${filePath}" > "${filePath}.gz"`, { stdio: 'pipe' });
            
            // Create brotli version if available
            try {
                execSync(`brotli -9 -c "${filePath}" > "${filePath}.br"`, { stdio: 'pipe' });
            } catch (error) {
                // Brotli not available, skip
            }
        } catch (error) {
            console.warn(`⚠️  Could not compress ${filePath}:`, error.message);
        }
    }
    
    getCompressedSize(filePath) {
        try {
            // Try brotli first, then gzip, then original
            if (fs.existsSync(filePath + '.br')) {
                return fs.statSync(filePath + '.br').size;
            } else if (fs.existsSync(filePath + '.gz')) {
                return fs.statSync(filePath + '.gz').size;
            } else {
                return fs.statSync(filePath).size;
            }
        } catch (error) {
            return fs.statSync(filePath).size;
        }
    }
    
    async generateAssetManifest() {
        console.log('📋 Generating asset manifest...');
        
        const manifest = {
            version: Date.now(),
            cdnUrl: this.options.cdnUrl,
            assets: this.assetMap,
            preload: this.preloadAssets,
            generated: new Date().toISOString()
        };
        
        const manifestPath = path.join(this.options.outputDir, 'asset-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log(`Asset manifest saved to ${manifestPath}`);
        console.log('');
    }
    
    async updateHTML() {
        console.log('🔄 Updating HTML with optimized assets...');
        
        const htmlFiles = Object.keys(this.assetMap).filter(file => file.endsWith('.html'));
        
        for (const htmlFile of htmlFiles) {
            const htmlPath = path.join(this.options.outputDir, htmlFile);
            let content = fs.readFileSync(htmlPath, 'utf8');
            
            // Update asset references
            for (const [original, asset] of Object.entries(this.assetMap)) {
                if (original !== asset.optimized) {
                    const cdnUrl = this.options.cdnUrl ? this.options.cdnUrl + '/' : '';
                    content = content.replace(
                        new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                        cdnUrl + asset.optimized
                    );
                }
            }
            
            fs.writeFileSync(htmlPath, content);
        }
        
        console.log(`Updated ${htmlFiles.length} HTML file(s)`);
        console.log('');
    }
    
    async generatePreloadHints() {
        console.log('⚡ Generating preload hints...');
        
        const preloadHTML = this.preloadAssets
            .map(asset => `<link rel="preload" href="${asset.href}" as="${asset.as}" type="${asset.type}">`)
            .join('\n    ');
        
        const preloadPath = path.join(this.options.outputDir, 'preload-hints.html');
        fs.writeFileSync(preloadPath, preloadHTML);
        
        console.log(`Generated ${this.preloadAssets.length} preload hints`);
        console.log(`Preload hints saved to ${preloadPath}`);
        console.log('');
    }
    
    generateCompressionReport() {
        console.log('📊 Compression Report');
        console.log('====================');
        
        let totalOriginal = 0;
        let totalOptimized = 0;
        let totalCompressed = 0;
        
        const assetsByType = {};
        
        for (const asset of Object.values(this.assetMap)) {
            totalOriginal += asset.originalSize;
            totalOptimized += asset.optimizedSize;
            totalCompressed += asset.compressedSize;
            
            const ext = path.extname(asset.original);
            if (!assetsByType[ext]) {
                assetsByType[ext] = { count: 0, originalSize: 0, compressedSize: 0 };
            }
            
            assetsByType[ext].count++;
            assetsByType[ext].originalSize += asset.originalSize;
            assetsByType[ext].compressedSize += asset.compressedSize;
        }
        
        console.log(`Total assets: ${Object.keys(this.assetMap).length}`);
        console.log(`Original size: ${this.formatBytes(totalOriginal)}`);
        console.log(`Optimized size: ${this.formatBytes(totalOptimized)}`);
        console.log(`Compressed size: ${this.formatBytes(totalCompressed)}`);
        
        const optimizationSavings = totalOriginal > 0 ? Math.round((1 - totalOptimized / totalOriginal) * 100) : 0;
        const compressionSavings = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;
        
        console.log(`Optimization savings: ${optimizationSavings}%`);
        console.log(`Total savings: ${compressionSavings}%`);
        console.log('');
        
        console.log('By file type:');
        for (const [ext, stats] of Object.entries(assetsByType)) {
            const savings = stats.originalSize > 0 ? Math.round((1 - stats.compressedSize / stats.originalSize) * 100) : 0;
            console.log(`  ${ext || 'no extension'}: ${stats.count} files, ${savings}% smaller`);
        }
        
        console.log('');
    }
    
    getAllFiles(dir) {
        const files = [];
        
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                files.push(...this.getAllFiles(fullPath));
            } else {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    shouldSkipFile(relativePath) {
        const skipPatterns = [
            /^\.git/,
            /^node_modules/,
            /^\.kiro/,
            /^dist/,
            /^scripts/,
            /^tests/,
            /\.md$/,
            /\.log$/,
            /package\.json$/,
            /package-lock\.json$/
        ];
        
        return skipPatterns.some(pattern => pattern.test(relativePath));
    }
    
    shouldVersionFile(ext) {
        return ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2'].includes(ext);
    }
    
    shouldCompressFile(ext) {
        return ['.js', '.css', '.html', '.json', '.svg', '.txt'].includes(ext);
    }
    
    isCriticalAsset(relativePath) {
        const criticalPatterns = [
            /^css\/styles\.css$/,
            /^js\/game\.js$/,
            /^js\/ui\.js$/,
            /^manifest\.json$/
        ];
        
        return criticalPatterns.some(pattern => pattern.test(relativePath));
    }
    
    getAssetType(ext) {
        const typeMap = {
            '.js': 'script',
            '.css': 'style',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.gif': 'image',
            '.svg': 'image',
            '.woff': 'font',
            '.woff2': 'font',
            '.json': 'fetch'
        };
        
        return typeMap[ext] || 'fetch';
    }
    
    getMimeType(ext) {
        const mimeMap = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.html': 'text/html',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2'
        };
        
        return mimeMap[ext] || 'application/octet-stream';
    }
    
    ensureDirectory(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--input':
                options.inputDir = args[++i];
                break;
            case '--output':
                options.outputDir = args[++i];
                break;
            case '--cdn-url':
                options.cdnUrl = args[++i];
                break;
            case '--no-compression':
                options.enableCompression = false;
                break;
            case '--no-minification':
                options.enableMinification = false;
                break;
            case '--no-versioning':
                options.enableVersioning = false;
                break;
            case '--no-preload':
                options.enablePreload = false;
                break;
            case '--verbose':
                options.verbose = true;
                break;
            case '--help':
                console.log(`
CDN Optimizer for IdleCity

Usage: node cdn-optimizer.js [options]

Options:
  --input <dir>         Input directory (default: .)
  --output <dir>        Output directory (default: dist)
  --cdn-url <url>       CDN base URL
  --no-compression      Disable file compression
  --no-minification     Disable code minification
  --no-versioning       Disable file versioning
  --no-preload          Disable preload hint generation
  --verbose             Show detailed output
  --help                Show this help message

Examples:
  node cdn-optimizer.js --output dist --cdn-url https://cdn.example.com
  node cdn-optimizer.js --input src --output build --verbose
                `);
                process.exit(0);
                break;
        }
    }
    
    const optimizer = new CDNOptimizer(options);
    optimizer.optimize().catch(error => {
        console.error('CDN optimization failed:', error);
        process.exit(1);
    });
}

module.exports = CDNOptimizer;