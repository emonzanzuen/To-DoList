import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../../context/TaskContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { TaskCard } from '../../components/task/TaskCard';
import { STATUS_BADGE } from '../../constants';
import type { TaskStatus } from '../../types/task';

const COLUMNS: { status: TaskStatus; labelKey: string }[] = [
  { status: 'pending', labelKey: 'task.pending' },
  { status: 'in_progress', labelKey: 'task.inProgress' },
  { status: 'waiting', labelKey: 'task.waiting' },
  { status: 'completed', labelKey: 'task.completed' },
];

export default function KanbanPage() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin } = useTasks();
  const entranceRef = usePageEntrance();

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: tasks.filter((t) => t.status === col.status),
    }));
  }, [tasks]);

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate>
        <h1 className="text-2xl font-bold text-ink">{t('kanban.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('kanban.subtitle')}</p>
      </div>

      <div data-animate className="grid grid-cols-1 gap-4 overflow-x-auto pb-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col.status} className="min-w-[280px] rounded-2xl border border-line bg-background p-3">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">{t(col.labelKey)}</h2>
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted border border-line">
                {col.tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {col.tasks.length === 0 ? (
                <p className="py-8 text-center text-xs text-muted">{t('kanban.emptyColumn')}</p>
              ) : (
                col.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onTogglePin={togglePin}
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}