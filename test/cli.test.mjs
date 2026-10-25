import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'bin', 'cli.mjs');
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

function cli(args, cwd) {
  return spawnSync(process.execPath, [CLI, ...args], {cwd, encoding: 'utf8'});
}

function temp() {
  return mkdtempSync(path.join(tmpdir(), 'promo-cli-'));
}

test('--help prints usage and exits 0', () => {
  const r = cli(['--help']);
  assert.equal(r.status, 0);
  assert.match(r.stdout, /Usage:/);
  assert.match(r.stdout, /create <dir>/);
});

test('--version prints package version', () => {
  const r = cli(['--version']);
  assert.equal(r.status, 0);
  assert.equal(r.stdout.trim(), pkg.version);
});

test('unknown command exits 1', () => {
  const r = cli(['frobnicate']);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /unknown command/);
});

test('create --skip-install scaffolds the starter without dependencies', () => {
  const dir = temp();
  try {
    const r = cli(['create', 'demo', '--skip-install'], dir);
    assert.equal(r.status, 0, r.stderr);
    const dest = path.join(dir, 'demo');
    assert.ok(existsSync(path.join(dest, 'src', 'Promo.tsx')));
    assert.ok(existsSync(path.join(dest, 'package.json')));
    assert.ok(existsSync(path.join(dest, 'public', 'audio', 'vo', 'manifest.json')));
    assert.ok(!existsSync(path.join(dest, 'node_modules')));
    assert.ok(!existsSync(path.join(dest, 'public', 'audio', 'music.wav')));
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

test('create refuses a non-empty directory unless --force', () => {
  const dir = temp();
  try {
    const dest = path.join(dir, 'demo');
    mkdirSync(dest);
    writeFileSync(path.join(dest, 'notes.txt'), 'keep me');
    const refused = cli(['create', 'demo', '--skip-install'], dir);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /already exists/);

    const forced = cli(['create', 'demo', '--skip-install', '--force'], dir);
    assert.equal(forced.status, 0, forced.stderr);
    assert.ok(existsSync(path.join(dest, 'src', 'Promo.tsx')));
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

test('install --project copies the skill payload', () => {
  const dir = temp();
  try {
    const r = cli(['install', '--agent', 'qoder', '--project'], dir);
    assert.equal(r.status, 0, r.stderr);
    const dest = path.join(dir, '.qoder', 'skills', 'promo-video-remotion');
    assert.ok(existsSync(path.join(dest, 'SKILL.md')));
    assert.ok(existsSync(path.join(dest, 'references', 'style-presets.md')));
    assert.ok(existsSync(path.join(dest, 'assets', 'starter-project', 'src', 'Promo.tsx')));
    assert.ok(existsSync(path.join(dest, 'assets', 'starter-project', 'public', 'audio', 'vo', 'manifest.json')));
    assert.ok(!existsSync(path.join(dest, 'docs', 'demo.mp4')), 'demo video should not be installed');
    assert.ok(!existsSync(path.join(dest, 'assets', 'starter-project', 'node_modules')));

    const again = cli(['install', '--agent', 'qoder', '--project'], dir);
    assert.equal(again.status, 1);
    assert.match(again.stderr, /--force/);

    const forced = cli(['install', '--agent', 'claude', '--project', '--force'], dir);
    assert.equal(forced.status, 0, forced.stderr);
    assert.ok(existsSync(path.join(dir, '.claude', 'skills', 'promo-video-remotion', 'SKILL.md')));
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});
