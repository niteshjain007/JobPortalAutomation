import { test } from '@playwright/test';
import { SignUpPage } from '../pages/SignUpPage';

test.describe('Sign Up Page', () => {
  test('should show required field message when Create account is clicked with empty fields', async ({
    page,
  }) => {
    const signUpPage = new SignUpPage(page);

    // Open signup via Get started, submit empty form, and assert validation
    await signUpPage.navigateToSignUpPage();
    await page.waitForTimeout(5000);

    await signUpPage.verifySignUpUrl();
    await page.waitForTimeout(5000);

    await signUpPage.clickCreateAccount();
    await page.waitForTimeout(5000);

    await signUpPage.verifyRequiredFieldMessage();
  });
});
