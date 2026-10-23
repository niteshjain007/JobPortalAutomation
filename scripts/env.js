const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT, '.env.example');
const JIRA_KEYS = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
// Values shipped in .env.example; seeing them means the file was never filled in
const PLACEHOLDER_VALUES = ['your.name@example.com', 'paste-your-token-here'];

/** Reads KEY=value pairs from .env; returns null when the file does not exist. */
function readEnvFile() {
  if (!fs.existsSync(ENV_PATH)) return null;
  const env = {};
  for (const line of fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return env;
}

/** Lists Jira keys that are missing or still hold the .env.example placeholder. */
function missingJiraKeys(env) {
  return JIRA_KEYS.filter((key) => !env[key] || PLACEHOLDER_VALUES.includes(env[key]));
}

/** Returns Jira connection settings from .env, or throws with what to fix. */
function getJiraConfig() {
  const env = readEnvFile();
  if (!env) throw new Error('.env not found — run "npm run setup" and fill in your Jira details');
  const missing = missingJiraKeys(env);
  if (missing.length) throw new Error(`Fill in ${missing.join(', ')} in .env (see .env.example)`);
  let base = env.JIRA_BASE_URL.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(base)) base = `https://${base}`;
  return { base, email: env.JIRA_EMAIL, token: env.JIRA_API_TOKEN, projectKey: env.JIRA_PROJECT_KEY };
}

module.exports = { ROOT, ENV_PATH, ENV_EXAMPLE_PATH, readEnvFile, missingJiraKeys, getJiraConfig };
