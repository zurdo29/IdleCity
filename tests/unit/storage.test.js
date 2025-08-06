// Unit tests for storage system

require('../../js/storage.js');

describe('Storage', () => {
  beforeEach(() => {
    // Reset localStorage mock
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    localStorage.clear.mockClear();
  });

  test('should detect localStorage availability', () => {
    expect(Storage.isLocalStorageAvailable()).toBe(true);
    
    // Test when localStorage throws error
    localStorage.setItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });
    
    expect(Storage.isLocalStorageAvailable()).toBe(false);
  });

  test('should save game state correctly', () => {
    testHelpers.setupGameState({
      resources: { coins: 100, population: 50 },
      buildings: { houses: 3, shops: 1 }
    });

    const success = Storage.saveGame();
    
    expect(success).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      Storage.SAVE_KEY,
      expect.stringContaining('"coins":100')
    );
  });

  test('should handle save errors gracefully', () => {
    localStorage.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });

    const success = Storage.saveGame();
    
    expect(success).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to save game'),
      expect.any(Error)
    );
  });

  test('should load game state correctly', () => {
    const mockSaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      gameState: {
        resources: { coins: 200, population: 75, happiness: 90 },
        buildings: { houses: 5, shops: 2, parks: 1 },
        upgrades: { efficiency: 1.5, residentialEfficiency: 1 },
        statistics: { totalClicks: 50, gameTime: 300 }
      }
    };

    localStorage.getItem.mockReturnValue(JSON.stringify(mockSaveData));

    const success = Storage.loadGame();
    
    expect(success).toBe(true);
    expect(GameState.resources.coins).toBe(200);
    expect(GameState.buildings.houses).toBe(5);
    expect(GameState.upgrades.residentialEfficiency).toBe(1);
  });

  test('should handle missing save data', () => {
    localStorage.getItem.mockReturnValue(null);

    const success = Storage.loadGame();
    
    expect(success).toBe(false);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('No saved game found')
    );
  });

  test('should validate save data structure', () => {
    // Valid save data
    const validSave = {
      version: '1.0.0',
      timestamp: Date.now(),
      gameState: {
        resources: { coins: 100, population: 50, happiness: 80 },
        buildings: { houses: 2, shops: 1, factories: 0, parks: 0 },
        statistics: { totalClicks: 10 }
      }
    };
    
    expect(Storage.validateSaveData(validSave)).toBe(true);

    // Invalid save data
    const invalidSave = {
      version: '1.0.0',
      // Missing timestamp and gameState
    };
    
    expect(Storage.validateSaveData(invalidSave)).toBe(false);
  });

  test('should calculate offline progress correctly', () => {
    testHelpers.setupGameState({
      buildings: { houses: 2, shops: 1 },
      upgrades: { efficiency: 1 }
    });

    const initialCoins = GameState.resources.coins;
    const initialPopulation = GameState.resources.population;
    
    Storage.calculateOfflineProgress(60); // 1 minute offline
    
    expect(GameState.resources.coins).toBeGreaterThan(initialCoins);
    expect(GameState.resources.population).toBeGreaterThan(initialPopulation);
  });

  test('should format offline time correctly', () => {
    expect(Storage.formatOfflineTime(30)).toBe('30 seconds');
    expect(Storage.formatOfflineTime(90)).toBe('1 minute');
    expect(Storage.formatOfflineTime(150)).toBe('2 minutes');
    expect(Storage.formatOfflineTime(3660)).toBe('1 hour 1 minute');
    expect(Storage.formatOfflineTime(7200)).toBe('2 hours 0 minutes');
  });

  test('should clear save data', () => {
    const success = Storage.clearSave();
    
    expect(success).toBe(true);
    expect(localStorage.removeItem).toHaveBeenCalledWith(Storage.SAVE_KEY);
  });

  test('should export save data', () => {
    const mockSaveData = '{"version":"1.0.0","gameState":{}}';
    localStorage.getItem.mockReturnValue(mockSaveData);
    
    // Mock DOM elements for download
    const mockAnchor = {
      href: '',
      download: '',
      click: jest.fn()
    };
    global.document = {
      createElement: jest.fn(() => mockAnchor),
      body: {
        appendChild: jest.fn(),
        removeChild: jest.fn()
      }
    };
    global.URL = {
      createObjectURL: jest.fn(() => 'blob:url'),
      revokeObjectURL: jest.fn()
    };
    global.Blob = jest.fn();

    const result = Storage.exportSave();
    
    expect(result).toBe(mockSaveData);
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  test('should import save data', () => {
    const validSaveString = JSON.stringify({
      version: '1.0.0',
      timestamp: Date.now(),
      gameState: {
        resources: { coins: 300, population: 100, happiness: 85 },
        buildings: { houses: 6, shops: 3, factories: 1, parks: 2 },
        statistics: { totalClicks: 75 }
      }
    });

    const success = Storage.importSave(validSaveString);
    
    expect(success).toBe(true);
    expect(GameState.resources.coins).toBe(300);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      Storage.SAVE_KEY,
      validSaveString
    );
  });

  test('should reject invalid import data', () => {
    const invalidSaveString = '{"invalid": "data"}';

    const success = Storage.importSave(invalidSaveString);
    
    expect(success).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed to import save'),
      expect.any(Error)
    );
  });
});