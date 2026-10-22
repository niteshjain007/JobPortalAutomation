import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the Job Search Portal home page (QaTestology).
 */
export class HomePage {
  private readonly page: Page;
  private readonly pageTitle: Locator;
  private readonly findJobsButton: Locator;
  private readonly jobsNavLink: Locator;
  private readonly aboutNavLink: Locator;
  private readonly contactNavLink: Locator;
  private readonly signInButton: Locator;
  private readonly getStartedButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Hero heading that uniquely identifies the home page
    this.pageTitle = page.getByRole('heading', {
      name: 'The career platform for QA & Automation talent.',
    });
    // Primary CTA for testers looking for QA roles
    this.findJobsButton = page.getByRole('button', { name: "I'm a tester — Find jobs" });
    // Header navigation (DEV-4: visible for unregistered guests)
    this.jobsNavLink = page.getByTestId('nav-jobs');
    this.aboutNavLink = page.getByTestId('nav-about');
    this.contactNavLink = page.getByTestId('nav-contact');
    this.signInButton = page.getByTestId('header-login-btn');
    this.getStartedButton = page.getByTestId('header-signup-btn');
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

  /**
   * DEV-4 AC1: Jobs, About, and Contact header links are visible for a guest.
   * Uses stable data-testid locators on the shared header.
   */
  async verifyGuestNavLinksVisible() {
    await expect(this.jobsNavLink).toBeVisible();
    await expect(this.jobsNavLink).toHaveText(/jobs/i);
    await expect(this.aboutNavLink).toBeVisible();
    await expect(this.aboutNavLink).toHaveText(/about/i);
    await expect(this.contactNavLink).toBeVisible();
    await expect(this.contactNavLink).toHaveText(/contact/i);
  }

  /** Verifies guest chrome (Sign in / Get started) is present — not authenticated. */
  async verifyGuestHeaderActionsVisible() {
    await expect(this.signInButton).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
  }

  /** Clicks Jobs in the header and expects /jobs. */
  async navigateToJobsViaNav() {
    await this.jobsNavLink.click();
    await expect(this.page).toHaveURL(/\/jobs\/?$/);
  }

  /** Clicks About in the header and expects /about. */
  async navigateToAboutViaNav() {
    await this.aboutNavLink.click();
    await expect(this.page).toHaveURL(/\/about\/?$/);
  }

  /** Clicks Contact in the header and expects /contact. */
  async navigateToContactViaNav() {
    await this.contactNavLink.click();
    await expect(this.page).toHaveURL(/\/contact\/?$/);
  }
}
