#!/usr/bin/env node

/**
 * IdleCity Asset Optimizer
 * Optimizes game assets for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AssetOptimizer {
    constructor(options = {}) {
        this.options = {
            inputDir: options.inputDir || '.',
            outputDir: options.outputDir || 'dist',
            minifyJS: options.minifyJS !== false,
            minifyCSS: options.minifyCSS !== false,
            minifyHTML: options.minifyHTML !== false,
            removeComments: options.removeComments !== false,
            verbose: options.verbose || false,
            ...options
        };
        
        this.stats = {
            originalSize: 0,
            optimizedSize: 0,
            filesProcessed: 0,
            errors: []
        };
    }

    async optimize() {
        console.log('🚀 Starting asset optimization...');
        
        // Create output directory
        this.ensureDir(this.options.outputDir);
        
        // Copy all files first
        await this.copyFiles();
        
        // Optimize different file types
        if (this.options.minifyJS) {
            await this.optimizeJavaScript();
        }
        
        if (this.options.minifyCSS) {
            await this.optimizeCSS();
        }
        
        if (this.options.minifyHTML) {
            await this.optimizeHTML();
        }
        
        // Clean up development files
        await this.cleanupDevFiles();
        
        // Generate report
        this.generateReport();
        
        return this.stats;
    }

    async copyFiles() {
        console.log('📁 Copying source files...');
        
        try {
            execSync(`cp -r ${this.options.inputDir}/* ${this.options.outputDir}/`, { stdio: 'pipe' });
            console.log('✅ Files copied successfully');
        } catch (error) {
            console.error('❌ Error copying files:', error.message);
            this.stats.errors.push('File copy failed');
        }
    }

    async optimizeJavaScript() {
        console.log('📦 Optimizing JavaScript files...');
        
        const jsDir = path.join(this.options.outputDir, 'js');
        if (!fs.existsSync(jsDir)) {
            console.log('⚠️ No JavaScript directory found');
            return;
        }
        
        const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'));
        
        for (const file of jsFiles) {
            const filePath = path.join(jsDir, file);
            await this.optimizeJSFile(filePath);
        }
    }

    async optimizeJSFile(filePath) {
        try {
            const originalSize = fs.statSync(filePath).size;
            this.stats.originalSize += originalSize;
            
            // Check if terser is available
            try {
                execSync('which terser', { stdio: 'pipe' });
            } catch {
                console.log('⚠️ Terser not found, installing...');
                execSync('npm install -g terser', { stdio: 'pipe' });
            }
            
            // Minify with terser
            const outputPath = filePath + '.min';
            execSync(`terser "${filePath}" --compress --mangle --output "${outputPath}"`, { stdio: 'pipe' });
            
            // Replace original with minified
            fs.renameSync(outputPath, filePath);
            
            const optimizedSize = fs.statSync(filePath).size;
            this.stats.optimizedSize += optimizedSize;
            this.stats.filesProcessed++;
            
            const savings = originalSize - optimizedSize;
            const savingsPercent = Math.round((savings / originalSize) * 100);
            
            if (this.options.verbose) {
                console.log(`✅ ${path.basename(filePath)}: ${originalSize} → ${optimizedSize} bytes (-${savingsPercent}%)`);
            }
            
        } catch (error) {
            console.error(`❌ Error optimizing ${filePath}:`, error.message);
            this.stats.errors.push(`JS optimization failed: ${path.basename(filePath)}`);
        }
    }

    async optimizeCSS() {
        console.log('🎨 Optimizing CSS files...');
        
        const cssDir = path.join(this.options.outputDir, 'css');
        if (!fs.existsSync(cssDir)) {
            console.log('⚠️ No CSS directory found');
            return;
        }
        
        const cssFiles = fs.readdirSync(cssDir).filter(file => file.endsWith('.css'));
        
        for (const file of cssFiles) {
            const filePath = path.join(cssDir, file);
            await this.optimizeCSSFile(filePath);
        }
    }

    async optimizeCSSFile(filePath) {
        try {
            const originalSize = fs.statSync(filePath).size;
            this.stats.originalSize += originalSize;
            
            // Check if clean-css-cli is available
            try {
                execSync('which cleancss', { stdio: 'pipe' });
            } catch {
                console.log('⚠️ clean-css-cli not found, installing...');
                execSync('npm install -g clean-css-cli', { stdio: 'pipe' });
            }
            
            // Minify with clean-css
            const outputPath = filePath + '.min';
            execSync(`cleancss -o "${outputPath}" "${filePath}"`, { stdio: 'pipe' });
            
            // Replace original with minified
            fs.renameSync(outputPath, filePath);
            
            const optimizedSize = fs.statSync(filePath).size;
            this.stats.optimizedSize += optimizedSize;
            this.stats.filesProcessed++;
            
            const savings = originalSize - optimizedSize;
            const savingsPercent = Math.round((savings / originalSize) * 100);
            
            if (this.options.verbose) {
                console.log(`✅ ${path.basename(filePath)}: ${originalSize} → ${optimizedSize} bytes (-${savingsPercent}%)`);
            }
            
        } catch (error) {
            console.error(`❌ Error optimizing ${filePath}:`, error.message);
            this.stats.errors.push(`CSS optimization failed: ${path.basename(filePath)}`);
        }
    }

    async optimizeHTML() {
        console.log('📄 Optimizing HTML files...');
        
        const htmlFiles = fs.readdirSync(this.options.outputDir)
            .filter(file => file.endsWith('.html'));
        
        for (const file of htmlFiles) {
            const filePath = path.join(this.options.outputDir, file);
            await this.optimizeHTMLFile(filePath);
        }
    }

    async optimizeHTMLFile(filePath) {
        try {
            const originalSize = fs.statSync(filePath).size;
            this.stats.originalSize += originalSize;
            
            // Check if html-minifier-terser is available
            try {
                execSync('which html-minifier-terser', { stdio: 'pipe' });
            } catch {
                console.log('⚠️ html-minifier-terser not found, installing...');
                execSync('npm install -g html-minifier-terser', { stdio: 'pipe' });
            }
            
            // Minify HTML with careful options to preserve game functionality
            const outputPath = filePath + '.min';
            const minifyOptions = [
                '--collapse-whitespace',
                '--remove-comments',
                '--remove-optional-tags',
                '--remove-redundant-attributes',
                '--remove-script-type-attributes',
                '--remove-tag-whitespace',
                '--use-short-doctype',
                '--minify-css true',
                '--minify-js true'
            ].join(' ');
            
            execSync(`html-minifier-terser ${minifyOptions} --output "${outputPath}" "${filePath}"`, { stdio: 'pipe' });
            
            // Replace original with minified
            fs.renameSync(outputPath, filePath);
            
            const optimizedSize = fs.statSync(filePath).size;
            this.stats.optimizedSize += optimizedSize;
            this.stats.filesProcessed++;
            
            const savings = originalSize - optimizedSize;
            const savingsPercent = Math.round((savings / originalSize) * 100);
            
            if (this.options.verbose) {
                console.log(`✅ ${path.basename(filePath)}: ${originalSize} → ${optimizedSize} bytes (-${savingsPercent}%)`);
            }
            
        } catch (error) {
            console.error(`❌ Error optimizing ${filePath}:`, error.message);
            this.stats.errors.push(`HTML optimization failed: ${path.basename(filePath)}`);
        }
    }

    async cleanupDevFiles() {
        console.log('🧹 Cleaning up development files...');
        
        const devFiles = [
            '.git',
            '.github',
            'node_modules',
            'package.json',
            'package-lock.json',
            '.gitignore',
            'README.md',
            'BUILD.md',
            'scripts'
        ];
        
        for (const file of devFiles) {
            const filePath = path.join(this.options.outputDir, file);
            if (fs.existsSync(filePath)) {
                try {
                    if (fs.statSync(filePath).isDirectory()) {
                        execSync(`rm -rf "${filePath}"`, { stdio: 'pipe' });
                    } else {
                        fs.unlinkSync(filePath);
                    }
                    
                    if (this.options.verbose) {
                        console.log(`🗑️ Removed: ${file}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not remove ${file}:`, error.message);
                }
            }
        }
    }

    generateReport() {
        const totalSavings = this.stats.originalSize - this.stats.optimizedSize;
        const savingsPercent = this.stats.originalSize > 0 
            ? Math.round((totalSavings / this.stats.originalSize) * 100)
            : 0;
        
        console.log('\n📊 Optimization Report:');
        console.log('========================');
        console.log(`Files processed: ${this.stats.filesProcessed}`);
        console.log(`Original size: ${this.formatBytes(this.stats.originalSize)}`);
        console.log(`Optimized size: ${this.formatBytes(this.stats.optimizedSize)}`);
        console.log(`Total savings: ${this.formatBytes(totalSavings)} (-${savingsPercent}%)`);
        
        if (this.stats.errors.length > 0) {
            console.log(`\n⚠️ Errors encountered: ${this.stats.errors.length}`);
            this.stats.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        console.log('\n✅ Asset optimization completed!');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = {};
    
    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];
        
        switch (flag) {
            case '--input':
                options.inputDir = value;
                break;
            case '--output':
                options.outputDir = value;
                break;
            case '--no-js':
                options.minifyJS = false;
                i--; // No value for this flag
                break;
            case '--no-css':
                options.minifyCSS = false;
                i--; // No value for this flag
                break;
            case '--no-html':
                options.minifyHTML = false;
                i--; // No value for this flag
                break;
            case '--verbose':
                options.verbose = true;
                i--; // No value for this flag
                break;
            case '--help':
                console.log('IdleCity Asset Optimizer');
                console.log('Usage: node optimize-assets.js [options]');
                console.log('Options:');
                console.log('  --input <dir>     Input directory (default: .)');
                console.log('  --output <dir>    Output directory (default: dist)');
                console.log('  --no-js           Skip JavaScript minification');
                console.log('  --no-css          Skip CSS minification');
                console.log('  --no-html         Skip HTML minification');
                console.log('  --verbose         Verbose output');
                console.log('  --help            Show this help');
                process.exit(0);
        }
    }
    
    const optimizer = new AssetOptimizer(options);
    
    optimizer.optimize()
        .then(stats => {
            console.log('\n🎉 Optimization completed successfully!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Optimization failed:', error.message);
            process.exit(1);
        });
}

module.exports = AssetOptimizer;