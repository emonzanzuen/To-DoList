import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readStorage, writeStorage } from '../utils/storage';
import { generateId } from '../utils/taskUtils';
import { nowISO } from '../utils/dateUtils';
import type { Project } from '../types/project';

const PROJECTS_STORAGE_KEY = 'app_projects';

interface ProjectContextValue {
  projects: Project[];
  addProject: (name: string, description: string, milestone: string) => void;
  updateProject: (id: string, name: string, description: string, milestone: string, status: Project['status']) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function loadProjects(): Project[] {
  const data = readStorage<unknown>(PROJECTS_STORAGE_KEY, []);
  if (!Array.isArray(data)) return [];
  return data.filter(
    (item): item is Project =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>).id === 'string' &&
      typeof (item as Record<string, unknown>).name === 'string',
  ) as Project[];
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  useEffect(() => {
    writeStorage(PROJECTS_STORAGE_KEY, projects);
  }, [projects]);

  const addProject = useCallback((name: string, description: string, milestone: string) => {
    const now = nowISO();
    const project: Project = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      milestone: milestone || null,
      status: 'active',
      createdBy: '', // akan diisi oleh AuthContext di fase berikutnya
      createdAt: now,
      updatedAt: now,
    };
    setProjects((prev) => [...prev, project]);
  }, []);

  const updateProject = useCallback(
    (id: string, name: string, description: string, milestone: string, status: Project['status']) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: name.trim(),
                description: description.trim(),
                milestone: milestone || null,
                status,
                updatedAt: nowISO(),
              }
            : p,
        ),
      );
    },
    [],
  );

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  const value = useMemo<ProjectContextValue>(
    () => ({ projects, addProject, updateProject, deleteProject, getProjectById }),
    [projects, addProject, updateProject, deleteProject, getProjectById],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}