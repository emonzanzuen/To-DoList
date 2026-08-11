import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import type { Task } from '../../types/task';

interface DeleteTaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export function DeleteTaskModal({ task, onClose }: DeleteTaskModalProps) {
  const { t } = useTranslation();
  const { deleteTask } = useTasks();
  const { showToast } = useToast();

  const handleConfirm = () => {
    if (!task) return;
    deleteTask(task.id);
    showToast(t('toast.taskDeleted'), 'success');
    onClose();
  };

  return (
    <ConfirmDialog
      open={task !== null}
      title={t('task.deleteConfirmTitle')}
      message={t('task.deleteConfirmMessage', { title: task?.title ?? '' })}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}