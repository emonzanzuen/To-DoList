import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListTodo, Plus, SearchX, Trash2, SlidersHorizontal } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchBar } from '../../components/task/SearchBar';
import { TaskFilters } from '../../components/task/TaskFilters';
import { TaskList } from '../../components/task/TaskList';
import { AddTaskModal } from '../../components/task/AddTaskModal';
import { EditTaskModal } from '../../components/task/EditTaskModal';
import { DeleteTaskModal } from '../../components/task/DeleteTaskModal';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { getVisibleTasks } from '../../utils/taskUtils';
import { isCategory } from '../../constants';
import type { CategoryFilter, Task, TaskFiltersState } from '../../types/task';

export default function Tasks() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin, clearCompleted } = useTasks();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const entranceRef = usePageEntrance();

  const [filters, setFilters] = useState<TaskFiltersState>(() => {
    const categoryParam = searchParams.get('category');
    return {
      search: '',
      status: 'all',
      priority: 'all',
      category: isCategory(categoryParam) ? categoryParam : 'all',
      sort: 'newest',
    };
  });

  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  // Sinkronkan filter kategori dengan URL (?category=work)
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const next: CategoryFilter = isCategory(categoryParam) ? categoryParam : 'all';
    setFilters((previous: TaskFiltersState) =>
      previous.category === next ? previous : { ...previous, category: next },
    );
  }, [searchParams]);

  const visibleTasks = useMemo(() => getVisibleTasks(tasks, filters), [tasks, filters]);
  const completedCount = useMemo(
    () => tasks.filter((task) => task.status === 'completed').length,
    [tasks],
  );

  const updateFilter = <K extends keyof TaskFiltersState>(key: K, value: TaskFiltersState[K]) => {
    setFilters((previous: TaskFiltersState) => ({ ...previous, [key]: value }));
  };

  const handleCategoryChange = (value: CategoryFilter) => {
    updateFilter('category', value);
    setSearchParams(value === 'all' ? {} : { category: value }, { replace: true });
  };

  const handleClearCompleted = () => {
    clearCompleted();
    setClearOpen(false);
    showToast(t('toast.completedCleared'), 'success');
  };

  // Hitung active filters untuk badge indicator
  const activeFilterCount = [
    filters.status !== 'all',
    filters.priority !== 'all',
    filters.category !== 'all',
  ].filter(Boolean).length;

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* ===== HEADER SECTION ===== */}
      <div data-animate className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.tasks')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('tasksPage.subtitle', { count: visibleTasks.length })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {completedCount > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setClearOpen(true)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t('task.clearCompleted')}
            </Button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {t('task.add')}
          </Button>
        </div>
      </div>

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div data-animate className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search - takes full width on mobile, flexible on desktop */}
          <div className="flex-1">
            <SearchBar value={filters.search} onChange={(value) => updateFilter('search', value)} />
          </div>

          {/* Divider vertical on desktop */}
          <div className="hidden h-8 w-px bg-line lg:block" aria-hidden="true" />

          {/* Filter icon + active count badge */}
          <div className="flex items-center gap-2 lg:hidden">
            <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden="true" />
            <span className="text-xs font-medium text-muted">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter aktif`
                : t('filter.sort')}
            </span>
          </div>
        </div>

        {/* Filters row - always visible, compact grid */}
        <div className="mt-3 border-t border-line pt-3">
          <TaskFilters
            status={filters.status}
            priority={filters.priority}
            category={filters.category}
            sort={filters.sort}
            onStatusChange={(value) => updateFilter('status', value)}
            onPriorityChange={(value) => updateFilter('priority', value)}
            onCategoryChange={handleCategoryChange}
            onSortChange={(value) => updateFilter('sort', value)}
          />
        </div>
      </div>

      {/* ===== TASK LIST SECTION ===== */}
      <div data-animate>
        {visibleTasks.length === 0 ? (
          tasks.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title={t('task.noTasks')}
              description={t('task.noTasksDescription')}
              action={
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t('task.add')}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={SearchX}
              title={t('task.noResults')}
              description={t('task.noResultsDescription')}
            />
          )
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
          />
        )}
      </div>

      {/* ===== MODALS ===== */}
      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <DeleteTaskModal task={deletingTask} onClose={() => setDeletingTask(null)} />
      <ConfirmDialog
        open={clearOpen}
        title={t('task.clearCompletedConfirmTitle')}
        message={t('task.clearCompletedConfirmMessage', { count: completedCount })}
        onConfirm={handleClearCompleted}
        onClose={() => setClearOpen(false)}
      />
    </div>
  );
}