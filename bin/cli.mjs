#!/usr/bin/env node
/**
 * promo-video-remotion CLI
 *
 * Zero dependencies. Node 18+.
 *
 *   create <dir>    scaffold the starter project
 *   install         copy the skill into an agent's skills folder
 *   doctor          check the local toolchain
 */
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync} from 'node:fs';
import {homedir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STARTER = path.join(ROOT, 'assets', 'starter-project');
const IS_WIN = process.platform === 'win32';
const NAME = 'promo-video-remotion';

const HELP = `promo-video-remotion - promo videos in code (Remotion)

Usage:
  promo-video-remotion create <dir> [--skip-install] [--force]
  promo-video-remotion install [--agent qoder|claude] [--project] [--force]
  promo-video-remotion doctor
  promo-video-remotion --help | --version

Commands:
  create    Copy the starter project, install dependencies, synthesize audio,
            and typecheck it. Then open the folder and run: npm run render
  install   Copy this skill into an agent skills folder so the agent can use it.
            Default: ~/.qoder/skills/${NAME}
            --agent claude -> ~/.claude/skills/${NAME}
            --project      -> ./.qoder/skills/${NAME} (or ./.claude/...)
  doctor    Check Node, npm, Python, numpy, edge-tts, ffmpeg and Chrome.

Options:
  --skip-install   create: scaffold only; do not run npm/pip
  --force          overwrite an existing target
  -h, --help       show this help
  -v, --version    print the version
`;

const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

function log(msg = '') {
  process.stdout.write(`${msg}\n`);
}

function fail(msg, code = 1) {
  process.stderr.write(`\nError: ${msg}\n`);
  process.exit(code);
}

function shellQuote(s) {
  return /\s/.test(s) ? `"${s}"` : s;
}

/** Run a command, inheriting stdio. Returns the exit code (or -1). */
function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: IS_WIN && (cmd === 'npm' || cmd === 'npx'), // .cmd shims on Windows
  });
  if (res.error) return -1;
  return res.status === null ? -1 : res.status;
}

function has(cmd) {
  const probe = IS_WIN ? 'where' : 'which';
  const res = spawnSync(probe, [cmd], {stdio: 'ignore', shell: IS_WIN});
  return !res.error && res.status === 0;
}

function findPython() {
  for (const cmd of ['python3', 'python', 'py']) {
    if (has(cmd)) return cmd;
  }
  return null;
}

function parseArgs(argv) {
  const out = {command: argv[0], target: null, flags: new Set(), agent: 'qoder'};
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--agent') {
      out.agent = argv[++i];
      if (!['qoder', 'claude'].includes(out.agent)) fail('--agent must be qoder or claude');
    } else if (a.startsWith('--')) {
      out.flags.add(a);
    } else if (!out.target) {
      out.target = a;
    } else {
      fail(`unexpected argument: ${a}`);
    }
  }
  return out;
}

function isNonEmptyDir(dir) {
  if (!existsSync(dir)) return false;
  if (!statSync(dir).isDirectory()) return true;
  return readdirSync(dir).length > 0;
}

function copyDir(src, dest, filter) {
  cpSync(src, dest, {recursive: true, filter});
}

/* ---------- create ---------- */

const SKIP_CREATE = new Set(['node_modules', '.git', 'out', '__pycache__', '.DS_Store']);

function create(target, {skipInstall, force}) {
  if (!target) fail('create needs a target directory: promo-video-remotion create my-promo');
  const dest = path.resolve(process.cwd(), target);

  if (!existsSync(STARTER)) fail(`starter assets are missing from this install (${STARTER})`);
  if (isNonEmptyDir(dest) && !force) {
    fail(`${dest} already exists and is not empty. Use --force to write into it.`);
  }

  mkdirSync(dest, {recursive: true});
  copyDir(STARTER, dest, (src) => {
    const rel = path.relative(STARTER, src);
    if (!rel) return true;
    const parts = rel.split(path.sep);
    if (parts.some((p) => SKIP_CREATE.has(p))) return false;
    // Generated audio: recreated by `npm run audio` after install.
    if (/\.(wav|mp3|m4a)$/i.test(rel)) return false;
    return true;
  });

  log(`Scaffolded ${dest}`);

  if (skipInstall) {
    log('');
    log('Next:');
    log(`  cd ${shellQuote(path.relative(process.cwd(), dest) || '.')}`);
    log('  npm install');
    log('  python -m pip install numpy');
    log('  npm run audio');
    log('  npm run render');
    return 0;
  }

  log('');
  log('Installing dependencies (npm install)...');
  if (run('npm', ['install', '--no-audit', '--no-fund'], dest) !== 0) {
    log('');
    log('npm install failed. Finish the setup by hand:');
    log(`  cd ${shellQuote(path.relative(process.cwd(), dest) || '.')}`);
    log('  npm install && python -m pip install numpy && npm run audio');
    return 1;
  }

  const py = findPython();
  if (!py) {
    log('');
    log('Python 3 was not found, so audio was not generated.');
    log('Install Python 3.9+ from python.org, then run: npm run audio');
    return 1;
  }

  log('');
  log('Installing numpy...');
  if (run(py, ['-m', 'pip', 'install', 'numpy', '-q'], dest) !== 0) {
    log('');
    log('numpy install failed. Audio needs it:');
    log(`  ${py} -m pip install numpy`);
    log('  npm run audio');
  } else {
    log('Synthesizing sound effects and music...');
    if (run(py, [path.join('scripts', 'make_audio.py')], dest) !== 0) {
      log('');
      log('Audio generation failed. Retry with: npm run audio');
    }
  }

  log('');
  log('Typechecking...');
  if (run('npx', ['tsc', '--noEmit'], dest) !== 0) {
    log('');
    log('Typecheck failed. Open the project and fix the error before rendering.');
  }

  log('');
  log('Done.');
  log(`  cd ${shellQuote(path.relative(process.cwd(), dest) || '.')}`);
  log('  npm start          # live preview');
  log('  npm run render     # -> out/promo.mp4');
  log('');
  log('Voiceover (optional): python -m pip install edge-tts && npm run vo');
  log('Read README.md in the project for editing, presets and verification.');
  return 0;
}

/* ---------- install ---------- */

const INSTALL_ITEMS = [
  'SKILL.md',
  'README.md',
  'LICENSE',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'references',
  'scripts',
  'docs',
  'assets',
];

function install({agent, project, force}) {
  const base = project ? process.cwd() : homedir();
  const dest = path.join(base, `.${agent}`, 'skills', NAME);

  for (const item of INSTALL_ITEMS) {
    if (!existsSync(path.join(ROOT, item))) fail(`package is incomplete: missing ${item}`);
  }

  if (existsSync(dest)) {
    if (!force) fail(`${dest} already exists. Re-run with --force to replace it.`);
    rmSync(dest, {recursive: true, force: true});
  }
  mkdirSync(dest, {recursive: true});

  for (const item of INSTALL_ITEMS) {
    const src = path.join(ROOT, item);
    const dst = path.join(dest, item);
    if (statSync(src).isDirectory()) {
      copyDir(src, dst, (s) => {
        const rel = path.relative(ROOT, s);
        if (/(^|[\\/])(node_modules|out|\.git|__pycache__)([\\/]|$)/.test(rel)) return false;
        if (/\.(mp4|gif|pyc)$/i.test(rel)) return false; // keep the skill folder light
        if (/\.(wav|mp3|m4a)$/i.test(rel)) return false; // generated by npm run audio
        return true;
      });
    } else {
      cpSync(src, dst);
    }
  }

  log(`Installed the skill to ${dest}`);
  log('');
  log('Use it in your agent:');
  log('  "Use the promo-video-remotion skill to make a 30s vertical ad for my app."');
  log('');
  if (project) {
    log('Project-scoped: commit this folder if the whole team should have the skill.');
  } else {
    log('User-scoped: available in every project for this agent.');
  }
  return 0;
}

/* ---------- doctor ---------- */

function doctor() {
  const py = findPython();
  const script = path.join(ROOT, 'scripts', 'doctor.py');
  if (py && existsSync(script)) {
    return run(py, [script], ROOT) === 0 ? 0 : 1;
  }

  // No Python: still report the Node half of the toolchain.
  const res = spawnSync(process.execPath, ['--version'], {encoding: 'utf8'});
  log(`${NAME} - environment check\n`);
  log(`  [OK  ] Node          ${(res.stdout || '').trim()}`);
  log(`  [${has('npm') ? 'OK  ' : 'MISS'}] npm           ${has('npm') ? 'installed' : 'ships with Node.js'}`);
  log(`  [MISS] Python 3.9+   install from python.org, then: python -m pip install numpy`);
  log('');
  log('Audio needs Python + numpy. Everything else works without it.');
  return 1;
}

/* ---------- main ---------- */

const argv = process.argv.slice(2);

if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
  log(HELP.trimEnd());
  process.exit(0);
}
if (argv.includes('--version') || argv.includes('-v')) {
  log(pkg.version);
  process.exit(0);
}

const args = parseArgs(argv);

switch (args.command) {
  case 'create':
    process.exit(
      create(args.target, {
        skipInstall: args.flags.has('--skip-install'),
        force: args.flags.has('--force'),
      }),
    );
    break;
  case 'install':
    process.exit(
      install({
        agent: args.agent,
        project: args.flags.has('--project'),
        force: args.flags.has('--force'),
      }),
    );
    break;
  case 'doctor':
    process.exit(doctor());
    break;
  default:
    fail(`unknown command "${args.command}". Run ${NAME} --help.`);
}
