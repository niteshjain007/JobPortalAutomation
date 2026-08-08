import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { HomePage } from '../pages/HomePage';

test.describe('Home Page', () => {
  test('should open the Job Search Portal website', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const homePage = new HomePage(page);

    await step('Open the Job Search Portal home page', async () => {
      await homePage.openHomePage();
    });

    await step('Verify the home page career platform title is displayed', async () => {
      await homePage.verifyPageTitle();
    });
  });
});
