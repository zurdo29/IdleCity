// Jest setup file for IdleCity tests

// Mock localStorage for testing
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((index) => Object.keys(store)[index] || null)
  };
})();
global.localStorage = localStorageMock;

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Reset game state before each test
beforeEach(() => {
  // Reset GameState to initial values
  if (typeof GameState !== 'undefined') {
    GameState.resources = {
      coins: 0,
      population: 0,
      happiness: 100,
      energy: 100,
      research: 0
    };
    
    GameState.buildings = {
      houses: 0,
      shops: 0,
      parks: 0,
      apartments: 0,
      malls: 0,
      gardens: 0,
      factories: 0,
      labs: 0,
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
  }
  
  // Clear localStorage mock
  if (localStorage.getItem.mockClear) {
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    localStorage.clear.mockClear();
  }
  
  // Clear console mocks
  console.log.mockClear();
  console.warn.mockClear();
  console.error.mockClear();
});

// Helper functions for tests
global.testHelpers = {
  // Set up game state for testing
  setupGameState: (overrides = {}) => {
    Object.assign(GameState, overrides);
  },
  
  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock DOM elements
  mockElement: (id, properties = {}) => {
    const element = {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(),
        toggle: jest.fn(),
      },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      ...properties
    };
    
    // Mock getElementById to return our mock element
    if (!global.document) {
      global.document = {};
    }
    if (!global.document.getElementById) {
      global.document.getElementById = jest.fn();
    }
    global.document.getElementById.mockImplementation((elementId) => {
      return elementId === id ? element : null;
    });
    
    return element;
  }
};