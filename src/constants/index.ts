import type { RepeatInterval, TaskCategory, TaskPriority } from '../types/task';

export const STORAGE_KEYS = {
  TASKS: 'todo_tasks',
  LANGUAGE: 'app_language',
  THEME: 'app_theme',
} as const;

export const DEFAULT_LANGUAGE = 'id';
export const SUPPORTED_LANGUAGES = ['id', 'en'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
export const CATEGORIES: TaskCategory[] = ['work', 'study', 'personal', 'shopping', 'other'];
export const REPEAT_INTERVALS: RepeatInterval[] = ['none', 'daily', 'weekly', 'monthly']; // ← BARU

export const PRIORITY_ORDER: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-danger/10 text-danger',
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