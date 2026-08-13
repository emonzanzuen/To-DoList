export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  milestone: string | null; // yyyy-mm-dd
  status: ProjectStatus;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}