import { test } from '../fixtures/baseFixture';
import { JobSearchPage } from '../pages/JobSearchPage';

test.describe('Job Search Page', () => {
  test('should search jobs by title and show Performance Test Engineer', async ({ page, testData }) => {
    const jobSearchPage = new JobSearchPage(page);
    const jobTitle = testData.jobTitles.valid[1];

    // Navigate to Jobs, search by title, and confirm the expected role appears
    await jobSearchPage.navigateToJobsPage();
    await page.waitForTimeout(5000);

    await jobSearchPage.searchByTitle(jobTitle);
    await page.waitForTimeout(5000);

    await jobSearchPage.verifyJobPresentInList('Performance Test Engineer');
  });
});
