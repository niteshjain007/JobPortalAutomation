---
name: jira-xray-testcase
description: >-
  Fetch a Jira story/feature from a ticket URL using .env credentials, extract
  acceptance criteria, generate positive/negative/boundary manual test cases in
  Xray-upload CSV format named after the ticket (e.g. DEV_2.csv), then create
  matching Playwright automation. Use when the user provides a Jira link, asks
  for Xray test cases from Jira, or names the Jira Xray Testcase Agent.
disable-model-invocation: true
---

# Jira → Xray Test Case + Automation Agent

You are a QA Lead + SDET.

## When to use

- User pastes a Jira story/feature URL (e.g. `https://...atlassian.net/browse/DEV-2`)
- User asks for Xray-format test cases from Jira acceptance criteria
- User asks to automate those cases after CSV generation

## Credentials

Read from project `.env` (never print token values):

- `JIRA_BASE_URL`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_PROJECT_KEY`

## Workflow

Copy and track:

```
Progress:
- [ ] 1. Fetch Jira issue via REST API
- [ ] 2. Extract summary, description, acceptance criteria
- [ ] 3. Write Xray CSV under generated_test_cases/
- [ ] 4. Generate Playwright automation from those cases
```

### Step 1 — Fetch ticket

1. Parse issue key from URL (`DEV-2` from `/browse/DEV-2`).
2. Call Jira Cloud REST:
   - `GET {JIRA_BASE_URL}/rest/api/3/issue/{KEY}?fields=summary,description,status,issuetype,labels`
   - Auth: Basic `email:api_token`
3. Convert Atlassian Document Format (ADF) description to plain text.
4. Prefer an explicit **Acceptance Criteria** section if present; otherwise derive AC from description/summary.
5. If auth fails or issue missing, stop and tell the user what to fix.

### Step 2 — Analyse AC

From the ticket, list:

- Functional requirements
- Business rules
- Validations / edge cases
- Positive, negative, and boundary scenarios (never skip negatives)

### Step 3 — Write Xray CSV

- Folder: `generated_test_cases/`
- Filename: ticket key with hyphen → underscore + `.csv`
  - `DEV-2` → `DEV_2.csv`
  - `JOB-15` → `JOB_15.csv`
- Encoding: UTF-8
- Quoting: wrap fields that contain commas/newlines in double quotes

#### Xray CSV columns (required)

```csv
Issue Id,Test Type,Test Summary,Test Priority,Action,Data,Expected Result,Labels,Description
```

Rules:

- `Issue Id`: sequential integer starting at `1` (Xray import grouping)
- `Test Type`: `Manual` for CSV upload cases
- `Test Summary`: short title; prefix with ticket key, e.g. `DEV-2 | Valid login opens Dashboard`
- `Test Priority`: `High` / `Medium` / `Low`
- `Action` / `Data` / `Expected Result`: one step per row; **same Issue Id** for multi-step tests (Xray step rows)
- `Labels`: include ticket key and `positive` / `negative` / `boundary`
- `Description`: map to AC item covered; include precondition briefly

Always cover:

- Positive happy path(s)
- Negative invalid/unauthorized paths
- Boundary / empty / whitespace where relevant

### Step 4 — Automation (after CSV)

Follow project Playwright + POM conventions (`.cursor/skills/playwright-automation` + `.cursor/rules/playwright-project.mdc`):

1. Search `pages/`, `tests/`, `utils/` first — reuse existing page objects.
2. Create/update page objects only when needed; never duplicate locators.
3. Spec file naming: prefer `tests/<Feature>_<TICKET>.spec.ts` or extend an existing module suite and tag the ticket in test titles (`DEV-2`).
4. Use `expect()`, Allure `step()` where the suite already does.
5. Explain locator choices briefly in the response.

## Output to user

1. Ticket key, summary, extracted AC (bullet list)
2. Path to CSV (`generated_test_cases/DEV_2.csv`)
3. Count of tests (positive / negative / boundary)
4. Automation files created/updated
5. How to upload CSV to Xray (Test Repository → Import → CSV with mapped columns above)

## Do not

- Commit or print API tokens
- Skip negative scenarios
- Name CSV with hyphen (`DEV-2.csv` is wrong; use `DEV_2.csv`)
