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

## Team setup (new machine)

You need **Node.js 20+**, **Git**, **Java 17+** (only for Allure reports) and **Cursor** (for the AI workflow).

```bash
git clone https://github.com/niteshjain007/JobPortalAutomation.git
cd JobPortalAutomation
npm run setup
```

`npm run setup` installs the dependencies and the Chromium browser, then runs a check that prints `OK` / `WARN` / `FAIL` for Node, dependencies, Chromium, Java and Jira. It also creates your `.env` from `.env.example`.

**Connect Jira (needed for the Jira and AI ticket flow):**

1. Create your own API token at [Atlassian API tokens](https://id.atlassian.com/manage-profile/security/api-tokens). Your Atlassian account needs access to the Jira site.
2. Open `.env` and set `JIRA_EMAIL` to your Atlassian login and `JIRA_API_TOKEN` to the token. `JIRA_BASE_URL` and `JIRA_PROJECT_KEY` are already filled in.
3. Run `npm run doctor`. The Jira line should say `signed in as <your name>`.

`.env` is gitignored, so each person keeps their own token and Jira changes are recorded under their own name. Never commit it.

**Check it works:**

```bash
npm run test:smoke
```

**Use the AI workflow:** open the project folder in Cursor. The project rules (`.cursor/rules/`) and skills (`.cursor/skills/`) load automatically. Paste a Jira ticket link in Agent chat (for example `https://qatestology.atlassian.net/browse/SCRUM-6`). The agent runs the whole flow:
- writes the Xray test cases and the Playwright tests, and runs them;
- updates the Jira ticket;
- commits and pushes a branch;
- gives you a pull request link;
- opens the Allure report.

Cursor may still ask you to approve commands such as `git push`. To skip those prompts, add the commands to the auto-run allowlist in Cursor Settings.

**Get the latest changes:** `git pull`, then `npm run setup` again if `package.json` changed.

---

## Folder Structure

```
JobPortalAutomation/
├── .cursor/
│   ├── rules/
│   │   ├── playwright-project.mdc      # Playwright + POM project conventions
│   │   └── jira-ticket-flow.mdc        # Full flow the agent runs for a Jira ticket
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
├── scripts/
│   ├── checkSetup.js                   # npm run doctor: machine + Jira check
│   ├── env.js                          # Reads Jira settings from .env
│   └── jiraUpdateAfterAutomation.js    # Writes coverage to Jira, To Do -> In Review
├── jenkins/                            # Local Jenkins job config (machine-specific paths)
├── Jenkinsfile
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example                        # Template for .env (committed)
└── .env                                # Your Jira credentials (gitignored)
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
| `scripts/` | Setup check and Jira update scripts |
| `.env.example` | Template for `.env` with the shared Jira site and project |
| `.env` | Your own Jira credentials. **Do not commit** |

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

## Environment (Jira)

`npm run setup` creates `.env` from `.env.example`. Fill in your own email and token:

```env
JIRA_BASE_URL=https://qatestology.atlassian.net/
JIRA_EMAIL=your.name@example.com
JIRA_API_TOKEN=your_own_api_token
JIRA_PROJECT_KEY=SCRUM
```

Used by the **jira-xray-testcase** skill, the Jira ticket flow rule and `npm run jira:after-automation`. Run `npm run doctor` to confirm the credentials work.

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
| `npm run setup` | First-time setup: dependencies, Chromium, `.env`, setup check |
| `npm run doctor` | Check Node, dependencies, Chromium, Java and Jira credentials |
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
| `npm run allure:clean` | Delete old Allure results before a run |
| `npm run allure:generate` | Generate Allure HTML report from `allure-results/` |
| `npm run allure:open` | Open the generated Allure report |
| `npm run allure:serve` | Generate and serve Allure report in one step |
| `npx tsc --noEmit` | Type-check the project |
| `npm run jira:after-automation -- <KEY>` | Add test coverage to the Jira ticket and move it To Do -> In Review (`--dry-run` to preview) |

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
https://qatestology.atlassian.net/browse/SCRUM-6
```

CSV is named from the ticket key: `DEV-2` → `generated_test_cases/DEV_2.csv`.

Once the ticket's tests pass, the agent updates the Jira ticket. You can also run this yourself:

```bash
# Preview what will change in Jira
npm run jira:after-automation -- SCRUM-5 --dry-run

# Add test coverage to the description and move To Do -> In Review
npm run jira:after-automation -- SCRUM-5
```

The ticket description gets an **Automated test coverage** section with the spec file name and every test case from the CSV: its type, priority, the acceptance criterion it covers, and a table of its steps (action, data, expected result). Re-running the command refreshes that section instead of adding a second copy. The status only changes when the ticket is in **To Do**.

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
