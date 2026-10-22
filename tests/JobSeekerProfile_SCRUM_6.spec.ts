import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSeekerProfilePage } from '../pages/JobSeekerProfilePage';

const TARGET_CITY = 'Pune';
const OTHER_CITY = 'Mumbai';
const WRONG_PASSWORD = 'Wrong@1234';

async function loginAsDemoSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginAsDemoSeeker();
  await dashboardPage.verifyDashboardOpened();
}

test.describe('SCRUM-6 | Profile update for demo seeker user', () => {
  // Shared public demo account — profile writes must not run in parallel
  test.describe.configure({ mode: 'serial' });

  // Xray Issue Id 1 — positive: AC happy path
  test('SCRUM-6 TC1: demo seeker changes Location to Pune', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in with the Job Seeker demo account', async () => {
      await loginAsDemoSeeker(page);
    });

    await step('Open My profile', async () => {
      await profilePage.navigateToProfilePage();
      await profilePage.verifyProfilePageOpened();
    });

    await step(`Set Location to ${TARGET_CITY} and save`, async () => {
      await profilePage.updateCity(TARGET_CITY);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityValue(TARGET_CITY);
    });

    await step(`Refresh and verify ${TARGET_CITY} is still shown`, async () => {
      await profilePage.verifyCityPersistedAfterRefresh(TARGET_CITY);
    });
  });

  // Xray Issue Id 2 — positive: demo account sign-in
  test('SCRUM-6 TC2: demo account button prefills seeker credentials', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await step('Open the login page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Use the Job Seeker demo account and sign in', async () => {
      await loginPage.loginAsDemoSeeker();
    });

    await step('Verify the Tester Dashboard opens', async () => {
      await dashboardPage.verifyDashboardOpened();
    });
  });

  // Xray Issue Id 3 — positive: real change from another city
  test('SCRUM-6 TC3: Location changes from another city to Pune', { tag: '@regression' }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and open My profile', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step(`Set Location to ${OTHER_CITY} first`, async () => {
      await profilePage.updateCity(OTHER_CITY);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityPersistedAfterRefresh(OTHER_CITY);
    });

    await step(`Change Location to ${TARGET_CITY} and save`, async () => {
      await profilePage.updateCity(TARGET_CITY);
      await profilePage.verifyProfileSaved();
    });

    await step(`Refresh and verify ${TARGET_CITY} is shown`, async () => {
      await profilePage.verifyCityPersistedAfterRefresh(TARGET_CITY);
    });
  });

  // Xray Issue Id 4 — positive: persists across sessions
  test('SCRUM-6 TC4: Pune persists after sign out and sign in again', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step(`Sign in as demo seeker and save Location ${TARGET_CITY}`, async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateCity(TARGET_CITY);
      await profilePage.verifyProfileSaved();
    });

    await step('Log out', async () => {
      await dashboardPage.logout();
    });

    await step(`Sign in again and verify Location is ${TARGET_CITY}`, async () => {
      await loginPage.navigateToLoginPage();
      await loginPage.loginAsDemoSeeker();
      await dashboardPage.verifyDashboardOpened();
      await profilePage.navigateToProfilePage();
      await profilePage.verifyCityValue(TARGET_CITY);
    });
  });

  // Xray Issue Id 5 — negative: guest
  test('SCRUM-6 TC5: guest cannot open the profile page', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Open /profile without signing in', async () => {
      await profilePage.openProfileUrl();
    });

    await step('Verify redirect to login and no profile form', async () => {
      await loginPage.verifyLoginUrl();
      await profilePage.verifyLocationFieldNotShown();
    });
  });

  // Xray Issue Id 6 — negative: wrong password
  test('SCRUM-6 TC6: wrong password does not sign in demo seeker', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await step('Open the login page', async () => {
      await loginPage.navigateToLoginPage();
    });

    await step('Sign in with demo seeker email and a wrong password', async () => {
      await loginPage.login(LoginPage.DEMO_SEEKER_EMAIL, WRONG_PASSWORD);
    });

    await step('Verify Invalid credentials and still on login page', async () => {
      await loginPage.verifyInvalidCredentialsError();
      await loginPage.verifyStillOnLoginPage();
    });
  });

  // Xray Issue Id 7 — negative: employer role
  test('SCRUM-6 TC7: demo employer has no seeker profile Location', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in with the Employer demo account', async () => {
      await loginPage.navigateToLoginPage();
      await loginPage.loginAsDemoEmployer();
      await dashboardPage.verifyEmployerDashboardOpened();
    });

    await step('Open /profile', async () => {
      await profilePage.openProfileUrl();
    });

    await step('Verify employer is kept on the Employer Dashboard without a Location field', async () => {
      await dashboardPage.verifyEmployerDashboardOpened();
      await profilePage.verifyLocationFieldNotShown();
    });
  });

  // Xray Issue Id 8 — boundary: surrounding spaces
  test('SCRUM-6 TC8: Pune with surrounding spaces is accepted', { tag: '@regression' }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and open My profile', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Save Location with leading and trailing spaces', async () => {
      await profilePage.updateCity(`  ${TARGET_CITY}  `);
      await profilePage.verifyProfileSaved();
    });

    await step(`Refresh and verify Location still reads ${TARGET_CITY}`, async () => {
      await profilePage.refreshProfilePage();
      await profilePage.verifyCityValueIgnoringSurroundingSpaces(TARGET_CITY);
    });

    await step(`Restore Location to exactly ${TARGET_CITY}`, async () => {
      await profilePage.updateCity(TARGET_CITY);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityPersistedAfterRefresh(TARGET_CITY);
    });
  });
});
