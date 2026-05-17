import { spawn } from 'node:child_process';
import { CleanroomError } from './errors.js';

export interface GitResult {
  stdout: string;
  stderr: string;
}

export async function git(args: string[], cwd: string): Promise<GitResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
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
    child.on('error', (error) => {
      reject(new CleanroomError('git_spawn_failed', error.message));
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new CleanroomError('git_failed', `git ${args.join(' ')} failed`, {
        exitCode: code,
        stderr: stderr.trim()
      }));
    });
  });
}

export async function gitText(args: string[], cwd: string): Promise<string> {
  const result = await git(args, cwd);
  return result.stdout.trim();
}
