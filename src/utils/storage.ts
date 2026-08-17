import type { Task } from '../types/task';
import type { Project } from '../types/project';
import type { Milestone } from '../types/milestone';
import type { User } from '../types/user';
import type { ActivityLog } from '../types/task';

const TASKS_KEY = 'app_tasks';
const PROJECTS_KEY = 'app_projects';
const MILESTONES_KEY = 'app_milestones';
const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'app_current_user';
const ACTIVITY_LOG_KEY = 'app_activity_log';
const SETTINGS_KEY = 'app_settings';
const CLIENTS_KEY = 'app_clients';

// === Generic helpers ===

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

// === Tasks ===

function normalizeAssignees(t: Record<string, unknown>): string[] {
  if (Array.isArray(t.assigneeIds)) return t.assigneeIds as string[];
  if (typeof t.assigneeId === 'string' && t.assigneeId) return [t.assigneeId as string];
  return [];
}

export function loadTasks(): Task[] {
  const data = readStorage<unknown[]>(TASKS_KEY, []);
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    const t = item as Record<string, unknown>;
    return {
      id: String(t.id ?? ''),
      title: String(t.title ?? ''),
      description: String(t.description ?? ''),
      status: (t.status as Task['status']) ?? 'pending',
      priority: (t.priority as Task['priority']) ?? 'medium',
      category: (t.category as Task['category']) ?? 'work',
      projectId: (t.projectId as string | null) ?? null,
      assigneeIds: normalizeAssignees(t),
      milestone: (t.milestone as string | null) ?? null,
      dueDate: (t.dueDate as string | null) ?? null,
      isPinned: Boolean(t.isPinned),
      repeat: (t.repeat as Task['repeat']) ?? 'none',
      nextRepeatAt: (t.nextRepeatAt as string | null) ?? null,
      canCompleteFrom: (t.canCompleteFrom as string | null) ?? null,
      recurringParentId: (t.recurringParentId as string | null) ?? null,
      checklist: Array.isArray(t.checklist) ? t.checklist : [],
      comments: Array.isArray(t.comments) ? t.comments : [],
      approvalStatus: (t.approvalStatus as Task['approvalStatus']) ?? 'none',
      attachmentUrl: (t.attachmentUrl as string | null) ?? null,
      timeSpentMinutes: Number(t.timeSpentMinutes) || 0,
      createdAt: String(t.createdAt ?? new Date().toISOString()),
      updatedAt: String(t.updatedAt ?? new Date().toISOString()),
    } as Task;
  });
}

export function saveTasks(tasks: Task[]): void {
  writeStorage(TASKS_KEY, tasks);
}

// === Projects ===

export function loadProjects(): Project[] {
  return readStorage<Project[]>(PROJECTS_KEY, []);
}

export function saveProjects(projects: Project[]): void {
  writeStorage(PROJECTS_KEY, projects);
}

// === Milestones ===

export function loadMilestones(): Milestone[] {
  return readStorage<Milestone[]>(MILESTONES_KEY, []);
}

export function saveMilestones(milestones: Milestone[]): void {
  writeStorage(MILESTONES_KEY, milestones);
}

// === Users ===

export function loadUsers(): User[] {
  return readStorage<User[]>(USERS_KEY, []);
}

export function saveUsers(users: User[]): void {
  writeStorage(USERS_KEY, users);
}

// === Current User ===

export function loadCurrentUser(): User | null {
  return readStorage<User | null>(CURRENT_USER_KEY, null);
}

export function saveCurrentUser(user: User | null): void {
  if (user === null) {
    localStorage.removeItem(CURRENT_USER_KEY);
  } else {
    writeStorage(CURRENT_USER_KEY, user);
  }
}

// === Activity Log ===

export function loadActivityLog(): ActivityLog[] {
  return readStorage<ActivityLog[]>(ACTIVITY_LOG_KEY, []);
}

export function saveActivityLog(logs: ActivityLog[]): void {
  writeStorage(ACTIVITY_LOG_KEY, logs);
}

// === Settings ===

export interface AppSettings {
  language: string;
  theme: string;
}

export function loadSettings(): AppSettings {
  return readStorage<AppSettings>(SETTINGS_KEY, { language: 'id', theme: 'light' });
}

export function saveSettings(settings: AppSettings): void {
  writeStorage(SETTINGS_KEY, settings);
}

// === Clients ===

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  createdAt: string;
}

export function loadClients(): Client[] {
  return readStorage<Client[]>(CLIENTS_KEY, []);
}

export function saveClients(clients: Client[]): void {
  writeStorage(CLIENTS_KEY, clients);
}