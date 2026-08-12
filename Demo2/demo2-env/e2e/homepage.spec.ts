// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('首页冒烟测试', () => {
  test('首页应该正常加载', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '🌍 Vite 分包验证 Demo' })).toBeVisible();
  });

  test('点击用户页链接应该跳转到 /user', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: '用户中心' }).click();
    await expect(page).toHaveURL(/.*\/user/);
    await expect(page.getByRole('heading', { name: '👤 用户中心' })).toBeVisible();
  });
});