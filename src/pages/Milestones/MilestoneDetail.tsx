import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, CheckCircle2, Users, Flag } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useMilestones } from '../../context/MilestoneContext';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { formatDate } from '../../utils/dateUtils';
import type { MilestoneStatus } from '../../types/milestone';

export default function MilestoneDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { milestones } = useMilestones();
  const { tasks, toggleTask } = useTasks();
  const { projects } = useProjects();
  const { user, users, canSeeAllTasks } = useAuth();
  const entranceRef = usePageEntrance();

  const milestone = milestones.find((m) => m.id === id);

  const milestoneTasks = useMemo(() => {
    if (!milestone) return [];
    return tasks.filter(
      (t) => t.milestone === milestone.name || t.milestone === milestone.id,
    );
  }, [tasks, milestone]);

  const stats = useMemo(() => {
    const total = milestoneTasks.length;
    const completed = milestoneTasks.filter((t) => t.status === 'completed').length;
    const inProgress = milestoneTasks.filter((t) => t.status === 'in_progress').length;
    const pending = milestoneTasks.filter((t) => t.status === 'pending').length;
    const overdue = milestoneTasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(`${t.dueDate}T23:59:59`).getTime() < Date.now();
    }).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, overdue, pct };
  }, [milestoneTasks]);

  const project = milestone ? projects.find((p) => p.id === milestone.projectId) : null;

  if (!milestone) {
    return (
      <div ref={entranceRef} className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/milestones')}>
          <ArrowLeft className="h-4 w-4" /> {t('milestone.backToList')}
        </Button>
        <EmptyState icon={Flag} title={t('milestone.notFound')} description={t('milestone.notFoundDescription')} />
      </div>
    );
  }

  const statusBadge: Record<MilestoneStatus, string> = {
    pending: 'bg-muted/10 text-muted',
    in_progress: 'bg-info/10 text-info',
    completed: 'bg-success/10 text-success',
  };

  const overdue = milestone.dueDate && milestone.status !== 'completed'
    ? new Date(`${milestone.dueDate}T23:59:59`).getTime() < Date.now()
    : false;

  const priorityColors: Record<string, string> = {
    urgent: 'text-danger font-semibold',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-400',
  };

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Back Button */}
      <Button variant="secondary" size="sm" onClick={() => navigate('/milestones')}>
        <ArrowLeft className="h-4 w-4" /> {t('milestone.backToList')}
      </Button>

      {/* Milestone Header */}
      <div data-animate className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold text-ink">{milestone.name}</h1>
              <Badge className={statusBadge[milestone.status]}>
                {milestone.status.replace('_', ' ')}
              </Badge>
            </div>
            {project && (
              <p className="text-sm text-muted">📁 {project.name}</p>
            )}
            {milestone.description && (
              <p className="text-sm text-muted">{milestone.description}</p>
            )}
          </div>
        </div>

        {/* Meta Info */}
        {milestone.dueDate && (
          <div className={`flex items-center gap-1 text-sm ${overdue ? 'font-medium text-danger' : 'text-muted'}`}>
            <Calendar className="h-4 w-4" />
            {t('milestone.deadline')}: {formatDate(milestone.dueDate, i18n.language)}
            {overdue && ` · ${t('task.overdue')}`}
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{t('milestone.overallProgress')}</span>
            <span className="font-bold text-ink">{stats.pct}%</span>
          </div>
          <ProgressBar value={stats.pct} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="rounded-lg bg-background p-2">
            <p className="text-lg font-bold text-ink">{stats.total}</p>
            <p className="text-[10px] text-muted">{t('common.total')}</p>
          </div>
          <div className="rounded-lg bg-success/5 p-2">
            <p className="text-lg font-bold text-success">{stats.completed}</p>
            <p className="text-[10px] text-muted">{t('status.completed')}</p>
          </div>
          <div className="rounded-lg bg-info/5 p-2">
            <p className="text-lg font-bold text-info">{stats.inProgress}</p>
            <p className="text-[10px] text-muted">{t('status.inProgress')}</p>
          </div>
          <div className="rounded-lg bg-muted/5 p-2">
            <p className="text-lg font-bold text-muted">{stats.pending}</p>
            <p className="text-[10px] text-muted">{t('status.pending')}</p>
          </div>
          <div className={`rounded-lg p-2 ${stats.overdue > 0 ? 'bg-danger/5' : 'bg-background'}`}>
            <p className={`text-lg font-bold ${stats.overdue > 0 ? 'text-danger' : 'text-ink'}`}>{stats.overdue}</p>
            <p className="text-[10px] text-muted">{t('task.overdueCount')}</p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div data-animate>
        <h2 className="mb-3 text-sm font-semibold text-ink">
          {t('milestone.tasksInMilestone', { count: stats.total })}
        </h2>

        {milestoneTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={t('milestone.noTasks')}
            description={t('milestone.noTasksDescription')}
          />
        ) : (
          <div className="space-y-2">
            {milestoneTasks.map((task) => {
              const isMyTask = user ? task.assigneeIds.includes(user.id) : false;
              const canInteract = isMyTask || canSeeAllTasks;
              const taskOverdue = task.dueDate && task.status !== 'completed'
                ? new Date(`${task.dueDate}T23:59:59`).getTime() < Date.now()
                : false;

              const clDone = task.checklist.filter((c) => c.done).length;
              const clTotal = task.checklist.length;
              const clPct = clTotal > 0 ? Math.round((clDone / clTotal) * 100) : 0;

              const assigneeDisplay = task.assigneeIds.length === 0
                ? t('task.unassigned')
                : task.assigneeIds
                    .map((aid) => {
                      const u = users.find((usr) => usr.id === aid);
                      return u?.name.split(' ')[0];
                    })
                    .filter(Boolean)
                    .join(', ') || 'Unknown';

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border p-4 space-y-2 ${
                    task.status === 'completed'
                      ? 'border-success/20 bg-success/5 opacity-75'
                      : taskOverdue
                        ? 'border-danger/30 bg-danger/5'
                        : 'border-line bg-surface'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {canInteract ? (
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                            task.status === 'completed'
                              ? 'border-success bg-success text-white'
                              : 'border-line hover:border-primary'
                          }`}
                        >
                          {task.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                        </button>
                      ) : (
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-line bg-muted/10" title={t('task.notYourTask')}>
                          <span className="text-[8px] text-muted">🔒</span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-muted line-through' : 'text-ink'}`}>
                          {task.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                          <span className={priorityColors[task.priority] ?? ''}>
                            {task.priority.toUpperCase()}
                          </span>
                          {task.dueDate && (
                            <span className={taskOverdue ? 'text-danger font-medium' : ''}>
                              📅 {formatDate(task.dueDate, i18n.language)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {assigneeDisplay}
                          </span>
                          {clTotal > 0 && (
                            <span>☑️ {clDone}/{clTotal}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Badge className={
                      task.status === 'completed' ? 'bg-success/10 text-success' :
                      task.status === 'in_progress' ? 'bg-info/10 text-info' :
                      task.status === 'waiting' ? 'bg-warning/10 text-warning' :
                      'bg-muted/10 text-muted'
                    }>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Checklist Progress Bar */}
                  {clTotal > 0 && (
                    <div className="pl-8">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${clPct}%` }} />
                        </div>
                        <span className="text-[10px] text-muted">{clPct}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}