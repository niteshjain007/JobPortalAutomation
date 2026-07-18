import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the Sign Up page.
 */
export class SignUpPage {
  private readonly page: Page;
  private readonly getStartedButton: Locator;
  private readonly nameInput: Locator;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly createAccountButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Header Get started button on the home page
    this.getStartedButton = page.getByTestId('header-signup-btn');
    // Sign up form fields
    this.nameInput = page.getByTestId('signup-name-input');
    this.emailInput = page.getByTestId('signup-email-input');
    this.passwordInput = page.getByTestId('signup-password-input');
    this.createAccountButton = page.getByTestId('signup-submit-btn');
  }

  /** Opens the Sign Up page by clicking Get started on the home page. */
  async navigateToSignUpPage() {
    await this.page.goto('/');
    await this.getStartedButton.click();
  }

  /** Verifies the current URL contains "signup". */
  async verifySignUpUrl() {
    await expect(this.page).toHaveURL(/signup/);
  }

  /** Clicks Create account without filling name, email, or password. */
  async clickCreateAccount() {
    await this.createAccountButton.click();
  }

  /** Verifies the required-field validation message is shown on the name input. */
  async verifyRequiredFieldMessage() {
    await expect(this.nameInput).toHaveJSProperty(
      'validationMessage',
      'Please fill out this field.',
    );
  }
}
