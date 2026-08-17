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

  if (!task) return null;

  const handleSubmit = (data: TaskFormData) => {
    updateTask(task.id, data);
    showToast(t('toast.taskUpdated'), 'success');
    onClose();
  };

  const initialData: TaskFormData = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    category: task.category,
    projectId: task.projectId ?? '',
    assigneeIds: task.assigneeIds ?? [],
    milestone: task.milestone ?? '',
    dueDate: task.dueDate ?? '',
    repeat: task.repeat,
    attachmentUrl: task.attachmentUrl ?? '',
    timeSpentMinutes: task.timeSpentMinutes,
  };

  return (
    <Modal open={!!task} onClose={onClose} title={t('task.edit')}>
      <TaskForm
        initialData={initialData}
        submitLabel={t('common.save')}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}