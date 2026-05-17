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

test('open dry-run prints a plan without creating a worktree', async () => {
  const repo = await makeGitRepo();
  const stdout = await runOk('node', cliArgs(['open', '--repo', repo, '--task', 'plan-only', '--dry-run']), process.cwd());
  const payload = JSON.parse(stdout);

  assert.equal(payload.mode, 'dry-run');
  const result = await run('git', ['-C', path.join(repo, '.cleanrooms', 'plan-only'), 'status'], process.cwd());
  assert.notEqual(result.code, 0);
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

test('open refuses cleanroom roots outside the repo', async () => {
  const repo = await makeGitRepo();
  const result = await run('node', cliArgs(['open', '--repo', repo, '--task', 'escape', '--root', '../outside']), process.cwd());

  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'unsafe_path');
});

test('open refuses existing branches', async () => {
  const repo = await makeGitRepo();
  await runOk('git', ['branch', 'cleanroom/collision'], repo);

  const result = await run('node', cliArgs(['open', '--repo', repo, '--task', 'collision']), process.cwd());

  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'branch_exists');
});

test('open refuses repositories without a remote', async () => {
  const repo = await makeGitRepo();
  await runOk('git', ['remote', 'remove', 'origin'], repo);

  const result = await run('node', cliArgs(['open', '--repo', repo, '--task', 'no-remote']), process.cwd());

  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'missing_remote');
});

test('open refuses cleanroom roots that are not ignored', async () => {
  const repo = await makeGitRepo();

  const result = await run('node', cliArgs(['open', '--repo', repo, '--task', 'not-ignored', '--root', 'workrooms']), process.cwd());

  assert.equal(result.code, 1);
  assert.equal(JSON.parse(result.stderr).code, 'scratch_root_not_ignored');
});
