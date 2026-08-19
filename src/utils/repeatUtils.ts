import type { RepeatInterval } from '../types/task';

/**
 * Calculate next repeat occurrence date.
 *
 * Leap-year safe:
 * - Daily/Weekly: setDate() natively handles month overflow and Feb 29.
 * - Monthly: Uses setMonth() with fallback to last valid day of target month.
 *   Example: Jan 31 + 1 month → Feb 28/29 (not Mar 3).
 *   Example: Feb 29, 2024 + 1 month → Mar 29.
 *   Example: Feb 28, 2025 + 1 month → Mar 28.
 *
 * @param currentDueDate - ISO date string (YYYY-MM-DD)
 * @param interval - Repeat interval type
 * @returns Next occurrence as ISO date string, or null if not applicable
 */
export function getNextRepeatDate(
  currentDueDate: string | null,
  interval: RepeatInterval,
): string | null {
  if (interval === 'none' || !currentDueDate) return null;

  // Use noon to avoid DST boundary issues
  const date = new Date(`${currentDueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  switch (interval) {
    case 'daily':
      // setDate() auto-handles month/year overflow and leap year
      date.setDate(date.getDate() + 1);
      break;

    case 'weekly':
      // setDate() auto-handles month/year overflow and leap year
      date.setDate(date.getDate() + 7);
      break;

    case 'monthly': {
      const originalDay = date.getDate();
      date.setMonth(date.getMonth() + 1);

      // If day changed, it means target month doesn't have that day
      // e.g. Jan 31 → Mar 3 (overflow). Fix: go to last day of target month.
      // setDate(0) = last day of previous month = last day of target month
      if (date.getDate() !== originalDay) {
        date.setDate(0);
      }
      break;
    }
  }

  return date.toISOString().split('T')[0];
}

/**
 * Calculate earliest date a recurring task can be completed.
 *
 * Leap-year safe: setDate(+1) natively handles Feb 28→29 and Dec 31→Jan 1.
 *
 * - Daily: canCompleteFrom = dueDate (can complete on the same day)
 * - Weekly/Monthly: canCompleteFrom = dueDate + 1 day (prevent early completion)
 * - None: null (no restriction)
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
 * Check if a recurring task can be completed right now.
 *
 * Leap-year safe: compares Date objects, no manual date arithmetic.
 * Non-recurring tasks always return true.
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
  if (Number.isNaN(availableFrom.getTime())) return true;
  return today >= availableFrom;
}

/**
 * Format repeat interval for UI display using i18n.
 */
export function formatRepeatLabel(interval: RepeatInterval, t: (key: string) => string): string {
  switch (interval) {
    case 'daily': return t('task.repeat.daily');
    case 'weekly': return t('task.repeat.weekly');
    case 'monthly': return t('task.repeat.monthly');
    default: return t('task.repeat.none');
  }
}