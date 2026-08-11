import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, ListTodo, Plus, Star, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/dashboard/StatCard';
import { TaskList } from '../../components/task/TaskList';
import { AddTaskModal } from '../../components/task/AddTaskModal';
import { EditTaskModal } from '../../components/task/EditTaskModal';
import { DeleteTaskModal } from '../../components/task/DeleteTaskModal';
import { useTasks } from '../../context/TaskContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { getProgress } from '../../utils/taskUtils';
import { getGreetingKey } from '../../utils/dateUtils';
import type { Task } from '../../types/task';

export default function Dashboard() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin } = useTasks(); // ← tambah togglePin
  const entranceRef = usePageEntrance();

  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const completed = useMemo(
    () => tasks.filter((task) => task.status === 'completed').length,
    [tasks],
  );
  const pending = tasks.length - completed;
  const progress = getProgress(tasks);

  // ← BARU: Pinned tasks (max 5, hanya yang pending)
  const pinnedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.isPinned && task.status === 'pending')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [tasks],
  );

  const recent = useMemo(
    () =>
      [...tasks]
        .filter((task) => !task.isPinned) // ← exclude pinned dari recent
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
    [tasks],
  );

  return (
    <div ref={entranceRef} className="space-y-8">
      {/* Header */}
      <div
        data-animate
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {t(getGreetingKey())} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('task.add')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label={t('dashboard.totalTasks')}
          value={tasks.length}
          iconClass="bg-primary/10 text-primary"
        />
        <StatCard
          icon={CheckCircle2}
          label={t('dashboard.completed')}
          value={completed}
          iconClass="bg-success/10 text-success"
        />
        <StatCard
          icon={Clock}
          label={t('dashboard.pending')}
          value={pending}
          iconClass="bg-warning/10 text-warning"
        />
        <div data-animate className="rounded-2xl border border-line bg-surface p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-2xl font-bold text-ink">{progress}%</p>
          <p className="mt-1 text-sm text-muted">{t('dashboard.progress')}</p>
          <div className="mt-3">
            <ProgressBar value={progress} />
          </div>
        </div>
      </div>

      {/* ← BARU: Pinned Tasks Section */}
      {pinnedTasks.length > 0 && (
        <section data-animate className="space-y-4">
          <div className="flex items-center gap-2">
            <Star
              className="h-5 w-5 text-warning"
              aria-hidden="true"
              fill="currentColor"
            />
            <h2 className="text-lg font-semibold text-ink">
              {t('dashboard.pinnedTasks')}
            </h2>
          </div>
          <TaskList
            tasks={pinnedTasks}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
          />
        </section>
      )}

      {/* Recent Tasks */}
      <section data-animate className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">
            {t('dashboard.recentTasks')}
          </h2>
          <Link
            to="/tasks"
            className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
          >
            {t('common.viewAll')}
          </Link>
        </div>
        {recent.length === 0 ? (
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
          <TaskList
            tasks={recent}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
          />
        )}
      </section>

      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <DeleteTaskModal task={deletingTask} onClose={() => setDeletingTask(null)} />
    </div>
  );
}