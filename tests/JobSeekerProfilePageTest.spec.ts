import { test, expect } from '@playwright/test';
import { step } from 'allure-js-commons';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobSeekerProfilePage } from '../pages/JobSeekerProfilePage';
import { CommonUtils } from '../utils/CommonUtils';

const VALID_EMAIL = 'Jobseeker2807@yopmail.com';
const VALID_PASSWORD = 'Test@123';

/** Builds a random 10-digit Indian mobile starting with 9. */
function randomIndiaPhone(): string {
  return `9${CommonUtils.getRandomNumber(9)}`;
}

async function loginAsJobSeeker(page: import('@playwright/test').Page) {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  await loginPage.navigateToLoginPage();
  await loginPage.login(VALID_EMAIL, VALID_PASSWORD);
  await dashboardPage.verifyDashboardOpened();
}

test.describe('Job Seeker Profile Page — Update India phone', () => {
  // Shared job-seeker account — must not run in parallel
  test.describe.configure({ mode: 'serial' });

  // TC-PROFILE-001
  test('TC-PROFILE-001: profile page opens for authenticated job seeker', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker', async () => {
      await loginAsJobSeeker(page);
    });

    await step('Open the Job Seeker Profile page', async () => {
      await profilePage.navigateToProfilePage();
    });

    await step('Verify profile page and phone fields are visible', async () => {
      await profilePage.verifyProfilePageOpened();
    });
  });

  // TC-PROFILE-002
  test('TC-PROFILE-002: update India phone and see value after refresh', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const newPhone = randomIndiaPhone();

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.verifyProfilePageOpened();
    });

    await step(`Select India (+91) and update phone to ${newPhone}`, async () => {
      await profilePage.updateIndiaPhoneNumber(newPhone);
    });

    await step('Verify Profile saved toast is shown', async () => {
      await profilePage.verifyProfileSaved();
      await profilePage.verifyIndiaCountrySelected();
      await profilePage.verifyPhoneNumberValue(newPhone);
    });

    await step('Refresh the page and verify updated phone is still visible', async () => {
      await profilePage.verifyPhonePersistedAfterRefresh(newPhone);
    });
  });

  // TC-PROFILE-003
  test('TC-PROFILE-003: empty phone is optional and can be saved', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India, clear phone, and save', async () => {
      await profilePage.updateIndiaPhoneNumber('');
    });

    await step('Verify profile saves with empty phone (field is optional)', async () => {
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue('');
    });

    await step('Refresh and verify empty phone persists', async () => {
      await profilePage.verifyPhonePersistedAfterRefresh('');
    });
  });

  // TC-PROFILE-004
  test('TC-PROFILE-004: phone shorter than 10 digits is rejected', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India and enter a short phone number, then save', async () => {
      await profilePage.updateIndiaPhoneNumber('98765');
    });

    await step('Verify invalid phone validation is displayed', async () => {
      await profilePage.verifyInvalidPhoneError();
    });
  });

  // TC-PROFILE-005
  test('TC-PROFILE-005: input maxlength blocks more than 10 digits', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const elevenDigits = '98765432101';
    const truncatedTen = elevenDigits.slice(0, 10);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India and type 11 digits into phone field', async () => {
      await profilePage.selectIndiaCountry();
      await profilePage.typePhoneNumber(elevenDigits);
    });

    await step('Verify field keeps only first 10 digits (maxlength=10)', async () => {
      await profilePage.verifyPhoneNumberValue(truncatedTen);
    });
  });

  // TC-PROFILE-006
  test('TC-PROFILE-006: non-numeric characters are not accepted in phone field', async ({
    page,
  }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India and type alphabetic characters into phone', async () => {
      await profilePage.selectIndiaCountry();
      await profilePage.typePhoneNumber('abcdefghij');
    });

    await step('Verify phone field rejects letters and stays empty', async () => {
      await profilePage.verifyPhoneNumberValue('');
    });
  });

  // TC-PROFILE-007
  test('TC-PROFILE-007: special characters are stripped from phone field', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India and type phone with hyphen and symbols', async () => {
      await profilePage.selectIndiaCountry();
      await profilePage.typePhoneNumber('98-765-43210');
    });

    await step('Verify only digits remain (max 10)', async () => {
      await profilePage.verifyPhoneNumberValue('9876543210');
    });
  });

  // TC-PROFILE-008
  test('TC-PROFILE-008: whitespace-only phone is treated as empty and can be saved', async ({
    page,
  }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India and enter spaces only, then save', async () => {
      await profilePage.updateIndiaPhoneNumber('          ');
    });

    await step('Verify profile saves with empty phone', async () => {
      await profilePage.verifyProfileSaved();
      await profilePage.verifyPhoneNumberValue('');
    });
  });

  // TC-PROFILE-009
  test('TC-PROFILE-009: boundary — exactly 10 digits is accepted and persists', async ({
    page,
  }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const boundaryPhone = '9000000001';

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Select India and save exactly 10-digit phone', async () => {
      await profilePage.updateIndiaPhoneNumber(boundaryPhone);
      await profilePage.verifyProfileSaved();
    });

    await step('Refresh and verify phone persists', async () => {
      await profilePage.verifyPhonePersistedAfterRefresh(boundaryPhone);
    });
  });

  // TC-PROFILE-010
  test('TC-PROFILE-010: invalid phone is not persisted after refresh', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const validPhone = randomIndiaPhone();
    const invalidPhone = '123';

    await step('Log in, open profile, and save a valid India phone first', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
      await profilePage.updateIndiaPhoneNumber(validPhone);
      await profilePage.verifyProfileSaved();
    });

    await step('Attempt to save an invalid short phone', async () => {
      await profilePage.updateIndiaPhoneNumber(invalidPhone);
      await profilePage.verifyInvalidPhoneError();
    });

    await step('Refresh and verify previous valid phone is still shown', async () => {
      await profilePage.verifyPhonePersistedAfterRefresh(validPhone);
    });
  });
});

test.describe('Job Seeker Profile Page — Edit city (Mumbai / Pune)', () => {
  // Shared job-seeker account — must not run in parallel with other profile writes
  test.describe.configure({ mode: 'serial' });

  // TC-CITY-001
  test('TC-CITY-001: Location field is visible on profile page', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Verify Location field is visible and editable', async () => {
      await profilePage.verifyProfilePageOpened();
    });
  });

  // TC-CITY-002
  test('TC-CITY-002: update city to Mumbai and see value after refresh', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const city = 'Mumbai';

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step(`Update Location to ${city} and save`, async () => {
      await profilePage.updateCity(city);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityValue(city);
    });

    await step('Refresh and verify Mumbai is still visible', async () => {
      await profilePage.verifyCityPersistedAfterRefresh(city);
    });
  });

  // TC-CITY-003
  test('TC-CITY-003: update city to Pune and see value after refresh', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);
    const city = 'Pune';

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step(`Update Location to ${city} and save`, async () => {
      await profilePage.updateCity(city);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityValue(city);
    });

    await step('Refresh and verify Pune is still visible', async () => {
      await profilePage.verifyCityPersistedAfterRefresh(city);
    });
  });

  // TC-CITY-004
  test('TC-CITY-004: switch city between Mumbai and Pune', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    const currentCity = await profilePage.getCityValue();
    const nextCity = JobSeekerProfilePage.otherAllowedCity(currentCity);

    await step(`Change Location from "${currentCity}" to "${nextCity}" and save`, async () => {
      await profilePage.updateCity(nextCity);
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityValue(nextCity);
    });

    await step('Refresh and verify switched city persists', async () => {
      await profilePage.verifyCityPersistedAfterRefresh(nextCity);
    });
  });

  // TC-CITY-005
  test('TC-CITY-005: empty city is optional and can be saved', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Clear Location and save', async () => {
      await profilePage.updateCity('');
      await profilePage.verifyProfileSaved();
      await profilePage.verifyCityValue('');
    });

    await step('Refresh and verify empty Location persists', async () => {
      await profilePage.verifyCityPersistedAfterRefresh('');
    });
  });

  // TC-CITY-006
  test('TC-CITY-006: whitespace-only city is treated as empty', async ({ page }) => {
    const profilePage = new JobSeekerProfilePage(page);

    await step('Log in as job seeker and open profile', async () => {
      await loginAsJobSeeker(page);
      await profilePage.navigateToProfilePage();
    });

    await step('Enter spaces only in Location and save', async () => {
      await profilePage.updateCity('   ');
      await profilePage.verifyProfileSaved();
    });

    await step('Refresh and verify Location is empty or whitespace-only', async () => {
      await profilePage.refreshProfilePage();
      const value = await profilePage.getCityValue();
      expect(value.trim()).toBe('');
    });
  });
});
