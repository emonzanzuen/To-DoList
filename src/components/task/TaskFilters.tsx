import { useTranslation } from 'react-i18next';
import { CATEGORIES, PRIORITIES } from '../../constants';
import type { CategoryFilter, PriorityFilter, SortOption, StatusFilter } from '../../types/task';

interface TaskFiltersProps {
  status: StatusFilter;
  priority: PriorityFilter;
  category: CategoryFilter;
  sort: SortOption;
  onStatusChange: (value: StatusFilter) => void;
  onPriorityChange: (value: PriorityFilter) => void;
  onCategoryChange: (value: CategoryFilter) => void;
  onSortChange: (value: SortOption) => void;
}

const selectClass =
  'h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

export function TaskFilters({
  status,
  priority,
  category,
  sort,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onSortChange,
}: TaskFiltersProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <select
        aria-label={t('filter.status')}
        className={selectClass}
        value={status}
        onChange={(event) => onStatusChange(event.target.value as StatusFilter)}
      >
        <option value="all">
          {t('filter.status')}: {t('common.all')}
        </option>
        <option value="pending">
          {t('filter.status')}: {t('task.pending')}
        </option>
        <option value="completed">
          {t('filter.status')}: {t('task.completed')}
        </option>
      </select>

      <select
        aria-label={t('filter.priority')}
        className={selectClass}
        value={priority}
        onChange={(event) => onPriorityChange(event.target.value as PriorityFilter)}
      >
        <option value="all">
          {t('filter.priority')}: {t('common.all')}
        </option>
        {PRIORITIES.map((item) => (
          <option key={item} value={item}>
            {t('filter.priority')}: {t(`priority.${item}`)}
          </option>
        ))}
      </select>

      <select
        aria-label={t('filter.category')}
        className={selectClass}
        value={category}
        onChange={(event) => onCategoryChange(event.target.value as CategoryFilter)}
      >
        <option value="all">
          {t('filter.category')}: {t('common.all')}
        </option>
        {CATEGORIES.map((item) => (
          <option key={item} value={item}>
            {t('filter.category')}: {t(`category.${item}`)}
          </option>
        ))}
      </select>

      <select
        aria-label={t('filter.sort')}
        className={selectClass}
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
      >
        <option value="newest">
          {t('filter.sort')}: {t('filter.sortNewest')}
        </option>
        <option value="oldest">
          {t('filter.sort')}: {t('filter.sortOldest')}
        </option>
        <option value="dueDate">
          {t('filter.sort')}: {t('filter.sortDueDate')}
        </option>
        <option value="priority">
          {t('filter.sort')}: {t('filter.sortPriority')}
        </option>
      </select>
    </div>
  );
}