import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { generateId } from '../utils/taskUtils';
import { nowISO } from '../utils/dateUtils';
import type { ActivityLog } from '../types/task';

const ACTIVITY_STORAGE_KEY = 'app_activity_log';
const MAX_LOGS = 100;

interface ActivityContextValue {
  logs: ActivityLog[];
  logActivity: (userId: string, action: string, target: string) => void;
  clearLogs: () => void;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

function loadLogs(): ActivityLog[] {
  const data = readStorage<unknown>(ACTIVITY_STORAGE_KEY, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is ActivityLog =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).id === 'string',
  ) as ActivityLog[];
}

export function ActivityProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<ActivityLog[]>(() => loadLogs());

  const persist = useCallback((updated: ActivityLog[]) => {
    setLogs(updated);
    writeStorage(ACTIVITY_STORAGE_KEY, updated);
  }, []);

  const logActivity = useCallback(
    (userId: string, action: string, target: string) => {
      const entry: ActivityLog = {
        id: generateId(),
        userId,
        action,
        target,
        timestamp: nowISO(),
      };
      setLogs((prev) => {
        const updated = [entry, ...prev].slice(0, MAX_LOGS);
        writeStorage(ACTIVITY_STORAGE_KEY, updated);
        return updated;
      });
    },
    [],
  );

  const clearLogs = useCallback(() => {
    persist([]);
  }, [persist]);

  const value = useMemo<ActivityContextValue>(
    () => ({ logs, logActivity, clearLogs }),
    [logs, logActivity, clearLogs],
  );

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivity(): ActivityContextValue {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}