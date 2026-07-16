import { test as base } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

type TestData = {
  jobTitles: {
    valid: string[];
    invalid: string[];
  };
  cities: {
    valid: string[];
    invalid: string[];
  };
};

const testDataPath = join(__dirname, 'testData.json');
const testData: TestData = JSON.parse(readFileSync(testDataPath, 'utf-8'));

type AppFixtures = {
  testData: TestData;
};

/**
 * Extended Playwright test with test-data fixture (loaded from testData.json).
 * Usage: import { test, expect } from '../fixtures/baseFixture';
 */
export const test = base.extend<AppFixtures>({
  testData: async ({}, use) => {
    await use(testData);
  },
});

export { expect } from '@playwright/test';
export type { TestData };
