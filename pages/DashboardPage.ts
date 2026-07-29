import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the job seeker Dashboard (post-login).
 */
export class DashboardPage {
  private readonly page: Page;
  private readonly testerDashboardLabel: Locator;
  private readonly userMenuButton: Locator;
  private readonly editProfileButton: Locator;
  private readonly logoutMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;
    // Role banner unique to the authenticated tester dashboard
    this.testerDashboardLabel = page.getByText('TESTER DASHBOARD');
    // Header avatar/name menu used for account actions including logout
    this.userMenuButton = page.getByTestId('user-menu-btn');
    // Primary dashboard CTA confirming the page loaded
    this.editProfileButton = page.getByTestId('dash-edit-profile-btn');
    // Logout action exposed from the user menu
    this.logoutMenuItem = page.getByRole('menuitem', { name: /log\s*out|sign\s*out/i }).or(
      page.getByRole('button', { name: /log\s*out|sign\s*out/i }),
    ).or(page.getByText(/log\s*out|sign\s*out/i));
  }

  /** Verifies the current URL is the Dashboard. */
  async verifyDashboardUrl() {
    await expect(this.page).toHaveURL(/dashboard/);
  }

  /** Verifies Dashboard title and key authenticated UI are visible. */
  async verifyDashboardOpened() {
    await this.verifyDashboardUrl();
    await expect(this.page).toHaveTitle(/Dashboard/i);
    await expect(this.testerDashboardLabel).toBeVisible();
    await expect(this.userMenuButton).toBeVisible();
    await expect(this.editProfileButton).toBeVisible();
  }

  /** Logs out via the user menu. */
  async logout() {
    await this.userMenuButton.click();
    await this.logoutMenuItem.first().click();
  }
}
