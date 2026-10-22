import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSearchPage } from '../pages/JobSearchPage';

const VALID_EMAIL = 'Jobseeker2807@yopmail.com';
const VALID_PASSWORD = 'Test@123';
const JOB_TYPE_CONTRACT = 'Contract';
const JOB_TYPE_FULL_TIME = 'Full-time';
const MATCHING_KEYWORD = 'QA Engineer';
const NON_MATCHING_KEYWORD = 'nomatch-xyz123';

async function loginAsJobSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  await dashboardPage.verifyDashboardOpened();
}

test.describe('SCRUM-5 | Contractual job search', () => {
  // Xray Issue Id 1 — positive guest contract filter
  test('SCRUM-5 TC1: guest filters jobs by Job type Contract', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs page as guest', async () => {
      await jobSearchPage.openJobsPage();
    });

    await step(`Filter by Job type "${JOB_TYPE_CONTRACT}"`, async () => {
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
    });

    await step('Verify only Contract jobs are listed', async () => {
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });
  });

  // Xray Issue Id 2 — positive registered user contract filter
  test('SCRUM-5 TC2: Job Seeker filters jobs by Job type Contract', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Login as Job Seeker and open Jobs', async () => {
      await loginAsJobSeeker(page);
      await jobSearchPage.openJobsPage();
    });

    await step(`Filter by Job type "${JOB_TYPE_CONTRACT}"`, async () => {
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
    });

    await step('Verify only Contract jobs are listed', async () => {
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });
  });

  // Xray Issue Id 3 — positive contract filter + keyword
  test('SCRUM-5 TC3: Contract filter combined with keyword search', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs and filter by Contract', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });

    await step(`Search keyword "${MATCHING_KEYWORD}"`, async () => {
      await jobSearchPage.searchByTitle(MATCHING_KEYWORD);
    });

    await step('Verify results are still Contract jobs only', async () => {
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });
  });

  // Xray Issue Id 4 — negative contract filter + non-matching keyword
  test('SCRUM-5 TC4: Contract filter with non-matching keyword shows empty state', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs and filter by Contract', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
    });

    await step(`Search keyword "${NON_MATCHING_KEYWORD}"`, async () => {
      await jobSearchPage.searchByTitle(NON_MATCHING_KEYWORD);
    });

    await step('Verify empty results / no-match message', async () => {
      await jobSearchPage.verifyNoJobsMatchFilters();
    });
  });

  // Xray Issue Id 5 — negative other job type excludes Contract
  test('SCRUM-5 TC5: Full-time filter excludes Contract jobs', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step(`Open Jobs and filter by "${JOB_TYPE_FULL_TIME}"`, async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_FULL_TIME);
    });

    await step('Verify no Contract job is listed', async () => {
      await jobSearchPage.verifyNoListedJobHasType(JOB_TYPE_CONTRACT);
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_FULL_TIME);
    });
  });

  // Xray Issue Id 6 — boundary reset filter
  test('SCRUM-5 TC6: reset Job type to Any after Contract', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs and filter by Contract', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });

    await step('Reset Job type to Any job type', async () => {
      await jobSearchPage.clearJobTypeFilter();
    });

    await step('Verify jobs of other types are listed again', async () => {
      await jobSearchPage.verifyJobsOfOtherTypesListed(JOB_TYPE_CONTRACT);
    });
  });

  // Xray Issue Id 7 — boundary whitespace keyword
  test('SCRUM-5 TC7: whitespace keyword keeps Contract results', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs and filter by Contract', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
    });

    await step('Search with whitespace-only keyword', async () => {
      await jobSearchPage.searchByTitle('   ');
    });

    await step('Verify Contract jobs are still listed', async () => {
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });
  });

  // Xray Issue Id 8 — positive contract job detail
  test('SCRUM-5 TC8: Contract job detail shows job type Contract', { tag: '@regression' }, async ({ page }) => {
    const jobSearchPage = new JobSearchPage(page);

    await step('Open Jobs and filter by Contract', async () => {
      await jobSearchPage.openJobsPage();
      await jobSearchPage.filterByJobType(JOB_TYPE_CONTRACT);
      await jobSearchPage.verifyAllListedJobsHaveType(JOB_TYPE_CONTRACT);
    });

    await step('Open the first Contract job', async () => {
      await jobSearchPage.openJobCardContaining(JOB_TYPE_CONTRACT);
    });

    await step('Verify job detail shows Contract', async () => {
      await jobSearchPage.verifyJobDetailJobType(JOB_TYPE_CONTRACT);
    });
  });
});
