import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loadTasks, saveTasks } from '../utils/storage';
import { generateId } from '../utils/taskUtils';
import { nowISO } from '../utils/dateUtils';
import { getNextRepeatDate, getCanCompleteFrom, canCompleteNow } from '../utils/repeatUtils';
import type { Task, TaskFormData, ChecklistItem, Comment, ApprovalStatus } from '../types/task';
import { useActivity } from './ActivityContext';

interface TaskContextValue {
  tasks: Task[];
  addTask: (data: TaskFormData, currentUserId?: string) => void;
  updateTask: (id: string, data: TaskFormData) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  togglePin: (id: string) => void;
  reorderTasks: (reordered: Task[]) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  clearCompleted: () => void;
  deleteAll: () => void;
  getTaskById: (id: string) => Task | undefined;
  updateChecklist: (taskId: string, checklist: ChecklistItem[]) => void;
  updateComments: (taskId: string, comments: Comment[]) => void;
  updateApproval: (taskId: string, status: ApprovalStatus) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

function normalizeAssignees(task: Record<string, unknown>): string[] {
  if (Array.isArray(task.assigneeIds)) return task.assigneeIds as string[];
  if (typeof task.assigneeId === 'string' && task.assigneeId) return [task.assigneeId as string];
  return [];
}

// Backward compat: migrate old 'waiting' status to 'waiting_approval'
function migrateStatus(status: string): Task['status'] {
  if (status === 'waiting') return 'waiting_approval';
  if (['pending', 'in_progress', 'waiting_approval', 'completed'].includes(status)) return status as Task['status'];
  return 'pending';
}

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadTasks().map((t) => ({
      ...t,
      assigneeIds: normalizeAssignees(t as unknown as Record<string, unknown>),
      status: migrateStatus(t.status),
    })),
  );
  const { logActivity } = useActivity();

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback(
    (data: TaskFormData, currentUserId?: string) => {
      const now = nowISO();
      const title = data.title.trim();
      const task: Task = {
        id: generateId(),
        title,
        description: data.description.trim(),
        status: 'pending',
        priority: data.priority,
        category: data.category,
        projectId: data.projectId || null,
        assigneeIds: data.assigneeIds.length > 0 ? data.assigneeIds : (currentUserId ? [currentUserId] : []),
        milestone: data.milestone || null,
        dueDate: data.dueDate || null,
        isPinned: false,
        repeat: data.repeat,
        nextRepeatAt: getNextRepeatDate(data.dueDate || null, data.repeat),
        canCompleteFrom: getCanCompleteFrom(data.dueDate || null, data.repeat),
        recurringParentId: null,
        checklist: [],
        comments: [],
        approvalStatus: 'none',
        attachmentUrl: data.attachmentUrl || null,
        timeSpentMinutes: data.timeSpentMinutes || 0,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((previous) => [task, ...previous]);
      logActivity(currentUserId ?? 'system', 'created_task', title);
    },
    [logActivity],
  );

  const updateTask = useCallback(
    (id: string, data: TaskFormData) => {
      const title = data.title.trim();
      setTasks((previous) =>
        previous.map((task) =>
          task.id === id
            ? {
                ...task,
                title,
                description: data.description.trim(),
                priority: data.priority,
                category: data.category,
                projectId: data.projectId || null,
                assigneeIds: data.assigneeIds,
                milestone: data.milestone || null,
                dueDate: data.dueDate || null,
                repeat: data.repeat,
                nextRepeatAt: getNextRepeatDate(data.dueDate || null, data.repeat),
                canCompleteFrom: getCanCompleteFrom(data.dueDate || null, data.repeat),
                attachmentUrl: data.attachmentUrl || null,
                timeSpentMinutes: data.timeSpentMinutes ?? task.timeSpentMinutes,
                updatedAt: nowISO(),
              }
            : task,
        ),
      );
      logActivity('system', 'updated_task', title);
    },
    [logActivity],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const willComplete = task.status !== 'completed';

      if (willComplete && task.repeat !== 'none' && !canCompleteNow(task)) {
        const availableDate = task.canCompleteFrom ?? task.dueDate ?? 'unknown';
        alert(`Task belum dapat diselesaikan.\n\nTask ini baru dapat diselesaikan mulai:\n${availableDate}`);
        return;
      }

      const now = nowISO();
      let recurringInfo: { created: boolean; label: string } = { created: false, label: '' };

      setTasks((previous) => {
        const taskIndex = previous.findIndex((t) => t.id === id);
        if (taskIndex === -1) return previous;

        const currentTask = previous[taskIndex];
        const newTasks = [...previous];
        newTasks[taskIndex] = {
          ...currentTask,
          status: willComplete ? 'completed' : 'in_progress',
          updatedAt: now,
        };

        if (willComplete && currentTask.repeat !== 'none' && currentTask.dueDate) {
          const nextDue = getNextRepeatDate(currentTask.dueDate, currentTask.repeat);

          if (nextDue) {
            const duplicateByParent = newTasks.some(
              (t) =>
                t.recurringParentId === currentTask.id &&
                t.dueDate === nextDue &&
                t.status !== 'completed',
            );

            const duplicateByTitle = newTasks.some(
              (t) =>
                t.id !== currentTask.id &&
                t.title === currentTask.title &&
                t.dueDate === nextDue &&
                t.repeat === currentTask.repeat &&
                t.status !== 'completed',
            );

            if (!duplicateByParent && !duplicateByTitle) {
              newTasks.unshift({
                id: generateId(),
                title: currentTask.title,
                description: currentTask.description,
                status: 'pending',
                priority: currentTask.priority,
                category: currentTask.category,
                projectId: currentTask.projectId,
                assigneeIds: currentTask.assigneeIds,
                milestone: currentTask.milestone,
                dueDate: nextDue,
                isPinned: false,
                repeat: currentTask.repeat,
                nextRepeatAt: getNextRepeatDate(nextDue, currentTask.repeat),
                canCompleteFrom: getCanCompleteFrom(nextDue, currentTask.repeat),
                recurringParentId: currentTask.id,
                checklist: [],
                comments: [],
                approvalStatus: 'none',
                attachmentUrl: null,
                timeSpentMinutes: 0,
                createdAt: now,
                updatedAt: now,
              });
              recurringInfo = { created: true, label: `${currentTask.title} → ${nextDue}` };
            }
          }
        }

        return newTasks;
      });

      logActivity('system', willComplete ? 'completed_task' : 'reopened_task', task.title);
      if (recurringInfo.created) {
        logActivity('system', 'created_recurring_task', recurringInfo.label);
      }
    },
    [tasks, logActivity],
  );

  const togglePin = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      const newPinned = !task.isPinned;

      setTasks((previous) =>
        previous.map((t) =>
          t.id === id ? { ...t, isPinned: newPinned, updatedAt: nowISO() } : t,
        ),
      );

      logActivity('system', newPinned ? 'pinned_task' : 'unpinned_task', task.title);
    },
    [tasks, logActivity],
  );

  const reorderTasks = useCallback((reordered: Task[]) => {
    setTasks(reordered);
  }, []);

  const updateTaskStatus = useCallback(
    (id: string, newStatus: Task['status']) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, status: newStatus, updatedAt: nowISO() } : t,
        ),
      );

      const actionMap: Record<string, string> = {
        pending: 'reset_task',
        in_progress: 'started_task',
        waiting_approval: 'submitted_approval',
        completed: 'completed_task',
      };
      logActivity('system', actionMap[newStatus] ?? 'updated_status', task.title);
    },
    [tasks, logActivity],
  );

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);

      setTasks((previous) => previous.filter((t) => t.id !== id));

      if (task) {
        logActivity('system', 'deleted_task', task.title);
      }
    },
    [tasks, logActivity],
  );

  const clearCompleted = useCallback(() => {
    const completedCount = tasks.filter((t) => t.status === 'completed').length;

    setTasks((previous) => previous.filter((task) => task.status !== 'completed'));

    if (completedCount > 0) {
      logActivity('system', 'cleared_completed', `${completedCount} tasks`);
    }
  }, [tasks, logActivity]);

  const deleteAll = useCallback(() => {
    setTasks([]);
    logActivity('system', 'deleted_all_tasks', 'All tasks');
  }, [logActivity]);

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks],
  );

  const updateChecklist = useCallback((taskId: string, checklist: ChecklistItem[]) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, checklist, updatedAt: nowISO() } : t));
  }, []);

  const updateComments = useCallback((taskId: string, comments: Comment[]) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, comments, updatedAt: nowISO() } : t));
  }, []);

  const updateApproval = useCallback((taskId: string, approvalStatus: ApprovalStatus) => {
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, approvalStatus, updatedAt: nowISO() } : t));
  }, []);

  const value = useMemo<TaskContextValue>(
    () => ({
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      togglePin,
      reorderTasks,
      updateTaskStatus,
      clearCompleted,
      deleteAll,
      getTaskById,
      updateChecklist,
      updateComments,
      updateApproval,
    }),
    [tasks, addTask, updateTask, deleteTask, toggleTask, togglePin, reorderTasks, updateTaskStatus, clearCompleted, deleteAll, getTaskById, updateChecklist, updateComments, updateApproval],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
}