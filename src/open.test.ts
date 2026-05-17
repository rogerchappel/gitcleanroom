import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { access, writeFile } from 'node:fs/promises';
import { cliArgs, makeGitRepo, run, runOk } from './test-helpers.test.js';

test('open creates a worktree with a receipt', async () => {
  const repo = await makeGitRepo();
  const stdout = await runOk('node', cliArgs(['open', '--repo', repo, '--task', 'docs-pass', '--base', 'main']), process.cwd());
  const payload = JSON.parse(stdout);

  assert.equal(payload.ok, true);
  assert.equal(payload.plan.branch, 'cleanroom/docs-pass');
  assert.equal(payload.receipt.task, 'docs-pass');
  await access(path.join(repo, '.cleanrooms', 'docs-pass', '.gitcleanroom.json'));
});

test('open refuses dirty checkouts', async () => {
  const repo = await makeGitRepo();
  await writeFile(path.join(repo, 'dirty.txt'), 'dirty\n', 'utf8');

  const result = await run('node', cliArgs(['open', '--repo', repo, '--task', 'dirty-case']), process.cwd());
  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'dirty_checkout');
});

test('open refuses unsafe task names', async () => {
  const repo = await makeGitRepo();
  const result = await run('node', cliArgs(['open', '--repo', repo, '--task', '../nope']), process.cwd());

  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'unsafe_task_name');
});
