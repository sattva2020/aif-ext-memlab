// Runnable check for the manifest and injections. Run: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const manifest = JSON.parse(read('extension.json'));

test('every injection file exists and keeps the "memlab silent → core behavior" fallback', () => {
  assert.ok(manifest.injections.length > 0);
  for (const inj of manifest.injections) {
    const body = read(inj.file);
    assert.match(body, /from aif-ext-memlab/, inj.file);
    assert.match(body, /not available, return an\s+error, or return nothing/, inj.file);
  }
});

test('versions agree and the MCP template starts memlab on the project root', () => {
  assert.equal(JSON.parse(read('package.json')).version, manifest.version);
  const [server] = manifest.mcpServers;
  assert.equal(server.key, 'memlab');
  const tpl = JSON.parse(read(server.template));
  assert.equal(tpl.command, 'memlab');
  assert.deepEqual(tpl.args, ['serve', '--root', '.']);
});
