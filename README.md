# Job Portal Automation

## Project

End-to-end UI automation for the **QaTestology** job portal ([https://qatestology.com](https://qatestology.com)).

The suite covers key flows such as:

- Home page validation
- Job search by title and **location filter** (e.g. Mumbai)
- Job apply flow (authenticated + guest)
- Login (valid / invalid / edge cases)
- Sign up (required-field validation)
- Job Seeker profile updates (India phone, city Mumbai/Pune)

Tests are written in **TypeScript** using the **Playwright** test runner and the **Page Object Model (POM)** pattern.

Manual / Xray-ready test cases are stored under `generated_test_cases/`. Cursor Agent skills under `.cursor/skills/` guide requirement analysis → test cases → automation → review → reporting.

---

## Folder Structure

```
JobPortalAutomation/
├── .cursor/
│   ├── rules/
│   │   └── playwright-project.mdc      # Playwright + POM project conventions
│   └── skills/                         # Cursor Agent skills (slash prompts)
│       ├── requirement-analysis/
│       ├── testcase-generation/
│       ├── playwright-automation/
│       ├── jira-xray-testcase/
│       ├── locator-review/
│       ├── code-review/
│       └── reporting/
├── .github/workflows/
│   └── playwright.yml                  # CI: Playwright + Allure artifacts
├── fixtures/
│   ├── baseFixture.ts                  # Extends Playwright test with testData
│   ├── testData.json                   # Valid/invalid job titles and cities
│   └── sample-resume.pdf               # Resume used in job apply tests
├── generated_test_cases/               # Manual / Xray CSV test cases
│   ├── DEV_2.csv
│   └── JobSeekerProfile_EditCity.csv
├── pages/                              # Page Object classes
│   ├── HomePage.ts
│   ├── LoginPage.ts
│   ├── SignUpPage.ts
│   ├── DashboardPage.ts
│   ├── JobSearchPage.ts
│   └── JobSeekerProfilePage.ts
├── tests/                              # Spec files
│   ├── HomePageTests.spec.ts
│   ├── LoginPageTest.spec.ts
│   ├── SignUpPageTest.spec.ts
│   ├── JobSearch.spec.ts
│   ├── JobSearch_DEV_2.spec.ts
│   └── JobSeekerProfilePageTest.spec.ts
├── utils/
│   └── CommonUtils.ts                  # Wait, screenshot, random number, date
├── jenkins/                            # Jenkins job config helpers
├── Jenkinsfile
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env                                # Local secrets (gitignored) — Jira, etc.
```

| Folder / file | Purpose |
|---------------|---------|
| `pages/` | Locators and actions for each UI page (POM) |
| `tests/` | Automated scenarios that call page objects |
| `fixtures/` | Shared test data and Playwright fixtures |
| `generated_test_cases/` | Manual test cases (CSV / Xray upload format) |
| `utils/` | Reusable helpers (`CommonUtils`) |
| `.cursor/skills/` | Agent skills for QA workflow in Cursor |
| `.cursor/rules/` | Always-on project conventions for Playwright code |
| `.env` | Local credentials (Jira API). **Do not commit** |

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
| Integrations | Jira Cloud API (via `.env`), Xray CSV export |
| Application under test | `https://qatestology.com` |

**How it fits together**

1. Specs in `tests/` import page objects from `pages/`.
2. Specs that need shared data import `test` from `fixtures/baseFixture.ts`, which loads `testData.json`.
3. Helpers in `utils/CommonUtils.ts` support waits, screenshots, random values, and timestamps.
4. `playwright.config.ts` sets `baseURL`, HTML + Allure reporters, and Chromium project.
5. Cursor skills in `.cursor/skills/` drive analysis → CSV cases → automation → review → report.

---

## Environment (optional — Jira)

Create a local `.env` (already gitignored):

```env
JIRA_BASE_URL=https://your-site.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your_api_token
JIRA_PROJECT_KEY=DEV
```

Used by the **jira-xray-testcase** skill when you paste a Jira story URL.

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
npx playwright test tests/JobSearch_DEV_2.spec.ts

# Single spec with browser UI
npx playwright test tests/JobSearch_DEV_2.spec.ts --headed

# Open Playwright HTML report after a run
npm run report
```

### Smoke vs regression tags

Every test is tagged `@regression`. The **first test in each spec file** is also tagged `@smoke` (quick health check suite).

| Tag | Meaning |
|-----|---------|
| `@smoke` | First test case per file — critical path / sanity |
| `@regression` | Full suite (includes smoke tests) |

**Run smoke only** (fast subset — one test per file):

```bash
npm run test:smoke

# Equivalent (quote the tag on Windows PowerShell):
npx playwright test --grep "@smoke"

# Headed:
npx playwright test --grep "@smoke" --headed
```

**Run full regression** (all tagged tests):

```bash
npm run test:regression

# Equivalent (quote the tag on Windows PowerShell):
npx playwright test --grep "@regression"

# Headed:
npx playwright test --grep "@regression" --headed
```

**List matched tests without running:**

```bash
npx playwright test --grep "@smoke" --list
npx playwright test --grep "@regression" --list
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
| `npm run test:smoke` | Run `@smoke` tests only (first test per file) |
| `npm run test:regression` | Run all `@regression` tests (full suite) |
| `npx playwright test --grep @smoke` | Same as `npm run test:smoke` |
| `npx playwright test --grep @regression` | Same as `npm run test:regression` |
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
- Keep secrets only in `.env` (never commit tokens).

---

## Guide for Test Engineers (Cursor Agent skills)

Use this project in Cursor with a clear **QA pipeline**. Type `/` in chat to attach a skill, then paste a short prompt.

### Recommended workflow (step by step)

```
1. Requirement analysis   →  /requirement-analysis
2. Manual test cases      →  /testcase-generation
   (or from Jira)         →  /jira-xray-testcase
3. Locator help (optional)→  /locator-review
4. Playwright automation  →  /playwright-automation
5. Code review            →  /code-review
6. Run tests + reporting  →  /reporting
```

### Skills available in this repo

| Slash skill | What it does | Output |
|-------------|--------------|--------|
| `/requirement-analysis` | Analyse story: actors, rules, validations, edge cases | Functional / business / validation rules + scenarios |
| `/testcase-generation` | Manual positive / negative / boundary cases | CSV under `generated_test_cases/` |
| `/jira-xray-testcase` | Read Jira AC from ticket URL → Xray CSV + automation | `generated_test_cases/DEV_2.csv` style + specs |
| `/locator-review` | Suggest stable Playwright locators | Best + alternative locator with reason |
| `/playwright-automation` | Generate POM + Playwright TypeScript tests | `pages/` + `tests/` updates |
| `/code-review` | Review automation for waits, duplicates, POM, asserts | Issues + recommendations |
| `/reporting` | Summarise run from HTML report / failures | Exec summary, RCA, fix, risk |

### How to use slash shortcuts

1. Open **Cursor Chat** (Agent mode).
2. Type `/` and pick the skill (example: `/requirement-analysis`).
3. Add a clear prompt with the requirement, Jira link, or file path.
4. Follow the next skill in the pipeline after each step.

### Simple prompt examples

**1. Requirement analysis**

```text
/requirement-analysis
Analyse this requirement for Job Seeker only:
User should update phone number for India (+91) on profile.
After save and refresh, updated phone must be visible.
Include negative and boundary scenarios.
```

**2. Test case generation**

```text
/testcase-generation
Using the requirement analysis above, generate manual test cases.
Save CSV in generated_test_cases/.
Include positive, negative, and boundary cases.
```

**3. From a Jira story (Xray + automation in one flow)**

```text
/jira-xray-testcase
Create Xray CSV test cases and Playwright automation for:
https://qatestologytest.atlassian.net/browse/DEV-2
```

CSV is named from the ticket key: `DEV-2` → `generated_test_cases/DEV_2.csv`.

**4. Locator review**

```text
/locator-review
Suggest Playwright locators for the Jobs page location filter
and Apply now button. Prefer getByTestId / getByRole.
```

**5. Playwright automation**

```text
/playwright-automation
Automate the test cases in generated_test_cases/DEV_2.csv.
Reuse JobSearchPage and LoginPage. Do not duplicate page objects.
Follow POM and project rules.
```

**6. Code review**

```text
/code-review
Review pages/JobSearchPage.ts and tests/JobSearch_DEV_2.spec.ts
for hardcoded waits, duplicate locators, weak assertions, and POM misuse.
```

**7. Reporting (after a run)**

```text
/reporting
I ran: npx playwright test tests/JobSearch_DEV_2.spec.ts
Summarise pass/fail, root cause of any failures, and suggested fixes.
```

### Tips for better prompts

- **Be specific** about actor (Job Seeker / Employer) and scope (one field, one city, India only).
- **Attach the skill with `/`** so the agent follows that skill’s rules (e.g. no automation during requirement analysis).
- **Chain steps**: analysis → CSV → automation → review → report.
- For Jira, keep `.env` filled and paste the full browse URL (`.../browse/DEV-2`).
- Ask to **reuse existing page objects** to avoid duplicate locators.
- Name Xray files with underscore: `DEV_2.csv`, not `DEV-2.csv`.
