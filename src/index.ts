#!/usr/bin/env node
import { Command } from 'commander';
import { git } from './git.js';
import { planOpen } from './preflight.js';
import { writeReceipt } from './receipt.js';
import { toErrorPayload } from './errors.js';
import { cleanroomStatus, closePlan } from './status.js';

const program = new Command();

program
  .name('gitcleanroom')
  .description('Safe git worktree cleanroom helper for risky agent edits.')
  .version('0.1.0');

program
  .command('doctor')
  .description('Check that gitcleanroom can find git.')
  .action(() => {
    console.log(JSON.stringify({ ok: true, command: 'doctor' }, null, 2));
  });

program
  .command('open')
  .description('Create a policy-checked git worktree cleanroom.')
  .requiredOption('--repo <path>', 'Repository path', '.')
  .requiredOption('--task <name>', 'Task name for the cleanroom')
  .option('--base <ref>', 'Base ref to branch from', 'main')
  .option('--root <path>', 'Ignored cleanroom root relative to the repo', '.cleanrooms')
  .option('--branch <name>', 'Branch name to create')
  .option('--dry-run', 'Run preflight and print the plan without creating anything')
  .action(async (options) => {
    try {
      const plan = await planOpen(options);
      if (!options.dryRun) {
        await git(['worktree', 'add', '-b', plan.branch, plan.worktreePath, plan.base], plan.repoRoot);
        const receipt = await writeReceipt(plan);
        console.log(JSON.stringify({ ok: true, command: 'open', mode: 'write', plan, receipt }, null, 2));
        return;
      }

      console.log(JSON.stringify({ ok: true, command: 'open', mode: 'dry-run', plan }, null, 2));
    } catch (error) {
      console.error(JSON.stringify(toErrorPayload(error), null, 2));
      process.exitCode = 1;
    }
  });

program
  .command('status')
  .description('Read a cleanroom receipt and show worktree status.')
  .argument('<path>', 'Cleanroom worktree path')
  .action(async (target) => {
    try {
      const status = await cleanroomStatus(target);
      console.log(JSON.stringify({ ok: true, command: 'status', ...status }, null, 2));
    } catch (error) {
      console.error(JSON.stringify(toErrorPayload(error), null, 2));
      process.exitCode = 1;
    }
  });

program
  .command('close')
  .description('Plan cleanroom cleanup. Destructive cleanup requires --force.')
  .argument('<path>', 'Cleanroom worktree path')
  .option('--dry-run', 'Print cleanup commands without running them', true)
  .option('--force', 'Remove the worktree and delete the branch')
  .action(async (target, options) => {
    try {
      const plan = await closePlan(target);
      if (!options.force) {
        console.log(JSON.stringify({ ok: true, command: 'close', mode: 'dry-run', ...plan }, null, 2));
        return;
      }

      await git(['worktree', 'remove', plan.receipt.worktreePath], plan.receipt.repoRoot);
      await git(['branch', '-d', plan.receipt.branch], plan.receipt.repoRoot);
      console.log(JSON.stringify({ ok: true, command: 'close', mode: 'write', ...plan }, null, 2));
    } catch (error) {
      console.error(JSON.stringify(toErrorPayload(error), null, 2));
      process.exitCode = 1;
    }
  });

await program.parseAsync(process.argv);
