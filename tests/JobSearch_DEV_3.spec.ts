import { test, expect } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSearchPage } from '../pages/JobSearchPage';

const VALID_EMAIL = 'Jobseeker2807@yopmail.com';
const VALID_PASSWORD = 'Test@123';
const JOB_TYPE_FREELANCE = 'Freelance';
const JOB_TYPE_FULL_TIME = 'Full-time';
const FREELANCE_JOB_TITLE = 'Performance Test Engineer';

async function loginAsJobSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  await dashboardPage.verifyDashboardOpened();
}

test.describe('DEV-3 | Search and apply for Freelance job', () => {
  // Shared seeker account — serial to avoid apply/filter races
  test.describe.configure({ mode: 'serial' });

  // Xray Issue Id 1 — positive job type filter
  test('DEV-3 TC1: filter jobs by Job type Freelance', async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker', async () => {
      await loginAsJobSeeker(page);
    });

    await step('Open Jobs page', async () => {
      await jobSearchPage.openJobsPage();
    });

    await step(`Filter by Job type "${JOB_TYPE_FREELANCE}"`, async () => {
      await jobSearchPage.filterByJobType(JOB_TYPE_FREELANCE);
    });

    await step('Verify only Freelance jobs are shown', async () => {
      await jobSearchPage.verifyResultCountContains(/of 1 job/i);
      await jobSearchPage.verifyJobPresentInList(FREELANCE_JOB_TITLE);
      await expect(
        page.locator('[data-testid^="job-card-"]').filter({ hasText: JOB_TYPE_FREELANCE }),
      ).toBeVisible();
      await expect(
        page.locator('[data-testid^="job-card-"]').filter({ hasText: JOB_TYPE_FULL_TIME }),
      ).toHaveCount(0);
    });
  });

  // Xray Issue Id 2 — negative wrong job type
  test('DEV-3 TC2: Full-time filter excludes Freelance job', async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker and open Jobs', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
    });

    await step(`Filter by Job type "${JOB_TYPE_FULL_TIME}"`, async () => {
      await jobSearchPage.filterByJobType(JOB_TYPE_FULL_TIME);
    });

    await step('Verify Freelance job is not listed', async () => {
      await expect(
        page.locator('[data-testid^="job-card-"]').filter({ hasText: FREELANCE_JOB_TITLE }),
      ).toHaveCount(0);
      await expect(
        page.locator('[data-testid^="job-card-"]').filter({ hasText: JOB_TYPE_FREELANCE }),
      ).toHaveCount(0);
      await jobSearchPage.verifyJobsListed();
    });
  });

  // Xray Issue Id 3 — boundary reset job type
  test('DEV-3 TC3: reset Job type to Any shows default list', async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker and open Jobs', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
    });

    await step('Select Freelance then reset to Any job type', async () => {
      await jobSearchPage.filterByJobType(JOB_TYPE_FREELANCE);
      await jobSearchPage.verifyResultCountContains(/of 1 job/i);
      await jobSearchPage.clearJobTypeFilter();
    });

    await step('Verify default job list is restored', async () => {
      await jobSearchPage.verifyJobsListed();
      await expect(page.getByTestId('jobs-result-count')).not.toContainText(/0 jobs found/i);
      await expect(page.getByTestId('jobs-result-count')).not.toContainText(/of 1 job/i);
    });
  });

  // Xray Issue Id 4 — positive apply + fit analysis (AC2 + AC3)
  test('DEV-3 TC4: apply to Freelance job with fit-analysis prompt', async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login, open Jobs, filter Freelance, open job', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_FREELANCE);
      await jobSearchPage.openJobCardContaining(JOB_TYPE_FREELANCE);
      await jobSearchPage.verifyJobDetailJobType(JOB_TYPE_FREELANCE);
    });

    await step('Apply with fit analysis (or verify already Applied)', async () => {
      if (await jobSearchPage.isAlreadyApplied()) {
        await jobSearchPage.verifyAppliedState();
      } else {
        await jobSearchPage.verifyFitAnalysisPrompt();
        await jobSearchPage.completeApplyWithNewResumeFromNudge();
        await jobSearchPage.verifyApplicationSubmitted();
      }
    });
  });

  // Xray Issue Id 5 — negative unauthenticated apply
  test('DEV-3 TC5: guest apply on Freelance job prompts Sign in', async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs as guest and filter Freelance', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_FREELANCE);
      await jobSearchPage.openFirstJobCard();
    });

    await step('Click Apply and verify login/profile prompt', async () => {
      await jobSearchPage.attemptGuestApplyAndVerifyLoginPrompt();
    });
  });

  // Xray Issue Id 6 — boundary already applied
  test('DEV-3 TC6: already applied Freelance job shows Applied state', async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login and open Freelance job detail', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_FREELANCE);
      await jobSearchPage.openJobCardContaining(JOB_TYPE_FREELANCE);
    });

    await step('Verify Applied state is shown after prior application', async () => {
      await jobSearchPage.verifyAppliedState();
    });
  });
});
