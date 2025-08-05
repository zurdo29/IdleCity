// IdleCity Game Engine
// Core game logic and state management

// Game State Object
const GameState = {
    // Resources
    resources: {
        coins: 0,
        population: 0,
        happiness: 100,
        energy: 100
    },
    
    // Buildings
    buildings: {
        houses: 0,
        shops: 0,
        factories: 0,
        parks: 0
    },
    
    // Upgrades and multipliers
    upgrades: {
        efficiency: 1,
        automation: false,
        research: 0,
        prestige: 0
    },
    
    // Game statistics
    statistics: {
        totalClicks: 0,
        gameTime: 0,
        buildingsPurchased: 0,
        totalCoinsEarned: 0,
        gameStartTime: Date.now()
    }
};

// Building Configuration
const BuildingConfig = {
    houses: {
        name: "Houses",
        description: "Generate population over time",
        baseCost: 10,
        costMultiplier: 1.15,
        baseProduction: 1,
        resourceType: "population",
        unlockCondition: { coins: 0 }
    },
    shops: {
        name: "Shops", 
        description: "Generate coins from population",
        baseCost: 50,
        costMultiplier: 1.20,
        baseProduction: 2,
        resourceType: "coins",
        unlockCondition: { population: 10 }
    },
    factories: {
        name: "Factories",
        description: "Advanced coin production",
        baseCost: 200,
        costMultiplier: 1.25,
        baseProduction: 5,
        resourceType: "coins",
        unlockCondition: { population: 50 }
    },
    parks: {
        name: "Parks",
        description: "Increase city happiness",
        baseCost: 100,
        costMultiplier: 1.18,
        baseProduction: 10,
        resourceType: "happiness",
        unlockCondition: { population: 25 }
    }
};

// Game Loop Management
const GameLoop = {
    intervalId: null,
    tickRate: 100, // 10 ticks per second for smooth updates
    
    start() {
        if (this.intervalId) return; // Already running
        
        console.log('🎮 Starting game loop...');
        this.intervalId = setInterval(() => {
            this.tick();
        }, this.tickRate);
    },
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏸️ Game loop stopped');
        }
    },
    
    tick() {
        // Update game time
        GameState.statistics.gameTime = Math.floor((Date.now() - GameState.statistics.gameStartTime) / 1000);
        
        // Generate resources from buildings
        this.generateResources();
        
        // Update UI
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateBuildingDisplays();
            UI.updateStatistics();
            UI.updateButtonStates();
        }
        
        // Auto-save every 10 seconds (100 ticks)
        if (GameState.statistics.gameTime % 10 === 0) {
            if (typeof Storage !== 'undefined') {
                Storage.autoSave();
            }
        }
    },
    
    generateResources() {
        const deltaTime = this.tickRate / 1000; // Convert to seconds
        
        // Generate population from houses
        if (GameState.buildings.houses > 0) {
            const populationGenerated = GameState.buildings.houses * BuildingConfig.houses.baseProduction * GameState.upgrades.efficiency * deltaTime;
            GameState.resources.population += populationGenerated;
        }
        
        // Generate coins from shops (requires population)
        if (GameState.buildings.shops > 0 && GameState.resources.population >= 1) {
            const coinsFromShops = GameState.buildings.shops * BuildingConfig.shops.baseProduction * GameState.upgrades.efficiency * deltaTime;
            GameState.resources.coins += coinsFromShops;
            GameState.statistics.totalCoinsEarned += coinsFromShops;
        }
        
        // Generate coins from factories (advanced production)
        if (GameState.buildings.factories > 0 && GameState.resources.population >= 10) {
            const coinsFromFactories = GameState.buildings.factories * BuildingConfig.factories.baseProduction * GameState.upgrades.efficiency * deltaTime;
            GameState.resources.coins += coinsFromFactories;
            GameState.statistics.totalCoinsEarned += coinsFromFactories;
        }
        
        // Maintain happiness from parks
        if (GameState.buildings.parks > 0) {
            const happinessBonus = GameState.buildings.parks * BuildingConfig.parks.baseProduction * deltaTime;
            GameState.resources.happiness = Math.min(100, GameState.resources.happiness + happinessBonus);
        }
        
        // Happiness decay over time (idle game mechanic)
        if (GameState.resources.population > 0) {
            const happinessDecay = (GameState.resources.population * 0.1) * deltaTime;
            GameState.resources.happiness = Math.max(0, GameState.resources.happiness - happinessDecay);
        }
        
        // Round resources to avoid floating point precision issues
        GameState.resources.coins = Math.floor(GameState.resources.coins * 100) / 100;
        GameState.resources.population = Math.floor(GameState.resources.population * 100) / 100;
        GameState.resources.happiness = Math.floor(GameState.resources.happiness * 100) / 100;
    }
};

// Building System
const Buildings = {
    purchase(buildingType) {
        const config = BuildingConfig[buildingType];
        if (!config) {
            console.error(`Unknown building type: ${buildingType}`);
            return false;
        }
        
        const cost = this.getCost(buildingType);
        const unlockCondition = config.unlockCondition;
        
        // Check unlock conditions
        for (const [resource, required] of Object.entries(unlockCondition)) {
            if (GameState.resources[resource] < required) {
                console.log(`❌ ${config.name} requires ${required} ${resource}`);
                return false;
            }
        }
        
        // Check if player can afford it
        if (GameState.resources.coins < cost) {
            console.log(`❌ Not enough coins for ${config.name}. Need ${cost}, have ${GameState.resources.coins}`);
            return false;
        }
        
        // Purchase the building
        GameState.resources.coins -= cost;
        GameState.buildings[buildingType]++;
        GameState.statistics.buildingsPurchased++;
        
        console.log(`✅ Purchased ${config.name}! Now own ${GameState.buildings[buildingType]}`);
        
        // Update UI immediately
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateBuildingDisplays();
            UI.updateStatistics();
            UI.updateButtonStates();
        }
        
        return true;
    },
    
    getCost(buildingType, quantity = null) {
        const config = BuildingConfig[buildingType];
        const owned = quantity !== null ? quantity : GameState.buildings[buildingType];
        
        // Calculate cost with exponential scaling
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, owned));
    },
    
    getProduction(buildingType) {
        const config = BuildingConfig[buildingType];
        const owned = GameState.buildings[buildingType];
        
        if (owned === 0) return 0;
        
        // Base production per building * number owned * efficiency multiplier
        return config.baseProduction * owned * GameState.upgrades.efficiency;
    },
    
    isUnlocked(buildingType) {
        const config = BuildingConfig[buildingType];
        const unlockCondition = config.unlockCondition;
        
        for (const [resource, required] of Object.entries(unlockCondition)) {
            if (GameState.resources[resource] < required) {
                return false;
            }
        }
        
        return true;
    },
    
    canAfford(buildingType) {
        const cost = this.getCost(buildingType);
        return GameState.resources.coins >= cost;
    }
};

// Manual Actions (clicking)
const ManualActions = {
    collectCoins(amount = 1) {
        GameState.resources.coins += amount;
        GameState.statistics.totalClicks++;
        GameState.statistics.totalCoinsEarned += amount;
        
        console.log(`🪙 Collected ${amount} coins! Total: ${GameState.resources.coins}`);
        
        // Update UI immediately
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateStatistics();
            UI.animateResourceGain('coins', amount);
        }
    },
    
    attractCitizens(amount = 1) {
        GameState.resources.population += amount;
        GameState.statistics.totalClicks++;
        
        console.log(`👥 Attracted ${amount} citizens! Total: ${GameState.resources.population}`);
        
        // Update UI immediately
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateStatistics();
            UI.updateButtonStates();
            UI.animateResourceGain('population', amount);
        }
    }
};

// Game Initialization
const Game = {
    init() {
        console.log('🏙️ Initializing IdleCity...');
        
        // Load saved game if available
        if (typeof Storage !== 'undefined') {
            Storage.loadGame();
        }
        
        // Initialize UI
        if (typeof UI !== 'undefined') {
            UI.init();
        }
        
        // Start game loop
        GameLoop.start();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ IdleCity initialized successfully!');
    },
    
    setupEventListeners() {
        // Manual action buttons
        const clickCoinsBtn = document.getElementById('clickCoinsBtn');
        const clickPopulationBtn = document.getElementById('clickPopulationBtn');
        
        if (clickCoinsBtn) {
            clickCoinsBtn.addEventListener('click', () => {
                ManualActions.collectCoins(1);
            });
        }
        
        if (clickPopulationBtn) {
            clickPopulationBtn.addEventListener('click', () => {
                ManualActions.attractCitizens(1);
            });
        }
        
        // Building purchase buttons
        const buyHouseBtn = document.getElementById('buyHouseBtn');
        const buyShopBtn = document.getElementById('buyShopBtn');
        const buyFactoryBtn = document.getElementById('buyFactoryBtn');
        const buyParkBtn = document.getElementById('buyParkBtn');
        
        if (buyHouseBtn) {
            buyHouseBtn.addEventListener('click', () => {
                Buildings.purchase('houses');
            });
        }
        
        if (buyShopBtn) {
            buyShopBtn.addEventListener('click', () => {
                Buildings.purchase('shops');
            });
        }
        
        if (buyFactoryBtn) {
            buyFactoryBtn.addEventListener('click', () => {
                Buildings.purchase('factories');
            });
        }
        
        if (buyParkBtn) {
            buyParkBtn.addEventListener('click', () => {
                Buildings.purchase('parks');
            });
        }
        
        // Game control buttons
        const saveBtn = document.getElementById('saveBtn');
        const loadBtn = document.getElementById('loadBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (saveBtn && typeof Storage !== 'undefined') {
            saveBtn.addEventListener('click', () => {
                Storage.saveGame();
            });
        }
        
        if (loadBtn && typeof Storage !== 'undefined') {
            loadBtn.addEventListener('click', () => {
                Storage.loadGame();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetGame();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 's':
                        event.preventDefault();
                        if (typeof Storage !== 'undefined') {
                            Storage.saveGame();
                        }
                        break;
                    case 'l':
                        event.preventDefault();
                        if (typeof Storage !== 'undefined') {
                            Storage.loadGame();
                        }
                        break;
                }
            }
            
            // Number keys for quick building purchases
            switch (event.key) {
                case '1':
                    Buildings.purchase('houses');
                    break;
                case '2':
                    Buildings.purchase('shops');
                    break;
                case '3':
                    Buildings.purchase('factories');
                    break;
                case '4':
                    Buildings.purchase('parks');
                    break;
                case ' ':
                    event.preventDefault();
                    ManualActions.collectCoins(1);
                    break;
            }
        });
    },
    
    resetGame() {
        if (confirm('Are you sure you want to reset your game? This action cannot be undone!')) {
            // Reset all game state
            GameState.resources = {
                coins: 0,
                population: 0,
                happiness: 100,
                energy: 100
            };
            
            GameState.buildings = {
                houses: 0,
                shops: 0,
                factories: 0,
                parks: 0
            };
            
            GameState.upgrades = {
                efficiency: 1,
                automation: false,
                research: 0,
                prestige: 0
            };
            
            GameState.statistics = {
                totalClicks: 0,
                gameTime: 0,
                buildingsPurchased: 0,
                totalCoinsEarned: 0,
                gameStartTime: Date.now()
            };
            
            // Clear saved data
            if (typeof Storage !== 'undefined') {
                Storage.clearSave();
            }
            
            // Update UI
            if (typeof UI !== 'undefined') {
                UI.updateAll();
            }
            
            console.log('🔄 Game reset successfully!');
        }
    }
};

// Basic error handling and debugging
window.addEventListener('error', (event) => {
    console.error('🚨 Game Error:', event.error);
});

// Console commands for debugging
window.GameDebug = {
    addCoins: (amount) => {
        GameState.resources.coins += amount;
        console.log(`Added ${amount} coins`);
    },
    addPopulation: (amount) => {
        GameState.resources.population += amount;
        console.log(`Added ${amount} population`);
    },
    addBuilding: (type, amount = 1) => {
        if (BuildingConfig[type]) {
            GameState.buildings[type] += amount;
            console.log(`Added ${amount} ${type}`);
        }
    },
    showState: () => {
        console.log('Current Game State:', GameState);
    }
};

// Initialize game when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        Game.init();
    });
} else {
    Game.init();
}