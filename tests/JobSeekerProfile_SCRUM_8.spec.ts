import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSeekerProfilePage } from '../pages/JobSeekerProfilePage';
import { CommonUtils } from '../utils/CommonUtils';

const MULTILINE_SUMMARY = 'Manual and automation testing.\nBiggest win: stable Playwright suite.';
const LONG_SUMMARY = 'A'.repeat(1000);
const WHITESPACE_SUMMARY = '   ';

/** Builds a summary that will not match whatever is already stored. */
function uniqueSummary(label: string): string {
  return `SCRUM-8 ${label} ${CommonUtils.getCurrentDate()}-${CommonUtils.getRandomNumber(4)}`;
}

async function loginAsDemoSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginAsDemoSeeker();
  await dashboardPage.verifyDashboardOpened();
}

async function signInAgainAndOpenProfile(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const profilePage = new JobSeekerProfilePage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginAsDemoSeeker();
  await dashboardPage.verifyDashboardOpened();
  await profilePage.navigateToProfilePage();
  return profilePage;
}

test.describe('SCRUM-8 | Update About/Summary for demo seeker', () => {
  // Shared public demo account — profile writes must not run in parallel
  test.describe.configure({ mode: 'serial' });

  // Xray Issue Id 1 — positive: update survives a new login
  test('SCRUM-8 TC1: demo seeker sees updated About/Summary after logout and login', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);
    const updatedSummary = uniqueSummary('login');

    await step('Sign in with the Job Seeker demo account', async () => {
      await loginAsDemoSeeker(page);
    });

    await step('Open My profile and save a new About/Summary', async () => {
      await profilePage.navigateToProfilePage();
      await profilePage.updateSummary(updatedSummary);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(updatedSummary);
    });

    await step('Log out', async () => {
      await dashboardPage.logout();
    });

    await step('Sign in again and verify About/Summary on My profile', async () => {
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifySummaryValue(updatedSummary);
    });
  });

  // Xray Issue Id 2 — positive: value remains after refresh
  test('SCRUM-8 TC2: updated About/Summary is shown after refresh', { tag: '@regression' }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const updatedSummary = uniqueSummary('refresh');

    await step('Sign in as demo seeker and open My profile', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Save a different About/Summary', async () => {
      await profilePage.updateSummary(updatedSummary);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(updatedSummary);
    });

    await step('Refresh and verify About/Summary is still shown', async () => {
      await profilePage.verifySummaryPersistedAfterRefresh(updatedSummary);
    });
  });

  // Xray Issue Id 3 — positive: a second text replaces the first
  test('SCRUM-8 TC3: About/Summary changes from one text to another', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);
    const summaryA = uniqueSummary('A');
    const summaryB = uniqueSummary('B');

    await step('Sign in as demo seeker and save summary A', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateSummary(summaryA);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(summaryA);
    });

    await step('Change About/Summary to summary B and save', async () => {
      await profilePage.updateSummary(summaryB);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(summaryB);
    });

    await step('Log out, sign in again, and verify summary B is shown', async () => {
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifySummaryValue(summaryB);
    });
  });

  // Xray Issue Id 4 — negative: guest
  test('SCRUM-8 TC4: guest cannot update About/Summary', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Open /profile without signing in', async () => {
      await profilePage.openProfileUrl();
    });

    await step('Verify redirect to login and no About/Summary field', async () => {
      await loginPage.verifyLoginUrl();
      await profilePage.verifySummaryFieldNotShown();
    });
  });

  // Xray Issue Id 5 — negative: employer role
  test('SCRUM-8 TC5: demo employer cannot edit the seeker About/Summary', { tag: '@regression' }, async ({ page }) => {
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

    await step('Verify employer stays on the Employer Dashboard without About/Summary', async () => {
      await dashboardPage.verifyEmployerDashboardOpened();
      await profilePage.verifySummaryFieldNotShown();
    });
  });

  // Xray Issue Id 6 — negative: edit is stored only after save
  test('SCRUM-8 TC6: unsaved About/Summary is discarded on refresh', { tag: '@regression' }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const savedSummary = uniqueSummary('saved');
    const unsavedSummary = uniqueSummary('unsaved');

    await step('Sign in as demo seeker and save an About/Summary', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateSummary(savedSummary);
      await profilePage.verifyProfileSaved();
    });

    await step('Type a different About/Summary without saving', async () => {
      await profilePage.enterSummary(unsavedSummary);
      await profilePage.verifySummaryValue(unsavedSummary);
    });

    await step('Refresh and verify the saved text is unchanged', async () => {
      await profilePage.verifySummaryPersistedAfterRefresh(savedSummary);
    });
  });

  // Xray Issue Id 7 — boundary: line breaks
  test('SCRUM-8 TC7: multiline About/Summary persists after logout and login', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and save a two-line About/Summary', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateSummary(MULTILINE_SUMMARY);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(MULTILINE_SUMMARY);
    });

    await step('Log out, sign in again, and verify both lines', async () => {
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifySummaryValue(MULTILINE_SUMMARY);
    });
  });

  // Xray Issue Id 8 — boundary: long text is not truncated
  test('SCRUM-8 TC8: long About/Summary of 1000 characters persists after refresh', { tag: '@regression' }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and save a 1000-character About/Summary', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateSummary(LONG_SUMMARY);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(LONG_SUMMARY);
    });

    await step('Refresh and verify all 1000 characters remain', async () => {
      await profilePage.verifySummaryPersistedAfterRefresh(LONG_SUMMARY);
    });
  });

  // Xray Issue Id 9 — boundary: spaces are kept, then empty persists across login
  test('SCRUM-8 TC9: whitespace is kept and an empty About/Summary stays empty after login', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and save a whitespace-only About/Summary', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateSummary(WHITESPACE_SUMMARY);
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue(WHITESPACE_SUMMARY);
    });

    await step('Refresh and verify the spaces are still stored', async () => {
      await profilePage.verifySummaryPersistedAfterRefresh(WHITESPACE_SUMMARY);
    });

    await step('Clear About/Summary, save, and verify it stays empty after a new login', async () => {
      await profilePage.updateSummary('');
      await profilePage.verifyProfileSaved();
      await profilePage.verifySummaryValue('');
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifySummaryValue('');
    });
  });
});
