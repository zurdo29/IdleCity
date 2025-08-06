// IdleCity Performance Management System
// Handles performance monitoring, optimization, and reliability improvements

const Performance = {
    // Performance metrics
    metrics: {
        frameRate: 60,
        averageFrameTime: 16.67, // milliseconds
        frameHistory: [],
        memoryUsage: 0,
        domUpdateCount: 0,
        errorCount: 0,
        lastFrameTime: 0,
        performanceScore: 100
    },
    
    // Performance settings
    settings: {
        targetFrameRate: 60,
        minFrameRate: 30,
        maxFrameRate: 120,
        adaptivePerformance: true,
        memoryCleanupInterval: 300000, // 5 minutes
        performanceReportInterval: 60000, // 1 minute
        maxFrameHistory: 60, // Keep last 60 frames
        errorThreshold: 10 // Max errors before degraded mode
    },
    
    // Performance state
    state: {
        isRunning: false,
        isDegraded: false,
        lastCleanup: Date.now(),
        lastReport: Date.now(),
        animationFrameId: null,
        performanceObserver: null
    },
    
    // DOM update batching
    domUpdates: {
        pending: new Map(),
        batchTimeout: null,
        batchSize: 0
    },
    
    // Memory management
    memory: {
        trackedObjects: new WeakSet(),
        eventListeners: new Map(),
        intervals: new Set(),
        timeouts: new Set(),
        caches: new Map()
    },
    
    // Error handling
    errors: {
        handlers: new Map(),
        recoveryStrategies: new Map(),
        errorLog: []
    },
    
    init() {
        console.log('⚡ Initializing performance management system...');
        
        try {
            // Check browser compatibility
            this.checkBrowserCompatibility();
            
            // Initialize performance monitoring
            this.initPerformanceMonitoring();
            
            // Set up memory management
            this.initMemoryManagement();
            
            // Initialize error handling
            this.initErrorHandling();
            
            // Start performance monitoring
            this.start();
            
            console.log('✅ Performance management system initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize performance system:', error);
            this.handleError('init', error);
            return false;
        }
    },
    
    checkBrowserCompatibility() {
        const features = {
            requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
            performance: typeof performance !== 'undefined' && performance.now,
            weakSet: typeof WeakSet !== 'undefined',
            map: typeof Map !== 'undefined',
            localStorage: this.checkLocalStorage(),
            webWorkers: typeof Worker !== 'undefined',
            performanceObserver: typeof PerformanceObserver !== 'undefined'
        };
        
        console.log('🔍 Browser compatibility check:', features);
        
        // Set fallbacks for missing features
        if (!features.requestAnimationFrame) {
            window.requestAnimationFrame = (callback) => setTimeout(callback, 16);
            window.cancelAnimationFrame = clearTimeout;
        }
        
        if (!features.performance) {
            window.performance = { now: () => Date.now() };
        }
        
        return features;
    },
    
    checkLocalStorage() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    initPerformanceMonitoring() {
        // Initialize performance observer if available
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                this.state.performanceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            this.recordPerformanceEntry(entry);
                        }
                    });
                });
                
                this.state.performanceObserver.observe({ entryTypes: ['measure'] });
            } catch (error) {
                console.warn('⚠️ PerformanceObserver not fully supported:', error);
            }
        }
        
        // Set up frame rate monitoring
        this.metrics.lastFrameTime = performance.now();
    },
    
    initMemoryManagement() {
        // Set up periodic memory cleanup
        const cleanupInterval = setInterval(() => {
            this.performMemoryCleanup();
        }, this.settings.memoryCleanupInterval);
        
        this.memory.intervals.add(cleanupInterval);
        
        // Track memory usage if available
        if (performance.memory) {
            setInterval(() => {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
            }, 5000);
        }
    },
    
    initErrorHandling() {
        // Global error handler
        const originalErrorHandler = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError('global', error || new Error(message), {
                source, lineno, colno
            });
            
            if (originalErrorHandler) {
                return originalErrorHandler(message, source, lineno, colno, error);
            }
            return false;
        };
        
        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('promise', event.reason);
        });
        
        // Register common error recovery strategies
        this.registerErrorRecovery('gameLoop', () => {
            console.log('🔄 Attempting to restart game loop...');
            if (typeof GameLoop !== 'undefined') {
                GameLoop.stop();
                setTimeout(() => GameLoop.start(), 1000);
            }
        });
        
        this.registerErrorRecovery('ui', () => {
            console.log('🔄 Attempting to refresh UI...');
            if (typeof UI !== 'undefined') {
                try {
                    UI.updateAll();
                } catch (error) {
                    console.warn('UI refresh failed:', error);
                }
            }
        });
    },
    
    start() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.startPerformanceLoop();
        
        console.log('🚀 Performance monitoring started');
    },
    
    stop() {
        if (!this.state.isRunning) return;
        
        this.state.isRunning = false;
        
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
        
        console.log('⏹️ Performance monitoring stopped');
    },
    
    startPerformanceLoop() {
        const loop = (currentTime) => {
            if (!this.state.isRunning) return;
            
            // Calculate frame time
            const frameTime = currentTime - this.metrics.lastFrameTime;
            this.metrics.lastFrameTime = currentTime;
            
            // Update frame rate metrics
            this.updateFrameMetrics(frameTime);
            
            // Check if we need to adjust performance
            if (this.settings.adaptivePerformance) {
                this.adjustPerformance();
            }
            
            // Process batched DOM updates
            this.processBatchedDOMUpdates();
            
            // Periodic maintenance
            this.performPeriodicMaintenance(currentTime);
            
            // Schedule next frame
            this.state.animationFrameId = requestAnimationFrame(loop);
        };
        
        this.state.animationFrameId = requestAnimationFrame(loop);
    },
    
    updateFrameMetrics(frameTime) {
        // Add to frame history
        this.metrics.frameHistory.push(frameTime);
        
        // Keep only recent frames
        if (this.metrics.frameHistory.length > this.settings.maxFrameHistory) {
            this.metrics.frameHistory.shift();
        }
        
        // Calculate average frame time
        const sum = this.metrics.frameHistory.reduce((a, b) => a + b, 0);
        this.metrics.averageFrameTime = sum / this.metrics.frameHistory.length;
        
        // Calculate frame rate
        this.metrics.frameRate = 1000 / this.metrics.averageFrameTime;
        
        // Update performance score
        this.updatePerformanceScore();
    },
    
    updatePerformanceScore() {
        let score = 100;
        
        // Penalize low frame rates
        if (this.metrics.frameRate < this.settings.minFrameRate) {
            score -= (this.settings.minFrameRate - this.metrics.frameRate) * 2;
        }
        
        // Penalize high memory usage
        if (this.metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
            score -= 20;
        }
        
        // Penalize errors
        score -= this.metrics.errorCount * 5;
        
        this.metrics.performanceScore = Math.max(0, Math.min(100, score));
        
        // Enter degraded mode if performance is too low
        if (this.metrics.performanceScore < 30 && !this.state.isDegraded) {
            this.enterDegradedMode();
        } else if (this.metrics.performanceScore > 70 && this.state.isDegraded) {
            this.exitDegradedMode();
        }
    },
    
    adjustPerformance() {
        // Adjust game loop timing based on performance
        if (typeof GameLoop !== 'undefined' && GameLoop.tickRate) {
            if (this.metrics.frameRate < this.settings.minFrameRate) {
                // Slow down game loop to improve performance
                GameLoop.tickRate = Math.min(200, GameLoop.tickRate + 10);
            } else if (this.metrics.frameRate > this.settings.targetFrameRate) {
                // Speed up game loop if performance is good
                GameLoop.tickRate = Math.max(50, GameLoop.tickRate - 5);
            }
        }
    },
    
    enterDegradedMode() {
        console.warn('⚠️ Entering degraded performance mode');
        this.state.isDegraded = true;
        
        // Reduce update frequency
        if (typeof GameLoop !== 'undefined') {
            GameLoop.tickRate = Math.max(GameLoop.tickRate, 200);
        }
        
        // Disable non-essential features
        this.disableNonEssentialFeatures();
        
        // Notify user
        if (typeof UI !== 'undefined') {
            UI.showNotification(
                'Performance mode activated - some features reduced for better performance',
                'warning',
                5000
            );
        }
    },
    
    exitDegradedMode() {
        console.log('✅ Exiting degraded performance mode');
        this.state.isDegraded = false;
        
        // Re-enable features
        this.enableNonEssentialFeatures();
        
        // Notify user
        if (typeof UI !== 'undefined') {
            UI.showNotification('Performance restored - all features enabled', 'success', 3000);
        }
    },
    
    disableNonEssentialFeatures() {
        // Reduce animation frequency
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
        
        // Disable complex visual effects
        document.body.classList.add('performance-mode');
    },
    
    enableNonEssentialFeatures() {
        // Restore normal animations
        document.documentElement.style.removeProperty('--animation-duration');
        
        // Re-enable visual effects
        document.body.classList.remove('performance-mode');
    },
    
    // DOM Update Batching
    batchDOMUpdate(element, property, value) {
        const key = `${element.id || element.tagName}-${property}`;
        
        this.domUpdates.pending.set(key, {
            element,
            property,
            value,
            timestamp: performance.now()
        });
        
        this.domUpdates.batchSize++;
        
        // Schedule batch processing if not already scheduled
        if (!this.domUpdates.batchTimeout) {
            this.domUpdates.batchTimeout = setTimeout(() => {
                this.processBatchedDOMUpdates();
            }, 16); // Next frame
        }
    },
    
    processBatchedDOMUpdates() {
        if (this.domUpdates.pending.size === 0) return;
        
        const startTime = performance.now();
        
        // Process all pending updates
        for (const [key, update] of this.domUpdates.pending) {
            try {
                if (update.property === 'textContent') {
                    update.element.textContent = update.value;
                } else if (update.property === 'innerHTML') {
                    update.element.innerHTML = update.value;
                } else if (update.property === 'style') {
                    Object.assign(update.element.style, update.value);
                } else if (update.property === 'className') {
                    update.element.className = update.value;
                } else {
                    update.element[update.property] = update.value;
                }
            } catch (error) {
                this.handleError('domUpdate', error, { key, update });
            }
        }
        
        // Clear pending updates
        this.domUpdates.pending.clear();
        this.domUpdates.batchTimeout = null;
        this.domUpdates.batchSize = 0;
        
        const endTime = performance.now();
        this.metrics.domUpdateCount++;
        
        // Log performance if it took too long
        if (endTime - startTime > 5) {
            console.warn(`⚠️ DOM batch update took ${(endTime - startTime).toFixed(2)}ms`);
        }
    },
    
    // Memory Management
    performMemoryCleanup() {
        console.log('🧹 Performing memory cleanup...');
        
        const startTime = performance.now();
        
        try {
            // Show cleanup indicator
            this.showCleanupIndicator();
            
            // Clear old cache entries
            this.cleanupCaches();
            
            // Clean up event listeners
            this.cleanupEventListeners();
            
            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
            
            // Update last cleanup time
            this.state.lastCleanup = Date.now();
            
            const endTime = performance.now();
            console.log(`✅ Memory cleanup completed in ${(endTime - startTime).toFixed(2)}ms`);
            
        } catch (error) {
            this.handleError('memoryCleanup', error);
        }
    },
    
    cleanupCaches() {
        // Clean up old cache entries
        for (const [key, cache] of this.memory.caches) {
            if (cache.expiry && Date.now() > cache.expiry) {
                this.memory.caches.delete(key);
            }
        }
    },
    
    cleanupEventListeners() {
        // Remove orphaned event listeners
        for (const [element, listeners] of this.memory.eventListeners) {
            if (!document.contains(element)) {
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
                this.memory.eventListeners.delete(element);
            }
        }
    },
    
    trackEventListener(element, event, handler) {
        if (!this.memory.eventListeners.has(element)) {
            this.memory.eventListeners.set(element, []);
        }
        this.memory.eventListeners.get(element).push({ event, handler });
    },
    
    // Error Handling
    handleError(context, error, details = {}) {
        this.metrics.errorCount++;
        
        const errorInfo = {
            context,
            error: error.message || error,
            stack: error.stack,
            details,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Log error
        console.error(`❌ Error in ${context}:`, error, details);
        this.errors.errorLog.push(errorInfo);
        
        // Keep only recent errors
        if (this.errors.errorLog.length > 100) {
            this.errors.errorLog.shift();
        }
        
        // Attempt recovery
        this.attemptErrorRecovery(context, error);
        
        // Check if we need to enter safe mode
        if (this.metrics.errorCount > this.settings.errorThreshold) {
            this.enterSafeMode();
        }
    },
    
    registerErrorRecovery(context, recoveryFunction) {
        this.errors.recoveryStrategies.set(context, recoveryFunction);
    },
    
    attemptErrorRecovery(context, error) {
        const recovery = this.errors.recoveryStrategies.get(context);
        if (recovery) {
            try {
                recovery(error);
                console.log(`🔄 Recovery attempted for ${context}`);
            } catch (recoveryError) {
                console.error(`❌ Recovery failed for ${context}:`, recoveryError);
            }
        }
    },
    
    enterSafeMode() {
        console.warn('🚨 Entering safe mode due to excessive errors');
        
        // Stop non-essential systems
        this.stop();
        
        // Notify user
        if (typeof UI !== 'undefined') {
            UI.showNotification(
                'Safe mode activated due to errors. Some features may be limited.',
                'error',
                10000
            );
        }
    },
    
    // Performance Reporting
    performPeriodicMaintenance(currentTime) {
        // Generate performance report
        if (currentTime - this.state.lastReport > this.settings.performanceReportInterval) {
            this.generatePerformanceReport();
            this.state.lastReport = currentTime;
        }
        
        // Memory cleanup check
        if (currentTime - this.state.lastCleanup > this.settings.memoryCleanupInterval) {
            this.performMemoryCleanup();
        }
    },
    
    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            frameRate: Math.round(this.metrics.frameRate),
            averageFrameTime: Math.round(this.metrics.averageFrameTime * 100) / 100,
            memoryUsage: this.metrics.memoryUsage,
            performanceScore: Math.round(this.metrics.performanceScore),
            domUpdateCount: this.metrics.domUpdateCount,
            errorCount: this.metrics.errorCount,
            isDegraded: this.state.isDegraded
        };
        
        console.log('📊 Performance Report:', report);
        
        // Update performance indicator
        this.updatePerformanceIndicator(report);
        
        // Store report for debugging
        if (!window.performanceReports) {
            window.performanceReports = [];
        }
        window.performanceReports.push(report);
        
        // Keep only recent reports
        if (window.performanceReports.length > 60) {
            window.performanceReports.shift();
        }
    },

    updatePerformanceIndicator(report) {
        const indicator = document.getElementById('performanceIndicator');
        const fpsCounter = document.getElementById('fpsCounter');
        const perfScore = document.getElementById('perfScore');
        
        if (indicator && fpsCounter && perfScore) {
            // Show indicator if performance is concerning
            if (report.performanceScore < 80 || report.frameRate < 45) {
                indicator.classList.add('show');
                
                // Update indicator class based on performance
                indicator.classList.remove('good', 'degraded');
                if (report.performanceScore < 50) {
                    indicator.classList.add('degraded');
                } else if (report.performanceScore > 80) {
                    indicator.classList.add('good');
                }
                
                fpsCounter.textContent = report.frameRate;
                perfScore.textContent = report.performanceScore;
            } else {
                indicator.classList.remove('show');
            }
        }
    },

    showCleanupIndicator() {
        const indicator = document.getElementById('cleanupIndicator');
        if (indicator) {
            indicator.style.display = 'block';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 2000);
        }
    },
    
    // Public API
    getMetrics() {
        return { ...this.metrics };
    },
    
    getReport() {
        return {
            metrics: this.getMetrics(),
            state: { ...this.state },
            settings: { ...this.settings },
            recentErrors: this.errors.errorLog.slice(-10)
        };
    },
    
    // Cleanup on page unload
    cleanup() {
        console.log('🧹 Cleaning up performance system...');
        
        this.stop();
        
        // Clear all intervals and timeouts
        this.memory.intervals.forEach(id => clearInterval(id));
        this.memory.timeouts.forEach(id => clearTimeout(id));
        
        // Disconnect performance observer
        if (this.state.performanceObserver) {
            this.state.performanceObserver.disconnect();
        }
        
        console.log('✅ Performance system cleanup completed');
    }
};

// Initialize performance system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => Performance.init(), 100);
    });
} else {
    setTimeout(() => Performance.init(), 100);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    Performance.cleanup();
});

// Export for debugging
window.Performance = Performance;