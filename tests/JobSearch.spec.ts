import { step } from 'allure-js-commons';
import { test } from '../fixtures/baseFixture';
import { JobSearchPage } from '../pages/JobSearchPage';

test.describe('Job Search Page', () => {
  test('should search jobs by title and show Performance Test Engineer', { tag: ['@smoke', '@regression'] }, async ({ page, testData }) => {
    const jobSearchPage = new JobSearchPage(page);
    const jobTitle = testData.jobTitles.valid[1];

    await step('Navigate to the Jobs page from the portal', async () => {
      await jobSearchPage.navigateToJobsPage();
      await page.waitForTimeout(5000);
    });

    await step(`Search for jobs using title "${jobTitle}"`, async () => {
      await jobSearchPage.searchByTitle(jobTitle);
      await page.waitForTimeout(5000);
    });

    await step('Verify "Performance Test Engineer" appears in the job results', async () => {
      await jobSearchPage.verifyJobPresentInList('Performance Test Engineer');
    });
  });
});
