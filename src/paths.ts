import path from 'node:path';
import { CleanroomError } from './errors.js';

const taskPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;

export function resolvePath(input: string): string {
  return path.resolve(input);
}

export function validateTaskName(task: string): void {
  if (!taskPattern.test(task) || task.includes('..') || task.includes(path.sep)) {
    throw new CleanroomError('unsafe_task_name', 'Task names may only contain letters, numbers, dot, underscore, and dash.', {
      task
    });
  }
}

export function assertInside(parent: string, child: string, label: string): void {
  const relative = path.relative(parent, child);
  if (relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    return;
  }

  throw new CleanroomError('unsafe_path', `${label} must stay inside ${parent}.`, {
    parent,
    path: child
  });
}

export function cleanroomPath(repoRoot: string, root: string, task: string): string {
  const cleanroomRoot = path.resolve(repoRoot, root);
  const target = path.resolve(cleanroomRoot, task);
  assertInside(cleanroomRoot, target, 'Cleanroom path');
  return target;
}
