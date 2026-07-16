import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the Job Search / Jobs listing page.
 */
export class JobSearchPage {
  private readonly page: Page;
  private readonly pageTitle: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly jobsList: Locator;
  private readonly jobsNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    // Jobs page heading
    this.pageTitle = page.getByRole('heading', { name: 'QA & Automation jobs' });
    // Search field used to filter jobs by title, skill, or company
    this.searchInput = page.getByTestId('jobs-search-input');
    this.searchButton = page.getByTestId('jobs-search-btn');
    // Container holding the filtered job cards
    this.jobsList = page.getByTestId('jobs-list');
    // Header navigation link to open the Jobs page
    this.jobsNavLink = page.getByTestId('nav-jobs');
  }

  /** Opens the Jobs page using the header navigation. */
  async navigateToJobsPage() {
    await this.page.goto('/');
    await this.jobsNavLink.click();
    await expect(this.pageTitle).toBeVisible();
  }

  /** Searches the job list by title (or skill / company). */
  async searchByTitle(title: string) {
    await this.searchInput.fill(title);
    await this.searchButton.click();
  }

  /** Verifies that a job with the given title is present in the results list. */
  async verifyJobPresentInList(jobTitle: string) {
    const jobCard = this.jobsList.getByText(jobTitle, { exact: true });
    await expect(jobCard).toBeVisible();
  }
}
