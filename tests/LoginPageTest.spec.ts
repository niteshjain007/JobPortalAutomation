import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

const VALID_EMAIL = 'Jobseeker2807@yopmail.com';
const VALID_PASSWORD = 'Test@123';

test.describe('Login Page', () => {
  test('should navigate to login page from home Sign in button', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Click Sign in on the home page to open the login page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Verify the user is on the login page URL', async () => {
      await loginPage.verifyLoginUrl();
    });
  });

  // TC-LOGIN-001 / TC-LOGIN-002
  test('TC-LOGIN-001/002: valid job seeker login opens Dashboard', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter valid job seeker email and password, then Sign in', async () => {
      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
    });

    await step('Verify Dashboard opens after successful login', async () => {
      await dashboardPage.verifyDashboardOpened();
    });
  });

  // TC-LOGIN-003
  test('TC-LOGIN-003: invalid password does not open Dashboard', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter valid email with invalid password, then Sign in', async () => {
      await loginPage.login(VALID_EMAIL, 'WrongPass@123');
    });

    await step('Verify Invalid credentials error and user stays on login', async () => {
      await loginPage.verifyInvalidCredentialsError();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-004
  test('TC-LOGIN-004: invalid email does not open Dashboard', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter invalid email with password, then Sign in', async () => {
      await loginPage.login('wrong.user@yopmail.com', VALID_PASSWORD);
    });

    await step('Verify Invalid credentials error and user stays on login', async () => {
      await loginPage.verifyInvalidCredentialsError();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-005
  test('TC-LOGIN-005: should show Invalid credentials for incorrect email and password', { tag: '@regression' }, async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter incorrect email and password, then click Sign in', async () => {
      await loginPage.login('test@check.com', 'asdfgh');
    });

    await step('Verify "Invalid credentials" error message is displayed', async () => {
      await loginPage.verifyInvalidCredentialsError();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-006
  test('TC-LOGIN-006: empty email shows required-field validation', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Leave email empty, enter password, then Sign in', async () => {
      await loginPage.login('', VALID_PASSWORD);
    });

    await step('Verify required validation on email and stay on login', async () => {
      await loginPage.verifyRequiredEmailMessage();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-007
  test('TC-LOGIN-007: empty password shows required-field validation', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter email, leave password empty, then Sign in', async () => {
      await loginPage.login(VALID_EMAIL, '');
    });

    await step('Verify required validation on password and stay on login', async () => {
      await loginPage.verifyRequiredPasswordMessage();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-008
  test('TC-LOGIN-008: both fields empty shows required-field validation', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Click Sign in with both fields empty', async () => {
      await loginPage.clickSignIn();
    });

    await step('Verify required validation on email and stay on login', async () => {
      await loginPage.verifyRequiredEmailMessage();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-009
  test('TC-LOGIN-009: whitespace-only credentials do not open Dashboard', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter spaces only in email and password, then Sign in', async () => {
      await loginPage.login('   ', '   ');
    });

    await step('Verify login is rejected and Dashboard does not open', async () => {
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-010
  test('TC-LOGIN-010: email with leading/trailing spaces', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter email with spaces around it and valid password', async () => {
      await loginPage.login(` ${VALID_EMAIL} `, VALID_PASSWORD);
    });

    await step('Verify either Dashboard opens (trim) or login is rejected', async () => {
      const onDashboard = /dashboard/.test(page.url());
      if (onDashboard) {
        await dashboardPage.verifyDashboardOpened();
      } else {
        await loginPage.verifyStillOnLoginPage();
      }
    });
  });

  // TC-LOGIN-011
  test('TC-LOGIN-011: password case sensitivity rejects wrong casing', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter valid email with wrong-case password, then Sign in', async () => {
      await loginPage.login(VALID_EMAIL, 'test@123');
    });

    await step('Verify login fails and Dashboard does not open', async () => {
      await loginPage.verifyInvalidCredentialsError();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // TC-LOGIN-012
  test('TC-LOGIN-012: email case variation still allows login when supported', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter email in different casing with valid password', async () => {
      await loginPage.login('jobseeker2807@yopmail.com', VALID_PASSWORD);
    });

    await step('Verify Dashboard opens if email is case-insensitive', async () => {
      await dashboardPage.verifyDashboardOpened();
    });
  });

  // TC-LOGIN-013
  test('TC-LOGIN-013: logout then re-login opens Dashboard again', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await step('Log in with valid credentials', async () => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
      await dashboardPage.verifyDashboardOpened();
    });

    await step('Logout from Dashboard', async () => {
      await dashboardPage.logout();
    });

    await step('Log in again and verify Dashboard opens', async () => {
      await loginPage.navigateToLoginPage();
      await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
      await dashboardPage.verifyDashboardOpened();
    });
  });

  // TC-LOGIN-014
  test('TC-LOGIN-014: malicious input does not open Dashboard', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page from the home page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Enter malicious values in email and password, then Sign in', async () => {
      await loginPage.login("' OR 1=1--", '<script>alert(1)</script>');
    });

    await step('Verify login is rejected and app stays on login page', async () => {
      await loginPage.verifyStillOnLoginPage();
    });
  });
});
