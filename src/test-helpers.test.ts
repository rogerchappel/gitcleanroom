import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export async function tempDir(prefix: string): Promise<string> {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function run(command: string, args: string[], cwd: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

export async function runOk(command: string, args: string[], cwd: string): Promise<string> {
  const result = await run(command, args, cwd);
  assert.equal(result.code, 0, result.stderr);
  return result.stdout;
}

export async function makeGitRepo(): Promise<string> {
  const root = await tempDir('gitcleanroom-repo-');
  await runOk('git', ['init', '-b', 'main'], root);
  await runOk('git', ['config', 'user.name', 'Test User'], root);
  await runOk('git', ['config', 'user.email', 'test@example.invalid'], root);
  await writeFile(path.join(root, 'README.md'), '# fixture\n', 'utf8');
  await writeFile(path.join(root, '.gitignore'), '.cleanrooms/\n', 'utf8');
  await runOk('git', ['add', '.'], root);
  await runOk('git', ['commit', '-m', 'init'], root);

  const remote = await tempDir('gitcleanroom-remote-');
  await runOk('git', ['init', '--bare'], remote);
  await runOk('git', ['remote', 'add', 'origin', remote], root);
  return root;
}

export function cliArgs(args: string[]): string[] {
  return [path.resolve('dist/index.js'), ...args];
}
