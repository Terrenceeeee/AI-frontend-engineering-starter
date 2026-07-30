// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('首页冒烟测试', () => {
  test('首页应该正常加载', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:5173/');
    
    // 检查页面标题是否包含 "Vite 分包验证 Demo"
    await expect(page.locator('h1')).toContainText('Vite 分包验证');
  });

  test('点击用户页链接应该跳转到 /user', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    
    // 点击 "用户中心" 链接
    await page.click('text=用户中心');
    
    // 验证 URL 变成了 /user
    await expect(page).toHaveURL(/.*\/user/);
    
    // 验证页面出现了 "用户中心" 标题
    await expect(page.locator('h1')).toContainText('用户中心');
  });
});