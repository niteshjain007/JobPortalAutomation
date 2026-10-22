import { test, expect } from '@playwright/test';
import { step } from 'allure-js-commons';
import { HomePage } from '../pages/HomePage';

/**
 * DEV-4 | Homepage Test
 * AC1: Unregistered user on QaTestology Home sees Jobs, About, and Contact nav links.
 */
test.describe('DEV-4 | Homepage navigation for guest', () => {
  // Xray Issue Id 1 — positive: all three links visible
  test('DEV-4 TC1: guest home shows Jobs, About, Contact nav links', async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open QaTestology home as unregistered guest', async () => {
      await homePage.openHomePage();
      await homePage.verifyPageTitle();
    });

    await step('Verify Jobs, About, and Contact nav links are visible', async () => {
      await homePage.verifyGuestNavLinksVisible();
    });
  });

  // Xray Issue Id 2 — positive: Jobs navigation
  test('DEV-4 TC2: guest can open Jobs from home nav', async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open home as guest', async () => {
      await homePage.openHomePage();
    });

    await step('Click Jobs nav link and verify Jobs page', async () => {
      await homePage.navigateToJobsViaNav();
      await expect(page.getByRole('heading', { name: 'QA & Automation jobs' })).toBeVisible();
    });
  });

  // Xray Issue Id 3 — positive: About navigation
  test('DEV-4 TC3: guest can open About from home nav', async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open home as guest and click About', async () => {
      await homePage.openHomePage();
      await homePage.navigateToAboutViaNav();
    });

    await step('Verify About page URL', async () => {
      await expect(page).toHaveURL(/\/about\/?$/);
    });
  });

  // Xray Issue Id 4 — positive: Contact navigation
  test('DEV-4 TC4: guest can open Contact from home nav', async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open home as guest and click Contact', async () => {
      await homePage.openHomePage();
      await homePage.navigateToContactViaNav();
    });

    await step('Verify Contact page URL', async () => {
      await expect(page).toHaveURL(/\/contact\/?$/);
    });
  });

  // Xray Issue Id 5 — boundary: guest header state
  test('DEV-4 TC5: nav links visible with guest Sign in / Get started', async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open home without signing in', async () => {
      await homePage.openHomePage();
    });

    await step('Verify nav links and guest header actions', async () => {
      await homePage.verifyGuestNavLinksVisible();
      await homePage.verifyGuestHeaderActionsVisible();
    });
  });

  // Xray Issue Id 6 — negative/boundary: no registration required for nav
  test('DEV-4 TC6: direct home URL shows nav without login', async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open home via direct URL in fresh guest session', async () => {
      await page.goto('https://qatestology.com/');
      await expect(page).toHaveURL(/qatestology\.com\/?$/);
    });

    await step('Verify Jobs About Contact visible without registration', async () => {
      await homePage.verifyGuestNavLinksVisible();
      await homePage.verifyGuestHeaderActionsVisible();
    });
  });
});
