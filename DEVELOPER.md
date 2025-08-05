# 🛠️ IdleCity - Developer Documentation

## 📋 Project Overview

IdleCity is a browser-based idle/incremental game built with vanilla HTML5, CSS3, and JavaScript. The game features automatic resource generation, building purchases, upgrades, achievements, and persistent progress storage with automated deployment to GitHub Pages.

## 🏗️ Architecture Overview

### Core Components
- **Game Engine** (`js/game.js`): Core game logic, state management, and game loop
- **UI System** (`js/ui.js`): User interface management and animations
- **Storage System** (`js/storage.js`): Save/load functionality with localStorage
- **Achievement System** (`js/achievements.js`): Achievement tracking and rewards
- **Statistics System** (`js/statistics.js`): Comprehensive data tracking and analysis
- **Testing Framework** (`js/testing.js`): Basic testing and debugging utilities

### File Structure
```
IdleCity/
├── index.html                 # Main game file
├── css/
│   └── styles.css            # Custom styles and animations
├── js/
│   ├── game.js               # Core game engine
│   ├── ui.js                 # UI management
│   ├── storage.js            # Save/load system
│   ├── achievements.js       # Achievement system
│   ├── statistics.js         # Statistics tracking
│   └── testing.js            # Testing utilities
├── scripts/
│   ├── deploy-monitor.js     # Deployment monitoring
│   ├── optimize-assets.js    # Asset optimization
│   └── deployment-status.sh  # Deployment management
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions deployment
├── USER_GUIDE.md             # User documentation
├── DEPLOYMENT.md             # Deployment guide
├── DEVELOPER.md              # This file
└── BUILD.md                  # Build instructions
```

## 🎮 Game Systems

### Game State Management

#### Core Game State (`GameState` object)
```javascript
const GameState = {
    resources: {
        coins: 0,           // Primary currency
        population: 0,      // Citizens in the city
        happiness: 100,     // City satisfaction (0-100)
        energy: 100,        // Energy level (unused currently)
        research: 0         // Research points for upgrades
    },
    buildings: {
        // Tier 1
        houses: 0, shops: 0, parks: 0,
        // Tier 2
        apartments: 0, malls: 0, gardens: 0, factories: 0, labs: 0,
        // Tier 3
        skyscrapers: 0, towers: 0, powerplants: 0, universities: 0, resorts: 0
    },
    upgrades: {
        efficiency: 1,                    // Base efficiency multiplier
        // Building efficiency upgrades (0-max level)
        residentialEfficiency: 0,
        commercialEfficiency: 0,
        industrialEfficiency: 0,
        leisureEfficiency: 0,
        researchEfficiency: 0,
        // Special upgrades
        happinessBonus: 0,               // Flat happiness bonus
        populationCap: 10000,            // Population limit
        autoClickerLevel: 0              // Auto-clicker level
    },
    statistics: {
        totalClicks: 0,
        gameTime: 0,
        buildingsPurchased: 0,
        totalCoinsEarned: 0,
        totalResearchEarned: 0,
        maxPopulation: 0,
        maxHappiness: 100,
        totalUpgradesPurchased: 0,
        sessionsPlayed: 0,
        gameStartTime: Date.now()
    },
    achievements: {
        unlocked: [],                    // Array of unlocked achievement IDs
        totalUnlocked: 0                 // Count of unlocked achievements
    }
};
```

### Game Loop System

#### Main Game Loop (`GameLoop` object)
- **Tick Rate**: 100ms (10 ticks per second)
- **Resource Generation**: Calculated per tick with delta time
- **UI Updates**: Optimized with different update frequencies
- **Auto-Save**: Every 10 seconds
- **Achievement Checking**: Every second

```javascript
const GameLoop = {
    intervalId: null,
    tickRate: 100,
    uiUpdateCounter: 0,
    
    tick() {
        // Update game time
        // Generate resources from buildings
        // Check achievements (every 10 ticks)
        // Update UI (different frequencies for performance)
        // Auto-save (every 100 ticks)
    }
};
```

### Building System

#### Building Configuration (`BuildingConfig` object)
Each building type has:
- **Basic Properties**: name, description, icon, tier, category
- **Economic Properties**: baseCost, costMultiplier, baseProduction, resourceType
- **Unlock Conditions**: Requirements to purchase
- **Upgrade Path**: Next tier building (if applicable)

```javascript
const BuildingConfig = {
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
    }
    // ... more buildings
};
```

#### Building Categories and Multipliers
- **Residential**: Houses, Apartments, Skyscrapers
- **Commercial**: Shops, Malls, Towers
- **Industrial**: Factories, Power Plants
- **Leisure**: Parks, Gardens, Resorts
- **Research**: Labs, Universities

Each category has efficiency upgrades that multiply production.

### Upgrade System

#### Upgrade Configuration (`UpgradeConfig` object)
```javascript
const UpgradeConfig = {
    residentialEfficiency: {
        name: "Residential Efficiency",
        description: "Increase population generation by 25%",
        baseCost: 100,
        costMultiplier: 2.0,
        maxLevel: 10,
        effect: 0.25,                    // 25% per level
        resourceType: "research",
        category: "efficiency",
        icon: "🏠⚡"
    }
    // ... more upgrades
};
```

### Achievement System

#### Achievement Structure
```javascript
const Achievements = {
    definitions: {
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
        }
        // ... more achievements
    }
};
```

## 🔧 Development Guidelines

### Code Style and Standards

#### JavaScript Conventions
- **ES6+ Features**: Use modern JavaScript features
- **Const/Let**: Prefer const, use let when reassignment needed
- **Arrow Functions**: Use for callbacks and short functions
- **Template Literals**: Use for string interpolation
- **Destructuring**: Use for object/array extraction

#### Naming Conventions
- **Variables**: camelCase (`gameState`, `buildingType`)
- **Constants**: UPPER_SNAKE_CASE (`SAVE_KEY`, `TICK_RATE`)
- **Functions**: camelCase (`updateUI`, `calculateProduction`)
- **Classes/Objects**: PascalCase (`GameLoop`, `Buildings`)

#### Error Handling
```javascript
// Always include error handling for critical operations
try {
    const saveData = JSON.parse(localStorage.getItem(SAVE_KEY));
    // Process save data
} catch (error) {
    console.error('Failed to load save data:', error);
    // Fallback behavior
}
```

### Performance Considerations

#### Game Loop Optimization
- **Efficient DOM Updates**: Batch DOM changes, use document fragments
- **Selective Updates**: Update different UI elements at different frequencies
- **Memory Management**: Clean up event listeners, avoid memory leaks
- **Calculation Caching**: Cache expensive calculations when possible

#### UI Performance
```javascript
// Good: Batch DOM updates
const fragment = document.createDocumentFragment();
buildings.forEach(building => {
    const element = createBuildingElement(building);
    fragment.appendChild(element);
});
container.appendChild(fragment);

// Bad: Individual DOM updates in loop
buildings.forEach(building => {
    const element = createBuildingElement(building);
    container.appendChild(element); // Triggers reflow each time
});
```

### Testing and Debugging

#### Built-in Debug Commands
```javascript
// Available in browser console
GameDebug.addCoins(amount);              // Add coins
GameDebug.addPopulation(amount);         // Add population
GameDebug.addBuilding(type, amount);     // Add buildings
GameDebug.showState();                   // Show game state
GameDebug.testProduction();              // Test production rates
GameDebug.testAchievements();            // Test achievement system
```

#### Testing Framework (`js/testing.js`)
- **Basic Assertions**: console.assert for simple tests
- **Function Testing**: Test core game functions
- **Error Logging**: Track and report errors
- **Performance Testing**: Basic performance monitoring

### Save System Architecture

#### Save Data Structure
```javascript
const saveData = {
    version: '1.0.0',
    timestamp: Date.now(),
    gameState: {
        resources: { ...GameState.resources },
        buildings: { ...GameState.buildings },
        upgrades: { ...GameState.upgrades },
        statistics: { ...GameState.statistics },
        achievements: { ...GameState.achievements }
    }
};
```

#### Offline Progress Calculation
- **Time Tracking**: Calculate offline time from save timestamp
- **Resource Generation**: Simulate resource generation for offline period
- **Limits**: Maximum 24 hours of offline progress
- **Validation**: Ensure offline progress is reasonable and valid

## 🚀 Deployment and Build Process

### GitHub Actions Workflow
1. **Asset Verification**: Check all required files exist and are valid
2. **Optimization**: Minify JavaScript, CSS, and HTML
3. **Deployment**: Deploy to GitHub Pages with retry logic
4. **Health Checks**: Verify deployment with comprehensive testing
5. **Monitoring**: Track performance and report results

### Asset Optimization
- **JavaScript**: Terser for minification and compression
- **CSS**: clean-css for stylesheet optimization
- **HTML**: html-minifier-terser with game-safe options
- **Size Reduction**: Typically 25-45% total size reduction

### Deployment Tools
- **`scripts/optimize-assets.js`**: Standalone asset optimizer
- **`scripts/deploy-monitor.js`**: Health checking and monitoring
- **`scripts/deployment-status.sh`**: Deployment management script

## 🔄 Adding New Features

### Adding New Buildings

1. **Update BuildingConfig**:
```javascript
newBuilding: {
    name: "New Building",
    description: "Description of the building",
    tier: 2,
    baseCost: 1000,
    costMultiplier: 1.25,
    baseProduction: 10,
    resourceType: "coins",
    unlockCondition: { population: 100 },
    icon: "🏢",
    category: "commercial",
    upgradeBuilding: null
}
```

2. **Update GameState.buildings**:
```javascript
buildings: {
    // ... existing buildings
    newBuilding: 0
}
```

3. **Update UI**: The UI system automatically generates building cards from BuildingConfig

### Adding New Resources

1. **Update GameState.resources**:
```javascript
resources: {
    // ... existing resources
    newResource: 0
}
```

2. **Update UI**: Add display elements and update methods
3. **Update Save/Load**: Ensure new resource is saved and loaded
4. **Update Generation**: Add resource generation logic to game loop

### Adding New Achievements

1. **Update Achievements.definitions**:
```javascript
newAchievement: {
    id: 'newAchievement',
    name: 'Achievement Name',
    description: 'Achievement description',
    icon: '🏆',
    category: 'special',
    condition: () => /* condition logic */,
    reward: { coins: 100 },
    unlocked: false,
    progress: 0
}
```

2. **Achievement automatically appears in UI and is tracked**

### Adding New Upgrades

1. **Update UpgradeConfig**:
```javascript
newUpgrade: {
    name: "New Upgrade",
    description: "Upgrade description",
    baseCost: 100,
    costMultiplier: 2.0,
    maxLevel: 5,
    effect: 0.20,
    resourceType: "research",
    category: "efficiency",
    icon: "⚡"
}
```

2. **Update GameState.upgrades**:
```javascript
upgrades: {
    // ... existing upgrades
    newUpgrade: 0
}
```

3. **Apply upgrade effects in relevant calculations**

## 🐛 Common Issues and Solutions

### Performance Issues
- **Symptom**: Game becomes slow or unresponsive
- **Causes**: Too many DOM updates, memory leaks, inefficient calculations
- **Solutions**: Optimize game loop, batch DOM updates, profile with browser tools

### Save/Load Issues
- **Symptom**: Game doesn't save or load properly
- **Causes**: localStorage disabled, data corruption, version mismatches
- **Solutions**: Add error handling, validate save data, provide fallbacks

### UI Synchronization Issues
- **Symptom**: UI doesn't match game state
- **Causes**: Missing UI updates, timing issues, event handling problems
- **Solutions**: Ensure UI updates after state changes, add debugging

### Achievement/Statistics Issues
- **Symptom**: Achievements don't unlock or statistics are wrong
- **Causes**: Condition logic errors, timing issues, save/load problems
- **Solutions**: Test conditions thoroughly, ensure proper initialization

## 📚 API Reference

### Core Objects

#### `GameState`
Global game state object containing all game data.

#### `GameLoop`
Manages the main game loop and resource generation.
- `start()`: Start the game loop
- `stop()`: Stop the game loop
- `tick()`: Single game loop iteration

#### `Buildings`
Building system management.
- `purchase(buildingType)`: Purchase a building
- `getCost(buildingType)`: Get current cost of building
- `getProduction(buildingType)`: Get production rate
- `isUnlocked(buildingType)`: Check if building is unlocked
- `canAfford(buildingType)`: Check if player can afford building

#### `Upgrades`
Upgrade system management.
- `purchase(upgradeType)`: Purchase an upgrade
- `getCost(upgradeType)`: Get current cost of upgrade
- `getEffect(upgradeType)`: Get current effect value
- `canAfford(upgradeType)`: Check if player can afford upgrade
- `isMaxLevel(upgradeType)`: Check if upgrade is at max level

#### `Storage`
Save/load system.
- `saveGame()`: Save current game state
- `loadGame()`: Load saved game state
- `clearSave()`: Clear saved data
- `autoSave()`: Automatic save (called by game loop)

#### `UI`
User interface management.
- `updateAll()`: Update all UI elements
- `updateResourceDisplays()`: Update resource counters
- `updateBuildingDisplays()`: Update building information
- `showNotification(message, type, duration)`: Show notification

#### `Achievements`
Achievement system.
- `checkAchievements()`: Check for newly unlocked achievements
- `unlockAchievement(id)`: Unlock specific achievement
- `getStatistics()`: Get achievement statistics

#### `Statistics`
Statistics tracking.
- `getCurrentSessionStats()`: Get current session data
- `getComprehensiveStats()`: Get all statistics
- `recordDataPoint()`: Record historical data point

## 🔮 Future Development

### Planned Features
- **Advanced Testing**: Jest unit tests, Playwright browser tests
- **PWA Features**: Service worker, offline functionality, app manifest
- **Enhanced Analytics**: Detailed performance monitoring
- **Multiplayer Elements**: Leaderboards, city sharing
- **Advanced Graphics**: Canvas-based animations, particle effects

### Extension Points
- **Plugin System**: Modular feature additions
- **Theme System**: Customizable visual themes
- **Language Support**: Internationalization framework
- **Advanced AI**: Smart building suggestions, optimization hints

### Performance Improvements
- **Web Workers**: Offload calculations to background threads
- **Virtual DOM**: More efficient UI updates
- **Lazy Loading**: Load features on demand
- **Caching**: Advanced caching strategies

---

## 🤝 Contributing

### Development Setup
1. Clone the repository
2. Open `index.html` in a modern browser
3. Use browser developer tools for debugging
4. Test changes across different browsers

### Code Review Guidelines
- **Functionality**: Ensure new features work correctly
- **Performance**: Check for performance impacts
- **Compatibility**: Test across different browsers
- **Documentation**: Update documentation for new features

### Testing Checklist
- [ ] Game loads without errors
- [ ] All building types work correctly
- [ ] Save/load functionality works
- [ ] Achievements unlock properly
- [ ] UI is responsive and accessible
- [ ] Performance is acceptable

Happy coding! 🚀