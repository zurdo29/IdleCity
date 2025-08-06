// IdleCity UI Management
// Handles all user interface updates and animations

const UI = {
    // DOM element references (cached for performance)
    elements: {},

    // Animation and notification system
    notifications: [],
    animationQueue: [],

    init() {
        console.log('🎨 Initializing UI system...');

        try {
            // Cache DOM elements for better performance
            this.cacheElements();

            // Initialize floating text styles
            this.initFloatingTextStyles();

            // Initialize notification system
            this.initNotificationSystem();

            // Initialize keyboard shortcuts
            this.initKeyboardShortcuts();

            // Initial UI update
            this.updateAll();

            // Register with performance system if available
            if (typeof Performance !== 'undefined') {
                Performance.registerErrorRecovery('ui', () => {
                    console.log('🔄 Attempting UI recovery...');
                    this.recoverFromError();
                });
            }

            console.log('✅ UI system initialized');
        } catch (error) {
            console.error('❌ UI initialization failed:', error);
            if (typeof Performance !== 'undefined') {
                Performance.handleError('uiInit', error);
            }
            // Attempt basic recovery
            this.initBasicUI();
        }
    },

    // Basic UI recovery method
    recoverFromError() {
        try {
            // Re-cache elements
            this.cacheElements();

            // Update displays
            this.updateResourceDisplays();
            this.updateStatistics();

            console.log('✅ UI recovery completed');
        } catch (error) {
            console.error('❌ UI recovery failed:', error);
        }
    },

    // Minimal UI initialization for error recovery
    initBasicUI() {
        try {
            // Cache only essential elements
            this.elements.coinsCount = document.getElementById('coinsCount');
            this.elements.populationCount = document.getElementById('populationCount');
            this.elements.happinessCount = document.getElementById('happinessCount');

            // Basic update
            if (this.elements.coinsCount) {
                this.elements.coinsCount.textContent = Math.floor(GameState.resources.coins);
            }
            if (this.elements.populationCount) {
                this.elements.populationCount.textContent = Math.floor(GameState.resources.population);
            }
            if (this.elements.happinessCount) {
                this.elements.happinessCount.textContent = Math.floor(GameState.resources.happiness);
            }

            console.log('✅ Basic UI initialized');
        } catch (error) {
            console.error('❌ Basic UI initialization failed:', error);
        }
    },

    cacheElements() {
        // Resource displays
        this.elements.coinsCount = document.getElementById('coinsCount');
        this.elements.populationCount = document.getElementById('populationCount');
        this.elements.happinessCount = document.getElementById('happinessCount');
        this.elements.researchCount = document.getElementById('researchCount');
        this.elements.coinsPerSecond = document.getElementById('coinsPerSecond');
        this.elements.populationPerSecond = document.getElementById('populationPerSecond');
        this.elements.happinessPerSecond = document.getElementById('happinessPerSecond');
        this.elements.researchPerSecond = document.getElementById('researchPerSecond');

        // Dynamic containers
        this.elements.buildingsGrid = document.getElementById('buildingsGrid');
        this.elements.upgradesGrid = document.getElementById('upgradesGrid');

        // Tab system
        this.elements.buildingsTab = document.getElementById('buildingsTab');
        this.elements.upgradesTab = document.getElementById('upgradesTab');
        this.elements.achievementsTab = document.getElementById('achievementsTab');
        this.elements.buildingsContent = document.getElementById('buildingsContent');
        this.elements.upgradesContent = document.getElementById('upgradesContent');
        this.elements.achievementsContent = document.getElementById('achievementsContent');

        // Statistics
        this.elements.totalClicks = document.getElementById('totalClicks');
        this.elements.totalBuildings = document.getElementById('totalBuildings');
        this.elements.gameTime = document.getElementById('gameTime');
        this.elements.totalCoinsEarned = document.getElementById('totalCoinsEarned');

        // Progress bars
        this.elements.happinessProgress = document.getElementById('happinessProgress');
        this.elements.populationProgress = document.getElementById('populationProgress');
        this.elements.populationCapacity = document.getElementById('populationCapacity');

        // Notification container
        this.elements.notificationContainer = document.getElementById('notificationContainer');

        // Achievement elements
        this.elements.achievementsGrid = document.getElementById('achievementsGrid');
        this.elements.achievementProgress = document.getElementById('achievementProgress');
        this.elements.achievementProgressBar = document.getElementById('achievementProgressBar');
        this.elements.achievementPercentage = document.getElementById('achievementPercentage');

        // Statistics elements
        this.elements.statTotalClicks = document.getElementById('statTotalClicks');
        this.elements.statTotalCoins = document.getElementById('statTotalCoins');
        this.elements.statTotalBuildings = document.getElementById('statTotalBuildings');
        this.elements.statMaxPopulation = document.getElementById('statMaxPopulation');
        this.elements.statMaxHappiness = document.getElementById('statMaxHappiness');
        this.elements.statTotalResearch = document.getElementById('statTotalResearch');
        this.elements.statGameTime = document.getElementById('statGameTime');
        this.elements.statCurrentSession = document.getElementById('statCurrentSession');
        this.elements.buildingBreakdown = document.getElementById('buildingBreakdown');

        // Initialize dynamic UI
        this.initializeTabs();
        this.generateBuildingsUI();
        this.generateUpgradesUI();
        this.generateAchievementsUI();
    },

    updateAll() {
        this.updateResourceDisplays();
        this.updateBuildingDisplays();
        this.updateUpgradeDisplays();
        this.updateAchievementDisplays();
        this.updateStatistics();
        this.updateButtonStates();
    },

    updateResourceDisplays() {
        try {
            // Use batched DOM updates if performance system is available
            const useBatching = typeof Performance !== 'undefined' && Performance.state.isRunning;

            // Update resource counters with formatting
            if (this.elements.coinsCount) {
                if (useBatching) {
                    Performance.batchDOMUpdate(
                        this.elements.coinsCount,
                        'textContent',
                        this.formatNumber(GameState.resources.coins)
                    );
                } else {
                    // Direct update to prevent multiple number flashing
                    const newValue = this.formatNumber(GameState.resources.coins);
                    if (this.elements.coinsCount.textContent !== newValue) {
                        this.elements.coinsCount.textContent = newValue;
                    }
                }
            }

            if (this.elements.populationCount) {
                if (useBatching) {
                    Performance.batchDOMUpdate(
                        this.elements.populationCount,
                        'textContent',
                        this.formatNumber(GameState.resources.population)
                    );
                } else {
                    // Direct update to prevent multiple number flashing
                    const newValue = this.formatNumber(GameState.resources.population);
                    if (this.elements.populationCount.textContent !== newValue) {
                        this.elements.populationCount.textContent = newValue;
                    }
                }
            }

            if (this.elements.happinessCount) {
                const happiness = Math.floor(GameState.resources.happiness);
                if (useBatching) {
                    Performance.batchDOMUpdate(
                        this.elements.happinessCount,
                        'textContent',
                        happiness.toString()
                    );
                } else {
                    // Direct update to prevent multiple number flashing
                    const newValue = happiness.toString();
                    if (this.elements.happinessCount.textContent !== newValue) {
                        this.elements.happinessCount.textContent = newValue;
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error updating resource displays:', error);
            if (typeof Performance !== 'undefined') {
                Performance.handleError('resourceUpdate', error);
            }
        }

        // Update progress bars
        this.updateProgressBars();

        // Update production rates
        if (this.elements.coinsPerSecond) {
            const coinsPerSec = this.calculateCoinsPerSecond();
            this.elements.coinsPerSecond.textContent = this.formatNumber(coinsPerSec, 1);
        }

        if (this.elements.populationPerSecond) {
            const popPerSec = this.calculatePopulationPerSecond();
            this.elements.populationPerSecond.textContent = this.formatNumber(popPerSec, 1);
        }

        if (this.elements.happinessPerSecond) {
            const happinessPerSec = this.calculateHappinessPerSecond();
            this.elements.happinessPerSecond.textContent = happinessPerSec >= 0 ? '+' + this.formatNumber(happinessPerSec, 1) : this.formatNumber(happinessPerSec, 1);
        }

        // Update research counter
        if (this.elements.researchCount) {
            this.elements.researchCount.textContent = this.formatNumber(GameState.resources.research);
        }

        if (this.elements.researchPerSecond) {
            const researchPerSec = this.calculateResearchPerSecond();
            this.elements.researchPerSecond.textContent = this.formatNumber(researchPerSec, 1);
        }
    },

    updateBuildingDisplays() {
        // Update building counts
        if (this.elements.housesOwned) {
            this.elements.housesOwned.textContent = GameState.buildings.houses;
        }
        if (this.elements.shopsOwned) {
            this.elements.shopsOwned.textContent = GameState.buildings.shops;
        }
        if (this.elements.factoriesOwned) {
            this.elements.factoriesOwned.textContent = GameState.buildings.factories;
        }
        if (this.elements.parksOwned) {
            this.elements.parksOwned.textContent = GameState.buildings.parks;
        }

        // Update production displays
        if (this.elements.housesProduction) {
            this.elements.housesProduction.textContent = this.formatNumber(Buildings.getProduction('houses'), 1);
        }
        if (this.elements.shopsProduction) {
            this.elements.shopsProduction.textContent = this.formatNumber(Buildings.getProduction('shops'), 1);
        }
        if (this.elements.factoriesProduction) {
            this.elements.factoriesProduction.textContent = this.formatNumber(Buildings.getProduction('factories'), 1);
        }
        if (this.elements.parksEffect) {
            this.elements.parksEffect.textContent = this.formatNumber(Buildings.getProduction('parks'), 1);
        }

        // Update costs
        if (this.elements.housesCost) {
            this.elements.housesCost.textContent = this.formatNumber(Buildings.getCost('houses')) + ' coins';
        }
        if (this.elements.shopsCost) {
            this.elements.shopsCost.textContent = this.formatNumber(Buildings.getCost('shops')) + ' coins';
        }
        if (this.elements.factoriesCost) {
            this.elements.factoriesCost.textContent = this.formatNumber(Buildings.getCost('factories')) + ' coins';
        }
        if (this.elements.parksCost) {
            this.elements.parksCost.textContent = this.formatNumber(Buildings.getCost('parks')) + ' coins';
        }
    },

    updateStatistics() {
        if (this.elements.totalClicks) {
            this.elements.totalClicks.textContent = this.formatNumber(GameState.statistics.totalClicks);
        }

        if (this.elements.totalBuildings) {
            const totalBuildings = Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0);
            this.elements.totalBuildings.textContent = this.formatNumber(totalBuildings);
        }

        if (this.elements.gameTime) {
            this.elements.gameTime.textContent = this.formatTime(GameState.statistics.gameTime);
        }

        if (this.elements.totalCoinsEarned) {
            this.elements.totalCoinsEarned.textContent = this.formatNumber(GameState.statistics.totalCoinsEarned);
        }
    },

    updateButtonStates() {
        // Update building purchase buttons
        this.updateBuildingButton('buyHouseBtn', 'houses');
        this.updateBuildingButton('buyShopBtn', 'shops');
        this.updateBuildingButton('buyFactoryBtn', 'factories');
        this.updateBuildingButton('buyParkBtn', 'parks');
    },

    updateBuildingButton(buttonId, buildingType) {
        const button = this.elements[buttonId];
        if (!button) return;

        const canAfford = Buildings.canAfford(buildingType);
        const isUnlocked = Buildings.isUnlocked(buildingType);

        // Enable/disable button based on affordability and unlock status
        button.disabled = !canAfford || !isUnlocked;

        // Update button text and styling
        if (!isUnlocked) {
            button.textContent = 'Locked';
            button.classList.add('opacity-50');
        } else if (!canAfford) {
            button.textContent = `Buy ${BuildingConfig[buildingType].name}`;
            button.classList.add('opacity-75');
        } else {
            button.textContent = `Buy ${BuildingConfig[buildingType].name}`;
            button.classList.remove('opacity-50', 'opacity-75');
        }
    },

    // Calculation helpers for production rates
    calculateCoinsPerSecond() {
        let coinsPerSec = 0;

        // Auto-clicker coins
        if (GameState.upgrades.autoClickerLevel > 0) {
            coinsPerSec += GameState.upgrades.autoClickerLevel;
        }

        // Iterate through all buildings that generate coins
        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const buildingCount = GameState.buildings[buildingType];

            if (buildingCount > 0 && config.resourceType === 'coins') {
                // Check population requirements for different building categories
                let canGenerate = true;

                if (config.category === 'commercial' && GameState.resources.population < 1) {
                    canGenerate = false; // Commercial buildings need population
                }
                if (config.category === 'industrial' && GameState.resources.population < 10) {
                    canGenerate = false; // Industrial buildings need more population
                }

                if (canGenerate) {
                    const categoryMultiplier = this.getCategoryMultiplier(config.category);
                    coinsPerSec += buildingCount * config.baseProduction * GameState.upgrades.efficiency * categoryMultiplier;
                }
            }
        });

        return coinsPerSec;
    },

    calculatePopulationPerSecond() {
        let populationPerSec = 0;

        // Iterate through all buildings that generate population
        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const buildingCount = GameState.buildings[buildingType];

            if (buildingCount > 0 && config.resourceType === 'population') {
                const categoryMultiplier = this.getCategoryMultiplier(config.category);
                populationPerSec += buildingCount * config.baseProduction * GameState.upgrades.efficiency * categoryMultiplier;
            }
        });

        return populationPerSec;
    },

    calculateHappinessPerSecond() {
        let happinessPerSec = 0;

        // Iterate through all buildings that generate happiness
        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const buildingCount = GameState.buildings[buildingType];

            if (buildingCount > 0 && config.resourceType === 'happiness') {
                const categoryMultiplier = this.getCategoryMultiplier(config.category);
                const baseGeneration = buildingCount * config.baseProduction * GameState.upgrades.efficiency * categoryMultiplier;
                happinessPerSec += baseGeneration;

                // Add happiness bonus from upgrades
                happinessPerSec += GameState.upgrades.happinessBonus * buildingCount;
            }
        });

        // Happiness decay from population (same as in game loop)
        if (GameState.resources.population > 0) {
            happinessPerSec -= GameState.resources.population * 0.05; // Match the decay rate from game loop
        }

        return happinessPerSec;
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

    calculateResearchPerSecond() {
        let researchPerSec = 0;

        // Iterate through all buildings that generate research
        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const buildingCount = GameState.buildings[buildingType];

            if (buildingCount > 0 && config.resourceType === 'research') {
                // Research requires happiness >= 50
                if (GameState.resources.happiness >= 50) {
                    const categoryMultiplier = this.getCategoryMultiplier(config.category);
                    researchPerSec += buildingCount * config.baseProduction * GameState.upgrades.efficiency * categoryMultiplier;
                }
            }
        });

        return researchPerSec;
    },

    // Generate achievements UI
    generateAchievementsUI() {
        console.log('🏆 Generating achievements UI...');

        if (!this.elements.achievementsGrid) {
            console.warn('⚠️ Achievements grid element not found');
            return;
        }

        if (typeof Achievements === 'undefined') {
            console.warn('⚠️ Achievements not available, retrying...');
            setTimeout(() => this.generateAchievementsUI(), 200);
            return;
        }

        this.elements.achievementsGrid.innerHTML = '';

        Object.values(Achievements.definitions).forEach(achievement => {
            const achievementCard = this.createAchievementCard(achievement);
            this.elements.achievementsGrid.appendChild(achievementCard);
        });

        console.log('✅ Achievements UI generated');
    },

    // Create achievement card
    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = `achievement-card bg-gradient-to-br ${achievement.unlocked ? 'from-green-50 to-green-100 border-green-200' : 'from-gray-50 to-gray-100 border-gray-200'} p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg`;
        card.dataset.category = achievement.category;

        const progressWidth = achievement.progress || 0;
        const progressColor = achievement.unlocked ? 'bg-green-500' : 'bg-blue-500';

        card.innerHTML = `
            <div class="flex items-center gap-3 mb-3">
                <span class="text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}">${achievement.icon}</span>
                <div class="flex-1">
                    <h3 class="text-lg font-bold ${achievement.unlocked ? 'text-green-700' : 'text-gray-700'}">${achievement.name}</h3>
                    <p class="text-sm text-gray-600">${achievement.description}</p>
                    <div class="text-xs text-purple-600 font-medium capitalize">${achievement.category}</div>
                </div>
                ${achievement.unlocked ? '<div class="text-2xl">✅</div>' : ''}
            </div>
            
            ${!achievement.unlocked ? `
                <div class="mb-3">
                    <div class="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>${Math.round(progressWidth)}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="${progressColor} h-2 rounded-full transition-all duration-300" style="width: ${progressWidth}%"></div>
                    </div>
                </div>
            ` : ''}
            
            ${achievement.reward ? `
                <div class="text-xs text-gray-500 mt-2">
                    <strong>Reward:</strong> ${this.formatReward(achievement.reward)}
                </div>
            ` : ''}
        `;

        return card;
    },

    // Format achievement reward text
    formatReward(reward) {
        const rewards = [];
        if (reward.coins) rewards.push(`${reward.coins} coins`);
        if (reward.research) rewards.push(`${reward.research} research`);
        if (reward.happiness) rewards.push(`${reward.happiness} happiness`);
        return rewards.join(', ');
    },

    // Update achievement displays
    updateAchievementDisplays() {
        console.log('🏆 Updating achievement displays...');

        if (typeof Achievements === 'undefined') {
            console.warn('⚠️ Achievements system not loaded');
            return;
        }

        try {
            // Update achievement progress overview
            const stats = Achievements.getStatistics();
            console.log('📊 Achievement stats:', stats);

            if (this.elements.achievementProgress) {
                this.elements.achievementProgress.textContent = `${stats.unlocked}/${stats.total}`;
            }

            if (this.elements.achievementProgressBar) {
                this.elements.achievementProgressBar.style.width = `${stats.percentage}%`;
            }

            if (this.elements.achievementPercentage) {
                this.elements.achievementPercentage.textContent = `${stats.percentage}%`;
            }

            // Update individual achievement cards
            this.generateAchievementsUI();

            // Update detailed statistics
            this.updateDetailedStatistics();

            console.log('✅ Achievement displays updated');
        } catch (error) {
            console.error('❌ Error updating achievement displays:', error);
        }
    },

    // Update detailed statistics display
    updateDetailedStatistics() {
        if (typeof Statistics === 'undefined') return;

        const stats = Statistics.getComprehensiveStats();

        // Update basic statistics
        if (this.elements.statTotalClicks) {
            this.elements.statTotalClicks.textContent = this.formatNumber(stats.totalClicks);
        }

        if (this.elements.statTotalCoins) {
            this.elements.statTotalCoins.textContent = this.formatNumber(stats.totalCoinsEarned);
        }

        if (this.elements.statTotalBuildings) {
            this.elements.statTotalBuildings.textContent = this.formatNumber(stats.totalBuildings);
        }

        if (this.elements.statMaxPopulation) {
            this.elements.statMaxPopulation.textContent = this.formatNumber(stats.maxPopulation);
        }

        if (this.elements.statMaxHappiness) {
            this.elements.statMaxHappiness.textContent = Math.floor(stats.maxHappiness);
        }

        if (this.elements.statTotalResearch) {
            this.elements.statTotalResearch.textContent = this.formatNumber(stats.totalResearchEarned);
        }

        if (this.elements.statGameTime) {
            this.elements.statGameTime.textContent = this.formatTime(stats.gameTime);
        }

        if (this.elements.statCurrentSession) {
            this.elements.statCurrentSession.textContent = this.formatTime(Math.floor(stats.currentSession.duration / 1000));
        }

        // Update additional statistics
        const clicksPerSecElement = document.getElementById('statClicksPerSecond');
        if (clicksPerSecElement) {
            clicksPerSecElement.textContent = `${this.formatNumber(stats.clicksPerSecond, 2)}/sec avg`;
        }

        const coinsPerSecElement = document.getElementById('statCoinsPerSecond');
        if (coinsPerSecElement) {
            coinsPerSecElement.textContent = `${this.formatNumber(stats.coinsPerSecond, 2)}/sec avg`;
        }

        const buildingsPerHourElement = document.getElementById('statBuildingsPerHour');
        if (buildingsPerHourElement) {
            buildingsPerHourElement.textContent = `${this.formatNumber(stats.buildingsPerHour, 1)}/hour avg`;
        }

        const currentPopulationElement = document.getElementById('statCurrentPopulation');
        if (currentPopulationElement) {
            currentPopulationElement.textContent = `${this.formatNumber(GameState.resources.population)} current`;
        }

        const currentHappinessElement = document.getElementById('statCurrentHappiness');
        if (currentHappinessElement) {
            currentHappinessElement.textContent = `${Math.floor(GameState.resources.happiness)} current`;
        }

        const upgradesPurchasedElement = document.getElementById('statUpgradesPurchased');
        if (upgradesPurchasedElement) {
            upgradesPurchasedElement.textContent = `${GameState.statistics.totalUpgradesPurchased || 0} upgrades`;
        }

        const sessionsPlayedElement = document.getElementById('statSessionsPlayed');
        if (sessionsPlayedElement) {
            sessionsPlayedElement.textContent = `${stats.sessionsPlayed} sessions`;
        }

        const sessionProgressElement = document.getElementById('statSessionProgress');
        if (sessionProgressElement) {
            sessionProgressElement.textContent = `+${stats.currentSession.clicksThisSession} clicks`;
        }

        // Update building breakdown
        this.updateBuildingBreakdown(stats.buildingBreakdown);
    },

    // Update building breakdown display
    updateBuildingBreakdown(buildings) {
        if (!this.elements.buildingBreakdown) return;

        this.elements.buildingBreakdown.innerHTML = '';

        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const count = buildings[buildingType] || 0;

            if (count > 0) {
                const buildingItem = document.createElement('div');
                buildingItem.className = 'flex items-center justify-between p-2 bg-white rounded border';
                buildingItem.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="text-lg">${config.icon}</span>
                        <span class="font-medium">${config.name}</span>
                    </div>
                    <span class="font-bold text-game-primary">${count}</span>
                `;
                this.elements.buildingBreakdown.appendChild(buildingItem);
            }
        });

        if (this.elements.buildingBreakdown.children.length === 0) {
            this.elements.buildingBreakdown.innerHTML = '<div class="text-gray-500 text-center py-4">No buildings built yet</div>';
        }
    },

    // Filter achievements by category
    filterAchievements(category) {
        document.querySelectorAll('.achievement-filter').forEach(btn => {
            btn.classList.remove('active', 'bg-game-primary', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });

        document.querySelector(`[data-category="${category}"]`).classList.add('active', 'bg-game-primary', 'text-white');
        document.querySelector(`[data-category="${category}"]`).classList.remove('bg-gray-200', 'text-gray-700');

        document.querySelectorAll('.achievement-card').forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // Tab system initialization
    initializeTabs() {
        console.log('🎯 Initializing tabs...', {
            buildingsTab: !!this.elements.buildingsTab,
            upgradesTab: !!this.elements.upgradesTab,
            achievementsTab: !!this.elements.achievementsTab
        });

        if (this.elements.buildingsTab && this.elements.upgradesTab && this.elements.achievementsTab) {
            this.elements.buildingsTab.addEventListener('click', () => {
                console.log('🏗️ Buildings tab clicked');
                this.switchTab('buildings');
            });

            this.elements.upgradesTab.addEventListener('click', () => {
                console.log('⚡ Upgrades tab clicked');
                this.switchTab('upgrades');
            });

            this.elements.achievementsTab.addEventListener('click', () => {
                console.log('🏆 Achievements tab clicked');
                this.switchTab('achievements');
            });
        } else {
            console.warn('⚠️ Some tab elements not found during initialization');
        }

        // Initialize tier filters
        document.querySelectorAll('.tier-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterBuildings(e.target.dataset.tier);
            });
        });

        // Initialize upgrade filters
        document.querySelectorAll('.upgrade-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterUpgrades(e.target.dataset.category);
            });
        });

        // Initialize achievement filters
        document.querySelectorAll('.achievement-filter').forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterAchievements(e.target.dataset.category);
            });
        });
    },

    switchTab(tabName) {
        console.log(`🎯 Switching to ${tabName} tab`);

        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active', 'bg-game-primary', 'text-white');
            btn.classList.add('bg-gray-100', 'text-gray-600');
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        if (tabName === 'buildings') {
            if (this.elements.buildingsTab && this.elements.buildingsContent) {
                this.elements.buildingsTab.classList.add('active', 'bg-game-primary', 'text-white');
                this.elements.buildingsTab.classList.remove('bg-gray-100', 'text-gray-600');
                this.elements.buildingsContent.classList.remove('hidden');

                // Regenerate buildings if empty
                if (this.elements.buildingsGrid && this.elements.buildingsGrid.children.length === 0) {
                    this.generateBuildingsUI();
                }
            }
        } else if (tabName === 'upgrades') {
            if (this.elements.upgradesTab && this.elements.upgradesContent) {
                this.elements.upgradesTab.classList.add('active', 'bg-game-primary', 'text-white');
                this.elements.upgradesTab.classList.remove('bg-gray-100', 'text-gray-600');
                this.elements.upgradesContent.classList.remove('hidden');

                // Regenerate upgrades if empty
                if (this.elements.upgradesGrid && this.elements.upgradesGrid.children.length === 0) {
                    this.generateUpgradesUI();
                }
            }
        } else if (tabName === 'achievements') {
            if (this.elements.achievementsTab && this.elements.achievementsContent) {
                this.elements.achievementsTab.classList.add('active', 'bg-game-primary', 'text-white');
                this.elements.achievementsTab.classList.remove('bg-gray-100', 'text-gray-600');
                this.elements.achievementsContent.classList.remove('hidden');

                // Regenerate achievements if empty
                if (this.elements.achievementsGrid && this.elements.achievementsGrid.children.length === 0) {
                    this.generateAchievementsUI();
                }

                // Update achievements display when tab is opened
                this.updateAchievementDisplays();
            } else {
                console.warn('Achievement tab elements not found');
            }
        }

        console.log(`✅ Switched to ${tabName} tab`);
    },

    // Dynamic building UI generation
    generateBuildingsUI() {
        console.log('🏗️ Generating buildings UI...');

        if (!this.elements.buildingsGrid) {
            console.warn('⚠️ Buildings grid element not found');
            return;
        }

        if (typeof BuildingConfig === 'undefined') {
            console.warn('⚠️ BuildingConfig not available, retrying...');
            setTimeout(() => this.generateBuildingsUI(), 100);
            return;
        }

        this.elements.buildingsGrid.innerHTML = '';

        Object.keys(BuildingConfig).forEach(buildingType => {
            const config = BuildingConfig[buildingType];
            const buildingCard = this.createBuildingCard(buildingType, config);
            this.elements.buildingsGrid.appendChild(buildingCard);
        });

        console.log('✅ Buildings UI generated');
    },

    createBuildingCard(buildingType, config) {
        const card = document.createElement('div');
        card.className = `building-card bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-200 transition-all duration-300 hover:shadow-lg`;
        card.dataset.tier = config.tier;
        card.dataset.category = config.category;

        const buttonId = 'buy' + buildingType.charAt(0).toUpperCase() + buildingType.slice(1) + 'Btn';

        card.innerHTML =
            '<div class="flex items-center gap-3 mb-3">' +
            '<span class="text-2xl">' + config.icon + '</span>' +
            '<div>' +
            '<h3 class="text-lg font-bold text-game-dark">' + config.name + '</h3>' +
            '<p class="text-xs text-gray-600">' + config.description + '</p>' +
            '<div class="text-xs text-purple-600 font-medium">Tier ' + config.tier + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="space-y-2 text-sm">' +
            '<div class="flex justify-between items-center">' +
            '<span class="text-gray-700">Owned:</span>' +
            '<span id="' + buildingType + 'Owned" class="font-bold text-game-primary">0</span>' +
            '</div>' +
            '<div class="flex justify-between items-center">' +
            '<span class="text-gray-700">Production:</span>' +
            '<span class="text-gray-600">+<span id="' + buildingType + 'Production">0</span> ' + config.resourceType + '/sec</span>' +
            '</div>' +
            '<div class="flex justify-between items-center">' +
            '<span class="text-gray-700">Cost:</span>' +
            '<span id="' + buildingType + 'Cost" class="font-bold text-game-accent">0 coins</span>' +
            '</div>' +
            '<div id="' + buildingType + 'Requirements" class="text-xs text-gray-500">' +
            '<!-- Requirements will be populated dynamically -->' +
            '</div>' +
            '<button id="' + buttonId + '" class="btn-enhanced w-full bg-game-primary hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg font-semibold text-sm">' +
            'Buy ' + config.name +
            '</button>' +
            '</div>';

        return card;
    },

    // Dynamic upgrade UI generation
    generateUpgradesUI() {
        console.log('⚡ Generating upgrades UI...');

        if (!this.elements.upgradesGrid) {
            console.warn('⚠️ Upgrades grid element not found');
            return;
        }

        if (typeof UpgradeConfig === 'undefined') {
            console.warn('⚠️ UpgradeConfig not available, retrying...');
            setTimeout(() => this.generateUpgradesUI(), 100);
            return;
        }

        this.elements.upgradesGrid.innerHTML = '';

        Object.keys(UpgradeConfig).forEach(upgradeType => {
            const config = UpgradeConfig[upgradeType];
            const upgradeCard = this.createUpgradeCard(upgradeType, config);
            this.elements.upgradesGrid.appendChild(upgradeCard);
        });

        console.log('✅ Upgrades UI generated');
    },

    createUpgradeCard(upgradeType, config) {
        const card = document.createElement('div');
        card.className = `upgrade-card bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200 transition-all duration-300 hover:shadow-lg`;
        card.dataset.category = config.category;

        const buttonId = 'buy' + upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1) + 'Btn';

        card.innerHTML =
            '<div class="flex items-center gap-3 mb-3">' +
            '<span class="text-2xl">' + config.icon + '</span>' +
            '<div>' +
            '<h3 class="text-lg font-bold text-game-dark">' + config.name + '</h3>' +
            '<p class="text-xs text-gray-600">' + config.description + '</p>' +
            '</div>' +
            '</div>' +
            '<div class="space-y-2 text-sm">' +
            '<div class="flex justify-between items-center">' +
            '<span class="text-gray-700">Level:</span>' +
            '<span id="' + upgradeType + 'Level" class="font-bold text-purple-600">0 / ' + config.maxLevel + '</span>' +
            '</div>' +
            '<div class="flex justify-between items-center">' +
            '<span class="text-gray-700">Effect:</span>' +
            '<span id="' + upgradeType + 'Effect" class="text-gray-600">+0%</span>' +
            '</div>' +
            '<div class="flex justify-between items-center">' +
            '<span class="text-gray-700">Cost:</span>' +
            '<span id="' + upgradeType + 'Cost" class="font-bold text-purple-600">0 research</span>' +
            '</div>' +
            '<button id="' + buttonId + '" class="btn-enhanced w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg font-semibold text-sm">' +
            'Upgrade' +
            '</button>' +
            '</div>';

        return card;
    },

    // Filter functions
    filterBuildings(tier) {
        document.querySelectorAll('.tier-filter').forEach(btn => {
            btn.classList.remove('active', 'bg-game-primary', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });

        document.querySelector(`[data-tier="${tier}"]`).classList.add('active', 'bg-game-primary', 'text-white');
        document.querySelector(`[data-tier="${tier}"]`).classList.remove('bg-gray-200', 'text-gray-700');

        document.querySelectorAll('.building-card').forEach(card => {
            if (tier === 'all' || card.dataset.tier === tier) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    filterUpgrades(category) {
        document.querySelectorAll('.upgrade-filter').forEach(btn => {
            btn.classList.remove('active', 'bg-game-primary', 'text-white');
            btn.classList.add('bg-gray-200', 'text-gray-700');
        });

        document.querySelector(`[data-category="${category}"]`).classList.add('active', 'bg-game-primary', 'text-white');
        document.querySelector(`[data-category="${category}"]`).classList.remove('bg-gray-200', 'text-gray-700');

        document.querySelectorAll('.upgrade-card').forEach(card => {
            if (category === 'all' || card.dataset.category === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // Update dynamic displays
    updateBuildingDisplays() {
        Object.keys(BuildingConfig).forEach(buildingType => {
            const ownedElement = document.getElementById(`${buildingType}Owned`);
            const productionElement = document.getElementById(`${buildingType}Production`);
            const costElement = document.getElementById(`${buildingType}Cost`);
            const requirementsElement = document.getElementById(`${buildingType}Requirements`);

            if (ownedElement) {
                ownedElement.textContent = GameState.buildings[buildingType] || 0;
            }

            if (productionElement) {
                productionElement.textContent = this.formatNumber(Buildings.getProduction(buildingType), 1);
            }

            if (costElement) {
                costElement.textContent = this.formatNumber(Buildings.getCost(buildingType)) + ' coins';
            }

            if (requirementsElement) {
                const config = BuildingConfig[buildingType];
                const requirements = [];

                Object.entries(config.unlockCondition).forEach(([req, value]) => {
                    if (GameState.resources[req] !== undefined) {
                        requirements.push(`${value} ${req}`);
                    } else if (GameState.buildings[req] !== undefined) {
                        requirements.push(`${value} ${req}`);
                    }
                });

                requirementsElement.textContent = requirements.length > 0 ? `Requires: ${requirements.join(', ')}` : '';
            }
        });
    },

    updateUpgradeDisplays() {
        Object.keys(UpgradeConfig).forEach(upgradeType => {
            const levelElement = document.getElementById(`${upgradeType}Level`);
            const effectElement = document.getElementById(`${upgradeType}Effect`);
            const costElement = document.getElementById(`${upgradeType}Cost`);

            const currentLevel = GameState.upgrades[upgradeType] || 0;
            const config = UpgradeConfig[upgradeType];

            if (levelElement) {
                levelElement.textContent = `${currentLevel} / ${config.maxLevel}`;
            }

            if (effectElement) {
                const totalEffect = Upgrades.getEffect(upgradeType);
                effectElement.textContent = `+${(totalEffect * 100).toFixed(0)}%`;
            }

            if (costElement) {
                const cost = Upgrades.getCost(upgradeType);
                costElement.textContent = `${this.formatNumber(cost)} ${config.resourceType}`;
            }
        });
    },

    updateButtonStates() {
        // Update building buttons
        Object.keys(BuildingConfig).forEach(buildingType => {
            const buttonId = 'buy' + buildingType.charAt(0).toUpperCase() + buildingType.slice(1) + 'Btn';
            const button = document.getElementById(buttonId);

            if (button) {
                const canAfford = Buildings.canAfford(buildingType);
                const isUnlocked = Buildings.isUnlocked(buildingType);

                button.disabled = !canAfford || !isUnlocked;

                if (!isUnlocked) {
                    button.textContent = 'Locked';
                    button.classList.add('opacity-50');
                } else if (!canAfford) {
                    button.textContent = `Buy ${BuildingConfig[buildingType].name}`;
                    button.classList.add('opacity-75');
                } else {
                    button.textContent = `Buy ${BuildingConfig[buildingType].name}`;
                    button.classList.remove('opacity-50', 'opacity-75');
                }
            }
        });

        // Update upgrade buttons
        Object.keys(UpgradeConfig).forEach(upgradeType => {
            const buttonId = 'buy' + upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1) + 'Btn';
            const button = document.getElementById(buttonId);

            if (button) {
                const canAfford = Upgrades.canAfford(upgradeType);
                const isMaxLevel = Upgrades.isMaxLevel(upgradeType);

                button.disabled = !canAfford || isMaxLevel;

                if (isMaxLevel) {
                    button.textContent = 'Max Level';
                    button.classList.add('opacity-50');
                } else if (!canAfford) {
                    button.textContent = 'Upgrade';
                    button.classList.add('opacity-75');
                } else {
                    button.textContent = 'Upgrade';
                    button.classList.remove('opacity-50', 'opacity-75');
                }
            }
        });
    },

    // Initialize notification system
    initNotificationSystem() {
        if (!this.elements.notificationContainer) {
            console.warn('Notification container not found');
            return;
        }

        // Clear any existing notifications
        this.elements.notificationContainer.innerHTML = '';
        this.notifications = [];
    },

    // Initialize keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Prevent shortcuts when typing in input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return;
            }

            // Handle keyboard shortcuts
            switch (event.key.toLowerCase()) {
                case ' ':
                    event.preventDefault();
                    ManualActions.collectCoins(1);
                    this.showNotification('💰 Collected coins!', 'success', 1500);
                    break;
                case 'c':
                    ManualActions.collectCoins(1);
                    this.showNotification('💰 Collected coins!', 'success', 1500);
                    break;
                case 'p':
                    ManualActions.attractCitizens(1);
                    this.showNotification('👥 Attracted citizens!', 'success', 1500);
                    break;
                case '1':
                    if (Buildings.purchase('houses')) {
                        this.showNotification('🏠 Built a house!', 'success');
                    }
                    break;
                case '2':
                    if (Buildings.purchase('shops')) {
                        this.showNotification('🏪 Built a shop!', 'success');
                    }
                    break;
                case '3':
                    if (Buildings.purchase('parks')) {
                        this.showNotification('🌳 Built a park!', 'success');
                    }
                    break;
                case '4':
                    if (Buildings.purchase('apartments')) {
                        this.showNotification('🏢 Built apartments!', 'success');
                    }
                    break;
                case '5':
                    if (Buildings.purchase('malls')) {
                        this.showNotification('🏬 Built a mall!', 'success');
                    }
                    break;
                case 'h':
                    this.showKeyboardHelp();
                    break;
            }

            // Ctrl/Cmd shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 's':
                        event.preventDefault();
                        if (typeof Storage !== 'undefined') {
                            Storage.saveGame();
                            this.showNotification('💾 Game saved!', 'success');
                        }
                        break;
                    case 'l':
                        event.preventDefault();
                        if (typeof Storage !== 'undefined') {
                            Storage.loadGame();
                            this.showNotification('📁 Game loaded!', 'info');
                        }
                        break;
                }
            }
        });

        // Add touch gesture support for mobile
        this.initTouchGestures();
    },

    // Initialize touch gestures for mobile
    initTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // Swipe gestures (minimum 50px movement)
            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        // Swipe right - collect coins
                        ManualActions.collectCoins(1);
                        this.showNotification('💰 Swipe collected coins!', 'success', 1500);
                    } else {
                        // Swipe left - attract citizens
                        ManualActions.attractCitizens(1);
                        this.showNotification('👥 Swipe attracted citizens!', 'success', 1500);
                    }
                }
            }

            touchStartX = 0;
            touchStartY = 0;
        });
    },

    // Show keyboard shortcuts help
    showKeyboardHelp() {
        const helpText = `
🎮 Keyboard Shortcuts:
• SPACE/C - Collect coins
• P - Attract citizens  
• 1-5 - Buy buildings (Houses, Shops, Parks, Apartments, Malls)
• H - Show this help
• Ctrl+S - Save game
• Ctrl+L - Load game

📱 Mobile Gestures:
• Swipe right - Collect coins
• Swipe left - Attract citizens
        `;

        this.showNotification(helpText, 'info', 8000);
    },

    // Smooth number updates without flickering
    animateNumberChange(element, newValue) {
        if (!element) return;

        const currentValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const formattedValue = this.formatNumber(newValue);

        // Only update if the value actually changed to prevent unnecessary DOM updates
        if (currentValue !== newValue) {
            // Use requestAnimationFrame to ensure smooth updates and prevent multiple rapid changes
            if (element._updateTimeout) {
                clearTimeout(element._updateTimeout);
            }
            
            element._updateTimeout = setTimeout(() => {
                element.textContent = formattedValue;
                delete element._updateTimeout;
            }, 16); // ~60fps update rate
        }
    },

    // Update progress bars
    updateProgressBars() {
        // Happiness progress bar (0-100%)
        if (this.elements.happinessProgress) {
            const happinessPercent = Math.max(0, Math.min(100, GameState.resources.happiness));
            this.elements.happinessProgress.style.width = happinessPercent + '%';

            // Change color based on happiness level
            if (happinessPercent < 25) {
                this.elements.happinessProgress.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
            } else if (happinessPercent < 50) {
                this.elements.happinessProgress.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            } else {
                this.elements.happinessProgress.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
            }
        }

        // Population progress bar (0-capacity%)
        if (this.elements.populationProgress && this.elements.populationCapacity) {
            const capacity = GameState.upgrades.populationCap || 10000;
            const populationPercent = Math.min(100, (GameState.resources.population / capacity) * 100);
            this.elements.populationProgress.style.width = populationPercent + '%';
            this.elements.populationCapacity.textContent = `${this.formatNumber(GameState.resources.population)} / ${this.formatNumber(capacity)}`;

            // Change color based on capacity usage
            if (populationPercent > 90) {
                this.elements.populationProgress.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
            } else if (populationPercent > 75) {
                this.elements.populationProgress.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
            } else {
                this.elements.populationProgress.style.background = 'linear-gradient(90deg, #3b82f6, #10b981)';
            }
        }
    },

    // Enhanced notification system
    showNotification(message, type = 'info', duration = 3000) {
        if (!this.elements.notificationContainer) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Create notification content
        const content = document.createElement('div');
        content.className = 'notification-content';

        // Add icon based on type
        let icon = '';
        switch (type) {
            case 'success':
                icon = '✅';
                break;
            case 'error':
                icon = '❌';
                break;
            case 'warning':
                icon = '⚠️';
                break;
            case 'achievement':
                icon = '🏆';
                break;
            default:
                icon = 'ℹ️';
        }

        content.innerHTML = `
            <div class="flex items-start gap-3">
                <span class="text-lg">${icon}</span>
                <div class="flex-1">
                    <div class="font-medium text-gray-900">${message.split('\n')[0]}</div>
                    ${message.includes('\n') ? `<div class="text-sm text-gray-600 mt-1 whitespace-pre-line">${message.split('\n').slice(1).join('\n')}</div>` : ''}
                </div>
                <button class="notification-close text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>
        `;

        notification.appendChild(content);

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Add to container
        this.elements.notificationContainer.appendChild(notification);
        this.notifications.push(notification);

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Limit number of notifications
        if (this.notifications.length > 5) {
            this.removeNotification(this.notifications[0]);
        }
    },

    // Remove notification with animation
    removeNotification(notification) {
        if (!notification || !notification.parentNode) return;

        notification.classList.add('notification-exit');

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }

            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    },

    // Enhanced resource gain animation
    animateResourceGain(resourceType, amount) {
        const elementId = resourceType + 'Count';
        const element = this.elements[elementId];

        if (!element) return;

        // Add animation class
        element.classList.add('updated');

        // Create floating text animation
        this.createFloatingText(element, '+' + this.formatNumber(amount), resourceType);

        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('updated');
        }, 500);
    },

    // Enhanced floating text with better positioning
    createFloatingText(targetElement, text, resourceType) {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.className = 'floating-text';

        // Style the floating text
        floatingText.style.position = 'fixed';
        floatingText.style.pointerEvents = 'none';
        floatingText.style.fontWeight = 'bold';
        floatingText.style.fontSize = '1.2rem';
        floatingText.style.zIndex = '1000';
        floatingText.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';

        // Color based on resource type
        switch (resourceType) {
            case 'coins':
                floatingText.style.color = '#f59e0b';
                break;
            case 'population':
                floatingText.style.color = '#10b981';
                break;
            case 'happiness':
                floatingText.style.color = '#ec4899';
                break;
            case 'research':
                floatingText.style.color = '#8b5cf6';
                break;
            default:
                floatingText.style.color = '#3b82f6';
        }

        // Position relative to target element
        const rect = targetElement.getBoundingClientRect();
        floatingText.style.left = (rect.left + rect.width / 2 - 20) + 'px';
        floatingText.style.top = (rect.top - 10) + 'px';

        // Add animation
        floatingText.style.animation = 'floatUp 1.5s ease-out forwards';

        // Add to document
        document.body.appendChild(floatingText);

        // Remove after animation
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1500);
    },

    // Initialize floating text animation styles
    initFloatingTextStyles() {
        if (document.getElementById('floating-text-styles')) return; // Already added

        const style = document.createElement('style');
        style.id = 'floating-text-styles';
        style.textContent = `
            @keyframes floatUp {
                0% {
                    opacity: 1;
                    transform: translateY(0px) scale(1);
                }
                50% {
                    opacity: 1;
                    transform: translateY(-25px) scale(1.1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-60px) scale(0.8);
                }
            }
            
            .floating-text {
                position: absolute;
                pointer-events: none;
                font-weight: bold;
                font-size: 16px;
                z-index: 1000;
                animation: floatUp 2s ease-out forwards;
            }
            
            .floating-text.coins {
                color: #f59e0b;
            }
            
            .floating-text.population {
                color: #3b82f6;
            }
        `;
        document.head.appendChild(style);
    },

    // Number formatting for better readability
    formatNumber(num, decimals = 0) {
        if (num === 0) return '0';

        const absNum = Math.abs(num);

        if (absNum >= 1e12) {
            return (num / 1e12).toFixed(decimals) + 'T';
        } else if (absNum >= 1e9) {
            return (num / 1e9).toFixed(decimals) + 'B';
        } else if (absNum >= 1e6) {
            return (num / 1e6).toFixed(decimals) + 'M';
        } else if (absNum >= 1e3) {
            return (num / 1e3).toFixed(decimals) + 'K';
        } else if (decimals > 0) {
            return num.toFixed(decimals);
        } else {
            return Math.floor(num).toString();
        }
    },

    // Time formatting for game statistics
    formatTime(seconds) {
        if (seconds < 60) {
            return seconds + 's';
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return minutes + 'm ' + remainingSeconds + 's';
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return hours + 'h ' + minutes + 'm';
        }
    },

    // Animation for resource gains
    animateResourceGain(resourceType, amount) {
        const elementId = resourceType + 'Count';
        const element = this.elements[elementId];

        if (!element) return;

        // Add animation class
        element.classList.add('updated');

        // Create floating text animation
        this.createFloatingText(element, '+' + this.formatNumber(amount), resourceType);

        // Remove animation class after animation completes
        setTimeout(() => {
            element.classList.remove('updated');
        }, 500);
    },

    createFloatingText(targetElement, text, resourceType) {
        const floatingText = document.createElement('div');
        floatingText.textContent = text;
        floatingText.className = 'floating-text';

        // Style the floating text
        floatingText.style.position = 'absolute';
        floatingText.style.pointerEvents = 'none';
        floatingText.style.fontWeight = 'bold';
        floatingText.style.fontSize = '1.2rem';
        floatingText.style.zIndex = '1000';
        floatingText.style.animation = 'floatUp 1s ease-out forwards';

        // Color based on resource type
        switch (resourceType) {
            case 'coins':
                floatingText.style.color = '#f59e0b';
                break;
            case 'population':
                floatingText.style.color = '#10b981';
                break;
            case 'happiness':
                floatingText.style.color = '#ec4899';
                break;
            default:
                floatingText.style.color = '#3b82f6';
        }

        // Position relative to target element
        const rect = targetElement.getBoundingClientRect();
        floatingText.style.left = (rect.left + rect.width / 2) + 'px';
        floatingText.style.top = rect.top + 'px';

        // Add to document
        document.body.appendChild(floatingText);

        // Remove after animation
        setTimeout(() => {
            if (floatingText.parentNode) {
                floatingText.parentNode.removeChild(floatingText);
            }
        }, 1000);
    },


};

// Initialize UI when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof GameState !== 'undefined' && typeof BuildingConfig !== 'undefined') {
                UI.init();

                // Set up event listeners for manual actions
                const clickCoinsBtn = document.getElementById('clickCoinsBtn');
                const clickPopulationBtn = document.getElementById('clickPopulationBtn');

                if (clickCoinsBtn) {
                    clickCoinsBtn.addEventListener('click', () => {
                        console.log('💰 Coin button clicked');
                        if (typeof ManualActions !== 'undefined') {
                            ManualActions.collectCoins(1);
                        } else {
                            // Fallback direct implementation
                            console.warn('⚠️ ManualActions not available, using fallback');
                            if (typeof GameState !== 'undefined') {
                                GameState.resources.coins += 1;
                                GameState.statistics.totalClicks += 1;
                                GameState.statistics.totalCoinsEarned += 1;
                                UI.updateResourceDisplays();
                                UI.showNotification('💰 Collected 1 coin!', 'success', 1500);
                            }
                        }
                    });
                    console.log('✅ Coin button event listener added');
                } else {
                    console.warn('⚠️ Coin button not found');
                }

                if (clickPopulationBtn) {
                    clickPopulationBtn.addEventListener('click', () => {
                        console.log('👥 Population button clicked');
                        if (typeof ManualActions !== 'undefined') {
                            ManualActions.attractCitizens(1);
                        } else {
                            // Fallback direct implementation
                            console.warn('⚠️ ManualActions not available, using fallback');
                            if (typeof GameState !== 'undefined') {
                                GameState.resources.population += 1;
                                GameState.statistics.totalClicks += 1;
                                UI.updateResourceDisplays();
                                UI.showNotification('👥 Attracted 1 citizen!', 'success', 1500);
                            }
                        }
                    });
                    console.log('✅ Population button event listener added');
                } else {
                    console.warn('⚠️ Population button not found');
                }

                // Set up building purchase buttons
                Object.keys(BuildingConfig).forEach(buildingType => {
                    const buttonId = 'buy' + buildingType.charAt(0).toUpperCase() + buildingType.slice(1) + 'Btn';
                    setTimeout(() => {
                        const button = document.getElementById(buttonId);
                        if (button) {
                            button.addEventListener('click', () => {
                                Buildings.purchase(buildingType);
                            });
                        }
                    }, 100);
                });

                // Set up upgrade purchase buttons
                Object.keys(UpgradeConfig).forEach(upgradeType => {
                    const buttonId = 'buy' + upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1) + 'Btn';
                    setTimeout(() => {
                        const button = document.getElementById(buttonId);
                        if (button) {
                            button.addEventListener('click', () => {
                                Upgrades.purchase(upgradeType);
                            });
                        }
                    }, 100);
                });

                // Set up save/load/reset buttons
                const saveBtn = document.getElementById('saveBtn');
                const loadBtn = document.getElementById('loadBtn');
                const resetBtn = document.getElementById('resetBtn');

                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        if (typeof Storage !== 'undefined') {
                            Storage.saveGame();
                        }
                    });
                }

                if (loadBtn) {
                    loadBtn.addEventListener('click', () => {
                        if (typeof Storage !== 'undefined') {
                            Storage.loadGame();
                        }
                    });
                }

                if (resetBtn) {
                    resetBtn.addEventListener('click', () => {
                        if (confirm('Are you sure you want to reset your game? This will delete all progress!')) {
                            // Reset game state
                            GameState.resources = {
                                coins: 0,
                                population: 0,
                                happiness: 100,
                                energy: 100,
                                research: 0
                            };

                            Object.keys(GameState.buildings).forEach(building => {
                                GameState.buildings[building] = 0;
                            });

                            GameState.upgrades = {
                                efficiency: 1,
                                automation: false,
                                research: 0,
                                prestige: 0,
                                residentialEfficiency: 0,
                                commercialEfficiency: 0,
                                industrialEfficiency: 0,
                                leisureEfficiency: 0,
                                researchEfficiency: 0,
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

                            // Clear save data
                            if (typeof Storage !== 'undefined') {
                                Storage.clearSave();
                            }

                            // Reset achievements
                            if (typeof Achievements !== 'undefined') {
                                Achievements.unlockedAchievements.clear();
                                Object.values(Achievements.definitions).forEach(achievement => {
                                    achievement.unlocked = false;
                                    achievement.progress = 0;
                                });
                            }

                            // Reset statistics
                            if (typeof Statistics !== 'undefined') {
                                Statistics.reset();
                            }

                            // Update UI
                            UI.updateAll();
                            UI.showNotification('🔄 Game reset successfully!', 'info', 3000);
                        }
                    });
                }

            } else {
                console.warn('⚠️ Game systems not ready, delaying UI init');
                setTimeout(() => {
                    if (typeof GameState !== 'undefined' && typeof BuildingConfig !== 'undefined') {
                        UI.init();
                    } else {
                        console.warn('⚠️ Still waiting for game systems...');
                        setTimeout(() => UI.init(), 1000);
                    }
                }, 500);
            }
        }, 100);
    });
} else {
    setTimeout(() => {
        if (typeof GameState !== 'undefined' && typeof BuildingConfig !== 'undefined') {
            UI.init();
        } else {
            console.warn('⚠️ Game systems not ready, delaying UI init');
            setTimeout(() => {
                if (typeof GameState !== 'undefined' && typeof BuildingConfig !== 'undefined') {
                    UI.init();
                } else {
                    console.warn('⚠️ Still waiting for game systems...');
                    setTimeout(() => UI.init(), 1000);
                }
            }, 500);
        }
    }, 100);
}
// Debug f
// Debug function for testing
window.debugGame = function () {
    console.log('🔍 Game Debug Info:');
    console.log('GameState available:', typeof GameState !== 'undefined');
    console.log('BuildingConfig available:', typeof BuildingConfig !== 'undefined');
    console.log('ManualActions available:', typeof ManualActions !== 'undefined');
    console.log('UI initialized:', UI.elements && Object.keys(UI.elements).length > 0);

    if (typeof GameState !== 'undefined') {
        console.log('Current resources:', GameState.resources);
        console.log('Current buildings:', GameState.buildings);
    }

    // Test manual coin collection
    if (typeof ManualActions !== 'undefined') {
        console.log('Testing manual coin collection...');
        ManualActions.collectCoins(10);
    }

    // Check if buildings grid has content
    const buildingsGrid = document.getElementById('buildingsGrid');
    if (buildingsGrid) {
        console.log('Buildings grid children:', buildingsGrid.children.length);
    }

    // Force regenerate UI
    console.log('Forcing UI regeneration...');
    if (UI.generateBuildingsUI) UI.generateBuildingsUI();
    if (UI.generateUpgradesUI) UI.generateUpgradesUI();
    if (UI.generateAchievementsUI) UI.generateAchievementsUI();
};

console.log('🎮 Debug function available: window.debugGame()');