import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../types/task';
import { MOCK_USERS } from '../../types/user';

interface TeamWorkloadProps {
  tasks: Task[];
  title: string;
}

export function TeamWorkload({ tasks, title }: TeamWorkloadProps) {
  const { t } = useTranslation();

  const workload = useMemo(() => {
    const map: Record<string, { name: string; total: number; completed: number }> = {};

    MOCK_USERS.forEach((u: { id: string; name: string }) => {
      map[u.id] = { name: u.name, total: 0, completed: 0 };
    });

    tasks.forEach((task) => {
      if (task.assigneeId && map[task.assigneeId]) {
        map[task.assigneeId].total++;
        if (task.status === 'completed') map[task.assigneeId].completed++;
      }
    });

    return Object.values(map)
      .filter((w) => w.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  const maxTasks = Math.max(...workload.map((w) => w.total), 1);

  if (workload.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <h3 className="mb-2 text-sm font-semibold text-ink">{title}</h3>
        <p className="text-xs text-muted">{t('dashboard.noWorkload')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-ink">{title}</h3>
      <div className="space-y-3">
        {workload.map((w) => {
          const pct = Math.round((w.total / maxTasks) * 100);
          const completedPct = w.total > 0 ? Math.round((w.completed / w.total) * 100) : 0;
          return (
            <div key={w.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{w.name}</span>
                <span className="text-muted">{w.total} tasks ({completedPct}% done)</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-line">
                <div className="relative h-full rounded-full bg-primary" style={{ width: `${pct}%` }}>
                  <div className="absolute inset-y-0 left-0 rounded-full bg-success" style={{ width: `${completedPct}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}