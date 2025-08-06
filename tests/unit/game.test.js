// Unit tests for game logic

// Import game modules (in a real setup, these would be ES modules)
require('../../js/game.js');

describe('GameState', () => {
  test('should initialize with correct default values', () => {
    expect(GameState.resources.coins).toBe(0);
    expect(GameState.resources.population).toBe(0);
    expect(GameState.resources.happiness).toBe(100);
    expect(GameState.buildings.houses).toBe(0);
    expect(GameState.upgrades.efficiency).toBe(1);
  });

  test('should maintain resource constraints', () => {
    GameState.resources.happiness = 150;
    expect(GameState.resources.happiness).toBeLessThanOrEqual(100);
    
    GameState.resources.coins = -10;
    expect(GameState.resources.coins).toBeGreaterThanOrEqual(0);
  });
});

describe('Buildings', () => {
  beforeEach(() => {
    testHelpers.setupGameState({
      resources: { coins: 1000, population: 100 }
    });
  });

  test('should calculate building costs correctly', () => {
    const houseCost = Buildings.getCost('houses');
    expect(houseCost).toBe(BuildingConfig.houses.baseCost);
    
    // Test cost scaling
    GameState.buildings.houses = 1;
    const secondHouseCost = Buildings.getCost('houses');
    expect(secondHouseCost).toBeGreaterThan(houseCost);
  });

  test('should purchase buildings when affordable', () => {
    const initialCoins = GameState.resources.coins;
    const houseCost = Buildings.getCost('houses');
    
    const success = Buildings.purchase('houses');
    
    expect(success).toBe(true);
    expect(GameState.buildings.houses).toBe(1);
    expect(GameState.resources.coins).toBe(initialCoins - houseCost);
    expect(GameState.statistics.buildingsPurchased).toBe(1);
  });

  test('should not purchase buildings when unaffordable', () => {
    GameState.resources.coins = 5; // Not enough for any building
    
    const success = Buildings.purchase('houses');
    
    expect(success).toBe(false);
    expect(GameState.buildings.houses).toBe(0);
    expect(GameState.resources.coins).toBe(5);
  });

  test('should check unlock conditions correctly', () => {
    // Houses should be unlocked by default
    expect(Buildings.isUnlocked('houses')).toBe(true);
    
    // Shops require 10 population
    GameState.resources.population = 5;
    expect(Buildings.isUnlocked('shops')).toBe(false);
    
    GameState.resources.population = 15;
    expect(Buildings.isUnlocked('shops')).toBe(true);
  });

  test('should calculate production correctly', () => {
    GameState.buildings.houses = 5;
    const production = Buildings.getProduction('houses');
    
    const expectedProduction = 5 * BuildingConfig.houses.baseProduction * GameState.upgrades.efficiency;
    expect(production).toBe(expectedProduction);
  });

  test('should handle invalid building types', () => {
    const cost = Buildings.getCost('invalidBuilding');
    expect(cost).toBeUndefined();
    
    const success = Buildings.purchase('invalidBuilding');
    expect(success).toBe(false);
  });
});

describe('Upgrades', () => {
  beforeEach(() => {
    testHelpers.setupGameState({
      resources: { research: 1000 }
    });
  });

  test('should calculate upgrade costs correctly', () => {
    const cost = Upgrades.getCost('residentialEfficiency');
    expect(cost).toBe(UpgradeConfig.residentialEfficiency.baseCost);
    
    // Test cost scaling
    GameState.upgrades.residentialEfficiency = 1;
    const secondCost = Upgrades.getCost('residentialEfficiency');
    expect(secondCost).toBeGreaterThan(cost);
  });

  test('should purchase upgrades when affordable', () => {
    const initialResearch = GameState.resources.research;
    const upgradeCost = Upgrades.getCost('residentialEfficiency');
    
    const success = Upgrades.purchase('residentialEfficiency');
    
    expect(success).toBe(true);
    expect(GameState.upgrades.residentialEfficiency).toBe(1);
    expect(GameState.resources.research).toBe(initialResearch - upgradeCost);
  });

  test('should not purchase upgrades when unaffordable', () => {
    GameState.resources.research = 10; // Not enough
    
    const success = Upgrades.purchase('residentialEfficiency');
    
    expect(success).toBe(false);
    expect(GameState.upgrades.residentialEfficiency).toBe(0);
  });

  test('should respect max level limits', () => {
    const maxLevel = UpgradeConfig.residentialEfficiency.maxLevel;
    GameState.upgrades.residentialEfficiency = maxLevel;
    
    const success = Upgrades.purchase('residentialEfficiency');
    
    expect(success).toBe(false);
    expect(GameState.upgrades.residentialEfficiency).toBe(maxLevel);
  });

  test('should calculate effects correctly', () => {
    GameState.upgrades.residentialEfficiency = 3;
    const effect = Upgrades.getEffect('residentialEfficiency');
    
    const expectedEffect = 3 * UpgradeConfig.residentialEfficiency.effect;
    expect(effect).toBe(expectedEffect);
  });
});

describe('ManualActions', () => {
  test('should collect coins correctly', () => {
    const initialCoins = GameState.resources.coins;
    const initialClicks = GameState.statistics.totalClicks;
    
    ManualActions.collectCoins(5);
    
    expect(GameState.resources.coins).toBe(initialCoins + 5);
    expect(GameState.statistics.totalClicks).toBe(initialClicks + 1);
    expect(GameState.statistics.totalCoinsEarned).toBe(5);
  });

  test('should attract population correctly', () => {
    const initialPopulation = GameState.resources.population;
    
    ManualActions.attractPopulation(3);
    
    expect(GameState.resources.population).toBe(initialPopulation + 3);
  });

  test('should respect population cap', () => {
    GameState.resources.population = GameState.upgrades.populationCap - 1;
    
    ManualActions.attractPopulation(5);
    
    expect(GameState.resources.population).toBe(GameState.upgrades.populationCap);
  });
});

describe('GameLoop', () => {
  test('should start and stop correctly', () => {
    expect(GameLoop.intervalId).toBeNull();
    
    GameLoop.start();
    expect(GameLoop.intervalId).not.toBeNull();
    
    GameLoop.stop();
    expect(GameLoop.intervalId).toBeNull();
  });

  test('should generate resources from buildings', () => {
    GameState.buildings.houses = 2;
    GameState.buildings.shops = 1;
    const initialCoins = GameState.resources.coins;
    const initialPopulation = GameState.resources.population;
    
    // Mock the tick method to test resource generation
    GameLoop.generateResources();
    
    // Population should increase from houses
    expect(GameState.resources.population).toBeGreaterThan(initialPopulation);
    
    // Coins should increase from shops (if population > 0)
    if (GameState.resources.population > 0) {
      expect(GameState.resources.coins).toBeGreaterThan(initialCoins);
    }
  });

  test('should apply category multipliers correctly', () => {
    GameState.upgrades.residentialEfficiency = 2;
    
    const multiplier = GameLoop.getCategoryMultiplier('residential');
    const expectedMultiplier = 1 + (2 * UpgradeConfig.residentialEfficiency.effect);
    
    expect(multiplier).toBe(expectedMultiplier);
  });

  test('should handle happiness decay', () => {
    GameState.resources.population = 100;
    GameState.resources.happiness = 80;
    
    const initialHappiness = GameState.resources.happiness;
    GameLoop.generateResources();
    
    // Happiness should decay with population
    expect(GameState.resources.happiness).toBeLessThan(initialHappiness);
    expect(GameState.resources.happiness).toBeGreaterThanOrEqual(0);
  });
});