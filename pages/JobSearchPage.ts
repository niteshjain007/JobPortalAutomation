import { type Locator, type Page, expect } from '@playwright/test';
import path from 'path';

/**
 * Page Object for the Job Search / Jobs listing and job-detail apply flow.
 */
export class JobSearchPage {
  private readonly page: Page;
  private readonly pageTitle: Locator;
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly locationFilter: Locator;
  private readonly jobsList: Locator;
  private readonly jobsResultCount: Locator;
  private readonly jobsNavLink: Locator;
  private readonly noJobsMessage: Locator;
  private readonly applyJobButton: Locator;
  private readonly applyNudgeDialog: Locator;
  private readonly skipAndApplyButton: Locator;
  private readonly resumeChoiceDialog: Locator;
  private readonly resumeChoiceNew: Locator;
  private readonly resumeFileInput: Locator;
  private readonly resumeSubmitButton: Locator;
  private readonly applicationSubmittedToast: Locator;
  private readonly guestApplyDialogText: Locator;

  constructor(page: Page) {
    this.page = page;
    // Jobs page heading
    this.pageTitle = page.getByRole('heading', { name: 'QA & Automation jobs' });
    // Search field used to filter jobs by title, skill, or company
    this.searchInput = page.getByTestId('jobs-search-input');
    this.searchButton = page.getByTestId('jobs-search-btn');
    // Location filter (AC for DEV-2)
    this.locationFilter = page.getByTestId('filter-location');
    // Container holding the filtered job cards
    this.jobsList = page.getByTestId('jobs-list');
    this.jobsResultCount = page.getByTestId('jobs-result-count');
    // Header navigation link to open the Jobs page
    this.jobsNavLink = page.getByTestId('nav-jobs');
    this.noJobsMessage = page.getByText('No jobs match your filters');
    // Job detail apply controls
    this.applyJobButton = page.getByTestId('apply-job-btn');
    this.applyNudgeDialog = page.getByTestId('apply-nudge-dialog');
    this.skipAndApplyButton = page.getByTestId('nudge-skip-apply-btn');
    this.resumeChoiceDialog = page.getByTestId('apply-resume-choice-dialog');
    this.resumeChoiceNew = page.getByTestId('resume-choice-new');
    this.resumeFileInput = page.getByTestId('resume-choice-file-input');
    this.resumeSubmitButton = page.getByTestId('resume-choice-submit');
    this.applicationSubmittedToast = page.getByText('Application submitted!');
    this.guestApplyDialogText = page.getByText(/you need a QaTestology tester profile|Sign in/i);
  }

  /** Opens the Jobs page using the header navigation. */
  async navigateToJobsPage() {
    await this.page.goto('/');
    await this.jobsNavLink.click();
    await expect(this.pageTitle).toBeVisible();
  }

  /** Opens Jobs while already authenticated (direct URL). */
  async openJobsPage() {
    await this.page.goto('/jobs');
    await expect(this.locationFilter).toBeVisible();
  }

  /** Searches the job list by title (or skill / company). */
  async searchByTitle(title: string) {
    await this.searchInput.fill(title);
    await this.searchButton.click();
  }

  /** Filters jobs by location and clicks Search. */
  async filterByLocation(location: string) {
    await this.locationFilter.fill(location);
    await this.searchButton.click();
  }

  /** Clears location filter and searches (default/unfiltered list). */
  async clearLocationAndSearch() {
    await this.locationFilter.fill('');
    await this.searchButton.click();
  }

  /** Verifies that a job with the given title is present in the results list. */
  async verifyJobPresentInList(jobTitle: string) {
    const jobCard = this.jobsList.getByText(jobTitle, { exact: true });
    await expect(jobCard).toBeVisible();
  }

  /** Verifies result count text contains the expected fragment (e.g. "of 1 job"). */
  async verifyResultCountContains(text: string | RegExp) {
    await expect(this.jobsResultCount).toContainText(text);
  }

  /** Verifies empty filter state for invalid/no-match location. */
  async verifyNoJobsMatchFilters() {
    await expect(this.jobsResultCount).toContainText(/0 jobs found/i);
    await expect(this.noJobsMessage).toBeVisible();
    await expect(this.page.locator('[data-testid^="job-card-"]')).toHaveCount(0);
  }

  /** Verifies at least one job card is listed. */
  async verifyJobsListed() {
    await expect(this.page.locator('[data-testid^="job-card-"]').first()).toBeVisible();
  }

  /** Opens the first job card in the current results. */
  async openFirstJobCard() {
    await this.page.locator('[data-testid^="job-card-"]').first().click();
    await expect(this.page).toHaveURL(/\/jobs\/job_/);
  }

  /** Opens a job card that contains the given text (title or location). */
  async openJobCardContaining(text: string) {
    await this.page.locator('[data-testid^="job-card-"]').filter({ hasText: text }).first().click();
    await expect(this.page).toHaveURL(/\/jobs\/job_/);
  }

  /** Verifies job detail shows the expected location. */
  async verifyJobDetailLocation(location: string) {
    await expect(this.page.getByText(location, { exact: true }).first()).toBeVisible();
  }

  /** Returns true when the job is already in Applied state. */
  async isAlreadyApplied(): Promise<boolean> {
    const label = (await this.applyJobButton.textContent())?.trim() ?? '';
    return /applied/i.test(label);
  }

  /** Verifies Apply button shows Applied. */
  async verifyAppliedState() {
    await expect(this.applyJobButton).toContainText(/applied/i);
  }

  /**
   * Completes apply: Apply now → Skip & apply → upload resume → Submit.
   * Uses fixtures/sample-resume.pdf by default.
   */
  async applyWithNewResume(resumeFilePath?: string) {
    const filePath =
      resumeFilePath ?? path.join(process.cwd(), 'fixtures', 'sample-resume.pdf');

    await this.applyJobButton.click();
    await expect(this.applyNudgeDialog).toBeVisible();
    await this.skipAndApplyButton.click();
    await expect(this.resumeChoiceDialog).toBeVisible();
    await this.resumeChoiceNew.click();
    await this.resumeFileInput.setInputFiles(filePath);
    await expect(this.resumeSubmitButton).toBeEnabled();
    await this.resumeSubmitButton.click();
  }

  /** Verifies application success toast and Applied button. */
  async verifyApplicationSubmitted() {
    await expect(this.applicationSubmittedToast).toBeVisible({ timeout: 15000 });
    await this.verifyAppliedState();
  }

  /**
   * Guest/unauthenticated apply: expect sign-in / create profile prompt.
   */
  async attemptGuestApplyAndVerifyLoginPrompt() {
    await this.applyJobButton.click();
    await expect(this.guestApplyDialogText.first()).toBeVisible({ timeout: 10000 });
  }
}
