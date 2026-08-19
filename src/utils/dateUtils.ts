import type { Task } from '../types/task';

/**
 * Returns current timestamp in ISO format.
 * Leap-year safe: uses native Date API.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Check if a task is overdue based on dueDate.
 * Leap-year safe: parses ISO date string, no manual date arithmetic.
 * Uses T23:59:59 to consider the entire due day as valid.
 */
export function isOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const due = new Date(`${task.dueDate}T23:59:59`);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

/**
 * Format ISO date string to localized display format.
 * Leap-year safe: uses Intl.DateTimeFormat which handles all calendar edge cases.
 * Falls back to raw ISO string if parsing fails (e.g. invalid date like Feb 29 on non-leap year).
 */
export function formatDate(iso: string, locale: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Validate if a date string is a valid calendar date.
 * Catches invalid dates like "2025-02-29" (non-leap year).
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  // Verify round-trip: parsed date should match original string
  const [year, month, day] = dateStr.split('-').map(Number);
  return (
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day
  );
}

/**
 * Get greeting key based on current hour.
 * Not affected by leap year.
 */
export function getGreetingKey(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greetingMorning';
  if (hour < 18) return 'dashboard.greetingAfternoon';
  return 'dashboard.greetingEvening';
}