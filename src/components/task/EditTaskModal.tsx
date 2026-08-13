import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { useTasks } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import type { Task, TaskFormData } from '../../types/task';

interface EditTaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export function EditTaskModal({ task, onClose }: EditTaskModalProps) {
  const { t } = useTranslation();
  const { updateTask } = useTasks();
  const { showToast } = useToast();

  const handleSubmit = (data: TaskFormData) => {
    if (!task) return;
    updateTask(task.id, data);
    showToast(t('toast.taskUpdated'), 'success');
    onClose();
  };

  return (
    <Modal open={task !== null} onClose={onClose} title={t('task.edit')}>
      {task && (
        <TaskForm
          key={task.id}
          initialData={{
            title: task.title,
            description: task.description,
            priority: task.priority,
            category: task.category,
            dueDate: task.dueDate ?? '',
            repeat: task.repeat,
            projectId: task.projectId ?? '',       // ← BARU
            assigneeId: task.assigneeId ?? '',     // ← BARU
            milestone: task.milestone ?? '',       // ← BARU
            attachmentUrl: task.attachmentUrl ?? '',// ← BARU
            timeSpentMinutes: task.timeSpentMinutes ?? 0, // ← BARU
          }}
          submitLabel={t('common.save')}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}