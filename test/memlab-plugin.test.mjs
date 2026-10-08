// Runnable check for the memlab-plugin helpers. Run: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { findOnPath, pythonBeside, installArgs, stripOurEntry, winCommandLine } from '../commands/memlab-plugin.js';

test('finds memlab.exe on a Windows PATH and the python next to it', () => {
  const exe = join('C:\\v\\Scripts', 'memlab.exe');
  const found = findOnPath('memlab', 'C:\\x;C:\\v\\Scripts', 'win32', (p) => p === exe);
  assert.equal(found, exe);
  assert.equal(pythonBeside(found, 'win32'), join('C:\\v\\Scripts', 'python.exe'));
  assert.equal(findOnPath('memlab', 'C:\\x', 'win32', () => false), null);
});

test('install passes the python as plugin config, with the chosen scope', () => {
  assert.deepEqual(installArgs({ scope: 'local', python: 'C:\\v\\python.exe' }), [
    'plugin', 'install', 'memlab', '--marketplace', 'sattva2020/memlab',
    '--scope', 'local', '--config', 'python=C:\\v\\python.exe',
  ]);
});

test('strips only the entry this extension wrote', () => {
  const ours = { mcpServers: { memlab: { command: 'memlab', args: [] }, other: { command: 'x' } } };
  const r = stripOurEntry(ours);
  assert.equal(r.removed, true);
  assert.deepEqual(Object.keys(r.mcp.mcpServers), ['other']);

  const handMade = { mcpServers: { memlab: { command: 'C:/py/python.exe' } } };
  assert.equal(stripOurEntry(handMade).removed, false);
  assert.equal(stripOurEntry({}).removed, false);
});

test('Windows command line quotes paths with spaces', () => {
  assert.equal(winCommandLine('claude', ['--config', 'python=C:\\Program Files\\py.exe']),
    '"claude" "--config" "python=C:\\Program Files\\py.exe"');
});
