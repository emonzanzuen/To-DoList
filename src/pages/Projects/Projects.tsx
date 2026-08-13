import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Pencil, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import type { Project } from '../../types/project';

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { projects, addProject, updateProject, deleteProject } = useProjects();
  const { canDeleteProject } = useAuth();
  const entranceRef = usePageEntrance();

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', milestone: '', status: 'active' as Project['status'] });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editingProject) {
      updateProject(
        editingProject.id,
        form.name.trim(),
        form.description.trim(),
        form.milestone.trim(),
        form.status,
      );
      setEditingProject(null);
    } else {
      addProject(
        form.name.trim(),
        form.description.trim(),
        form.milestone.trim(),
      );
    }
    setForm({ name: '', description: '', milestone: '', status: 'active' });
    setShowForm(false);
  };

  const handleEdit = (p: Project) => {
    setForm({
      name: p.name,
      description: p.description ?? '',
      milestone: p.milestone ?? '',
      status: p.status,
    });
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
              setForm({ name: '', description: '', milestone: '', status: 'active' });
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showForm ? t('common.cancel') : t('project.add')}
          </Button>
        )}
      </div>

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
              <label className="mb-1 block text-xs font-medium text-muted">{t('project.milestone')}</label>
              <input
                className={inputClass}
                value={form.milestone}
                onChange={(e) => setForm((p) => ({ ...p, milestone: e.target.value }))}
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
            <div>
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

      <div data-animate>
        {projects.length === 0 ? (
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
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="rounded-2xl border border-line bg-surface p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-ink">{p.name}</h3>
                  <Badge className={statusBadge[p.status]}>{t(`project.${p.status}`)}</Badge>
                </div>
                {p.description && <p className="text-xs text-muted line-clamp-2">{p.description}</p>}
                {p.milestone && <p className="text-xs text-muted">🎯 {p.milestone}</p>}
                {canDeleteProject && (
                  <div className="flex justify-end gap-1 pt-2 border-t border-line">
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
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

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