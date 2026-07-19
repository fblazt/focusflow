import { type Task } from './types';

let todayOverride: string | null = null;

export function setToday(date: string): void {
  todayOverride = date;
}

export function clearTodayOverride(): void {
  todayOverride = null;
}

function today(): string {
  return todayOverride ?? new Date().toISOString().split('T')[0]!;
}

export function isOverdue(task: Task): boolean {
  if (task.isCompleted || !task.dueDate) return false;
  return task.dueDate < today();
}
