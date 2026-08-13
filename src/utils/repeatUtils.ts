import type { RepeatInterval } from '../types/task';

/**
 * Hitung tanggal occurrence berikutnya berdasarkan interval repeat.
 * - Daily: +1 hari
 * - Weekly: +7 hari
 * - Monthly: +1 bulan kalender (safe)
 */
export function getNextRepeatDate(
  currentDueDate: string | null,
  interval: RepeatInterval,
): string | null {
  if (interval === 'none' || !currentDueDate) return null;

  const date = new Date(`${currentDueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  switch (interval) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly': {
      const day = date.getDate();
      date.setMonth(date.getMonth() + 1);
      if (date.getDate() !== day) {
        date.setDate(0);
      }
      break;
    }
  }

  return date.toISOString().split('T')[0];
}

/**
 * Hitung tanggal earliest task boleh diselesaikan.
 * - Daily: canCompleteFrom = dueDate
 * - Weekly/Monthly: canCompleteFrom = dueDate + 1 day
 * - None: null
 */
export function getCanCompleteFrom(
  dueDate: string | null,
  interval: RepeatInterval,
): string | null {
  if (!dueDate || interval === 'none') return null;

  if (interval === 'daily') {
    return dueDate;
  }

  const date = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

/**
 * Cek apakah task boleh diselesaikan sekarang.
 */
export function canCompleteNow(task: {
  repeat: RepeatInterval;
  dueDate: string | null;
  canCompleteFrom: string | null;
}): boolean {
  if (task.repeat === 'none') return true;
  if (!task.canCompleteFrom) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const availableFrom = new Date(`${task.canCompleteFrom}T00:00:00`);
  return today >= availableFrom;
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