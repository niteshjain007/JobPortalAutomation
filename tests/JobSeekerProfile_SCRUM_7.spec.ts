import { test } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSeekerProfilePage } from '../pages/JobSeekerProfilePage';
import { CommonUtils } from '../utils/CommonUtils';

const SHORT_PHONE = '98765';
const MIN_VALID_PHONE = '900000';
const ELEVEN_DIGITS = '91234567890';
const TRUNCATED_TEN = ELEVEN_DIGITS.slice(0, 10);
const RESTORED_PHONE = '9876543210';

/** Builds a 10-digit India mobile that is different from the current value. */
function differentIndiaPhone(current: string): string {
  let next = `9${CommonUtils.getRandomNumber(9)}`;
  while (next === current) {
    next = `9${CommonUtils.getRandomNumber(9)}`;
  }
  return next;
}

async function loginAsDemoSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginAsDemoSeeker();
  await dashboardPage.verifyDashboardOpened();
}

async function signInAgainAndOpenProfile(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const profilePage = new JobSeekerProfilePage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.loginAsDemoSeeker();
  await dashboardPage.verifyDashboardOpened();
  await profilePage.navigateToProfilePage();
  return profilePage;
}

test.describe('SCRUM-7 | Phone number change for demo seeker', () => {
  // Shared public demo account — profile writes must not run in parallel
  test.describe.configure({ mode: 'serial' });

  // Xray Issue Id 1 — positive: AC happy path across logout and login
  test('SCRUM-7 TC1: demo seeker sees updated phone after logout and login', { tag: ['@smoke', '@regression'] }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);
    let updatedPhone = '';

    await step('Sign in with the Job Seeker demo account', async () => {
      await loginAsDemoSeeker(page);
    });

    await step('Open My profile and save a new India phone', async () => {
      await profilePage.navigateToProfilePage();
      await profilePage.verifyIndiaCountrySelected();
      updatedPhone = differentIndiaPhone(await profilePage.getPhoneNumberValue());
      await profilePage.updateIndiaPhoneNumber(updatedPhone);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(updatedPhone);
    });

    await step('Log out', async () => {
      await dashboardPage.logout();
    });

    await step('Sign in again and verify the new phone on My profile', async () => {
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifyIndiaCountrySelected();
      await profileAfterLogin.verifyPhoneNumberValue(updatedPhone);
    });
  });

  // Xray Issue Id 2 — positive: value is visible on My profile after refresh
  test('SCRUM-7 TC2: updated phone is shown on My profile after refresh', { tag: '@regression' }, async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    let updatedPhone = '';

    await step('Sign in as demo seeker and open My profile', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Save a different 10-digit India phone', async () => {
      updatedPhone = differentIndiaPhone(await profilePage.getPhoneNumberValue());
      await profilePage.updateIndiaPhoneNumber(updatedPhone);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(updatedPhone);
    });

    await step('Refresh and verify the new phone is still shown', async () => {
      await profilePage.verifyPhonePersistedAfterRefresh(updatedPhone);
    });
  });

  // Xray Issue Id 3 — positive: a second number replaces the first across login
  test('SCRUM-7 TC3: phone changes from one number to another', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);
    let phoneA = '';
    let phoneB = '';

    await step('Sign in as demo seeker and save phone A', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      phoneA = differentIndiaPhone(await profilePage.getPhoneNumberValue());
      await profilePage.updateIndiaPhoneNumber(phoneA);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(phoneA);
    });

    await step('Change the phone to a different number B and save', async () => {
      phoneB = differentIndiaPhone(phoneA);
      await profilePage.updateIndiaPhoneNumber(phoneB);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(phoneB);
    });

    await step('Log out, sign in again, and verify phone B is shown', async () => {
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifyPhoneNumberValue(phoneB);
    });
  });

  // Xray Issue Id 4 — negative: guest
  test('SCRUM-7 TC4: guest cannot change the phone number', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Open /profile without signing in', async () => {
      await profilePage.openProfileUrl();
    });

    await step('Verify redirect to login and no phone field', async () => {
      await loginPage.verifyLoginUrl();
      await profilePage.verifyPhoneFieldNotShown();
    });
  });

  // Xray Issue Id 5 — negative: invalid length is not stored
  test('SCRUM-7 TC5: short phone is rejected and previous number remains after login', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);
    const validPhone = differentIndiaPhone('');

    await step('Sign in as demo seeker and save a valid 10-digit phone', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateIndiaPhoneNumber(validPhone);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(validPhone);
    });

    await step('Save a 5-digit phone and verify it is rejected', async () => {
      await profilePage.updateIndiaPhoneNumber(SHORT_PHONE);
      await profilePage.verifyInvalidPhoneError();
    });

    await step('Log out, sign in again, and verify the valid phone is unchanged', async () => {
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifyPhoneNumberValue(validPhone);
    });
  });

  // Xray Issue Id 6 — negative: employer role
  test('SCRUM-7 TC6: demo employer cannot edit the seeker phone', { tag: '@regression' }, async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in with the Employer demo account', async () => {
      await loginPage.navigateToLoginPage();
      await loginPage.loginAsDemoEmployer();
      await dashboardPage.verifyEmployerDashboardOpened();
    });

    await step('Open /profile', async () => {
      await profilePage.openProfileUrl();
    });

    await step('Verify employer stays on the Employer Dashboard without a phone field', async () => {
      await dashboardPage.verifyEmployerDashboardOpened();
      await profilePage.verifyPhoneFieldNotShown();
    });
  });

  // Xray Issue Id 7 — boundary: minimum accepted length is 6 digits (5 is rejected)
  test('SCRUM-7 TC7: shortest accepted phone persists after logout and login', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and save a 6-digit phone', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateIndiaPhoneNumber(MIN_VALID_PHONE);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(MIN_VALID_PHONE);
    });

    await step('Log out, sign in again, and verify the 6-digit phone', async () => {
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifyPhoneNumberValue(MIN_VALID_PHONE);
    });
  });

  // Xray Issue Id 8 — boundary: maxlength drops the 11th digit
  test('SCRUM-7 TC8: eleventh digit is dropped and 10 digits persist after login', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);

    await step('Sign in as demo seeker and open My profile', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Type 11 digits and save the 10 digits the field keeps', async () => {
      await profilePage.selectIndiaCountry();
      await profilePage.typePhoneNumber(ELEVEN_DIGITS);
      await profilePage.verifyPhoneNumberValue(TRUNCATED_TEN);
      await profilePage.saveProfile();
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue(TRUNCATED_TEN);
    });

    await step('Log out, sign in again, and verify the truncated phone', async () => {
      await dashboardPage.logout();
      const profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifyPhoneNumberValue(TRUNCATED_TEN);
    });
  });

  // Xray Issue Id 9 — boundary: whitespace stored as empty, then restore
  test('SCRUM-7 TC9: whitespace phone saves as empty and stays empty after login', { tag: '@regression' }, async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const profilePage = new JobSeekerProfilePage(page);
    let profileAfterLogin = profilePage;

    await step('Sign in as demo seeker and save a whitespace-only phone', async () => {
      await loginAsDemoSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateIndiaPhoneNumber('          ');
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue('');
    });

    await step('Log out, sign in again, and verify the phone is still empty', async () => {
      await dashboardPage.logout();
      profileAfterLogin = await signInAgainAndOpenProfile(page);
      await profileAfterLogin.verifyPhoneNumberValue('');
    });

    await step('Restore a 10-digit India phone for the shared demo account', async () => {
      await profileAfterLogin.updateIndiaPhoneNumber(RESTORED_PHONE);
      await profileAfterLogin.verifyProfileSaved();
      await profileAfterLogin.verifyPhonePersistedAfterRefresh(RESTORED_PHONE);
    });
  });
});
