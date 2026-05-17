import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { cliArgs, makeGitRepo, run, runOk } from './test-helpers.test.js';

test('status reads receipt and reports a clean opened cleanroom', async () => {
  const repo = await makeGitRepo();
  await runOk('node', cliArgs(['open', '--repo', repo, '--task', 'status-case']), process.cwd());

  const stdout = await runOk('node', cliArgs(['status', path.join(repo, '.cleanrooms', 'status-case')]), process.cwd());
  const payload = JSON.parse(stdout);

  assert.equal(payload.ok, true);
  assert.equal(payload.dirty, false);
  assert.equal(payload.receipt.branch, 'cleanroom/status-case');
});

test('close dry-run prints cleanup commands', async () => {
  const repo = await makeGitRepo();
  const target = path.join(repo, '.cleanrooms', 'close-case');
  await runOk('node', cliArgs(['open', '--repo', repo, '--task', 'close-case']), process.cwd());

  const stdout = await runOk('node', cliArgs(['close', target, '--dry-run']), process.cwd());
  const payload = JSON.parse(stdout);

  assert.equal(payload.ok, true);
  assert.equal(payload.mode, 'dry-run');
  assert.deepEqual(payload.commands[0].slice(0, 3), ['git', 'worktree', 'remove']);
});

test('close refuses dirty cleanrooms', async () => {
  const repo = await makeGitRepo();
  const target = path.join(repo, '.cleanrooms', 'dirty-cleanroom');
  await runOk('node', cliArgs(['open', '--repo', repo, '--task', 'dirty-cleanroom']), process.cwd());
  await writeFile(path.join(target, 'change.txt'), 'change\n', 'utf8');

  const result = await run('node', cliArgs(['close', target, '--dry-run']), process.cwd());
  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'dirty_cleanroom');
});
