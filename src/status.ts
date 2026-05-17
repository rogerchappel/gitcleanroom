import { CleanroomError } from './errors.js';
import { gitText } from './git.js';
import { Receipt, readReceipt } from './receipt.js';

export interface CleanroomStatus {
  receipt: Receipt;
  head: string;
  dirty: boolean;
  status: string[];
}

export interface ClosePlan {
  receipt: Receipt;
  commands: string[][];
}

export async function cleanroomStatus(target: string): Promise<CleanroomStatus> {
  const receipt = await readReceipt(target);
  const status = await gitText(['-C', receipt.worktreePath, 'status', '--porcelain=v1', '--branch'], receipt.repoRoot);
  const head = await gitText(['-C', receipt.worktreePath, 'rev-parse', '--short', 'HEAD'], receipt.repoRoot);
  const lines = status.length > 0 ? status.split('\n').filter((line) => !line.endsWith(' .gitcleanroom.json')) : [];

  return {
    receipt,
    head,
    dirty: lines.some((line) => line.length > 0 && !line.startsWith('##')),
    status: lines
  };
}

export async function closePlan(target: string): Promise<ClosePlan> {
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
