// Performance tests for IdleCity

const { test, expect } = require('@playwright/test');

test.describe('Performance Tests @performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForSelector('#coinsCount');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should maintain good FPS during gameplay', async ({ page }) => {
    // Start the game loop
    await page.evaluate(() => {
      GameLoop.start();
    });
    
    // Set up a scenario with many buildings for stress testing
    await page.evaluate(() => {
      GameState.buildings.houses = 50;
      GameState.buildings.shops = 25;
      GameState.buildings.factories = 10;
      GameState.resources.population = 1000;
    });
    
    // Monitor performance for 5 seconds
    const performanceMetrics = await page.evaluate(async () => {
      const metrics = [];
      const startTime = performance.now();
      
      return new Promise((resolve) => {
        let frameCount = 0;
        const measureFrame = () => {
          frameCount++;
          const currentTime = performance.now();
          
          if (currentTime - startTime >= 5000) {
            const fps = frameCount / 5;
            resolve({ fps, frameCount });
          } else {
            requestAnimationFrame(measureFrame);
          }
        };
        
        requestAnimationFrame(measureFrame);
      });
    });
    
    // Should maintain at least 30 FPS
    expect(performanceMetrics.fps).toBeGreaterThan(30);
  });

  test('should handle rapid clicking without performance degradation', async ({ page }) => {
    const clickCoinsBtn = page.locator('#clickCoinsBtn');
    const startTime = Date.now();
    
    // Perform 100 rapid clicks
    for (let i = 0; i < 100; i++) {
      await clickCoinsBtn.click({ delay: 10 });
    }
    
    const clickTime = Date.now() - startTime;
    
    // Should complete 100 clicks within 5 seconds
    expect(clickTime).toBeLessThan(5000);
    
    // Verify final coin count
    const finalCoins = await page.locator('#coinsCount').textContent();
    expect(parseInt(finalCoins)).toBe(100);
  });

  test('should handle large numbers without UI lag', async ({ page }) => {
    // Set very large resource values
    await page.evaluate(() => {
      GameState.resources.coins = 999999999;
      GameState.resources.population = 1000000;
      GameState.statistics.totalClicks = 500000;
      UI.updateResourceDisplays();
      UI.updateStatistics();
    });
    
    // Check that UI updates quickly
    const startTime = Date.now();
    
    await expect(page.locator('#coinsCount')).toContainText('999');
    await expect(page.locator('#populationCount')).toContainText('1');
    await expect(page.locator('#totalClicks')).toContainText('500');
    
    const updateTime = Date.now() - startTime;
    expect(updateTime).toBeLessThan(1000); // Should update within 1 second
  });

  test('should maintain performance with many DOM elements', async ({ page }) => {
    // Switch to achievements tab which has many elements
    await page.locator('#achievementsTab').click();
    
    const startTime = Date.now();
    
    // Wait for all achievement cards to render
    await page.waitForSelector('.achievement-card');
    
    const renderTime = Date.now() - startTime;
    expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds
    
    // Count achievement cards
    const cardCount = await page.locator('.achievement-card').count();
    expect(cardCount).toBeGreaterThan(10); // Should have many achievements
  });

  test('should handle memory efficiently during long sessions', async ({ page }) => {
    // Simulate a long gaming session
    await page.evaluate(async () => {
      GameLoop.start();
      
      // Fast-forward game state
      GameState.resources.coins = 10000;
      GameState.buildings.houses = 20;
      GameState.buildings.shops = 10;
      
      // Simulate 1000 game ticks
      for (let i = 0; i < 1000; i++) {
        GameLoop.tick();
        
        // Occasionally trigger UI updates
        if (i % 100 === 0) {
          UI.updateAll();
        }
      }
    });
    
    // Check that the page is still responsive
    const clickCoinsBtn = page.locator('#clickCoinsBtn');
    await clickCoinsBtn.click();
    
    const coinsCount = page.locator('#coinsCount');
    await expect(coinsCount).not.toHaveText('10000'); // Should have increased
  });

  test('should optimize DOM updates efficiently', async ({ page }) => {
    // Monitor DOM mutations
    const mutationCount = await page.evaluate(async () => {
      let mutations = 0;
      
      const observer = new MutationObserver((mutationsList) => {
        mutations += mutationsList.length;
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
      
      // Perform actions that should trigger minimal DOM updates
      for (let i = 0; i < 10; i++) {
        ManualActions.collectCoins(1);
        UI.updateResourceDisplays();
      }
      
      // Wait a bit for mutations to be recorded
      await new Promise(resolve => setTimeout(resolve, 100));
      
      observer.disconnect();
      return mutations;
    });
    
    // Should have reasonable number of DOM mutations
    expect(mutationCount).toBeLessThan(50); // Efficient updates
  });

  test('should handle browser tab switching gracefully', async ({ page, context }) => {
    // Start the game
    await page.evaluate(() => {
      GameLoop.start();
      GameState.buildings.houses = 5;
    });
    
    // Create a new tab and switch to it
    const newPage = await context.newPage();
    await newPage.goto('about:blank');
    
    // Wait for 2 seconds (simulating tab switch)
    await page.waitForTimeout(2000);
    
    // Switch back to game tab
    await page.bringToFront();
    
    // Check that game is still running
    const isRunning = await page.evaluate(() => {
      return GameLoop.intervalId !== null;
    });
    
    expect(isRunning).toBe(true);
  });

  test('should measure and report core web vitals', async ({ page }) => {
    // Navigate to the page and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (simulate with click)
        const startTime = performance.now();
        document.getElementById('clickCoinsBtn').click();
        vitals.fid = performance.now() - startTime;
        
        // Cumulative Layout Shift
        new PerformanceObserver((list) => {
          let cls = 0;
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
          vitals.cls = cls;
          
          // Resolve after collecting metrics
          setTimeout(() => resolve(vitals), 1000);
        }).observe({ entryTypes: ['layout-shift'] });
      });
    });
    
    // Assert Core Web Vitals thresholds
    expect(webVitals.lcp).toBeLessThan(2500); // LCP should be < 2.5s
    expect(webVitals.fid).toBeLessThan(100);  // FID should be < 100ms
    expect(webVitals.cls).toBeLessThan(0.1);  // CLS should be < 0.1
  });
});