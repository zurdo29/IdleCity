// IdleCity Game Engine
// Core game logic and state management

// Game State Object
const GameState = {
    // Resources
    resources: {
        coins: 0,
        population: 0,
        happiness: 100,
        energy: 100,
        research: 0
    },

    // Buildings
    buildings: {
        // Tier 1
        houses: 0,
        shops: 0,
        parks: 0,
        // Tier 2
        apartments: 0,
        malls: 0,
        gardens: 0,
        factories: 0,
        labs: 0,
        // Tier 3
        skyscrapers: 0,
        towers: 0,
        powerplants: 0,
        universities: 0,
        resorts: 0
    },

    // Upgrades and multipliers
    upgrades: {
        efficiency: 1,
        automation: false,
        research: 0,
        prestige: 0,
        // Building efficiency upgrades
        residentialEfficiency: 0,
        commercialEfficiency: 0,
        industrialEfficiency: 0,
        leisureEfficiency: 0,
        researchEfficiency: 0,
        // Special upgrades
        happinessBonus: 0,
        populationCap: 10000,
        autoClickerLevel: 0
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

// Enhanced Building Configuration with Tiers and Upgrades
const BuildingConfig = {
    // Tier 1 Buildings - Basic structures
    houses: {
        name: "Houses",
        description: "Generate population over time",
        tier: 1,
        baseCost: 10,
        costMultiplier: 1.15,
        baseProduction: 1,
        resourceType: "population",
        unlockCondition: { coins: 0 },
        icon: "🏠",
        category: "residential",
        upgradeBuilding: "apartments"
    },
    shops: {
        name: "Shops",
        description: "Generate coins from population",
        tier: 1,
        baseCost: 50,
        costMultiplier: 1.20,
        baseProduction: 2,
        resourceType: "coins",
        unlockCondition: { population: 10 },
        icon: "🏪",
        category: "commercial",
        upgradeBuilding: "malls"
    },
    parks: {
        name: "Parks",
        description: "Increase city happiness",
        tier: 1,
        baseCost: 100,
        costMultiplier: 1.18,
        baseProduction: 10,
        resourceType: "happiness",
        unlockCondition: { population: 25 },
        icon: "🌳",
        category: "leisure",
        upgradeBuilding: "gardens"
    },

    // Tier 2 Buildings - Upgraded structures
    apartments: {
        name: "Apartments",
        description: "High-density housing for more population",
        tier: 2,
        baseCost: 500,
        costMultiplier: 1.22,
        baseProduction: 8,
        resourceType: "population",
        unlockCondition: { population: 100, houses: 5 },
        icon: "🏢",
        category: "residential",
        upgradeBuilding: "skyscrapers"
    },
    malls: {
        name: "Shopping Malls",
        description: "Large commercial centers with high coin generation",
        tier: 2,
        baseCost: 1000,
        costMultiplier: 1.25,
        baseProduction: 15,
        resourceType: "coins",
        unlockCondition: { population: 200, shops: 3 },
        icon: "🏬",
        category: "commercial",
        upgradeBuilding: "towers"
    },
    gardens: {
        name: "Botanical Gardens",
        description: "Beautiful gardens that greatly boost happiness",
        tier: 2,
        baseCost: 750,
        costMultiplier: 1.20,
        baseProduction: 25,
        resourceType: "happiness",
        unlockCondition: { population: 150, parks: 4 },
        icon: "🌺",
        category: "leisure",
        upgradeBuilding: "resorts"
    },

    // Tier 2 Industrial Buildings
    factories: {
        name: "Factories",
        description: "Industrial coin production",
        tier: 2,
        baseCost: 800,
        costMultiplier: 1.28,
        baseProduction: 12,
        resourceType: "coins",
        unlockCondition: { population: 75, coins: 500 },
        icon: "🏭",
        category: "industrial",
        upgradeBuilding: "powerplants"
    },
    labs: {
        name: "Research Labs",
        description: "Generate research points for upgrades",
        tier: 2,
        baseCost: 1200,
        costMultiplier: 1.30,
        baseProduction: 1,
        resourceType: "research",
        unlockCondition: { population: 300, happiness: 75 },
        icon: "🔬",
        category: "research",
        upgradeBuilding: "universities"
    },

    // Tier 3 Buildings - Advanced structures
    skyscrapers: {
        name: "Skyscrapers",
        description: "Massive population centers",
        tier: 3,
        baseCost: 5000,
        costMultiplier: 1.35,
        baseProduction: 50,
        resourceType: "population",
        unlockCondition: { population: 500, apartments: 3 },
        icon: "🏙️",
        category: "residential",
        upgradeBuilding: null
    },
    towers: {
        name: "Corporate Towers",
        description: "Elite business centers with massive coin generation",
        tier: 3,
        baseCost: 8000,
        costMultiplier: 1.40,
        baseProduction: 100,
        resourceType: "coins",
        unlockCondition: { population: 800, malls: 2 },
        icon: "🏗️",
        category: "commercial",
        upgradeBuilding: null
    },
    powerplants: {
        name: "Power Plants",
        description: "Massive industrial complexes",
        tier: 3,
        baseCost: 6000,
        costMultiplier: 1.38,
        baseProduction: 80,
        resourceType: "coins",
        unlockCondition: { population: 600, factories: 3 },
        icon: "⚡",
        category: "industrial",
        upgradeBuilding: null
    },
    universities: {
        name: "Universities",
        description: "Advanced research and education centers",
        tier: 3,
        baseCost: 10000,
        costMultiplier: 1.45,
        baseProduction: 5,
        resourceType: "research",
        unlockCondition: { population: 1000, labs: 2 },
        icon: "🎓",
        category: "research",
        upgradeBuilding: null
    },
    resorts: {
        name: "Luxury Resorts",
        description: "Ultimate happiness destinations",
        tier: 3,
        baseCost: 7500,
        costMultiplier: 1.42,
        baseProduction: 150,
        resourceType: "happiness",
        unlockCondition: { population: 750, gardens: 2 },
        icon: "🏖️",
        category: "leisure",
        upgradeBuilding: null
    }
};

// Upgrade System Configuration
const UpgradeConfig = {
    // Efficiency Upgrades
    residentialEfficiency: {
        name: "Residential Efficiency",
        description: "Increase population generation by 25%",
        baseCost: 100,
        costMultiplier: 2.0,
        maxLevel: 10,
        effect: 0.25,
        resourceType: "research",
        category: "efficiency",
        icon: "🏠⚡"
    },
    commercialEfficiency: {
        name: "Commercial Efficiency",
        description: "Increase coin generation from commercial buildings by 25%",
        baseCost: 150,
        costMultiplier: 2.2,
        maxLevel: 10,
        effect: 0.25,
        resourceType: "research",
        category: "efficiency",
        icon: "🏪⚡"
    },
    industrialEfficiency: {
        name: "Industrial Efficiency",
        description: "Increase coin generation from industrial buildings by 30%",
        baseCost: 200,
        costMultiplier: 2.5,
        maxLevel: 8,
        effect: 0.30,
        resourceType: "research",
        category: "efficiency",
        icon: "🏭⚡"
    },
    leisureEfficiency: {
        name: "Leisure Efficiency",
        description: "Increase happiness generation by 20%",
        baseCost: 120,
        costMultiplier: 1.8,
        maxLevel: 12,
        effect: 0.20,
        resourceType: "research",
        category: "efficiency",
        icon: "🌳⚡"
    },
    researchEfficiency: {
        name: "Research Efficiency",
        description: "Increase research generation by 50%",
        baseCost: 300,
        costMultiplier: 3.0,
        maxLevel: 5,
        effect: 0.50,
        resourceType: "research",
        category: "efficiency",
        icon: "🔬⚡"
    },

    // Special Upgrades
    happinessBonus: {
        name: "City Planning",
        description: "Base happiness bonus +10",
        baseCost: 50,
        costMultiplier: 1.5,
        maxLevel: 20,
        effect: 10,
        resourceType: "research",
        category: "special",
        icon: "😊"
    },
    populationCap: {
        name: "Urban Expansion",
        description: "Increase population capacity by 5000",
        baseCost: 500,
        costMultiplier: 2.8,
        maxLevel: 10,
        effect: 5000,
        resourceType: "research",
        category: "special",
        icon: "🌍"
    },
    autoClickerLevel: {
        name: "Auto Clicker",
        description: "Automatically collect 1 coin per second per level",
        baseCost: 1000,
        costMultiplier: 4.0,
        maxLevel: 5,
        effect: 1,
        resourceType: "research",
        category: "automation",
        icon: "🤖"
    }
};

// Game Loop Management
const GameLoop = {
    intervalId: null,
    tickRate: 100, // 10 ticks per second for smooth updates
    lastSaveTime: null, // Track last auto-save time
    uiUpdateCounter: 0, // Counter for UI updates

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

        // Check for resource milestones and achievements (less frequently)
        if (this.uiUpdateCounter % 10 === 0) { // Every second
            this.checkResourceAchievements();
            
            // Check achievements
            if (typeof Achievements !== 'undefined') {
                Achievements.checkAchievements();
            }
        }

        // Update UI (resource displays every tick, other elements less frequently)
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            
            // Update other UI elements less frequently for better performance
            if (this.uiUpdateCounter % 5 === 0) { // Every 0.5 seconds
                UI.updateBuildingDisplays();
                UI.updateStatistics();
                UI.updateButtonStates();
            }
        }
        
        this.uiUpdateCounter++;

        // Auto-save every 10 seconds (100 ticks) - only on exact 10 second intervals
        if (GameState.statistics.gameTime > 0 && GameState.statistics.gameTime % 10 === 0) {
            // Use a flag to prevent multiple saves in the same second
            if (!this.lastSaveTime || this.lastSaveTime !== GameState.statistics.gameTime) {
                this.lastSaveTime = GameState.statistics.gameTime;
                if (typeof Storage !== 'undefined') {
                    Storage.autoSave();
                }
            }
        }
    },

    generateResources() {
        const deltaTime = this.tickRate / 1000; // Convert to seconds

        // Auto-clicker from upgrades
        if (GameState.upgrades.autoClickerLevel > 0) {
            const autoCoins = GameState.upgrades.autoClickerLevel * deltaTime;
            GameState.resources.coins += autoCoins;
            GameState.statistics.totalCoinsEarned += autoCoins;
        }

        // Check for newly unlocked buildings
        this.checkUnlockedBuildings();

        // Generate resources from all building types
        Object.keys(GameState.buildings).forEach(buildingType => {
            const buildingCount = GameState.buildings[buildingType];
            if (buildingCount > 0) {
                const config = BuildingConfig[buildingType];
                if (config) {
                    const categoryMultiplier = this.getCategoryMultiplier(config.category);
                    const baseGeneration = buildingCount * config.baseProduction * GameState.upgrades.efficiency * categoryMultiplier * deltaTime;

                    // Apply resource generation based on building type
                    switch (config.resourceType) {
                        case 'population':
                            // Check population cap
                            if (GameState.resources.population < GameState.upgrades.populationCap) {
                                GameState.resources.population += baseGeneration;
                                GameState.resources.population = Math.min(GameState.resources.population, GameState.upgrades.populationCap);
                            }
                            break;

                        case 'coins':
                            // Commercial buildings need population, industrial buildings work independently
                            if (config.category === 'commercial' && GameState.resources.population < 1) {
                                break; // No coin generation without population
                            }
                            if (config.category === 'industrial' && GameState.resources.population < 10) {
                                break; // Industrial needs more population
                            }
                            GameState.resources.coins += baseGeneration;
                            GameState.statistics.totalCoinsEarned += baseGeneration;
                            break;

                        case 'happiness':
                            const happinessGeneration = baseGeneration + (GameState.upgrades.happinessBonus * buildingCount * deltaTime);
                            GameState.resources.happiness = Math.min(100, GameState.resources.happiness + happinessGeneration);
                            break;

                        case 'research':
                            if (GameState.resources.happiness >= 50) { // Research requires happy population
                                GameState.resources.research += baseGeneration;
                            }
                            break;
                    }
                }
            }
        });

        // Happiness decay over time (idle game mechanic)
        if (GameState.resources.population > 0) {
            const happinessDecay = (GameState.resources.population * 0.05) * deltaTime; // Reduced decay rate
            GameState.resources.happiness = Math.max(0, GameState.resources.happiness - happinessDecay);
        }

        // Round resources to avoid floating point precision issues
        GameState.resources.coins = Math.floor(GameState.resources.coins * 100) / 100;
        GameState.resources.population = Math.floor(GameState.resources.population * 100) / 100;
        GameState.resources.happiness = Math.floor(GameState.resources.happiness * 100) / 100;
        GameState.resources.research = Math.floor(GameState.resources.research * 100) / 100;
    },

    getCategoryMultiplier(category) {
        switch (category) {
            case 'residential':
                return 1 + (GameState.upgrades.residentialEfficiency * UpgradeConfig.residentialEfficiency.effect);
            case 'commercial':
                return 1 + (GameState.upgrades.commercialEfficiency * UpgradeConfig.commercialEfficiency.effect);
            case 'industrial':
                return 1 + (GameState.upgrades.industrialEfficiency * UpgradeConfig.industrialEfficiency.effect);
            case 'leisure':
                return 1 + (GameState.upgrades.leisureEfficiency * UpgradeConfig.leisureEfficiency.effect);
            case 'research':
                return 1 + (GameState.upgrades.researchEfficiency * UpgradeConfig.researchEfficiency.effect);
            default:
                return 1;
        }
    },

    checkResourceAchievements() {
        // Population milestones
        const population = Math.floor(GameState.resources.population);
        const populationMilestones = [10, 50, 100, 500, 1000, 5000];
        
        if (populationMilestones.includes(population)) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Growing City: Reached ${population} population!`, 'achievement', 4000);
            }
        }
        
        // Happiness achievements
        const happiness = Math.floor(GameState.resources.happiness);
        if (happiness === 100 && GameState.resources.population > 100) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Perfect Happiness: 100% happiness with 100+ population!`, 'achievement', 4000);
            }
        }
        
        // Research milestones
        const research = Math.floor(GameState.resources.research);
        const researchMilestones = [10, 50, 100, 500, 1000];
        
        if (researchMilestones.includes(research)) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Researcher: Accumulated ${research} research points!`, 'achievement', 4000);
            }
        }
        
        // Time-based achievements
        const gameTime = GameState.statistics.gameTime;
        const timeMilestones = [300, 900, 1800, 3600]; // 5min, 15min, 30min, 1hour
        
        if (timeMilestones.includes(gameTime)) {
            const timeText = gameTime >= 3600 ? `${Math.floor(gameTime/3600)} hour(s)` : `${Math.floor(gameTime/60)} minutes`;
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Dedicated Player: Played for ${timeText}!`, 'achievement', 4000);
            }
        }
    },

    checkUnlockedBuildings() {
        // Track which buildings were previously unlocked
        if (!this.previouslyUnlocked) {
            this.previouslyUnlocked = new Set();
            // Initialize with currently unlocked buildings
            Object.keys(BuildingConfig).forEach(buildingType => {
                if (Buildings.isUnlocked(buildingType)) {
                    this.previouslyUnlocked.add(buildingType);
                }
            });
            return;
        }

        // Check for newly unlocked buildings
        Object.keys(BuildingConfig).forEach(buildingType => {
            if (!this.previouslyUnlocked.has(buildingType) && Buildings.isUnlocked(buildingType)) {
                this.previouslyUnlocked.add(buildingType);
                const config = BuildingConfig[buildingType];
                
                if (typeof UI !== 'undefined') {
                    UI.showNotification(`🔓 New Building Unlocked: ${config.name}! ${config.description}`, 'success', 5000);
                }
            }
        });
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

        // Check for achievements
        this.checkBuildingAchievements(buildingType);

        // Update UI immediately
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateBuildingDisplays();
            UI.updateStatistics();
            UI.updateButtonStates();
            
            // Show purchase notification
            UI.showNotification(`🏗️ Built ${config.name}! (+${config.baseProduction} ${config.resourceType}/sec)`, 'success');
        }

        return true;
    },

    getCost(buildingType, quantity = null) {
        const config = BuildingConfig[buildingType];
        if (!config) {
            // Only log warning if not in testing mode
            if (typeof Testing === 'undefined' || !Testing.isRunning) {
                console.warn(`Unknown building type: ${buildingType}`);
            }
            return undefined;
        }

        const owned = quantity !== null ? quantity : GameState.buildings[buildingType];

        // Calculate cost with exponential scaling
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, owned));
    },

    getProduction(buildingType) {
        const config = BuildingConfig[buildingType];
        const owned = GameState.buildings[buildingType];

        if (owned === 0) return 0;

        // Get category multiplier
        const categoryMultiplier = GameLoop.getCategoryMultiplier(config.category);

        // Base production per building * number owned * efficiency multiplier * category multiplier
        return config.baseProduction * owned * GameState.upgrades.efficiency * categoryMultiplier;
    },

    isUnlocked(buildingType) {
        const config = BuildingConfig[buildingType];
        if (!config) return false;

        const unlockCondition = config.unlockCondition;

        for (const [requirement, required] of Object.entries(unlockCondition)) {
            // Check resource requirements
            if (GameState.resources[requirement] !== undefined) {
                if (GameState.resources[requirement] < required) {
                    return false;
                }
            }
            // Check building requirements
            else if (GameState.buildings[requirement] !== undefined) {
                if (GameState.buildings[requirement] < required) {
                    return false;
                }
            }
        }

        return true;
    },

    canAfford(buildingType) {
        const cost = this.getCost(buildingType);
        return GameState.resources.coins >= cost;
    },

    checkBuildingAchievements(buildingType) {
        const count = GameState.buildings[buildingType];
        const config = BuildingConfig[buildingType];
        
        // Building milestone achievements
        const milestones = [1, 5, 10, 25, 50, 100];
        
        if (milestones.includes(count)) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Achievement: Built ${count} ${config.name}s!`, 'achievement', 4000);
            }
        }
        
        // Total buildings achievements
        const totalBuildings = Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0);
        const totalMilestones = [10, 25, 50, 100, 250, 500];
        
        if (totalMilestones.includes(totalBuildings)) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 City Builder: Built ${totalBuildings} total buildings!`, 'achievement', 4000);
            }
        }
        
        // Tier unlock achievements
        if (count === 1) {
            switch (config.tier) {
                case 2:
                    if (typeof UI !== 'undefined') {
                        UI.showNotification(`🏆 Tier 2 Unlocked: Built your first ${config.name}!`, 'achievement', 4000);
                    }
                    break;
                case 3:
                    if (typeof UI !== 'undefined') {
                        UI.showNotification(`🏆 Tier 3 Unlocked: Built your first ${config.name}!`, 'achievement', 4000);
                    }
                    break;
            }
        }
    }
};

// Upgrade System
const Upgrades = {
    purchase(upgradeType) {
        const config = UpgradeConfig[upgradeType];
        if (!config) {
            console.error(`Unknown upgrade type: ${upgradeType}`);
            return false;
        }

        const currentLevel = GameState.upgrades[upgradeType] || 0;

        // Check if max level reached
        if (currentLevel >= config.maxLevel) {
            console.log(`❌ ${config.name} is already at max level (${config.maxLevel})`);
            return false;
        }

        const cost = this.getCost(upgradeType);

        // Check if player can afford it
        if (GameState.resources[config.resourceType] < cost) {
            console.log(`❌ Not enough ${config.resourceType} for ${config.name}. Need ${cost}, have ${GameState.resources[config.resourceType]}`);
            return false;
        }

        // Purchase the upgrade
        GameState.resources[config.resourceType] -= cost;
        GameState.upgrades[upgradeType] = currentLevel + 1;
        
        // Track upgrade purchases
        if (!GameState.statistics.totalUpgradesPurchased) {
            GameState.statistics.totalUpgradesPurchased = 0;
        }
        GameState.statistics.totalUpgradesPurchased++;

        console.log(`✅ Purchased ${config.name} level ${currentLevel + 1}!`);

        // Update UI immediately
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateUpgradeDisplays();
            
            // Show upgrade notification
            UI.showNotification(`⚡ Upgraded ${config.name} to level ${currentLevel + 1}!`, 'success');
        }

        return true;
    },

    getCost(upgradeType) {
        const config = UpgradeConfig[upgradeType];
        if (!config) return 0;

        const currentLevel = GameState.upgrades[upgradeType] || 0;
        return Math.floor(config.baseCost * Math.pow(config.costMultiplier, currentLevel));
    },

    getEffect(upgradeType) {
        const config = UpgradeConfig[upgradeType];
        if (!config) return 0;

        const currentLevel = GameState.upgrades[upgradeType] || 0;
        return config.effect * currentLevel;
    },

    canAfford(upgradeType) {
        const config = UpgradeConfig[upgradeType];
        if (!config) return false;

        const cost = this.getCost(upgradeType);
        return GameState.resources[config.resourceType] >= cost;
    },

    isMaxLevel(upgradeType) {
        const config = UpgradeConfig[upgradeType];
        if (!config) return true;

        const currentLevel = GameState.upgrades[upgradeType] || 0;
        return currentLevel >= config.maxLevel;
    }
};

// Manual Actions (clicking)
const ManualActions = {
    collectCoins(amount = 1) {
        GameState.resources.coins += amount;
        GameState.statistics.totalClicks++;
        GameState.statistics.totalCoinsEarned += amount;

        console.log(`🪙 Collected ${amount} coins! Total: ${GameState.resources.coins}`);

        // Check for click achievements
        this.checkClickAchievements();

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

        // Check for click achievements
        this.checkClickAchievements();

        // Update UI immediately
        if (typeof UI !== 'undefined') {
            UI.updateResourceDisplays();
            UI.updateStatistics();
            UI.updateButtonStates();
            UI.animateResourceGain('population', amount);
        }
    },

    checkClickAchievements() {
        const clicks = GameState.statistics.totalClicks;
        const clickMilestones = [10, 50, 100, 500, 1000, 5000];
        
        if (clickMilestones.includes(clicks)) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Clicker: Made ${clicks} clicks!`, 'achievement', 4000);
            }
        }
        
        // Coins earned achievements
        const coinsEarned = GameState.statistics.totalCoinsEarned;
        const coinMilestones = [100, 1000, 10000, 100000, 1000000];
        
        if (coinMilestones.includes(Math.floor(coinsEarned))) {
            if (typeof UI !== 'undefined') {
                UI.showNotification(`🏆 Wealthy: Earned ${this.formatNumber(coinsEarned)} total coins!`, 'achievement', 4000);
            }
        }
    },

    formatNumber(num) {
        if (typeof UI !== 'undefined') {
            return UI.formatNumber(num);
        }
        return num.toString();
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

        // Show welcome message and verify systems
        setTimeout(() => {
            if (typeof UI !== 'undefined') {
                UI.showNotification('🏙️ Welcome to IdleCity! Press H for keyboard shortcuts.', 'info', 5000);
                
                // Verify achievements tab is working
                if (typeof Achievements !== 'undefined' && typeof Statistics !== 'undefined') {
                    console.log('✅ All systems loaded successfully');
                } else {
                    console.warn('⚠️ Some systems not loaded:', {
                        achievements: typeof Achievements !== 'undefined',
                        statistics: typeof Statistics !== 'undefined'
                    });
                }
            }
        }, 1000);

        console.log('✅ IdleCity initialized successfully!');
        
        // Debug: Log building configurations for verification (development only)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔧 Building Configurations:', BuildingConfig);
            console.log('🔧 Upgrade Configurations:', UpgradeConfig);
        }
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

        // Dynamic building purchase buttons (set up after UI generates them)
        setTimeout(() => {
            Object.keys(BuildingConfig).forEach(buildingType => {
                const buttonId = `buy${buildingType.charAt(0).toUpperCase() + buildingType.slice(1)}Btn`;
                const button = document.getElementById(buttonId);
                
                if (button) {
                    button.addEventListener('click', () => {
                        Buildings.purchase(buildingType);
                    });
                }
            });
            
            // Dynamic upgrade purchase buttons
            Object.keys(UpgradeConfig).forEach(upgradeType => {
                const buttonId = `buy${upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)}Btn`;
                const button = document.getElementById(buttonId);
                
                if (button) {
                    button.addEventListener('click', () => {
                        Upgrades.purchase(upgradeType);
                    });
                }
            });
        }, 100); // Small delay to ensure UI is generated

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
                energy: 100,
                research: 0
            };

            GameState.buildings = {
                // Tier 1
                houses: 0,
                shops: 0,
                parks: 0,
                // Tier 2
                apartments: 0,
                malls: 0,
                gardens: 0,
                factories: 0,
                labs: 0,
                // Tier 3
                skyscrapers: 0,
                towers: 0,
                powerplants: 0,
                universities: 0,
                resorts: 0
            };

            GameState.upgrades = {
                efficiency: 1,
                automation: false,
                research: 0,
                prestige: 0,
                // Building efficiency upgrades
                residentialEfficiency: 0,
                commercialEfficiency: 0,
                industrialEfficiency: 0,
                leisureEfficiency: 0,
                researchEfficiency: 0,
                // Special upgrades
                happinessBonus: 0,
                populationCap: 10000,
                autoClickerLevel: 0
            };

            GameState.statistics = {
                totalClicks: 0,
                gameTime: 0,
                buildingsPurchased: 0,
                totalCoinsEarned: 0,
                gameStartTime: Date.now()
            };

            // Reset achievements and statistics
            if (typeof Achievements !== 'undefined') {
                Achievements.unlockedAchievements.clear();
                Object.values(Achievements.definitions).forEach(achievement => {
                    achievement.unlocked = false;
                    achievement.progress = 0;
                });
                GameState.achievements = {
                    unlocked: [],
                    totalUnlocked: 0
                };
            }
            
            if (typeof Statistics !== 'undefined') {
                Statistics.reset();
            }

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
    },
    testProduction: () => {
        console.log('=== Production Test ===');
        Object.keys(BuildingConfig).forEach(buildingType => {
            const count = GameState.buildings[buildingType];
            if (count > 0) {
                const production = Buildings.getProduction(buildingType);
                const config = BuildingConfig[buildingType];
                console.log(`${config.name} (${count}): ${production} ${config.resourceType}/sec`);
            }
        });
        
        if (typeof UI !== 'undefined') {
            console.log('UI Calculations:');
            console.log(`Coins/sec: ${UI.calculateCoinsPerSecond()}`);
            console.log(`Population/sec: ${UI.calculatePopulationPerSecond()}`);
            console.log(`Happiness/sec: ${UI.calculateHappinessPerSecond()}`);
            console.log(`Research/sec: ${UI.calculateResearchPerSecond()}`);
        }
    },
    testAchievements: () => {
        console.log('=== Achievement Test ===');
        if (typeof Achievements !== 'undefined') {
            console.log('Achievements system loaded:', true);
            console.log('Total achievements:', Object.keys(Achievements.definitions).length);
            console.log('Unlocked achievements:', Achievements.unlockedAchievements.size);
            
            if (typeof UI !== 'undefined') {
                console.log('Switching to achievements tab...');
                UI.switchTab('achievements');
            }
        } else {
            console.log('Achievements system not loaded');
        }
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