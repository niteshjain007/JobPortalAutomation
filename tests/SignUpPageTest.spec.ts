import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { SignUpPage } from '../pages/SignUpPage';

test.describe('Sign Up Page', () => {
  test('should show required field message when Create account is clicked with empty fields', async ({
    page,
  }) => {
    const signUpPage = new SignUpPage(page);

    await step('Click Get started on the home page to open Sign Up', async () => {
      await signUpPage.navigateToSignUpPage();
      await page.waitForTimeout(5000);
    });

    await step('Verify the user is on the Sign Up page', async () => {
      await signUpPage.verifySignUpUrl();
      await page.waitForTimeout(5000);
    });

    await step('Click Create account without entering name, email, or password', async () => {
      await signUpPage.clickCreateAccount();
      await page.waitForTimeout(5000);
    });

    await step('Verify "Please fill out this field" validation message is shown', async () => {
      await signUpPage.verifyRequiredFieldMessage();
    });
  });
});
