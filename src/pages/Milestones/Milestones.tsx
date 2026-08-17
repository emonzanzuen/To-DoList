import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, Flag, Calendar, CheckCircle2, Clock, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useMilestones } from '../../context/MilestoneContext';
import { useTasks } from '../../context/TaskContext';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { formatDate } from '../../utils/dateUtils';
import type { Milestone, MilestoneFormData, MilestoneStatus } from '../../types/milestone';

export default function MilestonesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { milestones, addMilestone, updateMilestone, deleteMilestone } = useMilestones();
  const { tasks } = useTasks();
  const { projects } = useProjects();
  const { canDeleteProject, user } = useAuth();
  const entranceRef = usePageEntrance();

  const [showForm, setShowForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null);
  const [form, setForm] = useState<MilestoneFormData>({
    name: '',
    description: '',
    projectId: '',
    dueDate: '',
    status: 'pending',
  });

  // Filter milestones berdasarkan membership project
  const visibleMilestones = useMemo(() => {
    if (!user) return [];
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager';
    if (isAdminOrManager) return milestones;
    return milestones.filter((m) => {
      if (!m.projectId) return true;
      const project = projects.find((p) => p.id === m.projectId);
      return project?.memberIds.includes(user.id) ?? false;
    });
  }, [milestones, projects, user]);

  const milestoneStats = useMemo(() => {
    return visibleMilestones.map((m) => {
      const relatedTasks = tasks.filter(
        (task) => task.milestone === m.name || task.milestone === m.id,
      );
      const total = relatedTasks.length;
      const completed = relatedTasks.filter((t) => t.status === 'completed').length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { milestone: m, total, completed, pct };
    });
  }, [visibleMilestones, tasks]);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingMilestone) {
      updateMilestone(editingMilestone.id, form);
      setEditingMilestone(null);
    } else {
      addMilestone(form);
    }
    setForm({ name: '', description: '', projectId: '', dueDate: '', status: 'pending' });
    setShowForm(false);
  };

  const handleEdit = (m: Milestone) => {
    setForm({
      name: m.name,
      description: m.description ?? '',
      projectId: m.projectId ?? '',
      dueDate: m.dueDate ?? '',
      status: m.status,
    });
    setEditingMilestone(m);
    setShowForm(true);
  };

  const statusBadge: Record<MilestoneStatus, string> = {
    pending: 'bg-muted/10 text-muted',
    in_progress: 'bg-info/10 text-info',
    completed: 'bg-success/10 text-success',
  };

  const statusIcon: Record<MilestoneStatus, typeof Clock> = {
    pending: Clock,
    in_progress: AlertTriangle,
    completed: CheckCircle2,
  };

  const inputClass =
    'w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-ink placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40';

  const canModify = canDeleteProject;

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('milestone.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('milestone.subtitle')}</p>
        </div>
        {canModify && (
          <Button
            size="sm"
            onClick={() => {
              setShowForm(!showForm);
              setEditingMilestone(null);
              setForm({ name: '', description: '', projectId: '', dueDate: '', status: 'pending' });
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? t('common.cancel') : t('milestone.add')}
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div data-animate className="space-y-4 rounded-2xl border border-line bg-surface p-5">
          <h2 className="text-sm font-semibold text-ink">
            {editingMilestone ? t('milestone.edit') : t('milestone.add')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('milestone.name')}</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={t('milestone.namePlaceholder')}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('milestone.project')}</label>
              <select
                className={inputClass}
                value={form.projectId}
                onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
              >
                <option value="">{t('milestone.noProject')}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('milestone.dueDate')}</label>
              <input
                type="date"
                className={inputClass}
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">{t('milestone.status')}</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as MilestoneStatus }))}
              >
                <option value="pending">{t('milestone.statusPending')}</option>
                <option value="in_progress">{t('milestone.statusInProgress')}</option>
                <option value="completed">{t('milestone.statusCompleted')}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-muted">{t('milestone.description')}</label>
              <input
                className={inputClass}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder={t('milestone.descriptionPlaceholder')}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowForm(false)}>
              {t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>
              {editingMilestone ? t('common.save') : t('common.create')}
            </Button>
          </div>
        </div>
      )}

      {/* Milestone Cards */}
      <div data-animate>
        {visibleMilestones.length === 0 ? (
          <EmptyState
            icon={Flag}
            title={t('milestone.empty')}
            description={t('milestone.emptyDescription')}
            action={
              canModify ? (
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  {t('milestone.add')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {milestoneStats.map(({ milestone: m, total, completed, pct }) => {
              const StatusIcon = statusIcon[m.status];
              const overdue =
                m.dueDate && m.status !== 'completed'
                  ? new Date(`${m.dueDate}T23:59:59`).getTime() < Date.now()
                  : false;
              const projectName = projects.find((p) => p.id === m.projectId)?.name;

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border bg-surface p-4 space-y-3 ${
                    overdue ? 'border-danger/40' : 'border-line'
                  }`}
                >
                  {/* Header Card */}
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-ink">{m.name}</h3>
                      {projectName && (
                        <p className="truncate text-xs text-muted mt-0.5">📁 {projectName}</p>
                      )}
                    </div>
                    <Badge className={statusBadge[m.status]}>
                      <StatusIcon className="h-3 w-3" />
                      {m.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Description */}
                  {m.description && (
                    <p className="text-xs text-muted line-clamp-2">{m.description}</p>
                  )}

                  {/* Deadline */}
                  {m.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${overdue ? 'font-medium text-danger' : 'text-muted'}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(m.dueDate, i18n.language)}
                      {overdue && ` · ${t('task.overdue')}`}
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">{t('milestone.progressTask')}</span>
                      <span className="font-medium text-ink">
                        {completed}/{total} ({pct}%)
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-1 border-t border-line pt-2">
                    <button
                      onClick={() => navigate(`/milestones/${m.id}`)}
                      className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                      title={t('common.detail')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {canModify && (
                      <>
                        <button
                          onClick={() => handleEdit(m)}
                          className="rounded-lg p-1.5 text-muted hover:bg-background hover:text-ink"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingMilestone(m)}
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
        open={!!deletingMilestone}
        title={t('milestone.deleteConfirmTitle')}
        message={t('milestone.deleteConfirmMessage', { name: deletingMilestone?.name ?? '' })}
        onConfirm={() => {
          if (deletingMilestone) deleteMilestone(deletingMilestone.id);
          setDeletingMilestone(null);
        }}
        onClose={() => setDeletingMilestone(null)}
      />
    </div>
  );
}