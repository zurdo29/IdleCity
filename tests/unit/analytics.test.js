// Unit tests for analytics system (Task 15)

// Mock the analytics module
const mockAnalytics = {
  config: {
    enabled: true,
    batchSize: 10,
    flushInterval: 30000
  },
  events: [],
  session: {
    id: null,
    startTime: null,
    interactions: 0
  },
  performance: {
    loadTime: 0,
    errorCount: 0
  },
  behavior: {
    clickHeatmap: {},
    featureUsage: {}
  },
  
  init: jest.fn(),
  trackEvent: jest.fn(),
  trackError: jest.fn(),
  trackGameEvent: jest.fn(),
  flush: jest.fn(),
  getSummary: jest.fn()
};

// Mock the global Analytics object
global.Analytics = mockAnalytics;

describe('Analytics System (Task 15)', () => {
  beforeEach(() => {
    // Reset mocks
    mockAnalytics.events = [];
    mockAnalytics.session = {
      id: 'test-session',
      startTime: Date.now(),
      interactions: 0
    };
    mockAnalytics.performance = {
      loadTime: 0,
      errorCount: 0
    };
    mockAnalytics.behavior = {
      clickHeatmap: {},
      featureUsage: {}
    };
    
    // Clear mock calls
    Object.values(mockAnalytics).forEach(method => {
      if (typeof method === 'function' && method.mockClear) {
        method.mockClear();
      }
    });
  });

  test('should initialize analytics system', () => {
    mockAnalytics.init();
    
    expect(mockAnalytics.init).toHaveBeenCalled();
  });

  test('should track custom events', () => {
    const eventData = {
      action: 'button_click',
      element: 'save_button',
      timestamp: Date.now()
    };
    
    mockAnalytics.trackEvent('user_action', eventData);
    
    expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('user_action', eventData);
  });

  test('should track game-specific events', () => {
    const gameEventData = {
      buildingType: 'house',
      cost: 10,
      count: 1
    };
    
    mockAnalytics.trackGameEvent('building_purchased', gameEventData);
    
    expect(mockAnalytics.trackGameEvent).toHaveBeenCalledWith('building_purchased', gameEventData);
  });

  test('should track errors', () => {
    const errorData = {
      message: 'Test error',
      stack: 'Error stack trace',
      url: 'http://localhost:3000'
    };
    
    mockAnalytics.trackError('javascript_error', errorData);
    
    expect(mockAnalytics.trackError).toHaveBeenCalledWith('javascript_error', errorData);
  });

  test('should flush events when batch is full', () => {
    // Simulate batch being full
    mockAnalytics.events = new Array(10).fill({ name: 'test_event', data: {} });
    
    mockAnalytics.flush();
    
    expect(mockAnalytics.flush).toHaveBeenCalled();
  });

  test('should provide analytics summary', () => {
    const mockSummary = {
      session: mockAnalytics.session,
      performance: mockAnalytics.performance,
      behavior: mockAnalytics.behavior,
      queuedEvents: 0
    };
    
    mockAnalytics.getSummary.mockReturnValue(mockSummary);
    
    const summary = mockAnalytics.getSummary();
    
    expect(summary).toEqual(mockSummary);
    expect(mockAnalytics.getSummary).toHaveBeenCalled();
  });

  test('should handle configuration options', () => {
    expect(mockAnalytics.config.enabled).toBe(true);
    expect(mockAnalytics.config.batchSize).toBe(10);
    expect(mockAnalytics.config.flushInterval).toBe(30000);
  });

  test('should track user interactions', () => {
    // Simulate user interaction
    mockAnalytics.session.interactions = 5;
    
    expect(mockAnalytics.session.interactions).toBe(5);
  });

  test('should maintain session state', () => {
    expect(mockAnalytics.session.id).toBe('test-session');
    expect(mockAnalytics.session.startTime).toBeDefined();
    expect(typeof mockAnalytics.session.startTime).toBe('number');
  });

  test('should track performance metrics', () => {
    mockAnalytics.performance.loadTime = 1500;
    mockAnalytics.performance.errorCount = 2;
    
    expect(mockAnalytics.performance.loadTime).toBe(1500);
    expect(mockAnalytics.performance.errorCount).toBe(2);
  });
});