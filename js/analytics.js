// Advanced Analytics and Monitoring System for IdleCity

const Analytics = {
    // Configuration
    config: {
        enabled: true,
        endpoint: '/api/analytics', // Would be a real endpoint in production
        batchSize: 10,
        flushInterval: 30000, // 30 seconds
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        enablePerformanceTracking: true,
        enableErrorTracking: true,
        enableUserBehaviorTracking: true
    },
    
    // State
    events: [],
    session: {
        id: null,
        startTime: null,
        lastActivity: null,
        pageViews: 0,
        interactions: 0
    },
    
    // Performance metrics
    performance: {
        loadTime: 0,
        renderTime: 0,
        gameLoopPerformance: [],
        memoryUsage: [],
        errorCount: 0
    },
    
    // User behavior tracking
    behavior: {
        clickHeatmap: {},
        featureUsage: {},
        gameProgression: {},
        retentionMetrics: {}
    },
    
    init() {
        if (!this.config.enabled) return;
        
        console.log('📊 Initializing Analytics...');
        
        try {
            this.initSession();
            this.setupEventListeners();
            this.startPerformanceMonitoring();
            this.setupErrorTracking();
            this.setupUserBehaviorTracking();
            this.startBatchFlush();
            
            // Track page load
            this.trackEvent('page_load', {
                url: window.location.href,
                referrer: document.referrer,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });
            
            console.log('✅ Analytics initialized');
        } catch (error) {
            console.error('❌ Analytics initialization failed:', error);
        }
    },
    
    // Initialize session
    initSession() {
        this.session.id = this.generateSessionId();
        this.session.startTime = Date.now();
        this.session.lastActivity = Date.now();
        
        // Check for returning user
        const lastSession = localStorage.getItem('analytics_last_session');
        const isReturningUser = lastSession && (Date.now() - parseInt(lastSession)) < 24 * 60 * 60 * 1000;
        
        this.trackEvent('session_start', {
            sessionId: this.session.id,
            isReturningUser: isReturningUser,
            timestamp: this.session.startTime
        });
        
        localStorage.setItem('analytics_last_session', this.session.startTime.toString());
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Track page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('page_hidden', { timestamp: Date.now() });
            } else {
                this.trackEvent('page_visible', { timestamp: Date.now() });
                this.session.lastActivity = Date.now();
            }
        });
        
        // Track user interactions
        ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, (event) => {
                this.trackUserInteraction(eventType, event);
            }, { passive: true });
        });
        
        // Track window unload
        window.addEventListener('beforeunload', () => {
            this.trackSessionEnd();
            this.flush(true); // Force flush on unload
        });
    },
    
    // Start performance monitoring
    startPerformanceMonitoring() {
        if (!this.config.enablePerformanceTracking) return;
        
        // Track initial page load performance
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                this.performance.loadTime = perfData.loadEventEnd - perfData.fetchStart;
                this.performance.renderTime = perfData.domContentLoadedEventEnd - perfData.fetchStart;
                
                this.trackEvent('performance_load', {
                    loadTime: this.performance.loadTime,
                    renderTime: this.performance.renderTime,
                    domElements: document.querySelectorAll('*').length
                });
            }
        });
        
        // Monitor game loop performance
        setInterval(() => {
            this.trackGameLoopPerformance();
        }, 5000);
        
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.trackMemoryUsage();
            }, 10000);
        }
    },
    
    // Setup error tracking
    setupErrorTracking() {
        if (!this.config.enableErrorTracking) return;
        
        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            this.trackError('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });
        
        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError('unhandled_promise_rejection', {
                reason: event.reason,
                stack: event.reason && event.reason.stack ? event.reason.stack : null
            });
        });
    },
    
    // Setup user behavior tracking
    setupUserBehaviorTracking() {
        if (!this.config.enableUserBehaviorTracking) return;
        
        // Track game-specific events
        this.setupGameEventTracking();
    },
    
    // Setup game event tracking
    setupGameEventTracking() {
        // Track building purchases
        document.addEventListener('buildingPurchased', (event) => {
            this.trackGameEvent('building_purchased', {
                buildingType: event.detail.type,
                cost: event.detail.cost,
                count: event.detail.count,
                totalBuildings: event.detail.totalBuildings
            });
        });
        
        // Track achievements
        document.addEventListener('achievementUnlocked', (event) => {
            this.trackGameEvent('achievement_unlocked', {
                achievementId: event.detail.id,
                achievementName: event.detail.name,
                progress: event.detail.progress
            });
        });
        
        // Track resource milestones
        document.addEventListener('resourceMilestone', (event) => {
            this.trackGameEvent('resource_milestone', {
                resource: event.detail.resource,
                amount: event.detail.amount,
                milestone: event.detail.milestone
            });
        });
    },
    
    // Track user interaction
    trackUserInteraction(type, event) {
        this.session.interactions++;
        this.session.lastActivity = Date.now();
        
        // Track click heatmap
        if (type === 'click' && event.target) {
            const rect = event.target.getBoundingClientRect();
            const x = Math.floor((event.clientX / window.innerWidth) * 100);
            const y = Math.floor((event.clientY / window.innerHeight) * 100);
            
            const key = `${x},${y}`;
            this.behavior.clickHeatmap[key] = (this.behavior.clickHeatmap[key] || 0) + 1;
            
            // Track feature usage
            const elementId = event.target.id;
            const elementClass = event.target.className;
            
            if (elementId) {
                this.behavior.featureUsage[elementId] = (this.behavior.featureUsage[elementId] || 0) + 1;
            }
        }
    },
    
    // Track game loop performance
    trackGameLoopPerformance() {
        if (typeof Performance !== 'undefined' && Performance.gameLoopTimes) {
            const recentTimes = Performance.gameLoopTimes.slice(-10);
            const avgTime = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
            
            this.performance.gameLoopPerformance.push({
                timestamp: Date.now(),
                averageTime: avgTime,
                maxTime: Math.max(...recentTimes),
                minTime: Math.min(...recentTimes)
            });
            
            // Keep only last 100 entries
            if (this.performance.gameLoopPerformance.length > 100) {
                this.performance.gameLoopPerformance = this.performance.gameLoopPerformance.slice(-100);
            }
        }
    },
    
    // Track memory usage
    trackMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            
            this.performance.memoryUsage.push({
                timestamp: Date.now(),
                usedJSHeapSize: memory.usedJSHeapSize,
                totalJSHeapSize: memory.totalJSHeapSize,
                jsHeapSizeLimit: memory.jsHeapSizeLimit
            });
            
            // Keep only last 100 entries
            if (this.performance.memoryUsage.length > 100) {
                this.performance.memoryUsage = this.performance.memoryUsage.slice(-100);
            }
            
            // Alert if memory usage is high
            const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            if (usagePercent > 80) {
                this.trackEvent('high_memory_usage', {
                    usagePercent: usagePercent,
                    usedMB: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                });
            }
        }
    },
    
    // Track error
    trackError(type, details) {
        this.performance.errorCount++;
        
        this.trackEvent('error', {
            errorType: type,
            ...details,
            sessionId: this.session.id,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    },
    
    // Track game event
    trackGameEvent(eventName, data) {
        this.trackEvent(`game_${eventName}`, {
            ...data,
            sessionId: this.session.id,
            gameTime: typeof GameState !== 'undefined' ? GameState.statistics.gameTime : 0
        });
    },
    
    // Track session end
    trackSessionEnd() {
        const sessionDuration = Date.now() - this.session.startTime;
        
        this.trackEvent('session_end', {
            sessionId: this.session.id,
            duration: sessionDuration,
            pageViews: this.session.pageViews,
            interactions: this.session.interactions,
            errorCount: this.performance.errorCount
        });
    },
    
    // Track custom event
    trackEvent(eventName, data = {}) {
        if (!this.config.enabled) return;
        
        const event = {
            name: eventName,
            data: {
                ...data,
                sessionId: this.session.id,
                timestamp: Date.now(),
                url: window.location.href
            }
        };
        
        this.events.push(event);
        
        // Auto-flush if batch is full
        if (this.events.length >= this.config.batchSize) {
            this.flush();
        }
    },
    
    // Start batch flush timer
    startBatchFlush() {
        setInterval(() => {
            if (this.events.length > 0) {
                this.flush();
            }
        }, this.config.flushInterval);
    },
    
    // Flush events to server
    async flush(force = false) {
        if (!this.config.enabled || (this.events.length === 0 && !force)) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        try {
            // In a real application, this would send to your analytics endpoint
            console.log('📊 Analytics batch:', {
                events: eventsToSend,
                session: this.session,
                performance: this.performance,
                behavior: this.behavior
            });
            
            // Simulate API call
            // await fetch(this.config.endpoint, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         events: eventsToSend,
            //         session: this.session,
            //         performance: this.performance,
            //         behavior: this.behavior
            //     })
            // });
            
        } catch (error) {
            console.error('❌ Analytics flush failed:', error);
            // Re-add events to queue on failure
            this.events.unshift(...eventsToSend);
        }
    },
    
    // Generate session ID
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Get analytics summary
    getSummary() {
        return {
            session: this.session,
            performance: {
                loadTime: this.performance.loadTime,
                renderTime: this.performance.renderTime,
                averageGameLoopTime: this.performance.gameLoopPerformance.length > 0 
                    ? this.performance.gameLoopPerformance.reduce((sum, p) => sum + p.averageTime, 0) / this.performance.gameLoopPerformance.length 
                    : 0,
                errorCount: this.performance.errorCount,
                memoryUsage: this.performance.memoryUsage.length > 0 
                    ? this.performance.memoryUsage[this.performance.memoryUsage.length - 1] 
                    : null
            },
            behavior: {
                topFeatures: Object.entries(this.behavior.featureUsage)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10),
                totalClicks: Object.values(this.behavior.clickHeatmap).reduce((sum, count) => sum + count, 0)
            },
            queuedEvents: this.events.length
        };
    }
};

// Initialize analytics when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Analytics.init();
    });
} else {
    Analytics.init();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
}