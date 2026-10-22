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
  private readonly demoSeekerButton: Locator;
  private readonly demoEmployerButton: Locator;

  /** Public sandbox accounts listed in the login page's "Demo accounts" card. */
  static readonly DEMO_SEEKER_EMAIL = 'demo.seeker@qatestology.com';
  static readonly DEMO_EMPLOYER_EMAIL = 'demo.employer@qatestology.com';
  static readonly DEMO_PASSWORD = 'Demo@1234';

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
    // "Demo accounts" card buttons that prefill email + password
    this.demoSeekerButton = page.getByTestId('demo-fill-seeker');
    this.demoEmployerButton = page.getByTestId('demo-fill-employer');
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

  /** Fills email and password, then clicks Sign in. Skips fill for empty values (avoids hang on password). */
  async login(email: string, password: string) {
    if (email.length > 0) {
      await this.emailInput.fill(email);
    }
    if (password.length > 0) {
      await this.passwordInput.fill(password);
    }
    await this.signInButton.click();
  }

  /** Uses the "Job Seeker" demo account button, checks the prefilled email, and signs in. */
  async loginAsDemoSeeker() {
    await this.signInWithDemoAccount(this.demoSeekerButton, LoginPage.DEMO_SEEKER_EMAIL);
  }

  /** Uses the "Employer" demo account button, checks the prefilled email, and signs in. */
  async loginAsDemoEmployer() {
    await this.signInWithDemoAccount(this.demoEmployerButton, LoginPage.DEMO_EMPLOYER_EMAIL);
  }

  private async signInWithDemoAccount(demoButton: Locator, expectedEmail: string) {
    await demoButton.click();
    await expect(this.emailInput).toHaveValue(expectedEmail);
    await expect(this.passwordInput).toHaveValue(LoginPage.DEMO_PASSWORD);
    await this.signInButton.click();
  }

  /** Verifies the "Invalid credentials" error message is displayed. */
  async verifyInvalidCredentialsError() {
    await expect(this.invalidCredentialsError).toBeVisible();
  }

  /** Verifies HTML5 required-field validation on the email input. */
  async verifyRequiredEmailMessage() {
    await expect(this.emailInput).toHaveJSProperty(
      'validationMessage',
      'Please fill out this field.',
    );
  }

  /** Verifies HTML5 required-field validation on the password input. */
  async verifyRequiredPasswordMessage() {
    await expect(this.passwordInput).toHaveJSProperty(
      'validationMessage',
      'Please fill out this field.',
    );
  }

  /** Submits the login form without filling fields (for empty-field cases). */
  async clickSignIn() {
    await this.signInButton.click();
  }

  /** Verifies the user remains on the login page (no Dashboard redirect). */
  async verifyStillOnLoginPage() {
    await expect(this.page).toHaveURL(/login/);
  }
}
