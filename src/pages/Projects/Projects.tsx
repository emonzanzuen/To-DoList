import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, FolderOpen, Eye, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';
import { useMilestones } from '../../context/MilestoneContext';
import { useClients } from '../../context/ClientContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { formatDate } from '../../utils/dateUtils';
import type { Project } from '../../types/project';

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const { milestones } = useMilestones();
  const { clients } = useClients();
  const { canDeleteProject, user, users } = useAuth();
  const entranceRef = usePageEntrance();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({ name: '', description: '', status: 'active' as Project['status'] });
  const [formClientId, setFormClientId] = useState('');

  // Filter projects berdasarkan membership
  const visibleProjects = useMemo(() => {
    if (!user) return [];
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager';
    if (isAdminOrManager) return projects;
    return projects.filter((p) => p.memberIds.includes(user.id));
  }, [projects, user]);

  // Search filter
  const searchedProjects = useMemo(() => {
    if (!searchQuery.trim()) return visibleProjects;
    const q = searchQuery.toLowerCase();
    return visibleProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q),
    );
  }, [visibleProjects, searchQuery]);

  // Hitung stats per project
  const projectStats = useMemo(() => {
    return searchedProjects.map((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      const total = projectTasks.length;
      const completed = projectTasks.filter((t) => t.status === 'completed').length;
      const inProgress = projectTasks.filter((t) => t.status === 'in_progress').length;
      const overdue = projectTasks.filter((t) => {
        if (!t.dueDate || t.status === 'completed') return false;
        return new Date(`${t.dueDate}T23:59:59`).getTime() < Date.now();
      }).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      const projectMilestones = milestones.filter((m) => m.projectId === project.id);

      const upcomingTasks = projectTasks
        .filter((t) => t.status !== 'completed' && t.dueDate)
        .sort((a, b) => (a.dueDate ?? 'z').localeCompare(b.dueDate ?? 'z'));
      const nearestDeadline = upcomingTasks.length > 0 ? upcomingTasks[0].dueDate : null;

      return {
        project,
        total,
        completed,
        inProgress,
        overdue,
        pct,
        projectMilestones,
        nearestDeadline,
      };
    });
  }, [searchedProjects, tasks, milestones]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingProject) {
      updateProject(
        editingProject.id,
        form.name.trim(),
        form.description.trim(),
        '',
        form.status,
        formClientId,
      );
      setEditingProject(null);
    } else {
      addProject(
        form.name.trim(),
        form.description.trim(),
        '',
        user?.id ?? '',
        formClientId || undefined,
      );
    }
    setForm({ name: '', description: '', status: 'active' });
    setFormClientId('');
    setShowForm(false);
  };

  const handleEdit = (p: Project) => {
    setForm({
      name: p.name,
      description: p.description ?? '',
      status: p.status,
    });
    setFormClientId(p.clientId ?? '');
    setEditingProject(p);
    setShowForm(true);
  };

  const statusBadge: Record<string, string> = {
    active: 'bg-success/10 text-success',
    completed: 'bg-info/10 text-info',
    archived: 'bg-muted/10 text-muted',
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.projects')}</h1>
          <p className="mt-1 text-sm text-muted">{t('project.noProjectsDescription')}</p>
        </div>
        {canDeleteProject && (
          <Button
            size="sm"
            onClick={() => {
              setShowForm(!showForm);
              setEditingProject(null);
              setForm({ name: '', description: '', status: 'active' });
              setFormClientId('');
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? t('common.cancel') : t('project.add')}
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div data-animate className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('project.searchPlaceholder')}
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* Form */}
      {showForm && (
        <div data-animate className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">
            {editingProject ? t('project.edit') : t('project.add')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('project.name')}</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('project.status')}</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as Project['status'] }))}
              >
                <option value="active">{t('project.active')}</option>
                <option value="completed">{t('project.completed')}</option>
                <option value="archived">{t('project.archived')}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">{t('project.client')}</label>
              <select
                className={inputClass}
                value={formClientId}
                onChange={(e) => setFormClientId(e.target.value)}
              >
                <option value="">{t('project.noClient')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` (${c.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">{t('project.description')}</label>
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>
              {editingProject ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </div>
      )}

      {/* Project Cards */}
      <div data-animate>
        {visibleProjects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={t('project.noProjects')}
            description={t('project.noProjectsDescription')}
            action={
              canDeleteProject ? (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  {t('project.add')}
                </Button>
              ) : undefined
            }
          />
        ) : searchedProjects.length === 0 ? (
          <EmptyState
            icon={Search}
            title={t('project.noSearchResults')}
            description={t('project.noSearchResultsDescription')}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectStats.map(({ project: p, total, completed, inProgress, overdue, pct, projectMilestones, nearestDeadline }) => {
              const client = clients.find((c) => c.id === p.clientId);
              return (
                <div key={p.id} className="rounded-2xl border border-line bg-surface p-4 space-y-3">
                  {/* Header Card */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-ink">{p.name}</h3>
                    </div>
                    <Badge className={statusBadge[p.status]}>{t(`project.${p.status}`)}</Badge>
                  </div>

                  {/* Description */}
                  {p.description && (
                    <p className="text-xs text-muted line-clamp-2">{p.description}</p>
                  )}

                  {/* Client Name */}
                  {client && (
                    <p className="text-xs text-primary font-medium truncate">🏢 {client.name}</p>
                  )}

                  <div className="border-t border-line" />

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">{t('dashboard.progress')}</span>
                      <span className="font-medium text-ink">{pct}%</span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>

                  {/* Task Stats */}
                  <div className="grid grid-cols-4 gap-1 text-center">
                    <div className="rounded-lg bg-background p-1.5">
                      <p className="text-lg font-bold text-ink">{total}</p>
                      <p className="text-[10px] text-muted">{t('common.total')}</p>
                    </div>
                    <div className="rounded-lg bg-success/5 p-1.5">
                      <p className="text-lg font-bold text-success">{completed}</p>
                      <p className="text-[10px] text-muted">{t('status.completed')}</p>
                    </div>
                    <div className="rounded-lg bg-info/5 p-1.5">
                      <p className="text-lg font-bold text-info">{inProgress}</p>
                      <p className="text-[10px] text-muted">{t('status.inProgress')}</p>
                    </div>
                    <div className={`rounded-lg p-1.5 ${overdue > 0 ? 'bg-danger/5' : 'bg-background'}`}>
                      <p className={`text-lg font-bold ${overdue > 0 ? 'text-danger' : 'text-ink'}`}>{overdue}</p>
                      <p className="text-[10px] text-muted">{t('task.overdueCount')}</p>
                    </div>
                  </div>

                  {/* Milestones Preview */}
                  {projectMilestones.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t('project.milestones')}</p>
                      {projectMilestones.slice(0, 3).map((m) => {
                        const mTasks = tasks.filter((t) => t.milestone === m.name);
                        const mDone = mTasks.filter((t) => t.status === 'completed').length;
                        const mPct = mTasks.length > 0 ? Math.round((mDone / mTasks.length) * 100) : 0;
                        return (
                          <div key={m.id} className="flex items-center gap-2 text-xs">
                            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                              m.status === 'completed' ? 'bg-success' : m.status === 'in_progress' ? 'bg-info' : 'bg-muted'
                            }`} />
                            <span className="flex-1 truncate text-ink">{m.name}</span>
                            <span className="text-muted">{mPct}%</span>
                          </div>
                        );
                      })}
                      {projectMilestones.length > 3 && (
                        <p className="text-[10px] text-muted pl-3.5">+{projectMilestones.length - 3} {t('milestone.others')}</p>
                      )}
                    </div>
                  )}

                  {/* Team & Deadline */}
                  <div className="flex items-center justify-between text-xs text-muted">
                    <div className="flex items-center gap-1">
                      <span>👥 {p.memberIds.length} {t('project.members')}</span>
                    </div>
                    {nearestDeadline && (
                      <div className={`flex items-center gap-1 ${
                        new Date(`${nearestDeadline}T23:59:59`).getTime() < Date.now() ? 'text-danger font-medium' : ''
                      }`}>
                        📅 {formatDate(nearestDeadline, i18n.language)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1 border-t border-line pt-2">
                    <button
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                      title={t('common.detail')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {canDeleteProject && (
                      <>
                        <button
                          onClick={() => handleEdit(p)}
                          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProject(p)}
                          className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingProject}
        title={t('project.deleteConfirmTitle')}
        message={t('project.deleteConfirmMessage', { name: deletingProject?.name ?? '' })}
        onConfirm={() => {
          if (deletingProject) deleteProject(deletingProject.id);
          setDeletingProject(null);
        }}
        onClose={() => setDeletingProject(null)}
      />
    </div>
  );
}