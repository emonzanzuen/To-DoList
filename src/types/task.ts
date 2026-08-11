export type TaskStatus = 'pending' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'study' | 'personal' | 'shopping' | 'other';
export type RepeatInterval = 'none' | 'daily' | 'weekly' | 'monthly'; // ← BARU

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null;
  isPinned: boolean;
  repeat: RepeatInterval;       // ← BARU
  nextRepeatAt: string | null;  // ← BARU: ISO date string untuk occurrence berikutnya
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  repeat: RepeatInterval; // ← BARU
}

export type StatusFilter = 'all' | TaskStatus;
export type PriorityFilter = 'all' | TaskPriority;
export type CategoryFilter = 'all' | TaskCategory;
export type SortOption = 'newest' | 'oldest' | 'dueDate' | 'priority';

export interface TaskFiltersState {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  category: CategoryFilter;
  sort: SortOption;
}