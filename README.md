# Job Portal Automation

## Project

End-to-end UI automation for the **QaTestology** job portal ([https://qatestology.com](https://qatestology.com)).

The suite covers key flows such as:

- Home page validation
- Job search by title
- Login (navigation and invalid credentials)

Tests are written in **TypeScript** using the **Playwright** test runner and the **Page Object Model (POM)** pattern.

---

## Folder Structure

```
JobPortalAutomation/
├── fixtures/                 # Test data and custom Playwright fixtures
│   ├── baseFixture.ts        # Extends Playwright test with testData fixture
│   └── testData.json         # Valid/invalid job titles and cities
├── pages/                    # Page Object classes
│   ├── HomePage.ts
│   ├── JobSearchPage.ts
│   └── LoginPage.ts
├── tests/                    # Spec files (test cases)
│   ├── HomePageTests.spec.ts
│   ├── JobSearch.spec.ts
│   └── LoginPageTest.spec.ts
├── utils/                    # Shared helpers
│   └── CommonUtils.ts        # Wait, screenshot, random number, date stamp
├── playwright.config.ts      # Playwright configuration (baseURL, browser, etc.)
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and npm scripts
```

| Folder | Purpose |
|--------|---------|
| `pages/` | Locators and actions for each UI page |
| `tests/` | Test scenarios that call page objects |
| `fixtures/` | External test data (`testData.json`) wired via fixtures |
| `utils/` | Reusable utility methods |

---

## Framework

| Layer | Technology / Pattern |
|-------|----------------------|
| Language | TypeScript |
| Test runner | Playwright Test (`@playwright/test`) |
| Design | Page Object Model |
| Test data | JSON fixtures (`fixtures/testData.json`) |
| Browser | Chromium (Desktop Chrome) |
| Reporting | Playwright HTML + Allure Report |
| Application under test | `https://qatestology.com` |

**How it fits together**

1. Specs in `tests/` import page objects from `pages/`.
2. Specs that need shared data import `test` from `fixtures/baseFixture.ts`, which loads `testData.json`.
3. Helpers in `utils/CommonUtils.ts` support waits, screenshots, random values, and timestamps.
4. `playwright.config.ts` sets `baseURL`, HTML + Allure reporters, and Chromium project.

---

## Execution

### Prerequisites

- Node.js installed
- Project dependencies installed
- Playwright browsers installed
- **Java 8+ / JRE 17 recommended** (required by Allure CLI to generate and open reports)

Verify Java:

```bash
java -version
```

### Setup (first time)

```bash
npm install
npx playwright install chromium
```

### Run tests

From the project root:

```bash
# All tests (headless)
npm test

# All tests (headed / visible browser)
npm run test:headed

# Single spec file
npx playwright test tests/JobSearch.spec.ts

# Single spec with browser UI
npx playwright test tests/JobSearch.spec.ts --headed

# Open Playwright HTML report after a run
npm run report
```

### Allure report

After a test run, raw results are written to `allure-results/`. Generate and open the Allure HTML report:

```bash
npm test
npm run allure:generate
npm run allure:open

# Or generate and open in one step
npm run allure:serve
```

On GitHub Actions, Allure raw results and the generated HTML report are uploaded as workflow artifacts (`allure-results`, `allure-report`).

---

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npx playwright install chromium` | Download Chromium for Playwright |
| `npm test` | Run all tests headless |
| `npm run test:headed` | Run all tests with browser visible |
| `npx playwright test tests/<file>.spec.ts` | Run a specific test file |
| `npx playwright test tests/<file>.spec.ts --headed` | Run a specific file in headed mode |
| `npx playwright test --debug` | Run tests in Playwright debug mode |
| `npx playwright test --ui` | Open Playwright UI mode |
| `npm run report` | Open the last Playwright HTML test report |
| `npm run allure:generate` | Generate Allure HTML report from `allure-results/` |
| `npm run allure:open` | Open the generated Allure report |
| `npm run allure:serve` | Generate and serve Allure report in one step |
| `npx tsc --noEmit` | Type-check the project |

---

## Notes

- Base URL is configured in `playwright.config.ts` as `https://qatestology.com`.
- Playwright HTML reports are generated under `playwright-report/` after each run.
- Allure raw results go to `allure-results/`; generated HTML to `allure-report/`.
- Screenshots from `CommonUtils.takeScreenshot()` are saved under `screenshots/`.
