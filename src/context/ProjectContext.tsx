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
  addProject: (name: string, description: string, milestone: string, creatorId: string, clientId?: string) => void;
  updateProject: (id: string, name: string, description: string, milestone: string, status: Project['status'], clientId?: string) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  inviteMember: (projectId: string, userId: string) => void;
  removeMember: (projectId: string, userId: string) => void;
  isMember: (projectId: string, userId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map((item: Record<string, unknown>) => ({
      id: String(item.id ?? ''),
      name: String(item.name ?? ''),
      description: String(item.description ?? ''),
      milestone: (item.milestone as string | null) ?? null,
      status: (['active', 'completed', 'archived'].includes(String(item.status)) ? String(item.status) : 'active') as Project['status'],
      memberIds: Array.isArray(item.memberIds) ? item.memberIds.filter((id): id is string => typeof id === 'string') : [],
      clientId: (item.clientId as string | null) ?? null,
      createdBy: String(item.createdBy ?? ''),
      createdAt: String(item.createdAt ?? new Date().toISOString()),
      updatedAt: String(item.updatedAt ?? new Date().toISOString()),
    }));
  } catch {
    return [];
  }
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());

  useEffect(() => {
    writeStorage(PROJECTS_STORAGE_KEY, projects);
  }, [projects]);

  const addProject = useCallback(
    (name: string, description: string, milestone: string, creatorId: string, clientId?: string) => {
      const now = nowISO();
      const project: Project = {
        id: generateId(),
        name: name.trim(),
        description: description.trim(),
        milestone: milestone || null,
        status: 'active',
        memberIds: creatorId ? [creatorId] : [],
        clientId: clientId || null,
        createdBy: creatorId,
        createdAt: now,
        updatedAt: now,
      };
      setProjects((prev) => [...prev, project]);
    },
    [],
  );

  const updateProject = useCallback(
    (id: string, name: string, description: string, milestone: string, status: Project['status'], clientId?: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                name: name.trim(),
                description: description.trim(),
                milestone: milestone || null,
                status,
                clientId: clientId !== undefined ? (clientId || null) : p.clientId,
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

  const inviteMember = useCallback((projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId && !p.memberIds.includes(userId)
          ? { ...p, memberIds: [...p.memberIds, userId], updatedAt: nowISO() }
          : p,
      ),
    );
  }, []);

  const removeMember = useCallback((projectId: string, userId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, memberIds: p.memberIds.filter((id) => id !== userId), updatedAt: nowISO() }
          : p,
      ),
    );
  }, []);

  const isMember = useCallback(
    (projectId: string, userId: string) => {
      const project = projects.find((p) => p.id === projectId);
      return project?.memberIds.includes(userId) ?? false;
    },
    [projects],
  );

  const value = useMemo<ProjectContextValue>(
    () => ({
      projects,
      addProject,
      updateProject,
      deleteProject,
      getProjectById,
      inviteMember,
      removeMember,
      isMember,
    }),
    [projects, addProject, updateProject, deleteProject, getProjectById, inviteMember, removeMember, isMember],
  );

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectContextValue {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}