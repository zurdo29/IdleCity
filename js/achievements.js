// IdleCity Achievement System
// Comprehensive achievement tracking with rewards and progression

const Achievements = {
    // Achievement definitions
    definitions: {
        // Click-based achievements
        firstClick: {
            id: 'firstClick',
            name: 'First Steps',
            description: 'Make your first click',
            icon: '👆',
            category: 'clicking',
            condition: () => GameState.statistics.totalClicks >= 1,
            reward: { coins: 10 },
            unlocked: false,
            progress: 0
        },
        clickMaster: {
            id: 'clickMaster',
            name: 'Click Master',
            description: 'Make 100 clicks',
            icon: '🖱️',
            category: 'clicking',
            condition: () => GameState.statistics.totalClicks >= 100,
            reward: { coins: 100 },
            unlocked: false,
            progress: 0
        },
        clickLegend: {
            id: 'clickLegend',
            name: 'Click Legend',
            description: 'Make 1,000 clicks',
            icon: '⚡',
            category: 'clicking',
            condition: () => GameState.statistics.totalClicks >= 1000,
            reward: { coins: 1000, happiness: 10 },
            unlocked: false,
            progress: 0
        },

        // Building achievements
        firstHouse: {
            id: 'firstHouse',
            name: 'Home Builder',
            description: 'Build your first house',
            icon: '🏠',
            category: 'building',
            condition: () => GameState.buildings.houses >= 1,
            reward: { coins: 50 },
            unlocked: false,
            progress: 0
        },
        cityPlanner: {
            id: 'cityPlanner',
            name: 'City Planner',
            description: 'Build 10 total buildings',
            icon: '🏗️',
            category: 'building',
            condition: () => Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0) >= 10,
            reward: { coins: 500, research: 5 },
            unlocked: false,
            progress: 0
        },
        metropolis: {
            id: 'metropolis',
            name: 'Metropolis',
            description: 'Build 100 total buildings',
            icon: '🏙️',
            category: 'building',
            condition: () => Object.values(GameState.buildings).reduce((sum, count) => sum + count, 0) >= 100,
            reward: { coins: 5000, research: 25, happiness: 20 },
            unlocked: false,
            progress: 0
        },

        // Population achievements
        firstCitizen: {
            id: 'firstCitizen',
            name: 'First Citizen',
            description: 'Reach 10 population',
            icon: '👥',
            category: 'population',
            condition: () => GameState.resources.population >= 10,
            reward: { coins: 25 },
            unlocked: false,
            progress: 0
        },
        smallTown: {
            id: 'smallTown',
            name: 'Small Town',
            description: 'Reach 100 population',
            icon: '🏘️',
            category: 'population',
            condition: () => GameState.resources.population >= 100,
            reward: { coins: 250, happiness: 5 },
            unlocked: false,
            progress: 0
        },
        bigCity: {
            id: 'bigCity',
            name: 'Big City',
            description: 'Reach 1,000 population',
            icon: '🌆',
            category: 'population',
            condition: () => GameState.resources.population >= 1000,
            reward: { coins: 2500, research: 10, happiness: 15 },
            unlocked: false,
            progress: 0
        },

        // Wealth achievements
        firstCoins: {
            id: 'firstCoins',
            name: 'Penny Pincher',
            description: 'Earn 100 total coins',
            icon: '🪙',
            category: 'wealth',
            condition: () => GameState.statistics.totalCoinsEarned >= 100,
            reward: { happiness: 5 },
            unlocked: false,
            progress: 0
        },
        wealthy: {
            id: 'wealthy',
            name: 'Wealthy',
            description: 'Earn 10,000 total coins',
            icon: '💰',
            category: 'wealth',
            condition: () => GameState.statistics.totalCoinsEarned >= 10000,
            reward: { research: 15, happiness: 10 },
            unlocked: false,
            progress: 0
        },
        millionaire: {
            id: 'millionaire',
            name: 'Millionaire',
            description: 'Earn 1,000,000 total coins',
            icon: '💎',
            category: 'wealth',
            condition: () => GameState.statistics.totalCoinsEarned >= 1000000,
            reward: { research: 100, happiness: 50 },
            unlocked: false,
            progress: 0
        },

        // Happiness achievements
        happyCity: {
            id: 'happyCity',
            name: 'Happy City',
            description: 'Maintain 100% happiness with 50+ population',
            icon: '😊',
            category: 'happiness',
            condition: () => GameState.resources.happiness >= 100 && GameState.resources.population >= 50,
            reward: { coins: 1000, research: 10 },
            unlocked: false,
            progress: 0
        },
        utopia: {
            id: 'utopia',
            name: 'Utopia',
            description: 'Maintain 100% happiness with 500+ population',
            icon: '🌈',
            category: 'happiness',
            condition: () => GameState.resources.happiness >= 100 && GameState.resources.population >= 500,
            reward: { coins: 10000, research: 50, happiness: 25 },
            unlocked: false,
            progress: 0
        },

        // Time-based achievements
        dedicated: {
            id: 'dedicated',
            name: 'Dedicated Player',
            description: 'Play for 30 minutes',
            icon: '⏰',
            category: 'time',
            condition: () => GameState.statistics.gameTime >= 1800, // 30 minutes
            reward: { coins: 500, research: 5 },
            unlocked: false,
            progress: 0
        },
        marathoner: {
            id: 'marathoner',
            name: 'Marathon Player',
            description: 'Play for 2 hours',
            icon: '🏃',
            category: 'time',
            condition: () => GameState.statistics.gameTime >= 7200, // 2 hours
            reward: { coins: 2000, research: 20, happiness: 15 },
            unlocked: false,
            progress: 0
        },

        // Research achievements
        researcher: {
            id: 'researcher',
            name: 'Researcher',
            description: 'Accumulate 100 research points',
            icon: '🔬',
            category: 'research',
            condition: () => GameState.statistics.totalResearchEarned >= 100,
            reward: { coins: 1000, happiness: 10 },
            unlocked: false,
            progress: 0
        },
        scientist: {
            id: 'scientist',
            name: 'Scientist',
            description: 'Accumulate 1,000 research points',
            icon: '🧪',
            category: 'research',
            condition: () => GameState.statistics.totalResearchEarned >= 1000,
            reward: { coins: 10000, happiness: 25 },
            unlocked: false,
            progress: 0
        },

        // Special achievements
        efficiency: {
            id: 'efficiency',
            name: 'Efficiency Expert',
            description: 'Purchase 5 different upgrades',
            icon: '⚙️',
            category: 'special',
            condition: () => {
                const upgradeCount = Object.values(GameState.upgrades).filter(level => 
                    typeof level === 'number' && level > 0
                ).length;
                return upgradeCount >= 5;
            },
            reward: { coins: 2500, research: 15, happiness: 10 },
            unlocked: false,
            progress: 0
        },
        diversified: {
            id: 'diversified',
            name: 'Diversified Economy',
            description: 'Own at least 1 of each building type',
            icon: '🏢',
            category: 'special',
            condition: () => {
                const buildingTypes = Object.keys(BuildingConfig);
                return buildingTypes.every(type => GameState.buildings[type] >= 1);
            },
            reward: { coins: 5000, research: 25, happiness: 20 },
            unlocked: false,
            progress: 0
        }
    },

    // Achievement state
    unlockedAchievements: new Set(),
    
    // Initialize achievement system
    init() {
        console.log('🏆 Initializing achievement system...');
        
        // Load unlocked achievements from save data
        if (GameState.achievements) {
            this.unlockedAchievements = new Set(GameState.achievements.unlocked || []);
            
            // Update achievement states
            Object.keys(this.definitions).forEach(id => {
                this.definitions[id].unlocked = this.unlockedAchievements.has(id);
            });
        } else {
            // Initialize achievement data in game state
            GameState.achievements = {
                unlocked: [],
                totalUnlocked: 0
            };
        }
        
        console.log('✅ Achievement system initialized');
    },

    // Check all achievements
    checkAchievements() {
        let newAchievements = [];
        
        Object.values(this.definitions).forEach(achievement => {
            if (!achievement.unlocked && achievement.condition()) {
                this.unlockAchievement(achievement.id);
                newAchievements.push(achievement);
            } else if (!achievement.unlocked) {
                // Update progress for display
                this.updateProgress(achievement);
            }
        });
        
        return newAchievements;
    },

    // Unlock a specific achievement
    unlockAchievement(achievementId) {
        const achievement = this.definitions[achievementId];
        if (!achievement || achievement.unlocked) return false;
        
        // Mark as unlocked
        achievement.unlocked = true;
        this.unlockedAchievements.add(achievementId);
        
        // Update game state
        GameState.achievements.unlocked = Array.from(this.unlockedAchievements);
        GameState.achievements.totalUnlocked = this.unlockedAchievements.size;
        
        // Apply rewards
        this.applyRewards(achievement.reward);
        
        // Show notification
        if (typeof UI !== 'undefined') {
            UI.showNotification(
                `🏆 Achievement Unlocked!\n${achievement.name}\n${achievement.description}`,
                'achievement',
                5000
            );
        }
        
        console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        return true;
    },

    // Apply achievement rewards
    applyRewards(rewards) {
        if (!rewards) return;
        
        let rewardText = [];
        
        if (rewards.coins) {
            GameState.resources.coins += rewards.coins;
            GameState.statistics.totalCoinsEarned += rewards.coins;
            rewardText.push(`+${rewards.coins} coins`);
        }
        
        if (rewards.research) {
            GameState.resources.research += rewards.research;
            if (!GameState.statistics.totalResearchEarned) {
                GameState.statistics.totalResearchEarned = 0;
            }
            GameState.statistics.totalResearchEarned += rewards.research;
            rewardText.push(`+${rewards.research} research`);
        }
        
        if (rewards.happiness) {
            GameState.resources.happiness = Math.min(100, GameState.resources.happiness + rewards.happiness);
            rewardText.push(`+${rewards.happiness} happiness`);
        }
        
        if (rewardText.length > 0 && typeof UI !== 'undefined') {
            UI.showNotification(`🎁 Rewards: ${rewardText.join(', ')}`, 'success', 3000);
        }
    },

    // Update progress for achievements
    updateProgress(achievement) {
        // This is a simplified progress calculation
        // In a more complex system, you'd have specific progress calculations per achievement
        if (achievement.condition.toString().includes('totalClicks')) {
            const target = parseInt(achievement.condition.toString().match(/\d+/)[0]);
            achievement.progress = Math.min(100, (GameState.statistics.totalClicks / target) * 100);
        } else if (achievement.condition.toString().includes('population')) {
            const target = parseInt(achievement.condition.toString().match(/\d+/)[0]);
            achievement.progress = Math.min(100, (GameState.resources.population / target) * 100);
        } else if (achievement.condition.toString().includes('totalCoinsEarned')) {
            const target = parseInt(achievement.condition.toString().match(/\d+/)[0]);
            achievement.progress = Math.min(100, (GameState.statistics.totalCoinsEarned / target) * 100);
        }
        // Add more progress calculations as needed
    },

    // Get achievements by category
    getAchievementsByCategory(category) {
        return Object.values(this.definitions).filter(achievement => 
            achievement.category === category
        );
    },

    // Get unlocked achievements
    getUnlockedAchievements() {
        return Object.values(this.definitions).filter(achievement => 
            achievement.unlocked
        );
    },

    // Get locked achievements
    getLockedAchievements() {
        return Object.values(this.definitions).filter(achievement => 
            !achievement.unlocked
        );
    },

    // Get achievement statistics
    getStatistics() {
        const total = Object.keys(this.definitions).length;
        const unlocked = this.unlockedAchievements.size;
        const categories = {};
        
        Object.values(this.definitions).forEach(achievement => {
            if (!categories[achievement.category]) {
                categories[achievement.category] = { total: 0, unlocked: 0 };
            }
            categories[achievement.category].total++;
            if (achievement.unlocked) {
                categories[achievement.category].unlocked++;
            }
        });
        
        return {
            total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100),
            categories
        };
    }
};

// Initialize achievements when the script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (typeof GameState !== 'undefined') {
                Achievements.init();
            } else {
                console.warn('⚠️ GameState not ready, delaying achievements init');
                setTimeout(() => Achievements.init(), 500);
            }
        }, 200);
    });
} else {
    setTimeout(() => {
        if (typeof GameState !== 'undefined') {
            Achievements.init();
        } else {
            console.warn('⚠️ GameState not ready, delaying achievements init');
            setTimeout(() => Achievements.init(), 500);
        }
    }, 200);
}