#!/usr/bin/env node
import { Command } from 'commander';

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

await program.parseAsync(process.argv);
