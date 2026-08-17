import { useParams, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Building2, Mail, Phone, MapPin, StickyNote, Briefcase, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useClients } from '../../context/ClientContext';
import { useProjects } from '../../context/ProjectContext';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { formatDate } from '../../utils/dateUtils';

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { getClientById } = useClients();
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { user, canManageClients } = useAuth();
  const entranceRef = usePageEntrance();

  const client = getClientById(id ?? '');

  // Cek akses: Admin/Manager bisa lihat semua, Member hanya lihat client project-nya
  const canAccess = useMemo(() => {
    if (!user || !client) return false;
    if (canManageClients) return true;
    const myProjects = projects.filter((p) => p.memberIds.includes(user.id));
    return myProjects.some((p) => p.clientId === client.id);
  }, [user, client, projects, canManageClients]);

  // Projects milik client ini
  const clientProjects = useMemo(() => {
    if (!client) return [];
    return projects.filter((p) => p.clientId === client.id);
  }, [projects, client]);

  // Stats keseluruhan client
  const stats = useMemo(() => {
    const allTaskIds = clientProjects.flatMap((p) =>
      tasks.filter((t) => t.projectId === p.id).map((t) => t.id),
    );
    const clientTasks = tasks.filter((t) => allTaskIds.includes(t.id));
    const total = clientTasks.length;
    const completed = clientTasks.filter((t) => t.status === 'completed').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct, projectCount: clientProjects.length };
  }, [clientProjects, tasks]);

  if (!client || !canAccess) {
    return (
      <div ref={entranceRef} className="space-y-6">
        <Button variant="secondary" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft className="h-4 w-4" /> {t('client.backToList')}
        </Button>
        <EmptyState
          icon={Building2}
          title={t('client.notFound')}
          description={t('client.notFoundDescription')}
        />
      </div>
    );
  }

  const statusBadge: Record<string, string> = {
    active: 'bg-success/10 text-success',
    completed: 'bg-info/10 text-info',
    archived: 'bg-muted/10 text-muted',
  };

  return (
    <div ref={entranceRef} className="space-y-6">
      {/* Back Button */}
      <Button variant="secondary" size="sm" onClick={() => navigate('/clients')}>
        <ArrowLeft className="h-4 w-4" /> {t('client.backToList')}
      </Button>

      {/* Client Info */}
      <div data-animate className="rounded-2xl border border-line bg-surface p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="truncate text-xl font-bold text-ink">{client.name}</h1>
            {client.company && <p className="text-sm text-muted">{client.company}</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 text-sm text-muted">
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {client.email}
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {client.phone}
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <MapPin className="h-4 w-4 shrink-0" /> {client.address}
            </div>
          )}
          {client.notes && (
            <div className="flex items-start gap-2 sm:col-span-2">
              <StickyNote className="h-4 w-4 shrink-0 mt-0.5" /> {client.notes}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> {t('client.createdDate')}: {formatDate(client.createdAt.split('T')[0], i18n.language)}
          </div>
        </div>

        {/* Overall Stats */}
        <div className="border-t border-line pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{t('client.overallProgress')}</span>
            <span className="font-bold text-ink">{stats.pct}%</span>
          </div>
          <ProgressBar value={stats.pct} />
          <div className="flex gap-4 text-xs text-muted">
            <span>{stats.projectCount} {t('client.projects')}</span>
            <span>{stats.completed}/{stats.total} {t('client.tasksCompleted')}</span>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div data-animate className="space-y-3">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> {t('client.clientProjects', { count: clientProjects.length })}
        </h2>

        {clientProjects.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-6 text-center">
            <p className="text-sm text-muted">{t('client.noProjects')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {clientProjects.map((p) => {
              const pTasks = tasks.filter((t) => t.projectId === p.id);
              const pCompleted = pTasks.filter((t) => t.status === 'completed').length;
              const pTotal = pTasks.length;
              const pPct = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;

              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-line bg-surface p-4 space-y-2 cursor-pointer hover:border-primary/30 transition-colors"
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-ink">{p.name}</h3>
                      {p.description && (
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">{p.description}</p>
                      )}
                    </div>
                    <Badge className={statusBadge[p.status]}>{t(`project.${p.status}`)}</Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted">{pCompleted}/{pTotal} tasks</span>
                      <span className="font-medium text-ink">{pPct}%</span>
                    </div>
                    <ProgressBar value={pPct} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}