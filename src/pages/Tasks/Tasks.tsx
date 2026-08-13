import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ListTodo, Plus, SearchX, Trash2, User } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SearchBar } from '../../components/task/SearchBar';
import { TaskFilters } from '../../components/task/TaskFilters';
import { TaskList } from '../../components/task/TaskList';
import { AddTaskModal } from '../../components/task/AddTaskModal';
import { EditTaskModal } from '../../components/task/EditTaskModal';
import { DeleteTaskModal } from '../../components/task/DeleteTaskModal';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { getVisibleTasks } from '../../utils/taskUtils';
import { isCategory } from '../../constants';
import type { CategoryFilter, Task, TaskFiltersState } from '../../types/task';

export default function Tasks() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin, clearCompleted, reorderTasks } = useTasks();
  const { user, canSeeAllTasks, canDeleteTask } = useAuth();
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

  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [clearOpen, setClearOpen] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const next: CategoryFilter = isCategory(categoryParam) ? categoryParam : 'all';
    setFilters((previous: TaskFiltersState) =>
      previous.category === next ? previous : { ...previous, category: next },
    );
  }, [searchParams]);

  const visibleTasks = useMemo(() => {
    let filtered = getVisibleTasks(tasks, filters);
    if (user && !canSeeAllTasks) {
      filtered = filtered.filter((task) => task.assigneeId === user.id);
    }
    if (showMyTasksOnly && user && canSeeAllTasks) {
      filtered = filtered.filter((task) => task.assigneeId === user.id);
    }
    return filtered;
  }, [tasks, filters, showMyTasksOnly, user, canSeeAllTasks]);

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

  const handleReorder = useCallback(
    (reordered: Task[]) => {
      updateFilter('sort', 'custom');
      reorderTasks(reordered);
    },
    [reorderTasks, updateFilter],
  );

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Header */}
      <div data-animate className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.tasks')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('tasksPage.subtitle', { count: visibleTasks.length })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canSeeAllTasks && user && (
            <Button
              variant={showMyTasksOnly ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowMyTasksOnly((prev) => !prev)}
            >
              <User className="h-4 w-4" aria-hidden="true" />
              {showMyTasksOnly ? t('tasksPage.allTasks') : t('tasksPage.myTasks')}
            </Button>
          )}
          {canDeleteTask && completedCount > 0 && (
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

      {/* Active filter indicator */}
      {showMyTasksOnly && canSeeAllTasks && user && (
        <div data-animate className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm text-primary">
          <User className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {t('tasksPage.filteringMyTasks', { name: user.name })}
            {' '}
            <button
              type="button"
              onClick={() => setShowMyTasksOnly(false)}
              className="font-medium underline hover:text-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {t('tasksPage.allTasks')}
            </button>
          </span>
        </div>
      )}

      {/* Search & Filters */}
      <div data-animate className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchBar value={filters.search} onChange={(value) => updateFilter('search', value)} />
          </div>
          <div className="hidden h-8 w-px bg-line lg:block" aria-hidden="true" />
        </div>
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

      {/* Task List */}
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
            onViewDetail={setViewingTask}
            onReorder={handleReorder}
          />
        )}
      </div>

      {/* Modals */}
      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <DeleteTaskModal task={deletingTask} onClose={() => setDeletingTask(null)} />
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} />
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