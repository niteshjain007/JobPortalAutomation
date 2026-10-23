/**
 * After a Jira ticket's automation is done:
 *   1. Writes an "Automated test coverage" section into the ticket description,
 *      built from generated_test_cases/<KEY>.csv and the matching spec file(s):
 *      one heading per test case with its type, priority, and a steps table
 *      (Action / Data / Expected result).
 *   2. Moves the ticket from "To Do" to "In Review".
 *
 * Usage:
 *   npm run jira:after-automation -- SCRUM-5
 *   npm run jira:after-automation -- SCRUM-5 --dry-run
 */
const fs = require('fs');
const path = require('path');
const { ROOT, getJiraConfig } = require('./env');

const COVERAGE_HEADING = 'Automated test coverage';
const FROM_STATUS = 'To Do';
const TO_STATUS = 'In Review';

/** Parses CSV text, honouring quoted fields with commas, newlines and "" escapes. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((value) => value !== '')) rows.push(row);
  return rows;
}

/** Groups Xray step rows by Issue Id into one entry per test case. */
function readTestCases(key) {
  const csvRelPath = `generated_test_cases/${key.replace(/-/g, '_')}.csv`;
  const csvPath = path.join(ROOT, csvRelPath);
  if (!fs.existsSync(csvPath)) throw new Error(`${csvRelPath} not found — generate the Xray CSV first`);

  const [header, ...rows] = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const col = (name) => header.indexOf(name);
  const byId = new Map();
  for (const r of rows) {
    const id = r[col('Issue Id')];
    if (!byId.has(id)) {
      const labels = (r[col('Labels')] || '').split(';').map((l) => l.trim().toLowerCase());
      byId.set(id, {
        id,
        summary: (r[col('Test Summary')] || '').replace(new RegExp(`^${escapeRegex(key)}\\s*\\|\\s*`), ''),
        priority: r[col('Test Priority')] || '',
        type: ['positive', 'negative', 'boundary'].find((t) => labels.includes(t)) || 'other',
        covers: r[col('Description')] || '',
        steps: [],
      });
    }
    byId.get(id).steps.push({
      action: r[col('Action')] || '',
      data: r[col('Data')] || '',
      expected: r[col('Expected Result')] || '',
    });
  }
  return { csvRelPath, testCases: [...byId.values()] };
}

function findSpecFiles(key) {
  const testsDir = path.join(ROOT, 'tests');
  const keyPattern = new RegExp(`\\b${escapeRegex(key)}\\b`);
  return fs
    .readdirSync(testsDir)
    .filter((f) => f.endsWith('.spec.ts'))
    .filter((f) => keyPattern.test(fs.readFileSync(path.join(testsDir, f), 'utf8')))
    .map((f) => `tests/${f}`);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const text = (value, marks) => (marks ? { type: 'text', text: value, marks } : { type: 'text', text: value });
const code = (value) => text(value, [{ type: 'code' }]);
const paragraph = (...content) => ({ type: 'paragraph', content });
// ADF text nodes must not be empty, so blank CSV cells render as a dash
const cellText = (value) => paragraph(text(value.trim() || '-'));
const tableRow = (cellType, values) => ({
  type: 'tableRow',
  content: values.map((value) => ({ type: cellType, attrs: {}, content: [cellText(value)] })),
});

function buildStepsTable(steps) {
  return {
    type: 'table',
    attrs: { isNumberColumnEnabled: false, layout: 'default' },
    content: [
      tableRow('tableHeader', ['Step', 'Action', 'Data', 'Expected result']),
      ...steps.map((s, i) => tableRow('tableCell', [String(i + 1), s.action, s.data, s.expected])),
    ],
  };
}

function buildCoverageNodes(key, csvRelPath, specFiles, testCases) {
  const counts = ['positive', 'negative', 'boundary']
    .map((t) => `${testCases.filter((tc) => tc.type === t).length} ${t}`)
    .join(', ');
  const specContent = specFiles.length
    ? specFiles.flatMap((f, i) => (i === 0 ? [code(f)] : [text(', '), code(f)]))
    : [text('not found')];

  return [
    { type: 'heading', attrs: { level: 3 }, content: [text(COVERAGE_HEADING)] },
    paragraph(text(`${testCases.length} test cases (${counts}). Updated ${new Date().toISOString().slice(0, 10)}.`)),
    paragraph(text('Xray test cases: '), code(csvRelPath)),
    paragraph(text('Playwright spec: '), ...specContent),
    ...testCases.flatMap((tc) => [
      { type: 'heading', attrs: { level: 4 }, content: [text(`${key} TC${tc.id}: ${tc.summary}`)] },
      paragraph(
        text('Type: ', [{ type: 'strong' }]),
        text(`${tc.type}   `),
        text('Priority: ', [{ type: 'strong' }]),
        text(tc.priority || '-'),
        ...(tc.covers ? [text('   Covers: ', [{ type: 'strong' }]), text(tc.covers)] : []),
      ),
      buildStepsTable(tc.steps),
    ]),
  ];
}

/** Replaces an earlier coverage section (if any) so re-runs don't duplicate it. */
function mergeDescription(description, coverageNodes) {
  const doc = description && description.type === 'doc' ? description : { type: 'doc', version: 1, content: [] };
  const content = doc.content || [];
  const existingIdx = content.findIndex(
    (node) =>
      node.type === 'heading' &&
      (node.content || []).map((c) => c.text || '').join('').trim() === COVERAGE_HEADING,
  );
  const kept = existingIdx === -1 ? content : content.slice(0, existingIdx);
  return { ...doc, content: [...kept, ...coverageNodes] };
}

async function jira(env, method, apiPath, body) {
  const res = await fetch(`${env.base}${apiPath}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.email}:${env.token}`).toString('base64')}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${apiPath} failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const normalize = (value) => value.replace(/\s+/g, ' ').trim().toLowerCase();

async function main() {
  const args = process.argv.slice(2);
  const key = args.find((a) => !a.startsWith('--'));
  const dryRun = args.includes('--dry-run');
  if (!key || !/^[A-Z][A-Z0-9]+-\d+$/.test(key)) {
    throw new Error('Pass a Jira key, e.g. npm run jira:after-automation -- SCRUM-5');
  }

  const env = getJiraConfig();
  const { csvRelPath, testCases } = readTestCases(key);
  const specFiles = findSpecFiles(key);
  const issue = await jira(env, 'GET', `/rest/api/3/issue/${key}?fields=summary,status,description`);
  const currentStatus = issue.fields.status.name;

  console.log(`${key}: ${issue.fields.summary} [${currentStatus}]`);
  console.log(`Coverage: ${testCases.length} test cases from ${csvRelPath}; spec: ${specFiles.join(', ') || 'none'}`);
  testCases.forEach((tc) =>
    console.log(`  TC${tc.id} (${tc.type}, ${tc.priority}, ${tc.steps.length} steps): ${tc.summary}`),
  );

  const description = mergeDescription(
    issue.fields.description,
    buildCoverageNodes(key, csvRelPath, specFiles, testCases),
  );

  let transition = null;
  if (normalize(currentStatus) === normalize(TO_STATUS)) {
    console.log(`Status already "${TO_STATUS}" — no transition needed.`);
  } else if (normalize(currentStatus) !== normalize(FROM_STATUS)) {
    console.log(`Status is "${currentStatus}", not "${FROM_STATUS}" — leaving status unchanged.`);
  } else {
    const { transitions } = await jira(env, 'GET', `/rest/api/3/issue/${key}/transitions`);
    transition = transitions.find((t) => normalize(t.to.name) === normalize(TO_STATUS));
    if (!transition) {
      const available = transitions.map((t) => t.to.name).join(', ');
      throw new Error(`No transition to "${TO_STATUS}" for ${key}. Available: ${available}`);
    }
  }

  if (dryRun) {
    console.log(`Dry run: would update the description${transition ? ` and move ${FROM_STATUS} -> ${TO_STATUS}` : ''}.`);
    return;
  }

  await jira(env, 'PUT', `/rest/api/3/issue/${key}`, { fields: { description } });
  console.log('Description updated with test coverage.');

  if (transition) {
    await jira(env, 'POST', `/rest/api/3/issue/${key}/transitions`, { transition: { id: transition.id } });
    console.log(`Status moved: ${FROM_STATUS} -> ${TO_STATUS}`);
  }
}

main().catch((err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});
