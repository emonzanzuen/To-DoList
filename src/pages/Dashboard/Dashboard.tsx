import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Clock, ListTodo, Plus, Star, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatCard } from '../../components/dashboard/StatCard';
import { SimpleChart } from '../../components/dashboard/SimpleChart';
import { BurndownChart } from '../../components/dashboard/BurndownChart';
import { TeamWorkload } from '../../components/dashboard/TeamWorkload';
import { TaskList } from '../../components/task/TaskList';
import { AddTaskModal } from '../../components/task/AddTaskModal';
import { EditTaskModal } from '../../components/task/EditTaskModal';
import { DeleteTaskModal } from '../../components/task/DeleteTaskModal';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { getProgress } from '../../utils/taskUtils';
import { getGreetingKey } from '../../utils/dateUtils';
import type { Task } from '../../types/task';

export default function Dashboard() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin } = useTasks();
  const { user, isAdmin, isManager } = useAuth();
  const entranceRef = usePageEntrance();

  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [showPendingApproval, setShowPendingApproval] = useState(false);

  const completed = useMemo(() => tasks.filter((t) => t.status === 'completed').length, [tasks]);
  const inProgress = useMemo(() => tasks.filter((t) => t.status === 'in_progress').length, [tasks]);
  const waiting = useMemo(() => tasks.filter((t) => t.status === 'waiting').length, [tasks]);
  const overdue = useMemo(
    () => tasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(`${t.dueDate}T23:59:59`).getTime() < Date.now();
    }).length,
    [tasks],
  );
  const progress = getProgress(tasks);
  const pending = tasks.length - completed;

  const myTasks = useMemo(
    () => user ? tasks.filter((t) => t.assigneeIds.includes(user.id)) : [],
    [tasks, user],
  );
  const myPending = myTasks.filter((t) => t.status !== 'completed');
  const myCompletedCount = myTasks.filter((t) => t.status === 'completed').length;
  const myInProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;
  const myOverdueCount = myTasks.filter((t) => {
    if (!t.dueDate || t.status === 'completed') return false;
    return new Date(`${t.dueDate}T23:59:59`).getTime() < Date.now();
  }).length;

  const pendingApprovalTasks = useMemo(
    () => tasks.filter((t) => t.approvalStatus === 'pending'),
    [tasks],
  );

  const pinnedTasks = useMemo(
    () => tasks.filter((t) => t.isPinned && t.status !== 'completed').sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    [tasks],
  );
  const recent = useMemo(
    () => [...tasks].filter((t) => !t.isPinned).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [tasks],
  );

  const statusChartData = useMemo(() => [
    { label: t('dashboard.completed'), value: completed, color: '#22c55e' },
    { label: t('dashboard.inProgress'), value: inProgress, color: '#0ea5e9' },
    { label: t('dashboard.pending'), value: Math.max(0, pending - inProgress - waiting), color: '#94a3b8' },
    { label: t('dashboard.waiting'), value: waiting, color: '#f59e0b' },
    { label: t('dashboard.overdue'), value: overdue, color: '#ef4444' },
  ], [completed, inProgress, pending, waiting, overdue, t]);

  const priorityChartData = useMemo(() => [
    { label: t('priority.urgent'), value: tasks.filter((t) => t.priority === 'urgent').length, color: '#ef4444' },
    { label: t('priority.high'), value: tasks.filter((t) => t.priority === 'high').length, color: '#f97316' },
    { label: t('priority.medium'), value: tasks.filter((t) => t.priority === 'medium').length, color: '#eab308' },
    { label: t('priority.low'), value: tasks.filter((t) => t.priority === 'low').length, color: '#3b82f6' },
  ], [tasks, t]);

  return (
    <div ref={entranceRef} className="space-y-8">
      <div data-animate className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t(getGreetingKey())} 👋</h1>
          <p className="mt-1 text-sm text-muted">{t('dashboard.subtitle')}</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t('task.add')}
        </Button>
      </div>

      {/* ====== ADMIN DASHBOARD ====== */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={ListTodo} label={t('dashboard.totalTasks')} value={tasks.length} iconClass="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle2} label={t('dashboard.completed')} value={completed} iconClass="bg-success/10 text-success" />
            <StatCard icon={AlertTriangle} label={t('dashboard.overdue')} value={overdue} iconClass="bg-danger/10 text-danger" />
            <div data-animate className="rounded-2xl border border-line bg-surface p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 text-info"><TrendingUp className="h-5 w-5" /></div>
              <p className="text-2xl font-bold text-ink">{progress}%</p>
              <p className="mt-1 text-sm text-muted">{t('dashboard.progress')}</p>
              <div className="mt-3"><ProgressBar value={progress} /></div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SimpleChart title={t('dashboard.taskDistribution')} data={statusChartData} />
            <SimpleChart title={t('dashboard.priorityDistribution')} data={priorityChartData} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <BurndownChart tasks={tasks} title={t('dashboard.burndown')} />
            <TeamWorkload tasks={tasks} title={t('dashboard.teamWorkload')} />
          </div>
        </>
      )}

      {/* ====== MANAGER DASHBOARD ====== */}
      {!isAdmin && isManager && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard icon={ListTodo} label={t('dashboard.totalTasks')} value={tasks.length} iconClass="bg-primary/10 text-primary" />
            <StatCard icon={CheckCircle2} label={t('dashboard.completed')} value={completed} iconClass="bg-success/10 text-success" />
            <StatCard icon={Clock} label={t('dashboard.inProgress')} value={inProgress} iconClass="bg-info/10 text-info" />
            <StatCard icon={AlertTriangle} label={t('dashboard.overdue')} value={overdue} iconClass="bg-danger/10 text-danger" />
            {/* Card Menunggu Approval — Clickable */}
            <button
              type="button"
              onClick={() => setShowPendingApproval(!showPendingApproval)}
              className={`rounded-2xl border p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/50 ${
                showPendingApproval
                  ? 'border-warning bg-warning/5 shadow-md'
                  : 'border-line bg-surface hover:border-warning/40 hover:shadow-md'
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning">
                <Clock className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-ink">{pendingApprovalTasks.length}</p>
              <p className="mt-1 text-sm text-muted">{t('dashboard.waiting')}</p>
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SimpleChart title={t('dashboard.taskDistribution')} data={statusChartData} />
            <SimpleChart title={t('dashboard.priorityDistribution')} data={priorityChartData} />
          </div>
        </>
      )}

      {/* ====== MEMBER DASHBOARD ====== */}
      {!isAdmin && !isManager && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={ListTodo} label={t('dashboard.myTasksCount')} value={myPending.length} iconClass="bg-primary/10 text-primary" />
          <StatCard icon={CheckCircle2} label={t('dashboard.completed')} value={myCompletedCount} iconClass="bg-success/10 text-success" />
          <StatCard icon={Clock} label={t('dashboard.inProgress')} value={myInProgressCount} iconClass="bg-info/10 text-info" />
          <StatCard icon={AlertTriangle} label={t('dashboard.overdue')} value={myOverdueCount} iconClass="bg-danger/10 text-danger" />
        </div>
      )}

      {/* Pending Approval List — Hanya Manager, muncul saat card diklik */}
      {!isAdmin && isManager && showPendingApproval && pendingApprovalTasks.length > 0 && (
        <section data-animate className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">
              Task Menunggu Approval ({pendingApprovalTasks.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowPendingApproval(false)}
              className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
            >
              {t('common.close') || 'Tutup'}
            </button>
          </div>
          <TaskList
            tasks={pendingApprovalTasks}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onViewDetail={setViewingTask}
          />
        </section>
      )}

      {/* My Tasks Section */}
      {user && myPending.length > 0 && (
        <section data-animate className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">{t('dashboard.myTasks', { name: user.name.split(' ')[0] })}</h2>
            <Link to="/tasks" className="text-sm font-medium text-primary transition-colors hover:text-primary-hover">{t('common.viewAll')}</Link>
          </div>
          <TaskList
            tasks={myPending.slice(0, 5)}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onViewDetail={setViewingTask}
          />
        </section>
      )}

      {/* Pinned Tasks */}
      {pinnedTasks.length > 0 && (
        <section data-animate className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-warning" aria-hidden="true" fill="currentColor" />
            <h2 className="text-lg font-semibold text-ink">{t('dashboard.pinnedTasks')}</h2>
          </div>
          <TaskList
            tasks={pinnedTasks}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onViewDetail={setViewingTask}
          />
        </section>
      )}

      {/* Recent Tasks */}
      <section data-animate className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">{t('dashboard.recentTasks')}</h2>
          <Link to="/tasks" className="text-sm font-medium text-primary transition-colors hover:text-primary-hover">{t('common.viewAll')}</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={ListTodo} title={t('task.noTasks')} description={t('task.noTasksDescription')} action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />{t('task.add')}</Button>} />
        ) : (
          <TaskList
            tasks={recent}
            onToggle={toggleTask}
            onTogglePin={togglePin}
            onEdit={setEditingTask}
            onDelete={setDeletingTask}
            onViewDetail={setViewingTask}
          />
        )}
      </section>

      {/* Modals */}
      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <DeleteTaskModal task={deletingTask} onClose={() => setDeletingTask(null)} />
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} />
    </div>
  );
}