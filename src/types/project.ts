export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  milestone: string | null;
  status: ProjectStatus;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}