import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Page Object for the Job Seeker Profile page (phone / city updates).
 */
export class JobSeekerProfilePage {
  private readonly page: Page;
  private readonly profileTab: Locator;
  private readonly locationInput: Locator;
  private readonly phoneCountrySelect: Locator;
  private readonly phoneNumberInput: Locator;
  private readonly saveProfileButton: Locator;
  private readonly invalidPhoneError: Locator;
  private readonly profileSavedToast: Locator;

  /** India country dial code value on the phone country select. */
  static readonly INDIA_COUNTRY_CODE = '+91';

  /** Allowed cities for profile city-edit scope. */
  static readonly ALLOWED_CITIES = ['Mumbai', 'Pune'] as const;

  constructor(page: Page) {
    this.page = page;
    // Profile tab on the My profile screen
    this.profileTab = page.getByTestId('tab-profile');
    // Location / city text field under Basics
    this.locationInput = page.getByTestId('input-location');
    // Country dial-code select (aria-label: Country code)
    this.phoneCountrySelect = page.getByTestId('input-phone-country');
    // Phone number field (type=tel)
    this.phoneNumberInput = page.getByTestId('input-phone-number');
    // Persist profile changes
    this.saveProfileButton = page.getByTestId('save-profile-btn');
    // Client-side validation toast for invalid India phone
    this.invalidPhoneError = page.getByText('Enter a valid phone number (up to 10 digits).');
    // Success toast after save
    this.profileSavedToast = page.getByText('Profile saved');
  }

  /** Opens the Job Seeker Profile page (requires authenticated session). */
  async navigateToProfilePage() {
    await this.page.goto('/profile');
    await expect(this.locationInput).toBeVisible();
  }

  /** Verifies the current URL is the profile page. */
  async verifyProfileUrl() {
    await expect(this.page).toHaveURL(/profile/);
  }

  /** Verifies key profile UI for phone / city update is visible. */
  async verifyProfilePageOpened() {
    await this.verifyProfileUrl();
    await expect(this.page).toHaveTitle(/My profile/i);
    await expect(this.profileTab).toBeVisible();
    await expect(this.locationInput).toBeVisible();
    await expect(this.phoneCountrySelect).toBeVisible();
    await expect(this.phoneNumberInput).toBeVisible();
    await expect(this.saveProfileButton).toBeVisible();
  }

  /** Returns the current Location field value. */
  async getCityValue(): Promise<string> {
    return this.locationInput.inputValue();
  }

  /** Clears and enters a city/location value. */
  async enterCity(city: string) {
    await this.locationInput.fill(city);
  }

  /** Verifies the Location field shows the expected city. */
  async verifyCityValue(city: string) {
    await expect(this.locationInput).toHaveValue(city);
  }

  /** Updates Location to the given city and clicks Save profile. */
  async updateCity(city: string) {
    await this.enterCity(city);
    await this.saveProfile();
  }

  /**
   * After save + refresh, verifies the updated city is still shown.
   */
  async verifyCityPersistedAfterRefresh(city: string) {
    await this.refreshProfilePage();
    await this.verifyCityValue(city);
  }

  /**
   * Returns the other allowed city (Mumbai ↔ Pune) relative to current value.
   * Defaults to Mumbai when current is neither.
   */
  static otherAllowedCity(currentCity: string): (typeof JobSeekerProfilePage.ALLOWED_CITIES)[number] {
    return currentCity.trim().toLowerCase() === 'mumbai' ? 'Pune' : 'Mumbai';
  }

  /** Selects India (+91) as the phone country. */
  async selectIndiaCountry() {
    await this.phoneCountrySelect.selectOption(JobSeekerProfilePage.INDIA_COUNTRY_CODE);
  }

  /** Verifies India (+91) is selected as the phone country. */
  async verifyIndiaCountrySelected() {
    await expect(this.phoneCountrySelect).toHaveValue(JobSeekerProfilePage.INDIA_COUNTRY_CODE);
  }

  /** Clears and enters the phone number. */
  async enterPhoneNumber(phoneNumber: string) {
    await this.phoneNumberInput.fill(phoneNumber);
  }

  /**
   * Types phone digits via keyboard so browser maxlength is enforced.
   * Use for boundary checks where fill() may bypass maxlength.
   */
  async typePhoneNumber(phoneNumber: string) {
    await this.phoneNumberInput.click();
    await this.phoneNumberInput.fill('');
    await this.phoneNumberInput.pressSequentially(phoneNumber);
  }

  /** Clicks Save profile. */
  async saveProfile() {
    await this.saveProfileButton.click();
  }

  /**
   * Updates phone for India only: selects +91, enters number, saves.
   */
  async updateIndiaPhoneNumber(phoneNumber: string) {
    await this.selectIndiaCountry();
    await this.enterPhoneNumber(phoneNumber);
    await this.saveProfile();
  }

  /** Verifies the "Profile saved" success message is displayed. */
  async verifyProfileSaved() {
    await expect(this.profileSavedToast).toBeVisible({ timeout: 15000 });
  }

  /** Verifies invalid phone validation message is displayed. */
  async verifyInvalidPhoneError() {
    await expect(this.invalidPhoneError).toBeVisible();
  }

  /** Verifies the phone number field shows the expected value. */
  async verifyPhoneNumberValue(phoneNumber: string) {
    await expect(this.phoneNumberInput).toHaveValue(phoneNumber);
  }

  /** Reloads the profile page and waits for location and phone fields. */
  async refreshProfilePage() {
    await this.page.reload();
    await expect(this.locationInput).toBeVisible();
    await expect(this.phoneNumberInput).toBeVisible();
  }

  /**
   * After save + refresh, verifies India country and updated phone are still shown.
   */
  async verifyPhonePersistedAfterRefresh(phoneNumber: string) {
    await this.refreshProfilePage();
    await this.verifyIndiaCountrySelected();
    await this.verifyPhoneNumberValue(phoneNumber);
  }
}
