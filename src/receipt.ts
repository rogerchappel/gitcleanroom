import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { OpenPlan } from './preflight.js';

export interface Receipt {
  schemaVersion: 1;
  tool: 'gitcleanroom';
  createdAt: string;
  repoRoot: string;
  base: string;
  branch: string;
  task: string;
  worktreePath: string;
  commands: string[];
  cleanup: {
    dryRun: string;
    removeWorktree: string;
    deleteBranch: string;
  };
}

export const receiptFileName = '.gitcleanroom.json';

export function receiptPath(worktreePath: string): string {
  return path.join(worktreePath, receiptFileName);
}

export async function writeReceipt(plan: OpenPlan): Promise<Receipt> {
  const receipt: Receipt = {
    schemaVersion: 1,
    tool: 'gitcleanroom',
    createdAt: new Date().toISOString(),
    repoRoot: plan.repoRoot,
    base: plan.base,
    branch: plan.branch,
    task: plan.task,
    worktreePath: plan.worktreePath,
    commands: [
      `git worktree add -b ${plan.branch} ${plan.worktreePath} ${plan.base}`
    ],
    cleanup: {
      dryRun: `gitcleanroom close ${plan.worktreePath} --dry-run`,
      removeWorktree: `git worktree remove ${plan.worktreePath}`,
      deleteBranch: `git branch -d ${plan.branch}`
    }
  };
  await mkdir(plan.worktreePath, { recursive: true });
  await writeFile(receiptPath(plan.worktreePath), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return receipt;
}

export async function readReceipt(target: string): Promise<Receipt> {
  const raw = await readFile(receiptPath(path.resolve(target)), 'utf8');
  return JSON.parse(raw) as Receipt;
}
