import { STORAGE_KEYS } from '../constants';
import type { Task, RepeatInterval } from '../types/task';

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // abaikan
  }
}

const VALID_STATUS = ['pending', 'completed'];
const VALID_PRIORITY = ['low', 'medium', 'high'];
const VALID_CATEGORY = ['work', 'study', 'personal', 'shopping', 'other'];
const VALID_REPEAT: RepeatInterval[] = ['none', 'daily', 'weekly', 'monthly'];

export function isValidTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.status === 'string' &&
    VALID_STATUS.includes(task.status) &&
    typeof task.priority === 'string' &&
    VALID_PRIORITY.includes(task.priority) &&
    typeof task.category === 'string' &&
    VALID_CATEGORY.includes(task.category) &&
    (task.dueDate === null || typeof task.dueDate === 'string') &&
    typeof task.isPinned === 'boolean' &&
    typeof task.repeat === 'string' &&           // ← BARU
    VALID_REPEAT.includes(task.repeat as RepeatInterval) &&
    (task.nextRepeatAt === null || typeof task.nextRepeatAt === 'string') && // ← BARU
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}

function migrateTask(raw: unknown): Task | null {
  if (isValidTask(raw)) return raw;

  // Backward compat: task lama tanpa isPinned, repeat, nextRepeatAt
  if (
    typeof raw === 'object' &&
    raw !== null &&
    typeof (raw as Record<string, unknown>).id === 'string' &&
    typeof (raw as Record<string, unknown>).title === 'string'
  ) {
    const t = raw as Record<string, unknown>;
    if (
      typeof t.status === 'string' && VALID_STATUS.includes(t.status) &&
      typeof t.priority === 'string' && VALID_PRIORITY.includes(t.priority) &&
      typeof t.category === 'string' && VALID_CATEGORY.includes(t.category) &&
      typeof t.createdAt === 'string' &&
      typeof t.updatedAt === 'string'
    ) {
      return {
        id: t.id as string,
        title: t.title as string,
        description: (t.description as string) ?? '',
        status: t.status as Task['status'],
        priority: t.priority as Task['priority'],
        category: t.category as Task['category'],
        dueDate: (t.dueDate as string | null) ?? null,
        isPinned: typeof t.isPinned === 'boolean' ? t.isPinned : false,
        repeat: (VALID_REPEAT.includes(t.repeat as RepeatInterval) ? t.repeat : 'none') as RepeatInterval,
        nextRepeatAt: (t.nextRepeatAt as string | null) ?? null,
        createdAt: t.createdAt as string,
        updatedAt: t.updatedAt as string,
      };
    }
  }
  return null;
}

export function loadTasks(): Task[] {
  const data = readStorage<unknown>(STORAGE_KEYS.TASKS, []);
  if (!Array.isArray(data)) return [];
  return data.map(migrateTask).filter((t): t is Task => t !== null);
}

export function saveTasks(tasks: Task[]): boolean {
  return writeStorage(STORAGE_KEYS.TASKS, tasks);
}