import type { RepeatInterval } from '../types/task';

/**
 * Hitung tanggal occurrence berikutnya berdasarkan interval repeat.
 * Mengembalikan string yyyy-mm-dd atau null jika repeat = 'none'.
 */
export function getNextRepeatDate(
  currentDueDate: string | null,
  interval: RepeatInterval,
): string | null {
  if (interval === 'none' || !currentDueDate) return null;

  const date = new Date(`${currentDueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  switch (interval) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
  }

  return date.toISOString().split('T')[0];
}

/**
 * Format repeat interval untuk display di UI.
 */
export function formatRepeatLabel(interval: RepeatInterval, t: (key: string) => string): string {
  switch (interval) {
    case 'daily': return t('task.repeat.daily');
    case 'weekly': return t('task.repeat.weekly');
    case 'monthly': return t('task.repeat.monthly');
    default: return t('task.repeat.none');
  }
}