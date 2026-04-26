import type { Page } from '@playwright/test';

export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.getByTestId('email-input').fill('admin@taskflow.com');
  await page.getByTestId('password-input').fill('password123');
  await page.getByTestId('login-button').click();
  await page.waitForURL('/dashboard');
}