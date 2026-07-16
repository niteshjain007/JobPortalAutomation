import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the Login / Sign in page.
 */
export class LoginPage {
  private readonly page: Page;
  private readonly signInNavButton: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly invalidCredentialsError: Locator;

  constructor(page: Page) {
    this.page = page;
    // Header Sign in button on the home page
    this.signInNavButton = page.getByTestId('header-login-btn');
    // Login form fields
    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.signInButton = page.getByTestId('login-submit-btn');
    // Error shown after failed login
    this.invalidCredentialsError = page.getByText('Invalid credentials');
  }

  /** Opens the Login page by clicking Sign in on the home page. */
  async navigateToLoginPage() {
    await this.page.goto('/');
    await this.signInNavButton.click();
  }

  /** Verifies the current URL contains "login". */
  async verifyLoginUrl() {
    await expect(this.page).toHaveURL(/login/);
  }

  /** Fills email and password, then clicks Sign in. */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  /** Verifies the "Invalid credentials" error message is displayed. */
  async verifyInvalidCredentialsError() {
    await expect(this.invalidCredentialsError).toBeVisible();
  }
}
