// IdleCity UI Management
// Handles all user interface updates and animations

const UI = {
    // DOM element references (cached for performance)
    elements: {},
    
    init() {
        console.log('🎨 Initializing UI system...');
        
        // Cache DOM elements for better performance
        this.cacheElements();
        
        // Initial UI update
        this.updateAll();
        
        console.log('✅ UI system initialized');
    },
    
    cacheElements() {
        // Resource displays
        this.elements.coinsCount = document.getElementById('coinsCount');
        this.elements.populationCount = document.getElementById('populationCount');
        this.elements.happinessCount = document.getElementById('happinessCount');
        this.elements.coinsPerSecond = document.getElementById('coinsPerSecond');
        this.elements.populationPerSecond = document.getElementById('populationPerSecond');
        this.elements.happinessPerSecond = document.getElementById('happinessPerSecond');
        
        // Building displays
        this.elements.housesOwned = document.getElementById('housesOwned');
        this.elements.shopsOwned = document.getElementById('shopsOwned');
        this.elements.factoriesOwned = document.getElementById('factoriesOwned');
        this.elements.parksOwned = document.getElementById('parksOwned');
        
        this.elements.housesProduction = document.getElementById('housesProduction');
        this.elements.shopsProduction = document.getElementById('shopsProduction');
        this.elements.factoriesProduction = document.getElementById('factoriesProduction');
        this.elements.parksEffect = document.getElementById('parksEffect');
        
        this.elements.housesCost = document.getElementById('housesCost');
        this.elements.shopsCost = document.getElementById('shopsCost');
        this.elements.factoriesCost = document.getElementById('factoriesCost');
        this.elements.parksCost = document.getElementById('parksCost');
        
        // Building buttons
        this.elements.buyHouseBtn = document.getElementById('buyHouseBtn');
        this.elements.buyShopBtn = document.getElementById('buyShopBtn');
        this.elements.buyFactoryBtn = document.getElementById('buyFactoryBtn');
        this.elements.buyParkBtn = document.getElementById('buyParkBtn');
        
        // Statistics
        this.elements.totalClicks = document.getElementById('totalClicks');
        this.elements.totalBuildings = document.getElementById('totalBuildings');
        this.elements.gameTime = document.getElementById('gameTime');
        this.elements.totalCoinsEarned = document.getElementById('totalCoinsEarned');
    },
    
    updateAll() {
        this.updateResourceDisplays();
        this.updateBuildingDisplays();
        this.updateStatistics();
        this.updateButtonStates();
    },
    
    updateResourceDisplays() {
        // Update resource counters with formatting
        if (this.elements.coinsCount) {
            this.elements.coinsCount.textContent = this.formatNumber(GameState.resources.coins);
        }
        
        if (this.elements.populationCount) {
            this.elements.populationCount.textContent = this.formatNumber(GameState.resources.population);
        }
        
        if (this.elements.happinessCount) {
            this.elements.happinessCount.textContent = Math.floor(GameState.resources.happiness);
        }
        
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
        
        // Coins from shops (requires population)
        if (GameState.buildings.shops > 0 && GameState.resources.population >= 1) {
            coinsPerSec += Buildings.getProduction('shops');
        }
        
        // Coins from factories (requires population)
        if (GameState.buildings.factories > 0 && GameState.resources.population >= 10) {
            coinsPerSec += Buildings.getProduction('factories');
        }
        
        return coinsPerSec;
    },
    
    calculatePopulationPerSecond() {
        return Buildings.getProduction('houses');
    },
    
    calculateHappinessPerSecond() {
        let happinessPerSec = 0;
        
        // Happiness from parks
        if (GameState.buildings.parks > 0) {
            happinessPerSec += Buildings.getProduction('parks');
        }
        
        // Happiness decay from population
        if (GameState.resources.population > 0) {
            happinessPerSec -= GameState.resources.population * 0.1;
        }
        
        return happinessPerSec;
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
    
    // Show notifications to the user
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm`;
        
        // Style based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-500', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-500', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-500', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-500', 'text-white');
        }
        
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    }
};

// Add CSS for floating text animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            opacity: 1;
            transform: translateY(0px);
        }
        100% {
            opacity: 0;
            transform: translateY(-50px);
        }
    }
    
    .notification {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);