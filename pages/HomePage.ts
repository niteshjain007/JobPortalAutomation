import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the Job Search Portal home page (QaTestology).
 */
export class HomePage {
  private readonly page: Page;
  private readonly pageTitle: Locator;
  private readonly findJobsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Hero heading that uniquely identifies the home page
    this.pageTitle = page.getByRole('heading', {
      name: 'The career platform for QA & Automation talent.',
    });
    // Primary CTA for testers looking for QA roles
    this.findJobsButton = page.getByRole('button', { name: "I'm a tester — Find jobs" });
  }

  /** Navigates to the Job Search Portal home page. */
  async openHomePage() {
    await this.page.goto('/');
  }

  /** Verifies the home page hero title is displayed. */
  async verifyPageTitle() {
    await expect(this.pageTitle).toBeVisible();
  }

  /** Verifies the "Find jobs" CTA is displayed. */
  async verifyFindJobsButton() {
    await expect(this.findJobsButton).toBeVisible();
  }
}
