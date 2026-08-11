import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Check,
  Minus,
  Pencil,
  RefreshCw,
  Star,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Task, TaskPriority } from '../../types/task';
import { Badge } from '../ui/Badge';
import { CATEGORY_BADGE, CATEGORY_DOT, PRIORITY_BADGE } from '../../constants';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import { formatRepeatLabel } from '../../utils/repeatUtils';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onTogglePin: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const PRIORITY_ICON: Record<TaskPriority, LucideIcon> = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
};

export function TaskCard({ task, onToggle, onTogglePin, onEdit, onDelete }: TaskCardProps) {
  const { t, i18n } = useTranslation();
  const completed = task.status === 'completed';
  const overdue = isOverdue(task);
  const PriorityIcon = PRIORITY_ICON[task.priority];

  return (
    <article
      data-task-card
      className={`relative rounded-2xl border bg-surface p-4 transition-colors hover:border-primary/40 ${
        task.isPinned ? 'border-warning/50 bg-warning/5' : 'border-line'
      } ${completed ? 'opacity-75' : ''}`}
    >
      {/* Pin indicator strip */}
      {task.isPinned && (
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-warning"
          aria-hidden="true"
        />
      )}

      <div className="flex items-start gap-3">
        {/* Checkbox complete */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={completed ? t('task.markPending') : t('task.markComplete')}
          aria-pressed={completed}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
            completed
              ? 'border-success bg-success text-white'
              : 'border-line text-transparent hover:border-primary'
          }`}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-sm font-semibold ${
              completed ? 'text-muted line-through' : 'text-ink'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className={`mt-1 text-sm text-muted ${completed ? 'line-through' : ''}`}>
              {task.description}
            </p>
          )}

          {/* Badges row */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Priority badge */}
            <Badge className={PRIORITY_BADGE[task.priority]}>
              <PriorityIcon className="h-3 w-3" aria-hidden="true" />
              {t(`priority.${task.priority}`)}
            </Badge>

            {/* Category badge */}
            <Badge className={CATEGORY_BADGE[task.category]}>
              <span
                className={`h-1.5 w-1.5 rounded-full ${CATEGORY_DOT[task.category]}`}
                aria-hidden="true"
              />
              {t(`category.${task.category}`)}
            </Badge>

            {/* ← BARU: Repeat badge — hanya muncul jika repeat !== 'none' */}
            {task.repeat !== 'none' && (
              <Badge className="bg-info/10 text-info">
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                {formatRepeatLabel(task.repeat, t)}
              </Badge>
            )}

            {/* Due date + overdue indicator */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 text-xs ${
                  overdue ? 'font-medium text-danger' : 'text-muted'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDate(task.dueDate, i18n.language)}
                {overdue && ` · ${t('task.overdue')}`}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons: Pin, Edit, Delete */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePin(task.id)}
            aria-label={task.isPinned ? t('task.unpin') : t('task.pin')}
            aria-pressed={task.isPinned}
            className={`rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning/50 ${
              task.isPinned
                ? 'text-warning hover:bg-warning/10'
                : 'text-muted hover:bg-background hover:text-warning'
            }`}
          >
            <Star
              className="h-4 w-4"
              aria-hidden="true"
              fill={task.isPinned ? 'currentColor' : 'none'}
            />
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={t('task.edit')}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-background hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={t('task.delete')}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}