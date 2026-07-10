import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const envPath = resolve(root, '.env');
const examplePath = resolve(root, '.env.example');
const adminPath = resolve(root, 'src/pages/admin/requests.astro');
const briefPath = resolve(root, 'src/pages/brief.astro');

function hasFile(path) {
  return existsSync(path);
}

function read(path) {
  return readFileSync(path, 'utf8');
}

function parseEnvKeys(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('=')[0]?.trim())
    .filter(Boolean);
}

const checks = [];
function check(name, ok, detail = '') {
  checks.push({ name, ok, detail });
}

check('admin page exists', hasFile(adminPath), 'src/pages/admin/requests.astro');
check('brief page exists', hasFile(briefPath), 'src/pages/brief.astro');
check('.env.example exists', hasFile(examplePath), '.env.example');

if (hasFile(examplePath)) {
  const example = read(examplePath);
  check('env example has PUBLIC_SUPABASE_URL', example.includes('PUBLIC_SUPABASE_URL='));
  check('env example has PUBLIC_SUPABASE_ANON_KEY', example.includes('PUBLIC_SUPABASE_ANON_KEY='));
  check('env example does not mention service role value', !/SERVICE_ROLE\s*=/.test(example));
}

if (hasFile(adminPath)) {
  const admin = read(adminPath);
  check('admin uses Supabase client safely', admin.includes('@supabase/supabase-js') && admin.includes('PUBLIC_SUPABASE_URL'));
  check('admin has localStorage fallback', admin.includes('invitation_requests_index') && admin.includes('localStorage'));
  check('admin explains RLS/select limitation', admin.includes('RLS') && admin.includes('SELECT'));
  check('admin does not use service role env/key in code', !/SERVICE_ROLE\s*=|SUPABASE_SERVICE_ROLE_KEY|service_role\s*:/i.test(admin));
}

if (hasFile(briefPath)) {
  const brief = read(briefPath);
  check('brief inserts invitation_requests', brief.includes("from('invitation_requests')") || brief.includes('from("invitation_requests")'));
  check('brief stores fallback request', brief.includes('invitation_request_') && brief.includes('invitation_requests_index'));
}

if (hasFile(envPath)) {
  const keys = parseEnvKeys(read(envPath));
  check('local .env has PUBLIC_SUPABASE_URL key', keys.includes('PUBLIC_SUPABASE_URL'));
  check('local .env has PUBLIC_SUPABASE_ANON_KEY key', keys.includes('PUBLIC_SUPABASE_ANON_KEY'));
  console.log('Local .env detected. Keys checked without printing values.');
} else {
  console.log('Local .env not found. Supabase browser features will stay in fallback mode.');
}

const failed = checks.filter((item) => !item.ok);
for (const item of checks) {
  console.log(`${item.ok ? '✅' : '❌'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
}

if (failed.length) {
  console.error(`\n${failed.length} verification check(s) failed.`);
  process.exit(1);
}

console.log('\nSupabase/admin verification passed without printing secrets.');
