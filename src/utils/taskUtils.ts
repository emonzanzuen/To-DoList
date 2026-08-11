import { PRIORITY_ORDER } from '../constants';
import type { SortOption, Task, TaskFiltersState } from '../types/task';

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function filterTasks(tasks: Task[], filters: TaskFiltersState): Task[] {
  const query = filters.search.trim().toLowerCase();
  return tasks.filter((task) => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.category !== 'all' && task.category !== filters.category) return false;
    if (query) {
      const haystack = `${task.title} ${task.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function compareBySort(a: Task, b: Task, sort: SortOption): number {
  switch (sort) {
    case 'newest':
      return b.createdAt.localeCompare(a.createdAt);
    case 'oldest':
      return a.createdAt.localeCompare(b.createdAt);
    case 'dueDate': {
      if (!a.dueDate && !b.dueDate) return b.createdAt.localeCompare(a.createdAt);
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    case 'priority':
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    default:
      return 0;
  }
}

export function sortTasks(tasks: Task[], sort: SortOption): Task[] {
  const sorted = [...tasks];
  return sorted.sort((a, b) => {
    // ← BARU: Pinned tasks SELALU di atas
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    // Jika sama-sama pinned atau sama-sama tidak, gunakan sort option
    return compareBySort(a, b, sort);
  });
}

export function getVisibleTasks(tasks: Task[], filters: TaskFiltersState): Task[] {
  return sortTasks(filterTasks(tasks, filters), filters.sort);
}

export function getProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((task) => task.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}