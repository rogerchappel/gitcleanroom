import { CleanroomError } from './errors.js';
import { gitText } from './git.js';
import { readReceipt } from './receipt.js';

export async function cleanroomStatus(target: string): Promise<Record<string, unknown>> {
  const receipt = await readReceipt(target);
  const status = await gitText(['-C', receipt.worktreePath, 'status', '--porcelain=v1', '--branch'], receipt.repoRoot);
  const head = await gitText(['-C', receipt.worktreePath, 'rev-parse', '--short', 'HEAD'], receipt.repoRoot);

  return {
    receipt,
    head,
    dirty: status.split('\n').some((line) => line.length > 0 && !line.startsWith('##')),
    status: status.length > 0 ? status.split('\n') : []
  };
}

export async function closePlan(target: string): Promise<Record<string, unknown>> {
  const receipt = await readReceipt(target);
  const status = await cleanroomStatus(target);
  if (status.dirty) {
    throw new CleanroomError('dirty_cleanroom', 'Refusing to plan cleanup for a dirty cleanroom.', {
      worktreePath: receipt.worktreePath,
      status: status.status
    });
  }

  return {
    receipt,
    commands: [
      ['git', 'worktree', 'remove', receipt.worktreePath],
      ['git', 'branch', '-d', receipt.branch]
    ]
  };
}
