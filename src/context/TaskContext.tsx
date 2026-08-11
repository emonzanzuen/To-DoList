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
import { getNextRepeatDate } from '../utils/repeatUtils';
import type { Task, TaskFormData } from '../types/task';

interface TaskContextValue {
  tasks: Task[];
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: TaskFormData) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  togglePin: (id: string) => void;
  clearCompleted: () => void;
  deleteAll: () => void;
  getTaskById: (id: string) => Task | undefined;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((data: TaskFormData) => {
    const now = nowISO();
    const task: Task = {
      id: generateId(),
      title: data.title.trim(),
      description: data.description.trim(),
      status: 'pending',
      priority: data.priority,
      category: data.category,
      dueDate: data.dueDate || null,
      isPinned: false,
      repeat: data.repeat,
      nextRepeatAt: getNextRepeatDate(data.dueDate || null, data.repeat),
      createdAt: now,
      updatedAt: now,
    };
    setTasks((previous) => [task, ...previous]);
  }, []);

  const updateTask = useCallback((id: string, data: TaskFormData) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? {
              ...task,
              title: data.title.trim(),
              description: data.description.trim(),
              priority: data.priority,
              category: data.category,
              dueDate: data.dueDate || null,
              repeat: data.repeat,
              nextRepeatAt: getNextRepeatDate(data.dueDate || null, data.repeat),
              updatedAt: nowISO(),
            }
          : task,
      ),
    );
  }, []);

  // ← CORE LOGIC: Toggle complete + auto-create recurring task
  const toggleTask = useCallback((id: string) => {
    setTasks((previous) => {
      const taskIndex = previous.findIndex((t) => t.id === id);
      if (taskIndex === -1) return previous;

      const task = previous[taskIndex];
      const willComplete = task.status === 'pending';
      const updatedTask: Task = {
        ...task,
        status: willComplete ? 'completed' : 'pending',
        updatedAt: nowISO(),
      };

      const newTasks = [...previous];
      newTasks[taskIndex] = updatedTask;

      // Jika task di-complete DAN memiliki repeat ≠ none → buat task baru
      if (willComplete && task.repeat !== 'none') {
        const nextDue = getNextRepeatDate(task.dueDate, task.repeat);
        const recurringTask: Task = {
          id: generateId(),
          title: task.title,
          description: task.description,
          status: 'pending',
          priority: task.priority,
          category: task.category,
          dueDate: nextDue,
          isPinned: false,
          repeat: task.repeat,
          nextRepeatAt: getNextRepeatDate(nextDue, task.repeat),
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        // Insert task baru di posisi atas list
        newTasks.unshift(recurringTask);
      }

      return newTasks;
    });
  }, []);

  const togglePin = useCallback((id: string) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, isPinned: !task.isPinned, updatedAt: nowISO() }
          : task,
      ),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((previous) => previous.filter((task) => task.status !== 'completed'));
  }, []);

  const deleteAll = useCallback(() => {
    setTasks([]);
  }, []);

  const getTaskById = useCallback(
    (id: string) => tasks.find((task) => task.id === id),
    [tasks],
  );

  const value = useMemo(
    () => ({
      tasks,
      addTask,
      updateTask,
      deleteTask,
      toggleTask,
      togglePin,
      clearCompleted,
      deleteAll,
      getTaskById,
    }),
    [tasks, addTask, updateTask, deleteTask, toggleTask, togglePin, clearCompleted, deleteAll, getTaskById],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within TaskProvider');
  return context;
}