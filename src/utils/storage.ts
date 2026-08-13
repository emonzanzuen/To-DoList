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

const VALID_STATUS = ['pending', 'in_progress', 'completed', 'waiting'];
const VALID_PRIORITY = ['low', 'medium', 'high', 'urgent'];
const VALID_CATEGORY = ['work', 'study', 'personal', 'shopping', 'other'];
const VALID_REPEAT: RepeatInterval[] = ['none', 'daily', 'weekly', 'monthly'];
const VALID_APPROVAL = ['none', 'pending', 'approved', 'rejected'];

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
    (task.projectId === null || typeof task.projectId === 'string') &&
    (task.assigneeId === null || typeof task.assigneeId === 'string') &&
    (task.milestone === null || typeof task.milestone === 'string') &&
    (task.dueDate === null || typeof task.dueDate === 'string') &&
    typeof task.isPinned === 'boolean' &&
    typeof task.repeat === 'string' &&
    VALID_REPEAT.includes(task.repeat as RepeatInterval) &&
    (task.nextRepeatAt === null || typeof task.nextRepeatAt === 'string') &&
    Array.isArray(task.checklist) &&
    Array.isArray(task.comments) &&
    typeof task.approvalStatus === 'string' &&
    VALID_APPROVAL.includes(task.approvalStatus) &&
    (task.attachmentUrl === null || typeof task.attachmentUrl === 'string') &&
    typeof task.timeSpentMinutes === 'number' &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}

/**
 * Migrate task lama ke struktur business baru.
 * Menangani semua kombinasi field yang mungkin hilang dari versi sebelumnya.
 */
function migrateTask(raw: unknown): Task | null {
  if (isValidTask(raw)) return raw;

  if (
    typeof raw === 'object' &&
    raw !== null &&
    typeof (raw as Record<string, unknown>).id === 'string' &&
    typeof (raw as Record<string, unknown>).title === 'string'
  ) {
    const t = raw as Record<string, unknown>;

    // Validasi minimal: harus punya status, priority, category, timestamps
    const hasValidStatus = typeof t.status === 'string' && VALID_STATUS.includes(t.status);
    const hasValidPriority = typeof t.priority === 'string' && VALID_PRIORITY.includes(t.priority);
    const hasValidCategory = typeof t.category === 'string' && VALID_CATEGORY.includes(t.category);
    const hasTimestamps = typeof t.createdAt === 'string' && typeof t.updatedAt === 'string';

    // Fallback untuk priority lama yang tidak punya 'urgent'
    const safePriority = hasValidPriority
      ? (t.priority as Task['priority'])
      : 'medium';

    // Fallback untuk status lama yang hanya punya pending/completed
    const safeStatus = hasValidStatus
      ? (t.status as Task['status'])
      : 'pending';

    if (hasTimestamps && typeof t.title === 'string') {
      return {
        id: t.id as string,
        title: t.title as string,
        description: (t.description as string) ?? '',
        status: safeStatus,
        priority: safePriority,
        category: hasValidCategory ? (t.category as Task['category']) : 'work',
        projectId: (t.projectId as string | null) ?? null,
        assigneeId: (t.assigneeId as string | null) ?? null,
        milestone: (t.milestone as string | null) ?? null,
        dueDate: (t.dueDate as string | null) ?? null,
        isPinned: typeof t.isPinned === 'boolean' ? t.isPinned : false,
        repeat: (VALID_REPEAT.includes(t.repeat as RepeatInterval) ? t.repeat : 'none') as RepeatInterval,
        nextRepeatAt: (t.nextRepeatAt as string | null) ?? null,
        checklist: Array.isArray(t.checklist) ? (t.checklist as Task['checklist']) : [],
        comments: Array.isArray(t.comments) ? (t.comments as Task['comments']) : [],
        approvalStatus: (VALID_APPROVAL.includes(t.approvalStatus as string) ? t.approvalStatus : 'none') as Task['approvalStatus'],
        attachmentUrl: (t.attachmentUrl as string | null) ?? null,
        timeSpentMinutes: typeof t.timeSpentMinutes === 'number' ? t.timeSpentMinutes : 0,
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