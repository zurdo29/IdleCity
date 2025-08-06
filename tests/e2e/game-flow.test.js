// End-to-end tests for game flow

const { test, expect } = require('@playwright/test');

test.describe('IdleCity Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load game correctly', async ({ page }) => {
    // Check if main elements are present
    await expect(page.locator('h1')).toContainText('IdleCity');
    await expect(page.locator('#coinsCount')).toBeVisible();
    await expect(page.locator('#populationCount')).toBeVisible();
    await expect(page.locator('#happinessCount')).toBeVisible();
    
    // Check initial resource values
    await expect(page.locator('#coinsCount')).toHaveText('0');
    await expect(page.locator('#populationCount')).toHaveText('0');
    await expect(page.locator('#happinessCount')).toHaveText('100');
  });

  test('should allow manual coin collection', async ({ page }) => {
    const clickCoinsBtn = page.locator('#clickCoinsBtn');
    const coinsCount = page.locator('#coinsCount');
    
    await expect(coinsCount).toHaveText('0');
    
    // Click to collect coins
    await clickCoinsBtn.click();
    await expect(coinsCount).toHaveText('1');
    
    // Click multiple times
    await clickCoinsBtn.click();
    await clickCoinsBtn.click();
    await expect(coinsCount).toHaveText('3');
  });

  test('should allow manual population attraction', async ({ page }) => {
    const clickPopulationBtn = page.locator('#clickPopulationBtn');
    const populationCount = page.locator('#populationCount');
    
    await expect(populationCount).toHaveText('0');
    
    // Click to attract population
    await clickPopulationBtn.click();
    await expect(populationCount).toHaveText('1');
  });

  test('should enable building purchases when affordable', async ({ page }) => {
    // Collect enough coins for a house
    const clickCoinsBtn = page.locator('#clickCoinsBtn');
    const coinsCount = page.locator('#coinsCount');
    
    // Click enough times to afford a house (cost: 10 coins)
    for (let i = 0; i < 12; i++) {
      await clickCoinsBtn.click();
    }
    
    await expect(coinsCount).toHaveText('12');
    
    // Switch to buildings tab
    await page.locator('#buildingsTab').click();
    
    // Find and click the first available building button
    const buildingButtons = page.locator('.building-card button');
    const firstButton = buildingButtons.first();
    
    await expect(firstButton).toBeEnabled();
    await firstButton.click();
    
    // Check that coins were deducted
    const newCoinsValue = await coinsCount.textContent();
    expect(parseInt(newCoinsValue)).toBeLessThan(12);
  });

  test('should show building unlock progression', async ({ page }) => {
    // Start with some resources
    await page.evaluate(() => {
      GameState.resources.coins = 1000;
      GameState.resources.population = 50;
      UI.updateResourceDisplays();
    });
    
    await page.locator('#buildingsTab').click();
    
    // Check that more buildings are available with higher resources
    const buildingCards = page.locator('.building-card');
    const visibleBuildings = await buildingCards.count();
    
    expect(visibleBuildings).toBeGreaterThan(1);
  });

  test('should display notifications for actions', async ({ page }) => {
    // Collect coins to trigger notification
    await page.locator('#clickCoinsBtn').click();
    
    // Check for notification (may need to wait for animation)
    const notification = page.locator('.notification');
    await expect(notification).toBeVisible({ timeout: 2000 });
  });

  test('should save and load game state', async ({ page }) => {
    // Set up some game state
    await page.evaluate(() => {
      GameState.resources.coins = 100;
      GameState.resources.population = 25;
      GameState.buildings.houses = 2;
      UI.updateResourceDisplays();
    });
    
    // Save the game
    await page.locator('#saveBtn').click();
    
    // Reset game state
    await page.evaluate(() => {
      GameState.resources.coins = 0;
      GameState.resources.population = 0;
      GameState.buildings.houses = 0;
      UI.updateResourceDisplays();
    });
    
    await expect(page.locator('#coinsCount')).toHaveText('0');
    
    // Load the game
    await page.locator('#loadBtn').click();
    
    // Check that state was restored
    await expect(page.locator('#coinsCount')).toHaveText('100');
    await expect(page.locator('#populationCount')).toHaveText('25');
  });

  test('should handle tab navigation', async ({ page }) => {
    // Test buildings tab
    await page.locator('#buildingsTab').click();
    await expect(page.locator('#buildingsContent')).toBeVisible();
    await expect(page.locator('#upgradesContent')).toBeHidden();
    
    // Test upgrades tab
    await page.locator('#upgradesTab').click();
    await expect(page.locator('#upgradesContent')).toBeVisible();
    await expect(page.locator('#buildingsContent')).toBeHidden();
    
    // Test achievements tab
    await page.locator('#achievementsTab').click();
    await expect(page.locator('#achievementsContent')).toBeVisible();
    await expect(page.locator('#upgradesContent')).toBeHidden();
  });

  test('should show resource generation rates', async ({ page }) => {
    // Set up some buildings for resource generation
    await page.evaluate(() => {
      GameState.buildings.houses = 3;
      GameState.buildings.shops = 1;
      UI.updateResourceDisplays();
    });
    
    // Check that per-second rates are displayed
    const coinsPerSecond = page.locator('#coinsPerSecond');
    const populationPerSecond = page.locator('#populationPerSecond');
    
    await expect(coinsPerSecond).not.toHaveText('0');
    await expect(populationPerSecond).not.toHaveText('0');
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    const coinsCount = page.locator('#coinsCount');
    
    // Test spacebar for coin collection
    await page.keyboard.press('Space');
    await expect(coinsCount).toHaveText('1');
    
    // Test 'C' key for coin collection
    await page.keyboard.press('c');
    await expect(coinsCount).toHaveText('2');
    
    // Test 'P' key for population
    const populationCount = page.locator('#populationCount');
    await page.keyboard.press('p');
    await expect(populationCount).toHaveText('1');
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('This test is only for mobile devices');
    }
    
    // Check that mobile layout is applied
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check that touch interactions work
    const clickCoinsBtn = page.locator('#clickCoinsBtn');
    await clickCoinsBtn.tap();
    
    const coinsCount = page.locator('#coinsCount');
    await expect(coinsCount).toHaveText('1');
  });
});