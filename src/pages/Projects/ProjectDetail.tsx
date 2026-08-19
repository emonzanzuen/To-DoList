import { useParams, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, CheckCircle2, Users, FolderOpen, X, Plus, Target, ListChecks, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';
import { useMilestones } from '../../context/MilestoneContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { formatDate } from '../../utils/dateUtils';
import type { ProjectStatus } from '../../types/project';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { projects, inviteMember, removeMember } = useProjects();
  const { tasks, toggleTask } = useTasks();
  const { milestones } = useMilestones();
  const { user, users, canDeleteProject } = useAuth();
  const entranceRef = usePageEntrance();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const project = projects.find((p) => p.id === id);

  const isUserMember = user ? project?.memberIds.includes(user.id) : false;
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const canAccess = isAdminOrManager || isUserMember;

  // Auto-sync: ensure admin & manager are always in memberIds
  useEffect(() => {
    if (!project || !user) return;
    const adminManagerIds = users
      .filter((u) => u.role === 'admin' || u.role === 'manager')
      .map((u) => u.id);
    const missingIds = adminManagerIds.filter((aid) => !project.memberIds.includes(aid));
    if (missingIds.length > 0) {
      missingIds.forEach((uid) => inviteMember(project.id, uid));
    }
  }, [project?.id, users, inviteMember]);

  const projectTasks = useMemo(() => {
    if (!project) return [];
    return tasks.filter((t) => t.projectId === project.id);
  }, [tasks, project]);

  const stats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'completed').length;
    const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
    const pending = projectTasks.filter((t) => t.status === 'pending').length;
    const overdue = projectTasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed') return false;
      return new Date(`${t.dueDate}T23:59:59`).getTime() < Date.now();
    }).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, overdue, pct };
  }, [projectTasks]);

  const projectMilestones = useMemo(() => {
    if (!project) return [];
    return milestones.filter((m) => m.projectId === project.id);
  }, [milestones, project]);

  // Members: project memberIds + admin/manager (always visible)
  const members = useMemo(() => {
    if (!project) return [];
    return users.filter((u) => {
      if (project.memberIds.includes(u.id)) return true;
      if (u.role === 'admin' || u.role === 'manager') return true;
      return false;
    });
  }, [users, project]);

  if (!project || !canAccess) {
    return (
      <div ref={entranceRef} className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>
          <ArrowLeft className="h-4 w-4" /> {t('project.backToList')}
        </Button>
        <EmptyState
          icon={FolderOpen}
          title={t('project.notFoundOrNoAccess')}
          description={t('project.noAccessDescription')}
        />
      </div>
    );
  }

  const statusBadge: Record<ProjectStatus, string> = {
    active: 'bg-success/10 text-success',
    completed: 'bg-info/10 text-info',
    archived: 'bg-muted/10 text-muted',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'text-danger font-semibold',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-400',
  };

  const handleInvite = () => {
    selectedUserIds.forEach((uid) => inviteMember(project.id, uid));
    setSelectedUserIds([]);
    setShowInviteModal(false);
  };

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Back Button */}
      <Button variant="secondary" size="sm" onClick={() => navigate('/projects')}>
        <ArrowLeft className="h-4 w-4" /> {t('project.backToList')}
      </Button>

      {/* Project Header */}
      <div data-animate className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold text-ink">{project.name}</h1>
              <Badge className={statusBadge[project.status]}>
                {t(`project.${project.status}`)}
              </Badge>
            </div>
            {project.description && (
              <p className="text-sm text-muted">{project.description}</p>
            )}
          </div>
          {canDeleteProject && (
            <Button size="sm" variant="secondary" onClick={() => navigate('/projects')}>
              <X className="h-4 w-4" /> {t('common.edit')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Calendar className="h-3.5 w-3.5" />
          {t('project.createdDate')}: {formatDate(project.createdAt.split('T')[0], i18n.language)}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{t('project.overallProgress')}</span>
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

      {/* Team Members */}
      <div data-animate className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
            <Users className="h-4 w-4" /> {t('project.teamMembers', { count: members.length })}
          </h2>
          {isAdminOrManager && (
            <Button size="sm" onClick={() => setShowInviteModal(true)}>
              <Plus className="h-4 w-4" /> {t('project.invite')}
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <p className="text-xs text-muted">{t('project.noMembers')}</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => {
              const initials = m.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
              const isAutoMember = m.role === 'admin' || m.role === 'manager';
              const canRemove = !isAutoMember && isAdminOrManager && m.id !== user?.id;
              const roleBadge: Record<string, string> = {
                admin: 'bg-danger/10 text-danger',
                manager: 'bg-warning/10 text-warning',
                member: 'bg-info/10 text-info',
              };
              return (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-line bg-background p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${m.avatarColor}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{m.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge className={roleBadge[m.role]}>{t(`auth.role.${m.role}`)}</Badge>
                        <span className="text-[10px] text-muted">{m.team}</span>
                        {isAutoMember && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                            {t('project.autoMember')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {canRemove && (
                    <button
                      onClick={() => removeMember(project.id, m.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                      title={t('project.removeFromProject')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Milestones */}
      <div data-animate className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Target className="h-4 w-4" /> {t('project.milestones')} ({projectMilestones.length})
        </h2>

        {projectMilestones.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-6 text-center">
            <p className="text-sm text-muted">{t('project.noMilestones')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projectMilestones.map((m) => {
              const mTasks = tasks.filter((t) => t.milestone === m.name);
              const mCompleted = mTasks.filter((t) => t.status === 'completed').length;
              const mTotal = mTasks.length;
              const mPct = mTotal > 0 ? Math.round((mCompleted / mTotal) * 100) : 0;
              const mOverdue = m.dueDate && m.status !== 'completed'
                ? new Date(`${m.dueDate}T23:59:59`).getTime() < Date.now()
                : false;

              const msBadge: Record<string, string> = {
                pending: 'bg-muted/10 text-muted',
                in_progress: 'bg-info/10 text-info',
                completed: 'bg-success/10 text-success',
              };

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border bg-surface p-4 space-y-3 cursor-pointer hover:border-primary/30 transition-colors ${
                    mOverdue ? 'border-danger/40' : 'border-line'
                  }`}
                  onClick={() => navigate(`/milestones/${m.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-ink">{m.name}</h3>
                      {m.description && (
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{m.description}</p>
                      )}
                    </div>
                    <Badge className={msBadge[m.status]}>{m.status.replace('_', ' ')}</Badge>
                  </div>

                  {m.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${mOverdue ? 'font-medium text-danger' : 'text-muted'}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(m.dueDate, i18n.language)}
                      {mOverdue && ` · ${t('task.overdue')}`}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">{mCompleted}/{mTotal} tasks</span>
                      <span className="font-medium text-ink">{mPct}%</span>
                    </div>
                    <ProgressBar value={mPct} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tasks Terbaru */}
      <div data-animate className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <ListChecks className="h-4 w-4" /> {t('project.recentTasks', { shown: Math.min(projectTasks.length, 5), total: stats.total })}
        </h2>

        {projectTasks.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-6 text-center">
            <p className="text-sm text-muted">{t('project.noTasks')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {projectTasks.slice(0, 5).map((task) => {
              const isMyTask = user ? task.assigneeIds.includes(user.id) : false;
              const canInteract = isMyTask || isAdminOrManager;
              const taskOverdue = task.dueDate && task.status !== 'completed'
                ? new Date(`${task.dueDate}T23:59:59`).getTime() < Date.now()
                : false;

              const clDone = task.checklist.filter((c) => c.done).length;
              const clTotal = task.checklist.length;

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
                          <Lock className="h-3 w-3 text-muted" />
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
                            <span className={`flex items-center gap-1 ${taskOverdue ? 'text-danger font-medium' : ''}`}>
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.dueDate, i18n.language)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {assigneeDisplay}
                          </span>
                          {clTotal > 0 && (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              {clDone}/{clTotal}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <Badge className={
                      task.status === 'completed' ? 'bg-success/10 text-success' :
                      task.status === 'in_progress' ? 'bg-info/10 text-info' :
                      task.status === 'waiting_approval' ? 'bg-warning/10 text-warning' :
                      'bg-muted/10 text-muted'
                    }>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title={t('project.inviteTitle')}>
        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-sm text-muted text-center py-4">{t('project.noUsersAvailable')}</p>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1 scrollbar-thin">
              {users.map((u) => {
                const isAlreadyMember = project.memberIds.includes(u.id);
                const isAdminOrMgr = u.role === 'admin' || u.role === 'manager';
                const isDisabled = isAlreadyMember || isAdminOrMgr;
                const isChecked = selectedUserIds.includes(u.id);

                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : isChecked
                          ? 'bg-primary/5 text-primary cursor-pointer hover:bg-primary/10'
                          : 'text-ink cursor-pointer hover:bg-background'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked || isDisabled}
                      disabled={isDisabled}
                      onChange={() => {
                        if (isDisabled) return;
                        setSelectedUserIds((prev) =>
                          isChecked ? prev.filter((id) => id !== u.id) : [...prev, u.id],
                        );
                      }}
                      className="h-4 w-4 rounded border-line text-primary focus:ring-primary/40 disabled:opacity-50"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted">
                        {t(`auth.role.${u.role}`)} · {u.team}
                      </p>
                    </div>
                    {isAlreadyMember && !isAdminOrMgr && (
                      <span className="text-[10px] font-medium text-success">{t('project.alreadyMember')}</span>
                    )}
                    {isAdminOrMgr && (
                      <span className="text-[10px] font-medium text-muted">{t('project.autoMember')}</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowInviteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleInvite} disabled={selectedUserIds.length === 0}>
              {t('project.inviteAction', { count: selectedUserIds.length })}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}