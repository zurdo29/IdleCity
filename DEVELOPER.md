# IdleCity - Developer Documentation

This document provides comprehensive information for developers working on IdleCity, including architecture, code organization, and maintenance guidelines.

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [File Structure](#file-structure)
- [Core Systems](#core-systems)
- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Performance](#performance)
- [Deployment](#deployment)
- [Maintenance](#maintenance)
- [Contributing](#contributing)

## Project Overview

IdleCity is a browser-based idle/incremental game built with vanilla HTML5, CSS3, and JavaScript. The game features:

- **Pure Web Technologies**: No frameworks or build tools required
- **Client-Side Only**: All logic runs in the browser
- **Local Storage**: Progress saved in browser storage
- **GitHub Pages**: Deployed via automated CI/CD
- **Responsive Design**: Works on desktop and mobile devices

### Key Features
- Resource management (coins, population, happiness, research)
- Building system with 3 tiers and 5 categories
- Upgrade system with efficiency improvements
- Achievement system with rewards
- Statistics tracking and analytics
- Performance monitoring and optimization
- Offline progress calculation
- Auto-save functionality

## Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Game Logic    │    │   Persistence   │
│                 │    │                 │    │                 │
│ • HTML Structure│    │ • Game State    │    │ • localStorage  │
│ • CSS Styling   │◄──►│ • Game Loop     │◄──►│ • Save/Load     │
│ • UI Management │    │ • Buildings     │    │ • Data Validation│
│                 │    │ • Upgrades      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Performance   │    │   Achievements  │    │   Statistics    │
│                 │    │                 │    │                 │
│ • Monitoring    │    │ • Tracking      │    │ • Data Collection│
│ • Optimization  │    │ • Rewards       │    │ • Analytics     │
│ • Error Handling│    │ • Progress      │    │ • Reporting     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Interaction
- **Game Loop**: Central timer that drives all game mechanics
- **UI System**: Handles all visual updates and user interactions
- **Storage System**: Manages save/load operations and data persistence
- **Performance System**: Monitors and optimizes game performance
- **Achievement System**: Tracks player progress and awards
- **Statistics System**: Collects and analyzes gameplay data

## File Structure

```
idlecity/
├── index.html              # Main game page
├── css/
│   └── styles.css          # Game styling and animations
├── js/
│   ├── game.js             # Core game logic and state management
│   ├── ui.js               # User interface management
│   ├── storage.js          # Save/load functionality
│   ├── achievements.js     # Achievement system
│   ├── statistics.js       # Statistics tracking
│   ├── performance.js      # Performance monitoring
│   └── testing.js          # Testing utilities
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions deployment
├── scripts/
│   ├── deploy-monitor.js   # Deployment monitoring
│   ├── deployment-status.sh # Status checking
│   └── optimize-assets.js  # Asset optimization
├── docs/
│   ├── USER_GUIDE.md       # Player documentation
│   ├── DEVELOPER.md        # This file
│   ├── BUILD.md            # Build instructions
│   └── DEPLOYMENT.md       # Deployment guide
└── README.md               # Project overview
```

## Core Systems

### 1. Game State Management (`js/game.js`)

#### GameState Object
```javascript
const GameState = {
    resources: {
        coins: 0,
        population: 0,
        happiness: 100,
        energy: 100,
        research: 0
    },
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
    upgrades: {
        efficiency: 1,
        automation: false,
        // ... other upgrades
    },
    statistics: {
        totalClicks: 0,
        gameTime: 0,
        buildingsPurchased: 0,
        totalCoinsEarned: 0,
        gameStartTime: Date.now()
    }
};
```

#### Game Loop
- **Tick Rate**: 100ms (10 FPS) for smooth updates
- **Resource Generation**: Calculated per tick with delta time
- **UI Updates**: Batched for performance
- **Auto-Save**: Every 10 seconds during gameplay

### 2. Building System

#### Building Configuration
```javascript
const BuildingConfig = {
    buildingType: {
        name: "Display Name",
        description: "Building description",
        tier: 1, // 1, 2, or 3
        baseCost: 10,
        costMultiplier: 1.15,
        baseProduction: 1,
        resourceType: "coins", // coins, population, happiness, research
        unlockCondition: { coins: 0 },
        icon: "🏠",
        category: "residential", // residential, commercial, industrial, leisure, research
        upgradeBuilding: "nextTierBuilding" // null for tier 3
    }
};
```

#### Building Categories
- **Residential**: Generate population
- **Commercial**: Generate coins (requires population)
- **Industrial**: Generate coins (requires minimum population)
- **Leisure**: Generate happiness
- **Research**: Generate research points (requires happiness)

### 3. User Interface (`js/ui.js`)

#### UI Architecture
- **Element Caching**: DOM elements cached for performance
- **Batched Updates**: DOM updates batched using Performance system
- **Dynamic Generation**: Buildings, upgrades, and achievements generated dynamically
- **Responsive Design**: Mobile-first approach with Tailwind CSS

#### Key UI Methods
```javascript
UI.updateResourceDisplays()    // Update resource counters
UI.updateBuildingDisplays()    // Update building information
UI.updateStatistics()          // Update statistics display
UI.showNotification()          // Display notifications
UI.animateResourceGain()       // Animate resource changes
```

### 4. Performance System (`js/performance.js`)

#### Performance Monitoring
- **Frame Rate Tracking**: Monitors FPS and frame times
- **Memory Management**: Automatic cleanup and garbage collection
- **Error Handling**: Comprehensive error catching and recovery
- **Adaptive Performance**: Automatically adjusts based on device capabilities

#### Performance Features
- **DOM Update Batching**: Reduces layout thrashing
- **Memory Cleanup**: Periodic cleanup of unused objects
- **Performance Indicators**: Visual feedback for performance issues
- **Degraded Mode**: Reduces features when performance drops

### 5. Storage System (`js/storage.js`)

#### Save Data Structure
```javascript
const SaveData = {
    version: "1.0.0",
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

#### Storage Features
- **Auto-Save**: Every 10 seconds during active gameplay
- **Data Validation**: Comprehensive validation on load
- **Offline Progress**: Calculates progress while away
- **Export/Import**: Backup and restore functionality
- **Error Recovery**: Graceful handling of corrupted data

## Development Setup

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Text editor or IDE
- Local web server (optional but recommended)
- Git for version control

### Local Development
1. **Clone Repository**:
   ```bash
   git clone https://github.com/username/idlecity.git
   cd idlecity
   ```

2. **Serve Locally** (optional):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:8000` or open `index.html` directly

### Development Tools
- **Browser DevTools**: Essential for debugging
- **Console Commands**: Various debug commands available
- **Performance Monitor**: Built-in performance tracking
- **Testing Utilities**: Automated testing functions

### Debug Commands
```javascript
// Performance information
Performance.getReport()

// Game state inspection
console.log(GameState)

// Force save/load
Storage.saveGame()
Storage.loadGame()

// Run tests
Testing.runAllTests()

// Achievement debugging
Achievements.checkAchievements()
```

## Code Standards

### JavaScript Style Guide
- **ES6+ Features**: Use modern JavaScript features
- **Const/Let**: Prefer `const`, use `let` when reassignment needed
- **Arrow Functions**: Use for short functions and callbacks
- **Template Literals**: Use for string interpolation
- **Destructuring**: Use for object/array extraction

### Naming Conventions
- **Variables**: camelCase (`gameState`, `buildingCount`)
- **Constants**: UPPER_SNAKE_CASE (`SAVE_KEY`, `MAX_BUILDINGS`)
- **Functions**: camelCase (`updateUI`, `calculateCost`)
- **Classes/Objects**: PascalCase (`GameLoop`, `BuildingConfig`)

### Code Organization
- **Modular Structure**: Each system in separate file
- **Clear Separation**: Distinct responsibilities for each module
- **Consistent Patterns**: Similar patterns across modules
- **Documentation**: JSDoc comments for complex functions

### Error Handling
```javascript
try {
    // Risky operation
    performOperation();
} catch (error) {
    console.error('Operation failed:', error);
    
    // Report to performance system
    if (typeof Performance !== 'undefined') {
        Performance.handleError('operationName', error);
    }
    
    // Attempt recovery
    recoverFromError();
}
```

## Testing

### Testing Strategy
- **Manual Testing**: Comprehensive browser testing
- **Automated Tests**: Built-in testing utilities
- **Performance Testing**: Continuous performance monitoring
- **Compatibility Testing**: Multiple browser/device testing

### Test Categories
1. **Unit Tests**: Individual function testing
2. **Integration Tests**: System interaction testing
3. **Performance Tests**: Frame rate and memory testing
4. **Compatibility Tests**: Browser/device compatibility
5. **User Experience Tests**: Gameplay flow testing

### Running Tests
```javascript
// Run all tests
Testing.runAllTests()

// Run specific test category
Testing.runGameLogicTests()
Testing.runUITests()
Testing.runStorageTests()

// Performance tests
Performance.generatePerformanceReport()
```

### Test Implementation
```javascript
// Example test function
function testBuildingPurchase() {
    const initialCoins = GameState.resources.coins;
    const initialBuildings = GameState.buildings.houses;
    
    // Ensure we have enough coins
    GameState.resources.coins = 100;
    
    // Purchase building
    const success = Buildings.purchase('houses');
    
    // Verify results
    console.assert(success, 'Building purchase should succeed');
    console.assert(GameState.buildings.houses === initialBuildings + 1, 'Building count should increase');
    console.assert(GameState.resources.coins < 100, 'Coins should decrease');
    
    console.log('✅ Building purchase test passed');
}
```

## Performance

### Performance Optimization Strategies
1. **DOM Batching**: Batch DOM updates to reduce reflows
2. **Event Delegation**: Use event delegation for dynamic content
3. **Memory Management**: Regular cleanup of unused objects
4. **Efficient Loops**: Optimize frequently called functions
5. **Lazy Loading**: Load content only when needed

### Performance Monitoring
- **Frame Rate**: Target 60 FPS, minimum 30 FPS
- **Memory Usage**: Monitor heap size and cleanup
- **DOM Updates**: Track and optimize update frequency
- **Error Rate**: Monitor and reduce error occurrences

### Performance Best Practices
```javascript
// Good: Batch DOM updates
Performance.batchDOMUpdate(element, 'textContent', value);

// Good: Cache DOM elements
const element = document.getElementById('myElement');

// Good: Use requestAnimationFrame for animations
requestAnimationFrame(updateAnimation);

// Good: Debounce frequent operations
const debouncedSave = debounce(Storage.saveGame, 1000);
```

## Deployment

### GitHub Actions Workflow
The project uses GitHub Actions for automated deployment:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

### Deployment Process
1. **Code Push**: Push changes to main branch
2. **Automated Build**: GitHub Actions triggers deployment
3. **Asset Optimization**: Scripts optimize assets
4. **Health Check**: Verify deployment success
5. **Live Update**: Game available at GitHub Pages URL

### Manual Deployment
```bash
# Build and optimize assets
npm run build

# Deploy to GitHub Pages
npm run deploy

# Check deployment status
npm run status
```

## Maintenance

### Regular Maintenance Tasks
1. **Performance Monitoring**: Review performance reports
2. **Error Analysis**: Check error logs and fix issues
3. **Browser Testing**: Test on new browser versions
4. **Security Updates**: Update dependencies if any
5. **Content Updates**: Add new buildings, achievements, etc.

### Monitoring and Analytics
- **Performance Reports**: Generated every minute during gameplay
- **Error Tracking**: Comprehensive error logging and recovery
- **User Statistics**: Anonymous gameplay statistics
- **Browser Compatibility**: Track supported browser versions

### Troubleshooting Common Issues

#### Performance Problems
```javascript
// Check performance metrics
const report = Performance.getReport();
console.log('Performance Score:', report.metrics.performanceScore);
console.log('Frame Rate:', report.metrics.frameRate);

// Force memory cleanup
Performance.performMemoryCleanup();

// Check for memory leaks
console.log('Memory Usage:', performance.memory?.usedJSHeapSize);
```

#### Save/Load Issues
```javascript
// Validate save data
const isValid = Storage.validateSaveData(saveData);

// Clear corrupted save
Storage.clearSave();

// Export save for backup
Storage.exportSave();
```

#### UI Problems
```javascript
// Refresh UI
UI.updateAll();

// Re-cache elements
UI.cacheElements();

// Check for missing elements
console.log('Missing elements:', UI.findMissingElements());
```

## Contributing

### Development Workflow
1. **Fork Repository**: Create your own fork
2. **Create Branch**: Create feature branch from main
3. **Make Changes**: Implement your changes
4. **Test Thoroughly**: Run all tests and manual testing
5. **Submit PR**: Create pull request with description

### Code Review Process
- **Functionality**: Does the code work as intended?
- **Performance**: Does it maintain good performance?
- **Style**: Does it follow code standards?
- **Testing**: Are there adequate tests?
- **Documentation**: Is it properly documented?

### Adding New Features

#### New Building Type
1. Add to `BuildingConfig` in `game.js`
2. Update UI generation in `ui.js`
3. Add unlock conditions and requirements
4. Update achievements if relevant
5. Test thoroughly across all systems

#### New Resource Type
1. Add to `GameState.resources`
2. Update UI displays
3. Update save/load system
4. Add generation mechanics
5. Update all relevant systems

#### New Achievement
1. Add to `Achievements.definitions`
2. Implement condition function
3. Add appropriate rewards
4. Update UI generation
5. Test unlock conditions

### Best Practices for Contributors
- **Small Changes**: Keep changes focused and small
- **Test Everything**: Test your changes thoroughly
- **Document Changes**: Update documentation as needed
- **Performance Impact**: Consider performance implications
- **Backward Compatibility**: Maintain save game compatibility

---

## Conclusion

IdleCity is designed to be maintainable, performant, and extensible. The modular architecture allows for easy addition of new features while maintaining code quality and performance.

For questions or support, please refer to the issue tracker or contact the development team.

Happy coding! 🚀