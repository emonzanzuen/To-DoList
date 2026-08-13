import type { Task, TaskFiltersState } from '../types/task';
import { PRIORITY_ORDER } from '../constants';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

export function getVisibleTasks(tasks: Task[], filters: TaskFiltersState): Task[] {
  let result = [...tasks];

  // Search filter
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }

  // Status filter
  if (filters.status !== 'all') {
    result = result.filter((t) => t.status === filters.status);
  }

  // Priority filter
  if (filters.priority !== 'all') {
    result = result.filter((t) => t.priority === filters.priority);
  }

  // Category filter
  if (filters.category !== 'all') {
    result = result.filter((t) => t.category === filters.category);
  }

  // Sort — FIX #2: Skip sorting jika sort = 'custom' (drag & drop mode)
  if (filters.sort === 'custom') {
    return result;
  }

  switch (filters.sort) {
    case 'newest':
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case 'oldest':
      result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      break;
    case 'dueDate':
      result.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
      break;
    case 'priority':
      result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      break;
  }

  return result;
}