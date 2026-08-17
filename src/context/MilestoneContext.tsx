import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { generateId } from '../utils/taskUtils';
import { nowISO } from '../utils/dateUtils';
import { readStorage, writeStorage } from '../utils/storage';
import type { Milestone, MilestoneFormData } from '../types/milestone';

const MILESTONES_KEY = 'app_milestones';

function loadMilestones(): Milestone[] {
  const data = readStorage<unknown>(MILESTONES_KEY, []);
  return Array.isArray(data) ? (data as Milestone[]) : [];
}

interface MilestoneContextValue {
  milestones: Milestone[];
  addMilestone: (data: MilestoneFormData) => void;
  updateMilestone: (id: string, data: MilestoneFormData) => void;
  deleteMilestone: (id: string) => void;
  getMilestoneById: (id: string) => Milestone | undefined;
}

const MilestoneContext = createContext<MilestoneContextValue | null>(null);

export function MilestoneProvider({ children }: { children: ReactNode }) {
  const [milestones, setMilestones] = useState<Milestone[]>(() => loadMilestones());

  useEffect(() => {
    writeStorage(MILESTONES_KEY, milestones);
  }, [milestones]);

  const addMilestone = useCallback((data: MilestoneFormData) => {
    const now = nowISO();
    const milestone: Milestone = {
      id: generateId(),
      name: data.name.trim(),
      description: data.description.trim(),
      projectId: data.projectId || null,
      dueDate: data.dueDate || null,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };
    setMilestones((prev) => [milestone, ...prev]);
  }, []);

  const updateMilestone = useCallback((id: string, data: MilestoneFormData) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              name: data.name.trim(),
              description: data.description.trim(),
              projectId: data.projectId || null,
              dueDate: data.dueDate || null,
              status: data.status,
              updatedAt: nowISO(),
            }
          : m,
      ),
    );
  }, []);

  const deleteMilestone = useCallback((id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const getMilestoneById = useCallback(
    (id: string) => milestones.find((m) => m.id === id),
    [milestones],
  );

  const value = useMemo<MilestoneContextValue>(
    () => ({ milestones, addMilestone, updateMilestone, deleteMilestone, getMilestoneById }),
    [milestones, addMilestone, updateMilestone, deleteMilestone, getMilestoneById],
  );

  return <MilestoneContext.Provider value={value}>{children}</MilestoneContext.Provider>;
}

export function useMilestones(): MilestoneContextValue {
  const context = useContext(MilestoneContext);
  if (!context) throw new Error('useMilestones must be used within MilestoneProvider');
  return context;
}