import { access } from 'node:fs/promises';
import path from 'node:path';
import { CleanroomError } from './errors.js';
import { git, gitText } from './git.js';
import { cleanroomPath, resolvePath, validateTaskName } from './paths.js';

export interface OpenPlan {
  repo: string;
  repoRoot: string;
  base: string;
  task: string;
  root: string;
  branch: string;
  worktreePath: string;
}

export interface OpenOptions {
  repo: string;
  task: string;
  base: string;
  root: string;
  branch?: string;
}

export async function planOpen(options: OpenOptions): Promise<OpenPlan> {
  validateTaskName(options.task);
  const repo = resolvePath(options.repo);
  const repoRoot = await repoRootFor(repo);
  const branch = options.branch ?? `cleanroom/${options.task}`;
  const worktreePath = cleanroomPath(repoRoot, options.root, options.task);

  await assertClean(repoRoot);
  await assertRemote(repoRoot);
  await assertRefExists(repoRoot, options.base);
  await assertBranchAvailable(repoRoot, branch);
  await assertPathAvailable(worktreePath);
  await assertIgnored(repoRoot, path.relative(repoRoot, path.dirname(worktreePath)));

  return {
    repo,
    repoRoot,
    base: options.base,
    task: options.task,
    root: options.root,
    branch,
    worktreePath
  };
}

export async function repoRootFor(repo: string): Promise<string> {
  try {
    return await gitText(['-C', repo, 'rev-parse', '--show-toplevel'], repo);
  } catch (error) {
    throw new CleanroomError('not_git_repo', 'The provided --repo path is not inside a git repository.', {
      repo,
      cause: error instanceof Error ? error.message : String(error)
    });
  }
}

async function assertClean(repoRoot: string): Promise<void> {
  const status = await gitText(['status', '--porcelain'], repoRoot);
  if (status.length > 0) {
    throw new CleanroomError('dirty_checkout', 'Refusing to open a cleanroom from a dirty checkout.', {
      repoRoot,
      status: status.split('\n')
    });
  }
}

async function assertRemote(repoRoot: string): Promise<void> {
  const remotes = await gitText(['remote'], repoRoot);
  if (remotes.length === 0) {
    throw new CleanroomError('missing_remote', 'Refusing to open a cleanroom before the repository has a remote.');
  }
}

async function assertRefExists(repoRoot: string, ref: string): Promise<void> {
  await git(['rev-parse', '--verify', `${ref}^{commit}`], repoRoot);
}

async function assertBranchAvailable(repoRoot: string, branch: string): Promise<void> {
  try {
    await git(['show-ref', '--verify', '--quiet', `refs/heads/${branch}`], repoRoot);
  } catch {
    return;
  }

  throw new CleanroomError('branch_exists', 'Refusing to reuse an existing branch.', { branch });
}

async function assertPathAvailable(target: string): Promise<void> {
  try {
    await access(target);
  } catch {
    return;
  }

  throw new CleanroomError('worktree_path_exists', 'Refusing to reuse an existing worktree path.', {
    path: target
  });
}

async function assertIgnored(repoRoot: string, relativeRoot: string): Promise<void> {
  const probe = path.join(relativeRoot, '.gitcleanroom-probe').replaceAll(path.sep, '/');
  try {
    await git(['check-ignore', '--quiet', probe], repoRoot);
  } catch {
    throw new CleanroomError('scratch_root_not_ignored', 'Cleanroom root must be ignored by git before opening worktrees.', {
      root: relativeRoot,
      hint: `Add ${relativeRoot}/ to .gitignore and commit it first.`
    });
  }
}
