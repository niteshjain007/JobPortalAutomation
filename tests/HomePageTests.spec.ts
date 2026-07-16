import { test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home Page', () => {
  test('should open the Job Search Portal website', async ({ page }) => {
    const homePage = new HomePage(page);

    // Open portal and confirm the home page title is shown
    await homePage.openHomePage();
    await homePage.verifyPageTitle();
  });
});
