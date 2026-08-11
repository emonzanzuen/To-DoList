import type { Task } from '../types/task';

export function nowISO(): string {
  return new Date().toISOString();
}

export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const due = new Date(`${task.dueDate}T23:59:59`);
  return due.getTime() < Date.now();
}

export function formatDate(iso: string, locale: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greetingMorning';
  if (hour < 18) return 'dashboard.greetingAfternoon';
  return 'dashboard.greetingEvening';
}