import { test, expect } from '@playwright/test';

test.describe('水尺计量系统验收测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('[data-testid="username-input"]', { timeout: 10000 });
    
    await page.evaluate(() => {
      const badge = document.getElementById('trae-badge-plugin');
      if (badge) badge.remove();
    });
  });

  test('1. 计量员登录成功', async ({ page }) => {
    await page.getByTestId('username-input').fill('gauger1');
    await page.getByTestId('password-input').fill('123456');
    await page.getByTestId('login-btn').click({ force: true });

    await page.waitForURL('**/reading', { timeout: 15000 });
    await expect(page).toHaveURL(/\/reading/);
  });

  test('2. 读数未填全时计算按钮禁用', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByTestId('quick-login-gauger').click({ force: true });
    await page.waitForURL('**/reading', { timeout: 15000 });
    
    await page.waitForSelector('[data-testid="vessel-name-input"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByTestId('vessel-name-input').fill('测试船');
    await page.getByTestId('voyage-no-input').fill('V001');

    const calculateBtn = page.getByTestId('to-calculate-btn');
    await expect(calculateBtn).toBeDisabled({ timeout: 10000 });

    await page.getByTestId('gauge-frontLeft').locator('input').fill('5.000');
    await expect(calculateBtn).toBeDisabled();

    await page.getByTestId('gauge-frontRight').locator('input').fill('5.000');
    await expect(calculateBtn).toBeDisabled();

    await page.getByTestId('gauge-midLeft').locator('input').fill('5.200');
    await expect(calculateBtn).toBeDisabled();

    await page.getByTestId('gauge-midRight').locator('input').fill('5.200');
    await expect(calculateBtn).toBeDisabled();

    await page.getByTestId('gauge-aftLeft').locator('input').fill('5.400');
    await expect(calculateBtn).toBeDisabled();

    await page.getByTestId('gauge-aftRight').locator('input').fill('5.400');
    await expect(calculateBtn).toBeEnabled();
  });

  test('3. 前后水尺差异过大触发复核提示', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByTestId('quick-login-gauger').click({ force: true });
    await page.waitForURL('**/reading', { timeout: 15000 });
    
    await page.waitForSelector('[data-testid="vessel-name-input"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByTestId('vessel-name-input').fill('异常测试船');
    await page.getByTestId('voyage-no-input').fill('TEST-001');

    await page.getByTestId('gauge-frontLeft').locator('input').fill('4.000');
    await page.getByTestId('gauge-frontRight').locator('input').fill('4.000');
    await page.getByTestId('gauge-midLeft').locator('input').fill('5.000');
    await page.getByTestId('gauge-midRight').locator('input').fill('5.000');
    await page.getByTestId('gauge-aftLeft').locator('input').fill('6.000');
    await page.getByTestId('gauge-aftRight').locator('input').fill('6.000');

    await page.getByTestId('to-calculate-btn').click({ force: true });
    await page.waitForURL('**/calculate', { timeout: 15000 });

    await page.waitForSelector('[data-testid="review-warning-banner"]', { timeout: 10000 });
    await expect(page.getByTestId('review-warning-banner')).toBeVisible();
    await expect(page.getByTestId('review-warning-banner')).toContainText('前后水尺差异');

    await page.getByTestId('calculate-btn').click({ force: true });

    await expect(page.getByTestId('review-modal')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('review-modal')).toContainText('数据异常复核确认');
    await expect(page.getByTestId('review-confirm-btn')).toBeVisible();
  });

  test('4. 录入正常读数不触发复核', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByTestId('quick-login-gauger').click({ force: true });
    await page.waitForURL('**/reading', { timeout: 15000 });
    
    await page.waitForSelector('[data-testid="vessel-name-input"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByTestId('vessel-name-input').fill('正常测试船');
    await page.getByTestId('voyage-no-input').fill('TEST-002');

    await page.getByTestId('gauge-frontLeft').locator('input').fill('5.000');
    await page.getByTestId('gauge-frontRight').locator('input').fill('5.020');
    await page.getByTestId('gauge-midLeft').locator('input').fill('5.100');
    await page.getByTestId('gauge-midRight').locator('input').fill('5.120');
    await page.getByTestId('gauge-aftLeft').locator('input').fill('5.200');
    await page.getByTestId('gauge-aftRight').locator('input').fill('5.220');

    await page.getByTestId('to-calculate-btn').click({ force: true });
    await page.waitForURL('**/calculate', { timeout: 15000 });

    await page.waitForSelector('[data-testid="calculate-btn"]', { timeout: 10000 });
    await page.getByTestId('calculate-btn').click({ force: true });

    await expect(page.getByTestId('review-modal')).not.toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('submit-btn')).toBeVisible();
  });

  test('5. 左右水尺差异警告', async ({ page }) => {
    test.setTimeout(60000);
    
    await page.getByTestId('quick-login-gauger').click({ force: true });
    await page.waitForURL('**/reading', { timeout: 15000 });
    
    await page.waitForSelector('[data-testid="vessel-name-input"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByTestId('vessel-name-input').fill('左右差异测试船');
    await page.getByTestId('voyage-no-input').fill('TEST-003');

    await page.getByTestId('gauge-frontLeft').locator('input').fill('5.000');
    await page.getByTestId('gauge-frontRight').locator('input').fill('5.200');
    await page.getByTestId('gauge-midLeft').locator('input').fill('5.100');
    await page.getByTestId('gauge-midRight').locator('input').fill('5.100');
    await page.getByTestId('gauge-aftLeft').locator('input').fill('5.200');
    await page.getByTestId('gauge-aftRight').locator('input').fill('5.200');

    await page.getByTestId('to-calculate-btn').click({ force: true });
    await page.waitForURL('**/calculate', { timeout: 15000 });

    await expect(page.getByTestId('reading-warning-banner')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('reading-warning-banner')).toContainText('左右');
  });

  test('6. 完整业务流程测试', async ({ page }) => {
    test.setTimeout(90000);
    
    await page.getByTestId('quick-login-gauger').click({ force: true });
    await page.waitForURL('**/reading', { timeout: 15000 });
    
    await page.waitForSelector('[data-testid="vessel-name-input"]', { timeout: 10000 });
    await page.waitForTimeout(1000);

    await page.getByTestId('vessel-name-input').fill('完整流程测试船');
    await page.getByTestId('voyage-no-input').fill('FULL-001');

    await page.getByTestId('gauge-frontLeft').locator('input').fill('4.500');
    await page.getByTestId('gauge-frontRight').locator('input').fill('4.520');
    await page.getByTestId('gauge-midLeft').locator('input').fill('5.000');
    await page.getByTestId('gauge-midRight').locator('input').fill('5.020');
    await page.getByTestId('gauge-aftLeft').locator('input').fill('5.500');
    await page.getByTestId('gauge-aftRight').locator('input').fill('5.520');

    await page.getByTestId('to-calculate-btn').click({ force: true });
    await page.waitForURL('**/calculate', { timeout: 15000 });

    await page.waitForSelector('[data-testid="calculate-btn"]', { timeout: 10000 });
    await page.getByTestId('calculate-btn').click({ force: true });
    await page.waitForTimeout(1000);

    await expect(page.getByTestId('review-modal')).toBeVisible({ timeout: 10000 });
    await page.getByTestId('review-confirm-btn').click({ force: true });

    await page.waitForSelector('[data-testid="submit-btn"]', { timeout: 10000 });
    await page.getByTestId('submit-btn').click({ force: true });
    await page.waitForURL(/\/print\//, { timeout: 15000 });

    await expect(page.getByTestId('print-btn')).toBeVisible({ timeout: 10000 });
  });
});
