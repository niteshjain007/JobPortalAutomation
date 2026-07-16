import { test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Page', () => {
  test('should navigate to login page from home Sign in button', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigateToLoginPage();
    await loginPage.verifyLoginUrl();
  });

  test('should show Invalid credentials for incorrect email and password', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigateToLoginPage();
    await loginPage.login('test@check.com', 'asdfgh');
    await loginPage.verifyInvalidCredentialsError();
  });
});
