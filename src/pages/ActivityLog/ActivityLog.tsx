import { useTranslation } from 'react-i18next';
import { History, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useActivity } from '../../context/ActivityContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).format(new Date(iso));
  } catch { return iso; }
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  created_task: { label: 'Membuat task', color: 'text-success' },
  updated_task: { label: 'Mengedit task', color: 'text-info' },
  deleted_task: { label: 'Menghapus task', color: 'text-danger' },
  completed_task: { label: 'Menyelesaikan task', color: 'text-success' },
  reopened_task: { label: 'Membuka kembali task', color: 'text-warning' },
  pinned_task: { label: 'Menandai penting', color: 'text-warning' },
  unpinned_task: { label: 'Menghapus tanda penting', color: 'text-muted' },
};

export default function ActivityLogPage() {
  const { t } = useTranslation();
  const { logs, clearLogs } = useActivity();
  const { isAdmin } = useAuth();
  const entranceRef = usePageEntrance();

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('activity.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('activity.subtitle')}</p>
        </div>
        {isAdmin && logs.length > 0 && (
          <Button variant="secondary" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {t('activity.clear')}
          </Button>
        )}
      </div>

      <div data-animate>
        {logs.length === 0 ? (
          <EmptyState icon={History} title={t('activity.empty')} description="" />
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const config = ACTION_LABELS[log.action] ?? { label: log.action, color: 'text-muted' };
              return (
                <div key={log.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3">
                  <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className={`font-medium ${config.color}`}>{config.label}</span>
                      {' — '}
                      <span className="truncate">{log.target}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatTimestamp(log.timestamp)} · {log.userId.slice(0, 12)}
                    </p>
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