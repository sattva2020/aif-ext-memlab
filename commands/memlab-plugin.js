// commands/memlab-plugin.js — `ai-factory memlab-plugin` for aif-ext-memlab
//
// Claude Code only: installs the memlab Claude Code plugin (MCP server, session
// hooks, /memlab:* commands) instead of the bare MCP entry this extension adds,
// then removes that entry from .mcp.json so two memlab servers do not start.
//
//   ai-factory memlab-plugin [--python <path>] [--scope user|project|local] [--keep-mcp] [--dry-run]
//
// The plugin needs a Python 3.11+ with memlab's dependencies. Default: the python
// next to the `memlab` executable on PATH (the venv `pip install memlab` went into).
// `ai-factory extension update` can re-add the .mcp.json entry; run this again after it.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const MARKETPLACE = 'sattva2020/memlab';
const DEPS = 'import numpy, scipy, networkx, sentence_transformers';
const READ_TOOLS = ['search_decisions', 'search_code', 'explain', 'find_path'];

// ── pure helpers (exported for tests) ─────────────────────────────────────────

export function findOnPath(name, pathEnv, platform, exists = existsSync) {
  const exts = platform === 'win32' ? ['.exe', '.cmd', ''] : [''];
  for (const dir of (pathEnv || '').split(platform === 'win32' ? ';' : delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const p = join(dir, name + ext);
      if (exists(p)) return p;
    }
  }
  return null;
}

// pip puts the console script next to the interpreter: venv/Scripts (win) or venv/bin.
export function pythonBeside(exe, platform) {
  return join(dirname(exe), platform === 'win32' ? 'python.exe' : 'python');
}

export function installArgs({ scope, python }) {
  return ['plugin', 'install', 'memlab', '--marketplace', MARKETPLACE,
    '--scope', scope, '--config', `python=${python}`];
}

// Removes only the entry this extension wrote (command "memlab"); a hand-made
// server under the same key is left alone.
export function stripOurEntry(mcp) {
  const entry = mcp?.mcpServers?.memlab;
  if (!entry || entry.command !== 'memlab') return { mcp, removed: false };
  const { memlab, ...rest } = mcp.mcpServers;
  return { mcp: { ...mcp, mcpServers: rest }, removed: true };
}

// cmd.exe line for the npm `claude.cmd` shim, which execFile cannot start directly.
// Windows paths cannot contain `"`, so quoting every argument is enough.
export function winCommandLine(cmd, args) {
  return [cmd, ...args].map((a) => `"${a}"`).join(' ');
}

// ── side effects ──────────────────────────────────────────────────────────────

function run(cmd, args) {
  if (process.platform !== 'win32') return execFileSync(cmd, args, { encoding: 'utf8' });
  return execFileSync(process.env.ComSpec || 'cmd.exe',
    ['/d', '/s', '/c', `"${winCommandLine(cmd, args)}"`],
    { encoding: 'utf8', windowsVerbatimArguments: true });
}

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exitCode = 1;
}

export function register(program) {
  program
    .command('memlab-plugin')
    .description('Claude Code: install the memlab plugin and drop the duplicate .mcp.json entry')
    .option('--python <path>', 'Python 3.11+ with memlab dependencies (default: next to `memlab` on PATH)')
    .option('--scope <scope>', 'plugin scope: user, project or local', 'project')
    .option('--keep-mcp', 'leave the memlab entry in .mcp.json')
    .option('--dry-run', 'print what would run, change nothing')
    .action((opts) => {
      if (!['user', 'project', 'local'].includes(opts.scope)) return fail(`unknown --scope ${opts.scope}`);

      let python = opts.python && resolve(opts.python);
      if (!python) {
        const exe = findOnPath('memlab', process.env.PATH, process.platform);
        if (!exe) return fail('memlab is not on PATH: pip install git+https://github.com/sattva2020/memlab, or pass --python');
        python = pythonBeside(exe, process.platform);
      }
      if (!existsSync(python)) return fail(`no Python at ${python}; pass --python`);
      try {
        execFileSync(python, ['-c', DEPS], { stdio: 'ignore' });
      } catch {
        return fail(`${python} lacks memlab's dependencies (numpy scipy networkx sentence-transformers)`);
      }

      const args = installArgs({ scope: opts.scope, python });
      const mcpPath = resolve('.mcp.json');
      if (opts.dryRun) {
        console.log(`would run: claude ${args.join(' ')}`);
        if (!opts.keepMcp) console.log(`would remove the memlab entry from ${mcpPath} (if this extension wrote it)`);
        return;
      }

      try {
        process.stdout.write(run('claude', args));
      } catch (e) {
        return fail(`claude plugin install failed:\n${e.stdout || ''}${e.stderr || e.message}`);
      }
      console.log(`✓ memlab plugin installed (scope: ${opts.scope}, python: ${python})`);

      if (!opts.keepMcp && existsSync(mcpPath)) {
        const { mcp, removed } = stripOurEntry(JSON.parse(readFileSync(mcpPath, 'utf8')));
        if (removed) {
          writeFileSync(mcpPath, JSON.stringify(mcp, null, 2) + '\n');
          console.log(`✓ removed the duplicate memlab entry from ${mcpPath}`);
        }
      }

      const allow = READ_TOOLS.map((t) => `"mcp__plugin_memlab_memlab__${t}"`).join(', ');
      console.log(`To skip permission prompts, add to .claude/settings.local.json → permissions.allow: ${allow}`);
    });
}
