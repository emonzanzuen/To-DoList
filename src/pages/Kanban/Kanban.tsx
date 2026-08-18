import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Circle, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { usePageEntrance } from '../../animations/gsap/usePageEntrance';
import { TaskCard } from '../../components/task/TaskCard';
import { EditTaskModal } from '../../components/task/EditTaskModal';
import { DeleteTaskModal } from '../../components/task/DeleteTaskModal';
import { TaskDetailModal } from '../../components/task/TaskDetailModal';
import type { Task, TaskStatus } from '../../types/task';
import type { LucideIcon } from 'lucide-react';

const COLUMNS: { status: TaskStatus; labelKey: string; icon: LucideIcon; color: string; borderColor: string; headerBg: string }[] = [
  {
    status: 'pending',
    labelKey: 'status.pending',
    icon: Circle,
    color: 'text-muted',
    borderColor: 'border-muted/30',
    headerBg: 'bg-muted/5',
  },
  {
    status: 'in_progress',
    labelKey: 'status.inProgress',
    icon: Clock,
    color: 'text-info',
    borderColor: 'border-info/30',
    headerBg: 'bg-info/5',
  },
  {
    status: 'waiting_approval',
    labelKey: 'status.waitingApproval',
    icon: ShieldAlert,
    color: 'text-warning',
    borderColor: 'border-warning/30',
    headerBg: 'bg-warning/5',
  },
  {
    status: 'completed',
    labelKey: 'status.completed',
    icon: CheckCircle2,
    color: 'text-success',
    borderColor: 'border-success/30',
    headerBg: 'bg-success/5',
  },
];

export default function KanbanPage() {
  const { t } = useTranslation();
  const { tasks, toggleTask, togglePin, updateTaskStatus } = useTasks();
  const { user, canSeeAllTasks, canDeleteTask } = useAuth();
  const entranceRef = usePageEntrance();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  // Filter tasks berdasarkan RBAC membership
  const visibleTasks = useMemo(() => {
    if (!user) return [];
    if (canSeeAllTasks) return tasks;
    // Member: hanya lihat task yang di-assign ke dirinya
    return tasks.filter((t) => t.assigneeIds.includes(user.id));
  }, [tasks, user, canSeeAllTasks]);

  const columns = useMemo(() => {
    return COLUMNS.map((col) => ({
      ...col,
      tasks: visibleTasks.filter((t) => t.status === col.status),
    }));
  }, [visibleTasks]);

  return (
    <div ref={entranceRef} className="space-y-6">
      <div data-animate>
        <h1 className="text-2xl font-bold text-ink">{t('kanban.title')}</h1>
        <p className="mt-1 text-sm text-muted">{t('kanban.subtitle')}</p>
      </div>

      {/* Horizontal scroll wrapper */}
      <div data-animate className="-mx-6 overflow-x-auto px-6 pb-4">
        <div className="flex gap-5">
          {columns.map((col) => {
            const ColumnIcon = col.icon;
            return (
              <div
                key={col.status}
                className={`flex w-[340px] flex-shrink-0 flex-col rounded-2xl border bg-surface ${col.borderColor}`}
              >
                {/* Column Header */}
                <div className={`flex items-center justify-between rounded-t-2xl px-4 py-3 ${col.headerBg}`}>
                  <div className="flex items-center gap-2">
                    <ColumnIcon className={`h-4 w-4 ${col.color}`} />
                    <h2 className="whitespace-nowrap text-sm font-semibold text-ink">{t(col.labelKey)}</h2>
                  </div>
                  <span className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${col.color} ${col.headerBg} border ${col.borderColor}`}>
                    {col.tasks.length}
                  </span>
                </div>

                {/* Column Body */}
                <div className="flex flex-col gap-3 p-3">
                  {col.tasks.length === 0 ? (
                    <div className="flex items-center justify-center rounded-xl border border-dashed border-line py-12">
                      <p className="text-xs text-muted">{t('kanban.emptyColumn')}</p>
                    </div>
                  ) : (
                    col.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggle={toggleTask}
                        onTogglePin={togglePin}
                        onEdit={setEditingTask}
                        onDelete={setDeletingTask}
                        onViewDetail={setViewingTask}
                        onUpdateStatus={updateTaskStatus}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <EditTaskModal task={editingTask} onClose={() => setEditingTask(null)} />
      <DeleteTaskModal task={deletingTask} onClose={() => setDeletingTask(null)} />
      <TaskDetailModal task={viewingTask} onClose={() => setViewingTask(null)} />
    </div>
  );
}