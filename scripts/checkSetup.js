/**
 * Checks that this machine can run the framework, and creates .env from
 * .env.example when it is missing.
 *
 * Usage: npm run doctor   (also runs at the end of npm run setup)
 */
const fs = require('fs');
const { spawnSync } = require('child_process');
const { ENV_PATH, ENV_EXAMPLE_PATH, readEnvFile, missingJiraKeys, getJiraConfig } = require('./env');

const MIN_NODE_MAJOR = 20;
const results = [];
const record = (level, name, detail) => results.push({ level, name, detail });

function checkNode() {
  const major = Number(process.versions.node.split('.')[0]);
  if (major >= MIN_NODE_MAJOR) record('ok', 'Node.js', `v${process.versions.node}`);
  else record('fail', 'Node.js', `v${process.versions.node} found; install Node ${MIN_NODE_MAJOR} or newer`);
}

function checkPlaywright() {
  let chromium;
  try {
    ({ chromium } = require('@playwright/test'));
  } catch {
    record('fail', 'Dependencies', 'not installed; run "npm ci"');
    return;
  }
  record('ok', 'Dependencies', 'installed');
  if (fs.existsSync(chromium.executablePath())) record('ok', 'Chromium', 'installed');
  else record('fail', 'Chromium', 'not installed; run "npx playwright install chromium"');
}

function checkJava() {
  const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
  if (java.status === 0) {
    record('ok', 'Java', (java.stderr || java.stdout).split(/\r?\n/)[0]);
  } else {
    record('warn', 'Java', 'not found; tests run without it, but Allure reports need Java 17+');
  }
}

async function checkJira() {
  if (!fs.existsSync(ENV_PATH)) {
    if (fs.existsSync(ENV_EXAMPLE_PATH)) {
      fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
      record('warn', 'Jira (.env)', 'created .env from .env.example; fill in JIRA_EMAIL and JIRA_API_TOKEN');
    } else {
      record('warn', 'Jira (.env)', '.env and .env.example are both missing');
    }
    return;
  }
  const missing = missingJiraKeys(readEnvFile());
  if (missing.length) {
    record('warn', 'Jira (.env)', `fill in ${missing.join(', ')}; Jira features are off until then`);
    return;
  }
  const jira = getJiraConfig();
  try {
    const res = await fetch(`${jira.base}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${jira.email}:${jira.token}`).toString('base64')}`,
        Accept: 'application/json',
      },
    });
    if (res.ok) record('ok', 'Jira', `signed in as ${(await res.json()).displayName} on ${jira.base}`);
    else record('warn', 'Jira', `${jira.base} rejected the credentials (HTTP ${res.status}); check JIRA_EMAIL and JIRA_API_TOKEN`);
  } catch (err) {
    record('warn', 'Jira', `could not reach ${jira.base}: ${err.message}`);
  }
}

async function main() {
  checkNode();
  checkPlaywright();
  checkJava();
  await checkJira();

  const icon = { ok: 'OK  ', warn: 'WARN', fail: 'FAIL' };
  console.log('\nJobPortalAutomation setup check');
  results.forEach((r) => console.log(`  [${icon[r.level]}] ${r.name}: ${r.detail}`));

  if (results.some((r) => r.level === 'fail')) {
    console.log('\nFix the FAIL items above, then run "npm run doctor" again.');
    process.exit(1);
  }
  console.log('\nReady. Try "npm run test:smoke".');
}

main();
