// Progressive Web App functionality for IdleCity

const PWA = {
    // Service Worker registration
    serviceWorker: null,
    
    // Push notification subscription
    pushSubscription: null,
    
    // Installation prompt
    installPrompt: null,
    
    // PWA state
    isInstalled: false,
    isOnline: navigator.onLine,
    
    init() {
        console.log('📱 Initializing PWA features...');
        
        try {
            this.registerServiceWorker();
            this.setupInstallPrompt();
            this.setupPushNotifications();
            this.setupOfflineHandling();
            this.setupPeriodicSync();
            this.createInstallButton();
            this.setupNotificationButton();
            this.setupIdleNotifications();
            
            console.log('✅ PWA features initialized');
        } catch (error) {
            console.error('❌ PWA initialization failed:', error);
        }
    },
    
    // Register service worker
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            console.warn('⚠️ Service Worker not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            this.serviceWorker = registration;
            console.log('✅ Service Worker registered:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                this.handleServiceWorkerMessage(event.data);
            });
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    },
    
    // Setup install prompt handling
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📲 Install prompt available');
            
            // Prevent default prompt
            event.preventDefault();
            
            // Store the event for later use
            this.installPrompt = event;
            
            // Show custom install button
            this.showInstallButton();
        });
        
        // Detect if app is installed
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installed');
            this.isInstalled = true;
            this.hideInstallButton();
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('IdleCity installed successfully! 🎉', 'success', 4000);
            }
        });
    },
    
    // Setup push notifications
    async setupPushNotifications() {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            console.warn('⚠️ Push notifications not supported');
            return;
        }
        
        // Check current permission
        const permission = Notification.permission;
        console.log('🔔 Notification permission:', permission);
        
        if (permission === 'granted') {
            await this.subscribeToPush();
        }
    },
    
    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('⚠️ Notifications not supported');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        console.log('🔔 Notification permission result:', permission);
        
        if (permission === 'granted') {
            await this.subscribeToPush();
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Notifications enabled! You\'ll get updates about your city.', 'success', 4000);
            }
            
            return true;
        }
        
        return false;
    },
    
    // Subscribe to push notifications
    async subscribeToPush() {
        if (!this.serviceWorker) {
            console.warn('⚠️ Service Worker not available for push subscription');
            return;
        }
        
        try {
            // Generate VAPID keys (in production, these should be server-generated)
            const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmqmkNpQHC7WgXr1gYWChNw_bHVLdyuUFgpEjsm6YBWo';
            
            const subscription = await this.serviceWorker.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });
            
            this.pushSubscription = subscription;
            console.log('✅ Push subscription created:', subscription);
            
            // Send subscription to server (in a real app)
            // await this.sendSubscriptionToServer(subscription);
            
        } catch (error) {
            console.error('❌ Push subscription failed:', error);
        }
    },
    
    // Setup offline handling
    setupOfflineHandling() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('🌐 Back online');
            this.isOnline = true;
            this.handleOnlineStateChange();
        });
        
        window.addEventListener('offline', () => {
            console.log('📴 Gone offline');
            this.isOnline = false;
            this.handleOnlineStateChange();
        });
        
        // Initial state
        this.handleOnlineStateChange();
    },
    
    // Handle online state changes
    handleOnlineStateChange() {
        const indicator = this.getOrCreateOfflineIndicator();
        
        if (this.isOnline) {
            indicator.style.display = 'none';
            
            // Sync any pending data
            this.syncPendingData();
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Connection restored! 🌐', 'success', 2000);
            }
        } else {
            indicator.style.display = 'block';
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('You\'re offline. Game will continue to work! 📴', 'info', 3000);
            }
        }
    },
    
    // Setup periodic background sync
    async setupPeriodicSync() {
        if (!('serviceWorker' in navigator) || !('periodicSync' in window.ServiceWorkerRegistration.prototype)) {
            console.warn('⚠️ Periodic Background Sync not supported');
            return;
        }
        
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Register periodic sync for idle notifications
            await registration.periodicSync.register('idle-check', {
                minInterval: 30 * 60 * 1000 // 30 minutes
            });
            
            console.log('✅ Periodic sync registered');
        } catch (error) {
            console.error('❌ Periodic sync registration failed:', error);
        }
    },
    
    // Create install button
    createInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'pwa-install-btn';
        installBtn.className = 'fixed bottom-4 right-4 bg-game-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-y-20 opacity-0 z-50';
        installBtn.innerHTML = '📱 Install App';
        installBtn.style.display = 'none';
        
        installBtn.addEventListener('click', () => {
            this.showInstallPrompt();
        });
        
        document.body.appendChild(installBtn);
    },
    
    // Show install button
    showInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn && this.installPrompt && !this.isInstalled) {
            installBtn.style.display = 'block';
            
            // Animate in
            setTimeout(() => {
                installBtn.classList.remove('translate-y-20', 'opacity-0');
            }, 100);
        }
    },
    
    // Hide install button
    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.classList.add('translate-y-20', 'opacity-0');
            
            setTimeout(() => {
                installBtn.style.display = 'none';
            }, 300);
        }
    },
    
    // Show install prompt
    async showInstallPrompt() {
        if (!this.installPrompt) {
            console.warn('⚠️ Install prompt not available');
            return;
        }
        
        try {
            // Show the prompt
            this.installPrompt.prompt();
            
            // Wait for user response
            const result = await this.installPrompt.userChoice;
            console.log('📲 Install prompt result:', result.outcome);
            
            if (result.outcome === 'accepted') {
                console.log('✅ User accepted install prompt');
            } else {
                console.log('❌ User dismissed install prompt');
            }
            
            // Clear the prompt
            this.installPrompt = null;
            this.hideInstallButton();
            
        } catch (error) {
            console.error('❌ Install prompt failed:', error);
        }
    },
    
    // Show update notification
    showUpdateNotification() {
        if (typeof UI !== 'undefined') {
            const notification = UI.showNotification(
                'A new version is available! Click to update.',
                'info',
                0, // Don't auto-dismiss
                [
                    {
                        text: 'Update Now',
                        action: () => {
                            this.applyUpdate();
                        }
                    },
                    {
                        text: 'Later',
                        action: () => {
                            // Dismiss notification
                        }
                    }
                ]
            );
        }
    },
    
    // Apply service worker update
    async applyUpdate() {
        if (!this.serviceWorker) return;
        
        try {
            // Tell the service worker to skip waiting
            if (this.serviceWorker.waiting) {
                this.serviceWorker.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Reload the page to get the new version
            window.location.reload();
            
        } catch (error) {
            console.error('❌ Update failed:', error);
        }
    },
    
    // Handle messages from service worker
    handleServiceWorkerMessage(data) {
        console.log('💬 Message from Service Worker:', data);
        
        switch (data.type) {
            case 'SYNC_GAME_DATA':
                this.syncGameData();
                break;
                
            default:
                console.log('Unknown message type:', data.type);
        }
    },
    
    // Sync game data
    async syncGameData() {
        console.log('🔄 Syncing game data...');
        
        try {
            // Save current game state
            if (typeof Storage !== 'undefined') {
                Storage.saveGame();
            }
            
            // Send game state to service worker for caching
            if (this.serviceWorker && this.serviceWorker.active) {
                this.serviceWorker.active.postMessage({
                    type: 'CACHE_GAME_STATE',
                    data: {
                        gameState: GameState
                    }
                });
            }
            
            console.log('✅ Game data synced');
        } catch (error) {
            console.error('❌ Game data sync failed:', error);
        }
    },
    
    // Sync pending data when back online
    async syncPendingData() {
        if (!this.isOnline) return;
        
        console.log('🔄 Syncing pending data...');
        
        try {
            // Register background sync
            if (this.serviceWorker) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('save-game-data');
            }
            
        } catch (error) {
            console.error('❌ Background sync registration failed:', error);
        }
    },
    
    // Send idle notification
    async sendIdleNotification(message, data = {}) {
        if (Notification.permission !== 'granted') {
            return;
        }
        
        try {
            // Use service worker to show notification
            if (this.serviceWorker) {
                const registration = await navigator.serviceWorker.ready;
                
                await registration.showNotification('IdleCity', {
                    body: message,
                    icon: '/manifest.json',
                    badge: '/manifest.json',
                    tag: 'idle-notification',
                    requireInteraction: false,
                    actions: [
                        {
                            action: 'open-game',
                            title: 'Open Game'
                        }
                    ],
                    data: {
                        url: '/',
                        ...data
                    }
                });
            }
            
        } catch (error) {
            console.error('❌ Idle notification failed:', error);
        }
    },
    
    // Get or create offline indicator
    getOrCreateOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 px-4 z-50 transform -translate-y-full transition-transform duration-300';
            indicator.innerHTML = '📴 You\'re offline - Game continues to work!';
            indicator.style.display = 'none';
            
            document.body.appendChild(indicator);
            
            // Show with animation
            setTimeout(() => {
                indicator.classList.remove('-translate-y-full');
            }, 100);
        }
        
        return indicator;
    },
    
    // Utility: Convert VAPID key
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    },
    
    // Check if app is running as PWA
    isPWA() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    },
    
    // Setup notification button
    setupNotificationButton() {
        const notificationBtn = document.getElementById('enableNotificationsBtn');
        
        if (!notificationBtn) return;
        
        // Show button if notifications are supported but not enabled
        if ('Notification' in window && Notification.permission === 'default') {
            notificationBtn.style.display = 'flex';
        }
        
        notificationBtn.addEventListener('click', async () => {
            const granted = await this.requestNotificationPermission();
            
            if (granted) {
                notificationBtn.style.display = 'none';
                
                // Send a test notification
                setTimeout(() => {
                    this.sendIdleNotification('Notifications enabled! You\'ll get updates about your city progress.');
                }, 1000);
            }
        });
    },
    
    // Setup idle notifications based on game state
    setupIdleNotifications() {
        // Check for idle progress every 5 minutes when the game is active
        setInterval(() => {
            this.checkForIdleNotifications();
        }, 5 * 60 * 1000);
        
        // Set up visibility change detection for idle notifications
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // User left the tab, start idle tracking
                this.startIdleTracking();
            } else {
                // User returned, stop idle tracking and check progress
                this.stopIdleTracking();
                this.checkIdleProgress();
            }
        });
    },
    
    // Start tracking idle time
    startIdleTracking() {
        this.idleStartTime = Date.now();
        
        // Set up periodic notifications for long idle periods
        this.idleNotificationTimer = setTimeout(() => {
            this.sendLongIdleNotification();
        }, 30 * 60 * 1000); // 30 minutes
    },
    
    // Stop tracking idle time
    stopIdleTracking() {
        if (this.idleNotificationTimer) {
            clearTimeout(this.idleNotificationTimer);
            this.idleNotificationTimer = null;
        }
        this.idleStartTime = null;
    },
    
    // Check for idle notifications based on game progress
    checkForIdleNotifications() {
        if (typeof GameState === 'undefined' || !GameState) return;
        
        // Check if significant progress has been made
        const coinsPerSecond = GameState.resources.coinsPerSecond || 0;
        const populationPerSecond = GameState.resources.populationPerSecond || 0;
        
        if (coinsPerSecond > 10 || populationPerSecond > 1) {
            // Only send notification if user hasn't been active recently
            const lastActivity = this.getLastActivityTime();
            const timeSinceActivity = Date.now() - lastActivity;
            
            if (timeSinceActivity > 10 * 60 * 1000) { // 10 minutes
                const message = `Your city is thriving! Earning ${coinsPerSecond.toFixed(1)} coins/sec and growing by ${populationPerSecond.toFixed(1)} people/sec.`;
                this.sendIdleNotification(message);
            }
        }
    },
    
    // Check idle progress when user returns
    checkIdleProgress() {
        if (!this.idleStartTime || typeof GameState === 'undefined') return;
        
        const idleTime = Date.now() - this.idleStartTime;
        const idleMinutes = Math.floor(idleTime / (60 * 1000));
        
        if (idleMinutes >= 5) {
            // Calculate approximate progress made while idle
            const coinsPerSecond = GameState.resources.coinsPerSecond || 0;
            const coinsEarned = Math.floor(coinsPerSecond * (idleTime / 1000));
            
            if (coinsEarned > 0) {
                if (typeof UI !== 'undefined') {
                    UI.showNotification(
                        `Welcome back! Your city earned approximately ${coinsEarned} coins while you were away (${idleMinutes} minutes).`,
                        'success',
                        5000
                    );
                }
            }
        }
    },
    
    // Send notification for long idle periods
    sendLongIdleNotification() {
        if (typeof GameState === 'undefined') return;
        
        const coinsPerSecond = GameState.resources.coinsPerSecond || 0;
        const estimatedCoins = Math.floor(coinsPerSecond * 30 * 60); // 30 minutes worth
        
        let message = 'Your city has been growing while you were away!';
        if (estimatedCoins > 0) {
            message = `Your city earned approximately ${estimatedCoins} coins in the last 30 minutes!`;
        }
        
        this.sendIdleNotification(message, {
            action: 'return',
            estimatedCoins: estimatedCoins
        });
    },
    
    // Get last activity time
    getLastActivityTime() {
        return this.lastActivityTime || Date.now();
    },
    
    // Update last active time for idle notifications
    updateLastActiveTime() {
        this.lastActivityTime = Date.now();
        
        if (this.serviceWorker && this.serviceWorker.active) {
            this.serviceWorker.active.postMessage({
                type: 'UPDATE_LAST_ACTIVE',
                data: {
                    timestamp: Date.now()
                }
            });
        }
    }
};

// Initialize PWA when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        PWA.init();
    });
} else {
    PWA.init();
}

// Update last active time on user interaction
['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, () => {
        PWA.updateLastActiveTime();
    }, { passive: true });
});

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PWA = PWA;
}