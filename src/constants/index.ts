import type { RepeatInterval, TaskCategory, TaskPriority, TaskStatus } from '../types/task';

export const STORAGE_KEYS = {
  TASKS: 'todo_tasks',
  LANGUAGE: 'app_language',
  THEME: 'app_theme',
} as const;

export const DEFAULT_LANGUAGE = 'id';
export const SUPPORTED_LANGUAGES = ['id', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

// ← UPGRADE: 4 priority levels termasuk urgent
export const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];
export const CATEGORIES: TaskCategory[] = ['work', 'study', 'personal', 'shopping', 'other'];
export const REPEAT_INTERVALS: RepeatInterval[] = ['none', 'daily', 'weekly', 'monthly'];

// ← UPGRADE: 4 task statuses untuk business app
export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'waiting_approval', 'completed'];

// ← UPGRADE: Priority order termasuk urgent (paling atas)
export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ← UPGRADE: Priority badge termasuk urgent
export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-danger/10 text-danger',
  urgent: 'bg-danger/20 text-danger font-bold ring-1 ring-danger/30',
};

// ← BARU: Priority indicator colors sesuai ketentuan dosen
// 🔵 Low, 🟡 Medium, 🟠 High, 🔴 Urgent
export const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

// ← BARU: Status badge styles
export const STATUS_BADGE: Record<TaskStatus, string> = {
  pending: 'bg-muted/10 text-muted',
  in_progress: 'bg-info/10 text-info',
  waiting_approval: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
};

export const CATEGORY_DOT: Record<TaskCategory, string> = {
  work: 'bg-indigo-500',
  study: 'bg-blue-500',
  personal: 'bg-purple-500',
  shopping: 'bg-orange-500',
  other: 'bg-slate-500',
};

export const CATEGORY_BADGE: Record<TaskCategory, string> = {
  work: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  study: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  personal: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  shopping: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  other: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

export function isCategory(value: string | null): value is TaskCategory {
  return value !== null && (CATEGORIES as string[]).includes(value);
}