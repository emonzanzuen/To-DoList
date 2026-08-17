import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import type { Task } from '../../types/task';

interface TeamWorkloadProps {
  tasks?: Task[];
  title?: string;
}

export function TeamWorkload({ tasks: propTasks, title }: TeamWorkloadProps) {
  const { t } = useTranslation();
  const { users } = useAuth();
  const { tasks: contextTasks } = useTasks();
  const tasks = propTasks ?? contextTasks;

  const workloadData = useMemo(() => {
    const map: Record<string, { name: string; total: number; completed: number }> = {};

    for (const user of users) {
      map[user.id] = { name: user.name, total: 0, completed: 0 };
    }

    for (const task of tasks) {
      for (const assigneeId of task.assigneeIds) {
        if (map[assigneeId]) {
          map[assigneeId].total++;
          if (task.status === 'completed') map[assigneeId].completed++;
        }
      }
    }

    return Object.values(map).filter((d) => d.total > 0);
  }, [tasks, users]);

  if (workloadData.length === 0) return null;

  const maxTotal = Math.max(...workloadData.map((d) => d.total), 1);

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h3 className="mb-4 text-sm font-semibold text-ink">
        {title ?? t('dashboard.teamWorkload')}
      </h3>
      <div className="space-y-3">
        {workloadData.map((d) => (
          <div key={d.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink">{d.name}</span>
              <span className="text-muted">
                {d.completed}/{d.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(d.total / maxTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}