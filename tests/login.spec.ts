import { test, expect } from '@playwright/test';

test.describe('Login page', () => {

  test('shows login form on load', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('shows error with wrong credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('wrong@email.com');
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toContainText('Invalid');
  });

  test('redirects to dashboard on valid login', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('admin@taskflow.com');
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

});