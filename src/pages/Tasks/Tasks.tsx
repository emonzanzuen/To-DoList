import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { TaskList } from '../../components/task/TaskList';
import { AddTaskModal } from '../../components/task/AddTaskModal';
import { EditTaskModal } from '../../components/task/EditTaskModal';
import { DeleteTaskModal } from '../../components/task/DeleteTaskModal';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { CATEGORIES, PRIORITIES } from '../../constants';
import type { Task, TaskFiltersState, StatusFilter, PriorityFilter, CategoryFilter, SortOption } from '../../types/task';

export default function Tasks() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin, clearCompleted, reorderTasks } = useTasks();
  const { user, canSeeAllTasks, canDeleteTask } = useAuth();
  const entranceRef = usePageEntrance();

  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [showMyOnly, setShowMyOnly] = useState(false);
  const [filters, setFilters] = useState<TaskFiltersState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    sort: 'newest',
  });

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // RBAC: Member hanya lihat task sendiri
    if (!canSeeAllTasks && user) {
      filtered = filtered.filter((task) => task.assigneeIds.includes(user.id));
    }

    // Toggle "Task Saya Saja" untuk Admin/Manager
    if (showMyOnly && user) {
      filtered = filtered.filter((task) => task.assigneeIds.includes(user.id));
    }

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          task.description.toLowerCase().includes(q),
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter((task) => task.category === filters.category);
    }

    // Sort — hanya apply jika bukan default view
    // Default view (newest) mempertahankan urutan drag & drop
    const isDefaultSort = filters.sort === 'newest';
    if (!isDefaultSort) {
      switch (filters.sort) {
        case 'oldest':
          filtered.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          break;
        case 'dueDate':
          filtered.sort((a, b) => (a.dueDate ?? 'z').localeCompare(b.dueDate ?? 'z'));
          break;
        case 'priority': {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          filtered.sort((a, b) => order[a.priority] - order[b.priority]);
          break;
        }
      }
    }

    return filtered;
  }, [tasks, filters, user, canSeeAllTasks, showMyOnly]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  // Drag & drop hanya aktif saat default view (tanpa filter/sort/search)
  const isDefaultView =
    filters.status === 'all' &&
    filters.priority === 'all' &&
    filters.category === 'all' &&
    filters.sort === 'newest' &&
    !filters.search.trim() &&
    !showMyOnly;

  const selectClass =
    'rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Header */}
      <div data-animate className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.tasks')}</h1>
          <p className="mt-1 text-sm text-muted">
            {t('task.count', { count: filteredTasks.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {completedCount > 0 && (canDeleteTask || canSeeAllTasks) && (
            <Button variant="secondary" size="sm" onClick={clearCompleted}>
              <Trash2 className="h-4 w-4" />
              {t('task.clearCompleted')}
            </Button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('task.add')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div data-animate className="space-y-3 rounded-2xl border border-line bg-surface p-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder={t('task.searchPlaceholder')}
            className="w-full rounded-lg border border-line bg-background py-2 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted" />

          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as StatusFilter }))}
            className={selectClass}
          >
            <option value="all">{t('filter.allStatus')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="in_progress">{t('status.inProgress')}</option>
            <option value="completed">{t('status.completed')}</option>
            <option value="waiting">{t('status.waiting')}</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((p) => ({ ...p, priority: e.target.value as PriorityFilter }))}
            className={selectClass}
          >
            <option value="all">{t('filter.allPriority')}</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{t(`priority.${p}`)}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value as CategoryFilter }))}
            className={selectClass}
          >
            <option value="all">{t('filter.allCategory')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{t(`category.${c}`)}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value as SortOption }))}
            className={selectClass}
          >
            <option value="newest">{t('filter.sortNewest')}</option>
            <option value="oldest">{t('filter.sortOldest')}</option>
            <option value="dueDate">{t('filter.sortDueDate')}</option>
            <option value="priority">{t('filter.sortPriority')}</option>
          </select>

          {/* Toggle My Only — hanya untuk Admin/Manager */}
          {canSeeAllTasks && user && (
            <button
              type="button"
              onClick={() => setShowMyOnly((v) => !v)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                showMyOnly
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-background hover:text-ink'
              }`}
            >
              {showMyOnly ? t('task.showAll') : t('task.myOnly')}
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Banner */}
      {showMyOnly && canSeeAllTasks && (
        <div data-animate className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-2 text-sm">
          <span className="text-primary font-medium">
            {t('tasksPage.filteringMyTasks', { name: user?.name.split(' ')[0] })}
          </span>
          <button
            type="button"
            onClick={() => setShowMyOnly(false)}
            className="text-xs text-primary hover:underline"
          >
            {t('task.showAll')}
          </button>
        </div>
      )}

      {/* Task List */}
      <div data-animate>
        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('task.noTasks')}
            description={filters.search ? t('task.noResultsDescription') : t('task.noTasksDescription')}
            action={
              !filters.search ? (
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4" />
                  {t('task.add')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onViewDetail={setViewingTask}
            onReorder={isDefaultView ? reorderTasks : undefined}
          />
        )}
      </div>

      {/* Modals */}
      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <DeleteTaskModal task={deletingTask} onClose={() => setDeletingTask(null)} />
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} />
    </div>
  );
}