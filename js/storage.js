// IdleCity Storage System
// Handles saving and loading game progress using localStorage

const Storage = {
    SAVE_KEY: 'idlecity_save',
    AUTO_SAVE_INTERVAL: 10000, // 10 seconds
    
    init() {
        console.log('💾 Initializing storage system...');
        
        // Check if localStorage is available
        if (!this.isLocalStorageAvailable()) {
            console.warn('⚠️ localStorage not available - save functionality disabled');
            if (typeof UI !== 'undefined') {
                UI.showNotification('Save functionality unavailable in this browser', 'warning');
            }
            return false;
        }
        
        console.log('✅ Storage system initialized');
        return true;
    },
    
    isLocalStorageAvailable() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },
    
    saveGame() {
        if (!this.isLocalStorageAvailable()) {
            console.error('❌ Cannot save - localStorage unavailable');
            return false;
        }
        
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                gameState: {
                    resources: { ...GameState.resources },
                    buildings: { ...GameState.buildings },
                    upgrades: { ...GameState.upgrades },
                    statistics: { ...GameState.statistics },
                    achievements: GameState.achievements ? { ...GameState.achievements } : undefined
                }
            };
            
            const serializedData = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, serializedData);
            
            console.log('💾 Game saved successfully');
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Game saved!', 'success', 2000);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save game:', error);
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Failed to save game', 'error');
            }
            
            return false;
        }
    },
    
    loadGame() {
        if (!this.isLocalStorageAvailable()) {
            console.error('❌ Cannot load - localStorage unavailable');
            return false;
        }
        
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            
            if (!savedData) {
                console.log('📁 No saved game found - starting fresh');
                return false;
            }
            
            const saveData = JSON.parse(savedData);
            
            // Validate save data structure
            if (!this.validateSaveData(saveData)) {
                console.error('❌ Invalid save data - starting fresh');
                
                if (typeof UI !== 'undefined') {
                    UI.showNotification('Save data corrupted - starting fresh', 'warning');
                }
                
                return false;
            }
            
            // Load the game state
            this.applySaveData(saveData);
            
            console.log('📁 Game loaded successfully');
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Game loaded!', 'success', 2000);
                UI.updateAll();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to load game:', error);
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Failed to load game', 'error');
            }
            
            return false;
        }
    },
    
    validateSaveData(saveData) {
        // Check if save data has required structure
        if (!saveData || typeof saveData !== 'object') {
            return false;
        }
        
        if (!saveData.version || !saveData.timestamp || !saveData.gameState) {
            return false;
        }
        
        const gameState = saveData.gameState;
        
        // Validate resources
        if (!gameState.resources || typeof gameState.resources !== 'object') {
            return false;
        }
        
        const requiredResources = ['coins', 'population', 'happiness'];
        for (const resource of requiredResources) {
            if (typeof gameState.resources[resource] !== 'number') {
                return false;
            }
        }
        
        // Validate buildings
        if (!gameState.buildings || typeof gameState.buildings !== 'object') {
            return false;
        }
        
        const requiredBuildings = ['houses', 'shops', 'factories', 'parks'];
        for (const building of requiredBuildings) {
            if (typeof gameState.buildings[building] !== 'number') {
                return false;
            }
        }
        
        // Validate statistics
        if (!gameState.statistics || typeof gameState.statistics !== 'object') {
            return false;
        }
        
        return true;
    },
    
    applySaveData(saveData) {
        const loadedState = saveData.gameState;
        
        // Load resources - dynamically load all resource types
        Object.keys(GameState.resources).forEach(resourceType => {
            if (resourceType === 'happiness' || resourceType === 'energy') {
                GameState.resources[resourceType] = Math.max(0, Math.min(100, loadedState.resources[resourceType] || 100));
            } else {
                GameState.resources[resourceType] = Math.max(0, loadedState.resources[resourceType] || 0);
            }
        });
        
        // Load buildings - dynamically load all building types
        Object.keys(GameState.buildings).forEach(buildingType => {
            GameState.buildings[buildingType] = Math.max(0, loadedState.buildings[buildingType] || 0);
        });
        
        // Load upgrades - dynamically load all upgrade types
        if (loadedState.upgrades) {
            Object.keys(GameState.upgrades).forEach(upgradeType => {
                if (upgradeType === 'automation') {
                    GameState.upgrades[upgradeType] = loadedState.upgrades[upgradeType] || false;
                } else if (upgradeType === 'efficiency') {
                    GameState.upgrades[upgradeType] = Math.max(1, loadedState.upgrades[upgradeType] || 1);
                } else {
                    GameState.upgrades[upgradeType] = Math.max(0, loadedState.upgrades[upgradeType] || 0);
                }
            });
        }
        
        // Load statistics
        if (loadedState.statistics) {
            GameState.statistics.totalClicks = Math.max(0, loadedState.statistics.totalClicks || 0);
            GameState.statistics.buildingsPurchased = Math.max(0, loadedState.statistics.buildingsPurchased || 0);
            GameState.statistics.totalCoinsEarned = Math.max(0, loadedState.statistics.totalCoinsEarned || 0);
            
            // Handle game time - calculate offline progress
            const savedTime = loadedState.statistics.gameTime || 0;
            const saveTimestamp = saveData.timestamp;
            const currentTime = Date.now();
            const offlineTime = Math.floor((currentTime - saveTimestamp) / 1000);
            
            if (offlineTime > 0 && offlineTime < 86400) { // Max 24 hours offline progress
                this.calculateOfflineProgress(offlineTime);
                GameState.statistics.gameTime = savedTime + offlineTime;
            } else {
                GameState.statistics.gameTime = savedTime;
            }
            
            // Reset game start time to current time
            GameState.statistics.gameStartTime = currentTime - (GameState.statistics.gameTime * 1000);
        }
        
        // Load achievements
        if (loadedState.achievements && typeof Achievements !== 'undefined') {
            GameState.achievements = { ...loadedState.achievements };
            
            // Restore unlocked achievements
            if (GameState.achievements.unlocked) {
                Achievements.unlockedAchievements = new Set(GameState.achievements.unlocked);
                
                // Update achievement states
                Object.keys(Achievements.definitions).forEach(id => {
                    Achievements.definitions[id].unlocked = Achievements.unlockedAchievements.has(id);
                });
            }
        }
        
        console.log('📊 Save data applied successfully');
        console.log('🏗️ Loaded buildings:', GameState.buildings);
        console.log('💰 Loaded resources:', GameState.resources);
        console.log('⚡ Loaded upgrades:', GameState.upgrades);
    },
    
    calculateOfflineProgress(offlineSeconds) {
        if (offlineSeconds <= 0) return;
        
        console.log(`⏰ Calculating ${offlineSeconds} seconds of offline progress...`);
        
        let offlineCoins = 0;
        let offlinePopulation = 0;
        
        // Calculate offline resource generation
        const coinsPerSecond = (
            (GameState.buildings.shops * BuildingConfig.shops.baseProduction) +
            (GameState.buildings.factories * BuildingConfig.factories.baseProduction)
        ) * GameState.upgrades.efficiency;
        
        const populationPerSecond = GameState.buildings.houses * BuildingConfig.houses.baseProduction * GameState.upgrades.efficiency;
        
        // Apply offline progress (with diminishing returns for balance)
        const offlineEfficiency = Math.min(1, Math.max(0.1, 1 - (offlineSeconds / 3600))); // Reduce efficiency for longer offline periods
        
        offlineCoins = coinsPerSecond * offlineSeconds * offlineEfficiency;
        offlinePopulation = populationPerSecond * offlineSeconds * offlineEfficiency;
        
        // Add offline progress to resources
        GameState.resources.coins += offlineCoins;
        GameState.resources.population += offlinePopulation;
        GameState.statistics.totalCoinsEarned += offlineCoins;
        
        // Show offline progress notification
        if (typeof UI !== 'undefined' && (offlineCoins > 0 || offlinePopulation > 0)) {
            const timeString = this.formatOfflineTime(offlineSeconds);
            let message = `Welcome back! You were offline for ${timeString}.\n`;
            
            if (offlineCoins > 0) {
                message += `Earned ${UI.formatNumber(offlineCoins)} coins\n`;
            }
            if (offlinePopulation > 0) {
                message += `Gained ${UI.formatNumber(offlinePopulation)} population`;
            }
            
            UI.showNotification(message, 'info', 5000);
        }
        
        console.log(`💰 Offline progress: +${offlineCoins} coins, +${offlinePopulation} population`);
    },
    
    formatOfflineTime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
    },
    
    autoSave() {
        // Only auto-save if the game has been running for at least 30 seconds
        if (GameState.statistics.gameTime >= 30) {
            this.saveGame();
        }
    },
    
    clearSave() {
        if (!this.isLocalStorageAvailable()) {
            return false;
        }
        
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('🗑️ Save data cleared');
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Save data cleared', 'info', 2000);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to clear save data:', error);
            return false;
        }
    },
    
    exportSave() {
        if (!this.isLocalStorageAvailable()) {
            return null;
        }
        
        try {
            const savedData = localStorage.getItem(this.SAVE_KEY);
            if (!savedData) {
                console.log('📁 No save data to export');
                return null;
            }
            
            // Create a downloadable file
            const blob = new Blob([savedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `idlecity_save_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📤 Save data exported');
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Save exported!', 'success', 2000);
            }
            
            return savedData;
        } catch (error) {
            console.error('❌ Failed to export save:', error);
            return null;
        }
    },
    
    importSave(saveString) {
        try {
            const saveData = JSON.parse(saveString);
            
            if (!this.validateSaveData(saveData)) {
                throw new Error('Invalid save data format');
            }
            
            // Apply the imported save
            this.applySaveData(saveData);
            
            // Save to localStorage
            localStorage.setItem(this.SAVE_KEY, saveString);
            
            console.log('📥 Save data imported successfully');
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Save imported!', 'success', 2000);
                UI.updateAll();
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to import save:', error);
            
            if (typeof UI !== 'undefined') {
                UI.showNotification('Failed to import save - invalid format', 'error');
            }
            
            return false;
        }
    }
};

// Initialize storage system
Storage.init();