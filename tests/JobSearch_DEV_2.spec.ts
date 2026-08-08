import { test, expect } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSearchPage } from '../pages/JobSearchPage';

const VALID_EMAIL = 'Jobseeker2807@yopmail.com';
const VALID_PASSWORD = 'Test@123';
const LOCATION_MUMBAI = 'Mumbai';
const INVALID_LOCATION = 'traumaatic';

async function loginAsJobSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  await dashboardPage.verifyDashboardOpened();
}

test.describe('DEV-2 | Job search in Mumbai + Apply', () => {
  // Shared seeker account — serial to avoid apply/filter races
  test.describe.configure({ mode: 'serial' });

  // Xray Issue Id 1 — positive location filter
  test('DEV-2 TC1: filter jobs by location Mumbai', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker', async () => {
      await loginAsJobSeeker(page);
    });

    await step('Open Jobs page', async () => {
      await jobSearchPage.openJobsPage();
    });

    await step(`Filter by location "${LOCATION_MUMBAI}"`, async () => {
      await jobSearchPage.filterByLocation(LOCATION_MUMBAI);
    });

    await step('Verify Mumbai jobs are shown', async () => {
      await jobSearchPage.verifyResultCountContains(/of 1 job/i);
      await jobSearchPage.verifyJobPresentInList('Performance Test Engineer');
      await expect(page.locator('[data-testid^="job-card-"]').filter({ hasText: 'Mumbai' })).toBeVisible();
    });
  });

  // Xray Issue Id 2 — negative invalid location
  test('DEV-2 TC2: invalid location shows no matching jobs', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker and open Jobs', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
    });

    await step(`Search with invalid location "${INVALID_LOCATION}"`, async () => {
      await jobSearchPage.filterByLocation(INVALID_LOCATION);
    });

    await step('Verify empty results / no-match message', async () => {
      await jobSearchPage.verifyNoJobsMatchFilters();
    });
  });

  // Xray Issue Id 3 — boundary empty location
  test('DEV-2 TC3: empty location shows default job list', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker and open Jobs', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
    });

    await step('Clear location and search', async () => {
      await jobSearchPage.clearLocationAndSearch();
    });

    await step('Verify jobs are listed', async () => {
      await jobSearchPage.verifyJobsListed();
      await expect(page.getByTestId('jobs-result-count')).not.toContainText(/0 jobs found/i);
    });
  });

  // Xray Issue Id 4 — positive apply
  test('DEV-2 TC4: apply to a Mumbai job as Job Seeker', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login, open Jobs, filter Mumbai', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByLocation(LOCATION_MUMBAI);
      await jobSearchPage.openJobCardContaining('Mumbai');
      await jobSearchPage.verifyJobDetailLocation(LOCATION_MUMBAI);
    });

    await step('Apply (or verify already Applied)', async () => {
      if (await jobSearchPage.isAlreadyApplied()) {
        await jobSearchPage.verifyAppliedState();
      } else {
        await jobSearchPage.applyWithNewResume();
        await jobSearchPage.verifyApplicationSubmitted();
      }
    });
  });

  // Xray Issue Id 5 — negative unauthenticated apply
  test('DEV-2 TC5: guest apply prompts Sign in / create profile', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs as guest and filter Mumbai', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByLocation(LOCATION_MUMBAI);
      await jobSearchPage.openFirstJobCard();
    });

    await step('Click Apply and verify login/profile prompt', async () => {
      await jobSearchPage.attemptGuestApplyAndVerifyLoginPrompt();
    });
  });

  // Xray Issue Id 6 — boundary already applied
  test('DEV-2 TC6: already applied Mumbai job shows Applied state', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login and open Mumbai job detail', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByLocation(LOCATION_MUMBAI);
      await jobSearchPage.openJobCardContaining('Mumbai');
    });

    await step('Verify Applied state is shown after prior application', async () => {
      await jobSearchPage.verifyAppliedState();
    });
  });
});
