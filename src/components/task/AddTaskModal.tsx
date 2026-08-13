import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { useTasks } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { TaskFormData } from '../../types/task';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddTaskModal({ open, onClose }: AddTaskModalProps) {
  const { t } = useTranslation();
  const { addTask } = useTasks();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = (data: TaskFormData) => {
    // FIX: Pass current user ID untuk auto-assign
    addTask(data, user?.id);
    showToast(t('toast.taskCreated'), 'success');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('task.add')}>
      <TaskForm
        submitLabel={t('common.create')}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}