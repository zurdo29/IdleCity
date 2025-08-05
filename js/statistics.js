// IdleCity Statistics System
// Comprehensive statistics tracking and historical data

const Statistics = {
    // Historical data storage
    history: {
        resources: [],
        buildings: [],
        achievements: [],
        sessions: []
    },
    
    // Current session data
    currentSession: {
        startTime: Date.now(),
        clicksThisSession: 0,
        coinsEarnedThisSession: 0,
        buildingsBuiltThisSession: 0,
        achievementsUnlockedThisSession: 0
    },
    
    // Milestone tracking
    milestones: {
        firstClick: false,
        first100Coins: false,
        first10Buildings: false,
        first100Population: false,
        firstHour: false,
        firstAchievement: false
    },
    
    init() {
        console.log('📊 Initializing statistics system...');
        
        // Initialize statistics in game state if not present
        if (!GameState.statistics.totalResearchEarned) {
            GameState.statistics.totalResearchEarned = 0;
        }
        if (!GameState.statistics.sessionsPlayed) {
            GameState.statistics.sessionsPlayed = 0;
        }
        if (!GameState.statistics.achievementsUnlocked) {
            GameState.statistics.achievementsUnlocked = 0;
        }
        if (!GameState.statistics.maxPopulation) {
            GameState.statistics.maxPopulation = 0;
        }
        if (!GameState.statistics.maxHappiness) {
            GameState.statistics.maxHappiness = 100;
        }
        if (!GameState.statistics.totalUpgradesPurchased) {
            GameState.statistics.totalUpgradesPurchased = 0;
        }
        
        // Load historical data
        this.loadHistoricalData();
        
        // Start new session
        this.startNewSession();
        
        // Set up periodic data collection
        this.setupDataCollection();
        
        console.log('✅ Statistics system initialized');
    },
    
    // Start a new gaming session
    startNewSession() {
        this.currentSession = {
            startTime: Date.now(),
            clicksThisSession: GameState.statistics.totalClicks,
            coinsEarnedThisSession: GameState.statistics.totalCoinsEarned,
            buildingsBuiltThisSession: GameState.statistics.buildingsPurchased,
            achievementsUnlockedThisSession: GameState.statistics.achievementsUnlocked || 0
        };
        
        GameState.statistics.sessionsPlayed = (GameState.statistics.sessionsPlayed || 0) + 1;
    },
    
    // Record a data point for historical tracking
    recordDataPoint() {
        const timestamp = Date.now();
        
        // Record resource snapshot
        this.history.resources.push({
            timestamp,
            coins: GameState.resources.coins,
            population: GameState.resources.population,
            happiness: GameState.resources.happiness,
            research: GameState.resources.research
        });
        
        // Record building snapshot
        this.history.buildings.push({
            timestamp,
            buildings: { ...GameState.buildings },
            totalBuildings: Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0)
        });
        
        // Limit history size to prevent memory issues
        if (this.history.resources.length > 1000) {
            this.history.resources = this.history.resources.slice(-500);
        }
        if (this.history.buildings.length > 1000) {
            this.history.buildings = this.history.buildings.slice(-500);
        }
    },
    
    // Set up periodic data collection
    setupDataCollection() {
        // Record data every 30 seconds
        setInterval(() => {
            this.recordDataPoint();
            this.updateMaxValues();
            this.checkMilestones();
        }, 30000);
    },
    
    // Update maximum values achieved
    updateMaxValues() {
        GameState.statistics.maxPopulation = Math.max(
            GameState.statistics.maxPopulation || 0,
            Math.floor(GameState.resources.population)
        );
        
        GameState.statistics.maxHappiness = Math.max(
            GameState.statistics.maxHappiness || 0,
            Math.floor(GameState.resources.happiness)
        );
    },
    
    // Check for milestone achievements
    checkMilestones() {
        // First click milestone
        if (!this.milestones.firstClick && GameState.statistics.totalClicks >= 1) {
            this.milestones.firstClick = true;
            this.recordMilestone('First Click', 'Made your first click!');
        }
        
        // First 100 coins milestone
        if (!this.milestones.first100Coins && GameState.statistics.totalCoinsEarned >= 100) {
            this.milestones.first100Coins = true;
            this.recordMilestone('First 100 Coins', 'Earned your first 100 coins!');
        }
        
        // First 10 buildings milestone
        const totalBuildings = Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0);
        if (!this.milestones.first10Buildings && totalBuildings >= 10) {
            this.milestones.first10Buildings = true;
            this.recordMilestone('City Builder', 'Built your first 10 buildings!');
        }
        
        // First 100 population milestone
        if (!this.milestones.first100Population && GameState.resources.population >= 100) {
            this.milestones.first100Population = true;
            this.recordMilestone('Growing City', 'Reached 100 population!');
        }
        
        // First hour milestone
        if (!this.milestones.firstHour && GameState.statistics.gameTime >= 3600) {
            this.milestones.firstHour = true;
            this.recordMilestone('Dedicated Player', 'Played for one hour!');
        }
    },
    
    // Record a milestone achievement
    recordMilestone(name, description) {
        const milestone = {
            name,
            description,
            timestamp: Date.now(),
            gameTime: GameState.statistics.gameTime
        };
        
        if (!this.history.achievements) {
            this.history.achievements = [];
        }
        
        this.history.achievements.push(milestone);
        
        if (typeof UI !== 'undefined') {
            UI.showNotification(`🎯 Milestone: ${name}\n${description}`, 'achievement', 4000);
        }
    },
    
    // Get current session statistics
    getCurrentSessionStats() {
        return {
            duration: Date.now() - this.currentSession.startTime,
            clicksThisSession: GameState.statistics.totalClicks - this.currentSession.clicksThisSession,
            coinsEarnedThisSession: GameState.statistics.totalCoinsEarned - this.currentSession.coinsEarnedThisSession,
            buildingsBuiltThisSession: GameState.statistics.buildingsPurchased - this.currentSession.buildingsBuiltThisSession,
            achievementsUnlockedThisSession: (GameState.statistics.achievementsUnlocked || 0) - this.currentSession.achievementsUnlockedThisSession
        };
    },
    
    // Get comprehensive statistics
    getComprehensiveStats() {
        const sessionStats = this.getCurrentSessionStats();
        const totalBuildings = Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0);
        
        return {
            // Basic stats
            totalClicks: GameState.statistics.totalClicks,
            totalCoinsEarned: GameState.statistics.totalCoinsEarned,
            totalResearchEarned: GameState.statistics.totalResearchEarned || 0,
            buildingsPurchased: GameState.statistics.buildingsPurchased,
            totalBuildings,
            gameTime: GameState.statistics.gameTime,
            sessionsPlayed: GameState.statistics.sessionsPlayed || 1,
            
            // Maximum values
            maxPopulation: GameState.statistics.maxPopulation || Math.floor(GameState.resources.population),
            maxHappiness: GameState.statistics.maxHappiness || Math.floor(GameState.resources.happiness),
            
            // Current session
            currentSession: sessionStats,
            
            // Rates and efficiency
            clicksPerSecond: GameState.statistics.gameTime > 0 ? GameState.statistics.totalClicks / GameState.statistics.gameTime : 0,
            coinsPerSecond: GameState.statistics.gameTime > 0 ? GameState.statistics.totalCoinsEarned / GameState.statistics.gameTime : 0,
            buildingsPerHour: GameState.statistics.gameTime > 0 ? (GameState.statistics.buildingsPurchased / GameState.statistics.gameTime) * 3600 : 0,
            
            // Building breakdown
            buildingBreakdown: { ...GameState.buildings },
            
            // Achievement progress
            achievementsUnlocked: GameState.statistics.achievementsUnlocked || 0,
            
            // Milestones
            milestonesReached: Object.values(this.milestones).filter(Boolean).length
        };
    },
    
    // Get building statistics
    getBuildingStats() {
        const stats = {};
        
        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const owned = GameState.buildings[buildingType] || 0;
            const totalCost = this.calculateTotalCostSpent(buildingType);
            const production = Buildings.getProduction(buildingType);
            
            stats[buildingType] = {
                name: config.name,
                owned,
                totalCostSpent: totalCost,
                currentProduction: production,
                tier: config.tier,
                category: config.category
            };
        });
        
        return stats;
    },
    
    // Calculate total cost spent on a building type
    calculateTotalCostSpent(buildingType) {
        const config = BuildingConfig[buildingType];
        const owned = GameState.buildings[buildingType] || 0;
        let totalCost = 0;
        
        for (let i = 0; i < owned; i++) {
            totalCost += Math.floor(config.baseCost * Math.pow(config.costMultiplier, i));
        }
        
        return totalCost;
    },
    
    // Get resource generation history
    getResourceHistory(timeRange = 3600000) { // Default 1 hour
        const cutoff = Date.now() - timeRange;
        return this.history.resources.filter(point => point.timestamp >= cutoff);
    },
    
    // Get building construction history
    getBuildingHistory(timeRange = 3600000) { // Default 1 hour
        const cutoff = Date.now() - timeRange;
        return this.history.buildings.filter(point => point.timestamp >= cutoff);
    },
    
    // Load historical data from storage
    loadHistoricalData() {
        try {
            const saved = localStorage.getItem('idlecity_statistics_history');
            if (saved) {
                const data = JSON.parse(saved);
                this.history = { ...this.history, ...data };
                this.milestones = { ...this.milestones, ...(data.milestones || {}) };
            }
        } catch (error) {
            console.warn('Failed to load statistics history:', error);
        }
    },
    
    // Save historical data to storage
    saveHistoricalData() {
        try {
            const dataToSave = {
                ...this.history,
                milestones: this.milestones
            };
            localStorage.setItem('idlecity_statistics_history', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Failed to save statistics history:', error);
        }
    },
    
    // Reset all statistics (for game reset)
    reset() {
        this.history = {
            resources: [],
            buildings: [],
            achievements: [],
            sessions: []
        };
        
        this.milestones = {
            firstClick: false,
            first100Coins: false,
            first10Buildings: false,
            first100Population: false,
            firstHour: false,
            firstAchievement: false
        };
        
        this.startNewSession();
        
        // Clear saved data
        try {
            localStorage.removeItem('idlecity_statistics_history');
        } catch (error) {
            console.warn('Failed to clear statistics history:', error);
        }
    }
};

// Auto-save statistics periodically
setInterval(() => {
    if (typeof Statistics !== 'undefined') {
        Statistics.saveHistoricalData();
    }
}, 60000); // Save every minute

// Initialize statistics when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof GameState !== 'undefined') {
                Statistics.init();
            } else {
                console.warn('⚠️ GameState not ready, delaying statistics init');
                setTimeout(() => Statistics.init(), 500);
            }
        }, 250);
    });
} else {
    setTimeout(() => {
        if (typeof GameState !== 'undefined') {
            Statistics.init();
        } else {
            console.warn('⚠️ GameState not ready, delaying statistics init');
            setTimeout(() => Statistics.init(), 500);
        }
    }, 250);
}