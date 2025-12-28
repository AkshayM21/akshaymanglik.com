import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home redirects to /about', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/about/);
  });

  test('nav links are present and functional', async ({ page }) => {
    await page.goto('/dereferenced');

    // Check nav exists
    const nav = page.locator('.nav');
    await expect(nav).toBeVisible();

    // Check links
    const writingLink = page.locator('.nav__link', { hasText: 'writing' });
    const aboutLink = page.locator('.nav__link', { hasText: 'about' });

    await expect(writingLink).toBeVisible();
    await expect(aboutLink).toBeVisible();

    // Test about link
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);
  });

  test('logo links to blog index', async ({ page }) => {
    await page.goto('/about');

    const logo = page.locator('.nav__logo');
    await logo.click();
    await expect(page).toHaveURL(/\/dereferenced/);
  });

  test('logo has hover tooltip on desktop', async ({ page }) => {
    await page.goto('/dereferenced');

    const logo = page.locator('.nav__logo');
    const tooltip = page.locator('.nav__logo-tooltip');

    // Logo should be visible
    await expect(logo).toBeVisible();

    // Tooltip exists but is hidden by default
    await expect(tooltip).toBeAttached();

    // Hover over logo
    await logo.hover();

    // Tooltip should become visible on hover
    await expect(tooltip).toBeVisible();
  });

  test('post cards link to articles', async ({ page }) => {
    await page.goto('/dereferenced');

    const firstCard = page.locator('.post-card').first();
    const cardLink = firstCard.locator('.post-card__title a');
    const href = await cardLink.getAttribute('href');

    await cardLink.click();
    await expect(page).toHaveURL(new RegExp(href!));
  });

  test('post cards have hover effect styles', async ({ page }) => {
    await page.goto('/dereferenced');

    const card = page.locator('.post-card').first();

    // Check transition properties exist
    const transition = await card.evaluate(
      (el) => window.getComputedStyle(el).transition
    );
    expect(transition).toContain('transform');
  });
});
